// /// /admin/adcomponents//RolePermissionsTable.tsx
import { RolePermission } from "../types";

type Props = { rolePermissions: RolePermission[] };

export default function RolePermissionsTable({ rolePermissions }: Props) {
    return (
        <div>
            <h2 className="font-bold text-lg mb-2">Role Permissions</h2>
            <table className="w-full border border-gray-300">
                <thead>
                    <tr className="bg-gray-100 text-black">
                        <th className="p-2 border">Role</th>
                        <th className="p-2 border">Permission</th>
                    </tr>
                </thead>
                <tbody>
                    {rolePermissions.map((rp, i) => (
                        <tr key={`${rp.RoleID}-${i}`}>
                            <td className="p-2 border">{rp.RoleID}</td>
                            <td className="p-2 border">{rp.PermissionID}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
