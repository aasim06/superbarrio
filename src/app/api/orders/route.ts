import { NextRequest, NextResponse } from "next/server";
import { getOrders, createOrder } from "@/lib/firebase/db";
import { CreateOrderSchema } from "@/lib/validations/grocery";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import {
  formatClientToCompanyOrderMessage,
  formatCompanyToClientThanksMessage,
  SUPERBARRIO_WHATSAPP_NUMBER,
} from "@/utils/whatsappMessages";

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

    // Automated 2-Way WhatsApp Notifications (Background)
    try {
      // 1. Company -> Client ("¡Gracias por tu pedido!")
      if (order.phone) {
        await sendWhatsAppMessage(
          order.phone,
          formatCompanyToClientThanksMessage(order, "es")
        );
      }
      // 2. Client -> Company (All items + Address to SuperBarrio)
      await sendWhatsAppMessage(
        SUPERBARRIO_WHATSAPP_NUMBER,
        formatClientToCompanyOrderMessage(order, "es")
      );
    } catch (waErr) {
      console.warn("Background WhatsApp dispatch note:", waErr);
    }

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process order" },
      { status: 400 }
    );
  }
}
