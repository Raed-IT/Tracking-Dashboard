"use client";
import {useCallback,useEffect,useState} from "react";
import {Activity,Database,Radio,Server} from "lucide-react";
import {fetchSystemStatus,type SystemStatus} from "@/services/api";
import {PageHeader,ErrorState} from "@/components/ui/Page";
import {StatusBadge} from "@/components/ui/StatusBadge";
const icons=[Database,Server,Activity,Radio];
export function HealthWorkspace(){
 const[data,setData]=useState<SystemStatus|null>(null),[failed,setFailed]=useState(false);
 const load=useCallback(async()=>{setFailed(false);try{setData(await fetchSystemStatus())}catch{setFailed(true)}},[]);
 useEffect(()=>{void load()},[load]);
 return <main className="mx-auto max-w-[1800px] p-4 sm:p-6 xl:p-8"><PageHeader eyebrow="PLATFORM / OBSERVABILITY" title="System health" description="A concise view of the infrastructure supporting live operations."/>
 {failed?<section className="rounded-2xl border border-white/[.07] bg-slate-900/70"><ErrorState onRetry={()=>void load()}/></section>:!data?<section className="grid gap-3 sm:grid-cols-2">{Array.from({length:4},(_,i)=><article className="h-36 animate-pulse rounded-2xl border border-white/[.06] bg-white/[.025]" key={i}/>)}</section>:<><section className="grid gap-3 sm:grid-cols-2"><article className="rounded-2xl border border-white/[.07] bg-slate-900/70 p-5"><Activity className="text-cyan-300" size={20}/><div className="mt-4 text-[10px] uppercase tracking-wider text-slate-500">Platform health</div><strong className="mt-1 block text-3xl text-white">{data.status==="operational"?"100%":"Degraded"}</strong><div className="mt-3"><StatusBadge status={data.status} pulse/></div></article><article className="rounded-2xl border border-white/[.07] bg-slate-900/70 p-5"><Database className="text-emerald-300" size={20}/><div className="mt-4 text-[10px] uppercase tracking-wider text-slate-500">Online sources</div><strong className="mt-1 block text-3xl text-white">{data.sources.online??0}</strong><div className="mt-3 text-xs text-slate-600">Live ingestion providers</div></article></section><section className="mt-4 overflow-hidden rounded-2xl border border-white/[.07] bg-slate-900/70"><div className="flex items-center justify-between border-b border-white/[.06] px-5 py-4"><h2 className="text-sm font-semibold text-white">Service checks</h2><StatusBadge status={data.status}/></div><div className="grid gap-px bg-white/[.04] sm:grid-cols-2">{Object.entries(data.checks).map(([name,status],i)=>{const Icon=icons[i%icons.length];return <div key={name} className="bg-slate-900 p-5"><Icon size={17} className="text-cyan-300"/><div className="mt-4 text-xs font-medium text-slate-300">{name}</div><div className="mt-2"><StatusBadge status={status}/></div></div>})}</div></section></>}</main>;
}
