// =============================================================================
// FW-22 — Creative Methodology Layer Handler
// =============================================================================
// Pure compute module (no AI). Registers a catalogue of creative methods and
// maps each method to the GLORY tools it serves.
// Inputs:  (none — static registry)
// Outputs: CM.methodRegistry, CM.methodToolMapping
// Category: compute
// =============================================================================

import { registerFrameworkHandler } from "../framework-executor";
import type { FrameworkContext, FrameworkHandlerResult } from "../framework-executor";

// ---------------------------------------------------------------------------
// Method Definitions
// ---------------------------------------------------------------------------

const METHOD_REGISTRY = [
  // CM-01 — Kubo Titling
  {
    id: "CM-01",
    name: "Kubo Titling",
    type: "NAMING" as const,
    description:
      "Structured brand-naming and titling method that moves from divergent brainstorming through strategic filtering, audience testing, and iterative refinement to produce culturally resonant names.",
    inputs: [
      "Brand doctrine & values",
      "Target audience profile",
      "Competitive naming landscape",
      "Linguistic & cultural constraints",
    ],
    process: [
      { step: 1, action: "Brainstorm — Generate 50+ candidate names using wordplay, portmanteau, metaphor, and cultural mining techniques", duration: "30-45 min" },
      { step: 2, action: "Filter — Score candidates against brand fit, memorability, phonetic quality, domain/trademark availability", duration: "20-30 min" },
      { step: 3, action: "Test — Validate top 5 candidates with target audience micro-surveys and cultural sensitivity checks", duration: "1-2 days" },
      { step: 4, action: "Refine — Polish the winning name with tagline pairing, visual lockup exploration, and legal pre-clearance", duration: "1-2 hours" },
    ],
    outputs: [
      "Final brand name with rationale",
      "Short-list of runner-up names",
      "Tagline pairings",
      "Phonetic & visual lockup notes",
    ],
    antiPatterns: [
      "Settling on the first 'good enough' name without testing alternatives",
      "Ignoring cultural or linguistic connotations in target markets",
      "Choosing names that are impossible to spell or pronounce from hearing alone",
    ],
    gloryToolsServed: ["naming-generator"],
  },

  // CM-02 — Nano Banana
  {
    id: "CM-02",
    name: "Nano Banana",
    type: "IDEATION" as const,
    description:
      "Rapid micro-content ideation method designed for social-first formats. Captures fleeting ideas, formats them for platform constraints, and publishes at velocity.",
    inputs: [
      "Brand voice guidelines",
      "Content calendar & themes",
      "Platform-specific constraints (character limits, aspect ratios)",
      "Trending topics & cultural moments",
    ],
    process: [
      { step: 1, action: "Capture — Rapid-fire ideation session: 20+ micro-content concepts in 10 minutes using prompt starters and cultural triggers", duration: "10-15 min" },
      { step: 2, action: "Format — Adapt top concepts to platform-native formats (reels, carousels, threads, stories) with copy and visual direction", duration: "15-20 min" },
      { step: 3, action: "Publish — Sequence content into posting calendar with captions, hashtags, and engagement hooks", duration: "10 min" },
    ],
    outputs: [
      "Batch of platform-ready micro-content briefs",
      "Caption and hashtag sets",
      "Posting sequence with timing recommendations",
    ],
    antiPatterns: [
      "Over-polishing micro-content to the point of losing authenticity and speed",
      "Ignoring platform-native conventions (e.g., using landscape video for TikTok)",
    ],
    gloryToolsServed: ["social-post-generator"],
  },

  // CM-03 — Pinterest Curation
  {
    id: "CM-03",
    name: "Pinterest Curation",
    type: "CURATION" as const,
    description:
      "Visual identity board creation method that collects diverse visual references, curates them into coherent aesthetic themes, and synthesizes actionable visual direction.",
    inputs: [
      "Brand visual identity guidelines",
      "Mood keywords & emotional targets",
      "Competitor visual benchmarks",
      "Target audience aesthetic preferences",
    ],
    process: [
      { step: 1, action: "Collect — Aggregate 80-120 visual references from diverse sources (photography, illustration, typography, architecture, nature)", duration: "30-45 min" },
      { step: 2, action: "Curate — Cluster references into 3-5 thematic boards, eliminate outliers, and annotate key visual patterns", duration: "20-30 min" },
      { step: 3, action: "Synthesize — Extract a unified visual direction document with colour palette, texture language, composition rules, and typography pairings", duration: "15-20 min" },
    ],
    outputs: [
      "Curated moodboard with thematic clusters",
      "Visual direction summary (palette, textures, typography)",
      "Do / Don't visual reference sheet",
    ],
    antiPatterns: [
      "Creating visually beautiful boards that have no strategic connection to brand positioning",
      "Relying exclusively on trendy aesthetics that will age within a single season",
      "Collecting references only from direct competitors, resulting in derivative visual identity",
    ],
    gloryToolsServed: ["moodboard-generator"],
  },

  // CM-04 — DA Diagnostic
  {
    id: "CM-04",
    name: "DA Diagnostic",
    type: "DIAGNOSTIC" as const,
    description:
      "Comprehensive brand audit methodology that evaluates brand health across multiple dimensions, scores performance, and produces prioritised recommendations.",
    inputs: [
      "Existing brand assets & guidelines",
      "Market positioning data",
      "Customer perception surveys or reviews",
      "Competitive benchmark data",
      "Internal stakeholder interviews",
    ],
    process: [
      { step: 1, action: "Audit — Inventory all brand touch-points and assets; map current versus intended usage", duration: "2-3 hours" },
      { step: 2, action: "Analyze — Evaluate consistency, differentiation, relevance, and resonance across each touch-point", duration: "1-2 hours" },
      { step: 3, action: "Score — Assign quantitative scores (0-100) per dimension: Visual Consistency, Message Clarity, Audience Alignment, Competitive Differentiation, Emotional Resonance", duration: "30-45 min" },
      { step: 4, action: "Report — Compile findings into a structured diagnostic report with visualisations and benchmarks", duration: "1-2 hours" },
      { step: 5, action: "Recommend — Prioritise remediation actions by impact and effort; map to ARTEMIS framework layers", duration: "30-45 min" },
    ],
    outputs: [
      "Brand health scorecard (5 dimensions)",
      "Detailed diagnostic report with evidence",
      "Prioritised recommendation roadmap",
      "Quick-win action list",
    ],
    antiPatterns: [
      "Auditing only digital touch-points while ignoring physical and interpersonal brand moments",
      "Producing a lengthy report with no clear prioritisation, leaving stakeholders paralysed",
    ],
    gloryToolsServed: ["brand-audit"],
  },
];

// ---------------------------------------------------------------------------
// Method → Tool Mappings
// ---------------------------------------------------------------------------

const METHOD_TOOL_MAPPINGS = [
  {
    methodId: "CM-01",
    toolId: "naming-generator",
    relationship: "FEEDS" as const,
    description: "Kubo Titling method feeds structured naming candidates into the naming-generator GLORY tool",
  },
  {
    methodId: "CM-02",
    toolId: "social-post-generator",
    relationship: "FEEDS" as const,
    description: "Nano Banana ideation output feeds micro-content briefs into the social-post-generator GLORY tool",
  },
  {
    methodId: "CM-03",
    toolId: "moodboard-generator",
    relationship: "ENRICHES" as const,
    description: "Pinterest Curation visual direction enriches the moodboard-generator GLORY tool with curated references",
  },
  {
    methodId: "CM-04",
    toolId: "brand-audit",
    relationship: "VALIDATES" as const,
    description: "DA Diagnostic scores and recommendations validate and calibrate the brand-audit GLORY tool output",
  },
];

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

async function execute(_ctx: FrameworkContext): Promise<FrameworkHandlerResult> {
  try {
    // Pure compute — return the static registries
    const methodRegistry = METHOD_REGISTRY.map((m) => ({
      id: m.id,
      name: m.name,
      type: m.type,
      description: m.description,
      inputs: m.inputs,
      process: m.process,
      outputs: m.outputs,
      antiPatterns: m.antiPatterns,
      gloryToolsServed: m.gloryToolsServed,
    }));

    const methodToolMapping = METHOD_TOOL_MAPPINGS.map((mt) => ({
      methodId: mt.methodId,
      toolId: mt.toolId,
      relationship: mt.relationship,
      description: mt.description,
    }));

    return {
      success: true,
      data: {
        methodRegistry,
        methodToolMapping,
      },
    };
  } catch (error) {
    return {
      success: false,
      data: {},
      error: error instanceof Error ? error.message : "FW-22 execution error",
    };
  }
}

registerFrameworkHandler("FW-22", execute);
