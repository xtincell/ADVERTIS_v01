// ==========================================================================
// C.OS10 — Ambassador Board
// Displays brand ambassadors with tier cards, stats, and management.
// Used in Brand OS portal (/os/apostres).
// ==========================================================================

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown,
  Plus,
  Users,
  TrendingUp,
  Award,
  Megaphone,
  Star,
  X,
  Globe,
  Mail,
  Phone,
  Instagram,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { useBrandId } from "~/components/brand-os/brand-selector";
import {
  AMBASSADOR_TIERS,
  AMBASSADOR_TIER_LABELS,
  AMBASSADOR_TIER_COLORS,
  AMBASSADOR_STATUS_LABELS,
  type AmbassadorTier,
} from "~/lib/constants";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";

// ---------------------------------------------------------------------------
// Ambassador Board
// ---------------------------------------------------------------------------

export function AmbassadorBoard() {
  const brandId = useBrandId();
  const [showCreate, setShowCreate] = useState(false);
  const [filterTier, setFilterTier] = useState<string | undefined>();

  const { data: ambassadors, isLoading } = api.ambassador.list.useQuery(
    { strategyId: brandId!, tier: filterTier },
    { enabled: !!brandId },
  );

  const { data: stats } = api.ambassador.getStats.useQuery(
    { strategyId: brandId! },
    { enabled: !!brandId },
  );

  const utils = api.useUtils();

  if (!brandId) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-sm text-muted-foreground">Sélectionnez une marque</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-float text-muted-foreground">
          Chargement des apôtres...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-bold">Programme Apôtres</h2>
          <Badge variant="secondary">{stats?.total ?? 0} ambassadeurs</Badge>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="mr-1 h-4 w-4" />
          Nouvel ambassadeur
        </Button>
      </div>

      {/* Stats Row */}
      {stats && stats.total > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            icon={<Users className="h-4 w-4" />}
            label="Actifs"
            value={stats.active}
            color="text-emerald-600"
          />
          <StatCard
            icon={<Megaphone className="h-4 w-4" />}
            label="Referrals"
            value={stats.totalReferrals}
            color="text-blue-600"
          />
          <StatCard
            icon={<TrendingUp className="h-4 w-4" />}
            label="CA généré"
            value={formatAmount(stats.totalRevenue)}
            color="text-amber-600"
          />
          <StatCard
            icon={<Star className="h-4 w-4" />}
            label="Engagement moyen"
            value={`${stats.avgEngagement}%`}
            color="text-violet-600"
          />
        </div>
      )}

      {/* Tier Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterTier(undefined)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            !filterTier
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Tous
        </button>
        {AMBASSADOR_TIERS.map((tier) => (
          <button
            key={tier}
            onClick={() => setFilterTier(filterTier === tier ? undefined : tier)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
              filterTier === tier
                ? AMBASSADOR_TIER_COLORS[tier]
                : "bg-muted text-muted-foreground hover:bg-muted/80 border-transparent"
            }`}
          >
            {AMBASSADOR_TIER_LABELS[tier]}
            {stats?.perTier[tier] ? ` (${stats.perTier[tier]})` : ""}
          </button>
        ))}
      </div>

      {/* Ambassador Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <AnimatePresence>
          {(ambassadors ?? []).map((amb) => (
            <AmbassadorCard key={amb.id} ambassador={amb} />
          ))}
        </AnimatePresence>
      </div>

      {(ambassadors ?? []).length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Crown className="h-10 w-10 mb-3 opacity-20" />
          <p className="text-sm">Aucun ambassadeur trouvé</p>
          <p className="text-xs mt-1">Créez votre premier ambassadeur pour démarrer le programme</p>
        </div>
      )}

      {/* Create Dialog */}
      {showCreate && (
        <CreateAmbassadorDialog
          strategyId={brandId}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            void utils.ambassador.list.invalidate();
            void utils.ambassador.getStats.invalidate();
          }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Ambassador Card
// ---------------------------------------------------------------------------

function AmbassadorCard({ ambassador }: { ambassador: {
  id: string;
  displayName: string;
  email: string | null;
  phone: string | null;
  market: string | null;
  tier: string;
  status: string;
  referralCount: number;
  contentCount: number;
  eventCount: number;
  revenueGenerated: number;
  engagementScore: number;
  pointsBalance: number;
  totalPointsEarned: number;
  audienceSize: number;
  handles: unknown;
  lastActiveAt: Date;
} }) {
  const tierColor = AMBASSADOR_TIER_COLORS[ambassador.tier as AmbassadorTier] ?? "bg-muted";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Header: Name + Tier */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-amber-500/15 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-amber-600">
              {ambassador.displayName.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">{ambassador.displayName}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Badge variant="outline" className={`text-[10px] ${tierColor}`}>
                {AMBASSADOR_TIER_LABELS[ambassador.tier as AmbassadorTier] ?? ambassador.tier}
              </Badge>
              <span className="text-[10px] text-muted-foreground">
                {AMBASSADOR_STATUS_LABELS[ambassador.status as keyof typeof AMBASSADOR_STATUS_LABELS] ?? ambassador.status}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-primary">{Math.round(ambassador.engagementScore)}</span>
          <p className="text-[10px] text-muted-foreground">score</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <MiniStat label="Referrals" value={ambassador.referralCount} />
        <MiniStat label="Contenus" value={ambassador.contentCount} />
        <MiniStat label="Events" value={ambassador.eventCount} />
      </div>

      {/* Points + Revenue */}
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1">
          <Award className="h-3 w-3 text-amber-500" />
          <span className="font-semibold">{ambassador.pointsBalance} pts</span>
        </span>
        {ambassador.revenueGenerated > 0 && (
          <span className="text-emerald-600 font-semibold">
            {formatAmount(ambassador.revenueGenerated)} XOF
          </span>
        )}
      </div>

      {/* Contact info */}
      <div className="flex items-center gap-2 mt-2 flex-wrap">
        {ambassador.email && (
          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
            <Mail className="h-2.5 w-2.5" />
            {ambassador.email}
          </span>
        )}
        {ambassador.market && (
          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
            <Globe className="h-2.5 w-2.5" />
            {ambassador.market}
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Helper sub-components
// ---------------------------------------------------------------------------

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="rounded-lg border bg-card/50 p-3 flex items-center gap-3">
      <div className={`${color} opacity-70`}>{icon}</div>
      <div>
        <p className={`text-lg font-bold ${color}`}>{value}</p>
        <p className="text-[10px] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-muted/30 px-2 py-1.5 text-center">
      <p className="text-sm font-bold">{value}</p>
      <p className="text-[9px] text-muted-foreground">{label}</p>
    </div>
  );
}

function formatAmount(val: number): string {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${Math.round(val / 1_000)}K`;
  return new Intl.NumberFormat("fr-FR").format(val);
}

// ---------------------------------------------------------------------------
// Create Dialog
// ---------------------------------------------------------------------------

function CreateAmbassadorDialog({
  strategyId,
  onClose,
  onCreated,
}: {
  strategyId: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const createMutation = api.ambassador.create.useMutation();

  const [form, setForm] = useState({
    displayName: "",
    email: "",
    phone: "",
    market: "",
    city: "",
    audienceSize: 0,
    notes: "",
  });

  const handleSubmit = async () => {
    if (!form.displayName.trim()) return;
    try {
      await createMutation.mutateAsync({
        strategyId,
        displayName: form.displayName.trim(),
        email: form.email || undefined,
        phone: form.phone || undefined,
        market: form.market || undefined,
        city: form.city || undefined,
        audienceSize: form.audienceSize || undefined,
        notes: form.notes || undefined,
      });
      toast.success("Ambassadeur créé !");
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
        className="bg-card rounded-xl border shadow-lg p-6 w-full max-w-md mx-4"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Nouvel ambassadeur</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          <input
            placeholder="Nom complet *"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Email"
              type="email"
              className="rounded-md border bg-background px-3 py-2 text-sm"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              placeholder="Téléphone"
              className="rounded-md border bg-background px-3 py-2 text-sm"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select
              className="rounded-md border bg-background px-3 py-2 text-sm"
              value={form.market}
              onChange={(e) => setForm({ ...form, market: e.target.value })}
            >
              <option value="">Marché</option>
              <option value="CM">Cameroun</option>
              <option value="CI">Côte d&apos;Ivoire</option>
              <option value="SN">Sénégal</option>
              <option value="GH">Ghana</option>
              <option value="NG">Nigeria</option>
            </select>
            <input
              placeholder="Ville"
              className="rounded-md border bg-background px-3 py-2 text-sm"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
          </div>
          <input
            placeholder="Taille d'audience (followers total)"
            type="number"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            value={form.audienceSize || ""}
            onChange={(e) => setForm({ ...form, audienceSize: parseInt(e.target.value) || 0 })}
          />
          <textarea
            placeholder="Notes (optionnel)"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm h-20 resize-none"
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
            disabled={!form.displayName.trim() || createMutation.isPending}
          >
            {createMutation.isPending ? "Création..." : "Créer"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
