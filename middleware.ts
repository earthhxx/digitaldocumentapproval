// /middleware.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req: NextRequest) {
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
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
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
  matcher: ["/api/admin", "/api/admin/:path*"],
};
