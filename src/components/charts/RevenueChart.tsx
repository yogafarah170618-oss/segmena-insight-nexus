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
        <div className="border-3 border-border bg-card p-4 shadow-brutal font-mono">
          <p className="font-brutal text-sm mb-2">{payload[0].payload.date}</p>
          <p className="text-sm">
            Revenue: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-sm">
            Transaksi: {payload[1].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="hover:translate-x-0 hover:translate-y-0 hover:shadow-brutal">
      <CardHeader>
        <CardTitle>REVENUE TREND</CardTitle>
        <CardDescription>Revenue dan transaksi per bulan</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="0" stroke="hsl(var(--border))" strokeWidth={2} />
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--foreground))"
              fontSize={11}
              fontFamily="Space Mono"
            />
            <YAxis 
              yAxisId="left"
              stroke="hsl(var(--foreground))"
              fontSize={11}
              fontFamily="Space Mono"
              tickFormatter={formatCurrency}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke="hsl(var(--secondary))"
              fontSize={11}
              fontFamily="Space Mono"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontFamily: 'Space Mono', fontSize: '12px' }}
            />
            <Line
              yAxisId="left"
              type="linear"
              dataKey="revenue"
              stroke="hsl(var(--foreground))"
              strokeWidth={3}
              name="Revenue"
              dot={{ fill: 'hsl(var(--foreground))', r: 6, strokeWidth: 2 }}
              activeDot={{ r: 8, strokeWidth: 3 }}
            />
            <Line
              yAxisId="right"
              type="linear"
              dataKey="transactions"
              stroke="hsl(var(--secondary))"
              strokeWidth={3}
              name="Transaksi"
              dot={{ fill: 'hsl(var(--secondary))', r: 6, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
