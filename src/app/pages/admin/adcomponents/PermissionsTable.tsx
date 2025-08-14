import { useState } from "react";
import { Permission } from "../types";

type Props = { permissions: Permission[] };

export default function PermissionsList({ permissions }: Props) {
    const [items, setItems] = useState<Permission[]>(permissions);
    const [form, setForm] = useState({ PermissionName: "", Description: "" });

    const saveNewPer = async () => {
        const res = await fetch("/api/addPermissions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form)
        });

        const newPermission: Permission = await res.json(); // object เดียว
        setItems(prev => [...prev, newPermission]);
        setForm({ PermissionName: "", Description: "" });
    };



    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold">Permissions</h2>

            {/* Add Form */}
            <div className="p-5 border rounded-2xl bg-white shadow-sm space-y-3">
                <div className="text-lg font-medium flex items-center gap-2 text-green-600">
                    Add New Permission
                </div>

                <input
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
                    placeholder="Permission Name"
                    value={form.PermissionName}
                    onChange={e => setForm({ ...form, PermissionName: e.target.value })}
                />
                <input
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
                    placeholder="Description"
                    value={form.Description}
                    onChange={e => setForm({ ...form, Description: e.target.value })}
                />
                <button
                    className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    onClick={saveNewPer}
                >
                    Add Permission
                </button>
            </div>

            {/* List */}
            <div className="space-y-3">
                {items.map(p => (
                    <div
                        key={p.PermissionID}
                        className="p-4 border rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <div className="font-semibold text-gray-800">{p.PermissionName}</div>
                                {p.Description && (
                                    <p className="text-sm text-gray-500 mt-1">{p.Description}</p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
