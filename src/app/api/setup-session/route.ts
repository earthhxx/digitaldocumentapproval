import { NextResponse } from "next/server";
import MSSQLStore from "@/lib/MSSQLStore";

export async function GET() {
  try {
    new MSSQLStore(); // แค่เรียก constructor ก็สร้าง table แล้ว (มี ensureTable อยู่แล้ว)
    return NextResponse.json({ success: true, message: "Sessions table checked or created ✅" });
  } catch (err) {
    console.error("Error setting up session table:", err);
    return NextResponse.json({ success: false, error: "Failed to create session table ❌" }, { status: 500 });
  }
}
//http://localhost:3000/api/setup-session