// ==========================================================================
// PAGE P.8F — Admin Console
// Full admin panel: strategy management, user overview, quick links.
// ==========================================================================

"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Layers,
  Briefcase,
  ArrowRight,
  DollarSign,
  Settings,
  Search,
  Users,
} from "lucide-react";

import { api } from "~/trpc/react";
import { PageSpinner } from "~/components/ui/loading-skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { PageHeader } from "~/components/ui/page-header";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { DELIVERY_MODES, type DeliveryMode } from "~/lib/constants";
import { cn } from "~/lib/utils";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STRATEGY_STATUSES = ["draft", "generating", "complete", "archived"] as const;

const STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon",
  generating: "En cours",
  complete: "Terminée",
  archived: "Archivée",
};

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-slate-500/15 text-slate-400 border-slate-500/30",
  generating: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  complete: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  archived: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
};

const DELIVERY_LABELS: Record<string, string> = {
  ONE_SHOT: "One-Shot",
  PLACEMENT: "Placement",
  RETAINER: "Retainer",
};

const DELIVERY_STYLES: Record<string, string> = {
  ONE_SHOT: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  PLACEMENT: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  RETAINER: "bg-amber-500/15 text-amber-400 border-amber-500/30",
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function OperatorAdminPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <PageSpinner />;
  }

  if (
    !session ||
    (session.user.role !== "ADMIN" && session.user.role !== "OPERATOR")
  ) {
    redirect("/");
  }

  return <AdminDashboard />;
}

function AdminDashboard() {
  const { data: kanban } = api.mission.missions.getKanban.useQuery(
    undefined,
    { retry: false },
  );

  const missionCount = kanban
    ? Object.values(kanban).reduce(
        (acc, arr) => acc + (Array.isArray(arr) ? arr.length : 0),
        0,
      )
    : 0;

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 md:p-6 pb-24">
      <PageHeader
        title="Administration"
        description="Centre de contrôle de la plateforme ADVERTIS"
        backHref="/serenite"
        backLabel="Retour"
      />

      {/* Quick Links */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/serenite/users"
          className="flex items-center gap-3 rounded-xl border p-4 transition-colors hover:bg-muted/50 group"
        >
          <Users className="h-5 w-5 text-cyan-500" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Utilisateurs</p>
            <p className="text-xs text-muted-foreground">Comptes & rôles</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>

        <Link
          href="/impulsion"
          className="flex items-center gap-3 rounded-xl border p-4 transition-colors hover:bg-muted/50 group"
        >
          <Layers className="h-5 w-5 text-indigo-500" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Impulsion</p>
            <p className="text-xs text-muted-foreground">Fiches de marque</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>

        <Link
          href="/pilotis"
          className="flex items-center gap-3 rounded-xl border p-4 transition-colors hover:bg-muted/50 group"
        >
          <Briefcase className="h-5 w-5 text-teal-500" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Missions</p>
            <p className="text-xs text-muted-foreground">{missionCount} missions</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>

        <Link
          href="/serenite/settings"
          className="flex items-center gap-3 rounded-xl border p-4 transition-colors hover:bg-muted/50 group"
        >
          <Settings className="h-5 w-5 text-zinc-400" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Paramètres</p>
            <p className="text-xs text-muted-foreground">Configuration</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
      </div>

      {/* Strategy Management */}
      <StrategyManagement />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Strategy Management Section
// ---------------------------------------------------------------------------

function StrategyManagement() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterDelivery, setFilterDelivery] = useState<string>("ALL");

  const utils = api.useUtils();
  const { data: strategies, isLoading } = api.users.listStrategies.useQuery();
  const { data: users } = api.users.list.useQuery();

  const updateStrategy = api.users.updateStrategy.useMutation({
    onSuccess: () => {
      void utils.users.listStrategies.invalidate();
    },
  });

  const filtered = (strategies ?? []).filter((s) => {
    const matchesSearch =
      !search ||
      s.brandName.toLowerCase().includes(search.toLowerCase()) ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.user.email.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = filterStatus === "ALL" || s.status === filterStatus;
    const matchesDelivery =
      filterDelivery === "ALL" ||
      (filterDelivery === "NONE" ? !s.deliveryMode : s.deliveryMode === filterDelivery);

    return matchesSearch && matchesStatus && matchesDelivery;
  });

  const handleStatusChange = (strategyId: string, status: string) => {
    updateStrategy.mutate({
      strategyId,
      status: status as "draft" | "generating" | "complete" | "archived",
    });
  };

  const handleDeliveryChange = (strategyId: string, mode: string) => {
    updateStrategy.mutate({
      strategyId,
      deliveryMode: mode === "NONE" ? null : (mode as DeliveryMode),
    });
  };

  const handleOwnerChange = (strategyId: string, userId: string) => {
    updateStrategy.mutate({ strategyId, userId });
  };

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Gestion des stratégies</h2>
        <p className="text-sm text-muted-foreground">
          Modifier le statut, le mode de livraison et le propriétaire de chaque stratégie
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher par marque, nom, email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-card pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tous statuts</SelectItem>
            {STRATEGY_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterDelivery} onValueChange={setFilterDelivery}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tous modes</SelectItem>
            <SelectItem value="NONE">Non défini</SelectItem>
            {DELIVERY_MODES.map((m) => (
              <SelectItem key={m} value={m}>{DELIVERY_LABELS[m]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Count */}
      <p className="text-xs text-muted-foreground">
        {filtered.length} stratégie{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-muted/50 animate-pulse" />
          ))}
        </div>
      )}

      {/* Table */}
      {!isLoading && (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead>
                    Marque
                  </TableHead>
                  <TableHead className="px-4 py-3 hidden md:table-cell">
                    Propriétaire
                  </TableHead>
                  <TableHead>
                    Statut
                  </TableHead>
                  <TableHead>
                    Mode
                  </TableHead>
                  <TableHead className="px-4 py-3 hidden sm:table-cell">
                    Phase
                  </TableHead>
                  <TableHead className="px-4 py-3 hidden lg:table-cell">
                    Score
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((strategy) => (
                  <TableRow key={strategy.id}>
                    {/* Brand name + project name */}
                    <TableCell>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {strategy.brandName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {strategy.name}
                        </p>
                      </div>
                    </TableCell>

                    {/* Owner */}
                    <TableCell className="hidden md:table-cell">
                      {users && users.length > 0 ? (
                        <Select
                          value={strategy.userId}
                          onValueChange={(v) => handleOwnerChange(strategy.id, v)}
                        >
                          <SelectTrigger className="w-[180px] h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {users.map((u) => (
                              <SelectItem key={u.id} value={u.id}>
                                {u.name ?? u.email}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {strategy.user.name ?? strategy.user.email}
                        </span>
                      )}
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Select
                        value={strategy.status}
                        onValueChange={(v) => handleStatusChange(strategy.id, v)}
                      >
                        <SelectTrigger
                          className={cn(
                            "w-[130px] h-8 text-xs border",
                            STATUS_STYLES[strategy.status] ?? "",
                          )}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STRATEGY_STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              <Badge
                                variant="outline"
                                className={cn("text-[10px] px-1.5 py-0", STATUS_STYLES[s])}
                              >
                                {STATUS_LABELS[s]}
                              </Badge>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>

                    {/* Delivery mode */}
                    <TableCell>
                      <Select
                        value={strategy.deliveryMode ?? "NONE"}
                        onValueChange={(v) => handleDeliveryChange(strategy.id, v)}
                      >
                        <SelectTrigger
                          className={cn(
                            "w-[130px] h-8 text-xs border",
                            strategy.deliveryMode
                              ? DELIVERY_STYLES[strategy.deliveryMode] ?? ""
                              : "text-muted-foreground",
                          )}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NONE">
                            <span className="text-muted-foreground">Non défini</span>
                          </SelectItem>
                          {DELIVERY_MODES.map((m) => (
                            <SelectItem key={m} value={m}>
                              <Badge
                                variant="outline"
                                className={cn("text-[10px] px-1.5 py-0", DELIVERY_STYLES[m])}
                              >
                                {DELIVERY_LABELS[m]}
                              </Badge>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>

                    {/* Phase */}
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-xs text-muted-foreground capitalize">
                        {strategy.phase}
                      </span>
                    </TableCell>

                    {/* Coherence score */}
                    <TableCell className="hidden lg:table-cell">
                      <span className="text-xs font-medium">
                        {strategy.coherenceScore != null
                          ? `${strategy.coherenceScore}%`
                          : "—"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}

                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      <Layers className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      Aucune stratégie trouvée
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Mutation feedback */}
      {updateStrategy.isPending && (
        <div className="fixed bottom-4 right-4 rounded-lg bg-card border border-border px-4 py-2 shadow-lg text-sm z-50">
          Mise à jour…
        </div>
      )}
      {updateStrategy.isError && (
        <div className="fixed bottom-4 right-4 rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-2 shadow-lg text-sm text-destructive z-50">
          {updateStrategy.error.message}
        </div>
      )}
    </section>
  );
}
