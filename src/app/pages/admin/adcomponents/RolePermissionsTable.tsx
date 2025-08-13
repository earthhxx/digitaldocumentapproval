// /admin/adcomponents/RolePermissionsTable.tsx
import { useState } from "react";
import { RolePermission as BaseRolePermission } from "../types";

type RolePermission = Omit<BaseRolePermission, "RoleID"> & { RoleID: number | string; PermissionID: number | string };

type Props = { rolePermissions: RolePermission[] };

export default function RolePermissionsTable({ rolePermissions }: Props) {
    const [editableRolePermissions, setEditableRolePermissions] = useState<RolePermission[]>(rolePermissions);
    const [savingId, setSavingId] = useState<number | string | null>(null);
    const [newCounter, setNewCounter] = useState(0);

    const handleChange = (id: number | string, field: keyof RolePermission, value: string) => {
        setEditableRolePermissions(prev =>
            prev.map(rp => (rp.RoleID === id ? { ...rp, [field]: value } : rp))
        );
    };

    const saveRolePermission = async (rp: RolePermission) => {
        const isNew = typeof rp.RoleID === "string" && rp.RoleID.startsWith("new-");
        setSavingId(rp.RoleID);
        try {
            const res = await fetch(isNew ? `/api/role-permissions` : `/api/role-permissions/${rp.RoleID}`, {
                method: isNew ? "POST" : "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(rp),
            });
            if (!res.ok) throw new Error("Failed to save");

            if (isNew) {
                const data = await res.json();
                setEditableRolePermissions(prev =>
                    prev.map(r => (r.RoleID === rp.RoleID ? { ...r, RoleID: data.RoleID } : r))
                );
            }
        } catch (err) {
            console.error(err);
            alert("Save failed");
        } finally {
            setSavingId(null);
        }
    };

    const handleBlur = (rp: RolePermission) => saveRolePermission(rp);
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, rp: RolePermission) => {
        if (e.key === "Enter") e.currentTarget.blur();
    };

    const addRolePermission = () => {
        const tempId = `new-${newCounter}`;
        setNewCounter(prev => prev + 1);
        setEditableRolePermissions(prev => [
            ...prev,
            { RoleID: tempId as any, PermissionID: "" }
        ]);
    };

    return (
        <div>
            <h2 className="font-bold text-lg mb-2 flex justify-between items-center">
                Role Permissions
                <button
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={addRolePermission}
                >
                    Add RolePermission
                </button>
            </h2>
            <table className="w-full border border-gray-300">
                <thead>
                    <tr className="bg-gray-100 text-black">
                        <th className="p-2 border">Role</th>
                        <th className="p-2 border">Permission</th>
                        <th className="p-2 border">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {editableRolePermissions.map((rp, i) => (
                        <tr key={rp.RoleID}>
                            <td className="p-2 border">
                                <input
                                    className="w-full p-1 border rounded"
                                    value={rp.RoleID}
                                    onChange={e => handleChange(rp.RoleID, "RoleID", e.target.value)}
                                    onBlur={() => handleBlur(rp)}
                                    onKeyDown={e => handleKeyDown(e, rp)}
                                    disabled={savingId === rp.RoleID}
                                />
                            </td>
                            <td className="p-2 border">
                                <input
                                    className="w-full p-1 border rounded"
                                    value={rp.PermissionID}
                                    onChange={e => handleChange(rp.RoleID, "PermissionID", e.target.value)}
                                    onBlur={() => handleBlur(rp)}
                                    onKeyDown={e => handleKeyDown(e, rp)}
                                    disabled={savingId === rp.RoleID}
                                />
                            </td>
                            <td className="p-2 border text-center">
                                {savingId === rp.RoleID ? (
                                    <span className="text-sm text-blue-500">Saving...</span>
                                ) : typeof rp.RoleID === "string" ? (
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
