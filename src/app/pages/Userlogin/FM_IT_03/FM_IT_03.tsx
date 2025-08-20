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
  { key: "DetailName", label: "ข้อมูลรายระเอียด" },
];

function authCheck(user: UserPayload | null) {
  if (!user || !user.roles?.includes("IT")) {
    redirect("/"); // SSR redirect
  }
}

export default async function FM_IT_03({ user }: FM_IT_03Props) {
  authCheck(user); // ✅ รันบน server ก่อน render
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
    <div className="p-6 bg-gray-50 min-h-screen font-['Kanit']">
      <h1 className="text-3xl font-semibold mb-6 text-gray-900">เอกสารแจ้งซ่อมไอที</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {data.length > 0 ? (
        <div className="overflow-x-auto rounded-lg shadow-md">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100">
              <tr>
                {columns.map((col) => (
                  <th key={col.key} className="px-4 py-3 text-gray-700 font-medium">{col.label}</th>
                ))}
                <th className="px-4 py-3 text-gray-700 font-medium">เปิด PDF</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id} className="border-t hover:bg-gray-50 transition-colors duration-200">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      {col.key === "Date"
                        ? new Date(row[col.key] || "").toLocaleDateString("th-TH")
                        : row[col.key]}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    {/* Client Component: เปิด modal เฉพาะ row */}
                    <FMModalTrigger id={row.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !error && <p className="text-gray-500">ไม่มีข้อมูล</p>
      )}
    </div>
  );
}
