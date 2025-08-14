"use client";

import { useEffect, useState } from "react";
import { Permission, Role, User, UserRole, RolePermission } from "./types";
import PermissionsTable from "./adcomponents/PermissionsTable";
import RolesTable from "./adcomponents/RolesTable";
import UsersTable from "./adcomponents/UsersTable";
import UserRolesTable from "./adcomponents/UserRolesTable";
import RolePermissionsTable from "./adcomponents/RolePermissionsTable";

type ComponentType = "Permissions" | "Roles" | "Users" | "UserRoles" | "RolePermissions";

export default function AdminAccessPage() {
    const [selected, setSelected] = useState<ComponentType>("Permissions");
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [userRoles, setUserRoles] = useState<UserRole[]>([]);
    const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function fetchData(component: ComponentType) {
        setLoading(true);
        setError(null);
        try {
            switch (component) {
                case "Permissions":
                    const permRes = await fetch("/api/permissions").then(r => r.json());
                    setPermissions(permRes.data ?? []);
                    break;
                case "Roles":
                    const roleRes = await fetch("/api/roles").then(r => r.json());
                    setRoles(roleRes.data ?? []);
                    break;
                case "Users":
                    const userRes = await fetch("/api/users").then(r => r.json());
                    setUsers(userRes.data ?? []);
                    break;
                case "UserRoles":
                    const userRoleRes = await fetch("/api/user-roles").then(r => r.json());
                    setUserRoles(userRoleRes.data ?? []);
                    break;
                case "RolePermissions":
                    const rolePermRes = await fetch("/api/role-permissions").then(r => r.json());
                    setRolePermissions(rolePermRes.data ?? []);
                    break;
            }
        } catch (err: any) {
            setError(err.message || "Error fetching data");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData(selected);
    }, [selected]);

    return (
        <div className="p-4 font-mono text-white bg-black min-h-screen">
            <div className="flex items-center gap-3 mb-4">
                <span className="font-bold">Select Component:</span>
                <select
                    className="bg-black text-white border border-white px-2 py-1"
                    value={selected}
                    onChange={e => setSelected(e.target.value as ComponentType)}
                >
                    <option value="Permissions">Permissions</option>
                    <option value="Roles">Roles</option>
                    <option value="Users">Users</option>
                    <option value="UserRoles">UserRoles</option>
                    <option value="RolePermissions">RolePermissions</option>
                </select>
            </div>

            {loading && <div>Loading {selected}...</div>}
            {error && <div className="text-red-500">{error}</div>}

            {!loading && !error && (
                <div className="space-y-4">
                    {selected === "Permissions" && <PermissionsTable permissions={permissions} />}
                    {selected === "Roles" && <RolesTable roles={roles} />}
                    {selected === "Users" && <UsersTable users={users} />}
                    {selected === "UserRoles" && <UserRolesTable userRoles={userRoles} />}
                    {selected === "RolePermissions" && <RolePermissionsTable rolePermissions={rolePermissions} />}
                </div>
            )}
        </div>
    );
}
