"use client";

import { useEffect, useState } from "react";
import { Permission, Role, User, UserRole, RolePermission } from "./types";
import PermissionsTable from "./adcomponents/PermissionsTable";
import RolesTable from "./adcomponents/RolesTable";
import UsersTable from "./adcomponents/UsersTable";
import UserRolesTable from "./adcomponents/UserRolesTable";
import RolePermissionsTable from "./adcomponents/RolePermissionsTable";

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
                fetch("/api/permissions").then(r => r.json()),
                fetch("/api/roles").then(r => r.json()),
                fetch("/api/users").then(r => r.json()),
                fetch("/api/user-roles").then(r => r.json()),
                fetch("/api/role-permissions").then(r => r.json()),
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
        <div className="p-4 space-y-8 mt-[5%]">
            <PermissionsTable permissions={permissions} />
            <RolesTable roles={roles} />
            <UsersTable users={users} />
            <UserRolesTable userRoles={userRoles} />
            <RolePermissionsTable rolePermissions={rolePermissions} />
        </div>
    );
}
