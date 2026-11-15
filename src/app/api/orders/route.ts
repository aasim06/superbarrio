import { NextRequest, NextResponse } from "next/server";
import { getOrders, createOrder } from "@/lib/firebase/db";
import { CreateOrderSchema } from "@/lib/validations/grocery";

export async function GET() {
  try {
    const orders = await getOrders();
    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parseResult = CreateOrderSchema.safeParse(json);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, errors: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // SERVER-ONLY CALCULATION & VERIFICATION
    const order = await createOrder(parseResult.data);
    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process order" },
      { status: 400 }
    );
  }
}
