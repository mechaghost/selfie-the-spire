import type { ActorVisual } from '../core/battleVisualModels';
import idleBounds from '../data/actorIdleBounds.json';
import { textureSourceInfo } from './textureBudget';
import type { ActorShape } from './battleLayout';

/** Idle alpha bounds keep transparent padding out of both sizing and drag hit areas. */
export function actorShape(visual: ActorVisual): ActorShape {
    const file = visual.fallbackImageUrl.split('/').pop() as keyof typeof idleBounds;
    const source = textureSourceInfo(visual.fallbackImageUrl);
    const personal = visual.fallbackImageUrl.startsWith('data:');
    const bounds = (source ? idleBounds[file] : undefined) as ActorShape['bounds'] | undefined;
    return {
        aspect: source ? source.width/source.height : personal ? 2/3 : 5/9,
        bounds: bounds ?? (personal ? [ .03, .03, .97, .99 ] : [0,0,1,1]),
        anchor: visual.footAnchor,
        height: visual.visualHeight,
    };
}
