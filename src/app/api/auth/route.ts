import { NextRequest, NextResponse } from 'next/server';
import { findPlayerByCode, readUsers } from '@/server/users';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const code = typeof body?.authCode === 'string' ? body.authCode : '';
  if (!code.trim()) {
    return NextResponse.json({ error: "Code d'authentification requis" }, { status: 400 });
  }

  try {
    const player = findPlayerByCode(readUsers(), code);
    if (!player) return NextResponse.json({ error: 'Code invalide' }, { status: 401 });
    return NextResponse.json({ success: true, user: player });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: "Échec de l'authentification" }, { status: 500 });
  }
}
