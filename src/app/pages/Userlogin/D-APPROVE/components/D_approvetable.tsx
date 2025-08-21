// src/app/pages/Userlogin/D-APPROVE/components/D_approvetable.tsx
"use client";

import React, { useState, useEffect } from "react";

interface ApproveItem {
    id: number;
    NameThi: string;
    source: string;
}

interface ApproveData {
    totalAll: number;
    totals: Record<string, number>;
    data: ApproveItem[];
    error?: string;
}

export interface UserPayload {
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
    const [error, setError] = useState("");
    const [approveData, setApproveData] = useState<ApproveData>(initialData);

    const fetchData = async (newOffset = 0, query = "") => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/D-approve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    offset: newOffset,
                    limit,
                    search: query,
                    statusType: "check",       // เพิ่มให้ตรงกับ module
                    permissions: user.permissions || [], // ต้องส่งมาด้วย
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setApproveData(data);
                setOffset(newOffset);
            } else {
                setError("Failed to fetch data");
            }
        } catch (err) {
            console.error(err);
            setError("Server error");
        } finally {
            setLoading(false);
        }
    };

    // --- Debounced search ---
    useEffect(() => {
        const timer = setTimeout(() => fetchData(0, search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    // --- Pagination handlers ---
    const handlePrev = () => {
        if (offset - limit >= 0) fetchData(offset - limit, search);
    };
    const handleNext = () => {
        if (offset + limit < approveData.totalAll) fetchData(offset + limit, search);
    };

    return (
        <div className="p-4 bg-white shadow rounded">
            <h2 className="text-xl font-semibold mb-4">Document Approval</h2>

            {/* Error */}
            {error && <div className="text-red-500 mb-2">{error}</div>}

            {/* Search */}
            <div className="mb-4 flex gap-2">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by Name..."
                    className="border border-gray-300 rounded px-3 py-1 flex-1"
                />
            </div>

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
                                    <td className="border border-gray-300 px-3 py-1">{doc.NameThi}</td>
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
                    onClick={handlePrev}
                    disabled={offset === 0 || loading}
                    className={`px-3 py-1 rounded ${offset === 0 || loading
                        ? "bg-gray-200 cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                        }`}
                >
                    Previous
                </button>
                <button
                    onClick={handleNext}
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
