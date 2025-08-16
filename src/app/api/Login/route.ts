// /pages/api/login.ts
import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getDashboardConnection } from "../../../../lib/db";

type Data =
    | { error: string }
    | {
        userId: number;
        username: string;
        fullName: string;
        roles: string[];
        permissions: string[];
        token: string;
    };

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { username, password } = body;

        if (!username || !password) {
            return NextResponse.json({ error: "กรุณากรอก username และ password" }, { status: 400 });
        }

        const pool = await getDashboardConnection();

        // 1. ดึง user
        const userResult = await pool.request()
            .input('username', sql.VarChar, username)
            .query(`
                SELECT [User_Id],[Name],[Pass]
                FROM tb_im_employee
                WHERE User_Id = @username
            `);


        if (userResult.recordset.length === 0) {
            return NextResponse.json({ error: "ไม่พบผู้ใช้ หรือรหัสผ่านไม่ถูกต้อง" });
        }

        const userrow = userResult.recordset[0];

        // 2. ตรวจสอบ password
        function isBcryptHash(str: string) {
            return typeof str === 'string' && str.startsWith('$2');
        }

        let isValid = false;

        if (isBcryptHash(userrow.Pass)) {
            // ถ้าเป็น hash จริง ๆ
            isValid = await bcrypt.compare(password, userrow.Pass);
        } else {
            // ยังเป็น plain text อยู่
            isValid = password === userrow.Pass;

            // ถ้ารหัสผ่านถูกต้อง ให้ hash ใหม่และอัปเดตลง DB ด้วยเลย
            // if (isValid) {
            //     const newHash = await bcrypt.hash(password, 10);
            //     await pool.request()
            //         .input('hash', sql.VarChar, newHash)
            //         .input('userId', sql.Int, userrow.User_Id)
            //         .query(`UPDATE tb_im_employee SET Pass = @hash WHERE User_Id = @userId`);
            // }
        }

        // ถ้าไม่ถูกต้อง
        if (!isValid) {
            return NextResponse.json({ error: "ไม่พบผู้ใช้ หรือรหัสผ่านไม่ถูกต้อง" });
        }

        //isValid = true; // ถ้าถูกต้อง
        // 3. ดึง roles ของ user
        const roleResult = await pool.request()
            .input('userId', sql.Int, userrow.User_Id)
            .query(`
                SELECT r.RoleName
                FROM UserRoles ur
                INNER JOIN Roles r ON ur.RoleID = r.RoleID
                WHERE ur.UserID = @userId
            `);
        const roles = roleResult.recordset.map(r => r.RoleName);

        // 4. ดึง permissions จากทุก role ของ user
        const permResult = await pool.request()
            .input('userId', sql.Int, userrow.User_Id)
            .query(`
                SELECT DISTINCT p.PermissionName
                FROM UserRoles ur
                INNER JOIN RolePermissions rp ON ur.RoleID = rp.RoleID
                INNER JOIN Permissions p ON rp.PermissionID = p.PermissionID
                WHERE ur.UserID = @userId
            `);
        const permissions = permResult.recordset.map(p => p.PermissionName);

        // 5. สร้าง JWT token
        const token = jwt.sign(
            {
                userId: userrow.User_Id,
                username: userrow.Name,
                fullName: userrow.Name,
                roles,
                permissions,
            },
            process.env.JWT_SECRET || "your-secret-key",
            { expiresIn: "8h" }
        );

        return NextResponse.json({
            userId: userrow.User_Id,
            fullName: userrow.Name,
            roles,
            permissions,
            token,
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" });
    }
}
