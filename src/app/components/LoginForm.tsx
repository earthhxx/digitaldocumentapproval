// LoginForm.tsx
"use client";
import { useState } from "react";
import { setCookie } from "cookies-next"; // ถ้าใช้ Next.js + cookies-next library

type Props = {
    onLoginSuccess: (token: string) => void;
};

export default function LoginForm({ onLoginSuccess }: Props) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const clearForm = () => {
        setUsername("");
        setPassword("");
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await fetch("/api/Login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (res.ok && data.token) {
                // เก็บ token ลง cookie (HttpOnly, Secure)
                setCookie("auth_token", data.token, {
                    httpOnly: true,   // ป้องกัน JS เข้าถึง
                    secure: process.env.NODE_ENV === "production", // ส่งเฉพาะ HTTPS
                    path: "/",        // cookie ใช้ได้ทุกหน้า
                    sameSite: "strict",
                    maxAge: 60 * 60 * 24 * 7, // 7 วัน
                });

                // ล้างฟอร์ม
                clearForm();

                // แจ้งผู้ใช้ว่า login สำเร็จ
                alert("Login สำเร็จ");

                // แจ้ง Sidebar ว่า login สำเร็จ (สามารถอ่านจาก cookie ใน layout/SSR ได้)
                onLoginSuccess(data.token);

            } else {
                alert(data.error || "Login ล้มเหลว");
                clearForm(); // ล้างฟอร์มเมื่อ login ล้มเหลว
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
                <button className="bg-green-900 rounded-4xl px-4 py-2 w-[50%]" type="submit">Login</button>
            </div>
        </form>
    );
}
