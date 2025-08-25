"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { authStorage } from "@/lib/utils";

export default function SettingsPage() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("theme", next);
  }

  return (
    <DashboardLayout>
      <div className="md:col-span-2 xl:col-span-2 space-y-6">
        <Card>
          <CardHeader><CardTitle>Appearance</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Theme</div>
                <div className="text-sm text-muted-foreground">Switch between light and dark.</div>
              </div>
              <Button onClick={toggleTheme}>Use {theme === "dark" ? "Light" : "Dark"} Theme</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Account</CardTitle></CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={() => { authStorage.clearToken(); window.location.href = "/login"; }}>Sign out</Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}


