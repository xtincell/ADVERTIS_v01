// ==========================================================================
// C.OS — Add / Edit Social Channel Dialog
// Modal dialog for managing social channel connections in Brand OS.
// ==========================================================================

"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Loader2, Instagram, Facebook, Music2, Twitter, Youtube, Linkedin } from "lucide-react";
import { PLATFORM_CONFIG } from "~/lib/types/brand-os";
import type { SocialPlatform, ChannelCategory } from "~/lib/types/brand-os";

const PLATFORM_ICONS: Record<SocialPlatform, React.ComponentType<{ className?: string }>> = {
  INSTAGRAM: Instagram,
  FACEBOOK: Facebook,
  TIKTOK: Music2,
  TWITTER: Twitter,
  YOUTUBE: Youtube,
  LINKEDIN: Linkedin,
};

const CATEGORY_OPTIONS: { value: ChannelCategory; label: string }[] = [
  { value: "SOCIAL", label: "Social" },
  { value: "OWNED", label: "Owned" },
  { value: "EARNED", label: "Earned" },
  { value: "PAID", label: "Paid" },
];

interface AddChannelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    platform: string;
    accountName?: string;
    category?: string;
    followers?: number;
  }) => Promise<void>;
  editData?: {
    platform: string;
    accountName?: string | null;
    category?: string | null;
    followers?: number | null;
  } | null;
}

export function AddChannelDialog({
  open,
  onOpenChange,
  onSubmit,
  editData,
}: AddChannelDialogProps) {
  const isEdit = !!editData;

  const [platform, setPlatform] = useState<string>(editData?.platform ?? "INSTAGRAM");
  const [accountName, setAccountName] = useState(editData?.accountName ?? "");
  const [category, setCategory] = useState(editData?.category ?? "SOCIAL");
  const [followers, setFollowers] = useState(editData?.followers?.toString() ?? "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = useCallback(async () => {
    setSaving(true);
    try {
      await onSubmit({
        platform,
        accountName: accountName || undefined,
        category: category || undefined,
        followers: followers ? parseInt(followers, 10) : undefined,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }, [platform, accountName, category, followers, onSubmit, onOpenChange]);

  // Reset form when dialog opens
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open && !editData) {
        setPlatform("INSTAGRAM");
        setAccountName("");
        setCategory("SOCIAL");
        setFollowers("");
      }
      onOpenChange(open);
    },
    [editData, onOpenChange],
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Modifier le canal" : "Ajouter un canal social"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Mettez à jour les informations du canal."
              : "Connectez un nouveau canal à votre Brand OS."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Platform */}
          <div className="space-y-2">
            <Label>Plateforme</Label>
            <Select
              value={platform}
              onValueChange={setPlatform}
              disabled={isEdit}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(PLATFORM_CONFIG) as SocialPlatform[]).map((p) => {
                  const Icon = PLATFORM_ICONS[p];
                  return (
                    <SelectItem key={p} value={p}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {PLATFORM_CONFIG[p].label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Account Name */}
          <div className="space-y-2">
            <Label>Nom du compte / @handle</Label>
            <Input
              placeholder="@votre.marque"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Catégorie</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Followers */}
          <div className="space-y-2">
            <Label>Nombre d'abonnés (optionnel)</Label>
            <Input
              type="number"
              placeholder="47200"
              value={followers}
              onChange={(e) => setFollowers(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={saving || !platform}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Enregistrer" : "Ajouter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
