// app/api/save-status-report/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDashboardConnection } from "@/lib/db";
import sql from "mssql";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { id, table, status, fullname, card } = body;

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

        if (tablesResult.recordset.length === 0) {
            return NextResponse.json(
                { error: `ไม่พบ mapping ของ table: ${table}` },
                { status: 400 }
            );
        }

        const dbTableName = tablesResult.recordset[0].db_table_name;

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

        let nameValue = status === "ไม่อนุมัติ" ? "ไม่อนุมัติ" : fullname;

        // --- update ---
        const result = await pool
            .request()
            .input("id", sql.NVarChar, id)
            .input("status", sql.NVarChar, status)
            .input("name", sql.NVarChar, nameValue)
            .query(`
                UPDATE ${dbTableName}
                SET ${updateStatuscolum} = @status,
                    ${updateNamecolum} = @name,
                    ${updateDatecolum} = GETDATE()
                WHERE [Id] = @id
            `);

        if (result.rowsAffected[0] === 0) {
            return NextResponse.json({ error: "ไม่พบข้อมูล" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error(err);
        return NextResponse.json(
            { error: "เกิดข้อผิดพลาด", detail: err.message },
            { status: 500 }
        );
    }
}
