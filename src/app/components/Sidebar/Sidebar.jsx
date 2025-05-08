"use client";
import React, { useState, useEffect } from "react";
import "./sidebar.css";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

function Sidebar() {
  const [width, setWidth] = useState(0);
  const { auth, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const [isOpen, setIsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleMenu = () => {
    setIsOpen(!isOpen);
    setSidebarOpen(!sidebarOpen);
    // Freeze scrolling when sidebar is opened
    if (!sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  };

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

  const handleCreditClick = () => {
    router.push("/credit");
  };
  return (
    <div
      className="sidebar"
      style={{ display: auth && width < 900 ? "flex" : "none" }}
    >
      <div
        className={`menu-toggle ${isOpen ? "open" : ""}`}
        onClick={toggleMenu}
      >
        <div className="bar1"></div>
        <div className="bar2"></div>
        <div className="bar3"></div>
      </div>
      <div
        className={`menu ${isOpen ? "open" : ""}`}
        style={{ display: isOpen ? "block" : "none" }}
      >
        <div className="sidebar-user">
          <div className="det">
            <h2 className="sb-user-name-nav">{user?.username || ""}</h2>
            <button className="sb-credit-btn" onClick={handleCreditClick}>
              เครติดทีม
            </button>
          </div>
          <div className="logout" style={{ display: auth ? "block" : "none" }}>
            <button className="sb-logout-btn" onClick={handleLogout}>
              ออกจากระบบ
            </button>
          </div>
        </div>
      </div>
      <div className="content">{/* Main content */}</div>
    </div>
  );
}

export default Sidebar;
