"use client";
import {useCallback,useEffect,useState} from "react";
import {Check,ShieldAlert} from "lucide-react";
import {acknowledgeAlert,fetchAlerts} from "@/services/api";
import type {OperatorAlert} from "@/types/tracking";
import {AdvancedDataTable,type DataColumn} from "@/components/ui/AdvancedDataTable";
import {DetailDrawer} from "@/components/ui/Overlay";
import {PageHeader} from "@/components/ui/Page";
import {StatusBadge} from "@/components/ui/StatusBadge";
import {Button} from "@/components/ui/Button";
import {useTranslation} from "@/hooks/useTranslation";
import {useAuthStore} from "@/stores/auth-store";
import {useRealtimeAlertStore} from "@/stores/realtime-alert-store";

const columns:DataColumn<OperatorAlert>[]=[
{id:"severity",header:"Severity",cell:r=><StatusBadge status={r.severity}/>,sortValue:r=>r.severity},
{id:"alert",header:"Alert",cell:r=><div><strong className="text-white">{r.title}</strong><div className="mt-1 max-w-md truncate text-xs text-slate-600">{r.message??"No context"}</div></div>,sortValue:r=>r.title,priority:true},
{id:"target",header:"Target",cell:r=>r.track?.callsign??"No linked track"},
{id:"source",header:"Source",cell:r=>r.track?.type??"—"},
{id:"created",header:"Created",cell:r=>new Date(r.created_at).toLocaleString(),sortValue:r=>r.created_at},
{id:"status",header:"Status",cell:r=><StatusBadge status={r.state}/>,sortValue:r=>r.state}
];
export function AlertWorkspace(){
 const {t}=useTranslation();
 const canManage=useAuthStore(s=>s.can)("alerts.manage");
 const realtimeAlerts=useRealtimeAlertStore(s=>s.alerts);
 const replaceRealtimeAlerts=useRealtimeAlertStore(s=>s.replace);
 const[alerts,setAlerts]=useState<OperatorAlert[]>([]),[selected,setSelected]=useState<OperatorAlert|null>(null),[loading,setLoading]=useState(true),[failed,setFailed]=useState(false),[busy,setBusy]=useState(false);
 const load=useCallback(async()=>{setLoading(true);setFailed(false);try{const nextAlerts=await fetchAlerts();setAlerts(nextAlerts);replaceRealtimeAlerts(nextAlerts.map(({id,severity,state,title,message,created_at})=>({id,severity,state,title,message,created_at})))}catch{setFailed(true)}finally{setLoading(false)}},[replaceRealtimeAlerts]);
 useEffect(()=>{void load()},[load]);
 const acknowledge=async(alert:OperatorAlert)=>{setBusy(true);try{const result=await acknowledgeAlert(alert.id);setAlerts(items=>items.map(item=>item.id===result.id?result:item));setSelected(result)}finally{setBusy(false)}};
 return <main className="mx-auto max-w-[1800px] p-4 sm:p-6 xl:p-8"><PageHeader eyebrow={t.operations.incidents} title={t.common.alerts} description={t.operations.alertsDescription}/>{realtimeAlerts.length>0&&<section className="mb-5 rounded-2xl border border-cyan-400/20 bg-cyan-400/[.04] p-4"><div className="mb-3 flex items-center justify-between"><h2 className="text-xs font-bold uppercase tracking-wider text-cyan-300">Realtime alerts</h2><span className="text-[10px] text-slate-500">Latest 5</span></div><div className="grid gap-2 md:grid-cols-2 xl:grid-cols-5">{realtimeAlerts.slice(0,5).map(alert=><article key={alert.id} className="rounded-xl border border-white/[.06] bg-white/[.025] p-3"><div className="flex items-center justify-between gap-2"><StatusBadge status={alert.severity}/><time className="text-[9px] text-slate-500">{alert.created_at?new Date(alert.created_at).toLocaleTimeString(): "—"}</time></div><strong className="mt-2 block truncate text-xs text-slate-200">{alert.title}</strong><p className="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-500">{alert.message??t.operations.noAdditionalContext}</p></article>)}</div></section>}<AdvancedDataTable data={alerts} columns={columns} searchPlaceholder={t.operations.searchIncidents} isLoading={loading} error={failed} onRetry={()=>void load()} onRowClick={setSelected}/><DetailDrawer open={!!selected} onClose={()=>setSelected(null)} title={t.operations.alertDetails}>{selected&&<div><div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-300/10 text-amber-300"><ShieldAlert size={20}/></div><div className="mt-5"><StatusBadge status={selected.severity}/><h3 className="mt-3 text-xl font-semibold text-slate-900 dark:text-white">{selected.title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{selected.message??t.operations.noAdditionalContext}</p></div><div className="mt-5 space-y-2">{[[t.operations.target,selected.track?.callsign??t.operations.unlinked],[t.operations.status,selected.state],[t.operations.created,new Date(selected.created_at).toLocaleString()],[t.operations.assignedTo,selected.acknowledged_by?.name??t.operations.unassigned]].map(([k,v])=><div key={k} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-white/[.06] dark:bg-white/[.025]"><span className="text-[10px] uppercase tracking-wider text-slate-600">{k}</span><strong className="text-xs text-slate-700 dark:text-slate-300">{v}</strong></div>)}</div> {canManage&&selected.state==="active"&&<Button variant="primary" className="mt-5 w-full" disabled={busy} onClick={()=>void acknowledge(selected)}><Check size={15}/>{busy?t.operations.acknowledging:t.operations.acknowledge}</Button>}</div>}</DetailDrawer></main>;
}
