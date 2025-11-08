import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Send, Upload, X, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import prepiqLogo from "@/assets/prepiq-logo.jpg";

interface Message {
  role: "user" | "assistant";
  content: string;
  image?: string;
}

const AIStudyBuddy = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your AI Study Buddy. I can help you solve complex problems, analyze images, and provide detailed step-by-step explanations. Upload an image or ask me a question!"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
      }
    };
    checkAuth();
  }, [navigate]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!input.trim() && !uploadedImage) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim() || "Please analyze this image and provide a detailed explanation.",
      image: uploadedImage || undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    const currentImage = uploadedImage;
    setUploadedImage(null);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("chat-ai", {
        body: {
          messages: [
            {
              role: "system",
              content: "You are an expert AI tutor specializing in detailed, step-by-step problem solving. When analyzing questions or images, provide comprehensive explanations with clear reasoning at each step. Break down complex problems into manageable parts and explain the logic behind each solution step."
            },
            ...messages.map(msg => ({
              role: msg.role,
              content: msg.content,
              ...(msg.image && { image: msg.image })
            })),
            {
              role: "user",
              content: userMessage.content,
              ...(currentImage && { image: currentImage })
            }
          ]
        }
      });

      if (error) throw error;

      if (data?.response) {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: data.response
        }]);
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to get response from AI",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Immersive Educational Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Base gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5" />
        <div className="absolute inset-0 bg-gradient-to-tl from-blue-500/5 via-transparent to-primary/5" />
        
        {/* Large gradient orbs for depth */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/8 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/8 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        
        {/* Educational Elements Layer 1 - Far Background */}
        <div className="absolute top-20 left-[15%] opacity-20">
          <div className="text-6xl font-bold text-primary/40 rotate-12 animate-float" style={{ animationDelay: '0.5s' }}>∑</div>
        </div>
        <div className="absolute top-[40%] right-[10%] opacity-15">
          <div className="text-5xl font-bold text-primary/40 -rotate-6 animate-float" style={{ animationDelay: '1.5s' }}>∫</div>
        </div>
        <div className="absolute bottom-[30%] left-[20%] opacity-20">
          <div className="text-4xl font-bold text-purple-500/40 rotate-45 animate-float" style={{ animationDelay: '2s' }}>π</div>
        </div>
        <div className="absolute top-[60%] right-[25%] opacity-15">
          <div className="text-5xl font-bold text-blue-500/40 -rotate-12 animate-float" style={{ animationDelay: '0.8s' }}>∞</div>
        </div>
        
        {/* Educational Elements Layer 2 - Mid Background */}
        <div className="absolute top-[15%] right-[20%] opacity-25">
          <svg className="w-24 h-24 text-primary/30 animate-float" style={{ animationDelay: '1.2s' }} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
          </svg>
        </div>
        <div className="absolute bottom-[40%] right-[15%] opacity-20">
          <svg className="w-20 h-20 text-purple-500/30 animate-float" style={{ animationDelay: '2.5s' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v6m0 6v6M1 12h6m6 0h6"/>
            <circle cx="12" cy="12" r="10"/>
          </svg>
        </div>
        <div className="absolute top-[70%] left-[10%] opacity-25">
          <svg className="w-28 h-28 text-blue-500/30 animate-float" style={{ animationDelay: '1.8s' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </div>
        
        {/* Abstract geometric shapes */}
        <div className="absolute top-[25%] left-[8%] w-32 h-32 border-2 border-primary/10 rounded-lg rotate-12 animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-[25%] right-[8%] w-24 h-24 border-2 border-purple-500/10 rounded-full animate-float" style={{ animationDelay: '2.2s' }} />
        <div className="absolute top-[50%] right-[5%] w-20 h-20 border-2 border-blue-500/10 rotate-45 animate-float" style={{ animationDelay: '0.7s' }} />
        
        {/* DNA/Circuit pattern elements */}
        <div className="absolute top-[35%] left-[5%] opacity-15">
          <svg className="w-16 h-32 text-primary/40 animate-float" style={{ animationDelay: '1.3s' }} viewBox="0 0 24 48" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4c4 4 16 8 16 16s-12 12-16 16M20 4c-4 4-16 8-16 16s12 12 16 16" strokeLinecap="round"/>
            <circle cx="4" cy="4" r="2" fill="currentColor"/>
            <circle cx="20" cy="4" r="2" fill="currentColor"/>
            <circle cx="12" cy="24" r="2" fill="currentColor"/>
            <circle cx="4" cy="44" r="2" fill="currentColor"/>
            <circle cx="20" cy="44" r="2" fill="currentColor"/>
          </svg>
        </div>
        
        {/* Brain/Neural network element */}
        <div className="absolute bottom-[15%] left-[25%] opacity-20">
          <svg className="w-20 h-20 text-purple-500/40 animate-float" style={{ animationDelay: '2.8s' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="6" cy="6" r="2"/>
            <circle cx="18" cy="6" r="2"/>
            <circle cx="12" cy="12" r="2"/>
            <circle cx="6" cy="18" r="2"/>
            <circle cx="18" cy="18" r="2"/>
            <path d="M6 6l6 6m0 0l6-6M12 12l-6 6m6-6l6 6" strokeLinecap="round"/>
          </svg>
        </div>
        
        {/* Study icons in refined style */}
        <div className="absolute top-[45%] left-[12%] opacity-25">
          <svg className="w-16 h-16 text-primary/40 animate-float" style={{ animationDelay: '0.9s' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
        </div>
        <div className="absolute top-[80%] right-[30%] opacity-20">
          <svg className="w-14 h-14 text-blue-500/40 animate-float" style={{ animationDelay: '1.6s' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
            <path d="M6 12v5c3 3 9 3 12 0v-5"/>
          </svg>
        </div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="container max-w-5xl mx-auto p-4 md:p-6 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="hover:bg-primary/10 transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="relative">
                <img src={prepiqLogo} alt="PrepIQ" className="w-12 h-12 rounded-full ring-2 ring-primary/20" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gradient">AI Study Buddy</h1>
                <p className="text-sm text-muted-foreground">Your personal AI tutor, always ready to help</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Chat Container */}
        <div className="max-w-4xl mx-auto">
          <Card className="backdrop-blur-xl bg-card/50 border-border/50 shadow-2xl">
            <div className="p-6 h-[calc(100vh-220px)] flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto mb-6 space-y-6 pr-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 animate-fade-in ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role === "assistant" && (
                      <div className="flex-shrink-0">
                        <img src={prepiqLogo} alt="AI" className="w-10 h-10 rounded-full ring-2 ring-primary/20" />
                      </div>
                    )}
                    <div className={`flex flex-col gap-2 max-w-[75%] ${message.role === "user" ? "items-end" : "items-start"}`}>
                      {message.image && (
                        <img
                          src={message.image}
                          alt="Uploaded"
                          className="max-w-full h-auto rounded-xl border border-border shadow-lg"
                        />
                      )}
                      <div
                        className={`rounded-2xl p-4 transition-all duration-300 ${
                          message.role === "user"
                            ? "bg-gradient-primary text-white shadow-lg"
                            : "bg-muted/50 text-foreground backdrop-blur-sm"
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3 animate-fade-in">
                    <div className="flex-shrink-0">
                      <img src={prepiqLogo} alt="AI" className="w-10 h-10 rounded-full ring-2 ring-primary/20" />
                    </div>
                    <div className="bg-muted/50 backdrop-blur-sm rounded-2xl p-4">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Image Preview */}
              {uploadedImage && (
                <div className="mb-4 relative inline-block animate-scale-in">
                  <img
                    src={uploadedImage}
                    alt="To upload"
                    className="max-h-32 rounded-xl border border-border shadow-lg"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-7 w-7 rounded-full shadow-lg hover:scale-110 transition-transform"
                    onClick={() => setUploadedImage(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Input Area */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
                  >
                    <Upload className="w-4 h-4" />
                  </Button>
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask anything... Type @ for mentions"
                    className="flex-1 min-h-[60px] resize-none rounded-xl bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-300"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit();
                      }
                    }}
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSubmit}
                    disabled={isLoading || (!input.trim() && !uploadedImage)}
                    className="bg-gradient-primary hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    size="icon"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInput("Explain this step by step with detailed reasoning")}
                    disabled={isLoading}
                    className="rounded-full text-xs hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
                  >
                    📖 Step-by-step
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInput("Solve this problem and show all work")}
                    disabled={isLoading}
                    className="rounded-full text-xs hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
                  >
                    ✍️ Show work
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInput("Summarize the key concepts")}
                    disabled={isLoading}
                    className="rounded-full text-xs hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
                  >
                    📝 Summarize
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInput("Create practice questions on this topic")}
                    disabled={isLoading}
                    className="rounded-full text-xs hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
                  >
                    🎯 Practice
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIStudyBuddy;
