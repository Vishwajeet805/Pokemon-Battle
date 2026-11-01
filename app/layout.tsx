import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Pokémon Battle | Build Your Team. Own the Arena.", description: "Collect Pokémon cards, build your six-Pokémon squad and battle in a 3D arena." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
