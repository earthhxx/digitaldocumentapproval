// LoginForm.tsx
"use client";
import { useState } from "react";

type Props = {
    onLoginSuccess: (token: string) => void;
};

export default function LoginForm({ onLoginSuccess }: Props) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

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
                // เก็บ token ลง localStorage
                localStorage.setItem("token", data.token);

                // แจ้ง Sidebar ว่า login สำเร็จ พร้อมส่ง token
                onLoginSuccess(data.token);
            } else {
                alert(data.error || "Login ล้มเหลว");
            }
        } catch (error) {
            alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
            console.error(error);
        }
    };


    return (
        <form onSubmit={handleSubmit}>
            <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
            />
            <button type="submit">Login</button>
        </form>
    );
}
