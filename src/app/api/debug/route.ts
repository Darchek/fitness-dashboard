import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const authentikHeaders: Record<string, string> = {};
  const allHeaders: Record<string, string> = {};

  req.headers.forEach((value, key) => {
    allHeaders[key] = value;
    if (key.startsWith('x-authentik') || key.startsWith('x-original')) {
      authentikHeaders[key] = value;
    }
  });

  return Response.json({
    authentik_found: Object.keys(authentikHeaders).length > 0,
    authentik_headers: authentikHeaders,
    all_headers: allHeaders,
  });
}