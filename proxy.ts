import './sentry.edge.config';
import { NextRequest, NextResponse } from 'next/server';
import { shouldIndexHost } from './utils/seo/index-gating';

export function proxy(request: NextRequest) {
  const host = request.headers.get('host');

  if (!shouldIndexHost(host)) {
    const response = NextResponse.next();
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|xml|txt)$).*)',
  ],
};
