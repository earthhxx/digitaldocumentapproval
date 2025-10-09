// src/app/api/D-approve/D-approve/route.ts

import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";
import { getDashboardConnection } from "@/lib/db";
import { getDApproveData } from "@/lib/modules/DApproveModule";

// กำหนด type ของข้อมูลใน session
interface SessionUser {
  userId?: number | string;
  username?: string;
  fullName?: string;
  roles?: string[];
  permissions?: string[];
  formaccess?: string[];
  Dep?: string[];
  ForgetPass?: string;
}

export async function POST(req: NextRequest) {
  try {
    // ✅ ดึง session ID จาก cookie
    const sessionId = req.cookies.get("session_id")?.value;

    if (!sessionId) {
      return NextResponse.json({ error: "Unauthorized - No session" }, { status: 401 });
    }

    // ✅ connect database
    const pool = await getDashboardConnection();

    // ✅ query ข้อมูล session จากตาราง Sessions
    const sessionResult = await pool.request()
      .input("sessionId", sql.NVarChar, sessionId)
      .query(`
        SELECT data
        FROM Sessions
        WHERE session_id = @sessionId AND expires > GETDATE()
      `);

    if (sessionResult.recordset.length === 0) {
      return NextResponse.json({ error: "Invalid or expired session" }, { status: 401 });
    }

    // ✅ แปลง data (ntext) เป็น JSON
    const sessionDataText = sessionResult.recordset[0].data;
    let sessionUser: SessionUser;

    try {
      sessionUser = JSON.parse(sessionDataText);
    } catch (parseErr) {
      console.error("❌ Failed to parse session data:", parseErr);
      return NextResponse.json({ error: "Corrupted session data" }, { status: 500 });
    }

    // ✅ รับ body จาก request
    const body = await req.json();

    // ✅ ใช้ข้อมูลจาก session (หรือจาก body ถ้ามี override)
    const data = await getDApproveData({
      ...body,
      formaccess: body.formaccess || sessionUser.formaccess || [],
    });

    return NextResponse.json(data);
  } catch (err) {
    console.error("❌ POST /api/D-approve/D-approve error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
