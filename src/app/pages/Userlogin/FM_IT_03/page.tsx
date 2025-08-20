import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import FM_IT_03 from "./FM_IT_03";
import type { UserPayload } from "../page";

export default async function FM_IT_03Page() {
//   console.log('im in'); // ✅ จะเห็นใน terminal, ไม่เห็นใน browser

  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
//   console.log("Token:", token); // ดูว่ามีค่าไหม

  let user: UserPayload | null = null;
  if (token) {
    try {
      user = jwt.decode(token) as UserPayload;
    //   console.log("User decoded:", user);
    } catch (err) {
    //   console.log("JWT decode error:", err);
      user = null;
    }
  }

  if (!user || !user.roles?.includes("user")) {
    // console.log("Access Denied");
    return <p>Access Denied</p>;
  }

//   console.log("Rendering FM_IT_03");
  return <FM_IT_03 user={user} />;
}
