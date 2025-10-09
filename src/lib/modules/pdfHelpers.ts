import { PDFPage, PDFFont, rgb } from "pdf-lib";
import { PDFData } from "@/app/api/generate-filled-pdf/route";

// type สำหรับ field เดี่ยว
type FieldMapping = {
    x: number;
    y: number;
    size?: number;
    font: string;
    format?: string;
    source?: string;
};

// type สำหรับ table mapping (สามารถเก็บ field เดี่ยวหรือ array ของ field)
type TableFieldMap = Record<string, Record<string, FieldMapping | FieldMapping[]>>;


// ตัวอย่าง mapping ของแต่ละ table
const tableFieldMap: TableFieldMap = {
    FM_IT_03: {
        ID: { x: 500, y: 682, size: 14, font: "thai" },
        // FormID: { x: 500, y: 750, size: 14, font: "thai" },
        Date: { x: 435, y: 665, size: 12, format: "date", font: "thai" },
        NameThi: { x: 220, y: 656, size: 10, font: "thai" },
        NameEn: { x: 220, y: 646, size: 10, font: "thai" },
        Dep: { x: 180, y: 635, size: 11, font: "thai" },
        DepM: { x: 350, y: 635, size: 11, font: "thai" },
        Email: { x: 95, y: 607, size: 14, font: "check" },
        Repair: { x: 163, y: 607, size: 14, font: "check" },
        AddEqui: { x: 207, y: 607, size: 14, font: "check" },
        AddProg: { x: 270, y: 607, size: 14, font: "check" },
        OtherIT: { x: 338, y: 607, size: 14, font: "check" },
        Other_Detail: { x: 400, y: 610, size: 14, font: "thai" },
        DetailName: { x: 105, y: 575, size: 12, font: "thai" },
        NameRequest: { x: 105, y: 430, size: 11, font: "thai" },
        // DateUser: { x: 150, y: 570, size: 14, format: "date", font: "thai" },
        // StatusCheck: { x: 150, y: 570, size: 14, font: "check" },
        NameCheck: { x: 265, y: 430, size: 11, font: "thai" },
        // DateCheck: { x: 150, y: 570, size: 14, format: "date", font: "thai" },
        // StatusApprove: { x: 150, y: 570, size: 14, font: "check" },
        NameApprove: { x: 420, y: 430, size: 11, font: "thai" },
        // DateAppove: { x: 150, y: 570, size: 14, font: "date", font: "thai" },

    },
    FM_GA_04: {
        ID: { x: 653, y: 503, size: 15, font: "thai" },
        Date: { x: 570, y: 440, size: 15, format: "date", font: "thai" },
        TitleName: { x: 262, y: 420, size: 15, font: "thai" },
        TitleName1: { x: 282, y: 420, size: 15, font: "check" },
        TitleName2: { x: 302, y: 420, size: 15, font: "check" },
        Name: { x: 400, y: 412, size: 15, font: "thai" },
        Iduser: { x: 300, y: 390, size: 15, font: "thai" },
        Dep: { x: 500, y: 390, size: 11, font: "thai" },
        Date1: { x: 450, y: 370, size: 15, format: "date", font: "thai" },
        Starttime: { x: 220, y: 350, size: 15, format: "time", font: "thai" },
        EndTime: { x: 460, y: 350, size: 15, format: "time", font: "thai" },
        Back: { x: 233, y: 325, size: 15, font: "check" },
        NoBack: { x: 475, y: 325, size: 15, font: "check" },
        Detail: { x: 265, y: 298, size: 15, font: "thai" },
        NameRequest: { x: 350, y: 237, size: 15, font: "thai" },
        NameCheck: { x: 160, y: 190, size: 15, font: "thai" },
        DateCheck: { x: 190, y: 150, size: 15, format: "date", font: "thai" },

        NameApprove: { x: 350, y: 190, size: 15, font: "thai" },
        DateApprove: { x: 380, y: 150, size: 15, format: "date", font: "thai" },
        Date2: { x: 190, y: 150, size: 15, format: "date", font: "thai" },
        Date3: { x: 380, y: 150, size: 15, format: "date", font: "thai" },
    },
    FM_GA_03: {
        ID: { x: 705, y: 523, size: 15, font: "thai" },
        Date: { x: 590, y: 460, size: 15, format: "date", font: "thai" },

        // Trital Name
        TitleName1: { x: 202, y: 446, size: 15, font: "check" },
        TitleName2: { x: 222, y: 446, size: 15, font: "check" },
        TitleName3: { x: 242, y: 446, size: 15, font: "check" },

        TitleName: { x: 320, y: 438, size: 15, font: "thai" },
        Iduser: { x: 220, y: 415, size: 15, font: "thai" },
        DepT: { x: 410, y: 415, size: 11, font: "thai" },
        Dep: { x: 620, y: 415, size: 11, font: "thai" },

        // Title Company
        TitleCompany1: { x: 205, y: 403, size: 15, font: "check" },
        TitleCompany2: { x: 236, y: 403, size: 15, font: "check" },
        TitleCompany3: { x: 258, y: 403, size: 15, font: "check" },
        NameCompany: { x: 300, y: 392, size: 15, font: "thai" },

        // Dates
        Date1: { x: 450, y: 372, size: 15, format: "date", font: "thai" },

        // Checkboxes
        Repair: { x: 212, y: 345, size: 20, font: "check" },
        Change: { x: 310, y: 345, size: 20, font: "check" },
        Returndata: { x: 408, y: 345, size: 20, font: "check" },
        Other: { x: 507, y: 345, size: 20, font: "check" },

        OthrDetail: { x: 565, y: 344, size: 15, font: "thai" },

        // Detail & Qty
        Detail1: { x: 180, y: 295, size: 15, font: "thai" },
        Qty1: { x: 603, y: 295, size: 15, font: "thai" },
        Detail2: { x: 180, y: 273, size: 15, font: "thai" },
        Qty2: { x: 603, y: 273, size: 15, font: "thai" },
        Detail3: { x: 180, y: 251, size: 15, font: "thai" },
        Qty3: { x: 603, y: 251, size: 15, font: "thai" },
        Detail4: { x: 180, y: 230, size: 15, font: "thai" },
        Qty4: { x: 603, y: 230, size: 15, font: "thai" },

        // Names & Approve
        NameRequest: { x: 340, y: 187, size: 15, font: "thai" },
        NameCheck: { x: 140, y: 152, size: 15, font: "thai" },
        NameApprove: { x: 360, y: 152, size: 15, font: "thai" },

        // More Dates
        DateCheck: { x: 130, y: 130, size: 15, format: "date", font: "thai" },
        DateApprove: { x: 370, y: 130, size: 15, format: "date", font: "thai" },
    },
    FM_HR_07: {
        // Personal Info
        NameThi: { x: 135, y: 395, size: 15, font: "thai" },
        Dep: { x: 470, y: 395, size: 15, font: "thai" },
        EmployeeID: { x: 640, y: 395, size: 15, font: "thai" },

        NameEng: { x: 135, y: 375, size: 15, font: "thai" },
        Dep_Eng: { x: 470, y: 375, size: 15, font: "thai" },
        EmployeeID_Eng: { x: 640, y: 375, size: 15, font: "thai" },

        // OT Table 1
        No1: { x: 78, y: 310, size: 15, font: "thai" },
        Date: { x: 110, y: 310, size: 15, font: "thai", format: "date" },
        TimeIN1: { x: 200, y: 310, size: 15, font: "thai", format: "time" },
        TimeOut1: { x: 275, y: 310, size: 15, font: "thai", format: "time" },
        OT150_1: { x: 350, y: 310, size: 15, font: "thai" },
        OT200_1: { x: 400, y: 310, size: 15, font: "thai" },
        OT300_1: { x: 450, y: 310, size: 15, font: "thai" },
        AA1: { x: 515, y: 307, size: 15, font: "check" },
        BB1: { x: 570, y: 307, size: 15, font: "check" },
        CC1: { x: 625, y: 307, size: 15, font: "check" },
        Day1: { x: 683, y: 307, size: 15, font: "check" },

        // OT Table 2
        No2: { x: 78, y: 287, size: 15, font: "thai" },
        Date2: { x: 110, y: 287, size: 15, font: "thai", format: "date" },
        TimeIN2: { x: 200, y: 287, size: 15, font: "thai", format: "time" },
        TimeOut2: { x: 275, y: 287, size: 15, font: "thai", format: "time" },
        OT150_2: { x: 350, y: 287, size: 15, font: "thai" },
        OT200_2: { x: 400, y: 287, size: 15, font: "thai" },
        OT300_2: { x: 450, y: 287, size: 15, font: "thai" },
        AA2: { x: 515, y: 287, size: 15, font: "check" },
        BB2: { x: 570, y: 287, size: 15, font: "check" },
        CC2: { x: 625, y: 287, size: 15, font: "check" },
        Day2: { x: 683, y: 287, size: 15, font: "check" },

        // Checkboxes
        Forget: { x: 132, y: 249, size: 15, font: "check" },
        Outtime: { x: 235, y: 249, size: 15, font: "check" },
        Record: { x: 337, y: 249, size: 15, font: "check" },
        Offsite: { x: 438, y: 249, size: 15, font: "check" },
        Other: { x: 538, y: 249, size: 15, font: "check" },
        Other_Detail: { x: 590, y: 249, size: 15, font: "thai" },

        // Request & Approve
        NameRequest: { x: 160, y: 205, size: 15, font: "thai" },
        DateRequest: { x: 340, y: 205, size: 15, font: "thai", format: "date" },
        SupRequest: { x: 563, y: 205, size: 15, font: "thai" },

        NameRequest2: { x: 160, y: 178, size: 15, font: "thai" },
        DateRequest2: { x: 340, y: 178, size: 15, font: "thai", format: "date" },
        SupRequest2: { x: 563, y: 178, size: 15, font: "thai" },

        NameCheck: [
            { x: 160, y: 150, size: 15, font: "thai" },
            { x: 160, y: 122, size: 15, font: "thai" },
        ],
        DateCheck: [
            { x: 340, y: 150, size: 15, font: "thai", format: "date" },
            { x: 340, y: 122, size: 15, font: "thai", format: "date" },
        ],
        NameApprove: [
            { x: 563, y: 150, size: 15, font: "thai" },
            { x: 563, y: 122, size: 15, font: "thai" },
        ],
    },
    FM_GA_13: {
        ID: { x: 670, y: 452, size: 15, font: "thai" },
        Dep: { x: 140, y: 435, size: 15, font: "thai" },
        Withdrawn: { x: 140, y: 419, size: 15, font: "thai" },

        Date: { x: 60, y: 361, size: 15, font: "thai", format: "date" },
        Disbursement: { x: 140, y: 361, size: 15, font: "thai" },
        QTY: { x: 340, y: 361, size: 15, font: "thai" },
        Unit: { x: 405, y: 361, size: 15, font: "thai" },
        Remark: { x: 470, y: 361, size: 15, font: "thai" },

        Date1: { x: 60, y: 342, size: 15, font: "thai", format: "date" },
        Disbursement1: { x: 140, y: 342, size: 15, font: "thai" },
        QTY1: { x: 340, y: 342, size: 15, font: "thai" },
        Unit1: { x: 405, y: 342, size: 15, font: "thai" },
        Remark1: { x: 470, y: 342, size: 15, font: "thai" },

        Date2: { x: 60, y: 323, size: 15, font: "thai", format: "date" },
        Disbursement2: { x: 140, y: 323, size: 15, font: "thai" },
        QTY2: { x: 340, y: 323, size: 15, font: "thai" },
        Unit2: { x: 405, y: 323, size: 15, font: "thai" },
        Remark2: { x: 470, y: 323, size: 15, font: "thai" },

        Date3: { x: 60, y: 305, size: 15, font: "thai", format: "date" },
        Disbursement3: { x: 140, y: 305, size: 15, font: "thai" },
        QTY3: { x: 340, y: 305, size: 15, font: "thai" },
        Unit3: { x: 405, y: 305, size: 15, font: "thai" },
        Remark3: { x: 470, y: 305, size: 15, font: "thai" },

        Date4: { x: 60, y: 287, size: 15, font: "thai", format: "date" },
        Disbursement4: { x: 140, y: 287, size: 15, font: "thai" },
        QTY4: { x: 340, y: 287, size: 15, font: "thai" },
        Unit4: { x: 405, y: 287, size: 15, font: "thai" },
        Remark4: { x: 470, y: 287, size: 15, font: "thai" },

        Date5: { x: 60, y: 268, size: 15, font: "thai", format: "date" },
        Disbursement5: { x: 140, y: 268, size: 15, font: "thai" },
        QTY5: { x: 340, y: 268, size: 15, font: "thai" },
        Unit5: { x: 405, y: 268, size: 15, font: "thai" },
        Remark5: { x: 470, y: 268, size: 15, font: "thai" },

        Date6: { x: 60, y: 250, size: 15, font: "thai", format: "date" },
        Disbursement6: { x: 140, y: 250, size: 15, font: "thai" },
        QTY6: { x: 340, y: 250, size: 15, font: "thai" },
        Unit6: { x: 405, y: 250, size: 15, font: "thai" },
        Remark6: { x: 470, y: 250, size: 15, font: "thai" },

        Date7: { x: 60, y: 230, size: 15, font: "thai", format: "date" },
        Disbursement7: { x: 140, y: 230, size: 15, font: "thai" },
        QTY7: { x: 340, y: 230, size: 15, font: "thai" },
        Unit7: { x: 405, y: 230, size: 15, font: "thai" },
        Remark7: { x: 470, y: 230, size: 15, font: "thai" },

        Date8: { x: 60, y: 212, size: 15, font: "thai", format: "date" },
        Disbursement8: { x: 140, y: 212, size: 15, font: "thai" },
        QTY8: { x: 340, y: 212, size: 15, font: "thai" },
        Unit8: { x: 405, y: 212, size: 15, font: "thai" },
        Remark8: { x: 470, y: 212, size: 15, font: "thai" },

        NameRequest: { x: 335, y: 177, size: 15, font: "thai" },
        NameCheck: { x: 435, y: 177, size: 15, font: "thai" },
        NameApprove: { x: 530, y: 177, size: 15, font: "thai" },
    }
    // เพิ่ม table ใหม่ ๆ ที่นี่ได้เลย
};


export async function mapFieldsToPDF(
    page: PDFPage,
    fontthai: PDFFont,
    fontcheck: PDFFont,
    data: PDFData,
    table: string
) {
    const fieldMap = tableFieldMap[table];
    console.log('fm', fieldMap);
    if (!fieldMap) return;

    const markFields: Record<string, string> = {
        Email: "✓",
        Repair: "✓",
        AddEqui: "✓",
        AddProg: "✓",
        OtherIT: "✓",
        Change: "✓",
        Returndata: "✓",
        Other: "✓",
        TitleName: "__",
        TitleName1: "__",
        TitleName2: "__",
        TitleName3: "______",
        TitleCompany1: "___",
        TitleCompany2: "__",
        TitleCompany3: "__",
        Back: "✓",
        NoBack: "✓",
        AA1: "✓",
        BB1: "✓",
        CC1: "✓",
        AA2: "✓",
        BB2: "✓",
        CC2: "✓",
        Forget: "✓",
        Outtime: "✓",
        Record: "✓",
        Offsite: "✓",
        Day1: "✓",
        Day2: "✓",
    };

    // loop key ของ fieldMap
    for (const key in fieldMap) {
        const fields = Array.isArray(fieldMap[key]) ? fieldMap[key] : [fieldMap[key]];

        for (const field of fields) {
            const { x, y, size = 12, format, font, source } = field;
            const dataKey = source ?? key;
            let text = data[dataKey] ?? "";

            // date/time format
            if (format === "date" && data[dataKey]) {
                const rawValue = data[dataKey];

                if (typeof rawValue === "string" || typeof rawValue === "number" || rawValue instanceof Date) {
                    const date = new Date(rawValue);
                    text = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
                } else {
                    // handle unexpected type
                    console.warn(`Unexpected date type: ${typeof rawValue}`, rawValue);
                    text = ""; // or fallback
                }
            }


            if (format === "time" && data[dataKey]) {
                const rawValue = data[dataKey];

                if (
                    typeof rawValue === "string" ||
                    typeof rawValue === "number" ||
                    rawValue instanceof Date
                ) {
                    const date = new Date(rawValue);
                    const hh = String(date.getHours()).padStart(2, "0");
                    const mm = String(date.getMinutes()).padStart(2, "0");
                    text = `${hh}:${mm}`;
                } else {
                    console.warn(`Invalid time format for key: ${dataKey}`, rawValue);
                    text = "";
                }
            }

            // checkbox
            if ((data[dataKey] === 1 || data[dataKey] === "1") && font === "check") {
                text = markFields[key] || "";
            }
            if ((data[dataKey] === 0 || data[dataKey] === "0") && font === "check") {
                text = "";
            }

            page.drawText(text.toString(), {
                x,
                y,
                size,
                font: font === "check" ? fontcheck : fontthai,
                color: rgb(0, 0, 0.7),
            });
        }
    }


}
