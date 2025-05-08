'use client'
import { useState } from 'react'
import './register.css'
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'

function Register() {
    const router = useRouter();
    const [values , setValues] = useState({
        username: '',
        email: '',
        password: '',
    })
    const handleChange = (e) => {
        setValues({...values, [e.target.name]: e.target.value});
    }
    // const navigate = useNavigate()
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            })
            if ( res.ok ){ 
                Swal.fire({
                    icon: 'success',
                    title: 'ลงทะเเบียนสำเร็จ',
                    text: 'กรุณาเข้าสู่ระบบ',
                })
                router.push('/login')
            }else{
                const data = await res.json()
                Swal.fire({
                    icon: 'error',
                    title: data.message,
                })
            }
        } catch (error) {
            console.log(error);
        }
    }

  return (
    <div className="box-con">
        <div className="register">
            <div className="reg-hid">
            <div className="txt-reg">
                <h1>ลงทะเบียน</h1>
            </div>

                <form onSubmit={handleSubmit}>
                    <div className="user">
                        <div className="l-user">
                            <label htmlFor="username">Username</label>
                        </div>
                        <input type="text" onChange={handleChange} name="username"/>
                    </div>
                    <div className="email">
                        <div className="l-em">
                            <label htmlFor="email">E-mail</label>
                        </div>
                            <input type="text"  name="email" onChange={handleChange}/>
                    </div>
                    <div className="psw">
                        <div className="l-psw">
                            <label htmlFor="password">Password</label>
                        </div>
                        <input type="text" onChange={handleChange} name="password"/>
                    </div>
                    <div className="btn-reg">
                        <button>Register</button>
                    </div>
                </form>
                <div className="reg">
                    <p>เข้าสู่ระบบ <a href="/login" className='link-txt'>กดที่นี่</a></p>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Register