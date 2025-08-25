import sql from "mssql";
import { getDashboardConnection } from "@/lib/db";

export interface ApproveQuery {
  offset?: number;
  limit?: number;
  search?: string;
  statusType?: string;
  permissions: string[];
}

export interface ApproveData {
  totalAll: number;
  totals: Record<string, number>;
  data: any[];
}

export async function getDApproveData({
  offset = 0,
  limit = 0,
  search = "",
  statusType = "",
  permissions = [],
}: ApproveQuery): Promise<ApproveData> {
  const pool = await getDashboardConnection();

  // --- log input ---
  // console.log("=== getDApproveData called ===");
  // console.log("offset:", offset, "limit:", limit, "statusType:", statusType, "search:", search);
  // console.log("permissions:", permissions);

  // --- ดึง TableMaster mapping ---
  const tablesResult = await pool.request().query(`
    SELECT table_name, db_table_name
    FROM D_Approve
    WHERE table_name IN (${permissions.map(t => `'${t}'`).join(",") || "''"})
  `);

  // console.log("tablesResult:", tablesResult.recordset);

  const tableMap: Record<string, string> = {};
  tablesResult.recordset.forEach(row => (tableMap[row.table_name] = row.db_table_name));
  // console.log("tableMap:", tableMap);

  // --- dynamic query ---
  const queries = permissions.filter(t => tableMap[t]).map(t => {
    let whereClause = `[Date] LIKE @search`;
    if (statusType === "Check") whereClause += ` AND StatusCheck IS NULL`;
    else if (statusType === "Approve") whereClause += ` AND StatusApprove IS NULL`;
    else if (statusType === "All") whereClause += ``;

    const q = `SELECT id, FormID, [Date] AS date, StatusCheck, StatusApprove, '${t}' AS source 
               FROM ${tableMap[t]} 
               WHERE ${whereClause}`;
    // console.log("Dynamic SELECT query for table", t, ":", q);
    return q;
  });


  if (!queries.length) {
    console.log("No queries generated. Returning empty data.");
    return { totalAll: 0, totals: {}, data: [] };
  }

  const finalQuery =
    queries.join(" UNION ALL ") +
    ` ORDER BY date DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;

  // console.log("Final paginated query:", finalQuery);

  const dataResult = await pool
    .request()
    .input("search", sql.VarChar, `%${search}%`)
    .input("offset", sql.Int, offset)
    .input("limit", sql.Int, limit)
    .query(finalQuery);

  // console.log("Data result:", dataResult.recordset);

  // --- count query ---
  let whereClausecount = ``;
  let where = ``
  if (statusType === "Check") {
    where = `WHERE`;
    whereClausecount = `StatusCheck IS NULL`;
  }
  else if (statusType === "Approve") {
    where = `WHERE`
    whereClausecount = `StatusApprove IS NULL`;
  }
  else if (statusType === "All") {
    where = ``;
    whereClausecount = ``;
  }

  const countQueries = permissions.filter(t => tableMap[t])
    .map(t => `(SELECT COUNT(*) FROM ${tableMap[t]} ${where} ${whereClausecount}) AS ${t}`)
    .join(", ");

  const countQueryString = `SELECT ${countQueries}`;
  // console.log("Count query:", countQueryString);

  const totalCountsResult = await pool
    .request()
    .input("search", sql.VarChar, `%${search}%`)
    .query(countQueryString);

  console.log("Total counts raw result:", totalCountsResult.recordset);

  const totalsRow = totalCountsResult.recordset[0] ?? {};
  const totals: Record<string, number> = Object.fromEntries(
    Object.entries(totalsRow).map(([k, v]) => [k, Number(v)])
  );

  // console.log("Totals processed:", totals);

  const totalAll = Object.values(totals).reduce((sum, val) => sum + val, 0);
  // console.log("TotalAll:", totalAll);

  return { totalAll, totals, data: dataResult.recordset };
}
