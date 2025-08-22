import { PDFPage, PDFFont, rgb } from "pdf-lib";

export interface PDFData {
    No_Id?: string;
    Date?: string | Date;
    NameThi?: string;
    NameEn?: string;
    Dep?: string;
    DepM?: string;
    Email?: number;
    Reapir?: number;
    AddEqui?: number;
    AddProg?: number;
    OtherIT?: number;
    Other_Detail?: string;
    NameUser?: string;
    NameCheck?: string;
    NameMD?: string;
    Status?: string;
    // เพิ่ม field อื่นๆ ตามต้องการ
}

export function mapFieldsToPDF(page: PDFPage, font: PDFFont, data: PDFData, table: string) {
    if (table === "FM_IT_03") {
        page.drawText(`เลขที่เอกสาร: ${data.No_Id ?? ""}`, { x: 50, y: 750, size: 14, font });
        page.drawText(`วันที่: ${data.Date ?? ""}`, { x: 50, y: 730, size: 14, font });
        page.drawText(`ชื่อ (TH): ${data.NameThi ?? ""}`, { x: 50, y: 710, size: 14, font });
        page.drawText(`ชื่อ (EN): ${data.NameEn ?? ""}`, { x: 50, y: 690, size: 14, font });
        page.drawText(`ฝ่าย: ${data.Dep ?? ""}`, { x: 50, y: 670, size: 14, font });
        page.drawText(`ฝ่ายย่อย: ${data.DepM ?? ""}`, { x: 50, y: 650, size: 14, font });
        page.drawText(`อีเมล: ${data.Email ?? ""}`, { x: 50, y: 630, size: 14, font });
        page.drawText(`รายละเอียดอื่นๆ: ${data.Other_Detail ?? ""}`, { x: 50, y: 610, size: 14, font });
        page.drawText(`ชื่อผู้ใช้: ${data.NameUser ?? ""}`, { x: 50, y: 590, size: 14, font });
        page.drawText(`สถานะ: ${data.Status ?? ""}`, { x: 50, y: 570, size: 14, font });
    }
    else if (table === "") {

    }
}