// Widget Container — Generic wrapper for cockpit-derived widgets.
// Handles loading, error, empty, and ready states.

"use client";

import { Loader2, AlertTriangle, Layers } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

interface WidgetContainerProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  status: "pending" | "computing" | "ready" | "error";
  errorMessage?: string | null;
  children: React.ReactNode;
}

export function WidgetContainer({
  title,
  description,
  icon,
  status,
  errorMessage,
  children,
}: WidgetContainerProps) {
  return (
    <Card className="overflow-hidden border-t-3 border-t-terracotta/50">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-terracotta/10 text-terracotta">
            {icon}
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {status === "computing" && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        {status === "pending" && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-8 text-center">
            <Layers className="mb-2 h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              Widget pas encore calculé.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Cliquez sur &quot;Calculer&quot; pour générer les données.
            </p>
          </div>
        )}

        {status === "computing" && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-8 text-center">
            <Loader2 className="mb-2 h-8 w-8 animate-spin text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Calcul en cours...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-red-200 bg-red-50/50 py-8 text-center">
            <AlertTriangle className="mb-2 h-8 w-8 text-red-400" />
            <p className="text-sm font-medium text-red-700">
              Erreur lors du calcul
            </p>
            {errorMessage && (
              <p className="mt-1 text-xs text-red-600">{errorMessage}</p>
            )}
          </div>
        )}

        {status === "ready" && children}
      </CardContent>
    </Card>
  );
}
