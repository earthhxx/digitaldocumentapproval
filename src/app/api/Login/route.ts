//api/Login/route.ts
import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { getDashboardConnection } from "@/lib/db";
import { withCors, handleOptions } from "@/lib/cors";

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return withCors(NextResponse.json({ error: "กรุณากรอก username และ password" }, { status: 400 }));
    }

    const pool = await getDashboardConnection();
    const userResult = await pool.request()
      .input("username", sql.Int, username)
      .query(`
        SELECT [User_Id],[Name],[Pass],[ForgetPass]
        FROM tb_im_employee
        WHERE User_Id = @username
      `);

    if (userResult.recordset.length === 0) {
      return withCors(NextResponse.json({ error: "ไม่พบผู้ใช้ หรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 }));
    }

    const user = userResult.recordset[0];
    const isBcrypt = typeof user.Pass === "string" && user.Pass.startsWith("$2");

    const isValid = isBcrypt ? await bcrypt.compare(password, user.Pass) : password === user.Pass;

    if (!isValid) {
      return withCors(NextResponse.json({ error: "ไม่พบผู้ใช้ หรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 }));
    }

    // ดึงข้อมูลสิทธิ์และบทบาท
    const [roleResult, permResult, formResult, depResult] = await Promise.all([
      pool.request().input("userId", sql.Int, user.User_Id)
        .query(`SELECT r.RoleName FROM UserRoles ur INNER JOIN Roles r ON ur.RoleID = r.RoleID WHERE ur.UserID = @userId`),
      pool.request().input("userId", sql.Int, user.User_Id)
        .query(`SELECT DISTINCT p.PermissionName FROM UserRoles ur INNER JOIN RolePermissions rp ON ur.RoleID = rp.RoleID INNER JOIN Permissions p ON rp.PermissionID = p.PermissionID WHERE ur.UserID = @userId`),
      pool.request().input("userId", sql.Int, user.User_Id)
        .query(`SELECT DISTINCT f.Formaccess FROM UserRoles ur INNER JOIN RoleForm rf ON ur.RoleID = rf.RoleID INNER JOIN Formaccess f ON rf.FormaccessID = f.FormaccessID WHERE ur.UserID = @userId`),
      pool.request().input("userId", sql.Int, user.User_Id)
        .query(`SELECT DISTINCT d.DepartmentName FROM UserRoles ur INNER JOIN RolesDepartment rd ON ur.RoleID = rd.RoleID INNER JOIN Department d ON rd.DepartmentID = d.DepartmentID WHERE ur.UserID = @userId`),
    ]);

    const roles = roleResult.recordset.map(r => r.RoleName);
    const permissions = permResult.recordset.map(p => p.PermissionName);
    const formaccess = formResult.recordset.map(f => f.Formaccess);
    const Dep = depResult.recordset.map(d => d.DepartmentName);

    // 🔐 สร้าง session ID
    const sessionId = uuidv4();

    const sessionData = {
      userId: user.User_Id,
      username: user.Name,
      fullName: user.Name,
      roles,
      permissions,
      formaccess,
      Dep,
      ForgetPass: user.ForgetPass,
      createdAt: new Date(),
    };

    const expires = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 ชั่วโมง

    await pool.request()
      .input('session_id', sql.NVarChar(255), sessionId)
      .input('data', sql.NVarChar(sql.MAX), JSON.stringify(sessionData))
      .input('expires', sql.DateTime, expires)
      .query(`
        MERGE Sessions AS target
        USING (SELECT @session_id AS session_id) AS source
        ON (target.session_id = source.session_id)
        WHEN MATCHED THEN 
          UPDATE SET data = @data, expires = @expires
        WHEN NOT MATCHED THEN
          INSERT (session_id, data, expires) VALUES (@session_id, @data, @expires);
      `);

    // ✅ ตอบกลับ + เซ็ต session_id cookie (httpOnly)
    const res = NextResponse.json({
      success: true,
      fullName: user.Name,
      User_Id: user.User_Id,
      roles,
      permissions,
      ForgetPass: user.ForgetPass,
    });

    res.cookies.set("session_id", sessionId, {
      httpOnly: true,
      secure: false, // ใน production ควรตั้งเป็น true
      sameSite: "lax",
      path: "/",
      maxAge: 8 * 60 * 60, // 8 ชั่วโมง
    });

    return withCors(res);
  } catch (error) {
    console.error("Login error:", error);
    return withCors(NextResponse.json({ error: "Internal Server Error" }, { status: 500 }));
  }
}
