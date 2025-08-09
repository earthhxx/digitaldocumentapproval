import type { Metadata } from "next";
import Sidebar from "./components/Sidebar";
import { AuthProvider } from "../app/context/AuthContext";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "My App",
  description: "PDF Approval System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased w-full h-screen flex`}
      >
        <AuthProvider>
          <Sidebar />
          <main className="flex-1">
            <ProtectedRoute>
              {children}
            </ProtectedRoute>
          </main>
        </AuthProvider>

      </body>
    </html>
  );
}
