"use client";
import Link from 'next/link';
import { useState } from 'react';
import { useWallet } from "@solana/wallet-adapter-react";

export default function Header() {
  const [socialsOpen, setSocialsOpen] = useState(false);
  const [showConnectWarning, setShowConnectWarning] = useState(false);
  const { connected } = useWallet();

  return (
    <header className="w-full bg-white/80 backdrop-blur-md shadow-sm rounded-b-xl px-4 py-2 flex items-center justify-between z-50 sticky top-0 relative">
      {/* Left: Brand name */}
      <div className="flex items-center min-w-[140px]">
        <span className="text-2xl font-bold tracking-tight text-[#232021]">Cipher AI</span>
      </div>

      {/* Center: Navigation (absolutely centered) */}
      <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-16 font-bold text-[#232021] text-lg">
        <Link href="/" className="px-8 py-1 rounded hover:underline hover:decoration-2 hover:decoration-[#9e4244] transition-colors">Home</Link>
        <Link href="/tools" className="px-8 py-1 rounded hover:underline hover:decoration-2 hover:decoration-[#9e4244] transition-colors">Our Tools</Link>
        <div className="relative">
          <button
            onClick={() => setSocialsOpen((v) => !v)}
            className="px-8 py-1 rounded hover:underline hover:decoration-2 hover:decoration-[#9e4244] transition-colors flex items-center gap-1 focus:outline-none"
          >
            Socials
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" /></svg>
          </button>
          {socialsOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-[#e9e4da] rounded-lg shadow-lg z-50">
              <a href="https://x.com/" target="_blank" rel="noopener noreferrer" className="block px-4 py-2 hover:bg-[#f5f0e6]">Twitter/X</a>
              <a href="https://wwww.discord.com/" target="_blank" rel="noopener noreferrer" className="block px-4 py-2 hover:bg-[#f5f0e6]">Discord</a>
              <a href="https://wwww.dexscreener.com/" target="_blank" rel="noopener noreferrer" className="block px-4 py-2 hover:bg-[#f5f0e6]">Dexscreener</a>
            </div>
          )}
        </div>
      </nav>

      {/* Connect Wallet Warning Modal */}
      {showConnectWarning && (
        <div className="fixed top-6 left-1/2 z-50 -translate-x-1/2 bg-white border border-[#d1c7b9] shadow-lg rounded-xl px-6 py-4 flex items-center gap-3">
          <span className="text-[#9e4244] font-bold text-lg">Please connect wallet</span>
          <button onClick={() => setShowConnectWarning(false)} className="ml-4 px-2 py-1 rounded bg-[#f5f0e6] hover:bg-[#e9e4da] text-[#3a3238] font-medium">Dismiss</button>
        </div>
      )}
    </header>
  );
} 