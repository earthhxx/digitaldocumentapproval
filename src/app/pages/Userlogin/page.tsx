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
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-red-600 text-xl font-semibold">Access Denied</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 text-white font-['Kanit'] px-6">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-10 mt-[5%] w-[70%] text-center ">
        <h1 className="text-4xl font-bold mb-6 tracking-wider uppercase">
          D-Approve
        </h1>
        <p className="mb-8 text-blue-100/90">
          ยินดีต้อนรับ {user.fullName} <br />
          เลือกเอกสารเพื่อดำเนินการ
        </p>
        <div className="grid grid-cols-5 gap-4 overflow-auto max-h-[80vh] custom-scrollbar">
          <Link
            href="/pages/Userlogin/FM_IT_03"
            className=" inline-block px-6 py-3 bg-blue-600 hover:bg-blue-500 transition-colors rounded-lg text-lg font-semibold shadow-md"
          >
            FM_IT_03 - 1
          </Link>
          <Link
            href="/pages/Userlogin/FM_IT_03"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-500 transition-colors rounded-lg text-lg font-semibold shadow-md"
          >
            FM_IT_03 - 2
          </Link>
          <Link
            href="/pages/Userlogin/FM_IT_03"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-500 transition-colors rounded-lg text-lg font-semibold shadow-md"
          >
            FM_IT_03 - 3
          </Link>
        </div>
      </div>
    </div>
  );
}
