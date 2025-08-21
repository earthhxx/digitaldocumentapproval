import { NextRequest, NextResponse } from "next/server";
import { getDApproveData } from "@/lib/modules/DApproveModule";

export async function POST(req: NextRequest) {
  const result = await getDApproveData(req);
  return NextResponse.json(result.json, { status: result.status });
}
