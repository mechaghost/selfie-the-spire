/** Decorative cartography only. Route availability comes from the seeded graph. */
export function CityMapArt(){
    return <svg className="city-map-art" viewBox="0 0 1000 1600" preserveAspectRatio="none" aria-hidden="true">
        <defs><pattern id="bay-lines" width="38" height="26" patternUnits="userSpaceOnUse"><path d="M0 14 Q10 5 20 14 T40 14" fill="none" stroke="#77c6c4" strokeOpacity=".15" strokeWidth="2"/></pattern></defs>
        <rect width="1000" height="1600" fill="#172f38"/>
        <path d="M846 0H1000V1600H836L852 1420 822 1290 854 1120 826 940 858 770 830 600 852 430 820 240Z" fill="#154d59"/>
        <path d="M846 0H1000V1600H836L852 1420 822 1290 854 1120 826 940 858 770 830 600 852 430 820 240Z" fill="url(#bay-lines)"/>
        <path d="M846 0L820 240 852 430 830 600 858 770 826 940 854 1120 822 1290 852 1420 836 1600" fill="none" stroke="#ccbc8c" strokeWidth="10"/>
        {[0,1,2,3].map(col=><path key={col} d={`M${140+col*200} 0V1600`} stroke="#344951" strokeWidth="38"/>)}
        {Array.from({length:10},(_,row)=><path key={row} d={`M30 ${100+row*160}H838`} stroke="#344951" strokeWidth="30"/>)}
        {Array.from({length:9},(_,row)=>[0,1,2].map(col=>{
            const x=172+col*200,y=122+row*160,park=(row*3+col)%7===0;
            return <g key={`${row}-${col}`}><rect x={x} y={y} width="135" height="116" rx="9" fill={park?'#284e45':['#29404a','#3b3b49','#3e4348'][Math.floor(row/2)%3]} stroke="#65817c" strokeOpacity=".3" strokeWidth="2"/>
                {park?<><path d={`M${x+10} ${y+70}Q${x+60} ${y+15} ${x+125} ${y+75}`} fill="none" stroke="#8ba180" strokeOpacity=".45" strokeWidth="8"/>{[25,66,104].map((dx,i)=><circle key={dx} cx={x+dx} cy={y+30+i%2*42} r="13" fill="#507463"/>)}</>:<><rect x={x+10} y={y+10} width="49" height="38" rx="3" fill="#a18c80" fillOpacity=".3"/><rect x={x+70} y={y+10} width="54" height="68" rx="3" fill="#759b9a" fillOpacity=".3"/><rect x={x+10} y={y+61} width="49" height="43" rx="3" fill="#c08d8c" fillOpacity=".27"/></>}</g>;
        }))}
        <path d="M34 786H940" stroke="#344951" strokeWidth="25"/><path d="M850 786H940" stroke="#acac91" strokeWidth="4" strokeDasharray="14 8"/>
        <path d="M929 674q47 58 10 140q-38-47-10-140" fill="#47705c" stroke="#a9b485" strokeWidth="5"/>
        <path d="M50 1550H810" stroke="#d6a878" strokeOpacity=".5" strokeWidth="8"/>
    </svg>;
}
