import { useState } from "react";
import { Role as BaseRole } from "../types";
import { Plus, CheckCircle, Loader2, AlertCircle } from "lucide-react";

type Role = Omit<BaseRole, "RoleID"> & { RoleID: number | string };

type Props = { roles: Role[] };

export default function RolesList({ roles }: Props) {
  const [items, setItems] = useState<Role[]>(roles);
  const [savingId, setSavingId] = useState<number | string | null>(null);
  const [form, setForm] = useState({ RoleName: "", Description: "" });

  const handleChangeForm = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const saveRole = async (role: Role, isNew: boolean) => {
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
        setItems(prev =>
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

  const addRole = async () => {
    if (!form.RoleName.trim()) return;
    const tempId = `new-${Date.now()}`;
    const newRole: Role = { RoleID: tempId, RoleName: form.RoleName, Description: form.Description };
    setItems(prev => [...prev, newRole]);
    setForm({ RoleName: "", Description: "" });
    await saveRole(newRole, true);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Roles</h2>

      {/* Add Form */}
      <div className="p-5 border rounded-2xl bg-white shadow-sm space-y-3">
        <div className="text-lg font-medium flex items-center gap-2 text-blue-500">
          <Plus className="w-5 h-5" /> Add New Role
        </div>
        <input
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Role Name"
          value={form.RoleName}
          onChange={e => handleChangeForm("RoleName", e.target.value)}
        />
        <input
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Description"
          value={form.Description}
          onChange={e => handleChangeForm("Description", e.target.value)}
        />
        <button
          className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
          onClick={addRole}
        >
          <Plus className="w-4 h-4" /> Add Role
        </button>
      </div>

      {/* Existing Roles */}
      <div className="space-y-3">
        {items.map(role => {
          const isNew = typeof role.RoleID === "string";
          const isSaving = savingId === role.RoleID;
          return (
            <div
              key={role.RoleID}
              className="p-4 border rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold text-gray-800">{role.RoleName}</div>
                  {role.Description && (
                    <p className="text-sm text-gray-500 mt-1">{role.Description}</p>
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
