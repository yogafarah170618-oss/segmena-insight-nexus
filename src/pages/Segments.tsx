import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, DollarSign, Calendar, ArrowLeft, ChevronRight } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<SegmentCustomer[]>([]);
  const [stats, setStats] = useState<SegmentStats>({
    totalCustomers: 0,
    avgSpend: 0,
    avgFrequency: 0,
    totalRevenue: 0,
  });
  const [selectedStrategy, setSelectedStrategy] = useState<{title: string; description: string; examples: string[]} | null>(null);

  useEffect(() => {
    loadSegmentData();
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

  const getStrategyDetails = (name: string, index: number) => {
    const details: Record<string, Array<{title: string; description: string; examples: string[]}>> = {
      'Champions': [
        {
          title: 'Exclusive Benefits & Early Access',
          description: 'Champions adalah pelanggan terbaik Anda. Berikan mereka akses istimewa ke produk baru, event khusus, atau promo eksklusif sebelum pelanggan lain. Ini membuat mereka merasa dihargai dan memperkuat loyalitas.',
          examples: [
            'Pre-launch access ke produk atau koleksi baru',
            'Undangan ke event VIP atau private sale',
            'Free shipping atau priority delivery',
            'Akses ke customer service khusus dengan response time lebih cepat',
          ]
        },
        {
          title: 'Program VIP dengan Rewards Khusus',
          description: 'Ciptakan tier VIP khusus untuk Champions dengan benefit yang tidak tersedia untuk pelanggan lain. Program ini harus memberikan nilai nyata dan membuat mereka tetap engaged.',
          examples: [
            'Poin reward dengan multiplier lebih tinggi',
            'Birthday gifts atau anniversary rewards',
            'Complimentary gift wrapping atau personalization',
            'Akses ke limited edition products',
          ]
        },
        {
          title: 'Brand Ambassador & Referral Program',
          description: 'Champions yang puas adalah promoter terbaik. Manfaatkan word-of-mouth mereka dengan program referral yang menguntungkan kedua belah pihak.',
          examples: [
            'Referral rewards untuk mereka dan teman yang direferensikan',
            'User-generated content campaign dengan incentive',
            'Testimony atau review rewards program',
            'Community building melalui exclusive group atau forum',
          ]
        },
      ],
      'Loyal Customers': [
        {
          title: 'Loyalty Program yang Menarik',
          description: 'Loyal Customers konsisten tapi belum di level Champions. Pertahankan mereka dengan program loyalitas yang memberikan reward atas konsistensi mereka.',
          examples: [
            'Tiered loyalty program dengan clear benefits di setiap level',
            'Milestone rewards untuk transaksi ke-10, ke-20, dst',
            'Seasonal bonus points atau cashback',
            'Member exclusive discounts',
          ]
        },
        {
          title: 'Personalized Recommendations',
          description: 'Gunakan data pembelian mereka untuk memberikan rekomendasi produk yang relevan. Personalisasi membuat mereka merasa diperhatikan.',
          examples: [
            'Email marketing dengan product recommendations based on purchase history',
            'Replenishment reminders untuk consumable products',
            'Bundle suggestions yang complement past purchases',
            'Personalized content berdasarkan preferences',
          ]
        },
        {
          title: 'Upgrade Program ke Champions',
          description: 'Berikan insentif dan path yang jelas untuk naik ke tier Champions. Buat mereka termotivasi untuk meningkatkan engagement.',
          examples: [
            'Clear communication tentang benefit Champions tier',
            'Limited time promotion untuk upgrade',
            'Gamification dengan progress tracker',
            'Exclusive challenges atau missions untuk unlock Champions status',
          ]
        },
      ],
      'At Risk': [
        {
          title: 'Win-back Campaign dengan Special Offers',
          description: 'At Risk customers mulai menjauh. Butuh immediate action untuk menarik mereka kembali dengan insentif yang compelling.',
          examples: [
            'Personalized discount code dengan urgency (limited time)',
            '"We miss you" email dengan special offer',
            'Free gift with next purchase',
            'Reactivation bonus points atau cashback',
          ]
        },
        {
          title: 'Survey & Understanding Pain Points',
          description: 'Pahami mengapa mereka mulai menjauh. Feedback langsung dari mereka adalah insight berharga untuk improvement.',
          examples: [
            'Short survey dengan incentive untuk completion',
            'Personal outreach via email atau phone',
            'Focus group invitation dengan compensation',
            'Review request dengan follow-up untuk negative feedback',
          ]
        },
        {
          title: 'Re-engagement Email Series',
          description: 'Automated campaign yang strategis untuk gradually rebuild relationship tanpa terlihat desperate.',
          examples: [
            'Series email yang progressively increase offer value',
            'Educational content tentang new features atau products',
            'Social proof email dengan testimonials atau reviews',
            'Last chance email sebelum list removal',
          ]
        },
      ],
      'Lost': [
        {
          title: 'Aggressive Win-back Offers',
          description: 'Lost customers sudah lama tidak bertransaksi. Butuh approach yang lebih agresif untuk menarik perhatian mereka kembali.',
          examples: [
            'High-value discount atau buy-one-get-one offers',
            'Free product atau gift dengan minimal purchase',
            'Store credit atau voucher dengan no strings attached',
            'Clearance sale access dengan deep discounts',
          ]
        },
        {
          title: 'Investigate Churn Reasons',
          description: 'Analisis mendalam mengapa mereka berhenti. Data ini crucial untuk prevent future churn dan improve business.',
          examples: [
            'Exit survey dengan attractive incentive',
            'Data analysis untuk identify common patterns',
            'Competitor analysis untuk understand market shift',
            'Product atau service audit based on feedback',
          ]
        },
        {
          title: 'Evaluate Re-engagement Worth',
          description: 'Tidak semua lost customers worth effort untuk win back. Fokuskan resource ke high-value customers.',
          examples: [
            'Calculate customer lifetime value untuk prioritize',
            'Segment lost customers by past purchase value',
            'Cost-benefit analysis untuk win-back campaigns',
            'Archive truly inactive customers untuk list hygiene',
          ]
        },
      ],
    };

    const defaultDetails = [
      {
        title: 'Analisis Behavior Patterns',
        description: 'Pelajari pola perilaku pelanggan di segment ini untuk memahami kebutuhan dan preferensi mereka.',
        examples: [
          'Track purchase frequency dan seasonality',
          'Analyze product preferences dan categories',
          'Monitor engagement dengan marketing channels',
          'Identify triggers untuk purchase decisions',
        ]
      },
      {
        title: 'Targeted Engagement Campaigns',
        description: 'Buat campaign yang spesifik untuk segment ini berdasarkan karakteristik unik mereka.',
        examples: [
          'Segmented email campaigns dengan relevant content',
          'Personalized offers based on segment behavior',
          'Channel-specific campaigns (social, email, SMS)',
          'A/B testing untuk optimize messaging',
        ]
      },
      {
        title: 'Regular Progress Monitoring',
        description: 'Monitor pergerakan customers antar segments dan adjust strategy sesuai kebutuhan.',
        examples: [
          'Monthly segment health check',
          'Track customers yang upgrade atau downgrade segments',
          'Measure campaign effectiveness per segment',
          'Adjust strategy based on results',
        ]
      },
    ];

    return (details[name] || defaultDetails)[index];
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
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Name</th>
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Transactions</th>
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Total Spend</th>
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Avg Spend</th>
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Last Purchase</th>
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">RFM Score</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer, i) => {
                  return (
                    <tr
                      key={i}
                      className="border-b border-border hover:bg-primary/5 transition-colors"
                    >
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
            <Card 
              key={i} 
              className="glass-card-strong p-6 hover:glow-effect transition-all duration-300 cursor-pointer group"
              onClick={() => setSelectedStrategy(getStrategyDetails(segmentName, i))}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-4 text-xl font-bold">
                    {i + 1}
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{strategy}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Strategy Detail Modal */}
      <Dialog open={!!selectedStrategy} onOpenChange={() => setSelectedStrategy(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl gradient-text">{selectedStrategy?.title}</DialogTitle>
            <DialogDescription className="text-base text-foreground/80 mt-2">
              {selectedStrategy?.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-6">
            <h4 className="text-lg font-semibold mb-4">Contoh Implementasi:</h4>
            <ul className="space-y-3">
              {selectedStrategy?.examples.map((example, i) => (
                <li key={i} className="flex gap-3">
                  <Badge variant="secondary" className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </Badge>
                  <span className="text-muted-foreground">{example}</span>
                </li>
              ))}
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Segments;
