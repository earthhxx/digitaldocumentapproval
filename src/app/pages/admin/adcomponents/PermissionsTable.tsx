import { useState } from "react";
import { Permission as BasePermission } from "../types";
import { Plus, CheckCircle, Loader2, AlertCircle } from "lucide-react";

type Permission = Omit<BasePermission, "PermissionID"> & { PermissionID: number | string };

type Props = { permissions: Permission[] };

export default function PermissionsList({ permissions }: Props) {
    const [items, setItems] = useState<Permission[]>(permissions);
    const [savingId, setSavingId] = useState<number | string | null>(null);
    const [form, setForm] = useState({ PermissionName: "", Description: "" });

    const handleChangeForm = (field: keyof typeof form, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const savePermission = async (perm: Permission, isNew: boolean) => {
        setSavingId(perm.PermissionID);
        try {
            const res = await fetch(
                isNew ? `/api/permissions` : `/api/permissions/${perm.PermissionID}`,
                {
                    method: isNew ? "POST" : "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(perm),
                }
            );
            if (!res.ok) throw new Error("Save failed");

            if (isNew) {
                const data = await res.json();
                setItems(prev =>
                    prev.map(p =>
                        p.PermissionID === perm.PermissionID
                            ? { ...p, PermissionID: data.PermissionID }
                            : p
                    )
                );
            }
        } catch (err) {
            console.error(err);
            alert("Save failed");
        } finally {
            setSavingId(null);
        }
    };

    const addPermission = async () => {
        if (!form.PermissionName.trim()) return;
        const tempId = `new-${Date.now()}`;
        const newPerm: Permission = {
            PermissionID: tempId,
            PermissionName: form.PermissionName,
            Description: form.Description,
        };
        setItems(prev => [...prev, newPerm]);
        setForm({ PermissionName: "", Description: "" });
        await savePermission(newPerm, true);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold">Permissions</h2>

            {/* Add Form */}
            <div className="p-5 border rounded-2xl bg-white shadow-sm space-y-3">
                <div className="text-lg font-medium flex items-center gap-2 text-green-600">
                    <Plus className="w-5 h-5 " /> Add New Permission
                </div>

                <input
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
                    placeholder="Permission Name"
                    value={form.PermissionName}
                    onChange={e => handleChangeForm("PermissionName", e.target.value)}
                />
                <input
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
                    placeholder="Description"
                    value={form.Description}
                    onChange={e => handleChangeForm("Description", e.target.value)}
                />
                <button
                    className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                    onClick={addPermission}
                >
                    <Plus className="w-4 h-4" /> Add Permission
                </button>
            </div>

            {/* Existing Permissions */}
            <div className="space-y-3">
                {items.map(p => {
                    const isNew = typeof p.PermissionID === "string";
                    const isSaving = savingId === p.PermissionID;
                    return (
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
                                <div className="flex items-center gap-1 text-sm">
                                    {isSaving ? (
                                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                                    ) : isNew ? (
                                        <>
                                            <AlertCircle className="w-4 h-4 text-yellow-500" />
                                            <span className="text-yellow-600">New</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            <span className="text-green-600">Saved</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
