import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Target, Zap, TrendingUp, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl floating" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl floating" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-primary opacity-10 rounded-full blur-3xl" />
        </div>

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
                  { label: "Total Customers", value: "1,247" },
                  { label: "Active Segments", value: "4" },
                  { label: "Avg. Transaction", value: "Rp 247K" },
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
                  <p className="text-muted-foreground">Beautiful Analytics Dashboard</p>
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
