import sql from "mssql";
import { getDashboardConnection } from "";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

export interface UserPayload {
  userId: string | number;
  fullName: string;
  roles: string[];
  permissions: string[];
}

export async function getDApproveData(req: NextRequest) {
  try {
    const pool = await getDashboardConnection();

    // --- อ่าน cookie ---
    const authToken = req.cookies.get("auth_token")?.value;
    if (!authToken) return { status: 401, json: { error: "Unauthorized" } };

    // --- decode JWT ---
    const secret = process.env.JWT_SECRET || "your_secret_key";
    let payload: UserPayload;
    try {
      payload = jwt.verify(authToken, secret) as UserPayload;
    } catch {
      return { status: 401, json: { error: "Invalid token" } };
    }

    const userPermissions = payload.permissions; // ["FM_IT_03","FM_GA_04"]

    const body = await req.json();
    const { offset = 0, limit = 10, search = "", statusType = "" } = body;

    // --- ดึง TableMaster mapping ---
    const tablesResult = await pool.request()
      .query(`
        SELECT table_name, db_table_name
        FROM TableMaster
        WHERE table_name IN (${userPermissions.map(t => `'${t}'`).join(",")})
      `);

    const tableMap: Record<string, string> = {};
    tablesResult.recordset.forEach(row => tableMap[row.table_name] = row.db_table_name);

    // --- สร้าง dynamic query ---
    const queries = userPermissions.filter(t => tableMap[t]).map(t => {
      let whereClause = `name LIKE @search`;
      if (statusType === "check") whereClause += ` AND StatusCheck IS NULL`;
      else if (statusType === "approve") whereClause += ` AND StatusApprove IS NULL`;

      return `SELECT *, '${t}' AS source FROM ${tableMap[t]} WHERE ${whereClause}`;
    });

    if (!queries.length) return { status: 200, json: { totalAll: 0, totals: {}, data: [] } };

    const finalQuery = queries.join(" UNION ALL ") + `
      ORDER BY id
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `;

    // --- ดึงข้อมูล ---
    const dataResult = await pool.request()
      .input("search", sql.VarChar, `%${search}%`)
      .input("offset", sql.Int, offset)
      .input("limit", sql.Int, limit)
      .query(finalQuery);

    // --- ดึง total count ---
    const countQueries = userPermissions.filter(t => tableMap[t])
      .map(t => `(SELECT COUNT(*) FROM ${tableMap[t]} WHERE name LIKE @search) AS ${t}`)
      .join(", ");

    const totalCountsResult = await pool.request()
      .input("search", sql.VarChar, `%${search}%`)
      .query(`SELECT ${countQueries}`);

    const totals = totalCountsResult.recordset[0];
    const totalAll = Object.values(totals).reduce((sum, val) => Number(sum) + Number(val), 0);

    return { 
      status: 200, 
      json: { totalAll, totals, data: dataResult.recordset } 
    };

  } catch (err) {
    console.error(err);
    return { status: 500, json: { error: "Internal Server Error" } };
  }
}
