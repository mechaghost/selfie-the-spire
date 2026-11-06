/** Preserve aspect ratio and align the authored ground boundary, covering every viewport edge. */
export function frameLocation(width:number,height:number,imageWidth:number,imageHeight:number,sourceHorizon=.43,targetHorizon=.4) {
    if([width,height,imageWidth,imageHeight].some(n=>!Number.isFinite(n)||n<=0) || !Number.isFinite(sourceHorizon) || !Number.isFinite(targetHorizon) || sourceHorizon<=0 || sourceHorizon>=1 || targetHorizon<=0 || targetHorizon>=1) throw new Error('Invalid location frame');
    const scale=Math.max(width/imageWidth,height*targetHorizon/(imageHeight*sourceHorizon),height*(1-targetHorizon)/(imageHeight*(1-sourceHorizon)));
    return {x:(width-imageWidth*scale)/2,y:height*targetHorizon-imageHeight*scale*sourceHorizon,width:imageWidth*scale,height:imageHeight*scale};
}

/** Shared crop for separated scenery/ground, with overscan for bounded background drift. */
export function frameLocationLayer(width:number,height:number,imageWidth:number,imageHeight:number,targetHorizon:number,timeMs:number,reducedMotion:boolean,sway=0) {
    if(!Number.isFinite(width) || width<=0)throw new Error('Invalid location width');
    const frame=frameLocation(width+6,height,imageWidth,imageHeight,.43,targetHorizon);
    const amplitude=reducedMotion || !Number.isFinite(sway) ? 0 : Math.max(0,Math.min(3,sway));
    return {...frame,x:frame.x-3+Math.sin((Number.isFinite(timeMs)?timeMs:0)/6000)*amplitude};
}

/** Corner foliage stays at the viewport edges, with the middle of combat unobscured. */
export function frameForeground(width:number,height:number,imageWidth:number,imageHeight:number,timeMs:number,reducedMotion:boolean,sway=0) {
    if ([width,height,imageWidth,imageHeight].some(n=>!Number.isFinite(n)||n<=0)) throw new Error('Invalid foreground frame');
    const amplitude=reducedMotion || !Number.isFinite(sway) ? 0 : Math.max(0,Math.min(3,sway));
    const scale=(width+6)/imageWidth;
    return {x:-3+Math.sin((Number.isFinite(timeMs)?timeMs:0)/4000)*amplitude,y:0,width:width+6,height:Math.min(imageHeight*scale,height)};
}
