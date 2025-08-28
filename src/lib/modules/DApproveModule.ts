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
  // console.log(Dep);
  // ดึง mapping table
  const tablesResult = await pool.request().query(`
    SELECT table_name, db_table_name
    FROM D_Approve
    WHERE table_name IN (${formaccess.map(t => `'${t}'`).join(",") || "''"})
  `);

  const tableMap: Record<string, string> = {};
  tablesResult.recordset.forEach(row => (tableMap[row.table_name] = row.db_table_name));

  const validTabs = ["Check_TAB", "Approve_TAB", "All_TAB"];

  const queries = formaccess
    .filter(t => tableMap[t])
    .map(t => {
      if (!validTabs.includes(statusType)) return ""; // ดัก Tab ที่ไม่ถูกต้อง

      let whereClause = `[Date] LIKE @search`;

      if (statusType === "Check_TAB") whereClause += ` AND StatusCheck IS NULL`;
      else if (statusType === "Approve_TAB") whereClause += ` AND StatusApprove IS NULL`;
      // All_TAB ไม่ต้องเพิ่มเงื่อนไข

      const depList = Dep.length ? Dep.map(d => `'${d}'`).join(",") : "''";

      return `
      SELECT 
        id, FormID, Dep , [Date] AS date, StatusCheck, StatusApprove, '${t}' AS source
      FROM ${tableMap[t]}
      WHERE Dep IN (${depList}) AND ${whereClause}`;
    })
    .filter(q => q); // ลบ empty string ทิ้ง

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

  if (!Dep || Dep.length === 0) {
    return { totalAll: 0, totals: {}, data: [] };
  }

  return { totalAll, totals, data: dataResult.recordset };
}
