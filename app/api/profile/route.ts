import { NextResponse } from "next/server";
import { getProfile } from "@/services/user.service";

export async function GET() {
  try {
    const profile = await getProfile();

    return NextResponse.json(profile);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 401 }
    );
  }
}