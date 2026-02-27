import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Activity, 
  MessageSquare, 
  MapPin, 
  Salad, 
  Heart,
  User,
  LogOut,
  TrendingUp,
  Brain,
  Bell,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Settings,
  FileText,
  Pill
} from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }
      setUser(user);
    } catch (error) {
      console.error("Error checking user:", error);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Error signing out");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header */}
      <header className="border-b border-slate-200/50 bg-white/80 backdrop-blur-xl sticky top-0 z-40 shadow-sm">
        <div className="container flex h-20 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-display font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">HealthAI</span>
              <p className="text-xs text-muted-foreground">Pro Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative hover:bg-slate-100">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full"></span>
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-slate-100" onClick={() => navigate('/profile')}>
              <User className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-slate-100" onClick={() => navigate('/profile')}>
              <Settings className="h-5 w-5" />
            </Button>
            <div className="w-px h-6 bg-slate-200 mx-2"></div>
            <Button variant="ghost" size="icon" onClick={handleSignOut} className="hover:bg-red-50 hover:text-red-600">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-6 py-10">
        {/* Welcome Section */}
        <div className="mb-10 animate-fade-in">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 mb-2">
                Welcome back, {user?.user_metadata?.full_name || "User"}! 👋
              </h1>
              <p className="text-lg text-slate-600">
                Here's your health overview for today. Stay proactive with your wellness journey.
              </p>
            </div>
            <Button size="lg" variant="outline" className="gap-2">
              <Calendar className="h-4 w-4" />
              View Full Report
            </Button>
          </div>
        </div>

        {/* Premium Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { 
              label: "Health Score", 
              value: "85", 
              trend: "+12%",
              icon: TrendingUp, 
              color: "from-green-500 to-emerald-600",
              bg: "bg-green-50",
              positive: true
            },
            { 
              label: "Symptoms Checked", 
              value: "12", 
              trend: "+3 this week",
              icon: Activity, 
              color: "from-blue-500 to-cyan-600",
              bg: "bg-blue-50",
              positive: true
            },
            { 
              label: "Chat Interactions", 
              value: "47", 
              trend: "+8 today",
              icon: MessageSquare, 
              color: "from-purple-500 to-pink-600",
              bg: "bg-purple-50",
              positive: true
            },
            { 
              label: "Diet Plans", 
              value: "3", 
              trend: "Active",
              icon: Salad, 
              color: "from-orange-500 to-red-600",
              bg: "bg-orange-50",
              positive: true
            },
          ].map((stat, index) => (
            <Card 
              key={index} 
              className={`${stat.bg} border-0 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1 animate-fade-in-up`} 
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${stat.color} p-3 shadow-md`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className={`flex items-center gap-1 ${stat.positive ? 'text-green-600' : 'text-red-600'} text-sm font-semibold bg-white rounded-full px-3 py-1`}>
                    {stat.positive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    {stat.trend}
                  </div>
                </div>
                <p className="text-slate-600 text-sm font-medium mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Recent Activity */}
          <Card className="lg:col-span-2 border-0 shadow-sm bg-white/60 backdrop-blur-sm">
            <CardHeader className="border-b border-slate-200/50 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-display">Recent Activity</CardTitle>
                <Button variant="ghost" size="icon" className="hover:bg-slate-100">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {[
                  { type: "Symptom Check", time: "2 hours ago", status: "Completed" },
                  { type: "Diet Plan Created", time: "5 hours ago", status: "Active" },
                  { type: "Health Chat", time: "Yesterday", status: "Completed" },
                  { type: "Hospital Visit Logged", time: "2 days ago", status: "Completed" },
                ].map((activity, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                      <div>
                        <p className="font-medium text-slate-900">{activity.type}</p>
                        <p className="text-sm text-slate-500">{activity.time}</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 bg-green-100 text-green-700 rounded-full">
                      {activity.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader className="border-b border-slate-200/50 pb-4">
              <CardTitle className="text-xl font-display">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Button 
                  onClick={() => navigate('/symptom-checker')}
                  className="w-full justify-start gap-2 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200"
                  variant="outline"
                >
                  <Activity className="h-4 w-4 text-blue-500" />
                  Check Symptoms
                </Button>
                <Button 
                  onClick={() => navigate('/health-chatbot')}
                  className="w-full justify-start gap-2 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200"
                  variant="outline"
                >
                  <MessageSquare className="h-4 w-4 text-purple-500" />
                  Ask a Question
                </Button>
                <Button 
                  onClick={() => navigate('/hospital-finder')}
                  className="w-full justify-start gap-2 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200"
                  variant="outline"
                >
                  <MapPin className="h-4 w-4 text-red-500" />
                  Find Hospital
                </Button>
                <Button 
                  onClick={() => navigate('/diet-planner')}
                  className="w-full justify-start gap-2 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200"
                  variant="outline"
                >
                  <Salad className="h-4 w-4 text-orange-500" />
                  Plan Diet
                </Button>
                <Button 
                  onClick={() => navigate('/health-history')}
                  className="w-full justify-start gap-2 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200"
                  variant="outline"
                >
                  <FileText className="h-4 w-4 text-indigo-500" />
                  View History
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Features Grid */}
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">All Features</h2>
            <p className="text-slate-600">Access all your health management tools</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: "Symptom Checker",
              description: "Analyze your symptoms with AI",
              icon: Activity,
              path: "/symptom-checker",
              gradient: "from-blue-500 to-cyan-600"
            },
            {
              title: "Disease Predictor",
              description: "ML-based disease prediction",
              icon: Brain,
              path: "/disease-predictor",
              gradient: "from-purple-500 to-pink-600"
            },
            {
              title: "Health Chatbot",
              description: "Ask health questions anytime",
              icon: MessageSquare,
              path: "/health-chatbot",
              gradient: "from-blue-500 to-indigo-600"
            },
            {
              title: "Hospital Finder",
              description: "Locate nearby healthcare",
              icon: MapPin,
              path: "/hospital-finder",
              gradient: "from-red-500 to-orange-600"
            },
            {
              title: "Diet Planner",
              description: "Get personalized meal plans",
              icon: Salad,
              path: "/diet-planner",
              gradient: "from-orange-500 to-red-600"
            },
            {
              title: "Health History",
              description: "View your health records",
              icon: Heart,
              path: "/health-history",
              gradient: "from-red-500 to-pink-600"
            },
            {
              title: "Medicine Recommendations",
              description: "Allopathic, Ayurvedic & Home Remedies",
              icon: Pill,
              path: "/medicine-recommender",
              gradient: "from-emerald-500 to-green-600"
            },
            {
              title: "My Profile",
              description: "Manage your account",
              icon: User,
              path: "/profile",
              gradient: "from-indigo-500 to-purple-600"
            },
          ].map((feature, index) => (
            <Card 
              key={index}
              className="hover-lift cursor-pointer border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white/60 backdrop-blur-sm animate-fade-in-up overflow-hidden group"
              style={{ animationDelay: `${(index + 4) * 80}ms` }}
              onClick={() => navigate(feature.path)}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
              <CardHeader className="relative">
                <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-lg font-display text-slate-900">{feature.title}</CardTitle>
                <CardDescription className="text-slate-600">{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;