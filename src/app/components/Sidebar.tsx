// Sidebar.tsx
"use client";
import { useState } from "react";
import LoginForm from "./LoginForm";
import { jwtDecode } from "jwt-decode";

type DecodedToken = { roles: string };

export default function Sidebar() {
    const [roles, setRole] = useState<string | null>(() => {
        // อ่าน token ตอนแรก
        const token = localStorage.getItem("token");
        if (token) {
            try {
                console.log("Decoded role:", jwtDecode<DecodedToken>(token).roles);
                return jwtDecode<DecodedToken>(token).roles;
            } catch {
                return null;
            }
        }
        return null;
    });

    // ฟังก์ชันให้ LoginForm เรียกตอน login สำเร็จ
    const onLoginSuccess = (token: string) => {
        localStorage.setItem("token", token);
        try {
            const decoded = jwtDecode<DecodedToken>(token);
            console.log("Decoded roles:", decoded.roles);
            setRole(decoded.roles);
        } catch {
            setRole(null);
        }
    };

    return (
        <div className="h-screen w-64 bg-gray-800 text-white flex flex-col">
            <div className="p-4 border-b border-gray-700">
                <LoginForm onLoginSuccess={onLoginSuccess} />
            </div>

            <nav className="flex flex-col gap-2 p-4">
                <a href="/" className="hover:bg-gray-700 p-2 rounded">Home</a>
                {roles === "admin" && (
                    <a
                        href="/register-user"
                        className="hover:bg-gray-700 p-2 rounded text-green-400"
                    >
                        Register User
                    </a>
                )}
            </nav>
        </div>
    );
}
