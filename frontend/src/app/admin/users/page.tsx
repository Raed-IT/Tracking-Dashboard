"use client";
import {AuthGate} from "@/components/auth/AuthGate";
import {PermissionGate} from "@/components/auth/PermissionGate";
import {OperationsDrawer} from "@/components/navigation/OperationsDrawer";
import {UserManager} from "@/components/admin/UserManager";
import Link from "next/link";
export default function UsersPage(){return <AuthGate><OperationsDrawer><PermissionGate permission="users.manage" fallback={<main className="grid min-h-[70vh] place-items-center p-6 text-center"><div><h1 className="text-2xl font-semibold text-white">Access denied</h1><p className="mt-2 text-sm text-slate-500">Administrator permission is required.</p><Link className="mt-4 inline-block text-sm text-cyan-300" href="/">Return to operations</Link></div></main>}><UserManager/></PermissionGate></OperationsDrawer></AuthGate>}
