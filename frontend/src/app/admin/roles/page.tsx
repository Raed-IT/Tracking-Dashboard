"use client";

import { useEffect, useState } from "react";
import { Check, Minus, Save, ShieldCheck } from "lucide-react";

import { AuthGate } from "@/components/auth/AuthGate";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { OperationsDrawer } from "@/components/navigation/OperationsDrawer";
import { fetchRolePolicy, updateRolePermissions } from "@/services/api";
import type { Permission, PermissionDefinition, RoleDefinition } from "@/types/auth";
import { useNoticeStore } from "@/stores/notice-store";

export default function RolesPage() {
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [permissionDefinitions, setPermissionDefinitions] = useState<PermissionDefinition[]>([]);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const showNotice = useNoticeStore((state) => state.show);

  useEffect(() => {
    void fetchRolePolicy()
      .then(({ roles: definitions, permissions }) => {
        setRoles(definitions);
        setPermissionDefinitions(permissions);
      })
      .catch(() => setError(true));
  }, []);

  const togglePermission = (roleValue: RoleDefinition["value"], permission: Permission) => {
    setRoles((current) => current.map((role) => role.value !== roleValue ? role : {
      ...role,
      permissions: role.permissions.includes(permission)
        ? role.permissions.filter((value) => value !== permission)
        : [...role.permissions, permission],
    }));
    setSaved(null);
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

  const permissions = permissionDefinitions.length > 0
    ? permissionDefinitions
    : Array.from(new Set(roles.flatMap((role) => role.permissions))).map((value) => ({
        value,
        label: value,
        description: "",
        category: "Access",
      }));

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
                Review the capability boundaries applied to every organization
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
                    <p className="mt-1 text-xs text-slate-500">Granted capabilities</p>
                  </article>
                ))}
              </section>
            )}

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
