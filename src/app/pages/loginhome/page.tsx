"use client"
import { useAuth } from "../../context/AuthContext";

export default function Home() {
    const { user, login, logout, isAuthenticated } = useAuth();

    return (
        <div className="w-screen h-screen flex flex-col items-center justify-center bg-gray-100 text-6xl text-black text-center">
            <div>
                {user?.fullName ? `WELCOME, ${user.fullName}` : "WELCOME"}
            </div>
        </div>
    );
}
