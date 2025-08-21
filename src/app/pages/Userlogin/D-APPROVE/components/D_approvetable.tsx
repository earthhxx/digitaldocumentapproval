"use client";

import React, { useState, useEffect } from "react";

interface ApproveData {
    totalAll: number;
    totals: Record<string, number>;
    data: { id: number; name: string; source: string }[];
    error?: string;
}

interface UserPayload {
    userId?: number | string;
    username?: string;
    fullName?: string;
    roles?: string[];
    permissions?: string[];
}

interface DApproveTableProps {
    user: UserPayload;
    initialData: ApproveData;
}

export default function DApproveTable({ user, initialData }: DApproveTableProps) {
    const [search, setSearch] = useState("");
    const [offset, setOffset] = useState(0);
    const [limit] = useState(5);
    const [loading, setLoading] = useState(false);
    const [approveData, setApproveData] = useState<ApproveData>(initialData);
    const [tab, setTab] = useState<"check" | "approve">("check");

    const fetchData = async (newOffset = 0, query = "", newTab: "check" | "approve" = tab) => {
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
                setApproveData(data);
                setOffset(newOffset);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // --- Search handler ---
    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        fetchData(0, search, tab);
    };

    // --- Tab change handler ---
    const handleTabChange = (newTab: "check" | "approve") => {
        setTab(newTab);
        setOffset(0); // reset offset
        setApproveData({ totalAll: 0, totals: {}, data: [] }); // reset data
        fetchData(0, search, newTab); // fetch tab ใหม่
    };


    return (
        <div className="p-4 bg-white shadow rounded">
            <h2 className="text-xl font-semibold mb-4">Document Approval</h2>

            {/* Tabs */}
            <div className="flex mb-4 border-b">
                {(["check", "approve"] as const).map((t) => (
                    <button
                        key={t}
                        onClick={() => handleTabChange(t)}
                        className={`px-4 py-2 -mb-px font-medium border-b-2 ${tab === t ? "border-blue-500 text-blue-500" : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        {t === "check" ? "Check" : "Approve"}
                    </button>
                ))}
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="mb-4 flex gap-2">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name..."
                    className="border border-gray-300 rounded px-3 py-1 flex-1"
                />
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
                >
                    Search
                </button>
            </form>

            {/* Totals */}
            <div className="mb-2 text-gray-700">
                Total documents: {approveData.totalAll}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-3 py-1">ID</th>
                            <th className="border border-gray-300 px-3 py-1">Name</th>
                            <th className="border border-gray-300 px-3 py-1">Source Table</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={3} className="text-center py-4">
                                    Loading...
                                </td>
                            </tr>
                        ) : approveData.data.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="text-center py-4 text-gray-500">
                                    No data found
                                </td>
                            </tr>
                        ) : (
                            approveData.data.map((doc) => (
                                <tr key={`${doc.source}-${doc.id}`} className="hover:bg-gray-50">
                                    <td className="border border-gray-300 px-3 py-1">{doc.id}</td>
                                    <td className="border border-gray-300 px-3 py-1">{doc.name}</td>
                                    <td className="border border-gray-300 px-3 py-1">{doc.source}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex justify-between">
                <button
                    onClick={() => fetchData(Math.max(offset - limit, 0), search, tab)}
                    disabled={offset === 0 || loading}
                    className={`px-3 py-1 rounded ${offset === 0 || loading
                            ? "bg-gray-200 cursor-not-allowed"
                            : "bg-blue-500 text-white hover:bg-blue-600"
                        }`}
                >
                    Previous
                </button>
                <button
                    onClick={() => fetchData(offset + limit, search, tab)}
                    disabled={offset + limit >= approveData.totalAll || loading}
                    className={`px-3 py-1 rounded ${offset + limit >= approveData.totalAll || loading
                            ? "bg-gray-200 cursor-not-allowed"
                            : "bg-blue-500 text-white hover:bg-blue-600"
                        }`}
                >
                    Next
                </button>
            </div>
        </div>
    );
}
