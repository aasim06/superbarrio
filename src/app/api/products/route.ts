import { NextRequest, NextResponse } from "next/server";
import { getProducts, saveProduct, deleteProduct } from "@/lib/firebase/db";
import { ProductSchema } from "@/lib/validations/grocery";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("q")?.toLowerCase();

    let products = await getProducts(category);

    if (search) {
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.nameEn?.toLowerCase().includes(search) ||
          p.description?.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parseResult = ProductSchema.safeParse(json);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, errors: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const saved = await saveProduct(parseResult.data);
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error) {
    console.error("POST /api/products error:", error);
    return NextResponse.json({ success: false, error: "Failed to create product" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const json = await request.json();
    const parseResult = ProductSchema.safeParse(json);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, errors: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const saved = await saveProduct(parseResult.data);
    return NextResponse.json({ success: true, data: saved }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/products error:", error);
    return NextResponse.json({ success: false, error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await request.json();
        id = body?.id;
      } catch {
        // no body
      }
    }

    if (!id) {
      return NextResponse.json({ success: false, error: "Product id is required" }, { status: 400 });
    }

    await deleteProduct(id);
    return NextResponse.json({ success: true, message: `Product ${id} deleted successfully` });
  } catch (error) {
    console.error("DELETE /api/products error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete product" }, { status: 500 });
  }
}
