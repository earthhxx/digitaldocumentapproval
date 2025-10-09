// lib/session.ts
import { getDashboardConnection } from "@/lib/db";
import sql from "mssql";

export interface SessionData {
  userId: number | string;
  username: string;
  fullName: string;
  roles: string[];
  permissions?: string[];
  formaccess?: string[];
  Dep?: string[];
  ForgetPass?: string;
  createdAt?: Date;
}

export async function getSession(sessionId: string): Promise<SessionData | null> {
  const pool = await getDashboardConnection();
  const result = await pool.request()
    .input("session_id", sql.NVarChar(255), sessionId)
    .query("SELECT data, expires FROM Sessions WHERE session_id = @session_id");

  if (result.recordset.length === 0) return null;

  const { data, expires } = result.recordset[0];

  if (new Date(expires) < new Date()) return null; // หมดอายุ

  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}
