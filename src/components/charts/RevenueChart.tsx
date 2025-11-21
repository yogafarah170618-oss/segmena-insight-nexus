import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface RevenueChartProps {
  data: Array<{
    date: string;
    revenue: number;
    transactions: number;
  }>;
}

export const RevenueChart = ({ data }: RevenueChartProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card-strong p-4 border border-border rounded-lg">
          <p className="text-sm font-semibold mb-2">{payload[0].payload.date}</p>
          <p className="text-sm text-primary">
            Revenue: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-sm text-secondary">
            Transaksi: {payload[1].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="glass-card-strong">
      <CardHeader>
        <CardTitle>Revenue Trend</CardTitle>
        <CardDescription>Revenue dan transaksi per bulan</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              yAxisId="left"
              stroke="hsl(var(--primary))"
              fontSize={12}
              tickFormatter={formatCurrency}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke="hsl(var(--secondary))"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              name="Revenue"
              dot={{ fill: 'hsl(var(--primary))', r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="transactions"
              stroke="hsl(var(--secondary))"
              strokeWidth={2}
              name="Transaksi"
              dot={{ fill: 'hsl(var(--secondary))', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
