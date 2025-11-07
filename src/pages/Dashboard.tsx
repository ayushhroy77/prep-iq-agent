import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Brain, 
  Calendar, 
  TrendingUp, 
  MessageSquare, 
  User, 
  Settings,
  LogOut,
  Home,
  BookOpen,
  Target,
  BarChart3
} from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("home");

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

  return (
    <div className="min-h-screen bg-gradient-hero flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border p-6 hidden lg:block">
        <Link to="/" className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold">PrepIQ</span>
        </Link>

        <nav className="space-y-2">
          {[
            { id: "home", label: "Dashboard", icon: Home },
            { id: "profile", label: "My Profile", icon: User },
            { id: "schedule", label: "Study Schedule", icon: Calendar },
            { id: "progress", label: "Progress", icon: BarChart3 },
            { id: "chat", label: "AI Tutor", icon: MessageSquare },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
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
          <Button variant="ghost" className="w-full justify-start" size="lg">
            <Settings className="w-5 h-5 mr-3" />
            Settings
          </Button>
          <Button variant="ghost" className="w-full justify-start text-destructive" size="lg">
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
            <h1 className="text-3xl font-bold mb-1">Welcome back, Student!</h1>
            <p className="text-muted-foreground">Let's make today productive</p>
          </div>
          <Avatar className="h-12 w-12 border-2 border-primary">
            <AvatarImage src="" />
            <AvatarFallback className="bg-gradient-primary text-white font-semibold">
              ST
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
              <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">AI Study Buddy</h3>
                <p className="text-sm text-muted-foreground">Ask me anything!</p>
              </div>
            </div>

            <div className="space-y-4 mb-4 h-64 overflow-y-auto">
              {/* Sample messages */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                  <Brain className="w-4 h-4 text-white" />
                </div>
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