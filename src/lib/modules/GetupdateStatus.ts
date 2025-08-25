// src/lib/modules/GetupdateStatus.ts
import { getDashboardConnection } from "@/lib/db";

export async function GetupdateStatus(permissions: string[]) {
    if (!permissions || permissions.length === 0) {
        throw new Error("missing parameter");
    }

    const pool = await getDashboardConnection();

    // --- ดึง TableMaster mapping ---
    const tablesResult = await pool.request().query(`
        SELECT table_name, db_table_name
        FROM D_Approve
        WHERE table_name IN (${permissions.map(t => `'${t}'`).join(",")})
    `);

    const tableMap: Record<string, string> = {};
    tablesResult.recordset.forEach(row => {
        tableMap[row.table_name] = row.db_table_name;
    });

    // --- สร้าง query สำหรับแต่ละ table ---
    const queries = permissions
        .filter(t => tableMap[t])
        .map(
            t => `
                SELECT 
                    COUNT(CASE WHEN StatusApprove IS NULL THEN 1 END) AS ApproveNull,
                    COUNT(CASE WHEN StatusCheck IS NULL THEN 1 END)   AS CheckNull,
                    COUNT(CASE WHEN StatusApprove IS NULL OR StatusCheck IS NULL THEN 1 END) AS BothNull
                FROM ${tableMap[t]}
            `
        );

    if (queries.length === 0) {
        throw new Error("No valid tables found");
    }

    // --- รวม query ทั้งหมดด้วย UNION ALL และ SUM ครอบ ---
    const finalQuery = `
        SELECT 
            SUM(ApproveNull) AS ApproveNull,
            SUM(CheckNull)   AS CheckNull,
            SUM(BothNull)    AS BothNull
        FROM (
            ${queries.join(" UNION ALL ")}
        ) AS AllTables
    `;

    const result = await pool.request().query(finalQuery);

    return result.recordset[0]; // ✅ คืนค่าเป็น object ธรรมดา
}
