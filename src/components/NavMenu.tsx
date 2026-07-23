"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";

const MENU_ITEMS = [
  { label: "Start a new specification", href: "/specify" },
  { label: "My Projects", href: "/projects" },
  { label: "Favourites", href: "/favourites" },
];

export default function NavMenu() {
  const { user, status, logOut } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  const isAuthenticated = status === "authenticated";
  const identity = user
    ? user.role === "designer"
      ? `${user.firstName} ${user.lastName}`
      : user.companyName
    : "";

  return (
    <div ref={containerRef} className="relative flex items-center gap-3">
      {identity && <span className="hidden text-sm text-muted sm:inline">{identity}</span>}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 border border-border px-4 py-2 text-sm font-medium text-accent transition-colors hover:border-accent"
      >
        Menu
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-64 border border-border bg-background shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
        >
          {MENU_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block border-b border-border px-4 py-3 text-sm text-muted hover:bg-[#fafafa] hover:text-accent"
            >
              {item.label}
            </Link>
          ))}

          {isAuthenticated && (
            <Link
              href="/account"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block border-b border-border px-4 py-3 text-sm text-muted hover:bg-[#fafafa] hover:text-accent"
            >
              My account
            </Link>
          )}

          {isAuthenticated ? (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                logOut();
              }}
              className="block w-full px-4 py-3 text-left text-sm text-muted hover:bg-[#fafafa] hover:text-accent"
            >
              Log out
            </button>
          ) : (
            <Link
              href="/login"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-sm font-medium text-accent hover:bg-[#fafafa]"
            >
              Log in
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
