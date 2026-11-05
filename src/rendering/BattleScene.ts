import { Application, Container, Graphics, ImageSource, Sprite, Texture } from 'pixi.js';
import { ActorClip, ActorVisual, LocationVisual } from '../core/battleVisualModels';
import { BattleLayout, ActorSlot } from './battleLayout';
import { ImpactNotice, subscribeImpacts } from './CombatPresentation';
import { frameLocation } from './locationFraming';
import { AssetLease, AssetLeaseCache } from './AssetLeaseCache';
import { ActorMotionClock, actorPoseAt, reactionPose, motionProfile, sampleActorMotion } from './actorMotion';
import { locationAtmosphere } from './locationAtmosphere';
import { clipFrameAt } from './clipPlayback';
import { atlasTextures } from './actorAtlas';
export interface SceneActor { id: string; visual: ActorVisual; defeated: boolean; clip?: ActorClip; motionToken?: string }
export interface SceneSnapshot { layout: BattleLayout; location: LocationVisual; actors: SceneActor[]; reducedMotion: boolean }
function loadTexture(url: string): Promise<Texture> {
    return new Promise((resolve,reject) => {
        const image = new Image();
        const timer = window.setTimeout(() => { image.onload = image.onerror = null; image.src = ''; reject(new Error(`Asset timeout: ${url}`)); }, 12000);
        image.onload = () => { clearTimeout(timer); image.onload = image.onerror = null; resolve(new Texture({source:new ImageSource({resource:image})})); };
        image.onerror = () => { clearTimeout(timer); image.onload = image.onerror = null; reject(new Error(`Asset unavailable: ${url}`)); };
        image.src = url;
    });
}
export const battleTextures = new AssetLeaseCache(loadTexture, texture => texture.destroy(true));
/** Pure presentation: receives snapshots, never accesses game-store actions or RNG. */
export class BattleScene {
    private app = new Application();
    private world = new Container();
    private backdrop = new Container();
    private backgroundSprites: Sprite[] = [];
    private ground = new Graphics();
    private atmosphere = new Graphics();
    private sprites = new Map<string,Sprite>();
    private poses = new Map<string,Texture>();
    private atlasViews = new Map<string,Texture>();
    private shadows = new Map<string,Graphics>();
    private leases: AssetLease<Texture>[] = [];
    private disposed = false;
    private initialized = false;
    private snapshot: SceneSnapshot;
    private motions = new ActorMotionClock();
    private reactions = new Map<string,{at:number;effect:ImpactNotice['effect']}>();
    private unsubscribeImpacts: (()=>void) | undefined;
    constructor(private host: HTMLElement, snapshot: SceneSnapshot, private onFailure: (reason:string)=>void) { this.snapshot = snapshot; }
    async mount(): Promise<boolean> {
        try {
            await this.app.init({ width:this.snapshot.layout.width,height:this.snapshot.layout.height,backgroundAlpha:0,
                resolution:Math.min(window.devicePixelRatio || 1,2),autoDensity:true,antialias:true,autoStart:false,sharedTicker:false,preference:'webgl' });
            this.initialized = true;
            if (this.disposed) { this.destroyApp(); return false; }
            this.app.canvas.setAttribute('aria-hidden','true');
            this.app.canvas.addEventListener('webglcontextlost',this.contextLost);
            this.app.stage.eventMode = 'none';
            this.app.stage.addChild(this.ground,this.backdrop,this.atmosphere,this.world);
            this.host.appendChild(this.app.canvas);
            this.backdrop.sortableChildren=true;
            this.world.sortableChildren=true;
            void Promise.all(this.snapshot.location.layers.map(async layer=>{
                const lease=battleTextures.acquire(layer.url);this.leases.push(lease);
                try {
                    const texture=await lease.ready;if(this.disposed)return;
                    const sprite=new Sprite(texture);sprite.zIndex=layer.depth;this.backgroundSprites.push(sprite);this.backdrop.addChild(sprite);
                    this.update(this.snapshot);
                } catch { /* Technical ground remains usable while background art is unavailable. */ }
            }));
            if(this.disposed)return false;
            await Promise.all(this.snapshot.actors.map(async (actor,index) => {
                const lease = battleTextures.acquire(actor.visual.fallbackImageUrl); this.leases.push(lease);
                const texture = await lease.ready;
                if (this.disposed) return;
                const shadow = new Graphics(); shadow.zIndex=index*2; this.shadows.set(actor.id,shadow); this.world.addChild(shadow);
                const sprite = new Sprite(texture); sprite.zIndex=index*2+1; sprite.anchor.set(...actor.visual.footAnchor);
                this.sprites.set(actor.id,sprite); this.world.addChild(sprite);
                this.poses.set(`${actor.id}:idle`,texture);
                const loadPoses=(onlyMissing=false)=>Promise.all(Object.entries(actor.visual.keyPoses ?? {}).filter(([clip])=>!onlyMissing || !this.atlasViews.has(`${actor.id}:${clip}`)).map(async ([clip,pose])=>{
                    if(this.disposed)return;
                    const poseLease=battleTextures.acquire(pose.imageUrl);this.leases.push(poseLease);
                    try {const poseTexture=await poseLease.ready;if(!this.disposed){this.poses.set(`${actor.id}:${clip}`,poseTexture);this.update(this.snapshot);}}
                    catch { /* Idle remains usable if an optional key pose fails to load. */ }
                }));
                if(actor.visual.atlasUrl && actor.visual.atlasFrames) {
                    const atlasLease=battleTextures.acquire(actor.visual.atlasUrl);this.leases.push(atlasLease);
                    void atlasLease.ready.then(atlas=>{
                        if(this.disposed)return;
                        for(const [name,view] of atlasTextures(atlas,actor.visual.atlasFrames!))this.atlasViews.set(`${actor.id}:${name}`,view);
                        this.update(this.snapshot);
                        return loadPoses(true);
                    }).catch(()=>{ atlasLease.release();void loadPoses(); });
                } else void loadPoses();
            }));
            if (this.disposed) return false;
            this.update(this.snapshot);
            this.unsubscribeImpacts=subscribeImpacts(notice=>{
                if(this.disposed || this.snapshot.reducedMotion || document.hidden)return;
                this.reactions.set(notice.targetId,{at:performance.now(),effect:notice.effect});
            });
            this.app.ticker.add(this.tick);
            document.addEventListener('visibilitychange',this.visibility);
            this.visibility();
            return true;
        } catch (error) {
            if (!this.disposed) { this.onFailure(error instanceof Error ? error.message : 'Renderer unavailable'); this.destroy(); }
            throw error;
        }
    }
    update(snapshot: SceneSnapshot) {
        this.snapshot = snapshot;
        if (!this.initialized || this.disposed) return;
        const {width,height} = snapshot.layout;
        this.app.renderer.resize(width,height);
        const horizon = width < 600 && height >= 300 && snapshot.layout.enemies.length===3 ? .32 : .73;
        this.ground.clear().rect(0,0,width,height).fill(snapshot.location.sky);
        // Temporary depth plane; authored street layers replace this technical backdrop.
        for(let i=0;i<12;i++) this.ground.rect(i*width/12,height*.1+(i%3)*7,width/15,height*.63).fill({color:0x081527,alpha:.35});
        this.ground.rect(0,height*horizon,width,height*(1-horizon)).fill(snapshot.location.ground)
            .rect(0,height*horizon,width,2).fill({color:snapshot.location.accent,alpha:.55});
        for(const sprite of this.backgroundSprites) {
            const frame=frameLocation(width,height,sprite.texture.width,sprite.texture.height,.43,horizon===.32 ? .32 : .5);
            sprite.position.set(frame.x,frame.y);sprite.width=frame.width;sprite.height=frame.height;
        }
        for (const actor of snapshot.actors) {
            const slot = actor.id === 'player' ? snapshot.layout.hero : snapshot.layout.enemies.find(slot=>slot.id===actor.id);
            const sprite = this.sprites.get(actor.id);
            if (!slot || !sprite) continue;
            this.place(sprite,slot,actor);
            this.shadows.get(actor.id)?.clear().ellipse(slot.foot.x,slot.foot.y,slot.art.width*.4,Math.min(7,slot.art.height*.04)).fill({color:0x020810,alpha:actor.defeated ? .12 : .45});
        }
        this.paintAtmosphere();
        this.visibility();
        this.app.render();
    }
    private place(sprite: Sprite, slot: ActorSlot, actor: SceneActor) {
        const idle=this.poses.get(`${actor.id}:idle`) ?? sprite.texture;
        const now=performance.now();
        const clip:ActorClip=actor.defeated ? 'defeat' : actor.clip ?? 'idle';
        const elapsed=this.motions.elapsed(actor.id,clip,actor.motionToken,now);
        const motion=sampleActorMotion(motionProfile(actor.visual.id),clip,elapsed,now+slot.foot.x*11,actor.id==='player'?1:-1,this.snapshot.reducedMotion);
        const reaction=this.reactions.get(actor.id);
        const reactionClip=reaction && !actor.defeated && clip!=='celebrate' && !this.snapshot.reducedMotion ? reactionPose(reaction.effect,now-reaction.at) : null;
        const activeClip=reactionClip ?? clip;
        const authoredClip=actor.visual.clips[activeClip];
        const frame=authoredClip ? clipFrameAt(authoredClip,reactionClip && reaction ? now-reaction.at : elapsed,this.snapshot.reducedMotion) : undefined;
        const poseClip=authoredClip ? frame ?? 'idle' : reactionClip ?? actorPoseAt(clip,elapsed,this.snapshot.reducedMotion);
        const atlasView=this.atlasViews.get(`${actor.id}:${poseClip}`);
        const pose=actor.visual.keyPoses?.[poseClip as ActorClip];
        sprite.texture=atlasView ?? this.poses.get(`${actor.id}:${poseClip}`) ?? idle;
        sprite.anchor.set(...(atlasView ? actor.visual.atlasFrames![poseClip].footAnchor : pose && sprite.texture!==idle ? pose.footAnchor : actor.visual.footAnchor));
        const scale = Math.min(slot.art.width / idle.width,slot.art.height / idle.height);
        sprite.scale.set(scale*motion.scaleX,scale*motion.scaleY); sprite.position.set(slot.foot.x+motion.x,slot.foot.y+motion.y); sprite.alpha=motion.alpha; sprite.rotation=motion.rotation;
        sprite.tint=0xffffff;
        if(reaction && !actor.defeated && !this.snapshot.reducedMotion) {
            const progress=(performance.now()-reaction.at)/220;
            if(progress>=1)this.reactions.delete(actor.id);
            else {
                sprite.tint=reaction.effect==='heal'?0xb8ffd2:reaction.effect==='blocked'||reaction.effect==='block'?0xaaddff:0xffc5a3;
                if(['damage','thorns','burn'].includes(reaction.effect))sprite.x+=(actor.id==='player'?-1:1)*Math.sin(Math.max(0,progress)*Math.PI)*7;
            }
        }
    }
    private tick = () => {
        if (this.disposed) return;
        this.paintAtmosphere();
        for (const actor of this.snapshot.actors) {
            const sprite = this.sprites.get(actor.id);
            const slot = actor.id === 'player' ? this.snapshot.layout.hero : this.snapshot.layout.enemies.find(slot=>slot.id===actor.id);
            if (!sprite || !slot) continue;
            this.place(sprite,slot,actor);
        }
    };
    private paintAtmosphere() {
        this.atmosphere.clear();
        const {layout,location,reducedMotion}=this.snapshot;
        for(const mark of locationAtmosphere(location.id,layout.width,layout.height,performance.now(),reducedMotion || document.hidden)) {
            this.atmosphere.rect(mark.x,mark.y,mark.width,mark.height).fill({color:mark.color,alpha:mark.alpha});
        }
    }
    private contextLost = (event: Event) => { event.preventDefault(); this.onFailure('Graphics context lost'); this.destroy(); };
    private visibility = () => { if (!this.disposed && this.initialized) { if (document.hidden || this.snapshot.reducedMotion) { this.app.stop(); this.app.render(); } else this.app.start(); } };
    private destroyApp() {
        if (!this.initialized) return;
        this.app.canvas.removeEventListener('webglcontextlost',this.contextLost);
        this.app.destroy({removeView:true},{children:true,texture:false,textureSource:false});
        this.initialized = false;
    }
    destroy() {
        if (this.disposed) return;
        this.disposed = true;
        this.unsubscribeImpacts?.(); this.unsubscribeImpacts=undefined;this.reactions.clear();this.motions.clear();
        document.removeEventListener('visibilitychange',this.visibility);
        this.destroyApp();
        this.sprites.clear(); this.shadows.clear(); this.poses.clear(); this.backgroundSprites=[];
        this.atlasViews.forEach(texture=>texture.destroy(false));this.atlasViews.clear();
        this.leases.forEach(lease=>lease.release()); this.leases=[];
    }
}
