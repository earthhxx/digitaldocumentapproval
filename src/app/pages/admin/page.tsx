"use client";

import { useEffect, useState, useRef } from "react";
import { Permission, Role, User, UserRole, RolePermission } from "./types";
import PermissionsTable from "./adcomponents/PermissionsTable";
import RolesTable from "./adcomponents/RolesTable";
import UsersTable from "./adcomponents/UsersTable";
import UserRolesTable from "./adcomponents/UserRolesTable";
import RolePermissionsTable from "./adcomponents/RolePermissionsTable";
import ProtectedRoute from "@/app/components/ProtectedRoute";

type ComponentType = "Permissions" | "Roles" | "Users" | "UserRoles" | "RolePermissions";

export default function AdminAccessPage() {
    const [selected, setSelected] = useState<ComponentType>("Permissions");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [userRoles, setUserRoles] = useState<UserRole[]>([]);
    const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const options: ComponentType[] = ["Permissions", "Roles", "Users", "UserRoles", "RolePermissions"];

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
        console.log('click')
    }, [selected]);

    // --- keyboard navigation ---
    const handleKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (!dropdownOpen) return;

        if (e.key === "ArrowDown") {
            setHighlightedIndex(prev => (prev + 1) % options.length);
            e.preventDefault();
        }
        if (e.key === "ArrowUp") {
            setHighlightedIndex(prev => (prev - 1 + options.length) % options.length);
            e.preventDefault();
        }
        if (e.key === "Enter") {
            setSelected(options[highlightedIndex]);
            setDropdownOpen(false);
        }
        if (e.key === "Escape") {
            setDropdownOpen(false);
        }
    };


    // เวลา dropdown เปิด → focus
    useEffect(() => {
        if (dropdownOpen && dropdownRef.current) {
            dropdownRef.current.focus();
        }
        else {
            document.body.focus();
        }
    }, [dropdownOpen]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        }

        // listen document
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <ProtectedRoute>
            <div className="p-4 font-mono text-white bg-black min-h-screen mt-20">
                <div className="flex flex-col items-start gap-3 mb-4 relative">
                    <span className="font-bold">Select Component:</span>

                    {/* Custom dropdown */}
                    <div
                        ref={dropdownRef}
                        tabIndex={0} // focus ได้
                        onKeyDown={handleKey}
                        className="relative"
                    >
                        <div
                            className="bg-black text-white border border-white px-2 py-1 cursor-pointer"
                            onClick={() => setDropdownOpen(prev => !prev)}
                        >
                            {selected}
                        </div>

                        {dropdownOpen && (
                            <div className="absolute top-full left-0 w-60 bg-black border border-white mt-1 z-10">
                                {options.map((opt, index) => (
                                    <div
                                        key={opt}
                                        className={`px-2 py-1 cursor-pointer ${index === highlightedIndex ? "bg-white text-black" : "text-white"}`}
                                        onMouseEnter={() => setHighlightedIndex(index)}
                                        onMouseDown={() => { // ใช้ mousedown ป้องกัน click-outside interrupt
                                            setSelected(opt);
                                            console.log('click');
                                            setDropdownOpen(false);
                                        }}
                                    >
                                        {opt}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>


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
        </ProtectedRoute>
    );
}
