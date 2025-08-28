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

  const tablesResult = await pool.request().query(`
    SELECT table_name, db_table_name
    FROM D_Approve
    WHERE table_name IN (${formaccess.map(t => `'${t}'`).join(",") || "''"})
  `);

  const tableMap: Record<string, string> = {};
  tablesResult.recordset.forEach(row => (tableMap[row.table_name] = row.db_table_name));

  const validTabs = ["Check_TAB", "Approve_TAB", "All_TAB"];
  if (!validTabs.includes(statusType)) return { totalAll: 0, totals: {}, data: [], offset, limit };

  const queries = formaccess
    .filter(t => tableMap[t])
    .map(t => {
      let whereClause = `[Date] LIKE @search`;
      if (statusType === "Check_TAB") whereClause += ` AND StatusCheck IS NULL`;
      else if (statusType === "Approve_TAB") whereClause += ` AND StatusApprove IS NULL`;
      const depList = Dep.length ? Dep.map(d => `'${d}'`).join(",") : "''";
      return `
        SELECT id, FormID, Dep, [Date] AS date, StatusCheck, StatusApprove, '${t}' AS source
        FROM ${tableMap[t]}
        WHERE Dep IN (${depList}) AND ${whereClause}
      `;
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

  const dataResult = await pool
    .request()
    .input("search", sql.VarChar, `%${search}%`)
    .input("offset", sql.Int, offset)
    .input("limit", sql.Int, limit)
    .query(finalQuery);

  const data = dataResult.recordset;

  // totalAll จาก finalQuery เลย
  const totalAll = data.length > 0 ? Number(data[0].totalCount) : 0;

  // totals per table จาก dataResult ก็ทำได้ง่าย ๆ
  const totals: Record<string, number> = {};
  data.forEach(d => {
    totals[d.source] = (totals[d.source] || 0) + 1;
  });

  // ลบ totalCount ออกก่อน return
  data.forEach(d => delete d.totalCount);

  return { totalAll, totals, data, offset, limit };
}
