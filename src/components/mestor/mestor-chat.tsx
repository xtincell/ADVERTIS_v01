// =============================================================================
// COMP C.MESTOR — MESTOR AI Chat Interface
// =============================================================================
// Full-featured AI strategic advisor chat with thread management.
// Split-pane layout: thread list + active conversation.
// =============================================================================

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import {
  Bot,
  User,
  Plus,
  Send,
  MessageSquare,
  Trash2,
  Sparkles,
  Brain,
  Loader2,
  ChevronLeft,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `${diffMin}min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD}j`;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function MestorChat({ strategyId }: { strategyId?: string }) {
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [showMobileList, setShowMobileList] = useState(true);
  const [inputMessage, setInputMessage] = useState("");
  const [newThreadOpen, setNewThreadOpen] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [newThreadMessage, setNewThreadMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const utils = api.useUtils();

  // ── Queries ──
  const threadsQuery = api.mestor.listThreads.useQuery(
    strategyId ? { strategyId } : undefined,
  );

  const threadQuery = api.mestor.getThread.useQuery(
    { threadId: activeThreadId ?? "", limit: 100 },
    { enabled: !!activeThreadId },
  );

  // ── Mutations ──
  const createThread = api.mestor.createThread.useMutation({
    onSuccess: (thread) => {
      void utils.mestor.listThreads.invalidate();
      setActiveThreadId(thread.id);
      setNewThreadOpen(false);
      setNewThreadTitle("");
      setNewThreadMessage("");
      setShowMobileList(false);
    },
  });

  const sendMessage = api.mestor.sendMessage.useMutation({
    onSuccess: () => {
      void utils.mestor.getThread.invalidate({ threadId: activeThreadId ?? "" });
      void utils.mestor.listThreads.invalidate();
      setInputMessage("");
    },
  });

  const deleteThread = api.mestor.deleteThread.useMutation({
    onSuccess: () => {
      void utils.mestor.listThreads.invalidate();
      if (activeThreadId) setActiveThreadId(null);
      setShowMobileList(true);
    },
  });

  // ── Auto-scroll ──
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [threadQuery.data?.messages, scrollToBottom]);

  // ── Handlers ──
  const handleSend = () => {
    if (!inputMessage.trim() || !activeThreadId) return;
    sendMessage.mutate({ threadId: activeThreadId, content: inputMessage.trim() });
  };

  const handleCreateThread = () => {
    if (!newThreadMessage.trim()) return;
    createThread.mutate({
      strategyId: strategyId ?? undefined,
      title: newThreadTitle.trim() || undefined,
      initialMessage: newThreadMessage.trim(),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const threads = threadsQuery.data ?? [];
  const messages = threadQuery.data?.messages ?? [];

  return (
    <div className="flex h-[calc(100vh-120px)] overflow-hidden rounded-xl border bg-background">
      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* Thread list (sidebar) */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      <div
        className={cn(
          "w-full md:w-80 md:min-w-80 border-r flex flex-col bg-muted/30",
          !showMobileList && "hidden md:flex",
        )}
      >
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-violet-500" />
            <h2 className="font-semibold text-sm">MESTOR AI</h2>
          </div>
          <Dialog open={newThreadOpen} onOpenChange={setNewThreadOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="h-8 gap-1">
                <Plus className="h-3.5 w-3.5" />
                Nouveau
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nouvelle conversation</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 pt-2">
                <Input
                  placeholder="Titre (optionnel)"
                  value={newThreadTitle}
                  onChange={(e) => setNewThreadTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Posez votre question stratégique..."
                  value={newThreadMessage}
                  onChange={(e) => setNewThreadMessage(e.target.value)}
                  rows={4}
                />
                <Button
                  onClick={handleCreateThread}
                  disabled={!newThreadMessage.trim() || createThread.isPending}
                  className="w-full gap-2"
                >
                  {createThread.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  Démarrer
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Thread list */}
        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-0.5 p-2">
            {threads.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground text-sm">
                <MessageSquare className="h-8 w-8 opacity-40" />
                <p>Aucune conversation</p>
                <p className="text-xs text-center px-4">
                  Démarrez une nouvelle conversation pour obtenir des conseils stratégiques.
                </p>
              </div>
            )}
            {threads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => {
                  setActiveThreadId(thread.id);
                  setShowMobileList(false);
                }}
                className={cn(
                  "flex flex-col gap-1 px-3 py-2.5 rounded-lg text-left transition-colors w-full",
                  activeThreadId === thread.id
                    ? "bg-violet-500/10 border border-violet-500/30"
                    : "hover:bg-muted/50",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium truncate flex-1">
                    {thread.title}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {thread.lastMessageAt ? formatTimeAgo(thread.lastMessageAt) : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {thread.messageCount} messages
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteThread.mutate({ threadId: thread.id });
                    }}
                    className="text-muted-foreground/50 hover:text-red-500 transition-colors p-0.5"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* Chat area */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      <div
        className={cn(
          "flex-1 flex flex-col",
          showMobileList && "hidden md:flex",
        )}
      >
        {!activeThreadId ? (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
            <div className="h-16 w-16 rounded-2xl bg-violet-500/10 flex items-center justify-center">
              <Brain className="h-8 w-8 text-violet-500" />
            </div>
            <h3 className="text-lg font-semibold">MESTOR — Conseiller stratégique IA</h3>
            <p className="text-muted-foreground text-sm max-w-md">
              Posez vos questions sur la cohérence de marque, les risques stratégiques,
              l&apos;optimisation budgétaire, ou tout autre sujet lié à votre stratégie ADVERTIS.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 max-w-lg w-full">
              {[
                "Analyse de mon score de cohérence",
                "Évaluation des risques",
                "Recommandation budget & ROI",
                "Optimisation AARRR",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setNewThreadMessage(suggestion);
                    setNewThreadOpen(true);
                  }}
                  className="text-xs text-left px-3 py-2 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Mobile back button */}
            <div className="md:hidden border-b px-3 py-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMobileList(true)}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Conversations
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="max-w-3xl mx-auto space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex gap-3",
                      msg.role === "user" ? "justify-end" : "justify-start",
                    )}
                  >
                    {msg.role !== "user" && (
                      <div className="h-8 w-8 rounded-full bg-violet-500/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Bot className="h-4 w-4 text-violet-500" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[80%] rounded-xl px-4 py-3 text-sm",
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/60 border",
                      )}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                      <div
                        className={cn(
                          "text-[10px] mt-1.5",
                          msg.role === "user"
                            ? "text-primary-foreground/60"
                            : "text-muted-foreground",
                        )}
                      >
                        {formatTimeAgo(msg.createdAt)}
                      </div>
                    </div>
                    {msg.role === "user" && (
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input area */}
            <div className="border-t p-4">
              <div className="max-w-3xl mx-auto flex gap-2">
                <Textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Posez votre question stratégique..."
                  className="min-h-[44px] max-h-32 resize-none"
                  rows={1}
                />
                <Button
                  onClick={handleSend}
                  disabled={!inputMessage.trim() || sendMessage.isPending}
                  size="icon"
                  className="shrink-0 h-11 w-11"
                >
                  {sendMessage.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
