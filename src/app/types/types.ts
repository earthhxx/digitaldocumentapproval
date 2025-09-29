export interface UserPayload {
    userId?: number | string;
    username?: string;
    fullName?: string;
    roles?: string[];
    permissions?: string[];
    formaccess?: string[];
    Dep?: string[];
    ForgetPass?: string,
}

export interface User {
  userId: string;
  fullName: string;
  roles: string[];
  permissions: string[];
  ForgetPass: string; // ✅ ชื่อต้องตรงกับฝั่ง backend
}


export interface ApproveData {
    totalAll: number;
    totals: Record<string, number>; // เพิ่มตรงนี้
    data: { ID: number; name: string; source: string; Dep: string; }[];
    error?: string;   // เพิ่ม option นี้
}

