"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";
import { authStorage, formatCurrency, monthNumberToShortName } from "@/lib/utils";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Legend } from "recharts";
import { Sparkles, Loader2 } from "lucide-react";
import React from "react";

export default function AnalysisPage() {
  const [token, setToken] = useState(null);
  const [insights, setInsights] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [daily, setDaily] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState(null);

  useEffect(() => {
    const t = authStorage.getToken();
    if (!t) {
      window.location.href = "/login";
      return;
    }
    setToken(t);
  }, []);

  useEffect(() => {
    if (!token) return;
    async function load() {
      try {
        // simple cache in localStorage for AI insights (15 minutes)
        const cacheKey = "ai_insights_cache";
        const cached = typeof window !== "undefined" ? localStorage.getItem(cacheKey) : null;
        if (cached) {
          const parsed = JSON.parse(cached);
          setInsights(parsed.data);
          setUpdatedAt(parsed.time);
        }

        const ai = await apiFetch("/reports/ai-insights", token);
        setInsights(ai);
        setUpdatedAt(new Date().toISOString());
        try { localStorage.setItem(cacheKey, JSON.stringify({ time: new Date().toISOString(), data: ai })); } catch {}
        const m = await apiFetch("/reports/monthly", token);
        const mapped = (m || []).map((x) => ({ month: monthNumberToShortName(x._id), income: x.income || 0, expense: x.expense || 0 }));
        setMonthly(mapped);
        // Build daily chart from transactions if available
        try {
          const tx = await apiFetch("/transactions", token);
          const byDay = new Map();
          for (const t of tx || []) {
            const d = new Date(t.date || t.createdAt);
            const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            if (!byDay.has(key)) byDay.set(key, { day: d.getDate(), income: 0, expense: 0 });
            if (t.type === "income") byDay.get(key).income += Number(t.amount || 0);
            else byDay.get(key).expense += Number(t.amount || 0);
          }
          const arr = Array.from(byDay.values()).sort((a, b) => a.day - b.day);
          setDaily(arr);
        } catch {}
      } catch (e) {
        setError(e?.message || "Failed to load analysis");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  const current = insights?.financialData?.currentMonth;

  return (
    <DashboardLayout>
      <div className="md:col-span-2 xl:col-span-2">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle>Current Month Overview{current ? ` — ${monthNumberToShortName(current.month)} ${current.year}` : ""}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <SkeletonRows />
            ) : error ? (
              <p className="text-sm text-red-500">{error}</p>
            ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthly}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="income" fill="#3b82f6" />
                    <Bar dataKey="expense" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={daily}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="income" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            )}
            {current && (
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <MiniStat label="Income" value={formatCurrency(current.income)} />
                <MiniStat label="Expenses" value={formatCurrency(current.expenses)} />
                <MiniStat label="Balance" value={formatCurrency(current.balance)} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-2 xl:col-span-2">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> AI Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-2 text-xs text-muted-foreground">{updatedAt ? `Last updated ${new Date(updatedAt).toLocaleString()}` : null}</div>
            <AiMarkdown content={insights?.aiInsights} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-md border p-4 bg-background/40">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="w-full h-[300px] rounded-md bg-muted/60 border flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
      <div className="w-full h-[300px] rounded-md bg-muted/60 border flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    </div>
  );
}

function AiMarkdown({ content }) {
  if (!content) return <p className="text-sm text-muted-foreground">No AI insight available for this month yet.</p>;
  // minimal markdown: bold, lists, newlines
  const lines = content.split(/\n+/).filter(Boolean);
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      {lines.map((line, idx) => {
        if (line.startsWith("**") && line.endsWith("**:")) {
          return <h4 key={idx}>{line.replace(/\*\*/g, "")}</h4>;
        }
        if (line.startsWith("**") && line.endsWith("**")) {
          return <strong key={idx}>{line.replace(/\*\*/g, "")}</strong>;
        }
        if (line.startsWith("- ") || line.startsWith("* ")) {
          // group bullets
          return <p key={idx}>{line}</p>;
        }
        // bold segments like **text**
        const parts = [];
        let remaining = line;
        while (true) {
          const start = remaining.indexOf("**");
          if (start === -1) { parts.push(remaining); break; }
          const end = remaining.indexOf("**", start + 2);
          if (end === -1) { parts.push(remaining); break; }
          if (start > 0) parts.push(remaining.slice(0, start));
          parts.push(<strong key={`${idx}-b-${start}`}>{remaining.slice(start + 2, end)}</strong>);
          remaining = remaining.slice(end + 2);
        }
        return <p key={idx} className="text-sm leading-6 text-muted-foreground">{parts}</p>;
      })}
    </div>
  );
}


