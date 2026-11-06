import { LocationVisual } from '../core/battleVisualModels';
/** Fixed mapping is presentation data and never consumes gameplay RNG. */
export const LOCATIONS: readonly LocationVisual[] = [
    {id:'ocean-drive',version:1,name:'Ocean Drive',sky:0x192b4c,ground:0x143344,accent:0xf3a49f,layers:[{url:'/assets/battle/locations/ocean-drive-background-v2.webp',depth:0,plane:'background',sway:1.5},{url:'/assets/battle/locations/ocean-drive-ground-v2.webp',depth:1,plane:'ground'},{url:'/assets/battle/locations/ocean-drive-foreground-v1.webp',depth:2,plane:'foreground',sway:2}],productionStatus:'review'},
    {id:'wynwood',version:1,name:'Wynwood After Dark',sky:0x28223e,ground:0x303047,accent:0xf2c065,layers:[{url:'/assets/battle/locations/wynwood-v1.webp',depth:0}],productionStatus:'review'},
    {id:'underpass',version:1,name:'Floodline Underpass',sky:0x172c34,ground:0x173b40,accent:0x99caba,layers:[{url:'/assets/battle/locations/underpass-v1.webp',depth:0}],productionStatus:'review'},
    {id:'club-backlot',version:1,name:'Club Backlot',sky:0x291e37,ground:0x26283c,accent:0xc789d9,layers:[{url:'/assets/battle/locations/club-backlot-v1.webp',depth:0}],productionStatus:'review'},
    {id:'rooftop',version:1,name:'Skyline Rooftop',sky:0x273248,ground:0x263443,accent:0xe8b287,layers:[{url:'/assets/battle/locations/rooftop-v1.webp',depth:0}],productionStatus:'review'},
];
export function locationForFloor(floor: number): LocationVisual {
    const safeFloor = Number.isFinite(floor) ? Math.max(1, Math.min(9, Math.floor(floor))) : 1;
    return LOCATIONS[Math.min(4, Math.floor((safeFloor - 1) / 2))];
}
