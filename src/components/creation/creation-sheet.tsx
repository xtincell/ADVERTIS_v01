// =============================================================================
// COMPONENT C.CR1 — Creation Sheet
// =============================================================================
// Bottom sheet wizard for creating a new brand/strategy. 3 steps.
// Props: open, onOpenChange.
// Step 1: Name (brandName), Sector (select), Node Type (select).
// Step 2: Parent strategy selector (optional, from api.strategy.getAll).
// Step 3: Input method choice (Interview Express, Import fichier, Saisie libre).
// On confirm: calls api.strategy.create mutation, redirects to /brand/${newId}.
// =============================================================================

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Package,
  Megaphone,
  Users,
  MapPin,
  Calendar,
  Box,
  Layers,
  Map,
  BookOpen,
  Heart,
  Mic,
  Upload,
  PenLine,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "~/components/ui/sheet";
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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CreationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SECTOR_OPTIONS = [
  { value: "fmcg", label: "FMCG" },
  { value: "b2b-saas", label: "TECH" },
  { value: "health", label: "HEALTH" },
  { value: "public", label: "INSTITUTIONAL" },
  { value: "media", label: "MEDIA" },
  { value: "fashion", label: "LUXURY" },
  { value: "ngo", label: "NGO" },
  { value: "food-bev", label: "Food & Beverage" },
  { value: "beauty", label: "Beauty" },
  { value: "retail", label: "Retail" },
  { value: "telecom", label: "Telecom" },
  { value: "fintech", label: "Fintech" },
  { value: "e-commerce", label: "E-commerce" },
  { value: "education", label: "Education" },
  { value: "other", label: "Autre" },
] as const;

const NODE_TYPE_OPTIONS = [
  { value: "BRAND", label: "Marque", icon: Building2 },
  { value: "PRODUCT", label: "Produit", icon: Package },
  { value: "CAMPAIGN", label: "Campagne", icon: Megaphone },
  { value: "CHARACTER", label: "Personnage", icon: Users },
  { value: "ENVIRONMENT", label: "Environnement", icon: MapPin },
  { value: "EVENT", label: "Événement", icon: Calendar },
  { value: "SKU", label: "SKU", icon: Box },
  { value: "COLLECTION", label: "Collection", icon: Layers },
  { value: "ZONE", label: "Zone", icon: Map },
  { value: "EDITION", label: "Édition", icon: BookOpen },
  { value: "COMMUNITY", label: "Communauté", icon: Heart },
] as const;

const INPUT_METHODS = [
  {
    key: "interview",
    title: "Interview Express",
    description: "Répondez à quelques questions guidées par l'IA",
    icon: Mic,
  },
  {
    key: "import",
    title: "Import fichier",
    description: "Importez un document existant (PDF, DOCX, etc.)",
    icon: Upload,
  },
  {
    key: "freetext",
    title: "Saisie libre",
    description: "Remplissez les champs manuellement",
    icon: PenLine,
  },
] as const;

// ---------------------------------------------------------------------------
// Progress Dots
// ---------------------------------------------------------------------------

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={cn(
            "h-2 rounded-full transition-all duration-300",
            i === current
              ? "w-6 bg-terracotta"
              : i < current
                ? "w-2 bg-terracotta/40"
                : "w-2 bg-muted-foreground/20",
          )}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// CreationSheet — Main Component
// ---------------------------------------------------------------------------

export function CreationSheet({ open, onOpenChange }: CreationSheetProps) {
  const router = useRouter();

  // Step state
  const [step, setStep] = useState(0);

  // Form state
  const [brandName, setBrandName] = useState("");
  const [sector, setSector] = useState("");
  const [nodeType, setNodeType] = useState("BRAND");
  const [parentId, setParentId] = useState<string | null>(null);
  const [inputMethod, setInputMethod] = useState<string | null>(null);

  // tRPC — fetch strategies for parent selector
  const { data: strategies, isLoading: strategiesLoading } =
    api.strategy.getAll.useQuery(
      { treeView: true },
      { enabled: open && step === 1 },
    );

  // tRPC — create mutation
  const createMutation = api.strategy.create.useMutation({
    onSuccess: (data) => {
      toast.success("Marque créée");
      onOpenChange(false);
      resetForm();
      router.push(`/brand/${data.id}`);
    },
    onError: () => {
      toast.error("Erreur");
    },
  });

  // Helpers
  function resetForm() {
    setStep(0);
    setBrandName("");
    setSector("");
    setNodeType("BRAND");
    setParentId(null);
    setInputMethod(null);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) resetForm();
    onOpenChange(nextOpen);
  }

  function canAdvanceStep0() {
    return brandName.trim().length > 0 && sector.length > 0 && nodeType.length > 0;
  }

  function handleConfirm() {
    createMutation.mutate({
      name: brandName.trim(),
      brandName: brandName.trim(),
      sector,
      nodeType,
    });
  }

  // ---------------------------------------------------------------------------
  // Step content renderers
  // ---------------------------------------------------------------------------

  function renderStep0() {
    return (
      <div className="space-y-5">
        {/* Brand name */}
        <div className="space-y-2">
          <Label htmlFor="brand-name">Nom de la marque</Label>
          <Input
            id="brand-name"
            placeholder="Ex: Nescafé, Orange, MTN..."
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            autoFocus
          />
        </div>

        {/* Sector */}
        <div className="space-y-2">
          <Label>Secteur</Label>
          <Select value={sector} onValueChange={setSector}>
            <SelectTrigger>
              <SelectValue placeholder="Choisir un secteur" />
            </SelectTrigger>
            <SelectContent>
              {SECTOR_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Node type */}
        <div className="space-y-2">
          <Label>Type de noeud</Label>
          <Select value={nodeType} onValueChange={setNodeType}>
            <SelectTrigger>
              <SelectValue placeholder="Type de noeud" />
            </SelectTrigger>
            <SelectContent>
              {NODE_TYPE_OPTIONS.map((n) => (
                <SelectItem key={n.value} value={n.value}>
                  <span className="flex items-center gap-2">
                    <n.icon className="h-4 w-4 shrink-0" />
                    {n.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }

  function renderStep1() {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Rattacher cette stratégie à une marque parente (optionnel).
        </p>

        {strategiesLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-2 max-h-[40vh] overflow-y-auto">
            {/* No parent option */}
            <button
              type="button"
              onClick={() => setParentId(null)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors",
                parentId === null
                  ? "border-terracotta bg-terracotta/5"
                  : "hover:bg-muted/50",
              )}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Building2 className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-sm font-medium">Aucun parent</span>
                <span className="block text-[11px] text-muted-foreground">
                  Créer comme marque racine
                </span>
              </div>
            </button>

            {/* Strategy list */}
            {strategies?.map((s: { id: string; brandName: string; nodeType?: string }) => (
              <button
                type="button"
                key={s.id}
                onClick={() => setParentId(s.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors",
                  parentId === s.id
                    ? "border-terracotta bg-terracotta/5"
                    : "hover:bg-muted/50",
                )}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-terracotta/10 text-terracotta">
                  <Building2 className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-medium truncate block">
                    {s.brandName}
                  </span>
                  {s.nodeType && (
                    <span className="text-[11px] text-muted-foreground">
                      {s.nodeType}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  function renderStep2() {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Comment souhaitez-vous renseigner les informations de la marque ?
        </p>

        {INPUT_METHODS.map((method) => (
          <button
            type="button"
            key={method.key}
            onClick={() => setInputMethod(method.key)}
            className={cn(
              "flex w-full items-center gap-4 rounded-lg border p-4 text-left transition-colors",
              inputMethod === method.key
                ? "border-terracotta bg-terracotta/5"
                : "hover:bg-muted/50",
            )}
          >
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors",
                inputMethod === method.key
                  ? "bg-terracotta text-white"
                  : "bg-muted text-muted-foreground",
              )}
            >
              <method.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-sm font-semibold block">{method.title}</span>
              <span className="text-[12px] text-muted-foreground block">
                {method.description}
              </span>
            </div>
          </button>
        ))}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Step titles
  // ---------------------------------------------------------------------------

  const STEP_TITLES = [
    "Nouvelle marque",
    "Marque parente",
    "Méthode de saisie",
  ] as const;

  const STEP_DESCRIPTIONS = [
    "Définissez le nom, secteur et type de noeud.",
    "Rattachez cette stratégie à une marque existante.",
    "Choisissez comment renseigner les données.",
  ] as const;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="max-h-[85vh] rounded-t-2xl">
        <div className="flex flex-col overflow-y-auto">
          {/* Header */}
          <SheetHeader className="pb-2">
            <ProgressDots current={step} total={3} />
            <SheetTitle className="text-center mt-2">
              {STEP_TITLES[step]}
            </SheetTitle>
            <SheetDescription className="text-center">
              {STEP_DESCRIPTIONS[step]}
            </SheetDescription>
          </SheetHeader>

          {/* Step content */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {step === 0 && renderStep0()}
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
          </div>

          {/* Footer navigation */}
          <div className="flex items-center gap-3 border-t px-4 py-4">
            {step > 0 ? (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep((s) => s - 1)}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Retour
              </Button>
            ) : (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleOpenChange(false)}
              >
                Annuler
              </Button>
            )}

            {step < 2 ? (
              <Button
                className="flex-1 bg-terracotta hover:bg-terracotta/90"
                disabled={step === 0 && !canAdvanceStep0()}
                onClick={() => setStep((s) => s + 1)}
              >
                Suivant
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button
                className="flex-1 bg-terracotta hover:bg-terracotta/90"
                disabled={!inputMethod || createMutation.isPending}
                onClick={handleConfirm}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  "Créer la marque"
                )}
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
