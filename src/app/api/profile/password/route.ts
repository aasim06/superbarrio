import { NextRequest, NextResponse } from "next/server";
import { ChangePasswordSchema } from "@/lib/validations/profile";
import { getAdminProfile, updateAdminProfile } from "@/lib/firebase/db";
import fs from "fs";
import path from "path";

const LOCAL_PROFILE_FILE = path.join(process.cwd(), "src", "data", "admin_profile.json");

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parseResult = ChangePasswordSchema.safeParse(json);

    if (!parseResult.success) {
      const fieldErrors = parseResult.error.flatten().fieldErrors;
      const firstError = Object.values(fieldErrors)[0]?.[0] || "Datos inválidos";
      return NextResponse.json(
        { success: false, error: firstError, errors: fieldErrors },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = parseResult.data;
    const profile = await getAdminProfile();
    const existingPassword = (profile as any).password || "admin";

    // Verify current password
    if (String(currentPassword) !== String(existingPassword)) {
      return NextResponse.json(
        { success: false, error: "La contraseña actual no es correcta." },
        { status: 400 }
      );
    }

    // Update password in memory & file
    const updated = {
      ...profile,
      password: newPassword,
    };

    try {
      fs.writeFileSync(LOCAL_PROFILE_FILE, JSON.stringify(updated, null, 2), "utf-8");
    } catch (err) {
      console.warn("Failed to write updated password to local profile file:", err);
    }

    await updateAdminProfile(updated);

    return NextResponse.json({
      success: true,
      message: "Contraseña actualizada con éxito. Use su nueva clave en el próximo inicio de sesión.",
    });
  } catch (error) {
    console.error("POST /api/profile/password error:", error);
    return NextResponse.json({ success: false, error: "Error al actualizar la contraseña." }, { status: 500 });
  }
}
