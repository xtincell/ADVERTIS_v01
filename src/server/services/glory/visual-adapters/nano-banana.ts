// =============================================================================
// SERVICE S.GLORY.VA.7 — Nano Banana Prompt Formatter
// =============================================================================
// Generates structured AI image generation prompts in "Nano Banana" format.
// Used by the visual-moodboard-generator to produce actionable prompts
// for AI image generation tools.
//
// Supports:
//   - Nano Banana v1: Structured prompt with style/mood/color/technique
//   - Nano Banana v2 (prepared): Extended params with controlNet, LoRA, scheduler
//
// Called by: glory/generation.ts (post-generation hook for moodboard tool)
// =============================================================================

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface NanoBananaPrompt {
  version: "v1" | "v2";
  /** The main generation prompt */
  prompt: string;
  /** Elements to avoid */
  negativePrompt: string;
  /** Visual style descriptor */
  style: string;
  /** Aspect ratio (e.g., "16:9", "1:1", "4:5") */
  aspectRatio: string;
  /** Emotional mood */
  mood: string;
  /** Color direction */
  colorDirection: string;
  /** Target application (logo, packaging, social, etc.) */
  application: string;
  /** Artist/style references for guidance */
  references?: string[];
  /** Quality/detail level (1-10) */
  quality: number;
}

/** Nano Banana v2 extended parameters (prepared for future integration) */
export interface NanoBananaV2Params {
  /** Fixed seed for reproducibility */
  seed?: number;
  /** ControlNet model for structural guidance */
  controlNet?: string;
  /** LoRA weight overrides */
  loraWeights?: Record<string, number>;
  /** Diffusion scheduler */
  scheduler?: string;
  /** CFG scale (guidance strength) */
  cfgScale?: number;
  /** Number of inference steps */
  steps?: number;
  /** IP-Adapter reference image URL */
  ipAdapterImage?: string;
}

export interface NanoBananaInput {
  brandName: string;
  visualDirection: string;
  colorPalette: string[];
  mood: string;
  style: string;
  applications: string[];
}

// ---------------------------------------------------------------------------
// Style presets
// ---------------------------------------------------------------------------

const STYLE_PRESETS: Record<string, { prefix: string; technique: string; references: string[] }> = {
  "luxe-raffine": {
    prefix: "premium luxury editorial",
    technique: "studio lighting, high-end product photography, silk textures",
    references: ["Pentagram", "Collins", "Wolff Olins"],
  },
  "energie-urbaine": {
    prefix: "dynamic urban street",
    technique: "street photography, kinetic blur, neon accents, gritty textures",
    references: ["Wieden+Kennedy", "Droga5", "72andSunny"],
  },
  "nature-organique": {
    prefix: "organic natural botanical",
    technique: "soft diffused light, earth tones, macro textures, linen paper",
    references: ["Mucho", "Homework", "Commission Studio"],
  },
  "tech-futuriste": {
    prefix: "futuristic tech interface",
    technique: "holographic gradients, glass morphism, 3D render, volumetric light",
    references: ["Ramotion", "Fantasy Interactive", "Instrument"],
  },
  "heritage-authentique": {
    prefix: "heritage crafted authentic",
    technique: "letterpress texture, aged paper, hand-drawn elements, woodblock",
    references: ["Louise Fili", "Jessica Hische", "Jon Contino"],
  },
  "minimalisme-epure": {
    prefix: "minimal clean Swiss design",
    technique: "negative space, geometric precision, monochrome, grid-based",
    references: ["Massimo Vignelli", "Josef Müller-Brockmann", "Base Design"],
  },
  "afro-contemporain": {
    prefix: "contemporary African bold vibrant",
    technique: "ankara patterns, bold geometry, vibrant saturated colors, woven textures",
    references: ["Africa Rising", "Lagos branding", "Johannesburg creative"],
  },
  "pop-culture": {
    prefix: "pop art bold colorful",
    technique: "flat illustration, halftone dots, primary colors, Memphis design",
    references: ["Stefan Sagmeister", "Paula Scher", "Morag Myerscough"],
  },
};

const APPLICATION_CONFIGS: Record<string, { aspectRatio: string; context: string }> = {
  "logo-identite": { aspectRatio: "1:1", context: "brand identity mark on clean background" },
  "Logo/Identité": { aspectRatio: "1:1", context: "brand identity mark on clean background" },
  packaging: { aspectRatio: "4:5", context: "product packaging shelf display" },
  Packaging: { aspectRatio: "4:5", context: "product packaging shelf display" },
  "digital-web": { aspectRatio: "16:9", context: "web hero section digital interface" },
  "Digital/Web": { aspectRatio: "16:9", context: "web hero section digital interface" },
  "reseaux-sociaux": { aspectRatio: "1:1", context: "social media post feed" },
  "Réseaux sociaux": { aspectRatio: "1:1", context: "social media post feed" },
  "print-affichage": { aspectRatio: "2:3", context: "billboard poster large format print" },
  "Print/Affichage": { aspectRatio: "2:3", context: "billboard poster large format print" },
  "espace-retail": { aspectRatio: "16:9", context: "retail space environmental signage" },
  "Espace/Retail": { aspectRatio: "16:9", context: "retail space environmental signage" },
  "motion-video": { aspectRatio: "16:9", context: "motion graphics title sequence frame" },
  "Motion/Vidéo": { aspectRatio: "16:9", context: "motion graphics title sequence frame" },
};

// ---------------------------------------------------------------------------
// v1 Generator
// ---------------------------------------------------------------------------

export function generateNanoBananaV1Prompts(
  params: NanoBananaInput,
): NanoBananaPrompt[] {
  const prompts: NanoBananaPrompt[] = [];

  // Resolve style preset
  const styleKey = params.mood
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-");
  const preset = STYLE_PRESETS[styleKey] ?? STYLE_PRESETS["minimalisme-epure"]!;

  // Build color direction string
  const colorStr =
    params.colorPalette.length > 0
      ? `color palette: ${params.colorPalette.join(", ")}`
      : "harmonious brand colors";

  for (const application of params.applications) {
    const appConfig = APPLICATION_CONFIGS[application] ??
      APPLICATION_CONFIGS[application.toLowerCase().replace(/\s+/g, "-")] ?? {
        aspectRatio: "16:9",
        context: application,
      };

    const prompt = [
      `${preset.prefix} ${appConfig.context}`,
      `for "${params.brandName}" brand`,
      params.visualDirection,
      preset.technique,
      colorStr,
      "professional quality, 8k resolution, detailed",
    ]
      .filter(Boolean)
      .join(", ");

    const negativePrompt = [
      "blurry", "low quality", "distorted text", "watermark",
      "amateur", "clipart", "stock photo generic", "oversaturated",
      "AI artifacts", "uncanny valley",
    ].join(", ");

    prompts.push({
      version: "v1",
      prompt,
      negativePrompt,
      style: `${preset.prefix} — ${params.style}`,
      aspectRatio: appConfig.aspectRatio,
      mood: params.mood,
      colorDirection: colorStr,
      application,
      references: preset.references,
      quality: 8,
    });
  }

  // Add an extra "brand essence" prompt — abstract/conceptual
  prompts.push({
    version: "v1",
    prompt: [
      `abstract brand essence visualization for "${params.brandName}"`,
      params.visualDirection,
      preset.technique,
      colorStr,
      "conceptual, atmospheric, evocative, editorial quality",
    ]
      .filter(Boolean)
      .join(", "),
    negativePrompt: "text, logos, letters, words, cluttered, generic",
    style: `${preset.prefix} — abstract essence`,
    aspectRatio: "16:9",
    mood: params.mood,
    colorDirection: colorStr,
    application: "brand-essence",
    references: preset.references,
    quality: 9,
  });

  return prompts;
}

// ---------------------------------------------------------------------------
// v2 Generator (prepared — wraps v1 with extended params)
// ---------------------------------------------------------------------------

export function generateNanoBananaV2Prompts(
  params: NanoBananaInput,
  v2Config?: NanoBananaV2Params,
): NanoBananaPrompt[] {
  const v1Prompts = generateNanoBananaV1Prompts(params);

  return v1Prompts.map((p) => ({
    ...p,
    version: "v2" as const,
    quality: v2Config?.cfgScale ? Math.min(v2Config.cfgScale, 10) : p.quality,
    // V2-specific metadata added to the prompt for future API compatibility
    prompt: v2Config?.controlNet
      ? `${p.prompt} [controlnet:${v2Config.controlNet}]`
      : p.prompt,
  }));
}

// ---------------------------------------------------------------------------
// Utility — format prompts for AI context injection
// ---------------------------------------------------------------------------

export function formatNanoBananaPromptsForOutput(
  prompts: NanoBananaPrompt[],
): Record<string, unknown> {
  return {
    nanoBanana: {
      version: prompts[0]?.version ?? "v1",
      promptCount: prompts.length,
      prompts: prompts.map((p) => ({
        application: p.application,
        aspectRatio: p.aspectRatio,
        prompt: p.prompt,
        negativePrompt: p.negativePrompt,
        style: p.style,
        mood: p.mood,
        quality: p.quality,
        references: p.references,
      })),
      usage: "Copiez chaque prompt dans votre outil Nano Banana. Ajustez les couleurs et le style selon les résultats du moodboard.",
      v2Ready: prompts[0]?.version === "v2",
    },
  };
}
