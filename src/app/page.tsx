// app/pages/welcome.tsx
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

interface User {
  userId: string;
  fullName: string;
  roles: string[];
}

export default async function WelcomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  let user: User | null = null;

  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
      const { payload } = await jwtVerify(token, secret);
      user = {
        userId: payload.userId as string,
        fullName: payload.fullName as string,
        roles: Array.isArray(payload.roles) ? payload.roles : [payload.roles as string],
      };
      console.log(user,"user")
    } catch (err) {
      console.error("Invalid token", err);
      user = null;
    }
  }

  return (
    <div className="flex flex-col justify-center items-center w-screen h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-6">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-md text-center">
        <h1 className="text-4xl font-extrabold mb-6 text-gray-800">
          Welcome{user ? `, ${user.fullName}` : ""}!
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          {user ? `Your roles: ${user.roles.join(", ")}` : "Please login to see your info."}
        </p>
        {!user && (
          <p className="text-sm text-gray-500">
            Use the sidebar to login and access your Roles.
          </p>
        )}
      </div>
    </div>
  );
}
