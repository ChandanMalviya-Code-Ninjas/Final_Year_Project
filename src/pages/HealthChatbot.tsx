import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Bot, Send, User, Heart, Stethoscope, Sparkles, Activity } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/utils/analytics";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const HealthChatbot = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your AI health assistant. How can I help you today? You can ask me about general health tips, wellness advice, or any health-related questions."
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/health-chat`;

      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!response.ok || !response.body) {
        if (response.status === 429) {
          throw new Error("Rate limits exceeded. Please try again later.");
        }
        if (response.status === 402) {
          throw new Error("Payment required. Please add credits to continue.");
        }
        throw new Error("Failed to get response");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;
      let assistantContent = "";

      // Add initial assistant message
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

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
            try {
              const { data: { user } } = await supabase.auth.getUser();
              if (user) {
                logActivity(user.id, "Health Chat", "/health-chatbot", "Completed", { query: input });
              }
            } catch (err) {
              console.error("Failed to log chat interaction", err);
            }
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  role: "assistant",
                  content: assistantContent
                };
                return newMessages;
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      setIsTyping(false);
    } catch (error: unknown) {
      console.error("Chat error:", error);
      setMessages(prev => prev.slice(0, -1)); // Remove user message
      setIsTyping(false);
      const errorMessage = error instanceof Error ? error.message : "Failed to get response. Please try again.";
      alert(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-green-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4">
      <div className="container max-w-5xl mx-auto py-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6 hover:bg-blue-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-200 dark:bg-red-900/40 rounded-lg">
                <Heart className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-red-900 dark:text-red-200">Cardio Health</p>
                <p className="text-xs text-red-700 dark:text-red-300">Heart & BP advice</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-200 dark:bg-blue-900/40 rounded-lg">
                <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">Fitness</p>
                <p className="text-xs text-blue-700 dark:text-blue-300">Exercise tips</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-200 dark:bg-green-900/40 rounded-lg">
                <Stethoscope className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-green-900 dark:text-green-200">Wellness</p>
                <p className="text-xs text-green-700 dark:text-green-300">General health</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-200 dark:bg-purple-900/40 rounded-lg">
                <Bot className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-purple-900 dark:text-purple-200">AI Doctor</p>
                <p className="text-xs text-purple-700 dark:text-purple-300">24/7 support</p>
              </div>
            </div>
          </div>
        </div>

        <Card className="shadow-2xl border-0 animate-fade-in flex flex-col h-[650px] overflow-hidden bg-white dark:bg-slate-900">
          <CardHeader className="bg-gradient-to-r from-blue-600 via-cyan-500 to-green-600 text-white border-b-4 border-blue-700 dark:border-blue-500 pb-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg border border-white/30">
                <Stethoscope className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-4xl font-bold">AI Health Advisor</CardTitle>
                <CardDescription className="text-cyan-100 text-base">Personalized health guidance & wellness support</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col min-h-0 p-6 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900">
            <div className="flex-1 overflow-y-auto pr-4 mb-6 rounded-lg bg-white dark:bg-slate-800/50">
              <div className="space-y-4 p-4">
                {messages.length === 1 && (
                  <div className="flex justify-center my-4">
                    <div className="bg-gradient-to-r from-blue-100 to-green-100 dark:from-blue-900/20 dark:to-green-900/20 rounded-xl p-6 max-w-md text-center border border-blue-200 dark:border-blue-800">
                      <Heart className="h-12 w-12 text-red-500 mx-auto mb-3 animate-pulse" />
                      <p className="text-slate-700 dark:text-slate-300 font-semibold">Welcome to Your Health Assistant!</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Ask me anything about health, fitness, nutrition, or wellness.</p>
                    </div>
                  </div>
                )}
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 animate-fade-in-up ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role === "assistant" && (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-cyan-500 to-green-500 text-white flex-shrink-0 mt-1 shadow-lg">
                        <Stethoscope className="h-5 w-5" />
                      </div>
                    )}
                    <div
                      className={`rounded-2xl px-5 py-4 max-w-[65%] transition-all duration-200 ${message.role === "user"
                          ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-3xl shadow-lg border border-blue-500/50"
                          : "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-bl-3xl shadow-md border border-slate-300 dark:border-slate-600"
                        }`}
                    >
                      <p className="text-sm leading-relaxed break-words">{message.content}</p>
                    </div>
                    {message.role === "user" && (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white flex-shrink-0 mt-1 shadow-lg">
                        <User className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-3 justify-start animate-fade-in-up">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-cyan-500 to-green-500 text-white flex-shrink-0 shadow-lg">
                      <Stethoscope className="h-5 w-5" />
                    </div>
                    <div className="rounded-2xl px-5 py-4 bg-slate-200 dark:bg-slate-700 rounded-bl-3xl shadow-md border border-slate-300 dark:border-slate-600">
                      <div className="flex gap-2 items-center">
                        <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-spin" />
                        <div className="flex gap-1">
                          <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-bounce animate-bounce-delay-0" />
                          <div className="w-2 h-2 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-bounce animate-bounce-delay-150" />
                          <div className="w-2 h-2 rounded-full bg-green-600 dark:bg-green-400 animate-bounce animate-bounce-delay-300" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="flex gap-3 border-t-2 border-slate-300 dark:border-slate-700 pt-4 shrink-0">
              <Input
                placeholder="Ask about symptoms, fitness, diet, or health concerns..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !isTyping && handleSend()}
                className="border-2 border-blue-300 dark:border-blue-700 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900/40 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-all duration-200 placeholder:text-slate-500"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim()}
                className={`h-12 px-8 text-white rounded-xl shadow-lg transition-all duration-200 font-semibold flex items-center gap-2 ${isTyping
                    ? "bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600"
                    : "bg-gradient-to-r from-blue-600 via-cyan-500 to-green-600 hover:from-blue-700 hover:via-cyan-600 hover:to-green-700"
                  }`}
              >
                <Send className={`h-5 w-5 ${isTyping ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">{isTyping ? "Diagnosing..." : "Ask"}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HealthChatbot;
