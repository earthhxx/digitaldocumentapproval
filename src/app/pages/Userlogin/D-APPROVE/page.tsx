// pages/Userlogin/page.tsx
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import React from "react";
import DApproveTable from "./components/D_approvetable";

export interface UserPayload {
  userId?: number | string;
  username?: string;
  fullName?: string;
  roles?: string[];
  permissions?: string[];
}

interface ApproveData {
  totalAll: number;
  totals: Record<string, number>;
  data: { id: number; name: string; source: string }[];
}
interface DApproveTableProps {
  user: UserPayload;
  initialData: ApproveData;
}

export default async function UserLoginPage() {
  // --- 1. อ่าน cookie ---
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  // --- 2. decode JWT ---
  let user: UserPayload | null = null;
  if (token) {
    try {
      user = jwt.decode(token) as UserPayload;
    } catch {
      user = null;
    }
  }

  // --- 3. ตรวจสิทธิ์ ---
  if (!user || !user.roles?.includes("user")) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-red-600 text-xl font-semibold">Access Denied</p>
      </div>
    );
  }

  // --- 4. fetch data จาก API (dynamic table + permissions) ---
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/D-approve/D-approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ offset: 0, limit: 10, search: "" }),
    credentials: "include", // ✅ cookie httpOnly จะถูกส่งไปด้วย
  });

  let approveData: ApproveData = { totalAll: 0, totals: {}, data: [] };
  if (res.ok) {
    approveData = await res.json();
  }

  // --- 5. ส่ง data เป็น props ให้ component SPA ---
  return (
    <DApproveTable user={user} initialData={approveData} />
  );
}