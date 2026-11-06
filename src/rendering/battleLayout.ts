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
export interface ActorShape {
    aspect: number;
    /** Visible extent in normalized idle texture coordinates. */
    bounds: readonly [left: number, top: number, right: number, bottom: number];
    anchor: readonly [number, number];
    height: number;
}
export interface BattleLayout { width: number; height: number; horizon: number; compact: boolean; hero: ActorSlot; enemies: ActorSlot[] }

export function battleLayout(width: number, height: number, enemyIds: readonly string[], boss = false, shapes: Readonly<Record<string,ActorShape>> = {}): BattleLayout {
    if (!Number.isFinite(width) || !Number.isFinite(height) || width < 280 || height < 140) throw new Error('Arena requires at least 280×140 CSS pixels');
    if (enemyIds.length > 3 || new Set(enemyIds).size !== enemyIds.length) throw new Error('Arena supports up to three stable, unique enemy slots');
    const edge = 6, hudHeight = 72;
    const lane = (width - edge * 2) / 4;
    const footY = height - 19;
    const horizon = .5;
    // A single combat camera reserves room for four fighters, even in a solo
    // encounter. Changing the roster moves slots horizontally, never the camera.
    const zoom = Math.min((lane - 12) / 112, (footY - hudHeight - 16) / 152, 2);
    const makeSlot = (id: string, index: number, center: number): ActorSlot => {
        const shape = shapes[id] ?? {aspect:.8, bounds:[0,0,1,1], anchor:[.5,1], height:index<0 ? 144 : boss ? 152 : 132};
        const [left,top,right,bottom] = shape.bounds;
        const [ax,ay] = shape.anchor;
        // Limit unusually wide artwork in world units, not in the current roster's cell.
        const textureHeight = zoom * Math.min(shape.height / (bottom - top), 112 / (shape.aspect * 2 * Math.max(ax - left, right - ax)));
        const textureWidth = textureHeight * shape.aspect;
        const foot = {x:center,y:footY};
        const art = {x:center-textureWidth*ax,y:footY-textureHeight*ay,width:textureWidth,height:textureHeight};
        const bodyX = art.x + left * textureWidth, bodyY = art.y + top * textureHeight;
        const bodyWidth = (right-left)*textureWidth, bodyHeight = (bottom-top)*textureHeight;
        const targetWidth = Math.max(44, bodyWidth + 8), targetHeight = Math.max(44, bodyHeight + 8);
        const target = {
            x: Math.max(center-lane/2, Math.min(center+lane/2-targetWidth, bodyX+(bodyWidth-targetWidth)/2)),
            y: Math.min(height-targetHeight, bodyY+(bodyHeight-targetHeight)/2),
            width: targetWidth, height: targetHeight,
        };
        const hudWidth = Math.min(lane - 4, 144);
        return {id,index,foot,art,target,hud:{x:center-hudWidth/2,y:Math.max(5,bodyY-hudHeight-12),width:hudWidth,height:hudHeight}};
    };
    const hero = makeSlot('player',-1,edge+lane*.5);
    const enemies = enemyIds.map((id,index)=>makeSlot(id,index,edge+lane*(1+3*(index+.5)/enemyIds.length)));
    return {width,height,horizon,compact:width<600 || height<240,hero,enemies};
}

export function hitTest(layout: BattleLayout, clientX: number, clientY: number, stageBounds: Pick<DOMRect, 'left' | 'top'>, livingIds: ReadonlySet<string>): string | null {
    const x = clientX - stageBounds.left, y = clientY - stageBounds.top;
    return layout.enemies.find(slot => livingIds.has(slot.id) && x >= slot.target.x && x <= slot.target.x + slot.target.width && y >= slot.target.y && y <= slot.target.y + slot.target.height)?.id ?? null;
}
