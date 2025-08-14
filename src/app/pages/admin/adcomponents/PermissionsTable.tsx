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

    const delPer = async (id: number | string) => {
        if (!confirm("Are you sure you want to delete this permission?")) return;

        const res = await fetch("/api/delPermissions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ PermissionID: id })
        });

        if (res.ok) {
            setItems(prev => prev.filter(p => p.PermissionID !== id));
        } else {
            alert("Failed to delete permission");
        }
    };



    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold">Permissions</h2>

            {/* CMD Style Floating Form */}
            <div className="fixed bottom-4 right-4 w-80 border border-white bg-black text-white font-mono p-4 rounded-lg shadow-lg">
                <div className="text-sm font-bold mb-2">
                    Add New Permission
                </div>

                <input
                    className="w-full p-2 mb-2 bg-black text-white border border-white rounded-none outline-none focus:border-green-400"
                    placeholder="Permission Name"
                    value={form.PermissionName}
                    onChange={e => setForm({ ...form, PermissionName: e.target.value })}
                />
                <input
                    className="w-full p-2 mb-3 bg-black text-white border border-white rounded-none outline-none focus:border-green-400"
                    placeholder="Description"
                    value={form.Description}
                    onChange={e => setForm({ ...form, Description: e.target.value })}
                />
                <button
                    className="w-full py-2 bg-white text-black border border-white hover:bg-gray-300 transition-colors font-bold"
                    onClick={saveNewPer}
                >
                    [ Add ]
                </button>
            </div>



            {/* List */}
            <div className="space-y-3">
                <table className="w-full border-collapse font-mono text-sm">
                    <thead>
                        <tr className="bg-black text-white">
                            <th className="border border-gray-500 px-3 py-1 text-left">ID</th>
                            <th className="border border-gray-500 px-3 py-1 text-left">Permission Name</th>
                            <th className="border border-gray-500 px-3 py-1 text-left">Description</th>
                            <th className="border border-gray-500 px-3 py-1 text-left">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((p) => (
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
        </div>
    );
}
