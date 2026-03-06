"use client";

import { useState } from "react";
import {
  Loader2,
  Copy,
  FileText,
  Calendar,
  Megaphone,
  GitBranch,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import {
  CAMPAIGN_TYPE_LABELS,
} from "~/lib/constants";

interface CampaignTemplateSelectorProps {
  strategyId?: string;
  onTemplateUsed?: (campaignId: string) => void;
}

export function CampaignTemplateSelector({
  strategyId,
  onTemplateUsed,
}: CampaignTemplateSelectorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");

  const utils = api.useUtils();
  const { data: templates, isLoading } =
    api.campaign.templates.list.useQuery({
      strategyId,
    });

  const duplicateMut = api.campaign.templates.duplicate.useMutation({
    onSuccess: (data) => {
      toast.success("Campagne créée depuis le template");
      void utils.campaign.campaigns.getByStrategy.invalidate();
      void utils.campaign.campaigns.getKanban.invalidate();
      setSelectedId(null);
      setNewName("");
      onTemplateUsed?.(data.id);
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground">
        Templates de campagne ({templates?.length ?? 0})
      </h3>

      {templates && templates.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map(
            (tpl) => (
              <Card
                key={tpl.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedId === tpl.id
                    ? "ring-2 ring-primary"
                    : ""
                }`}
                onClick={() =>
                  setSelectedId(selectedId === tpl.id ? null : tpl.id)
                }
              >
                <CardContent className="space-y-2 p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">{tpl.name}</p>
                      <Badge variant="secondary" className="text-[10px]">
                        {CAMPAIGN_TYPE_LABELS[
                          tpl.campaignType as keyof typeof CAMPAIGN_TYPE_LABELS
                        ] ?? tpl.campaignType}
                      </Badge>
                    </div>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>

                  {tpl.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {tpl.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    {tpl.totalBudget != null && tpl.totalBudget > 0 && (
                      <span>
                        Budget: {tpl.totalBudget.toLocaleString("fr-FR")} XAF
                      </span>
                    )}
                    <span>
                      Créé le{" "}
                      {new Date(tpl.createdAt).toLocaleDateString("fr-FR")}
                    </span>
                  </div>

                  {Array.isArray(tpl.tags) && tpl.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {(tpl.tags as string[]).slice(0, 3).map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-[9px]"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ),
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
          Aucun template. Créez un template en dupliquant une campagne existante.
        </div>
      )}

      {/* Duplication form */}
      {selectedId && (
        <Card>
          <CardContent className="space-y-3 py-4">
            <div className="space-y-1">
              <Label>Nom de la nouvelle campagne *</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nom de la campagne à créer..."
                autoFocus
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedId(null);
                  setNewName("");
                }}
              >
                Annuler
              </Button>
              <Button
                size="sm"
                disabled={!newName.trim() || duplicateMut.isPending}
                onClick={() =>
                  duplicateMut.mutate({
                    campaignId: selectedId,
                    name: newName.trim(),
                    asTemplate: false,
                  })
                }
              >
                {duplicateMut.isPending ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : (
                  <Copy className="mr-1 h-3 w-3" />
                )}
                Créer depuis template
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={!newName.trim() || duplicateMut.isPending}
                onClick={() =>
                  duplicateMut.mutate({
                    campaignId: selectedId,
                    name: newName.trim(),
                    asTemplate: true,
                  })
                }
              >
                <GitBranch className="mr-1 h-3 w-3" />
                Dupliquer comme template
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
