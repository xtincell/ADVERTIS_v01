// ==========================================================================
// C.MSG1 — Inbox / Messaging
// Internal messaging interface with conversation list + message thread.
// ==========================================================================

"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Plus,
  Send,
  ArrowLeft,
  Users,
  User,
  Clock,
  X,
  FileText,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ConversationData {
  id: string;
  title: string | null;
  type: string;
  participants: unknown;
  lastMessage: string | null;
  lastMessageAt: Date | null;
  lastMessageBy: string | null;
  strategyId: string | null;
  missionId: string | null;
  createdAt: Date;
}

interface MessageData {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  body: string;
  type: string;
  attachments: unknown;
  readBy: unknown;
  editedAt: Date | null;
  createdAt: Date;
}

// ---------------------------------------------------------------------------
// Inbox Component
// ---------------------------------------------------------------------------

export function Inbox() {
  const [selectedConvo, setSelectedConvo] = useState<string | null>(null);
  const [showNewConvo, setShowNewConvo] = useState(false);

  const { data: conversations, isLoading } = api.messaging.listConversations.useQuery();
  const utils = api.useUtils();

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-float text-muted-foreground">
          Chargement de la messagerie...
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-140px)] rounded-xl border overflow-hidden bg-card">
      {/* Conversation List */}
      <div
        className={`w-full md:w-[320px] border-r flex flex-col ${
          selectedConvo ? "hidden md:flex" : "flex"
        }`}
      >
        {/* List Header */}
        <div className="flex items-center justify-between p-3 border-b bg-muted/20">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">Messagerie</span>
            <Badge variant="secondary" className="text-[10px]">
              {conversations?.length ?? 0}
            </Badge>
          </div>
          <Button size="sm" variant="ghost" onClick={() => setShowNewConvo(true)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {(conversations ?? []).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
              <MessageSquare className="h-8 w-8 mb-2 opacity-20" />
              <p className="text-sm">Aucune conversation</p>
              <p className="text-xs mt-1">Démarrez une nouvelle conversation</p>
            </div>
          ) : (
            (conversations ?? []).map((convo) => (
              <ConversationItem
                key={convo.id}
                conversation={convo as ConversationData}
                isActive={selectedConvo === convo.id}
                onClick={() => setSelectedConvo(convo.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Message Thread */}
      <div
        className={`flex-1 flex flex-col ${
          !selectedConvo ? "hidden md:flex" : "flex"
        }`}
      >
        {selectedConvo ? (
          <MessageThread
            conversationId={selectedConvo}
            onBack={() => setSelectedConvo(null)}
            onMessageSent={() => void utils.messaging.listConversations.invalidate()}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">Sélectionnez une conversation</p>
            </div>
          </div>
        )}
      </div>

      {/* New Conversation Dialog */}
      {showNewConvo && (
        <NewConversationDialog
          onClose={() => setShowNewConvo(false)}
          onCreated={(convoId) => {
            setShowNewConvo(false);
            setSelectedConvo(convoId);
            void utils.messaging.listConversations.invalidate();
          }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Conversation List Item
// ---------------------------------------------------------------------------

function ConversationItem({
  conversation,
  isActive,
  onClick,
}: {
  conversation: ConversationData;
  isActive: boolean;
  onClick: () => void;
}) {
  const participants = Array.isArray(conversation.participants)
    ? conversation.participants.filter((v): v is string => typeof v === "string")
    : [];
  const isGroup = conversation.type === "GROUP" || participants.length > 2;

  const timeAgo = conversation.lastMessageAt
    ? formatTimeAgo(new Date(conversation.lastMessageAt))
    : "";

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-3 border-b transition-colors ${
        isActive
          ? "bg-primary/5 border-l-2 border-l-primary"
          : "hover:bg-muted/30 border-l-2 border-l-transparent"
      }`}
    >
      <div className="flex items-start gap-2.5">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
          {isGroup ? (
            <Users className="h-3.5 w-3.5 text-primary" />
          ) : (
            <User className="h-3.5 w-3.5 text-primary" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium truncate">
              {conversation.title ?? `Conversation ${conversation.type.toLowerCase()}`}
            </span>
            <span className="text-[10px] text-muted-foreground shrink-0">{timeAgo}</span>
          </div>
          {conversation.lastMessage && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {conversation.lastMessage}
            </p>
          )}
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[9px] text-muted-foreground/60">
              {participants.length} participant{participants.length > 1 ? "s" : ""}
            </span>
            {conversation.strategyId && (
              <Badge variant="outline" className="text-[8px] px-1 py-0">
                Stratégie
              </Badge>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Message Thread
// ---------------------------------------------------------------------------

function MessageThread({
  conversationId,
  onBack,
  onMessageSent,
}: {
  conversationId: string;
  onBack: () => void;
  onMessageSent: () => void;
}) {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = api.messaging.getConversation.useQuery({
    id: conversationId,
    limit: 50,
  });

  const sendMutation = api.messaging.sendMessage.useMutation();
  const utils = api.useUtils();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    try {
      await sendMutation.mutateAsync({
        conversationId,
        body: newMessage.trim(),
      });
      setNewMessage("");
      void utils.messaging.getConversation.invalidate({ id: conversationId });
      onMessageSent();
    } catch {
      toast.error("Erreur d'envoi");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-float text-muted-foreground text-sm">
          Chargement...
        </div>
      </div>
    );
  }

  const convo = data?.conversation;
  const messages = data?.messages ?? [];

  return (
    <>
      {/* Thread Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/10">
        <button onClick={onBack} className="md:hidden p-1 -ml-1">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
          <MessageSquare className="h-3.5 w-3.5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">
            {convo?.title ?? "Conversation"}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {(Array.isArray(convo?.participants) ? convo.participants : []).length} participants
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg as MessageData} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-3">
        <div className="flex gap-2">
          <textarea
            placeholder="Écrire un message..."
            className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm resize-none min-h-[40px] max-h-[120px]"
            rows={1}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button
            size="sm"
            className="self-end"
            disabled={!newMessage.trim() || sendMutation.isPending}
            onClick={() => void handleSend()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Message Bubble
// ---------------------------------------------------------------------------

function MessageBubble({ message }: { message: MessageData }) {
  const isSystem = message.type === "SYSTEM";

  if (isSystem) {
    return (
      <div className="text-center">
        <span className="text-[10px] text-muted-foreground bg-muted/30 px-3 py-1 rounded-full">
          {message.body}
        </span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-2"
    >
      <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-1">
        <span className="text-[9px] font-bold text-muted-foreground">
          {message.senderName.slice(0, 2).toUpperCase()}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold">{message.senderName}</span>
          <span className="text-[10px] text-muted-foreground">
            {formatTime(new Date(message.createdAt))}
          </span>
        </div>
        <p className="text-sm text-foreground/90 mt-0.5 whitespace-pre-wrap break-words">
          {message.body}
        </p>
        {(() => {
          const atts = message.attachments as { name: string; url: string }[] | null;
          if (!atts || !Array.isArray(atts) || atts.length === 0) return null;
          return (
            <div className="flex gap-1.5 mt-1.5 flex-wrap">
              {atts.map((att, i) => (
                <span key={i} className="inline-flex items-center gap-1 text-[10px] text-primary bg-primary/5 px-2 py-0.5 rounded">
                  <FileText className="h-2.5 w-2.5" />
                  {att.name}
                </span>
              ))}
            </div>
          );
        })()}
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// New Conversation Dialog
// ---------------------------------------------------------------------------

function NewConversationDialog({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (convoId: string) => void;
}) {
  const createMutation = api.messaging.createConversation.useMutation();

  const [form, setForm] = useState({
    title: "",
    participantId: "",
    message: "",
    type: "DIRECT" as "DIRECT" | "GROUP",
  });

  const handleSubmit = async () => {
    if (!form.participantId.trim() || !form.message.trim()) return;
    try {
      const result = await createMutation.mutateAsync({
        title: form.title || undefined,
        type: form.type,
        participantIds: [form.participantId.trim()],
        initialMessage: form.message.trim(),
      });
      toast.success("Conversation démarrée !");
      onCreated(result.conversation.id);
    } catch {
      toast.error("Erreur lors de la création");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-xl border shadow-lg p-6 w-full max-w-md mx-4"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Nouvelle conversation</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          <input
            placeholder="Titre (optionnel)"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <input
            placeholder="ID du destinataire *"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            value={form.participantId}
            onChange={(e) => setForm({ ...form, participantId: e.target.value })}
          />
          <textarea
            placeholder="Premier message *"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm h-24 resize-none"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={onClose}>
            Annuler
          </Button>
          <Button
            size="sm"
            onClick={() => void handleSubmit()}
            disabled={!form.participantId.trim() || !form.message.trim() || createMutation.isPending}
          >
            {createMutation.isPending ? "Envoi..." : "Démarrer"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}j`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}
