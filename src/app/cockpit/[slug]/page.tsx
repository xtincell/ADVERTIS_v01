"use client";

import { useState, use } from "react";
import { Lock, Loader2, AlertCircle, Eye } from "lucide-react";

import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  CockpitContent,
  type CockpitData,
} from "~/components/cockpit/cockpit-content";

export default function PublicCockpitPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = use(props.params);
  const slug = params.slug;

  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only query when authenticated (password submitted)
  const {
    data: cockpitData,
    isLoading,
    isError,
    error: queryError,
  } = api.cockpit.getPublicCockpit.useQuery(
    { slug, password },
    {
      enabled: isAuthenticated && password.length > 0,
      retry: false,
    },
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length === 0) return;
    setError(null);
    setIsAuthenticated(true);
  };

  // Handle auth errors
  if (isError && queryError) {
    const errorMessage =
      queryError.message === "Mot de passe incorrect"
        ? "Mot de passe incorrect. Veuillez réessayer."
        : queryError.message === "Cockpit non trouvé ou désactivé"
          ? "Ce cockpit n'est pas disponible."
          : "Une erreur est survenue.";

    // Reset to show password form again
    if (isAuthenticated && !cockpitData) {
      return (
        <PasswordGate
          password={password}
          error={errorMessage}
          onPasswordChange={setPassword}
          onSubmit={() => {
            setIsAuthenticated(false);
            setPassword("");
            setError(null);
          }}
          isLoading={false}
        />
      );
    }
  }

  // Password gate
  if (!isAuthenticated || (!cockpitData && !isLoading)) {
    return (
      <PasswordGate
        password={password}
        error={error}
        onPasswordChange={(p) => {
          setPassword(p);
          setError(null);
        }}
        onSubmit={handleSubmit}
        isLoading={false}
      />
    );
  }

  // Loading
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
        <p className="mt-4 text-sm text-muted-foreground">
          Chargement du cockpit...
        </p>
      </div>
    );
  }

  // Show cockpit
  if (!cockpitData) return null;

  const data: CockpitData = {
    brandName: cockpitData.brandName,
    name: cockpitData.name,
    sector: cockpitData.sector,
    description: cockpitData.description,
    phase: cockpitData.phase,
    coherenceScore: cockpitData.coherenceScore,
    pillars: cockpitData.pillars.map((p) => ({
      type: p.type,
      title: p.title,
      status: p.status,
      summary: p.summary,
      content: p.content,
    })),
    documents: cockpitData.documents.map((d) => ({
      id: d.id,
      type: d.type,
      title: d.title,
      status: d.status,
      pageCount: d.pageCount,
    })),
  };

  return <CockpitContent data={data} isPublic />;
}

// ---------------------------------------------------------------------------
// Password Gate component
// ---------------------------------------------------------------------------

function PasswordGate({
  password,
  error,
  onPasswordChange,
  onSubmit,
  isLoading,
}: {
  password: string;
  error: string | null;
  onPasswordChange: (p: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-terracotta/10">
            <Lock className="h-6 w-6 text-terracotta" />
          </div>
          <CardTitle>Cockpit Stratégique</CardTitle>
          <CardDescription>
            Ce cockpit est protégé par un mot de passe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <input
                type="password"
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                placeholder="Mot de passe"
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30"
                autoFocus
              />
              {error && (
                <div className="flex items-center gap-2 text-sm text-red-500">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
            </div>
            <Button
              type="submit"
              className="w-full bg-terracotta hover:bg-terracotta/90"
              disabled={password.length === 0 || isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Eye className="mr-2 h-4 w-4" />
              )}
              Accéder au cockpit
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Propulsé par{" "}
            <span className="font-semibold text-terracotta">ADVERTIS</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
