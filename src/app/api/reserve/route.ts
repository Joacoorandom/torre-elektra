import { NextRequest, NextResponse } from "next/server";
import { reserveUnit } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { unit_id, name, discord, minecraft_user, message } = body;

    if (!unit_id || !name?.trim()) {
      return NextResponse.json(
        { success: false, error: "Datos incompletos." },
        { status: 400 }
      );
    }

    if (!discord?.trim() && !minecraft_user?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Debes ingresar tu Discord o usuario de Minecraft.",
        },
        { status: 400 }
      );
    }

    const result = await reserveUnit(
      unit_id,
      name.trim(),
      discord?.trim() || "",
      minecraft_user?.trim() || "",
      message?.trim()
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 409 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reserve error:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
