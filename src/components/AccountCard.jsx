"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export default function AccountCard({ bank = "Chase", balance = 0, transactions = 0 }) {
  return (
    <Card className="overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-500 text-white">
        <div className="text-sm opacity-90">My Account Bank</div>
        <div className="mt-2 text-xl font-semibold">{bank}</div>
      </div>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">Transaction</div>
            <div className="text-lg font-semibold">{transactions}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Total Balance</div>
            <div className="text-lg font-semibold">{formatCurrency(balance)}</div>
          </div>
        </div>
        <button className="mt-4 w-full rounded-md bg-primary text-primary-foreground h-9 text-sm font-medium hover:brightness-110">
          Add New Card
        </button>
      </CardContent>
    </Card>
  );
}


