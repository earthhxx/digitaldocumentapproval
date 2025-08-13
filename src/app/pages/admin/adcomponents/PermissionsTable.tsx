import { useState } from "react";
import { Permission as BasePermission } from "../types";

type Permission = Omit<BasePermission, "PermissionID"> & { PermissionID: number | string };

type Props = { permissions: Permission[] };

export default function PermissionsTable({ permissions }: Props) {
    const [editablePermissions, setEditablePermissions] = useState<Permission[]>(permissions);
    const [savingId, setSavingId] = useState<number | string | null>(null);
    const [newCounter, setNewCounter] = useState(0); // counter สำหรับ row ใหม่

    const handleChange = (id: number | string, field: keyof Permission, value: string) => {
        setEditablePermissions(prev =>
            prev.map(p => (p.PermissionID === id ? { ...p, [field]: value } : p))
        );
    };

    const savePermission = async (perm: Permission) => {
        const isNew = typeof perm.PermissionID === "string" && perm.PermissionID.startsWith("new-");
        setSavingId(perm.PermissionID);
        try {
            const res = await fetch(isNew ? `/api/permissions` : `/api/permissions/${perm.PermissionID}`, {
                method: isNew ? "POST" : "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(perm),
            });
            if (!res.ok) throw new Error("Failed to save");

            if (isNew) {
                const data = await res.json();
                setEditablePermissions(prev =>
                    prev.map(p => (p.PermissionID === perm.PermissionID ? { ...p, PermissionID: data.PermissionID } : p))
                );
            }
        } catch (err) {
            console.error(err);
            alert("Save failed");
        } finally {
            setSavingId(null);
        }
    };

    const handleBlur = (perm: Permission) => savePermission(perm);
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, perm: Permission) => {
        if (e.key === "Enter") e.currentTarget.blur();
    };

    const addPermission = () => {
        const tempId = `new-${newCounter}`;
        setNewCounter(prev => prev + 1);
        setEditablePermissions(prev => [
            ...prev,
            { PermissionID: tempId as any, PermissionName: "", Description: "" }
        ]);
    };

    return (
        <div>
            <h2 className="font-bold text-lg mb-2 flex justify-between items-center">
                Permissions
                <button
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={addPermission}
                >
                    Add Permission
                </button>
            </h2>
            <table className="w-full border border-gray-300">
                <thead>
                    <tr className="bg-gray-100 text-black">
                        <th className="p-2 border">ID</th>
                        <th className="p-2 border">Name</th>
                        <th className="p-2 border">Description</th>
                        <th className="p-2 border">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {editablePermissions.map((p) => (
                        <tr key={p.PermissionID}>
                            <td className="p-2 border">{typeof p.PermissionID === "string" ? "New" : p.PermissionID}</td>
                            <td className="p-2 border">
                                <input
                                    className="w-full p-1 border rounded"
                                    value={p.PermissionName}
                                    onChange={e => handleChange(p.PermissionID, "PermissionName", e.target.value)}
                                    onBlur={() => handleBlur(p)}
                                    onKeyDown={e => handleKeyDown(e, p)}
                                    disabled={savingId === p.PermissionID}
                                />
                            </td>
                            <td className="p-2 border">
                                <input
                                    className="w-full p-1 border rounded"
                                    value={p.Description || ""}
                                    onChange={e => handleChange(p.PermissionID, "Description", e.target.value)}
                                    onBlur={() => handleBlur(p)}
                                    onKeyDown={e => handleKeyDown(e, p)}
                                    disabled={savingId === p.PermissionID}
                                />
                            </td>
                            <td className="p-2 border text-center">
                                {savingId === p.PermissionID ? (
                                    <span className="text-sm text-blue-500">Saving...</span>
                                ) : typeof p.PermissionID === "string" ? (
                                    <span className="text-sm text-yellow-500">New</span>
                                ) : (
                                    <span className="text-sm text-green-500">Saved</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
