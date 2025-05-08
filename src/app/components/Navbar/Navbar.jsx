'use client';
import "./navbar.css";
import logo from "../../assets/img/logo.png";
import Image from 'next/image'
import Sidebar from "../Sidebar/Sidebar";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

function Navbar() {
  const router = useRouter();
  const { auth, user } = useAuth();

  const handleLogout = async () => {
    const res = await fetch('/api/logout', {
      method: 'POST',
      credentials: 'include',
    });
    if (res.ok) {
      router.push('/login');
      window.location.reload();
    }
  };

  return (
    <div className="nav">
      <div className="box-logo">
        <Image src={logo} alt="logo" />
        <div className="text-header">
          <div className="text-3">ระบบจองเวรรักษาการณ์</div>
          <div className="text-4">โรงเรียนวัดป่าประดู่ <span>อ.เมืองระยอง จ.ระยอง</span></div>
        </div>
      </div>
      <Sidebar />
      <div className="box-user" style={{ display: auth ? "block" : "none" }}>
        <h2 className="user-name-nav">{user?.username || "Guest"}</h2>
        <button className="credit-btn" onClick={() => router.push("/credit")}>
          เครติดทีม
        </button>
        <button className="logout-btn" onClick={handleLogout}>
          ออกจากระบบ
        </button>
      </div>
    </div>
  );
}

export default Navbar;
