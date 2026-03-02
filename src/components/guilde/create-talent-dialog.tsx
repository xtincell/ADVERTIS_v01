// =============================================================================
// COMP C.GUILDE — CreateTalentDialog
// =============================================================================
// Operator-initiated talent creation dialog.
// Creates a User (FREELANCE) + TalentProfile in one mutation.
// Shows generated password on success for the operator to share.
// =============================================================================

"use client";

import { useState } from "react";
import { UserPlus, Copy, Check, Loader2 } from "lucide-react";
import { api } from "~/trpc/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Badge } from "~/components/ui/badge";
import {
  TALENT_CATEGORIES,
  TALENT_CATEGORY_LABELS,
  TALENT_SPECIALIZATIONS,
  TALENT_SPECIALIZATION_LABELS,
  TALENT_AVAILABILITY,
  TALENT_AVAILABILITY_LABELS,
  type TalentCategory,
  type TalentAvailability,
  type TalentSpecialization,
} from "~/lib/constants";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CreateTalentDialog() {
  const [open, setOpen] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [headline, setHeadline] = useState("");
  const [category, setCategory] = useState<TalentCategory>("RESEAU");
  const [availability, setAvailability] = useState<TalentAvailability>("AVAILABLE");
  const [specializations, setSpecializations] = useState<TalentSpecialization[]>([]);

  // Success state
  const [result, setResult] = useState<{
    name: string;
    email: string;
    generatedPassword?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const utils = api.useUtils();

  const createTalent = api.guilde.createTalent.useMutation({
    onSuccess: (data) => {
      setResult({
        name: data.name ?? name,
        email: data.email,
        generatedPassword: data.generatedPassword ?? undefined,
      });
      void utils.guilde.directory.invalidate();
    },
  });

  const resetForm = () => {
    setName("");
    setEmail("");
    setDisplayName("");
    setHeadline("");
    setCategory("RESEAU");
    setAvailability("AVAILABLE");
    setSpecializations([]);
    setResult(null);
    setCopied(false);
    createTalent.reset();
  };

  const handleClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) resetForm();
  };

  const handleSubmit = () => {
    createTalent.mutate({
      name,
      email,
      displayName: displayName || undefined,
      headline: headline || undefined,
      category,
      availability,
      specializations: specializations.length > 0 ? specializations : undefined,
    });
  };

  const toggleSpecialization = (spec: TalentSpecialization) => {
    setSpecializations((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec],
    );
  };

  const handleCopyPassword = async () => {
    if (result?.generatedPassword) {
      try {
        await navigator.clipboard.writeText(result.generatedPassword);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Clipboard API denied — fallback with textarea
        try {
          const ta = document.createElement("textarea");
          ta.value = result.generatedPassword;
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.focus();
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          // Silent fail — user can still select and copy manually
        }
      }
    }
  };

  const isValid = name.trim().length >= 2 && email.includes("@");

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Nouveau talent
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer un talent</DialogTitle>
          <DialogDescription>
            Créez un compte freelance et un profil talent en une étape.
          </DialogDescription>
        </DialogHeader>

        {result ? (
          /* ─── Success state ─── */
          <div className="space-y-4 py-4">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-1">
                Talent créé avec succès
              </p>
              <p className="text-sm text-emerald-600/80 dark:text-emerald-400/70">
                {result.name} — {result.email}
              </p>
            </div>

            {result.generatedPassword && (
              <div className="rounded-xl border p-4 space-y-2">
                <Label className="text-sm font-medium">
                  Mot de passe généré
                </Label>
                <p className="text-xs text-muted-foreground">
                  Communiquez ce mot de passe au talent. Il ne sera plus affiché.
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded-lg bg-muted px-3 py-2 text-sm font-mono">
                    {result.generatedPassword}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    onClick={handleCopyPassword}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}

            <Button
              onClick={() => handleClose(false)}
              className="w-full"
            >
              Fermer
            </Button>
          </div>
        ) : (
          /* ─── Form state ─── */
          <div className="space-y-4 py-4">
            {/* Name (required) */}
            <div className="space-y-1.5">
              <Label>Nom complet *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jean Dupont"
              />
            </div>

            {/* Email (required) */}
            <div className="space-y-1.5">
              <Label>Email *</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jean@exemple.com"
              />
            </div>

            {/* Display Name (optional) */}
            <div className="space-y-1.5">
              <Label>Nom d&apos;affichage</Label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Jean D. (optionnel)"
              />
            </div>

            {/* Headline (optional) */}
            <div className="space-y-1.5">
              <Label>Titre / Headline</Label>
              <Input
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Directeur artistique freelance"
              />
            </div>

            {/* Category + Availability */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Catégorie</Label>
                <Select
                  value={category}
                  onValueChange={(v) => setCategory(v as TalentCategory)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TALENT_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {TALENT_CATEGORY_LABELS[c]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Disponibilité</Label>
                <Select
                  value={availability}
                  onValueChange={(v) => setAvailability(v as TalentAvailability)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TALENT_AVAILABILITY.map((a) => (
                      <SelectItem key={a} value={a}>
                        {TALENT_AVAILABILITY_LABELS[a]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Specializations (checkbox grid) */}
            <div className="space-y-1.5">
              <Label>Spécialisations</Label>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {TALENT_SPECIALIZATIONS.map((spec) => (
                  <Badge
                    key={spec}
                    variant={specializations.includes(spec) ? "default" : "outline"}
                    className="cursor-pointer transition-all text-xs select-none"
                    onClick={() => toggleSpecialization(spec)}
                  >
                    {TALENT_SPECIALIZATION_LABELS[spec]}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Error */}
            {createTalent.error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
                {createTalent.error.message}
              </div>
            )}

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={!isValid || createTalent.isPending}
              className="w-full"
            >
              {createTalent.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Création en cours...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Créer le talent
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Un mot de passe sera généré automatiquement.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
