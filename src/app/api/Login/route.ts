import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { getDashboardConnection } from "../../../../lib/db";

// Type ของ JWT Payload
export type JwtPayload = {
  userId: number | string;
  username: string;
  fullName: string;
  roles: string[];
  permissions: string[];
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
    const isBcryptHash = (str: string) => typeof str === 'string' && str.startsWith('$2');
    let isValid = false;

    if (isBcryptHash(userrow.Pass)) {
      isValid = await bcrypt.compare(password, userrow.Pass);
    } else {
      isValid = password === userrow.Pass;
    }

    if (!isValid) {
      return NextResponse.json({ error: "ไม่พบผู้ใช้ หรือรหัสผ่านไม่ถูกต้อง" });
    }

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

    // 4. ดึง permissions
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

    // 5. สร้าง JWT token ด้วย jose
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

    const token = await new SignJWT({
      userId: userrow.User_Id,
      username: userrow.Name,
      fullName: userrow.Name,
      roles,
      permissions
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("8h")
      .sign(secret);

    return NextResponse.json({
      userId: userrow.User_Id,
      fullName: userrow.Name,
      roles,
      permissions,
      token
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" });
  }
}
