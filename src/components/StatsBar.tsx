"use client";

interface Props {
  stats: Record<string, number>;
  loading: boolean;
}

export default function StatsBar({ stats, loading }: Props) {
  const items = [
    {
      label: "Disponibles",
      value: stats.disponibles,
      color: "text-elektra-green",
      dot: "bg-elektra-green",
    },
    {
      label: "Reservados",
      value: stats.reservados,
      color: "text-elektra-red",
      dot: "bg-elektra-red",
    },
    {
      label: "Departamentos",
      value: stats.departamentos,
      color: "text-elektra-purple-light",
      dot: "bg-elektra-purple",
    },
    {
      label: "Oficinas",
      value: stats.oficinas,
      color: "text-elektra-gold",
      dot: "bg-elektra-gold",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-elektra-surface border border-elektra-border rounded-lg p-4 flex items-center gap-3"
        >
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.dot}`} />
          <div>
            <p
              className={`font-display font-bold text-2xl leading-none ${item.color}`}
            >
              {loading ? (
                <span className="inline-block w-6 h-5 bg-elektra-border rounded animate-pulse" />
              ) : (
                item.value ?? 0
              )}
            </p>
            <p className="font-mono text-[10px] text-elektra-muted mt-0.5">
              {item.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
