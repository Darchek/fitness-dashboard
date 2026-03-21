// src/app/api/[...path]/route.ts
import { NextRequest } from 'next/server';

const BACKEND_URL = 'http://fitness-api:8000';

async function proxyRequest(req: NextRequest, params: { api: string[] }) {   
  const path = params.api.join('/');
  const url = `${BACKEND_URL}/${path}${req.nextUrl.search}`;

  // Forward all Authentik headers to the backend
  const headers = new Headers();
  req.headers.forEach((value, key) => {
    if (key.startsWith('x-authentik-') || key === 'content-type' || key === 'authorization') {
      headers.set(key, value);
    }
  });

  const response = await fetch(url, {
    method: req.method,
    headers,
    body: req.method !== 'GET' && req.method !== 'HEAD' ? await req.blob() : undefined,
  });

  // Return the backend response as-is
  const responseHeaders = new Headers();
  response.headers.forEach((value, key) => {
    responseHeaders.set(key, value);
  });

  return new Response(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ api: string[] }> }) {
  return proxyRequest(req, await params);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ api: string[] }> }) {
  return proxyRequest(req, await params);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ api: string[] }> }) {
  return proxyRequest(req, await params);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ api: string[] }> }) {
  return proxyRequest(req, await params);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ api: string[] }> }) {
  return proxyRequest(req, await params);
}