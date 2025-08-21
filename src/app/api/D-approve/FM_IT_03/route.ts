import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";
import { getDashboardConnection } from "../../../../../lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {offset = 0, limit = 10, search = "" } = body;

    const pool = await getDashboardConnection();

    const result = await pool.request()
      .input("search", sql.VarChar, `%${search}%`)
      .input("offset", sql.Int, offset)
      .input("limit", sql.Int, limit)
      .query(`
        SELECT * FROM [DASHBOARD].[dbo].[tb_appove_FM_IT_03]
        WHERE name LIKE @search
        ORDER BY id
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY
      `);

    return NextResponse.json(result.recordset);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
