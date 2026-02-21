// ==========================================================================
// PAGE P.F4 — Freelance Profile
// Simple profile/settings page for freelance users.
// ==========================================================================

"use client";

import { useSession } from "next-auth/react";
import {
  User,
  History,
  Settings,
  Loader2,
  Mail,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function FreelanceProfilePage() {
  const { data: session, status } = useSession();

  // ---------------------------------------------------------------------------
  // Loading
  // ---------------------------------------------------------------------------
  if (status === "loading") {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const user = session?.user;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <User className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-semibold">Mon Profil</h1>
      </div>

      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Mon profil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-4">
            {user?.image ? (
              <img
                src={user.image}
                alt={user.name ?? "Avatar"}
                className="h-14 w-14 rounded-full border"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full border bg-muted">
                <User className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            <div>
              <div className="font-semibold">{user?.name ?? "Freelance"}</div>
              {user?.email && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  {user.email}
                </div>
              )}
              <div className="mt-0.5 text-xs text-muted-foreground">
                Rôle : Freelance
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Historique */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="h-4 w-4 text-muted-foreground" />
            Historique
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Historique de vos missions et livrables — bientôt disponible.
          </p>
        </CardContent>
      </Card>

      {/* Paramètres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings className="h-4 w-4 text-muted-foreground" />
            Paramètres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Paramètres de notification et préférences — bientôt disponible.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
