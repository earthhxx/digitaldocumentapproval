// /admin/adcomponents/RolesTable.tsx
import { useState } from "react";
import { Role as BaseRole } from "../types";

type Role = Omit<BaseRole, "RoleID"> & { RoleID: number | string };

type Props = { roles: Role[] };

export default function RolesTable({ roles }: Props) {
    const [editableRoles, setEditableRoles] = useState<Role[]>(roles);
    const [savingId, setSavingId] = useState<number | string | null>(null);
    const [newCounter, setNewCounter] = useState(0);

    const handleChange = (id: number | string, field: keyof Role, value: string) => {
        setEditableRoles(prev =>
            prev.map(r => (r.RoleID === id ? { ...r, [field]: value } : r))
        );
    };

    const saveRole = async (role: Role) => {
        const isNew = typeof role.RoleID === "string" && role.RoleID.startsWith("new-");
        setSavingId(role.RoleID);
        try {
            const res = await fetch(isNew ? `/api/roles` : `/api/roles/${role.RoleID}`, {
                method: isNew ? "POST" : "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(role),
            });
            if (!res.ok) throw new Error("Failed to save");

            if (isNew) {
                const data = await res.json();
                setEditableRoles(prev =>
                    prev.map(r => (r.RoleID === role.RoleID ? { ...r, RoleID: data.RoleID } : r))
                );
            }
        } catch (err) {
            console.error(err);
            alert("Save failed");
        } finally {
            setSavingId(null);
        }
    };

    const handleBlur = (role: Role) => saveRole(role);
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, role: Role) => {
        if (e.key === "Enter") e.currentTarget.blur();
    };

    const addRole = () => {
        const tempId = `new-${newCounter}`;
        setNewCounter(prev => prev + 1);
        setEditableRoles(prev => [
            ...prev,
            { RoleID: tempId as any, RoleName: "", Description: "" }
        ]);
    };

    return (
        <div>
            <h2 className="font-bold text-lg mb-2 flex justify-between items-center">
                Roles
                <button
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={addRole}
                >
                    Add Role
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
                    {editableRoles.map((r) => (
                        <tr key={r.RoleID}>
                            <td className="p-2 border">{typeof r.RoleID === "string" ? "New" : r.RoleID}</td>
                            <td className="p-2 border">
                                <input
                                    className="w-full p-1 border rounded"
                                    value={r.RoleName}
                                    onChange={e => handleChange(r.RoleID, "RoleName", e.target.value)}
                                    onBlur={() => handleBlur(r)}
                                    onKeyDown={e => handleKeyDown(e, r)}
                                    disabled={savingId === r.RoleID}
                                />
                            </td>
                            <td className="p-2 border">
                                <input
                                    className="w-full p-1 border rounded"
                                    value={r.Description || ""}
                                    onChange={e => handleChange(r.RoleID, "Description", e.target.value)}
                                    onBlur={() => handleBlur(r)}
                                    onKeyDown={e => handleKeyDown(e, r)}
                                    disabled={savingId === r.RoleID}
                                />
                            </td>
                            <td className="p-2 border text-center">
                                {savingId === r.RoleID ? (
                                    <span className="text-sm text-blue-500">Saving...</span>
                                ) : typeof r.RoleID === "string" ? (
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
