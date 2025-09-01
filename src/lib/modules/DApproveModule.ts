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
  offset: number;
  limit: number;
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

  // ดึง mapping ของ table
  const tablesResult = await pool.request().query(`
    SELECT table_name, db_table_name
    FROM D_Approve
    WHERE table_name IN (${formaccess.map(t => `'${t}'`).join(",") || "''"})
  `);

  const tableMap: Record<string, string> = {};
  tablesResult.recordset.forEach(row => (tableMap[row.table_name] = row.db_table_name));

  console.log("Table Map:", tableMap); // ✅ log table mapping

  const validTabs = ["Check_TAB", "Approve_TAB", "All_TAB"];
  if (!validTabs.includes(statusType)) {
    console.log("Invalid statusType:", statusType); // ✅ log statusType ไม่ถูกต้อง
    return { totalAll: 0, totals: {}, data: [], offset, limit };
  }
  console.log(statusType)

  const queries = formaccess
    .filter(t => tableMap[t])
    .map(t => {
      let whereClause = `[Date] LIKE @search`;
      if (statusType === "Check_TAB") whereClause += ` AND StatusCheck IS NULL`;
      else if (statusType === "ALL_TAB") whereClause += ` AND StatusApprove IS NOT NULL`;
      else if (statusType === "Approve_TAB") whereClause += ` AND StatusCheck IS NOT NULL AND StatusCheck != N'ไม่อนุมัติ' AND StatusApprove IS NULL`;
      const depList = Dep.length ? Dep.map(d => `'${d}'`).join(",") : "''";

      const q = `
        SELECT id, FormID, Dep, [Date] AS date, StatusCheck, StatusApprove, '${t}' AS source
        FROM ${tableMap[t]}
        WHERE Dep IN (${depList}) AND ${whereClause}
      `;
      console.log(`Query for ${t}:`, q); // ✅ log query แต่ละ table
      return q;
    })
    .filter(q => q);

  const finalQuery = `
    SELECT *, COUNT(*) OVER() AS totalCount
    FROM (
      ${queries.join(" UNION ALL ")}
    ) AS unioned
    ORDER BY date DESC
    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
  `;
  console.log("Final Query:", finalQuery); // ✅ log final query

  const dataResult = await pool
    .request()
    .input("search", sql.VarChar, `%${search}%`)
    .input("offset", sql.Int, offset)
    .input("limit", sql.Int, limit)
    .query(finalQuery);

  console.log("Data Result:", dataResult.recordset); // ✅ log raw data result

  const data = dataResult.recordset;

  const totalAll = data.length > 0 ? Number(data[0].totalCount) : 0;

  const totals: Record<string, number> = {};
  data.forEach(d => {
    totals[d.source] = (totals[d.source] || 0) + 1;
  });

  data.forEach(d => delete d.totalCount);

  console.log("Totals per table:", totals); // ✅ log totals per table
  console.log("Total All:", totalAll); // ✅ log totalAll

  return { totalAll, totals, data, offset, limit };
}
