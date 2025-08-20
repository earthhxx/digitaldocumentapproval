// app/pages/Userlogin/FM_IT_03.tsx
import React from "react";
import FMModalTrigger from "./components/FMModalTrigger";
import type { UserPayload } from "../page";
import { redirect } from "next/navigation";

interface DataRow {
  id: string;
  Date?: string;
  NameThi?: string;
  NameEn?: string;
  DetailName?: string;
}

interface Column {
  key: keyof DataRow;
  label: string;
}

interface FM_IT_03Props {
  user: UserPayload;
}

const columns: Column[] = [
  { key: "Date", label: "วันที่ร้องขอ" },
  { key: "NameThi", label: "ชื่อThai" },
  { key: "NameEn", label: "ชื่อEN" },
  { key: "DetailName", label: "ข้อมูลรายละเอียด" },
];

function authCheck(user: UserPayload | null) {
  if (!user || !user.roles?.includes("user")) {
    redirect("/"); // SSR redirect
  }
}

export default async function FM_IT_03({ user }: FM_IT_03Props) {
  authCheck(user); // ✅ SSR auth check

  // SSR fetch data
  let data: DataRow[] = [];
  let error = "";
  try {
    const res = await fetch("http://localhost:2222/api/get-data", { cache: "no-store" });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "เกิดข้อผิดพลาด");
    data = Array.isArray(result) ? result : [];
  } catch (err: any) {
    data = [];
    error = err.message || "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์";
  }

  return (
    <div className="min-h-screen  bg-gradient-to-br from-blue-900 to-blue-700 font-['Kanit'] p-6">
      <div className="max-w-[90%] mx-auto ">
        <h1 className="text-3xl font-bold mb-6 text-white/90 text-center mt-6">
          เอกสารแจ้งซ่อมไอที
        </h1>

        {error && (
          <p className="text-red-400 text-center mb-4">{error}</p>
        )}

        {data.length > 0 ? (
          <div className="overflow-x-auto max-h-[80vh] custom-scrollbar bg-white/5 rounded-xl shadow-lg ">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white/20">
                <tr>
                  {columns.map((col) => (
                    <th key={col.key} className="px-4 py-3 text-white/90 font-semibold">
                      {col.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-white/90 font-semibold">เปิด PDF</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t border-white/10 hover:bg-white/10 transition-colors duration-200"
                  >
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3 text-white/80">
                        {col.key === "Date"
                          ? new Date(row[col.key] || "").toLocaleDateString("th-TH")
                          : row[col.key]}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <FMModalTrigger id={row.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !error && (
            <p className="text-white/70 text-center mt-6 text-lg">
              ไม่มีข้อมูล
            </p>
          )
        )}
      </div>
    </div>
  );
}
