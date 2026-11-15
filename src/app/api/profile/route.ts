import { NextRequest, NextResponse } from "next/server";
import { getAdminProfile, updateAdminProfile } from "@/lib/firebase/db";
import { ProfileSchema } from "@/lib/validations/profile";

export async function GET() {
  try {
    const profile = await getAdminProfile();
    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    console.error("GET /api/profile error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const json = await request.json();
    const parseResult = ProfileSchema.safeParse(json);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, errors: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updated = await updateAdminProfile(parseResult.data);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PUT /api/profile error:", error);
    return NextResponse.json({ success: false, error: "Failed to update profile" }, { status: 500 });
  }
}
