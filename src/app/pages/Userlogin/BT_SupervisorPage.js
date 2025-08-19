import React from "react";

export default function SupervisorPopup({ onClose, onApprove, onReject }) {
  return (
    <div style={styles.overlay}>
      <div style={styles.popup}>
        <h2>ยืนยันการดำเนินการ</h2>
        <p>คุณต้องการอนุมัติหรือไม่?</p>
        <div style={styles.buttons}>
          <button style={styles.approve} onClick={onApprove}>
            ✅ อนุมัติ
          </button>
          <button style={styles.reject} onClick={onReject}>
            ❌ ไม่อนุมัติ
          </button>
        </div>
        <button style={styles.close} onClick={onClose}>
          ปิด
        </button>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0, left: 0,
    width: "100%", height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex", justifyContent: "center", alignItems: "center",
    zIndex: 2000
  },
  popup: {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    width: "350px",
    textAlign: "center"
  },
  buttons: { marginTop: "15px" },
  approve: { background: "green", color: "#fff", margin: "0 5px", padding: "8px 12px" },
  reject: { background: "red", color: "#fff", margin: "0 5px", padding: "8px 12px" },
  close: { marginTop: "10px", background: "#aaa", color: "#fff", padding: "6px 10px" }
};