import sql from "mssql";
import { getDashboardConnection } from "@/lib/db";

export interface ApproveQuery {
  offset?: number;
  limit?: number;
  search?: string;
  statusType?: string;
  formaccess: string[];
  Dep: string[];
}

export interface ApproveData {
  totalAll: number;
  totals: Record<string, number>; // เพิ่มตรงนี้
  data: any[];
}

export async function getDApproveData({
  offset = 0,
  limit = 0,
  search = "",
  statusType = "",
  formaccess = [],
  Dep = [],
}: ApproveQuery): Promise<ApproveData> {
  const pool = await getDashboardConnection();

  // ดึง mapping table
  const tablesResult = await pool.request().query(`
    SELECT table_name, db_table_name
    FROM D_Approve
    WHERE table_name IN (${formaccess.map(t => `'${t}'`).join(",") || "''"})
  `);

  const tableMap: Record<string, string> = {};
  tablesResult.recordset.forEach(row => (tableMap[row.table_name] = row.db_table_name));

  const queries = formaccess.filter(t => tableMap[t]).map(t => {
    let whereClause = `[Date] LIKE @search`;
    if (statusType === "Check") whereClause += ` AND StatusCheck IS NULL`;
    else if (statusType === "Approve") whereClause += ` AND StatusApprove IS NULL`;

    return `
      SELECT 
        id, FormID, Dep , [Date] AS date, StatusCheck, StatusApprove, '${t}' AS source
      FROM ${tableMap[t]}
      WHERE ${whereClause}`;
  });

  const finalQuery =
    queries.join(" UNION ALL ") +
    ` ORDER BY date DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;

  const dataResult = await pool
    .request()
    .input("search", sql.VarChar, `%${search}%`)
    .input("offset", sql.Int, offset)
    .input("limit", sql.Int, limit)
    .query(finalQuery);

  // --- count per table ---
  const countQueries = formaccess
    .filter(t => tableMap[t])
    .map(t => `(SELECT COUNT(*) FROM ${tableMap[t]}) AS [${t}]`)
    .join(", ");

  const countResult = await pool.request().query(`SELECT ${countQueries}`);

  const totalsRaw = countResult.recordset[0] ?? {};
  const totals: Record<string, number> = Object.fromEntries(
    Object.entries(totalsRaw).map(([k, v]) => [k, Number(v)])
  );

  const totalAll = Object.values(totals).reduce((sum, val) => sum + val, 0);


  return { totalAll, totals, data: dataResult.recordset };
}
