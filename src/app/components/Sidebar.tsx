"use client";
import LoginForm from "./LoginForm";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";

export interface User { userId: string; fullName: string; roles: string[]; }

export default function Sidebar() {
  const { user, login, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(true);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  const roles = user?.roles || [];
  const userId = user?.userId || "";
  const fullName = user?.fullName || "";

  const handleClickOutside = (e: MouseEvent) => {
    if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    if (open) document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (!mounted) return null;

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 bg-white text-black rounded shadow-md"
        >
          ☰ MENU
        </button>
      )}

      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${open ? "opacity-40 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
      ></div>

      <aside
        ref={sidebarRef}
        className={`fixed h-screen w-64 bg-gray-900 text-white z-50 transform transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="relative w-full h-full flex flex-col justify-center items-center">
          {!user && (
            <div className="absolute inset-0 flex flex-col justify-center items-center">
              <div className="relative mb-6 w-[150px] h-[150px]">
                <div className="absolute flex justify-center items-center pb-4 inset-0 rounded-full bg-white opacity-80 shadow-2xl animate-spin-coin-reverse preserve-3d">
                  <Image
                    src="/images/LOGO3.png"
                    alt="Watermark"
                    width={110}
                    height={110}
                    style={{ objectFit: "contain", backfaceVisibility: "hidden" }}
                    priority
                  />
                </div>
              </div>

              <LoginForm
                onLoginSuccess={(loggedUser) => login(loggedUser)}
              />
            </div>
          )}

          {user && (
            <>
              <div className="p-6 text-center">
                <p className="text-lg font-semibold">Welcome</p>
                <p className="text-lg">{fullName || userId}</p>
              </div>

              <nav className="flex flex-col gap-3 p-6 flex-1 w-full">
                <a href="/" className="hover:bg-gray-700 bg-gray-700/30 p-3 rounded font-medium">Home</a>
                {roles.includes("admin") && (
                  <a href="/pages/admin" className="hover:bg-green-700 bg-green-700/30 p-3 rounded font-medium text-green-400">
                    Admin Panel
                  </a>
                )}
                {roles.includes("user") && (
                  <a href="/pages/dashboard" className="hover:bg-green-700 p-3 rounded font-medium text-green-400">
                    Dashboard
                  </a>
                )}
              </nav>

              <div className="px-6 pt-4 pb-2 border-t border-gray-700 text-gray-400 text-sm space-y-1">
                <div><span className="font-semibold">Roles:</span> {roles.join(", ")}</div>
                <div><span className="font-semibold">User ID:</span> {userId}</div>
                <div><span className="font-semibold">Full Name:</span> {fullName}</div>
              </div>

              <button
                onClick={logout}
                className="mt-2 w-[80%] bg-red-600 hover:bg-red-700 px-8 py-2 font-semibold rounded-sm mb-4"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
