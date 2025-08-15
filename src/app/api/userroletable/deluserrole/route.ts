// /pages/api/userroletable/deluserrole.ts
import { NextRequest, NextResponse } from "next/server";
import { getDashboardConnection } from "@/lib/db";

export async function POST(req: NextRequest) {
    try {
        const { UserID, RoleID } = await req.json();

        if (!UserID || !RoleID) {
            return NextResponse.json({ error: "Missing UserID or RoleID" }, { status: 400 });
        }

        const pool = await getDashboardConnection();

        await pool.request()
            .input("UserID", UserID)
            .input("RoleID", RoleID)
            .query(`DELETE FROM [DASHBOARD].[dbo].[UserRoles] WHERE UserID=@UserID AND RoleID=@RoleID`);

        // ส่งกลับรายการทั้งหมด
        const result = await pool.request().query(`SELECT [UserID],[RoleID] FROM [DASHBOARD].[dbo].[UserRoles]`);
        return NextResponse.json(result.recordset);

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
