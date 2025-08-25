"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import TransactionsTable from "@/components/TransactionsTable";

export default function TransactionsPage() {
  return (
    <DashboardLayout>
      <div className="md:col-span-2 xl:col-span-3">
        <TransactionsTable />
      </div>
    </DashboardLayout>
  );
}


