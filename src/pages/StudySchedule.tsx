import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { DndContext, DragEndEvent, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, Clock, GripVertical, Plus, Trash2, Edit2, Save, X, BookOpen, Target, Brain, Sparkles } from "lucide-react";

interface Subject {
  id: string;
  name: string;
  priority: "high" | "medium" | "low";
  hoursPerWeek: number;
  color: string;
}

interface TimeSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  subjectId: string;
  type: "study" | "break" | "extracurricular" | "exam-prep";
}

interface StudyGoals {
  targetHoursPerDay: number;
  examDates: { subject: string; date: string }[];
  preferredStudyTime: "morning" | "afternoon" | "evening" | "night";
  breakDuration: number;
}

const COLORS = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-pink-500", "bg-yellow-500", "bg-red-500", "bg-indigo-500"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const SortableSubject = ({ subject, onEdit, onDelete }: { subject: Subject; onEdit: () => void; onDelete: () => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: subject.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className={`w-3 h-3 rounded-full ${subject.color}`} />
      <div className="flex-1">
        <p className="font-medium text-foreground">{subject.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant={subject.priority === "high" ? "destructive" : subject.priority === "medium" ? "default" : "secondary"}>
            {subject.priority}
          </Badge>
          <span className="text-sm text-muted-foreground">{subject.hoursPerWeek}h/week</span>
        </div>
      </div>
      <Button variant="ghost" size="icon" onClick={onEdit}>
        <Edit2 className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={onDelete}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default function StudySchedule() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"setup" | "schedule">("setup");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [schedule, setSchedule] = useState<TimeSlot[]>([]);
  const [goals, setGoals] = useState<StudyGoals>({
    targetHoursPerDay: 4,
    examDates: [],
    preferredStudyTime: "morning",
    breakDuration: 15,
  });

  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectForm, setSubjectForm] = useState({
    name: "",
    priority: "medium" as "high" | "medium" | "low",
    hoursPerWeek: 5,
  });

  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [showSlotDialog, setShowSlotDialog] = useState(false);
  const [slotForm, setSlotForm] = useState({
    day: "Monday",
    startTime: "09:00",
    endTime: "10:00",
    subjectId: "",
    type: "study" as "study" | "break" | "extracurricular" | "exam-prep",
  });

  const sensors = useSensors(useSensor(PointerSensor));

  // Load from database
  useEffect(() => {
    loadFromDatabase();
  }, []);

  const loadFromDatabase = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [subjectsRes, schedulesRes, goalsRes] = await Promise.all([
      supabase.from("subjects" as any).select("*").eq("user_id", user.id).order("priority", { ascending: true }),
      supabase.from("study_schedules" as any).select("*").eq("user_id", user.id),
      supabase.from("study_goals" as any).select("*").eq("user_id", user.id).limit(1)
    ]);

    if (subjectsRes.data) {
      const mappedSubjects = subjectsRes.data.map((s: any) => ({
        id: s.id,
        name: s.name,
        priority: (s.difficulty?.toLowerCase() || "medium") as "high" | "medium" | "low",
        hoursPerWeek: 5,
        color: s.color || COLORS[0]
      }));
      setSubjects(mappedSubjects);
    }

    if (schedulesRes.data) {
      const mappedSchedules = schedulesRes.data.map((s: any) => ({
        id: s.id,
        day: DAYS[s.day_of_week] || "Monday",
        startTime: s.start_time,
        endTime: s.end_time,
        subjectId: s.subject_id,
        type: (s.session_type as any) || "study"
      }));
      setSchedule(mappedSchedules);
      if (mappedSchedules.length > 0) setStep("schedule");
    }

    if (goalsRes.data && goalsRes.data[0]) {
      setGoals({
        targetHoursPerDay: (goalsRes.data[0] as any).target_hours || 4,
        examDates: [],
        preferredStudyTime: "morning",
        breakDuration: 15
      });
    }
  };

  const addSubject = async () => {
    if (!subjectForm.name.trim()) {
      toast.error("Please enter a subject name");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const newSubject = {
      user_id: user.id,
      name: subjectForm.name,
      difficulty: subjectForm.priority,
      color: COLORS[subjects.length % COLORS.length],
      priority: subjectForm.priority === "high" ? 3 : subjectForm.priority === "medium" ? 2 : 1
    };

    if (editingSubject) {
      const { error } = await (supabase.from("subjects" as any).update(newSubject).eq("id", editingSubject.id));
      if (error) {
        toast.error("Failed to update subject");
        return;
      }
      toast.success("Subject updated");
    } else {
      const { data, error } = await (supabase.from("subjects" as any).insert(newSubject).select().single());
      if (error) {
        toast.error("Failed to add subject");
        return;
      }
      toast.success("Subject added");
    }

    await loadFromDatabase();
    setSubjectForm({ name: "", priority: "medium", hoursPerWeek: 5 });
    setShowSubjectForm(false);
    setEditingSubject(null);
  };

  const deleteSubject = async (id: string) => {
    const { error } = await (supabase.from("subjects" as any).delete().eq("id", id));
    if (error) {
      toast.error("Failed to delete subject");
      return;
    }
    await loadFromDatabase();
    toast.success("Subject deleted");
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSubjects((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const generateSchedule = async () => {
    if (subjects.length === 0) {
      toast.error("Please add at least one subject");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const newSchedule: TimeSlot[] = [];
    const timeSlots = generateTimeSlots();
    
    const sortedSubjects = [...subjects].sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    let slotIndex = 0;
    sortedSubjects.forEach(subject => {
      const slotsNeeded = Math.ceil((subject.hoursPerWeek / 7) * (7 / goals.targetHoursPerDay));
      for (let i = 0; i < slotsNeeded && slotIndex < timeSlots.length; i++) {
        newSchedule.push({
          ...timeSlots[slotIndex],
          subjectId: subject.id,
          type: "study",
        });
        slotIndex++;
        
        if (slotIndex < timeSlots.length) {
          const breakSlot = timeSlots[slotIndex];
          const [hours, minutes] = breakSlot.startTime.split(":").map(Number);
          const breakEnd = new Date(2024, 0, 1, hours, minutes + goals.breakDuration);
          newSchedule.push({
            ...breakSlot,
            endTime: `${breakEnd.getHours().toString().padStart(2, "0")}:${breakEnd.getMinutes().toString().padStart(2, "0")}`,
            subjectId: "",
            type: "break",
          });
          slotIndex++;
        }
      }
    });

    await (supabase.from("study_schedules" as any).delete().eq("user_id", user.id));

    const scheduleData = newSchedule.map(slot => ({
      user_id: user.id,
      subject_id: slot.subjectId || subjects[0].id,
      day_of_week: DAYS.indexOf(slot.day),
      start_time: slot.startTime,
      end_time: slot.endTime,
      session_type: slot.type,
      notes: ""
    }));

    const { error } = await (supabase.from("study_schedules" as any).insert(scheduleData));
    if (error) {
      toast.error("Failed to save schedule");
      return;
    }

    await (supabase.from("study_goals" as any).upsert({
      user_id: user.id,
      goal_type: "daily_hours",
      description: "Daily study target",
      target_hours: goals.targetHoursPerDay
    }));

    await loadFromDatabase();
    setStep("schedule");
    toast.success("Schedule generated! You can now customize it.");
  };

  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const startHour = goals.preferredStudyTime === "morning" ? 6 : goals.preferredStudyTime === "afternoon" ? 12 : goals.preferredStudyTime === "evening" ? 16 : 20;
    
    DAYS.forEach(day => {
      for (let i = 0; i < Math.floor(goals.targetHoursPerDay); i++) {
        const start = startHour + i;
        slots.push({
          id: `${day}-${i}`,
          day,
          startTime: `${start.toString().padStart(2, "0")}:00`,
          endTime: `${(start + 1).toString().padStart(2, "0")}:00`,
          subjectId: "",
          type: "study",
        });
      }
    });
    
    return slots;
  };

  const addCustomSlot = (day: string) => {
    if (!subjects[0]) {
      toast.error("Please add subjects first");
      return;
    }
    setSlotForm({
      day,
      startTime: "09:00",
      endTime: "10:00",
      subjectId: subjects[0].id,
      type: "study",
    });
    setEditingSlot(null);
    setShowSlotDialog(true);
  };

  const editSlot = (slot: TimeSlot) => {
    setSlotForm({
      day: slot.day,
      startTime: slot.startTime,
      endTime: slot.endTime,
      subjectId: slot.subjectId,
      type: slot.type,
    });
    setEditingSlot(slot);
    setShowSlotDialog(true);
  };

  const saveSlot = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Validate times
    if (slotForm.startTime >= slotForm.endTime) {
      toast.error("End time must be after start time");
      return;
    }

    if (editingSlot) {
      // Update existing slot
      const { error } = await (supabase.from("study_schedules" as any).update({
        subject_id: slotForm.subjectId,
        day_of_week: DAYS.indexOf(slotForm.day),
        start_time: slotForm.startTime,
        end_time: slotForm.endTime,
        session_type: slotForm.type,
      }).eq("id", editingSlot.id));

      if (error) {
        toast.error("Failed to update slot");
        return;
      }
      toast.success("Slot updated");
    } else {
      // Add new slot
      const { error } = await (supabase.from("study_schedules" as any).insert({
        user_id: user.id,
        subject_id: slotForm.subjectId,
        day_of_week: DAYS.indexOf(slotForm.day),
        start_time: slotForm.startTime,
        end_time: slotForm.endTime,
        session_type: slotForm.type,
        notes: ""
      }));

      if (error) {
        toast.error("Failed to add slot");
        return;
      }
      toast.success("Slot added");
    }

    await loadFromDatabase();
    setShowSlotDialog(false);
  };

  const updateSlot = async (id: string, updates: Partial<TimeSlot>) => {
    const dbUpdates: any = {};
    if (updates.startTime) dbUpdates.start_time = updates.startTime;
    if (updates.endTime) dbUpdates.end_time = updates.endTime;
    if (updates.subjectId) dbUpdates.subject_id = updates.subjectId;
    if (updates.type) dbUpdates.session_type = updates.type;

    const { error } = await (supabase.from("study_schedules" as any).update(dbUpdates).eq("id", id));
    if (error) {
      toast.error("Failed to update slot");
      return;
    }

    await loadFromDatabase();
  };

  const deleteSlot = async (id: string) => {
    const { error } = await (supabase.from("study_schedules" as any).delete().eq("id", id));
    if (error) {
      toast.error("Failed to delete slot");
      return;
    }

    await loadFromDatabase();
  };

  const getSubjectById = (id: string) => subjects.find(s => s.id === id);

  const getScheduleForDay = (day: string) => schedule.filter(slot => slot.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));

  if (step === "setup") {
    return (
      <div className="min-h-screen bg-background animate-fade-in">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10 animate-slide-up">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => navigate("/dashboard")}>
                ← Back
              </Button>
              <h1 className="text-2xl font-bold text-foreground">Smart Study Schedule</h1>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-5xl">
          <Card className="mb-6 animate-scale-in hover-lift transition-smooth" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 transition-smooth">
                <Target className="h-5 w-5" />
                Study Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="targetHours">Target Hours Per Day</Label>
                  <Input
                    id="targetHours"
                    type="number"
                    min="1"
                    max="12"
                    value={goals.targetHoursPerDay}
                    onChange={(e) => setGoals({ ...goals, targetHoursPerDay: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="breakDuration">Break Duration (minutes)</Label>
                  <Input
                    id="breakDuration"
                    type="number"
                    min="5"
                    max="60"
                    value={goals.breakDuration}
                    onChange={(e) => setGoals({ ...goals, breakDuration: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="preferredTime">Preferred Study Time</Label>
                  <Select value={goals.preferredStudyTime} onValueChange={(value: any) => setGoals({ ...goals, preferredStudyTime: value })}>
                    <SelectTrigger id="preferredTime">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning (6 AM - 12 PM)</SelectItem>
                      <SelectItem value="afternoon">Afternoon (12 PM - 4 PM)</SelectItem>
                      <SelectItem value="evening">Evening (4 PM - 8 PM)</SelectItem>
                      <SelectItem value="night">Night (8 PM - 12 AM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-scale-in hover-lift transition-smooth" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 transition-smooth">
                  <BookOpen className="h-5 w-5" />
                  Subjects & Priorities
                </CardTitle>
                <Button onClick={() => setShowSubjectForm(!showSubjectForm)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subject
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {showSubjectForm && (
                <Card className="border-2 border-primary animate-bounce-in">
                  <CardContent className="pt-6 space-y-4 transition-smooth">
                    <div>
                      <Label htmlFor="subjectName">Subject Name</Label>
                      <Input
                        id="subjectName"
                        value={subjectForm.name}
                        onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                        placeholder="e.g., Mathematics"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="priority">Priority</Label>
                        <Select value={subjectForm.priority} onValueChange={(value: any) => setSubjectForm({ ...subjectForm, priority: value })}>
                          <SelectTrigger id="priority">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="hours">Hours Per Week</Label>
                        <Input
                          id="hours"
                          type="number"
                          min="1"
                          max="40"
                          value={subjectForm.hoursPerWeek}
                          onChange={(e) => setSubjectForm({ ...subjectForm, hoursPerWeek: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={addSubject}>
                        <Save className="h-4 w-4 mr-2" />
                        {editingSubject ? "Update" : "Add"}
                      </Button>
                      <Button variant="outline" onClick={() => {
                        setShowSubjectForm(false);
                        setEditingSubject(null);
                        setSubjectForm({ name: "", priority: "medium", hoursPerWeek: 5 });
                      }}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {subjects.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No subjects added yet. Add your subjects to get started!</p>
                </div>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={subjects.map(s => s.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                      {subjects.map((subject) => (
                        <SortableSubject
                          key={subject.id}
                          subject={subject}
                          onEdit={() => {
                            setEditingSubject(subject);
                            setSubjectForm({
                              name: subject.name,
                              priority: subject.priority,
                              hoursPerWeek: subject.hoursPerWeek,
                            });
                            setShowSubjectForm(true);
                          }}
                          onDelete={() => deleteSubject(subject.id)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}

              {subjects.length > 0 && (
                <Button onClick={generateSchedule} size="lg" className="w-full mt-6">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generate Smart Schedule
                </Button>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10 animate-slide-up">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => setStep("setup")}>
              ← Edit Setup
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Your Study Schedule</h1>
          </div>
          <Button onClick={() => navigate("/dashboard")}>Done</Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="animate-fade-in hover-lift transition-smooth" style={{ animationDelay: '0.1s' }}>
            <CardContent className="pt-6 transition-smooth">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Study Hours</p>
                  <p className="text-2xl font-bold text-foreground">
                    {schedule.filter(s => s.type === "study").length}h
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-fade-in hover-lift transition-smooth" style={{ animationDelay: '0.2s' }}>
            <CardContent className="pt-6 transition-smooth">
              <div className="flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Subjects</p>
                  <p className="text-2xl font-bold text-foreground">{subjects.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-fade-in hover-lift transition-smooth" style={{ animationDelay: '0.3s' }}>
            <CardContent className="pt-6 transition-smooth">
              <div className="flex items-center gap-3">
                <Brain className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Break Time</p>
                  <p className="text-2xl font-bold text-foreground">
                    {schedule.filter(s => s.type === "break").length * goals.breakDuration}m
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
          {DAYS.map((day, idx) => (
            <Card key={day} className="flex flex-col animate-fade-in hover-lift transition-smooth" style={{ animationDelay: `${idx * 0.1}s` }}>
              <CardHeader className="pb-3 transition-smooth">
                <CardTitle className="text-lg">{day}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 space-y-2">
                {getScheduleForDay(day).map((slot, slotIdx) => {
                  const subject = getSubjectById(slot.subjectId);
                  return (
                    <div
                      key={slot.id}
                      className={`p-3 rounded-lg border relative group hover-scale transition-smooth animate-slide-in-left ${
                        slot.type === "break" ? "bg-muted/50" : subject ? subject.color + " text-white" : "bg-card"
                      }`}
                      style={{ animationDelay: `${(idx * 0.1) + (slotIdx * 0.05)}s` }}
                    >
                       <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 bg-background/20 hover:bg-background/40"
                          onClick={() => editSlot(slot)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 bg-background/20 hover:bg-background/40"
                          onClick={() => deleteSlot(slot.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-xs font-medium mb-1">
                        {slot.startTime} - {slot.endTime}
                      </p>
                      {slot.type === "break" ? (
                        <p className="text-sm font-semibold">Break</p>
                      ) : (
                        <p className="text-sm font-semibold">{subject?.name || "Study"}</p>
                      )}
                      {slot.type !== "study" && slot.type !== "break" && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {slot.type === "extracurricular" ? "Extracurricular" : "Exam Prep"}
                        </Badge>
                      )}
                    </div>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full hover-scale transition-smooth"
                  onClick={() => addCustomSlot(day)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Slot
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <Dialog open={showSlotDialog} onOpenChange={setShowSlotDialog}>
        <DialogContent className="sm:max-w-md animate-scale-in">
          <DialogHeader>
            <DialogTitle className="transition-smooth">{editingSlot ? "Edit Time Slot" : "Add Time Slot"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="slot-day">Day</Label>
              <Select value={slotForm.day} onValueChange={(value) => setSlotForm({ ...slotForm, day: value })}>
                <SelectTrigger id="slot-day">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map((day) => (
                    <SelectItem key={day} value={day}>
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
                  value={slotForm.startTime}
                  onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="end-time">End Time</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={slotForm.endTime}
                  onChange={(e) => setSlotForm({ ...slotForm, endTime: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="slot-type">Type</Label>
              <Select value={slotForm.type} onValueChange={(value: any) => setSlotForm({ ...slotForm, type: value })}>
                <SelectTrigger id="slot-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="study">Study</SelectItem>
                  <SelectItem value="break">Break</SelectItem>
                  <SelectItem value="extracurricular">Extracurricular</SelectItem>
                  <SelectItem value="exam-prep">Exam Prep</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {slotForm.type !== "break" && (
              <div>
                <Label htmlFor="slot-subject">Subject</Label>
                <Select value={slotForm.subjectId} onValueChange={(value) => setSlotForm({ ...slotForm, subjectId: value })}>
                  <SelectTrigger id="slot-subject">
                    <SelectValue />
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
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSlotDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveSlot}>
              <Save className="h-4 w-4 mr-2" />
              {editingSlot ? "Update" : "Add"} Slot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
