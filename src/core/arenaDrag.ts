function arenaRect() {
    return document.querySelector('.battle-arena-content')?.getBoundingClientRect();
}

function contains(rect: DOMRect, x: number, y: number) {
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

/** Use the visible arena, including when the hand is beside it in landscape. */
export function arenaAtPoint(x: number, y: number): boolean {
    const rect = arenaRect();
    return !!rect && contains(rect,x,y);
}

export function canDropUntargeted(x: number, y: number): boolean {
    const rect = arenaRect();
    return rect ? contains(rect,x,y) : y < window.innerHeight - 250;
}
