"use client";

import {useEffect, useMemo, useState} from "react";
import {fetchAlerts, fetchSources} from "@/services/api";
import {useTrackingStore} from "@/stores/tracking-store";
import type {DataSource, OperatorAlert} from "@/types/tracking";

/** Controller for dashboard-only presentation data and actions. */
export function useDashboardController(){
  const [sources,setSources]=useState<DataSource[]>([]);
  const [alerts,setAlerts]=useState<OperatorAlert[]>([]);
  const [now,setNow]=useState(new Date());
  const tracks=useTrackingStore(s=>s.tracks);

  useEffect(()=>{
    void Promise.all([fetchSources(),fetchAlerts()])
      .then(([nextSources,nextAlerts])=>{setSources(nextSources);setAlerts(nextAlerts)})
      .catch(()=>undefined);
    const clock=window.setInterval(()=>setNow(new Date()),1000);
    return()=>window.clearInterval(clock);
  },[]);

  const metrics=useMemo(()=>({
    tracks:tracks.size,
    sources:sources.filter(source=>source.status==="online").length,
    alerts:alerts.length,
  }),[alerts.length,sources,tracks]);

  return {sources,alerts,setAlerts,now,metrics};
}
