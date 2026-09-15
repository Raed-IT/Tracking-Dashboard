"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, ShieldCheck, Trash2 } from "lucide-react";

import { AuthGate } from "@/components/auth/AuthGate";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { OperationsDrawer } from "@/components/navigation/OperationsDrawer";
import { Button } from "@/components/ui/Button";
import {
  createRoleDefinition,
  deleteRoleDefinition,
  fetchRolePolicy,
  updateRoleDefinition,
} from "@/services/api";
import type { Permission, PermissionDefinition, RoleDefinition } from "@/types/auth";
import { useNoticeStore } from "@/stores/notice-store";

type Draft = {
  name: string;
  description: string;
  permissions: Permission[];
};

const emptyDraft: Draft = {
  name: "",
  description: "",
  permissions: [],
};

export default function RolesPage() {
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [permissionDefinitions, setPermissionDefinitions] = useState<PermissionDefinition[]>([]);
  const [selectedRole, setSelectedRole] = useState<RoleDefinition | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [busy, setBusy] = useState(false);
  const showNotice = useNoticeStore((state) => state.show);

  const permissionGroups = useMemo(
    () =>
      permissionDefinitions.reduce<Record<string, PermissionDefinition[]>>((groups, permission) => {
        const key = permission.category;
        groups[key] ??= [];
        groups[key].push(permission);
        return groups;
      }, {}),
    [permissionDefinitions],
  );

  const loadRoles = async () => {
    try {
      const { roles: nextRoles, permissions } = await fetchRolePolicy();
      setRoles(nextRoles);
      setPermissionDefinitions(permissions);
      if (nextRoles.length > 0 && !selectedRole) {
        setSelectedRole(nextRoles[0]);
        setDraft({
          name: nextRoles[0].label,
          description: nextRoles[0].description ?? "",
          permissions: nextRoles[0].permissions,
        });
      }
    } catch {
      showNotice("error", "Could not load role definitions.");
    }
  };

  useEffect(() => {
    void loadRoles();
  }, []);

  const selectRole = (role: RoleDefinition) => {
    setSelectedRole(role);
    setDraft({
      name: role.label,
      description: role.description ?? "",
      permissions: role.permissions,
    });
  };

  const togglePermission = (permission: Permission) => {
    setDraft((current) => ({
      ...current,
      permissions: current.permissions.includes(permission)
        ? current.permissions.filter((value) => value !== permission)
        : [...current.permissions, permission],
    }));
  };

  const saveRole = async () => {
    if (!draft.name.trim()) {
      showNotice("error", "Role name is required.");
      return;
    }

    setBusy(true);
    try {
      if (selectedRole && !selectedRole.is_system) {
        const nextRoles = await updateRoleDefinition(selectedRole.value, {
          name: draft.name,
          description: draft.description || undefined,
          permissions: draft.permissions,
        });
        setRoles(nextRoles);
        const updated = nextRoles.find((role) => role.value === selectedRole.value) ?? nextRoles[0];
        if (updated) {
          setSelectedRole(updated);
          setDraft({
            name: updated.label,
            description: updated.description ?? "",
            permissions: updated.permissions,
          });
        }
        showNotice("success", "Role updated successfully.");
        return;
      }

      if (selectedRole && selectedRole.is_system) {
        const nextRoles = await updateRoleDefinition(selectedRole.value, {
          description: draft.description || undefined,
          permissions: draft.permissions,
        });
        setRoles(nextRoles);
        const updated = nextRoles.find((role) => role.value === selectedRole.value) ?? nextRoles[0];
        if (updated) {
          setSelectedRole(updated);
          setDraft({
            name: updated.label,
            description: updated.description ?? "",
            permissions: updated.permissions,
          });
        }
        showNotice("success", "Role permissions updated.");
        return;
      }

      const nextRoles = await createRoleDefinition({
        name: draft.name,
        description: draft.description || undefined,
        permissions: draft.permissions,
      });
      setRoles(nextRoles);
      const created = nextRoles.find((role) => role.label === draft.name) ?? nextRoles[0];
      if (created) {
        selectRole(created);
      }
      showNotice("success", "Role created successfully.");
    } catch {
      showNotice("error", "Could not save the role definition.");
    } finally {
      setBusy(false);
    }
  };

  const deleteCurrentRole = async () => {
    if (!selectedRole || selectedRole.is_system) {
      return;
    }

    setBusy(true);
    try {
      const nextRoles = await deleteRoleDefinition(selectedRole.value);
      setRoles(nextRoles);
      const fallback = nextRoles[0];
      if (fallback) {
        selectRole(fallback);
      } else {
        setSelectedRole(null);
        setDraft(emptyDraft);
      }
      showNotice("success", "Role deleted.");
    } catch {
      showNotice("error", "Could not delete this role.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthGate>
      <OperationsDrawer>
        <PermissionGate permission="users.manage" fallback={<main className="grid min-h-[70vh] place-items-center p-6 text-center"><div><h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Access denied</h1><p className="mt-2 text-sm text-slate-500">Administrator permission is required.</p></div></main>}>
          <main className="mx-auto max-w-7xl p-4 sm:p-6 xl:p-8">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-500">Access control</p>
                <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">Roles</h1>
              </div>
              <Button variant="primary" onClick={() => { setSelectedRole(null); setDraft(emptyDraft); }}>
                <Plus size={16} />
                New role
              </Button>
            </div>

            <div className="grid gap-6 xl:grid-cols-[330px_minmax(0,1fr)]">
              <aside className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/[.07] dark:bg-slate-900/70">
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  <ShieldCheck size={16} className="text-cyan-500" />
                  Role library
                </div>
                <div className="space-y-3">
                  {roles.map((role) => (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => selectRole(role)}
                      className={`w-full rounded-2xl border p-3 text-left transition ${selectedRole?.value === role.value ? "border-cyan-400 bg-cyan-400/10" : "border-slate-200 bg-slate-50 hover:border-cyan-400/40 dark:border-white/[.07] dark:bg-white/[0.02]"}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium text-slate-900 dark:text-white">{role.label}</span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:bg-white/[.05] dark:text-slate-300">
                          {role.is_system ? "System" : "Custom"}
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-slate-500">{role.permissions.length} permissions</div>
                    </button>
                  ))}
                </div>
              </aside>

              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/[.07] dark:bg-slate-900/70 sm:p-6">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{selectedRole ? (selectedRole.is_system ? "System role" : "Custom role") : "Create role"}</p>
                    <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">{selectedRole ? selectedRole.label : "New access role"}</h2>
                  </div>
                  {!selectedRole || !selectedRole.is_system ? (
                    <Button variant="danger" size="sm" onClick={deleteCurrentRole} disabled={!selectedRole || busy}>
                      <Trash2 size={14} />Delete
                    </Button>
                  ) : null}
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Role name</span>
                    <input
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10 dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
                      value={draft.name}
                      onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                      disabled={Boolean(selectedRole && selectedRole.is_system)}
                      placeholder="Operations lead"
                    />
                  </label>

                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Description</span>
                    <textarea
                      className="min-h-[90px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10 dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
                      value={draft.description}
                      onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
                      placeholder="Describe the role purpose."
                    />
                  </label>
                </div>

                <div className="mt-8">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Permissions</h3>
                  <div className="mt-4 space-y-6">
                    {Object.entries(permissionGroups).map(([category, permissions]) => (
                      <div key={category}>
                        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{category}</p>
                        <div className="grid gap-3 md:grid-cols-2">
                          {permissions.map((permission) => {
                            const isChecked = draft.permissions.includes(permission.value);
                            return (
                              <label
                                key={permission.value}
                                className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3 transition ${isChecked ? "border-cyan-400 bg-cyan-400/10" : "border-slate-200 bg-slate-50 hover:border-cyan-400/40 dark:border-white/[.07] dark:bg-white/[0.02]"}`}
                              >
                                <input
                                  type="checkbox"
                                  className="mt-1 h-4 w-4 rounded border-slate-300 text-cyan-500 focus:ring-cyan-400"
                                  checked={isChecked}
                                  onChange={() => togglePermission(permission.value)}
                                />
                                <span>
                                  <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">{permission.label}</span>
                                  <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">{permission.description}</span>
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-3 border-t border-slate-200 pt-5 dark:border-white/[.07]">
                  <Button type="button" onClick={() => { if (selectedRole) selectRole(selectedRole); else setDraft(emptyDraft); }}>
                    Reset
                  </Button>
                  <Button type="button" variant="primary" onClick={() => void saveRole()} disabled={busy}>
                    {busy ? "Saving..." : selectedRole ? "Save role" : "Create role"}
                  </Button>
                </div>
              </section>
            </div>
          </main>
        </PermissionGate>
      </OperationsDrawer>
    </AuthGate>
  );
}
