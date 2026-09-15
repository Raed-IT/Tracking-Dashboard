"use client";

import { useState, type FormEvent } from "react";
import { Check, KeyRound, Mail, Shield, UserRound } from "lucide-react";

import { createOrganizationUser, updateOrganizationUser } from "@/services/api";
import type { OrganizationUser, Role } from "@/types/auth";
import { Button } from "@/components/ui/Button";

const roles: Array<{ value: Role; label: string; description: string }> = [
  { value: "administrator", label: "Administrator", description: "Full access to users, sources, and operations." },
  { value: "supervisor", label: "Supervisor", description: "Manage operations, alerts, geofences, and layouts." },
  { value: "operator", label: "Operator", description: "Monitor tracks and respond to operational alerts." },
  { value: "viewer", label: "Viewer", description: "Read-only situational awareness." },
];

type Draft = { name: string; email: string; password: string; role: Role };

export function UserForm({
  user,
  onSaved,
  onCancel,
}: {
  user?: OrganizationUser;
  onSaved: (saved: OrganizationUser) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<Draft>({
    name: user?.name ?? "",
    email: user?.email ?? "",
    password: "",
    role: user?.role ?? "viewer",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const selectedRole = roles.find((role) => role.value === draft.role) ?? roles[3];

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const saved = user
        ? await updateOrganizationUser(user.id, {
            name: draft.name,
            email: draft.email,
            role: draft.role,
            ...(draft.password ? { password: draft.password } : {}),
          })
        : await createOrganizationUser(draft);
      onSaved(saved);
    } catch {
      setError("Could not save this user. Check the fields and try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-7">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300"><UserRound size={14} className="text-cyan-400" />Full name</span>
          <input className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10 dark:border-white/10 dark:bg-slate-950/60 dark:text-white" required value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
        </label>
        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300"><Mail size={14} className="text-cyan-400" />Email address</span>
          <input className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10 dark:border-white/10 dark:bg-slate-950/60 dark:text-white" type="email" required value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} />
        </label>
      </div>

      <label className="block">
        <span className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300"><KeyRound size={14} className="text-cyan-400" />{user ? "New password" : "Temporary password"}{user && <em className="font-normal text-slate-500">(optional)</em>}</span>
        <input className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10 dark:border-white/10 dark:bg-slate-950/60 dark:text-white" type="password" required={!user} minLength={10} placeholder={user ? "Leave blank to keep the current password" : "At least 10 characters"} value={draft.password} onChange={(event) => setDraft({ ...draft, password: event.target.value })} />
      </label>

      <fieldset>
        <legend className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300"><Shield size={14} className="text-cyan-400" />Access role</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {roles.map((role) => (
            <label key={role.value} className={`relative cursor-pointer rounded-xl border p-4 transition ${draft.role === role.value ? "border-cyan-400 bg-cyan-400/10 shadow-lg shadow-cyan-500/5" : "border-slate-200 bg-slate-50 hover:border-cyan-400/40 dark:border-white/10 dark:bg-white/[.03]"}`}>
              <input className="sr-only" type="radio" name="role" value={role.value} checked={draft.role === role.value} onChange={() => setDraft({ ...draft, role: role.value })} />
              <span className="flex items-center justify-between text-sm font-semibold text-slate-900 dark:text-white">{role.label}{draft.role === role.value && <Check size={16} className="text-cyan-400" />}</span>
              <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">{role.description}</span>
            </label>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-500">Selected role: <strong className="text-slate-700 dark:text-slate-300">{selectedRole.label}</strong></p>
      </fieldset>

      {error && <p className="rounded-xl border border-rose-400/20 bg-rose-400/5 p-3 text-sm text-rose-500">{error}</p>}
      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 dark:border-white/[.07] sm:flex-row sm:justify-end">
        <Button type="button" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="primary" disabled={busy}>{busy ? "Saving..." : user ? "Save changes" : "Create user"}</Button>
      </div>
    </form>
  );
}
