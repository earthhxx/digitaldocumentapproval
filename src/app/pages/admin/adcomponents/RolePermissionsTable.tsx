import { useState } from "react";
import { RolePermission as BaseRolePermission } from "../types";
import { Plus, CheckCircle, Loader2, AlertCircle } from "lucide-react";

type RolePermission = Omit<BaseRolePermission, "RoleID"> & {
  RoleID: number | string;
  PermissionID: number | string;
};

type Props = { rolePermissions: RolePermission[] };

export default function RolePermissionsList({ rolePermissions }: Props) {
  const [items, setItems] = useState<RolePermission[]>(rolePermissions);
  const [savingId, setSavingId] = useState<number | string | null>(null);
  const [form, setForm] = useState({ RoleID: "", PermissionID: "" });

  const handleChangeForm = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const saveRolePermission = async (rp: RolePermission, isNew: boolean) => {
    setSavingId(rp.RoleID);
    try {
      const res = await fetch(
        isNew
          ? `/api/role-permissions`
          : `/api/role-permissions/${rp.RoleID}`,
        {
          method: isNew ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(rp),
        }
      );
      if (!res.ok) throw new Error("Failed to save");

      if (isNew) {
        const data = await res.json();
        setItems(prev =>
          prev.map(r =>
            r.RoleID === rp.RoleID
              ? { ...r, RoleID: data.RoleID }
              : r
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

  const addRolePermission = async () => {
    if (!form.RoleID.trim() || !form.PermissionID.trim()) return;
    const tempId = `new-${Date.now()}`;
    const newRP: RolePermission = {
      RoleID: tempId,
      PermissionID: form.PermissionID,
    };
    setItems(prev => [...prev, newRP]);
    setForm({ RoleID: "", PermissionID: "" });
    await saveRolePermission(newRP, true);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Role Permissions</h2>

      {/* Add Form */}
      <div className="p-5 border rounded-2xl bg-white shadow-sm space-y-3">
        <div className="text-lg font-medium flex items-center gap-2 text-blue-500">
          <Plus className="w-5 h-5" /> Add New Role Permission
        </div>
        <input
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Role ID"
          value={form.RoleID}
          onChange={e => handleChangeForm("RoleID", e.target.value)}
        />
        <input
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Permission ID"
          value={form.PermissionID}
          onChange={e => handleChangeForm("PermissionID", e.target.value)}
        />
        <button
          className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
          onClick={addRolePermission}
        >
          <Plus className="w-4 h-4" /> Add Role Permission
        </button>
      </div>

      {/* Existing Role Permissions */}
      <div className="space-y-3">
        {items.map((rp, i) => {
          const isNew = typeof rp.RoleID === "string";
          const isSaving = savingId === rp.RoleID;
          return (
            <div
              key={`${rp.RoleID}-${i}`} // <-- แก้ตรงนี้
              className="p-4 border rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold text-gray-800">
                    Role: {rp.RoleID}
                  </div>
                  <div className="text-sm text-gray-500">
                    Permission: {rp.PermissionID}
                  </div>
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
