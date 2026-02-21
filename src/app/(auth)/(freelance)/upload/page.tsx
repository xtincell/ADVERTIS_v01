// ==========================================================================
// PAGE P.F3 — Freelance Upload
// Upload deliverables page with mission selector, file title, and upload area.
// ==========================================================================

"use client";

import { useState } from "react";
import {
  Upload,
  FileUp,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { api } from "~/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

export default function FreelanceUploadPage() {
  const {
    data: assignments,
    isLoading,
    error,
  } = api.mission.missions.getByFreelance.useQuery();

  const [selectedMissionId, setSelectedMissionId] = useState("");
  const [fileTitle, setFileTitle] = useState("");

  // Only show active assignments for upload
  const activeMissions =
    assignments?.filter(
      (a) =>
        a.status !== "REVIEWED" && a.mission.status !== "CLOSED",
    ) ?? [];

  // ---------------------------------------------------------------------------
  // Loading
  // ---------------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Error
  // ---------------------------------------------------------------------------
  if (error) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-2 text-center">
        <AlertCircle className="h-8 w-8 text-destructive/50" />
        <p className="text-sm text-muted-foreground">
          Erreur lors du chargement de vos missions.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Upload className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-semibold">Livrer un fichier</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Nouveau livrable
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mission Selector */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Mission</label>
            <select
              value={selectedMissionId}
              onChange={(e) => setSelectedMissionId(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="">Sélectionner une mission...</option>
              {activeMissions.map((a) => (
                <option key={a.mission.id} value={a.mission.id}>
                  {a.mission.title} — {a.mission.strategy.brandName}
                </option>
              ))}
            </select>
          </div>

          {/* File Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Titre du fichier
            </label>
            <Input
              value={fileTitle}
              onChange={(e) => setFileTitle(e.target.value)}
              placeholder="Ex: Maquette V2 - Header..."
            />
          </div>

          {/* Upload Area (UI skeleton) */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Fichier</label>
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/20 px-6 py-12 text-center transition-colors hover:border-muted-foreground/40">
              <FileUp className="mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">
                Glissez un fichier ici ou cliquez pour sélectionner
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                PDF, PNG, JPG, PSD, AI, ZIP — max 50 Mo
              </p>
            </div>
          </div>

          {/* Submit */}
          <Button
            className="w-full"
            disabled={!selectedMissionId || !fileTitle}
          >
            <Upload className="mr-2 h-4 w-4" />
            Envoyer le livrable
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
