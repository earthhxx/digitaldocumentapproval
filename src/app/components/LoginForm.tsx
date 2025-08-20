"use client";
import { useState } from "react";
import { User } from "./Sidebar"; // import type User ให้ตรงกับ Sidebar

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
                // ส่ง User object ไป Sidebar เพื่อ set state
                onLoginSuccess({
                    userId: data.userId,
                    fullName: data.fullName,
                    roles: data.roles,
                    permissions: data.permsissions,
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
