"use client";
import type {Permission} from "@/types/auth";import {useAuthStore} from "@/stores/auth-store";
export function PermissionGate({permission,children,fallback=null}:{permission:Permission;children:React.ReactNode;fallback?:React.ReactNode}){return useAuthStore(s=>s.can(permission))?<>{children}</>:<>{fallback}</>}
