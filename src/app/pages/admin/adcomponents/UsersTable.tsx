"use client";
import { useState, useEffect, useRef } from "react";

type User = {
    id: number;
    User_Id: string;
    Name: string;
    Department: string;
    Pass: string;
    CreateDate: string;
    Age?: number | null;
    Sex?: string | null;
    StartDate?: string | null;
    Status?: string | null;
    Tel?: string | null;
    Image?: string | null;
    Process?: string;
};

export default function UsersList() {
    const [items, setItems] = useState<User[]>([]);
    const [form, setForm] = useState({ User_Id: "", Name: "", Department: "", Pass: "" });
    const [editingId, setEditingId] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<"add" | "edit">("add");
    const [confirm, setConfirm] = useState<{ visible: boolean; type: "add" | "edit" | "delete" | null; id?: number }>({ visible: false, type: null });
    const [choice, setChoice] = useState<"Yes" | "No">("No");
    const confirmRef = useRef<HTMLDivElement>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // --- Fetch on mount ---
    useEffect(() => {
        const fetchRoles = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch("/api/usertable/users");
                const data = await res.json();
                setItems(data.data ?? []);
            } catch (err: any) {
                setError(err.message || "Error fetching permissions");
            } finally {
                setLoading(false);
            }
        };
        fetchRoles();
    }, []);

    // --- trigger confirm ---
    const triggerAddConfirm = () => {
        if (!form.User_Id || !form.Name) return;
        setConfirm({ visible: true, type: "add" });
    };

    const triggerEditConfirm = () => {
        if (!editingId) return;
        setConfirm({ visible: true, type: "edit", id: editingId });
    };

    const triggerDeleteConfirm = (id: number) => {
        setConfirm({ visible: true, type: "delete", id });
    };

    // --- actions ---
    const addUser = async () => {
        const newUser: User = { ...form, id: Date.now(), CreateDate: new Date().toISOString() };
        setItems(prev => [...prev, newUser]);
        setForm({ User_Id: "", Name: "", Department: "", Pass: "" });
        setConfirm({ visible: false, type: "add" });
    };

    const editUser = async (id: number) => {
        setItems(prev => prev.map(u => (u.id === id ? { ...u, ...form } : u)));
        setForm({ User_Id: "", Name: "", Department: "", Pass: "" });
        setEditingId(null);
        setConfirm({ visible: false, type: "edit" });
    };

    const deleteUser = async (id: number) => {
        setItems(prev => prev.filter(u => u.id !== id));
        setConfirm({ visible: false, type: "delete" });
    };

    // --- keyboard navigation ---
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
                if (confirm.type === "add") addUser();
                if (confirm.type === "edit" && confirm.id) editUser(confirm.id);
                if (confirm.type === "delete" && confirm.id) deleteUser(confirm.id);
            } else {
                setConfirm({ visible: false, type: confirm.type, id: confirm.id });
                setForm({ User_Id: "", Name: "", Department: "", Pass: "" });
            }
            setChoice("No");
        }

        if (e.key === "Escape") {
            setConfirm({ visible: false, type: confirm.type, id: confirm.id });
            setChoice("No");
        }
    };

    useEffect(() => {
        if (confirm.visible && confirmRef.current) {
            confirmRef.current.focus();
        } else {
            document.body.focus();
        }
    }, [confirm.visible]);

    return (
        <div className="flex flex-col w-full p-4 bg-black text-white min-h-screen font-mono">
            <h2 className="text-2xl font-bold mb-4">Users</h2>

            {!loading && !error && items.length > 0 ? (
                <div className="mb-6 w-full">
                    <table className="w-[60%] border-collapse text-sm">
                        <thead>
                            <tr className="bg-black text-white">
                                <th className="border px-2 py-1 w-[2%]">ID</th>
                                <th className="border px-2 py-1 w-[2%]">User_Id</th>
                                <th className="border px-2 py-1 w-[20%]">Name</th>
                                <th className="border px-2 py-1 w-[10%]">Department</th>
                                <th className="border px-2 py-1 w-[2%]">Pass</th>
                                <th className="border px-2 py-1 w-[2%]">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items
                                .filter(u =>
                                    (u.Name ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    (u.User_Id ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    (u.Department ?? "").toLowerCase().includes(searchTerm.toLowerCase())
                                )
                                .map((u, i) => (
                                    <tr key={u.id ?? i} className="hover:bg-white/10">
                                        <td className="border px-2 py-1">{u.id}</td>
                                        <td className="border px-2 py-1">{u.User_Id ?? "-"}</td>
                                        <td className="border px-2 py-1">{u.Name ?? "-"}</td>
                                        <td className="border px-2 py-1">{u.Department ?? "-"}</td>
                                        <td className="border px-2 py-1">{u.Pass ?? "-"}</td>
                                        <td className="flex justify-center gap-1 border px-2 py-1">
                                            <button
                                                className="px-2 py-1 bg-gray-700 hover:bg-gray-500"
                                                onClick={() => {
                                                    setActiveTab("edit");
                                                    setEditingId(u.id ?? null);
                                                    setForm({
                                                        User_Id: u.User_Id ?? "",
                                                        Name: u.Name ?? "",
                                                        Department: u.Department ?? "",
                                                        Pass: u.Pass ?? ""
                                                    });
                                                }}
                                            >
                                                Edit
                                            </button>
                                            <button className="px-2 py-1 bg-red-700 hover:bg-red-500" onClick={() => triggerDeleteConfirm(u.id ?? 0)}>
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                !loading && !error && <div>No users found.</div>
            )}


            {/* Add/Edit Form */}
            <div className="fixed z-50 bottom-4 right-0 bg-black w-[40%] p-4 border-2 rounded-md">
                {/* Search bar */}
                <div className="mb-4 z-40 top-4 right-0 w-full p-2 bg-black border border-white rounded flex flex-col sm:flex-row gap-2">
                    <div className="flex items-center w-[25%]">FIND USER :</div>
                    <input
                        type="text"
                        placeholder="Search by Name, User_Id or Department"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="flex-1 p-2 bg-black border border-white text-white rounded"
                    />
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-3">
                    <button
                        className={`px-3 py-1 border rounded ${activeTab === "add" ? "bg-white text-black" : ""}`}
                        onClick={() => setActiveTab("add")}
                    >
                        Add
                    </button>
                    <button
                        className={`px-3 py-1 border rounded ${activeTab === "edit" ? "bg-white text-black" : ""}`}
                        onClick={() => setActiveTab("edit")}
                    >
                        Edit
                    </button>
                </div>

                {/* Form Content */}
                <div className="border p-3 rounded bg-gray-900 flex flex-col gap-2">
                    {activeTab === "add" && (
                        <>
                            <input placeholder="User_Id" value={form.User_Id} onChange={e => setForm({ ...form, User_Id: e.target.value })} className="p-2 bg-black border border-white" />
                            <input placeholder="Name" value={form.Name} onChange={e => setForm({ ...form, Name: e.target.value })} className="p-2 bg-black border border-white" />
                            <input placeholder="Department" value={form.Department} onChange={e => setForm({ ...form, Department: e.target.value })} className="p-2 bg-black border border-white" />
                            <input placeholder="Pass" value={form.Pass} onChange={e => setForm({ ...form, Pass: e.target.value })} className="p-2 bg-black border border-white" />
                            <button onClick={triggerAddConfirm} className="mt-2 bg-white text-black py-1">Add</button>
                            <button onClick={() => setForm({ User_Id: "", Name: "", Department: "", Pass: "" })} className="mt-2 bg-white text-black py-1">Clear</button>
                        </>
                    )}
                    {activeTab === "edit" && editingId && (
                        <>
                            <select
                                value={editingId ?? ""}
                                onChange={e => {
                                    const selected = items.find(u => u.id === Number(e.target.value));
                                    if (selected) {
                                        setEditingId(selected.id);
                                        setForm({ User_Id: selected.User_Id, Name: selected.Name, Department: selected.Department, Pass: selected.Pass });
                                    }
                                }}
                                className="p-2 bg-black border border-white"
                            >
                                <option value="">Select User to Edit</option>
                                {items.map(u => <option key={u.id} value={u.id}>{u.Name}</option>)}
                            </select>
                            <input placeholder="User_Id" value={form.User_Id} onChange={e => setForm({ ...form, User_Id: e.target.value })} className="p-2 bg-black border border-white" />
                            <input placeholder="Name" value={form.Name} onChange={e => setForm({ ...form, Name: e.target.value })} className="p-2 bg-black border border-white" />
                            <input placeholder="Department" value={form.Department} onChange={e => setForm({ ...form, Department: e.target.value })} className="p-2 bg-black border border-white" />
                            <input placeholder="Pass" value={form.Pass} onChange={e => setForm({ ...form, Pass: e.target.value })} className="p-2 bg-black border border-white" />
                            <button onClick={triggerEditConfirm} className="mt-2 bg-white text-black py-1">Save</button>
                            <button onClick={() => setForm({ User_Id: "", Name: "", Department: "", Pass: "" })} className="mt-2 bg-white text-black py-1">Clear</button>
                        </>
                    )}
                </div>
            </div>

            {/* Confirm popup */}
            {
                confirm.visible && (
                    <div
                        ref={confirmRef}
                        tabIndex={0}
                        onKeyDown={handleKey}
                        className="fixed inset-0 flex items-center justify-center bg-black/70 z-50"
                    >
                        <div className="bg-black text-white p-5 border border-white rounded w-80 flex flex-col gap-3">
                            <div>
                                {confirm.type === "add" && `Add new user "${form.Name}"?`}
                                {confirm.type === "edit" && `Save changes to "${form.Name}"?`}
                                {confirm.type === "delete" && "Are you sure you want to delete?"}
                            </div>
                            <div className="flex flex-col gap-2">
                                <div
                                    className={`px-3 py-1 border cursor-pointer ${choice === "Yes" ? "bg-white text-black" : ""}`}
                                    onMouseEnter={() => setChoice("Yes")}
                                    onClick={() => {
                                        if (confirm.type === "add") addUser();
                                        if (confirm.type === "edit" && confirm.id) editUser(confirm.id);
                                        if (confirm.type === "delete" && confirm.id) deleteUser(confirm.id);
                                        setChoice("No");
                                    }}
                                >
                                    Yes
                                </div>
                                <div
                                    className={`px-3 py-1 border cursor-pointer ${choice === "No" ? "bg-white text-black" : ""}`}
                                    onMouseEnter={() => setChoice("No")}
                                    onClick={() => setConfirm({ visible: false, type: confirm.type, id: confirm.id })}
                                >
                                    No
                                </div>
                            </div>
                            <div className="text-xs text-gray-400">Use ↑ ↓ to select, Enter to confirm or click</div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
