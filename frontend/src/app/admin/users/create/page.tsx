"use client";

import { UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

import { AuthGate } from "@/components/auth/AuthGate";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { OperationsDrawer } from "@/components/navigation/OperationsDrawer";
import { UserForm } from "@/components/admin/UserForm";
import { PageHeader } from "@/components/ui/Page";

export default function CreateUserPage() {
  const router = useRouter();
  return <AuthGate><OperationsDrawer><PermissionGate permission="users.manage"><main className="mx-auto max-w-4xl p-4 sm:p-6 xl:p-8"><PageHeader eyebrow="Access control / New member" title="Create user" description="Add a member to your organization and assign the access they need." /><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/[.07] dark:bg-slate-900/70 sm:p-8"><div className="mb-7 flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-400/10 text-cyan-400"><UserPlus size={19} /></div><div><h2 className="font-semibold text-slate-900 dark:text-white">Account details</h2><p className="text-xs text-slate-500">The user can sign in immediately after creation.</p></div></div><UserForm onSaved={() => router.push("/admin/users")} onCancel={() => router.push("/admin/users")} /></section></main></PermissionGate></OperationsDrawer></AuthGate>;
}
