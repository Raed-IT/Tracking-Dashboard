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
 const[alerts,setAlerts]=useState<OperatorAlert[]>([]),[selected,setSelected]=useState<OperatorAlert|null>(null),[loading,setLoading]=useState(true),[failed,setFailed]=useState(false),[busy,setBusy]=useState(false);
 const load=useCallback(async()=>{setLoading(true);setFailed(false);try{setAlerts(await fetchAlerts())}catch{setFailed(true)}finally{setLoading(false)}},[]);
 useEffect(()=>{void load()},[load]);
 const acknowledge=async(alert:OperatorAlert)=>{setBusy(true);try{const result=await acknowledgeAlert(alert.id);setAlerts(items=>items.map(item=>item.id===result.id?result:item));setSelected(result)}finally{setBusy(false)}};
 return <main className="mx-auto max-w-[1800px] p-4 sm:p-6 xl:p-8"><PageHeader eyebrow={t.operations.incidents} title={t.common.alerts} description={t.operations.alertsDescription}/><AdvancedDataTable data={alerts} columns={columns} searchPlaceholder={t.operations.searchIncidents} isLoading={loading} error={failed} onRetry={()=>void load()} onRowClick={setSelected}/><DetailDrawer open={!!selected} onClose={()=>setSelected(null)} title={t.operations.alertDetails}>{selected&&<div><div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-300/10 text-amber-300"><ShieldAlert size={20}/></div><div className="mt-5"><StatusBadge status={selected.severity}/><h3 className="mt-3 text-xl font-semibold text-slate-900 dark:text-white">{selected.title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{selected.message??t.operations.noAdditionalContext}</p></div><div className="mt-5 space-y-2">{[[t.operations.target,selected.track?.callsign??t.operations.unlinked],[t.operations.status,selected.state],[t.operations.created,new Date(selected.created_at).toLocaleString()],[t.operations.assignedTo,selected.acknowledged_by?.name??t.operations.unassigned]].map(([k,v])=><div key={k} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-white/[.06] dark:bg-white/[.025]"><span className="text-[10px] uppercase tracking-wider text-slate-600">{k}</span><strong className="text-xs text-slate-700 dark:text-slate-300">{v}</strong></div>)}</div>{selected.state==="active"&&<Button variant="primary" className="mt-5 w-full" disabled={busy} onClick={()=>void acknowledge(selected)}><Check size={15}/>{busy?t.operations.acknowledging:t.operations.acknowledge}</Button>}</div>}</DetailDrawer></main>;
}
