import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar, 
  TrendingUp, 
  MessageSquare, 
  User, 
  Settings,
  LogOut,
  Home,
  BookOpen,
  Target,
  BarChart3,
  Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import prepiqLogo from "@/assets/prepiq-logo.jpg";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("home");
  const [user, setUser] = useState<any>(null);
  const [quizStats, setQuizStats] = useState({ totalQuizzes: 0, avgScore: 0 });
  const [recentQuizzes, setRecentQuizzes] = useState<any[]>([]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/login");
      } else {
        setUser(session.user);
        loadQuizData(session.user.email || session.user.id);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/login");
      } else {
        setUser(session.user);
        loadQuizData(session.user.email || session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadQuizData = async (userId: string) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || '';
      
      // Load analytics
      const analyticsRes = await fetch(`${backendUrl}/api/quiz/analytics/${userId}`);
      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setQuizStats({
          totalQuizzes: analyticsData.total_quizzes || 0,
          avgScore: analyticsData.average_score || 0,
        });
      }

      // Load recent history
      const historyRes = await fetch(`${backendUrl}/api/quiz/history/${userId}`);
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setRecentQuizzes(historyData.slice(0, 3));
      }
    } catch (error) {
      console.error("Error loading quiz data:", error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
    navigate("/login");
  };

  const stats = [
    { label: "Study Hours", value: "24.5", icon: BookOpen, color: "text-primary" },
    { label: "Quizzes Done", value: quizStats.totalQuizzes.toString(), icon: Target, color: "text-secondary" },
    { label: "Average Score", value: quizStats.avgScore > 0 ? `${quizStats.avgScore.toFixed(0)}%` : "N/A", icon: TrendingUp, color: "text-success" },
  ];

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const recentActivity = recentQuizzes.length > 0 
    ? recentQuizzes.map(quiz => ({
        topic: `${quiz.subject} - ${quiz.module}`,
        time: formatTimeAgo(quiz.timestamp),
        score: `${quiz.score_percentage.toFixed(0)}%`,
      }))
    : [
        { topic: "No quizzes yet", time: "Start learning", score: "-" },
      ];

  const getUserInitials = () => {
    if (!user) return "ST";
    const name = user.user_metadata?.full_name || user.email || "Student";
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border p-6 hidden lg:block">
        <div className="flex items-center gap-2 mb-8">
          <img src={prepiqLogo} alt="PrepIQ Logo" className="w-10 h-10 rounded-lg" />
          <span className="text-xl font-bold">PrepIQ</span>
        </div>

        <nav className="space-y-2">
          {[
            { id: "home", label: "Dashboard", icon: Home },
            { id: "profile", label: "My Profile", icon: User },
            { id: "schedule", label: "Study Schedule", icon: Calendar },
            { id: "progress", label: "Progress", icon: BarChart3, route: "/performance" },
            { id: "concepts", label: "Concept Library", icon: BookOpen, route: "/concept-library" },
            { id: "chat", label: "AI Tutor", icon: MessageSquare },
            { id: "quiz", label: "Quiz Generator", icon: Sparkles, route: "/quiz-generator" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.route) {
                  navigate(item.route);
                } else {
                  setActiveTab(item.id);
                }
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === item.id
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-6 left-6 right-6 space-y-2">
          <Button variant="ghost" className="w-full justify-start" size="lg" onClick={() => setActiveTab("settings")}>
            <Settings className="w-5 h-5 mr-3" />
            Settings
          </Button>
          <Button variant="ghost" className="w-full justify-start text-destructive" size="lg" onClick={handleLogout}>
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Welcome back, {user?.user_metadata?.full_name || 'Student'}!</h1>
            <p className="text-muted-foreground">Let's make today productive</p>
          </div>
          <Avatar className="h-12 w-12 border-2 border-primary">
            <AvatarImage src="" />
            <AvatarFallback className="bg-gradient-primary text-white font-semibold">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card 
              key={index} 
              className="p-6 hover:shadow-lg transition-all hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-3">
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
                <div className="text-3xl font-bold">{stat.value}</div>
              </div>
              <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Chat Interface */}
          <Card className="p-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-3 mb-4">
              <img src={prepiqLogo} alt="PrepIQ" className="w-12 h-12 rounded-full" />
              <div>
                <h3 className="text-xl font-bold">AI Study Buddy</h3>
                <p className="text-sm text-muted-foreground">Ask me anything!</p>
              </div>
            </div>

            <div className="space-y-4 mb-4 h-64 overflow-y-auto">
              {/* Sample messages */}
              <div className="flex gap-3">
                <img src={prepiqLogo} alt="AI" className="w-8 h-8 rounded-full flex-shrink-0" />
                <div className="bg-accent rounded-lg p-3 flex-1">
                  <p className="text-sm">
                    Hi! I'm your AI study companion. I can help you understand complex topics, 
                    create quizzes, or plan your study schedule. What would you like to work on today?
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type your question..."
                className="flex-1 h-10 px-4 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
              <Button className="bg-gradient-primary hover:opacity-90">
                <MessageSquare className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
              <Button variant="outline" size="sm">Explain a topic</Button>
              <Button variant="outline" size="sm">Generate quiz</Button>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-success" />
                Recent Activity
              </h3>
              {quizStats.totalQuizzes > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate("/quiz-history")}
                >
                  View All
                </Button>
              )}
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted hover:bg-accent transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium mb-1">{activity.topic}</p>
                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-success">{activity.score}</div>
                    <p className="text-xs text-muted-foreground">Score</p>
                  </div>
                </div>
              ))}
            </div>
            {quizStats.totalQuizzes === 0 && (
              <div className="text-center py-4">
                <Button 
                  onClick={() => navigate("/quiz-generator")}
                  className="bg-gradient-primary"
                >
                  Take Your First Quiz
                </Button>
              </div>
            )}
          </Card>

          {/* Study Schedule */}
          <Card className="p-6 lg:col-span-2 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              This Week's Schedule
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { day: "Monday", subject: "Mathematics", time: "10:00 AM - 12:00 PM" },
                { day: "Tuesday", subject: "Physics", time: "2:00 PM - 4:00 PM" },
                { day: "Wednesday", subject: "Chemistry", time: "10:00 AM - 12:00 PM" },
                { day: "Thursday", subject: "Biology", time: "3:00 PM - 5:00 PM" },
                { day: "Friday", subject: "Mathematics", time: "10:00 AM - 12:00 PM" },
                { day: "Saturday", subject: "Mock Test", time: "9:00 AM - 12:00 PM" },
              ].map((session, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border-2 border-border hover:border-primary transition-colors"
                >
                  <div className="font-bold text-primary mb-1">{session.day}</div>
                  <div className="font-semibold mb-1">{session.subject}</div>
                  <div className="text-sm text-muted-foreground">{session.time}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;