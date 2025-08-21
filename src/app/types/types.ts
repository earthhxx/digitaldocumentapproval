export interface UserPayload { userId?: number | string; username?: string; fullName?: string; roles?: string[]; permissions?: string[]; }
export interface ApproveData {
    totalAll: number;
    totals: Record<string, number>;
    data: { id: number; name: string; source: string }[];
    error?: string;   // เพิ่ม option นี้
}