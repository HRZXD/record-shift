import db from '../../lib/mysql';
import bcrypt from 'bcrypt';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function POST(request) {
    try {
        const body = await request.json();
        const { email, password } = body;
    
        if (!email || !password) {
        return Response.json({ message: 'กรุณากรอกให้สมบูรณ์' }, { status: 400 });
        }
    
        // Check if user exists
        const [user] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (user.length === 0) {
        return Response.json({ message: 'ไม่พบอีเมลนี้' }, { status: 404 });
        }
    
        // Compare password
        const isMatch = await bcrypt.compare(password, user[0].password);
        if (!isMatch) {
        return Response.json({ message: 'รหัสผิดพลาด กรุณากรอกใหม่' }, { status: 401 });
        }
        
        // Generate JWT token
        const token = jwt.sign({ email: user[0].email , username:user[0].username , userid:user[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        // Set token in cookie
        const cookieStore = await cookies();
        cookieStore.set('token', token, {
            httpOnly: true,
            maxAge: 3600, // 1 hours
        });
    
        return Response.json({ message: 'Login successful' }, { status: 200 });
    } catch (error) {
        console.error(error);
        return Response.json({ message: 'Internal server error' }, { status: 500 });
    }
}