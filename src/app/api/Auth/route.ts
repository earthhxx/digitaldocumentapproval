import type { NextApiRequest, NextApiResponse } from "next";
import sql from "mssql";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getDashboardConnection } from "../../../lib/db"; // Assuming you have a db config file

type Data =
    | { error: string }
    | {
        userId: number;
        username: string;
        role: string;
        permissions: string[];
        token: string;
    };

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "กรุณากรอก username และ password" });
    }

    try {
        const pool = await getDashboardConnection(); // คืน ConnectionPool ที่ connect แล้ว

        // ใช้ pool.request() แทน sql.query()
        const userResult = await pool.request()
            .input('username', sql.VarChar, username)
            .query` 
            SELECT UserID, Username, PasswordHash, RoleID, FullName 
            FROM Users WHERE Username = ${username}
            `;

        if (userResult.recordset.length === 0) {
            return res.status(401).json({ error: "ไม่พบผู้ใช้ หรือรหัสผ่านไม่ถูกต้อง" });
        }

        const user = userResult.recordset[0];

        // 2. ตรวจสอบ password
        const isValid = await bcrypt.compare(password, user.PasswordHash);
        if (!isValid) {
            return res.status(401).json({ error: "ไม่พบผู้ใช้ หรือรหัสผ่านไม่ถูกต้อง" });
        }

        // 3. หา role name
        const roleResult = await pool.request()
            .input('roleId', sql.Int, user.RoleID)
            .query` SELECT RoleName FROM Roles WHERE RoleID = ${user.RoleID}`;

        const roleName = roleResult.recordset[0]?.RoleName ?? "Unknown";

        // 4. หา permissions ของ role
        const permResult = await pool.request()
            .input('roleId', sql.Int, user.RoleID)
            .query`
            SELECT p.PermissionName
            FROM RolePermissions rp
            INNER JOIN Permissions p ON rp.PermissionID = p.PermissionID
            WHERE rp.RoleID = ${user.RoleID}
        `;
        const permissions = permResult.recordset.map((row) => row.PermissionName);

        // 5. สร้าง JWT token (ตัวอย่างลับด้วย secret ง่ายๆ)
        const token = jwt.sign(
            {
                userId: user.UserID,
                username: user.Username,
                role: roleName,
                permissions,
            },
            process.env.JWT_SECRET || "your-secret-key",
            { expiresIn: "8h" }
        );

        return res.status(200).json({
            userId: user.UserID,
            username: user.Username,
            role: roleName,
            permissions,
            token,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
