// /app/api/admin/route.js
import { NextResponse } from 'next/server';
import db from '@/app/lib/mysql';

export async function POST(req) {
  const { usr_admin, password } = await req.json();
  console.log(usr_admin, password);
  

  try {
    const result = await db.query('SELECT * FROM admin WHERE usr_admin = ?', [usr_admin]);
    const data = result[0]
    const data_convert = data[0]
    if (result[0].length > 0 && usr_admin === data_convert.usr_admin && password === data_convert.password) {
      return NextResponse.json({ success: true, message: 'Admin login successful' });
    } else {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ message: 'Server Error', error: error.message }, { status: 500 });
  }
}
