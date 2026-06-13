"use client";

import { useEffect, useState } from "react";
import ReserveModal from "@/components/ReserveModal";
import StatsBar from "@/components/StatsBar";
import TowerView from "@/components/TowerView";

export interface Unit {
  id: number;
  floor: number;
  unit_number: string;
  type: string;
  status: string;
  size_blocks: number;
  reserved_by_name: string | null;
  reserved_by_discord: string | null;
  reserved_by_minecraft: string | null;
  reserved_at: string | null;
  notes: string | null;
}

export default function Home() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"tower" | "list">("tower");

  const fetchData = async () => {
    try {
      const [unitsRes, statsRes] = await Promise.all([
        fetch("/api/floors"),
        fetch("/api/floors?stats=1"),
      ]);
      const unitsData = await unitsRes.json();
      const statsData = await statsRes.json();
      setUnits(unitsData.units || []);
      setStats(statsData.stats || {});
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUnitClick = (unit: Unit) => {
    if (unit.status === "disponible") {
      setSelectedUnit(unit);
    }
  };

  const handleReserved = () => {
    setSelectedUnit(null);
    fetchData();
  };

  return (
    <main className="min-h-screen bg-elektra-black bg-grid">
      {/* Header */}
      <header className="border-b border-elektra-border bg-elektra-dark/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-elektra-purple to-purple-900 rounded flex items-center justify-center glow-purple">
              <span className="text-white font-mono font-bold text-xs">E</span>
            </div>
            <div>
              <h1 className="font-display font-bold text-white text-lg leading-none">
                Torre Elektra
              </h1>
              <p className="font-mono text-xs text-elektra-muted leading-none mt-0.5">
                36 pisos · Minecraft
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setView("tower")}
              className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-all ${
                view === "tower"
                  ? "bg-elektra-purple text-white"
                  : "text-elektra-muted hover:text-white border border-elektra-border"
              }`}
            >
              🏢 Torre
            </button>
            <button
              onClick={() => setView("list")}
              className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-all ${
                view === "list"
                  ? "bg-elektra-purple text-white"
                  : "text-elektra-muted hover:text-white border border-elektra-border"
              }`}
            >
              ☰ Lista
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-12 pb-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-elektra-purple/30 bg-elektra-purple/10 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-elektra-green animate-pulse" />
            <span className="font-mono text-xs text-elektra-purple-light">
              En construcción
            </span>
          </div>
          <h2 className="font-display font-bold text-4xl md:text-5xl text-white mb-3 leading-tight">
            Tu espacio en el
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-elektra-purple-light to-elektra-gold">
              {" "}
              skyline
            </span>
          </h2>
          <p className="text-elektra-text-dim text-base max-w-xl mx-auto">
            36 pisos · 33×33 bloques · Departamentos y oficinas disponibles.
            Selecciona un piso para ver detalles y reservar.
          </p>
        </div>

        {/* Stats */}
        <StatsBar stats={stats} loading={loading} />
      </section>

      {/* Main content */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-elektra-purple border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="font-mono text-xs text-elektra-muted">
                Cargando torre...
              </p>
            </div>
          </div>
        ) : view === "tower" ? (
          <TowerView units={units} onUnitClick={handleUnitClick} />
        ) : (
          <ListView units={units} onUnitClick={handleUnitClick} />
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-elektra-border py-6 text-center">
        <p className="font-mono text-xs text-elektra-muted">
          Torre Elektra · PixelPlay Network ·{" "}
          <span className="text-elektra-purple-light">
            33×33 bloques por piso
          </span>
        </p>
      </footer>

      {/* Reserve Modal */}
      {selectedUnit && (
        <ReserveModal
          unit={selectedUnit}
          onClose={() => setSelectedUnit(null)}
          onReserved={handleReserved}
        />
      )}
    </main>
  );
}

function ListView({
  units,
  onUnitClick,
}: {
  units: Unit[];
  onUnitClick: (u: Unit) => void;
}) {
  const filtered = units.filter((u) => u.type !== "recepcion");

  return (
    <div className="space-y-2">
      {filtered.map((unit) => (
        <div
          key={unit.id}
          onClick={() => onUnitClick(unit)}
          className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
            unit.status === "disponible"
              ? "border-elektra-border bg-elektra-surface hover:border-elektra-purple cursor-pointer"
              : "border-elektra-border bg-elektra-surface/50 cursor-not-allowed opacity-70"
          }`}
        >
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs text-elektra-muted w-16">
              Piso {unit.floor}
            </span>
            <span className="font-display font-semibold text-white text-sm">
              {unit.unit_number}
            </span>
            <span className="badge badge-purple">
              {unit.type === "departamento" ? "Depa" : "Oficina"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {unit.reserved_by_name && (
              <span className="font-mono text-xs text-elektra-muted hidden md:block">
                {unit.reserved_by_name}
              </span>
            )}
            <span
              className={`badge ${
                unit.status === "disponible"
                  ? "badge-green"
                  : unit.status === "reservado"
                  ? "badge-red"
                  : "badge-gold"
              }`}
            >
              {unit.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
