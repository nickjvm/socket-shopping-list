import { NextRequest, NextResponse } from "next/server";

// Example GET route
export async function GET(request: NextRequest) {
  console.log(request);
  return NextResponse.json({ message: "Hello from GET!" });
}

// Example POST route
export async function POST(request: NextRequest) {
  const data = await request.json();
  return NextResponse.json({
    message: "Hello from POST!",
    received: data,
  });
}
