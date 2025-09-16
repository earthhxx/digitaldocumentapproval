"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export interface User {
    userId: string;
    fullName: string;
    roles: string[];
    permissions: string[];
    ForgetPass: string;
}

export default function ResetPasswordModal({
    initialUser,
}: {
    initialUser: any;
}) {
    const [newPass, setNewPass] = useState("");
    const [confirmPass, setConfirmPass] = useState("");
    const [error, setError] = useState("");
    const [visible, setVisible] = useState(true); // ✅ state ควบคุม modal
    const { user, logout } = useAuth();
    const userId = user?.userId || "";
    const roles = user?.roles || [];
    const userForgetPass = user?.ForgetPass || initialUser?.ForgetPass || "";

    // const [mounted, setMounted] = useState(false);
    // useEffect(() => setMounted(true), []);
    // if (!mounted) return null;

    console.log("roles", roles)
    console.log("forget", userForgetPass)


    const handleSubmit = async () => {
        if (!newPass || !confirmPass) {
            setError("กรุณากรอกข้อมูลให้ครบ");
            return;
        }
        if (newPass !== confirmPass) {
            setError("รหัสผ่านไม่ตรงกัน");
            return;
        }

        try {
            const res = await fetch("/api/usertable/edituser", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    User_Id: userId, // ✅ ใช้ displayUser
                    Pass: newPass,
                }),
            });

            if (res.ok) {
                alert("เปลี่ยนรหัสผ่านเรียบร้อย");

                // ✅ logout ทันที
                await fetch("/api/logout", { method: "POST" });

                // ✅ redirect ไป login
                window.location.href = "/login";
            } else {
                const data = await res.json();
                setError(data.error || "เกิดข้อผิดพลาด");
            }
        } catch (err) {
            console.error(err);
            setError("เกิดข้อผิดพลาด");
        }
    };

    const handleClose = () => {
        setVisible(false); // ✅ ปิด modal
        logout();
    };


    return (
        <>
            {userForgetPass === 'yes' && visible && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
                    <div className="bg-white shadow-lg rounded p-6 w-[90%] max-w-md flex flex-col">
                        <h2 className="text-xl font-bold mb-4 text-center">ตั้งรหัสผ่านใหม่</h2>

                        {error && <p className="text-red-500 mb-2">{error}</p>}

                        <input
                            type="password"
                            placeholder="รหัสผ่านใหม่"
                            className="border p-2 mb-4 w-full"
                            value={newPass}
                            onChange={(e) => setNewPass(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="ยืนยันรหัสผ่าน"
                            className="border p-2 mb-4 w-full"
                            value={confirmPass}
                            onChange={(e) => setConfirmPass(e.target.value)}
                        />

                        <button
                            className="bg-blue-500 text-white p-2 rounded w-full hover:bg-blue-600 mb-2"
                            onClick={handleSubmit}
                        >
                            บันทึก
                        </button>

                        <button
                            className="bg-gray-300 text-black p-2 rounded w-full hover:bg-gray-400"
                            onClick={handleClose}
                        >
                            ยกเลิก
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
