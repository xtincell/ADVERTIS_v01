// =============================================================================
// PAGE P.GUILDE.DETAIL — Talent Profile Detail
// =============================================================================
// Profil talent détaillé : identité, compétences, portfolio, historique
// missions, reviews, certifications, barre de progression.
// =============================================================================

"use client";

import { use } from "react";
import {
  Star,
  Award,
  Briefcase,
  MapPin,
  Globe,
  Linkedin,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { PageHeader } from "~/components/ui/page-header";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import {
  TALENT_LEVEL_LABELS,
  TALENT_LEVEL_CONFIG,
  TALENT_CATEGORY_LABELS,
  TALENT_AVAILABILITY_LABELS,
  TALENT_SPECIALIZATION_LABELS,
  REVIEW_DIMENSION_LABELS,
  type TalentLevel,
  type TalentCategory,
  type TalentAvailability,
  type TalentSpecialization,
  type ReviewDimension,
} from "~/lib/constants";

export default function TalentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: profile, isLoading } = api.guilde.getProfile.useQuery({ userId: id });
  const { data: progression } = api.guilde.getProgression.useQuery({ userId: id });
  const { data: reviews } = api.guilde.getReviews.useQuery(
    { talentProfileId: profile?.id ?? "" },
    { enabled: !!profile?.id },
  );
  const { data: certifications } = api.guilde.getCertifications.useQuery(
    { talentProfileId: profile?.id ?? "" },
    { enabled: !!profile?.id },
  );

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="space-y-6 stagger-children">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-muted/50 shimmer" />
          ))}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 text-center">
        <p className="text-lg text-muted-foreground">Profil non trouvé</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/guilde">← Retour au répertoire</Link>
        </Button>
      </div>
    );
  }

  const lvl = profile.level as TalentLevel;
  const cfg = TALENT_LEVEL_CONFIG[lvl];
  const specs = (profile.specializations as string[] | null) ?? [];
  const skills = (profile.skills as string[] | null) ?? [];
  const tools = (profile.tools as string[] | null) ?? [];
  const portfolioUrls = (profile.portfolioUrls as string[] | null) ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:px-8 md:py-8">
      {/* Back */}
      <PageHeader
        title="Profil Talent"
        backHref="/guilde"
        backLabel="Retour au répertoire"
        className="mb-6"
      />

      {/* Identity Card */}
      <div className="rounded-xl border bg-white p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full text-3xl"
               style={{ backgroundColor: cfg.color + "20" }}>
            {cfg.emoji}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{profile.displayName ?? profile.user?.name}</h1>
            {profile.headline && (
              <p className="text-muted-foreground mt-1">{profile.headline}</p>
            )}
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <Badge style={{ backgroundColor: cfg.color + "20", color: cfg.color }}>
                {cfg.emoji} {TALENT_LEVEL_LABELS[lvl]}
              </Badge>
              <Badge variant="outline">
                {TALENT_CATEGORY_LABELS[profile.category as TalentCategory]}
              </Badge>
              <Badge variant={profile.availability === "AVAILABLE" ? "default" : "secondary"}>
                {TALENT_AVAILABILITY_LABELS[profile.availability as TalentAvailability]}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
              {profile.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {profile.location}{profile.country ? `, ${profile.country}` : ""}
                </span>
              )}
              {profile.experienceYears && (
                <span>{profile.experienceYears} ans d&apos;expérience</span>
              )}
              {profile.linkedinUrl && (
                <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-1 text-blue-600 hover:underline">
                  <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                </a>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold tabular-nums">{profile.totalMissions}</div>
            <div className="text-xs text-muted-foreground">missions</div>
            {profile.avgScore && (
              <>
                <div className="text-xl font-bold tabular-nums mt-2 flex items-center gap-1 justify-end">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  {profile.avgScore.toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">score moyen</div>
              </>
            )}
          </div>
        </div>
        {profile.bio && (
          <p className="mt-4 text-sm text-muted-foreground border-t pt-4">{profile.bio}</p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Specializations & Skills */}
        <div className="rounded-xl border bg-white p-5">
          <h2 className="font-semibold mb-3">Spécialisations</h2>
          <div className="flex flex-wrap gap-1.5">
            {specs.map((s) => (
              <Badge key={s} variant="outline" className="text-xs">
                {TALENT_SPECIALIZATION_LABELS[s as TalentSpecialization] ?? s}
              </Badge>
            ))}
            {specs.length === 0 && <span className="text-sm text-muted-foreground">Aucune spécialisation</span>}
          </div>
          {skills.length > 0 && (
            <>
              <h3 className="font-medium text-sm mt-4 mb-2">Compétences</h3>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((s) => (
                  <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                ))}
              </div>
            </>
          )}
          {tools.length > 0 && (
            <>
              <h3 className="font-medium text-sm mt-4 mb-2">Outils</h3>
              <div className="flex flex-wrap gap-1.5">
                {tools.map((t) => (
                  <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Progression */}
        {progression && (
          <div className="rounded-xl border bg-white p-5">
            <h2 className="font-semibold mb-3">Progression</h2>
            {progression.isMaxLevel ? (
              <p className="text-sm text-emerald-600 font-medium">👑 Niveau maximum atteint !</p>
            ) : (
              <>
                <div className="text-sm mb-2">
                  Vers <span className="font-medium" style={{ color: progression.nextLevelConfig?.color }}>
                    {progression.nextLevel ? TALENT_LEVEL_LABELS[progression.nextLevel as TalentLevel] : ""}
                  </span>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Missions ({progression.totalMissions}/{progression.nextLevelConfig?.minMissions})</span>
                      <span>{Math.round(progression.missionsProgress * 100)}%</span>
                    </div>
                    <Progress value={progression.missionsProgress * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Score ({progression.avgScore.toFixed(1)}/{progression.nextLevelConfig?.minAvgScore})</span>
                      <span>{Math.round(progression.scoreProgress * 100)}%</span>
                    </div>
                    <Progress value={progression.scoreProgress * 100} className="h-2" />
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Portfolio */}
        {portfolioUrls.length > 0 && (
          <div className="rounded-xl border bg-white p-5">
            <h2 className="font-semibold mb-3">Portfolio</h2>
            <ul className="space-y-2">
              {portfolioUrls.map((url, i) => (
                <li key={i}>
                  <a href={url} target="_blank" rel="noopener noreferrer"
                     className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                    <ExternalLink className="h-3.5 w-3.5" />
                    {new URL(url).hostname}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Certifications */}
        <div className="rounded-xl border bg-white p-5">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <Award className="h-4 w-4 text-emerald-600" />
            Certifications ({certifications?.length ?? 0})
          </h2>
          {certifications && certifications.length > 0 ? (
            <ul className="space-y-3">
              {certifications.map((cert) => (
                <li key={cert.id} className="flex items-start gap-3 text-sm">
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-xs">
                    {cert.score ?? "✓"}
                  </div>
                  <div>
                    <div className="font-medium">{cert.name}</div>
                    {cert.issuedBy && <div className="text-xs text-muted-foreground">{cert.issuedBy}</div>}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Aucune certification</p>
          )}
        </div>
      </div>

      {/* Reviews */}
      {reviews && reviews.length > 0 && (
        <div className="rounded-xl border bg-white p-5 mt-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            Avis ({reviews.length})
          </h2>
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border-b last:border-0 pb-4 last:pb-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < review.qualityScore ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TJM / Tarifs */}
      {(profile.tjmMin || profile.tjmMax) && (
        <div className="rounded-xl border bg-white p-5 mt-6">
          <h2 className="font-semibold mb-2">Tarif journalier</h2>
          <p className="text-lg font-bold tabular-nums">
            {profile.tjmMin?.toLocaleString()} — {profile.tjmMax?.toLocaleString()} {profile.currency}/jour
          </p>
        </div>
      )}
    </div>
  );
}
