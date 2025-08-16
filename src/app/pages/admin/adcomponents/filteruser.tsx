"use client";

import { useEffect, useState } from "react";

type User = {
  userId: number;
  fullName: string;
  roles: string[];
  permissions: string[];
};

export default function FilterUser() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchUserID, setSearchUserID] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchRole, setSearchRole] = useState("");
  const [searchPermission, setSearchPermission] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/admin/checkuser");
        if (!res.ok) throw new Error("Failed to fetch users");
        const data: User[] = await res.json();
        setUsers(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(String(err)); // fallback สำหรับค่าอื่น ๆ
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <div className="p-4 text-white">Loading users...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  // filter users
  const filteredUsers = users.filter((user) => {
    const matchesUserID = searchUserID
      ? user.userId.toString().includes(searchUserID)
      : true;
    const matchesName = searchName
      ? user.fullName.toLowerCase().includes(searchName.toLowerCase())
      : true;
    const matchesRole = searchRole
      ? user.roles.some((r) =>
        r.toLowerCase().includes(searchRole.toLowerCase())
      )
      : true;
    const matchesPermission = searchPermission
      ? user.permissions.some((p) =>
        p.toLowerCase().includes(searchPermission.toLowerCase())
      )
      : true;

    return matchesUserID && matchesName && matchesRole && matchesPermission;
  });

  const highlightText = (text: string, search: string) => {
    if (!search) return text;
    const regex = new RegExp(`(${search})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="bg-yellow-400 text-black font-bold">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div className="bg-black min-h-screen text-white font-mono p-4">
      <h1 className="text-2xl font-bold mb-4">Admin - Check Users Access</h1>

      {/* Search inputs fixed */}
      <div className=" top-0 bg-black z-10 p-2 mb-4 border-b border-white flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="Search User ID"
          value={searchUserID}
          onChange={(e) => setSearchUserID(e.target.value)}
          className="p-2 rounded border border-white bg-black text-white placeholder-gray-400"
        />
        <input
          type="text"
          placeholder="Search Name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="p-2 rounded border border-white bg-black text-white placeholder-gray-400"
        />
        <input
          type="text"
          placeholder="Search Role"
          value={searchRole}
          onChange={(e) => setSearchRole(e.target.value)}
          className="p-2 rounded border border-white bg-black text-white placeholder-gray-400"
        />
        <input
          type="text"
          placeholder="Search Permission"
          value={searchPermission}
          onChange={(e) => setSearchPermission(e.target.value)}
          className="p-2 rounded border border-white bg-black text-white placeholder-gray-400"
        />
      </div>

      <div className="overflow-x-auto max-h-[65vh] border border-white custom-scrollbar">
        <table className="min-w-full border-collapse">
          <thead className="sticky top-0 bg-gray-900 z-5">
            <tr>
              <th className="p-2 border border-white">User ID</th>
              <th className="p-2 border border-white">Full Name</th>
              <th className="p-2 border border-white">Roles</th>
              <th className="p-2 border border-white">Permissions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.userId} className="hover:bg-gray-700">
                <td className="p-2 border border-white">
                  {highlightText(user.userId.toString(), searchUserID)}
                </td>
                <td className="p-2 border border-white">
                  {highlightText(user.fullName, searchName)}
                </td>
                <td className="p-2 border border-white">
                  {highlightText(user.roles.join(", "), searchRole)}
                </td>
                <td className="p-2 border border-white">
                  {highlightText(user.permissions.join(", "), searchPermission)}
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="p-2 border border-white text-center text-gray-400"
                >
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
