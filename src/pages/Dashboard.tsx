import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  ChevronDown,
  UserCircle,
  Bell,
  Palette
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

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/login");
      } else {
        setUser(session.user);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/login");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

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
    { label: "Quizzes Done", value: "12", icon: Target, color: "text-secondary" },
    { label: "Current Streak", value: "7 Days", icon: TrendingUp, color: "text-success" },
  ];

  const recentActivity = [
    { topic: "Organic Chemistry - Reactions", time: "2 hours ago", score: "85%" },
    { topic: "Calculus - Derivatives", time: "1 day ago", score: "92%" },
    { topic: "Physics - Mechanics", time: "2 days ago", score: "78%" },
  ];

  const getUserInitials = () => {
    if (!user) return "ST";
    const name = user.user_metadata?.full_name || user.email || "Student";
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6 hidden lg:block relative">
        <div className="flex items-center gap-2 mb-6">
          <img src={prepiqLogo} alt="PrepIQ Logo" className="w-10 h-10 rounded-lg" />
          <span className="text-xl font-bold text-white">PrepIQ</span>
        </div>

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-3 p-3 mb-6 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-all duration-300 border border-slate-700 hover:border-primary/50 group">
              <Avatar className="h-10 w-10 border-2 border-primary ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300">
                <AvatarImage src="" />
                <AvatarFallback className="bg-gradient-primary text-white font-semibold text-sm">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-white group-hover:text-primary transition-colors duration-300">
                  {user?.user_metadata?.full_name || 'Student'}
                </p>
                <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors duration-300">
                  {user?.email}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-primary transition-all duration-300 group-hover:rotate-180" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-slate-800 border-slate-700 text-white z-50" align="start" sideOffset={5}>
            <DropdownMenuLabel className="text-slate-300">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-700" />
            <DropdownMenuItem 
              onClick={() => setActiveTab("profile")}
              className="text-slate-200 focus:bg-slate-700 focus:text-white cursor-pointer"
            >
              <UserCircle className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setActiveTab("settings")}
              className="text-slate-200 focus:bg-slate-700 focus:text-white cursor-pointer"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-slate-200 focus:bg-slate-700 focus:text-white cursor-pointer"
            >
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-slate-200 focus:bg-slate-700 focus:text-white cursor-pointer"
            >
              <Palette className="w-4 h-4 mr-2" />
              Preferences
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-700" />
            <DropdownMenuItem 
              onClick={handleLogout}
              className="text-red-400 focus:bg-slate-700 focus:text-red-300 cursor-pointer"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <nav className="space-y-1">
          <button
            onClick={() => setActiveTab("home")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group ${
              activeTab === "home"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-slate-300 hover:bg-slate-800 hover:text-white hover:translate-x-1"
            }`}
          >
            <Home className={`w-5 h-5 transition-transform duration-300 ${activeTab === "home" ? "" : "group-hover:scale-110"}`} />
            <span className="font-medium">Dashboard</span>
          </button>
          <button
            onClick={() => navigate("/ai-study-buddy")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 text-slate-300 hover:bg-slate-800 hover:text-white hover:translate-x-1 group"
          >
            <MessageSquare className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
            <span className="font-medium">AI Study Buddy</span>
          </button>
          <button
            onClick={() => navigate("/concept-library")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 text-slate-300 hover:bg-slate-800 hover:text-white hover:translate-x-1 group"
          >
            <BookOpen className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
            <span className="font-medium">Concept Library</span>
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group ${
              activeTab === "profile"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-slate-300 hover:bg-slate-800 hover:text-white hover:translate-x-1"
            }`}
          >
            <User className={`w-5 h-5 transition-transform duration-300 ${activeTab === "profile" ? "" : "group-hover:scale-110"}`} />
            <span className="font-medium">My Profile</span>
          </button>
          <button
            onClick={() => navigate("/study-schedule")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 text-slate-300 hover:bg-slate-800 hover:text-white hover:translate-x-1 group"
          >
            <Calendar className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
            <span className="font-medium">Study Schedule</span>
          </button>
          <button
            onClick={() => setActiveTab("progress")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group ${
              activeTab === "progress"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-slate-300 hover:bg-slate-800 hover:text-white hover:translate-x-1"
            }`}
          >
            <BarChart3 className={`w-5 h-5 transition-transform duration-300 ${activeTab === "progress" ? "" : "group-hover:scale-110"}`} />
            <span className="font-medium">Progress</span>
          </button>
        </nav>

        <div className="absolute bottom-6 left-6 right-6 space-y-2">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-slate-300 hover:bg-slate-800 hover:text-white transition-all duration-300 hover:translate-x-1 group" 
            size="lg" 
            onClick={() => setActiveTab("settings")}
          >
            <Settings className="w-5 h-5 mr-3 transition-transform duration-300 group-hover:rotate-90" />
            Settings
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-400 hover:bg-slate-800 hover:text-red-300 transition-all duration-300 hover:translate-x-1" 
            size="lg" 
            onClick={handleLogout}
          >
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

        {/* Recent Activity */}
        <Card className="p-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-success" />
            Recent Activity
          </h3>
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
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;