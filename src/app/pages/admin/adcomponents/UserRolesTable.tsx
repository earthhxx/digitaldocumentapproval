// /admin/adcomponents/UserRolesTable.tsx
import { useState } from "react";
import { UserRole as BaseUserRole } from "../types";

type UserRole = Omit<BaseUserRole, "UserID"> & { UserID: number | string; RoleID: number | string };

type Props = { userRoles: UserRole[] };

export default function UserRolesTable({ userRoles }: Props) {
    const [editableUserRoles, setEditableUserRoles] = useState<UserRole[]>(userRoles);
    const [savingId, setSavingId] = useState<number | string | null>(null);
    const [newCounter, setNewCounter] = useState(0);

    const handleChange = (id: number | string, field: keyof UserRole, value: string) => {
        setEditableUserRoles(prev =>
            prev.map(ur => (ur.UserID === id ? { ...ur, [field]: value } : ur))
        );
    };

    const saveUserRole = async (ur: UserRole) => {
        const isNew = typeof ur.UserID === "string" && ur.UserID.startsWith("new-");
        setSavingId(ur.UserID);
        try {
            const res = await fetch(isNew ? `/api/user-roles` : `/api/user-roles/${ur.UserID}`, {
                method: isNew ? "POST" : "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(ur),
            });
            if (!res.ok) throw new Error("Failed to save");

            if (isNew) {
                const data = await res.json();
                setEditableUserRoles(prev =>
                    prev.map(u => (u.UserID === ur.UserID ? { ...u, UserID: data.UserID } : u))
                );
            }
        } catch (err) {
            console.error(err);
            alert("Save failed");
        } finally {
            setSavingId(null);
        }
    };

    const handleBlur = (ur: UserRole) => saveUserRole(ur);
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, ur: UserRole) => {
        if (e.key === "Enter") e.currentTarget.blur();
    };

    const addUserRole = () => {
        const tempId = `new-${newCounter}`;
        setNewCounter(prev => prev + 1);
        setEditableUserRoles(prev => [
            ...prev,
            { UserID: tempId as any, RoleID: "", }
        ]);
    };

    return (
        <div>
            <h2 className="font-bold text-lg mb-2 flex justify-between items-center">
                User Roles
                <button
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={addUserRole}
                >
                    Add UserRole
                </button>
            </h2>
            <table className="w-full border border-gray-300">
                <thead>
                    <tr className="bg-gray-100 text-black">
                        <th className="p-2 border">ID</th>
                        <th className="p-2 border">User ID</th>
                        <th className="p-2 border">Role</th>
                        <th className="p-2 border">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {editableUserRoles.map((ur, i) => (
                        <tr key={ur.UserID}>
                            <td className="p-2 border">{i + 1}</td>
                            <td className="p-2 border">
                                <input
                                    className="w-full p-1 border rounded"
                                    value={ur.UserID}
                                    onChange={e => handleChange(ur.UserID, "UserID", e.target.value)}
                                    onBlur={() => handleBlur(ur)}
                                    onKeyDown={e => handleKeyDown(e, ur)}
                                    disabled={savingId === ur.UserID}
                                />
                            </td>
                            <td className="p-2 border">
                                <input
                                    className="w-full p-1 border rounded"
                                    value={ur.RoleID}
                                    onChange={e => handleChange(ur.UserID, "RoleID", e.target.value)}
                                    onBlur={() => handleBlur(ur)}
                                    onKeyDown={e => handleKeyDown(e, ur)}
                                    disabled={savingId === ur.UserID}
                                />
                            </td>
                            <td className="p-2 border text-center">
                                {savingId === ur.UserID ? (
                                    <span className="text-sm text-blue-500">Saving...</span>
                                ) : typeof ur.UserID === "string" ? (
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
