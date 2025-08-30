"use client";

import React, { useState } from "react";
import SupervisorPopup from "./BT_SupervisorPage";
import Manager from "./BT_ManagerPage";


interface ApproveData {
    totalAll: number;
    totals: Record<string, number>; // เพิ่มตรงนี้
    data: { id: number; Dep: string; name: string; source: string; date?: string }[];
    error?: string;
}

interface UserPayload {
    userId?: number | string;
    username?: string;
    fullName?: string;
    roles?: string[];
    permissions?: string[];
    formaccess?: string[];
    Dep?: string[];
}

interface AmountData {
    ApproveNull: number, CheckNull: number, somethingNull: number
}
interface DApproveTableProps {
    user: UserPayload;
    initialData: ApproveData;
    AmountData: AmountData;
}
interface SelectedDoc {
    id: number;
    source: string;
    Dep: string;
}

type Tab = "Check_TAB" | "Approve_TAB" | "All_TAB";

export default function DApproveTable({ user, initialData, AmountData }: DApproveTableProps) {

    const [filterOption] = useState<string[]>(["", ...(user.formaccess || [])]);
    const [filterForm, setFilterForm] = useState<string | null>(null);

    const [DepOption] = useState<string[]>(["", ...(user.Dep || [])]);
    const [filterDep, setFilterDep] = useState<string | null>(null);

    const [search, setSearch] = useState("");
    const [offset, setOffset] = useState(0);
    const [limit] = useState(12);

    const [loading, setLoading] = useState(false);
    const [approveData, setApproveData] = useState<ApproveData>(initialData);
    const [dataAmount, setDataAmount] = useState<AmountData>(AmountData);
    const availableTabs = (["Check_TAB", "Approve_TAB", "All_TAB"] as Tab[]).filter(t =>
        user.permissions?.includes(t)
    );
    console.log('ava',availableTabs);
    const [tab, setTab] = useState<Tab>(availableTabs[0] || "Check_TAB"); // เลือก tab แรกที่ user มีสิทธิ์

    const [showPDF, setShowPDF] = useState(false);
    const [pdfUrl, setPdfUrl] = useState("");
    const [showSupervisorPopup, setShowSupervisorPopup] = useState(false);
    const [showManagerPopup, setShowManagerPopup] = useState(false);

    const [selectID, setSelectID] = useState<string | number>("");
    const [selectTable, setSelectTable] = useState("");
    const [selectDep, setselectDep] = useState("");


    const [selected, setSelected] = useState<SelectedDoc[]>([]);
    const allDocs = approveData.data.map((doc) => ({ id: doc.id, source: doc.source }));

    const canApproveSupervisor = selected.length > 0 && selected.every(s =>
        user?.permissions?.includes(`Check_${s.source}_${s.Dep}`)
    );

    const canApproveManager = selected.length > 0 && selected.every(s =>
        user?.permissions?.includes(`Approve_${s.source}_${s.Dep}`)
    );


    const toggleSelectAll = () => {
        if (selected.length === allDocs.length) {
            setSelected([]);
        } else {
            setSelected(approveData.data.map(doc => ({ id: doc.id, source: doc.source, Dep: doc.Dep })));
        }
    };

    const handleGroupApprove = async (status: "check" | "approve" | "reject", card: "Supervisor" | "Manager") => {
        try {
            await fetch("/api/save-status-report", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    records: selected,
                    status,
                    fullname: user.fullName,
                    card,
                }),
            });

            alert(`บันทึก ${status} สำเร็จ`);
            setSelected([]);
            refreshAmount();
            fetchData(offset, search, tab);
        } catch (err) {
            console.error(err);
            alert("เกิดข้อผิดพลาด");
        }
    };

    const fetchData = async (newOffset = 0, query = "", newTab: Tab = tab) => {
        console.log('newtab',newTab)
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
                    formaccess: filterForm ? [filterForm] : user.formaccess,
                    Dep: filterDep ? [filterDep] : user.Dep,
                }),
                credentials: "include",
            });
            if (res.ok) {
                const data = await res.json();
                // console.log('data', data);
                setApproveData(data);
                setOffset(newOffset);
                refreshAmount();
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
                body: JSON.stringify(user.formaccess ?? [], user.Dep ?? []),
            });
            if (res.ok) {
                const data: AmountData = await res.json();
                setDataAmount(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const openPDF = (id: string | number, table: string, Dep: string) => {
        setPdfUrl(`/api/generate-filled-pdf?labelText=${id}&table=${table}`);
        setShowPDF(true);
        setSelectID(id);
        setSelectTable(table);
        setselectDep(Dep);
    };


    const handleApproval = async (id: string | number, table: string, status: "check" | "approve" | "reject", card: "Supervisor" | "Manager") => {
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
        setselectDep('');
        refreshAmount();
    };

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        fetchData(0, search, tab);
    };

    const handleTabChange = (newTab: Tab) => {
        setTab(newTab);
        setOffset(0);
        fetchData(0, search, newTab);
    };



    const [tabLabels] = useState<Record<Tab, string>>({
        Check_TAB: `Check`,
        Approve_TAB: `Approve`,
        All_TAB: `All-Report`,
    });


    const canGoNext = offset + limit < approveData.totalAll;
    const canGoPrev = offset > 0;

    return (
        <div className="flex flex-1 flex-col min-h-full w-full bg-white shadow-lg rounded-lg p-6 overflow-auto">
            <h2 className="flex justify-center items-center  text-4xl font-bold mb-5 text-gray-800 mt-4">ระบบ ยืนยันเอกสาร</h2>


            {/* Tabs */}
            <div className="flex mb-5 border-b border-gray-300">
                {(Object.keys(tabLabels) as Tab[]).map((t) => (
                    <button
                        key={t}
                        onClick={() => {
                            handleTabChange(t);
                        }}
                        className={`relative flex items-center px-5 py-2 font-medium border-b-2 transition-colors duration-200
        ${user.permissions?.includes(t) ? " " : " hidden "}
        ${tab === t ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}
      `}
                    >
                        {tabLabels[t]}

                        {/* Badge */}
                        {t === "Check_TAB" && dataAmount.CheckNull > 0 && (
                            <div className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1 rounded-full bg-amber-400 text-xs text-white flex items-center justify-center">
                                {dataAmount.CheckNull}
                            </div>
                        )}
                        {t === "Approve_TAB" && dataAmount.ApproveNull > 0 && (
                            <div className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1 rounded-full bg-amber-400 text-xs text-white flex items-center justify-center">
                                {dataAmount.ApproveNull}
                            </div>
                        )}
                        {t === "All_TAB" && dataAmount.somethingNull > 0 && (
                            <div className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1 rounded-full bg-amber-400 text-xs text-white flex items-center justify-center">
                                {dataAmount.somethingNull}
                            </div>
                        )}
                    </button>
                ))}
            </div>





            <div
                className={user.permissions?.includes(tab) ? "" : "hidden"}
            >
                <div className="flex flex-row justify-evenly items-center mb-4">
                    {/* Search */}
                    <form onSubmit={handleSearch} className=" flex items-center justify-center gap-2 text-black w-[40%]">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search document..."
                            className="border border-gray-300 rounded-md px-4 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-gray-700"
                        />

                        <select
                            value={filterForm || ""}
                            onChange={(e) => setFilterForm(e.target.value === "" ? null : e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-2"
                        >
                            {filterOption.map((source) => (
                                <option key={source} value={source}>
                                    {source || "All"}
                                </option>
                            ))}
                        </select>

                        <select
                            value={filterDep || ""}
                            onChange={(e) => setFilterDep(e.target.value === "" ? null : e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-2"
                        >
                            {DepOption.map((source) => (
                                <option key={source} value={source}>
                                    {source || "All"}
                                </option>
                            ))}
                        </select>

                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Search
                        </button>
                    </form>

                    {/* Total per table horizontal inline */}
                    <div className="flex gap-2 overflow-y-auto py-2 justify-end pe-4 w-full">
                        {Object.entries(approveData.totals).map(([table, count]) => (
                            <div
                                key={table}
                                className="flex flex-row items-center justify-between min-w-[90px] px-3 py-2 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
                            >
                                <span className="text-gray-500 text-xs font-semibold uppercase tracking-wide">{table}</span>
                                <span className="text-blue-600 font-bold text-sm ml-2">{count}</span>
                            </div>
                        ))}
                    </div>



                </div>



                <div className="p-2 flex gap-2">
                    {canApproveSupervisor && (
                        <>
                            <button
                                onClick={() => handleGroupApprove("check", "Supervisor")}
                                className="px-3 py-1 rounded text-white bg-green-600 hover:bg-green-700"
                            >
                                Check Supervisor ({selected.length})
                            </button>

                            <button
                                onClick={() => handleGroupApprove("reject", "Supervisor")}
                                className="px-3 py-1 rounded text-white bg-red-600 hover:bg-red-700"
                            >
                                Reject Supervisor ({selected.length})
                            </button>
                        </>
                    )}

                    {canApproveManager && (
                        <>
                            <button
                                onClick={() => handleGroupApprove("approve", "Manager")}
                                className="px-3 py-1 rounded text-white bg-green-600 hover:bg-green-700"
                            >
                                Approve Manager ({selected.length})
                            </button>

                            <button
                                onClick={() => handleGroupApprove("reject", "Manager")}
                                className="px-3 py-1 rounded text-white bg-red-600 hover:bg-red-700"
                            >
                                Reject Manager ({selected.length})
                            </button>
                        </>
                    )}
                </div>


                <div className="custom-scrollbar rounded-lg shadow-sm border border-gray-200 overflow-y-auto h-[64vh] overflow-hidden">
                    <table className="min-w-full table-fixed bg-white text-black ">
                        <thead className="bg-gray-100 sticky top-0 z-10">
                            <tr>
                                <th className="px-2 py-2 text-center w-[5%]">
                                    <input
                                        type="checkbox"
                                        onChange={toggleSelectAll}
                                        checked={
                                            selected.length > 0 &&
                                            approveData.data.every((doc) =>
                                                selected.some((s) => s.id === doc.id && s.source === doc.source)
                                            )
                                        }
                                    />
                                </th>
                                <th className="px-4 py-2 text-center w-[10%]">#</th>
                                <th className="px-4 py-2 text-center w-[10%]">ID</th>
                                <th className="px-4 py-2 text-center w-[25%]">DOC NAME</th>
                                <th className="px-4 py-2 text-center w-[15%]">Source</th>
                                <th className="px-4 py-2 text-center w-[15%]">Dep</th>
                                <th className="px-4 py-2 text-center w-[15%]">Date</th>
                                <th className="px-4 py-2 text-center w-[10%]">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-6">
                                        Loading...
                                    </td>
                                </tr>
                            ) : approveData.data.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-6">
                                        No data found
                                    </td>
                                </tr>
                            ) : (
                                approveData.data.map((doc, index) => (
                                    <tr
                                        key={`${doc.source}_${doc.id}_${index}`}
                                        className={`transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1 hover:bg-amber-100 ${selected.some((s) => s.id === doc.id && s.source === doc.source)
                                            ? "bg-amber-200"
                                            : ""
                                            }`}
                                    >
                                        <td className="px-2 py-2 text-center border-t border-gray-200">
                                            <input
                                                type="checkbox"
                                                checked={selected.some(s => s.id === doc.id && s.source === doc.source && s.Dep === doc.Dep)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        // เพิ่มเข้า selected
                                                        setSelected((prev) => [...prev, { id: doc.id, source: doc.source, Dep: doc.Dep }]);
                                                    } else {
                                                        // ลบออกจาก selected
                                                        setSelected((prev) =>
                                                            prev.filter((s) => !(s.id === doc.id && s.source === doc.source && s.Dep === doc.Dep))
                                                        );
                                                    }
                                                }}
                                            />
                                        </td>
                                        <td className="px-4 py-2 text-center border-t border-gray-200 w-[10%]">
                                            {(offset + 1) + index}
                                        </td>
                                        <td className="px-4 py-2 text-center border-t border-gray-200 w-[10%]">
                                            {doc.id}
                                        </td>
                                        <td className="px-4 py-2 border-t border-gray-200 w-[25%]">
                                            {doc.source === "FM_IT_03"
                                                ? "ฟอร์มเอกสารแจ้งซ่อม IT"
                                                : doc.source === "FM_GA_03"
                                                    ? "ฟอร์มขออนุญาตนำของออกนอกโรงงาน"
                                                    : doc.source === "FM_GA_04"
                                                        ? "ฟอร์มขออนุญาตออกนอกโรงงาน"
                                                        : doc.source}
                                        </td>
                                        <td className="px-4 py-2 text-center border-t border-gray-200 w-[15%]">
                                            {doc.source}
                                        </td>
                                        <td className="px-4 py-2 text-center border-t border-gray-200 w-[15%]">
                                            {doc.Dep}
                                        </td>
                                        <td className="px-4 py-2 text-center border-t border-gray-200 w-[15%]">
                                            {doc.date
                                                ? new Date(doc.date).toLocaleDateString()
                                                : "-"}
                                        </td>
                                        <td className="px-4 py-2 text-center border-t border-gray-200 w-[10%]">
                                            <button
                                                onClick={() => openPDF(doc.id, doc.source, doc.Dep)}
                                                className="px-2 py-1 text-white bg-blue-500 rounded-sm hover:bg-blue-600"
                                            >
                                                OPEN
                                            </button>
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
                        disabled={!canGoPrev || loading}
                        className={`px-4 py-2 rounded-md ${offset === 0 || loading
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                            }`}
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => fetchData(offset + limit, search, tab)}
                        disabled={!canGoNext || loading}
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
                                    {user?.permissions?.includes(`Check_${selectTable}_${selectDep}`) && (
                                        <button
                                            className="px-5 py-2 bg-blue-600 text-white rounded-lg"
                                            onClick={() => setShowSupervisorPopup(true)}
                                        >
                                            สำหรับหัวหน้างาน
                                        </button>
                                    )}
                                    {/* permission ต้อง = (`Approve_${selectTable}_${selectDep}`) เช่น Approve_FM_IT_03_IT*/}
                                    {user?.permissions?.includes(`Approve_${selectTable}_${selectDep}`) && (
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
                                        onClose={() => {
                                            setShowSupervisorPopup(false);
                                            setSelectID('');
                                            setSelectTable('');
                                            setselectDep('');
                                        }}
                                        onApprove={() => handleApproval(selectID, selectTable, "check", "Supervisor")}
                                        onReject={() => handleApproval(selectID, selectTable, "reject", "Supervisor")}
                                    />
                                )}

                                {showManagerPopup && (
                                    <Manager
                                        onClose={() => {
                                            setShowManagerPopup(false);
                                            setSelectID('');
                                            setSelectTable('');
                                            setselectDep('');
                                        }}
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
