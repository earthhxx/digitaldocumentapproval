"use client";
import LoginForm from "./LoginForm";
import { useAuth } from "../context/AuthContext";
import Image from "next/image";

export default function Sidebar() {
  const { user, login, logout, isAuthenticated } = useAuth();

  // ดึงข้อมูลจาก user (ถ้าไม่มี ให้เป็นค่าดีฟอลต์)
  const roles = user?.roles || [];
  const userId = user?.userId || "";
  const fullName = user?.fullName || ""; // หรือเปลี่ยนเป็น fullName ถ้า token มี field นี้

  return (
    <aside className="fixed h-screen w-64 bg-gray-900 text-white">
      <div className="relative w-full h-full  flex flex-col justify-center items-center">
        {!isAuthenticated && (
          <div className="absolute inset-0 flex flex-col justify-center items-center">
            {/* ลายน้ำหมุน */}
            <div
              className="relative mb-6 w-[150px] h-[150px] "
            >
              <div className="absolute flex justify-center items-center pb-4 inset-0 rounded-full bg-white opacity-80 shadow-2xl animate-spin-coin-reverse preserve-3d">
                {/* ด้านหน้า */}
                <Image
                  src="/images/LOGO3.png"
                  alt="Watermark"
                  width={110}
                  height={110}
                  style={{ objectFit: "contain", backfaceVisibility: "hidden" }}
                  className=""
                  priority={true}
                />
              </div>
            </div>

            {/* ฟอร์มล็อกอิน */}
            <LoginForm onLoginSuccess={login} />
          </div>
        )}





        {isAuthenticated && (
          <div className="p-6 text-center">
            <p className="text-lg font-semibold">Welcome</p>
            <p className="text-lg">{fullName || userId}</p>
          </div>
        )}

        <nav className="flex flex-col gap-3 p-6 flex-1">

          {/* pulbic */}
          {isAuthenticated && (
            <a href="/" className="hover:bg-gray-700 bg-gray-700/30 p-3 rounded font-medium">
              Home
            </a>

          )}

          {/* // admin */}
          {roles.includes("admin") && (
            <a
              href="/register-user"
              className="hover:bg-green-700 bg-green-700/30 p-3 rounded font-medium text-green-400"
            >
              Register User
            </a>
          )}

          {/* //per role */}
          {roles.includes("user") && (
            <a
              href="/contracts"
              className="hover:bg-green-700 p-3 rounded font-medium text-green-400"
            >
              Contracts
            </a>
          )}
        </nav>

        {isAuthenticated && (
          <div className="px-6 pt-4 pb-2 border-t border-gray-700 text-gray-400 text-sm space-y-1">
            <div>
              <span className="font-semibold">Roles:</span> {roles.join(", ")}
            </div>
            <div>
              <span className="font-semibold">User ID:</span> {userId}
            </div>
            <div>
              <span className="font-semibold">Full Name:</span> {fullName}
            </div>
          </div>
        )}

        {isAuthenticated && (
          <button
            onClick={logout}
            className="mt-2 w-[80%] bg-red-600 hover:bg-red-700 px-8 py-2 font-semibold rounded-sm mb-4"
          >
            Logout
          </button>
        )}
      </div>
    </aside>
  );
}
