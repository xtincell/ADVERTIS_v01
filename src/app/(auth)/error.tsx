"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "~/components/ui/button";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AuthError]", error);
  }, [error]);

  return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
      <AlertTriangle className="size-10 text-destructive" />
      <h2 className="text-lg font-semibold">Une erreur est survenue</h2>
      <p className="max-w-md text-center text-sm text-muted-foreground">
        {error.message || "Quelque chose s'est mal passé. Veuillez réessayer."}
      </p>
      <Button variant="outline" onClick={reset}>
        Réessayer
      </Button>
    </div>
  );
}
