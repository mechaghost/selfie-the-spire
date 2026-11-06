import {useEffect,useRef,useState} from 'react';
import {runArenaBenchmark} from './benchmarkRunner';
import {CardItem} from '../components/ui/CardItem';
import {createCardInstance} from '../data/cards';
import './ArenaBenchmark.css';
const cards=Array.from({length:10},(_,i)=>createCardInstance(i%2?'haymaker':'finesse'));
export default function ArenaBenchmark(){
    const host=useRef<HTMLDivElement>(null),controller=useRef<AbortController>();
    const [running,setRunning]=useState(false),[progress,setProgress]=useState('Ready'),[report,setReport]=useState('');
    useEffect(()=>()=>{controller.current?.abort();},[]);
    async function start(duration:number){
        if(controller.current)return;
        const owned=new AbortController();controller.current=owned;setRunning(true);setReport('');setProgress('Loading first scene');
        try {const result=await runArenaBenchmark(host.current!,owned.signal,duration,setProgress);setReport(JSON.stringify(result,null,2));setProgress(result.valid?'Completed · valid sample':'Completed · sample invalid; inspect report');}
        catch(error){if(!owned.signal.aborted)setProgress(`Failed: ${error instanceof Error?error.message:String(error)}`);else setProgress('Cancelled');}
        finally {controller.current=undefined;setRunning(false);}
    }
    return <main className="arena-benchmark">
        <header><h1>Arena performance review</h1><p>20 scene cycles across five districts. Keep this view visible and its size unchanged. Measurements cover this browser, not physical phones.</p>
            <button disabled={running} onClick={()=>void start(600000)}>Start ten-minute benchmark</button>
            <button disabled={running} onClick={()=>void start(60000)}>Run one-minute verification</button>
            <button disabled={!running} onClick={()=>controller.current?.abort()}>Cancel benchmark</button>
            <p role="status">{progress}</p></header>
        <section ref={host} className="benchmark-stage" aria-label="Benchmark combat scene"/>
        <section className="benchmark-hand" aria-label="Ten-card hand">{cards.map(card=><CardItem key={card.instanceId} card={card}/>)}</section>
        {report && <details open><summary>Benchmark JSON report</summary><pre>{report}</pre></details>}
    </main>;
}
