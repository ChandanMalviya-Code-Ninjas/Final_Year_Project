import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import {
  Activity,
  MessageSquare,
  MapPin,
  Salad,
  Heart,
  User as UserIcon,
  LogOut,
  TrendingUp,
  Brain,
  Bell,
  ArrowUpRight,
  Calendar,
  Settings,
  FileText,
  Pill,
  Clock,
  Stethoscope,
  Hospital,
  Zap,
  BarChart2,
  Shield,
  RefreshCw,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  getRecentActivity,
  formatRelativeTime,
  DashboardStats,
  ActivityLog,
  fetchDashboardStats,
  fetchWeeklyActivity,
  fetchModuleBreakdown,
  WeeklyActivityPoint,
  ModuleUsage,
} from "@/utils/analytics";

// Map activity types to icon + color
const activityMeta: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  "Symptom Check": { icon: Stethoscope, color: "text-blue-600", bg: "bg-blue-100" },
  "Health Chat": { icon: MessageSquare, color: "text-purple-600", bg: "bg-purple-100" },
  "Diet Plan Created": { icon: Salad, color: "text-orange-600", bg: "bg-orange-100" },
  "Hospital Search": { icon: Hospital, color: "text-red-600", bg: "bg-red-100" },
  "Disease Predictor": { icon: Brain, color: "text-pink-600", bg: "bg-pink-100" },
  "Medicine Recommender": { icon: Pill, color: "text-emerald-600", bg: "bg-emerald-100" },
  "Medication Added": { icon: Clock, color: "text-indigo-600", bg: "bg-indigo-100" },
  "Medication Taken": { icon: Shield, color: "text-cyan-600", bg: "bg-cyan-100" },
  "Profile Updated": { icon: UserIcon, color: "text-slate-600", bg: "bg-slate-100" },
};

const getActivityMeta = (type: string) =>
  activityMeta[type] || { icon: Activity, color: "text-slate-600", bg: "bg-slate-100" };

// Animated counter hook
const useAnimatedCounter = (target: number, duration = 1200) => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setValue(target); clearInterval(timer); }
      else setValue(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
};

// Single stat card with animated counter
const StatCard = ({
  label, value, trend, icon: Icon, gradient, bg, unit = ""
}: {
  label: string; value: number; trend: string; icon: React.ElementType;
  gradient: string; bg: string; unit?: string;
}) => {
  const animated = useAnimatedCounter(value);
  return (
    <Card className={`${bg} border-0 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 group`}>
      <CardContent className="pt-6 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${gradient} p-3 shadow-md group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <span className="flex items-center gap-1 text-green-700 text-xs font-semibold bg-white rounded-full px-3 py-1 shadow-sm">
            <ArrowUpRight className="h-3 w-3" />
            {trend}
          </span>
        </div>
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-1">{label}</p>
        <p className="text-3xl font-bold text-slate-900">
          {animated}{unit}
        </p>
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyActivityPoint[]>([]);
  const [moduleData, setModuleData] = useState<ModuleUsage[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const loadDashboardData = useCallback(async (userId: string) => {
    const [statsData, recentActivities, weekly, modules] = await Promise.all([
      fetchDashboardStats(userId),
      getRecentActivity(userId, 6),
      fetchWeeklyActivity(userId),
      fetchModuleBreakdown(userId),
    ]);
    setStats(statsData);
    setActivities(recentActivities);
    setWeeklyData(weekly);
    setModuleData(modules);
    setLastUpdated(new Date());
  }, []);

  useEffect(() => {
    let channel: any;

    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { navigate("/login"); return; }
        setUser(user);
        await loadDashboardData(user.id);

        // Real-time subscription
        channel = supabase
          .channel(`dashboard-live-${user.id}`)
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "user_activity_logs", filter: `user_id=eq.${user.id}` },
            () => { loadDashboardData(user.id); }
          )
          .subscribe((status) => {
            setIsLive(status === "SUBSCRIBED");
          });
      } catch (error) {
        console.error("Error checking user:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    checkUser();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, [navigate, loadDashboardData]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
      navigate("/");
    } catch { toast.error("Error signing out"); }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500/30 border-t-blue-400 mx-auto" />
            <Heart className="h-6 w-6 text-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="text-blue-200 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "there";

  const mainStats = [
    {
      label: "Health Score",
      value: stats?.healthScore || 60,
      trend: "Live",
      icon: TrendingUp,
      gradient: "from-green-500 to-emerald-600",
      bg: "bg-green-50",
      unit: "",
    },
    {
      label: "Symptom Checks",
      value: stats?.symptomsChecked || 0,
      trend: "Total",
      icon: Stethoscope,
      gradient: "from-blue-500 to-cyan-600",
      bg: "bg-blue-50",
      unit: "",
    },
    {
      label: "Chat Sessions",
      value: stats?.chatInteractions || 0,
      trend: "Total",
      icon: MessageSquare,
      gradient: "from-purple-500 to-pink-600",
      bg: "bg-purple-50",
      unit: "",
    },
    {
      label: "Diet Plans",
      value: stats?.dietPlans || 0,
      trend: "Active",
      icon: Salad,
      gradient: "from-orange-500 to-red-600",
      bg: "bg-orange-50",
      unit: "",
    },
    {
      label: "Med. Adherence",
      value: stats?.medicationAdherence || 0,
      trend: "%",
      icon: Shield,
      gradient: "from-indigo-500 to-purple-600",
      bg: "bg-indigo-50",
      unit: "%",
    },
  ];

  const totalActivities = weeklyData.reduce((s, d) => s + d.activities, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Header */}
      <header className="border-b border-white/60 bg-white/80 backdrop-blur-xl sticky top-0 z-40 shadow-sm">
        <div className="container flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                HealthAI
              </span>
              <div className="flex items-center gap-1.5">
                <div className={`h-2 w-2 rounded-full ${isLive ? "bg-green-500 animate-pulse" : "bg-slate-400"}`} />
                <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  {isLive ? "Live" : "Connecting..."}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1 text-xs text-slate-400 mr-2">
              <RefreshCw className="h-3 w-3" />
              {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
            <Button variant="ghost" size="icon" className="relative hover:bg-slate-100 h-9 w-9">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-red-500 rounded-full" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-slate-100 h-9 w-9" onClick={() => navigate("/profile")}>
              <UserIcon className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-slate-100 h-9 w-9" onClick={() => navigate("/profile")}>
              <Settings className="h-4 w-4" />
            </Button>
            <div className="w-px h-5 bg-slate-200 mx-1" />
            <Button variant="ghost" size="icon" onClick={handleSignOut} className="hover:bg-red-50 hover:text-red-600 h-9 w-9">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container px-4 md:px-6 py-8 max-w-7xl mx-auto">
        {/* Welcome Banner */}
        <div className="mb-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 md:p-8 shadow-xl">
            {/* Decorative circles */}
            <div className="absolute -top-8 -right-8 h-48 w-48 rounded-full bg-white/5" />
            <div className="absolute -bottom-12 -left-12 h-64 w-64 rounded-full bg-white/5" />
            <div className="absolute top-4 right-20 h-24 w-24 rounded-full bg-white/5" />

            <div className="relative flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-blue-300 animate-pulse" />
                  <span className="text-blue-200 text-sm font-medium">AI Health Dashboard</span>
                </div>
                <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
                  Welcome back, {firstName}! 👋
                </h1>
                <p className="text-blue-200 text-sm md:text-base">
                  Your health analytics are live and updating in real-time.
                  {totalActivities > 0
                    ? ` You've completed ${totalActivities} activities this week.`
                    : " Start using modules to see your analytics grow!"}
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => navigate("/health-history")}
                className="hidden md:flex gap-2 bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm"
              >
                <Calendar className="h-4 w-4" />
                Full Report
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {mainStats.map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-5 gap-6 mb-8">
          {/* Weekly Activity Chart — 3 cols */}
          <Card className="lg:col-span-3 border-0 shadow-sm bg-white/70 backdrop-blur-sm">
            <CardHeader className="pb-2 pt-5 px-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-800">Weekly Activity</CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5">Last 7 days · {totalActivities} total</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full font-medium">
                  <Zap className="h-3 w-3" />
                  Real-time
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-4 px-2">
              {weeklyData.length > 0 && weeklyData.some(d => d.activities > 0) ? (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={weeklyData} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="activityGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ background: "white", border: "none", borderRadius: 10, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", fontSize: 12 }}
                      labelStyle={{ color: "#1e293b", fontWeight: 600 }}
                      formatter={(value: number) => [`${value} activities`, "Count"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="activities"
                      stroke="#3b82f6"
                      strokeWidth={2.5}
                      fill="url(#activityGrad)"
                      dot={{ fill: "#3b82f6", r: 4, strokeWidth: 2, stroke: "white" }}
                      activeDot={{ r: 6, fill: "#2563eb" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[200px] flex flex-col items-center justify-center gap-3 text-slate-400">
                  <BarChart2 className="h-10 w-10 text-slate-200" />
                  <p className="text-sm font-medium">No activity yet this week</p>
                  <p className="text-xs">Use any health module to see your chart grow</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Module Breakdown — 2 cols */}
          <Card className="lg:col-span-2 border-0 shadow-sm bg-white/70 backdrop-blur-sm">
            <CardHeader className="pb-2 pt-5 px-6">
              <CardTitle className="text-base font-bold text-slate-800">Module Usage</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">All-time breakdown</p>
            </CardHeader>
            <CardContent className="pb-4">
              {moduleData.length > 0 ? (
                <div className="flex flex-col">
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie
                        data={moduleData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={68}
                        dataKey="count"
                        paddingAngle={3}
                      >
                        {moduleData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: "white", border: "none", borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.08)", fontSize: 12 }}
                        formatter={(value: number, name: string) => [`${value}x`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1.5 mt-1">
                    {moduleData.slice(0, 4).map((m, i) => (
                      <div key={i} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: m.color }} />
                          <span className="text-xs text-slate-600 truncate">{m.name}</span>
                        </div>
                        <span className="text-xs font-bold text-slate-800 flex-shrink-0">{m.count}x</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-[200px] flex flex-col items-center justify-center gap-2 text-slate-400">
                  <BarChart2 className="h-10 w-10 text-slate-200" />
                  <p className="text-sm font-medium">No data yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed + Quick Actions */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Activity */}
          <Card className="lg:col-span-2 border-0 shadow-sm bg-white/70 backdrop-blur-sm">
            <CardHeader className="border-b border-slate-100 pb-4 pt-5 px-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-800">Recent Activity</CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5">Last 6 events · auto-updating</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs gap-1 text-blue-600 hover:bg-blue-50"
                  onClick={() => navigate("/health-history")}
                >
                  View all <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4 px-6 pb-4">
              <div className="space-y-2">
                {activities.length > 0 ? (
                  activities.map((activity, idx) => {
                    const meta = getActivityMeta(activity.type);
                    const Icon = meta.icon;
                    const statusColor =
                      activity.status === "Completed"
                        ? "text-green-700 bg-green-100 border-green-200"
                        : activity.status === "Active"
                          ? "text-blue-700 bg-blue-100 border-blue-200"
                          : "text-slate-600 bg-slate-100 border-slate-200";
                    return (
                      <div
                        key={activity.id || idx}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                        onClick={() => activity.path && navigate(activity.path)}
                      >
                        <div className={`h-9 w-9 rounded-xl ${meta.bg} flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`h-4 w-4 ${meta.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{activity.type}</p>
                          <p className="text-xs text-slate-400">{formatRelativeTime(activity.time)}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor} flex-shrink-0`}>
                          {activity.status}
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-10">
                    <Activity className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm font-medium">No activity yet</p>
                    <p className="text-slate-400 text-xs mt-1">Start exploring the health modules below!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-slate-800 to-slate-900">
            <CardHeader className="pb-3 pt-5 px-6">
              <CardTitle className="text-base font-bold text-white">Quick Actions</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">Jump to any module</p>
            </CardHeader>
            <CardContent className="px-4 pb-5">
              <div className="space-y-2">
                {[
                  { label: "Check Symptoms", icon: Stethoscope, path: "/symptom-checker", color: "from-blue-500 to-cyan-500" },
                  { label: "Health Chat", icon: MessageSquare, path: "/health-chatbot", color: "from-purple-500 to-pink-500" },
                  { label: "Find Hospital", icon: MapPin, path: "/hospital-finder", color: "from-red-500 to-orange-500" },
                  { label: "Plan My Diet", icon: Salad, path: "/diet-planner", color: "from-orange-500 to-yellow-500" },
                  { label: "Predict Disease", icon: Brain, path: "/disease-predictor", color: "from-pink-500 to-rose-500" },
                  { label: "Medication Reminders", icon: Clock, path: "/medication-reminder", color: "from-indigo-500 to-purple-500" },
                ].map((action, i) => (
                  <button
                    key={i}
                    onClick={() => navigate(action.path)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/10 hover:bg-white/15 text-white transition-all duration-200 hover:translate-x-1 group text-left"
                  >
                    <div className={`h-7 w-7 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center flex-shrink-0`}>
                      <action.icon className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="text-sm font-medium flex-1">{action.label}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-white/30 group-hover:text-white/60 transition-colors" />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Extended Analytics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
            <CardContent className="pt-6 pb-5 px-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Disease Predictions</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{stats?.diseasePredictions || 0}</p>
                </div>
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-1">
                <Activity className="h-3 w-3" /> ML model predictions run
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
            <CardContent className="pt-6 pb-5 px-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Medicine Recs.</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{stats?.medicineRecommendations || 0}</p>
                </div>
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                  <Pill className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-1">
                <Activity className="h-3 w-3" /> AI recommendations fetched
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
            <CardContent className="pt-6 pb-5 px-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Hospitals Found</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{stats?.hospitalsSearched || 0}</p>
                </div>
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
                  <Hospital className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-1">
                <Activity className="h-3 w-3" /> Location-based searches
              </div>
            </CardContent>
          </Card>
        </div>

        {/* All Features Grid */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 mb-1">All Modules</h2>
          <p className="text-slate-500 text-sm">Access all your health management tools</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: "Symptom Checker", description: "AI symptom analysis", icon: Stethoscope, path: "/symptom-checker", gradient: "from-blue-500 to-cyan-600" },
            { title: "Disease Predictor", description: "ML-based disease prediction", icon: Brain, path: "/disease-predictor", gradient: "from-purple-500 to-pink-600" },
            { title: "Health Chatbot", description: "Ask health questions 24/7", icon: MessageSquare, path: "/health-chatbot", gradient: "from-blue-500 to-indigo-600" },
            { title: "Hospital Finder", description: "Locate nearby healthcare", icon: Hospital, path: "/hospital-finder", gradient: "from-red-500 to-orange-600" },
            { title: "Diet Planner", description: "Personalized meal plans", icon: Salad, path: "/diet-planner", gradient: "from-orange-500 to-red-600" },
            { title: "Health History", description: "Full records & analytics", icon: FileText, path: "/health-history", gradient: "from-slate-500 to-slate-700" },
            { title: "Medicine Recommender", description: "Allopathic, Ayurvedic & more", icon: Pill, path: "/medicine-recommender", gradient: "from-emerald-500 to-green-600" },
            { title: "My Profile", description: "Manage your account", icon: UserIcon, path: "/profile", gradient: "from-indigo-500 to-purple-600" },
            { title: "Medication Reminders", description: "Track & manage medications", icon: Clock, path: "/medication-reminder", gradient: "from-purple-500 to-indigo-600" },
          ].map((feature, index) => (
            <Card
              key={index}
              className="cursor-pointer border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white/70 backdrop-blur-sm overflow-hidden group"
              onClick={() => navigate(feature.path)}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              <CardContent className="pt-5 pb-5 px-5 relative flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-sm">{feature.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{feature.description}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0" />
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-center text-xs text-slate-400 mt-8 mb-4">
          HealthAI Pro Dashboard · Real-time analytics via Supabase ·{" "}
          <span className="text-green-500 font-semibold">{isLive ? "● Live" : "○ Offline"}</span>
        </p>
      </main>
    </div>
  );
};

export default Dashboard;