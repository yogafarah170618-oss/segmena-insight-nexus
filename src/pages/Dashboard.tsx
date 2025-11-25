import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Users, ShoppingCart, TrendingUp, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { SegmentPieChart } from "@/components/charts/SegmentPieChart";
import { CustomerGrowthChart } from "@/components/charts/CustomerGrowthChart";
import { GamificationDashboard } from "@/components/gamification/GamificationDashboard";
import { GamificationWidget } from "@/components/gamification/GamificationWidget";
import { useGamification } from "@/contexts/GamificationContext";
import { useGamificationTracking } from "@/hooks/useGamificationTracking";

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
  const { trackActivity } = useGamification();
  useGamificationTracking();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalCustomers: 0,
    totalTransactions: 0,
    avgSpend: 0,
    totalRevenue: 0,
  });
  const [segments, setSegments] = useState<SegmentData[]>([]);
  const [revenueData, setRevenueData] = useState<Array<{ date: string; revenue: number; transactions: number }>>([]);
  const [customerGrowthData, setCustomerGrowthData] = useState<Array<{ date: string; newCustomers: number; totalCustomers: number }>>([]);
  const [segmentPieData, setSegmentPieData] = useState<Array<{ name: string; value: number; color: string }>>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Show dummy data for preview
        setMetrics({
          totalCustomers: 1247,
          totalTransactions: 3842,
          avgSpend: 247000,
          totalRevenue: 308149000,
        });

        setSegments([
          { segment_name: 'Champions', customer_count: 187, percentage: 15, avg_spend: 520000, total_revenue: 97240000 },
          { segment_name: 'Loyal Customers', customer_count: 312, percentage: 25, avg_spend: 310000, total_revenue: 96720000 },
          { segment_name: 'At Risk', customer_count: 249, percentage: 20, avg_spend: 180000, total_revenue: 44820000 },
          { segment_name: 'Recent Customers', customer_count: 374, percentage: 30, avg_spend: 150000, total_revenue: 56100000 },
          { segment_name: 'Lost', customer_count: 125, percentage: 10, avg_spend: 110000, total_revenue: 13750000 },
        ]);

        setRevenueData([
          { date: 'Jun 2024', revenue: 45000000, transactions: 580 },
          { date: 'Jul 2024', revenue: 48500000, transactions: 620 },
          { date: 'Aug 2024', revenue: 52000000, transactions: 670 },
          { date: 'Sep 2024', revenue: 49800000, transactions: 640 },
          { date: 'Oct 2024', revenue: 54200000, transactions: 695 },
          { date: 'Nov 2024', revenue: 58600000, transactions: 737 },
        ]);

        setCustomerGrowthData([
          { date: 'Jun 2024', newCustomers: 145, totalCustomers: 825 },
          { date: 'Jul 2024', newCustomers: 167, totalCustomers: 992 },
          { date: 'Aug 2024', newCustomers: 183, totalCustomers: 1175 },
          { date: 'Sep 2024', newCustomers: 156, totalCustomers: 1331 },
          { date: 'Oct 2024', newCustomers: 178, totalCustomers: 1509 },
          { date: 'Nov 2024', newCustomers: 194, totalCustomers: 1703 },
        ]);

        setSegmentPieData([
          { name: 'Champions', value: 187, color: 'hsl(142, 76%, 36%)' },
          { name: 'Loyal Customers', value: 312, color: 'hsl(221, 83%, 53%)' },
          { name: 'At Risk', value: 249, color: 'hsl(25, 95%, 53%)' },
          { name: 'Recent Customers', value: 374, color: 'hsl(187, 85%, 43%)' },
          { name: 'Lost', value: 125, color: 'hsl(0, 84%, 60%)' },
        ]);

        setLoading(false);
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

      // Prepare chart data
      await prepareChartData(transactions, segmentData);
      
    } catch (error: any) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = async (transactions: any[], segments: any[]) => {
    // Revenue trend by month
    const monthlyData = new Map<string, { revenue: number; transactions: number }>();
    
    transactions.forEach(t => {
      const date = new Date(t.transaction_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const existing = monthlyData.get(monthKey) || { revenue: 0, transactions: 0 };
      existing.revenue += parseFloat(t.transaction_amount.toString());
      existing.transactions += 1;
      monthlyData.set(monthKey, existing);
    });

    const revenueChartData = Array.from(monthlyData.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6) // Last 6 months
      .map(([date, data]) => ({
        date: new Date(date + '-01').toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
        revenue: data.revenue,
        transactions: data.transactions,
      }));

    setRevenueData(revenueChartData);

    // Customer growth by month
    const customersByMonth = new Map<string, Set<string>>();
    const sortedTransactions = [...transactions].sort((a, b) => 
      new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime()
    );

    const allCustomers = new Set<string>();
    sortedTransactions.forEach(t => {
      const date = new Date(t.transaction_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!customersByMonth.has(monthKey)) {
        customersByMonth.set(monthKey, new Set());
      }
      customersByMonth.get(monthKey)!.add(t.customer_id);
      allCustomers.add(t.customer_id);
    });

    let cumulativeCustomers = 0;
    const growthChartData = Array.from(customersByMonth.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6)
      .map(([date, customers]) => {
        cumulativeCustomers += customers.size;
        return {
          date: new Date(date + '-01').toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
          newCustomers: customers.size,
          totalCustomers: cumulativeCustomers,
        };
      });

    setCustomerGrowthData(growthChartData);

    // Segment pie chart
    const segmentColors: Record<string, string> = {
      'Champions': 'hsl(142, 76%, 36%)',
      'Loyal Customers': 'hsl(221, 83%, 53%)',
      'At Risk': 'hsl(25, 95%, 53%)',
      'Lost': 'hsl(0, 84%, 60%)',
      'Potential Loyalists': 'hsl(271, 91%, 65%)',
      'Recent Customers': 'hsl(187, 85%, 43%)',
      'Cant Lose Them': 'hsl(45, 93%, 47%)',
      'Big Spenders': 'hsl(239, 84%, 67%)',
      'Need Attention': 'hsl(215, 20%, 65%)',
    };

    const segmentGroups = new Map<string, number>();
    segments?.forEach(seg => {
      segmentGroups.set(seg.segment_name, (segmentGroups.get(seg.segment_name) || 0) + 1);
    });

    const pieData = Array.from(segmentGroups.entries()).map(([name, count]) => ({
      name,
      value: count,
      color: segmentColors[name] || 'hsl(215, 20%, 65%)',
    }));

    setSegmentPieData(pieData);
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
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-5xl font-bold mb-2">
            <span className="gradient-text">Analytics Dashboard</span>
          </h1>
          <p className="text-xl text-muted-foreground">Real-time customer intelligence insights</p>
        </div>
        <div className="w-full max-w-md">
          <GamificationWidget />
        </div>
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={revenueData} />
        <CustomerGrowthChart data={customerGrowthData} />
      </div>

      {segmentPieData.length > 0 && (
        <SegmentPieChart data={segmentPieData} />
      )}

      {/* Gamification Dashboard */}
      <div>
        <h2 className="text-3xl font-bold mb-6">Your Progress</h2>
        <GamificationDashboard />
      </div>
    </div>
  );
};

export default Dashboard;
