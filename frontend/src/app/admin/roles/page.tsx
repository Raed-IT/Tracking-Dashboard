"use client";

import { useEffect, useState } from "react";
import { Check, Minus, ShieldCheck } from "lucide-react";

import { AuthGate } from "@/components/auth/AuthGate";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { OperationsDrawer } from "@/components/navigation/OperationsDrawer";
import { fetchRoleDefinitions } from "@/services/api";
import type { RoleDefinition } from "@/types/auth";

export default function RolesPage() {
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    void fetchRoleDefinitions()
      .then(setRoles)
      .catch(() => setError(true));
  }, []);

  const permissions = Array.from(
    new Set(roles.flatMap((role) => role.permissions)),
  );

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
                      <strong key={role.value} className="text-center">
                        {role.label}
                      </strong>
                    ))}
                  </div>
                  {permissions.map((permission) => (
                    <div
                      key={permission}
                      className="grid grid-cols-[1.7fr_repeat(4,1fr)] items-center border-b border-slate-100 px-5 py-3.5 last:border-0 dark:border-white/[.04]"
                    >
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {permission}
                      </span>
                      {roles.map((role) => (
                        <span
                          key={role.value}
                          className="mx-auto grid h-7 w-7 place-items-center rounded-lg"
                        >
                          {role.permissions.includes(permission) ? (
                            <Check className="text-emerald-500 dark:text-emerald-300" size={15} />
                          ) : (
                            <Minus className="text-slate-300 dark:text-slate-700" size={15} />
                          )}
                        </span>
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
                Permissions are defined by the backend role policy. Changing a
                user role immediately revokes that user’s active API tokens.
              </p>
            </aside>
          </main>
        </PermissionGate>
      </OperationsDrawer>
    </AuthGate>
  );
}
