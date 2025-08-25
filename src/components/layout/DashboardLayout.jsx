"use client";

import { useState } from "react";
import { Menu, BarChart3, DollarSign, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside
        className={`${
          collapsed ? "w-16" : "w-64"
        } bg-white dark:bg-gray-800 shadow-md flex flex-col transition-all`}
      >
        <div className="flex items-center justify-between p-4">
          <h1
            className={`text-xl font-bold text-gray-800 dark:text-gray-100 transition-all ${
              collapsed ? "hidden" : "block"
            }`}
          >
            Finance Tracker
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex flex-col gap-2 p-2">
          <Button variant="ghost" className="justify-start">
            <BarChart3 className="h-5 w-5 mr-2" />
            {!collapsed && "Dashboard"}
          </Button>
          <Button variant="ghost" className="justify-start">
            <DollarSign className="h-5 w-5 mr-2" />
            {!collapsed && "Transactions"}
          </Button>
          <Button variant="ghost" className="justify-start">
            <Settings className="h-5 w-5 mr-2" />
            {!collapsed && "Settings"}
          </Button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white dark:bg-gray-800 shadow-sm p-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Dashboard
          </h2>
          <Button variant="outline">Log out</Button>
        </header>

        {/* Content */}
        <div className="p-6 grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {children}
        </div>
      </main>
    </div>
  );
}
