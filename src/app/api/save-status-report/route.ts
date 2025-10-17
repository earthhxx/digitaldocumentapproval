// app/api/save-status-report/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDashboardConnection } from "@/lib/db";
import sql from "mssql";

interface RecordPayload {
  ID: number;
  source: string;
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  // ✅ ใช้ ID แทน id
  const records: RecordPayload[] =
    body.records ||
    (body.ID && body.source ? [{ ID: body.ID, source: body.source }] : []);

  const { status, fullname, card } = body;

  //   console.log("👉 Incoming body:", body);
  //   console.log("👉 Parsed records:", records);

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

    // ✅ Group records by table name
    const tableGroups: Record<string, number[]> = {};
    for (const rec of records) {
      if (!rec.ID || !rec.source) continue;
      if (!tableGroups[rec.source]) tableGroups[rec.source] = [];
      tableGroups[rec.source].push(rec.ID);
    }

    // console.log("👉 Grouped records by table:", tableGroups);

    for (const [source, ids] of Object.entries(tableGroups)) {
      const tablesResult = await pool
        .request()
        .input("source", sql.VarChar, source)
        .query(`
          SELECT table_name, db_table_name
          FROM D_Approve
          WHERE table_name = @source
        `);

      if (tablesResult.recordset.length === 0) {
        console.log("⚠️ No mapping for table:", source);
        continue;
      }

      const dbTableName = tablesResult.recordset[0].db_table_name;

      if (!/^[\[\]a-zA-Z0-9_.]+$/.test(dbTableName)) {
        console.log("⚠️ Invalid db table name:", dbTableName);
        continue;
      }

      // ✅ Batch update
      const idParams = ids.map((_, idx) => `@id${idx}`).join(", ");
      const request = pool.request()
        .input("status", sql.NVarChar, statusValue)
        .input("name", sql.NVarChar, nameValue);

      ids.forEach((id, idx) => {
        request.input(`id${idx}`, sql.Int, id);
      });

      await request.query(`
        UPDATE ${dbTableName}
        SET ${updateStatuscolum} = @status,
            ${updateNamecolum} = @name,
            ${updateDatecolum} = GETDATE()
        WHERE [Id] IN (${idParams})
      `);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("❌ Error in save-status-report:", err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด", detail: errorMessage }, { status: 500 });
  }
}
