import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, DollarSign, Calendar, ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface SegmentCustomer {
  customer_id: string;
  total_transactions: number;
  total_spend: number;
  avg_spend: number;
  last_transaction_date: string;
  recency_score: number;
  frequency_score: number;
  monetary_score: number;
}

interface SegmentStats {
  totalCustomers: number;
  avgSpend: number;
  avgFrequency: number;
  totalRevenue: number;
}

const Segments = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const segmentName = searchParams.get('segment') || 'Champions';
  
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<SegmentCustomer[]>([]);
  const [stats, setStats] = useState<SegmentStats>({
    totalCustomers: 0,
    avgSpend: 0,
    avgFrequency: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    loadSegmentData();
  }, [segmentName]);

  const loadSegmentData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from('customer_segments')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('segment_name', segmentName)
        .order('total_spend', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        setLoading(false);
        return;
      }

      const customerData: SegmentCustomer[] = data.map(c => ({
        customer_id: c.customer_id,
        total_transactions: c.total_transactions,
        total_spend: parseFloat(c.total_spend.toString()),
        avg_spend: parseFloat(c.avg_spend.toString()),
        last_transaction_date: c.last_transaction_date,
        recency_score: c.recency_score,
        frequency_score: c.frequency_score,
        monetary_score: c.monetary_score,
      }));

      setCustomers(customerData);

      const totalRevenue = customerData.reduce((sum, c) => sum + c.total_spend, 0);
      const totalTransactions = customerData.reduce((sum, c) => sum + c.total_transactions, 0);

      setStats({
        totalCustomers: customerData.length,
        avgSpend: totalRevenue / customerData.length,
        avgFrequency: totalTransactions / customerData.length,
        totalRevenue: totalRevenue,
      });

    } catch (error: any) {
      console.error('Error loading segment:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getSegmentDescription = (name: string) => {
    const descriptions: Record<string, string> = {
      'Champions': 'Pelanggan terbaik Anda dengan frekuensi dan nilai transaksi tertinggi',
      'Loyal Customers': 'Pelanggan setia dengan transaksi reguler dan konsisten',
      'At Risk': 'Pelanggan yang sebelumnya aktif tapi mulai menjauh',
      'Lost': 'Pelanggan yang sudah lama tidak bertransaksi',
      'Potential Loyalists': 'Pelanggan baru dengan potensi menjadi loyal',
      'Recent Customers': 'Pelanggan yang baru saja melakukan transaksi',
      'Cant Lose Them': 'Pelanggan berharga yang mulai tidak aktif',
      'Big Spenders': 'Pelanggan dengan nilai transaksi tinggi',
      'Need Attention': 'Pelanggan yang memerlukan perhatian khusus',
    };
    return descriptions[name] || 'Segmen pelanggan berdasarkan analisis RFM';
  };

  const getStrategies = (name: string) => {
    const strategies: Record<string, string[]> = {
      'Champions': [
        'Berikan exclusive benefits dan early access',
        'Program VIP dengan rewards khusus',
        'Jadikan brand ambassador dengan referral program',
      ],
      'Loyal Customers': [
        'Pertahankan dengan loyalty program',
        'Personalized recommendations',
        'Upgrade program untuk jadi Champions',
      ],
      'At Risk': [
        'Win-back campaign dengan special offers',
        'Survey untuk understand pain points',
        'Re-engagement email series',
      ],
      'Lost': [
        'Aggressive win-back offers',
        'Investigate churn reasons',
        'Consider if worth re-engaging',
      ],
    };
    return strategies[name] || [
      'Analyze customer behavior patterns',
      'Create targeted engagement campaigns',
      'Monitor progress regularly',
    ];
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 space-y-8">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <Card className="glass-card-strong p-12 text-center max-w-md">
          <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Tidak Ada Data</h2>
          <p className="text-muted-foreground mb-6">
            Belum ada customer di segmen {segmentName}
          </p>
          <Button onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 space-y-8">
      <div className="flex items-center gap-4 mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-5xl font-bold mb-2">
            <span className="gradient-text">{segmentName}</span>
          </h1>
          <p className="text-xl text-muted-foreground">{getSegmentDescription(segmentName)}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { icon: Users, label: "Total Customers", value: stats.totalCustomers },
          { icon: DollarSign, label: "Avg. Spend", value: formatCurrency(stats.avgSpend) },
          { icon: TrendingUp, label: "Avg. Frequency", value: `${stats.avgFrequency.toFixed(1)}x` },
          { icon: Calendar, label: "Total Revenue", value: formatCurrency(stats.totalRevenue) },
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
        <h2 className="text-3xl font-bold mb-6">Customers in this Segment</h2>
        <Card className="glass-card-strong overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Customer ID</th>
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Transactions</th>
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Total Spend</th>
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Avg Spend</th>
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Last Purchase</th>
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">RFM Score</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer, i) => (
                  <tr
                    key={i}
                    className="border-b border-border hover:bg-primary/5 transition-colors"
                  >
                    <td className="p-4">
                      <Badge variant="outline" className="font-mono">
                        {customer.customer_id}
                      </Badge>
                    </td>
                    <td className="p-4">{customer.total_transactions}</td>
                    <td className="p-4 font-semibold text-secondary">{formatCurrency(customer.total_spend)}</td>
                    <td className="p-4">{formatCurrency(customer.avg_spend)}</td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(customer.last_transaction_date).toLocaleDateString('id-ID')}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <Badge variant="secondary" className="text-xs">
                          R:{customer.recency_score}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          F:{customer.frequency_score}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          M:{customer.monetary_score}
                        </Badge>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Strategies */}
      <div>
        <h2 className="text-3xl font-bold mb-6">Recommended Strategies</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {getStrategies(segmentName).map((strategy, i) => (
            <Card key={i} className="glass-card-strong p-6 hover:glow-effect transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-4 text-xl font-bold">
                {i + 1}
              </div>
              <p className="text-muted-foreground leading-relaxed">{strategy}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Segments;
