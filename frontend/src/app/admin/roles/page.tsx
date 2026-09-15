"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Check, Minus, Plus, Save, ShieldCheck, Trash2 } from "lucide-react";

import { AuthGate } from "@/components/auth/AuthGate";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { OperationsDrawer } from "@/components/navigation/OperationsDrawer";
import {
  createRoleDefinition,
  deleteRoleDefinition,
  fetchRolePolicy,
  updateRolePermissions,
} from "@/services/api";
import type { Permission, PermissionDefinition, RoleDefinition } from "@/types/auth";
import { useNoticeStore } from "@/stores/notice-store";

export default function RolesPage() {
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [permissionDefinitions, setPermissionDefinitions] = useState<PermissionDefinition[]>([]);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftDescription, setDraftDescription] = useState("");
  const [draftPermissions, setDraftPermissions] = useState<Permission[]>(["dashboard.view", "tracks.view"]);
  const showNotice = useNoticeStore((state) => state.show);

  useEffect(() => {
    void fetchRolePolicy()
      .then(({ roles: definitions, permissions }) => {
        setRoles(definitions);
        setPermissionDefinitions(permissions);
      })
      .catch(() => setError(true));
  }, []);

  const permissions = useMemo(
    () => permissionDefinitions.length > 0
      ? permissionDefinitions
      : Array.from(new Set(roles.flatMap((role) => role.permissions))).map((value) => ({
          value,
          label: value,
          description: "",
          category: "Access",
        })),
    [permissionDefinitions, roles],
  );

  const togglePermission = (roleValue: RoleDefinition["value"], permission: Permission) => {
    setRoles((current) => current.map((role) => role.value !== roleValue ? role : {
      ...role,
      permissions: role.permissions.includes(permission)
        ? role.permissions.filter((value) => value !== permission)
        : [...role.permissions, permission],
    }));
    setSaved(null);
  };

  const toggleDraftPermission = (permission: Permission) => {
    setDraftPermissions((current) => current.includes(permission)
      ? current.filter((value) => value !== permission)
      : [...current, permission]);
  };

  const saveRole = async (role: RoleDefinition) => {
    setSaving(role.value);
    setError(false);
    try {
      const next = await updateRolePermissions(role.value, role.permissions);
      setRoles(next);
      setSaved(role.value);
      showNotice("success", `${role.label} permissions saved successfully.`);
    } catch {
      setError(true);
      showNotice("error", `Unable to save ${role.label} permissions.`);
    } finally {
      setSaving(null);
    }
  };

  const createRole = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = draftName.trim();

    if (!name || draftPermissions.length === 0) {
      showNotice("error", "Provide a role name and at least one permission.");
      return;
    }

    setCreating(true);
    setError(false);

    try {
      const next = await createRoleDefinition({
        name,
        description: draftDescription.trim() || undefined,
        permissions: draftPermissions,
      });
      setRoles(next);
      setDraftName("");
      setDraftDescription("");
      setDraftPermissions(["dashboard.view", "tracks.view"]);
      showNotice("success", `${name} created successfully.`);
    } catch {
      setError(true);
      showNotice("error", "Unable to create the role.");
    } finally {
      setCreating(false);
    }
  };

  const deleteRole = async (role: RoleDefinition) => {
    if (role.is_system) {
      showNotice("error", "Built-in roles cannot be deleted.");
      return;
    }

    try {
      const next = await deleteRoleDefinition(role.value);
      setRoles(next);
      showNotice("success", `${role.label} deleted successfully.`);
    } catch {
      setError(true);
      showNotice("error", `Unable to delete ${role.label}.`);
    }
  };

  return (
    <AuthGate>
      <OperationsDrawer>
        <PermissionGate permission="users.manage">
          <main className="mx-auto max-w-[1400px] p-4 sm:p-6 xl:p-8">
            <div className="mb-7">
              <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.2em] text-cyan-600 dark:text-cyan-300">
                <ShieldCheck size={13} />
                Access policy
              </span>
              <h1 className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">
                Roles & permissions
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Review the capability boundaries applied to every user
                member.
              </p>
            </div>

            {!error && roles.length > 0 && (
              <section className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {roles.map((role) => (
                  <article key={role.value} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/[.07] dark:bg-slate-900/70">
                    <div className="flex items-center justify-between">
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-400/10 text-cyan-500"><ShieldCheck size={17} /></span>
                      <strong className="text-2xl text-slate-900 dark:text-white">{role.permissions.length}</strong>
                    </div>
                    <h2 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">{role.label}</h2>
                    <p className="mt-1 text-xs text-slate-500">{role.is_system ? "Built-in capability set" : "Custom capability set"}</p>
                    {!role.is_system && (
                      <button
                        type="button"
                        onClick={() => void deleteRole(role)}
                        className="mt-3 inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-[10px] font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
                      >
                        <Trash2 size={11} /> Delete
                      </button>
                    )}
                  </article>
                ))}
              </section>
            )}

            <form onSubmit={createRole} className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/[.07] dark:bg-slate-900/70">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-cyan-600 dark:text-cyan-300">
                <Plus size={12} />
                Create role
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-[1.1fr_1.6fr]">
                <label className="block">
                  <span className="mb-2 block text-xs font-medium text-slate-500">Role name</span>
                  <input
                    value={draftName}
                    onChange={(event) => setDraftName(event.target.value)}
                    placeholder="e.g. analyst"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-cyan-400 dark:border-white/[.08] dark:bg-slate-950/80 dark:text-white"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-medium text-slate-500">Description</span>
                  <input
                    value={draftDescription}
                    onChange={(event) => setDraftDescription(event.target.value)}
                    placeholder="Track oversight and alert response"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-cyan-400 dark:border-white/[.08] dark:bg-slate-950/80 dark:text-white"
                  />
                </label>
              </div>
              <div className="mt-4">
                <span className="mb-2 block text-xs font-medium text-slate-500">Permissions</span>
                <div className="flex flex-wrap gap-2">
                  {permissions.map((permission) => (
                    <button
                      key={permission.value}
                      type="button"
                      onClick={() => toggleDraftPermission(permission.value)}
                      className={[
                        "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                        draftPermissions.includes(permission.value)
                          ? "border-cyan-400 bg-cyan-400/10 text-cyan-700 dark:border-cyan-300/40 dark:text-cyan-300"
                          : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 dark:border-white/[.08] dark:bg-slate-950/80 dark:text-slate-300",
                      ].join(" ")}
                    >
                      {permission.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-4 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Plus size={14} />
                  {creating ? "Creating..." : "Create role"}
                </button>
              </div>
            </form>

            {error ? (
              <p className="rounded-xl border border-rose-400/20 p-4 text-sm text-rose-500">
                Unable to load role definitions.
              </p>
            ) : (
              <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/[.07] dark:bg-slate-900/70">
                <div className="min-w-[760px]">
                  <div className="grid grid-cols-[1.7fr_repeat(4,1fr)] border-b border-slate-200 bg-slate-50 px-5 py-4 text-[10px] font-bold uppercase tracking-[.16em] text-slate-500 dark:border-white/[.06] dark:bg-white/[.025]">
                    <strong>Capability</strong>
                    {roles.map((role) => (
                      <div key={role.value} className="text-center">
                        <strong className="block">{role.label}</strong>
                        <button type="button" onClick={() => void saveRole(role)} disabled={saving === role.value} className="mt-2 inline-flex items-center gap-1 rounded-lg bg-cyan-400/10 px-2 py-1 text-[9px] font-semibold normal-case tracking-normal text-cyan-700 hover:bg-cyan-400/20 disabled:opacity-50 dark:text-cyan-300">
                          <Save size={11} />{saving === role.value ? "Saving" : saved === role.value ? "Saved" : "Save"}
                        </button>
                      </div>
                    ))}
                  </div>
                  {permissions.map((permission) => (
                    <div
                      key={permission.value}
                      className="grid grid-cols-[1.7fr_repeat(4,1fr)] items-center border-b border-slate-100 px-5 py-3.5 last:border-0 dark:border-white/[.04]"
                    >
                      <span>
                        <strong className="block text-sm text-slate-700 dark:text-slate-300">{permission.label}</strong>
                        <small className="block max-w-sm text-xs text-slate-500">{permission.description}</small>
                      </span>
                      {roles.map((role) => (
                        <button
                          type="button"
                          aria-label={`Toggle ${permission.label} for ${role.label}`}
                          onClick={() => togglePermission(role.value, permission.value)}
                          key={role.value}
                          className="mx-auto grid h-8 w-8 place-items-center rounded-lg hover:bg-cyan-400/10"
                        >
                          {role.permissions.includes(permission.value) ? (
                            <Check className="text-emerald-500 dark:text-emerald-300" size={15} />
                          ) : (
                            <Minus className="text-slate-300 dark:text-slate-700" size={15} />
                          )}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </section>
            )}

            <aside className="mt-4 rounded-2xl border border-cyan-300/20 bg-cyan-300/[.05] p-5">
              <strong className="text-sm text-slate-800 dark:text-slate-200">
                Security model
              </strong>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Permissions are stored and enforced by the backend. Saving a
                role policy changes access for every member assigned to it on
                their next request.
              </p>
            </aside>
          </main>
        </PermissionGate>
      </OperationsDrawer>
    </AuthGate>
  );
}
