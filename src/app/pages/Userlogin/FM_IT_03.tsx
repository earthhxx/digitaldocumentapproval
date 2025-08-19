"use client"
import React, { useState, useEffect } from "react";
import SupervisorPopup from "./BT_SupervisorPage";
import Manager from "./BT_ManagerPage";

interface DataRow {
  id: string;
  Date?: string;
  NameThi?: string;
  NameEn?: string;
  DetailName?: string;
}

interface Column {
  key: keyof DataRow;
  label: string;
}

interface UserPayload {
  user: {
    userId?: number | string;
    username?: string;
    fullName?: string;
    roles?: string[];
  } | null;
}


export default function FM_IT_03({ user }: UserPayload) {
  const [data, setData] = useState<DataRow[]>([]);
  const [error, setError] = useState<string>("");
  const [showPDF, setShowPDF] = useState<boolean>(false);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [approvalStatus, setApprovalStatus] = useState<string>("");
  const [supervisorName, setSupervisorName] = useState<string>("");
  const [showApprovalForm, setShowApprovalForm] = useState<boolean>(false);
  const [showSupervisorPopup, setShowSupervisorPopup] = useState<boolean>(false);
  const [showManagerPopup, setShowManagerPopup] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:2222/api/get-data");
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || "เกิดข้อผิดพลาด");
        setData(Array.isArray(result) ? result : []);
        setError("");
      } catch (err: any) {
        setData([]);
        setError(err.message || "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์");
      }
    };
    fetchData();
  }, []);

  const handleOpenPDF = (noId?: string) => {
    if (!noId) return alert("ไม่พบ No_Id");
    setApprovalStatus("");
    setSupervisorName("");
    setShowApprovalForm(false);
    setPdfUrl(`http://localhost:2222/api/generate-filled-pdf?labelText=${noId}`);
    setShowPDF(true);
  };

  const handleClosePDF = () => {
    setShowPDF(false);
    setPdfUrl("");
  };

  const columns: Column[] = [
    { key: "Date", label: "วันที่ร้องขอ" },
    { key: "NameThi", label: "ชื่อThai" },
    { key: "NameEn", label: "ชื่อEN" },
    { key: "DetailName", label: "ข้อมูลรายระเอียด" },
  ];

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "-";
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}/${mm}/${dd}`;
  };

  const handleSubmitApproval = async () => {
    if (approvalStatus === "") {
      alert("กรุณาเลือกสถานะการอนุมัติ");
      return;
    }
    if (approvalStatus === "approve" && !supervisorName.trim()) {
      alert("กรุณากรอกชื่อหัวหน้างาน");
      return;
    }

    const payload = {
      status: approvalStatus,
      name: supervisorName,
      pdfUrl,
    };

    try {
      const res = await fetch("http://localhost:2222/api/update-approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("บันทึกข้อมูลล้มเหลว");
      alert("บันทึกข้อมูลสำเร็จ");
      setApprovalStatus("");
      setSupervisorName("");
      setShowApprovalForm(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>เอกสารแจ้งซ่อมไอที</h1>

      {error && <p style={styles.error}>{error}</p>}

      {data.length > 0 ? (
        <table style={styles.table}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} style={styles.headerCell}>
                  {col.label}
                </th>
              ))}
              <th style={styles.headerCell}>เปิด PDF</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col.key} style={styles.cellValue}>
                    {col.key === "Date" ? formatDate(row[col.key]) : row[col.key]}
                  </td>
                ))}
                <td style={styles.cellValue}>
                  <button
                    style={styles.buttonPDF}
                    onClick={() => handleOpenPDF(row.id)}
                  >
                    เปิด PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !error && <p>กำลังโหลดข้อมูล...</p>
      )}

      {showPDF && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <button style={styles.closeButton} onClick={handleClosePDF}>
              ✕
            </button>
            <iframe src={pdfUrl} style={styles.iframeFull} title="PDF Viewer" />

            {!showApprovalForm && (
              <div style={styles.buttonGroup}>
                <button
                  style={{
                    ...styles.button,
                    backgroundColor: "#2563eb",
                    color: "#0c0c0cff",
                    boxShadow: "none",
                  }}
                  onClick={() => setShowSupervisorPopup(true)}
                >
                  สำหรับหัวหน้างาน
                </button>

                <button
                  style={{
                    ...styles.button,
                    backgroundColor: "#25ab35",
                    color: "#0c0c0cff",
                    marginLeft: 20,
                    boxShadow: "none",
                  }}
                  onClick={() => setShowManagerPopup(true)}
                >
                  สำหรับผู้จัดการ
                </button>
              </div>
            )}
          </div>

          {showSupervisorPopup && (
            <SupervisorPopup
              onClose={() => setShowSupervisorPopup(false)}
              onApprove={() => {
                setApprovalStatus("approve");
                setShowSupervisorPopup(false);
                setShowApprovalForm(true);
                handleClosePDF();
              }}
              onReject={() => {
                setApprovalStatus("reject");
                setShowSupervisorPopup(false);
                setShowApprovalForm(true);
                handleClosePDF();
              }}
            />
          )}

          {showManagerPopup && (
            <Manager
              onClose={() => setShowManagerPopup(false)}
              onApprove={() => {
                setApprovalStatus("approve");
                setShowManagerPopup(false);
                setShowApprovalForm(true);
                handleClosePDF();
              }}
              onReject={() => {
                setApprovalStatus("reject");
                setShowManagerPopup(false);
                setShowApprovalForm(true);
                handleClosePDF();
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: "10px",
    background: "#f9fafb",
    minHeight: "100vh",
    fontFamily: "Kanit, sans-serif",
  },
  title: { fontSize: "28px", marginBottom: "20px", color: "#111827" },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    backgroundColor: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    fontFamily: "Kanit, sans-serif",
  },
  headerCell: {
    padding: "12px",
    border: "1px solid #ddd",
    backgroundColor: "#e5e7eb",
    fontWeight: "bold",
    textAlign: "left",
  },
  cellValue: { padding: "12px", border: "1px solid #ddd", textAlign: "left" },
  buttonPDF: {
    padding: "6px 12px",
    fontSize: "14px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontFamily: "Kanit, sans-serif",
  },
  error: { color: "red", marginTop: "10px" },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.4)",
    backdropFilter: "blur(5px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    flexDirection: "column",
  },

  modalContent: {
    position: "relative",
    width: "90vw",
    height: "100vh",
    background: "#fff",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
    display: "flex",
    flexDirection: "column",
  },

  iframeFull: {
    width: "100%",
    height: "100%",
    border: "none",
  },

  buttonContainer: {
    padding: "10px 20px",
    display: "flex",
    justifyContent: "flex-end",
    backgroundColor: "#f9fafb",
  },
  button: {
    padding: "10px 15px",
    fontSize: 14,
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontFamily: "Kanit, sans-serif",
  },
  closeButton: {
    position: "absolute",
    top: "10px",
    right: "15px",
    fontSize: "30px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    zIndex: 1001,
    backgroundColor: "rgba(253, 3, 3, 1)",
  },
  buttonGroup: {
    position: "absolute",
    bottom: 5,
    right: 5,
    // display: "flex",

    gap: 15,
    zIndex: 1100,
  },
};
