"use client";

import { useEffect, useState } from "react";
import { UserRoundCog } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { AuthGate } from "@/components/auth/AuthGate";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { OperationsDrawer } from "@/components/navigation/OperationsDrawer";
import { UserForm } from "@/components/admin/UserForm";
import { PageHeader } from "@/components/ui/Page";
import { fetchOrganizationUsers } from "@/services/api";
import type { OrganizationUser } from "@/types/auth";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [user, setUser] = useState<OrganizationUser>();
  const [error, setError] = useState("");

  useEffect(() => {
    void fetchOrganizationUsers({ perPage: 100 }).then((users) => {
      const match = users.find((item) => item.id === params.id);
      if (match) setUser(match);
      else setError("This organization user could not be found.");
    }).catch(() => setError("Unable to load this user."));
  }, [params.id]);

  return <AuthGate><OperationsDrawer><PermissionGate permission="users.manage"><main className="mx-auto max-w-4xl p-4 sm:p-6 xl:p-8"><PageHeader eyebrow="Access control / Edit member" title={user ? `Modify ${user.name}` : "Modify user"} description="Update profile details, password, or access role." /><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/[.07] dark:bg-slate-900/70 sm:p-8">{error ? <p className="rounded-xl border border-rose-400/20 bg-rose-400/5 p-4 text-sm text-rose-500">{error}</p> : user ? <><div className="mb-7 flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-400/10 text-cyan-400"><UserRoundCog size={19} /></div><div><h2 className="font-semibold text-slate-900 dark:text-white">Account settings</h2><p className="text-xs text-slate-500">Role changes take effect on the user&apos;s next request.</p></div></div><UserForm user={user} onSaved={() => router.push("/admin/users")} onCancel={() => router.push("/admin/users")} /></> : <p className="text-sm text-slate-500">Loading user...</p>}</section></main></PermissionGate></OperationsDrawer></AuthGate>;
}
