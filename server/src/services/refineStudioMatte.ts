/** Remove a uniform studio backdrop's connected fringe without keying interior clothing.
 * Only applies when all four corners agree and the segmentation is not confident foreground.
 */
export function refineStudioMatte(rgb:Buffer, alpha:Buffer, width:number, height:number):void {
    const corners=[0,width-1,(height-1)*width,width*height-1];
    const background=[0,1,2].map(c=>Math.round(corners.reduce((sum,p)=>sum+rgb[p*3+c],0)/4));
    if(corners.some(p=>background.some((value,c)=>Math.abs(rgb[p*3+c]-value)>6)))return;
    const visited=new Uint8Array(width*height);
    const queue=new Uint32Array(width*height);
    let head=0,tail=0;
    const add=(p:number)=>{
        if(visited[p])return;
        visited[p]=1;
        if(alpha[p]>=250)return;
        const distance=Math.max(Math.abs(rgb[p*3]-background[0]),Math.abs(rgb[p*3+1]-background[1]),Math.abs(rgb[p*3+2]-background[2]));
        if(distance>32)return;
        alpha[p]=Math.min(alpha[p],Math.round(255*Math.max(0,(distance-8)/24)));
        queue[tail++]=p;
    };
    for(let x=0;x<width;x++){add(x);add((height-1)*width+x);}
    for(let y=0;y<height;y++){add(y*width);add(y*width+width-1);}
    while(head<tail){
        const p=queue[head++],x=p%width;
        if(x>0)add(p-1);if(x<width-1)add(p+1);
        if(p>=width)add(p-width);if(p<width*(height-1))add(p+width);
    }
}
