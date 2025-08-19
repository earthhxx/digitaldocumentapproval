"use client";

import { useEffect } from "react";
import { useAuth } from "../app/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/pages/Userlogin");
    }
  }, [user, router]);

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-gray-100 text-6xl text-black text-center">
      WELCOME
    </div>
  );
}
