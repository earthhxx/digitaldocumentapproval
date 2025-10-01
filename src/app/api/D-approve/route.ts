// src/app/api/D-approve/D-approve/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getDApproveData } from "@/lib/modules/DApproveModule";

// 🔐 กำหนด type ของ JWT payload ให้ชัดเจน
interface JWTPayload {
  userId?: number | string;
  username?: string;
  fullName?: string;
  roles?: string[];
  permissions?: string[];
  formaccess?: string[];
  Dep?: string[];
  ForgetPass?: string,
}

export async function POST(req: NextRequest) {
  try {
    // ✅ ดึง token จาก cookie
    const token = req.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ ตรวจสอบ token และใส่ type JWTPayload
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_secret_key"
    );

    // ✅ ตรวจสอบว่า decoded เป็น JWTPayload จริง ๆ
    if (typeof decoded !== "object" || decoded === null || !("userId" in decoded)) {
      return NextResponse.json({ error: "Invalid token payload" }, { status: 400 });
    }

    const payload = decoded as JWTPayload;

    // ✅ รับ body จาก request
    const body = await req.json();

    // ✅ เรียกใช้งาน getDApproveData โดย merge formaccess จาก body หรือ token
    const data = await getDApproveData({
      ...body,
      formaccess: body.formaccess || payload.formaccess || [],
    });

    return NextResponse.json(data);
  } catch (err) {
    console.error("POST /api/D-approve/D-approve error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
