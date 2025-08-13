import { useState } from "react";
import { User as BaseUser } from "../types";
import { Plus, CheckCircle, Loader2 } from "lucide-react";

type User = Omit<BaseUser, "User_Id"> & { User_Id: number | string };

type Props = { users: User[] };

export default function UsersList({ users }: Props) {
    const [items, setItems] = useState<User[]>(users);
    const [savingId, setSavingId] = useState<number | string | null>(null);
    const [form, setForm] = useState({ Name: "", CreateDate: new Date().toISOString().split("T")[0] });

    const handleChangeForm = (field: keyof typeof form, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const addUser = async () => {
        if (!form.Name.trim()) return;

        const newUser: User = { User_Id: 0, Name: form.Name, CreateDate: form.CreateDate }; // User_Id 0 หรือส่งให้ API generate
        setSavingId("temp");
        try {
            const res = await fetch(`/api/users`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newUser),
            });
            if (!res.ok) throw new Error("Failed to save");
            const data = await res.json();
            setItems(prev => [...prev, { ...newUser, User_Id: data.User_Id }]);
            setForm({ Name: "", CreateDate: new Date().toISOString().split("T")[0] });
        } catch (err) {
            console.error(err);
            alert("Save failed");
        } finally {
            setSavingId(null);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold">Users</h2>

            {/* Add Form */}
            <div className="p-5 border rounded-2xl bg-white shadow-sm space-y-3">
                <div className="text-lg font-medium flex items-center gap-2 text-blue-500">
                    <Plus className="w-5 h-5" /> Add New User
                </div>
                <input
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Name"
                    value={form.Name}
                    onChange={e => handleChangeForm("Name", e.target.value)}
                />
                <input
                    type="date"
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={form.CreateDate}
                    onChange={e => handleChangeForm("CreateDate", e.target.value)}
                />
                <button
                    className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                    onClick={addUser}
                    disabled={savingId === "temp"}
                >
                    {savingId === "temp" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Plus className="w-4 h-4" />
                    )}
                    Add User
                </button>
            </div>

            {/* Existing Users */}
            <div className="space-y-3">
                {items.map((user, i) => (
                    <div
                        key={`${user.User_Id}-${i}`}
                        className="p-4 border rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow flex justify-between items-center"
                    >
                        <div>
                            <div className="text-md  text-black">{user.User_Id}</div>
                            <div className="font-semibold text-gray-800">{user.Name}</div>
                            <div className="text-sm text-gray-500 mt-1">Created: {user.CreateDate}</div>
                        </div>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                ))}
            </div>
        </div>
    );
}
