import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import DApproveTable from "./components/D_approvetable"; // SPA component

export interface UserPayload {
  userId?: number | string;
  username?: string;
  fullName?: string;
  roles?: string[];
  permissions?: string[];
}

export default async function UserLoginPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  let user: UserPayload | null = null;
  if (token) {
    try {
      const decoded = jwt.decode(token);
      if (typeof decoded === "object" && decoded !== null) {
        user = decoded as UserPayload;
      }
    } catch { }
  }

  if (!user || !user.roles?.includes("user")) {
    return <div>Access Denied</div>;
  }

  // --- SSR fetch API initial load ---
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/D-approve/D-approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ offset: 0, limit: 10, search: "", statusType: "check" }),
    credentials: "include",
  });

  const initialData = res.ok ? await res.json() : { totalAll: 0, totals: {}, data: [] };

  return <DApproveTable initialData={initialData} user={user} />;
}
