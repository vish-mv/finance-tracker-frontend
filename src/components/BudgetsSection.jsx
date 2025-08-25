"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiFetch } from "@/lib/api";
import { authStorage, formatCurrency } from "@/lib/utils";

export default function BudgetsSection() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ category: "General", amount: "", period: "monthly" });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ category: "", amount: "", period: "monthly" });
  const token = authStorage.getToken();

  async function load() {
    if (!token) return;
    const res = await apiFetch("/budgets", token);
    setItems(res || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate(e) {
    e.preventDefault();
    if (!token) return;
    const created = await apiFetch("/budgets", token, {
      method: "POST",
      body: JSON.stringify({
        category: form.category,
        amount: Number(form.amount || 0),
        period: form.period,
      }),
    });
    setForm({ ...form, amount: "" });
    setItems([created, ...items]);
  }

  function beginEdit(b) {
    setEditingId(b._id);
    setEditForm({ category: b.category, amount: String(b.amount), period: b.period || "monthly" });
  }

  async function saveEdit(id) {
    const updated = await apiFetch(`/budgets/${id}`, token, {
      method: "PUT",
      body: JSON.stringify({
        category: editForm.category,
        amount: Number(editForm.amount || 0),
        period: editForm.period,
      }),
    });
    setItems(items.map((x) => (x._id === id ? updated : x)));
    setEditingId(null);
  }

  async function remove(id) {
    await apiFetch(`/budgets/${id}`, token, { method: "DELETE" });
    setItems(items.filter((x) => x._id !== id));
  }

  return (
    <Card className="card-hover">
      <CardHeader>
        <CardTitle>Budgets</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col sm:flex-row gap-2 mb-4" onSubmit={onCreate}>
          <Input className="sm:w-48" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <Input className="sm:w-40" type="number" step="0.01" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <Select value={form.period} onValueChange={(v) => setForm({ ...form, period: v })}>
            <SelectTrigger className="sm:w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit">Add</Button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((b) => (
            <div key={b._id} className="rounded-md border p-4 bg-background/40">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">
                  {editingId === b._id ? (
                    <Input className="w-48" value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} />
                  ) : (
                    b.category
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {editingId === b._id ? (
                    <Select value={editForm.period} onValueChange={(v) => setEditForm({ ...editForm, period: v })}>
                      <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    b.period
                  )}
                </div>
              </div>
              <div className="h-2 bg-muted rounded">
                <div
                  className="h-2 rounded bg-blue-500"
                  style={{ width: `${Math.min(100, Math.round(((b.spent || 0) / (b.amount || 1)) * 100))}%` }}
                />
              </div>
              <div className="mt-2 text-sm text-muted-foreground flex justify-between">
                <span>{formatCurrency(b.spent || 0)} spent</span>
                <span>
                  {editingId === b._id ? (
                    <Input className="w-28" type="number" value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} />
                  ) : (
                    `${formatCurrency((b.amount || 0) - (b.spent || 0))} left`
                  )}
                </span>
              </div>
              <div className="mt-3 flex justify-end gap-2">
                {editingId === b._id ? (
                  <>
                    <Button size="sm" onClick={() => saveEdit(b._id)}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                  </>
                ) : (
                  <>
                    <Button size="sm" variant="outline" onClick={() => beginEdit(b)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => remove(b._id)}>Delete</Button>
                  </>
                )}
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground">No budgets yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


