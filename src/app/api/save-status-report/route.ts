import { NextRequest, NextResponse } from "next/server";
import { getDashboardConnection } from "@/lib/db";
import sql from "mssql";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { records, status, fullname, card } = body;

    console.log("👉 Incoming body:", body);
    console.log("records:", records);

    if (!records || !Array.isArray(records) || records.length === 0 || !status || !fullname || !card) {
        console.log("❌ Missing parameters");
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

        console.log("Updating columns:", { updateStatuscolum, updateNamecolum, updateDatecolum });
        console.log("Status value:", statusValue, "Name value:", nameValue);

        // Group records by table
        const tableGroups: Record<string, number[]> = {};
        for (const rec of records) {
            if (!rec.id || !rec.source) {
                console.log("Skipping invalid record:", rec);
                continue;
            }
            const tableName = rec.table || rec.source; // fallback ใช้ source
            if (!tableGroups[tableName]) tableGroups[tableName] = [];
            tableGroups[tableName].push(rec.id);
        }


        console.log("Grouped records by table:", tableGroups);

        // Update batch per table
        for (const [table, ids] of Object.entries(tableGroups)) {
            console.log(`Processing table: ${table} with IDs:`, ids);

            // ดึง mapping table
            const tablesResult = await pool
                .request()
                .input("table", sql.VarChar, table)
                .query(`
                    SELECT table_name, db_table_name
                    FROM D_Approve
                    WHERE table_name = @table
                `);

            console.log("Mapping result for table:", table, tablesResult.recordset);

            if (tablesResult.recordset.length === 0) {
                console.log(`❌ No mapping found for table: ${table}`);
                continue;
            }

            const dbTableName = tablesResult.recordset[0].db_table_name;

            if (!/^[\[\]a-zA-Z0-9_.]+$/.test(dbTableName)) {
                console.log(`❌ Invalid dbTableName: ${dbTableName}`);
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

            console.log(`Executing update for table ${dbTableName} on IDs:`, ids);
            const result = await request.query(`
                UPDATE ${dbTableName}
                SET ${updateStatuscolum} = @status,
                    ${updateNamecolum} = @name,
                    ${updateDatecolum} = GETDATE()
                WHERE [Id] IN (${idParams})
            `);

            console.log(`Update result for table ${dbTableName}:`, result.rowsAffected);
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error("❌ Error in save-status-report:", err);
        return NextResponse.json({ error: "เกิดข้อผิดพลาด", detail: err.message }, { status: 500 });
    }
}
