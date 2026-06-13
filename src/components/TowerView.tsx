"use client";

import { Unit } from "@/app/page";
import { useState } from "react";

interface Props {
  units: Unit[];
  onUnitClick: (unit: Unit) => void;
}

export default function TowerView({ units, onUnitClick }: Props) {
  const [hoveredFloor, setHoveredFloor] = useState<number | null>(null);

  // Group by floor, sorted descending (top of tower first)
  const floors = Array.from({ length: 36 }, (_, i) => 36 - i).map((f) => ({
    floor: f,
    unit: units.find((u) => u.floor === f),
  }));

  const getFloorColor = (unit: Unit | undefined) => {
    if (!unit) return "bg-elektra-surface border-elektra-border";
    if (unit.type === "recepcion")
      return "bg-gradient-to-r from-elektra-gold/20 to-amber-900/20 border-elektra-gold/40";
    if (unit.floor === 36)
      return unit.status === "disponible"
        ? "bg-gradient-to-r from-purple-900/40 to-elektra-purple/20 border-elektra-purple/50"
        : "bg-gradient-to-r from-red-900/30 to-red-950/20 border-red-500/40";
    if (unit.status === "disponible")
      return "bg-gradient-to-r from-elektra-surface to-slate-900/80 border-elektra-border hover:border-elektra-purple/60";
    if (unit.status === "reservado")
      return "bg-gradient-to-r from-red-950/50 to-elektra-surface border-red-500/30";
    return "bg-gradient-to-r from-emerald-950/50 to-elektra-surface border-emerald-500/30";
  };

  const getWindowColor = (unit: Unit | undefined) => {
    if (!unit) return "bg-slate-700";
    if (unit.status === "disponible") return "bg-blue-400/60";
    if (unit.status === "reservado") return "bg-red-400/60";
    if (unit.status === "ocupado") return "bg-emerald-400/60";
    return "bg-amber-400/60";
  };

  return (
    <div className="flex gap-6">
      {/* Tower facade */}
      <div className="flex-1">
        <div className="relative">
          {/* Tower top decoration */}
          <div className="flex justify-center mb-1">
            <div className="w-4 h-8 bg-gradient-to-b from-elektra-purple to-transparent rounded-t-sm relative">
              <div className="absolute inset-x-0 top-0 h-2 bg-elektra-purple-light rounded-t-sm animate-pulse-slow" />
            </div>
          </div>

          {/* Floors */}
          <div className="border border-elektra-border/50 rounded-lg overflow-hidden">
            {floors.map(({ floor, unit }, idx) => {
              const isHovered = hoveredFloor === floor;
              const isRecepcion = unit?.type === "recepcion";
              const isPenthouse = floor === 36;
              const height = isRecepcion
                ? "h-10"
                : isPenthouse
                ? "h-8"
                : "h-6";

              return (
                <div
                  key={floor}
                  className={`flex items-center border-b border-elektra-border/30 last:border-0 transition-all duration-150 ${height} ${getFloorColor(unit)} ${
                    unit?.status === "disponible"
                      ? "cursor-pointer"
                      : "cursor-default"
                  }`}
                  style={{ animationDelay: `${idx * 20}ms` }}
                  onMouseEnter={() => setHoveredFloor(floor)}
                  onMouseLeave={() => setHoveredFloor(null)}
                  onClick={() => unit && onUnitClick(unit)}
                >
                  {/* Floor number */}
                  <div className="w-10 flex-shrink-0 flex items-center justify-end pr-2">
                    <span
                      className={`font-mono text-[10px] ${
                        isHovered ? "text-white" : "text-elektra-muted"
                      }`}
                    >
                      {floor}
                    </span>
                  </div>

                  {/* Window grid */}
                  <div className="flex-1 flex items-center gap-0.5 px-2">
                    {isRecepcion ? (
                      <div className="flex items-center gap-2 w-full">
                        <div className="flex-1 h-4 bg-amber-500/20 border border-amber-500/30 rounded-sm flex items-center justify-center">
                          <span className="font-mono text-[9px] text-amber-400 font-bold">
                            RECEPCIÓN
                          </span>
                        </div>
                      </div>
                    ) : isPenthouse ? (
                      <div className="flex gap-0.5 w-full">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <div
                            key={i}
                            className={`h-3 flex-1 rounded-sm ${getWindowColor(unit)} transition-all ${isHovered ? "opacity-100" : "opacity-70"}`}
                          />
                        ))}
                        <span className="ml-2 font-mono text-[9px] text-elektra-purple-light whitespace-nowrap">
                          PH
                        </span>
                      </div>
                    ) : (
                      <div className="flex gap-0.5 w-full">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div
                            key={i}
                            className={`h-2.5 flex-1 rounded-sm ${getWindowColor(unit)} transition-all ${isHovered ? "opacity-90" : "opacity-50"}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Status indicator */}
                  <div className="w-24 flex-shrink-0 flex items-center justify-end pr-3 gap-2">
                    {isHovered && unit && unit.type !== "recepcion" && (
                      <span className="font-display text-[10px] text-white hidden sm:block truncate max-w-16">
                        {unit.status === "disponible"
                          ? "Reservar →"
                          : unit.reserved_by_name || "Reservado"}
                      </span>
                    )}
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        !unit
                          ? "bg-gray-600"
                          : unit.status === "disponible"
                          ? "bg-elektra-green animate-pulse-slow"
                          : unit.status === "reservado"
                          ? "bg-elektra-red"
                          : "bg-elektra-gold"
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Ground */}
          <div className="h-3 bg-gradient-to-b from-elektra-border to-transparent rounded-b-lg" />
        </div>
      </div>

      {/* Legend + detail panel */}
      <div className="w-56 flex-shrink-0 space-y-4">
        {/* Legend */}
        <div className="bg-elektra-surface border border-elektra-border rounded-lg p-4">
          <p className="font-display font-semibold text-xs text-elektra-text-dim uppercase tracking-wider mb-3">
            Leyenda
          </p>
          <div className="space-y-2">
            {[
              {
                dot: "bg-elektra-green",
                label: "Disponible",
                sub: "Clic para reservar",
              },
              {
                dot: "bg-elektra-red",
                label: "Reservado",
                sub: "No disponible",
              },
              {
                dot: "bg-elektra-gold",
                label: "Ocupado",
                sub: "Propietario activo",
              },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${item.dot} mt-0.5 flex-shrink-0`}
                />
                <div>
                  <p className="font-mono text-xs text-white">{item.label}</p>
                  <p className="font-mono text-[10px] text-elektra-muted">
                    {item.sub}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hover floor detail */}
        {hoveredFloor && (
          <div className="bg-elektra-surface border border-elektra-purple/30 rounded-lg p-4 glow-purple">
            {(() => {
              const unit = units.find((u) => u.floor === hoveredFloor);
              if (!unit)
                return (
                  <p className="font-mono text-xs text-elektra-muted">
                    Piso {hoveredFloor}
                  </p>
                );
              return (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-display font-bold text-white text-sm">
                      Piso {unit.floor}
                    </span>
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
                  <p className="font-mono text-[10px] text-elektra-muted mb-1 capitalize">
                    {unit.type}
                  </p>
                  <p className="font-mono text-[10px] text-elektra-text-dim">
                    33×33 bloques
                  </p>
                  {unit.reserved_by_name && (
                    <p className="font-mono text-[10px] text-elektra-purple-light mt-2">
                      {unit.reserved_by_name}
                    </p>
                  )}
                  {unit.notes && (
                    <p className="font-mono text-[10px] text-elektra-muted mt-1 italic">
                      {unit.notes}
                    </p>
                  )}
                  {unit.status === "disponible" && (
                    <p className="font-mono text-[10px] text-elektra-green mt-2">
                      ↑ Clic para reservar
                    </p>
                  )}
                </>
              );
            })()}
          </div>
        )}

        {/* Info card */}
        <div className="bg-elektra-surface border border-elektra-border rounded-lg p-4">
          <p className="font-display font-semibold text-xs text-elektra-text-dim uppercase tracking-wider mb-2">
            Especificaciones
          </p>
          <div className="space-y-1.5">
            {[
              ["Pisos", "36"],
              ["Dimensiones", "33×33 bloques"],
              ["Área", "~1.089 m²"],
              ["Altura", "3 bloques"],
              ["Red", "PixelPlay"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="font-mono text-[10px] text-elektra-muted">
                  {k}
                </span>
                <span className="font-mono text-[10px] text-white">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
