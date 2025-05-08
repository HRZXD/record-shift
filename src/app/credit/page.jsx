'use client';
import React from 'react';
import './credit.css';
import credit1 from '../assets/img/credit-1.png';
import credit2 from '../assets/img/credit-2.png';
import credit3 from '../assets/img/credit-3.png';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

function Credit() {
  const router = useRouter();
  const handleOnClick = () => {
    router.push("/");
  };
  return (
    <div className="container-credit">
      <button className='fw-btn-credit' onClick={handleOnClick}>ย้อนกลับ</button>
      <div className="container-card-credit">
        <Image src={credit1} alt="" className='credit-img'/>
        <Image src={credit2} alt="" className='credit-img'/>
        <Image src={credit3} alt="" className='credit-img'/>
      </div>
    </div>
  )
}

export default Credit