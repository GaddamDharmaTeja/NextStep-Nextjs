"use client";

import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { withBasePath } from "@/lib/runtime";
import { Menu, X } from "lucide-react";

type PublicHeaderProps = {
  active?: "home" | "services" | "destinations" | "consultants" | "about" | "contact";
};

function navClass(isActive: boolean) {
  return isActive ? "text-[#121d32]" : "transition-colors hover:text-[#121d32]";
}

const navItems = [
  { key: "home", href: "/", label: "Home" },
  { key: "services", href: "/services", label: "Services" },
  { key: "destinations", href: "/destinations", label: "Destinations" },
  { key: "consultants", href: "/consultants", label: "Consultants" },
  { key: "about", href: "/about", label: "About" },
  { key: "contact", href: "/contact", label: "Contact" },
] as const;

export function PublicHeader({ active }: PublicHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-5 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <img src={withBasePath("/logo.svg")} alt="NextStep Logo" className="h-10 w-10" />
          <span className="truncate font-serif text-[1.75rem] font-bold text-[#121d32] sm:text-2xl">NextStep</span>
        </Link>

        <div className="hidden items-center gap-8 text-base font-medium text-slate-600 md:flex">
          {navItems.map((item) => (
            <Link key={item.key} href={item.href} className={navClass(active === item.key)}>
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/sign-in" className="hidden text-base font-medium text-slate-600 hover:text-[#121d32] sm:block">
            Portal
          </Link>
          <Link href="/contact">
            <Button className="h-12 rounded-md border border-[#121d32] bg-[#e4aa19] px-5 text-base font-semibold text-black shadow-none hover:bg-[#d89e12]">
              Free Assessment
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Link href="/contact">
            <Button className="h-11 rounded-md border border-[#121d32] bg-[#e4aa19] px-4 text-sm font-semibold text-black shadow-none hover:bg-[#d89e12]">
              Assess
            </Button>
          </Link>

          <Button
            variant="outline"
            size="icon"
            className="h-11 w-11 rounded-md border-slate-300 bg-white text-[#121d32] shadow-none hover:bg-slate-50"
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setMobileOpen((value) => !value)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 shadow-sm md:hidden">
          <div className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`flex min-h-12 items-center rounded-lg px-4 text-base font-medium ${
                  active === item.key
                    ? "bg-[#101b31] text-white"
                    : "text-slate-700 hover:bg-slate-100 hover:text-[#121d32]"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="mt-4 grid gap-3 border-t border-slate-200 pt-4">
            <Link href="/sign-in" onClick={() => setMobileOpen(false)}>
              <Button variant="outline" className="h-12 w-full rounded-md border-slate-300 text-base font-semibold text-[#121d32] shadow-none">
                Portal
              </Button>
            </Link>
            <Link href="/contact" onClick={() => setMobileOpen(false)}>
              <Button className="h-12 w-full rounded-md border border-[#121d32] bg-[#e4aa19] text-base font-semibold text-black shadow-none hover:bg-[#d89e12]">
                Free Assessment
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
