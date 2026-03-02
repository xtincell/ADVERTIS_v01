// ==========================================================================
// PAGE P.F4 — Freelance Profile (Talent Profile)
// ==========================================================================
// Structured talent profile editor using La Guilde schemas.
// Sections: Identity, Specializations, Skills & Tools, Portfolio, Tarifs,
// Availability. Uses api.guilde.upsertMyProfile for persistence.
// ==========================================================================

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  User,
  Save,
  Mail,
  MapPin,
  Globe,
  Briefcase,
  Star,
  Link2,
  Linkedin,
  Play,
  Wrench,
  Languages,
  Trophy,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

import { api } from "~/trpc/react";
import { PageSpinner } from "~/components/ui/loading-skeleton";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  TALENT_SPECIALIZATIONS,
  TALENT_SPECIALIZATION_LABELS,
  TALENT_AVAILABILITY,
  TALENT_AVAILABILITY_LABELS,
  TALENT_LEVEL_CONFIG,
  TALENT_LEVEL_LABELS,
  type TalentSpecialization,
  type TalentAvailability,
  type TalentLevel,
} from "~/lib/constants";

export default function FreelanceProfilePage() {
  const { data: session, status: authStatus } = useSession();
  const { data: profile, isLoading: profileLoading } =
    api.guilde.getMyProfile.useQuery();
  const { data: progression } = api.guilde.getMyProgression.useQuery();

  const utils = api.useUtils();
  const upsert = api.guilde.upsertMyProfile.useMutation({
    onSuccess: () => {
      toast.success("Profil sauvegardé !");
      void utils.guilde.getMyProfile.invalidate();
    },
    onError: () => toast.error("Erreur lors de la sauvegarde."),
  });

  // ── Form State ──
  const [displayName, setDisplayName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [experienceYears, setExperienceYears] = useState<number | undefined>();
  const [location, setLocation] = useState("");
  const [country, setCountry] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [langInput, setLangInput] = useState("");
  const [specializations, setSpecializations] = useState<TalentSpecialization[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [tools, setTools] = useState<string[]>([]);
  const [toolInput, setToolInput] = useState("");
  const [sectors, setSectors] = useState<string[]>([]);
  const [sectorInput, setSectorInput] = useState("");
  const [portfolioUrls, setPortfolioUrls] = useState<string[]>([]);
  const [portfolioInput, setPortfolioInput] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [showreel, setShowreel] = useState("");
  const [tjmMin, setTjmMin] = useState<number | undefined>();
  const [tjmMax, setTjmMax] = useState<number | undefined>();
  const [availability, setAvailability] = useState<TalentAvailability>("AVAILABLE");

  // ── Hydrate form from profile data ──
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName ?? "");
      setHeadline(profile.headline ?? "");
      setBio(profile.bio ?? "");
      setExperienceYears(profile.experienceYears ?? undefined);
      setLocation(profile.location ?? "");
      setCountry(profile.country ?? "");
      setLanguages((profile.languages as string[]) ?? []);
      setSpecializations(
        ((profile.specializations as string[]) ?? []) as TalentSpecialization[],
      );
      setSkills((profile.skills as string[]) ?? []);
      setTools((profile.tools as string[]) ?? []);
      setSectors((profile.sectors as string[]) ?? []);
      setPortfolioUrls((profile.portfolioUrls as string[]) ?? []);
      setLinkedinUrl(profile.linkedinUrl ?? "");
      setShowreel(profile.showreel ?? "");
      setTjmMin(profile.tjmMin ?? undefined);
      setTjmMax(profile.tjmMax ?? undefined);
      setAvailability((profile.availability as TalentAvailability) ?? "AVAILABLE");
    }
  }, [profile]);

  // ── Save handler ──
  const handleSave = () => {
    upsert.mutate({
      displayName: displayName || undefined,
      headline: headline || undefined,
      bio: bio || undefined,
      experienceYears,
      location: location || undefined,
      country: country || undefined,
      languages: languages.length > 0 ? languages : undefined,
      specializations: specializations.length > 0 ? specializations : undefined,
      skills: skills.length > 0 ? skills : undefined,
      tools: tools.length > 0 ? tools : undefined,
      sectors: sectors.length > 0 ? sectors : undefined,
      portfolioUrls: portfolioUrls.length > 0 ? portfolioUrls : undefined,
      linkedinUrl: linkedinUrl || undefined,
      showreel: showreel || undefined,
      tjmMin,
      tjmMax,
      availability,
    });
  };

  // ── Tag input helpers ──
  const addTag = (
    list: string[],
    setter: (v: string[]) => void,
    input: string,
    inputSetter: (v: string) => void,
  ) => {
    const v = input.trim();
    if (v && !list.includes(v)) {
      setter([...list, v]);
    }
    inputSetter("");
  };

  const removeTag = (list: string[], setter: (v: string[]) => void, idx: number) => {
    setter(list.filter((_, i) => i !== idx));
  };

  // ── Loading state ──
  if (authStatus === "loading" || profileLoading) {
    return <PageSpinner />;
  }

  const user = session?.user;
  const level = (profile?.level as TalentLevel) ?? "NOVICE";
  const levelConfig = TALENT_LEVEL_CONFIG[level];

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 md:px-8 md:py-8">
      {/* Header + Save */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-semibold">Mon Profil Talent</h1>
        </div>
        <Button onClick={handleSave} disabled={upsert.isPending} size="sm">
          <Save className="h-4 w-4 mr-1" />
          {upsert.isPending ? "Sauvegarde..." : "Sauvegarder"}
        </Button>
      </div>

      {/* Progression Banner */}
      {profile && (
        <div className="rounded-xl border bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">{levelConfig.emoji}</span>
              <span className="font-medium">{TALENT_LEVEL_LABELS[level]}</span>
              <Badge
                variant="outline"
                className="text-xs"
                style={{ borderColor: levelConfig.color, color: levelConfig.color }}
              >
                Niveau {level}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5" />
                {profile.totalMissions} missions
              </span>
              {profile.avgScore != null && (
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 text-amber-500" />
                  {profile.avgScore.toFixed(1)}/5
                </span>
              )}
            </div>
          </div>
          {progression && (
            <div>
              {(() => {
                const pct = Math.round(
                  ((progression.missionsProgress + progression.scoreProgress) / 2) * 100,
                );
                const remaining = progression.nextLevelConfig
                  ? Math.max(0, progression.nextLevelConfig.minMissions - progression.totalMissions)
                  : 0;
                return (
                  <>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Progression vers {progression.nextLevel ?? "max"}</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: levelConfig.color,
                        }}
                      />
                    </div>
                    {remaining > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Encore {remaining} mission(s) requise(s)
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* ── Section: Identity ── */}
      <div className="rounded-xl border bg-white p-5 space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          Identité
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Nom affiché</label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={user?.name ?? "Votre nom"}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Titre / Headline</label>
            <Input
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="Ex: Directeur artistique senior"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">Bio</label>
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Décrivez votre parcours, vos forces..."
            rows={3}
          />
          <div className="text-xs text-muted-foreground text-right mt-1">
            {bio.length}/2000
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Briefcase className="h-3 w-3" /> Expérience (années)
            </label>
            <Input
              type="number"
              min={0}
              max={50}
              value={experienceYears ?? ""}
              onChange={(e) =>
                setExperienceYears(e.target.value ? parseInt(e.target.value) : undefined)
              }
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" /> Ville
            </label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Douala" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Globe className="h-3 w-3" /> Pays
            </label>
            <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Cameroun" />
          </div>
        </div>

        {/* Languages */}
        <div>
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Languages className="h-3 w-3" /> Langues
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {languages.map((lang, i) => (
              <Badge key={i} variant="secondary" className="text-xs cursor-pointer" onClick={() => removeTag(languages, setLanguages, i)}>
                {lang} ×
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={langInput}
              onChange={(e) => setLangInput(e.target.value)}
              placeholder="Ajouter une langue..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag(languages, setLanguages, langInput, setLangInput);
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addTag(languages, setLanguages, langInput, setLangInput)}
            >
              +
            </Button>
          </div>
        </div>
      </div>

      {/* ── Section: Specializations ── */}
      <div className="rounded-xl border bg-white p-5 space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <Trophy className="h-4 w-4 text-muted-foreground" />
          Spécialisations
        </h2>
        <p className="text-xs text-muted-foreground">
          Sélectionnez vos domaines d&apos;expertise (cliquez pour ajouter/retirer).
        </p>
        <div className="flex flex-wrap gap-2">
          {TALENT_SPECIALIZATIONS.map((spec) => {
            const selected = specializations.includes(spec);
            return (
              <Badge
                key={spec}
                variant={selected ? "default" : "outline"}
                className="cursor-pointer text-xs transition-colors"
                onClick={() => {
                  if (selected) {
                    setSpecializations(specializations.filter((s) => s !== spec));
                  } else {
                    setSpecializations([...specializations, spec]);
                  }
                }}
              >
                {TALENT_SPECIALIZATION_LABELS[spec]}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* ── Section: Skills & Tools ── */}
      <div className="rounded-xl border bg-white p-5 space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <Wrench className="h-4 w-4 text-muted-foreground" />
          Compétences & Outils
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Skills */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Compétences</label>
            <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
              {skills.map((s, i) => (
                <Badge key={i} variant="secondary" className="text-xs cursor-pointer" onClick={() => removeTag(skills, setSkills, i)}>
                  {s} ×
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="Ex: Figma, React..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag(skills, setSkills, skillInput, setSkillInput);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addTag(skills, setSkills, skillInput, setSkillInput)}
              >
                +
              </Button>
            </div>
          </div>

          {/* Tools */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Outils / Logiciels</label>
            <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
              {tools.map((t, i) => (
                <Badge key={i} variant="outline" className="text-xs cursor-pointer" onClick={() => removeTag(tools, setTools, i)}>
                  {t} ×
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={toolInput}
                onChange={(e) => setToolInput(e.target.value)}
                placeholder="Ex: Adobe Suite, Blender..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag(tools, setTools, toolInput, setToolInput);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addTag(tools, setTools, toolInput, setToolInput)}
              >
                +
              </Button>
            </div>
          </div>
        </div>

        {/* Sectors */}
        <div>
          <label className="text-xs font-medium text-muted-foreground">Secteurs d&apos;activité</label>
          <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
            {sectors.map((s, i) => (
              <Badge key={i} variant="secondary" className="text-xs cursor-pointer" onClick={() => removeTag(sectors, setSectors, i)}>
                {s} ×
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={sectorInput}
              onChange={(e) => setSectorInput(e.target.value)}
              placeholder="Ex: Luxe, Tech, Santé..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag(sectors, setSectors, sectorInput, setSectorInput);
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addTag(sectors, setSectors, sectorInput, setSectorInput)}
            >
              +
            </Button>
          </div>
        </div>
      </div>

      {/* ── Section: Portfolio ── */}
      <div className="rounded-xl border bg-white p-5 space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <Link2 className="h-4 w-4 text-muted-foreground" />
          Portfolio & Liens
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Linkedin className="h-3 w-3" /> LinkedIn
            </label>
            <Input
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/in/..."
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Play className="h-3 w-3" /> Showreel
            </label>
            <Input
              value={showreel}
              onChange={(e) => setShowreel(e.target.value)}
              placeholder="https://vimeo.com/..."
            />
          </div>
        </div>

        {/* Portfolio URLs */}
        <div>
          <label className="text-xs font-medium text-muted-foreground">Liens portfolio</label>
          <div className="space-y-1 mb-2">
            {portfolioUrls.map((url, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <Link2 className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                <span className="truncate flex-1 text-xs text-blue-600">{url}</span>
                <button
                  type="button"
                  className="text-xs text-red-500 hover:text-red-700"
                  onClick={() => removeTag(portfolioUrls, setPortfolioUrls, i)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={portfolioInput}
              onChange={(e) => setPortfolioInput(e.target.value)}
              placeholder="https://behance.net/..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag(portfolioUrls, setPortfolioUrls, portfolioInput, setPortfolioInput);
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                addTag(portfolioUrls, setPortfolioUrls, portfolioInput, setPortfolioInput)
              }
            >
              +
            </Button>
          </div>
        </div>
      </div>

      {/* ── Section: Tarifs & Disponibilité ── */}
      <div className="rounded-xl border bg-white p-5 space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          Tarifs & Disponibilité
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">TJM Min (XAF)</label>
            <Input
              type="number"
              min={0}
              value={tjmMin ?? ""}
              onChange={(e) => setTjmMin(e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="50 000"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">TJM Max (XAF)</label>
            <Input
              type="number"
              min={0}
              value={tjmMax ?? ""}
              onChange={(e) => setTjmMax(e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="150 000"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Disponibilité</label>
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
      </div>

      {/* Bottom save button */}
      <div className="flex justify-end pb-8">
        <Button onClick={handleSave} disabled={upsert.isPending}>
          <Save className="h-4 w-4 mr-1" />
          {upsert.isPending ? "Sauvegarde en cours..." : "Sauvegarder le profil"}
        </Button>
      </div>
    </div>
  );
}
