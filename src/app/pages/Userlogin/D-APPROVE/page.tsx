// src/app/pages/Userlogin/D-APPROVE/page.tsx
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import DApproveTable from "./components/D_approvetable";
import type { UserPayload } from "@/app/types/types"; // แนะนำแยก type ไว้ไฟล์เฉพาะ
import { getDApproveData } from "@/lib/modules/DApproveModule";
import { GetupdateStatus } from "@/lib/modules/GetupdateStatus"

export default async function UserLoginPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  let user: UserPayload | null = null;
  if (token) {
    try {
      const decoded = jwt.decode(token);
      if (typeof decoded === "object" && decoded !== null) {
        user = decoded as UserPayload;
      }
    } catch { }
  }

  if (!user || !user.permissions?.includes("D_Approve")) {
    return <div>Access Denied</div>;
  }

  // 🔥 เรียก Module ตรง ๆ ไม่ fetch API
  const initialData = await getDApproveData({
    offset: 0,
    limit: 15,
    search: "",
    statusType: "Check_TAB",
    formaccess: user.formaccess || [],
    Dep: user.Dep || [],
  });
  console.log('ssr',initialData)
  const data = await GetupdateStatus(user.formaccess ?? [], user.Dep ?? []);

  return <DApproveTable initialData={initialData} user={user} AmountData={data} />;
}