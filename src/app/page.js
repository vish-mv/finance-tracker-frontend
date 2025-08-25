import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <DashboardLayout>
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold">Total Balance</h3>
          <p className="text-2xl font-bold mt-2">$12,340</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold">Monthly Expenses</h3>
          <p className="text-2xl font-bold mt-2">$4,200</p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
