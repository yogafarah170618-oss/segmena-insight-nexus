import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, DollarSign, Calendar, ArrowLeft, Trophy, Award, Medal, Star, Crown, Zap } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useGamification } from "@/contexts/GamificationContext";
import { useGamificationTracking } from "@/hooks/useGamificationTracking";

interface SegmentCustomer {
  customer_id: string;
  customer_name?: string;
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
  const { trackActivity, completeMission } = useGamification();
  useGamificationTracking();
  
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

  useEffect(() => {
    // Track segment exploration
    if (segmentName) {
      trackActivity('segment_explored', { segment: segmentName });
      completeMission('analyze_first_segment');
    }
  }, [segmentName]);

  const loadSegmentData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Show dummy data for preview
        const dummyData: Record<string, SegmentCustomer[]> = {
          'Champions': [
            { customer_id: 'CUST-001', customer_name: 'Budi Santoso', total_transactions: 45, total_spend: 2250000, avg_spend: 50000, last_transaction_date: '2024-11-15', recency_score: 5, frequency_score: 5, monetary_score: 5 },
            { customer_id: 'CUST-002', customer_name: 'Siti Rahayu', total_transactions: 38, total_spend: 1900000, avg_spend: 50000, last_transaction_date: '2024-11-14', recency_score: 5, frequency_score: 5, monetary_score: 4 },
            { customer_id: 'CUST-003', customer_name: 'Ahmad Wijaya', total_transactions: 42, total_spend: 2100000, avg_spend: 50000, last_transaction_date: '2024-11-13', recency_score: 5, frequency_score: 5, monetary_score: 5 },
          ],
          'Loyal Customers': [
            { customer_id: 'CUST-101', customer_name: 'Dewi Lestari', total_transactions: 28, total_spend: 1120000, avg_spend: 40000, last_transaction_date: '2024-11-10', recency_score: 4, frequency_score: 4, monetary_score: 4 },
            { customer_id: 'CUST-102', customer_name: 'Rudi Hartono', total_transactions: 25, total_spend: 1000000, avg_spend: 40000, last_transaction_date: '2024-11-08', recency_score: 4, frequency_score: 4, monetary_score: 4 },
          ],
          'At Risk': [
            { customer_id: 'CUST-201', customer_name: 'Linda Kusuma', total_transactions: 15, total_spend: 525000, avg_spend: 35000, last_transaction_date: '2024-09-20', recency_score: 2, frequency_score: 3, monetary_score: 3 },
            { customer_id: 'CUST-202', customer_name: 'Agus Pratama', total_transactions: 12, total_spend: 420000, avg_spend: 35000, last_transaction_date: '2024-09-15', recency_score: 2, frequency_score: 3, monetary_score: 3 },
          ],
          'Recent Customers': [
            { customer_id: 'CUST-301', customer_name: 'Rina Wati', total_transactions: 3, total_spend: 120000, avg_spend: 40000, last_transaction_date: '2024-11-16', recency_score: 5, frequency_score: 2, monetary_score: 2 },
            { customer_id: 'CUST-302', customer_name: 'Bambang Susilo', total_transactions: 2, total_spend: 80000, avg_spend: 40000, last_transaction_date: '2024-11-15', recency_score: 5, frequency_score: 1, monetary_score: 2 },
          ],
          'Lost': [
            { customer_id: 'CUST-401', customer_name: 'Yuni Astuti', total_transactions: 8, total_spend: 320000, avg_spend: 40000, last_transaction_date: '2024-06-10', recency_score: 1, frequency_score: 2, monetary_score: 3 },
            { customer_id: 'CUST-402', customer_name: 'Hendra Gunawan', total_transactions: 6, total_spend: 240000, avg_spend: 40000, last_transaction_date: '2024-05-25', recency_score: 1, frequency_score: 2, monetary_score: 2 },
          ],
        };

        const dummyCustomers = dummyData[segmentName] || [];
        setCustomers(dummyCustomers);

        const totalRevenue = dummyCustomers.reduce((sum, c) => sum + c.total_spend, 0);
        const totalTransactions = dummyCustomers.reduce((sum, c) => sum + c.total_transactions, 0);

        setStats({
          totalCustomers: dummyCustomers.length,
          avgSpend: dummyCustomers.length > 0 ? totalRevenue / dummyCustomers.length : 0,
          avgFrequency: dummyCustomers.length > 0 ? totalTransactions / dummyCustomers.length : 0,
          totalRevenue: totalRevenue,
        });

        setLoading(false);
        return;
      }

      // Fetch segments
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

      // Fetch customer names from transactions
      const customerIds = data.map(c => c.customer_id);
      const { data: transData } = await supabase
        .from('transactions')
        .select('customer_id, customer_name')
        .eq('user_id', session.user.id)
        .in('customer_id', customerIds)
        .not('customer_name', 'is', null)
        .order('created_at', { ascending: false });

      // Create a map of customer_id to name (take most recent name if multiple)
      const nameMap = new Map<string, string>();
      transData?.forEach(t => {
        if (t.customer_name && !nameMap.has(t.customer_id)) {
          nameMap.set(t.customer_id, t.customer_name);
        }
      });

      const customerData: SegmentCustomer[] = data.map(c => ({
        customer_id: c.customer_id,
        customer_name: nameMap.get(c.customer_id) || undefined,
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

      {/* Champions Gamification Section */}
      {segmentName === 'Champions' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="glass-card-strong p-6 relative overflow-hidden group hover:glow-effect transition-all duration-300">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-gradient-primary opacity-20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <Trophy className="w-12 h-12 text-yellow-400 mb-3" />
              <h3 className="text-xl font-bold mb-2">Top Tier Customers</h3>
              <p className="text-sm text-muted-foreground">Elite pelanggan dengan performa terbaik</p>
            </div>
          </Card>
          
          <Card className="glass-card-strong p-6 relative overflow-hidden group hover:glow-effect transition-all duration-300">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-gradient-primary opacity-20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <Crown className="w-12 h-12 text-amber-400 mb-3" />
              <h3 className="text-xl font-bold mb-2">VIP Status</h3>
              <p className="text-sm text-muted-foreground">Akses eksklusif dan rewards premium</p>
            </div>
          </Card>
          
          <Card className="glass-card-strong p-6 relative overflow-hidden group hover:glow-effect transition-all duration-300">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-gradient-primary opacity-20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <Zap className="w-12 h-12 text-blue-400 mb-3" />
              <h3 className="text-xl font-bold mb-2">Power Users</h3>
              <p className="text-sm text-muted-foreground">Transaksi tertinggi dengan loyalitas maksimal</p>
            </div>
          </Card>
        </div>
      )}

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
                  {segmentName === 'Champions' && (
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Rank</th>
                  )}
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Customer ID</th>
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Name</th>
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Transactions</th>
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Total Spend</th>
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Avg Spend</th>
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Last Purchase</th>
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">RFM Score</th>
                  {segmentName === 'Champions' && (
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Achievement</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {customers.map((customer, i) => {
                  const getRankIcon = (index: number) => {
                    if (index === 0) return <Trophy className="w-5 h-5 text-yellow-400" />;
                    if (index === 1) return <Award className="w-5 h-5 text-gray-400" />;
                    if (index === 2) return <Medal className="w-5 h-5 text-amber-600" />;
                    return null;
                  };

                  const getAchievementBadge = (customer: SegmentCustomer) => {
                    if (customer.total_spend > 2000000) {
                      return { icon: Crown, text: "Big Spender", color: "text-yellow-400" };
                    }
                    if (customer.total_transactions > 40) {
                      return { icon: Star, text: "Frequent Buyer", color: "text-blue-400" };
                    }
                    if (customer.recency_score === 5 && customer.frequency_score === 5 && customer.monetary_score === 5) {
                      return { icon: Zap, text: "Perfect Score", color: "text-purple-400" };
                    }
                    return { icon: Trophy, text: "Champion", color: "text-amber-400" };
                  };

                  const achievement = segmentName === 'Champions' ? getAchievementBadge(customer) : null;

                  return (
                    <tr
                      key={i}
                      className="border-b border-border hover:bg-primary/5 transition-colors"
                    >
                      {segmentName === 'Champions' && (
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {getRankIcon(i)}
                            <span className="font-bold text-lg">{i + 1}</span>
                          </div>
                        </td>
                      )}
                      <td className="p-4">
                        <Badge variant="outline" className="font-mono">
                          {customer.customer_id}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {customer.customer_name ? (
                          <span className="font-medium">{customer.customer_name}</span>
                        ) : (
                          <span className="text-muted-foreground italic">-</span>
                        )}
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
                      {segmentName === 'Champions' && achievement && (
                        <td className="p-4">
                          <Badge variant="outline" className="flex items-center gap-1 w-fit">
                            <achievement.icon className={`w-3 h-3 ${achievement.color}`} />
                            <span className="text-xs">{achievement.text}</span>
                          </Badge>
                        </td>
                      )}
                    </tr>
                  );
                })}
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
