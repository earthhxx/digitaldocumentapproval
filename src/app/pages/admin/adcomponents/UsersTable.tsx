// /admin/adcomponents/UsersTable.tsx
import { useState } from "react";
import { User as BaseUser } from "../types";

type User = Omit<BaseUser, "User_Id"> & { User_Id: number | string };

type Props = { users: User[] };

export default function UsersTable({ users }: Props) {
    const [editableUsers, setEditableUsers] = useState<User[]>(users);
    const [savingId, setSavingId] = useState<number | string | null>(null);
    const [newCounter, setNewCounter] = useState(0);

    const handleChange = (id: number | string, field: keyof User, value: string) => {
        setEditableUsers(prev =>
            prev.map(u => (u.User_Id === id ? { ...u, [field]: value } : u))
        );
    };

    const saveUser = async (user: User) => {
        const isNew = typeof user.User_Id === "string" && user.User_Id.startsWith("new-");
        setSavingId(user.User_Id);
        try {
            const res = await fetch(isNew ? `/api/users` : `/api/users/${user.User_Id}`, {
                method: isNew ? "POST" : "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(user),
            });
            if (!res.ok) throw new Error("Failed to save");

            if (isNew) {
                const data = await res.json();
                setEditableUsers(prev =>
                    prev.map(u => (u.User_Id === user.User_Id ? { ...u, User_Id: data.User_Id } : u))
                );
            }
        } catch (err) {
            console.error(err);
            alert("Save failed");
        } finally {
            setSavingId(null);
        }
    };

    const handleBlur = (user: User) => saveUser(user);
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, user: User) => {
        if (e.key === "Enter") e.currentTarget.blur();
    };

    const addUser = () => {
        const tempId = `new-${newCounter}`;
        setNewCounter(prev => prev + 1);
        setEditableUsers(prev => [
            ...prev,
            { User_Id: tempId as any, Name: "", CreateDate: new Date().toISOString() }
        ]);
    };

    return (
        <div>
            <h2 className="font-bold text-lg mb-2 flex justify-between items-center">
                Users
                <button
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={addUser}
                >
                    Add User
                </button>
            </h2>
            <table className="w-full border border-gray-300">
                <thead>
                    <tr className="bg-gray-100 text-black">
                        <th className="p-2 border">User ID</th>
                        <th className="p-2 border">Name</th>
                        <th className="p-2 border">Created Date</th>
                        <th className="p-2 border">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {editableUsers.map(u => (
                        <tr key={u.User_Id}>
                            <td className="p-2 border">{typeof u.User_Id === "string" ? "New" : u.User_Id}</td>
                            <td className="p-2 border">
                                <input
                                    className="w-full p-1 border rounded"
                                    value={u.Name}
                                    onChange={e => handleChange(u.User_Id, "Name", e.target.value)}
                                    onBlur={() => handleBlur(u)}
                                    onKeyDown={e => handleKeyDown(e, u)}
                                    disabled={savingId === u.User_Id}
                                />
                            </td>
                            <td className="p-2 border">
                                <input
                                    type="date"
                                    className="w-full p-1 border rounded"
                                    value={u.CreateDate.split("T")[0]} // แสดงเป็น YYYY-MM-DD
                                    onChange={e => handleChange(u.User_Id, "CreateDate", e.target.value)}
                                    onBlur={() => handleBlur(u)}
                                    onKeyDown={e => handleKeyDown(e, u)}
                                    disabled={savingId === u.User_Id}
                                />
                            </td>
                            <td className="p-2 border text-center">
                                {savingId === u.User_Id ? (
                                    <span className="text-sm text-blue-500">Saving...</span>
                                ) : typeof u.User_Id === "string" ? (
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
