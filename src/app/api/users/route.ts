// /pages/api/users
import { NextRequest, NextResponse } from "next/server";
import { getDashboardConnection } from "@/lib/db";

export async function GET(req: NextRequest) {
    try {
        const pool = await getDashboardConnection();

        const Result = await pool.request().query(`
            SELECT [id],[User_Id],[Pass],[Name],[Age],[Sex],[Tel],[Department],[Process],[Image],[StartDate],[Status],[CreateDate]
            FROM [DASHBOARD].[dbo].[tb_im_employee]
            `);

        if (Result.recordset.length === 0) {
            return NextResponse.json({ error: "ไม่พบข้อมูล" }, { status: 404 });
        }

        // ✅ ส่งข้อมูลกลับ
        return NextResponse.json(Result.recordset, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
