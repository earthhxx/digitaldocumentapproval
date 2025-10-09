// @/lib/cors.ts
const FRONTEND_ORIGIN = "http://192.168.130.240:3000"; // เปลี่ยนเป็น frontend ของคุณ

export function withCors(response: Response) {
  response.headers.set("Access-Control-Allow-Origin", FRONTEND_ORIGIN);
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
}

// ฟังก์ชัน OPTIONS สำหรับ preflight
export async function handleOptions() {
  const res = new Response(null, { status: 204 });
  return withCors(res);
}
