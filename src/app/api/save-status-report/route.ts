// app/api/save-status-report/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDashboardConnection } from "@/lib/db";
import sql from "mssql";

interface RecordPayload {
  id: number;
  source: string;
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  // ตรวจสอบว่ามี batch หรือ single record
  const records: RecordPayload[] = body.records || (body.id && body.table ? [{ id: body.id, table: body.table }] : []);
  const { status, fullname, card } = body;

  console.log("👉 Incoming body:", body);
  console.log("👉 Parsed records:", records);

  if (!records.length || !status || !fullname || !card) {
    return NextResponse.json({ error: "missing parameter" }, { status: 400 });
  }

  let pool: sql.ConnectionPool | null = null;

  try {
    pool = await getDashboardConnection();

    let updateStatuscolum = "";
    let updateNamecolum = "";
    let updateDatecolum = "";

    if (card === "Supervisor") {
      updateStatuscolum = "StatusCheck";
      updateNamecolum = "NameCheck";
      updateDatecolum = "DateCheck";
    } else if (card === "Manager") {
      updateStatuscolum = "StatusApprove";
      updateNamecolum = "NameApprove";
      updateDatecolum = "DateApprove";
    }

    const statusValue = status === "reject" ? "ไม่อนุมัติ" : status;
    const nameValue = status === "reject" ? "ไม่อนุมัติ" : fullname;

    // Group records by table
    const tableGroups: Record<string, number[]> = {};
    for (const rec of records) {
      if (!rec.id || !rec.source) continue;
      if (!tableGroups[rec.source]) tableGroups[rec.source] = [];
      tableGroups[rec.source].push(rec.id);
    }
    //👉 Grouped records by table: { FM_IT_03: [ 12, 13 ] }
    console.log("👉 Grouped records by table:", tableGroups);

    // Update batch per table
    // Obj.entries return arr [key,value] 
    //same as
    //  const table = entry[0]; // key
    // const ids = entry[1];   // value
    //     [
    //   ["FM_IT_01", [1, 2]],
    //   ["FM_GA_03", [3, 4]]
    // ] 
    for (const [table, ids] of Object.entries(tableGroups)) {
      // ดึง mapping table
      const tablesResult = await pool
        .request()
        .input("table", sql.VarChar, table)
        .query(`
          SELECT table_name, db_table_name
          FROM D_Approve
          WHERE table_name = @table
        `);

      if (tablesResult.recordset.length === 0) {
        console.log("⚠️ No mapping for table:", table);
        continue;
      }

      const dbTableName = tablesResult.recordset[0].db_table_name;

      if (!/^[\[\]a-zA-Z0-9_.]+$/.test(dbTableName)) {
        console.log("⚠️ Invalid db table name:", dbTableName);
        continue;
      }

      // Batch update
      const idParams = ids.map((_, idx) => `@id${idx}`).join(", ");
      const request = pool.request()
        .input("status", sql.NVarChar, statusValue)
        .input("name", sql.NVarChar, nameValue);

      ids.forEach((id, idx) => {
        request.input(`id${idx}`, sql.Int, id);
      });

      const result = await request.query(`
        UPDATE ${dbTableName}
        SET ${updateStatuscolum} = @status,
            ${updateNamecolum} = @name,
            ${updateDatecolum} = GETDATE()
        WHERE [Id] IN (${idParams})
      `);

      console.log(`✅ Updated ${result.rowsAffected[0]} record(s) in table ${dbTableName}`);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Error in save-status-report:", err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด", detail: err.message }, { status: 500 });
  }
}
