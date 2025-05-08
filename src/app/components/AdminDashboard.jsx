'use client';
import React from "react";

export default function AdminDashboard({
  bookings,
  selectedDay,
  convertDayName,
  setSelectedDay,
}) {
  const pdfId = "pdf-to-download";

  const downloadPDF = async () => {
    const html2pdf = (await import('html2pdf.js')).default;
    const element = document.getElementById(pdfId);
    const opt = {
      margin: 0.5,
      filename: `ตารางเวร-${convertDayName}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' }
    };

    html2pdf().set(opt).from(element).save();
  };

  const doors = [
    "door1m", "door1a", "door2m", "door2a", "bc", "b13", "b14", "b15", "b16", "b17", "b18", "b1u",
    "b2u", "b22", "b23", "b24", "b25", "b32", "b33", "b41", "b42", "b43", "fd", "bsp2", "bsp3", "b63"
  ];

  const renderNames = (door) =>
    bookings[door]?.length > 0
      ? bookings[door].map((name, idx) => (
          <div key={`${door}-${idx}`} className="name-bookings">{name}</div>
        ))
      : <div className="name-bookings">Not found</div>;

  const getDoorLabel = (door) => {
    const labels = {
      door1m: "อาคาร 1 ตอนเช้า",
      door1a: "อาคาร 1 ตอนบ่าย",
      door2m: "อาคาร 2 ตอนเช้า",
      door2a: "อาคาร 2 ตอนบ่าย",
      bc: "โรงอาหาร",
      b13: "อาคาร 1 ชั้น 3",
      b14: "อาคาร 1 ชั้น 4",
      b15: "อาคาร 1 ชั้น 5",
      b16: "อาคาร 1 ชั้น 6",
      b17: "อาคาร 1 ชั้น 7",
      b18: "อาคาร 1 ชั้น 8",
      b1u: "อาคาร 1 ชั้นล่างและหลังอาคาร 1",
      b2u: "อาคาร 2 ชั้นล่างและหลังอาคาร 2",
      b22: "อาคาร 2 ชั้น 2",
      b23: "อาคาร 2 ชั้น 3",
      b24: "อาคาร 2 ชั้น 4",
      b25: "อาคาร 2 ชั้น 5",
      b32: "อาคาร 3 ชั้น 2",
      b33: "อาคาร 3 ชั้น 3",
      b41: "อาคาร 4 ชั้น 1",
      b42: "อาคาร 4 ชั้น 2",
      b43: "อาคาร 4 ชั้น 3",
      fd: "สนามฟุตบอล สนามฟุตซอล สนามบาสเกตบอล และบริเวณพระประจำโรงเรียน",
      bsp2: "อาคารอเนกประสงค์ ชั้น 2",
      bsp3: "อาคารอเนกประสงค์ ชั้น 3",
      b63: "อาคาร 6 และหลังอาคาร 3",
    };
    return labels[door] || door;
  };

  return (
    <>
      <button onClick={downloadPDF} className="btn-candsave">Save to PDF</button>

      <div className="day-section">
        <div className="text-day">จองเวรวัน</div>
        <select value={selectedDay} onChange={setSelectedDay} className="day-booking">
          <option value="mon">วันจันทร์</option>
          <option value="tue">วันอังคาร</option>
          <option value="wed">วันพุธ</option>
          <option value="thu">วันพฤหัสบดี</option>
          <option value="fri">วันศุกร์</option>
        </select>
      </div>

      <div id={pdfId}>
        <h2>ตารางเวรวัน {convertDayName}</h2>
        <table className="product-table">
          <thead>
            <tr>
              <th>สถานที่</th>
              <th>รายชื่อ</th>
            </tr>
          </thead>
          <tbody>
            {doors.map((door) => (
              <tr key={door}>
                <td>{getDoorLabel(door)}</td>
                <td>{renderNames(door)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
