import {MapNode} from './mapModels';
export const CITY_MAP_HEIGHT=1600;
export const CITY_AVENUES=['Palm','Collins','Neon','Bayfront'] as const;
export function cityMapAvenue(node:Pick<MapNode,'x'>) {
    return CITY_AVENUES[Math.max(0,Math.min(3,Math.round((node.x-.125)/.25)))];
}
export function cityMapPoint(node:Pick<MapNode,'x'|'y'>) {
    const column=Math.max(0,Math.min(3,Math.round((node.x-.125)/.25)));
    return {x:140+column*200,y:1460-(node.y-1)*160};
}
export function cityStreetPath(from:Pick<MapNode,'x'|'y'>,to:Pick<MapNode,'x'|'y'>) {
    const a=cityMapPoint(from),b=cityMapPoint(to),crossStreet=(a.y+b.y)/2;
    return `M ${a.x} ${a.y} V ${crossStreet} H ${b.x} V ${b.y}`;
}
