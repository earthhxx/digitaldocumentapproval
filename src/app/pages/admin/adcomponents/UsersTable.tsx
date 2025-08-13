// // /admin/adcomponents//UsersTable.tsx
import { User } from "../types";

type Props = { users: User[] };

export default function UsersTable({ users }: Props) {
    return (
        <div>
            <h2 className="font-bold text-lg mb-2">Users</h2>
            <table className="w-full border border-gray-300">
                <thead>
                    <tr className="bg-gray-100 text-black">
                        <th className="p-2 border">User ID</th>
                        <th className="p-2 border">Name</th>
                        <th className="p-2 border">Created Date</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((u, i) => (
                        <tr key={`${u.User_Id}-${i}`}>
                            <td className="p-2 border">{u.User_Id}</td>
                            <td className="p-2 border">{u.Name}</td>
                            <td className="p-2 border">{u.CreateDate}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
