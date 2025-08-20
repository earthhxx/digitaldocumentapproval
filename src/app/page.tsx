// app/page.tsx
"use client"
import { useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import type { User } from "./components/Sidebar";

interface HomePageProps {
  initialUser?: User;
}

export default function HomePage({ initialUser }: HomePageProps) {
  const { user, login } = useAuth();

  // SSR: set initialUser เป็นค่าเริ่มต้นใน context
  useEffect(() => {
    if (initialUser && !user) {
      login(initialUser);
    }
  }, [initialUser, login, user]);

  const displayUser = user || initialUser;

  return (
    <div className="flex flex-col justify-center items-center w-full h-full bg-gradient-to-br from-blue-900 to-blue-700">
      <h1 className="text-3xl font-bold">
        Welcome {displayUser ? displayUser.fullName : "Guest"}!
      </h1>
      <p>Your roles: {displayUser ? displayUser.roles.join(", ") : "none"}</p>
    </div>
  );
}
