// /components/admin/types.ts
export type Permission = {
    PermissionID: number;
    PermissionName: string;
    Description?: string;
};

export type Role = {
    RoleID: number;
    RoleName: string;
    Description?: string;
};

export type User = {
    User_Id: number;
    Name: string;
    CreateDate: string;
};

export type UserRole = {
    UserID: number;
    RoleID: string;
};

export type RolePermission = {
    RoleID: string;
    PermissionID: string;
};
