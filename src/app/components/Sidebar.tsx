"use client";
import { useState, useEffect } from "react";
import LoginForm from "./LoginForm";
import { jwtDecode } from "jwt-decode";

type DecodedToken = {
    roles: string; // ถ้าเป็น array ใช้ string[]
};

export default function Sidebar() {
    const [roles, setRoles] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode<DecodedToken>(token);
                setRoles(decoded.roles);
            } catch {
                setRoles(null);
            }
        }
    }, []);

    const onLoginSuccess = (token: string) => {
        localStorage.setItem("token", token);
        try {
            const decoded = jwtDecode<DecodedToken>(token);
            console.log("Decoded roles:", decoded.roles);
            setRoles(decoded.roles);  // <-- แก้จาก setRole เป็น setRoles
        } catch {
            setRoles(null);
        }
    };

    return (
        <div className="h-screen w-64 bg-gray-800 text-white flex flex-col">
            <div className="p-4 border-b border-gray-700">
                <LoginForm onLoginSuccess={onLoginSuccess} />
            </div>

            <nav className="flex flex-col gap-2 p-4">
                <a href="/" className="hover:bg-gray-700 p-2 rounded">
                    Home
                </a>
                {roles?.includes("admin") && (
                    <a
                        href="/register-user"
                        className="hover:bg-gray-700 p-2 rounded text-green-400"
                    >
                        Register User
                    </a>
                )}
                {roles?.includes("user") && (
                    <a
                        href="/contracts"
                        className="hover:bg-gray-700 p-2 rounded text-green-400"
                    >
                        contracts
                    </a>
                )}
            </nav>
        </div>
    );
}
