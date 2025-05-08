'use client'
import { useState } from "react";
import "./login.css";
import { useRouter } from "next/navigation"
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext";

function Login() {
  const router = useRouter();
  const { verifyToken } = useAuth();
  const [values, setValues] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
        credentials: 'include',
      });
      
      if (res.ok) {
        await verifyToken(); // refresh context state
        router.push("/").then(() => window.location.reload());
      } else {
        const data = await res.json();
        Swal.fire({
          icon: "error",
          title: data.message,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="box-con">
      <div className="login">
        <div className="log-hid">
          <h1>เข้าสู่ระบบ</h1>
          <form onSubmit={handleSubmit}>
            <div className="email">
              <label htmlFor="email">E-mail</label>
              <input type="text" name="email" onChange={handleChange} />
            </div>
            <div className="pw">
              <label htmlFor="password">Password</label>
              <input type="password" name="password" onChange={handleChange} />
            </div>
            <div className="btn-log">
              <button>Login</button>
            </div>
          </form>
          <p>สมัครสมาชิก <a href="/register" className="link-txt">กดที่นี่</a></p>
        </div>
      </div>
    </div>
  );
}

export default Login;
