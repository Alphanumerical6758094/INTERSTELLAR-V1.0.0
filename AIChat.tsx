import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIChatProps {
  onChatComplete?: (query: string, response: string) => void;
  initialMessage?: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

const AIChat = ({ onChatComplete, initialMessage }: AIChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle initial message from history
  useEffect(() => {
    if (initialMessage && messages.length === 0) {
      setInput(initialMessage);
    }
  }, [initialMessage]);

  const streamChat = async (userMessage: string) => {
    setIsLoading(true);
    let assistantContent = "";

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!resp.ok || !resp.body) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to start stream");
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
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) =>
                    i === prev.length - 1 ? { ...m, content: assistantContent } : m
                  );
                }
                return [...prev, { role: "assistant", content: assistantContent }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
      // Call onChatComplete with the final response
      if (assistantContent && onChatComplete) {
        onChatComplete(userMessage, assistantContent);
      }
    } catch (e) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    await streamChat(userMessage);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center border border-secondary/30">
            <Bot className="w-5 h-5 text-secondary" />
          </div>
          <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-primary animate-pulse" />
        </div>
        <div>
          <h3 className="font-display text-lg font-semibold text-foreground">TARS AI</h3>
          <p className="text-xs text-muted-foreground">Ask me anything across the universe</p>
        </div>
      </div>

      {/* Messages container */}
      <div 
        className={`
          relative rounded-2xl border transition-all duration-300
          ${messages.length > 0 
            ? "bg-card/60 backdrop-blur-xl border-border/50 p-4 mb-4" 
            : "border-transparent"
          }
        `}
      >
        {messages.length > 0 && (
          <div className="max-h-64 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`
                    w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                    ${msg.role === "user" 
                      ? "bg-primary/20 text-primary" 
                      : "bg-secondary/20 text-secondary"
                    }
                  `}
                >
                  {msg.role === "user" ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                <div
                  className={`
                    flex-1 rounded-xl px-4 py-3 text-sm
                    ${msg.role === "user"
                      ? "bg-primary/10 text-foreground ml-12"
                      : "bg-muted/50 text-foreground mr-12"
                    }
                  `}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm prose-invert max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit}>
        <div
          className={`
            relative flex items-center gap-3 px-4 py-3
            bg-card/60 backdrop-blur-xl rounded-xl
            border transition-all duration-300
            ${isFocused 
              ? "border-secondary shadow-[0_0_20px_hsl(210_80%_45%/0.2)]" 
              : "border-border/50 hover:border-secondary/50"
            }
          `}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Ask TARS anything..."
            disabled={isLoading}
            className="
              flex-1 bg-transparent outline-none
              text-foreground placeholder:text-muted-foreground
              font-sans text-sm disabled:opacity-50
            "
          />
          
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`
              p-2 rounded-lg transition-all duration-300
              ${input.trim() && !isLoading
                ? "bg-secondary text-secondary-foreground hover:bg-secondary/90"
                : "bg-muted text-muted-foreground cursor-not-allowed"
              }
            `}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AIChat;
