"use client";
import { useState } from "react";
import { User } from "./Sidebar";

type Props = {
    onLoginSuccess: (loggedUser: User) => void;
};

export default function LoginForm({ onLoginSuccess }: Props) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const clearForm = () => {
        setUsername("");
        setPassword("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await fetch("/api/Login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (res.ok) {
                clearForm();
                onLoginSuccess({
                    userId: data.User_Id,
                    fullName: data.fullName,
                    roles: data.roles,
                    permissions: data.permissions,
                });
            } else {
                alert(data.error || "Login ล้มเหลว ❌");
                clearForm();
            }
        } catch (error) {
            alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
            console.error(error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col z-50 w-full max-w-[400px] mx-auto py-2 mt-6">
            {/* Username */}
            <label className="text-[18px] font-sans font-light text-start text-gray-800 ms-1 mb-1">Username</label>
            <input
                className="rounded-md px-4 py-2 mb-4 bg-white/80 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder-gray-500 text-gray-900"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="รหัสพนักงาน เช่น 1234"
                required
            />

            {/* Password */}
            <label className="text-[16px] font-sans font-light text-start text-gray-800 ms-1 mb-1">Password</label>
            <input
                className="rounded-md px-4 py-2 mb-4 bg-white/80 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder-gray-500 text-gray-900"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
            />

            {/* Submit Button */}
            <button
                type="submit"
                className="bg-white hover:bg-blue-900 hover:text-white text-black rounded-3xl px-6 py-3 w-full shadow-md transition font-medium mt-2"
            >
                Login
            </button>
        </form>
    );
}
