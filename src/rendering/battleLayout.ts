/** All coordinates are CSS-local stage pixels. Backing-store DPR never enters targeting. */
export interface Rect { x: number; y: number; width: number; height: number }
export interface ActorSlot {
    id: string;
    index: number;
    foot: { x: number; y: number };
    art: Rect;
    target: Rect;
    hud: Rect;
}
export interface BattleLayout { width: number; height: number; compact: boolean; hero: ActorSlot; enemies: ActorSlot[] }
export function battleLayout(width: number, height: number, enemyIds: readonly string[], boss = false): BattleLayout {
    if (!Number.isFinite(width) || !Number.isFinite(height) || width < 280 || height < 140) throw new Error('Arena requires at least 280×140 CSS pixels');
    if (enemyIds.length > 3 || new Set(enemyIds).size !== enemyIds.length) throw new Error('Arena supports up to three stable, unique enemy slots');
    const compact = width < 600 || height < 240;
    const edge = 8;
    const wideShort = width >= 600 && height < 240;
    const ground = height - 12;
    const heroWidth = Math.min(width * .22, 180);
    const heroArtHeight = Math.min(height - 90, compact ? 170 : 270);
    const hero: ActorSlot = {
        id: 'player', index: -1, foot: { x: heroWidth / 2 + edge, y: ground },
        art: { x: edge, y: ground - heroArtHeight, width: heroWidth, height: heroArtHeight },
        target: { x: edge, y: height - 56, width: Math.max(44, heroWidth), height: 44 },
        hud: { x: edge, y: Math.max(4, ground - heroArtHeight - 78), width: heroWidth, height: 72 },
    };
    if (wideShort) {
        hero.hud.width = 64; hero.hud.y = 4;
        hero.art = { x: edge + 64, y: 12, width: heroWidth - 64, height: ground - 12 };
        hero.foot = { x: hero.art.x + hero.art.width / 2, y: ground };
    }
    const start = Math.max(heroWidth + edge * 2, width * .28);
    const areaWidth = width - start - edge;
    const count = Math.max(enemyIds.length, 1);
    const cell = areaWidth / count;
    // Short portrait: keep the ordered intent strip separate from two art depth lanes.
    if(width<600 && height>=220 && height<300 && enemyIds.length===3) {
        const upperFoot=Math.round(height*.61);
        const artStart=Math.max(90,start);
        const laneWidth=(width-artStart-edge)/2;
        hero.art={x:edge,y:ground-140,width:Math.min(90,artStart-edge*2),height:140};
        hero.foot={x:hero.art.x+hero.art.width/2,y:ground};
        hero.hud={x:edge,y:4,width:heroWidth,height:72};
        const enemies=enemyIds.map((id,index):ActorSlot=>{
            const front=index===2;
            const artWidth=front ? laneWidth*1.15 : laneWidth-4;
            const x=front ? width-edge-artWidth-12 : artStart+index*laneWidth;
            const bottom=front ? ground : upperFoot;
            const artHeight=front ? Math.max(44,ground-upperFoot-6) : Math.max(44,upperFoot-86);
            const art={x,y:bottom-artHeight,width:artWidth,height:artHeight};
            return {id,index,art,foot:{x:x+artWidth/2,y:bottom},target:{...art},
                hud:{x:start+index*cell+3,y:4,width:cell-6,height:72}};
        });
        return {width,height,compact,hero,enemies};
    }
    // Portrait uses depth lanes rather than compressing three creatures into one narrow row.
    if (width < 600 && height >= 300 && enemyIds.length === 3) {
        // Only the hero HUD occupies the upper-left lane, not the whole hero.
        const portraitStart=Math.max(92,width*.18);
        const laneWidth = (width-portraitStart-edge) / 2;
        const laneHeight = height / 2;
        const heroLaneWidth = Math.min(150, start + areaWidth * .25 - edge * 2);
        const heroLaneHeight = Math.min(240, laneHeight-20);
        hero.art = {x:edge,y:ground-heroLaneHeight,width:heroLaneWidth,height:heroLaneHeight};
        hero.foot = {x:edge+heroLaneWidth/2,y:ground};
        hero.hud = {x:edge,y:Math.max(4,hero.art.y-78),width:portraitStart-32,height:72};
        const enemies = enemyIds.map((id,index): ActorSlot => {
            const row = index === 2 ? 1 : 0;
            const x = index===2 ? hero.art.x+hero.art.width+32 : portraitStart+index*laneWidth+3;
            const slotWidth=index===2 ? width-edge-x : laneWidth-6;
            const top = row * laneHeight + 4;
            const bottom = (row + 1) * laneHeight - 12;
            const art = {x,y:top+78,width:slotWidth,height:bottom-top-78};
            return {id,index,art,foot:{x:x+art.width/2,y:bottom},
                target:{x,y:top,width:slotWidth,height:laneHeight-16},
                hud:{x,y:top,width:slotWidth,height:72}};
        });
        return {width,height,compact,hero,enemies};
    }
    const enemies = enemyIds.map((id, index): ActorSlot => {
        const slotWidth = cell - 6;
        const x = start + index * cell + 3;
        const artHeight = Math.min(height - 90, boss ? 340 : compact ? 180 : 250);
        const artWidth = Math.min(slotWidth, boss ? 340 : 230);
        const artX = x + (slotWidth - artWidth) / 2;
        if (wideShort) {
            const hudWidth = Math.min(100, slotWidth * .5);
            const art = { x: x + hudWidth, y: 12, width: slotWidth - hudWidth, height: ground - 12 };
            return { id, index, art, foot: { x: art.x + art.width / 2, y: ground },
                target: { x, y: 4, width: slotWidth, height: height - 12 },
                hud: { x, y: 4, width: hudWidth, height: 72 } };
        }
        return { id, index, foot: { x: x + slotWidth / 2, y: ground },
            art: { x: artX, y: ground - artHeight, width: artWidth, height: artHeight },
            target: { x, y: 4, width: slotWidth, height: height - 12 },
            hud: { x, y: Math.max(4, ground - artHeight - 78), width: slotWidth, height: 72 },
        };
    });
    return { width, height, compact, hero, enemies };
}
export function hitTest(layout: BattleLayout, clientX: number, clientY: number, stageBounds: Pick<DOMRect, 'left' | 'top'>, livingIds: ReadonlySet<string>): string | null {
    const x = clientX - stageBounds.left, y = clientY - stageBounds.top;
    return layout.enemies.find(slot => livingIds.has(slot.id) && x >= slot.target.x && x <= slot.target.x + slot.target.width && y >= slot.target.y && y <= slot.target.y + slot.target.height)?.id ?? null;
}
