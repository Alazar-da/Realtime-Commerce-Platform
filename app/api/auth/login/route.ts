import { NextResponse } from "next/server";
import { loginUser } from "@/services/auth.service";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const data = await loginUser(body);

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}