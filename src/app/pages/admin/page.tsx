"use client";

import { useState, useRef, useEffect } from "react";
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

    const options: ComponentType[] = ["Permissions", "Roles", "Users", "UserRoles", "RolePermissions"];

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

    // focus dropdown เมื่อเปิด
    useEffect(() => {
        if (dropdownOpen && dropdownRef.current) {
            dropdownRef.current.focus();
        }
    }, [dropdownOpen]);

    // ปิดเมื่อคลิกนอก
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        }
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
                    <div ref={dropdownRef} tabIndex={0} onKeyDown={handleKey} className="relative">
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
                                        onMouseDown={() => {
                                            setSelected(opt);
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

                <div className="space-y-4">
                    {selected === "Permissions" && <PermissionsTable />}
                    {selected === "Roles" && <RolesTable />}
                    {selected === "Users" && <UsersTable />}
                    {selected === "UserRoles" && <UserRolesTable />}
                    {/* {selected === "RolePermissions" && <RolePermissionsTable />} */}
                </div>
            </div>
        </ProtectedRoute>
    );
}
