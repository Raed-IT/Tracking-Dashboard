import axios from "axios"; import type {DataSource,Track} from "@/types/tracking";
export const api=axios.create({baseURL:process.env.NEXT_PUBLIC_API_URL??"http://localhost/api/v1",headers:{Accept:"application/json"}});
api.interceptors.request.use(c=>{if(typeof window!=="undefined"){const t=localStorage.getItem("token");if(t)c.headers.Authorization=`Bearer ${t}`;}return c});
export async function fetchTracks(bbox:string):Promise<Track[]>{const {data}=await api.get<{data:Track[]}>("/tracks",{params:{bbox,per_page:500}});return data.data}
export async function fetchSources():Promise<DataSource[]>{const {data}=await api.get<{data:DataSource[]}>("/sources");return data.data}
