import { PDFPage, PDFFont, rgb } from "pdf-lib";
import { PDFData } from "@/app/api/generate-filled-pdf/route";

interface FieldMapping {
    x: number;
    y: number;
    size?: number;
    format?: "date" | "text";
}

// ตัวอย่าง mapping ของแต่ละ table
const tableFieldMap: Record<string, Record<string, FieldMapping>> = {
    FM_IT_03: {
        No_Id: { x: 50, y: 750, size: 14 },
        Date: { x: 50, y: 730, size: 14, format: "date" },
        NameThi: { x: 50, y: 710, size: 14 },
        NameEn: { x: 50, y: 690, size: 14 },
        Dep: { x: 50, y: 670, size: 14 },
        DepM: { x: 50, y: 650, size: 14 },
        Email: { x: 50, y: 630, size: 14 },
        Other_Detail: { x: 50, y: 610, size: 14 },
        NameUser: { x: 50, y: 590, size: 14 },
        Status: { x: 50, y: 570, size: 14 },
    },
    // เพิ่ม table ใหม่ ๆ ที่นี่ได้เลย
};

export async function mapFieldsToPDF(
    page: PDFPage,
    font: PDFFont,
    data: PDFData,
    table: string
) {
    const fieldMap = tableFieldMap[table];
    if (!fieldMap) return;

    for (const key in fieldMap) {
        const { x, y, size = 12, format } = fieldMap[key];
        let text = data[key] ?? "";

        if (format === "date" && data[key]) {
            const date = new Date(data[key]);
            text = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
        }

        page.drawText(text.toString(), { x, y, size, font, color: rgb(0,0,0.7) });
    }
}
