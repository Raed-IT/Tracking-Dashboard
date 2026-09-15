"use client";
import {AuthGate} from "@/components/auth/AuthGate";
import {OperationsDrawer} from "@/components/navigation/OperationsDrawer";
import {Database,Radio,UserRound,type LucideIcon} from "lucide-react";
import {useAuthStore} from "@/stores/auth-store";
import {useAppPreferences} from "@/components/providers/AppPreferences";
export default function SettingsPage(){
 const user=useAuthStore(s=>s.user);
 const {alertVolume,setAlertVolume}=useAppPreferences();
 const cards:{icon:LucideIcon;label:string;title:string;detail:string}[]=[
  {icon:UserRound,label:"ACCESS ROLE",title:user?.role??"—",detail:"Current account permissions"},
  {icon:UserRound,label:"SIGNED IN AS",title:user?.name??"—",detail:user?.email??"—"},
  {icon:Database,label:"PRIMARY STORAGE",title:"MySQL 8.4",detail:"Durable operational history"},
  {icon:Radio,label:"LIVE SERVICES",title:"Redis + Reverb",detail:"Queue and realtime transport"}
 ];
 return <AuthGate><OperationsDrawer><main className="mx-auto max-w-[1200px] p-4 sm:p-6 xl:p-8"><div className="mb-8"><span className="text-[10px] font-bold uppercase tracking-[.2em] text-cyan-600 dark:text-cyan-300">PLATFORM CONFIGURATION</span><h1 className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">Settings</h1><p className="mt-2 text-sm text-slate-500">Identity and service configuration.</p></div><section className="grid gap-3 sm:grid-cols-2">{cards.map(({icon:Icon,label,title,detail})=><article key={label} className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/[.07] dark:bg-slate-900/70"><Icon size={19} className="text-cyan-600 dark:text-cyan-300"/><div className="mt-5 text-[10px] font-bold tracking-[.16em] text-slate-500 dark:text-slate-600">{label}</div><strong className="mt-1 block text-lg text-slate-900 dark:text-white">{title}</strong><p className="mt-1 text-xs text-slate-500">{detail}</p><i className="absolute right-5 top-5 h-2 w-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-300/30"/></article>)}<article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/[.07] dark:bg-slate-900/70"><div className="text-[10px] font-bold tracking-[.16em] text-slate-500 dark:text-slate-600">ALERT SOUND</div><label className="mt-3 block text-sm font-medium text-slate-900 dark:text-white" htmlFor="alert-volume">Volume: {Math.round(alertVolume*100)}%</label><input id="alert-volume" className="mt-4 w-full accent-cyan-400" type="range" min="0" max="1" step="0.05" value={alertVolume} onChange={event=>setAlertVolume(Number(event.target.value))}/><p className="mt-2 text-xs text-slate-500">Choose the volume for new realtime alerts. Set to 0 to mute.</p></article></section></main></OperationsDrawer></AuthGate>
}
