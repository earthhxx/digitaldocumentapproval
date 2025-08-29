import { NextRequest, NextResponse } from "next/server";
import { getDashboardConnection } from "@/lib/db";
import sql from "mssql";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { records, status, fullname, card } = body;

    console.log("records",records)
    console.log("👉 Incoming body:", body);

    if (!records || !Array.isArray(records) || records.length === 0 || !status || !fullname || !card) {
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
            if (!rec.id || !rec.table) continue;
            if (!tableGroups[rec.table]) tableGroups[rec.table] = [];
            tableGroups[rec.table].push(rec.id);
        }

        // Update batch per table
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

            if (tablesResult.recordset.length === 0) continue;
            const dbTableName = tablesResult.recordset[0].db_table_name;

            if (!/^[\[\]a-zA-Z0-9_.]+$/.test(dbTableName)) continue;

            // Batch update
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
    } catch (err: any) {
        console.error("❌ Error in save-status-report:", err);
        return NextResponse.json({ error: "เกิดข้อผิดพลาด", detail: err.message }, { status: 500 });
    }
}
