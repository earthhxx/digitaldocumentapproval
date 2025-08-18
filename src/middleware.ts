// /middleware.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export type JwtPayload = {
  userId: number | string;   // มาจาก tb_im_employee.User_Id
  username: string;          // userrow.Name
  fullName: string;          // userrow.Name
  roles: string[];           // จากตาราง Roles
  permissions: string[];     // จากตาราง Permissions
  iat?: number;              // auto-gen โดย JWT (issued at)
  exp?: number;              // auto-gen โดย JWT (expired time)
};

export function middleware(req: NextRequest) {

  console.log("✅ Middleware triggered");
  const { pathname } = req.nextUrl;
  console.log("🔹 Incoming request pathname:", pathname);

  // protect เฉพาะ /api/admin/*
  if (pathname.startsWith("/api/admin")) {
    const authHeader = req.headers.get("authorization");
    console.log("🔹 Authorization header:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ Missing or invalid Authorization header");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    console.log("🔹 Token extracted:", token);

    try {

      const decodedRaw = jwt.verify(token, process.env.JWT_SECRET!);

      if (typeof decodedRaw !== "object" || decodedRaw === null) {
        return NextResponse.json({ error: "Invalid token" }, { status: 403 });
      }

      const decoded = decodedRaw as JwtPayload;
      console.log("🔹 Decoded JWT:", decoded);

      // ตรวจ roles
      if (!decoded.roles || !decoded.roles.includes("admin")) {
        console.log("❌ Forbidden: user is not admin");
        return NextResponse.json({ error: "Forbidden: admin only" }, { status: 403 });
      }

      console.log("✅ Admin verified, passing through middleware");
      return NextResponse.next();
    } catch (err) {
      console.log("❌ Invalid or expired token:", err);
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 403 });
    }
  }

  console.log("➡️ Non-admin path, passing through middleware");
  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};