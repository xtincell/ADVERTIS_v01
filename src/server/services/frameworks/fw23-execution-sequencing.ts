// =============================================================================
// FW-23 — Execution Sequencing Engine Handler
// =============================================================================
// Hybrid module that selects the optimal execution template based on node type,
// then generates timeline entries, go/no-go gates, and resource allocation.
// Inputs: I.strategicRoadmap, nodeType (from ctx)
// Outputs: ES.activeSequence, ES.timeline, ES.goNoGoGates, ES.resourceAllocation
// Category: hybrid (template selection + compute)
// =============================================================================

import { registerFrameworkHandler } from "../framework-executor";
import type { FrameworkContext, FrameworkHandlerResult } from "../framework-executor";

// ---------------------------------------------------------------------------
// Types (local, matching the Zod schemas)
// ---------------------------------------------------------------------------

interface SequencePhase {
  id: string;
  name: string;
  order: number;
  durationDays: number;
  description: string;
  deliverables: string[];
  budgetPercent: number;
  dependencies: string[];
}

interface SequenceTemplate {
  id: string;
  name: string;
  type: "GTM_LAUNCH" | "ANNUAL_PLANNING" | "EVENT_PRODUCTION" | "RETROPLANNING" | "EDITORIAL_CALENDAR";
  description: string;
  totalDurationDays: number;
  phases: SequencePhase[];
  suitableFor: string[];
}

interface GoNoGoGate {
  id: string;
  name: string;
  afterPhaseId: string;
  criteria: { criterion: string; threshold: string; weight: number }[];
  minimumScore: number;
}

// ---------------------------------------------------------------------------
// Hardcoded Sequence Templates
// ---------------------------------------------------------------------------

const SEQUENCE_TEMPLATES: SequenceTemplate[] = [
  // SEQ-01 — GTM Launch (180 days)
  {
    id: "SEQ-01",
    name: "GTM Launch",
    type: "GTM_LAUNCH",
    description: "Go-to-market launch sequence covering discovery through post-launch analysis.",
    totalDurationDays: 180,
    phases: [
      {
        id: "SEQ-01-P1",
        name: "Discovery",
        order: 1,
        durationDays: 30,
        description: "Market research, audience validation, and competitive analysis.",
        deliverables: ["Market analysis report", "Audience personas", "Competitive landscape map"],
        budgetPercent: 15,
        dependencies: [],
      },
      {
        id: "SEQ-01-P2",
        name: "Build",
        order: 2,
        durationDays: 45,
        description: "Product finalization, content creation, and channel setup.",
        deliverables: ["Product MVP", "Content library", "Channel configuration"],
        budgetPercent: 25,
        dependencies: ["SEQ-01-P1"],
      },
      {
        id: "SEQ-01-P3",
        name: "Pre-Launch",
        order: 3,
        durationDays: 30,
        description: "Beta testing, influencer seeding, and PR preparation.",
        deliverables: ["Beta test report", "Influencer kit", "Press release package"],
        budgetPercent: 20,
        dependencies: ["SEQ-01-P2"],
      },
      {
        id: "SEQ-01-P4",
        name: "Launch",
        order: 4,
        durationDays: 15,
        description: "Official launch execution across all channels.",
        deliverables: ["Launch event", "Campaign activation", "Media coverage report"],
        budgetPercent: 25,
        dependencies: ["SEQ-01-P3"],
      },
      {
        id: "SEQ-01-P5",
        name: "Post-Launch",
        order: 5,
        durationDays: 60,
        description: "Performance monitoring, optimization, and retrospective.",
        deliverables: ["Performance dashboard", "Optimization roadmap", "Retrospective document"],
        budgetPercent: 15,
        dependencies: ["SEQ-01-P4"],
      },
    ],
    suitableFor: ["PRODUCT", "SERVICE", "BRAND"],
  },

  // SEQ-02 — Annual Planning (365 days)
  {
    id: "SEQ-02",
    name: "Annual Planning",
    type: "ANNUAL_PLANNING",
    description: "Year-long strategic planning cycle with quarterly milestones.",
    totalDurationDays: 365,
    phases: [
      {
        id: "SEQ-02-P1",
        name: "Q1 Foundation",
        order: 1,
        durationDays: 90,
        description: "Strategy definition, team alignment, and infrastructure setup.",
        deliverables: ["Annual strategy document", "Team OKRs", "Budget allocation plan"],
        budgetPercent: 25,
        dependencies: [],
      },
      {
        id: "SEQ-02-P2",
        name: "Q2 Growth",
        order: 2,
        durationDays: 90,
        description: "Campaign execution, market expansion, and community building.",
        deliverables: ["Campaign performance report", "Market expansion plan", "Community growth metrics"],
        budgetPercent: 30,
        dependencies: ["SEQ-02-P1"],
      },
      {
        id: "SEQ-02-P3",
        name: "Q3 Optimization",
        order: 3,
        durationDays: 90,
        description: "Performance optimization, A/B testing, and resource reallocation.",
        deliverables: ["Optimization report", "A/B test results", "Resource reallocation plan"],
        budgetPercent: 25,
        dependencies: ["SEQ-02-P2"],
      },
      {
        id: "SEQ-02-P4",
        name: "Q4 Review",
        order: 4,
        durationDays: 95,
        description: "Annual review, learnings documentation, and next-year planning.",
        deliverables: ["Annual review report", "Learnings compendium", "Next-year strategy draft"],
        budgetPercent: 20,
        dependencies: ["SEQ-02-P3"],
      },
    ],
    suitableFor: ["BRAND", "ORGANIZATION"],
  },

  // SEQ-03 — Event Production (210 days: J-180 to J+30)
  {
    id: "SEQ-03",
    name: "Event Production",
    type: "EVENT_PRODUCTION",
    description: "End-to-end event production from concept to post-event debrief (J-180 to J+30).",
    totalDurationDays: 210,
    phases: [
      {
        id: "SEQ-03-P1",
        name: "Concept",
        order: 1,
        durationDays: 45,
        description: "Event concept definition, venue scouting, and initial budgeting.",
        deliverables: ["Event concept brief", "Venue shortlist", "Preliminary budget"],
        budgetPercent: 10,
        dependencies: [],
      },
      {
        id: "SEQ-03-P2",
        name: "Pre-Production",
        order: 2,
        durationDays: 60,
        description: "Vendor contracting, logistics planning, and marketing launch.",
        deliverables: ["Vendor contracts", "Logistics plan", "Marketing campaign launch"],
        budgetPercent: 25,
        dependencies: ["SEQ-03-P1"],
      },
      {
        id: "SEQ-03-P3",
        name: "Production",
        order: 3,
        durationDays: 45,
        description: "Build-out, rehearsals, and final preparations.",
        deliverables: ["Production schedule", "Rehearsal report", "Final run-of-show"],
        budgetPercent: 30,
        dependencies: ["SEQ-03-P2"],
      },
      {
        id: "SEQ-03-P4",
        name: "Execution",
        order: 4,
        durationDays: 30,
        description: "Event execution including setup, live event, and teardown.",
        deliverables: ["Event execution report", "Live metrics dashboard", "Attendee feedback"],
        budgetPercent: 25,
        dependencies: ["SEQ-03-P3"],
      },
      {
        id: "SEQ-03-P5",
        name: "Debrief",
        order: 5,
        durationDays: 30,
        description: "Post-event analysis, ROI calculation, and stakeholder reporting.",
        deliverables: ["Debrief report", "ROI analysis", "Stakeholder presentation"],
        budgetPercent: 10,
        dependencies: ["SEQ-03-P4"],
      },
    ],
    suitableFor: ["EVENT", "FESTIVAL", "CONFERENCE"],
  },

  // SEQ-04 — Retroplanning (90 days)
  {
    id: "SEQ-04",
    name: "Retroplanning",
    type: "RETROPLANNING",
    description: "Reverse-engineered planning sequence working backwards from a deadline.",
    totalDurationDays: 90,
    phases: [
      {
        id: "SEQ-04-P1",
        name: "Planning",
        order: 1,
        durationDays: 20,
        description: "Backward scheduling, milestone definition, and resource mapping.",
        deliverables: ["Retroplanning Gantt", "Milestone map", "Resource allocation sheet"],
        budgetPercent: 20,
        dependencies: [],
      },
      {
        id: "SEQ-04-P2",
        name: "Execution",
        order: 2,
        durationDays: 55,
        description: "Sprint-based execution following the retroplanning schedule.",
        deliverables: ["Sprint deliverables", "Progress reports", "Risk mitigation log"],
        budgetPercent: 60,
        dependencies: ["SEQ-04-P1"],
      },
      {
        id: "SEQ-04-P3",
        name: "Review",
        order: 3,
        durationDays: 15,
        description: "Final quality check, delivery validation, and lessons learned.",
        deliverables: ["Quality assurance report", "Delivery sign-off", "Lessons learned document"],
        budgetPercent: 20,
        dependencies: ["SEQ-04-P2"],
      },
    ],
    suitableFor: ["CAMPAIGN", "PROJECT", "DELIVERABLE"],
  },

  // SEQ-05 — Editorial Calendar (90 days)
  {
    id: "SEQ-05",
    name: "Editorial Calendar",
    type: "EDITORIAL_CALENDAR",
    description: "Content planning and distribution cycle for editorial operations.",
    totalDurationDays: 90,
    phases: [
      {
        id: "SEQ-05-P1",
        name: "Strategy",
        order: 1,
        durationDays: 20,
        description: "Content strategy, topic research, and editorial calendar creation.",
        deliverables: ["Content strategy brief", "Topic backlog", "Editorial calendar"],
        budgetPercent: 25,
        dependencies: [],
      },
      {
        id: "SEQ-05-P2",
        name: "Production",
        order: 2,
        durationDays: 45,
        description: "Content creation, review cycles, and asset preparation.",
        deliverables: ["Content pieces", "Visual assets", "Review sign-offs"],
        budgetPercent: 50,
        dependencies: ["SEQ-05-P1"],
      },
      {
        id: "SEQ-05-P3",
        name: "Distribution",
        order: 3,
        durationDays: 25,
        description: "Content publishing, promotion, and performance tracking.",
        deliverables: ["Publishing schedule", "Promotion plan", "Performance report"],
        budgetPercent: 25,
        dependencies: ["SEQ-05-P2"],
      },
    ],
    suitableFor: ["CONTENT", "MEDIA", "BRAND"],
  },
];

// ---------------------------------------------------------------------------
// Hardcoded Go/No-Go Gates per Template
// ---------------------------------------------------------------------------

const GATES_BY_TEMPLATE: Record<string, GoNoGoGate[]> = {
  "SEQ-01": [
    {
      id: "GATE-01-1",
      name: "Discovery Validation",
      afterPhaseId: "SEQ-01-P1",
      criteria: [
        { criterion: "Market size validated", threshold: ">= TAM threshold", weight: 0.4 },
        { criterion: "Target audience confirmed", threshold: ">= 3 validated personas", weight: 0.3 },
        { criterion: "Competitive positioning clear", threshold: "Differentiation score >= 7/10", weight: 0.3 },
      ],
      minimumScore: 70,
    },
    {
      id: "GATE-01-2",
      name: "Build Readiness",
      afterPhaseId: "SEQ-01-P3",
      criteria: [
        { criterion: "Product ready for launch", threshold: "All critical features complete", weight: 0.4 },
        { criterion: "Content library complete", threshold: ">= 80% of planned assets", weight: 0.3 },
        { criterion: "Beta feedback positive", threshold: "NPS >= 30", weight: 0.3 },
      ],
      minimumScore: 75,
    },
    {
      id: "GATE-01-3",
      name: "Post-Launch Assessment",
      afterPhaseId: "SEQ-01-P4",
      criteria: [
        { criterion: "Launch KPIs met", threshold: ">= 70% of targets", weight: 0.5 },
        { criterion: "No critical issues", threshold: "Zero P0 bugs", weight: 0.3 },
        { criterion: "Media coverage achieved", threshold: ">= 5 earned media placements", weight: 0.2 },
      ],
      minimumScore: 65,
    },
  ],

  "SEQ-02": [
    {
      id: "GATE-02-1",
      name: "Q1 Strategy Sign-Off",
      afterPhaseId: "SEQ-02-P1",
      criteria: [
        { criterion: "Strategy approved by leadership", threshold: "Sign-off received", weight: 0.5 },
        { criterion: "Budget allocated", threshold: "100% budget confirmed", weight: 0.3 },
        { criterion: "Team OKRs set", threshold: "All teams have OKRs", weight: 0.2 },
      ],
      minimumScore: 80,
    },
    {
      id: "GATE-02-2",
      name: "Q2 Growth Check",
      afterPhaseId: "SEQ-02-P2",
      criteria: [
        { criterion: "Growth targets on track", threshold: ">= 60% of H1 targets", weight: 0.4 },
        { criterion: "Community growth healthy", threshold: ">= 20% QoQ growth", weight: 0.3 },
        { criterion: "Budget burn rate acceptable", threshold: "<= 55% of annual budget", weight: 0.3 },
      ],
      minimumScore: 65,
    },
    {
      id: "GATE-02-3",
      name: "Q3 Optimization Review",
      afterPhaseId: "SEQ-02-P3",
      criteria: [
        { criterion: "Optimization gains measured", threshold: ">= 15% efficiency improvement", weight: 0.4 },
        { criterion: "Year-end targets achievable", threshold: ">= 75% confidence", weight: 0.4 },
        { criterion: "Team health check", threshold: "eNPS >= 20", weight: 0.2 },
      ],
      minimumScore: 70,
    },
    {
      id: "GATE-02-4",
      name: "Annual Review Gate",
      afterPhaseId: "SEQ-02-P4",
      criteria: [
        { criterion: "Annual targets achieved", threshold: ">= 80% of OKRs met", weight: 0.5 },
        { criterion: "Learnings documented", threshold: "All key learnings captured", weight: 0.25 },
        { criterion: "Next-year plan drafted", threshold: "Draft strategy ready", weight: 0.25 },
      ],
      minimumScore: 70,
    },
  ],

  "SEQ-03": [
    {
      id: "GATE-03-1",
      name: "Concept Approval",
      afterPhaseId: "SEQ-03-P1",
      criteria: [
        { criterion: "Concept validated by stakeholders", threshold: "Stakeholder sign-off", weight: 0.4 },
        { criterion: "Venue secured", threshold: "Contract signed", weight: 0.35 },
        { criterion: "Budget feasible", threshold: "<= 110% of target budget", weight: 0.25 },
      ],
      minimumScore: 75,
    },
    {
      id: "GATE-03-2",
      name: "Production Go",
      afterPhaseId: "SEQ-03-P2",
      criteria: [
        { criterion: "All vendors contracted", threshold: "100% vendors confirmed", weight: 0.35 },
        { criterion: "Ticket sales on track", threshold: ">= 40% presale target", weight: 0.35 },
        { criterion: "Logistics plan approved", threshold: "Logistics plan signed off", weight: 0.3 },
      ],
      minimumScore: 70,
    },
    {
      id: "GATE-03-3",
      name: "Execution Readiness",
      afterPhaseId: "SEQ-03-P3",
      criteria: [
        { criterion: "Rehearsal successful", threshold: "All run-throughs completed", weight: 0.4 },
        { criterion: "Safety compliance verified", threshold: "All permits obtained", weight: 0.35 },
        { criterion: "Contingency plans ready", threshold: "Risk matrix completed", weight: 0.25 },
      ],
      minimumScore: 80,
    },
  ],

  "SEQ-04": [
    {
      id: "GATE-04-1",
      name: "Planning Complete",
      afterPhaseId: "SEQ-04-P1",
      criteria: [
        { criterion: "Retroplanning validated", threshold: "All milestones confirmed", weight: 0.5 },
        { criterion: "Resources allocated", threshold: "100% team assigned", weight: 0.3 },
        { criterion: "Risks identified", threshold: "Risk register complete", weight: 0.2 },
      ],
      minimumScore: 75,
    },
    {
      id: "GATE-04-2",
      name: "Execution Sign-Off",
      afterPhaseId: "SEQ-04-P2",
      criteria: [
        { criterion: "All deliverables complete", threshold: ">= 95% completion", weight: 0.5 },
        { criterion: "Quality standards met", threshold: "QA pass rate >= 90%", weight: 0.3 },
        { criterion: "On schedule", threshold: "<= 3 days variance", weight: 0.2 },
      ],
      minimumScore: 80,
    },
  ],

  "SEQ-05": [
    {
      id: "GATE-05-1",
      name: "Strategy Approval",
      afterPhaseId: "SEQ-05-P1",
      criteria: [
        { criterion: "Content strategy approved", threshold: "Stakeholder sign-off", weight: 0.4 },
        { criterion: "Editorial calendar complete", threshold: "90-day calendar filled", weight: 0.35 },
        { criterion: "Topic backlog populated", threshold: ">= 30 topics", weight: 0.25 },
      ],
      minimumScore: 70,
    },
    {
      id: "GATE-05-2",
      name: "Production Quality Gate",
      afterPhaseId: "SEQ-05-P2",
      criteria: [
        { criterion: "Content produced", threshold: ">= 80% of planned pieces", weight: 0.4 },
        { criterion: "Quality review passed", threshold: "All pieces reviewed", weight: 0.35 },
        { criterion: "Assets ready", threshold: "All visual assets prepared", weight: 0.25 },
      ],
      minimumScore: 75,
    },
  ],
};

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

async function execute(ctx: FrameworkContext): Promise<FrameworkHandlerResult> {
  try {
    // Resolve inputs
    const _strategicRoadmap = ctx.inputs["I.strategicRoadmap"] as Record<string, unknown> | null;

    // Select the best template based on node type
    const template = selectTemplate(ctx.nodeType);
    const gates = GATES_BY_TEMPLATE[template.id] ?? [];

    // Generate timeline entries from the selected template
    const timeline = buildTimeline(template);

    // Generate resource allocation from the selected template
    const resourceAllocation = buildResourceAllocation(template);

    return {
      success: true,
      data: {
        activeSequence: template,
        timeline,
        goNoGoGates: gates,
        resourceAllocation,
      },
    };
  } catch (error) {
    return {
      success: false,
      data: {},
      error: error instanceof Error ? error.message : "FW-23 execution error",
    };
  }
}

registerFrameworkHandler("FW-23", execute);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function selectTemplate(nodeType: string): SequenceTemplate {
  switch (nodeType) {
    case "EVENT":
      return SEQUENCE_TEMPLATES.find((t) => t.id === "SEQ-03")!;
    case "PRODUCT":
      return SEQUENCE_TEMPLATES.find((t) => t.id === "SEQ-01")!;
    default:
      return SEQUENCE_TEMPLATES.find((t) => t.id === "SEQ-01")!;
  }
}

function buildTimeline(
  template: SequenceTemplate,
): {
  id: string;
  phaseId: string;
  name: string;
  startDay: number;
  endDay: number;
  status: "PENDING" | "ACTIVE" | "COMPLETED" | "BLOCKED";
}[] {
  let currentDay = 0;
  return template.phases.map((phase, idx) => {
    const startDay = currentDay;
    const endDay = currentDay + phase.durationDays;
    currentDay = endDay;
    return {
      id: `TL-${template.id}-${idx + 1}`,
      phaseId: phase.id,
      name: phase.name,
      startDay,
      endDay,
      status: idx === 0 ? ("ACTIVE" as const) : ("PENDING" as const),
    };
  });
}

function buildResourceAllocation(
  template: SequenceTemplate,
): {
  phaseId: string;
  phaseName: string;
  budgetPercent: number;
  teamSize: number;
  keyRoles: string[];
}[] {
  return template.phases.map((phase) => ({
    phaseId: phase.id,
    phaseName: phase.name,
    budgetPercent: phase.budgetPercent,
    teamSize: deriveTeamSize(phase.budgetPercent),
    keyRoles: deriveKeyRoles(phase.name, template.type),
  }));
}

function deriveTeamSize(budgetPercent: number): number {
  if (budgetPercent >= 30) return 8;
  if (budgetPercent >= 25) return 6;
  if (budgetPercent >= 20) return 5;
  if (budgetPercent >= 15) return 4;
  return 3;
}

function deriveKeyRoles(phaseName: string, templateType: string): string[] {
  const baseRoles: Record<string, string[]> = {
    Discovery: ["Strategy Lead", "Market Analyst", "UX Researcher"],
    Build: ["Project Manager", "Creative Director", "Developer", "Content Lead"],
    "Pre-Launch": ["Marketing Manager", "PR Lead", "Community Manager"],
    Launch: ["Campaign Manager", "Performance Analyst", "Social Media Lead"],
    "Post-Launch": ["Data Analyst", "Optimization Lead", "Customer Success"],
    "Q1 Foundation": ["Strategy Director", "Finance Lead", "HR Partner"],
    "Q2 Growth": ["Growth Lead", "Campaign Manager", "Community Lead"],
    "Q3 Optimization": ["Data Analyst", "Performance Lead", "A/B Test Specialist"],
    "Q4 Review": ["Strategy Director", "Finance Lead", "Department Heads"],
    Concept: ["Event Director", "Creative Lead", "Budget Controller"],
    "Pre-Production": ["Production Manager", "Vendor Coordinator", "Marketing Lead"],
    Production: ["Technical Director", "Stage Manager", "Safety Officer"],
    Execution: ["Event Manager", "Operations Lead", "Live Director"],
    Debrief: ["Analyst", "Event Director", "Stakeholder Relations"],
    Planning: ["Project Manager", "Planner", "Resource Manager"],
    Review: ["QA Lead", "Project Manager", "Stakeholder"],
    Strategy: ["Content Strategist", "SEO Specialist", "Editorial Director"],
    Distribution: ["Distribution Manager", "Social Media Lead", "Analytics Lead"],
  };

  const roles = baseRoles[phaseName];
  if (roles) return roles;

  // Fallback by template type
  if (templateType === "EVENT_PRODUCTION") return ["Event Coordinator", "Production Assistant"];
  if (templateType === "EDITORIAL_CALENDAR") return ["Content Manager", "Editor"];
  return ["Project Lead", "Team Member"];
}
