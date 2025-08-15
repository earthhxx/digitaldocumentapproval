// /pages/api/addPermissions
import { NextRequest, NextResponse } from "next/server";
import { getDashboardConnection } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const pool = await getDashboardConnection();
    const insertResult = await pool.request()
      .input("PermissionName", body.PermissionName)
      .input("Description", body.Description)
      .query(`
        INSERT INTO [DASHBOARD].[dbo].[Permissions] (PermissionName, Description)
        OUTPUT INSERTED.PermissionID, INSERTED.PermissionName, INSERTED.Description
        VALUES (@PermissionName, @Description);
      `);

    if (insertResult.recordset.length === 0) {
      return NextResponse.json({ error: "Insert failed" }, { status: 400 });
    }

    // ส่งแค่ row เดียวที่ insert
    return NextResponse.json(insertResult.recordset[0]);

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
