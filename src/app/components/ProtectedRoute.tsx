"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth(); // ต้องมี isLoading จาก context ด้วย
  const router = useRouter();
  const pathname = usePathname();

  const publicPaths = ["/login", "/register"];

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !publicPaths.includes(pathname)) {
      router.replace("/");
      console.log("Redirecting to login because user is not authenticated");
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading) {
    // รอโหลดสถานะ auth ให้เสร็จก่อน
    return <div>Loading...</div>;
  }

  if (!isAuthenticated && !publicPaths.includes(pathname)) {
    return null; // หรือ <Loading /> แบบข้างบนก็ได้
  }

  return <>{children}</>;
}
