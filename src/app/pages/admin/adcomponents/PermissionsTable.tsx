// // /admin/adcomponents//PermissionsTable.tsx
import { Permission } from "../types";

type Props = { permissions: Permission[] };

export default function PermissionsTable({ permissions }: Props) {
    return (
        <div>
            <h2 className="font-bold text-lg mb-2">Permissions</h2>
            <table className="w-full border border-gray-300">
                <thead>
                    <tr className="bg-gray-100 text-black">
                        <th className="p-2 border">ID</th>
                        <th className="p-2 border">Name</th>
                        <th className="p-2 border">Description</th>
                    </tr>
                </thead>
                <tbody>
                    {permissions.map((p, i) => (
                        <tr key={`${p.PermissionID}-${i}`}>
                            <td className="p-2 border">{p.PermissionID}</td>
                            <td className="p-2 border">{p.PermissionName}</td>
                            <td className="p-2 border">{p.Description}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
