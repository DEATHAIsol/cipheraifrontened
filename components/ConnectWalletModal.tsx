"use client";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function ConnectWalletModal() {
  const searchParams = useSearchParams();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (searchParams?.get("connectWallet") === "1") {
      setShow(true);
    }
  }, [searchParams]);

  if (!show) return null;

  return (
    <div className="fixed top-6 left-1/2 z-50 -translate-x-1/2 bg-white border border-[#d1c7b9] shadow-lg rounded-xl px-6 py-4 flex items-center gap-3">
      <span className="text-[#9e4244] font-bold text-lg">Please connect wallet</span>
      <button onClick={() => setShow(false)} className="ml-4 px-2 py-1 rounded bg-[#f5f0e6] hover:bg-[#e9e4da] text-[#3a3238] font-medium">Dismiss</button>
    </div>
  );
} 