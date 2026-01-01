import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Target, Zap, TrendingUp, BarChart3 } from "lucide-react";
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
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
    <div className="min-h-screen dotted-bg overflow-x-hidden">
      {/* Marquee Banner */}
      <div className="bg-foreground text-background py-1.5 sm:py-2 overflow-hidden border-b-3 border-border">
        <div className="marquee whitespace-nowrap font-brutal text-[10px] sm:text-sm tracking-wider">
          ★ CUSTOMER INTELLIGENCE PLATFORM ★ SEGMENTASI OTOMATIS ★ INSIGHT SIAP PAKAI ★ MUDAH DIGUNAKAN ★ CUSTOMER INTELLIGENCE PLATFORM ★ SEGMENTASI OTOMATIS ★ INSIGHT SIAP PAKAI ★ MUDAH DIGUNAKAN ★
        </div>
      </div>

      {/* Hero Section */}
      <section className="min-h-[80vh] sm:min-h-[90vh] flex items-center justify-center py-6 sm:py-20 px-4 sm:px-6">
        <div className="w-full max-w-5xl mx-auto">
          {/* Main Title */}
          <div className="mb-6 sm:mb-12 text-center">
            <h1 className="text-[2.5rem] leading-[0.9] sm:text-7xl md:text-8xl lg:text-[10rem] font-brutal tracking-tight mb-3 sm:mb-6">
              SEGMENA
            </h1>
            <div className="inline-block bg-secondary px-3 sm:px-6 py-1 sm:py-2 border-3 border-border shadow-brutal -rotate-2 mb-4 sm:mb-8">
              <span className="font-brutal text-secondary-foreground text-[10px] sm:text-base md:text-xl">
                CUSTOMER INTELLIGENCE
              </span>
            </div>
            <p className="text-xs sm:text-base md:text-xl font-mono max-w-2xl mx-auto mb-6 sm:mb-12 leading-relaxed">
              Platform Customer Intelligence untuk UMKM. Segmentasi otomatis, insight siap pakai, mudah digunakan.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center mb-6 sm:mb-16">
            <Button
              size="lg"
              onClick={() => navigate("/upload")}
              className="text-xs sm:text-base md:text-lg px-5 sm:px-10 py-3 sm:py-6 w-full sm:w-auto"
            >
              Upload Data
              <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="text-xs sm:text-base md:text-lg px-5 sm:px-10 py-3 sm:py-6 w-full sm:w-auto"
            >
              Try Demo
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-4xl mx-auto">
            {[
              { label: "CUSTOMERS", value: stats.totalCustomers },
              { label: "SEGMENTS", value: stats.activeSegments },
              { label: "AVG. TRX", value: stats.avgTransaction },
            ].map((stat, i) => (
              <div 
                key={i} 
                className={`border-3 border-border p-2 sm:p-4 md:p-6 bg-card shadow-brutal ${
                  i === 1 ? 'bg-secondary text-secondary-foreground' : ''
                }`}
              >
                <div className="text-[8px] sm:text-[10px] md:text-xs font-mono mb-0.5 sm:mb-2 opacity-70 truncate">{stat.label}</div>
                <div className="text-sm sm:text-xl md:text-3xl font-brutal truncate">{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Dashboard Preview - Compact on mobile */}
          <div className="mt-6 sm:mt-16 border-3 border-border p-3 sm:p-6 bg-card shadow-brutal-lg">
            <div className="flex items-center justify-between border-b-3 border-border pb-2 sm:pb-4 mb-3 sm:mb-6">
              <div className="flex gap-1 sm:gap-2">
                <div className="w-2.5 h-2.5 sm:w-4 sm:h-4 bg-accent border-2 border-border"></div>
                <div className="w-2.5 h-2.5 sm:w-4 sm:h-4 bg-secondary border-2 border-border"></div>
                <div className="w-2.5 h-2.5 sm:w-4 sm:h-4 bg-foreground border-2 border-border"></div>
              </div>
              <span className="font-mono text-[10px] sm:text-sm">DASHBOARD.EXE</span>
            </div>
            <div className="h-24 sm:h-48 md:h-64 flex items-center justify-center striped-bg border-3 border-border">
              <div className="text-center">
                <BarChart3 className="w-8 h-8 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-4" />
                <p className="font-brutal text-xs sm:text-lg">
                  {isLoggedIn ? "YOUR ANALYTICS" : "ANALYTICS DASHBOARD"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 sm:py-20 border-t-3 border-border">
        <div className="px-4 sm:px-6">
          <div className="text-center mb-6 sm:mb-16">
            <h2 className="text-xl sm:text-4xl md:text-6xl font-brutal mb-2 sm:mb-4">
              KEUNGGULAN
            </h2>
            <div className="inline-block bg-accent text-accent-foreground px-2 sm:px-4 py-0.5 sm:py-1 rotate-1 border-3 border-border shadow-brutal">
              <span className="font-mono text-[10px] sm:text-base">PLATFORM KAMI</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:gap-6 md:grid-cols-3 max-w-6xl mx-auto">
            {[
              {
                icon: Target,
                title: "SEGMENTASI OTOMATIS",
                description: "Algoritma canggih mengelompokkan pelanggan berdasarkan perilaku transaksi.",
                highlight: "bg-secondary",
              },
              {
                icon: Zap,
                title: "INSIGHT SIAP PAKAI",
                description: "Rekomendasi strategi marketing langsung dari data Anda.",
                highlight: "bg-accent text-accent-foreground",
              },
              {
                icon: TrendingUp,
                title: "MUDAH DIGUNAKAN",
                description: "Upload CSV, lihat hasil. Tidak perlu keahlian data science.",
                highlight: "bg-foreground text-background",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="border-3 border-border p-4 sm:p-8 bg-card shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal-lg transition-all group"
              >
                <div className={`w-10 h-10 sm:w-16 sm:h-16 ${feature.highlight} border-3 border-border flex items-center justify-center mb-3 sm:mb-6 group-hover:rotate-6 transition-transform`}>
                  <feature.icon className="w-5 h-5 sm:w-8 sm:h-8" />
                </div>
                <h3 className="text-sm sm:text-xl font-brutal mb-2 sm:mb-4">{feature.title}</h3>
                <p className="font-mono text-[11px] sm:text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-8 sm:py-20 border-t-3 border-border bg-foreground text-background">
        <div className="px-4 sm:px-6 text-center">
          <h2 className="text-xl sm:text-4xl md:text-6xl font-brutal mb-4 sm:mb-8">
            MULAI SEKARANG
          </h2>
          <Button
            size="lg"
            onClick={() => navigate("/auth")}
            className="bg-secondary text-secondary-foreground text-xs sm:text-lg px-6 sm:px-12 py-3 sm:py-6 hover:bg-secondary/90 w-full sm:w-auto max-w-xs"
          >
            DAFTAR GRATIS
            <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Landing;
