"use client";
import {useEffect,useState} from "react";
import type {LucideIcon} from "lucide-react";

function useCountUp(value:number){const [shown,setShown]=useState(0);useEffect(()=>{let frame=0;const start=performance.now(),duration=520;const step=(now:number)=>{const p=Math.min(1,(now-start)/duration);setShown(Math.round(value*(1-Math.pow(1-p,3))));if(p<1)frame=requestAnimationFrame(step)};frame=requestAnimationFrame(step);return()=>cancelAnimationFrame(frame)},[value]);return shown}
export function MetricCard({label,value,detail,trend,icon:Icon,tone="cyan"}:{label:string;value:number;detail:string;trend:string;icon:LucideIcon;tone?:"cyan"|"green"|"amber"|"red"}){const shown=useCountUp(value);return <article className={`metric-card tone-${tone}`}><div className="metric-top"><span>{label}</span><i><Icon/></i></div><strong>{shown.toLocaleString()}</strong><footer><b>{trend}</b><small>{detail}</small></footer><div className="metric-spark" aria-hidden="true"><i/><i/><i/><i/><i/><i/><i/></div></article>}
