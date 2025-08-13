"use client";

import { useEffect, useState } from "react";

// ===================== Types =====================
export type Permission = {
    PermissionID: number;
    PermissionName: string;
    Description?: string;
};

export type Role = {
    RoleID: number;
    RoleName: string;
    Description?: string;
};

export type User = {
    User_id: number;
    Name: string;
    CreateDate: string;
};

export type UserRole = {
    id: number;
    User_id: number;
    Role: string;
};

export type RolePermission = {
    id: number;
    Role: string;
    Permission: string;
};

// ===================== Main Component =====================
export default function AdminAccessPage() {
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [userRoles, setUserRoles] = useState<UserRole[]>([]);
    const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function fetchAllData() {
        try {
            setLoading(true);
            const [permRes, roleRes, userRes, userRoleRes, rolePermRes] = await Promise.all([
                fetch("/api/permissions").then((r) => r.json()),
                fetch("/api/roles").then((r) => r.json()),
                fetch("/api/users").then((r) => r.json()),
                fetch("/api/user-roles").then((r) => r.json()),
                fetch("/api/role-permissions").then((r) => r.json()),
            ]);

            setPermissions(permRes.data ?? []);
            setRoles(roleRes.data ?? []);
            setUsers(userRes.data ?? []);
            setUserRoles(userRoleRes.data ?? []);
            setRolePermissions(rolePermRes.data ?? []);
        } catch (err: any) {
            setError(err.message || "Error loading data");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchAllData();
    }, []);

    if (loading) return <div className="p-4">Loading...</div>;
    if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

    return (
        <div className="p-4 space-y-8">
            {/* Permissions Table */}
            <div>
                <h2 className="font-bold text-lg mb-2">Permissions</h2>
                <table className="w-full border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-2 border">ID</th>
                            <th className="p-2 border">Name</th>
                            <th className="p-2 border">Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {permissions.map((p, i) => (
                            <tr key={`${p.PermissionID} -${i}`}>
                                <td className="p-2 border">{p.PermissionID}</td>
                                <td className="p-2 border">{p.PermissionName}</td>
                                <td className="p-2 border">{p.Description}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Roles Table */}
            <div>
                <h2 className="font-bold text-lg mb-2">Roles</h2>
                <table className="w-full border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-2 border">ID</th>
                            <th className="p-2 border">Name</th>
                            <th className="p-2 border">Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {roles.map((r, i) => (
                            <tr key={`${r.RoleID}-${i}`}>
                                <td className="p-2 border">{r.RoleID}</td>
                                <td className="p-2 border">{r.RoleName}</td>
                                <td className="p-2 border">{r.Description}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Users Table */}
            <div>
                <h2 className="font-bold text-lg mb-2">Users</h2>
                <table className="w-full border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-2 border">User ID</th>
                            <th className="p-2 border">Name</th>
                            <th className="p-2 border">Created Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u, i) => (
                            <tr key={`${u.User_id}-${i}`}>
                                <td className="p-2 border">{u.User_id}</td>
                                <td className="p-2 border">{u.Name}</td>
                                <td className="p-2 border">{u.CreateDate}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* User Roles Table */}
            <div>
                <h2 className="font-bold text-lg mb-2">User Roles</h2>
                <table className="w-full border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-2 border">ID</th>
                            <th className="p-2 border">User ID</th>
                            <th className="p-2 border">Role</th>
                        </tr>
                    </thead>
                    <tbody>
                        {userRoles.map((ur, i) => (
                            <tr key={`${ur.id}-${i}`}>
                                <td className="p-2 border">{ur.id}</td>
                                <td className="p-2 border">{ur.User_id}</td>
                                <td className="p-2 border">{ur.Role}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Role Permissions Table */}
            <div>
                <h2 className="font-bold text-lg mb-2">Role Permissions</h2>
                <table className="w-full border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-2 border">ID</th>
                            <th className="p-2 border">Role</th>
                            <th className="p-2 border">Permission</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rolePermissions.map((rp, i) => (
                            <tr key={`${rp.id}-${i}`}>
                                <td className="p-2 border">{rp.id}</td>
                                <td className="p-2 border">{rp.Role}</td>
                                <td className="p-2 border">{rp.Permission}</td>
                            </tr>
                        ))}
                    </tbody>

                </table>
            </div>
        </div>
    );
}
