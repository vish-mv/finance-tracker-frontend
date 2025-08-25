"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDownRight, ArrowUpRight, Filter } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { authStorage, formatCurrency } from "@/lib/utils";

export default function TransactionsTable({ compact = false }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ type: "expense", category: "", amount: "" });
  const [form, setForm] = useState({ type: "expense", category: "General", amount: "" });
  const token = authStorage.getToken();
  const [filters, setFilters] = useState({ type: "all", min: "", max: "" });

  async function load() {
    if (!token) return;
    setLoading(true);
    try {
      const res = await apiFetch("/transactions", token);
      setItems(res || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate(e) {
    e.preventDefault();
    if (!token) return;
    try {
      const created = await apiFetch("/transactions", token, {
        method: "POST",
        body: JSON.stringify({
          type: form.type,
          category: form.category,
          amount: Number(form.amount || 0),
        }),
      });
      setForm({ ...form, amount: "" });
      setItems([created, ...items]);
    } catch (e) {
      console.error(e);
    }
  }

  function beginEdit(t) {
    setEditingId(t._id);
    setEditForm({ type: t.type, category: t.category, amount: String(t.amount) });
  }

  async function saveEdit(id) {
    if (!token) return;
    const updated = await apiFetch(`/transactions/${id}`, token, {
      method: "PUT",
      body: JSON.stringify({
        type: editForm.type,
        category: editForm.category,
        amount: Number(editForm.amount || 0),
      }),
    });
    setItems(items.map((x) => (x._id === id ? updated : x)));
    setEditingId(null);
  }

  async function remove(id) {
    if (!token) return;
    await apiFetch(`/transactions/${id}`, token, { method: "DELETE" });
    setItems(items.filter((x) => x._id !== id));
  }

  const displayed = compact ? items.slice(0, 5) : items
    .filter((t) => filters.type === "all" || t.type === filters.type)
    .filter((t) => (filters.min === "" ? true : t.amount >= Number(filters.min)))
    .filter((t) => (filters.max === "" ? true : t.amount <= Number(filters.max)));

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2"><Filter className="h-5 w-5 text-primary" /> {compact ? "Latest Activity" : "Activity Summary"}</CardTitle>
          {!compact && (
          <div className="hidden md:flex items-center gap-2">
            <Select value={filters.type} onValueChange={(v) => setFilters({ ...filters, type: v })}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
            <Input className="w-28" type="number" placeholder="Min" value={filters.min} onChange={(e) => setFilters({ ...filters, min: e.target.value })} />
            <Input className="w-28" type="number" placeholder="Max" value={filters.max} onChange={(e) => setFilters({ ...filters, max: e.target.value })} />
          </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!compact && (
        <form className="flex gap-2 mb-4" onSubmit={onCreate}>
          <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
          <Input className="w-48" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <Input className="w-40" type="number" step="0.01" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <Button type="submit">Add</Button>
        </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="py-2">Type</th>
                <th className="py-2">Category</th>
                <th className="py-2">Amount</th>
                <th className="py-2">Date</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((t) => (
                <tr key={t._id} className="border-t">
                  <td className="py-2 capitalize">
                    {editingId === t._id ? (
                      <Select value={editForm.type} onValueChange={(v) => setEditForm({ ...editForm, type: v })}>
                        <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="income">Income</SelectItem>
                          <SelectItem value="expense">Expense</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="inline-flex items-center gap-1 capitalize">
                        {t.type === "income" ? <ArrowUpRight className="h-4 w-4 text-emerald-500" /> : <ArrowDownRight className="h-4 w-4 text-rose-500" />}
                        {t.type}
                      </span>
                    )}
                  </td>
                  <td className="py-2">
                    {editingId === t._id ? (
                      <Input className="w-48" value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} />
                    ) : (
                      t.category
                    )}
                  </td>
                  <td className={`py-2 ${t.type === "expense" ? "text-red-500" : "text-green-500"}`}>
                    {editingId === t._id ? (
                      <Input className="w-32" type="number" value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} />
                    ) : (
                      formatCurrency(t.amount)
                    )}
                  </td>
                  <td className="py-2">{new Date(t.date || t.createdAt).toLocaleDateString()}</td>
                  <td className="py-2 text-right">
                    {editingId === t._id ? (
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" onClick={() => saveEdit(t._id)}>Save</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                      </div>
                    ) : (
                      <div className="flex gap-2 justify-end">
                        {!compact && <Button size="sm" variant="outline" onClick={() => beginEdit(t)}>Edit</Button>}
                        {!compact && <Button size="sm" variant="destructive" onClick={() => remove(t._id)}>Delete</Button>}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {items.length === 0 && !loading && (
                <tr><td colSpan={4} className="py-6 text-center text-muted-foreground">No transactions yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}


