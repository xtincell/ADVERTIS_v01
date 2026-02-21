// =============================================================================
// INFRA I.1 — tRPC Root Router
// =============================================================================
// Merges all sub-routers into the single appRouter. Central API surface.
//
// Merged routers:
//   auth          — T.0  Authentication
//   strategy      — T.1  Strategy CRUD + phase management
//   pillar        — T.2  Pillar content + version history
//   marketContext — T.3  Competitors, opportunities, budget tiers
//   cockpit       — T.4  Cockpit data + sharing
//   widget        — T.5  Widget computation
//   module        — T.6  Pluggable module execution
//   signal        — T.7  Strategic signals
//   decision      — T.8  Decision logging
//   document      — T.9  Brief document management
//   translation   — T.10 Brief translation operations
//   mission       — T.11 Operational mission management
//   intervention  — T.12 Freelance interventions
//   marketPricing — T.13 Pricing models + AI cost dashboard
//   integration   — T.14 Third-party integrations
//   analytics     — T.15 Dashboard analytics + scores
//   marketStudy   — T.16 Market study lifecycle
//
// Exports:
//   appRouter    — Combined tRPC router
//   AppRouter    — TypeScript type for the router (used by client)
//   createCaller — Server-side caller factory
//
// Dependencies:
//   ~/server/api/trpc     — createTRPCRouter, createCallerFactory
//   ~/server/api/routers/* — All sub-router imports
// =============================================================================

import { authRouter } from "~/server/api/routers/auth";
import { strategyRouter } from "~/server/api/routers/strategy";
import { pillarRouter } from "~/server/api/routers/pillar";
import { analyticsRouter } from "~/server/api/routers/analytics";
import { documentRouter } from "~/server/api/routers/document";
import { cockpitRouter } from "~/server/api/routers/cockpit";
import { marketStudyRouter } from "~/server/api/routers/market-study";
import { moduleRouter } from "~/server/api/routers/module";
import { widgetRouter } from "~/server/api/routers/widget";
import { integrationRouter } from "~/server/api/routers/integration";
import { signalRouter } from "~/server/api/routers/signal";
import { decisionRouter } from "~/server/api/routers/decision";
import { marketContextRouter } from "~/server/api/routers/market-context";
import { translationRouter } from "~/server/api/routers/translation";
import { missionRouter } from "~/server/api/routers/mission";
import { marketPricingRouter } from "~/server/api/routers/market-pricing-router";
import { interventionRouter } from "~/server/api/routers/intervention";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  strategy: strategyRouter,
  pillar: pillarRouter,
  analytics: analyticsRouter,
  document: documentRouter,
  cockpit: cockpitRouter,
  marketStudy: marketStudyRouter,
  module: moduleRouter,
  widget: widgetRouter,
  integration: integrationRouter,
  signal: signalRouter,
  decision: decisionRouter,
  marketContext: marketContextRouter,
  translation: translationRouter,
  mission: missionRouter,
  marketPricing: marketPricingRouter,
  intervention: interventionRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.auth.getProfile();
 *       ^? User
 */
export const createCaller = createCallerFactory(appRouter);
