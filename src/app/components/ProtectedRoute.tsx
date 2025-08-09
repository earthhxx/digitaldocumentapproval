"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // รายการ path ที่ไม่ต้องล็อกอิน
  const publicPaths = ["/login", "/register"];

  useEffect(() => {
    if (!isAuthenticated && !publicPaths.includes(pathname)) {
      router.replace("/login"); // redirect ไปหน้า login
    }
  }, [isAuthenticated, pathname, router]);

  // รอโหลด หรือไม่ผ่าน ให้ return null หรือ loading state
  if (!isAuthenticated && !publicPaths.includes(pathname)) {
    return null;
  }

  return <>{children}</>;
}
