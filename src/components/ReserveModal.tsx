"use client";

import { Unit } from "@/app/page";
import { useState } from "react";

interface Props {
  unit: Unit;
  onClose: () => void;
  onReserved: () => void;
}

export default function ReserveModal({ unit, onClose, onReserved }: Props) {
  const [form, setForm] = useState({
    name: "",
    discord: "",
    minecraft_user: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError("Tu nombre es requerido.");
      return;
    }
    if (!form.discord.trim() && !form.minecraft_user.trim()) {
      setError("Ingresa tu usuario de Discord o Minecraft.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unit_id: unit.id,
          ...form,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Error al reservar. Intenta de nuevo.");
      } else {
        setSuccess(true);
        setTimeout(() => onReserved(), 2000);
      }
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-elektra-border">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="badge badge-purple capitalize">{unit.type}</span>
              <span className="font-mono text-xs text-elektra-muted">
                {unit.unit_number}
              </span>
            </div>
            <h2 className="font-display font-bold text-white text-xl">
              Piso {unit.floor}
              {unit.floor === 36 && (
                <span className="text-elektra-purple-light ml-2 text-base">
                  Penthouse
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-elektra-border text-elektra-muted hover:text-white hover:border-elektra-purple transition-all"
          >
            ✕
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 bg-elektra-green/20 border border-elektra-green/40 rounded-full flex items-center justify-center mx-auto mb-4 glow-green">
              <span className="text-2xl">✓</span>
            </div>
            <h3 className="font-display font-bold text-white text-lg mb-1">
              ¡Reserva confirmada!
            </h3>
            <p className="font-mono text-sm text-elektra-text-dim">
              El Piso {unit.floor} está asignado a ti.
            </p>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            {/* Unit specs */}
            <div className="bg-elektra-dark rounded-lg p-3 flex gap-4 border border-elektra-border">
              {[
                ["Dimensiones", "33×33 bloques"],
                ["Altura", "3 bloques"],
                ["Área", "~1.089 bloq²"],
              ].map(([k, v]) => (
                <div key={k} className="flex-1 text-center">
                  <p className="font-mono text-[10px] text-elektra-muted">
                    {k}
                  </p>
                  <p className="font-mono text-xs text-white font-bold mt-0.5">
                    {v}
                  </p>
                </div>
              ))}
            </div>

            {/* Form */}
            <div className="space-y-3">
              <div>
                <label className="block font-mono text-xs text-elektra-text-dim mb-1.5">
                  Nombre completo *
                </label>
                <input
                  className="input-field"
                  placeholder="Tu nombre en el servidor"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-elektra-text-dim mb-1.5">
                  Discord (usuario o tag)
                </label>
                <input
                  className="input-field"
                  placeholder="usuario#0000 o @usuario"
                  value={form.discord}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, discord: e.target.value }))
                  }
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-elektra-text-dim mb-1.5">
                  Usuario de Minecraft
                </label>
                <input
                  className="input-field"
                  placeholder="Steve, Alex..."
                  value={form.minecraft_user}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      minecraft_user: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-elektra-text-dim mb-1.5">
                  Mensaje o nota (opcional)
                </label>
                <textarea
                  className="input-field resize-none"
                  rows={2}
                  placeholder="¿Algo que quieras agregar?"
                  value={form.message}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, message: e.target.value }))
                  }
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-950/50 border border-red-500/30 rounded-lg p-3">
                <p className="font-mono text-xs text-red-400">{error}</p>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-lg border border-elektra-border text-elektra-muted hover:text-white hover:border-elektra-border/80 transition-all font-mono text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary flex-1"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Reservando...
                  </span>
                ) : (
                  "Reservar piso"
                )}
              </button>
            </div>

            <p className="font-mono text-[10px] text-elektra-muted text-center">
              Al reservar aceptas que el administrador puede contactarte por
              Discord o Minecraft
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
