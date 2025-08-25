// app/api/generate-filled-pdf/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDashboardConnection } from "@/lib/db";
import sql from "mssql";
import path from "path";
import fs from "fs/promises";
import { PDFDocument } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { mapFieldsToPDF } from "@/lib/modules/pdfHelpers";

export interface PDFData {
    [key: string]: any; // รองรับทุก field
}

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const labelText = searchParams.get("labelText");
    const table = searchParams.get("table");

    if (!labelText || !table) {
        return NextResponse.json(
            { error: "ต้องมี labelText และ table" },
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

        // --- ดึงข้อมูลจริงจาก table ---
        const result = await pool
            .request()
            .input("labelText", sql.NVarChar, labelText)
            .query(`
        SELECT TOP 1 *
        FROM ${dbTableName}
        WHERE [Id] = @labelText
      `);

        if (result.recordset.length === 0) {
            return NextResponse.json({ error: "ไม่พบข้อมูล" }, { status: 404 });
        }

        const data = result.recordset[0];

        // --- โหลด template PDF ---
        const templatePath = path.join(
            process.cwd(),
            "public",
            "templates",
            `${table}.pdf`
        );
        const existingPdfBytes = await fs.readFile(templatePath);

        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        pdfDoc.registerFontkit(fontkit);

        const fontBytes = await fs.readFile(
            path.join(process.cwd(), "public", "Fonts", "THSarabunNew", "THSarabunNew.ttf")
        );

        const font = await pdfDoc.embedFont(fontBytes);

        const page = pdfDoc.getPage(0);

        const pdfData: PDFData = data;
        console.log('pdf',pdfData)

        // ✅ เรียก helper แบบ await (async) เพื่อให้วาดเสร็จก่อน save
        await mapFieldsToPDF(page, font, pdfData, table);

        const pdfBytes = await pdfDoc.save();

        return new NextResponse(Buffer.from(pdfBytes), {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `inline; filename="filled.pdf"`,
            },
        });
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: "เกิดข้อผิดพลาด", detail: err.message }, { status: 500 });
    }
}
