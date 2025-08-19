"use client";
import { useState } from "react";
import { setCookie } from "cookies-next";
import { jwtDecode } from "jwt-decode";

type Props = {
    onLoginSuccess: (token: string, user: { userId: string; fullName: string; roles: string[] }) => void;
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

            if (res.ok && data.token) {
                // เก็บ token ลง cookie
                setCookie("auth_token", data.token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    path: "/",
                    sameSite: "strict",
                    maxAge: 60 * 60 * 24 * 7,
                });

                // decode token เพื่อสร้าง user object
                const decoded = jwtDecode<{ userId: string; fullName: string; roles: string | string[] }>(data.token);
                const user = {
                    userId: decoded.userId,
                    fullName: decoded.fullName,
                    roles: Array.isArray(decoded.roles) ? decoded.roles : [decoded.roles],
                };

                clearForm();
                alert("Login สำเร็จ");

                // แจ้ง AuthProvider / Sidebar ทันที
                onLoginSuccess(data.token, user);
            } else {
                alert(data.error || "Login ล้มเหลว");
                clearForm();
            }
        } catch (error) {
            alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
            console.error(error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 z-50">
            <input
                className="rounded-4xl px-4 py-2 bg-amber-50/10"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
            />
            <input
                className="rounded-4xl px-4 py-2 bg-amber-50/10"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
            />
            <div className="flex justify-center items-center w-full">
                <button className="bg-green-900 rounded-4xl px-4 py-2 w-[50%]" type="submit">
                    Login
                </button>
            </div>
        </form>
    );
}
