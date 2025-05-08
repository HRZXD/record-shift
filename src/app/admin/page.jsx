'use client'
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import AdminDashboard from "../components/AdminDashboard";
import "./adminpage.css";

export default function AdminPage() {
  const [usr_admin, setUsr_admin] = useState("");
  const [password, setPassword] = useState("");
  const [adminStatus, setAdminStatus] = useState(false);
  const [userBooking, setUserBooking] = useState({});
  const [selectedDay, setSelectedDay] = useState("mon");
  const [convertDayName, setConvertDayName] = useState("จันทร์");
  const router = useRouter();

  const handleClick = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        body: JSON.stringify({ usr_admin, password }),
      });
      const result = await res.json();
      if (result.success) {
        setAdminStatus(true);
      } else {
        Swal.fire("Error", "Invalid login", "error");
      }
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  const handleDropdownChange = (e) => {
    const value = e.target.value;
    setSelectedDay(value);
    const names = { mon: "จันทร์", tue: "อังคาร", wed: "พุธ", thu: "พฤหัสบดี", fri: "ศุกร์" };
    setConvertDayName(names[value]);

    Swal.fire({
      title: "กำลังประมวลผล",
      html: "โปรดรอประมาณ 5 วินาที",
      timer: 5000,
      didOpen: () => Swal.showLoading(),
    });
  };

  useEffect(() => {
    const fetchBooking = async () => {
      const doors = [
        "door1m", "door1a", "door2m", "door2a", "bc", "b13", "b14", "b15", "b16", "b17", "b18", "b1u",
        "b2u", "b22", "b23", "b24", "b25", "b32", "b33", "b41", "b42", "b43", "fd", "bsp2", "bsp3", "b63",
      ];
      const newBooking = {};
      for (let door of doors) {
        const res = await fetch(`/api/door/${selectedDay}_${door}`);
        const data = await res.json();
        const user = data.result_user
        newBooking[door] = user.map((item) => item.name);
      }
      setUserBooking(newBooking);
    };

    if (adminStatus) fetchBooking();
  }, [selectedDay, adminStatus]);

  return (
    <div>
      {!adminStatus ? (
        <div className="box-con">
          <form className="login-ad" onSubmit={handleClick}>
            <h1>เข้าสู่ระบบ</h1>
            <div className="user-ad">
              <label>Username</label>
              <input type="text" value={usr_admin} onChange={(e) => setUsr_admin(e.target.value)} />
            </div>
            <div className="pw-ad">
              <label>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button type="submit">Login</button>
          </form>
        </div>
      ) : (
        <AdminDashboard
          bookings={userBooking}
          selectedDay={selectedDay}
          convertDayName={convertDayName}
          setSelectedDay={handleDropdownChange}
        />
      )}
    </div>
  );
}
