import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Palette,
  Menu,
  X,
  Plus,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Award,
  Flame
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import prepiqLogo from "@/assets/prepiq-logo.jpg";
import { format, isSameDay } from "date-fns";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from "recharts";
import { 
  ClipboardList,
  Play,
  Check,
  AlertCircle,
  Megaphone,
  Calendar as CalendarIcon,
  Tag,
  ExternalLink
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface CalendarEvent {
  id: string;
  date: Date;
  title: string;
  description: string;
  type: "mock_test" | "study_session" | "assignment" | "event";
  subject?: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("home");
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<{ title: string; description: string; type: "mock_test" | "study_session" | "assignment" | "event"; subject?: string }>({ title: "", description: "", type: "event", subject: "" });
  const [recentActivityExpanded, setRecentActivityExpanded] = useState(false);
  const [calendarView, setCalendarView] = useState<"month" | "list">("month");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [theme, setTheme] = useState<"light" | "dark">(
    () => (localStorage.getItem("theme") as "light" | "dark") || "light"
  );

  // Quiz Generator State
  const [quizSubject, setQuizSubject] = useState<string>("");
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());

  // Alerts State
  const [alertFilter, setAlertFilter] = useState("all");
  const [alertSearchQuery, setAlertSearchQuery] = useState("");

  const subjects = ["Physics", "Chemistry", "Biology", "Mathematics"];
  
  const sampleQuestions = [
    {
      id: 1,
      question: "What is the SI unit of force?",
      options: ["Newton (N)", "Joule (J)", "Watt (W)", "Pascal (Pa)"],
      subject: "Physics"
    },
    {
      id: 2,
      question: "Which element has the atomic number 6?",
      options: ["Oxygen", "Carbon", "Nitrogen", "Hydrogen"],
      subject: "Chemistry"
    },
    {
      id: 3,
      question: "What is the powerhouse of the cell?",
      options: ["Nucleus", "Ribosome", "Mitochondria", "Chloroplast"],
      subject: "Biology"
    },
    {
      id: 4,
      question: "What is the value of π (pi) approximately?",
      options: ["3.14159", "2.71828", "1.41421", "1.61803"],
      subject: "Mathematics"
    },
    {
      id: 5,
      question: "What is Newton's second law of motion?",
      options: ["F = ma", "E = mc²", "V = IR", "PV = nRT"],
      subject: "Physics"
    },
  ];

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

  useEffect(() => {
    // Apply theme to document
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
    toast({
      title: "Theme Changed",
      description: `Switched to ${theme === "light" ? "dark" : "light"} mode`,
    });
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

  const handleAddEvent = () => {
    if (!newEvent.title.trim()) return;
    
    const event: CalendarEvent = {
      id: Date.now().toString(),
      date: selectedDate,
      title: newEvent.title,
      description: newEvent.description,
      type: newEvent.type,
      subject: newEvent.subject,
    };
    
    setEvents([...events, event]);
    setNewEvent({ title: "", description: "", type: "event", subject: "" });
    setIsAddEventOpen(false);
    toast({
      title: "Event Added",
      description: `${newEvent.title} has been added to your calendar`,
    });
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter(e => e.id !== eventId));
    toast({
      title: "Event Deleted",
      description: "Event has been removed from your calendar",
    });
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(event.date, date));
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "mock_test":
        return { bg: "bg-red-500/20", text: "text-red-500", border: "border-red-500" };
      case "study_session":
        return { bg: "bg-blue-500/20", text: "text-blue-500", border: "border-blue-500" };
      case "assignment":
        return { bg: "bg-yellow-500/20", text: "text-yellow-500", border: "border-yellow-500" };
      default:
        return { bg: "bg-primary/20", text: "text-primary", border: "border-primary" };
    }
  };

  const getUpcomingEvents = () => {
    const now = new Date();
    return events
      .filter(event => event.date >= now)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 3);
  };

  const getTimeUntilEvent = (eventDate: Date) => {
    const now = new Date();
    const diff = eventDate.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    return "Soon";
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (event.subject && event.subject.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === "all" || event.type === filterType;
    return matchesSearch && matchesType;
  });

  const selectedDateEvents = getEventsForDate(selectedDate).filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (event.subject && event.subject.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === "all" || event.type === filterType;
    return matchesSearch && matchesType;
  });

  // Progress data for charts
  const topicsCoveredData = [
    { month: "Jan", topics: 12 },
    { month: "Feb", topics: 18 },
    { month: "Mar", topics: 15 },
    { month: "Apr", topics: 22 },
    { month: "May", topics: 28 },
    { month: "Jun", topics: 25 },
  ];

  const weeklyStudyHours = [
    { day: "Mon", hours: 3.5 },
    { day: "Tue", hours: 4.2 },
    { day: "Wed", hours: 2.8 },
    { day: "Thu", hours: 5.1 },
    { day: "Fri", hours: 4.5 },
    { day: "Sat", hours: 6.2 },
    { day: "Sun", hours: 3.8 },
  ];

  const performanceBySubject = [
    { subject: "Mathematics", score: 85 },
    { subject: "Physics", score: 78 },
    { subject: "Chemistry", score: 92 },
    { subject: "Biology", score: 88 },
    { subject: "English", score: 81 },
  ];

  const quizScoresTrend = [
    { week: "Week 1", score: 65 },
    { week: "Week 2", score: 72 },
    { week: "Week 3", score: 78 },
    { week: "Week 4", score: 75 },
    { week: "Week 5", score: 82 },
    { week: "Week 6", score: 88 },
  ];

  const consistencyData = [
    { week: "W1", days: 5 },
    { week: "W2", days: 6 },
    { week: "W3", days: 4 },
    { week: "W4", days: 7 },
    { week: "W5", days: 6 },
    { week: "W6", days: 7 },
  ];

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#8884d8', '#82ca9d'];

  // NTA Alerts Data
  const ntaAlerts = [
    {
      id: 1,
      title: "JEE Main 2025 Session 1 Registration Extended",
      description: "The registration deadline for JEE Main 2025 Session 1 has been extended till 15th January 2025. Candidates can now register on the official NTA website.",
      category: "Exam Updates",
      date: "2025-01-05",
      priority: "high",
      link: "https://jeemain.nta.nic.in/"
    },
    {
      id: 2,
      title: "NEET UG 2025 Information Bulletin Released",
      description: "National Testing Agency has released the information bulletin for NEET UG 2025. Download the bulletin and check important dates and exam pattern.",
      category: "Important Notice",
      date: "2025-01-03",
      priority: "high",
      link: "https://neet.nta.nic.in/"
    },
    {
      id: 3,
      title: "JEE Main 2024 Session 2 Results Declared",
      description: "NTA has announced the results for JEE Main 2024 Session 2. Candidates can check their results on the official website using their application number.",
      category: "Results",
      date: "2024-12-28",
      priority: "medium",
      link: "https://jeemain.nta.nic.in/"
    },
    {
      id: 4,
      title: "CUET UG 2025 Registration Begins",
      description: "Common University Entrance Test (CUET) UG 2025 registration has commenced. Last date to apply is 31st January 2025.",
      category: "Exam Updates",
      date: "2024-12-20",
      priority: "high",
      link: "https://cuet.nta.nic.in/"
    },
    {
      id: 5,
      title: "Important: Change in JEE Advanced 2025 Pattern",
      description: "IIT has announced changes in the JEE Advanced 2025 examination pattern. Candidates are advised to check the revised pattern on the official website.",
      category: "Important Notice",
      date: "2024-12-15",
      priority: "high",
      link: "https://jeeadv.ac.in/"
    },
    {
      id: 6,
      title: "NEET PG 2025 Exam Dates Announced",
      description: "National Testing Agency has announced the exam dates for NEET PG 2025. The examination will be conducted on 15th March 2025.",
      category: "Important Dates",
      date: "2024-12-10",
      priority: "medium",
      link: "https://nbe.edu.in/"
    },
    {
      id: 7,
      title: "JEE Main Mock Test Available",
      description: "Practice mock tests for JEE Main 2025 are now available on the NTA website. Candidates can take unlimited mock tests to familiarize themselves with the exam pattern.",
      category: "Resources",
      date: "2024-12-05",
      priority: "low",
      link: "https://jeemain.nta.nic.in/"
    },
    {
      id: 8,
      title: "Correction Window Open for NEET UG 2025",
      description: "Candidates who have already registered for NEET UG 2025 can now make corrections in their application forms till 20th January 2025.",
      category: "Exam Updates",
      date: "2024-12-01",
      priority: "medium",
      link: "https://neet.nta.nic.in/"
    }
  ];

  const alertCategories = ["all", "Exam Updates", "Results", "Important Notice", "Important Dates", "Resources"];

  const filteredAlerts = ntaAlerts.filter(alert => {
    const matchesCategory = alertFilter === "all" || alert.category === alertFilter;
    const matchesSearch = alert.title.toLowerCase().includes(alertSearchQuery.toLowerCase()) || 
                         alert.description.toLowerCase().includes(alertSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "low":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Exam Updates":
        return "bg-primary/10 text-primary border-primary/20";
      case "Results":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "Important Notice":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      case "Important Dates":
        return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      case "Resources":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background flex transition-colors duration-300">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-slate-900 dark:bg-slate-950 border-r border-slate-800 dark:border-slate-900 transition-all duration-300 overflow-hidden lg:block hidden relative`}>
        <div className={`${sidebarOpen ? 'p-6' : 'p-0'} transition-all duration-300`}>
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
            onClick={() => navigate("/settings")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 text-slate-300 hover:bg-slate-800 hover:text-white hover:translate-x-1 group"
          >
            <User className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
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
          <button
            onClick={() => setActiveTab("quizGenerator")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group ${
              activeTab === "quizGenerator"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-slate-300 hover:bg-slate-800 hover:text-white hover:translate-x-1"
            }`}
          >
            <ClipboardList className={`w-5 h-5 transition-transform duration-300 ${activeTab === "quizGenerator" ? "" : "group-hover:scale-110"}`} />
            <span className="font-medium">Quiz Generator</span>
          </button>
          <button
            onClick={() => setActiveTab("alerts")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group ${
              activeTab === "alerts"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-slate-300 hover:bg-slate-800 hover:text-white hover:translate-x-1"
            }`}
          >
            <Megaphone className={`w-5 h-5 transition-transform duration-300 ${activeTab === "alerts" ? "" : "group-hover:scale-110"}`} />
            <span className="font-medium">Alerts</span>
          </button>
        </nav>

        <div className="absolute bottom-6 left-6 right-6 space-y-2">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-slate-300 hover:bg-slate-800 hover:text-white transition-all duration-300 hover:translate-x-1 group" 
            size="lg" 
            onClick={() => navigate("/settings")}
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
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:flex hidden"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <div>
              <h1 className="text-3xl font-bold mb-1">Welcome back, {user?.user_metadata?.full_name || 'Student'}!</h1>
              <p className="text-muted-foreground">Let's make today productive</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="relative overflow-hidden transition-all duration-300 hover:scale-110"
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5 transition-transform duration-300 hover:rotate-12" />
              ) : (
                <Sun className="w-5 h-5 transition-transform duration-300 hover:rotate-180" />
              )}
            </Button>
            <Avatar className="h-12 w-12 border-2 border-primary">
              <AvatarImage src="" />
              <AvatarFallback className="bg-gradient-primary text-white font-semibold">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {activeTab === "home" && (
          <>
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

            {/* Upcoming Events Countdown */}
            {getUpcomingEvents().length > 0 && (
          <Card className="p-6 mb-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Upcoming Events
            </h3>
            <div className="space-y-3">
              {getUpcomingEvents().map((event) => {
                const colors = getEventColor(event.type);
                return (
                  <div key={event.id} className={`p-3 rounded-lg border-l-4 ${colors.border} ${colors.bg}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{event.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(event.date, "PPP")}
                        </p>
                      </div>
                      <span className={`text-xs font-bold ${colors.text} whitespace-nowrap ml-2`}>
                        {getTimeUntilEvent(event.date)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Calendar and Recent Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Section */}
          <Card className="p-6 animate-fade-in lg:col-span-2" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Study Calendar
              </h3>
              <div className="flex gap-2">
                <div className="flex border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setCalendarView("month")}
                    className={`px-3 py-1 text-sm transition-colors ${
                      calendarView === "month" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-accent"
                    }`}
                  >
                    Month
                  </button>
                  <button
                    onClick={() => setCalendarView("list")}
                    className={`px-3 py-1 text-sm transition-colors ${
                      calendarView === "list" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-accent"
                    }`}
                  >
                    List
                  </button>
                </div>
                <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <Plus className="w-4 h-4" />
                      Add Event
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Event for {format(selectedDate, "PPP")}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="title">Event Title</Label>
                      <Input
                        id="title"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                        placeholder="e.g., Mock Test - Mathematics"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newEvent.description}
                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                        placeholder="Add details about this event..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Event Type</Label>
                      <select
                        id="type"
                        value={newEvent.type}
                        onChange={(e) => {
                          const value = e.target.value as "mock_test" | "study_session" | "assignment" | "event";
                          setNewEvent({ ...newEvent, type: value });
                        }}
                        className="w-full p-2 border rounded-md bg-background"
                      >
                        <option value="event">General Event</option>
                        <option value="mock_test">Mock Test</option>
                        <option value="study_session">Study Session</option>
                        <option value="assignment">Assignment</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="subject">Subject (Optional)</Label>
                      <Input
                        id="subject"
                        value={newEvent.subject}
                        onChange={(e) => setNewEvent({ ...newEvent, subject: e.target.value })}
                        placeholder="e.g., Mathematics, Physics"
                      />
                    </div>
                    <Button onClick={handleAddEvent} className="w-full">Add Event</Button>
                  </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="grid md:grid-cols-3 gap-3 mb-4">
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="md:col-span-2"
              />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full p-2 border rounded-md bg-background"
              >
                <option value="all">All Types</option>
                <option value="mock_test">Mock Tests</option>
                <option value="study_session">Study Sessions</option>
                <option value="assignment">Assignments</option>
                <option value="event">General Events</option>
              </select>
            </div>

            {/* Color Legend */}
            <div className="flex flex-wrap gap-3 mb-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-red-500"></div>
                <span>Mock Test</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-blue-500"></div>
                <span>Study Session</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-yellow-500"></div>
                <span>Assignment</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-primary"></div>
                <span>General Event</span>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {calendarView === "month" ? (
                <>
                  <div>
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      className="rounded-md border"
                      modifiers={{
                        hasEvent: filteredEvents.map(e => e.date)
                      }}
                      modifiersClassNames={{
                        hasEvent: "bg-primary/20 font-bold"
                      }}
                    />
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg">
                      Events on {format(selectedDate, "PPP")}
                    </h4>
                    {selectedDateEvents.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No events scheduled for this date</p>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {selectedDateEvents.map((event) => {
                          const colors = getEventColor(event.type);
                          return (
                            <Card key={event.id} className={`p-4 border-l-4 ${colors.border}`}>
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${colors.bg} ${colors.text}`}>
                                      {event.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </span>
                                    {event.subject && (
                                      <span className="px-2 py-1 rounded text-xs bg-muted">
                                        {event.subject}
                                      </span>
                                    )}
                                  </div>
                                  <h5 className="font-semibold">{event.title}</h5>
                                  {event.description && (
                                    <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteEvent(event.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="lg:col-span-2 space-y-3 max-h-96 overflow-y-auto">
                  {filteredEvents.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-8">No events found</p>
                  ) : (
                    filteredEvents
                      .sort((a, b) => a.date.getTime() - b.date.getTime())
                      .map((event) => {
                        const colors = getEventColor(event.type);
                        return (
                          <Card key={event.id} className={`p-4 border-l-4 ${colors.border}`}>
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className={`px-2 py-1 rounded text-xs font-semibold ${colors.bg} ${colors.text}`}>
                                    {event.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </span>
                                  {event.subject && (
                                    <span className="px-2 py-1 rounded text-xs bg-muted">
                                      {event.subject}
                                    </span>
                                  )}
                                  <span className="text-xs text-muted-foreground ml-auto">
                                    {format(event.date, "PPP")}
                                  </span>
                                </div>
                                <h5 className="font-semibold">{event.title}</h5>
                                {event.description && (
                                  <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteEvent(event.id)}
                                className="text-destructive hover:text-destructive ml-2"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </Card>
                        );
                      })
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Recent Activity - Minimized */}
          <Card className="p-6 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div 
              className="flex items-center justify-between cursor-pointer mb-4"
              onClick={() => setRecentActivityExpanded(!recentActivityExpanded)}
            >
              <h3 className="text-lg font-bold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-success" />
                Recent Activity
              </h3>
              {recentActivityExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </div>
            
            {recentActivityExpanded && (
              <div className="space-y-3">
                {recentActivity.slice(0, 3).map((activity, index) => (
                  <div 
                    key={index}
                    className="p-3 rounded-lg bg-muted hover:bg-accent transition-colors"
                  >
                    <p className="font-medium text-sm mb-1">{activity.topic}</p>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                      <span className="text-sm font-bold text-success">{activity.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {!recentActivityExpanded && (
              <p className="text-sm text-muted-foreground">Click to view recent activities</p>
            )}
          </Card>
        </div>
          </>
        )}

        {activeTab === "progress" && (
          <div className="space-y-8">
            {/* Progress Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 animate-fade-in bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 group overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-primary/20 group-hover:scale-110 transition-transform duration-500">
                      <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-4xl font-bold bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">120</div>
                  </div>
                  <p className="text-sm text-muted-foreground font-semibold">Topics Covered</p>
                  <div className="mt-2 flex items-center gap-1 text-xs text-primary">
                    <TrendingUp className="w-3 h-3" />
                    <span>+12 this month</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 animate-fade-in bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20 group overflow-hidden relative" style={{ animationDelay: '0.1s' }}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-orange-500/20 group-hover:scale-110 transition-transform duration-500 group-hover:rotate-12">
                      <Flame className="w-6 h-6 text-orange-500" />
                    </div>
                    <div className="text-4xl font-bold bg-gradient-to-br from-orange-500 to-orange-400 bg-clip-text text-transparent">7</div>
                  </div>
                  <p className="text-sm text-muted-foreground font-semibold">Day Streak</p>
                  <div className="mt-2 flex items-center gap-1 text-xs text-orange-500">
                    <Flame className="w-3 h-3" />
                    <span>Keep it going!</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 animate-fade-in bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20 group overflow-hidden relative" style={{ animationDelay: '0.2s' }}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-secondary/20 group-hover:scale-110 transition-transform duration-500">
                      <Target className="w-6 h-6 text-secondary" />
                    </div>
                    <div className="text-4xl font-bold bg-gradient-to-br from-secondary to-secondary/60 bg-clip-text text-transparent">85%</div>
                  </div>
                  <p className="text-sm text-muted-foreground font-semibold">Avg Score</p>
                  <div className="mt-2 flex items-center gap-1 text-xs text-secondary">
                    <TrendingUp className="w-3 h-3" />
                    <span>+5% improvement</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 animate-fade-in bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20 group overflow-hidden relative" style={{ animationDelay: '0.3s' }}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-yellow-500/20 group-hover:scale-110 transition-transform duration-500 group-hover:rotate-12">
                      <Award className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div className="text-4xl font-bold bg-gradient-to-br from-yellow-500 to-yellow-400 bg-clip-text text-transparent">24</div>
                  </div>
                  <p className="text-sm text-muted-foreground font-semibold">Achievements</p>
                  <div className="mt-2 flex items-center gap-1 text-xs text-yellow-500">
                    <Award className="w-3 h-3" />
                    <span>3 new this week</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Topics Covered Over Time */}
              <Card className="p-6 animate-fade-in hover:shadow-xl transition-all duration-500 group bg-gradient-to-br from-background to-primary/5 border-primary/10" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold flex items-center gap-2 group-hover:text-primary transition-colors duration-300">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-all duration-300">
                      <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                    Topics Covered Over Time
                  </h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={topicsCoveredData}>
                    <defs>
                      <linearGradient id="colorTopics" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis 
                      dataKey="month" 
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--primary))',
                        borderRadius: '12px',
                        boxShadow: '0 10px 30px -10px hsl(var(--primary) / 0.3)'
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Line 
                      type="monotone" 
                      dataKey="topics" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={4}
                      dot={{ fill: 'hsl(var(--primary))', r: 6, strokeWidth: 2, stroke: 'hsl(var(--background))' }}
                      activeDot={{ r: 8, strokeWidth: 2 }}
                      animationDuration={1500}
                      animationEasing="ease-in-out"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              {/* Weekly Study Hours */}
              <Card className="p-6 animate-fade-in hover:shadow-xl transition-all duration-500 group bg-gradient-to-br from-background to-secondary/5 border-secondary/10" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold flex items-center gap-2 group-hover:text-secondary transition-colors duration-300">
                    <div className="p-2 rounded-lg bg-secondary/10 group-hover:bg-secondary/20 transition-all duration-300">
                      <BarChart3 className="w-5 h-5 text-secondary" />
                    </div>
                    Weekly Study Hours
                  </h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyStudyHours}>
                    <defs>
                      <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--secondary))" stopOpacity={1}/>
                        <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity={0.6}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis 
                      dataKey="day" 
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--secondary))',
                        borderRadius: '12px',
                        boxShadow: '0 10px 30px -10px hsl(var(--secondary) / 0.3)'
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                      cursor={{ fill: 'hsl(var(--secondary) / 0.1)' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar 
                      dataKey="hours" 
                      fill="url(#colorHours)" 
                      radius={[12, 12, 0, 0]}
                      animationDuration={1500}
                      animationEasing="ease-in-out"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* Study Consistency */}
              <Card className="p-6 animate-fade-in hover:shadow-xl transition-all duration-500 group bg-gradient-to-br from-background to-orange-500/5 border-orange-500/10" style={{ animationDelay: '0.6s' }}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold flex items-center gap-2 group-hover:text-orange-500 transition-colors duration-300">
                    <div className="p-2 rounded-lg bg-orange-500/10 group-hover:bg-orange-500/20 transition-all duration-300 group-hover:rotate-12">
                      <Flame className="w-5 h-5 text-orange-500" />
                    </div>
                    Study Consistency
                  </h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={consistencyData}>
                    <defs>
                      <linearGradient id="colorConsistency" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f97316" stopOpacity={1}/>
                        <stop offset="100%" stopColor="#fb923c" stopOpacity={0.7}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis 
                      dataKey="week" 
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      domain={[0, 7]}
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid #f97316',
                        borderRadius: '12px',
                        boxShadow: '0 10px 30px -10px rgba(249, 115, 22, 0.3)'
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                      cursor={{ fill: 'rgba(249, 115, 22, 0.1)' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar 
                      dataKey="days" 
                      fill="url(#colorConsistency)" 
                      radius={[12, 12, 0, 0]}
                      animationDuration={1500}
                      animationEasing="ease-in-out"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* Quiz Scores Trend */}
              <Card className="p-6 animate-fade-in hover:shadow-xl transition-all duration-500 group bg-gradient-to-br from-background to-accent/5 border-accent/10" style={{ animationDelay: '0.7s' }}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold flex items-center gap-2 group-hover:text-accent transition-colors duration-300">
                    <div className="p-2 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-all duration-300">
                      <Target className="w-5 h-5 text-accent" />
                    </div>
                    Quiz Performance Trend
                  </h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={quizScoresTrend}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis 
                      dataKey="week" 
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      domain={[0, 100]}
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--accent))',
                        borderRadius: '12px',
                        boxShadow: '0 10px 30px -10px hsl(var(--accent) / 0.3)'
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                      cursor={{ stroke: 'hsl(var(--accent))', strokeWidth: 2 }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Area 
                      type="monotone" 
                      dataKey="score" 
                      stroke="hsl(var(--accent))" 
                      strokeWidth={3}
                      fill="url(#colorScore)"
                      animationDuration={1500}
                      animationEasing="ease-in-out"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>

              {/* Performance by Subject - Full Width */}
              <Card className="p-6 lg:col-span-2 animate-fade-in hover:shadow-xl transition-all duration-500 group bg-gradient-to-br from-background via-primary/5 to-secondary/5 border-primary/10" style={{ animationDelay: '0.8s' }}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold flex items-center gap-2 group-hover:text-primary transition-colors duration-300">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-all duration-300 group-hover:rotate-12">
                      <Award className="w-5 h-5 text-primary" />
                    </div>
                    Performance by Subject
                  </h3>
                  <div className="text-sm text-muted-foreground bg-muted px-4 py-2 rounded-lg">
                    Overall Average: <span className="font-bold text-primary">84.8%</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceBySubject} layout="vertical">
                    <defs>
                      {COLORS.map((color, index) => (
                        <linearGradient key={`gradient-${index}`} id={`colorGradient${index}`} x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor={color} stopOpacity={0.8}/>
                          <stop offset="100%" stopColor={color} stopOpacity={1}/>
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} horizontal={true} vertical={false} />
                    <XAxis 
                      type="number" 
                      domain={[0, 100]} 
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <YAxis 
                      dataKey="subject" 
                      type="category" 
                      stroke="hsl(var(--muted-foreground))" 
                      width={100}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 13 }}
                      tickLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--primary))',
                        borderRadius: '12px',
                        boxShadow: '0 10px 30px -10px hsl(var(--primary) / 0.3)'
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                      cursor={{ fill: 'hsl(var(--primary) / 0.1)' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar 
                      dataKey="score" 
                      radius={[0, 12, 12, 0]}
                      animationDuration={1500}
                      animationEasing="ease-in-out"
                    >
                      {performanceBySubject.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`url(#colorGradient${index % COLORS.length})`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "quizGenerator" && (
          <div className="space-y-6">
            {!quizStarted ? (
              /* Subject Selection Screen */
              <Card className="p-8 max-w-2xl mx-auto animate-fade-in">
                <div className="text-center space-y-6">
                  <div className="flex justify-center">
                    <div className="p-4 rounded-2xl bg-primary/10">
                      <ClipboardList className="w-16 h-16 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold mb-2">Quiz Generator</h2>
                    <p className="text-muted-foreground">
                      Select a subject to generate practice questions
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Label htmlFor="subject" className="text-left block text-lg font-semibold">
                      Choose Subject
                    </Label>
                    <Select value={quizSubject} onValueChange={setQuizSubject}>
                      <SelectTrigger className="w-full h-12 text-lg">
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject} value={subject} className="text-lg">
                            {subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    size="lg"
                    className="w-full h-12 text-lg"
                    disabled={!quizSubject}
                    onClick={() => {
                      setQuizStarted(true);
                      setCurrentQuestionIndex(0);
                      setSelectedAnswers({});
                      setMarkedForReview(new Set());
                    }}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Start Quiz
                  </Button>
                </div>
              </Card>
            ) : (
              /* Quiz Interface */
              <div className="space-y-6">
                {/* Quiz Header */}
                <Card className="p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <ClipboardList className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">{quizSubject} Quiz</h2>
                        <p className="text-sm text-muted-foreground">
                          Question {currentQuestionIndex + 1} of {sampleQuestions.length}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setQuizStarted(false);
                          setQuizSubject("");
                        }}
                      >
                        End Quiz
                      </Button>
                      <Button>
                        Submit
                      </Button>
                    </div>
                  </div>
                </Card>

                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Question Area */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Question Card */}
                    <Card className="p-6 min-h-[400px]">
                      <div className="space-y-6">
                        <div className="flex items-start justify-between">
                          <h3 className="text-lg font-bold text-primary">
                            Question {currentQuestionIndex + 1}
                          </h3>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newMarked = new Set(markedForReview);
                              if (newMarked.has(currentQuestionIndex)) {
                                newMarked.delete(currentQuestionIndex);
                              } else {
                                newMarked.add(currentQuestionIndex);
                              }
                              setMarkedForReview(newMarked);
                            }}
                          >
                            {markedForReview.has(currentQuestionIndex) ? (
                              <Check className="w-4 h-4 mr-2" />
                            ) : (
                              <AlertCircle className="w-4 h-4 mr-2" />
                            )}
                            Mark for Review
                          </Button>
                        </div>

                        <p className="text-lg leading-relaxed">
                          {sampleQuestions[currentQuestionIndex].question}
                        </p>

                        <RadioGroup
                          value={selectedAnswers[currentQuestionIndex] || ""}
                          onValueChange={(value) => {
                            setSelectedAnswers({
                              ...selectedAnswers,
                              [currentQuestionIndex]: value,
                            });
                          }}
                          className="space-y-3"
                        >
                          {sampleQuestions[currentQuestionIndex].options.map((option, idx) => (
                            <div
                              key={idx}
                              className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer hover:border-primary/50 hover:bg-primary/5 ${
                                selectedAnswers[currentQuestionIndex] === option
                                  ? "border-primary bg-primary/10"
                                  : "border-border"
                              }`}
                            >
                              <RadioGroupItem value={option} id={`option-${idx}`} />
                              <Label
                                htmlFor={`option-${idx}`}
                                className="flex-1 cursor-pointer text-base"
                              >
                                {option}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    </Card>

                    {/* Navigation Buttons */}
                    <Card className="p-4">
                      <div className="flex justify-between gap-4">
                        <Button
                          variant="outline"
                          disabled={currentQuestionIndex === 0}
                          onClick={() =>
                            setCurrentQuestionIndex(currentQuestionIndex - 1)
                          }
                        >
                          <ChevronLeft className="w-4 h-4 mr-2" />
                          Previous
                        </Button>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedAnswers({
                                ...selectedAnswers,
                                [currentQuestionIndex]: "",
                              });
                            }}
                          >
                            Clear Response
                          </Button>
                          {currentQuestionIndex < sampleQuestions.length - 1 ? (
                            <Button
                              onClick={() =>
                                setCurrentQuestionIndex(currentQuestionIndex + 1)
                              }
                            >
                              Save & Next
                              <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                          ) : (
                            <Button variant="default">Submit Quiz</Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Question Navigation Panel */}
                  <div className="space-y-6">
                    {/* Status Legend */}
                    <Card className="p-4">
                      <h3 className="font-bold mb-4">Status</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-primary/20 border-2 border-primary flex items-center justify-center text-primary font-semibold">
                            {currentQuestionIndex + 1}
                          </div>
                          <span>Current</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-green-500/20 border-2 border-green-500 flex items-center justify-center text-green-600 font-semibold">
                            1
                          </div>
                          <span>Answered</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-yellow-500/20 border-2 border-yellow-500 flex items-center justify-center text-yellow-600 font-semibold">
                            1
                          </div>
                          <span>Marked for Review</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-muted border-2 border-border flex items-center justify-center text-muted-foreground font-semibold">
                            1
                          </div>
                          <span>Not Answered</span>
                        </div>
                      </div>
                    </Card>

                    {/* Question Navigation Grid */}
                    <Card className="p-4">
                      <h3 className="font-bold mb-4">Questions</h3>
                      <div className="grid grid-cols-5 gap-2">
                        {sampleQuestions.map((_, idx) => {
                          const isAnswered = selectedAnswers[idx];
                          const isMarked = markedForReview.has(idx);
                          const isCurrent = idx === currentQuestionIndex;

                          return (
                            <button
                              key={idx}
                              onClick={() => setCurrentQuestionIndex(idx)}
                              className={`
                                w-10 h-10 rounded-lg border-2 font-semibold text-sm
                                transition-all duration-300 hover:scale-110
                                ${
                                  isCurrent
                                    ? "bg-primary/20 border-primary text-primary ring-2 ring-primary/30"
                                    : isMarked
                                    ? "bg-yellow-500/20 border-yellow-500 text-yellow-600"
                                    : isAnswered
                                    ? "bg-green-500/20 border-green-500 text-green-600"
                                    : "bg-muted border-border text-muted-foreground hover:border-primary/50"
                                }
                              `}
                            >
                              {idx + 1}
                            </button>
                          );
                        })}
                      </div>
                    </Card>

                    {/* Summary */}
                    <Card className="p-4">
                      <h3 className="font-bold mb-4">Summary</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Answered:</span>
                          <span className="font-semibold text-green-600">
                            {Object.keys(selectedAnswers).filter(k => selectedAnswers[parseInt(k)]).length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Not Answered:</span>
                          <span className="font-semibold">
                            {sampleQuestions.length - Object.keys(selectedAnswers).filter(k => selectedAnswers[parseInt(k)]).length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Marked:</span>
                          <span className="font-semibold text-yellow-600">
                            {markedForReview.size}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === "alerts" && (
          <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-xl border border-primary/20 shadow-xl shadow-primary/10">
                  <Megaphone className="w-8 h-8 text-primary animate-pulse" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    NTA Alerts & Updates
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    Stay updated with latest notifications from National Testing Agency
                  </p>
                </div>
              </div>

              {/* Search and Filter */}
              <Card className="p-4 bg-gradient-to-br from-background via-background to-primary/5 border-primary/10">
                <div className="grid md:grid-cols-3 gap-3">
                  <Input
                    placeholder="Search alerts..."
                    value={alertSearchQuery}
                    onChange={(e) => setAlertSearchQuery(e.target.value)}
                    className="md:col-span-2"
                  />
                  <select
                    value={alertFilter}
                    onChange={(e) => setAlertFilter(e.target.value)}
                    className="w-full p-2 border rounded-md bg-background"
                  >
                    {alertCategories.map((category) => (
                      <option key={category} value={category}>
                        {category === "all" ? "All Categories" : category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {alertCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setAlertFilter(category)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                        alertFilter === category
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-105"
                          : "bg-muted hover:bg-primary/10 hover:text-primary"
                      }`}
                    >
                      {category === "all" ? "All" : category}
                    </button>
                  ))}
                </div>
              </Card>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-4 bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20 hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300 group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">High Priority</p>
                    <p className="text-2xl font-bold text-red-600 group-hover:scale-110 transition-transform duration-300">
                      {ntaAlerts.filter(a => a.priority === "high").length}
                    </p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-500/50 group-hover:text-red-500 transition-colors duration-300" />
                </div>
              </Card>
              
              <Card className="p-4 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20 hover:shadow-xl hover:shadow-yellow-500/10 transition-all duration-300 group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Medium Priority</p>
                    <p className="text-2xl font-bold text-yellow-600 group-hover:scale-110 transition-transform duration-300">
                      {ntaAlerts.filter(a => a.priority === "medium").length}
                    </p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-yellow-500/50 group-hover:text-yellow-500 transition-colors duration-300" />
                </div>
              </Card>
              
              <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20 hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300 group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Alerts</p>
                    <p className="text-2xl font-bold text-green-600 group-hover:scale-110 transition-transform duration-300">
                      {ntaAlerts.length}
                    </p>
                  </div>
                  <Megaphone className="w-8 h-8 text-green-500/50 group-hover:text-green-500 transition-colors duration-300" />
                </div>
              </Card>
              
              <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">This Week</p>
                    <p className="text-2xl font-bold text-primary group-hover:scale-110 transition-transform duration-300">
                      {ntaAlerts.filter(a => {
                        const alertDate = new Date(a.date);
                        const weekAgo = new Date();
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return alertDate >= weekAgo;
                      }).length}
                    </p>
                  </div>
                  <CalendarIcon className="w-8 h-8 text-primary/50 group-hover:text-primary transition-colors duration-300" />
                </div>
              </Card>
            </div>

            {/* Alerts Grid */}
            <div className="space-y-4">
              {filteredAlerts.length === 0 ? (
                <Card className="p-12 text-center">
                  <Megaphone className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-lg text-muted-foreground">No alerts found matching your criteria</p>
                </Card>
              ) : (
                filteredAlerts.map((alert, index) => (
                  <Card 
                    key={alert.id}
                    className="p-6 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 border-l-4 hover:border-primary hover:translate-x-1 group animate-fade-in"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      borderLeftColor: alert.priority === 'high' ? 'hsl(var(--destructive))' : 
                                      alert.priority === 'medium' ? 'hsl(var(--warning))' : 
                                      'hsl(var(--primary))'
                    }}
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        {/* Header */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 transition-all duration-300 ${getCategoryColor(alert.category)}`}>
                            <Tag className="w-3 h-3 inline mr-1" />
                            {alert.category}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 transition-all duration-300 ${getPriorityColor(alert.priority)}`}>
                            {alert.priority.toUpperCase()}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <CalendarIcon className="w-3 h-3" />
                            {new Date(alert.date).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold group-hover:text-primary transition-colors duration-300">
                          {alert.title}
                        </h3>

                        {/* Description */}
                        <p className="text-muted-foreground leading-relaxed">
                          {alert.description}
                        </p>
                      </div>

                      {/* Action Button */}
                      <Button 
                        variant="outline"
                        className="gap-2 hover:bg-primary hover:text-primary-foreground transition-all duration-300 group-hover:scale-105"
                        onClick={() => window.open(alert.link, '_blank')}
                      >
                        View Details
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;