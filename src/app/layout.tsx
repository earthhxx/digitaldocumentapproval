import type { Metadata } from "next";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import Sidebar from "./components/Sidebar";
import { AuthProvider, User } from "./context/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "My App",
  description: "PDF Approval System",
};

async function getUserFromCookie(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) return null;

  try {
    const decoded = jwt.decode(token) as { userId: string; fullName: string; roles: string[] };
    return decoded ? { userId: decoded.userId, fullName: decoded.fullName, roles: decoded.roles } : null;
  } catch {
    return null;
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getUserFromCookie();

  return (
    <html lang="en">
      <body className="flex w-full h-screen">
        <AuthProvider initialUser={user}>
          <Sidebar />
          <main className="flex-1 overflow-auto">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
