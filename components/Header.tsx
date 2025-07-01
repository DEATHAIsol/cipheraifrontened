"use client";
import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [socialsOpen, setSocialsOpen] = useState(false);

  return (
    <header className="w-full bg-white px-8 py-3 flex items-center justify-between shadow-sm">
      {/* Left: Logo and Brand */}
      <div className="flex items-center gap-2 min-w-[140px]">
        {/* Placeholder for logo, replace with your SVG or Image if needed */}
        <div className="w-7 h-7 bg-[#9e4244] rounded-md flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect width="20" height="20" rx="4" fill="#fff"/><rect x="4" y="4" width="12" height="12" rx="2" fill="#9e4244"/></svg>
        </div>
        <span className="text-2xl font-bold tracking-tight text-[#9e4244]">Cipher</span>
      </div>

      {/* Right: Navigation */}
      <nav className="flex items-center gap-8 text-lg">
        <Link href="/" className="font-bold text-[#232021]">Home</Link>
        <Link href="/tools" className="text-[#5c7c7d] hover:text-[#232021]">Our Tools</Link>
        <div className="relative">
          <button
            onClick={() => setSocialsOpen((v) => !v)}
            className="text-[#5c7c7d] hover:text-[#232021] flex items-center gap-1 focus:outline-none"
          >
            Socials
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" /></svg>
          </button>
          {socialsOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-[#e9e4da] rounded-lg shadow-lg z-50">
              <a href="https://x.com/" target="_blank" rel="noopener noreferrer" className="block px-4 py-2 hover:bg-[#f5f0e6]">X (Twitter)</a>
              <a href="https://discord.com/" target="_blank" rel="noopener noreferrer" className="block px-4 py-2 hover:bg-[#f5f0e6]">Discord</a>
              <a href="https://dexscreener.com/" target="_blank" rel="noopener noreferrer" className="block px-4 py-2 hover:bg-[#f5f0e6]">Dexscreener</a>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
} 