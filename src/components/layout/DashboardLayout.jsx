"use client";

import { useEffect, useMemo, useState } from "react";
import { Menu, BarChart3, DollarSign, Settings, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authStorage } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  const pathname = usePathname();

  const title = useMemo(() => {
    if (pathname.startsWith("/transactions")) return "Transactions";
    if (pathname.startsWith("/settings")) return "Settings";
    if (pathname.startsWith("/analysis")) return "Analysis";
    return "Dashboard";
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`${
          collapsed ? "w-16" : "w-64"
        } bg-primary text-primary-foreground shadow-md flex flex-col transition-all`}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          <h1
            className={`text-xl font-bold transition-all ${
              collapsed ? "hidden" : "block"
            }`}
          >
            Finance Tracker
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="text-primary-foreground hover:bg-white/10"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex flex-col gap-2 p-2">
          <Button asChild variant="ghost" className={`justify-start text-primary-foreground/90 hover:text-white hover:bg-white/10 ${pathname === "/" ? "bg-white/20 text-white" : ""}`}>
            <Link href="/">
              <BarChart3 className="h-5 w-5 mr-2" />
              {!collapsed && "Dashboard"}
            </Link>
          </Button>
          <Button asChild variant="ghost" className={`justify-start text-primary-foreground/90 hover:text-white hover:bg-white/10 ${pathname.startsWith("/transactions") ? "bg-white/20 text-white" : ""}`}>
            <Link href="/transactions">
              <DollarSign className="h-5 w-5 mr-2" />
              {!collapsed && "Transactions"}
            </Link>
          </Button>
          <Button asChild variant="ghost" className={`justify-start text-primary-foreground/90 hover:text-white hover:bg-white/10 ${pathname.startsWith("/analysis") ? "bg-white/20 text-white" : ""}`}>
            <Link href="/analysis">
              <BarChart3 className="h-5 w-5 mr-2" />
              {!collapsed && "Analysis"}
            </Link>
          </Button>
          <Button asChild variant="ghost" className={`justify-start text-primary-foreground/90 hover:text-white hover:bg-white/10 ${pathname.startsWith("/settings") ? "bg-white/20 text-white" : ""}`}>
            <Link href="/settings">
              <Settings className="h-5 w-5 mr-2" />
              {!collapsed && "Settings"}
            </Link>
          </Button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-card shadow-sm p-4 flex justify-between items-center border-b border-primary/20">
          <h2 className="text-lg font-semibold text-primary">
            {title}
          </h2>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="outline" onClick={() => { authStorage.clearToken(); window.location.href = "/login"; }}>Log out</Button>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {children}
        </div>
      </main>
    </div>
  );
}
