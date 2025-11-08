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
  ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import prepiqLogo from "@/assets/prepiq-logo.jpg";
import { format, isSameDay } from "date-fns";

interface CalendarEvent {
  id: string;
  date: Date;
  title: string;
  description: string;
  type: "mock_test" | "event";
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
  const [newEvent, setNewEvent] = useState<{ title: string; description: string; type: "mock_test" | "event" }>({ title: "", description: "", type: "event" });
  const [recentActivityExpanded, setRecentActivityExpanded] = useState(false);

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

  const handleAddEvent = () => {
    if (!newEvent.title.trim()) return;
    
    const event: CalendarEvent = {
      id: Date.now().toString(),
      date: selectedDate,
      title: newEvent.title,
      description: newEvent.description,
      type: newEvent.type,
    };
    
    setEvents([...events, event]);
    setNewEvent({ title: "", description: "", type: "event" });
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

  const selectedDateEvents = getEventsForDate(selectedDate);

  return (
    <div className="min-h-screen bg-gradient-hero flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-slate-900 border-r border-slate-800 transition-all duration-300 overflow-hidden lg:block hidden relative`}>
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

        {/* Calendar and Recent Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Section */}
          <Card className="p-6 animate-fade-in lg:col-span-2" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Study Calendar
              </h3>
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
                          const value = e.target.value as "mock_test" | "event";
                          setNewEvent({ ...newEvent, type: value });
                        }}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="event">General Event</option>
                        <option value="mock_test">Mock Test</option>
                      </select>
                    </div>
                    <Button onClick={handleAddEvent} className="w-full">Add Event</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div>
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border"
                  modifiers={{
                    hasEvent: events.map(e => e.date)
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
                  <div className="space-y-3">
                    {selectedDateEvents.map((event) => (
                      <Card key={event.id} className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                event.type === 'mock_test' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                              }`}>
                                {event.type === 'mock_test' ? 'Mock Test' : 'Event'}
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
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
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
      </main>
    </div>
  );
};

export default Dashboard;