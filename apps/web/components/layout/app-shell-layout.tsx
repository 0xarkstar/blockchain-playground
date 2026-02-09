"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Sun,
  Moon,
  Languages,
  Home,
  Box,
  Coins,
  Code,
  Diamond,
  Lock,
  Menu,
  Search,
  ShieldCheck,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "../ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Link } from "../../i18n/navigation";
import { CommandPalette } from "./command-palette";

const trackNavItems = [
  { key: "home", href: "/", icon: Home },
  { key: "fundamentals", href: "/fundamentals", icon: Box },
  { key: "defi", href: "/defi", icon: Coins },
  { key: "solidity", href: "/solidity", icon: Code },
  { key: "tokens", href: "/tokens", icon: Diamond },
  { key: "zk", href: "/zk", icon: Lock },
  { key: "appliedZk", href: "/applied-zk", icon: ShieldCheck },
] as const;

export function AppShellLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const t = useTranslations("nav");
  const pathname = usePathname();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCmdOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const pathWithoutLocale = pathname.replace(/^\/(en|ko)/, "") || "/";

  const navContent = (
    <nav className="flex flex-col gap-1">
      {trackNavItems.map((item) => {
        const isActive =
          item.href === "/"
            ? pathWithoutLocale === "/"
            : pathWithoutLocale.startsWith(item.href);
        return (
          <Link
            key={item.key}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <item.icon className="h-4 w-4" />
            {t(item.key)}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden sm:flex w-[250px] flex-col border-r border-border bg-sidebar">
        <div className="flex h-14 items-center border-b border-border px-4">
          <Link href="/" className="text-lg font-bold no-underline text-foreground">
            Blockchain Playground
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          {navContent}
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-14 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-2">
            {/* Mobile hamburger */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="sm:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[250px] p-0">
                <SheetTitle className="px-4 pt-4 text-lg font-bold">
                  Blockchain Playground
                </SheetTitle>
                <div className="p-3">{navContent}</div>
              </SheetContent>
            </Sheet>
            <Link href="/" className="text-lg font-bold no-underline text-foreground sm:hidden">
              Blockchain Playground
            </Link>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCmdOpen(true)}
              aria-label="Search demos"
            >
              <Search className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle color scheme"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Change language">
                  <Languages className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <a href={`/en${pathWithoutLocale}`} className="text-sm">English</a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href={`/ko${pathWithoutLocale}`} className="text-sm">한국어</a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4">{children}</main>
      </div>

      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
    </div>
  );
}
