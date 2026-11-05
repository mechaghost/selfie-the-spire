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
        hud: { x: edge, y: 4, width: heroWidth, height: 72 },
    };
    if (wideShort) {
        hero.hud.width = 64;
        hero.art = { x: edge + 64, y: 12, width: heroWidth - 64, height: ground - 12 };
        hero.foot = { x: hero.art.x + hero.art.width / 2, y: ground };
    }
    const start = Math.max(heroWidth + edge * 2, width * .28);
    const areaWidth = width - start - edge;
    const count = Math.max(enemyIds.length, 1);
    const cell = areaWidth / count;
    const enemies = enemyIds.map((id, index): ActorSlot => {
        const slotWidth = cell - 6;
        const x = start + index * cell + 3;
        const artHeight = Math.min(height - 90, boss ? 340 : compact ? 180 : 250);
        const artWidth = Math.min(slotWidth, boss ? 300 : 160);
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
            hud: { x, y: 4, width: slotWidth, height: 72 },
        };
    });
    return { width, height, compact, hero, enemies };
}
export function hitTest(layout: BattleLayout, clientX: number, clientY: number, stageBounds: Pick<DOMRect, 'left' | 'top'>, livingIds: ReadonlySet<string>): string | null {
    const x = clientX - stageBounds.left, y = clientY - stageBounds.top;
    return layout.enemies.find(slot => livingIds.has(slot.id) && x >= slot.target.x && x <= slot.target.x + slot.target.width && y >= slot.target.y && y <= slot.target.y + slot.target.height)?.id ?? null;
}
