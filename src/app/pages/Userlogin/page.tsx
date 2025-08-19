import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
// import Navbar from "@/components/Navbar";

export default async function LoginHomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  let user: any = null;
  if (token) {
    try {
      user = jwt.decode(token);
    } catch { }
  }

  return (
    <div className="w-screen h-screen flex flex-col bg-gray-100">
      {/* <Navbar user={user} /> */}

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center text-6xl text-black text-center">
        WELCOME, {user?.fullName || ""}
      </main>
    </div>
  );
}
