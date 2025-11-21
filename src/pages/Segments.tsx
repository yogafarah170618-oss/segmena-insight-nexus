import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, DollarSign, Calendar } from "lucide-react";

const segmentData = {
  name: "Champions",
  description: "Pelanggan terbaik Anda dengan frekuensi dan nilai transaksi tertinggi",
  totalCustomers: 287,
  avgSpend: "Rp 875,000",
  avgFrequency: 12.4,
  totalRevenue: "Rp 251,125,000",
};

const customers = [
  { id: "CUST001", name: "Ahmad Wijaya", transactions: 18, totalSpend: "Rp 1,250,000", lastPurchase: "2 days ago" },
  { id: "CUST002", name: "Siti Nurhaliza", transactions: 15, totalSpend: "Rp 980,000", lastPurchase: "5 days ago" },
  { id: "CUST003", name: "Budi Santoso", transactions: 14, totalSpend: "Rp 875,000", lastPurchase: "1 week ago" },
  { id: "CUST004", name: "Rina Kusuma", transactions: 13, totalSpend: "Rp 820,000", lastPurchase: "3 days ago" },
  { id: "CUST005", name: "Joko Widodo", transactions: 12, totalSpend: "Rp 750,000", lastPurchase: "4 days ago" },
];

const strategies = [
  {
    title: "VIP Program",
    description: "Berikan exclusive benefits dan early access ke produk baru untuk mempertahankan loyalitas.",
  },
  {
    title: "Personalized Offers",
    description: "Gunakan data pembelian untuk memberikan rekomendasi produk yang highly relevant.",
  },
  {
    title: "Referral Incentives",
    description: "Manfaatkan kepuasan mereka dengan program referral yang menarik.",
  },
];

const Segments = () => {
  return (
    <div className="min-h-screen p-8 space-y-8">
      <div>
        <h1 className="text-5xl font-bold mb-2">
          <span className="gradient-text">{segmentData.name}</span>
        </h1>
        <p className="text-xl text-muted-foreground">{segmentData.description}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { icon: Users, label: "Total Customers", value: segmentData.totalCustomers },
          { icon: DollarSign, label: "Avg. Spend", value: segmentData.avgSpend },
          { icon: TrendingUp, label: "Avg. Frequency", value: `${segmentData.avgFrequency}x` },
          { icon: Calendar, label: "Total Revenue", value: segmentData.totalRevenue },
        ].map((stat, i) => (
          <Card key={i} className="glass-card-strong p-6 floating" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-bold mb-1">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </Card>
        ))}
      </div>

      {/* Customers Table */}
      <div>
        <h2 className="text-3xl font-bold mb-6">Top Customers</h2>
        <Card className="glass-card-strong overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Customer ID</th>
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Name</th>
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Transactions</th>
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Total Spend</th>
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Last Purchase</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer, i) => (
                  <tr
                    key={i}
                    className="border-b border-border hover:bg-primary/5 transition-colors cursor-pointer"
                  >
                    <td className="p-4">
                      <Badge variant="outline" className="font-mono">
                        {customer.id}
                      </Badge>
                    </td>
                    <td className="p-4 font-medium">{customer.name}</td>
                    <td className="p-4">{customer.transactions}</td>
                    <td className="p-4 font-semibold text-secondary">{customer.totalSpend}</td>
                    <td className="p-4 text-muted-foreground">{customer.lastPurchase}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Insights */}
      <div>
        <h2 className="text-3xl font-bold mb-6">Segment Insights</h2>
        <Card className="glass-card-strong p-8">
          <div className="prose prose-invert max-w-none">
            <p className="text-lg leading-relaxed text-muted-foreground mb-6">
              Segmen <span className="text-primary font-semibold">Champions</span> merepresentasikan pelanggan paling berharga 
              dengan <span className="text-secondary font-semibold">287 customers</span> yang menghasilkan total revenue 
              sebesar <span className="text-secondary font-semibold">Rp 251,125,000</span>. Mereka melakukan transaksi 
              rata-rata <span className="text-secondary font-semibold">12.4 kali</span> dengan nilai spend rata-rata 
              <span className="text-secondary font-semibold"> Rp 875,000</span> per customer.
            </p>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Customer di segmen ini menunjukkan engagement yang sangat tinggi dan loyalitas yang kuat terhadap brand Anda. 
              Fokus pada retention dan program VIP akan memaksimalkan lifetime value dari segmen ini.
            </p>
          </div>
        </Card>
      </div>

      {/* Strategies */}
      <div>
        <h2 className="text-3xl font-bold mb-6">Recommended Strategies</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {strategies.map((strategy, i) => (
            <Card key={i} className="glass-card-strong p-6 hover:glow-effect transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-4 text-xl font-bold">
                {i + 1}
              </div>
              <h3 className="text-xl font-bold mb-3">{strategy.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{strategy.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Segments;
