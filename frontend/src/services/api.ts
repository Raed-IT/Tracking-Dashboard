import axios from "axios"; import type {DataSource,OperatorAlert,Track} from "@/types/tracking";import type {AuthenticatedUser,OrganizationUser,Role} from "@/types/auth";
export const api=axios.create({baseURL:process.env.NEXT_PUBLIC_API_URL??"http://localhost/api/v1",headers:{Accept:"application/json"}});
api.interceptors.request.use(c=>{if(typeof window!=="undefined"){const t=localStorage.getItem("token");if(t)c.headers.Authorization=`Bearer ${t}`;}return c});
export async function fetchTracks(bbox:string):Promise<Track[]>{const {data}=await api.get<{data:Track[]}>("/tracks",{params:{bbox,per_page:500}});return data.data}
export async function fetchSources():Promise<DataSource[]>{const {data}=await api.get<{data:DataSource[]}>("/sources");return data.data}
export async function login(email:string,password:string):Promise<{token:string;user:AuthenticatedUser}>{const {data}=await api.post<{token:string;user:AuthenticatedUser}>("/auth/login",{email,password});return data}
export async function logout():Promise<void>{await api.post("/auth/logout")}
export async function fetchAuthenticatedUser():Promise<AuthenticatedUser>{const {data}=await api.get<{data:AuthenticatedUser}>("/auth/user");return data.data}
export async function fetchOrganizationUsers():Promise<OrganizationUser[]>{const {data}=await api.get<{data:OrganizationUser[]}>("/organization/users");return data.data}
export async function createOrganizationUser(input:{name:string;email:string;password:string;role:Role}):Promise<OrganizationUser>{const {data}=await api.post<{data:OrganizationUser}>("/organization/users",input);return data.data}
export async function updateOrganizationUser(id:string,input:{name:string;email:string;password?:string;role:Role}):Promise<OrganizationUser>{const {data}=await api.put<{data:OrganizationUser}>(`/organization/users/${id}`,input);return data.data}
export async function deleteOrganizationUser(id:string):Promise<void>{await api.delete(`/organization/users/${id}`)}
export async function fetchAlerts():Promise<OperatorAlert[]>{const {data}=await api.get<{data:OperatorAlert[]}>("/alerts",{params:{state:"active"}});return data.data}
export async function acknowledgeAlert(id:string):Promise<OperatorAlert>{const {data}=await api.post<{data:OperatorAlert}>(`/alerts/${id}/acknowledge`);return data.data}
