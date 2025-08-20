"use client";

import React, { useState } from "react";
import SupervisorPopup from "../components/BT_SupervisorPage";
import Manager from "../components/BT_ManagerPage";

interface FMModalTriggerProps {
  id: string;
}

export default function FMModalTrigger({ id }: FMModalTriggerProps) {
  const [showPDF, setShowPDF] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [showSupervisorPopup, setShowSupervisorPopup] = useState(false);
  const [showManagerPopup, setShowManagerPopup] = useState(false);

  const openPDF = () => {
    setPdfUrl(`http://localhost:2222/api/generate-filled-pdf?labelText=${id}`);
    setShowPDF(true);
  };

  const handleApproval = async (status: "approve" | "reject", type: "supervisor" | "manager") => {
    try {
      const res = await fetch("http://localhost:2222/api/update-approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, type }),
      });
      if (!res.ok) throw new Error("บันทึกข้อมูลล้มเหลว");
      alert(`บันทึกข้อมูลสำเร็จ (${type}: ${status})`);
    } catch (err: any) {
      alert(err.message);
    }
    setShowSupervisorPopup(false);
    setShowManagerPopup(false);
    setShowPDF(false);
  };

  return (
    <>
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        onClick={openPDF}
      >
        เปิด PDF
      </button>

      {showPDF && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="relative w-full max-w-[95vw] h-[95vh] bg-white rounded-xl shadow-lg flex flex-col">
            <div className="flex justify-between items-center p-4 bg-gray-100 border-b rounded-t-xl">
              <h2 className="text-lg font-semibold text-gray-800">PDF Viewer</h2>
              <button
                className="text-white bg-red-600 hover:bg-red-700 rounded-full w-10 h-10 flex items-center justify-center text-2xl"
                onClick={() => setShowPDF(false)}
              >
                ✕
              </button>
            </div>

            <iframe src={pdfUrl} className="w-full h-full border-none flex-1" title="PDF Viewer" />

            <div className="absolute bottom-4 right-4 flex gap-4">
              <button
                className="px-5 py-2 bg-blue-600 text-white rounded-lg"
                onClick={() => setShowSupervisorPopup(true)}
              >
                สำหรับหัวหน้างาน
              </button>
              <button
                className="px-5 py-2 bg-green-600 text-white rounded-lg"
                onClick={() => setShowManagerPopup(true)}
              >
                สำหรับผู้จัดการ
              </button>
            </div>

            {showSupervisorPopup && (
              <SupervisorPopup
                onClose={() => setShowSupervisorPopup(false)}
                onApprove={() => handleApproval("approve", "supervisor")}
                onReject={() => handleApproval("reject", "supervisor")}
              />
            )}

            {showManagerPopup && (
              <Manager
                onClose={() => setShowManagerPopup(false)}
                onApprove={() => handleApproval("approve", "manager")}
                onReject={() => handleApproval("reject", "manager")}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
