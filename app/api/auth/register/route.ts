import { NextResponse } from "next/server";
import { registerUser } from "@/services/auth.service";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const data = await registerUser(body);

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}