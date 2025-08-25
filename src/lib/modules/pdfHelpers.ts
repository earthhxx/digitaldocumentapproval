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
        id: { x: 500, y: 682, size: 14 },
        // FormID: { x: 500, y: 750, size: 14 },
        Date: { x: 435, y: 665, size: 12, format: "date" },
        NameThi: { x: 220, y: 656, size: 10 },
        NameEn: { x: 220, y: 646, size: 10 },
        Dep: { x: 180, y: 635, size: 14 },
        DepM: { x: 350, y: 635, size: 14 },
        Email: { x: 95, y: 607, size: 14 },
        Repair: { x: 163, y: 607, size: 14 },
        AddEqui: { x: 207, y: 607, size: 14 },
        AddProg: { x: 270, y: 607, size: 14 },
        OtherIT: { x: 338, y: 607, size: 14 },
        Other_Detail: { x: 400, y: 610, size: 14 },
        NameUser: { x: 110, y: 430, size: 14 },
        // DateUser: { x: 150, y: 570, size: 14, format: "date" },
        // StatusCheck: { x: 150, y: 570, size: 14 },
        NameCheck: { x: 270, y: 430, size: 14 },
        // DateCheck: { x: 150, y: 570, size: 14, format: "date" },
        // StatusApprove: { x: 150, y: 570, size: 14 },
        NameApprove: { x: 425, y: 430, size: 14 },
        // DateAppove: { x: 150, y: 570, size: 14 },
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
        const { x, y, size, format } = fieldMap[key];
        let text = data[key] ?? "";

        if (format === "date" && data[key]) {
            const date = new Date(data[key]);
            text = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
        }

        page.drawText(text.toString(), { x, y, size, font, color: rgb(0, 0, 0.7) });
    }
}
