"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import IncomeExpenseChart from "@/components/IncomeExpenseChart";
import { formatCurrency, monthNumberToShortName, authStorage } from "@/lib/utils";
import DashboardLayout from "@/components/layout/DashboardLayout";
import TransactionsTable from "@/components/TransactionsTable";
import BudgetsSection from "@/components/BudgetsSection";
import { TrendingUp, Wallet, ArrowDownRight, ArrowUpRight } from "lucide-react";

export default function DashboardPage() {
  const [totals, setTotals] = useState(null);
  const [monthly, setMonthly] = useState([]);
  // Temporary: read token from localStorage if set by login page
  const [token, setToken] = useState(null);

  useEffect(() => {
    setToken(authStorage.getToken());
  }, []);

  useEffect(() => {
    if (token === null) {
      // initial state; if missing after mount, redirect to login
      const t = authStorage.getToken();
      if (!t) {
        window.location.href = "/login";
        return;
      }
      setToken(t);
    }
    if (!token) return;
    async function loadData() {
      try {
        const totalsRes = await apiFetch("/reports/totals", token);
        setTotals(totalsRes);

        const monthlyRes = await apiFetch("/reports/monthly", token);
        // Map backend shape { _id: 1-12, income, expense } to chart friendly
        const mapped = (monthlyRes || []).map((m) => ({
          month: monthNumberToShortName(m._id),
          income: m.income || 0,
          expense: m.expense || 0,
        }));
        setMonthly(mapped);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, [token]);

  return (
    <DashboardLayout>
      {/* KPI Cards */}
      <KpiCard
        title="Total Balance"
        icon={<Wallet className="h-5 w-5" />}
        value={totals ? formatCurrency(totals.balance) : "Loading..."}
        deltaLabel="Since last month"
        deltaIcon={<TrendingUp className="h-4 w-4" />}
        variant="primary"
      />
      <KpiCard
        title="Total Income"
        icon={<ArrowUpRight className="h-5 w-5" />}
        value={totals ? formatCurrency(totals.income) : "Loading..."}
        deltaLabel="Growth"
        variant="success"
      />
      <KpiCard
        title="Total Expenses"
        icon={<ArrowDownRight className="h-5 w-5" />}
        value={totals ? formatCurrency(totals.expense ?? totals.expenses) : "Loading..."}
        deltaLabel="Change"
        variant="danger"
      />

      {/* Chart left */}
      <div className="md:col-span-2 xl:col-span-2">
        <Card className="card-hover">
          <CardHeader><CardTitle>Analytics Report</CardTitle></CardHeader>
          <CardContent>
            <div className="w-full h-[320px]">
              <IncomeExpenseChart data={monthly} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right: Latest activity (compact) */}
      <div>
        <TransactionsTable compact />
      </div>

      {/* Bottom: Categories and Budgets side by side */}
      <div className="md:col-span-2 xl:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoriesSection token={token} />
        <BudgetsSection />
      </div>
    </DashboardLayout>
  );
}

function CategoriesSection({ token }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (!token) return;
    apiFetch("/reports/categories", token)
      .then((res) => setCategories(res || []))
      .catch((e) => console.error(e));
  }, [token]);

  return (
    <Card className="mt-6 card-hover">
      <CardHeader><CardTitle>Top Expense Categories</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c) => (
            <div key={c._id} className="flex items-center justify-between rounded-md border p-4 bg-background/40">
              <span className="font-medium">{c._id}</span>
              <span className="text-sm text-muted-foreground">{formatCurrency(c.total)}</span>
            </div>
          ))}
          {categories.length === 0 && (
            <p className="text-sm text-muted-foreground">No category data.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function KpiCard({ title, icon, value, deltaLabel, deltaIcon, variant = "primary" }) {
  const variantStyles = {
    primary: "border-primary/20",
    success: "border-emerald-300/30",
    danger: "border-rose-300/30",
  }[variant] || "border-primary/20";

  return (
    <Card className={`relative overflow-hidden border ${variantStyles}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center size-8 rounded-md bg-primary/10 text-primary">{icon}</span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        <div className="mt-2 text-xs text-muted-foreground inline-flex items-center gap-1">
          {deltaIcon ? deltaIcon : null}
          {deltaLabel}
        </div>
      </CardContent>
    </Card>
  );
}
