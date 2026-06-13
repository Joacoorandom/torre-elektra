import { NextRequest, NextResponse } from "next/server";
import { cancelReservation, getAllReservations } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");

  if (!key || key !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const reservations = await getAllReservations();
    return NextResponse.json({ reservations });
  } catch (error) {
    console.error("Admin GET error:", error);
    return NextResponse.json(
      { error: "Error al cargar reservas." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");
  const unitId = searchParams.get("unit_id");

  if (!key || key !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  if (!unitId) {
    return NextResponse.json(
      { error: "unit_id requerido." },
      { status: 400 }
    );
  }

  try {
    const result = await cancelReservation(parseInt(unitId), key);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin DELETE error:", error);
    return NextResponse.json(
      { error: "Error al cancelar reserva." },
      { status: 500 }
    );
  }
}
