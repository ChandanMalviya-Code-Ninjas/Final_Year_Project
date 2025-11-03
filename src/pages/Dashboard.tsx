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
  TrendingUp
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-lg">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Heart className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold">HealthAI</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
            Welcome back, {user?.user_metadata?.full_name || "User"}!
          </h1>
          <p className="text-muted-foreground">
            Here's your health dashboard. What would you like to do today?
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Health Score", value: "85", icon: TrendingUp, color: "text-success" },
            { label: "Symptoms Checked", value: "12", icon: Activity, color: "text-primary" },
            { label: "Chat Messages", value: "47", icon: MessageSquare, color: "text-secondary" },
            { label: "Diet Plans", value: "3", icon: Salad, color: "text-primary" },
          ].map((stat, index) => (
            <Card key={index} className="animate-fade-in-up shadow-soft" style={{ animationDelay: `${index * 100}ms` }}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: "Symptom Checker",
              description: "Analyze your symptoms with AI",
              icon: Activity,
              path: "/symptom-checker",
              gradient: "gradient-primary"
            },
            {
              title: "Health Chatbot",
              description: "Ask health questions anytime",
              icon: MessageSquare,
              path: "/health-chatbot",
              gradient: "gradient-secondary"
            },
            {
              title: "Hospital Finder",
              description: "Locate nearby healthcare",
              icon: MapPin,
              path: "/hospital-finder",
              gradient: "gradient-primary"
            },
            {
              title: "Diet Planner",
              description: "Get personalized meal plans",
              icon: Salad,
              path: "/diet-planner",
              gradient: "gradient-secondary"
            },
            {
              title: "Health History",
              description: "View your health records",
              icon: Heart,
              path: "/health-history",
              gradient: "gradient-primary"
            },
            {
              title: "My Profile",
              description: "Manage your account",
              icon: User,
              path: "/profile",
              gradient: "gradient-secondary"
            },
          ].map((feature, index) => (
            <Card 
              key={index}
              className="hover-lift cursor-pointer border-0 shadow-soft gradient-card animate-fade-in-up"
              style={{ animationDelay: `${(index + 4) * 100}ms` }}
              onClick={() => navigate(feature.path)}
            >
              <CardHeader>
                <div className={`h-14 w-14 rounded-xl ${feature.gradient} flex items-center justify-center mb-4 shadow-glow`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl font-display">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;