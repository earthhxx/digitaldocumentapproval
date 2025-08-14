import { useState } from "react";
import { Role } from "../types";

type Props = { roles: Role[] };

export default function RolesList({ roles }: Props) {
  const [items, setItems] = useState<Role[]>(roles);
  const [form, setForm] = useState({ RoleName: "", Description: "" });

  



  return (
    <div>

    </div>
  );
}
