export type Role = "administrator" | "supervisor" | "operator" | "viewer";
export type Permission = "tracks.view" | "sources.view" | "sources.manage" | "alerts.view" | "alerts.manage" | "geofences.view" | "geofences.manage" | "dashboard.view" | "dashboard.manage" | "users.manage";
export interface AuthenticatedUser {id:string;name:string;email:string;organization:{id:string;name:string;slug:string}|null;role:Role|null;permissions:Permission[]}
export interface OrganizationUser {id:string;name:string;email:string;role:Role;created_at:string}
