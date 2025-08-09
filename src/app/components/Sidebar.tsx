"use client";
import { useState, useEffect } from "react";
import LoginForm from "./LoginForm";
import { jwtDecode } from "jwt-decode";

type DecodedToken = {
    roles: string; // ถ้าเป็น array ใช้ string[]
    userId: string;
    fullName: string;
};

export default function Sidebar() {
    const [roles, setRoles] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [fullName, setFullName] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode<DecodedToken>(token);
                setRoles(decoded.roles);
                setUsername(decoded.userId);
                setFullName(decoded.fullName);
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
            setUsername(decoded.userId);
            setFullName(decoded.fullName);
        } catch {
            setRoles(null);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        setRoles(null);
    };


    return (
        <div className="h-screen w-64 bg-gray-800 text-white flex flex-col">
            <div className="p-4 border-b border-gray-700">
                {!roles ? (
                    <LoginForm onLoginSuccess={onLoginSuccess} />
                ) : (
                    <div className="p-2">
                        Welcome, you are logged in!
                        {/* อาจมีปุ่ม Logout เพิ่มได้ */}
                    </div>
                )}
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
                {roles && (
                    <button
                        onClick={handleLogout}
                        className="mt-2 bg-red-600 px-3 py-1 rounded"
                    >
                        Logout
                    </button>
                )}
                {roles && (
                    <>
                        <div className="  mt-2 text-sm text-gray-400">
                            Roles: {roles}
                        </div>
                        <div className="  mt-2 text-sm text-gray-400">
                            UserName : {username}
                        </div>
                        <div className="  mt-2 text-sm text-gray-400">
                            FullName : {fullName}
                        </div>
                    </>
                )}

            </nav>
        </div>
    )
}
