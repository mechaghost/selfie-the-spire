import {useEffect,useMemo,useRef} from 'react';
import {useGameStore} from '../../store/gameStore';
import {MapNode,NodeType} from '../../core/mapModels';
import {generateMap} from '../../core/mapGenerator';
import {cityMapPoint,cityStreetPath,cityMapAvenue,CITY_AVENUES,CITY_MAP_HEIGHT} from '../../core/cityMapLayout';
import {Skull,Store,Swords,Coffee,MapPin,Navigation} from 'lucide-react';
import {TopBar} from '../ui/TopBar';
import {CityMapArt} from './CityMapArt';
import {locationForFloor} from '../../data/locations';
import './MapView.css';
const labels:Record<NodeType,string>={Combat:'Fight',Elite:'Elite',Rest:'Rest',Shop:'Shop',Unknown:'Event',Boss:'Boss',Start:'Start'};
function StopIcon({type}:{type:NodeType}){
    if(type==='Combat')return <Swords size={20}/>;
    if(type==='Elite'||type==='Boss')return <Skull size={21}/>;
    if(type==='Rest')return <Coffee size={20}/>;
    if(type==='Shop')return <Store size={20}/>;
    return <span className="city-mystery-icon">?</span>;
}
const districts=[{floor:9,top:36,label:'SKYLINE',detail:'The final rooftop'},{floor:7,top:250,label:'CLUB BACKLOT',detail:'After-hours territory'},{floor:5,top:570,label:'FLOODLINE',detail:'Under the causeway'},{floor:3,top:890,label:'WYNWOOD',detail:'Murals & midnight'},{floor:1,top:1210,label:'OCEAN DRIVE',detail:'Where the night begins'}];
export function MapView(){
    const {seed,floor,currentNodeId}=useGameStore();
    const routeRef=useRef<HTMLDivElement>(null);
    const map=useMemo(()=>seed?generateMap(seed):null,[seed]);
    const available=useMemo(()=>{
        if(!map)return [];
        const current=map.nodes.find(node=>node.id===currentNodeId);
        return map.nodes.filter(node=>current?current.connections.includes(node.id):currentNodeId===null&&node.y===1);
    },[map,currentNodeId]);
    useEffect(()=>{
        const area=routeRef.current;if(!area)return;
        const reveal=()=>{
            const next=area.querySelector<HTMLElement>('.map-node.available');
            // Reserve room beneath the choices for the previous street stop and
            // its YOU marker. On very short views, reachable choices take priority.
            const offset=currentNodeId?Math.max(24,Math.min(area.clientHeight*.55,area.clientHeight-260)):area.clientHeight*.67;
            if(next)area.scrollTop+=next.getBoundingClientRect().top-area.getBoundingClientRect().top-offset;
        };
        reveal();const observer=new ResizeObserver(reveal);observer.observe(area);return()=>observer.disconnect();
    },[map,currentNodeId]);
    if(!map)return <div className="map-loading">Charting the city…</div>;
    const visible=map.nodes.filter(node=>node.type!=='Start');
    const pick=(node:MapNode)=>{if(available.some(choice=>choice.id===node.id))useGameStore.getState().advanceFloor(node);};
    const nextStop=Math.min(9,floor+1);
    return <main className="map-view-container city-street-map">
        <TopBar/>
        <header className="city-route-heading"><div><span>NEO MIAMI / NIGHT ROUTE</span><h1>Take the streets.</h1></div><p><MapPin size={15}/>{locationForFloor(nextStop).name}<strong>Stop {nextStop} / 9</strong></p></header>
        <div className="city-route-instruction"><Navigation size={16}/><span>{currentNodeId?'Follow a lit street to your next stop.':'Choose a lit stop to begin your night.'}</span></div>
        <div className="map-scroll-area" ref={routeRef} aria-label="Neo Miami street map">
            <div className="map-paths city-map-sheet" style={{height:CITY_MAP_HEIGHT}}>
                <CityMapArt/>
                <div className="city-map-compass" aria-hidden="true">N<span>↑</span></div>
                <span className="city-bay-label" aria-hidden="true">BISCAYNE BAY</span>
                <span className="city-avenue-label avenue-one" aria-hidden="true">PALM AVE</span><span className="city-avenue-label avenue-two" aria-hidden="true">NEON AVE</span>
                {CITY_AVENUES.map((name,index)=><span className="city-avenue-name" aria-hidden="true" key={name} style={{left:`${14+index*20}%`}}>{name}</span>)}
                {districts.map(district=><div key={district.floor} className="city-district-sign" style={{top:district.top}}><span>{district.label}</span><small>{district.detail}</small></div>)}
                <svg className="map-connections" viewBox={`0 0 1000 ${CITY_MAP_HEIGHT}`} preserveAspectRatio="none" aria-hidden="true">
                    {visible.flatMap(node=>node.connections.map(id=>{
                        const target=map.nodes.find(candidate=>candidate.id===id);if(!target)return null;
                        const active=node.id===currentNodeId&&available.some(choice=>choice.id===id);
                        return <path key={`${node.id}-${id}`} d={cityStreetPath(node,target)} className={`map-edge${active?' walkable':''}`}/>;
                    }))}
                </svg>
                {visible.map(node=>{
                    const point=cityMapPoint(node),current=node.id===currentNodeId,open=available.some(choice=>choice.id===node.id);
                    return <button key={node.id} className={`map-node type-${node.type.toLowerCase()}${open?' available':''}${current?' current':node.y<floor?' completed':''}`} style={{left:`${point.x/10}%`,top:point.y}}
                        aria-label={`${node.type==='Unknown'?'Mystery event':labels[node.type]}, stop ${node.y}, ${cityMapAvenue(node)} Avenue, ${locationForFloor(node.y).name}${current?', current location':open?', reachable':''}`} title={`${cityMapAvenue(node)} Avenue · ${labels[node.type]}`} disabled={!open} onClick={()=>pick(node)}>
                        <span className="node-circle"><StopIcon type={node.type}/><span>{labels[node.type]}</span></span>
                        <span className="city-stop-number" aria-hidden="true">{node.y}</span>{current&&<span className="node-you-marker">YOU</span>}
                    </button>;
                })}
                <div className="city-map-start" aria-hidden="true">OCEANFRONT PROMENADE · YOUR NIGHT STARTS HERE</div>
            </div>
        </div>
        <footer className="map-legend"><span><i className="legend-open"/>Reachable stop</span><span><i className="legend-current"/>You are here</span><span>Scroll to explore ↑</span></footer>
    </main>;
}
