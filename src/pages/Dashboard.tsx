import { Card } from "@/components/ui/card";
import { Users, ShoppingCart, TrendingUp, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

const segments = [
  {
    name: "Champions",
    color: "from-green-500 to-emerald-500",
    customers: 287,
    percentage: 23,
    avgSpend: "Rp 875K",
  },
  {
    name: "Loyal Customers",
    color: "from-blue-500 to-cyan-500",
    customers: 412,
    percentage: 33,
    avgSpend: "Rp 542K",
  },
  {
    name: "At Risk",
    color: "from-orange-500 to-amber-500",
    customers: 324,
    percentage: 26,
    avgSpend: "Rp 318K",
  },
  {
    name: "Lost",
    color: "from-red-500 to-rose-500",
    customers: 224,
    percentage: 18,
    avgSpend: "Rp 156K",
  },
];

const insights = [
  {
    title: "Top Performing Segment",
    description: "Champions segment menghasilkan 45% dari total revenue meskipun hanya 23% dari customer base.",
    impact: "High Impact",
  },
  {
    title: "Churn Alert",
    description: "324 pelanggan berada dalam kategori 'At Risk'. Retensi strategi diperlukan segera.",
    impact: "Critical",
  },
  {
    title: "Growth Opportunity",
    description: "Loyal Customers memiliki potensi upgrade ke Champions dengan targeted campaign.",
    impact: "Medium Impact",
  },
];

const Dashboard = () => {
  const navigate = useNavigate();

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
          { icon: Users, label: "Total Customers", value: "1,247", change: "+12.5%" },
          { icon: ShoppingCart, label: "Total Transactions", value: "8,942", change: "+8.3%" },
          { icon: TrendingUp, label: "Avg. Spend", value: "Rp 247K", change: "+15.2%" },
        ].map((metric, i) => (
          <Card key={i} className="glass-card-strong p-6 hover:glow-effect transition-all duration-300 floating">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-${i === 0 ? 'primary' : i === 1 ? 'primary' : 'primary'} bg-opacity-20 flex items-center justify-center`}>
                <metric.icon className="w-6 h-6 text-primary" />
              </div>
              <span className="text-sm px-2 py-1 rounded-full glass-card text-secondary">
                {metric.change}
              </span>
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
              onClick={() => navigate("/segments")}
            >
              <div className="flex items-center justify-between mb-4">
                <Target className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
                <div className="text-2xl font-bold">{segment.percentage}%</div>
              </div>
              <h3 className="text-xl font-bold mb-2">{segment.name}</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Customers:</span>
                  <span className="text-foreground font-semibold">{segment.customers}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Spend:</span>
                  <span className="text-foreground font-semibold">{segment.avgSpend}</span>
                </div>
              </div>
              <div className={`h-2 rounded-full bg-gradient-to-r ${segment.color} mt-4`} />
            </Card>
          ))}
        </div>
      </div>

      {/* Insights Section */}
      <div>
        <h2 className="text-3xl font-bold mb-6">Key Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {insights.map((insight, i) => (
            <Card key={i} className="glass-card-strong p-6 hover:glow-effect transition-all duration-300">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-3 h-3 rounded-full ${
                  insight.impact === "High Impact" ? "bg-green-500" :
                  insight.impact === "Critical" ? "bg-red-500" : "bg-yellow-500"
                } animate-pulse`} />
                <span className="text-xs font-semibold text-muted-foreground">{insight.impact}</span>
              </div>
              <h3 className="text-lg font-bold mb-2">{insight.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{insight.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
