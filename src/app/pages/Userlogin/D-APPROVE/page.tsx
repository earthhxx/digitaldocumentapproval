import { cookies } from "next/headers";
import { getDashboardConnection } from "@/lib/db";
import sql from "mssql";
import DApproveTable from "./components/D_approvetable";
import type { UserPayload } from "@/app/types/types";
import { getDApproveData } from "@/lib/modules/DApproveModule";
import { GetupdateStatus } from "@/lib/modules/GetupdateStatus";
type Tab = "Check_TAB" | "Approve_TAB" | "All_TAB";

interface FormDepMap {
  [form: string]: string[];
}

interface Option {
  check: FormDepMap;
  approve: FormDepMap;
  all: FormDepMap;
}

interface AmountData {
  ApproveNull: number;
  CheckNull: number;
  somethingNull: number;
}

export default async function UserLoginPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session_id")?.value;  // เปลี่ยนชื่อ cookie เป็น session_id ตามที่ตั้งไว้ตอน login

  let user: UserPayload | null = null;

  if (sessionId) {
    try {
      const pool = await getDashboardConnection();

      // สมมติว่าเรามีตาราง sessions เก็บ sessionId กับข้อมูล user ที่จำเป็น (หรือเก็บ userId เพื่อดึงข้อมูล user)
      // ดึงข้อมูล user จาก sessions table โดย sessionId
      const sessionResult = await pool.request()
        .input("sessionId", sql.VarChar, sessionId)
        .query(`
          SELECT UserId, FullName, Roles, Permissions, ForgetPass, FormAccess, Dep
          FROM sessions
          WHERE SessionId = @sessionId AND ExpireAt > GETDATE()
        `);

      if (sessionResult.recordset.length === 0) {
        user = null;
      } else {
        const row = sessionResult.recordset[0];
        user = {
          userId: row.UserId,
          fullName: row.FullName,
          roles: JSON.parse(row.Roles),        // สมมติว่า roles, permissions, formaccess, dep เก็บเป็น JSON string
          permissions: JSON.parse(row.Permissions),
          ForgetPass: row.ForgetPass,
          formaccess: JSON.parse(row.FormAccess),
          Dep: JSON.parse(row.Dep),
        };
      }
    } catch (error) {
      console.error("Session lookup failed:", error);
      user = null;
    }
  }

  if (!user || !user.permissions?.includes("D_Approve")) {
    return <div>Access Denied</div>;
  }

  const availableTabs = (["Check_TAB", "Approve_TAB", "All_TAB"] as Tab[]).filter(
    (t) => user!.permissions?.includes(t)
  );

  const formOption: Option = { check: {}, approve: {}, all: {} };

  if (user.permissions) {
    if (user.permissions.includes("Check_TAB")) {
      user.permissions
        .filter((p) => p.startsWith("Check_F"))
        .forEach((p) => {
          const parts = p.split("_");
          const form = parts.slice(1, -1).join("_");
          const dep = parts[parts.length - 1];
          if (!formOption.check[form]) formOption.check[form] = [];
          formOption.check[form].push(dep);
        });
      for (const f in formOption.check) {
        formOption.check[f] = Array.from(new Set(formOption.check[f]));
      }
    }

    if (user.permissions.includes("Approve_TAB")) {
      user.permissions
        .filter((p) => p.startsWith("Approve_F"))
        .forEach((p) => {
          const parts = p.split("_");
          const form = parts.slice(1, -1).join("_");
          const dep = parts[parts.length - 1];
          if (!formOption.approve[form]) formOption.approve[form] = [];
          formOption.approve[form].push(dep);
        });
      for (const f in formOption.approve) {
        formOption.approve[f] = Array.from(new Set(formOption.approve[f]));
      }
    }

    if (user.permissions.includes("All_TAB")) {
      user.formaccess?.forEach((f) => {
        user.Dep?.forEach((d) => {
          if (!formOption.all[f]) formOption.all[f] = [];
          formOption.all[f].push(d);
        });
      });
      for (const f in formOption.all) {
        formOption.all[f] = Array.from(new Set(formOption.all[f]));
      }
    }
  }

  const tabKeyMap: Record<Tab, keyof Option> = {
    Check_TAB: "check",
    Approve_TAB: "approve",
    All_TAB: "all",
  };

  const key = tabKeyMap[availableTabs[0]];

  const forms = key === "all"
    ? user.formaccess ?? []
    : formOption?.[key]
      ? Object.keys(formOption[key])
      : [];

  const initialData = await getDApproveData({
    offset: 0,
    limit: 13,
    search: "",
    statusType: availableTabs[0],
    formaccess: forms || [],
    FormDep: formOption[key] || {},
  });

  const tabFormMap = {
    check: formOption.check,
    approve: formOption.approve,
    all: formOption.all,
  };

  const statusData = await GetupdateStatus(tabFormMap);

  const AmountData: AmountData = {
    CheckNull: statusData.check?.CheckNull || 0,
    ApproveNull: statusData.approve?.ApproveNull || 0,
    somethingNull: statusData.all?.somethingNull || 0,
  };

  return (
    <DApproveTable
      initialData={initialData}
      user={user}
      AmountData={AmountData}
      formOption={formOption}
      formkey={key}
      formaccess={Object.keys(formOption[key])}
      tabFormMap={tabFormMap}
    />
  );
}
