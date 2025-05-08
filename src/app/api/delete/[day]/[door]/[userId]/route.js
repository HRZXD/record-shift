// /app/api/delete/[day]/[door]/[userId]/route.js
import { NextResponse } from 'next/server';
import db from '@/app/lib/mysql';

export async function DELETE(_, contextPromise) {
  const { params } = contextPromise;
  const data = await params
  const { day, door, userId } = data;

  try {
    const [result] = await db.query(
      `DELETE FROM ${door} WHERE user_id = ? AND date = ?`,
      [userId, day]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Booking cancelled successfully' });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Error cancelling booking', error: err.message }, { status: 500 });
  }
}
