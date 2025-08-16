// /middleware.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // protect เฉพาะ /api/admin/*
  if (pathname.startsWith("/api/admin")) {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");

      // ตรวจ roles
      if (!decoded.roles || !decoded.roles.includes("admin")) {
        return NextResponse.json({ error: "Forbidden: admin only" }, { status: 403 });
      }

      // ถ้าเป็น admin → ผ่าน
      return NextResponse.next();
    } catch (err) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/admin/:path*"],
};
