import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowLeft, Plus, Clock, Calendar, Target, TrendingUp, Book, Coffee, Brain, Play, Pause, Check, Trash2, Edit, BarChart3, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Subject {
  id: string;
  name: string;
  difficulty: "easy" | "medium" | "hard";
  priority: number;
  color: string;
}

interface StudyBlock {
  id: string;
  subject_id: string;
  subject?: Subject;
  day_of_week: number;
  start_time: string;
  end_time: string;
  session_type: "study" | "break" | "revision" | "practice";
  is_completed: boolean;
  notes?: string;
}

interface StudySession {
  id: string;
  subject_id: string;
  subject?: Subject;
  session_date: string;
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  completed: boolean;
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const SESSION_TYPES = [
  { value: "study", label: "Study", icon: Book },
  { value: "break", label: "Break", icon: Coffee },
  { value: "revision", label: "Revision", icon: Brain },
  { value: "practice", label: "Practice", icon: Play },
];

const DIFFICULTY_COLORS = {
  easy: "hsl(142 71% 45%)",
  medium: "hsl(45 93% 47%)",
  hard: "hsl(0 84% 60%)",
};

function SortableBlock({ block, subjects, onEdit, onDelete, onToggleComplete }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const subject = subjects.find((s: Subject) => s.id === block.subject_id);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const sessionType = SESSION_TYPES.find((t) => t.value === block.session_type);
  const Icon = sessionType?.icon || Book;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-2">
      <Card
        className={`cursor-move hover:shadow-md transition-all animate-fade-in ${
          block.is_completed ? "opacity-60 border-success" : ""
        }`}
        style={{ borderLeftWidth: "4px", borderLeftColor: subject?.color || "#6366f1" }}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold text-foreground">{subject?.name || "Unknown"}</span>
                <Badge variant="outline" className="text-xs">
                  {sessionType?.label}
                </Badge>
                {block.is_completed && (
                  <Badge className="text-xs bg-success text-success-foreground">
                    <Check className="h-3 w-3 mr-1" />
                    Done
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {block.start_time} - {block.end_time}
                </span>
                <Badge variant="secondary" className="text-xs">
                  Priority {subject?.priority || 1}
                </Badge>
              </div>
              {block.notes && <p className="text-sm text-muted-foreground mt-2">{block.notes}</p>}
            </div>
            <div className="flex gap-1 ml-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleComplete(block);
                }}
              >
                {block.is_completed ? <Pause className="h-4 w-4" /> : <Check className="h-4 w-4" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(block);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(block.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function StudySchedule() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [schedules, setSchedules] = useState<StudyBlock[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [activeDay, setActiveDay] = useState(new Date().getDay());
  const [viewMode, setViewMode] = useState<"weekly" | "daily">("weekly");
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isAddBlockOpen, setIsAddBlockOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<StudyBlock | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const [newSubject, setNewSubject] = useState({
    name: "",
    difficulty: "medium" as "easy" | "medium" | "hard",
    priority: 3,
    color: "#6366f1",
  });

  const [newBlock, setNewBlock] = useState({
    subject_id: "",
    day_of_week: activeDay,
    start_time: "09:00",
    end_time: "10:00",
    session_type: "study" as "study" | "break" | "revision" | "practice",
    notes: "",
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchSubjects();
      fetchSchedules();
      fetchSessions();
    }
  }, [user]);

  const checkAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
    } else {
      setUser(session.user);
    }
  };

  const fetchSubjects = async () => {
    const { data, error } = await supabase.from("subjects").select("*").order("priority", { ascending: false });

    if (error) {
      toast({ title: "Error loading subjects", description: error.message, variant: "destructive" });
    } else {
      setSubjects(data || []);
    }
  };

  const fetchSchedules = async () => {
    const { data, error } = await supabase.from("study_schedules").select("*").order("start_time");

    if (error) {
      toast({ title: "Error loading schedules", description: error.message, variant: "destructive" });
    } else {
      setSchedules(data || []);
    }
  };

  const fetchSessions = async () => {
    const today = new Date().toISOString().split("T")[0];
    const { data, error } = await supabase
      .from("study_sessions")
      .select("*")
      .gte("session_date", today)
      .order("start_time", { ascending: false });

    if (error) {
      console.error("Error loading sessions:", error);
    } else {
      setSessions(data || []);
    }
  };

  const addSubject = async () => {
    if (!newSubject.name) {
      toast({ title: "Subject name required", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("subjects").insert([{ ...newSubject, user_id: user?.id }]);

    if (error) {
      toast({ title: "Error adding subject", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Subject added successfully!" });
      setIsAddSubjectOpen(false);
      setNewSubject({ name: "", difficulty: "medium", priority: 3, color: "#6366f1" });
      fetchSubjects();
    }
  };

  const addOrUpdateBlock = async () => {
    if (!newBlock.subject_id) {
      toast({ title: "Please select a subject", variant: "destructive" });
      return;
    }

    const blockData = {
      ...newBlock,
      user_id: user?.id,
    };

    if (editingBlock) {
      const { error } = await supabase.from("study_schedules").update(blockData).eq("id", editingBlock.id);

      if (error) {
        toast({ title: "Error updating block", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Study block updated!" });
        setIsAddBlockOpen(false);
        setEditingBlock(null);
        fetchSchedules();
      }
    } else {
      const { error } = await supabase.from("study_schedules").insert([blockData]);

      if (error) {
        toast({ title: "Error adding block", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Study block added!" });
        setIsAddBlockOpen(false);
        fetchSchedules();
      }
    }

    setNewBlock({
      subject_id: "",
      day_of_week: activeDay,
      start_time: "09:00",
      end_time: "10:00",
      session_type: "study",
      notes: "",
    });
  };

  const deleteBlock = async (id: string) => {
    const { error } = await supabase.from("study_schedules").delete().eq("id", id);

    if (error) {
      toast({ title: "Error deleting block", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Study block deleted" });
      fetchSchedules();
    }
  };

  const toggleComplete = async (block: StudyBlock) => {
    const { error } = await supabase
      .from("study_schedules")
      .update({ is_completed: !block.is_completed })
      .eq("id", block.id);

    if (error) {
      toast({ title: "Error updating status", description: error.message, variant: "destructive" });
    } else {
      fetchSchedules();
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = schedules.findIndex((s) => s.id === active.id);
      const newIndex = schedules.findIndex((s) => s.id === over.id);

      const newSchedules = arrayMove(schedules, oldIndex, newIndex);
      setSchedules(newSchedules);

      // Update order in database
      const updates = newSchedules.map((schedule, index) => ({
        id: schedule.id,
        // Store the order for future use
      }));
    }

    setActiveId(null);
  };

  const getDaySchedule = (day: number) => {
    return schedules.filter((s) => s.day_of_week === day);
  };

  const getWeekSchedule = () => {
    return DAYS.map((day, index) => ({
      day,
      dayIndex: index,
      blocks: getDaySchedule(index),
    }));
  };

  const calculateStats = () => {
    const totalBlocks = schedules.length;
    const completedBlocks = schedules.filter((s) => s.is_completed).length;
    const completionRate = totalBlocks > 0 ? (completedBlocks / totalBlocks) * 100 : 0;

    const totalMinutes = schedules.reduce((acc, block) => {
      const start = new Date(`2000-01-01 ${block.start_time}`);
      const end = new Date(`2000-01-01 ${block.end_time}`);
      return acc + (end.getTime() - start.getTime()) / 60000;
    }, 0);

    return {
      totalBlocks,
      completedBlocks,
      completionRate,
      totalHours: (totalMinutes / 60).toFixed(1),
    };
  };

  const generateSmartSuggestions = () => {
    const suggestions = [];

    // Suggest adding breaks if there are long study sessions
    const longSessions = schedules.filter((s) => {
      const start = new Date(`2000-01-01 ${s.start_time}`);
      const end = new Date(`2000-01-01 ${s.end_time}`);
      return s.session_type === "study" && (end.getTime() - start.getTime()) / 60000 > 90;
    });

    if (longSessions.length > 0) {
      suggestions.push("Consider adding 15-minute breaks after 90-minute study sessions");
    }

    // Suggest balancing subjects
    const subjectCounts = schedules.reduce((acc, s) => {
      acc[s.subject_id] = (acc[s.subject_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const maxCount = Math.max(...Object.values(subjectCounts));
    const minCount = Math.min(...Object.values(subjectCounts));

    if (maxCount - minCount > 3) {
      suggestions.push("Balance your schedule by adding more sessions for underrepresented subjects");
    }

    // Suggest revision sessions
    const revisionCount = schedules.filter((s) => s.session_type === "revision").length;
    if (revisionCount < schedules.length * 0.2) {
      suggestions.push("Add more revision sessions to reinforce your learning");
    }

    return suggestions;
  };

  const stats = calculateStats();
  const suggestions = generateSmartSuggestions();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Smart Study Schedule</h1>
                <p className="text-sm text-muted-foreground">Plan, track, and optimize your study time</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Dialog open={isAddSubjectOpen} onOpenChange={setIsAddSubjectOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Subject
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Subject</DialogTitle>
                    <DialogDescription>Define a subject with its priority and difficulty level</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="subject-name">Subject Name</Label>
                      <Input
                        id="subject-name"
                        placeholder="e.g., Physics, Mathematics"
                        value={newSubject.name}
                        onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="difficulty">Difficulty Level</Label>
                      <Select
                        value={newSubject.difficulty}
                        onValueChange={(v: any) => setNewSubject({ ...newSubject, difficulty: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="priority">Priority (1-5)</Label>
                      <Input
                        id="priority"
                        type="number"
                        min="1"
                        max="5"
                        value={newSubject.priority}
                        onChange={(e) => setNewSubject({ ...newSubject, priority: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="color">Color</Label>
                      <Input
                        id="color"
                        type="color"
                        value={newSubject.color}
                        onChange={(e) => setNewSubject({ ...newSubject, color: e.target.value })}
                      />
                    </div>
                    <Button onClick={addSubject} className="w-full">
                      Add Subject
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isAddBlockOpen} onOpenChange={setIsAddBlockOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Study Block
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingBlock ? "Edit Study Block" : "Add Study Block"}</DialogTitle>
                    <DialogDescription>Schedule a new study session or break</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="block-subject">Subject</Label>
                      <Select value={newBlock.subject_id} onValueChange={(v) => setNewBlock({ ...newBlock, subject_id: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject.id} value={subject.id}>
                              {subject.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="block-day">Day</Label>
                      <Select
                        value={newBlock.day_of_week.toString()}
                        onValueChange={(v) => setNewBlock({ ...newBlock, day_of_week: parseInt(v) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DAYS.map((day, index) => (
                            <SelectItem key={index} value={index.toString()}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="start-time">Start Time</Label>
                        <Input
                          id="start-time"
                          type="time"
                          value={newBlock.start_time}
                          onChange={(e) => setNewBlock({ ...newBlock, start_time: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="end-time">End Time</Label>
                        <Input
                          id="end-time"
                          type="time"
                          value={newBlock.end_time}
                          onChange={(e) => setNewBlock({ ...newBlock, end_time: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="session-type">Session Type</Label>
                      <Select
                        value={newBlock.session_type}
                        onValueChange={(v: any) => setNewBlock({ ...newBlock, session_type: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SESSION_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="notes">Notes (optional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Add any notes or reminders"
                        value={newBlock.notes}
                        onChange={(e) => setNewBlock({ ...newBlock, notes: e.target.value })}
                      />
                    </div>
                    <Button onClick={addOrUpdateBlock} className="w-full">
                      {editingBlock ? "Update Block" : "Add Block"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="animate-fade-in">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Study Blocks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold text-foreground">{stats.totalBlocks}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-success" />
                <span className="text-2xl font-bold text-foreground">{stats.completedBlocks}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold text-foreground">{stats.completionRate.toFixed(0)}%</span>
                </div>
                <Progress value={stats.completionRate} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Weekly Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-secondary" />
                <span className="text-2xl font-bold text-foreground">{stats.totalHours}h</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Smart Suggestions */}
        {suggestions.length > 0 && (
          <Card className="mb-6 border-l-4 border-l-primary animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lightbulb className="h-5 w-5 text-primary" />
                Smart Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
                    {suggestion}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Subjects Overview */}
        {subjects.length > 0 && (
          <Card className="mb-6 animate-fade-in">
            <CardHeader>
              <CardTitle className="text-lg">Your Subjects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {subjects.map((subject) => (
                  <Badge
                    key={subject.id}
                    variant="outline"
                    className="px-3 py-2 text-sm"
                    style={{ borderColor: subject.color }}
                  >
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: subject.color }}
                    />
                    {subject.name}
                    <span className="ml-2 text-xs text-muted-foreground">
                      P{subject.priority} • {subject.difficulty}
                    </span>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Schedule View */}
        <Card className="animate-fade-in">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Study Schedule</CardTitle>
              <Tabs value={viewMode} onValueChange={(v: any) => setViewMode(v)}>
                <TabsList>
                  <TabsTrigger value="weekly">Weekly View</TabsTrigger>
                  <TabsTrigger value="daily">Daily View</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {viewMode === "weekly" ? (
              <div className="space-y-6">
                {getWeekSchedule().map((dayData) => (
                  <div key={dayData.dayIndex} className="animate-fade-in">
                    <h3 className="font-semibold text-lg mb-3 text-foreground flex items-center gap-2">
                      {dayData.day}
                      <Badge variant="secondary" className="text-xs">
                        {dayData.blocks.length} blocks
                      </Badge>
                    </h3>
                    <DndContext
                      sensors={sensors}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={dayData.blocks.map((b) => b.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {dayData.blocks.length > 0 ? (
                          dayData.blocks.map((block) => (
                            <SortableBlock
                              key={block.id}
                              block={block}
                              subjects={subjects}
                              onEdit={(b: StudyBlock) => {
                                setEditingBlock(b);
                                setNewBlock({
                                  subject_id: b.subject_id,
                                  day_of_week: b.day_of_week,
                                  start_time: b.start_time,
                                  end_time: b.end_time,
                                  session_type: b.session_type,
                                  notes: b.notes || "",
                                });
                                setIsAddBlockOpen(true);
                              }}
                              onDelete={deleteBlock}
                              onToggleComplete={toggleComplete}
                            />
                          ))
                        ) : (
                          <Card className="border-dashed">
                            <CardContent className="p-8 text-center">
                              <p className="text-muted-foreground">No study blocks for this day</p>
                              <Button
                                variant="link"
                                onClick={() => {
                                  setNewBlock({ ...newBlock, day_of_week: dayData.dayIndex });
                                  setIsAddBlockOpen(true);
                                }}
                              >
                                Add a block
                              </Button>
                            </CardContent>
                          </Card>
                        )}
                      </SortableContext>
                      <DragOverlay>
                        {activeId ? (
                          <Card className="opacity-50">
                            <CardContent className="p-4">
                              <div className="text-sm">Dragging...</div>
                            </CardContent>
                          </Card>
                        ) : null}
                      </DragOverlay>
                    </DndContext>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <Tabs value={activeDay.toString()} onValueChange={(v) => setActiveDay(parseInt(v))}>
                  <TabsList className="mb-6">
                    {DAYS.map((day, index) => (
                      <TabsTrigger key={index} value={index.toString()}>
                        {day.substring(0, 3)}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {DAYS.map((_, index) => (
                    <TabsContent key={index} value={index.toString()}>
                      <DndContext
                        sensors={sensors}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext
                          items={getDaySchedule(index).map((b) => b.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {getDaySchedule(index).length > 0 ? (
                            getDaySchedule(index).map((block) => (
                              <SortableBlock
                                key={block.id}
                                block={block}
                                subjects={subjects}
                                onEdit={(b: StudyBlock) => {
                                  setEditingBlock(b);
                                  setNewBlock({
                                    subject_id: b.subject_id,
                                    day_of_week: b.day_of_week,
                                    start_time: b.start_time,
                                    end_time: b.end_time,
                                    session_type: b.session_type,
                                    notes: b.notes || "",
                                  });
                                  setIsAddBlockOpen(true);
                                }}
                                onDelete={deleteBlock}
                                onToggleComplete={toggleComplete}
                              />
                            ))
                          ) : (
                            <Card className="border-dashed">
                              <CardContent className="p-8 text-center">
                                <p className="text-muted-foreground">No study blocks for this day</p>
                                <Button
                                  variant="link"
                                  onClick={() => {
                                    setNewBlock({ ...newBlock, day_of_week: index });
                                    setIsAddBlockOpen(true);
                                  }}
                                >
                                  Add a block
                                </Button>
                              </CardContent>
                            </Card>
                          )}
                        </SortableContext>
                        <DragOverlay>
                          {activeId ? (
                            <Card className="opacity-50">
                              <CardContent className="p-4">
                                <div className="text-sm">Dragging...</div>
                              </CardContent>
                            </Card>
                          ) : null}
                        </DragOverlay>
                      </DndContext>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
