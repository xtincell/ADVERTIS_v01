"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Star,
  List,
  Zap,
  HelpCircle,
  Loader2,
  Upload,
  PenLine,
  Rocket,
  AlertCircle,
  MessageSquareText,
  Download,
} from "lucide-react";

import { api } from "~/trpc/react";
import { PILLAR_CONFIG, SECTORS } from "~/lib/constants";
import type { PillarType } from "~/lib/constants";
import {
  getInterviewSchema,
  getPriorityVariables,
  getFicheDeMarqueSchema,
} from "~/lib/interview-schema";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { Progress } from "~/components/ui/progress";

import FileUploadZone from "~/components/strategy/import/file-upload-zone";
import type { ImportResult } from "~/components/strategy/import/file-upload-zone";
import FreeTextInput from "~/components/strategy/import/free-text-input";
import VariableMappingPreview from "~/components/strategy/import/variable-mapping-preview";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type WizardStep = 1 | 2 | 3 | 4;
type InputMethod = "form" | "import" | "freetext";
type InterviewMode = "express" | "complete";
type Step3Phase = "input" | "preview" | "form-review";

interface BasicInfo {
  name: string;
  brandName: string;
  sector: string;
  description: string;
}

// ---------------------------------------------------------------------------
// Step indicator component
// ---------------------------------------------------------------------------

const STEPS = [
  { number: 1 as const, label: "Informations de base" },
  { number: 2 as const, label: "Methode de saisie" },
  { number: 3 as const, label: "Fiche de Marque" },
  { number: 4 as const, label: "Resume & Lancement" },
];

function StepIndicator({ currentStep }: { currentStep: WizardStep }) {
  return (
    <nav className="mb-8">
      <ol className="flex items-center justify-center gap-2">
        {STEPS.map((step, index) => {
          const isActive = step.number === currentStep;
          const isCompleted = step.number < currentStep;
          return (
            <li key={step.number} className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div
                  className={`flex size-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                    isCompleted
                      ? "bg-primary text-primary-foreground"
                      : isActive
                        ? "bg-primary text-primary-foreground ring-primary/30 ring-4"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="size-4" />
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={`hidden text-sm md:inline ${
                    isActive
                      ? "text-foreground font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`mx-2 hidden h-px w-8 md:block lg:w-16 ${
                    step.number < currentStep ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Step 1: Basic Information (unchanged)
// ---------------------------------------------------------------------------

function Step1BasicInfo({
  data,
  onChange,
  onNext,
}: {
  data: BasicInfo;
  onChange: (data: BasicInfo) => void;
  onNext: () => void;
}) {
  const isValid = data.name.trim().length > 0 && data.brandName.trim().length > 0;

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle className="text-xl">Informations de base</CardTitle>
        <CardDescription>
          Commencez par definir les informations fondamentales de votre strategie
          de marque.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="strategyName">
            Nom de la stratégie <span className="text-destructive">*</span>
          </Label>
          <Input
            id="strategyName"
            placeholder="Ex: Stratégie de lancement Q1 2025"
            value={data.name}
            onChange={(e) => onChange({ ...data, name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="brandName">
            Nom de la marque <span className="text-destructive">*</span>
          </Label>
          <Input
            id="brandName"
            placeholder="Ex: NovaTech"
            value={data.brandName}
            onChange={(e) => onChange({ ...data, brandName: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sector">Secteur d&apos;activite</Label>
          <Select
            value={data.sector}
            onValueChange={(value) => onChange({ ...data, sector: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selectionnez un secteur" />
            </SelectTrigger>
            <SelectContent>
              {SECTORS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (optionnel)</Label>
          <Textarea
            id="description"
            placeholder="Décrivez brièvement le contexte et les objectifs de cette stratégie..."
            value={data.description}
            onChange={(e) =>
              onChange({ ...data, description: e.target.value })
            }
            className="min-h-24"
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={onNext} disabled={!isValid}>
            Continuer
            <ChevronRight className="ml-2 size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Step 2: Input Method Selection (NEW — replaces old Mode Selection)
// ---------------------------------------------------------------------------

function Step2InputMethod({
  method,
  interviewMode,
  onSelectMethod,
  onSelectInterviewMode,
  onNext,
  onBack,
}: {
  method: InputMethod;
  interviewMode: InterviewMode;
  onSelectMethod: (m: InputMethod) => void;
  onSelectInterviewMode: (m: InterviewMode) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Methode de saisie</h2>
        <p className="text-muted-foreground mt-1">
          Comment souhaitez-vous renseigner les donnees de votre marque ?
          <br />
          <span className="text-xs">
            Seuls les piliers A (Authenticite), D (Distinction), V (Valeur) et E
            (Engagement) necessitent des donnees. L&apos;audit (R+T) et les
            rapports sont générés automatiquement par l&apos;IA.
          </span>
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Manual Form */}
        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            method === "form"
              ? "ring-primary border-primary ring-2"
              : "hover:border-primary/50"
          }`}
          onClick={() => onSelectMethod("form")}
        >
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 flex size-10 items-center justify-center rounded-lg">
                <PenLine className="text-primary size-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Saisie manuelle</CardTitle>
                <Badge variant="secondary" className="mt-1">
                  Formulaire interactif
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Remplissez les variables de la Fiche de Marque pilier par pilier
              (A, D, V, E) via un formulaire guide. Ideal pour une saisie
              structuree.
            </p>
          </CardContent>
        </Card>

        {/* Free Text */}
        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            method === "freetext"
              ? "ring-primary border-primary ring-2"
              : "hover:border-primary/50"
          }`}
          onClick={() => onSelectMethod("freetext")}
        >
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 flex size-10 items-center justify-center rounded-lg">
                <MessageSquareText className="text-primary size-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Texte libre</CardTitle>
                <Badge variant="secondary" className="mt-1">
                  Ecriture libre + IA
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Decrivez votre marque librement dans un bloc de texte. L&apos;IA
              analysera votre description et mappera automatiquement les 25
              variables A-D-V-E.
            </p>
          </CardContent>
        </Card>

        {/* File Import */}
        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            method === "import"
              ? "ring-primary border-primary ring-2"
              : "hover:border-primary/50"
          }`}
          onClick={() => onSelectMethod("import")}
        >
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 flex size-10 items-center justify-center rounded-lg">
                <Upload className="text-primary size-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Import de fichier</CardTitle>
                <Badge variant="secondary" className="mt-1">
                  Excel, Word, PDF
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Importez un fichier existant contenant les informations de votre
              marque. L&apos;IA analysera le contenu et mappera automatiquement
              les variables.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sub-option for form mode: express vs complete */}
      {method === "form" && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-center">
            Niveau de detail du formulaire :
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            <Card
              className={`cursor-pointer transition-all ${
                interviewMode === "express"
                  ? "ring-primary/50 border-primary/50 ring-1"
                  : "hover:border-primary/30"
              }`}
              onClick={() => onSelectInterviewMode("express")}
            >
              <CardContent className="flex items-center gap-3 p-4">
                <Zap className="text-primary size-5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Express</p>
                  <p className="text-xs text-muted-foreground">
                    ~12 variables prioritaires (★) — 15 min
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card
              className={`cursor-pointer transition-all ${
                interviewMode === "complete"
                  ? "ring-primary/50 border-primary/50 ring-1"
                  : "hover:border-primary/30"
              }`}
              onClick={() => onSelectInterviewMode("complete")}
            >
              <CardContent className="flex items-center gap-3 p-4">
                <List className="text-primary size-5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Complet</p>
                  <p className="text-xs text-muted-foreground">
                    25 variables A-D-V-E — 30-45 min
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Sub-option for import mode: download template */}
      {method === "import" && (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed p-3">
          <Download className="text-muted-foreground size-4" />
          <p className="text-muted-foreground text-sm">
            Pas encore de fichier ?{" "}
            <a
              href="/api/template"
              download
              className="text-primary hover:underline font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              Telecharger le template Excel ADVERTIS
            </a>
          </p>
        </div>
      )}

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="mr-2 size-4" />
          Precedent
        </Button>
        <Button onClick={onNext}>
          Continuer
          <ChevronRight className="ml-2 size-4" />
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 3: Fiche de Marque Data Entry (MODIFIED — A-D-V-E only + import)
// ---------------------------------------------------------------------------

function Step3FicheDeMarque({
  inputMethod,
  interviewMode,
  interviewData,
  basicInfo,
  strategyId,
  importResult,
  step3Phase,
  autoFilledVarIds,
  onChange,
  onImportComplete,
  onImportReset,
  onImportError,
  onPhaseChange,
  onAutoFilledVarIdsChange,
  onNext,
  onBack,
}: {
  inputMethod: InputMethod;
  interviewMode: InterviewMode;
  interviewData: Record<string, string>;
  basicInfo: BasicInfo;
  strategyId: string | null;
  importResult: ImportResult | null;
  step3Phase: Step3Phase;
  autoFilledVarIds: Set<string>;
  onChange: (data: Record<string, string>) => void;
  onImportComplete: (result: ImportResult) => void;
  onImportReset: () => void;
  onImportError: (error: string) => void;
  onPhaseChange: (phase: Step3Phase) => void;
  onAutoFilledVarIdsChange: (ids: Set<string>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [activePillarIdx, setActivePillarIdx] = useState(0);

  // Reset pillar index when entering form-review phase
  useEffect(() => {
    if (step3Phase === "form-review") {
      setActivePillarIdx(0);
    }
  }, [step3Phase]);

  // --- Phase-based rendering for import/freetext ---

  // Phase "input": show upload zone or freetext textarea
  if (inputMethod !== "form" && step3Phase === "input") {
    if (inputMethod === "freetext") {
      return (
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold">Texte libre</h2>
            <p className="text-muted-foreground mt-1">
              Decrivez votre marque librement. L&apos;IA analysera votre texte
              et mappera les variables automatiquement.
            </p>
          </div>

          <FreeTextInput
            brandName={basicInfo.brandName}
            sector={basicInfo.sector}
            onAnalysisComplete={onImportComplete}
            onError={onImportError}
          />

          <div className="flex justify-start pt-2">
            <Button variant="outline" onClick={onBack}>
              <ChevronLeft className="mr-2 size-4" />
              Precedent
            </Button>
          </div>
        </div>
      );
    }

    // inputMethod === "import"
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Import de fichier</h2>
          <p className="text-muted-foreground mt-1">
            Importez un fichier contenant les informations de votre marque.
            L&apos;IA analysera le contenu et mappera les variables
            automatiquement.
          </p>
        </div>

        <FileUploadZone
          strategyId={strategyId ?? "temp"}
          brandName={basicInfo.brandName}
          sector={basicInfo.sector}
          onUploadComplete={onImportComplete}
          onError={onImportError}
        />

        <div className="flex justify-start pt-2">
          <Button variant="outline" onClick={onBack}>
            <ChevronLeft className="mr-2 size-4" />
            Precedent
          </Button>
        </div>
      </div>
    );
  }

  // Phase "preview": show mapping preview (import and freetext)
  if (inputMethod !== "form" && step3Phase === "preview" && importResult) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold">
            Verification du mapping
          </h2>
          <p className="text-muted-foreground mt-1">
            Verifiez et ajustez les variables mappees par l&apos;IA avant de
            continuer.
          </p>
        </div>

        <VariableMappingPreview
          mappedVariables={importResult.mappedVariables}
          confidence={importResult.confidence}
          unmappedVariables={importResult.unmappedVariables}
          fileName={importResult.fileName}
          onConfirm={(editedVars) => {
            onChange(editedVars);
            // Record which variables were auto-filled by AI
            const filledIds = new Set(
              Object.entries(editedVars)
                .filter(([, val]) => val.trim().length > 0)
                .map(([id]) => id),
            );
            onAutoFilledVarIdsChange(filledIds);
            onPhaseChange("form-review");
          }}
          onReset={onImportReset}
        />
      </div>
    );
  }

  // Form mode (manual) OR Phase "form-review" (post-import/freetext)
  const isPostImportReview = step3Phase === "form-review";
  const schema = isPostImportReview
    ? getInterviewSchema()
    : interviewMode === "express"
      ? getPriorityVariables()
      : getInterviewSchema();

  // Filter out sections with no variables (happens in express mode)
  const sections = schema.filter((s) => s.variables.length > 0);
  const currentSection = sections[activePillarIdx];

  if (!currentSection) return null;

  const pillarConfig = PILLAR_CONFIG[currentSection.pillarType as PillarType];

  const handleFieldChange = (id: string, value: string) => {
    onChange({ ...interviewData, [id]: value });
  };

  const goToPrevPillar = () => {
    if (activePillarIdx > 0) {
      setActivePillarIdx(activePillarIdx - 1);
    } else if (isPostImportReview) {
      onPhaseChange("preview");
    } else {
      onBack();
    }
  };

  const goToNextPillar = () => {
    if (activePillarIdx < sections.length - 1) {
      setActivePillarIdx(activePillarIdx + 1);
    } else {
      onNext();
    }
  };

  // Count filled variables
  const filledCount = currentSection.variables.filter(
    (v) => interviewData[v.id]?.trim(),
  ).length;
  const totalVars = sections.reduce((acc, s) => acc + s.variables.length, 0);
  const filledTotal = Object.values(interviewData).filter(
    (v) => v?.trim(),
  ).length;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Post-import review banner */}
      {isPostImportReview && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Check className="text-primary mt-0.5 size-5 shrink-0" />
              <div>
                <p className="font-medium">
                  Mapping IA confirme &mdash; Verifiez et completez vos donnees
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  Les champs pre-remplis par l&apos;IA sont indiques en{" "}
                  <span className="inline-flex items-center gap-1 rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-400">
                    bleu
                  </span>
                  . Les champs en{" "}
                  <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                    jaune
                  </span>
                  {" "}sont a completer.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Pilier {activePillarIdx + 1}/{sections.length}
          </span>
          <span className="text-muted-foreground">
            {filledTotal}/{totalVars} variables remplies
          </span>
        </div>
        <Progress
          value={(filledTotal / totalVars) * 100}
          className="h-2"
        />
      </div>

      {/* Pillar tabs */}
      <div className="flex flex-wrap gap-2">
        {sections.map((section, idx) => {
          const cfg = PILLAR_CONFIG[section.pillarType as PillarType];
          const sectionFilled = section.variables.filter(
            (v) => interviewData[v.id]?.trim(),
          ).length;
          const isActive = idx === activePillarIdx;

          return (
            <button
              key={section.pillarType}
              onClick={() => setActivePillarIdx(idx)}
              className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? "border-primary bg-primary/10 text-primary"
                  : sectionFilled === section.variables.length &&
                      section.variables.length > 0
                    ? "border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950 dark:text-green-400"
                    : "hover:bg-muted text-muted-foreground"
              }`}
            >
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: cfg.color }}
              />
              {section.pillarType}
              {sectionFilled > 0 && (
                <span className="text-xs opacity-60">
                  {sectionFilled}/{section.variables.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Current pillar content */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div
              className="flex size-10 items-center justify-center rounded-lg text-lg font-bold text-white"
              style={{ backgroundColor: pillarConfig.color }}
            >
              {currentSection.pillarType}
            </div>
            <div>
              <CardTitle className="text-lg">
                {pillarConfig.title}
              </CardTitle>
              <CardDescription>
                {pillarConfig.description} &mdash; {filledCount}/
                {currentSection.variables.length} remplies
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <TooltipProvider>
            {currentSection.variables.map((variable) => {
              const isAutoFilled = autoFilledVarIds.has(variable.id);
              const hasValue = !!interviewData[variable.id]?.trim();

              return (
                <div
                  key={variable.id}
                  className={`space-y-2 ${
                    isPostImportReview && isAutoFilled && hasValue
                      ? "rounded-lg border-l-4 border-l-blue-400 bg-blue-50/30 p-3 dark:bg-blue-950/20"
                      : isPostImportReview && !hasValue
                        ? "rounded-lg border-l-4 border-l-amber-400 bg-amber-50/30 p-3 dark:bg-amber-950/20"
                        : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Label htmlFor={variable.id} className="text-sm">
                      {variable.priority && (
                        <Star className="text-amber-500 mr-1 inline size-3 fill-amber-500" />
                      )}
                      <span className="text-muted-foreground mr-1 font-mono text-xs">
                        {variable.id}
                      </span>
                      {variable.label}
                    </Label>
                    {isPostImportReview && isAutoFilled && hasValue && (
                      <Badge
                        variant="outline"
                        className="border-blue-200 bg-blue-100 px-1.5 py-0 text-xs text-blue-700 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-400"
                      >
                        IA
                      </Badge>
                    )}
                    {isPostImportReview && !hasValue && (
                      <Badge
                        variant="outline"
                        className="border-amber-200 bg-amber-100 px-1.5 py-0 text-xs text-amber-700 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-400"
                      >
                        A remplir
                      </Badge>
                    )}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button type="button" className="text-muted-foreground hover:text-foreground">
                          <HelpCircle className="size-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        className="max-w-xs text-xs"
                      >
                        {variable.description}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  {variable.type === "textarea" ? (
                    <Textarea
                      id={variable.id}
                      placeholder={variable.placeholder}
                      value={interviewData[variable.id] ?? ""}
                      onChange={(e) =>
                        handleFieldChange(variable.id, e.target.value)
                      }
                      className="min-h-24"
                    />
                  ) : (
                    <Input
                      id={variable.id}
                      placeholder={variable.placeholder}
                      value={interviewData[variable.id] ?? ""}
                      onChange={(e) =>
                        handleFieldChange(variable.id, e.target.value)
                      }
                    />
                  )}
                </div>
              );
            })}
          </TooltipProvider>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={goToPrevPillar}>
          <ChevronLeft className="mr-2 size-4" />
          {activePillarIdx === 0 ? "Precedent" : `Pilier ${sections[activePillarIdx - 1]?.pillarType}`}
        </Button>
        <Button onClick={goToNextPillar}>
          {activePillarIdx < sections.length - 1 ? (
            <>
              Pilier {sections[activePillarIdx + 1]?.pillarType}
              <ChevronRight className="ml-2 size-4" />
            </>
          ) : (
            <>
              Continuer
              <ChevronRight className="ml-2 size-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 4: Summary & Launch (NEW — replaces old Generation Mode)
// ---------------------------------------------------------------------------

function Step4Summary({
  basicInfo,
  interviewData,
  inputMethod,
  onBack,
  onSubmit,
  isLoading,
}: {
  basicInfo: BasicInfo;
  interviewData: Record<string, string>;
  inputMethod: InputMethod;
  onBack: () => void;
  onSubmit: () => void;
  isLoading: boolean;
}) {
  const schema = getFicheDeMarqueSchema();

  // Calculate fill stats per pillar
  const pillarStats = schema.map((section) => {
    const filled = section.variables.filter(
      (v) => interviewData[v.id]?.trim(),
    ).length;
    return {
      pillarType: section.pillarType,
      title: section.title,
      filled,
      total: section.variables.length,
      percentage: Math.round((filled / section.variables.length) * 100),
    };
  });

  const totalFilled = pillarStats.reduce((acc, s) => acc + s.filled, 0);
  const totalVars = pillarStats.reduce((acc, s) => acc + s.total, 0);
  const overallPercentage = Math.round((totalFilled / totalVars) * 100);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Resume de la Fiche de Marque</h2>
        <p className="text-muted-foreground mt-1">
          Verifiez les donnees collectees avant de lancer l&apos;audit automatique.
        </p>
      </div>

      {/* Strategy info */}
      <Card>
        <CardContent className="p-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">Stratégie</p>
              <p className="font-medium">{basicInfo.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Marque</p>
              <p className="font-medium">{basicInfo.brandName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Methode</p>
              <p className="font-medium">
                {inputMethod === "form"
                  ? "Saisie manuelle"
                  : inputMethod === "freetext"
                    ? "Texte libre"
                    : "Import de fichier"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fill percentage per pillar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Complétude des données : {overallPercentage}%
          </CardTitle>
          <CardDescription>
            {totalFilled}/{totalVars} variables renseignées sur les piliers A-D-V-E
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {pillarStats.map((stat) => {
            const config = PILLAR_CONFIG[stat.pillarType as PillarType];
            return (
              <div key={stat.pillarType} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="size-3 rounded-full"
                      style={{ backgroundColor: config.color }}
                    />
                    <span className="font-medium">
                      {stat.pillarType} — {stat.title}
                    </span>
                  </div>
                  <span className="text-muted-foreground">
                    {stat.filled}/{stat.total}
                  </span>
                </div>
                <Progress value={stat.percentage} className="h-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* What happens next */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Rocket className="text-primary mt-0.5 size-5 shrink-0" />
            <div>
              <p className="font-medium">Prochaines etapes automatiques</p>
              <ol className="text-muted-foreground mt-2 list-inside list-decimal space-y-1 text-sm">
                <li>
                  <strong>Audit (R+T)</strong> — L&apos;IA analyse vos donnees A-E
                  et génère les SWOTs par variable + validation marché
                </li>
                <li>
                  <strong>Rapports (6 documents)</strong> — Generation de
                  300-600 pages de livrables strategiques
                </li>
                <li>
                  <strong>Cockpit</strong> — Interface interactive de
                  presentation pour votre client
                </li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warning if low completion */}
      {overallPercentage < 30 && (
        <div className="flex items-start gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-600" />
          <p className="text-sm text-yellow-800">
            Seulement {overallPercentage}% des variables sont renseignées.
            L&apos;IA compensera les données manquantes, mais la qualité sera
            meilleure avec plus d&apos;informations.
          </p>
        </div>
      )}

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack} disabled={isLoading}>
          <ChevronLeft className="mr-2 size-4" />
          Precedent
        </Button>
        <Button onClick={onSubmit} disabled={isLoading} size="lg">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Creation en cours...
            </>
          ) : (
            <>
              <Rocket className="mr-2 size-4" />
              Créer la stratégie & lancer l&apos;audit
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Wizard Page
// ---------------------------------------------------------------------------

export default function NewStrategyPage() {
  const router = useRouter();

  // Wizard state
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [basicInfo, setBasicInfo] = useState<BasicInfo>({
    name: "",
    brandName: "",
    sector: "",
    description: "",
  });
  const [inputMethod, setInputMethod] = useState<InputMethod>("form");
  const [interviewMode, setInterviewMode] =
    useState<InterviewMode>("express");
  const [interviewData, setInterviewData] = useState<Record<string, string>>(
    {},
  );
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [step3Phase, setStep3Phase] = useState<Step3Phase>("input");
  const [autoFilledVarIds, setAutoFilledVarIds] = useState<Set<string>>(
    new Set(),
  );

  // tRPC mutations
  const createStrategy = api.strategy.create.useMutation();
  const updateInterviewData = api.strategy.updateInterviewData.useMutation();

  const isSubmitting =
    createStrategy.isPending || updateInterviewData.isPending;

  const handleSubmit = useCallback(async () => {
    try {
      // 1. Create the strategy
      const strategy = await createStrategy.mutateAsync({
        name: basicInfo.name,
        brandName: basicInfo.brandName,
        sector: basicInfo.sector || undefined,
        description: basicInfo.description || undefined,
      });

      // 2. Save interview data
      await updateInterviewData.mutateAsync({
        id: strategy.id,
        data: {
          ...interviewData,
          _meta: {
            inputMethod,
            interviewMode:
              inputMethod === "form"
                ? interviewMode
                : inputMethod === "freetext"
                  ? "freetext"
                  : "import",
          },
        },
      });

      // 3. Redirect to the strategy detail page (the pipeline starts from there)
      router.push(`/strategy/${strategy.id}`);
    } catch (error) {
      console.error("Failed to create strategy:", error);
    }
  }, [
    basicInfo,
    interviewData,
    inputMethod,
    interviewMode,
    createStrategy,
    updateInterviewData,
    router,
  ]);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Nouvelle strategie
        </h1>
        <p className="text-muted-foreground">
          Créez votre stratégie de marque en 4 phases ADVERTIS : Fiche de Marque
          → Audit → Rapports → Cockpit.
        </p>
      </div>

      <StepIndicator currentStep={currentStep} />

      {/* Import error toast */}
      {importError && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <div className="flex-1">
            <p className="text-sm text-red-800">{importError}</p>
          </div>
          <button
            onClick={() => setImportError(null)}
            className="text-red-600 hover:text-red-800"
          >
            ×
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentStep}-${step3Phase}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          {currentStep === 1 && (
            <Step1BasicInfo
              data={basicInfo}
              onChange={setBasicInfo}
              onNext={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 2 && (
            <Step2InputMethod
              method={inputMethod}
              interviewMode={interviewMode}
              onSelectMethod={setInputMethod}
              onSelectInterviewMode={setInterviewMode}
              onNext={() => setCurrentStep(3)}
              onBack={() => setCurrentStep(1)}
            />
          )}

          {currentStep === 3 && (
            <Step3FicheDeMarque
              inputMethod={inputMethod}
              interviewMode={interviewMode}
              interviewData={interviewData}
              basicInfo={basicInfo}
              strategyId={null}
              importResult={importResult}
              step3Phase={step3Phase}
              autoFilledVarIds={autoFilledVarIds}
              onChange={setInterviewData}
              onImportComplete={(result) => {
                setImportResult(result);
                setImportError(null);
                setStep3Phase("preview");
              }}
              onImportReset={() => {
                setImportResult(null);
                setInterviewData({});
                setStep3Phase("input");
                setAutoFilledVarIds(new Set());
              }}
              onImportError={(err) => setImportError(err)}
              onPhaseChange={setStep3Phase}
              onAutoFilledVarIdsChange={setAutoFilledVarIds}
              onNext={() => setCurrentStep(4)}
              onBack={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 4 && (
            <Step4Summary
              basicInfo={basicInfo}
              interviewData={interviewData}
              inputMethod={inputMethod}
              onBack={() => {
                setCurrentStep(3);
                if (inputMethod !== "form") {
                  setStep3Phase("form-review");
                }
              }}
              onSubmit={handleSubmit}
              isLoading={isSubmitting}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
