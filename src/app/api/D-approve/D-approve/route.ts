import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";
import { getDashboardConnection } from "../../../../../lib/db";
import jwt from "jsonwebtoken";
interface UserPayload {
    userId: string | number;
    fullName: string;
    roles: string[];
    permissions: string[]; // table ที่ user สามารถดูได้
}

export async function POST(req: NextRequest) {
    try {
        // ✅ อ่าน cookie จาก request
        const authToken = req.cookies.get("auth_token")?.value;

        if (!authToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // ✅ decode JWT
        const secret = process.env.JWT_SECRET || "your_secret_key";
        let payload: UserPayload;
        try {
            payload = jwt.verify(authToken, secret) as UserPayload;
        } catch (err) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }
        
        const userPermissions = payload.permissions;

        const body = await req.json();
        const { offset = 0, limit = 10, search = "" } = body;

        const pool = await getDashboardConnection();

        const tableMap: Record<string, string> = {
            "FM_IT_03": "[DASHBOARD].[dbo].[tb_appove_FM_IT_03]",
            "FM_GA_03": "[DASHBOARD].[dbo].[tb_appove_FM_GA_03]",
            "FM_GA_04": "[DASHBOARD].[dbo].[tb_appove_FM_GA_04]"
        };

        // --- 1. สร้าง query ดึงข้อมูล dynamic ตาม permission ---
        const queries = userPermissions
            .filter(t => tableMap[t])
            .map(t => `
        SELECT id, name, '${t}' AS source
        FROM ${tableMap[t]}
        WHERE name LIKE @search
      `);

        if (queries.length === 0) {
            return NextResponse.json({ totalAll: 0, data: [] });
        }

        const finalQuery = queries.join(" UNION ALL ") + `
      ORDER BY id
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `;

        // --- 2. ดึงข้อมูล ---
        const dataResult = await pool.request()
            .input("search", sql.VarChar, `%${search}%`)
            .input("offset", sql.Int, offset)
            .input("limit", sql.Int, limit)
            .query(finalQuery);

        // --- 3. ดึง total count แยก table ---
        const countQueries = userPermissions
            .filter(t => tableMap[t])
            .map(t => `(SELECT COUNT(*) FROM ${tableMap[t]} WHERE name LIKE @search) AS ${t}`)
            .join(", ");

        const totalCountsResult = await pool.request()
            .input("search", sql.VarChar, `%${search}%`)
            .query(`SELECT ${countQueries}`);

        const totals = totalCountsResult.recordset[0];
        const totalAll = Object.values(totals).reduce((sum, val) => Number(sum) + Number(val), 0);

        // --- 4. ส่ง response ---
        return NextResponse.json({
            totalAll,
            totals,      // { FM_IT_03: 50, FM_GA_04: 30 }
            data: dataResult.recordset
        });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
