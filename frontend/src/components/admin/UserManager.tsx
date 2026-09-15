"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Plus, Shield, Trash2, UserCog } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { deleteUser, fetchRoleDefinitions, fetchUsersPage } from "@/services/api";
import type { Role, RoleDefinition, UserRecord } from "@/types/auth";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/Button";
import { AdvancedDataTable, type DataColumn } from "@/components/ui/AdvancedDataTable";
import { PageHeader } from "@/components/ui/Page";
import { useNoticeStore } from "@/stores/notice-store";

export function UserManager() {
  const router = useRouter();
  const current = useAuthStore((state) => state.user);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<Role | "">("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState<"name" | "email" | "role" | "created_at">("name");
  const [direction, setDirection] = useState<"asc" | "desc">("asc");
  const showNotice = useNoticeStore((state) => state.show);

  const load = useCallback(async () => {
    try {
      setError("");
      setLoading(true);
      const result = await fetchUsersPage({ search: query, role: role || undefined, page, perPage: pageSize, sort, direction });
      setUsers(result.users);
      setTotal(result.total);
    } catch {
      const message = "Unable to load users. Check the selected filters and try again.";
      setError(message);
      showNotice("error", message);
    } finally {
      setLoading(false);
    }
  }, [direction, page, pageSize, query, role, showNotice, sort]);

  useEffect(() => { void load(); void fetchRoleDefinitions().then(setRoles).catch(() => setError("Unable to load roles.")); }, [load]);

  const remove = async (user: UserRecord) => {
    if (!confirm(`Delete ${user.name}?`)) return;
    try {
      await deleteUser(user.id);
      showNotice("success", `${user.name} was removed successfully.`);
      await load();
    } catch {
      const message = "This account could not be removed.";
      setError(message);
      showNotice("error", message);
    }
  };

  const columns: DataColumn<UserRecord>[] = [
    { id: "operator", header: "User", cell: (user) => <div className="flex items-center gap-3"><i className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-300/10 text-xs font-bold text-cyan-600 dark:text-cyan-300 not-italic">{user.name.slice(0, 2).toUpperCase()}</i><span><strong className="block text-sm text-slate-800 dark:text-slate-200">{user.name}</strong><small className="text-xs text-slate-500">{user.email}</small></span></div>, sortValue: (user) => user.name, priority: true },
    { id: "role", header: "Role", cell: (user) => <span className="rounded-full bg-cyan-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-300">{user.role}</span>, sortValue: (user) => user.role },
    { id: "created_at", header: "Added", cell: (user) => new Date(user.created_at).toLocaleDateString(), sortValue: (user) => user.created_at },
    { id: "actions", header: "Actions", cell: (user) => <span className="flex gap-2"><Link href={`/admin/users/${user.id}/edit`} onClick={(event) => event.stopPropagation()}><Button size="sm">Edit</Button></Link><Button size="sm" variant="danger" disabled={user.id === current?.id} onClick={(event) => { event.stopPropagation(); void remove(user); }}><Trash2 size={14} /></Button></span> },
  ];

  return (
    <main className="mx-auto max-w-[1400px] p-4 sm:p-6 xl:p-8">
      <PageHeader eyebrow="Access control" title="Users" description="Manage accounts and their access roles." actions={<Link href="/admin/users/create"><Button variant="primary"><Plus size={16} />Add user</Button></Link>} />
      <section className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{roles.map((role) => <article key={role.value} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/[.07] dark:bg-slate-900/70"><div className="flex items-start justify-between"><div className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-400/10 text-cyan-500"><Shield size={17} /></div><strong className="text-xl text-slate-900 dark:text-white">{users.filter((user) => user.role === role.value).length}</strong></div><div className="mt-4 text-xs font-semibold text-slate-800 dark:text-slate-200">{role.label}</div><p className="mt-1 text-[11px] leading-5 text-slate-500">{role.description}</p></article>)}</section>
      {error && <div className="mb-4 rounded-xl border border-rose-400/20 bg-rose-400/5 p-3 text-sm text-rose-500">{error}</div>}
      <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/80 shadow-xl shadow-slate-200/30 dark:border-white/[.07] dark:bg-slate-900/70 dark:shadow-black/20"><div className="border-b border-slate-200/80 p-5 dark:border-white/[.06]"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-500"><UserCog size={18} /></div><div><h2 className="text-base font-semibold text-slate-900 dark:text-white">Users</h2><p className="text-xs text-slate-500">{total} active account{total === 1 ? "" : "s"} · Search, filter, sort, and manage access</p></div><ArrowRight size={15} className="ml-auto text-slate-400" /></div><div className="mt-4 flex flex-wrap items-center gap-2"><label className="text-xs font-medium text-slate-500">Role <select value={role} onChange={(event) => { setRole(event.target.value as Role | ""); setPage(1); }} className="ml-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 outline-none focus:border-cyan-400 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-200"><option value="">All roles</option>{roles.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>{role && <span className="rounded-full bg-cyan-400/10 px-3 py-1.5 text-[11px] font-semibold text-cyan-700 dark:text-cyan-300">Filtered: {roles.find((item) => item.value === role)?.label}</span>}<button type="button" className="rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-500 transition hover:border-cyan-400/50 hover:text-slate-800 dark:border-white/10 dark:hover:text-white" onClick={() => { setRole(""); setQuery(""); setPage(1); }}>Reset filters</button></div></div><AdvancedDataTable data={users} columns={columns} searchPlaceholder="Search by name, email, or role" onQueryChange={(value) => { setQuery(value); setPage(1); }} serverSide total={total} externalPage={page} externalPageSize={pageSize} onPageChange={setPage} onPageSizeChange={(value) => { setPageSize(value); setPage(1); }} onSortChange={(id, nextDirection) => { if (id === "operator") setSort("name"); else if (id === "created_at") setSort("created_at"); else if (id === "role" || id === "email") setSort(id); setDirection(nextDirection); setPage(1); }} onRowClick={(user) => router.push(`/admin/users/${user.id}/edit`)} isLoading={loading} error={Boolean(error)} onRetry={() => void load()} /></section>
    </main>
  );
}
