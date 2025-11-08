import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Image as ImageIcon, Loader2, MessageSquare } from "lucide-react";

// Streaming helper per Lovable AI docs
const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

type Role = "user" | "assistant";

type Msg = {
  role: Role;
  text: string;
  images?: string[]; // data URLs
};

async function streamChat({
  messages,
  onDelta,
  onDone,
}: {
  messages: any[];
  onDelta: (deltaText: string) => void;
  onDone: () => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages }),
  });

  if (!resp.ok || !resp.body) {
    const txt = await resp.text();
    throw new Error(txt || "Failed to start stream");
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);

      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") {
        streamDone = true;
        break;
      }

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {
        textBuffer = line + "\n" + textBuffer;
        break;
      }
    }
  }

  if (textBuffer.trim()) {
    for (let raw of textBuffer.split("\n")) {
      if (!raw) continue;
      if (raw.endsWith("\r")) raw = raw.slice(0, -1);
      if (raw.startsWith(":") || raw.trim() === "") continue;
      if (!raw.startsWith("data: ")) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === "[DONE]") continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {
        /* ignore */
      }
    }
  }

  onDone();
}

function dataUrlFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AITutor() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = "AI Study Buddy | PrepIQ";
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const apiMessages = useMemo(() => {
    return messages.map((m) => {
      const parts: any[] = [];
      if (m.text) parts.push({ type: "text", text: m.text });
      if (m.images?.length) {
        for (const img of m.images) {
          parts.push({ type: "image_url", image_url: { url: img } });
        }
      }
      return { role: m.role, content: parts.length ? parts : m.text };
    });
  }, [messages]);

  const send = async (preset?: string) => {
    try {
      const text = preset ?? input.trim();
      if (!text && !imageDataUrl) return;

      const userMsg: Msg = { role: "user", text: text || "(Image attached)", images: imageDataUrl ? [imageDataUrl] : [] };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setImageDataUrl(null);
      setIsLoading(true);

      let assistantSoFar = "";
      const upsertAssistant = (delta: string) => {
        assistantSoFar += delta;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) => (i === prev.length - 1 ? { ...m, text: assistantSoFar } : m));
          }
          return [...prev, { role: "assistant", text: assistantSoFar }];
        });
      };

      const outbound = [
        ...apiMessages,
        {
          role: "user",
          content: [
            ...(text ? [{ type: "text", text }] : []),
            ...(userMsg.images?.map((u) => ({ type: "image_url", image_url: { url: u } })) || []),
          ],
        },
      ];

      await streamChat({
        messages: outbound,
        onDelta: (chunk) => upsertAssistant(chunk),
        onDone: () => setIsLoading(false),
      });
    } catch (e) {
      console.error(e);
      setIsLoading(false);
      toast({
        title: "Chat failed",
        description:
          e instanceof Error ? e.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await dataUrlFromFile(file);
      setImageDataUrl(dataUrl);
      toast({ title: "Image added", description: "Your image will be analyzed with the question." });
    } catch (err) {
      toast({ title: "Image error", description: "Failed to load image.", variant: "destructive" });
    }
  };

  return (
    <main className="min-h-screen bg-gradient-hero p-6 lg:p-10">
      <header className="max-w-5xl mx-auto mb-6">
        <h1 className="text-3xl font-bold">AI Study Buddy</h1>
        <p className="text-muted-foreground mt-1">
          Ask complex questions and attach photos. You'll get step-by-step, well-reasoned solutions.
        </p>
      </header>

      <section className="max-w-5xl mx-auto grid gap-6">
        <Card className="p-4 h-[60vh] overflow-y-auto" ref={listRef as any}>
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-sm text-muted-foreground">
                Try: "Solve this calculus limit step by step" or upload a photo of a question.
              </div>
            )}
            {messages.map((m, idx) => (
              <div key={idx} className="flex gap-3 items-start">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${m.role === "assistant" ? "bg-accent" : "bg-background"}`}>
                  {m.role === "assistant" ? "AI" : "U"}
                </div>
                <div className="flex-1">
                  {m.images?.length ? (
                    <div className="flex gap-2 mb-2 flex-wrap">
                      {m.images.map((src, i) => (
                        <img key={i} src={src} alt="uploaded problem image" className="w-28 h-28 object-cover rounded-md border" loading="lazy" />
                      ))}
                    </div>
                  ) : null}
                  <div className="prose prose-invert max-w-none text-sm whitespace-pre-wrap">{m.text}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer hover:bg-muted">
              <ImageIcon className="w-4 h-4" />
              <span className="text-sm">Attach image</span>
              <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
            </label>
            {imageDataUrl && (
              <img src={imageDataUrl} alt="preview" className="h-10 w-10 rounded-md border object-cover" />
            )}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Type your question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
            />
            <Button onClick={() => send()} disabled={isLoading} className="bg-gradient-primary">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3">
            <Button variant="outline" size="sm" onClick={() => send("Explain this concept step by step with examples.")}>Explain a topic</Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/quiz-generator")}>Generate quiz</Button>
          </div>
        </Card>
      </section>
    </main>
  );
}
