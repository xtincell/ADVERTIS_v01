"use client";

import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Plus,
  Loader2,
  ShieldCheck,
  Calendar,
  Send,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import {
  CAMPAIGN_APPROVAL_TYPES,
  CAMPAIGN_APPROVAL_TYPE_LABELS,
  CAMPAIGN_APPROVAL_STATUSES,
  type CampaignApprovalType,
  type CampaignApprovalStatus,
} from "~/lib/constants";

interface ApprovalWorkflowProps {
  campaignId: string;
}

const STATUS_CONFIG: Record<
  CampaignApprovalStatus,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  PENDING: { label: "En attente", icon: Clock, color: "text-amber-600 bg-amber-50 border-amber-200" },
  APPROVED: { label: "Approuve", icon: CheckCircle2, color: "text-green-600 bg-green-50 border-green-200" },
  REJECTED: { label: "Rejete", icon: XCircle, color: "text-red-600 bg-red-50 border-red-200" },
  REVISION_REQUESTED: { label: "Revision demandee", icon: RotateCcw, color: "text-purple-600 bg-purple-50 border-purple-200" },
};

export function ApprovalWorkflow({ campaignId }: ApprovalWorkflowProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Form state
  const [formType, setFormType] = useState<string>("");
  const [formTitle, setFormTitle] = useState("");
  const [formDeadline, setFormDeadline] = useState("");

  const utils = api.useUtils();

  const { data: approvals, isLoading } =
    api.campaign.approvals.getByCampaign.useQuery({ campaignId });

  const resolveMutation = api.campaign.approvals.resolve.useMutation({
    onSuccess: () => {
      toast.success("Approbation mise a jour");
      void utils.campaign.approvals.getByCampaign.invalidate({ campaignId });
    },
    onError: (err) => {
      toast.error(err.message || "Erreur lors de la mise a jour");
    },
  });

  const createMutation = api.campaign.approvals.create.useMutation({
    onSuccess: () => {
      toast.success("Demande d'approbation creee");
      void utils.campaign.approvals.getByCampaign.invalidate({ campaignId });
      setShowCreate(false);
      setFormType("");
      setFormTitle("");
      setFormDeadline("");
    },
    onError: (err) => {
      toast.error(err.message || "Erreur lors de la creation");
    },
  });

  const handleApprove = (approvalId: string) => {
    resolveMutation.mutate({
      id: approvalId,
      status: "APPROVED",
    });
  };

  const handleReject = (approvalId: string) => {
    if (!rejectionReason.trim()) {
      toast.error("Veuillez indiquer un motif de rejet");
      return;
    }
    resolveMutation.mutate({
      id: approvalId,
      status: "REJECTED",
      rejectionReason: rejectionReason.trim(),
    });
    setRejectingId(null);
    setRejectionReason("");
  };

  const handleCreate = () => {
    if (!formType || !formTitle.trim()) {
      toast.error("Veuillez remplir le type et le titre");
      return;
    }
    createMutation.mutate({
      campaignId,
      approvalType: formType as CampaignApprovalType,
      title: formTitle.trim(),
      deadline: formDeadline ? new Date(formDeadline) : undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-medium">
          <ShieldCheck className="h-4 w-4 text-indigo-500" />
          Cycle d&apos;approbation
        </h3>
        <Button size="sm" variant="outline" onClick={() => setShowCreate(!showCreate)}>
          <Plus className="mr-1 h-3.5 w-3.5" />
          Nouvelle approbation
        </Button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <Card>
          <CardContent className="space-y-4 pt-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Type</Label>
                <Select value={formType} onValueChange={setFormType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    {CAMPAIGN_APPROVAL_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {CAMPAIGN_APPROVAL_TYPE_LABELS[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Titre</Label>
                <Input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ex: Validation KV v2"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Deadline</Label>
                <Input
                  type="date"
                  value={formDeadline}
                  onChange={(e) => setFormDeadline(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowCreate(false)}>
                Annuler
              </Button>
              <Button size="sm" onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />}
                <Send className="mr-1 h-3.5 w-3.5" />
                Creer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      {approvals && approvals.length > 0 ? (
        <div className="relative space-y-0">
          <div className="absolute left-4 top-0 h-full w-px bg-border" />
          {approvals.map((approval: Approval) => {
            const config = STATUS_CONFIG[approval.status as CampaignApprovalStatus] ?? STATUS_CONFIG.PENDING;
            const StatusIcon = config.icon;
            const isPending = approval.status === "PENDING";
            const isRejecting = rejectingId === approval.id;

            return (
              <div key={approval.id} className="relative pl-10 pb-6">
                {/* Timeline dot */}
                <div className="absolute left-2.5 top-1 flex h-3 w-3 items-center justify-center rounded-full border-2 border-background bg-border">
                  <div
                    className={`h-1.5 w-1.5 rounded-full ${
                      isPending ? "bg-amber-500" : approval.status === "APPROVED" ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                </div>

                <Card>
                  <CardContent className="py-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {CAMPAIGN_APPROVAL_TYPE_LABELS[approval.approvalType as CampaignApprovalType] ?? approval.approvalType}
                          </Badge>
                          <span className="font-medium text-sm">{approval.title}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <StatusIcon className="h-3 w-3" />
                            {config.label}
                          </span>
                          {approval.round > 1 && (
                            <span>Round {approval.round}</span>
                          )}
                          {approval.deadline && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(approval.deadline).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          )}
                        </div>
                      </div>

                      <Badge variant="outline" className={`text-xs ${config.color}`}>
                        {config.label}
                      </Badge>
                    </div>

                    {/* Pending actions */}
                    {isPending && !isRejecting && (
                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 hover:bg-green-50"
                          onClick={() => handleApprove(approval.id)}
                          disabled={resolveMutation.isPending}
                        >
                          <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                          Approuver
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => setRejectingId(approval.id)}
                        >
                          <XCircle className="mr-1 h-3.5 w-3.5" />
                          Rejeter
                        </Button>
                      </div>
                    )}

                    {/* Rejection reason textarea */}
                    {isRejecting && (
                      <div className="mt-3 space-y-2">
                        <Textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Motif du rejet..."
                          className="text-sm"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(approval.id)}
                            disabled={resolveMutation.isPending}
                          >
                            {resolveMutation.isPending && <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />}
                            Confirmer le rejet
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setRejectingId(null);
                              setRejectionReason("");
                            }}
                          >
                            Annuler
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-sm text-muted-foreground">
              Aucune approbation en cours.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── Types ──

interface Approval {
  id: string;
  approvalType: string;
  title: string;
  status: string;
  round: number;
  deadline?: string | Date | null;
}
