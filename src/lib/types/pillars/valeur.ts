// =============================================================================
// Pilier V — Valeur (v1 + v2 atomised)
// =============================================================================

import { z } from "zod";
import { flexStringArray, num } from "./shared";

// ---------------------------------------------------------------------------
// V1 — Original schema
// ---------------------------------------------------------------------------

export const ValeurPillarSchema = z
  .object({
    productLadder: z
      .array(
        z.object({
          tier: z.string().default(""),
          prix: z.string().default(""),
          description: z.string().default(""),
          cible: z.string().default(""),
        }),
      )
      .default([]),
    valeurMarque: z
      .object({
        tangible: flexStringArray,
        intangible: flexStringArray,
      })
      .default({}),
    valeurClient: z
      .object({
        fonctionnels: flexStringArray,
        emotionnels: flexStringArray,
        sociaux: flexStringArray,
      })
      .default({}),
    coutMarque: z
      .object({
        capex: z.string().default(""),
        opex: z.string().default(""),
        coutsCaches: flexStringArray,
      })
      .default({}),
    coutClient: z
      .object({
        frictions: z
          .array(
            z.object({
              friction: z.string().default(""),
              solution: z.string().default(""),
            }),
          )
          .default([]),
      })
      .default({}),
    unitEconomics: z
      .object({
        cac: z.string().default(""),
        ltv: z.string().default(""),
        ratio: z.string().default(""),
        pointMort: z.string().default(""),
        marges: z.string().default(""),
        notes: z.string().default(""),
      })
      .default({}),
  })
  .strip();

export type ValeurPillarData = z.infer<typeof ValeurPillarSchema>;

// ---------------------------------------------------------------------------
// V2 — Atomised variables
// ---------------------------------------------------------------------------

/** Product lifecycle phase */
const PhaseLifecycleEnum = z
  .enum(["launch", "growth", "mature", "decline"])
  .catch("launch");

/** V0 — Single product/service in the brand catalogue (source of truth) */
export const ProduitServiceSchema = z.object({
  id: z.string().default(""),
  nom: z.string().default(""),
  prix: z.string().default(""),
  cout: z.string().default(""),
  description: z.string().default(""),
  categorie: z.enum(["produit", "service"]).catch("produit"),
  lienPromesse: z.string().default(""),
  margeUnitaire: z.string().default(""),
  segmentCible: z.string().default(""),
  phaseLifecycle: PhaseLifecycleEnum,
  disponibilite: z.string().default(""),
  canalDistribution: z.string().default(""),
  skuRef: z.string().default(""),
  images: z.array(z.string()).default([]),
  variantes: z.array(z.string()).default([]),
  bundles: z.array(z.string()).default([]),
  dependencies: z.array(z.string()).default([]),
  scoringInterne: z.coerce.number().min(0).max(100).catch(0),
});

/** Atomic value/cost line item */
export const ValeurCoutItemSchema = z.object({
  item: z.string().default(""),
  montant: z.string().default(""),
  categorie: z.string().default(""),
});

/** Flex helper: tolerate a single object where an array is expected */
const flexValeurCoutArray = z
  .preprocess(
    (val) => {
      if (Array.isArray(val)) return val;
      if (val && typeof val === "object") return [val];
      return [];
    },
    z.array(ValeurCoutItemSchema),
  )
  .default([]);

/** Product ladder tier with optional product references */
const ProductLadderTierV2Schema = z.object({
  tier: z.string().default(""),
  prix: z.string().default(""),
  description: z.string().default(""),
  cible: z.string().default(""),
  produitIds: z.array(z.string()).default([]),
});

export const ValeurPillarSchemaV2 = z
  .object({
    produitsCatalogue: z.array(ProduitServiceSchema).default([]),
    productLadder: z.array(ProductLadderTierV2Schema).default([]),
    valeurMarqueTangible: flexValeurCoutArray,
    valeurMarqueIntangible: flexValeurCoutArray,
    valeurClientTangible: flexValeurCoutArray,
    valeurClientIntangible: flexValeurCoutArray,
    coutMarqueTangible: flexValeurCoutArray,
    coutMarqueIntangible: flexValeurCoutArray,
    coutClientTangible: flexValeurCoutArray,
    coutClientIntangible: flexValeurCoutArray,
    cac: z.string().default(""),
    ltv: z.string().default(""),
    ltvCacRatio: z.string().default(""),
    pointMort: z.string().default(""),
    marges: z.string().default(""),
    notesEconomics: z.string().default(""),
    dureeLTV: z.coerce.number().default(24),
    margeNette: z.string().default(""),
    roiEstime: z.string().default(""),
    paybackPeriod: z.string().default(""),
  })
  .strip();

export type ValeurPillarDataV2 = z.infer<typeof ValeurPillarSchemaV2>;
export type ProduitService = z.infer<typeof ProduitServiceSchema>;
export type ValeurCoutItem = z.infer<typeof ValeurCoutItemSchema>;
