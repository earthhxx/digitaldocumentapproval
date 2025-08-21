// src/lib/modules/DApproveModule.ts
import sql from "mssql";
import { getDashboardConnection } from "@/lib/db";

export interface ApproveQuery {
  offset?: number;
  limit?: number;
  search?: string;
  statusType?: string;
  permissions: string[]; // ดึงจาก user.permissions ที่ decode มาแล้ว
}

export interface ApproveData {
  totalAll: number;
  totals: Record<string, number>;
  data: any[];
}

export async function getDApproveData({
  offset = 0,
  limit = 10,
  search = "",
  statusType = "",
  permissions = [],
}: ApproveQuery): Promise<ApproveData> {
  const pool = await getDashboardConnection();

  // --- ดึง TableMaster mapping ---
  const tablesResult = await pool.request().query(`
    SELECT table_name, db_table_name
    FROM D_Approve
    WHERE table_name IN (${permissions.map(t => `'${t}'`).join(",") || "''"})
  `);

  const tableMap: Record<string, string> = {};
  tablesResult.recordset.forEach(row => (tableMap[row.table_name] = row.db_table_name));

  // --- dynamic query ---
  const queries = permissions.filter(t => tableMap[t]).map(t => {
    let whereClause = `name LIKE @search`;
    if (statusType === "check") whereClause += ` AND StatusCheck IS NULL`;
    else if (statusType === "approve") whereClause += ` AND StatusApprove IS NULL`;

    return `SELECT *, '${t}' AS source FROM ${tableMap[t]} WHERE ${whereClause}`;
  });

  if (!queries.length) return { totalAll: 0, totals: {}, data: [] };

  const finalQuery =
    queries.join(" UNION ALL ") +
    ` ORDER BY id OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;

  const dataResult = await pool
    .request()
    .input("search", sql.VarChar, `%${search}%`)
    .input("offset", sql.Int, offset)
    .input("limit", sql.Int, limit)
    .query(finalQuery);

  const countQueries = permissions
    .filter(t => tableMap[t])
    .map(t => `(SELECT COUNT(*) FROM ${tableMap[t]} WHERE name LIKE @search) AS ${t}`)
    .join(", ");

  const totalCountsResult = await pool
    .request()
    .input("search", sql.VarChar, `%${search}%`)
    .query(`SELECT ${countQueries}`);

  const totalsRow = totalCountsResult.recordset[0] ?? {};
  const totals: Record<string, number> = Object.fromEntries(
    Object.entries(totalsRow).map(([k, v]) => [k, Number(v)])
  );

  const totalAll = Object.values(totals).reduce((sum, val) => sum + val, 0);

  return { totalAll, totals, data: dataResult.recordset };
}
