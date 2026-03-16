"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-crema/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-heading text-2xl text-marrone">
          M &amp; F
        </Link>

        {/* Desktop nav */}
        <nav className="hidden gap-8 sm:flex">
          <Link
            href="/"
            className="text-xs font-semibold uppercase tracking-widest text-testo hover:text-marrone"
          >
            Home
          </Link>
          <Link
            href="/gallery"
            className="text-xs font-semibold uppercase tracking-widest text-testo hover:text-marrone"
          >
            Gallery
          </Link>
        </nav>

        {/* Hamburger */}
        <button
          className="flex flex-col gap-1.5 sm:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <span
            className={`block h-0.5 w-6 bg-marrone transition-transform ${menuOpen ? "translate-y-2 rotate-45" : ""}`}
          />
          <span
            className={`block h-0.5 w-6 bg-marrone transition-opacity ${menuOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`block h-0.5 w-6 bg-marrone transition-transform ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="flex flex-col items-center gap-4 border-t border-beige pb-4 sm:hidden">
          <Link
            href="/"
            className="text-xs font-semibold uppercase tracking-widest text-testo hover:text-marrone"
            onClick={() => setMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/gallery"
            className="text-xs font-semibold uppercase tracking-widest text-testo hover:text-marrone"
            onClick={() => setMenuOpen(false)}
          >
            Gallery
          </Link>
        </nav>
      )}
    </header>
  );
}
