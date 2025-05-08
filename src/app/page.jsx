'use client';
import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import "./css/record.css";
import { TailSpin } from "react-loader-spinner";
import Swal from "sweetalert2";
import { apiFetch } from "@/app/util/api";

export default function Home() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState(null);
  const [selectedDay, setSelectedDay] = useState("mon");
  const [showCard, setShowCard] = useState(false);
  const [list, setList] = useState([]);
  const [trigger, setTrigger] = useState(false);
  const [counts, setCounts] = useState({});
  const [isBooked, setIsBooked] = useState({});
  const [loading, setLoading] = useState({});
  
  const limits = useMemo(() => ({
    door1m: 5, door1a: 5, door2m: 5, door2a: 5, bc: 2,
    b13: 1, b14: 1, b15: 1, b16: 1, b17: 1, b18: 1, b1u: 1, b2u: 1,
    b22: 1, b23: 1, b24: 1, b25: 1, b32: 1, b33: 1,
    b41: 1, b42: 1, b43: 1, fd: 1, bsp2: 1, bsp3: 1, b63: 1,
  }), []);
  
  const doors = useMemo(() => Object.keys(limits), [limits]);
  
  // Token Verification
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const data = await apiFetch('/api/verifyToken');
        const { email, userid, username } = data.user;
        setEmail(email);
        setUserId(userid);
        setUserName(username);
      } catch {
        router.push('/login');
      }
    };
    verifyToken();
  }, [router]);
  
  const showLoading = (title = "กำลังประมวลผล", text = "กำลังโหลดข้อมูล...") => {
    Swal.fire({
      title,
      html: text,
      didOpen: () => Swal.showLoading(),
      allowOutsideClick: false,
      allowEscapeKey: false,
    });
  };
  
  const closeLoading = () => Swal.close();
  
  const fetchData = useCallback(async (day) => {
    const [countsData, bookedData] = [{}, {}];
  
    await Promise.all(doors.map(async (door) => {
      try {
        const res = await apiFetch(`/api/door/${day}_${door}`);
        countsData[door] = res.result[0]?.result || 0;
        bookedData[door] = res.result_user?.some(u => u.user_id == userId) || false;
      } catch (err) {
        console.error(`Error loading ${door}`, err);
      }
    }));
  
    setCounts(countsData);
    setIsBooked(bookedData);
  }, [doors, userId]);
  
  useEffect(() => {
    if (!userId) return;
  
    const loadData = async () => {
      showLoading();
      await fetchData(selectedDay);  // Pass the current selectedDay
      closeLoading();
      setShowCard(true);
    };
  
    loadData();
  }, [fetchData, userId, selectedDay]); // <- make sure selectedDay is a dependency
  
  const handleDropdownChange = async (e) => {
    const newDay = e.target.value;
    setSelectedDay(newDay);
    setShowCard(false);
    showLoading();
    await fetchData(newDay);  // Pass the new selected day
    closeLoading();
    setShowCard(true);
  };
  
  const handleBooking = async (key) => {
    const { isConfirmed } = await Swal.fire({
      title: "ยืนยันการจอง",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
    });
  
    if (!isConfirmed) return;
  
    setLoading(prev => ({ ...prev, [key]: true }));
  
    try {
      const res = await apiFetch('/api/create', {
        method: 'POST',
        body: JSON.stringify({
          userId,
          userName,
          email,
          day: selectedDay,
          whe: key,
          bookAt: new Date().toISOString(),
        }),
      });
  
      if (res.success) {
        // 🔄 Show loading while fetching new data
        showLoading("กำลังอัปเดตข้อมูล", "กำลังโหลดข้อมูลใหม่...");
        await fetchData(selectedDay);
        closeLoading();

        Swal.fire("สำเร็จ", "การจองสำเร็จ", "success");
      } else {
        Swal.fire("ผิดพลาด", "การจองล้มเหลว", "error");
      }
    } catch {
      Swal.fire("ผิดพลาด", "เกิดข้อผิดพลาดในการจอง", "error");
    } finally {
      setTrigger(prev => !prev);
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };
  
  const handleCancel = async (key) => {
    const { isConfirmed } = await Swal.fire({
      title: "ยกเลิกการจอง",
      text: "คุณแน่ใจหรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
    });
  
    if (!isConfirmed) return;
  
    setLoading(prev => ({ ...prev, [key]: true }));
  
    try {
      await apiFetch(`/api/delete/${selectedDay}/${key}/${userId}`, {
        method: 'DELETE',
      });
      showLoading("กำลังอัปเดตข้อมูล", "กำลังโหลดข้อมูลใหม่...");
      await fetchData(selectedDay);
      closeLoading();
      Swal.fire("สำเร็จ", "ยกเลิกการจองแล้ว", "success");
      setTrigger(prev => !prev);
    } catch {
      Swal.fire("ผิดพลาด", "ไม่สามารถยกเลิกได้", "error");
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };
  
  return (
    <div className="container-record">
      <div className="day-section">
        <div className="text-day">จองเวรวัน</div>
        <select
          value={selectedDay}
          onChange={handleDropdownChange}
          className="day-booking"
        >
          <option value="mon">วันจันทร์</option>
          <option value="tue">วันอังคาร</option>
          <option value="wed">วันพุธ</option>
          <option value="thu">วันพฤหัสบดี</option>
          <option value="fri">วันศุกร์</option>
        </select>
      </div>

      <div className="booking-door">
        <div className="text-header-door">จองเวรประตู</div>
        <div
          className={`card-door ${
            showCard ? "fade-in-down active" : "fade-in-down"
          }`}
        >
          <div className="card-record">
            <div className="door-num">ประตู 1 ตอนเช้า</div>
            <div className="num-person">
              จำนวน {counts.door1m} / {limits.door1m}
            </div>
            <div className="time-table">เวลา 6.20 - 7.40</div>
            {loading.door1m ? (
              <TailSpin
                visible={true}
                height="40"
                width="40"
                color="#000"
                ariaLabel="tail-spin-loading"
                radius="1"
                wrapperStyle={{}}
                wrapperClass=""
              />
            ) : isBooked.door1m ? (
              <button
                className="btn-cancel"
                onClick={() => handleCancel("door1m")}
              >
                ยกเลิกการจอง
              </button>
            ) : counts.door1m >= limits.door1m ? (
              <p className="booking-limit-message">เต็ม</p>
            ) : (
              <button
                className="btn-booking"
                onClick={() => handleBooking("door1m")}
              >
                จอง
              </button>
            )}
          </div>
          {/* Card for door2 */}
          <div className="card-record">
            <div className="door-num">ประตู 1 ตอนเย็น</div>
            <div className="num-person">
              จำนวน {counts.door1a} / {limits.door1a}
            </div>
            <div className="time-table">เวลา 15.00 - 16.30</div>
            {loading.door1a ? (
              <TailSpin
                visible={true}
                height="40"
                width="40"
                color="#000"
                ariaLabel="tail-spin-loading"
                radius="1"
                wrapperStyle={{}}
                wrapperClass=""
              />
            ) : isBooked.door1a ? (
              <button
                className="btn-cancel"
                onClick={() => handleCancel("door1a")}
              >
                ยกเลิกการจอง
              </button>
            ) : counts.door1a >= limits.door1a ? (
              <p className="booking-limit-message">เต็ม</p>
            ) : (
              <button
                className="btn-booking"
                onClick={() => handleBooking("door1a")}
              >
                จอง
              </button>
            )}
          </div>
          <div className="card-record">
            <div className="door-num">ประตู 2 ตอนเช้า</div>
            <div className="num-person">
              จำนวน {counts.door2m} / {limits.door2m}
            </div>
            <div className="time-table">เวลา 6.20 - 7.40</div>
            {loading.door2m ? (
              <TailSpin
                visible={true}
                height="40"
                width="40"
                color="#000"
                ariaLabel="tail-spin-loading"
                radius="1"
                wrapperStyle={{}}
                wrapperClass=""
              />
            ) : isBooked.door2m ? (
              <button
                className="btn-cancel"
                onClick={() => handleCancel("door2m")}
              >
                ยกเลิกการจอง
              </button>
            ) : counts.door2m >= limits.door2m ? (
              <p className="booking-limit-message">เต็ม</p>
            ) : (
              <button
                className="btn-booking"
                onClick={() => handleBooking("door2m")}
              >
                จอง
              </button>
            )}
          </div>
          <div className="card-record">
            <div className="door-num">ประตู 2 ตอนเย็น</div>
            <div className="num-person">
              จำนวน {counts.door2a} / {limits.door2a}
            </div>
            <div className="time-table">เวลา 15.00 - 16.30</div>
            {loading.door2a ? (
              <TailSpin
                visible={true}
                height="40"
                width="40"
                color="#000"
                ariaLabel="tail-spin-loading"
                radius="1"
                wrapperStyle={{}}
                wrapperClass=""
              />
            ) : isBooked.door2a ? (
              <button
                className="btn-cancel"
                onClick={() => handleCancel("door2a")}
              >
                ยกเลิกการจอง
              </button>
            ) : counts.door2a >= limits.door2a ? (
              <p className="booking-limit-message">เต็ม</p>
            ) : (
              <button
                className="btn-booking"
                onClick={() => handleBooking("door2a")}
              >
                จอง
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="booking-building">
        <div className="text-header-building">จองเวรอาคาร</div>
        <div
          className={`card-building ${
            showCard ? "fade-in-down active" : "fade-in-down"
          }`}
        >
          {/* Cards for b13, b14, b15 - Similar structure as doors */}
          <div className="card-record">
            <div className="door-num">โรงอาหาร</div>
            <div className="num-person">
              จำนวน {counts.bc} / {limits.bc}
            </div>
            <div className="time-table">เวลา 8.00 - 16.30</div>
            {loading.bc ? (
              <TailSpin
                visible={true}
                height="40"
                width="40"
                color="#000"
                ariaLabel="tail-spin-loading"
                radius="1"
                wrapperStyle={{}}
                wrapperClass=""
              />
            ) : isBooked.bc ? (
              <button className="btn-cancel" onClick={() => handleCancel("bc")}>
                ยกเลิกการจอง
              </button>
            ) : counts.bc >= limits.bc ? (
              <p className="booking-limit-message">เต็ม</p>
            ) : (
              <button
                className="btn-booking"
                onClick={() => handleBooking("bc")}
              >
                จอง
              </button>
            )}
          </div>
          {/* ... Add similar cards for b14, b15 */}
          <div className="card-record">
            <div className="door-num">อาคาร 1 ชั้น 3</div>
            <div className="num-person">
              จำนวน {counts.b13} / {limits.b13}
            </div>
            <div className="time-table">เวลา 8.00 - 16.30</div>
            {loading.b13 ? (
              <TailSpin
                visible={true}
                height="40"
                width="40"
                color="#000"
                ariaLabel="tail-spin-loading"
                radius="1"
                wrapperStyle={{}}
                wrapperClass=""
              />
            ) : isBooked.b13 ? (
              <button
                className="btn-cancel"
                onClick={() => handleCancel("b13")}
              >
                ยกเลิกการจอง
              </button>
            ) : counts.b13 >= limits.b13 ? (
              <p className="booking-limit-message">เต็ม</p>
            ) : (
              <button
                className="btn-booking"
                onClick={() => handleBooking("b13")}
              >
                จอง
              </button>
            )}
          </div>
          <div className="card-record">
            <div className="door-num">อาคาร 1 ชั้น 4</div>
            <div className="num-person">
              จำนวน {counts.b14} / {limits.b14}
            </div>
            <div className="time-table">เวลา 8.00 - 16.30</div>
            {loading.b14 ? (
              <TailSpin
                visible={true}
                height="40"
                width="40"
                color="#000"
                ariaLabel="tail-spin-loading"
                radius="1"
                wrapperStyle={{}}
                wrapperClass=""
              />
            ) : isBooked.b14 ? (
              <button
                className="btn-cancel"
                onClick={() => handleCancel("b14")}
              >
                ยกเลิกการจอง
              </button>
            ) : counts.b14 >= limits.b14 ? (
              <p className="booking-limit-message">เต็ม</p>
            ) : (
              <button
                className="btn-booking"
                onClick={() => handleBooking("b14")}
              >
                จอง
              </button>
            )}
          </div>
          <div className="card-record">
            <div className="door-num">อาคาร 1 ชั้น 5</div>
            <div className="num-person">
              จำนวน {counts.b15} / {limits.b15}
            </div>
            <div className="time-table">เวลา 8.00 - 16.30</div>
            {loading.b15 ? (
              <TailSpin
                visible={true}
                height="40"
                width="40"
                color="#000"
                ariaLabel="tail-spin-loading"
                radius="1"
                wrapperStyle={{}}
                wrapperClass=""
              />
            ) : isBooked.b15 ? (
              <button
                className="btn-cancel"
                onClick={() => handleCancel("b15")}
              >
                ยกเลิกการจอง
              </button>
            ) : counts.b15 >= limits.b15 ? (
              <p className="booking-limit-message">เต็ม</p>
            ) : (
              <button
                className="btn-booking"
                onClick={() => handleBooking("b15")}
              >
                จอง
              </button>
            )}
          </div>
          <div className="card-record">
            <div className="door-num">อาคาร 1 ชั้น 6</div>
            <div className="num-person">
              จำนวน {counts.b16} / {limits.b16}
            </div>
            <div className="time-table">เวลา 8.00 - 16.30</div>
            {loading.b16 ? (
              <TailSpin
                visible={true}
                height="40"
                width="40"
                color="#000"
                ariaLabel="tail-spin-loading"
                radius="1"
                wrapperStyle={{}}
                wrapperClass=""
              />
            ) : isBooked.b16 ? (
              <button
                className="btn-cancel"
                onClick={() => handleCancel("b16")}
              >
                ยกเลิกการจอง
              </button>
            ) : counts.b16 >= limits.b16 ? (
              <p className="booking-limit-message">เต็ม</p>
            ) : (
              <button
                className="btn-booking"
                onClick={() => handleBooking("b16")}
              >
                จอง
              </button>
            )}
          </div>
          <div className="card-record">
            <div className="door-num">อาคาร 1 ชั้น 7</div>
            <div className="num-person">
              จำนวน {counts.b17} / {limits.b17}
            </div>
            <div className="time-table">เวลา 8.00 - 16.30</div>
            {loading.b17 ? (
              <TailSpin
                visible={true}
                height="40"
                width="40"
                color="#000"
                ariaLabel="tail-spin-loading"
                radius="1"
                wrapperStyle={{}}
                wrapperClass=""
              />
            ) : isBooked.b17 ? (
              <button
                className="btn-cancel"
                onClick={() => handleCancel("b17")}
              >
                ยกเลิกการจอง
              </button>
            ) : counts.b17 >= limits.b17 ? (
              <p className="booking-limit-message">เต็ม</p>
            ) : (
              <button
                className="btn-booking"
                onClick={() => handleBooking("b17")}
              >
                จอง
              </button>
            )}
          </div>
          <div className="card-record">
            <div className="door-num">อาคาร 1 ชั้น 8</div>
            <div className="num-person">
              จำนวน {counts.b18} / {limits.b18}
            </div>
            <div className="time-table">เวลา 8.00 - 16.30</div>
            {loading.b18 ? (
              <TailSpin
                visible={true}
                height="40"
                width="40"
                color="#000"
                ariaLabel="tail-spin-loading"
                radius="1"
                wrapperStyle={{}}
                wrapperClass=""
              />
            ) : isBooked.b18 ? (
              <button
                className="btn-cancel"
                onClick={() => handleCancel("b18")}
              >
                ยกเลิกการจอง
              </button>
            ) : counts.b18 >= limits.b18 ? (
              <p className="booking-limit-message">เต็ม</p>
            ) : (
              <button
                className="btn-booking"
                onClick={() => handleBooking("b18")}
              >
                จอง
              </button>
            )}
          </div>
          <div className="card-record">
            <div className="door-num">อาคาร 1 ชั้นล่างและหลังอาคาร 1</div>
            <div className="num-person">
              จำนวน {counts.b1u} / {limits.b1u}
            </div>
            <div className="time-table">เวลา 8.00 - 16.30</div>
            {loading.b1u ? (
              <TailSpin
                visible={true}
                height="40"
                width="40"
                color="#000"
                ariaLabel="tail-spin-loading"
                radius="1"
                wrapperStyle={{}}
                wrapperClass=""
              />
            ) : isBooked.b1u ? (
              <button
                className="btn-cancel"
                onClick={() => handleCancel("b1u")}
              >
                ยกเลิกการจอง
              </button>
            ) : counts.b1u >= limits.b1u ? (
              <p className="booking-limit-message">เต็ม</p>
            ) : (
              <button
                className="btn-booking"
                onClick={() => handleBooking("b1u")}
              >
                จอง
              </button>
            )}
          </div>
          <div className="card-record">
            <div className="door-num">อาคาร 2 ชั้น 2</div>
            <div className="num-person">
              จำนวน {counts.b22} / {limits.b22}
            </div>
            <div className="time-table">เวลา 8.00 - 16.30</div>
            {loading.b22 ? (
              <TailSpin
                visible={true}
                height="40"
                width="40"
                color="#000"
                ariaLabel="tail-spin-loading"
                radius="1"
                wrapperStyle={{}}
                wrapperClass=""
              />
            ) : isBooked.b22 ? (
              <button
                className="btn-cancel"
                onClick={() => handleCancel("b22")}
              >
                ยกเลิกการจอง
              </button>
            ) : counts.b22 >= limits.b22 ? (
              <p className="booking-limit-message">เต็ม</p>
            ) : (
              <button
                className="btn-booking"
                onClick={() => handleBooking("b22")}
              >
                จอง
              </button>
            )}
          </div>
          <div className="card-record">
            <div className="door-num">อาคาร 2 ชั้น 3</div>
            <div className="num-person">
              จำนวน {counts.b23} / {limits.b23}
            </div>
            <div className="time-table">เวลา 8.00 - 16.30</div>
            {loading.b23 ? (
              <TailSpin
                visible={true}
                height="40"
                width="40"
                color="#000"
                ariaLabel="tail-spin-loading"
                radius="1"
                wrapperStyle={{}}
                wrapperClass=""
              />
            ) : isBooked.b23 ? (
              <button
                className="btn-cancel"
                onClick={() => handleCancel("b23")}
              >
                ยกเลิกการจอง
              </button>
            ) : counts.b23 >= limits.b23 ? (
              <p className="booking-limit-message">เต็ม</p>
            ) : (
              <button
                className="btn-booking"
                onClick={() => handleBooking("b23")}
              >
                จอง
              </button>
            )}
          </div>
          <div className="card-record">
            <div className="door-num">อาคาร 2 ชั้น 4</div>
            <div className="num-person">
              จำนวน {counts.b24} / {limits.b24}
            </div>
            <div className="time-table">เวลา 8.00 - 16.30</div>
            {loading.b24 ? (
              <TailSpin
                visible={true}
                height="40"
                width="40"
                color="#000"
                ariaLabel="tail-spin-loading"
                radius="1"
                wrapperStyle={{}}
                wrapperClass=""
              />
            ) : isBooked.b24 ? (
              <button
                className="btn-cancel"
                onClick={() => handleCancel("b24")}
              >
                ยกเลิกการจอง
              </button>
            ) : counts.b24 >= limits.b24 ? (
              <p className="booking-limit-message">เต็ม</p>
            ) : (
              <button
                className="btn-booking"
                onClick={() => handleBooking("b24")}
              >
                จอง
              </button>
            )}
          </div>
          <div className="card-record">
            <div className="door-num">อาคาร 2 ชั้น 5</div>
            <div className="num-person">
              จำนวน {counts.b25} / {limits.b25}
            </div>
            <div className="time-table">เวลา 8.00 - 16.30</div>
            {loading.b25 ? (
              <TailSpin
                visible={true}
                height="40"
                width="40"
                color="#000"
                ariaLabel="tail-spin-loading"
                radius="1"
                wrapperStyle={{}}
                wrapperClass=""
              />
            ) : isBooked.b25 ? (
              <button
                className="btn-cancel"
                onClick={() => handleCancel("b25")}
              >
                ยกเลิกการจอง
              </button>
            ) : counts.b25 >= limits.b25 ? (
              <p className="booking-limit-message">เต็ม</p>
            ) : (
              <button
                className="btn-booking"
                onClick={() => handleBooking("b25")}
              >
                จอง
              </button>
            )}
          </div>
          <div className="card-record">
            <div className="door-num">อาคาร 2 ชั้นล่างและหลังอาคาร 2</div>
            <div className="num-person">
              จำนวน {counts.b2u} / {limits.b2u}
            </div>
            <div className="time-table">เวลา 8.00 - 16.30</div>
            {loading.b2u ? (
              <TailSpin
                visible={true}
                height="40"
                width="40"
                color="#000"
                ariaLabel="tail-spin-loading"
                radius="1"
                wrapperStyle={{}}
                wrapperClass=""
              />
            ) : isBooked.b2u ? (
              <button
                className="btn-cancel"
                onClick={() => handleCancel("b2u")}
              >
                ยกเลิกการจอง
              </button>
            ) : counts.b2u >= limits.b2u ? (
              <p className="booking-limit-message">เต็ม</p>
            ) : (
              <button
                className="btn-booking"
                onClick={() => handleBooking("b2u")}
              >
                จอง
              </button>
            )}
          </div>
          <div className="card-record">
            <div className="door-num">อาคาร 3 ชั้น 2</div>
            <div className="num-person">
              จำนวน {counts.b32} / {limits.b32}
            </div>
            <div className="time-table">เวลา 8.00 - 16.30</div>
            {loading.b32 ? (
              <TailSpin
                visible={true}
                height="40"
                width="40"
                color="#000"
                ariaLabel="tail-spin-loading"
                radius="1"
                wrapperStyle={{}}
                wrapperClass=""
              />
            ) : isBooked.b32 ? (
              <button
                className="btn-cancel"
                onClick={() => handleCancel("b32")}
              >
                ยกเลิกการจอง
              </button>
            ) : counts.b32 >= limits.b32 ? (
              <p className="booking-limit-message">เต็ม</p>
            ) : (
              <button
                className="btn-booking"
                onClick={() => handleBooking("b32")}
              >
                จอง
              </button>
            )}
          </div>
          <div className="card-record">
            <div className="door-num">อาคาร 3 ชั้น 3</div>
            <div className="num-person">
              จำนวน {counts.b33} / {limits.b33}
            </div>
            <div className="time-table">เวลา 8.00 - 16.30</div>
            {loading.b33 ? (
              <TailSpin
                visible={true}
                height="40"
                width="40"
                color="#000"
                ariaLabel="tail-spin-loading"
                radius="1"
                wrapperStyle={{}}
                wrapperClass=""
              />
            ) : isBooked.b33 ? (
              <button
                className="btn-cancel"
                onClick={() => handleCancel("b33")}
              >
                ยกเลิกการจอง
              </button>
            ) : counts.b33 >= limits.b33 ? (
              <p className="booking-limit-message">เต็ม</p>
            ) : (
              <button
                className="btn-booking"
                onClick={() => handleBooking("b33")}
              >
                จอง
              </button>
            )}
          </div>
          <div className="card-record">
            <div className="door-num">อาคาร 4 ชั้น 1</div>
            <div className="num-person">
              จำนวน {counts.b41} / {limits.b41}
            </div>
            <div className="time-table">เวลา 8.00 - 16.30</div>
            {loading.b41 ? (
              <TailSpin
                visible={true}
                height="40"
                width="40"
                color="#000"
                ariaLabel="tail-spin-loading"
                radius="1"
                wrapperStyle={{}}
                wrapperClass=""
              />
            ) : isBooked.b41 ? (
              <button
                className="btn-cancel"
                onClick={() => handleCancel("b41")}
              >
                ยกเลิกการจอง
              </button>
            ) : counts.b41 >= limits.b41 ? (
              <p className="booking-limit-message">เต็ม</p>
            ) : (
              <button
                className="btn-booking"
                onClick={() => handleBooking("b41")}
              >
                จอง
              </button>
            )}
          </div>
          <div className="card-record">
            <div className="door-num">อาคาร 4 ชั้น 2</div>
            <div className="num-person">
              จำนวน {counts.b42} / {limits.b42}
            </div>
            <div className="time-table">เวลา 8.00 - 16.30</div>
            {loading.b42 ? (
              <TailSpin
                visible={true}
                height="40"
                width="40"
                color="#000"
                ariaLabel="tail-spin-loading"
                radius="1"
                wrapperStyle={{}}
                wrapperClass=""
              />
            ) : isBooked.b42 ? (
              <button
                className="btn-cancel"
                onClick={() => handleCancel("b42")}
              >
                ยกเลิกการจอง
              </button>
            ) : counts.b42 >= limits.b42 ? (
              <p className="booking-limit-message">เต็ม</p>
            ) : (
              <button
                className="btn-booking"
                onClick={() => handleBooking("b42")}
              >
                จอง
              </button>
            )}
          </div>
          <div className="card-record">
            <div className="door-num">อาคาร 4 ชั้น 3</div>
            <div className="num-person">
              จำนวน {counts.b43} / {limits.b43}
            </div>
            <div className="time-table">เวลา 8.00 - 16.30</div>
            {loading.b43 ? (
              <TailSpin
                visible={true}
                height="40"
                width="40"
                color="#000"
                ariaLabel="tail-spin-loading"
                radius="1"
                wrapperStyle={{}}
                wrapperClass=""
              />
            ) : isBooked.b43 ? (
              <button
                className="btn-cancel"
                onClick={() => handleCancel("b43")}
              >
                ยกเลิกการจอง
              </button>
            ) : counts.b43 >= limits.b43 ? (
              <p className="booking-limit-message">เต็ม</p>
            ) : (
              <button
                className="btn-booking"
                onClick={() => handleBooking("b43")}
              >
                จอง
              </button>
            )}
          </div>
          <div className="card-record">
            <div className="door-num">อาคารอเนกประสงค์ ชั้น 2</div>
            <div className="num-person">
              จำนวน {counts.bsp2} / {limits.bsp2}
            </div>
            <div className="time-table">เวลา 8.00 - 16.30</div>
            {loading.bsp2 ? (
              <TailSpin
                visible={true}
                height="40"
                width="40"
                color="#000"
                ariaLabel="tail-spin-loading"
                radius="1"
                wrapperStyle={{}}
                wrapperClass=""
              />
            ) : isBooked.bsp2 ? (
              <button
                className="btn-cancel"
                onClick={() => handleCancel("bsp2")}
              >
                ยกเลิกการจอง
              </button>
            ) : counts.bsp2 >= limits.bsp2 ? (
              <p className="booking-limit-message">เต็ม</p>
            ) : (
              <button
                className="btn-booking"
                onClick={() => handleBooking("bsp2")}
              >
                จอง
              </button>
            )}
          </div>
          <div className="card-record">
            <div className="door-num">อาคารอเนกประสงค์ ชั้น 3</div>
            <div className="num-person">
              จำนวน {counts.bsp3} / {limits.bsp3}
            </div>
            <div className="time-table">เวลา 8.00 - 16.30</div>
            {loading.bsp3 ? (
              <TailSpin
                visible={true}
                height="40"
                width="40"
                color="#000"
                ariaLabel="tail-spin-loading"
                radius="1"
                wrapperStyle={{}}
                wrapperClass=""
              />
            ) : isBooked.bsp3 ? (
              <button
                className="btn-cancel"
                onClick={() => handleCancel("bsp3")}
              >
                ยกเลิกการจอง
              </button>
            ) : counts.bsp3 >= limits.bsp3 ? (
              <p className="booking-limit-message">เต็ม</p>
            ) : (
              <button
                className="btn-booking"
                onClick={() => handleBooking("bsp3")}
              >
                จอง
              </button>
            )}
          </div>
          <div className="card-record">
            <div className="door-num">อาคาร 6 และหลังอาคาร 3</div>
            <div className="num-person">
              จำนวน {counts.b63} / {limits.b63}
            </div>
            <div className="time-table">เวลา 8.00 - 16.30</div>
            {loading.b63 ? (
              <TailSpin
                visible={true}
                height="40"
                width="40"
                color="#000"
                ariaLabel="tail-spin-loading"
                radius="1"
                wrapperStyle={{}}
                wrapperClass=""
              />
            ) : isBooked.b63 ? (
              <button
                className="btn-cancel"
                onClick={() => handleCancel("b63")}
              >
                ยกเลิกการจอง
              </button>
            ) : counts.b63 >= limits.b63 ? (
              <p className="booking-limit-message">เต็ม</p>
            ) : (
              <button
                className="btn-booking"
                onClick={() => handleBooking("b63")}
              >
                จอง
              </button>
            )}
          </div>
          <div className="card-record fd-class-sp">
            <div className="door-num">สนามฟุตบอล สนามฟุตซอล สนามบาสเกตบอล และบริเวณพระประจำโรงเรียน</div>
            <div className="num-person">
              จำนวน {counts.fd} / {limits.fd}
            </div>
            <div className="time-table">เวลา 8.00 - 16.30</div>
            {loading.fd ? (
              <TailSpin
                visible={true}
                height="40"
                width="40"
                color="#000"
                ariaLabel="tail-spin-loading"
                radius="1"
                wrapperStyle={{}}
                wrapperClass=""
              />
            ) : isBooked.fd ? (
              <button
                className="btn-cancel"
                onClick={() => handleCancel("fd")}
              >
                ยกเลิกการจอง
              </button>
            ) : counts.fd >= limits.fd ? (
              <p className="booking-limit-message">เต็ม</p>
            ) : (
              <button
                className="btn-booking"
                onClick={() => handleBooking("fd")}
              >
                จอง
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
