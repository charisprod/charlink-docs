import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/get-started')
  return NextResponse.redirect(
    'https://charlink-docs.charisprod.xyz/overview'
  );

}

export const config = {
  matcher: ['/get-started'],
};