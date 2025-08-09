import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import LoginForm from "./LoginForm";

type DecodedToken = {
    username: string;
    role: string; // เช่น "admin", "user"
    exp: number;
};

export default function Sidebar() {
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode<DecodedToken>(token);
                setRole(decoded.role);
            } catch (err) {
                console.error("Invalid token", err);
            }
        }
    }, []);

    return (
        <div className="h-screen w-64 bg-gray-800 text-white flex flex-col">
            <div className="p-4 border-b border-gray-700">
                <LoginForm />
            </div>

            <nav className="flex flex-col gap-2 p-4">
                <a href="/" className="hover:bg-gray-700 p-2 rounded">Home</a>

                {role === "admin" && (
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
