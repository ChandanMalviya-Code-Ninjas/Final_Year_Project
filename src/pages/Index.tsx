import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Activity, 
  MessageSquare, 
  MapPin, 
  Salad, 
  Heart, 
  Shield, 
  Sparkles,
  ArrowRight,
  Clock,
  Users,
  CheckCircle,
  Zap,
  Brain,
  BarChart3,
  Award,
  Send,
  Star
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="container flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <span className="text-lg font-display font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">HealthAI</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors">How It Works</a>
            <a href="#testimonials" className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors">Testimonials</a>
            <a href="#stats" className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors">Impact</a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="text-slate-700 hover:text-blue-600">
              <Link to="/login">Sign In</Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all">
              <Link to="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center animate-fade-in-up">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700 mb-8 border border-blue-200">
              <Sparkles className="h-4 w-4" />
              AI-Powered Healthcare Revolution
              <Zap className="h-4 w-4" />
            </div>
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-display font-bold tracking-tighter mb-8 bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent leading-tight">
              Your Intelligent Health Companion
            </h1>
            <p className="text-xl md:text-2xl text-slate-700 mb-10 leading-relaxed font-light max-w-3xl mx-auto">
              Advanced AI technology meets personalized healthcare. Get instant symptom analysis, disease predictions, nutrition planning, and hospital recommendations—all designed for your wellness.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" asChild className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-base h-14 px-8 shadow-xl hover:shadow-2xl hover:scale-105 transition-all">
                <Link to="/register">
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base h-14 px-8 border-2 border-slate-300 hover:border-blue-500 hover:text-blue-600">
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
            <div className="flex items-center justify-center gap-12 text-sm text-slate-600 flex-wrap">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                <span className="font-medium">HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                <span className="font-medium">50,000+ Active Users</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-500" />
                <span className="font-medium">24/7 Available</span>
              </div>
            </div>
          </div>

          {/* Hero Visual - Floating Cards */}
          <div className="mt-16 relative h-96">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl blur-3xl"></div>
            <div className="grid grid-cols-3 gap-4 relative h-full">
              {[
                { icon: Activity, label: "Symptom Analysis", color: "from-blue-500" },
                { icon: Brain, label: "AI Prediction", color: "from-purple-500" },
                { icon: Salad, label: "Nutrition Plans", color: "from-green-500" },
              ].map((item, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-center cursor-pointer group"
                  onClick={() => navigate("/register")}
                >
                  <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur w-full h-32 hover:shadow-3xl transition-all hover:-translate-y-2 group-hover:bg-white">
                    <CardContent className="flex flex-col items-center justify-center h-full">
                      <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${item.color} to-pink-600 flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                        <item.icon className="h-6 w-6 text-white" />
                      </div>
                      <p className="text-sm font-semibold text-slate-900 text-center">{item.label}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 bg-white">
        <div className="container">
          <div className="text-center mb-20 animate-fade-in">
            <h2 className="text-5xl md:text-6xl font-display font-bold text-slate-900 mb-6">
              Powerful Features for Complete Health Management
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Everything you need to take control of your health, powered by cutting-edge AI and machine learning
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Activity,
                title: "Smart Symptom Checker",
                description: "Advanced AI analyzes your symptoms with medical precision to identify possible conditions and provide immediate guidance",
                features: ["Real-time Analysis", "ML-Powered", "Instant Results"],
                color: "from-blue-500 to-cyan-600"
              },
              {
                icon: MessageSquare,
                title: "AI Health Chatbot",
                description: "Talk to our intelligent assistant 24/7 for personalized health advice, medication information, and wellness tips",
                features: ["Always Available", "Personalized", "Expert Knowledge"],
                color: "from-purple-500 to-pink-600"
              },
              {
                icon: MapPin,
                title: "Hospital Locator",
                description: "Find nearby hospitals, clinics, and pharmacies with detailed ratings, reviews, and direct contact information",
                features: ["Real Location Data", "Reviews", "Navigation Ready"],
                color: "from-red-500 to-orange-600"
              },
              {
                icon: Salad,
                title: "Personalized Diet Plans",
                description: "Get customized nutrition plans based on your health conditions, preferences, and dietary restrictions",
                features: ["Tailored Plans", "Nutritionist Approved", "Easy to Follow"],
                color: "from-green-500 to-emerald-600"
              },
              {
                icon: Brain,
                title: "Disease Prediction",
                description: "ML models predict disease risk based on health data, helping you take preventive action early",
                features: ["Predictive Models", "Risk Assessment", "Prevention Tips"],
                color: "from-indigo-500 to-purple-600"
              },
              {
                icon: Heart,
                title: "Health History Tracking",
                description: "Maintain comprehensive health records with all your consultations, tests, and medical history in one secure place",
                features: ["Complete Records", "Secure Storage", "Easy Access"],
                color: "from-rose-500 to-red-600"
              }
            ].map((feature, index) => (
              <Card 
                key={index} 
                className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer overflow-hidden group bg-white animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => navigate("/register")}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                <CardHeader className="relative">
                  <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl font-display text-slate-900 mb-2">{feature.title}</CardTitle>
                  <CardDescription className="text-slate-600 text-base mb-4">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative pt-0">
                  <div className="flex flex-wrap gap-2">
                    {feature.features.map((f, idx) => (
                      <span key={idx} className={`text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r ${feature.color} bg-opacity-10 text-slate-700`}>
                        {f}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-24 px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { number: "50K+", label: "Active Users", icon: Users },
              { number: "2M+", label: "Analyses Done", icon: BarChart3 },
              { number: "99%", label: "Accuracy Rate", icon: Award },
              { number: "24/7", label: "Availability", icon: Clock }
            ].map((stat, index) => (
              <div key={index} className="text-center text-white animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-2xl">
                  <stat.icon className="h-8 w-8" />
                </div>
                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-slate-300 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4 bg-slate-50">
        <div className="container">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-display font-bold text-slate-900 mb-6">
              Simple, Secure, and Smart
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Get started in minutes and experience healthcare reimagined
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                title: "Create Your Account",
                description: "Sign up in seconds with your email. Your medical data is encrypted and HIPAA-compliant for complete privacy."
              },
              {
                step: "02", 
                title: "Share Your Health Data",
                description: "Input your symptoms, medical history, or ask health questions. Our AI learns your health profile for personalized insights."
              },
              {
                step: "03",
                title: "Get Intelligent Insights",
                description: "Receive AI-powered recommendations, personalized plans, and real-time support for your health journey."
              }
            ].map((step, index) => (
              <div 
                key={index} 
                className="text-center animate-fade-in-up cursor-pointer group p-6 rounded-xl hover:bg-white transition-all duration-300 hover:shadow-lg" 
                style={{ animationDelay: `${index * 200}ms` }}
                onClick={() => navigate("/register")}
              >
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl font-bold text-white mx-auto mb-6 shadow-2xl group-hover:shadow-3xl group-hover:scale-110 transition-all">
                  {step.step}
                </div>
                <h3 className="text-2xl font-display font-bold text-slate-900 mb-4">{step.title}</h3>
                <p className="text-slate-600 leading-relaxed text-lg">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 px-4 bg-white">
        <div className="container">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-display font-bold text-slate-900 mb-6">
              Trusted by Healthcare Professionals
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              See how HealthAI is transforming lives around the world
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Dr. Sarah Johnson",
                role: "Cardiologist",
                text: "HealthAI has revolutionized how my patients monitor their health. The accuracy and ease of use are impressive.",
                rating: 5
              },
              {
                name: "Michael Chen",
                role: "Patient",
                text: "I caught a potential issue early thanks to HealthAI's analysis. It's like having a doctor in your pocket.",
                rating: 5
              },
              {
                name: "Dr. Emily Rodriguez",
                role: "Dr. Emily Rodriguez",
                text: "The AI-powered insights help me provide better care for my patients. Highly recommend for any practice.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <Card 
                key={index}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-slate-50 to-blue-50 animate-fade-in-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <CardContent className="pt-8">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-slate-700 mb-6 text-lg italic leading-relaxed">"{testimonial.text}"</p>
                  <div>
                    <p className="font-semibold text-slate-900">{testimonial.name}</p>
                    <p className="text-sm text-slate-600">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="container">
          <Card className="border-0 shadow-2xl bg-white/10 backdrop-blur-sm">
            <CardContent className="p-16 text-center">
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white mb-6">
                Ready to Transform Your Health?
              </h2>
              <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
                Join thousands of users who are taking control of their health with HealthAI's intelligent platform
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild className="bg-white text-blue-600 hover:bg-slate-100 text-base h-14 px-8 shadow-xl font-semibold">
                  <Link to="/register">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-white border-white hover:bg-white/10 text-base h-14 px-8 border-2">
                  <Link to="/login">Sign In</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-16 px-4 bg-slate-900">
        <div className="container">
          <div className="grid md:grid-cols-5 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <span className="text-lg font-display font-bold text-white">HealthAI</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Your intelligent health companion powered by advanced AI technology and medical expertise.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Get Started</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Compliance</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Support</h3>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-8 text-center text-slate-400 text-sm">
            <p>© 2025 HealthAI. All rights reserved. Not a substitute for professional medical advice.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
