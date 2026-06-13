import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Torre Elektra — Reservas",
  description:
    "Sistema de reserva de departamentos y oficinas en la Torre Elektra, Minecraft.",
  openGraph: {
    title: "Torre Elektra",
    description: "36 pisos. 35 unidades. Tu espacio en el skyline.",
    siteName: "Torre Elektra",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
