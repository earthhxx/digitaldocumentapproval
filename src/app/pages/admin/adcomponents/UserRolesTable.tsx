import { useState } from "react";
import { UserRole as BaseUserRole } from "../types";
import { Plus, CheckCircle, Loader2 } from "lucide-react";

type UserRole = Omit<BaseUserRole, "UserID"> & {
  UserID: number | string;
  RoleID: number | string;
};

type Props = { userRoles: UserRole[] };

export default function UserRolesList({ userRoles }: Props) {
  const [items, setItems] = useState<UserRole[]>(userRoles);
  const [savingId, setSavingId] = useState<number | string | null>(null);
  const [form, setForm] = useState({ UserID: "", RoleID: "" });

  const handleChangeForm = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const addUserRole = async () => {
    if (!form.UserID.trim() || !form.RoleID.trim()) return;

    const newUR: UserRole = { UserID: 0, RoleID: form.RoleID }; // UserID 0 หรือให้ API generate
    setSavingId("temp");
    try {
      const res = await fetch(`/api/user-roles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ UserID: form.UserID, RoleID: form.RoleID }),
      });
      if (!res.ok) throw new Error("Failed to save");
      const data = await res.json();
      setItems(prev => [...prev, { ...newUR, UserID: data.UserID }]);
      setForm({ UserID: "", RoleID: "" });
    } catch (err) {
      console.error(err);
      alert("Save failed");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">User Roles</h2>

      {/* Add Form */}
      <div className="p-5 border rounded-2xl bg-white shadow-sm space-y-3">
        <div className="text-lg font-medium flex items-center gap-2 text-blue-500">
          <Plus className="w-5 h-5" /> Add User Role
        </div>
        <input
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="User ID"
          value={form.UserID}
          onChange={e => handleChangeForm("UserID", e.target.value)}
        />
        <input
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Role ID"
          value={form.RoleID}
          onChange={e => handleChangeForm("RoleID", e.target.value)}
        />
        <button
          className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
          onClick={addUserRole}
          disabled={savingId === "temp"}
        >
          {savingId === "temp" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Add User Role
        </button>
      </div>

      {/* Existing User Roles */}
      <div className="space-y-3">
        {items.map((ur, i) => (
          <div
            key={`${ur.UserID}-${i}`} // <-- แก้ตรงนี้
            className="p-4 border rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow flex justify-between items-center"
          >
            <div>
              <div className="font-semibold text-gray-800">User: {ur.UserID}</div>
              <div className="text-sm text-gray-500 mt-1">Role: {ur.RoleID}</div>
            </div>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
        ))}
      </div>

    </div>
  );
}
