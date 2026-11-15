import { NextResponse } from "next/server";
import { seedInitialData } from "@/lib/firebase/db";

export async function POST() {
  try {
    const result = await seedInitialData();
    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      ...result,
    });
  } catch (error: any) {
    console.error("POST /api/seed error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to seed database" },
      { status: 500 }
    );
  }
}
