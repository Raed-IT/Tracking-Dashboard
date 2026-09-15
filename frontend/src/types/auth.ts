export type Role = "administrator" | "superadmin" | "supervisor" | "operator" | "viewer" | (string & {});
export type Permission = "tracks.view" | "sources.view" | "sources.manage" | "alerts.view" | "alerts.manage" | "geofences.view" | "geofences.manage" | "dashboard.view" | "dashboard.manage" | "users.manage";
export interface PermissionDefinition {value:Permission;label:string;description:string;category:string}
export interface RoleDefinition {id?: string | number; value:Role; label:string; permissions:Permission[]; description?: string; is_system?: boolean}
export interface AuthenticatedUser {id:string;name:string;email:string;role:Role|null;permissions:Permission[]}
export interface UserRecord {id:string;name:string;email:string;role:Role;created_at:string}
