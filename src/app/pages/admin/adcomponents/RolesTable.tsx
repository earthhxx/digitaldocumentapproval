// // /admin/adcomponents//RolesTable.tsx
import { Role } from "../types";

type Props = { roles: Role[] };

export default function RolesTable({ roles }: Props) {
    return (
        <div>
            <h2 className="font-bold text-lg mb-2">Roles</h2>
            <table className="w-full border border-gray-300">
                <thead>
                    <tr className="bg-gray-100 text-black">
                        <th className="p-2 border">ID</th>
                        <th className="p-2 border">Name</th>
                        <th className="p-2 border">Description</th>
                    </tr>
                </thead>
                <tbody>
                    {roles.map((r, i) => (
                        <tr key={`${r.RoleID}-${i}`}>
                            <td className="p-2 border">{r.RoleID}</td>
                            <td className="p-2 border">{r.RoleName}</td>
                            <td className="p-2 border">{r.Description}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
