"use client";

// =============================================================================
// PAGE P.CAMPAIGN_TEMPLATES — Template Library (Standalone)
// =============================================================================
// Two sections:
//   1. Livrables Stratégiques — deliverable templates (protocole, reco, mandat)
//   2. Templates de Campagnes — reusable campaign blueprints from DB
// =============================================================================

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  BookOpen,
  Layers,
  ChevronDown,
  ChevronRight,
  Search,
  Filter,
  Megaphone,
  Clock,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Card, CardContent } from "~/components/ui/card";
import {
  TEMPLATE_CONFIG,
  TEMPLATE_TYPES,
  CAMPAIGN_TYPE_LABELS,
  type TemplateType,
} from "~/lib/constants";
import { CampaignTemplateSelector } from "~/components/campaign/campaign-template-selector";

// ── Deliverable documentation ──
const DELIVERABLE_DOCS: Record<
  TemplateType,
  {
    description: string;
    whenToUse: string;
    pillarsUsed: string[];
    estimatedTime: string;
    gradient: string;
  }
> = {
  protocole_strategique: {
    description:
      "Document fondateur qui pose le diagnostic complet de la marque via la méthodologie ADVE, définit la vision stratégique, et construit la plateforme de marque. C'est le livrable le plus complet et le plus structurant.",
    whenToUse:
      "Lorsqu'un client vous confie un mandat de conseil stratégique de marque, un repositionnement, ou une création de marque. Idéal en début de relation client.",
    pillarsUsed: ["A", "D", "V", "E", "R", "T", "I"],
    estimatedTime: "3-6 semaines",
    gradient: "from-violet-500/10 to-indigo-500/10",
  },
  reco_campagne: {
    description:
      "Recommandation créative et stratégique pour une campagne spécifique. Part du brief, diagnostique le marché, construit l'insight consommateur, développe la copy strategy et le concept créatif jusqu'au plan de production.",
    whenToUse:
      "Pour chaque campagne majeure (lancement, activation, événement). Peut être utilisé plusieurs fois par an pour un même client.",
    pillarsUsed: ["A", "D", "V", "E", "I"],
    estimatedTime: "1-3 semaines",
    gradient: "from-emerald-500/10 to-teal-500/10",
  },
  mandat_360: {
    description:
      "Scope of work annuel qui structure la relation client sur 12 mois. Définit les streams de travail, la matrice de livrables, la gouvernance, le calendrier et la rémunération.",
    whenToUse:
      "Après un Protocole Stratégique validé, pour formaliser le partenariat annuel. Idéal pour les clients retainer/récurrents.",
    pillarsUsed: ["A", "D", "V", "E", "R", "T", "I", "S"],
    estimatedTime: "1-2 semaines",
    gradient: "from-amber-500/10 to-orange-500/10",
  },
};

const PILLAR_COLORS: Record<string, string> = {
  A: "bg-blue-100 text-blue-700",
  D: "bg-purple-100 text-purple-700",
  V: "bg-emerald-100 text-emerald-700",
  E: "bg-orange-100 text-orange-700",
  R: "bg-red-100 text-red-700",
  T: "bg-cyan-100 text-cyan-700",
  I: "bg-amber-100 text-amber-700",
  S: "bg-slate-100 text-slate-700",
};

export default function CampaignTemplatesPage() {
  const router = useRouter();
  const [expandedDeliverable, setExpandedDeliverable] =
    useState<TemplateType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  const toggleDeliverable = (t: TemplateType) =>
    setExpandedDeliverable(expandedDeliverable === t ? null : t);

  return (
    <div className="flex flex-col gap-8 p-4 pb-24 md:p-8 md:max-w-5xl md:mx-auto animate-page-enter">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/campaigns")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <FileText className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-display-lg">Bibliothèque de Templates</h1>
          <p className="text-sm text-muted-foreground">
            Livrables stratégiques & templates de campagnes
          </p>
        </div>
      </div>

      {/* ── Section 1: Livrables Stratégiques ── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Livrables Stratégiques</h2>
          <Badge variant="secondary" className="text-xs">
            {TEMPLATE_TYPES.length} types
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Les trois formats de livrables ADVERTIS. Chaque type structure votre
          travail stratégique avec des sections pré-définies et une méthodologie
          éprouvée.
        </p>

        <div className="grid gap-4">
          {TEMPLATE_TYPES.map((type) => {
            const config = TEMPLATE_CONFIG[type];
            const doc = DELIVERABLE_DOCS[type];
            const isExpanded = expandedDeliverable === type;

            return (
              <Card
                key={type}
                className={`overflow-hidden transition-all ${isExpanded ? "ring-1 ring-primary/30" : ""}`}
              >
                <button
                  className={`w-full text-left p-4 bg-gradient-to-r ${doc.gradient}`}
                  onClick={() => toggleDeliverable(type)}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{config.title}</h3>
                        <Badge variant="outline" className="text-[10px]">
                          {config.estimatedSlides[0]}-
                          {config.estimatedSlides[1]} {config.unit}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {config.subtitle}
                      </p>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 mt-1 shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 mt-1 shrink-0" />
                    )}
                  </div>

                  {/* Pillar tags + estimated time (always visible) */}
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    {doc.pillarsUsed.map((p) => (
                      <Badge
                        key={p}
                        className={`text-[10px] px-1.5 py-0 ${PILLAR_COLORS[p] ?? ""}`}
                      >
                        {p}
                      </Badge>
                    ))}
                    <span className="text-[10px] text-muted-foreground ml-auto flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {doc.estimatedTime}
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <CardContent className="border-t p-4 space-y-4 animate-fade-in">
                    {/* Description */}
                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase text-muted-foreground tracking-wider">
                        Description
                      </p>
                      <p className="text-sm">{doc.description}</p>
                    </div>

                    {/* When to use */}
                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase text-muted-foreground tracking-wider">
                        Quand l&apos;utiliser
                      </p>
                      <p className="text-sm">{doc.whenToUse}</p>
                    </div>

                    {/* Sections list */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium uppercase text-muted-foreground tracking-wider">
                        Sections ({config.sections.length})
                      </p>
                      <div className="grid gap-1 sm:grid-cols-2">
                        {config.sections.map((section, i) => (
                          <div
                            key={section}
                            className="flex items-center gap-2 text-sm py-1"
                          >
                            <span className="text-[10px] font-mono text-muted-foreground w-5 text-right">
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            <span>{section}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      {/* ── Section 2: Templates de Campagnes ── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Templates de Campagnes</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Campagnes pré-configurées prêtes à être dupliquées. Créées à partir de
          campagnes existantes réussies.
        </p>

        {/* Filters */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un template..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-1 flex-wrap">
            <Button
              variant={typeFilter === null ? "default" : "outline"}
              size="sm"
              className="text-xs"
              onClick={() => setTypeFilter(null)}
            >
              Tous
            </Button>
            {Object.entries(CAMPAIGN_TYPE_LABELS).map(([key, label]) => (
              <Button
                key={key}
                variant={typeFilter === key ? "default" : "outline"}
                size="sm"
                className="text-xs"
                onClick={() => setTypeFilter(typeFilter === key ? null : key)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Reuse existing CampaignTemplateSelector with filter pass-through */}
        <CampaignTemplateSelector
          onTemplateUsed={(id) => router.push(`/campaigns/${id}`)}
        />
      </section>
    </div>
  );
}
