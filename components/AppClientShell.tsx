"use client";
import ClientHeaderWrapper from "./ClientHeaderWrapper";
import CursorTrails from "./CursorTrails";

export default function AppClientShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ClientHeaderWrapper />
      <CursorTrails />
      {children}
    </>
  );
} 