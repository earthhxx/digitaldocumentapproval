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
    <aside className="fixed h-screen w-64 bg-gray-900/80 text-white">
      <div className="relative w-full h-full  flex flex-col justify-center items-center">

        <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
          <div className="opacity-50 p-15 bg-amber-50 rounded-full">
            <Image
              src="/images/LOGO3.png"
              alt="Watermark"
              width={150}
              height={150}
              style={{ objectFit: "contain" }}
              priority={true}
            />
          </div>
        </div>




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

          )

          }



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

        <div className="px-6 pb-4 border-b border-gray-700">
          {!isAuthenticated ? (
            <LoginForm onLoginSuccess={login} />
          ) : (
            <button
              onClick={logout}
              className="mt-2 w-full bg-red-600 hover:bg-red-700 rounded px-4 py-2 font-semibold"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
