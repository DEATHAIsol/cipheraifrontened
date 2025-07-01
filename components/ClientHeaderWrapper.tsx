"use client";
import { usePathname } from "next/navigation";
import Header from "./Header";

export default function ClientHeaderWrapper() {
  const pathname = usePathname();
  if (pathname?.startsWith("/chat")) return null;
  return <Header />;
} 