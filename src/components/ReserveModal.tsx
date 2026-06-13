"use client";

import { Unit } from "@/app/page";
import { useState } from "react";

interface Props {
  unit: Unit;
  onClose: () => void;
  onReserved: () => void;
}

type UnitKind = "departamento" | "oficina";

interface DepaForm {
  kind: "departamento";
  owner: string;
  estimated_price: string;
  rooms: string;
  bathrooms: string;
  status_unit: "en_venta" | "en_arriendo" | "ocupada" | "";
  notes: string;
  discord: string;
  minecraft_user: string;
}

interface OficinaForm {
  kind: "oficina";
  company_name: string;
  owner: string;
  rubro: string;
  status_unit: "activa" | "inactiva" | "";
  notes: string;
  discord: string;
  minecraft_user: string;
}

type FormData = DepaForm | OficinaForm;

function now() {
  return new Date().toLocaleString("es-CL", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const RECEIPT_LINE = "--------------------------------";

export default function ReserveModal({ unit, onClose, onReserved }: Props) {
  const isDepa = unit.type === "departamento";
  const [kind, setKind] = useState<UnitKind>(isDepa ? "departamento" : "oficina");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [timestamp] = useState(now());

  const [depa, setDepa] = useState<DepaForm>({
    kind: "departamento", owner: "", estimated_price: "",
    rooms: "", bathrooms: "", status_unit: "",
    notes: "", discord: "", minecraft_user: "",
  });
  const [oficina, setOficina] = useState<OficinaForm>({
    kind: "oficina", company_name: "", owner: "",
    rubro: "", status_unit: "",
    notes: "", discord: "", minecraft_user: "",
  });

  const form: FormData = kind === "departamento" ? depa : oficina;

  const validate = (): string | null => {
    if (kind === "departamento") {
      if (!depa.owner.trim()) return "El nombre del dueño es requerido.";
      if (!depa.discord.trim() && !depa.minecraft_user.trim())
        return "Ingresa tu Discord o usuario de Minecraft.";
    } else {
      if (!oficina.company_name.trim()) return "El nombre de la empresa es requerido.";
      if (!oficina.owner.trim()) return "El nombre del dueño es requerido.";
      if (!oficina.discord.trim() && !oficina.minecraft_user.trim())
        return "Ingresa tu Discord o usuario de Minecraft.";
    }
    return null;
  };

  const buildMessage = (): string => {
    if (kind === "departamento") {
      return [
        `TIPO: departamento`,
        `DUEÑO: ${depa.owner}`,
        `PRECIO: ${depa.estimated_price || "—"}`,
        `HABITACIONES: ${depa.rooms || "—"}`,
        `BAÑOS: ${depa.bathrooms || "—"}`,
        `ESTADO: ${depa.status_unit || "—"}`,
        `NOTAS: ${depa.notes || "—"}`,
      ].join(" | ");
    } else {
      return [
        `TIPO: oficina`,
        `EMPRESA: ${oficina.company_name}`,
        `DUEÑO: ${oficina.owner}`,
        `RUBRO: ${oficina.rubro || "—"}`,
        `ESTADO: ${oficina.status_unit || "—"}`,
        `NOTAS: ${oficina.notes || "—"}`,
      ].join(" | ");
    }
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { setError(err); return; }

    setLoading(true);
    setError("");

    const ownerName = kind === "departamento" ? depa.owner : oficina.owner;
    const discord = kind === "departamento" ? depa.discord : oficina.discord;
    const minecraft_user = kind === "departamento" ? depa.minecraft_user : oficina.minecraft_user;

    try {
      const res = await fetch("/api/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unit_id: unit.id,
          name: ownerName,
          discord,
          minecraft_user,
          message: buildMessage(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Error al reservar. Intenta de nuevo.");
      } else {
        setSuccess(true);
        setTimeout(() => onReserved(), 3500);
      }
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const ownerName = kind === "departamento" ? depa.owner : oficina.owner;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="receipt-print w-full flex justify-center px-2">
        <div className="receipt" style={{ maxWidth: 400 }}>

          {/* Borde dentado arriba */}
          <div className="receipt-top" />

          <div className="receipt-body">

            {/* Encabezado */}
            <div className="text-center mb-1">
              <div className="receipt-title">TORRE ELEKTRA</div>
              <div className="receipt-subtitle">PixelPlay Network · Registro de Unidad</div>
              <hr className="receipt-divider" />
            </div>

            {/* Info de unidad */}
            <div>
              <div className="receipt-row">
                <span className="receipt-label">ID UNIDAD</span>
                <span className="receipt-value">{unit.unit_number}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">PISO</span>
                <span className="receipt-value">{unit.floor}{unit.floor === 36 ? " — PENTHOUSE" : ""}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">DIMENSIONES</span>
                <span className="receipt-value">33×33 bloques</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">FECHA</span>
                <span className="receipt-value">{timestamp}</span>
              </div>
            </div>

            <hr className="receipt-divider" />

            {!success ? (
              <>
                {/* Selector tipo */}
                <div className="mb-3">
                  <p style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                    Tipo de unidad
                  </p>
                  <div className="receipt-select">
                    <button
                      className={`receipt-option ${kind === "departamento" ? "selected" : ""}`}
                      onClick={() => setKind("departamento")}
                    >
                      🏠 Departamento
                    </button>
                    <button
                      className={`receipt-option ${kind === "oficina" ? "selected" : ""}`}
                      onClick={() => setKind("oficina")}
                    >
                      🏢 Empresa / Oficina
                    </button>
                  </div>
                </div>

                <hr className="receipt-divider" />

                {/* Formulario DEPA */}
                {kind === "departamento" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <p style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      Registro de Casa / Departamento
                    </p>

                    <ReceiptField label="Dueño *">
                      <input
                        className="receipt-input"
                        placeholder="Tu nombre en el servidor"
                        value={depa.owner}
                        onChange={(e) => setDepa(f => ({ ...f, owner: e.target.value }))}
                      />
                    </ReceiptField>

                    <ReceiptField label="Precio estimado">
                      <input
                        className="receipt-input"
                        placeholder="ej. $5,000 en emeraldas"
                        value={depa.estimated_price}
                        onChange={(e) => setDepa(f => ({ ...f, estimated_price: e.target.value }))}
                      />
                    </ReceiptField>

                    <div style={{ display: "flex", gap: 8 }}>
                      <ReceiptField label="Habitaciones">
                        <input
                          className="receipt-input"
                          placeholder="2"
                          value={depa.rooms}
                          onChange={(e) => setDepa(f => ({ ...f, rooms: e.target.value }))}
                        />
                      </ReceiptField>
                      <ReceiptField label="Baños">
                        <input
                          className="receipt-input"
                          placeholder="1"
                          value={depa.bathrooms}
                          onChange={(e) => setDepa(f => ({ ...f, bathrooms: e.target.value }))}
                        />
                      </ReceiptField>
                    </div>

                    <ReceiptField label="Estado">
                      <div className="receipt-select">
                        {(["en_venta", "en_arriendo", "ocupada"] as const).map((s) => (
                          <button
                            key={s}
                            className={`receipt-option ${depa.status_unit === s ? "selected" : ""}`}
                            onClick={() => setDepa(f => ({ ...f, status_unit: s }))}
                          >
                            {s === "en_venta" ? "En venta" : s === "en_arriendo" ? "Arriendo" : "Ocupada"}
                          </button>
                        ))}
                      </div>
                    </ReceiptField>

                    <ReceiptField label="Notas">
                      <textarea
                        className="receipt-input"
                        rows={2}
                        placeholder="Descripción, estilo de construcción..."
                        value={depa.notes}
                        onChange={(e) => setDepa(f => ({ ...f, notes: e.target.value }))}
                        style={{ resize: "none" }}
                      />
                    </ReceiptField>
                  </div>
                )}

                {/* Formulario OFICINA */}
                {kind === "oficina" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <p style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      Registro de Empresa / Oficina
                    </p>

                    <ReceiptField label="Nombre de la empresa *">
                      <input
                        className="receipt-input"
                        placeholder="ej. Elektra Corp."
                        value={oficina.company_name}
                        onChange={(e) => setOficina(f => ({ ...f, company_name: e.target.value }))}
                      />
                    </ReceiptField>

                    <ReceiptField label="Dueño *">
                      <input
                        className="receipt-input"
                        placeholder="Tu nombre en el servidor"
                        value={oficina.owner}
                        onChange={(e) => setOficina(f => ({ ...f, owner: e.target.value }))}
                      />
                    </ReceiptField>

                    <ReceiptField label="Rubro">
                      <input
                        className="receipt-input"
                        placeholder="ej. Comercio, Servicios, Construcción"
                        value={oficina.rubro}
                        onChange={(e) => setOficina(f => ({ ...f, rubro: e.target.value }))}
                      />
                    </ReceiptField>

                    <ReceiptField label="Estado">
                      <div className="receipt-select">
                        {(["activa", "inactiva"] as const).map((s) => (
                          <button
                            key={s}
                            className={`receipt-option ${oficina.status_unit === s ? "selected" : ""}`}
                            onClick={() => setOficina(f => ({ ...f, status_unit: s }))}
                          >
                            {s === "activa" ? "✅ Activa" : "⏸ Inactiva"}
                          </button>
                        ))}
                      </div>
                    </ReceiptField>

                    <ReceiptField label="Notas">
                      <textarea
                        className="receipt-input"
                        rows={2}
                        placeholder="Qué vende/ofrece, horario, etc."
                        value={oficina.notes}
                        onChange={(e) => setOficina(f => ({ ...f, notes: e.target.value }))}
                        style={{ resize: "none" }}
                      />
                    </ReceiptField>
                  </div>
                )}

                <hr className="receipt-divider" style={{ marginTop: 12 }} />

                {/* Contacto */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <p style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Contacto (mínimo uno)
                  </p>
                  <ReceiptField label="Discord">
                    <input
                      className="receipt-input"
                      placeholder="usuario o @tag"
                      value={kind === "departamento" ? depa.discord : oficina.discord}
                      onChange={(e) =>
                        kind === "departamento"
                          ? setDepa(f => ({ ...f, discord: e.target.value }))
                          : setOficina(f => ({ ...f, discord: e.target.value }))
                      }
                    />
                  </ReceiptField>
                  <ReceiptField label="Usuario Minecraft">
                    <input
                      className="receipt-input"
                      placeholder="Steve, Alex..."
                      value={kind === "departamento" ? depa.minecraft_user : oficina.minecraft_user}
                      onChange={(e) =>
                        kind === "departamento"
                          ? setDepa(f => ({ ...f, minecraft_user: e.target.value }))
                          : setOficina(f => ({ ...f, minecraft_user: e.target.value }))
                      }
                    />
                  </ReceiptField>
                </div>

                {error && (
                  <p style={{ fontFamily: "JetBrains Mono", fontSize: 11, color: "#dc2626", marginTop: 8, textAlign: "center" }}>
                    ⚠ {error}
                  </p>
                )}

                <hr className="receipt-divider" style={{ marginTop: 12 }} />

                {/* Total / resumen */}
                <div className="receipt-total">
                  PISO {unit.floor} · {kind === "departamento" ? "DEPARTAMENTO" : "OFICINA"}
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button
                    onClick={onClose}
                    style={{
                      flex: 1, padding: "9px", border: "1px solid #ccc",
                      background: "transparent", fontFamily: "JetBrains Mono",
                      fontSize: 11, cursor: "pointer", color: "#555",
                    }}
                  >
                    CANCELAR
                  </button>
                  <button
                    className="receipt-btn"
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{ flex: 2 }}
                  >
                    {loading ? "PROCESANDO..." : "✓ CONFIRMAR REGISTRO"}
                  </button>
                </div>

                <p style={{ fontFamily: "JetBrains Mono", fontSize: 9, color: "#aaa", textAlign: "center", marginTop: 8 }}>
                  Al registrar aceptas que el admin puede contactarte
                </p>
              </>
            ) : (
              /* ── ÉXITO ── */
              <div style={{ textAlign: "center", padding: "8px 0 12px" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                  <div className="receipt-stamp">REGISTRADO</div>
                </div>

                <div style={{ fontFamily: "JetBrains Mono", fontSize: 11, lineHeight: 1.9, color: "#333" }}>
                  <div className="receipt-row">
                    <span className="receipt-label">UNIDAD</span>
                    <span className="receipt-value">{unit.unit_number}</span>
                  </div>
                  <div className="receipt-row">
                    <span className="receipt-label">PISO</span>
                    <span className="receipt-value">{unit.floor}</span>
                  </div>
                  <div className="receipt-row">
                    <span className="receipt-label">TIPO</span>
                    <span className="receipt-value">{kind === "departamento" ? "DEPARTAMENTO" : "OFICINA"}</span>
                  </div>
                  <div className="receipt-row">
                    <span className="receipt-label">DUEÑO</span>
                    <span className="receipt-value">{ownerName || "—"}</span>
                  </div>
                  {kind === "oficina" && (
                    <div className="receipt-row">
                      <span className="receipt-label">EMPRESA</span>
                      <span className="receipt-value">{oficina.company_name}</span>
                    </div>
                  )}
                  <div className="receipt-row">
                    <span className="receipt-label">FECHA</span>
                    <span className="receipt-value">{timestamp}</span>
                  </div>
                </div>

                <p style={{ fontFamily: "JetBrains Mono", fontSize: 9, color: "#aaa", marginTop: 10, letterSpacing: "0.06em" }}>
                  CONSERVA ESTE COMPROBANTE
                </p>
                <p style={{ fontFamily: "JetBrains Mono", fontSize: 9, color: "#aaa", letterSpacing: "0.06em" }}>
                  Torre Elektra · PixelPlay Network
                </p>
              </div>
            )}
          </div>

          {/* Borde dentado abajo */}
          <div className="receipt-bottom" />
        </div>
      </div>
    </div>
  );
}

function ReceiptField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{ fontFamily: "JetBrains Mono", fontSize: 10, color: "#666", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </p>
      {children}
    </div>
  );
}
