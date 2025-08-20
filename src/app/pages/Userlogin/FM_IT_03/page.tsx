import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import FM_IT_03 from "./FM_IT_03";
import type { UserPayload } from "../page";

export default async function FM_IT_03Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  let user: UserPayload | null = null;
  if (token) {
    try {
      user = jwt.decode(token) as UserPayload;
    } catch {
      user = null;
    }
  }

  if (!user || !user.roles?.includes("user")) {
    return <p>Access Denied</p>;
  }

  // SSR render component จริง
  return <FM_IT_03 user={user} />;
}
