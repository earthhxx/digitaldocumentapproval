// pages/Userlogin/page.tsx
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import Link from "next/link";

export interface UserPayload {
  userId?: number | string;
  username?: string;
  fullName?: string;
  roles?: string[];
  permissions?: string[];
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
    return <p>Access Denied</p>;
  }

  // แสดงปุ่ม SSR navigate
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <p className="mb-4">ยินดีต้อนรับ {user.fullName}</p>
      <Link
        href="/pages/Userlogin/FM_IT_03"
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        เข้าสู่ FM_IT_03
      </Link>
    </div>
  );
}
