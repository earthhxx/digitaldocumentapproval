"use client";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect, useRef } from "react";

export default function Sidebar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(true);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  const roles = user?.roles || [];
  const fullName = user?.fullName || "";
  const userId = user?.userId || "";

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
        <button onClick={() => setOpen(true)} className="fixed top-4 left-4 z-50 p-2 bg-white text-black rounded shadow">
          MENU
        </button>
      )}

      <aside
        ref={sidebarRef}
        className={`fixed h-screen w-64 bg-gray-900 text-white z-50 transform transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6">
          {isAuthenticated ? (
            <>
              <p className="text-lg font-semibold">Welcome {fullName || userId}</p>
              <nav className="mt-4 flex flex-col gap-3">
                <a href="/pages/loginhome" className="hover:bg-gray-700 p-2 rounded">Home</a>
                {roles.includes("admin") && <a href="/pages/admin" className="hover:bg-green-700 p-2 rounded">Admin Panel</a>}
                {roles.includes("user") && <a href="/pages/dashboard" className="hover:bg-green-700 p-2 rounded">Test</a>}
              </nav>
              <button onClick={logout} className="mt-4 w-full bg-red-600 hover:bg-red-700 p-2 rounded">Logout</button>
            </>
          ) : (
            <p className="text-center">Please login</p>
          )}
        </div>
      </aside>
    </>
  );
}
