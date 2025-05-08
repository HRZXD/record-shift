'use client'
import React from "react";
import html2pdf from "html2pdf.js";

export default function AdminDashboard({
  bookings,
  selectedDay,
  convertDayName,
  setSelectedDay,
}) {
  const pdfId = "pdf-to-download";

  const downloadPDF = () => {
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
      ? bookings[door].map((name, idx) => <div key={`${door}-${idx}`} className="name-bookings">{name}</div>)
      : <div className="name-bookings">Not found</div>;

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
                <td>
                    {(() => {
                        switch (door) {
                        case "door1m":
                            return "อาคาร 1 ตอนเช้า";
                        case "door1a":
                            return "อาคาร 1 ตอนบ่าย";
                        case "door2m":
                            return "อาคาร 2 ตอนเช้า";
                        case "door2a":
                            return "อาคาร 2 ตอนบ่าย";
                        case "bc":
                            return "โรงอาหาร";
                        case "b13":
                            return "อาคาร 1 ชั้น 3";
                        case "b14":
                            return "อาคาร 1 ชั้น 4";
                        case "b15":
                            return "อาคาร 1 ชั้น 5";
                        case "b16":
                            return "อาคาร 1 ชั้น 6";
                        case "b17":
                            return "อาคาร 1 ชั้น 7";
                        case "b18":
                            return "อาคาร 1 ชั้น 8";
                        case "b1u":
                            return "อาคาร 1 ชั้นล่างและหลังอาคาร 1";
                        case "b2u":
                            return "อาคาร 2 ชั้นล่างและหลังอาคาร 2";
                        case "b22":
                            return "อาคาร 2 ชั้น 2";
                        case "b23":
                            return "อาคาร 2 ชั้น 3";
                        case "b24":
                            return "อาคาร 2 ชั้น 4";
                        case "b25":
                            return "อาคาร 2 ชั้น 5";
                        case "b32":
                            return "อาคาร 3 ชั้น 2";
                        case "b33":
                            return "อาคาร 3 ชั้น 3";
                        case "b41":
                            return "อาคาร 4 ชั้น 1";
                        case "b42":
                            return "อาคาร 4 ชั้น 2";
                        case "b43":
                            return "อาคาร 4 ชั้น 3";
                        case "fd":
                            return "สนามฟุตบอล สนามฟุตซอล สนามบาสเกตบอล และบริเวณพระประจำโรงเรียน";
                        case "bsp2":
                            return "อาคารอเนกประสงค์ ชั้น 2";
                        case "bsp3":
                            return "อาคารอเนกประสงค์ ชั้น 3";
                        case "b63":
                            return "อาคาร 6 และหลังอาคาร 3";
                        default:
                            return door; // If no match, return the door value itself
                        }
                    })()}
                </td>
                <td>{renderNames(door)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
