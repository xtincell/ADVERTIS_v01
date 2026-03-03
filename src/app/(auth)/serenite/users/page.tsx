// =============================================================================
// PAGE P.SERENITE.USERS — User Management
// =============================================================================
// Admin-only page to view and manage user accounts and their roles.
// =============================================================================

"use client";

import { useState } from "react";
import { Users, Search } from "lucide-react";
import { api } from "~/trpc/react";
import { PageHeader } from "~/components/ui/page-header";
import { Badge } from "~/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { USER_ROLES, USER_ROLE_LABELS, type UserRole } from "~/lib/constants";
import { cn } from "~/lib/utils";

/** Colors for role badges. */
const ROLE_BADGE_STYLES: Record<UserRole, string> = {
  ADMIN: "bg-indigo-500/15 text-indigo-500 border-indigo-500/30",
  OPERATOR: "bg-indigo-500/15 text-indigo-400 border-indigo-500/20",
  FREELANCE: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  CLIENT_RETAINER: "bg-rose-500/15 text-rose-500 border-rose-500/30",
  CLIENT_STATIC: "bg-rose-500/15 text-rose-400 border-rose-500/20",
};

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("ALL");

  const utils = api.useUtils();
  const { data: users, isLoading } = api.users.list.useQuery();

  const updateRole = api.users.updateRole.useMutation({
    onSuccess: () => {
      void utils.users.list.invalidate();
    },
  });

  const filteredUsers = (users ?? []).filter((u) => {
    const matchesSearch =
      !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.company?.toLowerCase().includes(search.toLowerCase());

    const matchesRole = filterRole === "ALL" || u.role === filterRole;

    return matchesSearch && matchesRole;
  });

  const handleRoleChange = (userId: string, newRole: string) => {
    updateRole.mutate({ userId, role: newRole as UserRole });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
      <PageHeader
        title="Gestion des utilisateurs"
        description="Gérer les comptes et les rôles des utilisateurs"
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-6 mb-4">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher par nom, email, entreprise…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-card pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrer par rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tous les rôles</SelectItem>
            {USER_ROLES.map((role) => (
              <SelectItem key={role} value={role}>
                {USER_ROLE_LABELS[role]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* User count */}
      <p className="text-xs text-muted-foreground mb-3">
        {filteredUsers.length} utilisateur{filteredUsers.length !== 1 ? "s" : ""}
        {filterRole !== "ALL" && ` — ${USER_ROLE_LABELS[filterRole as UserRole]}`}
      </p>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-lg bg-muted/50 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Users list */}
      {!isLoading && (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                  Utilisateur
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">
                  Entreprise
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                  Rôle
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">
                  Inscrit le
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                >
                  {/* Name + email */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                        {user.name?.[0]?.toUpperCase() ?? "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {user.name ?? "Sans nom"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Company */}
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-sm text-muted-foreground">
                      {user.company ?? "—"}
                    </span>
                  </td>

                  {/* Role selector */}
                  <td className="px-4 py-3">
                    <Select
                      value={user.role}
                      onValueChange={(v) => handleRoleChange(user.id, v)}
                    >
                      <SelectTrigger
                        className={cn(
                          "w-[160px] h-8 text-xs border",
                          ROLE_BADGE_STYLES[user.role as UserRole],
                        )}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {USER_ROLES.map((role) => (
                          <SelectItem key={role} value={role}>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[10px] px-1.5 py-0",
                                  ROLE_BADGE_STYLES[role],
                                )}
                              >
                                {USER_ROLE_LABELS[role]}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>

                  {/* Created at */}
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-xs text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-sm text-muted-foreground"
                  >
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Mutation feedback */}
      {updateRole.isPending && (
        <div className="fixed bottom-4 right-4 rounded-lg bg-card border border-border px-4 py-2 shadow-lg text-sm">
          Mise à jour du rôle…
        </div>
      )}
      {updateRole.isError && (
        <div className="fixed bottom-4 right-4 rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-2 shadow-lg text-sm text-destructive">
          {updateRole.error.message}
        </div>
      )}
    </div>
  );
}
