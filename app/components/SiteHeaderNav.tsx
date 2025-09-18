"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/players", label: "Players" },
  { href: "/teams", label: "Teams" },
  { href: "/leagues", label: "Leagues" },
  { href: "/seasons", label: "Seasons" },
  { href: "/games", label: "Games" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const firstLinkRef = useRef<HTMLAnchorElement | null>(null);

  // Lock scroll when menu is open
  useEffect(() => {
    const { body } = document;
    if (open) {
      const prev = body.style.overflow;
      body.style.overflow = "hidden";
      // focus first link after open anim
      const id = window.setTimeout(() => firstLinkRef.current?.focus(), 150);
      return () => {
        body.style.overflow = prev;
        window.clearTimeout(id);
      };
    }
  }, [open]);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Click outside panel to close
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!panelRef.current) return;
      const target = e.target as Node;
      if (panelRef.current && !panelRef.current.contains(target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <header className="border-b bg-white">
      <div className="mx-auto max-w-6xl p-4 flex items-center justify-between">
        <Link href="/" className="font-semibold">Crok America</Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-4 text-sm">
          {NAV_ITEMS.map(item => (
            <Link key={item.href} href={item.href} className="hover:text-black/80">
              {item.label}
            </Link>
          ))}
          {/* Keep your existing user menu on desktop */}
          <span className="inline-flex">
            {/* This stays as-is from your project */}
            {/* <UserMenu /> */}
          </span>
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label="Open navigation menu"
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="md:hidden inline-flex items-center justify-center rounded-lg p-2 hover:bg-black/5"
          onClick={() => setOpen(true)}
        >
          <HamburgerIcon />
        </button>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          id="mobile-nav"
          aria-modal="true"
          role="dialog"
          className="fixed inset-0 z-50"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 opacity-100 transition-opacity" />

          {/* Panel */}
          <div
            ref={panelRef}
            className="absolute inset-y-0 right-0 w-[80%] max-w-sm bg-white shadow-xl p-6 flex flex-col gap-6 translate-x-0 animate-[slideIn_.2s_ease]"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">Menu</span>
              <button
                type="button"
                aria-label="Close navigation menu"
                className="rounded-lg p-2 hover:bg-black/5"
                onClick={() => setOpen(false)}
              >
                <CloseIcon />
              </button>
            </div>

            <nav className="flex flex-col text-base">
              {NAV_ITEMS.map((item, idx) => (
                <Link
                  key={item.href}
                  ref={idx === 0 ? firstLinkRef : undefined}
                  href={item.href}
                  className="rounded-lg px-3 py-3 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-black/20"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              {/* Optional: user actions in mobile panel */}
              <div className="mt-4 border-t pt-4">
                {/* <UserMenu /> */}
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

function HamburgerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 6l12 12M18 6l-12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
