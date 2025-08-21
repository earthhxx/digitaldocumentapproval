// src/app/pages/Userlogin/D-APPROVE/page.tsx
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import DApproveTable from "./components/D_approvetable";
import type { UserPayload, ApproveData } from "@/app/types/types"; // แนะนำแยก type ไว้ไฟล์เฉพาะ
import { getDApproveData } from "@/lib/modules/DApproveModule";

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

  if (!user || !user.roles?.includes("user")) {
    return <div>Access Denied</div>;
  }

  // 🔥 เรียก Module ตรง ๆ ไม่ fetch API
  const initialData = await getDApproveData({
    offset: 0,
    limit: 10,
    search: "",
    statusType: "check",
    permissions: user.permissions || [],
  });
  console.log(initialData)

  return <DApproveTable initialData={initialData} user={user} />;
}