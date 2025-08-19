"use client";

import { useAuth } from "../../context/AuthContext";
import Link from "next/link";

export default function Home() {
  const { user } = useAuth();
  const roles = user?.roles || [];

  if (!user) {
    return (
      <div className="w-screen h-screen flex items-center justify-center text-2xl">
        Loading...
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col bg-gray-100">
      {/* Navbar */}
      <nav className="w-full flex justify-between items-center bg-white shadow p-4">
        <div className="font-bold text-lg">MyApp</div>
        <div className="flex gap-4">
          {roles.includes("admin") && <Link href="/admin">Admin</Link>}
          {roles.includes("user") && <Link href="/dashboard">Dashboard</Link>}
          <Link href="/profile">Profile</Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center text-6xl text-black text-center">
        WELCOME, {user.fullName || ""}
      </main>
    </div>
  );
}
