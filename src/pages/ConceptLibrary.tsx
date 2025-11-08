import { useState, useMemo } from "react";
import { ExternalLink, BookOpen, Youtube, FileText, Search, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import modulesData from "@/data/modules.json";
import notesData from "@/data/notes.json";

type Subject = "Physics" | "Chemistry" | "Biology" | "Mathematics";
type ViewMode = "videos" | "notes";

interface NoteContent {
  title: string;
  summary: string;
  keyPoints: string[];
  formulas: string[];
}

const ConceptLibrary = () => {
  const [activeSubject, setActiveSubject] = useState<Subject>("Physics");
  const [viewMode, setViewMode] = useState<ViewMode>("videos");
  const [selectedNote, setSelectedNote] = useState<NoteContent | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const subjects: Subject[] = ["Physics", "Chemistry", "Biology", "Mathematics"];

  // Filter modules based on search query
  const filteredModules = useMemo(() => {
    if (!searchQuery.trim()) {
      return modulesData[activeSubject];
    }

    const query = searchQuery.toLowerCase();
    const currentSubjectModules = modulesData[activeSubject];
    
    return Object.entries(currentSubjectModules).reduce((acc, [title, url]) => {
      if (title.toLowerCase().includes(query)) {
        acc[title] = url;
      }
      return acc;
    }, {} as Record<string, string>);
  }, [searchQuery, activeSubject]);

  const handleModuleClick = (videoUrl: string) => {
    window.open(videoUrl, "_blank", "noopener,noreferrer");
  };

  const handleNotesClick = (moduleName: string) => {
    const noteContent = (notesData[activeSubject] as Record<string, NoteContent>)[moduleName];
    if (noteContent) {
      setSelectedNote(noteContent);
      setIsDialogOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            Concept Library
          </h1>
          <p className="text-muted-foreground">
            Master every NCERT concept through videos and detailed notes
          </p>
        </div>

        {/* View Mode Selector */}
        <div className="flex gap-4 mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <Button
            onClick={() => setViewMode("videos")}
            variant={viewMode === "videos" ? "default" : "outline"}
            className="flex-1 h-24 text-lg transition-all duration-300 hover:scale-105"
          >
            <Youtube className="mr-2 h-6 w-6" />
            Watch on YouTube
          </Button>
          <Button
            onClick={() => setViewMode("notes")}
            variant={viewMode === "notes" ? "default" : "outline"}
            className="flex-1 h-24 text-lg transition-all duration-300 hover:scale-105"
          >
            <FileText className="mr-2 h-6 w-6" />
            Study Notes
          </Button>
        </div>

        {/* Search Bar */}
        <div className="mb-6 animate-fade-in" style={{ animationDelay: "0.15s" }}>
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search modules across all subjects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-12 text-base"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {searchQuery && (
            <p className="text-center text-sm text-muted-foreground mt-2">
              Found {Object.keys(filteredModules).length} module{Object.keys(filteredModules).length !== 1 ? 's' : ''} in {activeSubject}
            </p>
          )}
        </div>

        <Tabs value={activeSubject} onValueChange={(value) => setActiveSubject(value as Subject)}>
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            {subjects.map((subject) => (
              <TabsTrigger key={subject} value={subject} className="transition-all duration-200">
                {subject}
              </TabsTrigger>
            ))}
          </TabsList>

          {subjects.map((subject) => (
            <TabsContent key={subject} value={subject} className="mt-0">
              {viewMode === "videos" ? (
                Object.keys(filteredModules).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(filteredModules).map(([title, url], index) => (
                    <Card
                      key={title}
                      className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-primary/50 animate-fade-in"
                      style={{ animationDelay: `${0.3 + index * 0.05}s` }}
                      onClick={() => handleModuleClick(url)}
                    >
                      <CardHeader>
                        <CardTitle className="text-lg flex items-start justify-between gap-2">
                          <span className="line-clamp-2">{title}</span>
                          <ExternalLink className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                        </CardTitle>
                        <CardDescription>Click to watch video tutorial</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Youtube className="h-4 w-4 text-primary" />
                          <span>YouTube Video</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                ) : (
                  <div className="text-center py-12 animate-fade-in">
                    <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">No modules found</h3>
                    <p className="text-muted-foreground mb-4">
                      No modules match "{searchQuery}" in {activeSubject}
                    </p>
                    <Button onClick={() => setSearchQuery("")} variant="outline">
                      Clear Search
                    </Button>
                  </div>
                )
              ) : (
                Object.keys(filteredModules).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(filteredModules).map(([title], index) => {
                    const hasNotes = (notesData[subject] as Record<string, NoteContent>)[title];
                    return (
                      <Card
                        key={title}
                        className={`transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-primary/50 animate-fade-in ${
                          hasNotes ? "cursor-pointer" : "opacity-50"
                        }`}
                        style={{ animationDelay: `${0.3 + index * 0.05}s` }}
                        onClick={() => hasNotes && handleNotesClick(title)}
                      >
                        <CardHeader>
                          <CardTitle className="text-lg flex items-start justify-between gap-2">
                            <span className="line-clamp-2">{title}</span>
                            <FileText className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                          </CardTitle>
                          <CardDescription>
                            {hasNotes ? "Click to view detailed notes" : "Notes coming soon"}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                            <span>Study Notes</span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
                ) : (
                  <div className="text-center py-12 animate-fade-in">
                    <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">No modules found</h3>
                    <p className="text-muted-foreground mb-4">
                      No modules match "{searchQuery}" in {activeSubject}
                    </p>
                    <Button onClick={() => setSearchQuery("")} variant="outline">
                      Clear Search
                    </Button>
                  </div>
                )
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Notes Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] animate-scale-in">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-primary" />
                {selectedNote?.title}
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[60vh] pr-4">
              {selectedNote && (
                <div className="space-y-6">
                  <div className="animate-fade-in">
                    <h3 className="text-lg font-semibold mb-2 text-primary">Summary</h3>
                    <p className="text-muted-foreground leading-relaxed">{selectedNote.summary}</p>
                  </div>

                  <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
                    <h3 className="text-lg font-semibold mb-3 text-primary">Key Points</h3>
                    <ul className="space-y-2">
                      {selectedNote.keyPoints.map((point, index) => (
                        <li key={index} className="flex gap-3 items-start">
                          <span className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <span className="text-foreground leading-relaxed">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {selectedNote.formulas.length > 0 && (
                    <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
                      <h3 className="text-lg font-semibold mb-3 text-primary">Important Formulas</h3>
                      <div className="space-y-2 bg-muted/50 p-4 rounded-lg">
                        {selectedNote.formulas.map((formula, index) => (
                          <div
                            key={index}
                            className="font-mono text-sm bg-background p-3 rounded border border-border"
                          >
                            {formula}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ConceptLibrary;
