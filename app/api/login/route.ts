import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  let remember = false;
  try {
    const body = await req.json();
    remember = Boolean(body?.remember);
  } catch {}

  const res = NextResponse.json({ ok: true, remember });
  res.cookies.set('auth', 'true', {
    httpOnly: true,
    path: '/',
    // Если remember=true — делаем долгоживущую cookie, иначе сессионную
    ...(remember ? { maxAge: 60 * 60 * 24 * 30 } : {}),
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  return res;
}
