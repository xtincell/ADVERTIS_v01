// ==========================================================================
// C.GL10 — Publication Calendar
// Editorial calendar for content publication management.
// Grid view by month with channel color-coding.
// ==========================================================================

"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  Plus,
  ChevronLeft,
  ChevronRight,
  FileText,
  X,
  Clock,
  Eye,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import {
  PUBLICATION_STATUS_LABELS,
  PUBLICATION_STATUS_COLORS,
  CONTENT_TYPE_LABELS,
  CONTENT_TYPES,
  PUB_CHANNELS,
  PUB_CHANNEL_LABELS,
  PUB_CHANNEL_COLORS,
  type PublicationStatus,
  type PubChannel,
} from "~/lib/constants";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PublicationData {
  id: string;
  title: string;
  body: string | null;
  contentType: string;
  channel: string;
  status: string;
  scheduledAt: Date | null;
  publishedAt: Date | null;
  reach: number | null;
  impressions: number | null;
  engagement: number | null;
  aarrStage: string | null;
  campaignTag: string | null;
  createdAt: Date;
}

interface PublicationCalendarProps {
  strategyId: string;
}

// ---------------------------------------------------------------------------
// Calendar Component
// ---------------------------------------------------------------------------

export function PublicationCalendar({ strategyId }: PublicationCalendarProps) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [showCreate, setShowCreate] = useState(false);
  const [selectedPub, setSelectedPub] = useState<string | null>(null);

  const { data: calendar, isLoading } = api.publication.getCalendar.useQuery(
    { strategyId, month, year },
    { enabled: !!strategyId },
  );

  const { data: stats } = api.publication.getStats.useQuery(
    { strategyId },
    { enabled: !!strategyId },
  );

  const utils = api.useUtils();

  // Build calendar grid
  const calendarGrid = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const startDow = firstDay.getDay() || 7; // Monday = 1
    const totalDays = lastDay.getDate();

    const cells: { date: number | null; key: string; pubs: PublicationData[] }[] = [];

    // Empty cells before first day
    for (let i = 1; i < startDow; i++) {
      cells.push({ date: null, key: `empty-${i}`, pubs: [] });
    }

    // Day cells
    for (let d = 1; d <= totalDays; d++) {
      const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const dayPubs = (calendar?.byDay[dateKey] ?? []) as PublicationData[];
      cells.push({ date: d, key: dateKey, pubs: dayPubs });
    }

    return cells;
  }, [year, month, calendar]);

  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
  ];

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(year - 1); }
    else setMonth(month - 1);
  };

  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(year + 1); }
    else setMonth(month + 1);
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-float text-muted-foreground">
          Chargement du calendrier...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-violet-500" />
          <h2 className="text-lg font-bold">Calendrier éditorial</h2>
          {stats && (
            <Badge variant="secondary">{stats.total} publications</Badge>
          )}
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="mr-1 h-4 w-4" />
          Nouvelle publication
        </Button>
      </div>

      {/* Stats Row */}
      {stats && stats.total > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-lg border bg-card/50 p-3">
            <p className="text-lg font-bold text-emerald-600">{stats.published}</p>
            <p className="text-[10px] text-muted-foreground">Publiés</p>
          </div>
          <div className="rounded-lg border bg-card/50 p-3">
            <p className="text-lg font-bold text-indigo-600">{stats.scheduled}</p>
            <p className="text-[10px] text-muted-foreground">Planifiés</p>
          </div>
          <div className="rounded-lg border bg-card/50 p-3">
            <p className="text-lg font-bold text-amber-600">{stats.inPipeline}</p>
            <p className="text-[10px] text-muted-foreground">En pipeline</p>
          </div>
          <div className="rounded-lg border bg-card/50 p-3">
            <p className="text-lg font-bold text-blue-600">
              {stats.totalReach >= 1000 ? `${(stats.totalReach / 1000).toFixed(1)}K` : stats.totalReach}
            </p>
            <p className="text-[10px] text-muted-foreground">Portée totale</p>
          </div>
        </div>
      )}

      {/* Month Navigation */}
      <div className="flex items-center justify-center gap-4">
        <button onClick={prevMonth} className="p-1.5 rounded-md hover:bg-muted">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold min-w-[140px] text-center">
          {monthNames[month - 1]} {year}
        </span>
        <button onClick={nextMonth} className="p-1.5 rounded-md hover:bg-muted">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="border rounded-xl overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 bg-muted/40">
          {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d) => (
            <div key={d} className="px-2 py-2 text-center text-[10px] font-semibold text-muted-foreground uppercase">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {calendarGrid.map((cell) => (
            <div
              key={cell.key}
              className={`min-h-[80px] border-t border-r last:border-r-0 p-1.5 ${
                cell.date === null ? "bg-muted/10" : "bg-card hover:bg-muted/20"
              } ${cell.date === now.getDate() && month === now.getMonth() + 1 && year === now.getFullYear() ? "ring-2 ring-primary/30 ring-inset" : ""}`}
            >
              {cell.date !== null && (
                <>
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {cell.date}
                  </span>
                  <div className="space-y-0.5 mt-0.5">
                    {cell.pubs.slice(0, 3).map((pub) => (
                      <button
                        key={pub.id}
                        onClick={() => setSelectedPub(pub.id)}
                        className="w-full text-left rounded px-1 py-0.5 text-[9px] font-medium truncate hover:opacity-80"
                        style={{
                          backgroundColor: `${PUB_CHANNEL_COLORS[pub.channel as PubChannel] ?? "#6366F1"}15`,
                          color: PUB_CHANNEL_COLORS[pub.channel as PubChannel] ?? "#6366F1",
                          borderLeft: `2px solid ${PUB_CHANNEL_COLORS[pub.channel as PubChannel] ?? "#6366F1"}`,
                        }}
                      >
                        {pub.title}
                      </button>
                    ))}
                    {cell.pubs.length > 3 && (
                      <span className="text-[8px] text-muted-foreground pl-1">
                        +{cell.pubs.length - 3}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Channel Legend */}
      <div className="flex gap-3 flex-wrap">
        {PUB_CHANNELS.map((ch) => (
          <span key={ch} className="flex items-center gap-1 text-[10px]">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: PUB_CHANNEL_COLORS[ch] }}
            />
            {PUB_CHANNEL_LABELS[ch]}
            {stats?.perChannel[ch] ? ` (${stats.perChannel[ch]})` : ""}
          </span>
        ))}
      </div>

      {/* Create Dialog */}
      {showCreate && (
        <CreatePublicationDialog
          strategyId={strategyId}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            void utils.publication.getCalendar.invalidate();
            void utils.publication.getStats.invalidate();
          }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Create Publication Dialog
// ---------------------------------------------------------------------------

function CreatePublicationDialog({
  strategyId,
  onClose,
  onCreated,
}: {
  strategyId: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const createMutation = api.publication.create.useMutation();

  const [form, setForm] = useState({
    title: "",
    body: "",
    contentType: "POST",
    channel: "INSTAGRAM",
    scheduledAt: "",
    aarrStage: "",
    campaignTag: "",
    notes: "",
  });

  const handleSubmit = async () => {
    if (!form.title.trim()) return;
    try {
      await createMutation.mutateAsync({
        strategyId,
        title: form.title.trim(),
        body: form.body || undefined,
        contentType: form.contentType,
        channel: form.channel,
        scheduledAt: form.scheduledAt ? new Date(form.scheduledAt) : undefined,
        aarrStage: form.aarrStage || undefined,
        campaignTag: form.campaignTag || undefined,
        notes: form.notes || undefined,
      });
      toast.success("Publication créée !");
      onCreated();
    } catch {
      toast.error("Erreur lors de la création");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-xl border shadow-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Nouvelle publication</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          <input
            placeholder="Titre de la publication *"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <textarea
            placeholder="Contenu / caption"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm h-24 resize-none"
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <select
              className="rounded-md border bg-background px-3 py-2 text-sm"
              value={form.channel}
              onChange={(e) => setForm({ ...form, channel: e.target.value })}
            >
              {PUB_CHANNELS.map((ch) => (
                <option key={ch} value={ch}>{PUB_CHANNEL_LABELS[ch]}</option>
              ))}
            </select>
            <select
              className="rounded-md border bg-background px-3 py-2 text-sm"
              value={form.contentType}
              onChange={(e) => setForm({ ...form, contentType: e.target.value })}
            >
              {CONTENT_TYPES.map((ct) => (
                <option key={ct} value={ct}>{CONTENT_TYPE_LABELS[ct]}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-muted-foreground mb-1 block">Date de publication</label>
              <input
                type="datetime-local"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={form.scheduledAt}
                onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground mb-1 block">Stade AARRR</label>
              <select
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={form.aarrStage}
                onChange={(e) => setForm({ ...form, aarrStage: e.target.value })}
              >
                <option value="">—</option>
                <option value="acquisition">Acquisition</option>
                <option value="activation">Activation</option>
                <option value="retention">Rétention</option>
                <option value="revenue">Revenue</option>
                <option value="referral">Referral</option>
              </select>
            </div>
          </div>

          <input
            placeholder="Tag campagne (optionnel)"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            value={form.campaignTag}
            onChange={(e) => setForm({ ...form, campaignTag: e.target.value })}
          />

          <textarea
            placeholder="Notes internes"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm h-16 resize-none"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={onClose}>
            Annuler
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!form.title.trim() || createMutation.isPending}
          >
            {createMutation.isPending ? "Création..." : "Créer"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
