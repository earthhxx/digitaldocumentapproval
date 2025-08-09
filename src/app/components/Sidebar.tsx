"use client";
import { useState, useEffect } from "react";
import LoginForm from "./LoginForm";
import { jwtDecode } from "jwt-decode";

type DecodedToken = {
    roles: string; // หรือ string[] ถ้าเป็น array
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
                setUsername(null);
                setFullName(null);
            }
        }
    }, []);

    const onLoginSuccess = (token: string) => {
        localStorage.setItem("token", token);
        try {
            const decoded = jwtDecode<DecodedToken>(token);
            setRoles(decoded.roles);
            setUsername(decoded.userId);
            setFullName(decoded.fullName);
        } catch {
            setRoles(null);
            setUsername(null);
            setFullName(null);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        setRoles(null);
        setUsername(null);
        setFullName(null);
    };

    return (
        <aside className="h-screen w-64 bg-gray-900 text-white flex flex-col">
            {roles && (
                <div className="p-6 text-center">
                    <p className="text-lg font-semibold">Welcome</p>
                    <p className="text-lg">{fullName || username}</p>
                </div>
            )}

            <nav className="flex flex-col gap-3 p-6 flex-1">
                <a
                    href="/"
                    className="hover:bg-gray-700 p-3 rounded font-medium transition-colors"
                >
                    Home
                </a>

                {roles?.includes("admin") && (
                    <a
                        href="/register-user"
                        className="hover:bg-green-700 p-3 rounded font-medium text-green-400 transition-colors"
                    >
                        Register User
                    </a>
                )}

                {roles?.includes("user") && (
                    <a
                        href="/contracts"
                        className="hover:bg-green-700 p-3 rounded font-medium text-green-400 transition-colors"
                    >
                        Contracts
                    </a>
                )}
            </nav>

            {roles && (
                <div className="px-6 pt-4 pb-2 border-t border-gray-700 text-gray-400 text-sm space-y-1">
                    <div>
                        <span className="font-semibold">Roles:</span> {roles}
                    </div>
                    <div>
                        <span className="font-semibold">User ID:</span> {username}
                    </div>
                    <div>
                        <span className="font-semibold">Full Name:</span> {fullName}
                    </div>
                </div>
            )}
            <div className="px-6 pb-4 border-b border-gray-700">
                {!roles ? (
                    <LoginForm onLoginSuccess={onLoginSuccess} />
                ) : (
                    <div className="space-y-2">
                        <button
                            onClick={handleLogout}
                            className="mt-2 w-full bg-red-600 hover:bg-red-700 transition-colors rounded px-4 py-2 font-semibold"
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </aside>
    );
}
