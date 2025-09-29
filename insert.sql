//add form
create table first then

//create permission for form
const แผนก = ["IT","PRODUCTION","ENGINEER","QA","ACCOUNT","HR","SAFTY","WAREHOUSE","PURCHASE","PLANING"];
const form = "FM_GA_13";

const maptable = `
INSERT INTO [DASHBOARD].[dbo].[D_Approve] (table_name, db_table_name)
VALUES ('${form}', '[DASHBOARD].[dbo].[tb_approve_${form}]');
`;

console.log(maptable);

const Formaccesstable = `
INSERT INTO [DASHBOARD].[dbo].[Formaccess] (Formaccess)
VALUES ('${form}');
`


แผนก.forEach((d) => {
  // สำหรับ Check
  const checkSQL = `
    INSERT INTO [DASHBOARD].[dbo].[Permissions] (PermissionName, Description)
    VALUES ('Check_${form}_${d}', 'Check button ${form} ${d}');
  `;

  // สำหรับ Approve
  const approveSQL = `
    INSERT INTO [DASHBOARD].[dbo].[Permissions] (PermissionName, Description)
    VALUES ('Approve_${form}_${d}', 'Approve button ${form} ${d}');
  `;

  console.log(checkSQL);
  console.log(approveSQL);
});

//insert roleper etc.
//add . field เข้า pdfHelppers.ts ใน root module ด้วย
//เอาไฟล์ PDF เข้า public/templates/ไฟล์pdf !!ใช้ _ อย่าใช้ -