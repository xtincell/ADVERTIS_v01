// ==========================================================================
// PAGE P.8F — Admin (Operator)
// Administration panel with stats and quick links.
// ==========================================================================

"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Layers,
  Briefcase,
  ArrowRight,
  DollarSign,
  Settings,
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
  const { data: strategies } = api.strategy.getAll.useQuery({});
  const { data: kanban } = api.mission.missions.getKanban.useQuery(
    undefined,
    { retry: false },
  );

  const strategyCount = strategies?.length ?? 0;
  const missionCount = kanban
    ? Object.values(kanban).reduce(
        (acc, arr) => acc + (Array.isArray(arr) ? arr.length : 0),
        0,
      )
    : 0;

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 md:p-6">
      <PageHeader
        title="Administration"
        description="Vue d'ensemble de la plateforme ADVERTIS"
        backHref="/serenite"
        backLabel="Retour au menu"
      />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Strat&eacute;gies</CardDescription>
            <CardTitle className="text-3xl">{strategyCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href="/impulsion"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Voir toutes <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Missions</CardDescription>
            <CardTitle className="text-3xl">{missionCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href="/pilotis"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Voir toutes <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tarification</CardDescription>
            <CardTitle className="text-3xl">
              <Layers className="h-7 w-7 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href="/pilotis/pricing"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Grilles tarifaires <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Acc&egrave;s rapide</CardTitle>
          <CardDescription>
            G&eacute;rer les diff&eacute;rentes parties de la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/impulsion"
              className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              <Layers className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Strat&eacute;gies</p>
                <p className="text-xs text-muted-foreground">
                  Fiches de marque
                </p>
              </div>
            </Link>

            <Link
              href="/pilotis"
              className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              <Briefcase className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Missions</p>
                <p className="text-xs text-muted-foreground">
                  Kanban &amp; suivi
                </p>
              </div>
            </Link>

            <Link
              href="/serenite/costs"
              className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              <DollarSign className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Co&ucirc;ts</p>
                <p className="text-xs text-muted-foreground">
                  Dashboard financier
                </p>
              </div>
            </Link>

            <Link
              href="/serenite/settings"
              className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              <Settings className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Param&egrave;tres</p>
                <p className="text-xs text-muted-foreground">
                  Configuration
                </p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
