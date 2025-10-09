//api/Logout/route.ts
import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";
import { getDashboardConnection } from "@/lib/db";

export async function POST(req: NextRequest) {
  const sessionId = req.cookies.get("session_id")?.value;

  if (sessionId) {
    const pool = await getDashboardConnection();

    await pool.request()
      .input("session_id", sql.NVarChar(255), sessionId)
      .query("DELETE FROM Sessions WHERE session_id = @session_id");
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("session_id", "", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });

  return response;
}
//http://localhost:3000/api/Logout

