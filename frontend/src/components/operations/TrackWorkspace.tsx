"use client";
import {useCallback,useEffect,useState} from "react";
import {RadioTower, X} from "lucide-react";
import {fetchTracks} from "@/services/api";
import type {Track} from "@/types/tracking";
import {AdvancedDataTable,type DataColumn} from "@/components/ui/AdvancedDataTable";
import {DetailDrawer} from "@/components/ui/Overlay";
import {PageHeader} from "@/components/ui/Page";
import {StatusBadge} from "@/components/ui/StatusBadge";

const columns:DataColumn<Track>[]=[
 {id:"callsign",header:"Track",cell:r=><div><strong className="text-white">{r.callsign??r.registration??r.id.slice(0,8)}</strong><div className="text-[10px] uppercase tracking-wider text-slate-600">{r.classification??r.type}</div></div>,sortValue:r=>r.callsign??r.id,priority:true},
 {id:"type",header:"Type",cell:r=><span className="capitalize">{r.type}</span>,sortValue:r=>r.type},
 {id:"position",header:"Position",cell:r=><span className="font-mono text-xs text-slate-400">{r.latitude.toFixed(4)}, {r.longitude.toFixed(4)}</span>},
 {id:"altitude",header:"Altitude",cell:r=>r.altitude===null?"—":`${Math.round(r.altitude).toLocaleString()} ft`,sortValue:r=>r.altitude??0},
 {id:"speed",header:"Speed",cell:r=>r.speed===null?"—":`${Math.round(r.speed)} kt`,sortValue:r=>r.speed??0},
 {id:"confidence",header:"Confidence",cell:r=><span>{Math.round(r.confidence*100)}%</span>,sortValue:r=>r.confidence},
 {id:"status",header:"Status",cell:r=><StatusBadge status={r.status} pulse/>,sortValue:r=>r.status},
 {id:"seen",header:"Last seen",cell:r=>new Date(r.last_seen_at).toLocaleTimeString(),sortValue:r=>r.last_seen_at}
];

export function TrackWorkspace(){
 const[tracks,setTracks]=useState<Track[]>([]),[selected,setSelected]=useState<Track|null>(null),[loading,setLoading]=useState(true),[failed,setFailed]=useState(false);
 const load=useCallback(async()=>{setLoading(true);setFailed(false);try{setTracks(await fetchTracks("-180,-90,180,90"))}catch{setFailed(true)}finally{setLoading(false)}},[]);
 useEffect(()=>{void load()},[load]);
 return <main className="mx-auto max-w-[1800px] p-4 sm:p-6 xl:p-8"><PageHeader eyebrow="OPERATIONS / LIVE TRACKING" title="Live tracks" description="Search, sort and inspect active aircraft tracks across all connected sources." actions={<div className="flex items-center gap-2 rounded-xl border border-emerald-400/10 bg-emerald-400/5 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-emerald-300"><i className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300"/>Realtime</div>}/><AdvancedDataTable data={tracks} columns={columns} searchPlaceholder="Search callsign, registration, position…" isLoading={loading} error={failed} onRetry={()=>void load()} onRowClick={setSelected} renderBulkActions={rows=><span className="text-slate-500">{rows.length} tracks selected for operational review</span>}/><DetailDrawer open={!!selected} onClose={()=>setSelected(null)} title="Track details">{selected&&<div><div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-300"><RadioTower size={21}/></div><div><div className="text-[9px] font-bold uppercase tracking-[.18em] text-cyan-300">{selected.type}</div><h3 className="mt-1 text-xl font-semibold text-white">{selected.callsign??selected.registration??"Unidentified track"}</h3></div></div><div className="mt-6 grid grid-cols-2 gap-2">{[["Altitude",selected.altitude===null?"—":`${Math.round(selected.altitude).toLocaleString()} ft`],["Speed",selected.speed===null?"—":`${Math.round(selected.speed)} kt`],["Heading",selected.heading===null?"—":`${Math.round(selected.heading)}°`],["Confidence",`${Math.round(selected.confidence*100)}%`],["Position",`${selected.latitude.toFixed(5)}, ${selected.longitude.toFixed(5)}`],["Last seen",new Date(selected.last_seen_at).toLocaleTimeString()]].map(([k,v])=><div key={k} className="rounded-xl border border-white/[.06] bg-white/[.025] p-3"><div className="text-[9px] uppercase tracking-wider text-slate-600">{k}</div><div className="mt-1 text-sm font-medium text-slate-200">{v}</div></div>)}</div><div className="mt-4"><StatusBadge status={selected.status} pulse/></div></div>}</DetailDrawer></main>
}
