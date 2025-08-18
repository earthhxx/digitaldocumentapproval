// /middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, JWTPayload } from "jose";

export type JwtPayload = {
  userId: number | string;
  username: string;
  fullName: string;
  roles: string[];
  permissions: string[];
  iat?: number;
  exp?: number;
};

export async function middleware(req: NextRequest) {
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
      // แปลง secret เป็น Uint8Array สำหรับ Web Crypto
      const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

      const { payload } = await jwtVerify(token, secret) as { payload: JWTPayload & JwtPayload };
      console.log("🔹 Decoded JWT:", payload);

      // ตรวจ roles
      if (!payload.roles || !payload.roles.includes("admin")) {
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
