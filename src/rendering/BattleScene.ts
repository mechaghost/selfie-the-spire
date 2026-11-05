import { Application, Container, Graphics, ImageSource, Sprite, Texture } from 'pixi.js';
import { ActorVisual, LocationVisual } from '../core/battleVisualModels';
import { BattleLayout, ActorSlot } from './battleLayout';
import { AssetLease, AssetLeaseCache } from './AssetLeaseCache';
export interface SceneActor { id: string; visual: ActorVisual; defeated: boolean }
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
    private ground = new Graphics();
    private sprites = new Map<string,Sprite>();
    private shadows = new Map<string,Graphics>();
    private leases: AssetLease<Texture>[] = [];
    private disposed = false;
    private initialized = false;
    private snapshot: SceneSnapshot;
    private time = 0;
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
            this.app.stage.addChild(this.ground,this.world);
            this.host.appendChild(this.app.canvas);
            await Promise.all(this.snapshot.actors.map(async actor => {
                const lease = battleTextures.acquire(actor.visual.fallbackImageUrl); this.leases.push(lease);
                const texture = await lease.ready;
                if (this.disposed) return;
                const shadow = new Graphics(); this.shadows.set(actor.id,shadow); this.world.addChild(shadow);
                const sprite = new Sprite(texture); sprite.anchor.set(...actor.visual.footAnchor);
                this.sprites.set(actor.id,sprite); this.world.addChild(sprite);
            }));
            if (this.disposed) return false;
            this.update(this.snapshot);
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
        this.ground.clear().rect(0,0,width,height).fill(snapshot.location.sky)
            .rect(0,height*.73,width,height*.27).fill(snapshot.location.ground)
            .rect(0,height*.73,width,2).fill({color:snapshot.location.accent,alpha:.55});
        // Bounded architectural silhouettes for technical preview, replaced by authored location layers.
        for(let i=0;i<12;i++) this.ground.rect(i*width/12,height*.22+(i%3)*13,width/15,height*.51).fill({color:0x081527,alpha:.35});
        for (const actor of snapshot.actors) {
            const slot = actor.id === 'player' ? snapshot.layout.hero : snapshot.layout.enemies.find(slot=>slot.id===actor.id);
            const sprite = this.sprites.get(actor.id);
            if (!slot || !sprite) continue;
            this.place(sprite,slot,actor);
            this.shadows.get(actor.id)?.clear().ellipse(slot.foot.x,slot.foot.y,slot.art.width*.4,Math.min(7,slot.art.height*.04)).fill({color:0x020810,alpha:actor.defeated ? .12 : .45});
        }
        this.visibility();
        this.app.render();
    }
    private place(sprite: Sprite, slot: ActorSlot, actor: SceneActor) {
        const scale = Math.min(slot.art.width / sprite.texture.width,slot.art.height / sprite.texture.height);
        sprite.scale.set(scale); sprite.position.set(slot.foot.x,slot.foot.y); sprite.alpha = actor.defeated ? .15 : 1;
    }
    private tick = () => {
        if (this.disposed) return;
        this.time += this.app.ticker.deltaMS;
        for (const [index, actor] of this.snapshot.actors.entries()) {
            const sprite = this.sprites.get(actor.id);
            const slot = actor.id === 'player' ? this.snapshot.layout.hero : this.snapshot.layout.enemies.find(slot=>slot.id===actor.id);
            if (!sprite || !slot) continue;
            this.place(sprite,slot,actor);
            // Temporary restrained idle, with planted feet. Authored clips replace this in W4.
            if (!this.snapshot.reducedMotion && !actor.defeated) sprite.scale.y *= 1 + Math.sin(this.time/650+index)*.008;
        }
    };
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
        document.removeEventListener('visibilitychange',this.visibility);
        this.destroyApp();
        this.sprites.clear(); this.shadows.clear();
        this.leases.forEach(lease=>lease.release()); this.leases=[];
    }
}
