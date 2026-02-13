import { NextRequest, NextResponse } from 'next/server';
import { getAuthCookie } from './cookies';
import { verifyToken, JwtPayload } from './jwt';

export type AuthenticatedHandler = (
  req: NextRequest,
  context: { params: Promise<Record<string, string>>; user: JwtPayload }
) => Promise<NextResponse>;

export function withAuth(handler: AuthenticatedHandler) {
  return async (req: NextRequest, context: { params: Promise<Record<string, string>> }) => {
    try {
      const token = await getAuthCookie();

      if (!token) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      const user = await verifyToken(token);
      return handler(req, { ...context, user });
    } catch {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
  };
}
