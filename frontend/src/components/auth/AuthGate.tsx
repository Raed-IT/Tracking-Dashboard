"use client";
import {useEffect} from "react";
import {useRouter} from "next/navigation";
import {RadioTower} from "lucide-react";
import {useAuthStore} from "@/stores/auth-store";
export function AuthGate({children}:{children:React.ReactNode}){const router=useRouter(),user=useAuthStore(s=>s.user),initialized=useAuthStore(s=>s.initialized),initialize=useAuthStore(s=>s.initialize);useEffect(()=>{void initialize()},[initialize]);useEffect(()=>{if(initialized&&!user)router.replace("/login")},[initialized,user,router]);if(!initialized||!user)return <main className="grid min-h-screen place-items-center bg-slate-950"><div className="flex flex-col items-center gap-4 text-center"><div className="grid h-12 w-12 place-items-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-300 animate-pulse"><RadioTower size={20}/></div><div className="text-[10px] font-bold uppercase tracking-[.2em] text-slate-500">Validating secure session</div></div></main>;return <>{children}</>;}
