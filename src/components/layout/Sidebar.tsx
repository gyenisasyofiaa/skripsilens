"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { GraduationCap, Menu, X } from "lucide-react";
import { NAV_GROUPS, type NavItem } from "@/lib/navigation";

const DEFAULT_SECTION = "/#ringkasan";

function isItemActive(item: NavItem, pathname: string, activeSection: string) {
  if (item.kind === "page") {
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  }
  return pathname === "/" && item.href === activeSection;
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex size-9 items-center justify-center rounded-lg bg-brand text-white">
        <GraduationCap className="size-5" aria-hidden="true" />
      </span>
      <div className="flex flex-col leading-tight">
        <span className="text-[15px] font-bold text-neutral-900">JudulAI</span>
        <span className="text-xs text-neutral-600">Asisten Kaprodi</span>
      </div>
    </div>
  );
}

type NavLinksProps = {
  pathname: string;
  activeSection: string;
  onNavigate: (item: NavItem) => void; // DIUBAH: menerima item, bukan href
};

function NavLinks({ pathname, activeSection, onNavigate }: NavLinksProps) {
  return (
    <nav aria-label="Navigasi utama" className="flex flex-col gap-5">
      {NAV_GROUPS.map((group) => (
        <div key={group.title} className="flex flex-col gap-1">
          <span className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-600">
            {group.title}
          </span>
          {group.items.map((item) => {
            const active = isItemActive(item, pathname, activeSection);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onNavigate(item)} // DIUBAH: kirim item
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 items-center gap-2.5 rounded-lg px-3 text-sm transition-colors ${
                  active
                    ? "bg-neutral-100 font-semibold text-neutral-900"
                    : "font-medium text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
                }`}
              >
                <Icon className="size-[18px] shrink-0" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function UserCard() {
  return (
    <div className="mt-auto flex items-center gap-2.5 rounded-xl border border-neutral-200 p-3">
      <span className="flex size-8 items-center justify-center rounded-full bg-neutral-100 text-sm font-semibold text-neutral-700">
        K
      </span>
      <div className="flex min-w-0 flex-col">
        <span className="text-[13px] font-semibold text-neutral-900">Kaprodi</span>
        <span className="text-xs text-neutral-600">Ketua Program Studi</span>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(DEFAULT_SECTION);

  // DIUBAH: hanya menu section yang dicatat sebagai activeSection
  function handleNavigate(item: NavItem) {
    if (item.kind === "section") setActiveSection(item.href);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;

    const desktop = window.matchMedia("(min-width: 64rem)");

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    function handleScreenChange() {
      if (desktop.matches) setOpen(false);
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    desktop.addEventListener("change", handleScreenChange);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
      desktop.removeEventListener("change", handleScreenChange);
    };
  }, [open]);

  return (
    <MotionConfig reducedMotion="user">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col gap-7 overflow-y-auto border-r border-neutral-200 bg-white px-4 py-6 lg:flex">
        <div className="px-2">
          <Brand />
        </div>
        <NavLinks pathname={pathname} activeSection={activeSection} onNavigate={handleNavigate} />
        <UserCard />
      </aside>

      <header className="sticky top-0 z-30 flex h-15 items-center justify-between border-b border-neutral-200 bg-white px-4 lg:hidden">
        <Brand />
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Buka menu"
          aria-expanded={open}
          aria-controls="mobile-drawer"
          className="flex size-11 items-center justify-center rounded-lg text-neutral-900 hover:bg-neutral-100"
        >
          <Menu className="size-[22px]" aria-hidden="true" />
        </button>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            key="overlay"
            aria-hidden="true"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-neutral-900/40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
        {open && (
          <motion.aside
            key="drawer"
            id="mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Menu navigasi"
            className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col gap-6 overflow-y-auto bg-white px-4 pt-3 pb-6 shadow-xl lg:hidden"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
          >
            <div className="flex h-12 items-center justify-between">
              <Brand />
              <button
                type="button"
                autoFocus
                onClick={() => setOpen(false)}
                aria-label="Tutup menu"
                className="flex size-11 items-center justify-center rounded-lg text-neutral-900 hover:bg-neutral-100"
              >
                <X className="size-[22px]" aria-hidden="true" />
              </button>
            </div>
            <NavLinks pathname={pathname} activeSection={activeSection} onNavigate={handleNavigate} />
            <UserCard />
          </motion.aside>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}