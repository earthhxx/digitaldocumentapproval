import { useState, useEffect, useRef } from "react";
import { UserRole } from "../types";

export default function RolesList() {
  const [items, setItems] = useState<UserRole[]>([]);
  const [form, setForm] = useState({ UserID: "", RoleID: "" });
  const confirmRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Confirm add/delete
  const [confirm, setConfirm] = useState<{ visible: boolean; type: "add" | "delete" | null; UserID?: number | string; RoleID?: string | number }>({
    visible: false,
    type: null,
  });

  const [choice, setChoice] = useState<"Yes" | "No">("No");

  // --- Fetch on mount ---
  useEffect(() => {
    const fetchUserRoles = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/userroletable/user-roles");
        const data = await res.json();
        setItems(data.data ?? []);
      } catch (err: any) {
        setError(err.message || "Error fetching permissions");
      } finally {
        setLoading(false);
      }
    };
    fetchUserRoles();
  }, []);

  // --- ADD ---
  // --- trigger add confirm ---
  const triggerAddConfirm = () => {
    if (!form.UserID.trim() || !form.RoleID.trim()) {
      alert("กรุณากรอก UserID และ RoleID");
      return;
    }
    setConfirm({ visible: true, type: "add" });
  };


  const confirmAddRole = async () => {
    const res = await fetch("/api/userroletable/adduserrole", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ UserID: form.UserID, RoleID: form.RoleID }),
    });

    if (!res.ok) { alert("Failed to add role"); return; }

    const updatedRoles: UserRole[] = await res.json();
    setItems(updatedRoles);
    setForm({ UserID: "", RoleID: "" });
    setConfirm({ visible: false, type: "add" });
  };


  // --- DELETE ---
  const delPer = (UserID: string | number, RoleID: string | number) => {
    setConfirm({ visible: true, type: "delete", UserID, RoleID });
  };


  const confirmDelete = async (UserID: number | string, RoleID: number | string) => {
    const res = await fetch("/api/userroletable/deluserrole", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ UserID, RoleID }),
    });

    if (res.ok)
      setItems(prev => prev.filter(u => !(u.UserID === UserID && u.RoleID === RoleID)));
    else alert("Failed to delete Role");

    setConfirm({ visible: false, type: "delete" });
  };


  // --- keyboard ---
  const handleKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!confirm.visible) return;

    let currentChoice = choice;

    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      currentChoice = choice === "Yes" ? "No" : "Yes";
      setChoice(currentChoice);
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (currentChoice === "Yes") {
        if (confirm.type === "add") confirmAddRole();
        if (confirm.type === "delete" && confirm.UserID !== undefined && confirm.RoleID !== undefined) confirmDelete(confirm.UserID, confirm.RoleID);
      } else {
        // กรณีเลือก No
        setConfirm({ visible: false, type: confirm.type });
        setForm({ UserID: "", RoleID: "" });
      }
      // **reset choice** กลับค่า default หลังกด Enter
      setChoice("No");
    }

    if (e.key === "Escape") {
      setConfirm({ visible: false, type: confirm.type });
      setChoice("No"); // reset choice ด้วย
    }
  };

  useEffect(() => {
    if (confirm.visible && confirmRef.current) {
      confirmRef.current.focus();
    } else {
      // กลับ focus ไปที่ body หรือ input อื่น
      document.body.focus();
    }
  }, [confirm.visible]);

  return (
    <div className="flex flex-col justify-start items-start w-full mx-auto space-y-6 font-mono text-white bg-black min-h-screen p-4">


      <h2 className="text-2xl font-bold">UserRoles</h2>

      {loading && <div>Loading UserRoles...</div>}
      {error && <div className="text-red-500">{error}</div>}

      {!loading && !error && (
        <>
          {/* List */}
          <div className="space-y-3 w-[65%]">
            <table className="w-full border-collapse font-mono text-sm">
              <thead>
                <tr className="bg-black text-white">
                  <th className="border border-gray-500 px-3 py-1 w-[20%] text-left">UserID</th>
                  <th className="border border-gray-500 px-3 py-1 text-left">RoleID</th>
                  <th className="border border-gray-500 px-3 py-1 w-[5%] text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((u, index) => (
                  <tr key={`${u.UserID} - ${index}`} className="hover:bg-white/10">
                    <td className="border border-gray-500 px-3 py-1">{u.UserID}</td>
                    <td className="border border-gray-500 px-3 py-1">{u.RoleID}</td>
                    <td className="flex justify-center border border-gray-500 px-3 py-1">
                      <button
                        onClick={() => delPer(u.UserID, u.RoleID)}
                        className="px-2 py-1 bg-white text-black hover:bg-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* CMD Style Floating Form */}
      <div className="fixed flex flex-col right-0 bottom-100 w-[30%] border border-white bg-black text-white p-4 rounded-lg shadow-lg">
        <div className="text-sm font-bold mb-2">Add New UserRoles</div>

        <input
          className="w-full p-2 mb-2 bg-black text-white border border-white outline-none"
          placeholder="UserID"
          value={form.UserID}
          onChange={e => setForm({ ...form, UserID: e.target.value })}
        />
        <input
          className="w-full p-2 mb-3 bg-black text-white border border-white outline-none"
          placeholder="RoleID"
          value={form.RoleID}
          onChange={e => setForm({ ...form, RoleID: e.target.value })}
          onKeyDown={e => { if (e.key === "Enter") triggerAddConfirm(); }}
        />
        <button className="w-full py-2 bg-white text-black hover:bg-gray-300" onClick={triggerAddConfirm}>
          [ Enter ]
        </button>
      </div>

      {/* Confirm card */}
      {confirm.visible && (
        <div ref={confirmRef}
          tabIndex={0} // ต้องมี tabIndex เพื่อให้ div รับ focus
          onKeyDown={handleKey} className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className="bg-black text-white border border-white rounded-lg p-5 w-80">
            <div className="mb-3">
              {confirm.type === "add"
                ? `Add new UserRoles "${form.UserID}"?`
                : "Are you sure you want to delete?"}
            </div>
            <div className="flex flex-col gap-2">
              <div
                className={`px-3 py-1 border cursor-pointer ${choice === "Yes" ? "bg-white text-black" : ""}`}
                onMouseEnter={() => setChoice("Yes")} // ← highlight เวลา hover
                onClick={() => {
                  if (confirm.type === "add") confirmAddRole();
                  if (confirm.type === "delete" && confirm.UserID !== undefined && confirm.RoleID !== undefined) confirmDelete(confirm.UserID, confirm.RoleID);
                  setChoice("No");
                }}
              >
                Yes
              </div>
              <div
                className={`px-3 py-1 border cursor-pointer ${choice === "No" ? "bg-white text-black" : ""}`}
                onMouseEnter={() => setChoice("No")} // ← highlight เวลา hover
                onClick={() => { setConfirm({ visible: false, type: confirm.type }); setChoice("No"); }}
              >
                No
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-400">
              Use ↑ ↓ to select, Enter to confirm or click
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
