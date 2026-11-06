/** Deterministic green-screen removal. No model, network call or learned weights. */
export function removeGreenScreen(data:Uint8ClampedArray,width:number,height:number) {
    if(width<32 || height<32 || width*height>1_048_576 || data.length!==width*height*4)throw new Error('Invalid character image dimensions');
    const border:number[]=[];
    for(let i=0;i<16;i++){
        const x=Math.round(i*(width-1)/15),y=Math.round(i*(height-1)/15);
        border.push(x,(height-1)*width+x,y*width,y*width+width-1);
    }
    const green=(p:number)=>data[p*4+1]>150 && data[p*4+1]-Math.max(data[p*4],data[p*4+2])>100;
    if(border.filter(green).length<border.length*.9)throw new Error('The generated backdrop is not a clean green screen. Please try again.');
    const samples=border.filter(green);
    const background=[0,1,2].map(c=>samples.reduce((sum,p)=>sum+data[p*4+c],0)/samples.length);
    if(samples.some(p=>background.some((v,c)=>Math.abs(data[p*4+c]-v)>45)))throw new Error('The generated backdrop is uneven. Please try again.');
    const dominance=background[1]-Math.max(background[0],background[2]);
    let clear=0,solid=0,left=width,top=height,right=-1,bottom=-1;
    for(let p=0;p<width*height;p++){
        const i=p*4,d=data[i+1]-Math.max(data[i],data[i+2]);
        const alpha=1-Math.max(0,Math.min(1,(d-50)/(dominance-50)));
        if(alpha<.03){data[i+3]=0;clear++;continue;}
        if(alpha<1)for(let c=0;c<3;c++)data[i+c]=Math.max(0,Math.min(255,(data[i+c]-(1-alpha)*background[c])/alpha));
        data[i+3]=Math.round(255*alpha);
        if(alpha>.94)solid++;
        const x=p%width,y=Math.floor(p/width);left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
    }
    if(clear/(width*height)<.1 || solid/(width*height)<.03 || right<left)throw new Error('The character could not be separated cleanly. Please try again.');
    if(left===0 || top===0 || right===width-1 || bottom===height-1)throw new Error('The generated character is cut off at the edge. Please try again.');
    return {left,top,width:right-left+1,height:bottom-top+1};
}
