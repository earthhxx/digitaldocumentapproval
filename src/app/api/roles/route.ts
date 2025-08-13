// /pages/api/roles
import { NextRequest, NextResponse } from "next/server";
import { getDashboardConnection } from "@/lib/db";

export async function GET(req: NextRequest) {
    try {
        const pool = await getDashboardConnection();

        const Result = await pool.request().query(`
        SELECT [RoleID],[RoleName],[Description]
        FROM [DASHBOARD].[dbo].[Roles] 
        `);

        if (Result.recordset.length === 0) {
            return NextResponse.json({ error: "ไม่พบข้อมูล" }, { status: 404 });
        }

        // ✅ ส่งข้อมูลกลับ
        return NextResponse.json({ data: Result });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
