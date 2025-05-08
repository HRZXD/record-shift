// /app/api/door/[slug]/route.js
import { NextResponse } from 'next/server';
import db from '@/app/lib/mysql';

export async function GET(_, contextPromise) {
  const { params } = contextPromise;
  const data = await params
  const [day, door] = data.slug.split('_');

  try {
    const [result] = await db.query(
      `SELECT COUNT(date) as result FROM ${door} WHERE date = ?`,
      [day]
    );
    const [result_user] = await db.query(
      `SELECT * FROM ${door} WHERE date = ?`,
      [day]
    );
    return NextResponse.json({result , result_user});
    // return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { message: 'Error fetching data', error: err.message },
      { status: 500 }
    );
  }
}
