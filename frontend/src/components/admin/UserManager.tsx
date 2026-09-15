"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Plus, Shield, Trash2, UserCog } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { deleteOrganizationUser, fetchOrganizationUsers } from "@/services/api";
import type { OrganizationUser, Role } from "@/types/auth";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/Button";
import { AdvancedDataTable, type DataColumn } from "@/components/ui/AdvancedDataTable";
import { PageHeader } from "@/components/ui/Page";

const roles: Array<{ value: Role; label: string; description: string }> = [
  { value: "administrator", label: "Administrators", description: "Full platform access." },
  { value: "supervisor", label: "Supervisors", description: "Manage operational workflows." },
  { value: "operator", label: "Operators", description: "Monitor and respond to alerts." },
  { value: "viewer", label: "Viewers", description: "Read-only access." },
];

export function UserManager() {
  const router = useRouter();
  const current = useAuthStore((state) => state.user);
  const [users, setUsers] = useState<OrganizationUser[]>([]);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setUsers(await fetchOrganizationUsers({ perPage: 100 }));
    } catch {
      setError("Unable to load organization users.");
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const remove = async (user: OrganizationUser) => {
    if (!confirm(`Remove ${user.name} from this organization?`)) return;
    try {
      await deleteOrganizationUser(user.id);
      await load();
    } catch {
      setError("This account could not be removed.");
    }
  };

  const columns: DataColumn<OrganizationUser>[] = [
    { id: "operator", header: "User", cell: (user) => <div className="flex items-center gap-3"><i className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-300/10 text-xs font-bold text-cyan-600 dark:text-cyan-300 not-italic">{user.name.slice(0, 2).toUpperCase()}</i><span><strong className="block text-sm text-slate-800 dark:text-slate-200">{user.name}</strong><small className="text-xs text-slate-500">{user.email}</small></span></div>, sortValue: (user) => user.name, priority: true },
    { id: "role", header: "Role", cell: (user) => <span className="rounded-full bg-cyan-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-300">{user.role}</span>, sortValue: (user) => user.role },
    { id: "created", header: "Added", cell: (user) => new Date(user.created_at).toLocaleDateString(), sortValue: (user) => user.created_at },
    { id: "actions", header: "Actions", cell: (user) => <span className="flex gap-2"><Link href={`/admin/users/${user.id}/edit`} onClick={(event) => event.stopPropagation()}><Button size="sm">Edit</Button></Link><Button size="sm" variant="danger" disabled={user.id === current?.id} onClick={(event) => { event.stopPropagation(); void remove(user); }}><Trash2 size={14} /></Button></span> },
  ];

  return (
    <main className="mx-auto max-w-[1400px] p-4 sm:p-6 xl:p-8">
      <PageHeader eyebrow="Access control" title="Users" description={`Manage ${current?.organization?.name ?? "your organization"} members and their access roles.`} actions={<Link href="/admin/users/create"><Button variant="primary"><Plus size={16} />Add user</Button></Link>} />
      <section className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{roles.map((role) => <article key={role.value} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/[.07] dark:bg-slate-900/70"><div className="flex items-start justify-between"><div className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-400/10 text-cyan-500"><Shield size={17} /></div><strong className="text-xl text-slate-900 dark:text-white">{users.filter((user) => user.role === role.value).length}</strong></div><div className="mt-4 text-xs font-semibold text-slate-800 dark:text-slate-200">{role.label}</div><p className="mt-1 text-[11px] leading-5 text-slate-500">{role.description}</p></article>)}</section>
      {error && <div className="mb-4 rounded-xl border border-rose-400/20 bg-rose-400/5 p-3 text-sm text-rose-500">{error}</div>}
      <section><div className="mb-3 flex items-center gap-3"><UserCog size={18} className="text-cyan-500" /><div><h2 className="text-sm font-semibold text-slate-900 dark:text-white">Organization members</h2><p className="text-xs text-slate-500">{users.length} active account{users.length === 1 ? "" : "s"}</p></div><ArrowRight size={15} className="ml-auto text-slate-400" /></div><AdvancedDataTable data={users} columns={columns} searchPlaceholder="Search by name, email, or role" onRowClick={(user) => router.push(`/admin/users/${user.id}/edit`)} /></section>
    </main>
  );
}
