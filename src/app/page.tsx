// app/page.tsx
"use client";
import { useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import type { User } from "./components/Sidebar";
import { motion } from "framer-motion";
import Image from "next/image";
import LoginForm from "../app/components/LoginForm";

interface HomePageProps {
  initialUser?: User;
}

export default function HomePage({ initialUser }: HomePageProps) {
  const { user, login, setOpen } = useAuth();

  useEffect(() => {
    if (initialUser && !user) {
      login(initialUser);
    }
  }, [initialUser, login, user]);

  const displayUser = user || initialUser;

  return (
    <div className="relative flex justify-center items-center w-full min-h-screen bg-black">
      {/* Background Image */}
      <Image
        src="/images/tai_img1.jpg"
        alt="App Background"
        fill
        className="object-cover rounded-[60px] opacity-90"
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 bg-white/70 backdrop-blur-[10px] rounded-2xl shadow-lg max-w-[800px] w-[40%] text-center border border-gray-200 p-8 px-4 flex flex-col md:flex-row items-center"
      >
        {/* Version */}
        <div className="absolute top-4 right-4 text-sm text-black">
          v1.0.0
        </div>

        {/* Left: Logo */}
        <div className="flex flex-col items-center justify-center gap-4 w-1/3 ms-4">
          <div className="flex-shrink-0 w-40 h-40 md:w-44 md:h-44 mb-6">
            <div className="relative w-full h-full rounded-full bg-white opacity-80 shadow-2xl animate-spin-coin-reverse flex justify-center items-center">
              <Image src="/images/LOGO3.png" alt="Watermark" width={120} height={120} style={{ objectFit: "contain", backfaceVisibility: "hidden" }} priority />
            </div>
          </div>
        </div>
        {/* Right: Content */}
        <div className="flex flex-col items-center justify-center gap-4 w-2/3 px-4">
          {displayUser && (
            <>
              <h1 className="text-4xl font-sans font-thin text-black">
                Welcome
              </h1>
              <h2 className="text-2xl font-bold text-black/80">
                {displayUser.fullName}
              </h2>

              {/* Open Sidebar Button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setOpen(true)}
                className="mt-2 px-6 py-3 rounded-3xl bg-blue-200 hover:bg-blue-900 text-blue-900 shadow-md transition font-medium"
              >
                Open Menu
              </motion.button>
            </>
          )}

          {!displayUser && (
            <>
              <LoginForm onLoginSuccess={(loggedUser) => login(loggedUser)} />
              <p className="mt-2 text-sm text-black/70 ">
                กรุณาเข้าสู่ระบบเพื่อเข้าถึงเมนูของคุณ
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
