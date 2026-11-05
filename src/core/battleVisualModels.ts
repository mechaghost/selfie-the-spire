export type ActorClip = 'idle' | 'attack' | 'cast' | 'hit' | 'guard' | 'defeat' | 'celebrate';
export type LocationId = 'ocean-drive' | 'wynwood' | 'underpass' | 'club-backlot' | 'rooftop';
export interface CombatAppearance { version: 1; actorVisualId: string; paletteId?: string }
export interface ActorVisual {
    id: string;
    fallbackImageUrl: string;
    atlasUrl?: string;
    keyPoses?: Partial<Record<ActorClip, { imageUrl: string; footAnchor: readonly [number, number] }>>;
    footAnchor: readonly [number, number];
    facing: 'left' | 'right';
    mirrorAllowed: boolean;
    visualHeight: number;
    clips: Partial<Record<ActorClip, { frames: string[]; durationsMs: number[]; loop: boolean; completion: 'idle' | 'hold' }>>;
    productionStatus: 'placeholder' | 'review' | 'approved';
    provenance: string;
}
export interface LocationVisual {
    id: LocationId;
    version: 1;
    name: string;
    sky: number;
    ground: number;
    accent: number;
    layers: { url: string; depth: number }[];
    productionStatus: 'placeholder' | 'review' | 'approved';
}
const assetPath = (path: string) => /^\/assets\/battle\/[a-zA-Z0-9_./-]+$/.test(path) && !path.includes('..');
export function validateActorVisual(visual: ActorVisual): void {
    if (!visual.id || !assetPath(visual.fallbackImageUrl) || (visual.atlasUrl && !assetPath(visual.atlasUrl)) ||
        !Number.isFinite(visual.visualHeight) || visual.visualHeight <= 0 || visual.visualHeight > 4096 ||
        visual.footAnchor.length !== 2 || visual.footAnchor.some(n => !Number.isFinite(n) || n < 0 || n > 1)) throw new Error(`Invalid actor visual: ${visual.id}`);
    for (const pose of Object.values(visual.keyPoses ?? {})) {
        if (!pose || !assetPath(pose.imageUrl) || pose.footAnchor.some(n=>!Number.isFinite(n) || n<0 || n>1)) throw new Error(`Invalid key pose: ${visual.id}`);
    }
    for (const clip of Object.values(visual.clips)) {
        if (!clip || !clip.frames.length || clip.frames.length !== clip.durationsMs.length ||
            clip.frames.some(frame => !frame) || clip.durationsMs.some(ms => !Number.isFinite(ms) || ms < 16 || ms > 10000)) throw new Error(`Invalid animation clip: ${visual.id}`);
    }
}
