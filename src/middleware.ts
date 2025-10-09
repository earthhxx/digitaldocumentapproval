import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/api/Login" || pathname === "/api/setup-session") {
    return NextResponse.next();
  }
  // ดูว่า cookie มี auth_token หรือยัง (แต่ยังไม่ verify)
  // const token = req.cookies.get("auth_token")?.value;

  // ยังไม่ verify token แค่เช็คว่ามี cookie ไหม
  // if (!token) {
  //   return NextResponse.json({ error: "Unauthorized: No token" }, { status: 401 });
  // }

  // TODO: ในอนาคต verify token ที่นี่

  // ตรวจสอบ path และสิทธิ์ (ตอนนี้ข้ามไปก่อน)
  // เช่น ถ้าอยากกัน /api/admin ให้มี role admin
  // ก็ verify token และ decode payload มาเช็ค

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
