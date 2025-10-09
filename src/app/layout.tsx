import type { Metadata } from "next";
import Sidebar from "./components/Sidebar";
import { Geist, Geist_Mono, Kanit } from "next/font/google";
import { cookies } from "next/headers"; // สำหรับ SSR cookie
import { getDashboardConnection } from "@/lib/db";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import sql from "mssql";
import ResetPasswordModal from "./components/ForgetPass";

import { User } from "@/app/types/types"; // ใช้ path ที่ถูกกับโปรเจกต์ของคุณ


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "IM D-APPROVE",
  description: "PDF Approval System",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // --- SSR: อ่าน cookie ---
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session_id")?.value;

  let initialUser: User | null = null;

  // --- ดึงข้อมูล user จาก sessionId ---
  if (sessionId) {
    try {
      const pool = await getDashboardConnection();

      // ดึงข้อมูล session และ user จากฐานข้อมูล ตาม sessionId
      const sessionResult = await pool.request()
        .input("sessionId", sql.NVarChar, sessionId)
        .query(`
    SELECT data
    FROM Sessions
    WHERE session_id = @sessionId AND expires > GETDATE()
  `);

      if (sessionResult.recordset.length > 0) {
        const rawData = sessionResult.recordset[0].data;
        const parsed = JSON.parse(rawData);

        initialUser = {
          userId: parsed.userId,
          fullName: parsed.fullName,
          roles: parsed.roles || [],
          permissions: parsed.permissions || [],
          ForgetPass: parsed.ForgetPass,
        };
      }
    } catch (error) {
      console.error("Error fetching session user:", error);
      initialUser = null;
    }
  }

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${kanit.variable} font-sans bg-gray-100`}
      >
        <AuthProvider initialUser={initialUser}>
          <div className="flex flex-col min-h-screen w-screen">
            {/* ClientOnly modal */}

            <ResetPasswordModal
            />

            <Sidebar />
            <main className="flex-1 flex flex-col overflow-hidden">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
