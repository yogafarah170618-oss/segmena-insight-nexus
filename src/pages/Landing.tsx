import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Target, Zap, TrendingUp, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Landing = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCustomers: "1,247",
    activeSegments: "4",
    avgTransaction: "Rp 247K",
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkAuthAndLoadData();

    // Listen for auth changes (especially logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        // Reset to dummy data
        setIsLoggedIn(false);
        setStats({
          totalCustomers: "1,247",
          activeSegments: "4",
          avgTransaction: "Rp 247K",
        });
      } else if (event === 'SIGNED_IN') {
        checkAuthAndLoadData();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setIsLoggedIn(false);
        return;
      }

      setIsLoggedIn(true);

      // Fetch real data
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', session.user.id);

      const { data: segments } = await supabase
        .from('customer_segments')
        .select('segment_name')
        .eq('user_id', session.user.id);

      if (transactions && transactions.length > 0) {
        const uniqueCustomers = new Set(transactions.map(t => t.customer_id)).size;
        const uniqueSegments = new Set(segments?.map(s => s.segment_name) || []).size;
        const totalRevenue = transactions.reduce((sum, t) => sum + parseFloat(t.transaction_amount.toString()), 0);
        const avgTransaction = totalRevenue / transactions.length;

        setStats({
          totalCustomers: uniqueCustomers.toLocaleString('id-ID'),
          activeSegments: uniqueSegments.toString(),
          avgTransaction: new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(avgTransaction),
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="relative z-10 container mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm">Smart Customer Intelligence</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-bold mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <span className="gradient-text">Segmena</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Platform Customer Intelligence untuk UMKM. Segmentasi otomatis, insight siap pakai, mudah digunakan.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Button
              size="lg"
              onClick={() => navigate("/upload")}
              className="bg-gradient-primary hover:opacity-90 glow-effect text-lg px-8 py-6 group"
            >
              Upload Data
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="glass-card text-lg px-8 py-6 hover:bg-primary/10"
            >
              Try Demo
            </Button>
          </div>

          {/* Dashboard Mockup */}
          <div className="relative max-w-5xl mx-auto animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <div className="glass-card-strong rounded-3xl p-8 glow-effect">
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: "Total Customers", value: stats.totalCustomers },
                  { label: "Active Segments", value: stats.activeSegments },
                  { label: "Avg. Transaction", value: stats.avgTransaction },
                ].map((stat, i) => (
                  <div key={i} className="glass-card p-4 rounded-xl">
                    <div className="text-sm text-muted-foreground mb-1">{stat.label}</div>
                    <div className="text-2xl font-bold gradient-text">{stat.value}</div>
                  </div>
                ))}
              </div>
              <div className="h-64 glass-card rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 text-primary animate-pulse" />
                  <p className="text-muted-foreground">
                    {isLoggedIn ? "Your Analytics Dashboard" : "Beautiful Analytics Dashboard"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-4">
              <span className="gradient-text">Keunggulan Platform</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Insight pelanggan yang powerful, tanpa kompleksitas
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: "Segmentasi Otomatis",
                description: "Algoritma canggih mengelompokkan pelanggan berdasarkan perilaku transaksi mereka secara otomatis.",
              },
              {
                icon: Zap,
                title: "Insight Siap Pakai",
                description: "Dapatkan rekomendasi strategi marketing langsung dari data Anda tanpa perlu analisis manual.",
              },
              {
                icon: TrendingUp,
                title: "Mudah Digunakan",
                description: "Upload CSV, lihat hasil. Sesederhana itu. Tidak perlu keahlian data science.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="glass-card-strong p-8 rounded-2xl hover:glow-effect transition-all duration-300 group"
              >
                <div className="w-16 h-16 rounded-xl bg-gradient-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
