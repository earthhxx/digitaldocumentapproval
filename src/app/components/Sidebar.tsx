"use client";
import LoginForm from "./LoginForm";
import { useAuth } from "../context/AuthContext";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";


export default function Sidebar() {
  const { user, login, logout, isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(true);

  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  const roles = user?.roles || [];
  const userId = user?.userId || "";
  const fullName = user?.fullName || "";

  // ปิด Sidebar ถ้ากดข้างนอก
  const handleClickOutside = (e: MouseEvent) => {
    if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (!mounted) return null;

  return (
    <>
      
        {/* Hamburger ปุ่มเปิด Sidebar */}
        {!open && (
          <button
            onClick={() => setOpen(true)}
            className="fixed flex justify-center items-center top-4 left-4 z-50 p-1 text-xl text-white bg-white/40 rounded-xl px-3 py-2 hover:bg-green-400"
          >
            <div className="flex flex-col justify-between w-8 h-6 p-1">
              <span className="block h-1 bg-white rounded"></span>
              <span className="block h-1 bg-white rounded"></span>
              <span className="block h-1 bg-white rounded"></span>
            </div>
            <div className="flex flex-col justify-center items-center mt-[0.5]">
              MENU
            </div>

          </button>
        )}

        {/* Overlay */}
        <div
          className={`fixed inset-0 z-40 bg-black transition-opacity duration-300 ${open ? "opacity-40 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
        ></div>

        {/* Sidebar */}
        <aside
          ref={sidebarRef}
          className={`fixed h-screen w-64 bg-gray-900 text-white z-50 transform transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          <div className="relative w-full h-full flex flex-col justify-center items-center">

            {!isAuthenticated && (
              <div className="absolute inset-0 flex flex-col justify-center items-center">
                <div className="relative mb-6 w-[150px] h-[150px]">
                  <div className="absolute flex justify-center items-center pb-4 inset-0 rounded-full bg-white opacity-80 shadow-2xl animate-spin-coin-reverse preserve-3d">
                    <Image
                      src="/images/LOGO3.png"
                      alt="Watermark"
                      width={110}
                      height={110}
                      style={{ objectFit: "contain", backfaceVisibility: "hidden" }}
                      priority={true}
                    />
                  </div>
                </div>

                <LoginForm onLoginSuccess={login} />
              </div>
            )}

            {isAuthenticated && (
              <div className="p-6 text-center">
                <p className="text-lg font-semibold">Welcome</p>
                <p className="text-lg">{fullName || userId}</p>
              </div>
            )}

            <nav className="flex flex-col gap-3 p-6 flex-1 w-full">
              {isAuthenticated && (
                <a
                  href="/"
                  className="hover:bg-gray-700 bg-gray-700/30 p-3 rounded font-medium"
                >
                  Home
                </a>
              )}
              {roles.includes("admin") && (
                <a
                  href="/pages/admin"
                  className="hover:bg-green-700 bg-green-700/30 p-3 rounded font-medium text-green-400"
                >
                  Admin Panel
                </a>
              )}
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
      
    </>
  );
}
