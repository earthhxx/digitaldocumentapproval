"use client";

import React, { useEffect, useState } from "react";
import SupervisorPopup from "./BT_SupervisorPage";
import Manager from "./BT_ManagerPage";


interface ApproveData {
    totalAll: number;
    totals: Record<string, number>;
    data: { id: number; name: string; source: string; date?: string }[];
    error?: string;
}

interface UserPayload {
    userId?: number | string;
    username?: string;
    fullName?: string;
    roles?: string[];
    permissions?: string[];
}

interface AmountData {
    ApproveNull: number, CheckNull: number, BothNull: number
}
interface DApproveTableProps {
    user: UserPayload;
    initialData: ApproveData;
    AmountData: AmountData;
}

type Tab = "Check" | "Approve" | "All";

export default function DApproveTable({ user, initialData, AmountData }: DApproveTableProps) {
    const [search, setSearch] = useState("");
    const [offset, setOffset] = useState(0);
    const [limit] = useState(16);
    const [loading, setLoading] = useState(false);
    const [approveData, setApproveData] = useState<ApproveData>(initialData);
    const [dataAmount, setDataAmount] = useState<AmountData>(AmountData);
    const availableTabs = (["Check", "Approve", "All"] as Tab[]).filter(t =>
        user.permissions?.includes(t)
    );
    const [tab, setTab] = useState<Tab>(availableTabs[0] || "Check"); // เลือก tab แรกที่ user มีสิทธิ์

    const [showPDF, setShowPDF] = useState(false);
    const [pdfUrl, setPdfUrl] = useState("");
    const [showSupervisorPopup, setShowSupervisorPopup] = useState(false);
    const [showManagerPopup, setShowManagerPopup] = useState(false);

    const [selectID, setSelectID] = useState<string | number>("");
    const [selectTable, setSelectTable] = useState("");


    const fetchData = async (newOffset = 0, query = "", newTab: Tab = tab) => {
        setLoading(true);
        try {
            const res = await fetch("/api/D-approve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    offset: newOffset,
                    limit,
                    search: query,
                    statusType: newTab,
                    permissions: user.permissions || [],
                }),
                credentials: "include",
            });
            if (res.ok) {
                const data = await res.json();
                // console.log(data)
                setApproveData(data);
                setOffset(newOffset);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // ✅ ถ้าอยาก refresh หลัง mount หรือหลัง approve/reject
    const refreshAmount = async () => {
        try {
            const res = await fetch("/api/update-status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(user.permissions),
            });
            if (res.ok) {
                const data: AmountData = await res.json();
                setDataAmount(data);
                setTabLabels({
                    Check: `Check (${data.CheckNull})`,
                    Approve: `Approve (${data.ApproveNull})`,
                    All: `All-Report (${data.BothNull})`,
                });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const openPDF = (id: string | number, table: string) => {
        setPdfUrl(`/api/generate-filled-pdf?labelText=${id}&table=${table}`);
        setShowPDF(true);
        setSelectID(id);
        setSelectTable(table);
    };


    const handleApproval = async (id: string | number, table: string, status: "approve" | "reject", card: "Supervisor" | "Manager") => {
        try {
            const res = await fetch("/api/save-status-report", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: id,
                    table: table,
                    status: status,
                    fullname: user.fullName,
                    card: card,
                }),
            });
            if (!res.ok) throw new Error("บันทึกข้อมูลล้มเหลว");

            alert(`บันทึกข้อมูลสำเร็จ (${table}: ${status})`);
        } catch (err: any) {
            alert(err.message);
        }
        setShowSupervisorPopup(false);
        setShowManagerPopup(false);
        setShowPDF(false);
        setSelectID('');
        setSelectTable('');
        refreshAmount();
    };

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        fetchData(0, search, tab);
    };

    const handleTabChange = (newTab: Tab) => {
        // console.log(newTab);
        setTab(newTab);
        setOffset(0);
        setApproveData({ totalAll: 0, totals: {}, data: [] });
        fetchData(0, search, newTab);
    };



    const [tabLabels, setTabLabels] = useState<Record<Tab, string>>({
        Check: `Check (${dataAmount?.CheckNull ?? 0})`,
        Approve: `Approve (${dataAmount?.ApproveNull ?? 0})`,
        All: `All-Report (${dataAmount?.BothNull ?? 0})`,
    });




    return (
        <div className="flex flex-1 flex-col min-h-full w-full bg-white shadow-lg rounded-lg p-6 overflow-auto">
            <h2 className="flex justify-center items-center  text-4xl font-bold mb-5 text-gray-800 mt-4">Document Approval</h2>

            {/* Tabs */}
            <div className={`flex mb-5 border-b border-gray-300`}>
                {(Object.keys(tabLabels) as Tab[]).map((t) => (
                    <button
                        key={t}
                        onClick={() => { handleTabChange(t); refreshAmount(); }}
                        className={`px-5 py-2 font-medium border-b-2 transition-colors duration-200 
        ${user.permissions?.includes(t) ? "" : "hidden"} 
        ${tab === t ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}
      `}
                    >
                        {tabLabels[t]}
                    </button>
                ))}
            </div>



            <div
                className={user.permissions?.includes(tab) ? "" : "hidden"}
            >
                {/* Search */}
                <form onSubmit={handleSearch} className="mb-5 flex gap-3 text-black">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search document..."
                        className="border border-gray-300 rounded-md px-4 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-gray-700"
                    />

                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Search
                    </button>
                </form>

                {/* Totals */}
                {/* <div className="mb-3 text-gray-600 font-medium">
                    Total documents: <span className="text-blue-600">{approveData.totalAll}</span>
                </div> */}

                {/* Table */}
                <div className="overflow-x-auto h-[70vh] custom-scrollbar rounded-lg shadow-sm border border-gray-200 ">
                    <table className="min-w-full bg-white border-collapse text-black">
                        <thead className="bg-gray-100 ">
                            <tr>
                                <th className="text-left px-4 py-2 font-medium ">ID</th>
                                <th className="text-left px-4 py-2 font-medium ">Source</th>
                                <th className="text-left px-4 py-2 font-medium ">Date</th>
                                <th className="text-left px-4 py-2 font-medium w-[5%]">
                                    <div className="w-full h-full text-center">action</div></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-6 ">
                                        Loading...
                                    </td>
                                </tr>
                            ) : approveData.data.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-6 ">
                                        No data found
                                    </td>
                                </tr>
                            ) : (
                                approveData.data.map((doc) => (
                                    <tr key={`${doc.source}-${doc.id}`} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-2 border-t border-gray-200">{doc.id}</td>
                                        <td className="px-4 py-2 border-t border-gray-200">{doc.source}</td>
                                        <td className="px-4 py-2 border-t border-gray-200">
                                            {doc.date ? new Date(doc.date).toLocaleDateString() : "-"}
                                        </td>
                                        <td className="px-4 py-2 border-t border-gray-200">
                                            <button onClick={() => { openPDF(doc.id, doc.source); }} className="w-full h-full text-[16px] text-white px-2 border-t border-gray-200 bg-blue-500 rounded-sm text-center">OPEN</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="mt-5 flex justify-between items-center">
                    <button
                        onClick={() => fetchData(Math.max(offset - limit, 0), search, tab)}
                        disabled={offset === 0 || loading}
                        className={`px-4 py-2 rounded-md ${offset === 0 || loading
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                            }`}
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => fetchData(offset + limit, search, tab)}
                        disabled={offset + limit >= approveData.totalAll || loading}
                        className={`px-4 py-2 rounded-md ${offset + limit >= approveData.totalAll || loading
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                            }`}
                    >
                        Next
                    </button>
                </div>

                {
                    showPDF && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                            <div className="relative w-full max-w-[95vw] h-[95vh] bg-white rounded-xl shadow-lg flex flex-col">
                                <div className="absolute right-0 p-4 ">
                                    {/* <h2 className="text-lg font-semibold text-gray-800">PDF Viewer</h2> */}
                                    <button
                                        className="text-white bg-red-600 hover:bg-red-700 rounded-full w-10 h-10 flex items-center justify-center text-2xl"
                                        onClick={() => setShowPDF(false)}
                                    >
                                        ✕
                                    </button>
                                </div>

                                <iframe src={pdfUrl} className="w-full h-full border-none flex-1 " title="PDF Viewer" />

                                <div className="absolute bottom-4 right-4 flex gap-4">
                                    {user?.permissions?.includes("Check") && (
                                        <button
                                            className="px-5 py-2 bg-blue-600 text-white rounded-lg"
                                            onClick={() => setShowSupervisorPopup(true)}
                                        >
                                            สำหรับหัวหน้างาน
                                        </button>
                                    )}
                                    {user?.permissions?.includes("Approve") && (
                                        <button
                                            className="px-5 py-2 bg-green-600 text-white rounded-lg"
                                            onClick={() => setShowManagerPopup(true)}
                                        >
                                            สำหรับผู้จัดการ
                                        </button>
                                    )}
                                </div>

                                {showSupervisorPopup && (
                                    <SupervisorPopup
                                        onClose={() => setShowSupervisorPopup(false)}
                                        onApprove={() => handleApproval(selectID, selectTable, "approve", "Supervisor")}
                                        onReject={() => handleApproval(selectID, selectTable, "reject", "Supervisor")}
                                    />
                                )}

                                {showManagerPopup && (
                                    <Manager
                                        onClose={() => setShowManagerPopup(false)}
                                        onApprove={() => handleApproval(selectID, selectTable, "approve", "Manager")}
                                        onReject={() => handleApproval(selectID, selectTable, "reject", "Manager")}
                                    />
                                )}
                            </div>
                        </div>
                    )
                }
            </div>

        </div >
    );
}
