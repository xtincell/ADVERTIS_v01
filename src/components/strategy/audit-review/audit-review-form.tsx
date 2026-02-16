"use client";

import { useState } from "react";
import { CheckCircle, Loader2, Shield, BarChart3 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { RiskAuditEditor } from "./risk-audit-editor";
import { TrackAuditEditor } from "./track-audit-editor";
import type {
  RiskAuditResult,
  TrackAuditResult,
} from "~/server/services/audit-generation";

interface AuditReviewFormProps {
  initialRiskData: RiskAuditResult;
  initialTrackData: TrackAuditResult;
  onValidate: (
    riskData: RiskAuditResult,
    trackData: TrackAuditResult,
  ) => Promise<void>;
  isValidating?: boolean;
}

export function AuditReviewForm({
  initialRiskData,
  initialTrackData,
  onValidate,
  isValidating = false,
}: AuditReviewFormProps) {
  const [editedR, setEditedR] = useState<RiskAuditResult>(initialRiskData);
  const [editedT, setEditedT] = useState<TrackAuditResult>(initialTrackData);
  const [activeTab, setActiveTab] = useState<string>("risk");

  const handleValidate = async () => {
    await onValidate(editedR, editedT);
  };

  return (
    <div className="space-y-4">
      {/* Header info */}
      <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4">
        <h3 className="text-sm font-semibold text-blue-800">
          Revue et correction de l&apos;audit
        </h3>
        <p className="mt-1 text-xs text-blue-600">
          Vérifiez et corrigez les résultats de l&apos;audit IA avant de
          générer les données stratégiques. Chaque champ est modifiable.
        </p>
      </div>

      {/* Tabs R / T */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="risk" className="gap-2">
            <Shield className="h-4 w-4" />
            Pilier R — Risk
            <Badge variant="secondary" className="ml-1 text-xs">
              {editedR.riskScore}/100
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="track" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Pilier T — Track
            <Badge variant="secondary" className="ml-1 text-xs">
              {editedT.brandMarketFitScore}/100
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="risk" className="mt-4">
          <RiskAuditEditor value={editedR} onChange={setEditedR} />
        </TabsContent>

        <TabsContent value="track" className="mt-4">
          <TrackAuditEditor value={editedT} onChange={setEditedT} />
        </TabsContent>
      </Tabs>

      {/* Validate button */}
      <div className="sticky bottom-0 z-10 flex justify-end border-t bg-background pt-4">
        <Button
          onClick={handleValidate}
          disabled={isValidating}
          size="lg"
          className="gap-2"
        >
          {isValidating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Validation en cours...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4" />
              Valider l&apos;audit et continuer
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
