import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useGamification } from "@/contexts/GamificationContext";

interface CustomerGrowthChartProps {
  data: Array<{
    date: string;
    newCustomers: number;
    totalCustomers: number;
  }>;
}

export const CustomerGrowthChart = ({ data }: CustomerGrowthChartProps) => {
  const { trackActivity } = useGamification();

  useEffect(() => {
    if (data && data.length > 0) {
      trackActivity('visualization_used', { chart: 'customer_growth' });
    }
  }, []);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card-strong p-4 border border-border rounded-lg">
          <p className="text-sm font-semibold mb-2 text-foreground">{payload[0].payload.date}</p>
          <p className="text-sm text-foreground font-medium">
            Customer Baru: {payload[0].value}
          </p>
          <p className="text-sm text-foreground font-medium">
            Total Customer: {payload[1].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="glass-card-strong">
      <CardHeader>
        <CardTitle>Customer Growth</CardTitle>
        <CardDescription>Pertumbuhan customer per bulan</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey="newCustomers"
              fill="hsl(var(--primary))"
              name="Customer Baru"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              dataKey="totalCustomers"
              fill="hsl(var(--secondary))"
              name="Total Customer"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
