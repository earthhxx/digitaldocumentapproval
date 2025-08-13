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

export type Roles = {
    id: number | string;
    name: string;
    description?: string;
    permissions?: Permission[];
};

export type User = {
    id: number | string;
    User_id: string;
    Name: string;
    CreateDate: string; // or use Date if you prefer: CreateDate: Date;
};

export type user_roles = {
    id: number | string;
    User_id: string;
    role: string;
}

export type role_permission = {
    role: string;
    permission: string;
}

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
    const [roles, setRoles] = useState<Roles[]>([]);
    const [users, setUsers] = useState<User[]>([]); // optional list for selection
    const [userRoles, setUserRole] = useState<user_roles[]>([])
    const [rolesPer, setrolesPer] = useState<role_permission[]>([])


    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initial load
    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const [perm, roles, users, userRoles, rolePer] = await Promise.all([
                    api<Permission[]>(API.permissions),
                    api<Roles[]>(API.roles),
                    api<User[]>(API.users),
                    api<user_roles[]>(API.userRoles),
                    api<role_permission[]>(API.rolePermissions),
                ]);
                setPermissions(perm);
                setRoles(roles);
                setUsers(users);
                setUserRole(userRoles);
                setrolesPer(rolePer);
            } catch (e: any) {
                setError(e?.message ?? "Failed to load data");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    useEffect(() => {
        console.log(permissions, 'per')
        console.log(roles, 'roles')
        console.log(users, 'user')
        console.log(userRoles, 'userroles')
        console.log(rolesPer, 'roleper')
    }, [rolesPer]);

    return (
        <ProtectedRoute>
            <div>

            </div>
        </ProtectedRoute >
    );
}
