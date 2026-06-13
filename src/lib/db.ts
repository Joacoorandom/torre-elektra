import { neon } from "@neondatabase/serverless";

export type UnitType = "departamento" | "oficina" | "recepcion";
export type UnitStatus = "disponible" | "reservado" | "ocupado";

export interface Unit {
  id: number;
  floor: number;
  unit_number: string;
  type: UnitType;
  status: UnitStatus;
  size_blocks: number;
  reserved_by_name: string | null;
  reserved_by_discord: string | null;
  reserved_by_minecraft: string | null;
  reserved_at: string | null;
  notes: string | null;
}

function getDb() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) throw new Error("No database URL configured");
  return neon(url);
}

export async function setupDatabase() {
  const sql = getDb();

  await sql`
    CREATE TABLE IF NOT EXISTS units (
      id SERIAL PRIMARY KEY,
      floor INTEGER NOT NULL,
      unit_number VARCHAR(20) NOT NULL UNIQUE,
      type VARCHAR(20) NOT NULL DEFAULT 'departamento',
      status VARCHAR(20) NOT NULL DEFAULT 'disponible',
      size_blocks INTEGER NOT NULL DEFAULT 1089,
      reserved_by_name VARCHAR(100),
      reserved_by_discord VARCHAR(100),
      reserved_by_minecraft VARCHAR(100),
      reserved_at TIMESTAMP,
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS reservations (
      id SERIAL PRIMARY KEY,
      unit_id INTEGER REFERENCES units(id),
      name VARCHAR(100) NOT NULL,
      discord VARCHAR(100),
      minecraft_user VARCHAR(100),
      message TEXT,
      status VARCHAR(20) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  const rows = await sql`SELECT COUNT(*) as count FROM units`;
  if (parseInt(rows[0].count) === 0) {
    await seedUnits();
  }
}

async function seedUnits() {
  const sql = getDb();

  await sql`
    INSERT INTO units (floor, unit_number, type, status, size_blocks, notes)
    VALUES (1, '1-RECEPCION', 'recepcion', 'ocupado', 1089, 'Hall principal de la Torre Elektra')
  `;

  for (let floor = 2; floor <= 35; floor++) {
    const type: UnitType = floor <= 18 ? "departamento" : "oficina";
    const unitNumber = `${floor}-A`;
    await sql`
      INSERT INTO units (floor, unit_number, type, status, size_blocks)
      VALUES (${floor}, ${unitNumber}, ${type}, 'disponible', 1089)
    `;
  }

  await sql`
    INSERT INTO units (floor, unit_number, type, status, size_blocks, notes)
    VALUES (36, '36-PENTHOUSE', 'departamento', 'disponible', 1089, 'Piso superior — vista panorámica')
  `;

  await sql`
    UPDATE units SET status = 'reservado', reserved_by_name = 'Reservado', notes = 'Ya reservado'
    WHERE floor IN (5, 12)
  `;
}

export async function getAllUnits(): Promise<Unit[]> {
  const sql = getDb();
  const rows = await sql`SELECT * FROM units ORDER BY floor ASC`;
  return rows as Unit[];
}

export async function reserveUnit(
  unitId: number,
  name: string,
  discord: string,
  minecraftUser: string,
  message?: string
): Promise<{ success: boolean; error?: string }> {
  const sql = getDb();
  const rows = await sql`SELECT status FROM units WHERE id = ${unitId}`;
  if (!rows[0] || rows[0].status !== "disponible") {
    return { success: false, error: "Esta unidad ya no está disponible." };
  }

  await sql`
    UPDATE units SET
      status = 'reservado',
      reserved_by_name = ${name},
      reserved_by_discord = ${discord},
      reserved_by_minecraft = ${minecraftUser},
      reserved_at = NOW()
    WHERE id = ${unitId}
  `;

  await sql`
    INSERT INTO reservations (unit_id, name, discord, minecraft_user, message, status)
    VALUES (${unitId}, ${name}, ${discord}, ${minecraftUser}, ${message || null}, 'confirmed')
  `;

  return { success: true };
}

export async function cancelReservation(
  unitId: number,
  adminKey: string
): Promise<{ success: boolean; error?: string }> {
  if (adminKey !== process.env.ADMIN_SECRET) {
    return { success: false, error: "No autorizado." };
  }

  const sql = getDb();
  await sql`
    UPDATE units SET
      status = 'disponible',
      reserved_by_name = NULL,
      reserved_by_discord = NULL,
      reserved_by_minecraft = NULL,
      reserved_at = NULL
    WHERE id = ${unitId}
  `;

  return { success: true };
}

export async function getStats() {
  const sql = getDb();
  const rows = await sql`
    SELECT
      COUNT(*) FILTER (WHERE status = 'disponible') as disponibles,
      COUNT(*) FILTER (WHERE status = 'reservado') as reservados,
      COUNT(*) FILTER (WHERE status = 'ocupado') as ocupados,
      COUNT(*) FILTER (WHERE type = 'departamento') as departamentos,
      COUNT(*) FILTER (WHERE type = 'oficina') as oficinas,
      COUNT(*) as total
    FROM units WHERE type != 'recepcion'
  `;
  return rows[0];
}

export async function getAllReservations() {
  const sql = getDb();
  const rows = await sql`
    SELECT
      r.id,
      r.unit_id,
      r.name,
      r.discord,
      r.minecraft_user,
      r.message,
      r.status,
      r.created_at,
      u.floor,
      u.unit_number
    FROM reservations r
    JOIN units u ON r.unit_id = u.id
    WHERE r.status != 'cancelled'
    ORDER BY r.created_at DESC
  `;
  return rows;
}
