// /admin/adcomponents/UserRolesTable.tsx
import { UserRole } from "../types";

type Props = { userRoles: UserRole[] };

export default function UserRolesTable({ userRoles }: Props) {
    return (
        <div>
            <h2 className="font-bold text-lg mb-2">User Roles</h2>
            <table className="w-full border border-gray-300">
                <thead>
                    <tr className="bg-gray-100 text-black">
                        <th className="p-2 border">ID</th>
                        <th className="p-2 border">User ID</th>
                        <th className="p-2 border">Role</th>
                    </tr>
                </thead>
                <tbody>
                    {userRoles.map((ur, i) => (
                        <tr key={`${ur.UserID}-${i}`}>
                            <td className="p-2 border">{i + 1}</td>
                            <td className="p-2 border">{ur.UserID}</td>
                            <td className="p-2 border">{ur.RoleID}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
