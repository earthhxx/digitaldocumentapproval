// pages/Userlogin/page.tsx
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import FM_IT_03 from "./FM_IT_03";

interface UserPayload {
  userId?: number | string;
  username?: string;
  fullName?: string;
  roles?: string[];
}

export default async function UserLoginPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  let user: UserPayload | null = null;
  if (token) {
    try {
      user = jwt.decode(token) as UserPayload;
    } catch {
      user = null;
    }
  }

  if (!user || !user.roles?.includes("user")) {
    return <p>Access Denied</p>; // หรือ redirect ไปหน้า login
  }

  // ส่ง prop user ลงไปให้ FM_IT_03
  return <FM_IT_03 />;
}
