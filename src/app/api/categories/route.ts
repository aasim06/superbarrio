import { NextRequest, NextResponse } from "next/server";
import { getCategories, saveCategory, deleteCategory } from "@/lib/firebase/db";
import { CategorySchema } from "@/lib/validations/grocery";

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error("GET /api/categories error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = CategorySchema.parse(body);

    const saved = await saveCategory(validated);
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/categories error:", error);
    if (error?.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create category" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = CategorySchema.parse(body);

    const saved = await saveCategory(validated);
    return NextResponse.json({ success: true, data: saved });
  } catch (error: any) {
    console.error("PUT /api/categories error:", error);
    if (error?.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Category ID is required" },
        { status: 400 }
      );
    }

    await deleteCategory(id);
    return NextResponse.json({ success: true, message: `Category ${id} deleted` });
  } catch (error) {
    console.error("DELETE /api/categories error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
