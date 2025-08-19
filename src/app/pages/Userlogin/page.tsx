import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import FM_IT_03 from "./FM_IT_03";

interface UserPayload {
  userId?: number | string;
  username?: string;
  fullName?: string;
  roles?: string[];
}

// ฟังก์ชัน server component จะถูก SSR
export default async function FM_IT_03Page() {
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

  // ตรวจสิทธิ์
  if (!user || !user.roles?.includes("user")) {
    return <p>Access Denied</p>; // หรือ redirect
  }

  return <FM_IT_03 user={user} />; // ส่ง user เป็น prop
}
