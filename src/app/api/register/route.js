import db from '../../lib/mysql';
import bcrypt from 'bcrypt';

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, email, password } = body;

    if (!username || !password) {
      return Response.json({ message: 'กรุณากรอกข้อมูลให้สมบูรณ์' }, { status: 400 });
    }

    // Check if user already exists
    const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return Response.json({ message: 'มีผู้ใช้งานอีเมลนี้แล้ว' }, { status: 409 });
    }

    const [existingName] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (existingName.length > 0) {
      return Response.json({ message: 'มีผู้ใช้งานใช้ชื่อนี้แล้ว' }, { status: 409 });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    await db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [
      username,
      email,
      hashedPassword,
    ]);

    return Response.json({ message: 'User registered successfully' }, { status: 201 });
  } catch (error) {
    console.error(error);
    return Response.json({ message: 'Internal server error' }, { status: 500 });
  }
}
