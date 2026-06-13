import { NextRequest, NextResponse } from "next/server";
import { getAllUnits, getStats, setupDatabase } from "@/lib/db";

let initialized = false;

async function ensureDb() {
  if (!initialized) {
    await setupDatabase();
    initialized = true;
  }
}

export async function GET(req: NextRequest) {
  try {
    await ensureDb();
    const { searchParams } = new URL(req.url);

    if (searchParams.get("stats") === "1") {
      const stats = await getStats();
      return NextResponse.json({ stats });
    }

    const units = await getAllUnits();
    return NextResponse.json({ units });
  } catch (error) {
    console.error("DB error:", error);
    return NextResponse.json(
      { error: "Error al cargar datos" },
      { status: 500 }
    );
  }
}
