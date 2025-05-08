// /app/api/create/route.js
import { NextResponse } from 'next/server';
import db from '@/app/lib/mysql';
import { limits } from '@/app/lib/limit';

export async function POST(req) {
  const { userId, userName, email, day, whe, bookAt } = await req.json();
  try {
    const existing = await db.query(`SELECT * FROM ${whe} WHERE user_id = ? AND date = ?`, [userId, day]);
    if (existing[0].length > 0) {
      return NextResponse.json({ success: false, message: 'User has already booked this slot' }, { status: 400 });
    }

    const conn = await db.getConnection();
    await conn.beginTransaction();

    const [countRes] = await conn.query(`SELECT COUNT(date) as count FROM ${whe} WHERE date = ? FOR UPDATE`, [day]);

    if (countRes[0].count >= limits[whe]) {
      await conn.rollback();
      return NextResponse.json({ success: false, message: 'Booking limit reached' }, { status: 400 });
    }

    await conn.query(`INSERT INTO ${whe} (user_id, name, email, date, time) VALUES (?, ?, ?, ?, ?)`, [userId, userName, email, day, bookAt]);
    await conn.commit();

    return NextResponse.json({ success: true, message: 'Booking created successfully' });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Error creating booking', error: err.message }, { status: 500 });
  }
}
