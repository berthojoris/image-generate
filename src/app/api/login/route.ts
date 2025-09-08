import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Hardcoded credentials
    const validEmail = 'berthojoris@gmail.com';
    const validPassword = 'malaquena';

    if (email === validEmail && password === validPassword) {
      return NextResponse.json({ message: 'Login successful' });
    } else {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}