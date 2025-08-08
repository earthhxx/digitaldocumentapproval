"use client";
import Image from "next/image";
import { useAuth } from "../app/contexts/AuthContext";

export default function ApproveButton() {
  const { user } = useAuth();

  if (!user?.permissions.includes("APPROVE_DOC")) {
    return null; // ไม่มีสิทธิ์ไม่โชว์ปุ่ม
  }

  return <button className="btn btn-primary">Approve</button>;
}


