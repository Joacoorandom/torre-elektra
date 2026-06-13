"use client";

import { useState } from "react";

interface Reservation {
  id: number;
  floor: number;
  unit_number: string;
  name: string;
  discord: string;
  minecraft_user: string;
  message: string;
  status: string;
  created_at: string;
  unit_id: number;
}

export default function AdminPage() {
  const [key, setKey] = useState("");
  const [inputKey, setInputKey] = useState("");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const login = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin?key=${inputKey}`);
      if (!res.ok) {
        setError("Clave incorrecta.");
        return;
      }
      const data = await res.json();
      setKey(inputKey);
      setReservations(data.reservations || []);
    } catch {
      setError("Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  const cancelReservation = async (unitId: number) => {
    if (!confirm("¿Cancelar esta reserva?")) return;
    setCancellingId(unitId);
    try {
      const res = await fetch(`/api/admin?key=${key}&unit_id=${unitId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setReservations((prev) =>
          prev.filter((r) => r.unit_id !== unitId)
        );
      }
    } finally {
      setCancellingId(null);
    }
  };

  if (!key) {
    return (
      <main className="min-h-screen bg-elektra-black bg-grid flex items-center justify-center p-4">
        <div className="bg-elektra-surface border border-elektra-border rounded-xl p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-elektra-purple/20 border border-elektra-purple/40 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-elektra-purple-light text-xl">🔑</span>
            </div>
            <h1 className="font-display font-bold text-white text-xl">
              Admin · Torre Elektra
            </h1>
            <p className="font-mono text-xs text-elektra-muted mt-1">
              Panel de administración
            </p>
          </div>

          <div className="space-y-3">
            <input
              className="input-field"
              type="password"
              placeholder="Clave de administrador"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && login()}
            />
            {error && (
              <p className="font-mono text-xs text-red-400">{error}</p>
            )}
            <button
              onClick={login}
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? "Verificando..." : "Entrar"}
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-elektra-black bg-grid p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6 pt-4">
          <div>
            <h1 className="font-display font-bold text-white text-2xl">
              Panel Admin
            </h1>
            <p className="font-mono text-xs text-elektra-muted">
              Torre Elektra · {reservations.length} reservas
            </p>
          </div>
          <a
            href="/"
            className="font-mono text-xs text-elektra-purple-light hover:text-white transition-colors"
          >
            ← Volver al sitio
          </a>
        </div>

        <div className="bg-elektra-surface border border-elektra-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-elektra-border">
            <h2 className="font-display font-semibold text-white">
              Reservas activas
            </h2>
          </div>

          {reservations.length === 0 ? (
            <div className="p-12 text-center">
              <p className="font-mono text-elektra-muted text-sm">
                No hay reservas aún.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-elektra-border">
              {reservations.map((r) => (
                <div
                  key={r.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-elektra-purple-light">
                        Piso {r.floor}
                      </span>
                      <span className="font-mono text-xs text-elektra-muted">
                        {r.unit_number}
                      </span>
                      <span
                        className={`badge ${
                          r.status === "confirmed"
                            ? "badge-green"
                            : "badge-red"
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>
                    <p className="font-display font-semibold text-white">
                      {r.name}
                    </p>
                    <div className="flex gap-3 mt-0.5">
                      {r.discord && (
                        <p className="font-mono text-xs text-elektra-muted">
                          Discord: {r.discord}
                        </p>
                      )}
                      {r.minecraft_user && (
                        <p className="font-mono text-xs text-elektra-muted">
                          MC: {r.minecraft_user}
                        </p>
                      )}
                    </div>
                    {r.message && (
                      <p className="font-mono text-xs text-elektra-text-dim mt-1 italic">
                        &ldquo;{r.message}&rdquo;
                      </p>
                    )}
                    <p className="font-mono text-[10px] text-elektra-muted mt-1">
                      {new Date(r.created_at).toLocaleString("es-CL")}
                    </p>
                  </div>
                  <button
                    onClick={() => cancelReservation(r.unit_id)}
                    disabled={cancellingId === r.unit_id}
                    className="px-3 py-1.5 rounded border border-red-500/30 text-red-400 hover:bg-red-950/30 transition-all font-mono text-xs disabled:opacity-50"
                  >
                    {cancellingId === r.unit_id
                      ? "Cancelando..."
                      : "Cancelar reserva"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
