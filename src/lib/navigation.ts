import { CircleHelp, History, LayoutDashboard } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  kind: "section" | "page";
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Beranda",
    items: [
      { label: "Ringkasan", href: "/#ringkasan", icon: LayoutDashboard, kind: "section" },
      { label: "Pengajuan Terbaru", href: "/#terbaru", icon: History, kind: "section" },
      { label: "Panduan", href: "/#panduan", icon: CircleHelp, kind: "section" },
    ],
  },
];