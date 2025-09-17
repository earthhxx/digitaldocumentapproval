// /pages/api/usertable/edituser.ts
import { NextRequest, NextResponse } from "next/server";
import { getDashboardConnection } from "@/lib/db";
import sql from "mssql"; // ✅ ต้อง import sql มาด้วย

const hasThai = (text: string) => /[\u0E00-\u0E7F]/.test(text);

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { User_Id, Pass } = body;

        if (!User_Id || !Pass) {
            return NextResponse.json({ error: "กรอกข้อมูลไม่ครบ" }, { status: 400 });
        }

        // ❌ ถ้า user ใส่ภาษาไทยมา
        if (hasThai(User_Id) || hasThai(Pass)) {
            return NextResponse.json({ error: "ไม่อนุญาตให้ใช้ภาษาไทย" }, { status: 400 });
        }

        const pool = await getDashboardConnection();

        // เช็คว่า User_Id มีอยู่หรือไม่
        const checkUser = await pool.request()
            .input("User_Id", sql.VarChar, User_Id)
            .query(`
                SELECT User_Id FROM [dbo].[tb_im_employee] WHERE User_Id=@User_Id
            `);

        if (checkUser.recordset.length === 0) {
            return NextResponse.json({ error: "ไม่พบผู้ใช้งาน" }, { status: 404 });
        }

        await pool.request()
            .input("User_Id", sql.VarChar, User_Id)
            .input("Pass", sql.VarChar, Pass)
            .query(`
                UPDATE [dbo].[tb_im_employee]
                SET Pass = @Pass, ForgetPass = NULL
                WHERE User_Id = @User_Id
            `);

        // SELECT ข้อมูลทั้งหมดส่งกลับ
        const result = await pool.request().query(`
            SELECT [id],[User_Id],[Pass],[Name],[Age],[Sex],[Tel],[Department],[Process],[Image],[StartDate],[Status],[CreateDate],[ForgetPass]
            FROM [dbo].[tb_im_employee]
        `);

        return NextResponse.json(result.recordset);

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
