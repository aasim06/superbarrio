import { NextRequest, NextResponse } from "next/server";
import { getCustomers, saveCustomerLogin } from "@/lib/firebase/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const customers = await getCustomers();
    return NextResponse.json(
      { success: true, count: customers.length, data: customers },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error: any) {
    console.error("GET /api/customers error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body || !body.email) {
      return NextResponse.json(
        { success: false, error: "Customer email is required" },
        { status: 400 }
      );
    }

    const saved = await saveCustomerLogin({
      uid: body.uid || `cust-${Date.now()}`,
      name: body.name || body.displayName,
      email: body.email,
      photoURL: body.photoURL,
      provider: body.provider || "google",
      phone: body.phone,
      address: body.address,
      city: body.city,
    });

    return NextResponse.json({ success: true, data: saved }, { status: 200 });
  } catch (error: any) {
    console.error("POST /api/customers error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to record customer login" },
      { status: 500 }
    );
  }
}
