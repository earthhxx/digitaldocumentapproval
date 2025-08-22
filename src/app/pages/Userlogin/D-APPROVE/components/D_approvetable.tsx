"use client";

import React, { useState, useEffect } from "react";

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

interface DApproveTableProps {
    user: UserPayload;
    initialData: ApproveData;
}

type Tab = "Check" | "Approve" | "All";

export default function DApproveTable({ user, initialData }: DApproveTableProps) {
    const [search, setSearch] = useState("");
    const [offset, setOffset] = useState(0);
    const [limit] = useState(5);
    const [loading, setLoading] = useState(false);
    const [approveData, setApproveData] = useState<ApproveData>(initialData);
    const [tab, setTab] = useState<Tab>("Check");

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
                setApproveData(data);
                setOffset(newOffset);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };


    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        fetchData(0, search, tab);
    };

    const handleTabChange = (newTab: Tab) => {
        setTab(newTab);
        setOffset(0);
        setApproveData({ totalAll: 0, totals: {}, data: [] });
        fetchData(0, search, newTab);
    };



    const tabLabels: Record<Tab, string> = {
        Check: "Check",
        Approve: "Approve",
        All : "All-Report",
    };



    return (
        <div className="p-6 bg-white shadow-lg rounded-lg h-screen">
            <h2 className="flex justify-center items-center  text-4xl font-bold mb-5 text-gray-800 mt-4">Document Approval</h2>

            {/* Tabs */}
            <div className="flex mb-5 border-b border-gray-300">
                {(Object.keys(tabLabels) as Tab[]).map((t) => (
                    <button
                        key={t}
                        onClick={() => handleTabChange(t)}
                        className={`px-5 py-2 font-medium border-b-2 transition-colors duration-200 ${tab === t
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        {tabLabels[t]}
                    </button>
                ))}
            </div>


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
            <div className="mb-3 text-gray-600 font-medium">
                Total documents: <span className="text-blue-600">{approveData.totalAll}</span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto h-[60vh] custom-scrollbar rounded-lg shadow-sm border border-gray-200">
                <table className="min-w-full bg-white border-collapse text-black">
                    <thead className="bg-gray-100 ">
                        <tr>
                            <th className="text-left px-4 py-2 font-medium ">ID</th>
                            <th className="text-left px-4 py-2 font-medium ">Name</th>
                            <th className="text-left px-4 py-2 font-medium ">Source</th>
                            <th className="text-left px-4 py-2 font-medium ">Date</th>
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
                                    <td className="px-4 py-2 border-t border-gray-200">{doc.name}</td>
                                    <td className="px-4 py-2 border-t border-gray-200">{doc.source}</td>
                                    <td className="px-4 py-2 border-t border-gray-200">
                                        {doc.date ? new Date(doc.date).toLocaleDateString() : "-"}
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
        </div>
    );
}
