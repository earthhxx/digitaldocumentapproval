"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Trash2, Plus, Link as LinkIcon, UserPlus2, ShieldCheck } from "lucide-react";
import ProtectedRoute from "@/app/components/ProtectedRoute";

// ===================== Types =====================
export type Permission = {
    id: number | string;
    name: string;
    description?: string;
};

export type Role = {
    id: number | string;
    name: string;
    description?: string;
    permissions?: Permission[];
};

export type User = {
    id: number | string;
    username: string;
    fullName?: string;
    roles?: Role[];
};

// ===================== Helpers =====================
function clsx(...xs: Array<string | false | null | undefined>) {
    return xs.filter(Boolean).join(" ");
}

const card = "rounded-2xl border border-zinc-200 bg-white shadow-sm p-5";
const input =
    "w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 outline-none focus:ring-4 focus:ring-zinc-200";
const btn =
    "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium shadow-sm disabled:opacity-50";
const btnPrimary =
    "bg-zinc-900 text-white hover:bg-black focus:ring-4 focus:ring-zinc-300";
const btnGhost =
    "bg-white text-zinc-700 ring-1 ring-inset ring-zinc-300 hover:bg-zinc-50";
const label = "text-sm font-medium text-zinc-700";
const sectionTitle = "text-lg font-semibold text-zinc-900 flex items-center gap-2";
const pill = "px-2 py-1 rounded-lg text-xs bg-zinc-100 text-zinc-800";

// ===================== API Endpoints (Adjust to your project) =====================
// You can wire these to your Next.js Route Handlers under /app/api/*
const API = {
    permissions: "/api/permissions",
    roles: "/api/roles",
    rolePermissions: "/api/role-permissions",
    userRoles: "/api/user-roles",
    users: "/api/users", // optional: for user search/list
};

// Minimal fetch helper
async function api<T>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(url, init);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

// ===================== Main Component =====================
export default function AdminAccessPage() {
    // Data state
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [users, setUsers] = useState<User[]>([]); // optional list for selection

    // Form state
    const [permName, setPermName] = useState("");
    const [permDesc, setPermDesc] = useState("");

    const [roleName, setRoleName] = useState("");
    const [roleDesc, setRoleDesc] = useState("");

    const [linkRoleId, setLinkRoleId] = useState<string | number | "">("");
    const [linkPermId, setLinkPermId] = useState<string | number | "">("");

    const [userId, setUserId] = useState<string | number | "">("");
    const [userRoleId, setUserRoleId] = useState<string | number | "">("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initial load
    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const [ps, rs] = await Promise.all([
                    api<Permission[]>(API.permissions),
                    api<Role[]>(API.roles),
                ]);
                setPermissions(ps);
                setRoles(rs);
                // Optional: fetch users if you want a dropdown
                try {
                    const us = await api<User[]>(API.users);
                    setUsers(us);
                } catch (e) {
                    // users endpoint is optional; ignore if 404
                }
            } catch (e: any) {
                setError(e?.message ?? "Failed to load data");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // Derived map for quick lookups
    const roleMap = useMemo(() => new Map(roles.map((r) => [r.id, r])), [roles]);

    // ===================== Create =====================
    async function createPermission() {
        if (!permName.trim()) return;
        setLoading(true);
        setError(null);
        try {
            const created = await api<Permission>(API.permissions, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: permName.trim(), description: permDesc.trim() || undefined }),
            });
            setPermissions((xs) => [created, ...xs]);
            setPermName("");
            setPermDesc("");
        } catch (e: any) {
            setError(e?.message ?? "Failed to add permission");
        } finally {
            setLoading(false);
        }
    }

    async function createRole() {
        if (!roleName.trim()) return;
        setLoading(true);
        setError(null);
        try {
            const created = await api<Role>(API.roles, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: roleName.trim(), description: roleDesc.trim() || undefined }),
            });
            setRoles((xs) => [created, ...xs]);
            setRoleName("");
            setRoleDesc("");
        } catch (e: any) {
            setError(e?.message ?? "Failed to add role");
        } finally {
            setLoading(false);
        }
    }

    // ===================== Link Role ↔ Permission =====================
    async function attachRolePermission() {
        if (!linkRoleId || !linkPermId) return;
        setLoading(true);
        setError(null);
        try {
            const updated = await api<Role>(API.rolePermissions, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roleId: linkRoleId, permissionId: linkPermId }),
            });
            // Upsert role with fresh permissions
            setRoles((xs) => xs.map((r) => (r.id === updated.id ? updated : r)));
            setLinkRoleId("");
            setLinkPermId("");
        } catch (e: any) {
            setError(e?.message ?? "Failed to link role & permission");
        } finally {
            setLoading(false);
        }
    }

    // ===================== Assign User ↔ Role =====================
    async function assignUserRole() {
        if (!userId || !userRoleId) return;
        setLoading(true);
        setError(null);
        try {
            const updated = await api<User>(API.userRoles, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, roleId: userRoleId }),
            });
            setUsers((xs) => xs.length ? xs.map((u) => (u.id === updated.id ? updated : u)) : [updated]);
            setUserId("");
            setUserRoleId("");
        } catch (e: any) {
            setError(e?.message ?? "Failed to assign user role");
        } finally {
            setLoading(false);
        }
    }

    // ===================== Delete =====================
    async function deletePermission(id: Permission["id"]) {
        if (!confirm("Delete this permission?")) return;
        setLoading(true);
        try {
            await api(API.permissions + "/" + id, { method: "DELETE" });
            setPermissions((xs) => xs.filter((x) => x.id !== id));
        } catch (e: any) {
            setError(e?.message ?? "Failed to delete permission");
        } finally {
            setLoading(false);
        }
    }

    async function deleteRole(id: Role["id"]) {
        if (!confirm("Delete this role?")) return;
        setLoading(true);
        try {
            await api(API.roles + "/" + id, { method: "DELETE" });
            setRoles((xs) => xs.filter((x) => x.id !== id));
        } catch (e: any) {
            setError(e?.message ?? "Failed to delete role");
        } finally {
            setLoading(false);
        }
    }

    async function deleteRolePermission(roleId: Role["id"], permissionId: Permission["id"]) {
        setLoading(true);
        try {
            await api(API.rolePermissions, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roleId, permissionId }),
            });
            // Locally remove
            setRoles((xs) =>
                xs.map((r) =>
                    r.id === roleId
                        ? { ...r, permissions: (r.permissions || []).filter((p) => p.id !== permissionId) }
                        : r
                )
            );
        } catch (e: any) {
            setError(e?.message ?? "Failed to delete role-permission");
        } finally {
            setLoading(false);
        }
    }

    async function deleteUserRole(userId: User["id"], roleId: Role["id"]) {
        setLoading(true);
        try {
            await api(API.userRoles, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, roleId }),
            });
            setUsers((xs) =>
                xs.map((u) =>
                    u.id === userId ? { ...u, roles: (u.roles || []).filter((r) => r.id !== roleId) } : u
                )
            );
        } catch (e: any) {
            setError(e?.message ?? "Failed to delete user role");
        } finally {
            setLoading(false);
        }
    }

    // ===================== UI =====================
    return (
        <ProtectedRoute>
            <div className="mx-auto max-w-7xl p-6">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">Admin • Access Control</h1>
                    <div className={clsx(btn, btnGhost)}>
                        <ShieldCheck className="h-4 w-4" /> RBAC Console
                    </div>
                </div>

                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Create Permission */}
                    <section className={card}>
                        <div className={sectionTitle}>
                            <Plus className="h-5 w-5" /> Add Permission
                        </div>
                        <div className="mt-4 space-y-3">
                            <div>
                                <label className={label}>Permission Name</label>
                                <input className={input} placeholder="e.g. view_reports" value={permName} onChange={(e) => setPermName(e.target.value)} />
                            </div>
                            <div>
                                <label className={label}>Description (optional)</label>
                                <textarea className={input} rows={3} placeholder="Human-friendly details" value={permDesc} onChange={(e) => setPermDesc(e.target.value)} />
                            </div>
                            <button disabled={loading} onClick={createPermission} className={clsx(btn, btnPrimary, "w-full justify-center")}>
                                <Plus className="h-4 w-4" /> Create Permission
                            </button>
                        </div>
                    </section>

                    {/* Create Role */}
                    <section className={card}>
                        <div className={sectionTitle}>
                            <Plus className="h-5 w-5" /> Add Role
                        </div>
                        <div className="mt-4 space-y-3">
                            <div>
                                <label className={label}>Role Name</label>
                                <input className={input} placeholder="e.g. admin" value={roleName} onChange={(e) => setRoleName(e.target.value)} />
                            </div>
                            <div>
                                <label className={label}>Description (optional)</label>
                                <textarea className={input} rows={3} placeholder="Purpose of this role" value={roleDesc} onChange={(e) => setRoleDesc(e.target.value)} />
                            </div>
                            <button disabled={loading} onClick={createRole} className={clsx(btn, btnPrimary, "w-full justify-center")}>
                                <Plus className="h-4 w-4" /> Create Role
                            </button>
                        </div>
                    </section>

                    {/* Link Role & Permission */}
                    <section className={card}>
                        <div className={sectionTitle}>
                            <LinkIcon className="h-5 w-5" /> Add Role • Permission
                        </div>
                        <div className="mt-4 grid grid-cols-1 gap-3">
                            <div>
                                <label className={label}>Role</label>
                                <select className={input} value={linkRoleId} onChange={(e) => setLinkRoleId(e.target.value)}>
                                    <option value="">Select role…</option>
                                    {roles.map((r) => (
                                        <option key={r.id} value={String(r.id)}>
                                            {r.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={label}>Permission</label>
                                <select className={input} value={linkPermId} onChange={(e) => setLinkPermId(e.target.value)}>
                                    <option value="">Select permission…</option>
                                    {permissions.map((p) => (
                                        <option key={p.id} value={String(p.id)}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button disabled={loading || !linkRoleId || !linkPermId} onClick={attachRolePermission} className={clsx(btn, btnPrimary, "w-full justify-center")}>
                                <LinkIcon className="h-4 w-4" /> Link to Role
                            </button>
                        </div>
                    </section>
                </div>

                {/* Assign User Role */}
                <section className={clsx(card, "mt-6")}>
                    <div className={sectionTitle}>
                        <UserPlus2 className="h-5 w-5" /> Add User • Role
                    </div>
                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                        <div className="md:col-span-1">
                            <label className={label}>User</label>
                            {users.length ? (
                                <select className={input} value={userId} onChange={(e) => setUserId(e.target.value)}>
                                    <option value="">Select user…</option>
                                    {users.map((u) => (
                                        <option key={u.id} value={String(u.id)}>
                                            {u.fullName || u.username}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input className={input} placeholder="User ID (if no users endpoint)" value={String(userId)} onChange={(e) => setUserId(e.target.value)} />
                            )}
                        </div>
                        <div className="md:col-span-1">
                            <label className={label}>Role</label>
                            <select className={input} value={userRoleId} onChange={(e) => setUserRoleId(e.target.value)}>
                                <option value="">Select role…</option>
                                {roles.map((r) => (
                                    <option key={r.id} value={String(r.id)}>
                                        {r.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-1 flex items-end">
                            <button disabled={loading || !userId || !userRoleId} onClick={assignUserRole} className={clsx(btn, btnPrimary, "w-full justify-center")}>
                                <UserPlus2 className="h-4 w-4" /> Assign Role
                            </button>
                        </div>
                    </div>
                </section>

                {/* Lists */}
                <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Roles w/ permissions */}
                    <section className={card}>
                        <div className="flex items-center justify-between">
                            <h3 className={sectionTitle}>Roles</h3>
                        </div>
                        <div className="mt-4 divide-y text-sm">
                            {roles.length === 0 && <div className="py-8 text-center text-zinc-500">No roles</div>}
                            {roles.map((r) => (
                                <div key={r.id} className="py-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <div className="font-medium">{r.name}</div>
                                            {r.description && <div className="text-zinc-500">{r.description}</div>}
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {(r.permissions || []).map((p) => (
                                                    <span key={p.id} className={pill}>
                                                        {p.name}
                                                        <button
                                                            title="Remove from role"
                                                            className="ml-2 inline-flex items-center"
                                                            onClick={() => deleteRolePermission(r.id, p.id)}
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    </span>
                                                ))}
                                                {(r.permissions || []).length === 0 && (
                                                    <span className="text-xs text-zinc-500">No permissions</span>
                                                )}
                                            </div>
                                        </div>
                                        <button title="Delete role" onClick={() => deleteRole(r.id)} className={clsx(btn, btnGhost)}>
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Permissions */}
                    <section className={card}>
                        <div className="flex items-center justify-between">
                            <h3 className={sectionTitle}>Permissions</h3>
                        </div>
                        <div className="mt-4 divide-y text-sm">
                            {permissions.length === 0 && <div className="py-8 text-center text-zinc-500">No permissions</div>}
                            {permissions.map((p) => (
                                <div key={p.id} className="flex items-center justify-between py-3">
                                    <div>
                                        <div className="font-medium">{p.name}</div>
                                        {p.description && <div className="text-zinc-500">{p.description}</div>}
                                    </div>
                                    <button title="Delete permission" onClick={() => deletePermission(p.id)} className={clsx(btn, btnGhost)}>
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Users and their roles (optional) */}
                {!!users.length && (
                    <section className={clsx(card, "mt-6")}>
                        <h3 className={sectionTitle}>Users</h3>
                        <div className="mt-4 divide-y text-sm">
                            {users.map((u) => (
                                <div key={u.id} className="py-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <div className="font-medium">{u.fullName || u.username}</div>
                                            <div className="text-xs text-zinc-500">ID: {String(u.id)}</div>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {(u.roles || []).map((r) => (
                                                    <span key={r.id} className={pill}>
                                                        {r.name}
                                                        <button
                                                            title="Remove role"
                                                            className="ml-2 inline-flex items-center"
                                                            onClick={() => deleteUserRole(u.id, r.id)}
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    </span>
                                                ))}
                                                {(u.roles || []).length === 0 && (
                                                    <span className="text-xs text-zinc-500">No roles</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Footer */}
                <div className="mt-10 text-center text-xs text-zinc-500">
                    Tip: Wire to your APIs under <code>/app/api/*</code>. This page is UI-only.
                </div>
            </div>
        </ProtectedRoute>
    );
}
