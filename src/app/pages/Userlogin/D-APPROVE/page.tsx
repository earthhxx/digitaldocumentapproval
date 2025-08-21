// ถ้าใช้ fetch
const res = await fetch("/api/your-endpoint", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ offset: 0, limit: 10, search: "" }),
  credentials: "include", // ✅ ทำให้ cookie httpOnly ถูกส่งไปด้วย
});
const data = await res.json();
