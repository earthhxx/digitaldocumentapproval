// app/api/save-status-report/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDashboardConnection } from "@/lib/db";
import sql from "mssql";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { id, table, status, fullname, card } = body;

    // ✅ log ค่า request body
    console.log("👉 Incoming body:", body);

    if (!id || !table || !status || !fullname || !card) {
        return NextResponse.json(
            { error: "missing parameter" },
            { status: 400 }
        );
    }

    let pool: sql.ConnectionPool | null = null;

    try {
        pool = await getDashboardConnection();

        // --- ดึง mapping จาก D_Approve ---
        const tablesResult = await pool
            .request()
            .input("table", sql.VarChar, table)
            .query(`
                SELECT table_name, db_table_name
                FROM D_Approve
                WHERE table_name = @table
            `);

        // ✅ log mapping table ที่เจอ
        console.log("👉 Mapping result:", tablesResult.recordset);

        if (tablesResult.recordset.length === 0) {
            return NextResponse.json(
                { error: `ไม่พบ mapping ของ table: ${table}` },
                { status: 400 }
            );
        }

        const dbTableName = tablesResult.recordset[0].db_table_name;

        // ✅ log dbTableName ที่เลือกใช้จริง
        console.log("👉 dbTableName:", dbTableName);

        if (!/^[\[\]a-zA-Z0-9_.]+$/.test(dbTableName)) {
            return NextResponse.json({ error: "Invalid table name" }, { status: 400 });
        }

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

        // ✅ log columns ที่จะ update
        console.log("👉 Update columns:", {
            updateStatuscolum,
            updateNamecolum,
            updateDatecolum,
        });

        let statusvalue = status === "reject" ? "ไม่อนุมัติ" : status;
        let nameValue = status === "reject" ? "ไม่อนุมัติ" : fullname;

        // --- update ---
        const result = await pool
            .request()
            .input("id", sql.Int, id)
            .input("status", sql.NVarChar, statusvalue)
            .input("name", sql.NVarChar, nameValue)
            .query(`
                UPDATE ${dbTableName}
                SET ${updateStatuscolum} = @status,
                    ${updateNamecolum} = @name,
                    ${updateDatecolum} = GETDATE()
                WHERE [Id] = @id
            `);

        // ✅ log ผลลัพธ์การ update
        console.log("👉 Update result:", result);

        if (result.rowsAffected[0] === 0) {
            return NextResponse.json({ error: "ไม่พบข้อมูล" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error("❌ Error in save-status-report:", err);
        return NextResponse.json(
            { error: "เกิดข้อผิดพลาด", detail: err.message },
            { status: 500 }
        );
    }
}
