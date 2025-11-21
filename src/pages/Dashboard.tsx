import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Users, ShoppingCart, TrendingUp, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface SegmentData {
  segment_name: string;
  customer_count: number;
  percentage: number;
  avg_spend: number;
  total_revenue: number;
}

interface DashboardMetrics {
  totalCustomers: number;
  totalTransactions: number;
  avgSpend: number;
  totalRevenue: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalCustomers: 0,
    totalTransactions: 0,
    avgSpend: 0,
    totalRevenue: 0,
  });
  const [segments, setSegments] = useState<SegmentData[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      // Fetch transactions for metrics
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', session.user.id);

      if (transError) throw transError;

      // Fetch segments
      const { data: segmentData, error: segError } = await supabase
        .from('customer_segments')
        .select('*')
        .eq('user_id', session.user.id);

      if (segError) throw segError;

      if (!transactions || transactions.length === 0) {
        setLoading(false);
        return;
      }

      // Calculate metrics
      const totalRevenue = transactions.reduce((sum, t) => sum + parseFloat(t.transaction_amount.toString()), 0);
      const uniqueCustomers = new Set(transactions.map(t => t.customer_id)).size;
      
      setMetrics({
        totalCustomers: uniqueCustomers,
        totalTransactions: transactions.length,
        avgSpend: totalRevenue / uniqueCustomers,
        totalRevenue: totalRevenue,
      });

      // Group segments
      const segmentGroups = new Map<string, {
        count: number;
        totalSpend: number;
        totalRevenue: number;
      }>();

      segmentData?.forEach(seg => {
        const existing = segmentGroups.get(seg.segment_name) || {
          count: 0,
          totalSpend: 0,
          totalRevenue: 0,
        };
        existing.count++;
        existing.totalSpend += parseFloat(seg.avg_spend.toString());
        existing.totalRevenue += parseFloat(seg.total_spend.toString());
        segmentGroups.set(seg.segment_name, existing);
      });

      const segmentArray: SegmentData[] = Array.from(segmentGroups.entries()).map(([name, data]) => ({
        segment_name: name,
        customer_count: data.count,
        percentage: (data.count / uniqueCustomers) * 100,
        avg_spend: data.totalSpend / data.count,
        total_revenue: data.totalRevenue,
      }));

      setSegments(segmentArray.sort((a, b) => b.total_revenue - a.total_revenue));
      
    } catch (error: any) {
      console.error('Error loading dashboard:', error);
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

  const getSegmentColor = (segmentName: string) => {
    const colors: Record<string, string> = {
      'Champions': 'from-green-500 to-emerald-500',
      'Loyal Customers': 'from-blue-500 to-cyan-500',
      'At Risk': 'from-orange-500 to-amber-500',
      'Lost': 'from-red-500 to-rose-500',
      'Potential Loyalists': 'from-purple-500 to-pink-500',
      'Recent Customers': 'from-teal-500 to-cyan-500',
      'Cant Lose Them': 'from-yellow-500 to-orange-500',
      'Big Spenders': 'from-indigo-500 to-purple-500',
    };
    return colors[segmentName] || 'from-gray-500 to-slate-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 space-y-8">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  if (metrics.totalCustomers === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <Card className="glass-card-strong p-12 text-center max-w-md">
          <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Belum Ada Data</h2>
          <p className="text-muted-foreground mb-6">
            Upload file CSV transaksi pelanggan untuk mulai analisis
          </p>
          <button
            onClick={() => navigate("/upload")}
            className="px-6 py-3 bg-gradient-primary rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Upload Data
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 space-y-8">
      <div>
        <h1 className="text-5xl font-bold mb-2">
          <span className="gradient-text">Analytics Dashboard</span>
        </h1>
        <p className="text-xl text-muted-foreground">Real-time customer intelligence insights</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: Users, label: "Total Customers", value: metrics.totalCustomers.toLocaleString() },
          { icon: ShoppingCart, label: "Total Transactions", value: metrics.totalTransactions.toLocaleString() },
          { icon: TrendingUp, label: "Avg. Spend", value: formatCurrency(metrics.avgSpend) },
        ].map((metric, i) => (
          <Card key={i} className="glass-card-strong p-6 hover:glow-effect transition-all duration-300 floating">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-primary bg-opacity-20 flex items-center justify-center">
                <metric.icon className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{metric.value}</div>
            <div className="text-sm text-muted-foreground">{metric.label}</div>
          </Card>
        ))}
      </div>

      {/* Segments Grid */}
      <div>
        <h2 className="text-3xl font-bold mb-6">Customer Segments</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {segments.map((segment, i) => (
            <Card
              key={i}
              className="glass-card-strong p-6 hover:glow-effect transition-all duration-300 cursor-pointer group"
              onClick={() => navigate(`/segments?segment=${segment.segment_name}`)}
            >
              <div className="flex items-center justify-between mb-4">
                <Target className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
                <div className="text-2xl font-bold">{segment.percentage.toFixed(0)}%</div>
              </div>
              <h3 className="text-xl font-bold mb-2">{segment.segment_name}</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Customers:</span>
                  <span className="text-foreground font-semibold">{segment.customer_count}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Spend:</span>
                  <span className="text-foreground font-semibold">{formatCurrency(segment.avg_spend)}</span>
                </div>
              </div>
              <div className={`h-2 rounded-full bg-gradient-to-r ${getSegmentColor(segment.segment_name)} mt-4`} />
            </Card>
          ))}
        </div>
      </div>

      {/* Total Revenue Card */}
      <Card className="glass-card-strong p-8">
        <h2 className="text-2xl font-bold mb-4">Total Revenue</h2>
        <div className="text-4xl font-bold gradient-text">
          {formatCurrency(metrics.totalRevenue)}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
