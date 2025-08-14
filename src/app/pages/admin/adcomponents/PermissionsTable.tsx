"use client";
import { useState, useEffect } from "react";
import { Permission } from "../types";

type Props = { permissions: Permission[] };

export default function PermissionsList({ permissions }: Props) {
    const [items, setItems] = useState<Permission[]>(permissions);
    const [form, setForm] = useState({ PermissionName: "", Description: "" });

    // Confirm add/delete
    const [confirm, setConfirm] = useState<{ visible: boolean; type: "add" | "delete" | null; id?: number | string }>({
        visible: false,
        type: null,
    });

    const [choice, setChoice] = useState<"Yes" | "No">("Yes");

    // --- ADD ---
    const triggerAddConfirm = () => {
        if (!form.PermissionName.trim()) return;
        setConfirm({ visible: true, type: "add" });
        setChoice("Yes");
    };

    const confirmAddPermission = async () => {
        const res = await fetch("/api/addPermissions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });

        const newPermission: Permission = await res.json();
        setItems(prev => [...prev, newPermission]);
        setForm({ PermissionName: "", Description: "" });
        setConfirm({ visible: false, type: "add" });
    };

    // --- DELETE ---
    const delPer = (id: number | string) => {
        setConfirm({ visible: true, type: "delete", id });
        setChoice("Yes");
    };

    const confirmDelete = async (id: number | string) => {
        const res = await fetch("/api/delPermissions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ PermissionID: id }),
        });

        if (res.ok) setItems(prev => prev.filter(p => p.PermissionID !== id));
        else alert("Failed to delete permission");

        setConfirm({ visible: false, type: "delete" });
    };

    // --- keyboard ---
    const handleKey = (e: KeyboardEvent) => {
        if (!confirm.visible) return;

        if (e.key === "ArrowUp" || e.key === "ArrowDown") setChoice(prev => (prev === "Yes" ? "No" : "Yes"));
        if (e.key === "Enter") {
            if (choice === "Yes") {
                if (confirm.type === "add") confirmAddPermission();
                if (confirm.type === "delete" && confirm.id !== undefined) confirmDelete(confirm.id);
            } else setConfirm({ visible: false, type: confirm.type });
        }
        if (e.key === "Escape") setConfirm({ visible: false, type: confirm.type });
    };

    useEffect(() => {
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [confirm.visible, choice]);

    return (
        <div className="flex flex-col justify-start items-start w-full mx-auto space-y-6 font-mono text-white bg-black min-h-screen p-4">

            <h2 className="text-2xl font-bold">Permissions</h2>



            {/* List */}
            <div className="space-y-3 w-[65%]">
                <table className="w-full border-collapse font-mono text-sm">
                    <thead>
                        <tr className="bg-black text-white">
                            <th className="border border-gray-500 px-3 py-1 w-[5%] text-left">ID</th>
                            <th className="border border-gray-500 px-3 py-1 w-[20%] text-left">Permission Name</th>
                            <th className="border border-gray-500 px-3 py-1 text-left">Description</th>
                            <th className="border border-gray-500 px-3 py-1 w-[5%] text-left">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(p => (
                            <tr key={p.PermissionID} className="hover:bg-white/10">
                                <td className="border border-gray-500 px-3 py-1">{p.PermissionID}</td>
                                <td className="border border-gray-500 px-3 py-1">{p.PermissionName}</td>
                                <td className="border border-gray-500 px-3 py-1">{p.Description || "-"}</td>
                                <td className="flex justify-center border border-gray-500 px-3 py-1">
                                    <button
                                        onClick={() => delPer(p.PermissionID)}
                                        className="px-2 py-1 bg-white text-black hover:bg-red-800"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* CMD Style Floating Form */}
            <div className="fixed flex flex-col right-0 bottom-100 w-[30%] border border-white bg-black text-white p-4 rounded-lg shadow-lg">
                <div className="text-sm font-bold mb-2">Add New Permission</div>

                <input
                    className="w-full p-2 mb-2 bg-black text-white border border-white outline-none"
                    placeholder="Permission Name"
                    value={form.PermissionName}
                    onChange={e => setForm({ ...form, PermissionName: e.target.value })}
                    onKeyDown={e => { if (e.key === "Enter") triggerAddConfirm(); }}
                />
                <input
                    className="w-full p-2 mb-3 bg-black text-white border border-white outline-none"
                    placeholder="Description"
                    value={form.Description}
                    onChange={e => setForm({ ...form, Description: e.target.value })}
                    onKeyDown={e => { if (e.key === "Enter") triggerAddConfirm(); }}
                />
                <button className="w-full py-2 bg-white text-black hover:bg-gray-300" onClick={triggerAddConfirm}>
                    [ Enter ]
                </button>
            </div>

            {/* Confirm card */}
            {confirm.visible && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
                    <div className="bg-black text-white border border-white rounded-lg p-5 w-80">
                        <div className="mb-3">
                            {confirm.type === "add"
                                ? `Add new permission "${form.PermissionName}"?`
                                : "Are you sure you want to delete?"}
                        </div>
                        <div className="flex flex-col gap-2">
                            <div
                                className={`px-3 py-1 border cursor-pointer ${choice === "Yes" ? "bg-white text-black" : ""}`}
                                onClick={() => {
                                    setChoice("Yes");
                                    if (confirm.type === "add") confirmAddPermission();
                                    if (confirm.type === "delete" && confirm.id !== undefined) confirmDelete(confirm.id);
                                }}
                            >
                                Yes
                            </div>
                            <div
                                className={`px-3 py-1 border cursor-pointer ${choice === "No" ? "bg-white text-black" : ""}`}
                                onClick={() => setConfirm({ visible: false, type: confirm.type })}
                            >
                                No
                            </div>
                        </div>
                        <div className="mt-3 text-xs text-gray-400">
                            Use ↑ ↓ to select, Enter to confirm or click
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
