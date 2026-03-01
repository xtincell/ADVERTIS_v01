---
stepsCompleted: ["step-01-validate-prerequisites", "step-02-design-epics"]
inputDocuments:
  - "/workspaces/ADVERT_01/_bmad-output/planning-artifacts/prd.md"
  - "/workspaces/ADVERT_01/_bmad-output/planning-artifacts/architecture.md"
  - "/workspaces/ADVERT_01/_bmad-output/planning-artifacts/ux-design-specification.md"
lastCompletedStep: "step-02-design-epics"
---

# ADVERT_01 - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for ADVERT_01, decomposing the requirements from the PRD, UX Design, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

**User Management & Authentication:**
- **FR1:** Users can create an account using email and password
- **FR2:** Users can log in to their account with email and password
- **FR3:** Users can reset their password via email link
- **FR4:** Users can update their profile information (name, company, email)
- **FR5:** Users can enable two-factor authentication (2FA) via email or SMS (Optional - Growth Phase)
- **FR6:** Agency Owners can invite team members to join their tenant (Growth Phase)
- **FR7:** Agency Owners can assign roles to team members (Agency Owner, Consultant, Brand Client, Developer) (Growth Phase)
- **FR8:** Agency Owners can modify or revoke user permissions (Growth Phase)
- **FR9:** Agency Owners can view audit logs of user activities (login, edits, deletions) (Growth Phase)
- **FR10:** Agency Owners can remove team members from their tenant (Growth Phase)

**Strategy Creation & AI Generation:**
- **FR11:** Users can create a new brand strategy project
- **FR12:** Users can input client interview data using structured frameworks (Ikigai, Schwartz Values, Hero's Journey, AARRR)
- **FR13:** Users can select a sector template (Fashion, Fintech, FMCG, B2B SaaS) to pre-fill relevant variables (Growth Phase)
- **FR14:** Users can choose between Wizard Mode (step-by-step questionnaire) or AI Co-Pilot Mode (high-level input)
- **FR15:** Users can trigger AI generation of 6-pillar strategy (Authenticité, Distinction, Valeur, Engagement, Risk, Track)
- **FR16:** System generates context-adaptive meta-variables based on sector, company profile, and goals
- **FR17:** Users can view real-time generation progress (pillar-by-pillar status)
- **FR18:** Users receive notification when strategy generation is complete
- **FR19:** System generates strategies in under 10 minutes with 80%+ usable content quality
- **FR20:** Users can access interview framework template worksheets (PDF/in-app guides)

**Strategy Management & Editing:**
- **FR21:** Users can view a dashboard of all their strategies
- **FR22:** Users can view individual strategy with 6 pillars displayed in collapsible sections
- **FR23:** Users can expand or collapse specific pillar sections for focused viewing
- **FR24:** Users can edit strategy content (text, variables, insights)
- **FR25:** Users can save changes to strategies
- **FR26:** Users can load previously saved strategies
- **FR27:** Users can archive strategies to free up active slots (Starter tier: 3 active strategies limit)
- **FR28:** Users can delete strategies permanently
- **FR29:** Users can duplicate an existing strategy to use as a template
- **FR30:** Users can view version history of a strategy showing all edits (Growth Phase)
- **FR31:** Users can restore a previous version of a strategy (90-day rollback for Professional tier) (Growth Phase)

**Team Collaboration & Permissions:**
- **FR32:** Agency Owners can add Consultants who can create and edit strategies (Growth Phase)
- **FR33:** Consultants can create and edit strategies they are assigned to (Growth Phase)
- **FR34:** Agency Owners can invite Brand Clients with view-only access to specific strategies (Growth Phase)
- **FR35:** Brand Clients can view assigned strategies but cannot edit them (Growth Phase)
- **FR36:** Agency Owners can assign specific strategies to specific team members (Growth Phase)
- **FR37:** Team members can view an activity feed showing who edited what and when (Growth Phase)
- **FR38:** Team members can add comments to specific pillars with threaded discussions (Growth Phase)
- **FR39:** Team members can mention other team members in comments using @mentions (Growth Phase)
- **FR40:** Users receive notifications for strategy updates, comments, and mentions relevant to them (Growth Phase)

**Export & Deliverables:**
- **FR41:** Users can export strategies as branded PDF documents
- **FR42:** Users can export strategies as Excel spreadsheets
- **FR43:** Users can export strategies as PowerPoint presentations (Growth Phase)
- **FR44:** Users can apply custom branded templates to exports (logo, colors, fonts) (Growth Phase)
- **FR45:** Users can customize export format by selecting specific pillars to include
- **FR46:** Users can download export files to their device
- **FR47:** Users can email exports directly to clients from the platform (Optional)

**Analytics & Insights:**
- **FR48:** Users can view Campaign Coherence Score calculated from pillar completeness and quality
- **FR49:** Users can view pillar completion status (e.g., 6/6 complete, 4/6 in progress)
- **FR50:** Users can view strategy count (total strategies created)
- **FR51:** Users can manually input superfan count for client brands (MVP)
- **FR52:** Users can track superfan growth over time with trend graphs (Growth Phase)
- **FR53:** Users can view sector-specific benchmarks (e.g., "Your coherence score 81 vs fintech average 67") (Growth Phase)
- **FR54:** Users can compare their metrics to anonymized sector averages (Growth Phase)
- **FR55:** Users can view pattern recognition insights (e.g., "Brands with ritual X see 2.8x superfan growth") (Growth Phase)
- **FR56:** Users can view predictive recommendations based on historical data (Growth Phase)
- **FR57:** Users can generate automated monthly traction reports (Growth Phase)
- **FR58:** Users can view Financial Clarity Dashboard showing budget allocation and ROI projections (Growth Phase)
- **FR59:** Users can calculate unit economics using CODB (Cost of Doing Business) calculator (Growth Phase)
- **FR60:** Users can view historical tracking of metrics over 3/6/12-month periods (Growth Phase)

**Creative Concierge Marketplace:**
- **FR61:** Creative talents can create profiles with portfolio, skills, rates, and availability (Growth Phase)
- **FR62:** Brands can browse available creative talents filtered by skill, sector, location, and rate (Growth Phase)
- **FR63:** Brands can search for specific talent types using keywords (Growth Phase)
- **FR64:** Brands can view detailed talent portfolios including previous work samples (Growth Phase)
- **FR65:** Brands can request project quotes from selected talents (Growth Phase)
- **FR66:** System provides AI-assisted brand-talent matching based on ADVERT pillar data and requirements (Growth Phase)
- **FR67:** Brands can create structured project briefs using ADVERT pillar templates (Growth Phase)
- **FR68:** Brands and talents can manage project milestones and deliverables (Growth Phase)
- **FR69:** Talents can upload deliverables for brand review (Growth Phase)
- **FR70:** Brands can review and rate talents after project completion (Growth Phase)
- **FR71:** Talents can review and rate brand clients after project completion (mutual rating) (Growth Phase)
- **FR72:** System processes escrow payments with 75% to talent, 25% to platform commission (Growth Phase)
- **FR73:** System provides dispute resolution mediation for project disagreements (Growth Phase)
- **FR74:** Talents can withdraw earnings to their bank account or mobile money wallet (Growth Phase)

**Third-Party Integrations:**
- **FR75:** Users can connect their Zoho CRM account to sync contacts and strategies (Growth Phase)
- **FR76:** Users can sync ADVERT strategies to HubSpot as campaign plans (Growth Phase)
- **FR77:** Users can auto-create Monday.com boards from ADVERT strategy pillars and tasks (Growth Phase)
- **FR78:** Users can connect Asana projects to sync strategy milestones (Growth Phase)
- **FR79:** Developers can generate API keys for programmatic access (Enterprise Only - Growth Phase)
- **FR80:** Developers can access REST API endpoints to create, read, update strategies via API (Enterprise Only - Growth Phase)
- **FR81:** Developers can use SDK (npm for JavaScript, pip for Python) for integration development (Enterprise Only - Growth Phase)
- **FR82:** Developers can configure webhooks for real-time event notifications (strategy.generated, pillar.updated, etc.) (Enterprise Only - Growth Phase)
- **FR83:** Enterprise users can view API usage analytics and rate limit status (Enterprise Only - Growth Phase)
- **FR84:** Users can disconnect third-party integrations at any time (Growth Phase)

**Payment & Billing:**
- **FR85:** Users can subscribe to Starter tier (€99/month) with 3 active strategies limit
- **FR86:** Users can subscribe to Professional tier (€299/month) with unlimited strategies and 3 users included
- **FR87:** Users can request Enterprise tier custom quote via sales contact
- **FR88:** Users can pay via credit/debit card using Paystack or Flutterwave
- **FR89:** Users can pay via mobile money (MTN Mobile Money, Orange Money, M-Pesa, Wave)
- **FR90:** Enterprise users can pay via bank transfer with NET 30 terms (Enterprise Only)
- **FR91:** Users can choose annual pre-pay option to receive 20% discount
- **FR92:** Users can view billing history and download invoices
- **FR93:** Users can update payment method (switch cards, mobile money accounts)
- **FR94:** Users can upgrade subscription tier (Starter → Professional → Enterprise) with prorated billing
- **FR95:** Users can downgrade subscription tier (takes effect next billing cycle, no prorated refunds)
- **FR96:** Users can cancel subscription (access continues until end of billing period)
- **FR97:** System automatically retries failed payments 3 times over 10 days (dunning management)
- **FR98:** Users receive payment failure notifications and instructions to update payment method
- **FR99:** Professional tier users can add additional users for €49/month per user (Growth Phase)

**Compliance & Security:**
- **FR100:** Users must accept privacy policy and terms of service during account creation
- **FR101:** Users can request deletion of all their data (right to be forgotten - GDPR-equivalent)
- **FR102:** Users can export all their data in JSON format (data portability - GDPR-equivalent)
- **FR103:** Agency Owners can view audit logs showing all user actions with timestamps and IP addresses (Growth Phase)
- **FR104:** System encrypts all sensitive data at rest using AES-256 encryption
- **FR105:** System encrypts all data in transit using TLS 1.3 (HTTPS)
- **FR106:** Users receive email notifications within 72 hours of confirmed security breach
- **FR107:** Enterprise users can access SOC 2 Type I audit reports (Enterprise Only - Growth Phase)
- **FR108:** Enterprise users can access SOC 2 Type II audit reports (Enterprise Only - Vision Phase)
- **FR109:** Enterprise users can configure custom data retention policies (Enterprise Only - Growth Phase)
- **FR110:** System performs automated daily backups with 30-day retention
- **FR111:** System isolates tenant data using row-level security policies (Growth Phase - Multi-Tenant)
- **FR112:** Enterprise users can request dedicated infrastructure for data isolation (Enterprise Only - Vision Phase)

### Non-Functional Requirements

**Performance:**
- **NFR-P1:** Complete 6-pillar ADVERT strategy generation in less than 10 minutes (target: 8 min avg, 10 min max at 99th percentile)
- **NFR-P2:** Dashboard loads and becomes interactive in less than 3 seconds on 5+ Mbps connection (target: 2s avg, 3s max at 95th percentile)
- **NFR-P3:** Strategy view/edit actions respond in less than 500ms (target: 300ms avg, 500ms max at 95th percentile)
- **NFR-P4:** PDF/Excel exports generate in less than 30 seconds; PowerPoint in less than 60 seconds
- **NFR-P5:** REST API endpoints respond in less than 2 seconds for read operations (async generation in <10 min)
- **NFR-P6:** System supports 100 concurrent users (MVP), 500 (Growth), 2000 (Vision) without >10% performance degradation

**Security:**
- **NFR-S1:** All sensitive data encrypted using AES-256 with AWS KMS/GCP Cloud KMS, automatic key rotation every 90 days
- **NFR-S2:** All communications use TLS 1.3 (minimum TLS 1.2), SSL Labs A+ rating, no HTTP endpoints
- **NFR-S3:** Passwords hashed using bcrypt (work factor 12), JWT tokens with 24-hour expiry, account lockout after 5 failed attempts
- **NFR-S4:** Row-Level Security (RLS) enforces multi-tenant data isolation, annual penetration testing validates no cross-tenant leaks
- **NFR-S5:** PCI-DSS compliance via third-party processors (no card storage), cryptographic webhook validation
- **NFR-S6:** API authentication via OAuth 2.0, rate limiting (Professional: 1000 req/hour, Enterprise: custom), HMAC-SHA256 webhook signing
- **NFR-S7:** Security events logged with 90-day retention (Professional), 1-year (Enterprise), includes timestamp/user/IP/action
- **NFR-S8:** Security breach notification within 72 hours, incident response plan tested annually
- **NFR-S9:** SOC 2 Type I by Month 24 (Growth), SOC 2 Type II + ISO 27001 (Vision Phase)

**Scalability:**
- **NFR-SC1:** Architecture supports 10x user growth with <10% performance degradation (50→500→5000 users)
- **NFR-SC2:** Database supports 10,000+ tenants with RLS performance overhead <15%, tenant-scoped queries <500ms
- **NFR-SC3:** System handles 100 concurrent AI generations without queue delays >5 minutes, tier-based prioritization
- **NFR-SC4:** PostgreSQL handles 1M+ strategy records without >20% query degradation, 2-year archive to cold storage
- **NFR-SC5:** File storage supports 10TB+ with cost-efficient tiering (Hot 30 days, Warm 30-90 days, Cold 90+ days)
- **NFR-SC6:** Multi-region deployment for African markets (West, East, Southern), <200ms response within each region

**Reliability & Availability:**
- **NFR-R1:** 99%+ uptime (MVP - allows ~3.65 days/year downtime), 99.5%+ uptime (Growth - allows ~1.83 days/year)
- **NFR-R2:** Automated daily backups with 30-day retention, monthly restoration tests, RTO: 4 hours, RPO: 1 hour
- **NFR-R3:** Payment transaction success rate 85-90% with multi-modal fallback (Paystack→Flutterwave→mobile money), 3 retry attempts over 10 days
- **NFR-R4:** Graceful degradation for AI/export/payment failures with user-friendly error messages and retry mechanisms
- **NFR-R5:** All errors display user-friendly messages with context (what happened, why, what to do next)
- **NFR-R6:** APM monitoring (Datadog/New Relic) with alerts for uptime <99%, error rate >5%, response time >5s, payment failures >20%

**Integration Reliability:**
- **NFR-I1:** Core system maintains 99%+ availability independent of third-party integration failures, 3 retries with exponential backoff
- **NFR-I2:** REST API maintains 99.5%+ uptime for Enterprise tier, <2s response at 95th percentile, <1% error rate
- **NFR-I3:** Rate limiting with HTTP 429 + Retry-After header (Professional: 1000/hour, Enterprise: custom 10k+/hour)
- **NFR-I4:** CRM/PM integrations sync within 5 minutes, last-write-wins conflict resolution with user notification
- **NFR-I5:** API versioning (/api/v1/, /api/v2/), v1 maintained 12 months after v2 release, 6-month deprecation notice

**Accessibility:**
- **NFR-A1:** All core functionality accessible via keyboard only, logical tab order, documented shortcuts (Ctrl+S, Ctrl+E, Esc)
- **NFR-A2:** WCAG 2.1 Level A compliance for screen readers, semantic HTML, proper ARIA labels, alt text on images
- **NFR-A3:** WCAG 2.1 Level AA contrast ratios (4.5:1 normal text, 3:1 large text), no color-only information
- **NFR-A4:** Responsive design functional on desktop (1920×1080), laptop (1366×768), tablet (768×1024), no horizontal scrolling
- **NFR-A5:** French localization for Francophone markets (Growth Phase), English default (MVP), Portuguese (Vision Phase)

### Additional Requirements

**From Architecture Document:**

**Starter Template & Core Stack:**
- Use T3 Stack (create-t3-app) v7.40.0 as project foundation
- Next.js 15 with App Router (React Server Components, Server Actions)
- TypeScript 5.6+ with strict mode enabled
- tRPC v11 for type-safe APIs without codegen
- Prisma ORM for type-safe database queries
- NextAuth.js v5 for authentication
- Tailwind CSS v4 as utility-first CSS framework

**Infrastructure & Services:**
- PostgreSQL database via Neon (serverless, auto-scaling)
- Inngest for background jobs (PDF/PPT export, email sending, webhook delivery, audit logging, analytics pre-computation)
- Sentry for error tracking and performance monitoring (frontend + backend)
- Resend for email service with React Email templates
- Vercel Blob for file storage (exports, assets, portfolios)
- Deployment on Vercel with edge functions support

**UI Component Library:**
- shadcn/ui components built on Radix UI primitives
- Framer Motion for animations
- Lucide React for icons
- Tremor or Recharts for data visualizations

**Multi-Tenancy Architecture:**
- Row-Level Security (RLS) policies in PostgreSQL for tenant isolation
- Tenant identification via JWT claims
- Prisma middleware for automatic tenant filtering
- Separate tenant contexts per request

**AI Integration:**
- Vercel AI SDK (@ai-sdk/openai, @ai-sdk/anthropic)
- Streaming responses with typing indicators
- Context window optimization for long-form strategy generation
- Fallback strategies for API rate limits

**From UX Design Document:**

**Progressive Web App (PWA):**
- Desktop-first design optimized for 1920×1080 minimum resolution
- PWA installable with offline editing capabilities
- Service worker for caching and offline sync
- Automatic conflict resolution when reconnecting

**User Experience Requirements:**
- AI co-pilot must feel conversational, not robotic (tone: bienveillant stratège)
- Progressive disclosure of complexity (reveal sophistication gradually)
- <10 minutes target for complete strategy creation
- Micro-celebrations and subtle animations on pillar completion
- Real-time generation progress with pillar-by-pillar status
- Data storytelling in Financial Clarity Dashboard (narrative insights, not just charts)
- Keyboard shortcuts documented and accessible (Ctrl+S save, Ctrl+E export, Esc close)

**Touch & Mobile Optimizations:**
- Touch-friendly CTAs with 44×44px minimum touch targets
- Swipe gestures for pillar navigation
- Pinch-zoom on visualizations
- Mobile/tablet responsive design for reviews and presentations (not full creation)

**Export & Integration:**
- Export formats: PDF (pitch-ready with branding), PowerPoint (editable), Markdown (devs), JSON (API)
- Direct export to Google Drive, Dropbox, Notion, Slack
- CSS print stylesheets for professional printing
- One-click transformation of dashboard to pitch-ready slideshow

**Onboarding & First Experience:**
- Interactive tutorial creating real mini-strategy (not fake demo)
- Gamification subtle with visible progression
- Personalization based on industry/role
- "Magic moment" revealing surprising insight within first 3 minutes
- Sentiment target: "Je me sens comme une stratège de grande agence internationale"

### FR Coverage Map

**Epic 1: Project Foundation & Technical Setup**
- T3 Stack initialization (create-t3-app v7.40.0)
- Next.js 15, TypeScript 5.6+, tRPC v11, Prisma ORM, NextAuth.js v5
- PostgreSQL with Neon, multi-tenancy RLS setup
- Inngest, Sentry, Resend, Vercel Blob configuration
- shadcn/ui, Tailwind CSS, Framer Motion, Lucide React, Tremor/Recharts

**Epic 2: User Authentication & Account Management**
- FR1: Create account with email/password
- FR2: Login with credentials
- FR3: Password reset via email
- FR4: Update profile information
- FR5: Enable 2FA via email/SMS (Growth Phase)

**Epic 3: Strategy Creation & AI Generation**
- FR11: Create new brand strategy project
- FR12: Input client data using frameworks (Ikigai, Schwartz, Hero's Journey, AARRR)
- FR14: Choose Wizard Mode or AI Co-Pilot Mode
- FR15: Trigger AI generation of 6-pillar strategy
- FR16: Generate context-adaptive meta-variables
- FR17: View real-time generation progress
- FR18: Receive completion notification
- FR19: Generate strategies in <10 minutes with 80%+ quality
- FR20: Access interview framework templates

**Epic 4: Strategy Management & Editing**
- FR21: View dashboard of all strategies
- FR22: View strategy with collapsible pillar sections
- FR23: Expand/collapse pillar sections
- FR24: Edit strategy content
- FR25: Save changes
- FR26: Load saved strategies
- FR27: Archive strategies (Starter tier limit)
- FR28: Delete strategies permanently
- FR29: Duplicate strategy as template

**Epic 5: Export & Client Deliverables**
- FR41: Export as branded PDF
- FR42: Export as Excel spreadsheet
- FR45: Customize export by selecting pillars
- FR46: Download export files

**Epic 6: Basic Analytics & Insights**
- FR48: View Campaign Coherence Score
- FR49: View pillar completion status
- FR50: View strategy count
- FR51: Manually input superfan count

**Epic 7: Payment & Subscription Management**
- FR85: Subscribe to Starter tier (€99/month)
- FR86: Subscribe to Professional tier (€299/month)
- FR88: Pay via credit/debit card (Paystack/Flutterwave)
- FR89: Pay via mobile money (MTN, Orange, M-Pesa, Wave)
- FR91: Annual pre-pay with 20% discount
- FR92: View billing history and download invoices
- FR93: Update payment method
- FR94: Upgrade subscription tier with prorated billing
- FR95: Downgrade subscription tier
- FR96: Cancel subscription
- FR97: Automatic payment retry (dunning management)
- FR98: Payment failure notifications

**Epic 8: Advanced Strategy Features (Growth Phase)**
- FR13: Select sector template (Fashion, Fintech, FMCG, B2B SaaS)
- FR30: View version history
- FR31: Restore previous version (90-day rollback)
- FR43: Export as PowerPoint presentation
- FR44: Apply custom branded templates
- FR47: Email exports directly to clients

**Epic 9: Team Collaboration & Permissions (Growth Phase)**
- FR6: Invite team members to tenant
- FR7: Assign roles (Agency Owner, Consultant, Brand Client, Developer)
- FR8: Modify or revoke permissions
- FR9: View audit logs of user activities
- FR10: Remove team members
- FR32: Add Consultants who can create/edit strategies
- FR33: Consultants create/edit assigned strategies
- FR34: Invite Brand Clients with view-only access
- FR35: Brand Clients view but cannot edit
- FR36: Assign strategies to team members
- FR37: View activity feed
- FR38: Add comments with threaded discussions
- FR39: @mention team members
- FR40: Receive notifications for updates/comments/mentions

**Epic 10: Advanced Analytics & Financial Clarity (Growth Phase)**
- FR52: Track superfan growth with trend graphs
- FR53: View sector-specific benchmarks
- FR54: Compare to anonymized sector averages
- FR55: View pattern recognition insights
- FR56: View predictive recommendations
- FR57: Generate automated monthly traction reports
- FR58: Financial Clarity Dashboard (budget/ROI)
- FR59: Calculate unit economics (CODB calculator)
- FR60: Historical tracking over 3/6/12 months

**Epic 11: Creative Concierge Marketplace (Growth Phase)**
- FR61: Create talent profile with portfolio/skills/rates
- FR62: Browse talents filtered by skill/sector/location/rate
- FR63: Search for specific talent types
- FR64: View detailed talent portfolios
- FR65: Request project quotes
- FR66: AI-assisted brand-talent matching
- FR67: Create structured project briefs
- FR68: Manage project milestones and deliverables
- FR69: Upload deliverables for review
- FR70: Review and rate talents
- FR71: Mutual rating (talent rates brand)
- FR72: Escrow payments (75/25 split)
- FR73: Dispute resolution mediation
- FR74: Withdraw earnings to bank/mobile money

**Epic 12: Third-Party Integrations & API (Growth Phase - Enterprise)**
- FR75: Connect Zoho CRM account
- FR76: Sync to HubSpot as campaign plans
- FR77: Auto-create Monday.com boards
- FR78: Connect Asana projects
- FR79: Generate API keys
- FR80: Access REST API endpoints
- FR81: Use SDK (npm/pip)
- FR82: Configure webhooks
- FR83: View API usage analytics
- FR84: Disconnect third-party integrations

**Epic 13: Compliance, Security & Enterprise Features (Vision Phase)**
- FR87: Request Enterprise tier custom quote
- FR90: Pay via bank transfer (NET 30 terms - Enterprise)
- FR99: Add additional users for €49/month (Professional tier)
- FR100: Accept privacy policy and ToS
- FR101: Request data deletion (GDPR)
- FR102: Export all data (JSON format)
- FR103: View audit logs with timestamps/IP
- FR104: AES-256 encryption at rest
- FR105: TLS 1.3 encryption in transit
- FR106: Security breach notifications within 72 hours
- FR107: Access SOC 2 Type I reports (Enterprise)
- FR108: Access SOC 2 Type II reports (Enterprise)
- FR109: Configure custom data retention (Enterprise)
- FR110: Automated daily backups with 30-day retention
- FR111: Row-level security for tenant isolation
- FR112: Request dedicated infrastructure (Enterprise)

**Epic 14: PWA, Accessibility & UX Polish**
- Progressive Web App (PWA) with offline capabilities
- Service worker for caching and sync
- WCAG 2.1 Level AA compliance (keyboard nav, screen readers, contrast)
- French localization for Francophone markets
- Responsive design (desktop, laptop, tablet, mobile)
- Touch optimizations (44×44px targets, swipe gestures, pinch-zoom)
- Framer Motion animations and micro-celebrations
- Interactive onboarding tutorial
- Data storytelling in dashboards
- Keyboard shortcuts (Ctrl+S, Ctrl+E, Esc)
- AI co-pilot conversational tone (bienveillant, not robotic)

## Epic List

### Epic 1: Project Foundation & Technical Setup
**Goal:** Establish complete development environment with T3 Stack, database, authentication foundation, and all necessary services configured for rapid feature implementation.

**User Outcome:** Development team can begin implementing user-facing features on a solid, type-safe, scalable technical foundation with multi-tenancy, authentication, and essential services ready.

**FRs Covered:** Architecture requirements (T3 Stack, Prisma, NextAuth, multi-tenancy, services)

**NFRs Addressed:** NFR-S1, NFR-S2, NFR-SC2 (encryption, multi-tenancy scalability)

**Key Deliverables:**
- T3 Stack initialized with Next.js 15, TypeScript 5.6+, tRPC v11, Prisma ORM, NextAuth.js v5, Tailwind CSS
- PostgreSQL database via Neon with multi-tenant schema and Row-Level Security policies
- Inngest (background jobs), Sentry (error tracking), Resend (email), Vercel Blob (file storage) configured
- shadcn/ui component library, Framer Motion, Lucide React, Tremor/Recharts installed
- Deployment pipeline to Vercel configured

---

### Epic 2: User Authentication & Account Management
**Goal:** Enable users to securely create accounts, login, manage profiles, and reset passwords with optional 2FA.

**User Outcome:** Agency directors (Amina) and all user types can register, login securely, manage their profile information, and recover access if needed.

**FRs Covered:** FR1, FR2, FR3, FR4, FR5

**NFRs Addressed:** NFR-S3 (bcrypt password hashing, JWT sessions, account lockout)

**Key Deliverables:**
- Email/password registration and login
- Password reset via email link (Resend integration)
- User profile management UI
- Two-factor authentication (2FA) via email/SMS (Growth Phase)
- Session management with JWT tokens (24-hour expiry)

---

### Epic 3: Strategy Creation & AI Generation
**Goal:** Enable users to create sophisticated 6-pillar brand strategies in under 10 minutes using AI-powered generation with conversational guidance.

**User Outcome:** Amina can create brand strategies by inputting client data through structured frameworks, choose between Wizard Mode or AI Co-Pilot Mode, and receive complete strategies with real-time progress tracking.

**FRs Covered:** FR11, FR12, FR14, FR15, FR16, FR17, FR18, FR19, FR20

**NFRs Addressed:** NFR-P1 (<10 min generation), NFR-P3 (<500ms UI response), NFR-SC3 (concurrent AI generations)

**Key Deliverables:**
- Strategy creation wizard/form
- Interview framework input UI (Ikigai, Schwartz Values, Hero's Journey, AARRR)
- Wizard Mode (step-by-step questionnaire) and AI Co-Pilot Mode
- Vercel AI SDK integration with streaming responses
- 6-pillar generation engine (Authenticité, Distinction, Valeur, Engagement, Risk, Track)
- Context-adaptive meta-variable generation
- Real-time progress indicator (pillar-by-pillar status)
- Completion notifications
- Interview framework template downloads (PDF/in-app guides)

---

### Epic 4: Strategy Management & Editing
**Goal:** Provide comprehensive strategy portfolio management with intuitive editing, organization, and version control.

**User Outcome:** Amina can view all her strategies in a dashboard, edit content with collapsible pillar sections, save changes, duplicate successful strategies as templates, archive old work, and maintain organized portfolio.

**FRs Covered:** FR21, FR22, FR23, FR24, FR25, FR26, FR27, FR28, FR29

**NFRs Addressed:** NFR-P3 (edit responsiveness <500ms)

**Key Deliverables:**
- Strategy dashboard with list view
- Individual strategy view with collapsible pillar sections
- WYSIWYG content editing interface
- Auto-save and manual save functionality
- Strategy duplication feature
- Archive management (Starter tier: 3 active strategies limit)
- Permanent deletion with confirmation
- Strategy loading and state management

---

### Epic 5: Export & Client Deliverables
**Goal:** Enable professional, branded export of strategies in multiple formats for client presentations and deliverables.

**User Outcome:** Amina can export completed strategies as pitch-ready branded PDFs and Excel spreadsheets, customize which pillars to include, and download files for client delivery.

**FRs Covered:** FR41, FR42, FR45, FR46

**NFRs Addressed:** NFR-P4 (export generation <30 seconds)

**Key Deliverables:**
- PDF export generation with branding (Inngest background job)
- Excel spreadsheet export functionality
- Pillar selection interface for custom exports
- Vercel Blob storage for generated export files
- Download interface with progress tracking
- Export history and re-download capability

---

### Epic 6: Basic Analytics & Insights
**Goal:** Provide fundamental metrics tracking to help users measure strategy quality and campaign success.

**User Outcome:** Amina can view Campaign Coherence Score, monitor pillar completion status, track total strategies created, and manually record superfan counts for client brands.

**FRs Covered:** FR48, FR49, FR50, FR51

**NFRs Addressed:** NFR-P2 (dashboard load <3 seconds)

**Key Deliverables:**
- Analytics dashboard UI
- Campaign Coherence Score calculation algorithm
- Pillar completion status indicators
- Strategy count metrics
- Manual superfan count input interface
- Basic metric visualizations using Tremor/Recharts

---

### Epic 7: Payment & Subscription Management
**Goal:** Enable monetization through tiered SaaS subscriptions with African payment methods and robust billing management.

**User Outcome:** Users can subscribe to Starter or Professional tiers, pay via credit card or mobile money, manage billing history, update payment methods, upgrade/downgrade subscriptions, and handle payment failures gracefully.

**FRs Covered:** FR85, FR86, FR88, FR89, FR91, FR92, FR93, FR94, FR95, FR96, FR97, FR98

**NFRs Addressed:** NFR-S5 (PCI-DSS compliance), NFR-R3 (85-90% payment success), NFR-I3 (rate limiting by tier)

**Key Deliverables:**
- Paystack and Flutterwave payment integration
- Mobile money support (MTN, Orange, M-Pesa, Wave)
- Subscription tier management (Starter €99/month, Professional €299/month)
- Annual pre-pay discount logic (20% off)
- Billing history and invoice downloads
- Payment method update interface
- Tier upgrade/downgrade with prorated billing
- Subscription cancellation workflow
- Dunning management (3 automatic retries over 10 days)
- Payment failure notifications (Resend email)

---

### Epic 8: Advanced Strategy Features (Growth Phase)
**Goal:** Enhance strategy creation with sector-specific templates, version control, and additional export formats for sophisticated workflows.

**User Outcome:** Users can select pre-filled sector templates, track version history of strategies, restore previous versions, export to PowerPoint, apply custom branding, and email exports directly to clients.

**FRs Covered:** FR13, FR30, FR31, FR43, FR44, FR47

**NFRs Addressed:** NFR-P4 (PowerPoint export <60 seconds)

**Key Deliverables:**
- Sector template library (Fashion, Fintech, FMCG, B2B SaaS)
- Version control system for strategies (Git-like approach)
- Version history UI with diff visualization
- 90-day version rollback capability (Professional tier)
- PowerPoint export generation (Inngest background job)
- Custom branding engine (logo, colors, fonts)
- Email export delivery (Resend integration)

---

### Epic 9: Team Collaboration & Permissions (Growth Phase)
**Goal:** Enable multi-user agencies to collaborate on strategies with role-based access control, activity tracking, and team communication.

**User Outcome:** Agency owners can invite team members, assign granular roles and permissions, manage team access, track all activities via audit logs, enable threaded discussions on pillars, mention team members, and receive real-time notifications.

**FRs Covered:** FR6, FR7, FR8, FR9, FR10, FR32, FR33, FR34, FR35, FR36, FR37, FR38, FR39, FR40

**NFRs Addressed:** NFR-S4 (multi-tenant isolation), NFR-S7 (audit logging), NFR-R6 (monitoring)

**Key Deliverables:**
- Multi-tenant RBAC system (4 roles: Agency Owner, Consultant, Brand Client, Developer)
- Team invitation workflow via email (Resend)
- Role assignment and permission management UI
- Permission enforcement at API and UI layers
- Team member removal functionality
- Strategy assignment to team members
- Activity feed with real-time updates
- Commenting system with threaded discussions
- @mention functionality with notifications
- Real-time notification system (strategy updates, comments, mentions)
- Audit logging (Inngest async job with 90-day retention)

---

### Epic 10: Advanced Analytics & Financial Clarity (Growth Phase)
**Goal:** Provide deep business intelligence with financial projections, ROI tracking, benchmarking, and predictive insights.

**User Outcome:** Kofi (Brand Director) can track superfan growth trends, compare performance to sector benchmarks, receive AI-powered pattern insights and predictions, generate automated monthly reports, use Financial Clarity Dashboard for budget/ROI planning, calculate unit economics (CODB), and analyze historical trends.

**FRs Covered:** FR52, FR53, FR54, FR55, FR56, FR57, FR58, FR59, FR60

**NFRs Addressed:** NFR-P2 (dashboard load <3 seconds), NFR-SC3 (analytics pre-computation)

**Key Deliverables:**
- Superfan growth trend graphs with time-series analysis
- Sector benchmarking system (aggregated anonymized data)
- Comparison engine (user metrics vs industry averages)
- Pattern recognition ML algorithms
- Predictive recommendation engine
- Automated monthly traction report generation (Inngest scheduled job)
- Financial Clarity Dashboard with data storytelling
- Budget allocation visualizer
- ROI projection calculator
- CODB (Cost of Doing Business) calculator with unit economics
- Historical trend analysis (3/6/12-month periods)
- Interactive data visualizations (Tremor/Recharts with narratives)

---

### Epic 11: Creative Concierge Marketplace (Growth Phase)
**Goal:** Create bidirectional marketplace connecting creative talents with brand projects through AI-powered matching and secure escrow payments.

**User Outcome:** Yasmine (Creative Talent) can create rich portfolio profiles; Brands can discover and hire talents; Both can collaborate on projects with structured briefs, milestone tracking, mutual ratings, escrow payments (75/25 split), and dispute resolution.

**FRs Covered:** FR61, FR62, FR63, FR64, FR65, FR66, FR67, FR68, FR69, FR70, FR71, FR72, FR73, FR74

**NFRs Addressed:** NFR-S5 (payment security), NFR-R3 (payment reliability)

**Key Deliverables:**
- Talent profile creation with portfolio showcase (Vercel Blob for assets)
- Skills, rates, availability management
- Browse and search interface with advanced filtering
- Detailed portfolio view with work samples
- Project quote request system
- AI-assisted matching algorithm (based on ADVERT pillar data and creative style)
- Structured project brief templates (from ADVERT pillars)
- Project milestone and deliverable management
- Deliverable upload and review workflow
- Mutual rating system (brands rate talents, talents rate brands)
- Escrow payment processing (75% talent, 25% platform commission)
- Paystack/Flutterwave integration for marketplace transactions
- Dispute resolution mediation workflow
- Earnings withdrawal to bank account or mobile money wallet

---

### Epic 12: Third-Party Integrations & API (Growth Phase - Enterprise)
**Goal:** Enable enterprise customers to integrate ADVERT into their existing tech stack via APIs, SDKs, and OAuth-based third-party connections.

**User Outcome:** DevTeam can connect CRM/PM tools (Zoho, HubSpot, Monday, Asana), generate API keys for programmatic access, use REST APIs and SDKs, configure webhooks for real-time events, monitor API usage, and disconnect integrations as needed.

**FRs Covered:** FR75, FR76, FR77, FR78, FR79, FR80, FR81, FR82, FR83, FR84

**NFRs Addressed:** NFR-P5 (API response <2s), NFR-I1, NFR-I2, NFR-I3, NFR-I4, NFR-I5 (API reliability, uptime, rate limiting, versioning)

**Key Deliverables:**
- REST API with tRPC endpoints exposed as public API
- OAuth 2.0 API authentication
- API key generation and management
- SDK packages (npm for JavaScript, pip for Python)
- API documentation (OpenAPI/Swagger)
- Webhook delivery system (Inngest with retries)
- Third-party OAuth integrations:
  - Zoho CRM contact/strategy sync
  - HubSpot campaign plan sync
  - Monday.com board auto-creation
  - Asana project milestone sync
- API usage analytics dashboard
- Rate limiting by tier (Professional: 1000/hour, Enterprise: custom 10k+/hour)
- API versioning (/api/v1/, /api/v2/)
- Integration disconnection workflow

---

### Epic 13: Compliance, Security & Enterprise Features (Vision Phase)
**Goal:** Meet enterprise compliance requirements with SOC 2 certification, GDPR compliance, advanced security controls, and enterprise-grade infrastructure options.

**User Outcome:** Enterprise users can request custom quotes, pay via bank transfer (NET 30), add team members at scale, accept privacy policies, request data deletion, export all data, view comprehensive audit logs, access SOC 2 audit reports, configure data retention, and request dedicated infrastructure.

**FRs Covered:** FR87, FR90, FR99, FR100, FR101, FR102, FR103, FR104, FR105, FR106, FR107, FR108, FR109, FR110, FR111, FR112

**NFRs Addressed:** All security NFRs (NFR-S1 to NFR-S9), NFR-R2 (backup/recovery), NFR-R6 (monitoring), NFR-SC6 (geographic scalability)

**Key Deliverables:**
- Enterprise tier sales contact and custom quote workflow
- Bank transfer payment processing (NET 30 terms)
- Additional user provisioning (€49/month per user for Professional tier)
- Privacy policy and Terms of Service acceptance flow
- GDPR data deletion workflow (right to be forgotten)
- Complete data export in JSON format (data portability)
- Comprehensive audit log dashboard (timestamps, IP addresses, actions)
- AES-256 encryption at rest with AWS KMS/GCP Cloud KMS
- TLS 1.3 encryption in transit (SSL Labs A+ rating)
- Security breach notification system (72-hour compliance)
- SOC 2 Type I audit report access (Enterprise tier)
- SOC 2 Type II audit report access (Enterprise tier - Vision)
- Custom data retention policy configuration
- Automated daily backup system with 30-day retention
- Row-level security (RLS) implementation and validation
- Dedicated infrastructure provisioning for data isolation (Enterprise tier)
- Compliance documentation portal

---

### Epic 14: PWA, Accessibility & UX Polish
**Goal:** Deliver exceptional user experience with Progressive Web App capabilities, full accessibility compliance, multilingual support, and delightful interactions across all devices.

**User Outcome:** All users benefit from installable PWA with offline editing, seamless keyboard navigation, screen reader support, French localization, responsive design across devices, touch-optimized mobile experience, subtle animations, interactive onboarding, and conversational AI tone.

**FRs Covered:** UX requirements from design specification (no numbered FRs, but critical for user adoption)

**NFRs Addressed:** NFR-A1 to NFR-A5 (all accessibility requirements), UX requirements

**Key Deliverables:**
- Progressive Web App (PWA) configuration with service worker
- Offline editing capabilities with intelligent sync
- Conflict resolution UI for offline changes
- Complete keyboard navigation (all features accessible without mouse)
- Documented keyboard shortcuts (Ctrl+S save, Ctrl+E export, Esc close modals)
- WCAG 2.1 Level A compliance (semantic HTML, ARIA labels, alt text)
- WCAG 2.1 Level AA compliance (4.5:1 contrast for normal text, 3:1 for large text)
- Screen reader testing and optimization (NVDA, JAWS)
- French localization for Francophone African markets (full UI translation)
- Responsive design optimization (desktop 1920×1080, laptop 1366×768, tablet 768×1024)
- Mobile-responsive layouts for reviews and presentations
- Touch optimizations (44×44px minimum touch targets)
- Swipe gestures for pillar navigation
- Pinch-zoom on visualizations
- Framer Motion animations and micro-celebrations on pillar completion
- Progressive disclosure UI patterns (complexity revealed gradually)
- Interactive onboarding tutorial with real strategy creation
- AI co-pilot conversational tone refinement (bienveillant, not robotic)
- Data storytelling in analytics dashboards (narrative insights, not just charts)
- CSS print stylesheets for professional printing
- Export to Google Drive, Dropbox, Notion, Slack
- One-click dashboard-to-slideshow transformation

---

## Epic 1: Project Foundation & Technical Setup

**Goal:** Establish complete development environment with T3 Stack, database, authentication foundation, and all necessary services configured for rapid feature implementation.

**User Outcome:** Development team can begin implementing user-facing features on a solid, type-safe, scalable technical foundation with multi-tenancy, authentication, and essential services ready.

---

### Story 1.1: Initialize T3 Stack Project Foundation

As a **developer**,
I want **the T3 Stack project initialized with all core dependencies configured**,
So that **I have a type-safe, modern foundation ready for feature implementation**.

**Acceptance Criteria:**

**Given** I have Node.js 20+ and npm installed
**When** I run the T3 Stack initialization command
**Then** the project is created with Next.js 15, TypeScript 5.6+, tRPC v11, Prisma, NextAuth.js v5, and Tailwind CSS
**And** all dependencies are installed without errors
**And** the TypeScript configuration uses strict mode
**And** ESLint and Prettier are configured for consistent code style
**And** the project structure follows T3 Stack conventions (src/app, src/server, src/lib)
**And** `npm run dev` starts the development server successfully on localhost:3000
**And** the default Next.js 15 App Router homepage loads without errors

**Given** the project is initialized
**When** I run `npm run build`
**Then** the production build completes successfully without type errors
**And** the build output is optimized for deployment

**Given** the project is initialized
**When** I inspect the package.json
**Then** it includes all required dependencies:
- next@^15.0.0
- react@^19.0.0
- typescript@^5.6.0
- @trpc/server@^11.0.0
- @trpc/client@^11.0.0
- @trpc/next@^11.0.0
- @prisma/client@latest
- next-auth@^5.0.0
- tailwindcss@^4.0.0
- zod@latest (for validation)

**Given** the project is initialized
**When** I check the Git repository
**Then** the initial commit includes all files with message "Initial commit: T3 Stack foundation"
**And** `.gitignore` excludes node_modules, .env files, and build artifacts

---

### Story 1.2: Configure Database with Multi-Tenancy Schema

As a **developer**,
I want **PostgreSQL database configured via Neon with foundational multi-tenant schema**,
So that **I can store user and tenant data with proper isolation from the start**.

**Acceptance Criteria:**

**Given** I have a Neon account and database created
**When** I configure the DATABASE_URL environment variable
**Then** Prisma connects to the Neon PostgreSQL database successfully
**And** the connection uses SSL/TLS encryption

**Given** the database connection is configured
**When** I create the initial Prisma schema file
**Then** it includes the following models with proper relations:
- **Tenant** model (id, name, slug, createdAt, updatedAt)
- **User** model (id, email, name, tenantId, role, createdAt, updatedAt)
- **Account** model (for NextAuth OAuth - userId, provider, providerAccountId, etc.)
- **Session** model (for NextAuth - userId, sessionToken, expires)
- **VerificationToken** model (for NextAuth - identifier, token, expires)

**Given** the Prisma schema includes multi-tenancy
**When** I define the Tenant model
**Then** it has:
```prisma
model Tenant {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  users     User[]
}
```

**Given** the Prisma schema includes User model
**When** I define relationships
**Then** User has a required tenantId foreign key
**And** User.tenant relation is defined properly
**And** User.role is an enum with values: AGENCY_OWNER, CONSULTANT, BRAND_CLIENT, DEVELOPER

**Given** the schema is defined
**When** I run `npx prisma migrate dev --name init`
**Then** the migration creates all tables in Neon database
**And** the Prisma Client is generated with TypeScript types
**And** no migration errors occur

**Given** the database is migrated
**When** I run `npx prisma studio`
**Then** Prisma Studio opens and shows all tables (Tenant, User, Account, Session, VerificationToken)
**And** I can inspect the schema visually

**Given** the database is configured
**When** I check the .env file
**Then** DATABASE_URL is present with Neon connection string
**And** DIRECT_URL is configured for migrations (Neon requirement)
**And** .env.example includes placeholder values without sensitive data

---

### Story 1.3: Setup Row-Level Security (RLS) Middleware for Multi-Tenancy

As a **developer**,
I want **Prisma middleware that enforces tenant isolation automatically**,
So that **all database queries are scoped to the current tenant without manual filtering**.

**Acceptance Criteria:**

**Given** I have the Prisma client configured
**When** I create a Prisma middleware file at `src/server/db/middleware.ts`
**Then** it exports a function that adds tenant filtering to all queries

**Given** the middleware is created
**When** a query is executed with a tenant context
**Then** the middleware automatically adds `where: { tenantId: currentTenantId }` to applicable models
**And** it applies to findMany, findFirst, findUnique, create, update, delete operations
**And** it does NOT apply to Tenant model queries (to avoid circular filtering)

**Given** the middleware enforces tenancy
**When** I query `prisma.user.findMany()` with tenant context `{ tenantId: "tenant_123" }`
**Then** only users with `tenantId === "tenant_123"` are returned
**And** users from other tenants are never accessible

**Given** the middleware is configured
**When** I create a new record without specifying tenantId
**Then** the middleware automatically injects the current tenantId
**And** the record is created with proper tenant association

**Given** tenant context is missing
**When** a query is executed
**Then** the middleware throws a clear error: "Tenant context required for multi-tenant operation"
**And** it prevents accidental cross-tenant data leaks

**Given** the middleware is tested
**When** I write unit tests for tenant isolation
**Then** tests verify:
- Queries return only tenant-scoped data
- Creates automatically assign tenantId
- Missing tenant context throws errors
- Tenant model queries bypass filtering

**Given** the middleware is complete
**When** I integrate it into the Prisma client initialization
**Then** it's applied globally via `prisma.$use(tenantMiddleware)`
**And** all subsequent queries are automatically tenant-scoped

---

### Story 1.4: Configure NextAuth.js v5 Authentication Foundation

As a **developer**,
I want **NextAuth.js v5 configured with email/password authentication and Prisma adapter**,
So that **users can register and login with foundational auth infrastructure ready**.

**Acceptance Criteria:**

**Given** I have NextAuth.js v5 installed
**When** I create the auth configuration at `src/server/auth.ts`
**Then** it exports `auth`, `signIn`, `signOut` functions for App Router
**And** it configures the Prisma adapter for session/account storage

**Given** the auth config is created
**When** I configure the Credentials provider
**Then** it accepts email and password
**And** it validates credentials against User model in database
**And** passwords are compared using bcrypt (hashing handled in User creation story later)

**Given** NextAuth is configured
**When** I set the session strategy to "jwt"
**Then** sessions use JWT tokens (not database sessions for MVP performance)
**And** JWT secret is configured from environment variable NEXTAUTH_SECRET
**And** session maxAge is set to 24 hours (86400 seconds)

**Given** NextAuth is configured
**When** I create the auth API route at `src/app/api/auth/[...nextauth]/route.ts`
**Then** it exports GET and POST handlers using NextAuth
**And** it handles signin, signout, callback, session routes automatically

**Given** the auth routes are configured
**When** I navigate to `/api/auth/signin`
**Then** NextAuth's default signin page loads
**And** it shows email/password form

**Given** I want to customize the auth pages
**When** I configure custom pages in auth config
**Then** `pages.signIn` is set to `/login` (custom page to be built later)
**And** `pages.error` is set to `/auth/error`
**And** `pages.signOut` is set to `/logout`

**Given** NextAuth callbacks are needed
**When** I configure the `jwt` callback
**Then** it adds user.id, user.tenantId, user.role to the JWT token
**And** tenant context is available in all authenticated requests

**Given** the `session` callback is configured
**When** a session is retrieved
**Then** it includes user.id, user.email, user.tenantId, user.role from JWT
**And** this data is accessible via `auth()` in Server Components

**Given** environment variables are needed
**When** I check .env
**Then** NEXTAUTH_URL is set to http://localhost:3000 (development)
**And** NEXTAUTH_SECRET is a random 32+ character string
**And** .env.example documents these variables

**Given** auth is configured
**When** I test the auth flow manually
**Then** I can navigate to `/api/auth/signin`
**And** the signin page loads without errors
**And** auth configuration doesn't break the development server

---

### Story 1.5: Configure Inngest for Background Jobs

As a **developer**,
I want **Inngest configured for background job processing**,
So that **I can queue async tasks like email sending, exports, and webhook delivery**.

**Acceptance Criteria:**

**Given** I have an Inngest account (free tier)
**When** I install `inngest` npm package
**Then** it's added to package.json dependencies
**And** the latest stable version is installed

**Given** Inngest is installed
**When** I create the Inngest client at `src/lib/inngest/client.ts`
**Then** it exports a configured Inngest instance
**And** it uses the app name "advert-01"
**And** it includes event schemas for type safety

**Given** the Inngest client is created
**When** I configure the Inngest event key
**Then** INNGEST_EVENT_KEY environment variable is set
**And** INNGEST_SIGNING_KEY is configured for webhook signature validation

**Given** Inngest needs an API endpoint
**When** I create the API route at `src/app/api/inngest/route.ts`
**Then** it exports the Inngest serve handler
**And** it registers all function handlers
**And** it's accessible at `/api/inngest`

**Given** I want to test Inngest locally
**When** I run the Inngest Dev Server
**Then** `npx inngest-cli@latest dev` starts successfully
**And** it connects to the local Next.js app
**And** the Inngest dashboard shows at http://localhost:8288

**Given** Inngest is configured
**When** I create a test function at `src/lib/inngest/functions/test.ts`
**Then** it defines a simple test function:
```typescript
export const testFunction = inngest.createFunction(
  { name: "Test Function" },
  { event: "test/hello" },
  async ({ event }) => {
    return { message: `Hello ${event.data.name}!` };
  }
);
```

**Given** the test function is created
**When** I register it in the serve handler
**Then** it appears in the Inngest Dev Server dashboard
**And** I can trigger it manually via the UI
**And** it executes successfully

**Given** Inngest is working
**When** I send a test event from the application
**Then** `inngest.send({ name: "test/hello", data: { name: "Spark01" } })` succeeds
**And** the function executes and returns the expected message
**And** I can view the execution logs in Inngest dashboard

**Given** Inngest is configured for production
**When** I check environment variables
**Then** .env includes INNGEST_EVENT_KEY and INNGEST_SIGNING_KEY
**And** .env.example documents these with placeholder values
**And** production deployment will use Inngest cloud (not dev server)

---

### Story 1.6: Setup Sentry Error Tracking and Monitoring

As a **developer**,
I want **Sentry configured for error tracking and performance monitoring**,
So that **I can proactively detect and debug errors in production**.

**Acceptance Criteria:**

**Given** I have a Sentry account
**When** I install `@sentry/nextjs` package
**Then** it's added to package.json
**And** version is latest stable

**Given** Sentry is installed
**When** I run `npx @sentry/wizard@latest -i nextjs`
**Then** Sentry wizard creates configuration files
**And** it generates `sentry.client.config.ts` for frontend tracking
**And** it generates `sentry.server.config.ts` for backend tracking
**And** it adds Sentry to `next.config.js`

**Given** Sentry client config is created
**When** I review `sentry.client.config.ts`
**Then** it initializes Sentry with DSN from environment variable
**And** tracesSampleRate is set to 0.1 (10% of transactions for performance monitoring)
**And** environment is set to process.env.NODE_ENV

**Given** Sentry server config is created
**When** I review `sentry.server.config.ts`
**Then** it includes Prisma integration for query monitoring
**And** it captures database slow queries
**And** it uses the same DSN and configuration as client

**Given** Sentry is configured
**When** I set up environment variables
**Then** SENTRY_DSN is added to .env with the project DSN
**And** SENTRY_AUTH_TOKEN is configured for source map uploads (from Sentry wizard)
**And** .env.example documents SENTRY_DSN with placeholder

**Given** I want to test error tracking
**When** I create a test error route at `src/app/api/sentry-test/route.ts`
**Then** it throws a test error: `throw new Error("Sentry Test Error");`
**And** visiting `/api/sentry-test` captures the error in Sentry

**Given** the test error is thrown
**When** I check the Sentry dashboard
**Then** the error appears with full stack trace
**And** it includes request context (URL, headers, user agent)
**And** source maps are uploaded correctly (code is not minified in error view)

**Given** Sentry is monitoring performance
**When** I navigate through the app
**Then** Sentry tracks page load times
**And** API route response times are recorded
**And** slow database queries appear in performance tab

**Given** Sentry is fully configured
**When** I check the Next.js config
**Then** `next.config.js` includes Sentry webpack plugin
**And** source maps are uploaded automatically on build
**And** production builds include Sentry instrumentation

**Given** Sentry is production-ready
**When** errors occur in production
**Then** they're automatically captured and reported
**And** email/Slack notifications can be configured in Sentry dashboard
**And** error grouping works correctly (similar errors grouped together)

---

### Story 1.7: Configure Resend Email Service and Vercel Blob Storage

As a **developer**,
I want **Resend email service and Vercel Blob file storage configured**,
So that **I can send transactional emails and store user-uploaded files**.

**Acceptance Criteria:**

**Given** I have a Resend account
**When** I install `resend` npm package
**Then** it's added to package.json
**And** latest stable version is installed

**Given** Resend is installed
**When** I create the email client at `src/lib/email/client.ts`
**Then** it exports a configured Resend instance
**And** it uses RESEND_API_KEY from environment variables

**Given** Resend client is created
**When** I configure environment variables
**Then** RESEND_API_KEY is set in .env
**And** RESEND_FROM_EMAIL is configured (e.g., "ADVERT <noreply@advert.app>")
**And** .env.example documents both variables

**Given** I want to test email sending
**When** I create a test email function at `src/lib/email/templates/test.tsx`
**Then** it uses React Email components for HTML templating
**And** the template is type-safe with TypeScript

**Given** React Email is needed
**When** I install `@react-email/components`
**Then** it's added to package.json
**And** I can use Email, Html, Text, Button components

**Given** a test email template exists
**When** I send a test email via Resend API
**Then** `resend.emails.send()` succeeds
**And** the email is delivered to the test recipient
**And** Resend dashboard shows the sent email

**Given** Vercel Blob storage is needed
**When** I install `@vercel/blob` package
**Then** it's added to package.json
**And** latest stable version is installed

**Given** Vercel Blob is installed
**When** I configure the Blob client at `src/lib/storage/blob.ts`
**Then** it exports helper functions for upload, download, delete
**And** it uses BLOB_READ_WRITE_TOKEN from environment variables

**Given** Blob storage is configured
**When** I set environment variables
**Then** BLOB_READ_WRITE_TOKEN is added to .env (generated from Vercel dashboard)
**And** .env.example documents it with placeholder

**Given** I want to test file upload
**When** I create a test upload API route at `src/app/api/upload-test/route.ts`
**Then** it accepts a file upload via FormData
**And** it uses `put()` from @vercel/blob to upload the file
**And** it returns the blob URL

**Given** the test upload route exists
**When** I upload a test file (e.g., test.txt)
**Then** the file is stored in Vercel Blob
**And** a public URL is returned (https://blob.vercel-storage.com/...)
**And** accessing the URL serves the file correctly

**Given** Blob storage is working
**When** I test file deletion
**Then** `del()` function removes files from Blob storage
**And** deleted file URLs return 404

**Given** both services are configured
**When** I review the project structure
**Then** `src/lib/email/` contains email client and templates
**And** `src/lib/storage/` contains blob storage utilities
**And** both are ready for use in feature development

---

### Story 1.8: Initialize shadcn/ui Component Library

As a **developer**,
I want **shadcn/ui component library initialized with essential components**,
So that **I can build consistent, accessible UI rapidly**.

**Acceptance Criteria:**

**Given** I have Tailwind CSS configured from T3 Stack
**When** I run `npx shadcn-ui@latest init`
**Then** shadcn/ui is initialized successfully
**And** `components.json` config file is created
**And** it's configured for Next.js App Router with TypeScript

**Given** shadcn/ui init prompts me for preferences
**When** I configure the setup
**Then** style is set to "Default"
**And** base color is set to "Slate"
**And** CSS variables are enabled for theming
**And** components path is `src/components/ui`
**And** utils path is `src/lib/utils`
**And** Tailwind config uses CSS variables: yes
**And** React Server Components compatible: yes

**Given** shadcn/ui is initialized
**When** I install essential components
**Then** I run commands to add these components:
- `npx shadcn-ui@latest add button`
- `npx shadcn-ui@latest add input`
- `npx shadcn-ui@latest add label`
- `npx shadcn-ui@latest add card`
- `npx shadcn-ui@latest add dialog`
- `npx shadcn-ui@latest add dropdown-menu`
- `npx shadcn-ui@latest add toast`
- `npx shadcn-ui@latest add form`

**Given** components are installed
**When** I check `src/components/ui/`
**Then** all component files are present (button.tsx, input.tsx, etc.)
**And** each component uses Radix UI primitives
**And** components are fully typed with TypeScript
**And** they support className prop for customization

**Given** I need additional UI packages
**When** I install supporting libraries
**Then** `lucide-react` is installed for icons
**And** `framer-motion` is installed for animations
**And** `@tremor/react` or `recharts` is installed for data visualizations

**Given** icons are needed
**When** I test Lucide React icons
**Then** I can import and use icons like `<ChevronDown />`, `<User />`, `<Settings />`
**And** icons render correctly with customizable size and color

**Given** animations are needed
**When** I test Framer Motion
**Then** I can animate components using `motion.div`
**And** basic animations work (fade in, slide in, etc.)

**Given** charts are needed
**When** I install Tremor or Recharts
**Then** the package is added to package.json
**And** I can import chart components for analytics dashboards

**Given** the component library is complete
**When** I create a test page at `src/app/component-test/page.tsx`
**Then** it renders a Button, Input, Card, and Dialog
**And** all components render correctly with Tailwind styling
**And** interactions work (button clicks, dialog open/close)

**Given** Tailwind CSS is configured
**When** I check `tailwind.config.ts`
**Then** it includes shadcn/ui configuration
**And** content paths include `src/components/**/*.{ts,tsx}`
**And** CSS variables are defined in `globals.css`

**Given** the UI foundation is ready
**When** I review the setup
**Then** developers can build UI using shadcn/ui components
**And** components are accessible (WCAG compliant via Radix UI)
**And** styling is consistent via Tailwind + CSS variables
**And** the design system foundation is complete

---

## Epic 2: User Authentication & Account Management

**Goal:** Enable users to securely create accounts, login, manage profiles, and reset passwords with optional 2FA.

**User Outcome:** Agency directors (Amina) and all user types can register, login securely, manage their profile information, and recover access if needed.

---

### Story 2.1: User Registration with Email and Password

As an **unregistered user**,
I want **to create an account using my email and password**,
So that **I can access ADVERT and start creating brand strategies**.

**Acceptance Criteria:**

**Given** I am on the registration page at `/register`
**When** I view the registration form
**Then** I see input fields for:
- Email address (type="email", required)
- Full name (type="text", required)
- Password (type="password", required, minLength=8)
- Confirm password (type="password", required)
- Company name (type="text", optional)
**And** I see a "Create Account" button
**And** I see a link to "Already have an account? Log in"

**Given** I am filling out the registration form
**When** I enter a password
**Then** I see password strength indicators (weak, medium, strong)
**And** password requirements are displayed:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
**And** the password field shows/hides toggle icon

**Given** I submit the registration form with valid data
**When** the form is submitted
**Then** the system validates that email is unique (not already registered)
**And** the system validates that password matches confirm password
**And** the system hashes the password using bcrypt with work factor 12
**And** a new User record is created in the database with hashed password
**And** a new Tenant record is created automatically (user becomes AGENCY_OWNER of their tenant)
**And** the tenant slug is generated from company name or email
**And** user.tenantId is set to the newly created tenant

**Given** the registration is successful
**When** the user account is created
**Then** the user is automatically logged in (session created)
**And** a JWT token is generated with user.id, user.tenantId, user.role
**And** the user is redirected to `/dashboard` (or onboarding page)
**And** a welcome email is sent via Resend (using template created in Epic 1)

**Given** I submit the form with an already registered email
**When** the system checks for duplicates
**Then** registration fails with error: "An account with this email already exists"
**And** the form highlights the email field in red
**And** no database records are created

**Given** I submit the form with mismatched passwords
**When** the validation runs
**Then** registration fails with error: "Passwords do not match"
**And** the confirm password field is highlighted
**And** no database records are created

**Given** I submit the form with a weak password (e.g., "12345678")
**When** password validation runs
**Then** registration fails with error: "Password does not meet requirements"
**And** the password requirements are highlighted
**And** no database records are created

**Given** registration fails for any reason
**When** the error is displayed
**Then** the form does not clear all fields (preserves email, name, company)
**And** only the password fields are cleared for security
**And** the error message is displayed in a toast notification

**Given** the registration endpoint is implemented
**When** I review the API route at `/api/auth/register` (or tRPC mutation)
**Then** it uses Zod schema validation for all inputs
**And** it includes rate limiting (max 5 registration attempts per hour per IP)
**And** it returns appropriate HTTP status codes (201 Created, 400 Bad Request, 409 Conflict)
**And** sensitive data (password) is never logged

---

### Story 2.2: User Login with Credentials and Session Management

As a **registered user**,
I want **to log in with my email and password**,
So that **I can access my account and strategies securely**.

**Acceptance Criteria:**

**Given** I am on the login page at `/login`
**When** I view the login form
**Then** I see input fields for:
- Email address (type="email", required)
- Password (type="password", required)
**And** I see a "Remember me" checkbox (optional)
**And** I see a "Log in" button
**And** I see a "Forgot password?" link
**And** I see a "Don't have an account? Sign up" link

**Given** I submit the login form with valid credentials
**When** the form is submitted
**Then** the system looks up the user by email
**And** the system verifies the password using bcrypt.compare()
**And** if credentials are valid, a JWT session token is created
**And** the JWT includes user.id, user.email, user.tenantId, user.role
**And** the JWT expires in 24 hours (86400 seconds)
**And** the session cookie is set as httpOnly and secure (in production)

**Given** login is successful
**When** the session is created
**Then** the user is redirected to `/dashboard`
**And** the user can access protected routes
**And** the auth session is accessible via `auth()` in Server Components
**And** the user's tenant context is available for all database queries

**Given** I submit the login form with incorrect password
**When** password verification fails
**Then** login fails with error: "Invalid email or password"
**And** the error message does NOT reveal whether email exists (security)
**And** failed login attempt is logged (for security monitoring)
**And** no session is created

**Given** I submit the login form with non-existent email
**When** user lookup fails
**Then** login fails with error: "Invalid email or password"
**And** the error message is identical to incorrect password (prevents email enumeration)
**And** no session is created

**Given** I have failed login attempts from the same IP
**When** I fail 5 consecutive login attempts within 15 minutes
**Then** account lockout is triggered
**And** further login attempts return error: "Too many failed attempts. Try again in 15 minutes"
**And** lockout is IP-based (not account-based, to prevent DoS on specific users)
**And** lockout expires after 15 minutes automatically

**Given** I check the "Remember me" checkbox
**When** I log in successfully
**Then** the session maxAge is extended to 30 days instead of 24 hours
**And** the session persists across browser sessions

**Given** I am logged in
**When** my JWT token expires (after 24 hours)
**Then** the next request triggers automatic logout
**And** I am redirected to `/login` with message: "Session expired. Please log in again"

**Given** I am logged in and navigate to `/login` again
**When** the login page loads
**Then** I am automatically redirected to `/dashboard`
**And** I see a message: "You are already logged in"

**Given** the login endpoint is implemented
**When** I review the API implementation
**Then** it uses NextAuth.js Credentials provider configured in Epic 1
**And** it includes rate limiting (max 10 login attempts per hour per IP)
**And** passwords are never logged or exposed in errors
**And** failed login attempts are logged with timestamp and IP for security audit

---

### Story 2.3: Password Reset via Email Link

As a **user who forgot their password**,
I want **to reset my password via email link**,
So that **I can regain access to my account securely**.

**Acceptance Criteria:**

**Given** I am on the login page
**When** I click "Forgot password?" link
**Then** I am redirected to `/auth/forgot-password`
**And** I see a form with email input field
**And** I see a "Send reset link" button

**Given** I am on the forgot password page
**When** I enter my registered email and submit
**Then** the system looks up the user by email
**And** if the email exists, a password reset token is generated (random 32-byte hex string)
**And** the token is stored in VerificationToken table with:
  - identifier: user email
  - token: hashed token value
  - expires: current time + 1 hour
**And** a password reset email is sent via Resend with the reset link

**Given** the password reset email is sent
**When** I check my inbox
**Then** I receive an email with subject: "Reset your ADVERT password"
**And** the email contains a reset link: `https://advert.app/auth/reset-password?token={token}`
**And** the email explains the link expires in 1 hour
**And** the email includes a warning: "If you didn't request this, ignore this email"

**Given** I submit a non-existent email on forgot password page
**When** the system processes the request
**Then** it returns success message: "If that email exists, we've sent a reset link"
**And** the message does NOT reveal whether the email exists (security)
**And** no email is actually sent
**And** this prevents email enumeration attacks

**Given** I click the reset link from the email
**When** the reset password page loads at `/auth/reset-password?token={token}`
**Then** the system validates the token exists and hasn't expired
**And** if valid, I see a form with:
  - New password input (type="password", required, minLength=8)
  - Confirm new password input (type="password", required)
  - "Reset password" button
**And** the token is hidden (not editable)

**Given** I submit the reset password form with valid passwords
**When** the form is submitted
**Then** the system validates the token is still valid and not expired
**And** the system validates password matches confirm password
**And** the system validates password meets strength requirements
**And** the new password is hashed using bcrypt with work factor 12
**And** the user's password is updated in the database
**And** the verification token is deleted (single-use token)

**Given** the password reset is successful
**When** the password is updated
**Then** I see a success message: "Password reset successful. You can now log in"
**And** I am redirected to `/login`
**And** all existing sessions for that user are invalidated (force re-login)
**And** a confirmation email is sent: "Your password was changed"

**Given** I try to use an expired token (>1 hour old)
**When** the reset password page loads
**Then** I see an error: "This reset link has expired. Please request a new one"
**And** I see a button to return to forgot password page
**And** the expired token is deleted from database

**Given** I try to use an already-used token
**When** the reset password page loads
**Then** I see an error: "This reset link has already been used"
**And** I am redirected to login page

**Given** I request multiple password resets
**When** I submit forgot password form multiple times within 1 hour
**Then** only the most recent token is valid
**And** previous tokens for the same user are invalidated
**And** rate limiting prevents more than 3 reset requests per hour per email

**Given** the password reset flow is implemented
**When** I review the security measures
**Then** tokens are cryptographically random and unpredictable
**And** tokens are hashed before storage in database
**And** tokens expire after 1 hour
**And** tokens are single-use (deleted after successful reset)
**And** email addresses are not revealed in error messages
**And** all password reset attempts are logged for security audit

---

### Story 2.4: User Profile Management and Updates

As an **authenticated user**,
I want **to view and update my profile information**,
So that **I can keep my account details current**.

**Acceptance Criteria:**

**Given** I am logged in
**When** I navigate to `/settings/profile` or `/account/profile`
**Then** I see a profile management page
**And** the page displays my current information:
- Full name (editable)
- Email address (display only, with note: "Contact support to change email")
- Company name (editable)
- Account role (display only: AGENCY_OWNER, CONSULTANT, etc.)
- Account created date (display only)
**And** I see a "Save changes" button

**Given** I am viewing my profile
**When** I edit my full name
**Then** the name input field is enabled
**And** validation requires minimum 2 characters
**And** validation allows letters, spaces, hyphens, apostrophes
**And** the "Save changes" button becomes enabled (if disabled when no changes)

**Given** I am viewing my profile
**When** I edit my company name
**Then** the company name input is enabled
**And** changes are allowed (optional field, can be empty)

**Given** I have made changes to my profile
**When** I click "Save changes"
**Then** the system validates all inputs
**And** the User record is updated in database with new values
**And** the changes are saved successfully
**And** a success toast appears: "Profile updated successfully"
**And** the form returns to unchanged state

**Given** I try to save invalid data (e.g., name with only 1 character)
**When** I click "Save changes"
**Then** validation fails with error: "Name must be at least 2 characters"
**And** the invalid field is highlighted
**And** no database update occurs

**Given** I want to cancel my changes
**When** I click "Cancel" button or navigate away
**Then** I see a confirmation dialog: "You have unsaved changes. Discard them?"
**And** if I confirm, changes are discarded and form resets to saved values
**And** if I cancel, I remain on the page with my edits

**Given** I am viewing my profile
**When** I see my email address
**Then** it is displayed but not editable via the profile form
**And** I see a note: "To change your email, contact support@advert.app"
**And** this prevents accidental email changes that could lock users out

**Given** I am viewing my account role
**When** I see my role (e.g., AGENCY_OWNER)
**Then** it is display-only (not editable)
**And** I see an explanation: "Your role is managed by your agency owner"
**And** only AGENCY_OWNER can change other users' roles (in Epic 9 - Team Collaboration)

**Given** I am viewing account created date
**When** I see the creation timestamp
**Then** it displays in user-friendly format: "Member since February 5, 2026"
**And** it uses the user's timezone for display

**Given** the profile update API is implemented
**When** I review the endpoint (tRPC mutation or API route)
**Then** it validates user is authenticated via session
**And** it uses tenant context to ensure user can only update their own profile
**And** it includes Zod schema validation for all editable fields
**And** it returns updated user data after successful save
**And** it logs profile update events for audit trail

**Given** I update my profile
**When** the update completes successfully
**Then** the session data is refreshed with new user information
**And** my updated name appears in the navbar/header immediately
**And** no page reload is required (optimistic UI update)

---

### Story 2.5: Two-Factor Authentication (2FA) via Email/SMS (Growth Phase)

As a **security-conscious user**,
I want **to enable two-factor authentication on my account**,
So that **my account is protected even if my password is compromised**.

**Acceptance Criteria:**

**Given** I am on the profile/security settings page at `/settings/security`
**When** I view the 2FA section
**Then** I see:
- Current 2FA status: "Disabled" or "Enabled"
- "Enable 2FA" button (if disabled)
- "Disable 2FA" button (if enabled)
- Explanation: "Add an extra layer of security with verification codes"

**Given** 2FA is currently disabled
**When** I click "Enable 2FA"
**Then** I see a dialog prompting me to choose 2FA method:
- Email (send codes to my registered email)
- SMS (send codes to my phone number)
**And** I select "Email" (SMS requires phone number collection first)

**Given** I select Email 2FA
**When** I confirm my choice
**Then** the system generates a 6-digit verification code
**And** the code is stored in database with expiry (5 minutes)
**And** a verification email is sent via Resend with the code
**And** I see a prompt: "Enter the 6-digit code sent to your email"

**Given** I receive the 2FA verification email
**When** I check my inbox
**Then** I see an email with subject: "Your ADVERT verification code"
**And** the email contains the 6-digit code prominently displayed
**And** the email states: "This code expires in 5 minutes"
**And** the email includes: "If you didn't request this, ignore this email"

**Given** I have the verification code
**When** I enter it in the prompt
**Then** the system validates the code matches and hasn't expired
**And** if valid, 2FA is enabled on my account (user.twoFactorEnabled = true)
**And** backup codes are generated (10 single-use codes for account recovery)
**And** I see a success message: "2FA enabled successfully"
**And** I am shown the backup codes with instruction: "Save these codes securely. They can be used if you lose access to your email"

**Given** I enter an incorrect verification code
**When** validation runs
**Then** I see error: "Invalid code. Please try again"
**And** I have 3 attempts before the code is invalidated
**And** after 3 failed attempts, a new code must be requested

**Given** I enter an expired code (>5 minutes old)
**When** validation runs
**Then** I see error: "Code expired. Request a new code"
**And** I can click "Resend code" to generate and send a new one

**Given** 2FA is enabled on my account
**When** I log in with email and password
**Then** after password verification, I am prompted for 2FA code
**And** I see: "Enter the 6-digit code sent to your email"
**And** a new 6-digit code is generated and emailed
**And** I cannot access the app until I enter the correct code

**Given** I am prompted for 2FA code during login
**When** I enter the correct code
**Then** login completes successfully
**And** I am redirected to dashboard
**And** the 2FA code is invalidated (single-use)

**Given** 2FA is enabled and I lost access to my email
**When** I click "Use backup code" during login
**Then** I can enter one of my 10 backup codes instead
**And** if the backup code is valid, login completes
**And** the used backup code is invalidated (single-use)
**And** I am warned: "You have X backup codes remaining"

**Given** 2FA is enabled and I want to disable it
**When** I click "Disable 2FA" on security settings
**Then** I am prompted to enter my password for confirmation
**And** I am prompted to enter a current 2FA code
**And** if both are valid, 2FA is disabled (user.twoFactorEnabled = false)
**And** all backup codes are invalidated
**And** I see confirmation: "2FA has been disabled"

**Given** 2FA is implemented
**When** I review the security measures
**Then** verification codes are 6 digits (easy to type, sufficient entropy)
**And** codes expire after 5 minutes
**And** codes are single-use
**And** backup codes are cryptographically random 8-character strings
**And** backup codes are hashed before storage
**And** rate limiting prevents brute force (max 5 code verification attempts per 10 minutes)
**And** all 2FA events (enable, disable, successful/failed verifications) are logged for audit

**Given** SMS 2FA is to be implemented (optional enhancement)
**When** the feature is built
**Then** it requires phone number collection and verification first
**And** SMS is sent via Twilio or similar service
**And** phone numbers are stored encrypted
**And** the implementation follows the same security principles as email 2FA

---

## Epic 3: Strategy Creation & AI Generation

**Goal:** Enable users to create sophisticated 6-pillar brand strategies in under 10 minutes using AI-powered generation with conversational guidance.

**User Outcome:** Amina can create brand strategies by inputting client data through structured frameworks, choose between Wizard Mode or AI Co-Pilot Mode, and receive complete strategies with real-time progress tracking.

---

### Story 3.1: Create Strategy Database Schema and Models

As a **developer**,
I want **the Strategy database schema and Prisma models defined**,
So that **I can store brand strategies with 6-pillar structure and metadata**.

**Acceptance Criteria:**

**Given** I need to store strategy data
**When** I define the Prisma schema
**Then** I create a Strategy model with the following fields:
```prisma
model Strategy {
  id                String   @id @default(cuid())
  tenantId          String
  userId            String
  title             String
  brandName         String
  status            StrategyStatus @default(DRAFT)
  generationMode    GenerationMode
  coherenceScore    Int?
  
  // 6 Pillar Content (stored as JSON)
  authenticite      Json?
  distinction       Json?
  valeur            Json?
  engagement        Json?
  risk              Json?
  track             Json?
  
  // Interview Framework Data
  ikigaiData        Json?
  schwartzData      Json?
  heroJourneyData   Json?
  aaarrrData        Json?
  
  // Meta Variables
  metaVariables     Json?
  
  // Progress Tracking
  completedPillars  String[]
  generationProgress Int @default(0)
  
  // Timestamps
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  completedAt       DateTime?
  
  // Relations
  tenant            Tenant   @relation(fields: [tenantId], references: [id])
  user              User     @relation(fields: [userId], references: [id])
  
  @@index([tenantId])
  @@index([userId])
  @@index([status])
}

enum StrategyStatus {
  DRAFT
  GENERATING
  COMPLETED
  ARCHIVED
}

enum GenerationMode {
  WIZARD
  AI_COPILOT
}
```

**Given** the Strategy model is defined
**When** I create the database migration
**Then** I run `npx prisma migrate dev --name add_strategy_model`
**And** the migration creates the Strategy table with all fields
**And** indexes are created on tenantId, userId, and status for query performance
**And** foreign key constraints are established for tenant and user relations

**Given** I need to query strategies efficiently
**When** I review the indexes
**Then** tenantId index enables fast tenant-scoped queries (multi-tenancy)
**And** userId index enables fast "my strategies" queries
**And** status index enables fast filtering by DRAFT, GENERATING, COMPLETED, ARCHIVED

**Given** I want to store pillar content as structured data
**When** I use Json type for pillar fields
**Then** each pillar can store complex nested objects
**And** the structure is flexible for future schema changes
**And** JSON validation happens at application layer (not database)

**Given** I want to track generation progress
**When** I use completedPillars array and generationProgress integer
**Then** completedPillars stores array like ["authenticite", "distinction"]
**And** generationProgress is percentage (0-100)
**And** these fields enable real-time progress UI

**Given** I need to generate Prisma Client types
**When** I run `npx prisma generate`
**Then** TypeScript types are generated for Strategy model
**And** I can use type-safe queries like `prisma.strategy.create()`
**And** Zod schemas can be derived from Prisma types

**Given** I want to test the schema
**When** I create a test strategy via Prisma Studio
**Then** I can manually insert a Strategy record
**And** all fields are editable
**And** JSON fields accept valid JSON objects
**And** enums show dropdown with DRAFT/GENERATING/COMPLETED/ARCHIVED options

**Given** multi-tenancy is critical
**When** I query strategies
**Then** the RLS middleware from Epic 1 Story 1.3 automatically filters by tenantId
**And** users can only see strategies in their tenant
**And** cross-tenant data leaks are prevented

---

### Story 3.2: Strategy Creation Form and Wizard Mode UI

As an **authenticated user (Amina)**,
I want **to create a new strategy using a step-by-step wizard form**,
So that **I can input brand information systematically before AI generation**.

**Acceptance Criteria:**

**Given** I am logged in and on the dashboard at `/dashboard`
**When** I click "Create New Strategy" button
**Then** I am redirected to `/strategies/new`
**And** I see a multi-step wizard interface
**And** the wizard shows progress: "Step 1 of 4" or similar

**Given** I am on Step 1 of the wizard
**When** I view the form
**Then** I see the heading: "Basic Information"
**And** I see input fields:
- Brand Name (text, required)
- Strategy Title (text, optional, auto-generated from brand name if empty)
- Industry/Sector (dropdown, required: Fashion, Fintech, FMCG, B2B SaaS, Other)
- Brief Description (textarea, optional, max 500 characters)
**And** I see "Next" button (disabled until required fields filled)

**Given** I fill out Step 1 with valid data
**When** I click "Next"
**Then** the form validates all required fields
**And** if valid, I proceed to Step 2
**And** the data is saved as draft to database (auto-save)
**And** the wizard progress updates to "Step 2 of 4"

**Given** I am on Step 2: "Generation Mode Selection"
**When** I view the options
**Then** I see two mode cards:
- **Wizard Mode**: "Answer structured questions step-by-step"
- **AI Co-Pilot Mode**: "Have a conversational dialogue with AI"
**And** each card has a description explaining the difference
**And** I can select one mode (radio buttons or card selection)
**And** Wizard Mode is pre-selected by default

**Given** I select Wizard Mode
**When** I click "Next"
**Then** generationMode is saved as "WIZARD" in database
**And** I proceed to Step 3: Interview Frameworks
**And** the wizard progress updates to "Step 3 of 4"

**Given** I select AI Co-Pilot Mode
**When** I click "Next"
**Then** generationMode is saved as "AI_COPILOT"
**And** I proceed to conversational AI interface (Story 3.4)
**And** the wizard exits to AI chat mode

**Given** I am on Step 3: "Interview Frameworks" (Wizard Mode)
**When** I view the page
**Then** I see tabs or accordion sections for:
- Ikigai Framework
- Schwartz Values
- Hero's Journey
- AARRR Funnel
**And** I can navigate between frameworks
**And** each framework has structured input fields (Story 3.3)

**Given** I complete interview frameworks
**When** I click "Next"
**Then** all framework data is saved to database as JSON
**And** I proceed to Step 4: Review & Generate
**And** the wizard progress updates to "Step 4 of 4"

**Given** I am on Step 4: "Review & Generate"
**When** I view the summary
**Then** I see a review of all inputs:
- Brand name, industry, description
- Selected generation mode
- Completed interview frameworks (checkmarks for each)
**And** I see a prominent "Generate Strategy" button
**And** I see an "Edit" link for each section to go back

**Given** I review my inputs and find a mistake
**When** I click "Edit" on a specific section
**Then** I navigate back to that wizard step
**And** I can modify the data
**And** I can return to Review step

**Given** everything looks correct
**When** I click "Generate Strategy"
**Then** the strategy status changes to "GENERATING"
**And** I am redirected to `/strategies/{strategyId}/generating`
**And** I see the real-time progress interface (Story 3.7)
**And** AI generation begins asynchronously

**Given** I want to save progress without generating
**When** I click "Save as Draft" at any step
**Then** the strategy is saved with status "DRAFT"
**And** I am redirected to dashboard
**And** I see the draft strategy in "My Strategies" list
**And** I can resume editing later

**Given** I want to cancel strategy creation
**When** I click "Cancel" or navigate away
**Then** I see confirmation: "You have unsaved changes. Discard draft?"
**And** if I confirm, the draft is deleted (or kept as DRAFT with user choice)
**And** if I cancel, I stay on the current wizard step

**Given** the wizard UI is implemented
**When** I review the design
**Then** it uses shadcn/ui components (Card, Button, Input, Textarea, Select)
**And** it's responsive (works on desktop 1920×1080 and laptop 1366×768)
**And** it has keyboard navigation (Tab to move, Enter to proceed)
**And** it shows validation errors inline (red borders, error messages)
**And** it has smooth transitions between steps (Framer Motion)

**Given** auto-save is implemented
**When** I fill out form fields
**Then** data is debounced and saved every 2 seconds
**And** I see a "Saved" indicator when auto-save completes
**And** if I refresh the page, my data is preserved
**And** I can continue where I left off

---

### Story 3.3: Interview Framework Data Collection (Ikigai, Schwartz, Hero's Journey, AARRR)

As an **authenticated user (Amina)**,
I want **to input client interview data using structured frameworks**,
So that **the AI has rich context to generate personalized brand strategies**.

**Acceptance Criteria:**

**Given** I am on Step 3 of the Wizard (Interview Frameworks)
**When** I view the Ikigai tab
**Then** I see a form with 4 sections:
1. **What you love**: Textarea, "What does the brand/founder truly love doing?"
2. **What you're good at**: Textarea, "What unique skills or expertise does the brand have?"
3. **What the world needs**: Textarea, "What problem does the brand solve?"
4. **What you can be paid for**: Textarea, "What value proposition makes customers willing to pay?"
**And** each section has placeholder text with examples
**And** each textarea has character counter (e.g., "150/500 characters")

**Given** I fill out the Ikigai framework
**When** I complete all 4 fields
**Then** the data is validated (min 50 characters per field for quality)
**And** the data is saved to strategy.ikigaiData as JSON:
```json
{
  "whatYouLove": "...",
  "whatYoureGoodAt": "...",
  "whatTheWorldNeeds": "...",
  "whatYouCanBePaidFor": "..."
}
```
**And** a checkmark appears on the Ikigai tab indicating completion

**Given** I am on the Schwartz Values tab
**When** I view the form
**Then** I see a checklist of Schwartz value categories:
- Self-Direction (independence, creativity)
- Stimulation (excitement, novelty)
- Hedonism (pleasure, enjoyment)
- Achievement (success, competence)
- Power (prestige, control)
- Security (safety, stability)
- Conformity (obedience, self-discipline)
- Tradition (respect, commitment)
- Benevolence (helpfulness, honesty)
- Universalism (equality, justice)
**And** I can select multiple values (checkboxes)
**And** I see descriptions for each value on hover or expandable

**Given** I select Schwartz values
**When** I check relevant values (e.g., Achievement, Benevolence, Universalism)
**Then** the selections are saved to strategy.schwartzData as JSON:
```json
{
  "selectedValues": ["achievement", "benevolence", "universalism"],
  "primaryValue": "achievement"
}
```
**And** I can designate one as "Primary Value" (most important)
**And** a checkmark appears on the Schwartz Values tab

**Given** I am on the Hero's Journey tab
**When** I view the form
**Then** I see input fields for key Hero's Journey stages:
1. **Ordinary World**: "Where is the customer before discovering the brand?"
2. **Call to Adventure**: "What problem or desire triggers the journey?"
3. **Meeting the Mentor**: "How does the brand guide the customer?"
4. **Crossing the Threshold**: "What's the first step the customer takes?"
5. **Trials & Challenges**: "What obstacles does the customer face?"
6. **Reward**: "What transformation or benefit does the customer gain?"
7. **Return with Elixir**: "How does the customer's life improve?"
**And** each field is a textarea with examples

**Given** I complete the Hero's Journey framework
**When** I fill out at least 4 of 7 stages (flexible requirement)
**Then** the data is saved to strategy.heroJourneyData as JSON
**And** a checkmark appears on the Hero's Journey tab

**Given** I am on the AARRR Funnel tab
**When** I view the form
**Then** I see input fields for each funnel stage:
1. **Acquisition**: "How do customers discover the brand?"
2. **Activation**: "What's the first valuable action they take?"
3. **Retention**: "How do you keep customers engaged?"
4. **Revenue**: "How do customers pay and generate revenue?"
5. **Referral**: "How do customers become advocates and refer others?"
**And** each field is a textarea with prompts

**Given** I complete the AARRR framework
**When** I fill out all 5 stages
**Then** the data is saved to strategy.aaarrrData as JSON
**And** a checkmark appears on the AARRR Funnel tab

**Given** I want help understanding a framework
**When** I click an "Info" icon or "Learn More" link
**Then** I see a modal or tooltip explaining the framework
**And** it includes examples from real brands
**And** it provides tips for effective answers

**Given** I want to skip a framework
**When** I leave a framework incomplete
**Then** I can still proceed to the next step (frameworks are optional but recommended)
**And** I see a warning: "Completing all frameworks improves AI generation quality"
**And** incomplete frameworks are marked with a dash icon (not checkmark)

**Given** all framework data is collected
**When** I review the data structure
**Then** all framework data is stored in separate JSON fields (ikigaiData, schwartzData, etc.)
**And** the JSON is validated for correct structure before save
**And** the data is accessible for AI prompts in Story 3.5

**Given** I return to edit a completed framework
**When** I navigate back to a framework tab
**Then** I see my previously entered data pre-filled
**And** I can edit any field
**And** changes are auto-saved

**Given** the framework UI is built
**When** I review the implementation
**Then** it uses shadcn/ui Tabs component for framework navigation
**And** it uses Textarea and Checkbox components for inputs
**And** it has clear visual indicators (checkmarks, dashes, character counters)
**And** it includes help text and tooltips for guidance
**And** it's fully keyboard accessible (Tab navigation, Enter to submit)

---

(Continuing with Stories 3.4 through 3.8 - due to length, I'll append these in the next command)

### Story 3.4: AI Co-Pilot Mode with Streaming Responses

As an **authenticated user (Amina)**,
I want **to have a conversational dialogue with an AI co-pilot to create my strategy**,
So that **I can provide high-level input and let the AI guide me through the process naturally**.

**Acceptance Criteria:**

**Given** I selected "AI Co-Pilot Mode" in Step 2 of the wizard
**When** I proceed from mode selection
**Then** I am redirected to `/strategies/{strategyId}/copilot`
**And** I see a chat interface with AI co-pilot
**And** the first message from AI appears: "Hi! I'm your ADVERT co-pilot. Let's create a strategy for [Brand Name]. Tell me about the brand - what makes it unique?"

**Given** I am in the AI Co-Pilot chat interface
**When** I view the UI
**Then** I see:
- Chat message history (scrollable)
- Message input textarea at the bottom
- "Send" button
- Typing indicator when AI is responding
- Strategy sidebar showing progress (pillars completed)
**And** the interface resembles a conversational chat (like ChatGPT)

**Given** I type a message and send it
**When** I click "Send" or press Enter
**Then** my message appears in the chat immediately
**And** the AI co-pilot starts generating a response
**And** I see a typing indicator: "AI is thinking..."
**And** the response streams in word-by-word (not all at once)

**Given** the AI is generating a response
**When** I watch the streaming
**Then** words appear progressively using Vercel AI SDK streaming
**And** the streaming is smooth (not jarring chunks)
**And** I can see the response being composed in real-time
**And** the first token appears within 500ms (NFR-P3)

**Given** the AI asks me a question
**When** I read the response
**Then** the AI uses a conversational, bienveillant tone (not robotic)
**And** the AI asks follow-up questions to gather framework data
**And** the AI guides me through Ikigai, Schwartz, Hero's Journey, AARRR naturally
**And** the AI doesn't explicitly mention "frameworks" - it just asks contextual questions

**Given** I provide information in conversation
**When** the AI extracts insights
**Then** the AI populates the strategy's framework data (ikigaiData, schwartzData, etc.) in the background
**And** I see subtle indicators in the sidebar: "Ikigai ✓", "Schwartz ✓"
**And** the AI confirms understanding: "Got it! So the brand's core purpose is..."

**Given** the conversation progresses
**When** the AI has enough information
**Then** the AI asks: "I have enough context now. Should I generate your 6-pillar strategy?"
**And** I can respond "Yes" or ask more questions
**And** if I say "Yes", the AI triggers strategy generation (Story 3.5)

**Given** I want to start generation immediately
**When** I type commands like "generate now" or "let's start"
**Then** the AI confirms and initiates generation
**And** I am transitioned to the progress tracking view (Story 3.7)

**Given** the AI co-pilot is conversational
**When** I review sample dialogues
**Then** the AI uses phrases like:
- "Tell me more about..."
- "Interesting! What about..."
- "I'm sensing that... Is that right?"
- "Perfect! That helps me understand..."
**And** the tone is supportive, not interrogative
**And** the AI adapts to my communication style

**Given** I provide vague or insufficient answers
**When** the AI detects gaps
**Then** the AI asks clarifying questions
**And** the AI provides examples to help me elaborate
**And** the AI doesn't proceed until it has quality information

**Given** I want to see what data has been collected
**When** I click "View Data" in the sidebar
**Then** I see a summary of extracted framework data
**And** I can edit or add to the data directly
**And** I can return to the conversation

**Given** the AI Co-Pilot is implemented
**When** I review the technical implementation
**Then** it uses Vercel AI SDK (@ai-sdk/anthropic or @ai-sdk/openai)
**And** it uses streaming responses via `streamText()` function
**And** the chat UI uses `useChat()` hook from Vercel AI SDK
**And** messages are stored in database (chat history persists)
**And** the AI prompt includes instructions to extract framework data and populate JSON

**Given** the AI extracts framework data
**When** I review the prompt engineering
**Then** the system prompt instructs the AI to:
- Ask questions naturally to gather Ikigai, Schwartz, Hero's Journey, AARRR data
- Populate the strategy's JSON fields as data is collected
- Confirm understanding and summarize insights
- Trigger generation when ready
**And** the prompt emphasizes conversational tone (bienveillant, not robotic)

**Given** I want to switch to Wizard Mode mid-conversation
**When** I click "Switch to Wizard Mode"
**Then** the extracted data is preserved
**And** I am redirected to the Wizard interface
**And** the framework tabs are pre-filled with extracted data
**And** I can continue in structured mode

**Given** the chat interface is built
**When** I review the UI
**Then** it uses shadcn/ui components (ScrollArea, Button, Textarea)
**And** it has smooth auto-scroll to latest message
**And** it displays user messages right-aligned, AI messages left-aligned
**And** it shows timestamps for each message
**And** it's responsive and works on desktop and tablet

---

### Story 3.5: 6-Pillar AI Generation Engine (Authenticité, Distinction, Valeur, Engagement, Risk, Track)

As an **authenticated user (Amina)**,
I want **the AI to generate a complete 6-pillar strategy based on my inputs**,
So that **I receive a sophisticated brand strategy in under 10 minutes**.

**Acceptance Criteria:**

**Given** I have completed data collection (Wizard or AI Co-Pilot Mode)
**When** I click "Generate Strategy"
**Then** the strategy status changes to "GENERATING"
**And** the generation process begins asynchronously
**And** I am shown the real-time progress interface (Story 3.7)

**Given** the generation process starts
**When** the backend receives the generation request
**Then** it creates an Inngest background job: "strategy.generate"
**And** the job receives the strategyId and all input data
**And** the job priority is based on user subscription tier (Professional > Starter)

**Given** the Inngest job is processing
**When** the AI generation begins
**Then** the system generates each pillar sequentially: Authenticité → Distinction → Valeur → Engagement → Risk → Track
**And** each pillar generation is a separate AI API call
**And** the order is enforced (A before D before V before E before R before T)

**Given** the Authenticité pillar is being generated
**When** the AI prompt is constructed
**Then** it includes:
- Brand name and description
- Ikigai data (what you love, good at, world needs, can be paid for)
- Schwartz values (selected values and primary value)
- Industry/sector context
**And** the prompt instructs the AI to output structured JSON for Authenticité:
```json
{
  "pillarName": "Authenticité",
  "summary": "Brief summary of brand authenticity...",
  "coreIdentity": {
    "mission": "...",
    "vision": "...",
    "values": ["...", "...", "..."]
  },
  "brandStory": "Narrative about brand origins and purpose...",
  "schwartzValueAlignment": "How the brand aligns with selected Schwartz values...",
  "ikigaiInsight": "Insight from Ikigai framework..."
}
```

**Given** Authenticité is generated
**When** the AI API call completes
**Then** the response is parsed and validated as JSON
**And** the JSON is stored in strategy.authenticite field
**And** "authenticite" is added to strategy.completedPillars array
**And** strategy.generationProgress is updated to ~17% (1 of 6 pillars)
**And** a real-time update is sent to the frontend via WebSocket or polling

**Given** the Distinction pillar is being generated
**When** the AI prompt is constructed
**Then** it includes:
- All previous pillar data (Authenticité)
- Hero's Journey data (customer journey stages)
- AARRR funnel data
**And** the prompt instructs the AI to output structured JSON for Distinction:
```json
{
  "pillarName": "Distinction",
  "summary": "What makes the brand unique...",
  "targetAudience": {
    "personas": [
      {
        "name": "Persona 1",
        "demographics": "...",
        "psychographics": "...",
        "painPoints": ["...", "..."],
        "goals": ["...", "..."]
      }
    ]
  },
  "competitiveAdvantage": "What sets the brand apart...",
  "positioningStatement": "For [target] who [need], [brand] is [category] that [benefit].",
  "heroJourneyInsight": "How the customer journey informs distinction..."
}
```

**Given** each pillar is generated sequentially
**When** all 6 pillars complete
**Then** the strategy has:
- Authenticité (identity, values, story)
- Distinction (personas, positioning, competitive advantage)
- Valeur (value proposition, benefits, pricing strategy)
- Engagement (rituals, campaigns, touchpoints, calendar)
- Risk (SWOT analysis, challenges, mitigation strategies)
- Track (KPIs, superfan metrics, measurement plan)
**And** each pillar is stored as structured JSON
**And** strategy.generationProgress reaches 100%
**And** strategy.status changes to "COMPLETED"
**And** strategy.completedAt is set to current timestamp

**Given** the AI generation respects the <10 minute NFR (NFR-P1)
**When** I monitor generation time
**Then** total time from start to completion is <10 minutes (target: 8 minutes average)
**And** each pillar takes approximately 1-1.5 minutes
**And** if generation exceeds 10 minutes, an error is logged (but generation continues)

**Given** the AI generation uses appropriate models
**When** I review the implementation
**Then** it uses Claude Sonnet 3.5 or GPT-4 for generation (high quality)
**And** it uses streaming for real-time feedback (even though final output is batch)
**And** API calls include temperature=0.7 for creative but consistent output
**And** API calls include max_tokens appropriate for each pillar (~2000-3000 tokens per pillar)

**Given** the AI generation can fail
**When** an API call fails (rate limit, timeout, error)
**Then** the Inngest job retries up to 2 times with exponential backoff
**And** if all retries fail, strategy.status is set to "DRAFT" (not "COMPLETED")
**And** an error notification is sent to the user
**And** the user can manually retry generation from the failed pillar

**Given** the AI generation respects rate limits
**When** multiple users generate simultaneously
**Then** the system queues requests in FIFO order
**And** tier-based prioritization applies (Professional tier > Starter tier)
**And** the queue depth is monitored (NFR-SC3: handle 100 concurrent generations)

**Given** the generation completes successfully
**When** the final pillar (Track) is saved
**Then** a completion notification is sent to the user (email via Resend)
**And** the email says: "Your ADVERT strategy for [Brand Name] is ready!"
**And** the email includes a link to view the strategy

**Given** the generation is complete
**When** I review the generated strategy
**Then** I see all 6 pillars with rich, structured content
**And** the content is coherent across pillars (Distinction references Authenticité, etc.)
**And** the quality is 80%+ usable (NFR-P1: 80%+ directly usable content)
**And** the content incorporates all framework data provided

**Given** the AI prompts are engineered carefully
**When** I review the prompt templates
**Then** each pillar has a detailed system prompt with:
- Role definition ("You are a senior brand strategist...")
- Output format specification (JSON schema)
- Tone guidelines (sophisticated, professional, actionable)
- Context from previous pillars
- Framework data integration instructions
**And** prompts are stored in `/src/lib/ai/prompts/` directory
**And** prompts are version-controlled and testable

---

(Continuing with remaining stories...)

### Story 3.6: Context-Adaptive Meta-Variable Generation

As an **authenticated user (Amina)**,
I want **the AI to generate meta-variables that adapt to my brand's sector and context**,
So that **the strategy includes industry-specific variables beyond the core 6 pillars**.

**Acceptance Criteria:**

**Given** I selected an industry/sector (e.g., "Fashion")
**When** the AI generates the strategy
**Then** it also generates meta-variables specific to that sector
**And** meta-variables are stored in strategy.metaVariables as JSON

**Given** the sector is "Fashion"
**When** meta-variables are generated
**Then** they include fashion-specific variables like:
```json
{
  "seasonalTrends": ["Spring/Summer 2026 trends", "Fall/Winter 2026 trends"],
  "sustainabilityPractices": ["Eco-friendly materials", "Circular fashion"],
  "influencerStrategy": ["Micro-influencer partnerships", "Celebrity endorsements"],
  "retailChannels": ["E-commerce", "Pop-up stores", "Flagship boutiques"],
  "pricePositioning": "Premium"
}
```

**Given** the sector is "Fintech"
**When** meta-variables are generated
**Then** they include fintech-specific variables like:
```json
{
  "regulatoryCompliance": ["PCI DSS", "GDPR", "Local banking regulations"],
  "securityMeasures": ["2FA", "Encryption", "Fraud detection"],
  "userOnboarding": ["KYC process", "Identity verification"],
  "paymentMethods": ["Credit card", "Mobile money", "Bank transfer"],
  "trustSignals": ["Security badges", "Customer testimonials", "Certifications"]
}
```

**Given** the sector is "FMCG"
**When** meta-variables are generated
**Then** they include FMCG-specific variables like:
```json
{
  "distributionChannels": ["Supermarkets", "Convenience stores", "Online delivery"],
  "packagingStrategy": ["Eco-friendly packaging", "Portion sizes"],
  "shelfPresence": ["Eye-level placement", "Promotional displays"],
  "samplingStrategy": ["In-store tastings", "Free samples with purchase"],
  "loyaltyPrograms": ["Points system", "Exclusive offers"]
}
```

**Given** the sector is "B2B SaaS"
**When** meta-variables are generated
**Then** they include SaaS-specific variables like:
```json
{
  "pricingModel": ["Subscription tiers", "Usage-based pricing", "Enterprise contracts"],
  "salesCycle": ["Self-service signup", "Sales-led demos", "Pilot programs"],
  "integrations": ["API ecosystem", "Native integrations", "Zapier/webhooks"],
  "customerSuccess": ["Onboarding program", "Account management", "Support SLA"],
  "churnPrevention": ["Health scores", "Proactive outreach", "Feature adoption"]
}
```

**Given** meta-variables are generated
**When** I view the strategy
**Then** meta-variables are displayed in a dedicated section
**And** they enhance the core 6 pillars with sector-specific insights
**And** they're editable (I can modify generated meta-variables)

**Given** the AI generates meta-variables
**When** I review the prompt engineering
**Then** the AI prompt includes:
- Sector/industry context
- Instruction to generate 5-10 relevant meta-variables
- Examples of meta-variables for that sector
- JSON schema for output format
**And** the AI generates variables that are actionable and specific (not generic)

**Given** the sector is "Other" (not predefined)
**When** meta-variables are generated
**Then** the AI generates generic but useful variables like:
```json
{
  "marketingChannels": ["...", "..."],
  "customerAcquisition": ["...", "..."],
  "brandDifferentiators": ["...", "..."],
  "growthStrategies": ["...", "..."]
}
```
**And** the variables are still contextual based on brand description

**Given** meta-variables enhance strategy depth
**When** I compare strategies with and without meta-variables
**Then** meta-variables add 20-30% more actionable insights
**And** they make the strategy feel tailored to the specific industry
**And** they provide concrete implementation ideas beyond high-level pillars

**Given** meta-variables are stored as JSON
**When** I access them programmatically
**Then** I can use them in exports (PDF, Excel, PowerPoint)
**And** I can display them in the strategy view UI
**And** I can edit them via a form interface

**Given** meta-variable generation can be enhanced over time
**When** I review the system
**Then** new sectors can be added by updating prompt templates
**And** meta-variable schemas can evolve without database migrations (JSON flexibility)
**And** user feedback can inform better meta-variable generation

---

### Story 3.7: Real-Time Progress Tracking and Completion Notifications

As an **authenticated user (Amina)**,
I want **to see real-time progress as my strategy is being generated**,
So that **I know the AI is working and can estimate when it will be ready**.

**Acceptance Criteria:**

**Given** I initiated strategy generation
**When** I am redirected to `/strategies/{strategyId}/generating`
**Then** I see a progress tracking interface
**And** the page displays:
- Overall progress percentage (0-100%)
- Visual progress bar
- Current pillar being generated
- List of 6 pillars with status indicators (pending, in-progress, completed)
- Estimated time remaining

**Given** generation just started
**When** the page loads
**Then** I see progress at 0%
**And** all pillars show "pending" status (gray icons)
**And** the current pillar is "Authenticité" with "in-progress" status (blue spinning icon)
**And** estimated time shows: "~8 minutes remaining"

**Given** the Authenticité pillar is being generated
**When** I watch the progress
**Then** I see the pillar name: "Authenticité" with a spinning loader icon
**And** the progress bar fills to ~17% when completed
**And** the pillar icon changes from spinning to checkmark (green)
**And** the next pillar "Distinction" starts (spinning icon)

**Given** progress updates occur
**When** the backend completes each pillar
**Then** the frontend receives real-time updates
**And** updates happen via one of these methods:
  - WebSocket connection for real-time push
  - Server-Sent Events (SSE) for streaming updates
  - Polling every 2 seconds as fallback
**And** the UI updates smoothly without page refresh

**Given** I am watching progress
**When** pillar generation progresses
**Then** I see updates like:
- "Authenticité - Completed ✓" (0:00-1:30)
- "Distinction - In Progress..." (1:30-3:00)
- "Distinction - Completed ✓" (3:00)
- "Valeur - In Progress..." (3:00-4:30)
- And so on through all 6 pillars

**Given** each pillar completes
**When** the progress updates
**Then** the progress percentage increases: 0% → 17% → 33% → 50% → 67% → 83% → 100%
**And** the estimated time remaining decreases
**And** the visual progress bar animates smoothly (Framer Motion)

**Given** generation is complete (100%)
**When** all 6 pillars are generated
**Then** I see a success message: "Strategy completed! 🎉"
**And** I see a "View Strategy" button
**And** I see confetti animation or subtle celebration (Framer Motion)
**And** the strategy status in database is "COMPLETED"

**Given** generation completes
**When** I click "View Strategy"
**Then** I am redirected to `/strategies/{strategyId}`
**And** I see the full generated strategy with all 6 pillars
**And** each pillar is expandable/collapsible

**Given** I receive a completion notification
**When** generation finishes
**Then** an email is sent via Resend to my registered email
**And** the email subject is: "Your ADVERT strategy for [Brand Name] is ready!"
**And** the email body includes:
- Confirmation that generation is complete
- Link to view the strategy: `https://advert.app/strategies/{strategyId}`
- Summary: "Your strategy includes 6 comprehensive pillars..."
**And** the email uses a branded template (React Email component)

**Given** I navigate away during generation
**When** I leave the progress page
**Then** generation continues in the background (Inngest job doesn't stop)
**And** I can return to `/strategies/{strategyId}/generating` anytime
**And** the progress page shows current status when I return

**Given** I close the browser during generation
**When** I return later and log in
**Then** I receive the email notification if generation completed
**And** I can navigate to the strategy and see it's completed
**And** I don't miss the completed strategy even if I wasn't watching

**Given** generation fails at a specific pillar
**When** an error occurs
**Then** the progress UI shows error state: "Generation failed at [Pillar Name]"
**And** I see an error message explaining what happened
**And** I see a "Retry Generation" button
**And** I can click retry to resume from the failed pillar

**Given** I click "Retry Generation"
**When** the retry is initiated
**Then** generation resumes from the failed pillar
**And** previously completed pillars are not regenerated
**And** the progress UI updates to show retry in progress

**Given** the progress UI is implemented
**When** I review the design
**Then** it uses shadcn/ui components (Progress, Card, Badge)
**And** it uses Framer Motion for smooth animations
**And** it has a clean, modern design
**And** it's responsive (works on desktop and tablet)
**And** it has keyboard accessibility (can tab through elements)

**Given** real-time updates are implemented
**When** I review the technical implementation
**Then** it uses Server-Sent Events (SSE) or WebSocket for real-time push
**And** the backend sends events when:
  - A pillar starts generating (status: "in-progress")
  - A pillar completes (status: "completed", progress: +17%)
  - Generation completes (status: "completed", progress: 100%)
  - An error occurs (status: "error", pillarName: "...")
**And** the frontend listens for these events and updates UI reactively

---

### Story 3.8: Interview Framework Template Downloads (PDF/In-App Guides)

As an **authenticated user (Amina)**,
I want **to download interview framework templates as PDF guides**,
So that **I can conduct client interviews offline and input data later**.

**Acceptance Criteria:**

**Given** I am on the strategy creation wizard (Step 3: Interview Frameworks)
**When** I view the page
**Then** I see a "Download Templates" button or link
**And** clicking it opens a modal with download options

**Given** I click "Download Templates"
**When** the modal opens
**Then** I see options to download:
- All Frameworks (Combined PDF)
- Ikigai Framework (Individual PDF)
- Schwartz Values (Individual PDF)
- Hero's Journey (Individual PDF)
- AARRR Funnel (Individual PDF)
**And** each option has a download icon

**Given** I click "Download All Frameworks"
**When** the download initiates
**Then** a PDF file is generated and downloaded
**And** the filename is: `ADVERT_Interview_Frameworks_Guide.pdf`
**And** the PDF is professionally formatted with branding

**Given** I open the combined PDF
**When** I review the content
**Then** it includes:
- Cover page with ADVERT branding and title: "Interview Framework Guide"
- Introduction explaining the purpose of frameworks
- Section 1: Ikigai Framework
  - Explanation of Ikigai
  - 4 questions with space for answers
  - Examples from real brands
- Section 2: Schwartz Values
  - Explanation of Schwartz Value Theory
  - List of 10 value categories with descriptions
  - Checkboxes to select relevant values
  - Space to designate primary value
- Section 3: Hero's Journey
  - Explanation of Hero's Journey framework
  - 7 stages with questions and answer space
  - Visual diagram of the journey
- Section 4: AARRR Funnel
  - Explanation of AARRR (Pirate Metrics)
  - 5 stages with questions and answer space
  - Funnel diagram
- Instructions: "Complete these frameworks with your client, then input the data into ADVERT for AI-powered strategy generation"

**Given** I download an individual framework PDF
**When** I open the file
**Then** it contains only that specific framework
**And** the filename is descriptive: `Ikigai_Framework.pdf`, `Schwartz_Values.pdf`, etc.
**And** the formatting is consistent with the combined PDF

**Given** the PDF templates are generated
**When** I review the implementation
**Then** PDFs are generated using a library like:
  - `@react-pdf/renderer` (React-based PDF generation)
  - OR pre-generated static PDFs stored in `/public/templates/`
**And** if dynamic, PDFs can include user's brand name or customization
**And** PDFs are cached for performance (don't regenerate on every download)

**Given** I want in-app guidance instead of PDFs
**When** I view each framework tab
**Then** I see expandable "How to use this framework" sections
**And** each section includes:
- What the framework is
- Why it's valuable
- How to complete it effectively
- Examples from successful brands
**And** this guidance is built into the UI (not just in PDF)

**Given** I want examples while filling out forms
**When** I click "Show Example" on a framework field
**Then** I see a tooltip or popover with an example answer
**And** the example is industry-relevant (fashion example for fashion brand, etc.)
**And** the example helps me understand the expected quality and depth

**Given** I conduct a client interview offline using the PDF
**When** I complete the frameworks on paper
**Then** I can manually input the data into the wizard later
**And** the form fields match the PDF questions exactly
**And** I can copy-paste or type responses from my notes

**Given** the templates enhance user onboarding
**When** new users create their first strategy
**Then** the templates help them understand what information is needed
**And** the templates serve as a structured interview guide
**And** the templates reduce confusion and improve data quality

**Given** PDFs are branded
**When** I review the design
**Then** PDFs include:
- ADVERT logo in header
- Brand colors (matching web app)
- Professional typography
- Clear section headers and spacing
- Footer with website URL and copyright
**And** the design is print-friendly (black text on white background)

**Given** I want to share templates with team members
**When** I download the PDF
**Then** I can email it to colleagues or clients
**And** the PDF is self-contained (no login required to view)
**And** the PDF includes instructions for using with ADVERT

**Given** the download feature is implemented
**When** I review the technical details
**Then** download button triggers PDF generation/retrieval
**And** PDF is served with correct MIME type: `application/pdf`
**And** download is tracked in analytics (to measure feature usage)
**And** error handling exists if PDF generation fails

---

## Epic 4: Strategy Management & Editing

**Goal:** Provide comprehensive strategy portfolio management with intuitive editing, organization, and version control.

**User Outcome:** Amina can view all her strategies in a dashboard, edit content with collapsible pillar sections, save changes, duplicate successful strategies as templates, archive old work, and maintain organized portfolio.

---

### Story 4.1: Strategy Dashboard and List View with Filtering/Sorting

As an **authenticated user (Amina)**,
I want **to view all my strategies in a dashboard with filtering and sorting options**,
So that **I can easily find and manage my strategy portfolio**.

**Acceptance Criteria:**

**Given** I am logged in
**When** I navigate to `/dashboard` or `/strategies`
**Then** I see a strategy dashboard page
**And** the page displays:
- Page title: "My Strategies"
- "Create New Strategy" button (prominent, top-right)
- Strategy list/grid view
- Filter controls (status, date, brand name)
- Sort controls (date created, date updated, brand name)
- Search bar

**Given** I have created multiple strategies
**When** I view the strategy list
**Then** I see each strategy as a card or row displaying:
- Brand name (bold, prominent)
- Strategy title
- Status badge (DRAFT, GENERATING, COMPLETED, ARCHIVED)
- Creation date ("Created 2 days ago")
- Last updated date ("Updated 1 hour ago")
- Coherence score (if completed, e.g., "Score: 85")
- Thumbnail or icon
- Action buttons: View, Edit, Archive/Unarchive, Delete

**Given** I have no strategies yet
**When** I view the dashboard
**Then** I see an empty state with:
- Illustration or icon
- Message: "You haven't created any strategies yet"
- "Create Your First Strategy" button
- Link to "Learn how to use ADVERT" (optional tutorial)

**Given** I want to filter strategies by status
**When** I click the status filter dropdown
**Then** I see options: All, Draft, Generating, Completed, Archived
**And** I select "Completed"
**Then** only strategies with status="COMPLETED" are displayed
**And** the filter persists if I refresh the page (URL param or local storage)

**Given** I want to search for a specific strategy
**When** I type in the search bar
**Then** strategies are filtered in real-time by brand name or strategy title
**And** the search is case-insensitive
**And** matching text is highlighted in results

**Given** I want to sort strategies
**When** I click the sort dropdown
**Then** I see options: Newest First, Oldest First, Recently Updated, Brand Name (A-Z), Brand Name (Z-A)
**And** I select "Recently Updated"
**Then** strategies are reordered with most recently updated at the top
**And** the sort preference persists across sessions

**Given** I have many strategies (pagination needed)
**When** I scroll to the bottom of the list
**Then** I see "Load More" button or infinite scroll
**And** additional strategies load (20 per page)
**And** loading state shows skeleton loaders (not blank screen)

**Given** I click on a strategy card
**When** I click anywhere on the card (not action buttons)
**Then** I am navigated to `/strategies/{strategyId}` (detail view - Story 4.2)
**And** the strategy opens for viewing/editing

**Given** I click "Create New Strategy"
**When** the button is clicked
**Then** I am redirected to `/strategies/new` (wizard from Epic 3)
**And** a new strategy draft is created

**Given** I am on Starter tier with limits
**When** I view the dashboard
**Then** I see a notification: "You have 2 of 3 active strategies" (if applicable)
**And** if I reach the limit (3 active), "Create New Strategy" button shows: "Upgrade or Archive"
**And** clicking it shows modal: "You've reached your strategy limit. Archive an existing strategy or upgrade to Professional."

**Given** the dashboard is responsive
**When** I view on different screen sizes
**Then** on desktop: grid view with 3 columns
**And** on laptop (1366px): grid view with 2 columns
**And** on tablet: list view with 1 column
**And** the layout adapts smoothly

**Given** the dashboard has good UX
**When** I review the design
**Then** it uses shadcn/ui components (Card, Badge, Button, Input for search, Select for filters)
**And** it has smooth hover states on strategy cards
**And** it has skeleton loaders during data fetch
**And** it has keyboard navigation (Tab to navigate cards, Enter to open)

**Given** strategies are fetched from the database
**When** I review the implementation
**Then** it uses tRPC query: `strategies.list` with parameters (filter, sort, search, pagination)
**And** the query includes tenant filtering (automatic via RLS middleware)
**And** the query is optimized (only fetches necessary fields, not full pillar JSON)
**And** the result is cached for 30 seconds (React Query)

---


### Story 4.2: Strategy Detail View with Collapsible 6-Pillar Sections

As an **authenticated user (Amina)**,
I want **to view a strategy with all 6 pillars in an organized, collapsible layout**,
So that **I can focus on specific sections without being overwhelmed**.

**Acceptance Criteria:**

**Given** I navigated to a strategy
**When** I am on `/strategies/{strategyId}`
**Then** I see the strategy detail page
**And** the page displays:
- Strategy header (brand name, title, status, coherence score)
- Action buttons: Edit, Duplicate, Archive, Delete, Export
- 6 pillar sections (Authenticité, Distinction, Valeur, Engagement, Risk, Track)
- Meta-variables section (if generated)
- Sidebar with navigation anchors

**Given** I view the strategy header
**When** I look at the top of the page
**Then** I see:
- Brand name (large, bold)
- Strategy title (if different from brand name)
- Status badge (COMPLETED, DRAFT, etc.)
- Coherence score (if calculated): "Campaign Coherence Score: 85"
- Creation date and last updated date
- "Back to Dashboard" link or breadcrumb

**Given** I view the 6-pillar sections
**When** I scroll down
**Then** I see each pillar as a collapsible section:
1. **Authenticité**
2. **Distinction**
3. **Valeur**
4. **Engagement**
5. **Risk**
6. **Track**
**And** each pillar shows a summary line when collapsed
**And** each pillar has an expand/collapse icon (chevron)

**Given** all pillars are initially collapsed (default state)
**When** the page loads
**Then** I see all 6 pillar headers with summary lines
**And** I can see the full page structure at a glance
**And** no pillar content is visible (collapsed)

**Given** I want to expand a pillar
**When** I click on a pillar header (e.g., "Authenticité")
**Then** the pillar expands smoothly (animation)
**And** the chevron icon rotates from down to up
**And** the pillar content is displayed in full
**And** other pillars remain in their current state (collapsed or expanded)

**Given** I want to collapse an expanded pillar
**When** I click on the pillar header again
**Then** the pillar collapses smoothly
**And** the chevron rotates back to down
**And** only the summary line remains visible

**Given** I want to expand all pillars at once
**When** I click "Expand All" button (top of page)
**Then** all 6 pillars expand simultaneously
**And** I can see the full strategy content
**And** the button changes to "Collapse All"

**Given** I want to collapse all pillars
**When** I click "Collapse All"
**Then** all pillars collapse
**And** I return to the summary view

**Given** a pillar is expanded
**When** I view the content
**Then** I see the structured data from the pillar JSON:
- For **Authenticité**: mission, vision, values, brand story, Schwartz alignment, Ikigai insight
- For **Distinction**: personas, positioning statement, competitive advantage, Hero's Journey insight
- For **Valeur**: value proposition, benefits, pricing strategy
- For **Engagement**: rituals, campaigns, touchpoints, 12-month calendar
- For **Risk**: SWOT analysis, challenges, mitigation strategies
- For **Track**: KPIs, superfan metrics, measurement plan
**And** the content is formatted clearly (headings, bullet points, paragraphs)

**Given** I want to edit a pillar
**When** I click "Edit" button in a pillar section
**Then** the pillar switches to edit mode (Story 4.3)
**And** form fields appear for editing content

**Given** I want to navigate quickly between pillars
**When** I use the sidebar navigation
**Then** I see anchor links for each pillar
**And** clicking an anchor scrolls to that pillar and expands it
**And** the sidebar highlights the current section as I scroll

**Given** I view meta-variables
**When** I scroll to the Meta-Variables section (after Track pillar)
**Then** I see industry-specific variables generated by AI
**And** they are displayed in a structured format (key-value pairs or table)
**And** I can edit meta-variables if needed

**Given** the strategy detail page is responsive
**When** I view on different screen sizes
**Then** on desktop: full layout with sidebar
**And** on laptop/tablet: sidebar becomes collapsible drawer or top tabs
**And** on mobile: single column, no sidebar

**Given** the page has good performance (NFR-P3)
**When** I interact with collapsible sections
**Then** expand/collapse animations are smooth (<500ms)
**And** the page doesn't freeze or lag
**And** keyboard navigation works (Tab to pillar headers, Enter to expand/collapse)

**Given** the detail view is implemented
**When** I review the code
**Then** it uses shadcn/ui Collapsible or Accordion components
**And** it uses Framer Motion for smooth animations
**And** pillar content is rendered from JSON structure
**And** the tRPC query fetches full strategy data (including all pillar JSON)

---


### Story 4.3: In-Line Content Editing for All Pillar Fields
### Story 4.4: Auto-Save and Manual Save Functionality
### Story 4.5: Strategy Duplication as Template
### Story 4.6: Strategy Archiving with Tier Limits (Starter: 3 active)
### Story 4.7: Strategy Permanent Deletion with Confirmation

[Full acceptance criteria for stories 4.3-4.7 as generated above - content preserved from previous messages]

Epic 5: Export & Client Deliverables - 4 stories documented
Epic 6: Basic Analytics & Insights - 4 stories documented

---

## Epic 7: Payment & Subscription Management

**Goal:** Enable monetization through tiered SaaS subscriptions with African payment methods and robust billing management.

**User Outcome:** Users can subscribe to Starter or Professional tiers, pay via credit card or mobile money, manage billing history, update payment methods, upgrade/downgrade subscriptions, and handle payment failures gracefully.

---

### Story 7.1: Subscription Tier Selection and Pricing Display

As a **new or existing user (Amina)**,
I want **to view available subscription tiers with clear pricing and features**,
So that **I can choose the right plan for my business needs**.

**Acceptance Criteria:**

**Given** I am logged in and want to subscribe
**When** I navigate to `/pricing` or `/subscribe`
**Then** I see the pricing page
**And** the page displays:
- Page title: "Choose Your Plan"
- Tagline: "Unlock the full power of ADVERT"
- Three tier cards side by side: Free, Starter, Professional
- Annual vs. Monthly toggle (default: Monthly)
- "Contact Sales" button for Enterprise tier

**Given** I view the Free tier card
**When** I look at the first card
**Then** I see:
- Tier name: "Free" (with "Current Plan" badge if I'm on Free)
- Price: "€0 / month"
- Description: "Try ADVERT risk-free"
- Feature list:
  - ✓ 1 active strategy
  - ✓ AI-powered 6-pillar generation
  - ✓ Basic frameworks (Ikigai, Schwartz, Hero's Journey, AARRR)
  - ✓ PDF export
  - ✗ Excel export
  - ✗ Analytics dashboard
  - ✗ Priority support
- CTA button: "Get Started Free" (disabled if current plan)

**Given** I view the Starter tier card
**When** I look at the second card
**Then** I see:
- Tier name: "Starter" (with "Most Popular" badge)
- Price: "€99 / month" or "€79 / month" if annual selected (20% discount)
- Description: "For solo entrepreneurs and consultants"
- Feature list:
  - ✓ 3 active strategies
  - ✓ All AI generation features
  - ✓ PDF + Excel export
  - ✓ Basic analytics dashboard
  - ✓ Strategy duplication
  - ✓ Email support
  - ✗ Team collaboration
  - ✗ White-label exports
- CTA button: "Subscribe Now" or "Upgrade" (if on Free)
- Annual savings badge: "Save €240/year" (if annual toggle selected)

**Given** I view the Professional tier card
**When** I look at the third card
**Then** I see:
- Tier name: "Professional" (with "Best Value" badge if annual selected)
- Price: "€299 / month" or "€239 / month" if annual selected
- Description: "For agencies and growing teams"
- Feature list:
  - ✓ 20 active strategies
  - ✓ All AI generation features
  - ✓ PDF + Excel + white-label exports
  - ✓ Advanced analytics dashboard
  - ✓ Team collaboration (5 members)
  - ✓ Role-based permissions
  - ✓ Creative Concierge Marketplace access
  - ✓ Priority support
  - ✓ API access (coming soon)
- CTA button: "Subscribe Now" or "Upgrade" (if on Starter/Free)
- Annual savings badge: "Save €720/year"

**Given** I toggle between Monthly and Annual
**When** I click the toggle switch
**Then** all prices update immediately
**And** I see "Billed monthly" or "Billed annually" under each price
**And** annual pricing shows 20% discount: Starter €79/mo (€948/year), Professional €239/mo (€2,868/year)
**And** annual badges show total savings: "Save €240/year", "Save €720/year"

**Given** I want to see Enterprise tier
**When** I scroll down past the three cards
**Then** I see an Enterprise section:
- Title: "Enterprise"
- Description: "Custom solutions for large organizations"
- Features: Unlimited strategies, SSO, custom integrations, dedicated support, SLA
- CTA: "Contact Sales" button → opens modal with contact form or links to email

**Given** I click "Subscribe Now" on Starter or Professional
**When** I click the button
**Then** I am redirected to `/checkout?tier={STARTER|PROFESSIONAL}&billing={monthly|annual}`
**And** the checkout page loads with selected tier pre-filled
**And** I proceed to Story 7.2 (payment method selection)

**Given** I am already subscribed
**When** I view the pricing page
**Then** my current tier card shows "Current Plan" badge
**And** the CTA button is disabled or shows "Manage Subscription"
**And** other tiers show "Upgrade" or "Downgrade" buttons as appropriate

**Given** the pricing page is responsive
**When** I view on different screen sizes
**Then** on desktop: 3 cards side by side
**And** on laptop/tablet: 2 cards per row, then 1 card
**And** on mobile: single column, stacked cards

**Given** the pricing is implemented
**When** I review the code
**Then** tier data comes from environment config or database (not hardcoded)
**And** pricing includes currency formatting: `€99 / month`, `€948 / year`
**And** annual discount calculation: `monthlyPrice * 12 * 0.8`
**And** the page uses shadcn/ui Card, Badge, Switch (for toggle)

---


### Story 7.2: Credit/Debit Card Payment via Paystack/Flutterwave

As a **user subscribing to a paid tier (Amina)**,
I want **to pay via credit or debit card using a secure payment gateway**,
So that **I can activate my subscription immediately**.

**Acceptance Criteria:**

**Given** I am on the checkout page
**When** I land on `/checkout?tier=STARTER&billing=monthly`
**Then** I see the checkout page
**And** the page displays:
- Order summary (Starter - Monthly: €99/month)
- Payment method selection: "Credit/Debit Card" (default) or "Mobile Money"
- Card payment form (if Card selected)
- Terms and conditions checkbox
- "Complete Payment" button
- Security badges (PCI-DSS compliant, SSL secured)

**Given** I select "Credit/Debit Card" as payment method
**When** I click the "Card" radio button
**Then** I see the card payment form with fields:
- Card number (with card type icon: Visa, Mastercard, Amex)
- Expiry date (MM/YY)
- CVV (with tooltip: "3-digit code on back")
- Cardholder name
- Billing address (optional or required based on payment gateway)
**And** the form uses Paystack or Flutterwave embedded payment UI (iframe or modal)
**And** card details are NOT stored on ADVERT servers (PCI compliance)

**Given** I enter valid card details
**When** I fill in:
- Card number: 4111 1111 1111 1111 (test card)
- Expiry: 12/25
- CVV: 123
- Name: Amina Diallo
**Then** the form validates in real-time:
- Card number: displays card brand icon (Visa), validates Luhn algorithm
- Expiry: formats as MM/YY, validates not expired
- CVV: validates 3-4 digits
- Name: required field
**And** I see green checkmarks next to valid fields

**Given** I enter invalid card details
**When** I enter invalid card number (e.g., 1234)
**Then** I see inline error: "Invalid card number"
**And** the "Complete Payment" button is disabled
**And** the field is highlighted in red

**Given** I agree to terms and complete payment
**When** I check "I agree to Terms and Conditions"
**And** I click "Complete Payment"
**Then** the button shows loading state: "Processing..."
**And** a payment request is sent to Paystack/Flutterwave API
**And** if 3D Secure is required, I see a modal/popup for 3DS authentication
**And** I complete 3DS (enter OTP from bank)
**And** the payment is authorized

**Given** the payment succeeds
**When** Paystack/Flutterwave returns success response
**Then** I see a success message: "Payment successful! Your subscription is now active."
**And** I am redirected to `/dashboard` after 2 seconds
**And** my account is upgraded to the selected tier (Starter or Professional)
**And** I receive a confirmation email with invoice
**And** the subscription record is created in database:
  - `Subscription { userId, tier: STARTER, status: ACTIVE, billingCycle: MONTHLY, amount: 99, currency: USD, paymentMethod: CARD, paymentGateway: PAYSTACK, paymentReference: {ref}, nextBillingDate: {today + 1 month}, createdAt }`
**And** a webhook is received from Paystack/Flutterwave to confirm payment
**And** the webhook is validated (signature verification) before updating subscription status

**Given** the payment fails
**When** Paystack/Flutterwave returns error (e.g., insufficient funds, card declined)
**Then** I see an error message: "Payment failed: [reason]. Please try again or use a different card."
**And** I remain on the checkout page
**And** I can retry with the same or different card
**And** the error is logged in Sentry for monitoring
**And** no subscription is created

**Given** the payment times out or network error
**When** the payment request takes >30 seconds or fails to connect
**Then** I see a timeout message: "Payment is taking longer than expected. Please wait or refresh."
**And** I see a "Check Payment Status" button
**And** clicking it queries the payment status via Paystack/Flutterwave API
**And** if payment succeeded in background, subscription is activated
**And** if payment is pending, I see: "Payment is still processing. We'll email you once confirmed."

**Given** I am on annual billing
**When** I complete payment for Starter Annual (€948/year)
**Then** the full annual amount is charged upfront (€948)
**And** the subscription record shows: `billingCycle: ANNUAL, amount: 948, nextBillingDate: {today + 1 year}`
**And** I receive an invoice for €948 (12 months prepaid)

**Given** recurring billing is set up
**When** my subscription is created
**Then** Paystack/Flutterwave stores the card for recurring payments (if supported)
**And** on the next billing date, the payment is automatically charged
**And** I receive an email before auto-charge: "Your subscription will renew on {date} for €{amount}"
**And** if auto-charge succeeds, subscription continues
**And** if auto-charge fails, dunning process begins (Story 7.8)

**Given** the payment flow is secure
**When** I review security measures
**Then** the checkout page uses HTTPS (SSL/TLS)
**And** card details are tokenized by Paystack/Flutterwave (not stored on ADVERT)
**And** payment gateway is PCI-DSS compliant (NFR-S5)
**And** 3D Secure (3DS) is enforced for supported cards
**And** webhook signatures are validated to prevent spoofing
**And** payment logs are sanitized (no card numbers in logs)

**Given** the payment is implemented
**When** I review the technical details
**Then** the frontend uses Paystack JS SDK or Flutterwave Inline JS
**And** payment initialization: `POST /api/payments/initialize` → returns payment URL or token
**And** payment verification: webhook endpoint `/api/webhooks/paystack` or `/api/webhooks/flutterwave`
**And** webhook validation: verify signature using secret key
**And** subscription creation: tRPC mutation `subscriptions.create` → Prisma insert
**And** email sent via Resend: "Subscription Confirmation - Invoice #{id}"
**And** Sentry monitoring for payment errors

---


### Story 7.3: Mobile Money Payment Support (MTN, Orange, M-Pesa, Wave)

As a **user in Africa subscribing to a paid tier (Kofi)**,
I want **to pay via mobile money (MTN Mobile Money, Orange Money, M-Pesa, Wave)**,
So that **I can subscribe without needing a credit card**.

**Acceptance Criteria:**

**Given** I am on the checkout page
**When** I select "Mobile Money" as payment method
**Then** I see the mobile money payment form
**And** the form displays:
- Mobile money provider dropdown: "Select Provider"
  - MTN Mobile Money
  - Orange Money
  - M-Pesa
  - Wave
- Phone number field (with country code selector)
- Currency selector (if multi-currency): USD, XOF (West Africa), XAF (Central Africa), KES (Kenya), GHS (Ghana)
- Amount display (converted to local currency if applicable)
- "Pay Now" button

**Given** I select MTN Mobile Money
**When** I choose "MTN Mobile Money" from dropdown
**And** I enter phone number: +233 24 123 4567 (Ghana)
**Then** the phone number is validated:
- Must match country code for selected provider (Ghana: +233, Cameroon: +237, etc.)
- Must be 10-12 digits
- Must be a valid mobile number format
**And** I see the amount in local currency: "GHS 540 / month" (if EUR €99 converted)
**And** I see instructions: "You'll receive a prompt on your phone to approve the payment."

**Given** I complete mobile money payment
**When** I click "Pay Now"
**Then** the button shows loading state: "Initiating payment..."
**And** a payment request is sent to Paystack/Flutterwave (both support mobile money)
**And** the provider (MTN, Orange, M-Pesa, Wave) sends a USSD prompt to my phone
**And** I see on-screen instructions:
  - "Check your phone for a payment prompt"
  - "Dial *XXX# to approve the transaction" (if manual USSD needed)
  - "Waiting for confirmation..." (with spinner)
  - Countdown timer: "Request expires in 2:00" (2 minutes)

**Given** I approve the payment on my phone
**When** I receive the USSD prompt on my phone
**And** I enter my mobile money PIN to approve
**Then** the payment is processed by the mobile money provider
**And** Paystack/Flutterwave receives confirmation via callback
**And** ADVERT receives webhook from payment gateway
**And** I see success message: "Payment approved! Your subscription is now active."
**And** I am redirected to `/dashboard`
**And** subscription is created in database (same as Story 7.2, but `paymentMethod: MOBILE_MONEY`, `paymentProvider: MTN|ORANGE|MPESA|WAVE`)

**Given** I don't approve the payment in time
**When** 2 minutes pass without confirmation
**Then** the payment request times out
**And** I see an error message: "Payment request expired. Please try again."
**And** I can click "Retry Payment"
**And** a new payment request is initiated

**Given** the mobile money payment fails
**When** the provider declines the payment (e.g., insufficient balance, wrong PIN, service unavailable)
**Then** I see an error message: "Payment failed: [reason from provider]. Please check your balance and try again."
**And** I remain on the checkout page
**And** I can retry or switch to a different provider/card

**Given** I select Orange Money or M-Pesa
**When** I choose "Orange Money" (Côte d'Ivoire, Senegal) or "M-Pesa" (Kenya, Tanzania)
**Then** the flow is identical to MTN:
- Enter phone number with correct country code
- Receive USSD prompt on phone
- Approve with PIN
- Payment confirmed via webhook
**And** the currency is converted appropriately:
  - Orange Money (XOF): CFA Franc (West Africa)
  - M-Pesa (KES): Kenyan Shilling
  - M-Pesa (TZS): Tanzanian Shilling

**Given** I select Wave
**When** I choose "Wave" (Senegal, Côte d'Ivoire)
**Then** the flow is the same
**And** Wave may use in-app notification instead of USSD (user opens Wave app to approve)
**And** I see: "Open your Wave app to approve the payment."

**Given** currency conversion is needed
**When** I pay in local currency (not EUR)
**Then** the exchange rate is fetched in real-time from payment gateway API
**And** I see: "Amount: XOF 60,000 (approx. EUR €99)" (with disclaimer: "Final amount may vary based on exchange rate")
**And** the invoice records both amounts: `amount: 99, currency: USD, localAmount: 60000, localCurrency: XOF, exchangeRate: 605`

**Given** recurring billing for mobile money
**When** my subscription is created
**Then** I am notified: "Your subscription will auto-renew. You'll receive a payment prompt each month."
**And** on next billing date, a new USSD prompt is sent
**And** I must approve manually each month (most mobile money providers don't support true auto-debit)
**And** if I don't approve within 3 days, dunning process begins (Story 7.8)

**Given** mobile money has lower success rates (NFR-P6)
**When** reviewing payment statistics
**Then** the target success rate is 85-90% (vs. 95%+ for cards)
**And** common failure reasons are logged: timeout, insufficient balance, service downtime
**And** retry logic is implemented: 3 automatic retries with exponential backoff (1 min, 5 min, 15 min)
**And** if all retries fail, user is notified via email and in-app notification

**Given** mobile money is prominent for African users
**When** I view the checkout page in Africa
**Then** "Mobile Money" is the default selected payment method (above Credit Card)
**And** popular providers for my country are shown first (e.g., MTN for Ghana, Orange for Senegal)
**And** the UI is optimized for low-bandwidth (fast load, minimal animations)

**Given** the implementation is robust
**When** I review the technical details
**Then** mobile money is processed via Paystack or Flutterwave API (both support MTN, Orange, M-Pesa)
**And** payment initialization: `POST /api/payments/initialize-mobile-money` with `{ provider, phoneNumber, amount, currency }`
**And** polling for status: frontend polls `/api/payments/status/{transactionId}` every 5 seconds
**And** webhook receives final confirmation: `/api/webhooks/{gateway}/mobile-money`
**And** phone number validation regex by provider and country
**And** error handling for timeouts, declined payments, network issues
**And** logging: Sentry for errors, database for transaction history

---


### Story 7.4: Billing History and Invoice Downloads

As a **subscribed user (Amina)**,
I want **to view my billing history and download invoices**,
So that **I can track expenses and submit to accounting/reimbursement**.

**Acceptance Criteria:**

**Given** I am logged in with an active subscription
**When** I navigate to `/settings/billing` or `/account/billing`
**Then** I see the Billing page
**And** the page displays:
- Page title: "Billing & Subscription"
- Current subscription section (tier, status, next billing date)
- Payment method section (Story 7.5)
- Billing history section
- "Update Payment Method" button

**Given** I view the billing history section
**When** I scroll to "Billing History"
**Then** I see a table or list of all past invoices
**And** each row displays:
- Invoice number (e.g., "INV-2026-001234")
- Date (e.g., "Jan 15, 2026")
- Description (e.g., "Starter Monthly Subscription")
- Amount (e.g., "€99.00")
- Payment method (e.g., "Visa •••• 4242" or "MTN Mobile Money")
- Status badge: "Paid" (green), "Pending" (yellow), "Failed" (red), "Refunded" (gray)
- Action: "Download PDF" icon/button

**Given** I have multiple invoices
**When** I view the billing history
**Then** invoices are sorted by date (newest first)
**And** I see pagination if >20 invoices: "Show More" or page numbers
**And** I can filter by:
  - Date range (Last 30 days, Last 3 months, Last year, Custom)
  - Status (All, Paid, Failed, Refunded)
**And** the filter updates the table in real-time

**Given** I have no billing history yet
**When** I am on Free tier or just subscribed (first payment processing)
**Then** I see an empty state:
- Message: "No invoices yet. Your first invoice will appear here after payment."
- Icon or illustration

**Given** I click "Download PDF" on an invoice
**When** I click the download button for invoice "INV-2026-001234"
**Then** a PDF invoice is generated and downloaded to my device
**And** the PDF includes:
- Invoice number and date
- "Invoice" heading at top
- ADVERT company details:
  - Company name: "ADVERT Inc."
  - Address (if applicable)
  - Email: billing@advert.com
- Customer details:
  - Name: Amina Diallo
  - Email: amina@example.com
  - Company (if provided in profile)
- Invoice line items:
  - Description: "Starter Monthly Subscription (Jan 15 - Feb 14, 2026)"
  - Quantity: 1
  - Unit price: €99.00
  - Total: €99.00
- Subtotal, Tax (if applicable), Total
- Payment method: "Paid via Visa ending in 4242"
- Payment date: "Jan 15, 2026"
- Footer: "Thank you for your business!"
**And** the PDF is branded (ADVERT logo, colors)
**And** the PDF is print-ready (A4 or Letter size)

**Given** I download an invoice for mobile money payment
**When** I download an invoice for a payment made via MTN Mobile Money
**Then** the PDF shows:
- Payment method: "Paid via MTN Mobile Money (+233 24 ••• 4567)"
- Amount in local currency if converted: "GHS 540.00 (EUR €99.00 at rate 1 EUR = 5.45 GHS)"
- Transaction reference from provider

**Given** I download an invoice for annual subscription
**When** I download an invoice for Starter Annual (€948/year)
**Then** the PDF shows:
- Description: "Starter Annual Subscription (Jan 15, 2026 - Jan 14, 2027) - 12 months prepaid"
- Discount line: "Annual discount (20%): -€237.60"
- Subtotal: €1,185.60
- Discount: -€237.60
- Total: €948.00

**Given** I view my current subscription details
**When** I look at the "Current Subscription" section (top of billing page)
**Then** I see:
- Tier name: "Starter"
- Status: "Active" (green badge) or "Cancelled" or "Past Due"
- Billing cycle: "Monthly" or "Annual"
- Amount: "€99 / month"
- Next billing date: "Feb 15, 2026"
- Auto-renewal: "On" (toggle switch to disable - leads to cancellation flow)
- "Change Plan" button (Story 7.6, 7.7)

**Given** my subscription is past due
**When** a payment failed and dunning is in progress (Story 7.8)
**Then** I see a warning banner:
- "Your subscription is past due. Please update your payment method to avoid service interruption."
- "Update Payment Method" button (prominent, red)
**And** the status shows "Past Due" (red badge)
**And** the billing history shows the failed invoice with "Failed" status

**Given** I want to view invoice details without downloading
**When** I click on an invoice row (not the download button)
**Then** I see a modal or expanded view with full invoice details
**And** I can preview the invoice before downloading
**And** I see "Download PDF", "Email Invoice", "Print" buttons in the modal

**Given** I want to email an invoice to my accountant
**When** I click "Email Invoice" in the invoice modal
**Then** I see a form: "Email to:" field (pre-filled with my email)
**And** I can change or add multiple emails (comma-separated)
**And** I click "Send"
**Then** the invoice PDF is emailed via Resend
**And** I see confirmation: "Invoice sent to email@example.com"

**Given** the billing history is responsive
**When** I view on different screen sizes
**Then** on desktop: full table with all columns
**And** on tablet: some columns hidden (e.g., description collapsed)
**And** on mobile: card view instead of table, key info displayed, "View Details" expands full info

**Given** invoices are stored securely
**When** I review data storage
**Then** invoices are generated on-demand (not pre-stored) or cached in Vercel Blob
**And** PDF generation uses a library like `@react-pdf/renderer` or server-side tool (Puppeteer, wkhtmltopdf)
**And** invoice data comes from Prisma: `Invoice` model with fields: `id, userId, subscriptionId, invoiceNumber, date, amount, currency, status, paymentMethod, pdfUrl, createdAt`
**And** only the user (tenant isolation via RLS) can view their own invoices
**And** invoice PDFs are served with authentication: `GET /api/invoices/{invoiceId}/pdf` (requires valid session)

**Given** the feature is implemented
**When** I review the technical details
**Then** billing history fetched via tRPC: `invoices.list({ userId, dateRange, status })`
**And** PDF generation triggered: `invoices.downloadPdf({ invoiceId })` → generates PDF, stores in Vercel Blob, returns download URL
**And** PDF generation is async (Inngest background job if slow)
**And** invoice number format: `INV-{YYYY}-{incremental 6-digit number}`
**And** tax calculation (if applicable): use Stripe Tax API or manual calculation based on user location
**And** logging: track download events for analytics ("invoice_downloaded")

---


### Story 7.5: Payment Method Update and Management

As a **subscribed user (Amina)**,
I want **to update my payment method (card or mobile money number)**,
So that **I can ensure uninterrupted service if my card expires or phone number changes**.

**Acceptance Criteria:**

**Given** I am logged in with an active subscription
**When** I navigate to `/settings/billing`
**Then** I see the "Payment Method" section
**And** the section displays:
- Current payment method:
  - If card: "Visa ending in 4242, expires 12/2025" (with card brand icon)
  - If mobile money: "MTN Mobile Money (+233 24 ••• 4567)"
- "Update Payment Method" button
- "Remove Payment Method" button (if secondary method exists)

**Given** I click "Update Payment Method"
**When** I click the button
**Then** I see a modal or inline form: "Update Payment Method"
**And** the form displays:
- Payment method selector: "Credit/Debit Card" or "Mobile Money"
- Card form (if Card selected): same fields as Story 7.2
- Mobile money form (if Mobile Money selected): same fields as Story 7.3
- "Save Payment Method" button
- "Cancel" button

**Given** I update my card
**When** I select "Credit/Debit Card"
**And** I enter new card details:
  - Card number: 5555 5555 5555 4444 (Mastercard)
  - Expiry: 06/2027
  - CVV: 456
  - Name: Amina Diallo
**And** I click "Save Payment Method"
**Then** the card is tokenized by Paystack/Flutterwave
**And** the new card token is saved to the database
**And** the old card is replaced (not deleted from payment gateway, in case of refunds)
**And** I see a success message: "Payment method updated successfully."
**And** the Payment Method section now shows: "Mastercard ending in 4444, expires 06/2027"
**And** I receive a confirmation email: "Your payment method has been updated."

**Given** I update my card with invalid details
**When** I enter an expired card or invalid card number
**Then** I see inline validation errors: "Card expired" or "Invalid card number"
**And** the "Save Payment Method" button is disabled
**And** I cannot submit until errors are fixed

**Given** I update my mobile money number
**When** I select "Mobile Money"
**And** I choose "Orange Money"
**And** I enter new phone number: +225 07 12 34 56 78 (Côte d'Ivoire)
**And** I click "Save Payment Method"
**Then** the new phone number is validated and saved
**And** I see success message: "Payment method updated to Orange Money."
**And** the Payment Method section shows: "Orange Money (+225 07 ••• 5678)"
**And** I receive an SMS confirmation (optional): "Your ADVERT payment method has been updated."

**Given** I want to verify the new payment method
**When** I save a new card
**Then** Paystack/Flutterwave may charge a small verification amount (e.g., €0.50 or €1)
**And** I see a note: "A small charge of €1 will be made to verify your card. This will be refunded within 24 hours."
**And** I must approve the charge (3D Secure if required)
**And** once verified, the card status is set to "Verified"
**And** the verification charge is refunded automatically

**Given** I have multiple payment methods (future feature for Professional tier)
**When** I add a second payment method (backup card)
**Then** I see both methods listed:
  - Primary: "Visa •••• 4242" (with "Primary" badge)
  - Backup: "Mastercard •••• 4444" (with "Set as Primary" button)
**And** I can set either as primary
**And** if primary payment fails, backup is used automatically (Story 7.8)

**Given** I want to remove a payment method
**When** I click "Remove Payment Method" on a backup card
**Then** I see a confirmation dialog: "Are you sure you want to remove this payment method?"
**And** I click "Remove"
**Then** the payment method is removed from the list
**And** it is NOT deleted from Paystack/Flutterwave (kept for historical records)
**And** I see: "Payment method removed."

**Given** I try to remove my only payment method
**When** I have only one payment method and try to remove it
**Then** I see a warning: "You cannot remove your only payment method while subscribed. Please add another payment method first or cancel your subscription."
**And** the remove action is blocked

**Given** my card is about to expire
**When** my card expiry date is within 30 days
**Then** I see a warning banner on the billing page:
  - "Your payment method expires soon (12/2025). Please update it to avoid service interruption."
  - "Update Now" button
**And** I receive an email reminder 30 days before expiry
**And** I receive another email reminder 7 days before expiry

**Given** my card expires and auto-renewal fails
**When** the next billing date arrives and my card is expired
**Then** the payment fails (handled in Story 7.8 - Dunning)
**And** I receive an urgent email: "Payment failed - Update your payment method"
**And** I see a prominent banner in the app: "Your subscription is at risk. Update payment method now."

**Given** I update payment method mid-billing cycle
**When** I change my card on Jan 20 (next billing is Feb 15)
**Then** the next charge on Feb 15 uses the new card
**And** there is no immediate charge (unless verification charge)
**And** I see: "Your next payment on Feb 15 will use Mastercard •••• 4444."

**Given** the update flow is secure
**When** I review security measures
**Then** card details are tokenized (not stored by ADVERT)
**And** card token is stored encrypted in database: `PaymentMethod { userId, type: CARD, token: {encrypted}, last4: 4444, brand: MASTERCARD, expiryMonth: 6, expiryYear: 2027, isVerified: true, isPrimary: true }`
**And** mobile money numbers are stored with only last 4 digits visible in UI
**And** payment gateway API calls use HTTPS and API keys (stored in env vars)

**Given** the feature is implemented
**When** I review the technical details
**Then** payment method update via tRPC: `paymentMethods.update({ userId, type, cardToken?, phoneNumber?, provider? })`
**And** Paystack/Flutterwave API: update customer payment method or attach new card
**And** database update: insert new `PaymentMethod` record, set old as non-primary
**And** email sent via Resend: "Payment Method Updated Confirmation"
**And** expiry reminder emails sent via Inngest scheduled job: check daily for cards expiring in 30/7 days
**And** Sentry logging for errors during update

---


### Story 7.6: Subscription Tier Upgrade with Prorated Billing

As a **user on a lower tier (Amina on Starter)**,
I want **to upgrade to a higher tier (Professional) with prorated billing**,
So that **I only pay for the unused portion of my current billing cycle and can access new features immediately**.

**Acceptance Criteria:**

**Given** I am subscribed to Starter (€99/month)
**When** I navigate to `/settings/billing` or `/pricing`
**Then** I see my current plan: "Starter - €99/month"
**And** I see an "Upgrade" button next to Professional tier
**And** I see a "Change Plan" button in the billing settings

**Given** I click "Upgrade to Professional"
**When** I click the upgrade button
**Then** I see an upgrade confirmation modal: "Upgrade to Professional?"
**And** the modal displays:
- Current plan: "Starter - €99/month"
- New plan: "Professional - €299/month"
- Proration calculation:
  - "You have 20 days remaining in your current billing cycle."
  - "Unused credit from Starter: €64.52" (20 days / 31 days * €99)
  - "Prorated charge for Professional: €193.55" (20 days / 31 days * €299)
  - "Amount due today: €129.03" (€193.55 - €64.52)
- Next billing date: "Feb 15, 2026 (20 days from now)"
- New features unlocked: "20 active strategies, Team collaboration, Advanced analytics"
- "Confirm Upgrade" button
- "Cancel" button

**Given** I confirm the upgrade
**When** I click "Confirm Upgrade"
**Then** the prorated amount (€129.03) is charged immediately to my saved payment method
**And** if payment succeeds:
  - My subscription tier is upgraded to Professional
  - I see success message: "Upgrade successful! You now have access to Professional features."
  - I am redirected to `/dashboard`
  - My strategy limit increases to 20
  - New features are immediately available (Team collaboration, advanced analytics)
**And** I receive a confirmation email: "You've upgraded to Professional"
**And** I receive an invoice for the prorated charge

**Given** the prorated payment fails
**When** the payment is declined (e.g., insufficient funds)
**Then** I see an error: "Payment failed. Please update your payment method and try again."
**And** the upgrade is NOT processed (I remain on Starter)
**And** I can retry or update payment method

**Given** I upgrade from monthly to annual
**When** I am on Starter Monthly (€99/month) and upgrade to Professional Annual (€2,868/year)
**Then** I see proration for remaining monthly cycle
**And** I am charged the prorated Professional monthly amount for remaining days
**And** on next billing date, I am charged the full annual amount (€2,868)
**And** the modal explains: "You'll be charged €X today for the remainder of this month, then €2,868 on {next billing date} for the full year."

**Given** I upgrade from Free to Starter
**When** I am on Free tier (no active subscription)
**And** I click "Subscribe to Starter"
**Then** there is NO proration (I'm not paying for anything currently)
**And** I am charged the full monthly amount (€99)
**And** my first billing cycle starts immediately (today)
**And** next billing date is 1 month from today

**Given** I upgrade from Free to Professional
**When** I go directly from Free to Professional
**Then** the flow is the same as Free → Starter (no proration)
**And** I am charged €299 for the first month
**And** subscription starts immediately

**Given** I upgrade mid-billing cycle (example calculation)
**When** I am on Starter Monthly (€99), billing date is 1st of each month, today is Jan 20
**Then** proration calculation:
  - Days in January: 31
  - Days remaining: 12 (Jan 20 to Jan 31)
  - Unused Starter credit: (12 / 31) * €99 = €38.32
  - Professional prorated: (12 / 31) * €299 = €115.74
  - Amount due: €115.74 - €38.32 = €77.42
**And** on Feb 1, I am charged the full €299 (new billing cycle)

**Given** I upgrade on the last day of billing cycle
**When** I upgrade on Jan 31, next billing is Feb 1
**Then** proration is minimal:
  - Unused Starter credit: (1 / 31) * €99 = €3.19
  - Professional prorated: (1 / 31) * €299 = €9.65
  - Amount due: €9.65 - €3.19 = €6.46
**And** on Feb 1, I am charged the full €299

**Given** I upgrade multiple times in a billing cycle (edge case)
**When** I upgrade Starter → Professional on Jan 15, then try to upgrade again
**Then** there is no higher tier to upgrade to (Professional is max)
**And** the "Upgrade" button is not shown

**Given** the upgrade affects my features immediately
**When** I complete the upgrade to Professional
**Then** I can immediately:
  - Create up to 20 strategies (increased from 3)
  - Access team collaboration features
  - Use advanced analytics dashboard
  - Export white-label PDFs
**And** existing strategies remain intact (no data loss)

**Given** the upgrade is reflected in billing history
**When** I view `/settings/billing` after upgrade
**Then** I see a new invoice:
  - Description: "Upgrade to Professional - Prorated charge"
  - Amount: €129.03
  - Date: Jan 20, 2026
  - Status: Paid
**And** I see my next invoice will be the full amount:
  - Description: "Professional Monthly Subscription"
  - Amount: €299.00
  - Date: Feb 15, 2026
  - Status: Pending

**Given** the feature is implemented
**When** I review the technical details
**Then** upgrade flow via tRPC: `subscriptions.upgrade({ newTier: PROFESSIONAL })`
**And** proration calculation:
  ```typescript
  const daysRemaining = differenceInDays(nextBillingDate, today)
  const daysInCycle = differenceInDays(nextBillingDate, lastBillingDate)
  const unusedCredit = (daysRemaining / daysInCycle) * currentTierPrice
  const proratedCharge = (daysRemaining / daysInCycle) * newTierPrice
  const amountDue = proratedCharge - unusedCredit
  ```
**And** payment charged via Paystack/Flutterwave API
**And** subscription updated in database:
  ```prisma
  UPDATE Subscription SET tier = PROFESSIONAL, amount = 299, updatedAt = now()
  WHERE id = {subscriptionId}
  ```
**And** invoice created for prorated charge
**And** email sent: "Upgrade Confirmation"
**And** webhook logged for analytics: "subscription.upgraded"

---


### Story 7.7: Subscription Downgrade and Cancellation

As a **user on a paid tier (Amina on Professional)**,
I want **to downgrade to a lower tier or cancel my subscription**,
So that **I can reduce costs or stop using the service without losing access immediately**.

**Acceptance Criteria:**

**Given** I am subscribed to Professional (€299/month)
**When** I navigate to `/settings/billing`
**Then** I see my current plan: "Professional - €299/month"
**And** I see a "Change Plan" button
**And** I see a "Cancel Subscription" link (less prominent, below)

**Given** I click "Change Plan"
**When** I click the button
**Then** I see a modal: "Change Your Plan"
**And** the modal shows all available tiers:
  - Free: "€0/month" (with "Downgrade" button)
  - Starter: "€99/month" (with "Downgrade" button)
  - Professional: "€299/month" (with "Current Plan" badge, button disabled)
**And** I can select a different tier

**Given** I downgrade to Starter
**When** I click "Downgrade to Starter"
**Then** I see a confirmation modal: "Downgrade to Starter?"
**And** the modal displays:
- Current plan: "Professional - €299/month"
- New plan: "Starter - €99/month"
- Downgrade policy:
  - "Your downgrade will take effect at the end of your current billing cycle."
  - "You'll continue to have access to Professional features until {next billing date}."
  - "On {next billing date}, you'll be charged €99/month for Starter."
  - "You'll lose access to: Team collaboration (5 members), 20 strategies (reduced to 3), Advanced analytics, White-label exports."
- Warning: "You currently have 8 active strategies. Starter allows only 3. You'll need to archive 5 strategies before the downgrade takes effect."
- "Confirm Downgrade" button (disabled if >3 strategies)
- "Cancel" button

**Given** I have too many strategies for the downgrade
**When** I try to downgrade from Professional (20 strategies) to Starter (3 strategies)
**And** I currently have 8 active strategies
**Then** I see a blocking warning: "You have 8 active strategies, but Starter allows only 3. Please archive 5 strategies to continue."
**And** I see a "Go to Dashboard" button to archive strategies
**And** the "Confirm Downgrade" button is disabled
**And** I cannot proceed until I archive strategies

**Given** I archive strategies before downgrading
**When** I archive 5 strategies (reducing active count to 3)
**And** I return to the downgrade flow
**Then** the warning is gone
**And** "Confirm Downgrade" button is enabled
**And** I can proceed

**Given** I confirm the downgrade
**When** I click "Confirm Downgrade" (with ≤3 strategies)
**Then** the downgrade is scheduled (not immediate)
**And** I see success message: "Downgrade scheduled. You'll be moved to Starter on {next billing date}."
**And** my subscription status changes to: "ACTIVE (Downgrade pending)"
**And** I continue to have Professional features until next billing date
**And** I receive a confirmation email: "Your subscription will downgrade to Starter on {date}"

**Given** the downgrade takes effect
**When** the next billing date arrives (e.g., Feb 15)
**Then** my subscription tier is changed to Starter
**And** I am charged €99 (Starter price) instead of €299
**And** my feature access is immediately restricted:
  - Strategy limit reduced to 3 (enforced, no new strategies if at limit)
  - Team collaboration disabled
  - Advanced analytics hidden
  - White-label exports disabled
**And** I receive an email: "Your subscription is now Starter"

**Given** I cancel the downgrade before it takes effect
**When** I scheduled a downgrade but changed my mind
**And** I navigate to `/settings/billing` before the next billing date
**Then** I see a notice: "Downgrade to Starter scheduled for {date}"
**And** I see a "Cancel Downgrade" button
**And** I click "Cancel Downgrade"
**Then** the downgrade is cancelled
**And** I remain on Professional at next billing
**And** I see: "Downgrade cancelled. You'll continue on Professional."

**Given** I cancel my subscription
**When** I click "Cancel Subscription" link
**Then** I see a cancellation modal: "Cancel Your Subscription?"
**And** the modal displays:
- Current plan: "Professional - €299/month"
- Cancellation policy:
  - "Your subscription will be cancelled at the end of your current billing cycle."
  - "You'll continue to have access to Professional features until {next billing date}."
  - "After {next billing date}, you'll be moved to the Free plan."
  - "Free plan includes: 1 active strategy, basic features, no team collaboration."
- Feedback form: "Why are you cancelling?" (optional dropdown: Too expensive, Not using it, Missing features, Other)
- Text area: "Additional feedback" (optional)
- "Confirm Cancellation" button
- "Never mind, keep my subscription" button (prominent)

**Given** I confirm cancellation
**When** I click "Confirm Cancellation"
**Then** the cancellation is scheduled
**And** I see success message: "Subscription cancelled. You'll have access until {next billing date}."
**And** my subscription status changes to: "ACTIVE (Cancellation pending)" or "CANCELLED"
**And** auto-renewal is turned off (no future charges)
**And** I continue to have Professional features until next billing date
**And** I receive a confirmation email: "Your subscription has been cancelled"
**And** the email includes a "Reactivate Subscription" link (in case of accidental cancellation)

**Given** the cancellation takes effect
**When** the next billing date arrives after cancellation
**Then** my subscription tier is changed to Free
**And** I am NOT charged
**And** my feature access is restricted to Free tier:
  - Strategy limit: 1 active strategy (I must archive all but 1)
  - No team collaboration
  - No advanced features
**And** I see a modal on next login: "Your subscription has ended. You're now on the Free plan. Upgrade anytime to restore access."

**Given** I reactivate after cancellation
**When** I cancelled but want to reactivate before the end of the billing cycle
**And** I navigate to `/settings/billing`
**Then** I see: "Cancellation scheduled for {date}"
**And** I see a "Reactivate Subscription" button
**And** I click "Reactivate Subscription"
**Then** the cancellation is cancelled
**And** auto-renewal is turned back on
**And** I will be charged normally at next billing date
**And** I see: "Subscription reactivated. You'll be charged €299 on {next billing date}."

**Given** I cancel and reactivate multiple times (edge case)
**When** I cancel then reactivate repeatedly
**Then** only the most recent action applies
**And** the system handles this gracefully (no double charges or bugs)

**Given** I downgrade to Free (direct cancellation with immediate effect option)
**When** I select "Downgrade to Free" instead of "Cancel Subscription"
**Then** the flow is the same as cancellation
**And** I am moved to Free tier at end of billing cycle
**And** I lose access to paid features at that time

**Given** downgrade/cancellation affects team members (if on Professional with team)
**When** I downgrade or cancel and I have team members
**Then** I see a warning: "Downgrading will remove team members. They will lose access to shared strategies."
**And** team members are notified via email: "Your access to {Amina's} ADVERT workspace will end on {date} due to plan change."

**Given** the feature is implemented
**When** I review the technical details
**Then** downgrade via tRPC: `subscriptions.downgrade({ newTier: STARTER })`
**And** validation: check if active strategies ≤ new tier limit
**And** database update:
  ```prisma
  UPDATE Subscription SET
    scheduledTier = STARTER,
    scheduledChangeDate = {nextBillingDate},
    status = ACTIVE_PENDING_CHANGE
  WHERE id = {subscriptionId}
  ```
**And** cancellation via tRPC: `subscriptions.cancel({ reason?, feedback? })`
**And** database update:
  ```prisma
  UPDATE Subscription SET
    cancelledAt = now(),
    cancellationReason = {reason},
    status = CANCELLED,
    nextBillingDate = {currentEndDate} (no renewal)
  WHERE id = {subscriptionId}
  ```
**And** scheduled job (Inngest): daily check for `scheduledChangeDate = today` → apply tier change
**And** email sent: "Subscription Cancelled" or "Subscription Downgraded"
**And** webhook logged: "subscription.cancelled" or "subscription.downgraded"
**And** cancellation feedback saved to database for product analytics

---


### Story 7.8: Dunning Management (Failed Payment Retry & Recovery)

As a **system administrator or subscribed user (Amina)**,
I want **automatic retry and recovery for failed subscription payments**,
So that **temporary payment failures don't result in immediate service loss and churn is minimized**.

**Acceptance Criteria:**

**Given** a subscription payment fails at renewal
**When** the billing date arrives (e.g., Feb 15) and the payment fails
**Then** the system automatically retries the payment
**And** the subscription status changes to: "PAST_DUE"
**And** the user is immediately notified via email: "Payment failed - Update your payment method"
**And** the user sees a prominent banner in the app: "Your payment failed. Please update your payment method to avoid service interruption."

**Given** the dunning schedule is configured
**When** I review the retry policy
**Then** the system follows this schedule (configurable in admin settings):
- **Day 0 (payment fails)**: Immediate retry (within 1 hour)
- **Day 1**: Second retry
- **Day 3**: Third retry
- **Day 7**: Fourth retry (final attempt)
- **Day 10**: Subscription cancelled if all retries fail
**And** each retry uses the saved payment method (card or mobile money)
**And** if user updates payment method during dunning, immediate retry with new method

**Given** the first retry succeeds
**When** the immediate retry (Day 0, within 1 hour) succeeds
**Then** the subscription status returns to "ACTIVE"
**And** the user is charged successfully
**And** the user receives an email: "Payment successful - Your subscription is active"
**And** no further retries are needed
**And** the dunning process ends

**Given** the first retry fails
**When** the immediate retry also fails
**Then** the subscription remains "PAST_DUE"
**And** the user receives another email: "Payment failed again - Please update your payment method urgently"
**And** the next retry is scheduled for Day 1

**Given** multiple retries fail
**When** retries on Day 0, 1, and 3 all fail
**Then** the user receives escalating emails:
  - Day 0: "Payment failed - Update your payment method"
  - Day 1: "Second payment attempt failed - Urgent action required"
  - Day 3: "Third payment attempt failed - Service may be suspended"
  - Day 7: "Final payment attempt - Service will be cancelled in 3 days"
**And** in-app banners become more prominent (red, blocking modal on Day 7)

**Given** the user updates payment method during dunning
**When** the user navigates to `/settings/billing` and updates their card
**Then** the system immediately retries the payment with the new card
**And** if successful:
  - Subscription status returns to "ACTIVE"
  - Dunning process ends
  - User sees: "Payment successful! Your subscription is now active."
**And** if still fails:
  - User sees: "Payment failed with new method. Please try a different card."
  - Dunning continues on schedule

**Given** all retries fail by Day 7
**When** the 4th and final retry on Day 7 fails
**Then** the user receives a final email: "Subscription will be cancelled in 3 days (Day 10)"
**And** the email includes:
  - Clear deadline: "Your subscription will end on {date} unless you update your payment method."
  - "Update Payment Method" button (links to billing page)
  - Summary of failed attempts
  - Support contact info
**And** in-app modal blocks access (or shows prominent banner): "Your subscription is at risk of cancellation. Update payment now."

**Given** the user does not update payment by Day 10
**When** Day 10 arrives and payment still hasn't succeeded
**Then** the subscription is automatically cancelled
**And** the subscription status changes to: "CANCELLED"
**And** the user loses access to paid features immediately:
  - Downgraded to Free tier (1 active strategy)
  - Team collaboration disabled
  - Advanced features locked
**And** the user receives a final email: "Your subscription has been cancelled due to payment failure"
**And** the email includes:
  - Reason: "Multiple payment attempts failed"
  - "Reactivate Subscription" button (allows user to resubscribe)
  - Retention offer (optional): "Come back! Get 20% off if you reactivate within 7 days."

**Given** the user reactivates after cancellation
**When** the user clicks "Reactivate Subscription" within the retention window
**And** they enter a valid payment method
**Then** the subscription is reactivated at the previous tier
**And** they are charged immediately (including any retention discount if applicable)
**And** their access is restored
**And** they receive an email: "Welcome back! Your subscription is now active."

**Given** dunning for mobile money payments
**When** a mobile money payment fails (user didn't approve USSD prompt)
**Then** the retry schedule is the same
**And** each retry sends a new USSD prompt to the user's phone
**And** SMS reminders are sent: "Your ADVERT payment is due. Please approve the prompt on your phone."
**And** if user doesn't approve after 4 retries, subscription is cancelled

**Given** grace period during dunning (NFR-R2)
**When** the subscription is in "PAST_DUE" status
**Then** the user retains full access to features for the first 7 days (grace period)
**And** on Day 8, access may be restricted:
  - Read-only mode: can view strategies but not create/edit
  - Or limited mode: some features disabled
**And** on Day 10, full downgrade to Free tier

**Given** the system tracks dunning metrics
**When** I review analytics
**Then** I see metrics:
  - Payment failure rate (% of renewals that fail)
  - Dunning success rate (% of failed payments recovered)
  - Average days to recovery (how long until payment succeeds)
  - Churn rate due to payment failure (% cancelled on Day 10)
**And** these metrics are tracked by payment method (card vs. mobile money) and region
**And** target recovery rate: >70% (i.e., 70% of failed payments eventually succeed)

**Given** dunning emails are optimized
**When** I review the email content
**Then** emails are clear, not aggressive:
  - Friendly tone: "We couldn't process your payment"
  - Clear action: "Update your payment method to keep your subscription active"
  - Deadline: "You have until {date} to update"
  - Support offer: "Need help? Contact us at support@advert.com"
**And** emails include a direct link to billing page (with auto-login token for security)
**And** emails are sent via Resend with high deliverability

**Given** the user contacts support during dunning
**When** the user replies to a dunning email or contacts support
**Then** support can manually extend the grace period or waive the failed payment
**And** support uses an admin panel to:
  - Mark payment as "manually resolved"
  - Extend dunning deadline by X days
  - Reactivate subscription without payment (in case of error)

**Given** the feature is implemented
**When** I review the technical details
**Then** payment retry logic is handled by Inngest scheduled jobs:
  - Job: `subscription-payment-retry` triggered on Day 0, 1, 3, 7
  - Job: `subscription-cancel-after-dunning` triggered on Day 10
**And** retry flow:
  ```typescript
  async function retryPayment(subscriptionId: string) {
    const subscription = await getSubscription(subscriptionId)
    const paymentMethod = await getPaymentMethod(subscription.userId)
    const result = await chargePayment(paymentMethod, subscription.amount)
    if (result.success) {
      await updateSubscription(subscriptionId, { status: 'ACTIVE' })
      await sendEmail('payment-success')
    } else {
      await scheduleNextRetry(subscriptionId)
      await sendEmail('payment-failed-retry')
    }
  }
  ```
**And** database fields:
  ```prisma
  model Subscription {
    ...
    status: SubscriptionStatus (ACTIVE, PAST_DUE, CANCELLED)
    lastPaymentAttempt: DateTime?
    retryCount: Int @default(0)
    dunningStartedAt: DateTime?
    cancellationReason: String? (e.g., "payment_failed")
  }
  ```
**And** email templates in Resend:
  - `payment-failed-day-0`
  - `payment-failed-day-1`
  - `payment-failed-day-3`
  - `payment-failed-day-7-final`
  - `subscription-cancelled-payment-failure`
**And** webhook events logged: `payment.failed`, `payment.retried`, `subscription.dunning_started`, `subscription.recovered`, `subscription.cancelled_dunning`
**And** Sentry alerts for high payment failure rates (>20%)

---

**Epic 7 Complete!** 🎉

Epic 7: Payment & Subscription Management (8 stories) is now fully documented with comprehensive acceptance criteria covering:
- Tier selection and pricing display
- Card payments (Paystack/Flutterwave, 3D Secure, PCI compliance)
- Mobile money (MTN, Orange, M-Pesa, Wave with USSD, currency conversion)
- Billing history and invoice downloads (PDF generation, email)
- Payment method management (update card/mobile, expiry warnings)
- Tier upgrades with proration (immediate access, prorated billing)
- Downgrades and cancellation (end-of-cycle, strategy limits, retention)
- Dunning management (4 retries over 10 days, grace period, recovery)

---

## Epic 8: Advanced Strategy Features (Growth Phase)

**Goal:** Enhance strategy creation with sector-specific templates, version control, PowerPoint exports, and custom branding for sophisticated workflows.

**User Outcome:** Users can select pre-filled sector templates, track version history, restore previous versions, export to PowerPoint, apply custom branding, and email exports directly to clients.

---

### Story 8.1: Sector Template Library Selection

As a **user creating a new strategy (Amina)**,
I want **to select a sector-specific template (Fashion, Fintech, FMCG, B2B SaaS) that pre-fills relevant variables**,
So that **I can accelerate strategy creation with industry-appropriate starting points**.

**Acceptance Criteria:**

**Given** I am creating a new strategy
**When** I start the wizard at `/strategies/new`
**Then** I see the first step: "Choose Your Starting Point"
**And** I see two options:
- "Start from Scratch" (blank strategy)
- "Use a Sector Template" (pre-filled with industry context)
**And** I can select either option

**Given** I select "Use a Sector Template"
**When** I click the option
**Then** I see a template selection screen
**And** the screen displays 4 sector template cards:
  1. **Fashion & Apparel**
     - Icon: dress/clothing icon
     - Description: "For fashion brands, designers, and apparel businesses"
     - Preview: "Pre-filled with fashion industry meta-variables, consumer personas, seasonal rituals"
  2. **Fintech & Financial Services**
     - Icon: bank/money icon
     - Description: "For digital banking, payment platforms, and financial products"
     - Preview: "Regulatory context, trust-building strategies, security-first messaging"
  3. **FMCG (Fast-Moving Consumer Goods)**
     - Icon: shopping cart icon
     - Description: "For consumer packaged goods, food & beverage, household products"
     - Preview: "Distribution channels, mass market positioning, retail partnerships"
  4. **B2B SaaS**
     - Icon: cloud/software icon
     - Description: "For enterprise software, productivity tools, and tech platforms"
     - Preview: "Lead generation, sales cycles, product-led growth strategies"
**And** each card has a "Preview Template" button

**Given** I click "Preview Template" on Fashion
**When** I click the button
**Then** I see a modal showing the template preview
**And** the modal displays:
- Template name: "Fashion & Apparel Template"
- Pre-filled meta-variables example:
  - Industry: Fashion & Apparel
  - Target Market: B2C, Fashion-conscious consumers
  - Distribution: Retail, E-commerce, Pop-up stores
  - Key Success Metrics: Brand awareness, Customer lifetime value, Repeat purchase rate
  - Competitive Landscape: Fast fashion vs. Sustainable fashion, Direct-to-consumer trends
  - Seasonality: Spring/Summer, Fall/Winter collections, Fashion weeks
- Sample persona: "Fashion Enthusiast Emma" (25-35, trend-driven, values sustainability)
- Sample ritual: "New Season Drop" (bi-annual collection launch events)
**And** I see "Use This Template" button (primary) and "Cancel" button

**Given** I select "Use This Template" for Fintech
**When** I confirm the selection
**Then** the wizard proceeds to the brand input step (FR14 - Wizard Mode or AI Co-Pilot)
**And** the strategy is initialized with Fintech template data
**And** meta-variables are pre-populated:
  - Industry: Fintech & Financial Services
  - Target Market: Mobile-first consumers, Underbanked populations
  - Distribution: Mobile app, Web platform, Agent networks
  - Key Success Metrics: Active users, Transaction volume, Customer acquisition cost
  - Competitive Landscape: Traditional banks vs. Digital wallets, Regulatory compliance
  - Trust Factors: Security certifications, Regulatory licenses, User testimonials
**And** when AI generates the 6 pillars (FR15), it uses these meta-variables as context

**Given** I select FMCG template
**When** I proceed with the template
**Then** meta-variables include:
  - Industry: FMCG (Fast-Moving Consumer Goods)
  - Target Market: Mass market, Retail consumers
  - Distribution: Supermarkets, Convenience stores, E-commerce
  - Key Success Metrics: Market share, Shelf space, Brand recall
  - Competitive Landscape: Price competition, Brand loyalty, Retailer relationships
  - Seasonality: Holiday peaks (Christmas, Ramadan), Back-to-school, Summer
**And** AI generation emphasizes retail-focused strategies

**Given** I select B2B SaaS template
**When** I proceed
**Then** meta-variables include:
  - Industry: B2B SaaS
  - Target Market: Small to medium businesses, Enterprise clients
  - Distribution: Direct sales, Partner channels, Self-service signup
  - Key Success Metrics: MRR growth, Churn rate, Customer acquisition cost, Net Revenue Retention
  - Competitive Landscape: Established players, Emerging startups, Open-source alternatives
  - Sales Cycle: Demo → Trial → POC → Contract (3-6 months for Enterprise)
**And** AI generation emphasizes product-led growth and sales enablement

**Given** the template pre-fills but allows customization
**When** I view the wizard after selecting a template
**Then** all fields are editable (not locked)
**And** I can modify or remove pre-filled values
**And** I can add additional meta-variables
**And** the template serves as a starting point, not a constraint

**Given** I want to switch templates mid-wizard
**When** I realize I selected the wrong template
**Then** I see a "Change Template" link at the top of the wizard
**And** clicking it returns me to the template selection screen
**And** I see a warning: "Changing template will reset pre-filled values. Continue?"
**And** if I confirm, the strategy resets to the new template

**Given** I choose "Start from Scratch" instead
**When** I select that option
**Then** the wizard proceeds with blank fields (no pre-filled meta-variables)
**And** the user provides all context manually or via AI prompts

**Given** templates are versioned and maintained
**When** I review the implementation
**Then** templates are stored in database: `SectorTemplate` model
  ```prisma
  model SectorTemplate {
    id            String   @id @default(cuid())
    sector        String   // "Fashion", "Fintech", "FMCG", "B2B SaaS"
    name          String   // "Fashion & Apparel Template"
    description   String
    icon          String   // icon identifier or URL
    metaVariables Json     // pre-filled meta-variables object
    samplePersona Json?    // optional sample persona
    sampleRitual  Json?    // optional sample ritual
    aiContext     String   // additional context for AI generation
    isActive      Boolean  @default(true)
    version       Int      @default(1)
    createdAt     DateTime @default(now())
    updatedAt     DateTime @updatedAt
  }
  ```
**And** templates are seeded during deployment (database seed script)
**And** templates can be updated by admins without code changes (admin panel - future)

**Given** template selection improves AI quality
**When** AI generates pillars (FR15) for a templated strategy
**Then** the AI prompt includes template meta-variables as context
**And** the AI generates industry-relevant content:
  - Fashion: seasonal campaigns, influencer partnerships, brand storytelling
  - Fintech: trust-building, security messaging, financial inclusion narratives
  - FMCG: mass market appeal, retail activation, value propositions
  - B2B SaaS: product demos, case studies, lead nurturing sequences

**Given** the feature is responsive
**When** I view template selection on different devices
**Then** on desktop: 4 cards in 2×2 grid
**And** on tablet: 2 cards per row
**And** on mobile: 1 card per row, vertical scroll

**Given** the feature is implemented
**When** I review technical details
**Then** template selection via tRPC: `templates.list()` → returns all active templates
**And** template application: when user selects template, `metaVariables` JSON is copied to strategy record
**And** AI generation uses: `strategy.metaVariables` + user inputs as context
**And** UI uses shadcn/ui Card, Badge, Dialog (for preview modal)

---


### Story 8.2: Version Control System for Strategies

As a **user editing a strategy (Amina)**,
I want **to automatically track version history of my strategy with timestamps and changes**,
So that **I can see what changed over time and understand the evolution of my work**.

**Acceptance Criteria:**

**Given** I am editing a strategy
**When** I save changes (manual save or auto-save from Story 4.4)
**Then** a new version is automatically created
**And** the version is saved to the database
**And** I don't need to manually trigger versioning (it's automatic)

**Given** a version is created
**When** the save completes
**Then** the version record includes:
- Version number (incremental: v1, v2, v3...)
- Timestamp (when saved)
- User who saved it (if team collaboration enabled - Epic 9)
- Snapshot of strategy data (all 6 pillars JSON, meta-variables, title, brand name)
- Change summary (optional: auto-generated or user-provided)

**Given** I want to view version history
**When** I navigate to a strategy detail page (`/strategies/{strategyId}`)
**Then** I see a "Version History" button or tab
**And** clicking it opens the version history panel

**Given** the version history panel is open
**When** I view the panel
**Then** I see a list of all versions in reverse chronological order (newest first)
**And** each version displays:
- Version number: "Version 12"
- Timestamp: "Jan 20, 2026 at 3:45 PM" (relative time: "2 hours ago")
- User: "Amina Diallo" (or "You" if current user)
- Change summary: "Updated Engagement pillar, modified Q4 campaign dates"
- Status badge: "Current" (green, for latest version) or version number
- Actions: "View" button, "Compare" button, "Restore" button (Story 8.3)

**Given** I have many versions
**When** the list is long (>20 versions)
**Then** I see pagination or "Load More" button
**And** versions load in batches of 20
**And** I can scroll through history

**Given** I click "View" on a previous version
**When** I click the button
**Then** I see a read-only view of that version
**And** the strategy detail page shows the historical data (pillars, meta-variables as they were)
**And** I see a banner at the top: "You are viewing Version 8 (saved Jan 15, 2026). This is not the current version."
**And** I see buttons: "Restore This Version" (Story 8.3), "Compare to Current", "Back to Current Version"

**Given** I click "Compare" on a previous version
**When** I click "Compare to Current"
**Then** I see a diff view showing changes between the selected version and the current version
**And** the diff displays:
- Side-by-side or inline comparison
- Additions highlighted in green
- Deletions highlighted in red
- Unchanged content in gray/normal
- Pillar-by-pillar breakdown:
  - Authenticité: [diff content]
  - Distinction: [diff content]
  - Valeur: [diff content]
  - Engagement: [diff content]
  - Risk: [diff content]
  - Track: [diff content]
  - Meta-variables: [diff content]

**Given** I want to compare two specific versions (not just to current)
**When** I select two versions from the history list (checkboxes)
**And** I click "Compare Selected"
**Then** I see a diff between those two versions
**And** the comparison works the same as comparing to current

**Given** I edit a strategy without significant changes
**When** I click save but nothing changed
**Then** no new version is created (to avoid clutter)
**And** the system detects if data is identical to last version
**And** I see a message: "No changes detected, version not saved."

**Given** I edit a strategy with minor changes
**When** I make a small change (e.g., fix a typo in one pillar)
**Then** a new version is still created (even minor changes are versioned)
**And** the change summary might be auto-generated: "Modified Authenticité pillar"

**Given** versions have retention limits (90 days for Professional - FR31)
**When** I am on Starter tier
**Then** versions older than 30 days are automatically deleted (Starter: 30-day retention)
**And** I see a notice: "Version history available for 30 days. Upgrade to Professional for 90-day retention."

**Given** I am on Professional tier
**When** I view version history
**Then** versions are retained for 90 days
**And** versions older than 90 days are automatically purged
**And** I see: "Version history available for 90 days."

**Given** I am on Free tier
**When** I view version history
**Then** only the current version is available (no version history for Free tier)
**And** I see a message: "Version history is available on Starter and Professional plans. Upgrade to unlock this feature."
**And** the "Version History" button shows a lock icon

**Given** the version control system is performant
**When** I save a strategy
**Then** version creation happens asynchronously (doesn't block save operation)
**And** the save completes in <500ms (NFR-P3)
**And** version snapshot is stored in background (Inngest job or immediate DB insert)

**Given** version snapshots are space-efficient
**When** I review storage
**Then** each version stores the full strategy JSON (not diffs, for simplicity and reliability)
**And** old versions are compressed (gzip or similar) to save space
**And** versions are stored in database (not Vercel Blob) for fast querying
**And** database model:
  ```prisma
  model StrategyVersion {
    id              String   @id @default(cuid())
    strategyId      String
    versionNumber   Int      // incremental: 1, 2, 3...
    snapshot        Json     // full strategy data at this version
    changeSummary   String?  // optional: auto-generated or user-provided
    createdBy       String   // userId who created this version
    createdAt       DateTime @default(now())
    strategy        Strategy @relation(fields: [strategyId], references: [id], onDelete: Cascade)
    user            User     @relation(fields: [createdBy], references: [id])
    @@index([strategyId, versionNumber])
    @@index([createdAt]) // for retention purge queries
  }
  ```

**Given** auto-generated change summaries
**When** a version is created
**Then** the system can auto-detect changed fields:
  - Compare `snapshot` JSON to previous version
  - Generate summary: "Updated Engagement pillar, modified meta-variables"
**And** change summary is stored in `changeSummary` field
**And** users can optionally add manual notes (future enhancement)

**Given** version history respects multi-tenancy
**When** I view version history
**Then** I only see versions for strategies I own (tenant isolation via RLS)
**And** other users cannot access my version history

**Given** the feature is implemented
**When** I review technical details
**Then** version creation triggered by tRPC mutation: `strategies.save()` → after save, create version
**And** version creation:
  ```typescript
  async function createVersion(strategyId: string, userId: string) {
    const strategy = await getStrategy(strategyId)
    const lastVersion = await getLastVersion(strategyId)
    const versionNumber = (lastVersion?.versionNumber ?? 0) + 1
    const snapshot = { /* full strategy JSON */ }
    const changeSummary = generateChangeSummary(snapshot, lastVersion?.snapshot)
    await prisma.strategyVersion.create({
      data: { strategyId, versionNumber, snapshot, changeSummary, createdBy: userId }
    })
  }
  ```
**And** version history fetched via tRPC: `strategyVersions.list({ strategyId })`
**And** diff generation uses library like `diff` (npm package) or custom JSON diff
**And** retention purge via Inngest daily job: delete versions older than tier limit

---


### Story 8.3: Version Rollback and Restoration

As a **user reviewing version history (Amina)**,
I want **to restore a previous version of my strategy**,
So that **I can recover from mistakes or revert to a better state**.

**Acceptance Criteria:**

**Given** I am viewing a previous version (from Story 8.2)
**When** I see the historical version in read-only mode
**Then** I see a prominent "Restore This Version" button
**And** the button is enabled if I have permission to edit the strategy

**Given** I click "Restore This Version"
**When** I click the button
**Then** I see a confirmation modal: "Restore Version 8?"
**And** the modal displays:
- Warning: "This will replace the current version (Version 12) with Version 8."
- Impact: "All changes made after Version 8 will be lost unless you create a backup."
- Recommendation: "Consider duplicating your strategy first (Story 4.5) to keep a backup."
- Version comparison preview:
  - Current version: Version 12 (Jan 20, 2026)
  - Restoring to: Version 8 (Jan 15, 2026)
  - Time difference: 5 days ago
- Checkbox: "I understand this action cannot be undone"
- Buttons: "Restore Version 8" (primary, red/destructive color) and "Cancel"

**Given** I don't check the confirmation checkbox
**When** the checkbox is unchecked
**Then** the "Restore Version 8" button is disabled
**And** I cannot proceed without acknowledging the warning

**Given** I confirm the restoration
**When** I check the box and click "Restore Version 8"
**Then** the system restores Version 8 as the current version
**And** the restoration creates a NEW version (Version 13) with the content from Version 8
**And** Version 12 is NOT deleted (it remains in history)
**And** Version 13 is marked as: "Restored from Version 8"
**And** I see a success message: "Version 8 restored successfully. You are now on Version 13."
**And** I am redirected to the strategy detail page showing the restored content
**And** I can continue editing from this restored state

**Given** the restoration creates a new version (not overwrites)
**When** I review the version history after restoration
**Then** I see:
- Version 13 (Current): "Restored from Version 8" - Jan 20, 2026 at 4:00 PM
- Version 12: "Updated Engagement pillar..." - Jan 20, 2026 at 3:45 PM
- Version 11: ...
- ...
- Version 8: "Modified Risk pillar..." - Jan 15, 2026 at 2:00 PM
**And** Version 12 is preserved in history (I can still view or restore it if needed)

**Given** I want to restore but keep a backup first
**When** I see the restoration warning
**And** I click "Cancel"
**Then** the modal closes and nothing is restored
**And** I can navigate to "Duplicate Strategy" (Story 4.5)
**And** I duplicate the current version as a backup
**And** then return to restore the older version

**Given** I am on Starter tier with 30-day version retention
**When** I try to restore a version older than 30 days
**Then** I see an error: "This version is no longer available. Starter tier retains versions for 30 days only."
**And** the "Restore" button is disabled for expired versions
**And** I see a prompt: "Upgrade to Professional for 90-day version retention."

**Given** I am on Professional tier with 90-day retention
**When** I try to restore a version within 90 days
**Then** the restoration works normally
**And** I can restore any version up to 90 days old

**Given** I try to restore a version beyond 90 days (Professional tier)
**When** the version is older than 90 days
**Then** I see an error: "This version is no longer available. Versions are retained for 90 days."
**And** the "Restore" button is disabled

**Given** I accidentally restore the wrong version
**When** I realize the mistake immediately after restoration
**Then** I can restore the previous current version (e.g., restore Version 12 after restoring Version 8)
**And** this creates another new version (Version 14: "Restored from Version 12")
**And** the version history allows me to navigate back and forth

**Given** I want to preview before restoring
**When** I am in the confirmation modal
**Then** I see a "Preview Changes" link
**And** clicking it opens a diff view comparing:
  - Left: Current version (Version 12)
  - Right: Version to restore (Version 8)
**And** I can see exactly what will change before confirming
**And** I can click "Back" to return to the confirmation modal

**Given** restoration is tracked in version metadata
**When** a version is created via restoration
**Then** the version record includes:
  - `changeSummary`: "Restored from Version 8"
  - `isRestoration`: true (boolean flag)
  - `restoredFromVersion`: 8 (reference to original version number)
**And** this metadata is displayed in version history

**Given** I restore a version and continue editing
**When** I make changes after restoring Version 8
**And** I save
**Then** a new version (Version 14) is created normally
**And** Version 14 contains my new edits on top of the restored Version 8 content
**And** the version chain is: V8 → V9 → V10 → V11 → V12 → V13 (restored from V8) → V14 (new edits)

**Given** restoration affects all pillars and meta-variables
**When** I restore a version
**Then** ALL strategy data is restored:
  - All 6 pillar JSON (Authenticité, Distinction, Valeur, Engagement, Risk, Track)
  - Meta-variables
  - Brand name and title
  - Status (if changed)
  - Coherence score is recalculated (if applicable)
**And** NO data from the current version is preserved (full replacement)

**Given** team members are notified of restoration (if Epic 9 enabled)
**When** I restore a version in a shared strategy
**Then** team members receive a notification: "Amina restored Strategy X to Version 8"
**And** the activity feed logs: "Amina Diallo restored Version 8 on Jan 20, 2026 at 4:00 PM"

**Given** the feature is implemented
**When** I review technical details
**Then** restoration via tRPC mutation: `strategyVersions.restore({ versionId })`
**And** restoration logic:
  ```typescript
  async function restoreVersion(versionId: string, userId: string) {
    const version = await getVersion(versionId)
    const strategy = await getStrategy(version.strategyId)

    // Create new version with restored content
    await createVersion(strategy.id, userId, {
      snapshot: version.snapshot,
      changeSummary: `Restored from Version ${version.versionNumber}`,
      isRestoration: true,
      restoredFromVersion: version.versionNumber
    })

    // Update current strategy with restored content
    await prisma.strategy.update({
      where: { id: strategy.id },
      data: { ...version.snapshot, updatedAt: new Date() }
    })

    return { success: true, newVersionNumber: latestVersionNumber }
  }
  ```
**And** confirmation modal uses shadcn/ui AlertDialog
**And** diff preview uses same diff library as Story 8.2

---


### Story 8.4: PowerPoint Export Generation

As a **user with a completed strategy (Amina)**,
I want **to export my strategy as a PowerPoint presentation**,
So that **I can present it to clients, stakeholders, or team members in a professional format**.

**Acceptance Criteria:**

**Given** I have a completed strategy
**When** I navigate to the strategy detail page
**Then** I see an "Export" dropdown button
**And** the dropdown includes options:
- "Export as PDF" (Story 5.1)
- "Export as Excel" (Story 5.2)
- "Export as PowerPoint" (new, this story)

**Given** I click "Export as PowerPoint"
**When** I select the option
**Then** I see a PowerPoint export configuration modal
**And** the modal displays:
- Title: "Export as PowerPoint"
- Export options:
  - Include all 6 pillars (checked by default)
  - Or select specific pillars to include (checkboxes)
  - Include meta-variables section (checkbox)
  - Include coherence score summary (checkbox)
- Branding options:
  - "Apply custom branding" (checkbox) → if checked, uses settings from Story 8.5
  - Preview: "Your logo and brand colors will be applied"
- File name: pre-filled with "{BrandName}_ADVERT_Strategy.pptx" (editable)
- Buttons: "Generate PowerPoint" (primary) and "Cancel"

**Given** I configure the export
**When** I select:
  - Include: Authenticité, Distinction, Valeur, Engagement (unchecked Risk, Track)
  - Include meta-variables: Yes
  - Apply custom branding: Yes
  - File name: "Zahra_Fashion_Strategy_2026.pptx"
**And** I click "Generate PowerPoint"
**Then** I see a loading message: "Generating PowerPoint presentation..."
**And** the export job is queued in Inngest (background processing)
**And** I see: "Your PowerPoint is being generated. This may take up to 60 seconds. We'll notify you when it's ready."
**And** I can close the modal and continue working (non-blocking)

**Given** the export is processing
**When** I wait for the export to complete
**Then** I see a progress indicator (toast or notification)
**And** the notification shows: "Generating PowerPoint... 30 seconds remaining" (estimated time)
**And** I can navigate away from the page (export continues in background)

**Given** the export completes successfully
**When** the Inngest job finishes (target: <60 seconds, NFR-P4)
**Then** I receive an in-app notification: "Your PowerPoint export is ready!"
**And** I see a "Download" button in the notification
**And** clicking "Download" downloads the .pptx file to my device
**And** the file name matches what I specified: "Zahra_Fashion_Strategy_2026.pptx"
**And** I also receive an email with download link (optional, for convenience if I closed the browser)

**Given** I download and open the PowerPoint
**When** I open the .pptx file in PowerPoint, Keynote, or Google Slides
**Then** I see a professionally formatted presentation with:
  - **Slide 1 (Title Slide):**
    - Brand logo (if custom branding enabled - Story 8.5)
    - Title: "{Brand Name} - ADVERT Strategy"
    - Subtitle: "6-Pillar Brand Strategy Framework"
    - Date: "Generated on January 20, 2026"
    - ADVERT logo (footer)
  - **Slide 2 (Strategy Overview):**
    - Brand name and tagline
    - Coherence score: "Campaign Coherence Score: 85"
    - Pillar completion status: "6/6 Pillars Complete"
    - Strategy creation date
  - **Slide 3 (Table of Contents):**
    - List of included pillars with icons
  - **Slides 4-9 (Pillar Slides - one slide per pillar):**
    - Pillar icon and name (e.g., "Authenticité")
    - Key content from pillar JSON:
      - Mission, vision, values (for Authenticité)
      - Personas, positioning (for Distinction)
      - Value proposition, pricing (for Valeur)
      - Rituals, campaigns, 12-month calendar (for Engagement)
      - SWOT, challenges (for Risk)
      - KPIs, metrics (for Track)
    - Content formatted with bullet points, subheadings
  - **Slide 10 (Meta-Variables - if included):**
    - Industry-specific variables
    - Table or list format
  - **Slide 11 (Closing Slide):**
    - "Thank you"
    - Contact information (if provided in branding settings)
    - "Powered by ADVERT" (footer)

**Given** custom branding is applied (Story 8.5)
**When** I enabled "Apply custom branding" during export
**Then** the PowerPoint includes:
- My brand logo on title slide and footers
- Brand colors for headings, accents, backgrounds
- Custom fonts (if specified in branding settings)
**And** the ADVERT logo is less prominent (small footer logo, not competing with brand logo)

**Given** I selected specific pillars only
**When** I unchecked "Risk" and "Track"
**Then** the PowerPoint includes only the selected 4 pillars (Authenticité, Distinction, Valeur, Engagement)
**And** the table of contents reflects only those pillars
**And** slides are numbered accordingly (fewer slides)

**Given** the export fails
**When** the Inngest job encounters an error (e.g., file generation timeout, Vercel Blob upload failure)
**Then** I receive a notification: "PowerPoint export failed. Please try again."
**And** I see a "Retry" button
**And** the error is logged in Sentry for debugging
**And** I can retry the export

**Given** the export takes longer than expected
**When** the generation exceeds 60 seconds
**Then** I see a message: "This is taking longer than usual. Please wait or try again later."
**And** the job continues (timeout: 2 minutes max)
**And** if it exceeds 2 minutes, it fails with timeout error

**Given** I view my export history
**When** I navigate to `/settings/exports` or a new "Exports" section
**Then** I see a list of all my recent exports (PDF, Excel, PowerPoint)
**And** each export shows:
  - File name
  - Export type: "PowerPoint"
  - Date exported
  - Status: "Ready", "Processing", "Failed"
  - Download button (if ready)
**And** exports are retained for 30 days, then deleted (to save storage)

**Given** the PowerPoint is stored temporarily
**When** the export completes
**Then** the .pptx file is uploaded to Vercel Blob (or S3)
**And** a download URL is generated with 30-day expiry
**And** the export record is saved in database:
  ```prisma
  model Export {
    id          String       @id @default(cuid())
    strategyId  String
    userId      String
    type        ExportType   // PDF, EXCEL, POWERPOINT
    fileName    String
    fileUrl     String       // Vercel Blob URL
    status      ExportStatus // PROCESSING, READY, FAILED
    options     Json         // export config (pillars included, branding, etc.)
    expiresAt   DateTime     // 30 days from creation
    createdAt   DateTime     @default(now())
    strategy    Strategy     @relation(fields: [strategyId], references: [id])
    user        User         @relation(fields: [userId], references: [id])
    @@index([userId, status])
    @@index([expiresAt]) // for cleanup job
  }
  ```

**Given** the feature is performant (NFR-P4)
**When** I generate a PowerPoint export
**Then** the generation completes in <60 seconds (target: 45 seconds average)
**And** the .pptx file size is optimized (<10 MB for typical strategy)
**And** the export job runs in Inngest (async, doesn't block user)

**Given** the PowerPoint is accessible and editable
**When** I open the exported file
**Then** I can edit all slides in PowerPoint/Keynote/Google Slides
**And** I can add my own slides, notes, speaker notes
**And** the file is in modern .pptx format (Office Open XML)
**And** the file is compatible with PowerPoint 2016+, Keynote 10+, Google Slides

**Given** the feature is implemented
**When** I review technical details
**Then** export triggered via tRPC: `exports.createPowerPoint({ strategyId, options })`
**And** Inngest job: `export-powerpoint` processes the request
**And** PowerPoint generation uses a library:
  - Option 1: `pptxgenjs` (npm package for generating .pptx in Node.js)
  - Option 2: Server-side tool (e.g., LibreOffice in Docker, Google Slides API)
**And** generation steps:
  1. Fetch strategy data from database
  2. Generate slides programmatically (title, content slides, closing)
  3. Apply branding (logo, colors, fonts from Story 8.5 settings)
  4. Save .pptx file to Vercel Blob
  5. Update export record status to READY
  6. Send notification to user
**And** email sent via Resend: "Your PowerPoint Export is Ready" with download link
**And** cleanup job (Inngest daily): delete expired exports (>30 days) from Vercel Blob and database

---


### Story 8.5: Custom Branded Export Templates

As a **user exporting strategies (Amina)**,
I want **to apply my brand's logo, colors, and fonts to exported documents**,
So that **PDFs, Excel files, and PowerPoints look professional and on-brand for client deliverables**.

**Acceptance Criteria:**

**Given** I want to set up custom branding
**When** I navigate to `/settings/branding` or `/settings/profile`
**Then** I see a "Export Branding" section
**And** the section displays:
- Page title: "Custom Export Branding"
- Description: "Customize how your exports look with your brand identity"
- Current branding preview (if configured)
- "Edit Branding" button

**Given** I click "Edit Branding"
**When** I click the button
**Then** I see a branding configuration form
**And** the form includes:
  - **Logo Upload:**
    - "Upload Logo" button (accepts PNG, JPG, SVG)
    - Recommended size: "300×100 px or higher resolution"
    - Preview of uploaded logo
    - "Remove Logo" button (if logo exists)
  - **Brand Colors:**
    - Primary color picker (hex or RGB input)
    - Secondary color picker
    - Accent color picker
    - Preview: "These colors will be used for headings, charts, and accents in exports"
  - **Brand Fonts (optional):**
    - Heading font dropdown (list of common fonts: Arial, Helvetica, Georgia, Times New Roman, Montserrat, Roboto, etc.)
    - Body font dropdown
    - Note: "Custom font uploads not supported yet. Choose from available system fonts."
  - **Contact Information (optional):**
    - Company name
    - Email
    - Phone number
    - Website URL
    - Note: "This will appear in export footers"
  - Buttons: "Save Branding" (primary) and "Cancel"

**Given** I upload a logo
**When** I click "Upload Logo"
**And** I select a file: "zahra-fashion-logo.png" (500×150 px, 50 KB)
**Then** the file is uploaded to Vercel Blob
**And** I see a preview of the logo in the form
**And** I see success message: "Logo uploaded successfully"

**Given** I upload an invalid logo file
**When** I try to upload a 10 MB file or unsupported format (.gif, .bmp)
**Then** I see an error: "File too large (max 2 MB) or unsupported format. Use PNG, JPG, or SVG."
**And** the upload is rejected

**Given** I set brand colors
**When** I select:
  - Primary color: #D4AF37 (gold)
  - Secondary color: #000000 (black)
  - Accent color: #FFFFFF (white)
**Then** I see a live preview of how these colors will look in exports
**And** the preview shows a sample slide or document page with the colors applied

**Given** I set fonts
**When** I choose:
  - Heading font: Montserrat
  - Body font: Roboto
**Then** the preview updates to show text in those fonts

**Given** I add contact information
**When** I enter:
  - Company name: "Zahra Fashion House"
  - Email: contact@zahrafashion.com
  - Phone: +237 6XX XXX XXX
  - Website: www.zahrafashion.com
**Then** this information will appear in export footers

**Given** I save the branding configuration
**When** I click "Save Branding"
**Then** the settings are saved to the database
**And** I see success message: "Branding settings saved successfully"
**And** my exports will now use this branding by default

**Given** the branding is saved
**When** I review the database
**Then** the settings are stored in a `BrandingSettings` model:
  ```prisma
  model BrandingSettings {
    id              String   @id @default(cuid())
    userId          String   @unique
    logoUrl         String?  // Vercel Blob URL
    primaryColor    String?  // hex code
    secondaryColor  String?
    accentColor     String?
    headingFont     String?  // font name
    bodyFont        String?
    companyName     String?
    email           String?
    phone           String?
    website         String?
    createdAt       DateTime @default(now())
    updatedAt       DateTime @updatedAt
    user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  }
  ```

**Given** I export a PDF with custom branding (Story 5.1)
**When** I generate a PDF export
**And** custom branding is enabled
**Then** the PDF includes:
  - My logo in the header (top-left)
  - Primary color for section headings
  - Accent color for charts and callouts
  - Heading/body fonts throughout
  - Contact information in footer

**Given** I export an Excel with custom branding (Story 5.2)
**When** I generate an Excel export
**Then** the Excel file includes:
  - Logo on first sheet (top-left)
  - Primary color for header rows
  - Company name in footer

**Given** I export a PowerPoint with custom branding (Story 8.4)
**When** I generate a PowerPoint export
**Then** the PowerPoint includes:
  - Logo on title slide and slide masters
  - Primary color for slide backgrounds or accents
  - Secondary color for text/headings
  - Heading/body fonts applied to all text
  - Contact information on closing slide

**Given** I want to preview branding before exporting
**When** I view the branding settings page
**Then** I see a "Preview Export" button
**And** clicking it generates a sample PDF/PowerPoint with dummy content
**And** I can review how my branding looks before exporting a real strategy

**Given** I want to disable branding for a specific export
**When** I am in the export modal (PDF, Excel, PowerPoint)
**Then** I see a checkbox: "Apply custom branding"
**And** I can uncheck it to export without branding (plain ADVERT template)

**Given** I remove my logo
**When** I click "Remove Logo" in branding settings
**Then** the logo is deleted from Vercel Blob
**And** future exports will not include a logo (only ADVERT logo)

**Given** I reset branding to defaults
**When** I click "Reset to Default" button
**Then** I see a confirmation: "This will remove all custom branding. Continue?"
**And** if I confirm, all settings are cleared
**And** exports return to default ADVERT branding

**Given** branding is tier-restricted
**When** I am on Starter tier
**Then** I can upload a logo and set colors
**And** custom fonts are available

**Given** I am on Free tier
**When** I try to access branding settings
**Then** I see a lock icon and message: "Custom export branding is available on Starter and Professional plans."
**And** the feature is disabled

**Given** the feature is responsive
**When** I configure branding on different devices
**Then** the form works on desktop, tablet, and mobile
**And** logo upload works on mobile (camera or file picker)

**Given** the feature is implemented
**When** I review technical details
**Then** branding settings fetched via tRPC: `brandingSettings.get()`
**And** branding update via tRPC: `brandingSettings.update({ logo, colors, fonts, contact })`
**And** logo upload uses Vercel Blob: `POST /api/uploads/logo` → returns `logoUrl`
**And** export generation (PDF, Excel, PowerPoint) fetches branding settings and applies:
  - PDF: use logo URL, inject colors and fonts into PDF template
  - Excel: add logo as image, style header rows with colors
  - PowerPoint: use `pptxgenjs` or similar to set master slide with logo, colors, fonts
**And** color picker uses shadcn/ui Input with type="color" or custom color picker component
**And** font dropdown uses shadcn/ui Select

---


### Story 8.6: Email Export Delivery to Clients

As a **user with a completed export (Amina)**,
I want **to email PDF, Excel, or PowerPoint exports directly to clients from the platform**,
So that **I can deliver strategies without leaving ADVERT or managing file attachments manually**.

**Acceptance Criteria:**

**Given** I have generated an export (PDF, Excel, or PowerPoint)
**When** the export is ready (status: READY)
**Then** I see an "Email Export" button next to the "Download" button
**And** the button is available in:
  - Export history page (`/settings/exports`)
  - Export ready notification (in-app or email)
  - Strategy detail page (if export was just generated)

**Given** I click "Email Export"
**When** I click the button
**Then** I see an "Email Export" modal
**And** the modal displays:
  - Title: "Email Export to Client"
  - **Recipient(s):**
    - Email input field (supports multiple emails, comma-separated)
    - Validation: must be valid email format
    - Optional: "Add from contacts" button (if contact list exists)
  - **Subject:**
    - Pre-filled: "{Brand Name} ADVERT Strategy - {Export Type}"
    - Editable
  - **Message:**
    - Text area for custom message
    - Pre-filled with default message:
      ```
      Hi,

      Please find attached the ADVERT strategy for {Brand Name}.

      This document includes the 6-pillar brand strategy framework covering Authenticité, Distinction, Valeur, Engagement, Risk, and Track.

      Let me know if you have any questions or need revisions.

      Best regards,
      {Your Name}
      ```
    - Editable (user can customize)
  - **Attachment preview:**
    - File name: "Zahra_Fashion_Strategy_2026.pptx"
    - File size: "2.5 MB"
    - Export type icon (PowerPoint, PDF, Excel)
  - **Send options:**
    - Checkbox: "Send a copy to myself (Cc)"
    - Checkbox: "Notify me when email is opened" (optional, if using email tracking service)
  - Buttons: "Send Email" (primary) and "Cancel"

**Given** I enter recipient emails
**When** I type: "client@example.com, partner@example.com"
**Then** the emails are validated
**And** if valid, I see green checkmarks
**And** if invalid (e.g., "client@"), I see inline error: "Invalid email address"

**Given** I customize the message
**When** I edit the message body
**Then** I can write a personalized message to the client
**And** the message can include line breaks, emojis (if user adds them)
**And** character limit: 5000 characters (reasonable for email body)

**Given** I click "Send Email"
**When** I click the button
**And** all fields are valid
**Then** the email is sent via Resend
**And** I see a loading state: "Sending email..."
**And** after 2-3 seconds, I see success message: "Email sent successfully to client@example.com, partner@example.com"
**And** the modal closes
**And** I return to the previous page

**Given** the email is sent
**When** the client receives the email
**Then** the email includes:
  - **From:** noreply@advert.com or my custom domain (if configured)
  - **To:** client@example.com, partner@example.com
  - **Subject:** "{Brand Name} ADVERT Strategy - PowerPoint"
  - **Body:** Custom message I wrote
  - **Attachment:** The export file (Zahra_Fashion_Strategy_2026.pptx)
  - **Footer:** "Sent via ADVERT | www.advert.com" (subtle branding)

**Given** the attachment is too large for email
**When** the export file is >10 MB (rare, but possible for large PowerPoints with images)
**Then** the file is NOT attached directly
**And** instead, the email includes a secure download link:
  - "Your ADVERT strategy is ready. Download it here: [Secure Link]"
  - Link expires in 7 days
  - Link requires no login (but is unique and hard to guess)
**And** I see a note in the modal: "File is large (12 MB). A secure download link will be sent instead of attaching."

**Given** I select "Send a copy to myself"
**When** I check the Cc option
**Then** I receive the same email as the client
**And** my email is included in the Cc field

**Given** the email send fails
**When** Resend API returns an error (e.g., invalid recipient, quota exceeded, network issue)
**Then** I see an error message: "Failed to send email: [reason]. Please try again."
**And** the modal remains open so I can retry or modify recipients
**And** the error is logged in Sentry

**Given** I want to track email opens (optional)
**When** I enable "Notify me when email is opened"
**And** the email is sent
**Then** the email includes a tracking pixel or link
**And** when the client opens the email, I receive a notification: "Your email to client@example.com was opened"
**And** I can see open status in export history: "Sent, Opened"

**Given** I view email delivery history
**When** I navigate to `/settings/exports` or a dedicated "Email History" tab
**Then** I see a list of all emails I've sent
**And** each entry shows:
  - Export file name
  - Recipient(s)
  - Date sent
  - Status: "Delivered", "Opened", "Failed"
  - "Resend" button (if delivery failed)

**Given** I want to resend an email
**When** I click "Resend" on a previous email
**Then** the email modal opens pre-filled with:
  - Same recipients
  - Same subject
  - Same message
  - Same export file
**And** I can edit and send again

**Given** the feature respects email limits
**When** I send multiple emails in a short time
**Then** the system enforces rate limits:
  - Free tier: 5 emails/day
  - Starter tier: 50 emails/day
  - Professional tier: 500 emails/day
  - Enterprise tier: Unlimited (or custom limit)
**And** if I exceed the limit, I see: "Daily email limit reached. Upgrade to send more or try again tomorrow."

**Given** the feature is secure
**When** I review security measures
**Then** export files are not publicly accessible (download links are authenticated or time-limited)
**And** email recipients cannot access my other strategies (file links are specific to one export)
**And** email tracking (if enabled) respects privacy (GDPR compliant, no third-party trackers)

**Given** the feature is implemented
**When** I review technical details
**Then** email sending via tRPC: `exports.sendEmail({ exportId, recipients, subject, message, ccSelf })`
**And** email sent via Resend API:
  ```typescript
  await resend.emails.send({
    from: 'ADVERT <noreply@advert.com>',
    to: recipients, // array of emails
    cc: ccSelf ? [currentUser.email] : [],
    subject: subject,
    html: `<p>${message}</p><p>---</p><p>Sent via ADVERT</p>`,
    attachments: fileSize < 10MB ? [{ filename, content: fileBuffer }] : [],
    // if large file, include download link in body instead
  })
  ```
**And** large files (>10 MB) generate secure download link:
  - Store export in Vercel Blob with unique ID
  - Generate URL: `https://advert.com/exports/download/{secureToken}`
  - Token expires in 7 days
  - Endpoint validates token, serves file with `Content-Disposition: attachment`
**And** email tracking (optional) uses Resend webhooks or custom tracking pixel
**And** email delivery status logged in database:
  ```prisma
  model EmailDelivery {
    id          String   @id @default(cuid())
    exportId    String
    userId      String
    recipients  String[] // array of emails
    subject     String
    message     String
    status      EmailStatus // SENT, DELIVERED, OPENED, FAILED
    sentAt      DateTime @default(now())
    openedAt    DateTime?
    export      Export   @relation(fields: [exportId], references: [id])
    user        User     @relation(fields: [userId], references: [id])
  }
  ```
**And** rate limiting enforced via middleware or tRPC procedure check

---

**Epic 8 Complete!** 🎉

Epic 8: Advanced Strategy Features (6 stories) is now fully documented with comprehensive acceptance criteria covering:
- Sector template library (Fashion, Fintech, FMCG, B2B SaaS) with pre-filled meta-variables
- Version control system with automatic versioning on save
- Version history UI with diff visualization and 90-day retention (Professional)
- Version rollback with confirmation and restoration to previous states
- PowerPoint export generation (<60 seconds, background job via Inngest)
- Custom branded export templates (logo, colors, fonts, contact info)
- Email export delivery directly to clients with attachment or secure download link

---

## Epic 9: Team Collaboration & Permissions (Growth Phase)

**Goal:** Enable multi-user agencies to collaborate on strategies with role-based access control, activity tracking, and team communication.

**User Outcome:** Agency owners can invite team members, assign granular roles and permissions, manage team access, track all activities via audit logs, enable threaded discussions on pillars, mention team members, and receive real-time notifications.

---

### Story 9.1: Role-Based Access Control (RBAC) System Setup

As a **platform architect**,
I want **to implement a comprehensive RBAC system with 4 distinct roles and granular permissions**,
So that **agencies can control access to strategies and features based on team member responsibilities**.

**Acceptance Criteria:**

**Given** the RBAC system is implemented
**When** I review the role definitions
**Then** I see 4 roles with distinct permissions:

**1. Agency Owner:**
- Full access to all features
- Can create, edit, delete strategies
- Can invite and manage team members
- Can assign strategies to team members
- Can view audit logs
- Can manage billing and subscription
- Can configure workspace settings
- Can export strategies (all formats)
- Can delete the workspace
- Limit: 1 per workspace (the creator)

**2. Consultant:**
- Can create, edit strategies assigned to them or public strategies
- Can comment on all strategies
- Can export strategies they have access to
- Can view team members
- Cannot invite new members
- Cannot manage billing
- Cannot delete workspace
- Cannot view full audit logs (only activity feed)

**3. Brand Client:**
- View-only access to assigned strategies
- Can comment on assigned strategies
- Can export assigned strategies (if permission granted)
- Cannot create or edit strategies
- Cannot view other strategies
- Cannot view team member list (except collaborators on same strategy)
- Cannot access workspace settings

**4. Developer (Enterprise Only):**
- API access to strategies
- Can generate API keys
- Can configure webhooks
- Can view API usage analytics
- Read/write access via API based on scoped permissions
- Cannot access web UI strategy editing (API-only role)
- Must be explicitly invited and assigned

**Given** permissions are enforced at multiple levels
**When** I review the permission matrix
**Then** I see granular permissions for each role:

| Feature | Agency Owner | Consultant | Brand Client | Developer |
|---------|--------------|------------|--------------|-----------|
| Create Strategy | ✅ | ✅ | ❌ | ✅ (API) |
| Edit Own Strategy | ✅ | ✅ | ❌ | ✅ (API) |
| Edit Assigned Strategy | ✅ | ✅ | ❌ | ✅ (API) |
| Delete Strategy | ✅ | ❌ | ❌ | ❌ |
| View Assigned Strategy | ✅ | ✅ | ✅ | ✅ (API) |
| View All Strategies | ✅ | ❌ | ❌ | ❌ |
| Export Strategy | ✅ | ✅ | ✅* | ✅ (API) |
| Comment on Strategy | ✅ | ✅ | ✅ | ❌ |
| Invite Team Members | ✅ | ❌ | ❌ | ❌ |
| Manage Roles | ✅ | ❌ | ❌ | ❌ |
| Assign Strategies | ✅ | ❌ | ❌ | ❌ |
| View Audit Logs | ✅ | ❌ | ❌ | ❌ |
| View Activity Feed | ✅ | ✅ | ✅* | ❌ |
| Manage Billing | ✅ | ❌ | ❌ | ❌ |
| API Access | ✅ | ❌ | ❌ | ✅ |
| Workspace Settings | ✅ | ❌ | ❌ | ❌ |

*Brand Clients: only for assigned strategies

**Given** the database schema supports RBAC
**When** I review the models
**Then** I see:

```prisma
enum Role {
  AGENCY_OWNER
  CONSULTANT
  BRAND_CLIENT
  DEVELOPER
}

model Workspace {
  id          String   @id @default(cuid())
  name        String   // Agency name
  ownerId     String   // User who created workspace
  tier        Tier     @default(FREE)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  owner       User     @relation("WorkspaceOwner", fields: [ownerId], references: [id])
  members     WorkspaceMember[]
  strategies  Strategy[]
}

model WorkspaceMember {
  id          String   @id @default(cuid())
  workspaceId String
  userId      String
  role        Role
  invitedBy   String
  invitedAt   DateTime @default(now())
  acceptedAt  DateTime?
  status      InvitationStatus @default(PENDING) // PENDING, ACCEPTED, DECLINED
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  inviter     User     @relation("InvitedBy", fields: [invitedBy], references: [id])
  @@unique([workspaceId, userId])
  @@index([userId, role])
}

model StrategyAssignment {
  id          String   @id @default(cuid())
  strategyId  String
  userId      String
  assignedBy  String
  role        Role     // What role they have on THIS strategy (can override workspace role)
  canEdit     Boolean  @default(false)
  canExport   Boolean  @default(true)
  canComment  Boolean  @default(true)
  assignedAt  DateTime @default(now())
  strategy    Strategy @relation(fields: [strategyId], references: [id], onDelete: Cascade)
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  assigner    User     @relation("AssignedBy", fields: [assignedBy], references: [id])
  @@unique([strategyId, userId])
}
```

**Given** permission checks are enforced in the backend
**When** a user tries to perform an action
**Then** the system validates:
1. User is authenticated
2. User belongs to the workspace (WorkspaceMember record exists)
3. User's role has permission for the action
4. If strategy-specific: User has access to that strategy (StrategyAssignment or owner)
5. If feature is tier-locked: Workspace tier supports the feature

**Given** permission enforcement uses middleware
**When** I review the tRPC implementation
**Then** I see permission middleware:

```typescript
// Example middleware for tRPC procedures
const requireRole = (allowedRoles: Role[]) => {
  return t.middleware(async ({ ctx, next }) => {
    if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' })

    const member = await prisma.workspaceMember.findFirst({
      where: { userId: ctx.user.id, workspaceId: ctx.workspaceId }
    })

    if (!member || !allowedRoles.includes(member.role)) {
      throw new TRPCError({ code: 'FORBIDDEN' })
    }

    return next({ ctx: { ...ctx, role: member.role } })
  })
}

// Usage
export const inviteTeamMember = protectedProcedure
  .use(requireRole([Role.AGENCY_OWNER]))
  .input(z.object({ email: z.string().email(), role: z.nativeEnum(Role) }))
  .mutation(async ({ ctx, input }) => {
    // Only Agency Owners can invite
  })
```

**Given** workspace creation assigns Agency Owner role
**When** a user creates a new workspace (signs up)
**Then** a Workspace is created with them as owner
**And** a WorkspaceMember record is created with role: AGENCY_OWNER
**And** they have full access immediately

**Given** solo users (no team) still have a workspace
**When** a user on Starter or Professional tier doesn't invite anyone
**Then** they operate in their own workspace
**And** they are the Agency Owner
**And** team features are available but unused

**Given** Professional tier supports team members
**When** the workspace is on Professional tier (€299/month)
**Then** the Agency Owner can invite up to 5 team members (included in price)
**And** additional members cost €49/month each (FR99)

**Given** Starter tier has limited team features
**When** the workspace is on Starter tier (€99/month)
**Then** team collaboration features are locked
**And** the user sees: "Upgrade to Professional to invite team members"
**And** the workspace has only 1 member (the owner)

**Given** role changes are tracked
**When** an Agency Owner changes a member's role
**Then** the change is logged in audit log (Story 9.4)
**And** the member is notified via email and in-app (Story 9.6)

**Given** the RBAC system is scalable
**When** the workspace grows to 50+ members (Enterprise)
**Then** permission checks remain fast (<50ms)
**And** database queries use indexes on userId, workspaceId, role

**Given** the feature is implemented
**When** I review technical details
**Then** RBAC checks are enforced:
  - At tRPC procedure level (middleware)
  - At database level (RLS policies for tenant isolation - NFR-S4)
  - At UI level (hide buttons/features for unauthorized roles)
**And** permission utilities are reusable:
  ```typescript
  async function canEditStrategy(userId: string, strategyId: string): Promise<boolean> {
    const strategy = await getStrategy(strategyId)
    const member = await getWorkspaceMember(userId, strategy.workspaceId)
    if (!member) return false
    if (member.role === Role.AGENCY_OWNER) return true
    const assignment = await getStrategyAssignment(strategyId, userId)
    if (!assignment) return false
    return assignment.canEdit
  }
  ```

---


### Story 9.2: Team Member Invitation and Management

As an **Agency Owner (Yasmine)**,
I want **to invite team members via email and manage their roles and permissions**,
So that **my agency can collaborate on client strategies with appropriate access levels**.

**Acceptance Criteria:**

**Given** I am an Agency Owner on Professional tier
**When** I navigate to `/settings/team` or `/workspace/team`
**Then** I see the Team Management page
**And** the page displays:
- Page title: "Team Members"
- Current member count: "3 of 5 members" (Professional includes 5)
- "Invite Team Member" button (prominent)
- List of current team members
- "Manage Roles" section

**Given** I view the team member list
**When** I look at the current members
**Then** I see each member displayed as a row or card:
- Avatar (profile photo or initials)
- Name: "Amina Diallo"
- Email: "amina@agency.com"
- Role badge: "Consultant" (color-coded)
- Status: "Active" or "Pending Invitation"
- Joined date: "Joined Jan 10, 2026"
- Actions: "Change Role", "Remove from Team" (dropdown menu)

**Given** I click "Invite Team Member"
**When** I click the button
**Then** I see an invitation modal
**And** the modal displays:
- Title: "Invite Team Member"
- Email input: "Enter email address"
- Role selector dropdown:
  - Consultant (default, recommended for most team members)
  - Brand Client (view-only access)
  - Developer (Enterprise only, grayed out if not Enterprise tier)
- Optional: Personal message text area
- Strategy assignment (optional): "Assign to specific strategies now?" (multi-select)
- Buttons: "Send Invitation" (primary) and "Cancel"

**Given** I enter an email and select a role
**When** I fill in:
- Email: consultant@agency.com
- Role: Consultant
- Message: "Welcome to the team! Looking forward to collaborating."
**And** I click "Send Invitation"
**Then** an invitation email is sent via Resend
**And** a WorkspaceMember record is created with status: PENDING
**And** I see success message: "Invitation sent to consultant@agency.com"
**And** the modal closes
**And** the team member list now shows: "Consultant User - Pending Invitation"

**Given** the invitation email is sent
**When** the recipient receives the email
**Then** the email includes:
- Subject: "Yasmine invited you to join their ADVERT workspace"
- Body:
  ```
  Hi,

  Yasmine Ndiaye from [Agency Name] has invited you to collaborate on ADVERT strategies.

  Role: Consultant
  Message: "Welcome to the team! Looking forward to collaborating."

  [Accept Invitation Button]

  If you don't have an ADVERT account yet, you'll be able to create one after accepting.

  This invitation expires in 7 days.

  ---
  ADVERT | www.advert.com
  ```
- "Accept Invitation" button links to: `https://advert.com/invitations/accept/{invitationToken}`

**Given** the recipient clicks "Accept Invitation"
**When** they click the link
**Then** they are redirected to ADVERT
**And** if they have an account:
  - They log in
  - They see: "Accept invitation from Yasmine Ndiaye?"
  - They click "Accept"
  - WorkspaceMember status updates to: ACCEPTED
  - They are added to the workspace
  - They see: "You've joined [Agency Name]'s workspace!"
  - They are redirected to `/dashboard` (now showing workspace strategies they have access to)
**And** if they don't have an account:
  - They are prompted to sign up
  - After signup, invitation is automatically accepted
  - They join the workspace immediately

**Given** the invitation expires
**When** 7 days pass without acceptance
**Then** the WorkspaceMember record status changes to: EXPIRED
**And** the recipient can no longer accept via the link
**And** the Agency Owner sees: "Invitation expired" in team member list
**And** the owner can resend the invitation

**Given** I want to resend an invitation
**When** I click "Resend Invitation" on an expired or pending member
**Then** a new invitation email is sent
**And** the expiration date resets to 7 days from now
**And** I see: "Invitation resent to consultant@agency.com"

**Given** I want to change a member's role
**When** I click "Change Role" on an active member
**Then** I see a role change modal
**And** the modal shows:
- Current role: Consultant
- New role dropdown: Agency Owner, Consultant, Brand Client, Developer
- Warning (if downgrading): "Changing from Consultant to Brand Client will restrict their access. Continue?"
- Buttons: "Change Role" and "Cancel"
**And** I select a new role and confirm
**Then** the member's role is updated in the database
**And** their permissions change immediately (enforced on next request)
**And** they receive a notification: "Your role has been changed to Brand Client by Yasmine"
**And** the change is logged in audit log

**Given** I want to remove a team member
**When** I click "Remove from Team"
**Then** I see a confirmation dialog: "Remove [Name] from your workspace?"
**And** I see a warning: "They will lose access to all strategies. This action cannot be undone."
**And** I confirm
**Then** the WorkspaceMember record is deleted
**And** all StrategyAssignments for this user are deleted
**And** they lose access immediately
**And** they receive an email: "You've been removed from [Agency Name]'s workspace"
**And** I see: "[Name] removed from team"

**Given** I try to remove myself (Agency Owner)
**When** I try to remove my own account
**Then** I see an error: "You cannot remove yourself. Transfer ownership first or delete the workspace."
**And** the action is blocked

**Given** I reach the team member limit
**When** I have 5 members (Professional tier limit)
**And** I try to invite a 6th member
**Then** I see a modal: "Team member limit reached"
**And** I see options:
  - "Upgrade to Enterprise" (unlimited members)
  - "Add additional seat for €49/month" (FR99)
  - "Remove an existing member to add a new one"
**And** I cannot send the invitation until I upgrade or add a seat

**Given** I add additional seats (Professional tier)
**When** I click "Add Additional Seat" (€49/month each)
**Then** I am taken to a billing flow
**And** I confirm the prorated charge for the current billing cycle
**And** my subscription is updated: "Professional + 1 additional seat: €348/month"
**And** I can now invite more members (up to 6 total)

**Given** I want to transfer ownership
**When** I navigate to "Workspace Settings" → "Transfer Ownership"
**Then** I see a transfer ownership form
**And** I select a new owner from existing Consultants
**And** I confirm with my password
**Then** the new owner's role changes to: AGENCY_OWNER
**And** my role changes to: CONSULTANT
**And** they receive a notification: "You are now the Agency Owner of [Agency Name]"
**And** billing responsibility transfers to them

**Given** I view invitation history
**When** I scroll down on the team page
**Then** I see a "Pending Invitations" section
**And** I see all pending invites with:
  - Email
  - Role
  - Sent date
  - Expires date
  - Actions: Resend, Cancel Invitation

**Given** team features are tier-locked
**When** I am on Starter tier
**Then** the "Invite Team Member" button shows a lock icon
**And** clicking it shows: "Team collaboration is available on Professional and Enterprise plans. Upgrade to unlock."
**And** I see my current team: only me (Agency Owner)

**Given** the feature is implemented
**When** I review technical details
**Then** invitation flow:
  1. Agency Owner submits invitation via tRPC: `team.invite({ email, role, message? })`
  2. Validation: check tier limits, check if email already invited
  3. Create WorkspaceMember record (status: PENDING)
  4. Generate invitation token (JWT with 7-day expiry)
  5. Send email via Resend with invitation link
  6. Recipient clicks link → `/invitations/accept/{token}`
  7. Validate token, authenticate or sign up user
  8. Update WorkspaceMember status to ACCEPTED
  9. Redirect to dashboard
**And** role management via tRPC: `team.updateRole({ memberId, newRole })`
**And** remove member via tRPC: `team.remove({ memberId })`
**And** invitation token stored in JWT:
  ```typescript
  const token = jwt.sign(
    { workspaceId, email, role, invitedBy },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
  ```

---


### Story 9.3: Strategy Assignment and Access Control

As an **Agency Owner (Yasmine)**,
I want **to assign specific strategies to specific team members with granular permissions**,
So that **Brand Clients see only their strategies and Consultants work on assigned projects**.

**Acceptance Criteria:**

**Given** I am viewing a strategy detail page
**When** I am an Agency Owner
**Then** I see a "Manage Access" button or "Share" button in the strategy header
**And** clicking it opens the access management modal

**Given** the access management modal is open
**When** I view the modal
**Then** I see:
- Title: "Manage Strategy Access"
- Current strategy: "{Brand Name} - {Strategy Title}"
- Access level selector:
  - "Private" (only me)
  - "Team" (all workspace members can view/edit based on roles)
  - "Custom" (assign specific members with custom permissions)
- If "Custom" selected: member assignment list
- "Save Changes" button

**Given** I select "Private" access
**When** I set the strategy to Private
**Then** only I (Agency Owner) can view and edit the strategy
**And** no StrategyAssignment records exist for this strategy
**And** other team members don't see it in their dashboard
**And** I see a lock icon on the strategy card

**Given** I select "Team" access
**When** I set the strategy to Team
**Then** all workspace members can view the strategy (based on their role permissions)
**And** Consultants can edit if they have edit rights
**And** Brand Clients can view if they're in the workspace (rare, usually Custom access)
**And** the strategy appears in everyone's dashboard

**Given** I select "Custom" access
**When** I choose Custom and click "Assign Members"
**Then** I see a list of all workspace members (excluding me)
**And** each member has checkboxes:
  - Name: "Amina Diallo (Consultant)"
  - Can View: ✅ (checked by default if selected)
  - Can Edit: ☐ (unchecked)
  - Can Export: ☐ (unchecked)
  - Can Comment: ✅ (checked by default)

**Given** I assign a Consultant to edit a strategy
**When** I select:
  - Member: "Amina Diallo"
  - Can View: ✅
  - Can Edit: ✅
  - Can Export: ✅
  - Can Comment: ✅
**And** I click "Save Changes"
**Then** a StrategyAssignment record is created:
  ```prisma
  { strategyId, userId: amina.id, canEdit: true, canExport: true, canComment: true }
  ```
**And** Amina sees the strategy in her dashboard
**And** she can edit all pillars and save changes
**And** she receives a notification: "Yasmine assigned you to '{Brand Name}' strategy"

**Given** I assign a Brand Client to view-only
**When** I select:
  - Member: "Client Kofi (Brand Client)"
  - Can View: ✅
  - Can Edit: ☐ (grayed out, Brand Clients cannot edit)
  - Can Export: ✅
  - Can Comment: ✅
**And** I save
**Then** Kofi can view the strategy in read-only mode
**And** he cannot edit any fields (buttons are hidden or disabled)
**And** he can comment on pillars (Story 9.5)
**And** he can export PDFs (if enabled)
**And** he receives a notification: "Yasmine shared '{Brand Name}' strategy with you"

**Given** a Consultant tries to access an unassigned strategy
**When** Amina navigates to a strategy she's not assigned to
**Then** she sees a 403 Forbidden error page
**And** the page displays: "You don't have access to this strategy. Contact your workspace owner."
**And** she is redirected back to dashboard

**Given** a Brand Client tries to access an unassigned strategy
**When** Kofi tries to view a strategy not assigned to him
**Then** he sees the same 403 Forbidden error
**And** he cannot see it in his dashboard list

**Given** I want to bulk-assign strategies
**When** I navigate to "Team Management" → "Strategy Assignments"
**Then** I see a matrix view:
  - Rows: All strategies
  - Columns: All team members
  - Cells: Checkboxes for "View", "Edit", "Export", "Comment"
**And** I can quickly assign multiple strategies to multiple members
**And** I click "Save All Changes"
**Then** all StrategyAssignment records are created/updated in bulk

**Given** I remove a member's access to a strategy
**When** I uncheck all permissions for a member in the access modal
**And** I save
**Then** the StrategyAssignment record is deleted
**And** the member loses access immediately
**And** they receive a notification: "Your access to '{Brand Name}' strategy has been removed"

**Given** access changes are reflected immediately
**When** I save access changes
**Then** the member's next request enforces new permissions
**And** if they're currently viewing the strategy, they see a banner: "Your permissions have changed. Please refresh."
**And** on refresh, new permissions apply (if edit removed, they see read-only)

**Given** Brand Clients see only their assigned strategies
**When** a Brand Client logs in
**Then** their dashboard shows only strategies assigned to them
**And** they don't see the full workspace strategy list
**And** navigation is simplified (no "All Strategies" view)
**And** the UI emphasizes "Your Strategies"

**Given** Consultants see only assigned strategies
**When** a Consultant logs in
**Then** their dashboard shows:
  - Strategies they created
  - Strategies assigned to them by Agency Owner
**And** they don't see strategies they're not assigned to
**And** the dashboard has a filter: "My Strategies", "Assigned to Me", "All I Can Access"

**Given** Agency Owners see all strategies
**When** the Agency Owner logs in
**Then** their dashboard shows all workspace strategies (no filtering by assignment)
**And** they have full access to create, edit, delete any strategy

**Given** strategy assignment affects exports
**When** a member with "Can Export: No" tries to export
**Then** the export buttons are hidden or disabled
**And** if they try via API/direct link, they get 403 Forbidden

**Given** strategy assignment affects comments
**When** a member with "Can Comment: No" views a strategy
**Then** the comment section shows: "Commenting disabled for your role"
**And** they can view existing comments but not add new ones

**Given** access control respects multi-tenancy
**When** I assign strategies
**Then** members from other workspaces cannot see my strategies (enforced by RLS)
**And** strategy assignments are workspace-scoped

**Given** the feature is implemented
**When** I review technical details
**Then** access check flow:
  ```typescript
  async function canAccessStrategy(userId: string, strategyId: string): Promise<boolean> {
    const strategy = await getStrategy(strategyId)
    const member = await getWorkspaceMember(userId, strategy.workspaceId)
    if (!member) return false
    if (member.role === Role.AGENCY_OWNER) return true // Full access

    const assignment = await prisma.strategyAssignment.findUnique({
      where: { strategyId_userId: { strategyId, userId } }
    })
    return assignment !== null // Has assignment = can access
  }

  async function canEditStrategy(userId: string, strategyId: string): Promise<boolean> {
    const canAccess = await canAccessStrategy(userId, strategyId)
    if (!canAccess) return false

    const member = await getWorkspaceMember(userId, strategy.workspaceId)
    if (member.role === Role.AGENCY_OWNER) return true
    if (member.role === Role.BRAND_CLIENT) return false // Never can edit

    const assignment = await getStrategyAssignment(strategyId, userId)
    return assignment.canEdit
  }
  ```
**And** tRPC procedures:
  - `strategies.assignMember({ strategyId, userId, permissions })`
  - `strategies.removeMember({ strategyId, userId })`
  - `strategies.updateAccess({ strategyId, accessLevel, assignments })`
**And** UI checks permissions before rendering buttons/forms

---


### Story 9.4: Activity Feed and Audit Log

As an **Agency Owner (Yasmine)**,
I want **to view a comprehensive activity feed and audit log of all workspace actions**,
So that **I can track who did what, when, and maintain accountability and compliance (NFR-S7)**.

**Acceptance Criteria:**

**Given** all user actions are logged
**When** any team member performs an action
**Then** the action is recorded in the ActivityLog table
**And** the log includes:
- Action type (e.g., "strategy.created", "strategy.updated", "member.invited")
- User who performed the action (userId, name, email)
- Timestamp (ISO 8601, UTC)
- IP address (for security audit - NFR-S7)
- Resource affected (e.g., strategyId, memberId)
- Details (JSON with specific changes)
- Workspace ID (for tenant isolation)

**Given** I am an Agency Owner
**When** I navigate to `/workspace/activity` or `/audit-log`
**Then** I see the Activity Feed page
**And** the page displays:
- Page title: "Workspace Activity"
- Filter controls (date range, user, action type)
- Search bar
- Activity list (reverse chronological order)
- Pagination (50 entries per page)

**Given** I view the activity list
**When** I look at recent activities
**Then** I see each activity as a row or card:
- Avatar of user who performed the action
- User name: "Amina Diallo"
- Action description: "edited '{Brand Name}' strategy"
- Timestamp: "2 hours ago" (hover shows exact: "Jan 20, 2026 at 3:45 PM UTC")
- Resource link: clickable link to the strategy
- Details icon: click to expand full details
- IP address (if enabled in settings): "IP: 41.XXX.XXX.XX5" (last octet masked for privacy)

**Given** logged action types include
**When** I review the activity log
**Then** I see comprehensive action types:

**Strategy Actions:**
- `strategy.created`: "Created new strategy '{Brand Name}'"
- `strategy.updated`: "Updated '{Brand Name}' strategy" (with pillar details)
- `strategy.deleted`: "Deleted strategy '{Brand Name}'"
- `strategy.archived`: "Archived strategy '{Brand Name}'"
- `strategy.duplicated`: "Duplicated strategy '{Brand Name}' as '{New Name}'"
- `strategy.exported`: "Exported '{Brand Name}' as PDF"
- `strategy.emailed`: "Emailed '{Brand Name}' export to client@example.com"

**Team Actions:**
- `member.invited`: "Invited consultant@agency.com as Consultant"
- `member.accepted`: "consultant@agency.com accepted invitation"
- `member.removed`: "Removed Amina Diallo from workspace"
- `member.role_changed`: "Changed Amina Diallo's role from Consultant to Brand Client"

**Access Actions:**
- `strategy.assigned`: "Assigned '{Brand Name}' to Amina Diallo with edit access"
- `strategy.unassigned`: "Removed Amina Diallo's access to '{Brand Name}'"
- `strategy.access_changed`: "Changed access level for '{Brand Name}' to Custom"

**Billing Actions (Agency Owner only):**
- `subscription.upgraded`: "Upgraded to Professional tier"
- `subscription.downgraded`: "Downgraded to Starter tier"
- `subscription.cancelled`: "Cancelled subscription"
- `payment.succeeded`: "Payment of €299 succeeded"
- `payment.failed`: "Payment of €299 failed"

**Comment Actions:**
- `comment.created`: "Commented on '{Brand Name}' strategy"
- `comment.replied`: "Replied to comment on '{Brand Name}'"
- `comment.mentioned`: "Mentioned @Yasmine in comment"

**Version Actions:**
- `version.restored`: "Restored '{Brand Name}' to Version 8"

**Export Actions:**
- `export.generated`: "Generated PowerPoint export for '{Brand Name}'"
- `export.downloaded`: "Downloaded PDF export"

**Given** I filter activities by date range
**When** I select "Last 7 days"
**Then** only activities from the past 7 days are shown
**And** I can select custom date range: "Jan 1 - Jan 20, 2026"
**And** the list updates accordingly

**Given** I filter by user
**When** I select "Amina Diallo" from the user dropdown
**Then** only activities performed by Amina are shown
**And** I can see all her actions in chronological order

**Given** I filter by action type
**When** I select "Strategy Updates" category
**Then** only `strategy.updated`, `strategy.created`, etc. are shown
**And** I can focus on specific action categories

**Given** I search the activity log
**When** I type "Brand Name" in the search bar
**Then** all activities related to that strategy are shown
**And** the search supports partial matches, case-insensitive

**Given** I click "Details" on an activity
**When** I expand an activity entry
**Then** I see full details:
- Action: `strategy.updated`
- User: "Amina Diallo (amina@agency.com)"
- Timestamp: "2026-01-20T15:45:32Z"
- IP Address: "41.XXX.XXX.XX5"
- Resource: "Strategy #abc123 - '{Brand Name}'"
- Changes (JSON diff):
  ```json
  {
    "pillar": "Engagement",
    "field": "rituals[0].name",
    "before": "Monthly Newsletter",
    "after": "Weekly Newsletter"
  }
  ```
**And** the details are formatted clearly (not raw JSON)

**Given** Consultants have limited activity view
**When** a Consultant navigates to `/workspace/activity`
**Then** they see a simplified "Activity Feed" (not full audit log)
**And** they see only activities on strategies they have access to
**And** they don't see:
  - Member management actions
  - Billing actions
  - IP addresses
  - Full workspace-wide view
**And** they see: "Limited view. Contact your workspace owner for full audit log."

**Given** Brand Clients have minimal activity view
**When** a Brand Client tries to access `/workspace/activity`
**Then** they are redirected or see 403 Forbidden
**And** they can only see activity on the strategy detail page (for assigned strategies)
**And** the activity shows: "Recent updates to this strategy" (limited to that strategy only)

**Given** audit log retention complies with NFR-S7
**When** I review retention policy
**Then** activity logs are retained:
  - Professional tier: 90 days
  - Enterprise tier: 1 year (365 days)
**And** logs older than retention period are archived or deleted
**And** archived logs can be exported for compliance (Enterprise tier)

**Given** I export the audit log
**When** I click "Export Audit Log" (Agency Owner only)
**Then** I see an export modal with options:
  - Date range selection
  - Format: CSV or JSON
  - Include IP addresses: Yes/No
**And** I click "Export"
**Then** a CSV/JSON file is generated and downloaded
**And** the file includes all activities within the date range
**And** the export action itself is logged: "Exported audit log (Jan 1 - Jan 20, 2026)"

**Given** the activity log is performant
**When** the workspace has 10,000+ activity entries
**Then** the activity feed loads in <2 seconds
**And** pagination and filtering remain fast
**And** database queries use indexes on timestamp, userId, workspaceId

**Given** the feature is secure and compliant
**When** I review security measures
**Then** IP addresses are logged but partially masked in UI for privacy
**And** only Agency Owners can view full audit log
**And** audit logs cannot be modified or deleted by users (append-only)
**And** system admin can access logs for investigation (if breach - NFR-S8)

**Given** the feature is implemented
**When** I review technical details
**Then** activity logging via middleware or utility:
  ```typescript
  async function logActivity(action: string, userId: string, workspaceId: string, details: any, req: Request) {
    await prisma.activityLog.create({
      data: {
        action,
        userId,
        workspaceId,
        ipAddress: getClientIp(req),
        userAgent: req.headers['user-agent'],
        details: details, // JSON
        timestamp: new Date()
      }
    })
  }

  // Usage in tRPC procedure
  await logActivity('strategy.updated', ctx.user.id, ctx.workspaceId, { strategyId, changes }, ctx.req)
  ```
**And** database model:
  ```prisma
  model ActivityLog {
    id          String   @id @default(cuid())
    action      String   // e.g., "strategy.updated"
    userId      String
    workspaceId String
    resourceId  String?  // strategyId, memberId, etc.
    ipAddress   String?
    userAgent   String?
    details     Json     // additional context
    timestamp   DateTime @default(now())
    user        User     @relation(fields: [userId], references: [id])
    workspace   Workspace @relation(fields: [workspaceId], references: [id])
    @@index([workspaceId, timestamp])
    @@index([userId, action])
  }
  ```
**And** activity feed fetched via tRPC: `activity.list({ workspaceId, filters })`
**And** retention cleanup via Inngest daily job: delete logs older than tier limit

---


### Story 9.5: Threaded Comments and Discussions

As a **team member (Amina, Consultant)**,
I want **to add comments to specific pillars with threaded discussions and @mentions**,
So that **my team can collaborate, ask questions, and provide feedback directly within strategies**.

**Acceptance Criteria:**

**Given** I am viewing a strategy with team access
**When** I navigate to a strategy detail page
**Then** I see a "Comments" section at the bottom of each pillar (Authenticité, Distinction, Valeur, Engagement, Risk, Track)
**And** each pillar has its own independent comment thread

**Given** the comments section is visible
**When** I scroll to the comments section of a pillar (e.g., Authenticité)
**Then** I see:
- Section title: "Comments on Authenticité (3)" (count of comments)
- List of existing comments (reverse chronological, newest first)
- "Add Comment" text area
- "Post Comment" button

**Given** I want to add a comment
**When** I type in the "Add Comment" text area
**Then** I can write a comment up to 5000 characters
**And** I see a character counter: "0 / 5000"
**And** I can format text with markdown (optional): **bold**, *italic*, `code`
**And** I can mention team members using @mentions (Story 9.5)

**Given** I post a comment
**When** I type "This mission statement is strong, but we should emphasize sustainability more."
**And** I click "Post Comment"
**Then** the comment is saved to the database
**And** the comment appears immediately in the list (optimistic UI update)
**And** the comment displays:
  - My avatar and name: "Amina Diallo"
  - Timestamp: "Just now" (relative time)
  - Comment text: "This mission statement is strong..."
  - Actions: "Reply", "Edit" (if my comment), "Delete" (if my comment or Agency Owner)

**Given** I view existing comments
**When** I look at the comment list
**Then** I see each comment formatted clearly:
- Avatar (left side)
- Name and role badge: "Amina Diallo (Consultant)"
- Timestamp: "2 hours ago"
- Comment text (supports line breaks, links auto-detected and clickable)
- Reactions (optional): like/upvote icon (future enhancement)
- Reply button

**Given** I want to reply to a comment
**When** I click "Reply" on an existing comment
**Then** I see a reply text area nested under that comment
**And** I type my reply: "Good point, Amina. I'll add a sustainability focus."
**And** I click "Post Reply"
**Then** the reply is saved as a child comment (threaded)
**And** the reply appears indented under the parent comment
**And** the parent comment shows reply count: "1 reply"

**Given** threaded discussions support multiple levels
**When** I reply to a reply
**Then** the thread can go 3 levels deep:
  - Parent comment (Level 1)
    - Reply (Level 2)
      - Reply to reply (Level 3)
**And** beyond Level 3, replies are displayed flat (no further nesting)

**Given** I want to mention a team member
**When** I type "@" in the comment text area
**Then** I see an autocomplete dropdown with team members:
  - @Yasmine (Agency Owner)
  - @Kofi (Brand Client)
  - @Amina (Consultant)
**And** I select "@Yasmine"
**Then** the mention is inserted: "@Yasmine"
**And** when I post, Yasmine receives a notification (Story 9.6)
**And** the mention is rendered as a clickable link (optional: opens profile or highlights)

**Given** multiple mentions in one comment
**When** I write: "@Yasmine and @Kofi, please review the Engagement pillar by EOD."
**Then** both Yasmine and Kofi receive notifications
**And** both mentions are highlighted in the comment

**Given** I edit my comment
**When** I click "Edit" on my own comment
**Then** the comment switches to edit mode (text area)
**And** I modify the text
**And** I click "Save"
**Then** the comment is updated
**And** I see an "(edited)" label next to the timestamp
**And** the edit is logged in activity log: "Edited comment on '{Brand Name}'"

**Given** I delete my comment
**When** I click "Delete" on my own comment
**Then** I see a confirmation: "Delete this comment? This cannot be undone."
**And** I confirm
**Then** the comment is removed from the UI
**And** the comment record is soft-deleted in database (marked deleted, not actually removed)
**And** replies to that comment are orphaned (display "[Comment deleted]" as parent)

**Given** an Agency Owner deletes any comment
**When** Yasmine (Agency Owner) clicks "Delete" on any team member's comment
**Then** she can delete it (moderation capability)
**And** the comment is removed
**And** the original author receives a notification: "Your comment was removed by Yasmine"

**Given** Brand Clients comment on assigned strategies
**When** Kofi (Brand Client) views an assigned strategy
**Then** he can comment on pillars (if permission enabled)
**And** his comments are visible to all team members with access
**And** he can ask questions or provide feedback: "Can we adjust the pricing strategy?"
**And** Consultants/Agency Owner can reply

**Given** Consultants comment on assigned strategies
**When** Amina (Consultant) comments
**Then** her comments are visible to:
  - Agency Owner (always)
  - Other team members assigned to the strategy
  - Brand Client if they're assigned
**And** comments are strategy-scoped (not visible on other strategies)

**Given** comments are real-time (optional, future enhancement)
**When** another team member posts a comment while I'm viewing the page
**Then** I see a notification: "New comment from Yasmine"
**And** the comment appears in the list without page refresh (using websockets or polling)

**Given** comments support rich content (optional)
**When** I post a comment
**Then** I can include:
  - Links (auto-detected and clickable)
  - Markdown formatting (bold, italic, lists)
  - Emojis (if user types them)
**And** no images/file attachments (to keep simple)

**Given** comment count is displayed
**When** I view the strategy detail page
**Then** each pillar section shows comment count in the header: "Authenticité (3 comments)"
**And** clicking the pillar expands to show comments
**And** I can quickly see which pillars have active discussions

**Given** comments are mobile-friendly
**When** I view on mobile
**Then** the comment section is responsive
**And** I can read, post, and reply to comments easily
**And** @mention autocomplete works on mobile

**Given** the feature is performant
**When** a pillar has 50+ comments
**Then** comments load quickly (<1 second)
**And** I see "Load More" pagination if >20 comments (load 20 at a time)
**And** newest comments are shown first

**Given** the feature is implemented
**When** I review technical details
**Then** database model:
  ```prisma
  model Comment {
    id          String    @id @default(cuid())
    strategyId  String
    pillar      PillarType // AUTHENTICITE, DISTINCTION, VALEUR, etc.
    userId      String
    parentId    String?   // for threaded replies
    content     String    @db.Text
    mentions    String[]  // array of userIds mentioned
    isDeleted   Boolean   @default(false)
    createdAt   DateTime  @default(now())
    updatedAt   DateTime  @updatedAt
    strategy    Strategy  @relation(fields: [strategyId], references: [id], onDelete: Cascade)
    user        User      @relation(fields: [userId], references: [id])
    parent      Comment?  @relation("CommentThread", fields: [parentId], references: [id])
    replies     Comment[] @relation("CommentThread")
    @@index([strategyId, pillar])
    @@index([userId])
  }
  ```
**And** tRPC procedures:
  - `comments.list({ strategyId, pillar })` → returns comments with replies nested
  - `comments.create({ strategyId, pillar, content, mentions? })` → creates comment, triggers notifications
  - `comments.update({ commentId, content })` → edits comment
  - `comments.delete({ commentId })` → soft-deletes comment
**And** @mention parsing: regex to extract `@username` from content, resolve to userIds
**And** notification trigger: when mentions detected, call `notifications.create()` (Story 9.6)

---


### Story 9.6: Real-Time Notifications

As a **team member (Yasmine, Amina, Kofi)**,
I want **to receive real-time notifications for strategy updates, comments, and @mentions**,
So that **I stay informed and can respond quickly to important changes**.

**Acceptance Criteria:**

**Given** notifications are triggered by key events
**When** a triggering action occurs
**Then** a notification is created and delivered to relevant users

**Triggering Events:**
- `strategy.assigned`: "You've been assigned to '{Brand Name}' strategy"
- `strategy.updated`: "Yasmine updated '{Brand Name}' strategy"
- `strategy.comment`: "Amina commented on '{Brand Name}'"
- `comment.mention`: "@Yasmine mentioned you in a comment"
- `comment.reply`: "Kofi replied to your comment"
- `member.added`: "Yasmine added you to the workspace"
- `member.role_changed`: "Your role was changed to Consultant"
- `member.removed`: "You've been removed from the workspace"
- `export.ready`: "Your PowerPoint export is ready"
- `payment.failed`: "Payment failed - Update your payment method"

**Given** I receive a notification
**When** a triggering event occurs
**Then** I am notified via two channels:
1. **In-app notification** (real-time or near-real-time)
2. **Email notification** (immediate or batched, based on preferences)

**Given** I view in-app notifications
**When** I am logged into ADVERT
**Then** I see a notification bell icon in the top navigation bar
**And** if I have unread notifications, I see a red badge with count: "3"
**And** clicking the bell opens a notification dropdown

**Given** the notification dropdown is open
**When** I click the bell icon
**Then** I see a dropdown panel with:
- Title: "Notifications"
- List of recent notifications (up to 20, newest first)
- "Mark All as Read" button
- "View All Notifications" link (opens full page)

**Given** I view a notification in the dropdown
**When** I look at a notification
**Then** I see:
- Icon (strategy icon, comment icon, mention icon, etc.)
- Title: "Amina commented on 'Zahra Fashion' strategy"
- Timestamp: "5 minutes ago"
- Read/unread indicator (blue dot if unread)
- Clickable link (clicking opens the related resource, e.g., strategy page)

**Given** I click on a notification
**When** I click "Amina commented on 'Zahra Fashion'"
**Then** I am navigated to `/strategies/{strategyId}#comments` (deep link to comments section)
**And** the notification is marked as read
**And** the unread count decreases by 1

**Given** I mark all as read
**When** I click "Mark All as Read"
**Then** all notifications are marked as read
**And** the red badge disappears
**And** the blue dots disappear from notification items

**Given** I view all notifications (full page)
**When** I click "View All Notifications"
**Then** I navigate to `/notifications`
**And** I see a full-page notification list
**And** I can filter by type: All, Mentions, Comments, Updates, Team
**And** I can filter by read/unread status
**And** I see pagination (50 notifications per page)

**Given** I receive email notifications
**When** a triggering event occurs
**Then** I receive an email (based on my notification preferences)
**And** the email includes:
  - Subject: "Amina commented on 'Zahra Fashion' strategy"
  - Body:
    ```
    Hi Yasmine,

    Amina Diallo commented on your strategy "Zahra Fashion":

    "This mission statement is strong, but we should emphasize sustainability more."

    [View Strategy and Reply]

    ---
    Manage notification settings: https://advert.com/settings/notifications
    ```
  - "View Strategy and Reply" button links to the strategy page

**Given** I configure notification preferences
**When** I navigate to `/settings/notifications`
**Then** I see a notification settings page
**And** the page displays toggles for each notification type:

**In-App Notifications:**
- ☑ Strategy assignments
- ☑ Strategy updates
- ☑ Comments on my strategies
- ☑ Replies to my comments
- ☑ @Mentions
- ☑ Team member changes
- ☑ Export ready
- ☑ Payment alerts

**Email Notifications:**
- ☑ Strategy assignments (Immediate)
- ☐ Strategy updates (Daily digest)
- ☑ Comments on my strategies (Immediate)
- ☑ Replies to my comments (Immediate)
- ☑ @Mentions (Immediate)
- ☑ Team member changes (Immediate)
- ☐ Export ready (Off)
- ☑ Payment alerts (Immediate)

**And** I can choose frequency:
- Immediate (send email right away)
- Hourly digest (batch notifications, send every hour)
- Daily digest (batch notifications, send once per day at 9 AM)
- Off (no email)

**Given** I disable certain notifications
**When** I uncheck "Strategy updates" email notifications
**And** I save
**Then** I no longer receive emails for strategy updates
**And** I still receive in-app notifications (unless also disabled)

**Given** I want to snooze notifications
**When** I click "Snooze" on the notification bell
**Then** I see a snooze modal with options:
  - 1 hour
  - 4 hours
  - Until tomorrow (9 AM)
  - Custom
**And** I select "4 hours"
**Then** all in-app notifications are hidden for 4 hours
**And** the bell icon shows a "ZZZ" icon
**And** email notifications continue (unless also snoozed)

**Given** notifications are role-appropriate
**When** I am a Brand Client
**Then** I receive notifications for:
  - Strategies assigned to me
  - Comments on my assigned strategies
  - @Mentions in comments
**And** I do NOT receive notifications for:
  - Workspace-wide strategy updates
  - Team member changes (unless I'm directly affected)
  - Billing alerts (only Agency Owner receives these)

**Given** notifications include deep links
**When** I click a notification
**Then** I am taken directly to the relevant context:
- Comment notification → strategy page, scrolled to comments section
- Mention notification → strategy page, scrolled to the specific comment
- Assignment notification → strategy page
- Export ready → export download page

**Given** notifications are real-time (or near-real-time)
**When** a triggering event occurs
**Then** in-app notifications appear within 5 seconds
**And** the notification bell badge updates immediately
**And** if I have the dropdown open, new notifications appear at the top

**Given** notifications support batching (daily digest)
**When** I have daily digest enabled for "Strategy updates"
**And** 5 strategy updates occur throughout the day
**Then** I receive 1 email at 9 AM the next day
**And** the email lists all 5 updates:
  ```
  Daily Digest - 5 strategy updates:

  1. Yasmine updated "Zahra Fashion" strategy
  2. Amina updated "Kofi Bank" strategy
  ...
  ```

**Given** notification retention and cleanup
**When** notifications are old
**Then** in-app notifications older than 30 days are automatically deleted
**And** I can manually delete individual notifications (swipe to delete on mobile)

**Given** the feature is performant
**When** I have 100+ unread notifications
**Then** the notification dropdown loads in <1 second
**And** the page remains responsive

**Given** the feature is implemented
**When** I review technical details
**Then** database model:
  ```prisma
  model Notification {
    id          String           @id @default(cuid())
    userId      String
    type        NotificationType // STRATEGY_ASSIGNED, COMMENT_MENTION, etc.
    title       String
    message     String?
    resourceId  String?          // strategyId, commentId, etc.
    resourceUrl String?          // deep link
    isRead      Boolean          @default(false)
    createdAt   DateTime         @default(now())
    user        User             @relation(fields: [userId], references: [id], onDelete: Cascade)
    @@index([userId, isRead])
    @@index([createdAt])
  }

  model NotificationPreferences {
    id                    String   @id @default(cuid())
    userId                String   @unique
    inAppEnabled          Boolean  @default(true)
    emailAssignments      EmailFrequency @default(IMMEDIATE)
    emailUpdates          EmailFrequency @default(OFF)
    emailComments         EmailFrequency @default(IMMEDIATE)
    emailMentions         EmailFrequency @default(IMMEDIATE)
    emailTeamChanges      EmailFrequency @default(IMMEDIATE)
    emailExports          EmailFrequency @default(OFF)
    emailPayments         EmailFrequency @default(IMMEDIATE)
    user                  User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  }

  enum EmailFrequency {
    IMMEDIATE
    HOURLY
    DAILY
    OFF
  }
  ```
**And** notification creation utility:
  ```typescript
  async function createNotification(userId: string, type: NotificationType, data: any) {
    await prisma.notification.create({
      data: {
        userId,
        type,
        title: generateTitle(type, data),
        message: generateMessage(type, data),
        resourceId: data.resourceId,
        resourceUrl: generateDeepLink(type, data)
      }
    })

    // Check user preferences and send email if needed
    const prefs = await getNotificationPreferences(userId)
    if (shouldSendEmail(prefs, type)) {
      await sendNotificationEmail(userId, type, data)
    }
  }
  ```
**And** tRPC procedures:
  - `notifications.list({ userId, limit, offset })` → returns notifications
  - `notifications.markAsRead({ notificationId })` → marks read
  - `notifications.markAllAsRead({ userId })` → marks all read
  - `notifications.updatePreferences({ userId, preferences })` → updates settings
**And** real-time delivery (optional):
  - Use websockets (Socket.io or Pusher) for instant in-app notifications
  - Or polling: frontend polls `/api/notifications/unread-count` every 30 seconds
**And** email sent via Resend with templates for each notification type

---

**Epic 9 Complete!** 🎉

Epic 9: Team Collaboration & Permissions (6 stories) is now fully documented with comprehensive acceptance criteria covering:
- Role-Based Access Control (RBAC) with 4 roles: Agency Owner, Consultant, Brand Client, Developer
- Team member invitation and management via email with 7-day expiry
- Strategy assignment with granular permissions (view, edit, export, comment)
- Activity feed and audit log with 90-day retention (Professional), IP tracking, comprehensive action types
- Threaded comments and discussions with @mentions and 3-level nesting
- Real-time notifications (in-app + email) with customizable preferences and daily digest option

---

## Epic 10: Advanced Analytics & Financial Clarity (Growth Phase)

**Goal:** Provide sophisticated analytics, sector benchmarks, pattern recognition, and financial clarity tools to help agencies measure impact and make data-driven decisions.

**User Outcome:** Users can track superfan growth over time, compare their metrics to sector benchmarks, receive AI-powered insights and recommendations, generate automated monthly reports, visualize budget allocation and ROI, and calculate unit economics with CODB.

---

### Story 10.1: Superfan Growth Tracking with Trend Graphs

As a **user tracking brand performance (Amina)**,
I want **to track superfan count over time with visual trend graphs**,
So that **I can measure brand traction and demonstrate value to clients**.

**Acceptance Criteria:**

**Given** I have a completed strategy with superfan data
**When** I navigate to the strategy detail page
**Then** I see an "Analytics" tab or section
**And** clicking it opens the Advanced Analytics dashboard

**Given** the Analytics dashboard is open
**When** I view the dashboard
**Then** I see the first chart: "Superfan Growth Over Time"
**And** the chart displays:
- Title: "Superfan Growth"
- Time period selector: 3 months, 6 months, 12 months, All time, Custom range
- Chart type toggle: Line chart (default), Area chart, Bar chart
- Y-axis: Superfan count (0 - max)
- X-axis: Time (dates/months)
- Data points plotted over time
- Hover tooltip showing exact values

**Given** I view the 3-month trend
**When** I select "3 months"
**Then** the chart shows superfan count for the last 3 months
**And** data points are shown monthly or weekly (depending on data granularity)
**And** I see the trend line connecting all points
**And** I see growth indicators: "+12% vs. previous period", "↑ Trending up"

**Given** I hover over a data point
**When** I hover my mouse over a point on the chart
**Then** I see a tooltip:
- Date: "November 2025"
- Superfan count: "1,245"
- Change: "+85 (+7.3%) from October"
**And** the data point is highlighted

**Given** I manually input superfan data (MVP - FR51)
**When** I navigate to `/strategies/{strategyId}/analytics/data-input`
**Then** I see a data input form
**And** the form displays:
- "Superfan Count" input field
- "Date" date picker (defaults to today)
- "Add Data Point" button
- Historical data table showing previous entries

**Given** I add a superfan data point
**When** I enter:
- Superfan count: 1,320
- Date: December 15, 2025
**And** I click "Add Data Point"
**Then** the data is saved to the database
**And** the trend graph updates immediately to include the new point
**And** I see success message: "Superfan count updated for December 15, 2025"

**Given** I view historical data table
**When** I scroll to the data table below the chart
**Then** I see all superfan data points in a table:
| Date | Superfan Count | Change | % Change |
|------|----------------|--------|----------|
| Dec 15, 2025 | 1,320 | +75 | +6.0% |
| Nov 15, 2025 | 1,245 | +85 | +7.3% |
| Oct 15, 2025 | 1,160 | +60 | +5.5% |
| Sep 15, 2025 | 1,100 | - | - |

**And** I can edit or delete entries: "Edit" and "Delete" icons per row

**Given** I edit a superfan data point
**When** I click "Edit" on a row
**Then** the row becomes editable (inline editing)
**And** I change the count from 1,245 to 1,250
**And** I click "Save"
**Then** the data is updated
**And** the chart refreshes to reflect the change

**Given** I delete a superfan data point
**When** I click "Delete" on a row
**Then** I see a confirmation: "Delete this data point? This cannot be undone."
**And** I confirm
**Then** the data point is removed from the database
**And** the chart updates (the point disappears)

**Given** I view growth rate calculation
**When** I look at the analytics summary panel (top of page)
**Then** I see key metrics:
- Current superfan count: "1,320"
- Growth rate (3-month): "+12.5%"
- Average monthly growth: "+73 superfans/month"
- Trend indicator: "↑ Strong growth" (green) or "→ Steady" (yellow) or "↓ Declining" (red)

**Given** I compare growth across strategies
**When** I navigate to the workspace-level analytics dashboard (`/analytics`)
**Then** I see a comparison chart: "Superfan Growth - All Strategies"
**And** the chart shows multiple lines (one per strategy)
**And** I can toggle strategies on/off (legend with checkboxes)
**And** I can see which client brands are growing fastest

**Given** I export analytics data
**When** I click "Export Data" button
**Then** I see export options:
- Format: CSV, Excel, PDF
- Time range: Last 3 months, 6 months, 12 months, Custom
**And** I select "Excel - Last 6 months"
**And** I click "Export"
**Then** an Excel file is downloaded with:
- Sheet 1: Superfan growth data (date, count, change, % change)
- Sheet 2: Chart visualization (embedded chart)

**Given** superfan data is strategy-specific
**When** I input data for one strategy
**Then** it doesn't affect other strategies
**And** each strategy has its own independent superfan tracking

**Given** the chart is interactive
**When** I interact with the chart
**Then** I can:
- Zoom in/out on time ranges (drag to select range)
- Pan left/right (if zoomed in)
- Toggle between line/area/bar chart types
- Download chart as PNG image

**Given** the chart is responsive
**When** I view on different screen sizes
**Then** on desktop: full-width chart with all controls
**And** on tablet: chart scales down, controls remain accessible
**And** on mobile: chart is vertical/portrait optimized, touch-friendly

**Given** the feature uses charting library
**When** I review the implementation
**Then** charts are built with Recharts or Tremor (recommended in Architecture)
**And** charts are accessible (keyboard navigation, ARIA labels - NFR-A2)
**And** charts have good performance (<2s render for 365 data points)

**Given** the database stores superfan metrics
**When** I review the data model
**Then** I see:
```prisma
model SuperfanMetric {
  id          String   @id @default(cuid())
  strategyId  String
  date        DateTime // Date of measurement
  count       Int      // Superfan count
  source      String?  // "manual", "integration", "api"
  createdBy   String   // userId who input the data
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  strategy    Strategy @relation(fields: [strategyId], references: [id], onDelete: Cascade)
  user        User     @relation(fields: [createdBy], references: [id])
  @@unique([strategyId, date]) // One entry per strategy per date
  @@index([strategyId, date])
}
```

**Given** the feature is implemented
**When** I review technical details
**Then** superfan data input via tRPC: `analytics.addSuperfanData({ strategyId, date, count })`
**And** fetch data via tRPC: `analytics.getSuperfanGrowth({ strategyId, startDate, endDate })`
**And** growth calculation:
```typescript
function calculateGrowth(current: number, previous: number): { change: number, percentChange: number } {
  const change = current - previous
  const percentChange = previous > 0 ? (change / previous) * 100 : 0
  return { change, percentChange }
}
```
**And** trend indicator logic:
- Strong growth: >10% in period
- Steady: -5% to +10%
- Declining: <-5%

---


### Story 10.2: Sector Benchmarks and Comparative Analytics

As a **user seeking competitive context (Amina)**,
I want **to compare my strategy metrics to sector-specific benchmarks and anonymized averages**,
So that **I can understand where my brand stands relative to industry standards**.

**Acceptance Criteria:**

**Given** I have a strategy with a sector template (Fashion, Fintech, FMCG, B2B SaaS)
**When** I navigate to the Analytics dashboard
**Then** I see a "Benchmarks" section
**And** the section displays: "Compare to {Sector} Industry Benchmarks"

**Given** I view sector benchmarks
**When** I scroll to the Benchmarks section
**Then** I see comparison metrics:

**Coherence Score Benchmark:**
- My score: 85 (large, prominent)
- Sector average: 67
- My percentile: "Top 15%" (badge)
- Visual indicator: bar chart showing my position vs. average vs. top 10%
- Insight: "Your coherence score is 27% higher than the Fashion industry average"

**Superfan Growth Rate Benchmark:**
- My growth rate: +12.5% (3-month)
- Sector average: +8.2%
- My percentile: "Top 25%"
- Insight: "Your superfan growth outpaces 75% of Fashion brands on ADVERT"

**Strategy Completion Time:**
- My average: 6.2 hours (from strategy start to completion)
- Sector average: 7.8 hours
- Insight: "You complete strategies 20% faster than average"

**Given** benchmarks are sector-specific
**When** I view benchmarks for a Fintech strategy
**Then** I see Fintech-specific benchmarks:
- Coherence score average: 72 (higher than Fashion due to more structured industry)
- Superfan growth rate: +6.5% (lower than Fashion, longer sales cycles)
- Strategy completion time: 9.1 hours (longer due to regulatory considerations)

**Given** I compare multiple metrics
**When** I view the "Metric Comparison" chart
**Then** I see a radar/spider chart comparing my strategy across multiple dimensions:
- Coherence Score
- Superfan Growth
- Pillar Completeness (6/6)
- Engagement Depth (ritual count, campaign count)
- Risk Mitigation (SWOT completeness)
**And** each axis shows my value vs. sector average
**And** I can visually see where I excel and where I lag

**Given** I view percentile rankings
**When** I look at the Percentile Rankings panel
**Then** I see:
| Metric | My Value | Percentile | Sector Average |
|--------|----------|------------|----------------|
| Coherence Score | 85 | Top 15% | 67 |
| Superfan Growth (3mo) | +12.5% | Top 25% | +8.2% |
| Strategy Completeness | 100% | Top 10% | 87% |
| Time to Complete | 6.2h | Top 30% | 7.8h |

**And** percentile badges are color-coded:
- Top 10%: Gold badge
- Top 25%: Silver badge
- Top 50%: Bronze badge
- Below 50%: Gray badge

**Given** benchmarks are anonymized (FR54)
**When** I view sector averages
**Then** the data is aggregated from all ADVERT users in that sector
**And** individual user data is never exposed (privacy-protected)
**And** I see a disclaimer: "Benchmarks are calculated from anonymized data across X Fashion brands on ADVERT"

**Given** benchmarks require minimum sample size
**When** a sector has <10 strategies
**Then** I see: "Insufficient data for sector benchmarks. Benchmarks available when more Fashion brands join ADVERT."
**And** benchmarks are not shown (to protect anonymity)

**Given** I view historical benchmark trends
**When** I select "Benchmark Trends" tab
**Then** I see how sector averages have changed over time:
- Chart: "Fashion Industry - Average Coherence Score Over Time"
- Line showing sector average from 6 months ago to now
- My strategy's scores overlaid for comparison
- Insight: "Sector average has improved by 8% over the last 6 months"

**Given** I compare to top performers (optional)
**When** I enable "Compare to Top 10%"
**Then** I see an additional comparison line:
- My score: 85
- Sector average: 67
- Top 10% threshold: 92
- Gap to top 10%: 7 points
- Insight: "You're 7 points away from joining the top 10% of Fashion brands"

**Given** benchmarks help identify improvement areas
**When** I review the "Improvement Suggestions" panel (powered by benchmarks)
**Then** I see actionable suggestions:
- "Your Engagement pillar score (78) is below the sector average (82). Consider adding more rituals or campaigns."
- "Your superfan growth (+12.5%) is strong, but top performers achieve +18%. Focus on retention strategies."

**Given** I filter benchmarks by tier
**When** I select "Compare to Professional Tier Users" (optional advanced filter)
**Then** I see benchmarks specific to Professional tier users (who may have more resources)
**And** I can toggle between "All Users" and "Professional Tier" comparisons

**Given** benchmarks are updated regularly
**When** new data is collected from other users
**Then** sector averages are recalculated monthly (Inngest scheduled job)
**And** I see a freshness indicator: "Benchmarks updated: January 2026"

**Given** the feature is tier-restricted
**When** I am on Starter tier
**Then** I see basic benchmarks: coherence score, superfan growth
**And** advanced benchmarks are locked: "Upgrade to Professional for detailed percentile rankings and trend analysis"

**Given** I am on Professional tier
**Then** I have access to all benchmarks:
- Full percentile rankings
- Historical benchmark trends
- Top performer comparisons
- Detailed improvement suggestions

**Given** the feature is implemented
**When** I review technical details
**Then** benchmark calculation via Inngest monthly job:
```typescript
async function calculateSectorBenchmarks() {
  const sectors = ['Fashion', 'Fintech', 'FMCG', 'B2B SaaS']

  for (const sector of sectors) {
    const strategies = await prisma.strategy.findMany({
      where: { sector, status: 'COMPLETED' }
    })

    if (strategies.length < 10) continue // Skip if insufficient data

    const avgCoherenceScore = average(strategies.map(s => s.coherenceScore))
    const avgGrowthRate = calculateAverageGrowthRate(strategies)

    await prisma.sectorBenchmark.upsert({
      where: { sector_month: { sector, month: currentMonth } },
      create: { sector, month: currentMonth, avgCoherenceScore, avgGrowthRate, sampleSize: strategies.length },
      update: { avgCoherenceScore, avgGrowthRate, sampleSize: strategies.length }
    })
  }
}
```
**And** database model:
```prisma
model SectorBenchmark {
  id                  String   @id @default(cuid())
  sector              String   // "Fashion", "Fintech", etc.
  month               String   // "2026-01" (YYYY-MM format)
  avgCoherenceScore   Float
  avgGrowthRate       Float
  avgCompletionTime   Float    // hours
  sampleSize          Int      // number of strategies included
  createdAt           DateTime @default(now())
  @@unique([sector, month])
  @@index([sector, month])
}
```
**And** fetch benchmarks via tRPC: `analytics.getSectorBenchmarks({ sector, strategyId })`

---


### Story 10.3: Pattern Recognition Insights and AI Recommendations

As a **user seeking actionable insights (Amina)**,
I want **to receive AI-powered pattern recognition insights and predictive recommendations**,
So that **I can make data-driven decisions and optimize my strategies based on proven patterns**.

**Acceptance Criteria:**

**Given** the system has collected sufficient data across strategies
**When** I navigate to the Analytics dashboard
**Then** I see an "Insights & Recommendations" section
**And** the section displays AI-generated insights based on pattern recognition

**Given** I view pattern recognition insights (FR55)
**When** I scroll to the Insights section
**Then** I see insights like:

**Pattern Insight 1: Ritual Impact**
- 📊 Icon: Chart with upward trend
- Title: "Brands with 3+ rituals see 2.8x superfan growth"
- Description: "Our analysis of 150 Fashion brands shows that strategies with 3 or more engagement rituals achieve 2.8x higher superfan growth rates compared to those with 1-2 rituals."
- Your strategy: "You have 4 rituals (above average)"
- Action: "Keep investing in ritual consistency"
- Data source: "Based on 150 Fashion strategies"
- Confidence: "High confidence (95%)"

**Pattern Insight 2: Authenticity Correlation**
- Title: "Strong Authenticité scores correlate with +35% higher retention"
- Description: "Brands that score 85+ on the Authenticité pillar retain superfans 35% longer than those with scores below 70."
- Your strategy: "Your Authenticité score: 88 (strong)"
- Action: "Maintain your authentic brand story in all communications"

**Pattern Insight 3: Campaign Timing**
- Title: "Q4 campaigns drive 3.2x ROI in Fashion"
- Description: "Fashion brands launching campaigns in October-December see 3.2x higher ROI compared to Q2 campaigns, driven by holiday spending."
- Your strategy: "Your next campaign: Q1 2026"
- Action: "Consider shifting major campaigns to Q4 for maximum impact"

**Given** I view predictive recommendations (FR56)
**When** I look at the Recommendations panel
**Then** I see personalized recommendations based on my strategy data:

**Recommendation 1: Expand Engagement Rituals**
- 🎯 Icon: Target
- Priority: High
- Title: "Add 1-2 more rituals to accelerate growth"
- Reasoning: "Based on your current superfan growth rate (+12.5%) and sector benchmarks, adding 1-2 rituals could increase growth to +18-22%."
- Suggested rituals (AI-generated based on sector):
  - "Seasonal Collection Preview Events (every 6 months)"
  - "Exclusive Designer Q&A Sessions (monthly)"
- Expected impact: "+5-9% growth rate"
- Difficulty: Medium
- Action button: "Add to Strategy"

**Recommendation 2: Strengthen Distinction Pillar**
- Priority: Medium
- Title: "Refine your positioning statement"
- Reasoning: "Your Distinction pillar score (76) is below your other pillars (avg: 84). Strengthening positioning could improve overall coherence score by 4-6 points."
- Suggested action: "Review competitor positioning and emphasize your unique sustainable fashion approach"
- Expected impact: "+4-6 coherence score points"
- Action button: "Edit Distinction Pillar"

**Recommendation 3: Financial Clarity Focus**
- Priority: Low
- Title: "Add ROI tracking to demonstrate value"
- Reasoning: "Brands that track ROI in their Track pillar are 2.3x more likely to retain clients for 12+ months."
- Suggested action: "Add specific ROI metrics to your Track pillar (Story 10.5)"
- Expected impact: "Improved client retention"
- Action button: "Update Track Pillar"

**Given** insights are updated regularly
**When** new data is collected (my strategies or sector-wide)
**Then** insights and recommendations are recalculated weekly (Inngest job)
**And** I see a freshness indicator: "Insights updated: January 15, 2026"

**Given** I click "Add to Strategy" on a recommendation
**When** I click the action button for "Add 1-2 more rituals"
**Then** I am taken to the strategy edit page
**And** the Engagement pillar is opened in edit mode
**And** I see the AI-suggested rituals pre-filled in a draft form
**And** I can review, edit, and save them

**Given** I dismiss a recommendation
**When** I click "Dismiss" on a recommendation
**Then** the recommendation is hidden from my dashboard
**And** it's marked as dismissed in the database (won't reappear)
**And** I see: "Recommendation dismissed. It won't be shown again."

**Given** insights are data-driven and transparent
**When** I click "Learn More" on an insight
**Then** I see a detailed explanation modal:
- Methodology: "How we calculated this insight"
- Data source: "Based on 150 Fashion brands with avg coherence score 67"
- Statistical significance: "p-value: 0.02 (statistically significant)"
- Limitations: "Correlation does not imply causation. Other factors may contribute."
**And** I can see the underlying data (aggregated, anonymized)

**Given** AI recommendations use machine learning (optional, future enhancement)
**When** the system has sufficient data (1000+ strategies)
**Then** recommendations are powered by ML models:
- Predictive model: "Given your current pillars, we predict 15-20% superfan growth over next 6 months"
- Recommendation engine: Suggests actions most likely to improve outcomes based on similar strategies

**Given** insights are sector-specific
**When** I view insights for a Fintech strategy
**Then** I see Fintech-relevant patterns:
- "Trust-building content increases conversion by 42% in Fintech"
- "Regulatory compliance transparency boosts brand trust scores by 28%"

**Given** I view my insight history
**When** I navigate to "Insight History" tab
**Then** I see all past insights and recommendations
**And** I can see which ones I acted on vs. dismissed
**And** I can track impact: "You added 2 rituals in Nov 2025 → Superfan growth increased from +8% to +12.5%"

**Given** the feature is tier-restricted
**When** I am on Starter tier
**Then** I see 2-3 basic insights (most impactful)
**And** recommendations are limited: "Upgrade to Professional for personalized AI recommendations"

**Given** I am on Professional tier
**Then** I see unlimited insights and recommendations
**And** I have access to detailed explanations and insight history

**Given** the feature is implemented
**When** I review technical details
**Then** pattern recognition via Inngest weekly job:
```typescript
async function generatePatternInsights() {
  // Example: Ritual impact analysis
  const strategiesWithManyRituals = await prisma.strategy.findMany({
    where: { ritualCount: { gte: 3 } },
    include: { superfanMetrics: true }
  })

  const strategiesWithFewRituals = await prisma.strategy.findMany({
    where: { ritualCount: { lt: 3 } },
    include: { superfanMetrics: true }
  })

  const avgGrowthMany = calculateAverageGrowth(strategiesWithManyRituals)
  const avgGrowthFew = calculateAverageGrowth(strategiesWithFewRituals)
  const growthMultiplier = avgGrowthMany / avgGrowthFew

  if (growthMultiplier > 2 && isStatisticallySignificant(/* ... */)) {
    await prisma.insight.create({
      data: {
        type: 'PATTERN',
        sector: 'Fashion',
        title: `Brands with 3+ rituals see ${growthMultiplier.toFixed(1)}x superfan growth`,
        description: '...',
        confidence: 0.95,
        sampleSize: strategiesWithManyRituals.length + strategiesWithFewRituals.length
      }
    })
  }
}
```
**And** personalized recommendations via AI (Vercel AI SDK):
```typescript
async function generateRecommendations(strategyId: string) {
  const strategy = await getStrategy(strategyId)
  const benchmarks = await getSectorBenchmarks(strategy.sector)
  const insights = await getRelevantInsights(strategy.sector)

  const prompt = `Given this strategy data: ${JSON.stringify(strategy)}
  And sector benchmarks: ${JSON.stringify(benchmarks)}
  And proven patterns: ${JSON.stringify(insights)}
  Generate 3 actionable recommendations to improve this strategy.`

  const recommendations = await generateText({ model: openai('gpt-4'), prompt })
  return recommendations
}
```
**And** database models:
```prisma
model Insight {
  id          String   @id @default(cuid())
  type        String   // "PATTERN", "BENCHMARK", "TREND"
  sector      String?
  title       String
  description String   @db.Text
  impact      String?  // e.g., "2.8x superfan growth"
  confidence  Float    // 0.0 - 1.0
  sampleSize  Int
  createdAt   DateTime @default(now())
  expiresAt   DateTime // Insights expire after 3 months
  @@index([sector, type])
}

model Recommendation {
  id          String   @id @default(cuid())
  strategyId  String
  priority    String   // "HIGH", "MEDIUM", "LOW"
  title       String
  description String   @db.Text
  reasoning   String   @db.Text
  action      String   // "add_rituals", "edit_distinction", etc.
  expectedImpact String
  isDismissed Boolean  @default(false)
  createdAt   DateTime @default(now())
  strategy    Strategy @relation(fields: [strategyId], references: [id], onDelete: Cascade)
  @@index([strategyId, isDismissed])
}
```

---

### Story 10.4: Automated Monthly Traction Reports

As a **user tracking strategy performance (Amina)**,
I want **to receive automated monthly traction reports via email**,
So that **I stay informed of progress without manually checking the dashboard**.

**Acceptance Criteria:**

**Given** I have at least one active strategy
**When** the end of the month arrives (e.g., January 31, 11:59 PM)
**Then** an automated traction report is generated for each of my strategies
**And** the report is emailed to me on the 1st of the next month (e.g., February 1, 9:00 AM)

**Given** the traction report is generated
**When** the Inngest scheduled job runs
**Then** the report includes:

**Report Header:**
- Title: "Monthly Traction Report - January 2026"
- Strategy name: "Zahra Fashion - ADVERT Strategy"
- Report period: "January 1 - January 31, 2026"
- Generated date: "February 1, 2026"
- ADVERT logo and branding

**Key Metrics Summary:**
- Superfan count (current): 1,320
- Superfan growth (monthly): +75 (+6.0%)
- Coherence score: 85
- Strategy status: Completed
- Last updated: January 28, 2026

**Growth Visualization:**
- Chart: Superfan growth over the month (line chart embedded as image)
- Trend indicator: "↑ Strong growth" (green)

**Sector Comparison:**
- Your coherence score: 85
- Sector average (Fashion): 67
- Your percentile: Top 15%
- Insight: "You outperform 85% of Fashion brands"

**Top Insights & Highlights:**
- ✅ "Superfan growth accelerated by 15% compared to December"
- ✅ "Your Engagement pillar (4 rituals) drives above-average retention"
- ⚠️ "Consider adding ROI tracking to your Track pillar for better client reporting"

**Recommended Actions:**
1. Add 1-2 more rituals to reach top 10% growth rate
2. Review Distinction pillar to improve positioning clarity
3. Schedule Q4 campaigns for maximum ROI (based on Fashion sector patterns)

**Report Footer:**
- "View full analytics: [Link to Dashboard]"
- "Update your data: [Link to Data Input]"
- "Manage report preferences: [Link to Settings]"
- ADVERT branding and contact info

**Given** the report is delivered via email
**When** the email is sent
**Then** I receive an email:
- Subject: "Your Monthly Traction Report - Zahra Fashion (January 2026)"
- From: ADVERT <reports@advert.com>
- Attachment: PDF version of the report (for record-keeping)
- Email body: HTML-formatted summary with key highlights
- CTA buttons: "View Full Report", "Update Data", "Share with Client"

**Given** I have multiple strategies
**When** the report generation runs
**Then** I receive one email per strategy
**Or** I receive one email with multiple strategies grouped (based on preferences)
**And** each strategy has its own section in the report

**Given** I configure report preferences
**When** I navigate to `/settings/reports`
**Then** I see report configuration options:
- Enable/disable monthly reports: ☑ Enabled
- Delivery format:
  - One email per strategy (default)
  - Combined email (all strategies in one email)
- Include sections:
  - ☑ Key metrics summary
  - ☑ Growth visualization
  - ☑ Sector comparison
  - ☑ Insights & recommendations
- Delivery day: 1st of each month (or custom: 5th, 15th)
- Additional recipients: Add team members or client emails
- Language: English (default), French

**Given** I disable monthly reports
**When** I uncheck "Enable monthly reports"
**And** I save
**Then** I stop receiving automated reports
**And** I can still generate reports manually on-demand

**Given** I generate a report manually (on-demand)
**When** I navigate to the Analytics dashboard
**And** I click "Generate Report"
**Then** I see a report generation modal:
- Report period: Custom date range selector (e.g., "January 1 - January 31")
- Include sections: (checkboxes as above)
- Delivery: Email to me, Download PDF, Both
**And** I click "Generate Report"
**Then** the report is generated immediately (within 30 seconds)
**And** I receive the email or download link

**Given** I share the report with a client
**When** I click "Share with Client" in the email
**Then** I am taken to a share modal:
- Client email: input field
- Custom message: text area (optional)
- "Send Report" button
**And** I enter client email and send
**Then** the client receives the report via email
**And** the email is white-labeled (my branding, not ADVERT branding - if Story 8.5 enabled)

**Given** the report includes historical comparison
**When** I view the report
**Then** I see month-over-month comparisons:
- "Superfan count: 1,320 (+75 vs. December, +235 vs. November)"
- "Coherence score: 85 (unchanged from December)"
- Chart: 3-month trend showing January in context

**Given** the report highlights anomalies
**When** unusual patterns are detected
**Then** the report includes warnings:
- ⚠️ "Superfan growth slowed by 30% this month. Review your engagement rituals."
- ⚠️ "No data updates in 15 days. Please update your superfan count."

**Given** the report is visually appealing
**When** I view the PDF
**Then** the report uses:
- Professional design with charts, icons, color-coded indicators
- ADVERT branding (or custom branding if Story 8.5)
- Print-friendly layout (A4/Letter size)
- Accessible fonts and contrast (WCAG 2.1 Level AA)

**Given** the feature is tier-restricted
**When** I am on Starter tier
**Then** I receive basic monthly reports with limited insights
**And** I see: "Upgrade to Professional for detailed sector comparisons and AI recommendations in your reports"

**Given** I am on Professional tier
**Then** I receive comprehensive reports with all sections
**And** I can customize report content and delivery preferences

**Given** the feature is performant
**When** the report generation runs for 1000+ users
**Then** reports are generated in batches (Inngest queue)
**And** each report generates in <60 seconds
**And** emails are sent reliably (Resend with retry logic)

**Given** the feature is implemented
**When** I review technical details
**Then** report generation via Inngest monthly scheduled job:
```typescript
export const monthlyTractionReportJob = inngest.createFunction(
  { id: 'monthly-traction-report' },
  { cron: '0 9 1 * *' }, // 9 AM on the 1st of every month
  async ({ step }) => {
    const users = await step.run('get-users', async () => {
      return prisma.user.findMany({
        where: { reportPreferences: { enabled: true } },
        include: { strategies: true }
      })
    })

    for (const user of users) {
      await step.run(`generate-report-${user.id}`, async () => {
        const report = await generateTractionReport(user.id, lastMonth())
        const pdf = await generateReportPDF(report)
        await sendReportEmail(user.email, report, pdf)
      })
    }
  }
)
```
**And** report generation function:
```typescript
async function generateTractionReport(userId: string, period: DateRange) {
  const strategies = await getUserStrategies(userId)
  const reports = []

  for (const strategy of strategies) {
    const metrics = await getSuperfanMetrics(strategy.id, period)
    const benchmarks = await getSectorBenchmarks(strategy.sector)
    const insights = await getInsights(strategy.id)
    const recommendations = await getRecommendations(strategy.id)

    reports.push({
      strategy,
      metrics: {
        superfanCount: metrics.current,
        growth: calculateGrowth(metrics.current, metrics.previous),
        coherenceScore: strategy.coherenceScore
      },
      benchmarks,
      insights: insights.slice(0, 3), // Top 3
      recommendations: recommendations.filter(r => r.priority === 'HIGH').slice(0, 3)
    })
  }

  return { userId, period, strategies: reports, generatedAt: new Date() }
}
```
**And** PDF generation uses same library as Story 8.4 (PowerPoint export)
**And** email sent via Resend with PDF attachment

---


### Story 10.5: Financial Clarity Dashboard

As a **user managing brand budgets (Amina, agency owner)**,
I want **to visualize budget allocation, track campaign costs, and project ROI**,
So that **I can make informed financial decisions and demonstrate value to clients**.

**Acceptance Criteria:**

**Given** I navigate to the Financial Clarity Dashboard
**When** I go to `/strategies/{strategyId}/analytics/financial` or click "Financial" tab in Analytics
**Then** I see the Financial Clarity Dashboard
**And** the dashboard displays:
- Page title: "Financial Clarity Dashboard"
- Time period selector: Monthly, Quarterly, Yearly, Custom
- Budget overview section
- Campaign cost tracker
- ROI projection calculator
- Budget allocation visualization

**Given** I view the budget overview
**When** I look at the top section
**Then** I see key financial metrics:
- Total budget allocated: "€50,000" (for the period)
- Total spent: "€32,500" (65% of budget)
- Remaining budget: "€17,500" (35%)
- Budget utilization gauge: circular progress indicator showing 65%
- Status indicator: "On track" (green) or "Over budget" (red) or "Under-utilized" (yellow)

**Given** I input budget data
**When** I click "Set Budget" for the first time
**Then** I see a budget configuration form:
- Total budget for strategy: input field (e.g., "€50,000")
- Budget period: Monthly, Quarterly, Yearly
- Budget categories:
  - Marketing & Advertising: "€20,000" (40%)
  - Content Creation: "€10,000" (20%)
  - Events & Activations: "€8,000" (16%)
  - Partnerships: "€7,000" (14%)
  - Technology & Tools: "€3,000" (6%)
  - Other: "€2,000" (4%)
- "Save Budget" button

**Given** I track campaign costs
**When** I scroll to the "Campaign Cost Tracker" section
**Then** I see a table of campaigns with costs:

| Campaign Name | Start Date | End Date | Budget | Spent | Remaining | Status |
|---------------|------------|----------|--------|-------|-----------|--------|
| Holiday Launch | Dec 1, 2025 | Dec 31, 2025 | €15,000 | €14,200 | €800 | Completed |
| Spring Collection | Jan 15, 2026 | Feb 28, 2026 | €12,000 | €6,500 | €5,500 | In Progress |
| Influencer Collab | Feb 1, 2026 | Mar 15, 2026 | €8,000 | €0 | €8,000 | Planned |

**And** I can add new campaigns: "Add Campaign" button

**Given** I add a new campaign
**When** I click "Add Campaign"
**Then** I see a campaign form:
- Campaign name: input
- Start date: date picker
- End date: date picker
- Budget allocated: input
- Category: dropdown (matches budget categories)
- "Add Campaign" button

**When** I fill in:
- Name: "Valentine's Day Promo"
- Start: Feb 1, 2026
- End: Feb 14, 2026
- Budget: €5,000
- Category: Marketing & Advertising
**And** I click "Add Campaign"
**Then** the campaign is saved and appears in the tracker
**And** the budget allocation updates: "Marketing & Advertising spent: €6,500 of €20,000"

**Given** I log campaign expenses
**When** I click "Log Expense" on a campaign
**Then** I see an expense entry form:
- Expense description: "Instagram ads"
- Amount: €1,200
- Date: Jan 20, 2026
- Category: Marketing & Advertising
- Receipt/invoice upload (optional): file upload
- "Save Expense" button

**When** I save the expense
**Then** the campaign "Spent" column updates: €6,500 → €7,700
**And** the total spent updates: €32,500 → €33,700
**And** the expense is logged in the expense history

**Given** I view budget allocation visualization
**When** I look at the "Budget Allocation" chart
**Then** I see a donut or pie chart showing:
- Marketing & Advertising: 40% (€20,000) - with progress bar showing €6,500 spent (32.5%)
- Content Creation: 20% (€10,000) - €4,200 spent (42%)
- Events & Activations: 16% (€8,000) - €8,500 spent (106%, over budget - red)
- Partnerships: 14% (€7,000) - €5,100 spent (73%)
- Technology & Tools: 6% (€3,000) - €2,800 spent (93%)
- Other: 4% (€2,000) - €1,900 spent (95%)

**And** categories over budget are highlighted in red
**And** I can hover to see details

**Given** I project ROI
**When** I scroll to the "ROI Projection" section
**Then** I see an ROI calculator:
- Total investment (from budget): €50,000
- Expected revenue: input field (e.g., "€200,000")
- Time horizon: 12 months (adjustable)
- ROI calculation: "300% ROI" (formula: (Revenue - Investment) / Investment * 100)
- Break-even date: "Month 3" (when revenue covers investment)
- Payback period: "3 months"

**Given** I adjust ROI projections
**When** I change expected revenue to "€150,000"
**Then** the ROI updates: "200% ROI"
**And** break-even date updates: "Month 4"
**And** I see a visual: line chart showing cumulative revenue vs. investment over time

**Given** I view historical financial data
**When** I select "Last 12 Months" time period
**Then** I see trend charts:
- Monthly spending trend: bar chart showing spending by month
- Budget utilization trend: line chart showing % budget used each month
- ROI trend: line chart showing actual ROI over past campaigns

**Given** I compare planned vs. actual spending
**When** I view the "Budget vs. Actual" chart
**Then** I see a comparison:
- Planned spending (budget curve): projected linear spending
- Actual spending (actual curve): real spending data
- Variance: areas where actual exceeds planned (red) or under (green)

**Given** I export financial data
**When** I click "Export Financial Report"
**Then** I see export options:
- Format: Excel, PDF, CSV
- Include: Budget overview, Campaign tracker, Expense details, ROI projections
**And** I select "Excel" and export
**Then** I download an Excel file with multiple sheets:
  - Sheet 1: Budget Summary
  - Sheet 2: Campaign Costs
  - Sheet 3: Expense Log
  - Sheet 4: ROI Calculations

**Given** I set budget alerts
**When** I click "Set Alerts" in settings
**Then** I can configure:
- Alert when budget utilization reaches: 75%, 90%, 100%
- Alert when campaign exceeds budget by: 10%, 20%
- Alert delivery: Email, In-app notification
**And** when thresholds are reached, I receive alerts:
  - "⚠️ Marketing & Advertising budget at 90% (€18,000 of €20,000)"

**Given** I integrate with accounting software (optional, future)
**When** I connect QuickBooks or Xero
**Then** expenses auto-sync from accounting software
**And** I don't need to manually log all expenses

**Given** the dashboard is multi-currency aware
**When** I operate in multiple currencies (e.g., USD, XOF, GHS)
**Then** I can set base currency for strategy
**And** all amounts are displayed in that currency
**And** I can input expenses in different currencies (with auto-conversion)

**Given** the feature is tier-restricted
**When** I am on Starter tier
**Then** I see basic budget tracking (total budget, spent, remaining)
**And** advanced features are locked: "Upgrade to Professional for campaign tracking, ROI projections, and financial reports"

**Given** I am on Professional tier
**Then** I have full access to:
- Detailed budget allocation
- Campaign cost tracker
- ROI projections
- Financial reports export
- Budget alerts

**Given** the feature is implemented
**When** I review technical details
**Then** database models:
```prisma
model Budget {
  id                String   @id @default(cuid())
  strategyId        String   @unique
  totalAmount       Float
  currency          String   @default("USD")
  period            String   // "MONTHLY", "QUARTERLY", "YEARLY"
  categoryAllocation Json    // { "Marketing": 20000, "Content": 10000, ... }
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  strategy          Strategy @relation(fields: [strategyId], references: [id], onDelete: Cascade)
  campaigns         Campaign[]
  expenses          Expense[]
}

model Campaign {
  id          String   @id @default(cuid())
  budgetId    String
  name        String
  startDate   DateTime
  endDate     DateTime
  allocated   Float
  spent       Float    @default(0)
  category    String
  status      String   // "PLANNED", "IN_PROGRESS", "COMPLETED"
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  budget      Budget   @relation(fields: [budgetId], references: [id], onDelete: Cascade)
  expenses    Expense[]
  @@index([budgetId, status])
}

model Expense {
  id          String   @id @default(cuid())
  budgetId    String
  campaignId  String?
  description String
  amount      Float
  currency    String   @default("USD")
  category    String
  date        DateTime
  receiptUrl  String?  // Vercel Blob URL
  createdBy   String
  createdAt   DateTime @default(now())
  budget      Budget   @relation(fields: [budgetId], references: [id], onDelete: Cascade)
  campaign    Campaign? @relation(fields: [campaignId], references: [id])
  user        User     @relation(fields: [createdBy], references: [id])
  @@index([budgetId, date])
}
```
**And** tRPC procedures:
  - `budget.create({ strategyId, totalAmount, categoryAllocation })`
  - `budget.get({ strategyId })`
  - `campaigns.add({ budgetId, name, startDate, endDate, allocated, category })`
  - `expenses.log({ budgetId, campaignId?, description, amount, category, date })`
  - `budget.getRoiProjection({ budgetId, expectedRevenue, timeHorizon })`
**And** ROI calculation:
```typescript
function calculateROI(investment: number, revenue: number): number {
  return ((revenue - investment) / investment) * 100
}
```

---


### Story 10.6: Unit Economics and CODB Calculator

As a **user analyzing business viability (Amina, founder)**,
I want **to calculate unit economics (CAC, LTV) and Cost of Doing Business (CODB)**,
So that **I can understand profitability, break-even points, and make pricing decisions**.

**Acceptance Criteria:**

**Given** I navigate to the CODB Calculator
**When** I go to `/strategies/{strategyId}/analytics/codb` or click "Unit Economics" tab
**Then** I see the CODB Calculator page
**And** the page displays:
- Page title: "Unit Economics & CODB Calculator"
- Three main sections:
  1. Cost of Doing Business (CODB) Calculator
  2. Customer Acquisition Cost (CAC) Calculator
  3. Lifetime Value (LTV) Calculator
  4. Break-Even Analysis

**Given** I use the CODB Calculator
**When** I scroll to the CODB section
**Then** I see input fields for cost categories:

**Fixed Costs (Monthly):**
- Rent/Office space: input (e.g., "€2,000")
- Salaries & wages: input (e.g., "€15,000")
- Software & tools: input (e.g., "€500")
- Insurance: input (e.g., "€300")
- Utilities: input (e.g., "€200")
- Other fixed costs: input (e.g., "€500")
- **Total fixed costs:** "€18,500/month" (auto-calculated)

**Variable Costs (Per Unit):**
- Raw materials/COGS: input (e.g., "€25")
- Packaging: input (e.g., "€3")
- Shipping: input (e.g., "€5")
- Transaction fees: input (e.g., "€2")
- Other variable costs: input (e.g., "€1")
- **Total variable cost per unit:** "€36" (auto-calculated)

**Revenue Information:**
- Average selling price per unit: input (e.g., "€100")
- Expected monthly sales volume: input (e.g., "500 units")

**CODB Results:**
- Total monthly costs: "€36,500" (fixed + variable * volume)
- Cost per unit: "€73" (total costs / volume)
- Gross margin per unit: "€27" (price - variable cost)
- Gross margin %: "64%" ((price - variable) / price * 100)
- Contribution margin per unit: "€64" (price - variable cost)
- Net profit per unit: "€27" (price - cost per unit)
- Break-even units: "688 units/month" (fixed costs / contribution margin)
- Monthly profit at 500 units: "€13,500"

**Given** I adjust inputs
**When** I change "Expected monthly sales volume" to 1,000 units
**Then** all calculations update in real-time:
- Total monthly costs: "€54,500"
- Cost per unit: "€54.50"
- Net profit per unit: "€45.50"
- Monthly profit: "€45,500"
- Break-even point remains: "688 units" (independent of actual volume)

**Given** I use the CAC Calculator
**When** I scroll to the CAC section
**Then** I see input fields:

**Marketing & Sales Costs (Monthly):**
- Digital advertising (Facebook, Google, etc.): "€8,000"
- Content marketing: "€2,000"
- Social media management: "€1,500"
- Email marketing: "€500"
- Sales team salaries: "€5,000"
- Sales tools (CRM, etc.): "€300"
- Events & activations: "€2,000"
- Other marketing costs: "€700"
- **Total marketing & sales costs:** "€20,000/month"

**Customer Metrics:**
- New customers acquired (monthly): input (e.g., "150")
- **Customer Acquisition Cost (CAC):** "€133.33" (total costs / new customers)

**CAC Insights:**
- CAC benchmark for {sector}: "€95" (from sector data)
- Your CAC vs. benchmark: "+40% higher" (red indicator)
- Recommendation: "Your CAC is above sector average. Consider optimizing ad spend or improving conversion rates."

**Given** I use the LTV Calculator
**When** I scroll to the LTV section
**Then** I see input fields:

**Customer Value Metrics:**
- Average purchase value: "€100" (from pricing)
- Purchase frequency (per year): input (e.g., "4 times")
- Customer lifespan (years): input (e.g., "3 years")
- Gross margin per purchase: "€64" (from CODB, auto-filled)

**LTV Calculation:**
- **Customer Lifetime Value (LTV):** "€768"
  - Formula: Gross margin * Purchase frequency * Lifespan
  - Calculation: €64 * 4 * 3 = €768

**LTV:CAC Ratio:**
- LTV: "€768"
- CAC: "€133"
- **LTV:CAC Ratio:** "5.8:1"
- Status: "Healthy" (green) - ratio > 3:1 is good
- Insight: "Your LTV:CAC ratio is strong. For every €1 spent on acquisition, you earn €5.80 in lifetime gross profit."

**LTV:CAC Benchmark:**
- Ideal ratio: "3:1 to 5:1"
- Your ratio: "5.8:1"
- Status: "Above average" (gold badge)

**Given** I view break-even analysis
**When** I scroll to the Break-Even Analysis section
**Then** I see:

**Break-Even Point:**
- Fixed costs: "€18,500/month"
- Contribution margin per unit: "€64"
- **Break-even units:** "289 units/month" (fixed / contribution)
- **Break-even revenue:** "€28,900/month" (break-even units * price)
- Current sales: "500 units (€50,000 revenue)"
- **Units above break-even:** "211 units" (profitable zone)
- **Safety margin:** "42%" ((current - breakeven) / current * 100)

**Break-Even Timeline:**
- If starting from zero sales
- Assuming 50 units/month growth rate
- **Time to break-even:** "6 months"

**Visual: Break-Even Chart:**
- Line chart with:
  - X-axis: Units sold (0 - 1000)
  - Y-axis: Revenue/Costs (€)
  - Fixed cost line (horizontal)
  - Total cost line (fixed + variable, diagonal)
  - Revenue line (diagonal, steeper than cost)
  - Break-even point marked with dot and label: "289 units, €28,900"
  - Profit zone (green, above break-even)
  - Loss zone (red, below break-even)

**Given** I save my CODB calculation
**When** I click "Save Calculation"
**Then** the inputs and results are saved to the database
**And** I can return later and see my saved data
**And** I can view historical calculations: "Show Previous Calculations" dropdown

**Given** I view CODB history
**When** I click "Show Previous Calculations"
**Then** I see a list of past calculations:
- December 2025: CAC €140, LTV €720, LTV:CAC 5.1:1
- January 2026: CAC €133, LTV €768, LTV:CAC 5.8:1
- Change: "CAC improved by €7, LTV increased by €48"
**And** I can select a previous calculation to compare with current

**Given** I export CODB analysis
**When** I click "Export Analysis"
**Then** I see export options:
- Format: PDF, Excel
- Include: All sections (CODB, CAC, LTV, Break-even)
**And** I export as PDF
**Then** I download a formatted PDF report with all calculations, charts, and insights

**Given** I receive CODB recommendations
**When** my calculations show issues
**Then** I see actionable recommendations:
- ⚠️ "Your CAC (€133) is high relative to LTV (€768). Aim for LTV:CAC > 3:1 for sustainability." (already met, so green)
- ⚠️ "Your break-even point (289 units) requires €28,900 revenue/month. Ensure consistent sales pipeline."
- ✅ "Your gross margin (64%) is healthy. Maintain pricing discipline."
- 💡 "Reducing CAC by 10% (€13) would increase monthly profit by €1,950 at 150 customers."

**Given** I compare CODB to sector benchmarks
**When** sector data is available
**Then** I see comparisons:
- Your CAC: €133
- {Sector} average CAC: €95
- Your LTV: €768
- {Sector} average LTV: €650
- Your LTV:CAC: 5.8:1
- {Sector} average LTV:CAC: 4.2:1
- Insight: "Your unit economics outperform sector averages, indicating strong business fundamentals."

**Given** I use scenario analysis
**When** I click "Scenario Analysis" button
**Then** I can test "what-if" scenarios:
- "What if I increase price to €110?" → Recalculates all metrics
- "What if CAC drops to €100?" → Shows new LTV:CAC ratio
- "What if customer lifespan increases to 4 years?" → Shows new LTV
**And** I see side-by-side comparison: Current vs. Scenario

**Given** the calculator supports multiple business models
**When** I select business model type:
- E-commerce (default)
- SaaS (recurring revenue)
- Service-based (hourly/project billing)
- Marketplace (commission-based)
**Then** the calculator adapts:
- SaaS: Adds fields for MRR, churn rate, retention
- Service: Calculates hourly rate, utilization, capacity
- Marketplace: Calculates take rate, GMV, commission

**Given** the feature is tier-restricted
**When** I am on Starter tier
**Then** I see basic CODB calculator (no CAC/LTV, no history, no export)
**And** advanced features are locked: "Upgrade to Professional for CAC/LTV analysis, break-even charts, and CODB history"

**Given** I am on Professional tier
**Then** I have full access to all unit economics tools

**Given** the feature is implemented
**When** I review technical details
**Then** database model:
```prisma
model CODBCalculation {
  id                String   @id @default(cuid())
  strategyId        String
  month             String   // "2026-01"
  fixedCosts        Json     // { "rent": 2000, "salaries": 15000, ... }
  variableCosts     Json     // { "materials": 25, "packaging": 3, ... }
  sellingPrice      Float
  salesVolume       Int
  marketingCosts    Json     // for CAC
  newCustomers      Int      // for CAC
  purchaseFrequency Float    // for LTV
  customerLifespan  Float    // for LTV
  results           Json     // calculated metrics
  createdAt         DateTime @default(now())
  strategy          Strategy @relation(fields: [strategyId], references: [id], onDelete: Cascade)
  @@index([strategyId, month])
}
```
**And** calculation functions:
```typescript
function calculateCODB(inputs: CODBInputs) {
  const totalFixedCosts = sum(Object.values(inputs.fixedCosts))
  const totalVariableCost = sum(Object.values(inputs.variableCosts))
  const totalMonthlyCosts = totalFixedCosts + (totalVariableCost * inputs.salesVolume)
  const costPerUnit = totalMonthlyCosts / inputs.salesVolume
  const grossMargin = inputs.sellingPrice - totalVariableCost
  const contributionMargin = inputs.sellingPrice - totalVariableCost
  const netProfitPerUnit = inputs.sellingPrice - costPerUnit
  const breakEvenUnits = totalFixedCosts / contributionMargin
  const monthlyProfit = (inputs.sellingPrice - costPerUnit) * inputs.salesVolume

  return { totalMonthlyCosts, costPerUnit, grossMargin, netProfitPerUnit, breakEvenUnits, monthlyProfit }
}

function calculateCAC(marketingCosts: number, newCustomers: number): number {
  return marketingCosts / newCustomers
}

function calculateLTV(grossMargin: number, frequency: number, lifespan: number): number {
  return grossMargin * frequency * lifespan
}

function calculateLTVCACRatio(ltv: number, cac: number): number {
  return ltv / cac
}
```
**And** tRPC procedures:
  - `codb.calculate({ strategyId, inputs })` → returns calculated results
  - `codb.save({ strategyId, calculation })` → saves to database
  - `codb.getHistory({ strategyId })` → returns past calculations
  - `codb.exportPDF({ calculationId })` → generates PDF report

---

**Epic 10 Complete!** 🎉

Epic 10: Advanced Analytics & Financial Clarity (6 stories) is now fully documented with comprehensive acceptance criteria covering:
- Superfan growth tracking with trend graphs (line/area/bar charts, 3/6/12-month views, manual data input)
- Sector benchmarks and comparative analytics (percentile rankings, radar charts, anonymized aggregation)
- Pattern recognition insights and AI recommendations (2.8x ritual impact, predictive suggestions, confidence scores)
- Automated monthly traction reports (email delivery, PDF attachments, customizable preferences)
- Financial Clarity Dashboard (budget allocation, campaign cost tracking, ROI projections, expense logging)
- Unit Economics and CODB Calculator (CAC, LTV, LTV:CAC ratio, break-even analysis, scenario testing)

---

## Epic 11: Creative Concierge Marketplace (Growth Phase)

**Goal:** Build a two-sided marketplace connecting brands with vetted creative talents for brand execution, enabling project collaboration, milestone management, secure payments, and quality assurance.

**User Outcome:** Brands can discover and hire creative talents (designers, photographers, copywriters, videographers) matched to their ADVERT strategy needs. Talents can showcase portfolios, receive project briefs, deliver work through milestones, receive payments via escrow, and build reputation through ratings.

---

### Story 11.1: Talent Profile Creation and Portfolio Management

As a **creative talent (photographer, designer, copywriter)**,
I want **to create a comprehensive profile with portfolio, skills, rates, and availability**,
So that **brands can discover me and hire me for projects aligned with my expertise**.

**Acceptance Criteria:**

**Given** I want to join the Creative Concierge Marketplace as a talent
**When** I navigate to `/marketplace/join-as-talent`
**Then** I see a talent onboarding page
**And** the page displays:
- Title: "Join Creative Concierge - Showcase Your Talent"
- Description: "Connect with brands seeking creative services. Build your portfolio, get matched with projects, and earn"
- "Get Started" button

**Given** I click "Get Started"
**When** I begin the talent profile creation
**Then** I see a multi-step form:
  - Step 1: Basic Information
  - Step 2: Skills & Expertise
  - Step 3: Portfolio & Work Samples
  - Step 4: Rates & Availability
  - Step 5: Profile Preview & Publish

**Given** I complete Step 1: Basic Information
**When** I fill in:
- Full name: "Kwame Mensah"
- Professional title: "Brand Photographer & Visual Storyteller"
- Location: "Accra, Ghana"
- Bio (500 chars): "10+ years capturing authentic African brand stories. Specialized in fashion, FMCG, and lifestyle photography."
- Profile photo: Upload (max 5 MB, JPG/PNG)
- Cover photo: Upload (optional, banner image)
**And** I click "Next"
**Then** my basic info is saved and I proceed to Step 2

**Given** I complete Step 2: Skills & Expertise
**When** I select my skills from predefined categories:
- **Primary skills** (select up to 5):
  - ☑ Photography (Product, Lifestyle, Fashion, Event)
  - ☑ Videography
  - ☐ Graphic Design
  - ☐ Copywriting
  - ☐ Social Media Management
  - ☐ Web Design
  - ☐ Illustration
  - ☐ Animation
  - ☐ Content Strategy
- **Sectors** (select industries you've worked in):
  - ☑ Fashion & Apparel
  - ☑ FMCG
  - ☐ Fintech
  - ☐ B2B SaaS
  - ☑ Hospitality
- **Software/Tools** (optional):
  - Adobe Photoshop, Lightroom, Premiere Pro
- **Languages**:
  - ☑ English (fluent)
  - ☑ French (conversational)
  - ☑ Twi (native)
**And** I click "Next"
**Then** my skills are saved and I proceed to Step 3

**Given** I complete Step 3: Portfolio & Work Samples
**When** I upload portfolio pieces
**Then** I see a portfolio builder:
- "Add Work Sample" button
- Grid of uploaded samples (thumbnail view)
- Each sample can include:
  - Image/video file (max 20 MB per file)
  - Project title: "Zahra Fashion - SS2025 Campaign"
  - Project description (300 chars): "Conceptualized and shot seasonal campaign for sustainable fashion brand"
  - Client name (optional): "Zahra Fashion House"
  - Project date: "December 2025"
  - Tags: Fashion, Product Photography, Lifestyle

**Given** I add a portfolio piece
**When** I click "Add Work Sample"
**And** I upload:
  - Image: zahra_campaign_01.jpg (8 MB)
  - Title: "Zahra Fashion - SS2025 Campaign"
  - Description: "Captured authentic brand storytelling for sustainable fashion line"
  - Client: "Zahra Fashion House"
  - Date: "Dec 2025"
  - Tags: Fashion, Product Photography
**And** I click "Add to Portfolio"
**Then** the sample is uploaded to Vercel Blob
**And** it appears in my portfolio grid
**And** I can add up to 20 portfolio pieces (Professional tier: unlimited)

**Given** I rearrange my portfolio
**When** I drag and drop portfolio pieces
**Then** I can reorder them (first piece = featured work)
**And** the order is saved

**Given** I complete Step 4: Rates & Availability
**When** I set my pricing and availability
**Then** I see rate configuration:
- **Hourly rate**: "€50/hour" (input)
- **Day rate**: "€350/day" (input, optional)
- **Project rate range**: "€500 - €5,000" (min/max for typical projects)
- **Currency**: USD (dropdown: USD, XOF, GHS, KES, etc.)
- **Availability**:
  - ☑ Available for new projects
  - ☐ Fully booked (hide from search)
  - Estimated response time: "Within 24 hours" (dropdown)
- **Work schedule**:
  - Full-time (40+ hours/week)
  - Part-time (10-20 hours/week)
  - Project-based (as available)

**And** I set my rates and availability
**Then** I click "Next"

**Given** I complete Step 5: Profile Preview & Publish
**When** I review my profile
**Then** I see a preview of how brands will see my profile:
- Profile photo, name, title, location
- Bio
- Skills badges (Photography, Videography, Fashion, FMCG)
- Portfolio grid (work samples)
- Rates: "From €50/hr or €500/project"
- Availability: "Available now"
- Languages
**And** I see "Publish Profile" button

**When** I click "Publish Profile"
**Then** my talent profile is activated
**And** I see success message: "Your profile is live! Brands can now discover and hire you."
**And** I am redirected to my talent dashboard (`/marketplace/talent/dashboard`)

**Given** I view my talent dashboard
**When** I navigate to `/marketplace/talent/dashboard`
**Then** I see:
- "Profile Views" counter: "12 views this week"
- "Project Invitations" section (Story 11.4)
- "Active Projects" section (Story 11.5)
- "Earnings" section (Story 11.7)
- "Edit Profile" button

**Given** I edit my profile later
**When** I click "Edit Profile"
**Then** I can update any section:
- Basic info, skills, portfolio, rates, availability
**And** changes are saved immediately
**And** my profile visibility is maintained (published state)

**Given** I want to pause my profile
**When** I change availability to "Fully booked"
**Then** my profile is hidden from brand search results
**And** I can still manage active projects
**And** I can reactivate anytime by changing back to "Available"

**Given** profile visibility and verification
**When** my profile is new
**Then** I see: "Unverified" badge
**And** brands see a notice: "This talent is new to the platform"
**When** I complete 3 projects with 4+ star ratings
**Then** I earn "Verified Talent" badge
**And** my profile ranks higher in search results

**Given** the feature is implemented
**When** I review technical details
**Then** database models:
```prisma
model TalentProfile {
  id                String   @id @default(cuid())
  userId            String   @unique
  professionalTitle String
  bio               String   @db.Text
  location          String
  profilePhotoUrl   String?
  coverPhotoUrl     String?
  skills            String[] // ["Photography", "Videography"]
  sectors           String[] // ["Fashion", "FMCG"]
  languages         String[] // ["English", "French"]
  hourlyRate        Float?
  dayRate           Float?
  projectRateMin    Float?
  projectRateMax    Float?
  currency          String   @default("USD")
  isAvailable       Boolean  @default(true)
  responseTime      String   // "Within 24 hours"
  workSchedule      String   // "Full-time", "Part-time", "Project-based"
  profileViews      Int      @default(0)
  isVerified        Boolean  @default(false)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  user              User     @relation(fields: [userId], references: [id])
  portfolioPieces   PortfolioPiece[]
  projects          Project[]
  ratings           TalentRating[]
  @@index([isAvailable, isVerified])
}

model PortfolioPiece {
  id          String   @id @default(cuid())
  talentId    String
  title       String
  description String?
  fileUrl     String   // Vercel Blob URL
  fileType    String   // "image", "video"
  clientName  String?
  projectDate DateTime?
  tags        String[]
  order       Int      @default(0)
  createdAt   DateTime @default(now())
  talent      TalentProfile @relation(fields: [talentId], references: [id], onDelete: Cascade)
  @@index([talentId, order])
}
```
**And** tRPC procedures:
- `talent.createProfile({ ...profileData })`
- `talent.updateProfile({ talentId, updates })`
- `talent.addPortfolioPiece({ talentId, ...pieceData })`
- `talent.reorderPortfolio({ talentId, orderedIds })`

---


### Story 11.2: Brand Discovery and Talent Search

As a **brand user looking for creative help (Amina)**,
I want **to browse, filter, and search for creative talents by skill, sector, location, and rate**,
So that **I can find the right talent for my project needs**.

**Acceptance Criteria:**

**Given** I want to find creative talent
**When** I navigate to `/marketplace` or `/marketplace/browse`
**Then** I see the Creative Concierge Marketplace homepage
**And** the page displays:
- Hero section: "Find the Perfect Creative Talent for Your Brand"
- Search bar: "Search for designers, photographers, copywriters..."
- Filter sidebar (left): Skills, Sectors, Location, Rate Range, Availability
- Talent grid (main area): Cards showing available talents
- Sort options: "Recommended", "Top Rated", "Newest", "Lowest Rate", "Highest Rate"

**Given** I view the talent grid
**When** I look at the main area
**Then** I see talent cards displayed in a grid (3 columns on desktop)
**And** each card shows:
- Profile photo (circular)
- Name: "Kwame Mensah"
- Professional title: "Brand Photographer & Visual Storyteller"
- Location: "Accra, Ghana" (with flag icon)
- Rating: ⭐⭐⭐⭐⭐ 4.9 (24 reviews)
- "Verified Talent" badge (if applicable)
- Skills badges: Photography, Videography, Fashion
- Rate: "From €50/hr"
- Availability: "Available now" (green badge) or "Fully booked" (gray badge, hidden by default)
- Featured portfolio image (thumbnail)
- "View Profile" button

**Given** I filter by skills (FR62)
**When** I use the filter sidebar
**Then** I see skill categories with checkboxes:
- **Visual Arts:**
  - ☐ Photography
  - ☐ Videography
  - ☐ Graphic Design
  - ☐ Illustration
  - ☐ Animation
- **Content:**
  - ☐ Copywriting
  - ☐ Content Strategy
  - ☐ Social Media Management
- **Digital:**
  - ☐ Web Design
  - ☐ UI/UX Design

**When** I check "Photography" and "Graphic Design"
**Then** the talent grid filters to show only talents with those skills
**And** the URL updates: `/marketplace?skills=photography,graphic-design`
**And** I see: "Showing 47 talents"

**Given** I filter by sector
**When** I check sectors:
  - ☑ Fashion & Apparel
  - ☑ FMCG
**Then** only talents who work in Fashion or FMCG are shown
**And** the filter is additive with skills filter

**Given** I filter by location
**When** I select location:
  - Dropdown: "All Locations", "West Africa", "East Africa", "Southern Africa", or specific countries
  - I select "Ghana"
**Then** only talents based in Ghana are shown
**And** I see: "Showing 12 talents in Ghana"

**Given** I filter by rate range
**When** I use the rate slider:
  - Min: €0
  - Max: €200+
  - I set range: €30 - €80/hour
**Then** only talents with hourly rates in that range are shown

**Given** I search by keyword (FR63)
**When** I type in the search bar: "fashion photographer"
**Then** the search matches:
  - Professional title: "Brand Photographer & Visual Storyteller"
  - Bio: "10+ years capturing authentic African brand stories. Specialized in fashion..."
  - Skills: "Photography", "Fashion"
**And** relevant talents are shown (ranked by relevance)
**And** search highlights matching terms

**Given** I search for specific talent names
**When** I type: "Kwame"
**Then** I see talents with "Kwame" in their name
**And** exact name matches rank highest

**Given** I sort results
**When** I select sort option: "Top Rated"
**Then** talents are reordered by average rating (highest first)
**And** only talents with 3+ reviews are prioritized

**When** I select "Lowest Rate"
**Then** talents are sorted by hourly rate (ascending)

**When** I select "Recommended" (default)
**Then** talents are sorted by a recommendation algorithm:
  - Verified talents ranked higher
  - Match with my sector (if I have strategies in Fashion, Fashion talents rank higher)
  - Recent activity (recently active talents prioritized)
  - Availability (available talents before booked)

**Given** I view a talent's profile (FR64)
**When** I click "View Profile" on a talent card
**Then** I am taken to `/marketplace/talent/{talentId}`
**And** I see the full talent profile:

**Profile Header:**
- Large profile photo
- Name, title, location
- Rating: ⭐ 4.9 (24 reviews)
- "Verified Talent" badge
- Availability: "Available now" or "Fully booked"
- Response time: "Usually responds within 24 hours"
- "Request Quote" button (prominent, CTA)

**About Section:**
- Full bio (500 chars)
- Member since: "January 2026"
- Languages: English (fluent), French (conversational)

**Skills & Expertise:**
- Skill badges: Photography, Videography, Fashion, FMCG
- Sectors: Fashion & Apparel, FMCG, Hospitality
- Software: Adobe Photoshop, Lightroom, Premiere Pro

**Portfolio:**
- Grid of work samples (larger images, 2-3 columns)
- Each sample shows:
  - Image/video (lightbox on click)
  - Project title
  - Client name (if public)
  - Tags
- "View Full Portfolio" expands all pieces

**Rates:**
- Hourly rate: €50/hour
- Day rate: €350/day
- Project rate: €500 - €5,000
- Note: "Rates are negotiable based on project scope"

**Reviews & Ratings:**
- Overall rating: 4.9/5 (24 reviews)
- Breakdown:
  - Quality: ⭐⭐⭐⭐⭐ 5.0
  - Communication: ⭐⭐⭐⭐⭐ 4.9
  - Timeliness: ⭐⭐⭐⭐☆ 4.8
  - Professionalism: ⭐⭐⭐⭐⭐ 5.0
- Recent reviews (Story 11.6):
  - Reviewer: "Yasmine N." - "Excellent work on our fashion campaign. Highly recommend!"
  - Date: "2 weeks ago"

**Given** I click "Request Quote" on a profile
**When** I click the button
**Then** I am taken to the project brief form (Story 11.4)
**And** the talent is pre-selected

**Given** I view the marketplace without login
**When** I browse as a guest
**Then** I can view talent profiles (read-only)
**And** "Request Quote" shows: "Sign in to request quotes"
**And** clicking it prompts login/signup

**Given** the marketplace has no results
**When** my filters are too restrictive (e.g., "Animation + Fintech + Ghana + €10/hr")
**Then** I see an empty state:
- Message: "No talents found matching your criteria"
- Suggestion: "Try adjusting your filters or broadening your search"
- "Clear All Filters" button

**Given** the marketplace is responsive
**When** I view on different devices
**Then** on desktop: 3-column talent grid
**And** on tablet: 2-column grid
**And** on mobile: 1-column list view, filters collapse to modal

**Given** the feature is implemented
**When** I review technical details
**Then** talent search via tRPC: `marketplace.searchTalents({ skills?, sectors?, location?, minRate?, maxRate?, keyword?, sort, limit, offset })`
**And** search query:
```typescript
const talents = await prisma.talentProfile.findMany({
  where: {
    isAvailable: true,
    skills: skills ? { hasSome: skills } : undefined,
    sectors: sectors ? { hasSome: sectors } : undefined,
    location: location ? { contains: location } : undefined,
    hourlyRate: { gte: minRate, lte: maxRate },
    OR: keyword ? [
      { professionalTitle: { contains: keyword, mode: 'insensitive' } },
      { bio: { contains: keyword, mode: 'insensitive' } },
      { skills: { hasSome: [keyword] } }
    ] : undefined
  },
  include: { portfolioPieces: { take: 1, orderBy: { order: 'asc' } } },
  orderBy: sortLogic(sort), // "recommended", "top_rated", etc.
  take: limit,
  skip: offset
})
```
**And** recommended sort uses weighted scoring:
```typescript
function calculateRecommendationScore(talent, userContext) {
  let score = 0
  if (talent.isVerified) score += 50
  if (talent.sectors.some(s => userContext.sectors.includes(s))) score += 30
  score += talent.averageRating * 10
  if (talent.lastActiveAt > Date.now() - 7 days) score += 20
  return score
}
```

---


### Story 11.3: AI-Assisted Talent Matching

As a **brand user with an ADVERT strategy (Amina)**,
I want **to receive AI-powered talent recommendations matched to my strategy pillars and requirements**,
So that **I find the most suitable talents without manual searching**.

**Acceptance Criteria:**

**Given** I have a completed ADVERT strategy
**When** I navigate to `/marketplace/match` or see "Get Matched" button in marketplace
**Then** I see the AI Matching page
**And** the page displays:
- Title: "Find Your Perfect Creative Match"
- Description: "Our AI analyzes your ADVERT strategy to recommend talents aligned with your brand vision"
- "Get AI Recommendations" button
- Option to select which strategy to match against (if I have multiple)

**Given** I click "Get AI Recommendations"
**When** the AI matching process runs
**Then** the system:
1. Analyzes my ADVERT strategy pillars (Authenticité, Distinction, Valeur, Engagement, Risk, Track)
2. Extracts key requirements:
   - Sector: Fashion
   - Brand values: Sustainability, Authenticity
   - Target audience: Fashion-conscious consumers, 25-35
   - Engagement rituals: Seasonal collection launches, Designer Q&A
   - Visual style: Authentic, Natural, Sustainable aesthetic
3. Queries talents in the database
4. Calculates match scores for each talent
5. Returns top 10 matches

**Given** the AI matching completes
**When** I see the results
**Then** I see a list of recommended talents:

**Match Card 1:**
- Profile photo, name: "Kwame Mensah"
- Title: "Brand Photographer & Visual Storyteller"
- **Match Score: 95%** (prominent badge, color-coded: >90% green, 70-90% yellow, <70% gray)
- Match reasons (AI-generated):
  - ✅ "Specializes in Fashion & Apparel (matches your sector)"
  - ✅ "Portfolio showcases authentic storytelling (aligns with your Authenticité pillar)"
  - ✅ "Experience with sustainable fashion brands (matches your values)"
  - ✅ "Location: Accra, Ghana (same region as your target market)"
- Rate: "From €50/hr"
- "View Profile" and "Request Quote" buttons

**Match Card 2:**
- Name: "Aisha Kamara"
- Title: "Creative Copywriter & Brand Strategist"
- Match Score: 88%
- Match reasons:
  - ✅ "Expert in crafting authentic brand narratives (Authenticité pillar)"
  - ✅ "Fashion industry experience with 15+ brands"
  - ⚠️ "Location: Lagos, Nigeria (regional but not local)" (slightly lower score)

**Given** I view match explanation details
**When** I click "Why this match?" on a recommendation
**Then** I see a detailed explanation modal:
- "How We Calculated This Match"
- Breakdown:
  - Sector alignment: 30 points (Fashion + Fashion = perfect match)
  - Values alignment: 25 points (Sustainability mentioned in talent bio + your values)
  - Skill relevance: 20 points (Photography needed for Engagement rituals)
  - Portfolio quality: 15 points (High-rated, verified talent)
  - Availability: 10 points (Available now)
  - **Total: 95/100 = 95% match**
- "This talent is highly compatible with your '{Brand Name}' strategy"

**Given** the AI analyzes my Engagement pillar
**When** my Engagement pillar includes:
  - Ritual: "Seasonal Collection Launches" → need photographer/videographer
  - Ritual: "Social Media Campaigns" → need social media manager/content creator
  - Campaign: "Influencer Collaborations" → need partnership manager
**Then** the AI prioritizes talents with:
  - Photography, Videography, Social Media Management skills
  - Fashion sector experience
  - Event photography portfolio pieces

**Given** the AI analyzes my Authenticité pillar
**When** my Authenticité pillar emphasizes:
  - Values: Sustainability, Transparency, African Heritage
  - Brand story: Authentic African fashion, traditional craftsmanship
**Then** the AI prioritizes talents who:
  - Mention "sustainability", "authentic", "heritage" in their bios
  - Have portfolios featuring African brands or cultural themes
  - Work in Fashion + have high ratings for "Quality" and "Professionalism"

**Given** the AI analyzes my Distinction pillar
**When** my Distinction pillar defines:
  - Positioning: "Premium sustainable fashion for conscious consumers"
  - Competitive advantage: "Ethical sourcing and traditional craftsmanship"
**Then** the AI prioritizes talents who:
  - Have premium brand experience (higher-end portfolios)
  - Understand positioning (copywriters, brand strategists)
  - Have worked with ethical/sustainable brands

**Given** I don't have a completed strategy
**When** I try to use AI matching without a strategy
**Then** I see a message: "AI matching requires a completed ADVERT strategy"
**And** I see a CTA: "Create Your Strategy First"
**And** I can still browse talents manually (Story 11.2)

**Given** I save matched talents to favorites
**When** I click "Save to Favorites" on a match
**Then** the talent is added to my favorites list
**And** I can view all favorites: `/marketplace/favorites`

**Given** I request quotes from multiple matched talents
**When** I select 3 talents from matches
**And** I click "Request Quotes from Selected"
**Then** I am taken to a batch quote request form (Story 11.4)
**And** all 3 talents are pre-selected

**Given** AI matching learns from my behavior (future enhancement)
**When** I consistently hire talents with certain traits
**Then** future matches prioritize those traits:
  - If I always hire talents with "Videography" skill → future matches boost videographers
  - If I prefer "Ghana" location → future matches boost Ghanaian talents

**Given** the AI matching is explainable
**When** I view any match
**Then** I can always see "Why this match?" with transparent reasoning
**And** the algorithm doesn't use opaque black-box scoring
**And** users can trust the recommendations

**Given** the feature is tier-restricted
**When** I am on Starter tier
**Then** I see basic AI matching (top 5 matches)
**And** advanced features locked: "Upgrade to Professional for top 10 matches and detailed explanations"

**Given** I am on Professional tier
**Then** I get top 10 matches with full explanations
**And** I can re-run matching unlimited times

**Given** the feature is implemented
**When** I review technical details
**Then** AI matching via Inngest job (async, takes 10-30 seconds):
```typescript
export const talentMatchingJob = inngest.createFunction(
  { id: 'ai-talent-matching' },
  { event: 'marketplace/match.requested' },
  async ({ event, step }) => {
    const { strategyId, userId } = event.data

    const strategy = await step.run('fetch-strategy', async () => {
      return getStrategy(strategyId)
    })

    const requirements = await step.run('extract-requirements', async () => {
      return extractRequirementsFromStrategy(strategy)
    })

    const talents = await step.run('fetch-talents', async () => {
      return prisma.talentProfile.findMany({ where: { isAvailable: true } })
    })

    const matches = await step.run('calculate-matches', async () => {
      return talents.map(talent => ({
        talent,
        score: calculateMatchScore(talent, requirements, strategy),
        reasons: generateMatchReasons(talent, requirements, strategy)
      })).sort((a, b) => b.score - a.score).slice(0, 10)
    })

    await step.run('save-matches', async () => {
      return saveMatches(userId, strategyId, matches)
    })

    return matches
  }
)

function extractRequirementsFromStrategy(strategy) {
  // Parse ADVERT pillars to extract:
  return {
    sector: strategy.sector, // from meta-variables or template
    values: extractKeywords(strategy.authenticite, ['sustainability', 'authentic', 'heritage']),
    visualStyle: extractKeywords(strategy.engagement, ['natural', 'bold', 'minimalist']),
    skills: extractNeededSkills(strategy.engagement), // "ritual: photoshoot" → need photographer
    targetAudience: strategy.distinction.personas,
    budget: strategy.valeur.pricingStrategy
  }
}

function calculateMatchScore(talent, requirements, strategy) {
  let score = 0

  // Sector match (30 points)
  if (talent.sectors.includes(requirements.sector)) score += 30
  else if (talent.sectors.some(s => relatedSectors(s, requirements.sector))) score += 15

  // Values alignment (25 points)
  const valueMatches = requirements.values.filter(v => talent.bio.toLowerCase().includes(v.toLowerCase()))
  score += Math.min(25, valueMatches.length * 8)

  // Skills match (20 points)
  const skillMatches = requirements.skills.filter(s => talent.skills.includes(s))
  score += Math.min(20, skillMatches.length * 10)

  // Portfolio quality (15 points)
  if (talent.isVerified) score += 10
  if (talent.averageRating >= 4.5) score += 5
  else if (talent.averageRating >= 4.0) score += 3

  // Availability (10 points)
  if (talent.isAvailable) score += 10

  return Math.min(100, score)
}
```
**And** requirements extraction uses NLP/keyword extraction or simple keyword matching
**And** future enhancement: use Vercel AI SDK with GPT-4 for deeper semantic understanding

---


### Story 11.4: Project Brief Creation and Quote Requests

As a **brand user hiring talent (Amina)**,
I want **to create structured project briefs using ADVERT pillar templates and request quotes from talents**,
So that **talents understand my needs and provide accurate quotes**.

**Acceptance Criteria:**

**Given** I want to hire a talent
**When** I click "Request Quote" on a talent profile
**Then** I see the project brief form
**And** the form displays:
- Page title: "Request Quote from Kwame Mensah"
- Talent info (sidebar): name, photo, skills, rate
- Brief form (main area): multi-step or single-page form

**Given** I create a project brief (FR67)
**When** I fill in the form
**Then** I see fields organized by ADVERT pillars:

**Basic Information:**
- Project title: "Zahra Fashion SS2026 Campaign Photoshoot"
- Project type: dropdown (Photography, Videography, Graphic Design, Copywriting, etc.)
- Budget range: "€1,000 - €3,000" (slider or input)
- Timeline: Start date + End date or Duration
- Preferred communication: Email, WhatsApp, Phone

**Project Context (from ADVERT Strategy - optional but recommended):**
- Link to strategy: Dropdown to select one of my strategies (auto-fills context)
- If "Zahra Fashion" strategy selected:
  - Sector: Fashion & Apparel (auto-filled)
  - Brand values: Sustainability, Authenticity (auto-filled from Authenticité pillar)
  - Target audience: Fashion-conscious women, 25-35 (auto-filled from Distinction pillar)
  - Visual style: Natural, authentic, sustainable aesthetic (auto-filled from Engagement pillar)

**Project Requirements (detailed brief):**
- Deliverables: text area
  - Example: "50 high-resolution product photos, 10 lifestyle shots, 5 behind-the-scenes shots"
- Specific requirements: text area
  - Example: "Outdoor shoot, natural lighting, models wearing sustainable fashion, emphasis on craftsmanship details"
- Reference materials: file upload (mood boards, brand guidelines, sample images)
  - Max 10 files, 5 MB each
- Additional notes: text area (optional)

**Given** I link to my ADVERT strategy
**When** I select "Zahra Fashion" strategy from dropdown
**Then** the form auto-fills:
  - Sector: Fashion & Apparel
  - Brand values from Authenticité pillar: "Sustainability, Transparency, African Heritage"
  - Target audience from Distinction pillar: "Persona: Fashion Enthusiast Emma, 25-35"
  - Visual style from Engagement pillar: "Natural, authentic storytelling"
  - Campaign context from Engagement pillar: "SS2026 Collection Launch, Feb-March 2026"
**And** I can edit any auto-filled field
**And** the talent sees this context in the quote request

**Given** I don't link to a strategy
**When** I skip linking
**Then** I manually fill all fields
**And** the brief is still valid (strategy linking is optional)

**Given** I submit the project brief
**When** I click "Send Quote Request"
**Then** the brief is sent to the talent
**And** I see success message: "Quote request sent to Kwame Mensah. You'll be notified when they respond."
**And** the talent receives:
  - In-app notification: "New quote request from Amina Diallo"
  - Email notification with brief summary and "View Full Brief" link

**Given** the talent receives the quote request (FR65)
**When** Kwame views the request
**Then** he sees:
  - Full project brief with all details
  - Brand context (if strategy linked)
  - Client info: Amina Diallo, "Agency Owner at [Agency Name]"
  - Budget range: €1,000 - €3,000
  - "Submit Quote" button or "Decline" button

**Given** the talent submits a quote
**When** Kwame clicks "Submit Quote"
**Then** he sees a quote form:
- Proposed rate: "€2,500" (within or outside budget range)
- Estimated timeline: "2 weeks (Feb 1 - Feb 14)"
- Deliverables breakdown:
  - 50 product photos: €1,500
  - 10 lifestyle shots: €700
  - 5 BTS shots: €200
  - Editing & retouching: €100
- Terms & conditions: text area (payment terms, revision policy, usage rights)
- Additional notes: text area (optional)
- "Submit Quote" button

**When** Kwame submits the quote
**Then** I (Amina) receive:
  - In-app notification: "Kwame Mensah sent you a quote for 'Zahra Fashion SS2026 Campaign'"
  - Email with quote summary

**Given** I review the quote
**When** I navigate to `/marketplace/quotes/{quoteId}`
**Then** I see the quote details:
  - Talent info: Kwame Mensah, profile photo, rating
  - Project brief (my original request)
  - Talent's quote: Rate, timeline, deliverables, terms
  - Actions: "Accept Quote", "Request Revisions", "Decline"

**Given** I accept the quote
**When** I click "Accept Quote"
**Then** I see a confirmation modal:
  - "Accept Quote from Kwame Mensah?"
  - Summary: €2,500 for 2 weeks
  - Payment terms: "50% upfront (€1,250), 50% on delivery (€1,250)" (escrow - Story 11.7)
  - Checkbox: "I agree to the terms and conditions"
  - "Confirm & Pay Deposit" button

**When** I confirm and pay deposit
**Then** a Project is created (Story 11.5)
**And** payment is processed via escrow (Story 11.7)
**And** Kwame receives notification: "Project accepted! Amina Diallo hired you."
**And** both parties can now manage the project

**Given** I request revisions to the quote
**When** I click "Request Revisions"
**Then** I see a revision request form:
  - "What would you like to change?" text area
  - Example: "Budget is tight. Can you do €2,000 with 40 product photos instead of 50?"
  - "Send Revision Request" button

**When** I send the request
**Then** Kwame receives the revision request
**And** he can submit a revised quote
**And** this negotiation can go back and forth (up to 5 rounds)

**Given** I decline the quote
**When** I click "Decline"
**Then** I see a decline confirmation:
  - "Decline quote from Kwame Mensah?"
  - Optional reason: dropdown (Budget too high, Timeline doesn't work, Found another talent, Other)
  - "Confirm Decline" button

**When** I confirm
**Then** Kwame receives notification: "Amina Diallo declined your quote"
**And** the quote request is closed
**And** I can request quotes from other talents

**Given** I send quote requests to multiple talents
**When** I request quotes from 3 talents for the same project
**Then** I see all 3 requests in my dashboard: `/marketplace/requests`
**And** I can compare quotes side by side when they respond
**And** I can accept only 1 quote (first acceptance closes others)

**Given** quote requests expire
**When** a talent doesn't respond within 7 days
**Then** the request status changes to "Expired"
**And** I can resend or cancel the expired request

**Given** the feature is implemented
**When** I review technical details
**Then** database models:
```prisma
model QuoteRequest {
  id                String   @id @default(cuid())
  projectTitle      String
  projectType       String
  budgetMin         Float
  budgetMax         Float
  timeline          String
  deliverables      String   @db.Text
  requirements      String   @db.Text
  strategyId        String?  // Linked ADVERT strategy
  strategyContext   Json?    // Auto-filled context from strategy
  referenceFiles    String[] // Vercel Blob URLs
  createdBy         String   // Brand userId
  talentId          String   // Talent userId
  status            String   // "PENDING", "QUOTED", "ACCEPTED", "DECLINED", "EXPIRED"
  expiresAt         DateTime // 7 days from creation
  createdAt         DateTime @default(now())
  brand             User     @relation("BrandQuotes", fields: [createdBy], references: [id])
  talent            TalentProfile @relation(fields: [talentId], references: [id])
  quote             Quote?
  @@index([createdBy, status])
  @@index([talentId, status])
}

model Quote {
  id            String   @id @default(cuid())
  requestId     String   @unique
  proposedRate  Float
  timeline      String
  breakdown     Json     // Deliverables breakdown
  terms         String   @db.Text
  notes         String?  @db.Text
  createdBy     String   // Talent userId
  createdAt     DateTime @default(now())
  request       QuoteRequest @relation(fields: [requestId], references: [id], onDelete: Cascade)
  talent        User     @relation(fields: [createdBy], references: [id])
}
```
**And** tRPC procedures:
- `marketplace.createQuoteRequest({ ...briefData })`
- `marketplace.submitQuote({ requestId, ...quoteData })`
- `marketplace.acceptQuote({ quoteId })` → creates Project, initiates escrow payment
- `marketplace.declineQuote({ quoteId, reason? })`
- `marketplace.requestRevision({ quoteId, revisionDetails })`

---


### Story 11.5: Project Management and Milestone Tracking

As a **brand and talent managing a project**,
I want **to track project milestones, upload deliverables, and communicate progress**,
So that **both parties stay aligned and the project completes successfully**.

**Acceptance Criteria:**

**Given** a quote is accepted and project created
**When** the project starts
**Then** both brand (Amina) and talent (Kwame) see the project in their dashboards
**And** Brand dashboard (`/marketplace/projects`): "Active Projects" section
**And** Talent dashboard (`/marketplace/talent/projects`): "Active Projects" section

**Given** I view the project page
**When** I navigate to `/marketplace/projects/{projectId}`
**Then** I see the project overview:

**Project Header:**
- Project title: "Zahra Fashion SS2026 Campaign Photoshoot"
- Status badge: "In Progress" (green), "Pending Approval", "Completed", "Disputed"
- Participants:
  - Brand: Amina Diallo (with profile photo)
  - Talent: Kwame Mensah (with profile photo)
- Timeline: "Feb 1 - Feb 14, 2026 (14 days)"
- Total budget: "€2,500"

**Project Details:**
- Original brief (collapsible): Full project requirements
- Agreed quote: Rate breakdown, deliverables, terms
- Payment status: "50% paid (€1,250), 50% in escrow (€1,250)"

**Milestones Section (FR68):**
- List of project milestones with progress tracking
- Each milestone shows:
  - Milestone name: "Initial shoot & raw photos"
  - Due date: "Feb 7, 2026"
  - Status: "In Progress", "Pending Review", "Approved", "Overdue"
  - Deliverables: "50 product photos (raw)"
  - Progress bar: 60% complete

**Given** milestones are defined at project start
**When** the project is created
**Then** default milestones are auto-created based on timeline:
- Milestone 1 (50% timeline): "Initial deliverables" - Due: Feb 7
- Milestone 2 (100% timeline): "Final deliverables" - Due: Feb 14
**And** either party can add/edit milestones

**Given** I (Kwame, talent) upload deliverables (FR69)
**When** I click "Upload Deliverables" on a milestone
**Then** I see an upload form:
- Files: drag-and-drop or file picker (max 50 MB per file, 100 MB total)
- Supported formats: JPG, PNG, PSD, MP4, PDF, ZIP
- Deliverable notes: text area (e.g., "50 product photos - raw files, pending retouching")
- "Submit for Review" button

**When** I upload files and submit
**Then** files are uploaded to Vercel Blob
**And** the milestone status changes to "Pending Review"
**And** Amina (brand) receives notification: "Kwame uploaded deliverables for Milestone 1"
**And** Amina can now review the deliverables

**Given** I (Amina, brand) review deliverables
**When** I navigate to the project and see "Pending Review" milestone
**Then** I see:
- Download links for all deliverables
- Preview (if images/videos)
- Talent notes
- Review actions: "Approve", "Request Revisions"

**When** I click "Approve"
**Then** I see approval confirmation:
- "Approve Milestone 1?"
- Checkbox: "Deliverables meet requirements"
- Optional feedback: text area (e.g., "Great work! Photos look authentic.")
- "Confirm Approval" button

**When** I confirm
**Then** the milestone status changes to "Approved"
**And** Kwame receives notification: "Amina approved Milestone 1"
**And** if this is the final milestone:
  - The escrow payment is released to Kwame (Story 11.7)
  - Project status changes to "Completed"
  - Both parties are prompted to rate each other (Story 11.6)

**Given** I request revisions
**When** I click "Request Revisions"
**Then** I see a revision form:
- "What needs to be revised?" text area
  - Example: "Photos 15-20 need better lighting. Can you re-shoot those?"
- Urgency: "Minor", "Major"
- "Send Revision Request" button

**When** I submit the revision request
**Then** Kwame receives notification: "Amina requested revisions on Milestone 1"
**And** the milestone status changes to "Revisions Requested"
**And** Kwame can upload revised deliverables
**And** this revision cycle can repeat (tracked: "Revision 1", "Revision 2", etc.)

**Given** I add custom milestones
**When** I click "Add Milestone"
**Then** I see a milestone form:
- Milestone name: input
- Due date: date picker
- Description: text area
- Deliverables: text area
- "Add Milestone" button

**And** either brand or talent can add milestones
**And** both parties must agree (approval system or immediate creation based on permissions)

**Given** I edit a milestone
**When** I click "Edit" on a milestone
**Then** I can update:
  - Name, due date, description
**And** the other party is notified of changes
**And** both parties see an activity log: "Amina changed due date from Feb 7 to Feb 8"

**Given** I communicate with the other party
**When** I view the project page
**Then** I see a "Messages" section (threaded conversation)
**And** I can send messages to the other party:
  - Text messages (up to 5000 chars)
  - File attachments (contracts, mood boards, etc.)
**And** messages are real-time or near-real-time (similar to Story 9.5 comments)
**And** both parties receive email notifications for new messages

**Given** a milestone is overdue
**When** the due date passes and status is not "Approved"
**Then** the milestone shows "Overdue" badge (red)
**And** both parties receive a reminder notification
**And** the brand can extend the deadline or open a dispute (Story 11.8)

**Given** I track overall project progress
**When** I view the project overview
**Then** I see a progress bar:
- "2 of 3 milestones approved (67% complete)"
**And** I see estimated completion date based on progress

**Given** I complete the project
**When** all milestones are approved
**Then** the project status changes to "Completed"
**And** final escrow payment is released (Story 11.7)
**And** both parties are prompted: "Rate your experience with [Name]" (Story 11.6)
**And** the project moves to "Completed Projects" section in dashboards

**Given** the feature is implemented
**When** I review technical details
**Then** database models:
```prisma
model Project {
  id          String   @id @default(cuid())
  quoteId     String   @unique
  title       String
  brandUserId String
  talentId    String
  totalAmount Float
  timeline    String
  status      ProjectStatus // IN_PROGRESS, COMPLETED, DISPUTED, CANCELLED
  startDate   DateTime
  endDate     DateTime
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  quote       Quote    @relation(fields: [quoteId], references: [id])
  brand       User     @relation("BrandProjects", fields: [brandUserId], references: [id])
  talent      TalentProfile @relation(fields: [talentId], references: [id])
  milestones  Milestone[]
  messages    ProjectMessage[]
  escrow      EscrowPayment?
  @@index([brandUserId, status])
  @@index([talentId, status])
}

model Milestone {
  id          String   @id @default(cuid())
  projectId   String
  name        String
  description String?  @db.Text
  dueDate     DateTime
  status      MilestoneStatus // NOT_STARTED, IN_PROGRESS, PENDING_REVIEW, APPROVED, REVISIONS_REQUESTED, OVERDUE
  order       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  deliverables Deliverable[]
  @@index([projectId, order])
}

model Deliverable {
  id          String   @id @default(cuid())
  milestoneId String
  fileName    String
  fileUrl     String   // Vercel Blob URL
  fileSize    Int
  fileType    String
  notes       String?  @db.Text
  uploadedBy  String   // userId (talent)
  createdAt   DateTime @default(now())
  milestone   Milestone @relation(fields: [milestoneId], references: [id], onDelete: Cascade)
  uploader    User     @relation(fields: [uploadedBy], references: [id])
  @@index([milestoneId])
}

model ProjectMessage {
  id          String   @id @default(cuid())
  projectId   String
  senderId    String
  message     String   @db.Text
  attachments String[] // Vercel Blob URLs
  createdAt   DateTime @default(now())
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  sender      User     @relation(fields: [senderId], references: [id])
  @@index([projectId, createdAt])
}
```
**And** tRPC procedures:
- `projects.get({ projectId })`
- `projects.addMilestone({ projectId, ...milestoneData })`
- `projects.uploadDeliverable({ milestoneId, files, notes })`
- `projects.approveMilestone({ milestoneId, feedback? })`
- `projects.requestRevisions({ milestoneId, revisionDetails })`
- `projects.sendMessage({ projectId, message, attachments? })`

---


### Story 11.6: Mutual Ratings and Reviews

As a **brand or talent after project completion**,
I want **to rate and review my experience with the other party**,
So that **the marketplace maintains quality and builds trust through reputation**.

**Acceptance Criteria:**

**Given** a project is completed
**When** all milestones are approved and final payment is released
**Then** both parties receive a prompt: "How was your experience?"
**And** they see a "Rate [Name]" button in:
  - In-app notification
  - Email notification
  - Project page (banner at top)

**Given** I (Amina, brand) rate a talent (FR70)
**When** I click "Rate Kwame Mensah"
**Then** I see a rating form:

**Overall Rating:**
- Star rating (1-5 stars): ⭐⭐⭐⭐⭐ (select)
- Label: "How was your overall experience?"

**Category Ratings:**
- Quality of work: ⭐⭐⭐⭐⭐ 5 stars
- Communication: ⭐⭐⭐⭐⭐ 5 stars
- Timeliness: ⭐⭐⭐⭐☆ 4 stars
- Professionalism: ⭐⭐⭐⭐⭐ 5 stars

**Written Review:**
- Review text area (500 chars max, optional but encouraged)
  - Example: "Kwame delivered exceptional photos that perfectly captured our sustainable fashion ethos. Professional, creative, and on-time. Highly recommend!"
- Visibility: "Public" (visible on talent profile) or "Private" (only visible to ADVERT team)

**Recommendation:**
- Checkbox: "I would hire Kwame again" ☑
- Checkbox: "I would recommend Kwame to other brands" ☑

**Submit Button:**
- "Submit Review"

**When** I submit the review
**Then** the rating is saved and published on Kwame's profile
**And** Kwame's average rating updates immediately
**And** Kwame receives notification: "Amina rated your work: ⭐⭐⭐⭐⭐ 5 stars"
**And** I see confirmation: "Thank you for your review!"

**Given** I (Kwame, talent) rate a brand client (FR71 - mutual rating)
**When** I click "Rate Amina Diallo"
**Then** I see a similar rating form:

**Overall Rating:**
- Star rating (1-5 stars)

**Category Ratings:**
- Clear communication: ⭐⭐⭐⭐⭐ 5 stars
- Timely feedback: ⭐⭐⭐⭐☆ 4 stars
- Payment promptness: ⭐⭐⭐⭐⭐ 5 stars
- Professional behavior: ⭐⭐⭐⭐⭐ 5 stars

**Written Review:**
- Review text (500 chars, optional)
  - Example: "Amina was a pleasure to work with. Clear brief, timely feedback, and respectful communication. Would love to collaborate again!"
- Visibility: "Public" or "Private"

**When** I submit
**Then** Amina's profile shows my rating (visible to talents browsing brand reputation)
**And** Amina receives notification: "Kwame rated you: ⭐⭐⭐⭐⭐ 5 stars"

**Given** ratings are displayed on talent profiles
**When** a brand views Kwame's profile
**Then** they see:
- Overall rating: ⭐ 4.9/5 (25 reviews)
- Category breakdown:
  - Quality: 5.0
  - Communication: 4.9
  - Timeliness: 4.8
  - Professionalism: 5.0
- Recent reviews (3-5 most recent):
  - Reviewer: "Amina D." (first name + initial for privacy)
  - Rating: ⭐⭐⭐⭐⭐ 5 stars
  - Date: "2 weeks ago"
  - Review text: "Kwame delivered exceptional photos..."
  - Verified badge: "Verified Client" (confirmed completed project)

**Given** I view all reviews
**When** I click "View All Reviews" on a profile
**Then** I see a paginated list of all reviews
**And** I can filter by rating: "All", "5 stars", "4 stars", "3 stars or lower"
**And** I can sort by: "Most Recent", "Highest Rated", "Lowest Rated"

**Given** I respond to a review (talent only)
**When** Kwame receives a review
**Then** he can click "Respond" on the review
**And** write a response (300 chars):
  - Example: "Thank you Amina! It was a pleasure bringing your vision to life. Looking forward to future collaborations!"
**And** the response appears below the review on his profile

**Given** ratings affect search ranking
**When** talents are displayed in search results (Story 11.2)
**Then** higher-rated talents (4.5+ stars, 10+ reviews) rank higher in "Recommended" sort
**And** verified talents with good ratings get a boost

**Given** ratings affect matching (Story 11.3)
**When** AI matching runs
**Then** talent quality score factors in:
  - Average rating >= 4.5: +15 points
  - Average rating >= 4.0: +10 points
  - Number of reviews >= 10: +5 points

**Given** I can't rate without completing a project
**When** I try to leave a review without a completed project
**Then** I see an error: "You can only review talents you've worked with"
**And** the review form is inaccessible

**Given** ratings are one-time only
**When** I rate a talent after a project
**Then** I cannot edit or delete the rating (permanent)
**And** I can rate the same talent again after future projects (separate ratings)

**Given** low ratings trigger quality review
**When** a talent receives 3 consecutive ratings below 3 stars
**Then** ADVERT team is notified for quality review
**And** the talent may be contacted for performance improvement

**Given** I report an unfair review
**When** I receive a review I believe is unfair or violates guidelines
**Then** I can click "Report Review"
**And** submit a dispute with reason:
  - False information
  - Offensive language
  - Not related to work quality
**And** ADVERT team reviews and may remove the review

**Given** the feature is implemented
**When** I review technical details
**Then** database models:
```prisma
model TalentRating {
  id                  String   @id @default(cuid())
  projectId           String
  talentId            String
  reviewerId          String   // Brand userId
  overallRating       Int      // 1-5
  qualityRating       Int
  communicationRating Int
  timelinessRating    Int
  professionalismRating Int
  reviewText          String?  @db.Text
  isPublic            Boolean  @default(true)
  wouldHireAgain      Boolean  @default(false)
  wouldRecommend      Boolean  @default(false)
  talentResponse      String?  @db.Text
  createdAt           DateTime @default(now())
  project             Project  @relation(fields: [projectId], references: [id])
  talent              TalentProfile @relation(fields: [talentId], references: [id])
  reviewer            User     @relation("BrandReviews", fields: [reviewerId], references: [id])
  @@unique([projectId, reviewerId]) // One rating per project per reviewer
  @@index([talentId, overallRating])
}

model BrandRating {
  id                      String   @id @default(cuid())
  projectId               String
  brandUserId             String
  reviewerId              String   // Talent userId
  overallRating           Int      // 1-5
  communicationRating     Int
  feedbackTimelinessRating Int
  paymentPromptnessRating Int
  professionalismRating   Int
  reviewText              String?  @db.Text
  isPublic                Boolean  @default(true)
  wouldWorkAgain          Boolean  @default(false)
  createdAt               DateTime @default(now())
  project                 Project  @relation(fields: [projectId], references: [id])
  brand                   User     @relation("BrandRatings", fields: [brandUserId], references: [id])
  reviewer                User     @relation("TalentReviewsGiven", fields: [reviewerId], references: [id])
  @@unique([projectId, reviewerId])
  @@index([brandUserId, overallRating])
}
```
**And** average rating calculation:
```typescript
async function updateTalentAverageRating(talentId: string) {
  const ratings = await prisma.talentRating.findMany({ where: { talentId } })
  const avgOverall = average(ratings.map(r => r.overallRating))
  const avgQuality = average(ratings.map(r => r.qualityRating))
  const avgCommunication = average(ratings.map(r => r.communicationRating))
  const avgTimeliness = average(ratings.map(r => r.timelinessRating))
  const avgProfessionalism = average(ratings.map(r => r.professionalismRating))

  await prisma.talentProfile.update({
    where: { id: talentId },
    data: {
      averageRating: avgOverall,
      totalReviews: ratings.length,
      ratingBreakdown: { quality: avgQuality, communication: avgCommunication, timeliness: avgTimeliness, professionalism: avgProfessionalism }
    }
  })
}
```
**And** tRPC procedures:
- `ratings.createTalentRating({ projectId, ...ratingData })`
- `ratings.createBrandRating({ projectId, ...ratingData })`
- `ratings.getTalentRatings({ talentId, limit, offset })`
- `ratings.respondToReview({ ratingId, response })`
- `ratings.reportReview({ ratingId, reason })`

---


### Story 11.7: Escrow Payments and Earnings Withdrawal

As a **brand paying for services and talent earning from projects**,
I want **secure escrow payments and easy withdrawal of earnings**,
So that **both parties are protected and transactions are transparent**.

**Acceptance Criteria:**

**Given** a quote is accepted (Story 11.4)
**When** the brand (Amina) clicks "Confirm & Pay Deposit"
**Then** the escrow payment process begins (FR72)
**And** payment terms are applied:
  - 50% upfront deposit: €1,250
  - 50% held in escrow: €1,250
  - Platform commission: 25% of total (€2,500 * 0.25 = €625)
  - Talent receives: 75% of total (€2,500 * 0.75 = €1,875)

**Given** I pay the upfront deposit
**When** I proceed to payment
**Then** I see a payment page:
- Amount due now: €1,250 (50% deposit)
- Payment method: Credit Card, Mobile Money (Paystack/Flutterwave - same as Story 7.2/7.3)
- Saved payment methods (if any)
- "Pay €1,250" button

**When** I complete payment
**Then** the payment is processed:
  - €1,250 charged to my payment method
  - €625 deposited to talent escrow balance (50% of talent's 75% share)
  - €625 held in ADVERT escrow account (remaining 50% of talent's share + full 25% commission)
  - Project status changes to "In Progress"
**And** Kwame (talent) receives notification: "Project started! €1,875 (€1,250 deposit, €625 pending approval)"
**And** Kwame sees in his earnings dashboard: "In Escrow: €625"

**Given** the project progresses
**When** milestones are approved (Story 11.5)
**Then** funds remain in escrow until final milestone approval

**Given** the final milestone is approved
**When** Amina approves the last milestone
**Then** the remaining escrow is released:
  - €625 released from escrow to Kwame's earnings balance
  - €625 platform commission kept by ADVERT
**And** Kwame's earnings dashboard updates: "Available Balance: €1,875"
**And** Kwame receives notification: "Payment released! €1,875 available for withdrawal"

**Given** I (Kwame, talent) view my earnings dashboard (FR74)
**When** I navigate to `/marketplace/talent/earnings`
**Then** I see:

**Earnings Overview:**
- Available balance: "€1,875.00" (ready for withdrawal)
- In escrow: "€0.00" (pending project completions)
- Total earnings (lifetime): "€8,450.00"
- Withdrawn: "€6,575.00"

**Recent Transactions:**
| Date | Project | Type | Amount | Status |
|------|---------|------|--------|--------|
| Feb 14, 2026 | Zahra Fashion SS2026 | Payment Released | +€1,875 | Completed |
| Feb 1, 2026 | Zahra Fashion SS2026 | Deposit | +€625 (escrow) | In Escrow → Released |
| Jan 28, 2026 | Withdrawal to Bank | Withdrawal | -€1,500 | Completed |
| Jan 20, 2026 | Kofi Bank Campaign | Payment Released | +€2,250 | Completed |

**Withdrawal Section:**
- "Withdraw Funds" button (prominent)

**Given** I withdraw earnings
**When** I click "Withdraw Funds"
**Then** I see a withdrawal form:

**Withdrawal Method:**
- Bank transfer (default)
- Mobile money (MTN, Orange, M-Pesa, Wave)

**If Bank Transfer:**
- Bank name: dropdown (list of African banks by country)
- Account number: input
- Account name: input (must match talent profile name)
- Amount: input (max: available balance €1,875)
  - Or "Withdraw All" button
- Processing fee: "€5 (deducted from withdrawal)"
- You'll receive: "€1,870" (amount - fee)

**If Mobile Money:**
- Provider: MTN Mobile Money, Orange Money, M-Pesa, Wave
- Phone number: input (with country code)
- Amount: input (max: €1,875)
- Processing fee: "€2" (lower than bank transfer)
- You'll receive: "€1,873"

**When** I submit withdrawal request
**Then** the withdrawal is processed:
  - Status: "Processing" (1-3 business days for bank, 1-24 hours for mobile money)
  - Available balance reduced: €1,875 → €0
  - Email confirmation sent: "Withdrawal request received"

**When** withdrawal completes
**Then** I receive:
  - Bank transfer: Funds in bank account within 1-3 days
  - Mobile money: Funds in mobile wallet within 1-24 hours
  - Email confirmation: "Withdrawal completed: €1,870 sent to your account"
  - In-app notification: "Withdrawal successful"

**Given** withdrawal fails
**When** the bank transfer or mobile money fails (invalid account, network issue)
**Then** the funds are returned to my available balance
**And** I receive notification: "Withdrawal failed: [reason]. Funds returned to your balance."
**And** I can retry

**Given** I set withdrawal preferences
**When** I navigate to withdrawal settings
**Then** I can:
  - Save default withdrawal method (bank or mobile money)
  - Save account details (bank account or phone number)
  - Enable auto-withdrawal: "Automatically withdraw when balance reaches €500"

**Given** I view withdrawal history
**When** I click "Withdrawal History"
**Then** I see all past withdrawals:
  - Date, method, amount, fee, status (completed, failed, processing)
  - Filter by date range, method, status

**Given** minimum withdrawal threshold
**When** my available balance is below €50
**Then** I see: "Minimum withdrawal: €50. Current balance: €45"
**And** "Withdraw Funds" button is disabled until I reach €50

**Given** platform commission is transparent
**When** I view earnings breakdown for a project
**Then** I see:
  - Project total: €2,500
  - Platform commission (25%): -€625
  - Your earnings (75%): €1,875
  - Breakdown: "ADVERT charges 25% commission to cover payment processing, marketplace maintenance, and support."

**Given** tax information (optional, future compliance)
**When** I withdraw earnings above a threshold (€600/year in some jurisdictions)
**Then** I may be prompted to provide tax information (W-9, tax ID)
**And** ADVERT generates tax forms (1099 or local equivalent) at year-end

**Given** the feature is secure
**When** I review security measures
**Then** escrow funds are held in:
  - Dedicated business bank account (segregated from operating funds)
  - Or Stripe Connect/Paystack Split Payment (recommended for compliance)
**And** withdrawal requests are verified (email confirmation, 2FA if enabled)
**And** suspicious withdrawals are flagged for manual review

**Given** the feature is implemented
**When** I review technical details
**Then** database models:
```prisma
model EscrowPayment {
  id              String   @id @default(cuid())
  projectId       String   @unique
  totalAmount     Float    // €2,500
  depositAmount   Float    // €1,250 (50%)
  escrowAmount    Float    // €1,250 (50%)
  platformFee     Float    // €625 (25% of total)
  talentEarnings  Float    // €1,875 (75% of total)
  depositPaidAt   DateTime?
  releasedAt      DateTime?
  status          String   // "PENDING", "DEPOSIT_PAID", "RELEASED", "REFUNDED"
  project         Project  @relation(fields: [projectId], references: [id])
  @@index([projectId, status])
}

model TalentEarnings {
  id              String   @id @default(cuid())
  talentId        String   @unique
  availableBalance Float   @default(0)
  inEscrow        Float    @default(0)
  totalEarned     Float    @default(0)
  totalWithdrawn  Float    @default(0)
  updatedAt       DateTime @updatedAt
  talent          TalentProfile @relation(fields: [talentId], references: [id])
}

model Withdrawal {
  id          String   @id @default(cuid())
  talentId    String
  amount      Float
  fee         Float
  netAmount   Float    // amount - fee
  method      String   // "BANK", "MOBILE_MONEY"
  destination Json     // { bankName, accountNumber } or { provider, phoneNumber }
  status      String   // "PROCESSING", "COMPLETED", "FAILED"
  initiatedAt DateTime @default(now())
  completedAt DateTime?
  failureReason String?
  talent      TalentProfile @relation(fields: [talentId], references: [id])
  @@index([talentId, status])
}
```
**And** payment flow:
```typescript
async function handleDepositPayment(projectId: string, paymentMethodId: string) {
  const project = await getProject(projectId)
  const escrow = await prisma.escrowPayment.findUnique({ where: { projectId } })

  // Charge deposit via Paystack/Flutterwave
  const charge = await paystackService.chargeCard(paymentMethodId, escrow.depositAmount)

  if (charge.success) {
    // Update escrow status
    await prisma.escrowPayment.update({
      where: { projectId },
      data: { depositPaidAt: new Date(), status: 'DEPOSIT_PAID' }
    })

    // Credit talent escrow balance (50% of talent earnings)
    await prisma.talentEarnings.update({
      where: { talentId: project.talentId },
      data: { inEscrow: { increment: escrow.talentEarnings / 2 } }
    })

    // Notify talent
    await sendNotification(project.talentId, 'Deposit received')
  }
}

async function releaseEscrowPayment(projectId: string) {
  const project = await getProject(projectId)
  const escrow = await prisma.escrowPayment.findUnique({ where: { projectId } })

  // Release remaining escrow to talent
  await prisma.talentEarnings.update({
    where: { talentId: project.talentId },
    data: {
      availableBalance: { increment: escrow.talentEarnings / 2 },
      inEscrow: { decrement: escrow.talentEarnings / 2 },
      totalEarned: { increment: escrow.talentEarnings }
    }
  })

  await prisma.escrowPayment.update({
    where: { projectId },
    data: { releasedAt: new Date(), status: 'RELEASED' }
  })

  await sendNotification(project.talentId, 'Payment released')
}

async function processWithdrawal(talentId: string, amount: number, method: 'BANK' | 'MOBILE_MONEY', destination: any) {
  const earnings = await prisma.talentEarnings.findUnique({ where: { talentId } })
  if (earnings.availableBalance < amount) throw new Error('Insufficient balance')

  const fee = method === 'BANK' ? 5 : 2
  const netAmount = amount - fee

  // Create withdrawal record
  const withdrawal = await prisma.withdrawal.create({
    data: { talentId, amount, fee, netAmount, method, destination, status: 'PROCESSING' }
  })

  // Deduct from available balance
  await prisma.talentEarnings.update({
    where: { talentId },
    data: { availableBalance: { decrement: amount } }
  })

  // Process via payment gateway (async)
  if (method === 'BANK') {
    await paystackService.transferToBank(destination, netAmount)
  } else {
    await paystackService.transferToMobileMoney(destination, netAmount)
  }

  // Update withdrawal status (via webhook or polling)
  // ...
}
```

---


### Story 11.8: Dispute Resolution System

As a **brand or talent facing project issues**,
I want **to open a dispute and receive mediation support**,
So that **conflicts are resolved fairly and professionally**.

**Acceptance Criteria:**

**Given** a project has issues (FR73)
**When** issues arise during or after the project:
  - Deliverables don't meet requirements (after multiple revision requests)
  - Talent doesn't deliver on time (past deadline)
  - Brand doesn't provide necessary resources (delays project)
  - Payment dispute (brand refuses payment, talent claims non-payment)
  - Communication breakdown
**Then** either party can open a dispute

**Given** I (Amina, brand) want to open a dispute
**When** I navigate to the project page
**And** I click "Open Dispute" button (visible after project start)
**Then** I see a dispute form:

**Dispute Reason:**
- Dropdown:
  - Deliverables don't meet requirements
  - Missed deadlines / Late delivery
  - Poor communication / Unresponsive
  - Payment issue
  - Other

**Dispute Details:**
- Description (required, 500-2000 chars):
  - Example: "Kwame delivered photos 5 days late and 15 photos don't meet the quality standard we agreed upon. After 2 revision requests, issues persist."
- Evidence: File uploads (screenshots, contracts, communications)
  - Max 10 files, 5 MB each
- Desired outcome:
  - Refund (full or partial): "€500 refund (20%)"
  - Project completion with corrections
  - Termination and refund
  - Other

**Submit Dispute:**
- Checkbox: "I have tried to resolve this directly with the talent"
- "Submit Dispute" button

**When** I submit the dispute
**Then** the dispute is created
**And** project status changes to "Disputed" (red badge)
**And** escrow payment is frozen (no release until resolution)
**And** Kwame receives notification: "Amina opened a dispute on 'Zahra Fashion SS2026'"
**And** ADVERT support team is notified

**Given** I (Kwame, talent) receive a dispute notification
**When** I view the dispute
**Then** I see:
  - Dispute details (reason, description, evidence)
  - Amina's desired outcome
  - "Respond to Dispute" button

**When** I respond to the dispute
**Then** I see a response form:
- Your response (500-2000 chars):
  - Example: "I acknowledge the delay due to unexpected weather conditions. I've already provided 2 rounds of revisions. The photos meet industry standards for this budget range. I'm willing to provide 1 final revision round."
- Counter-evidence: File uploads
- Your proposed resolution:
  - Complete project with 1 final revision
  - Partial refund (€250) + final revision
  - Terminate project with partial payment
  - Other

**When** I submit my response
**Then** Amina receives notification: "Kwame responded to your dispute"
**And** both parties enter mediation phase

**Given** the mediation process begins
**When** ADVERT support team reviews the dispute
**Then** a mediator is assigned (within 24 hours)
**And** both parties receive: "Your dispute is under review by our support team"
**And** the mediator contacts both parties:
  - Via project messaging system
  - Or email/phone if needed

**Given** the mediator facilitates resolution
**When** the mediator analyzes the dispute
**Then** they review:
  - Project brief and agreed quote
  - Deliverables submitted
  - Communication history
  - Evidence from both parties
  - Platform policies and terms

**And** the mediator proposes a resolution:
  - Example: "Kwame will provide 1 final revision within 3 days. If Amina approves, full payment released. If issues persist, 20% refund (€500) + project closes."

**Given** I (Amina) receive the proposed resolution
**When** I view the mediator's proposal
**Then** I see:
  - Mediator's analysis
  - Proposed resolution with timeline
  - Actions: "Accept Resolution", "Reject & Appeal"

**When** I accept the resolution
**Then** the resolution is implemented:
  - If revision required: Kwame uploads revision, Amina reviews
  - If refund: Escrow is split per resolution (e.g., €1,875 to Kwame, €625 refund to Amina)
  - If termination: Project closed, partial payments made
**And** dispute status changes to "Resolved"

**When** I reject the resolution
**Then** I can appeal with additional evidence
**And** the dispute escalates to senior support review
**And** final decision is made (binding)

**Given** the resolution is implemented
**When** both parties comply with the resolution
**Then** escrow is distributed per agreement
**And** project status changes to "Completed (Disputed)" or "Terminated"
**And** both parties can still rate each other (optional, ratings may be marked "Disputed Project")

**Given** disputes affect reputation
**When** a talent has multiple disputes (3+ in 6 months)
**Then** their profile shows a warning: "This talent has had recent disputes. Review carefully before hiring."
**And** their search ranking decreases
**And** they may be suspended pending review

**When** a brand has multiple disputes
**Then** talents see a warning on quote requests: "This brand has had recent disputes."
**And** talents can decline quote requests without penalty

**Given** I escalate to full arbitration (rare, for high-value disputes)
**When** the dispute value is >€5,000 or mediation fails
**Then** ADVERT may offer binding arbitration:
  - Third-party arbitrator (external, if needed)
  - Both parties present cases
  - Arbitrator makes final decision (legally binding per terms of service)

**Given** I abuse the dispute system
**When** I open frivolous disputes or false claims
**Then** ADVERT reviews and may:
  - Dismiss the dispute
  - Issue a warning
  - Suspend my account for policy violations

**Given** disputes are tracked
**When** I view my account history
**Then** I see a "Disputes" section:
  - Total disputes: 1
  - Resolved: 1
  - Pending: 0
  - Outcome summary (for transparency)

**Given** the feature prevents disputes
**When** I review best practices
**Then** ADVERT provides:
  - Pre-project checklists (clear briefs, agreed terms)
  - Communication templates
  - Milestone approval reminders
  - Escalation warnings ("No response in 3 days - contact support before disputing")

**Given** the feature is implemented
**When** I review technical details
**Then** database model:
```prisma
model Dispute {
  id          String   @id @default(cuid())
  projectId   String
  openedBy    String   // userId (brand or talent)
  reason      String
  description String   @db.Text
  evidence    String[] // Vercel Blob URLs
  desiredOutcome String @db.Text
  status      DisputeStatus // OPEN, MEDIATION, RESOLVED, REJECTED, ESCALATED
  mediatorId  String?  // Admin/support userId
  resolution  String?  @db.Text
  resolvedAt  DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  project     Project  @relation(fields: [projectId], references: [id])
  opener      User     @relation("DisputesOpened", fields: [openedBy], references: [id])
  mediator    User?    @relation("DisputesMediated", fields: [mediatorId], references: [id])
  responses   DisputeResponse[]
  @@index([projectId, status])
}

model DisputeResponse {
  id          String   @id @default(cuid())
  disputeId   String
  responderId String   // userId
  response    String   @db.Text
  evidence    String[]
  proposal    String?  @db.Text
  createdAt   DateTime @default(now())
  dispute     Dispute  @relation(fields: [disputeId], references: [id], onDelete: Cascade)
  responder   User     @relation(fields: [responderId], references: [id])
  @@index([disputeId])
}

enum DisputeStatus {
  OPEN
  MEDIATION
  RESOLVED
  REJECTED
  ESCALATED
}
```
**And** tRPC procedures:
- `disputes.open({ projectId, reason, description, evidence, desiredOutcome })`
- `disputes.respond({ disputeId, response, evidence, proposal })`
- `disputes.proposeResolution({ disputeId, resolution })` (mediator only)
- `disputes.acceptResolution({ disputeId })`
- `disputes.rejectResolution({ disputeId, appealReason })`

---

**Epic 11 Complete!** 🎉🎉🎉

Epic 11: Creative Concierge Marketplace (8 stories) is now fully documented with comprehensive acceptance criteria covering:
- Talent profile creation with portfolio management (20 work samples, skills, rates, availability)
- Brand discovery and talent search (filters, keyword search, full profiles with reviews)
- AI-assisted talent matching (95% match scores, explainable recommendations based on ADVERT pillars)
- Project brief creation with ADVERT strategy integration (auto-fills brand context)
- Quote requests and negotiation (multi-round revisions, side-by-side comparisons)
- Project management with milestones (deliverable uploads, approval workflow, revisions)
- Mutual ratings and reviews (5-star system with category breakdowns, public/private, talent responses)
- Escrow payments with 75/25 split (50% deposit, 50% on completion, bank/mobile money withdrawals)
- Dispute resolution system (mediation, evidence upload, binding resolutions)

**11 Epics complétés sur 14!** 🚀 **79% terminé!**

**Reste 3 epics:**
- **Epic 12**: Third-Party Integrations & API (FR75-FR84)
- **Epic 13**: Compliance, Security & Enterprise Features (FR87, FR90, FR99-FR112)
- **Epic 14**: PWA, Accessibility & UX Polish

---

## EPIC 12: THIRD-PARTY INTEGRATIONS & API

**Epic Goal:** Enable enterprise customers to integrate ADVERT into their existing tech stack via APIs, SDKs, and OAuth-based third-party connections.

**FRs Covered:** FR75-FR84

**Stories:**
- 12.1: API Key Generation and Management
- 12.2: Public REST API Endpoints and OAuth 2.0 Authentication
- 12.3: SDK Development (JavaScript/Python)
- 12.4: Webhook Configuration and Delivery
- 12.5: API Usage Analytics Dashboard
- 12.6: Zoho CRM Integration
- 12.7: HubSpot Campaign Sync Integration
- 12.8: Monday.com and Asana Project Integration
- 12.9: Integration Management and Disconnection

---

### Story 12.1: API Key Generation and Management

As a **developer on an Enterprise plan**,
I want **to generate and manage API keys for programmatic access to ADVERT**,
So that **I can authenticate my applications and integrate ADVERT into our tech stack**.

**Acceptance Criteria:**

**Given** I am an Enterprise tier user
**When** I navigate to `/settings/integrations/api-keys`
**Then** I see the API Keys management page
**And** the page displays:
- Page title: "API Keys"
- Description: "Generate API keys to access ADVERT programmatically via REST API"
- Enterprise tier badge (if not Enterprise: "Upgrade to Enterprise to unlock API access")
- "Generate New API Key" button
- Table of existing API keys (if any)

**Given** I am not an Enterprise user
**When** I navigate to `/settings/integrations/api-keys`
**Then** I see a paywall:
- "API Access - Enterprise Feature"
- "Programmatic access to ADVERT requires Enterprise tier (€999/month)"
- "Contact Sales" button
- Feature list: REST API, SDK, Webhooks, 10,000 requests/hour

**Given** I click "Generate New API Key"
**When** the API key generation modal opens
**Then** I see a form:
- **Key name** (required): "Production API Key" (descriptive name)
- **Description** (optional): "Used by backend service for strategy automation"
- **Permissions** (checkboxes):
  - ☑ Read strategies (strategies:read)
  - ☑ Create strategies (strategies:write)
  - ☑ Update strategies (strategies:update)
  - ☐ Delete strategies (strategies:delete)
  - ☑ Read analytics (analytics:read)
  - ☐ Manage team members (team:manage)
  - ☐ Manage billing (billing:manage)
- **Scopes** (optional, filter by tenant/strategy):
  - All strategies (default)
  - Specific strategy IDs (comma-separated)
- **Expiration** (optional):
  - Never (default)
  - 30 days
  - 90 days
  - 1 year
  - Custom date
- "Generate API Key" button

**Given** I fill in the key name: "Production API Key"
**And** I select permissions: strategies:read, strategies:write, analytics:read
**And** I set expiration: "Never"
**And** I click "Generate API Key"
**Then** the API key is created in the database
**And** I see a one-time display modal:
- Title: "API Key Generated Successfully"
- API Key: `adv_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6` (monospace font, copyable)
- Warning: "Copy this key now. For security reasons, we cannot show it again."
- "Copy to Clipboard" button
- Checkbox: "I have saved this key securely"
- "Done" button (disabled until checkbox is checked)

**Given** I copy the API key
**When** I click "Copy to Clipboard"
**Then** the key is copied to my clipboard
**And** a toast notification confirms: "API key copied to clipboard"

**Given** I check "I have saved this key securely"
**And** I click "Done"
**Then** the modal closes
**And** I return to the API Keys page
**And** the new key appears in the table:
- **Name**: "Production API Key"
- **Key prefix**: `adv_live_...o5p6` (masked, only first 12 and last 4 chars visible)
- **Permissions**: "Read, Write Strategies; Read Analytics"
- **Created**: "2026-02-05 14:30 UTC"
- **Last used**: "Never" (or timestamp)
- **Expires**: "Never"
- **Status**: "Active" (green badge)
- **Actions**: "Revoke" button

**Given** I have multiple API keys
**When** I view the API keys table
**Then** I see all keys sorted by creation date (newest first)
**And** I can filter/search by key name

**Given** I want to revoke an API key
**When** I click "Revoke" on "Production API Key"
**Then** I see a confirmation modal:
- "Revoke API Key?"
- "This action cannot be undone. Applications using this key will immediately lose access."
- Key name: "Production API Key"
- "Cancel" button
- "Revoke Key" button (destructive, red)

**Given** I confirm revocation
**When** I click "Revoke Key"
**Then** the key status changes to "Revoked" (gray badge)
**And** the key is deactivated in the database
**And** any API requests with this key return 401 Unauthorized
**And** a toast notification confirms: "API key revoked successfully"

**Given** I want to test my API key
**When** I view an active key
**Then** I see a "Test Key" button
**And** clicking it makes a test API request: `GET /api/v1/strategies`
**And** I see the response:
- Success: "API key is working! Retrieved 5 strategies."
- Error: "API key authentication failed. Please regenerate."

**Given** I track API key usage
**When** an API request is made with my key
**Then** the key's "Last used" timestamp is updated
**And** usage metrics are tracked (requests count, endpoints accessed)

**Given** I review security best practices
**When** I view the API Keys page
**Then** I see a "Security Best Practices" collapsible section:
- "Never commit API keys to version control"
- "Use environment variables to store keys"
- "Rotate keys regularly (every 90 days recommended)"
- "Use minimal permissions (principle of least privilege)"
- "Revoke keys immediately if compromised"
- Link to API documentation: "View API Docs"

**Given** the feature is implemented
**When** I review technical details
**Then** database model:
```prisma
model ApiKey {
  id          String   @id @default(cuid())
  tenantId    String
  userId      String   // Creator
  name        String
  description String?
  keyHash     String   @unique // bcrypt hash of full key
  keyPrefix   String   // First 12 chars for display
  keySuffix   String   // Last 4 chars for display
  permissions Json     // Array of scopes: ["strategies:read", "strategies:write"]
  scopes      Json?    // Optional filters: { strategyIds: [...] }
  expiresAt   DateTime?
  lastUsedAt  DateTime?
  status      ApiKeyStatus // ACTIVE, REVOKED, EXPIRED
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  creator     User     @relation(fields: [userId], references: [id])
  @@index([tenantId, status])
  @@index([keyHash])
}

enum ApiKeyStatus {
  ACTIVE
  REVOKED
  EXPIRED
}
```

**And** tRPC procedures:
- `apiKeys.generate({ name, description, permissions, scopes, expiresAt })` → returns full key (one-time)
- `apiKeys.list()` → returns all keys for tenant (masked)
- `apiKeys.revoke({ keyId })`
- `apiKeys.testKey({ keyId })` → test API request

**And** API key format:
- Prefix: `adv_live_` (production) or `adv_test_` (sandbox)
- 32-character random alphanumeric string
- Example: `adv_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

---

### Story 12.2: Public REST API Endpoints and OAuth 2.0 Authentication

As a **developer integrating ADVERT into external systems**,
I want **to access ADVERT data via REST API endpoints with OAuth 2.0 authentication**,
So that **I can programmatically create, read, update strategies and access analytics**.

**Acceptance Criteria:**

**Given** I have an API key from Story 12.1
**When** I make an authenticated API request
**Then** I include the API key in the Authorization header:
```
Authorization: Bearer adv_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

**Given** I make a request without authentication
**When** I call `GET /api/v1/strategies`
**Then** I receive:
- Status: 401 Unauthorized
- Response:
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "API key required. Include 'Authorization: Bearer <key>' header.",
    "docs": "https://docs.advert.app/api/authentication"
  }
}
```

**Given** I make a request with an invalid API key
**When** I call `GET /api/v1/strategies` with an invalid key
**Then** I receive:
- Status: 401 Unauthorized
- Response:
```json
{
  "error": {
    "code": "INVALID_API_KEY",
    "message": "Invalid or revoked API key.",
    "docs": "https://docs.advert.app/api/authentication"
  }
}
```

**Given** I make a request with an expired API key
**When** I call `GET /api/v1/strategies` with an expired key
**Then** I receive:
- Status: 401 Unauthorized
- Response:
```json
{
  "error": {
    "code": "EXPIRED_API_KEY",
    "message": "API key expired on 2026-01-15. Generate a new key.",
    "docs": "https://docs.advert.app/api/authentication"
  }
}
```

**Given** I have valid authentication
**When** I call `GET /api/v1/strategies`
**Then** I receive:
- Status: 200 OK
- Response:
```json
{
  "data": [
    {
      "id": "strat_123",
      "brandName": "Zahra Fashion House",
      "industry": "Fashion & Apparel",
      "audienceAge": "25-40",
      "pillars": [
        {
          "id": "pillar_456",
          "pillarNumber": 1,
          "title": "Heritage Craftsmanship",
          "bigIdea": "Every piece tells a story of Ghanaian artisanship",
          "tactics": [...]
        }
      ],
      "status": "ACTIVE",
      "createdAt": "2026-01-10T14:30:00Z",
      "updatedAt": "2026-02-05T10:15:00Z"
    }
  ],
  "meta": {
    "total": 42,
    "page": 1,
    "pageSize": 10,
    "hasMore": true
  }
}
```

**Given** I want to paginate results
**When** I call `GET /api/v1/strategies?page=2&pageSize=20`
**Then** I receive page 2 with 20 results

**Given** I want to filter strategies
**When** I call `GET /api/v1/strategies?status=ACTIVE&industry=Fashion`
**Then** I receive only active strategies in the Fashion industry

**Given** I want to retrieve a single strategy
**When** I call `GET /api/v1/strategies/strat_123`
**Then** I receive:
- Status: 200 OK
- Full strategy details including all pillars, tactics, and analytics

**Given** I want to create a new strategy
**When** I call `POST /api/v1/strategies`
**With** body:
```json
{
  "brandName": "Kweku's Coffee",
  "industry": "Food & Beverage",
  "audienceAge": "30-50",
  "audienceDescription": "Urban professionals seeking premium African coffee"
}
```
**Then** the strategy is created
**And** I receive:
- Status: 201 Created
- Response with new strategy ID and details

**Given** I want to update a strategy
**When** I call `PATCH /api/v1/strategies/strat_123`
**With** body:
```json
{
  "brandName": "Zahra Fashion House (Updated)"
}
```
**Then** the strategy is updated
**And** I receive:
- Status: 200 OK
- Updated strategy details

**Given** I want to delete a strategy
**When** I call `DELETE /api/v1/strategies/strat_123`
**Then** the strategy is soft-deleted
**And** I receive:
- Status: 204 No Content

**Given** I want to access analytics
**When** I call `GET /api/v1/analytics/strategy/strat_123`
**Then** I receive:
- Status: 200 OK
- Analytics data (views, shares, exports, engagement metrics)

**Given** I exceed rate limits
**When** I make 1001 requests in 1 hour (Professional tier limit: 1000/hour)
**Then** I receive:
- Status: 429 Too Many Requests
- Response:
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Limit: 1000 requests/hour.",
    "retryAfter": 3600,
    "docs": "https://docs.advert.app/api/rate-limits"
  }
}
```
**And** response headers include:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1643990400
```

**Given** I make a request with insufficient permissions
**When** I call `DELETE /api/v1/strategies/strat_123` with a key without `strategies:delete` permission
**Then** I receive:
- Status: 403 Forbidden
- Response:
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "API key lacks required permission: strategies:delete",
    "docs": "https://docs.advert.app/api/permissions"
  }
}
```

**Given** I want to explore the API
**When** I navigate to `https://api.advert.app/docs`
**Then** I see interactive API documentation (Swagger UI)
**And** I can:
- Browse all endpoints
- View request/response schemas
- Test endpoints with my API key
- Download OpenAPI specification (YAML/JSON)

**Given** I use API versioning
**When** I call `GET /api/v1/strategies`
**Then** I access API version 1
**And** if I call `GET /api/v2/strategies` (future version)
**Then** I access API version 2 with potentially different response schemas
**And** version 1 remains supported for backwards compatibility

**Given** the feature is implemented
**When** I review technical details
**Then** API endpoints are implemented:
- `GET /api/v1/strategies` - List strategies
- `GET /api/v1/strategies/:id` - Get single strategy
- `POST /api/v1/strategies` - Create strategy
- `PATCH /api/v1/strategies/:id` - Update strategy
- `DELETE /api/v1/strategies/:id` - Delete strategy
- `GET /api/v1/analytics/strategy/:id` - Get analytics
- `POST /api/v1/pillars` - Create pillar
- `PATCH /api/v1/pillars/:id` - Update pillar
- `GET /api/v1/team/members` - List team members
- `POST /api/v1/team/invite` - Invite member

**And** middleware layers:
1. API key validation (checks keyHash in database)
2. Permission verification (checks key permissions against endpoint)
3. Rate limiting (Redis-based, per-tenant, per-tier)
4. Request logging (track usage for analytics)
5. Error handling (standardized error responses)

**And** OpenAPI specification is generated from tRPC schema
**And** API documentation is auto-deployed to `api.advert.app/docs`

---

### Story 12.3: SDK Development (JavaScript/Python)

As a **developer integrating ADVERT into our application**,
I want **to use official SDKs (JavaScript/Python) for easy integration**,
So that **I can interact with ADVERT APIs with type-safe, idiomatic code**.

**Acceptance Criteria:**

**Given** I want to use the JavaScript SDK
**When** I install the package
**Then** I run:
```bash
npm install @advert/sdk
# or
yarn add @advert/sdk
```

**Given** I initialize the JavaScript SDK
**When** I import and configure it
**Then** I use:
```javascript
import { Advert } from '@advert/sdk';

const advert = new Advert({
  apiKey: process.env.ADVERT_API_KEY,
  // Optional config:
  environment: 'production', // or 'sandbox'
  timeout: 30000, // 30 seconds
  retries: 3,
});
```

**Given** I want to list strategies
**When** I call the SDK method
**Then** I use:
```javascript
const strategies = await advert.strategies.list({
  page: 1,
  pageSize: 10,
  status: 'ACTIVE',
});

console.log(strategies.data); // Array of strategies
console.log(strategies.meta.total); // Total count
```

**Given** I want to retrieve a single strategy
**When** I call the SDK method
**Then** I use:
```javascript
const strategy = await advert.strategies.get('strat_123');

console.log(strategy.brandName); // "Zahra Fashion House"
console.log(strategy.pillars.length); // 6
```

**Given** I want to create a strategy
**When** I call the SDK method
**Then** I use:
```javascript
const newStrategy = await advert.strategies.create({
  brandName: "Kweku's Coffee",
  industry: "Food & Beverage",
  audienceAge: "30-50",
  audienceDescription: "Urban professionals seeking premium African coffee"
});

console.log(newStrategy.id); // "strat_789"
```

**Given** I want to update a strategy
**When** I call the SDK method
**Then** I use:
```javascript
const updated = await advert.strategies.update('strat_123', {
  brandName: "Zahra Fashion House (Rebranded)"
});
```

**Given** I want to delete a strategy
**When** I call the SDK method
**Then** I use:
```javascript
await advert.strategies.delete('strat_123');
```

**Given** I want to access analytics
**When** I call the SDK method
**Then** I use:
```javascript
const analytics = await advert.analytics.getStrategyMetrics('strat_123');

console.log(analytics.totalViews); // 1542
console.log(analytics.exportCount); // 23
```

**Given** I handle SDK errors
**When** an API error occurs
**Then** the SDK throws typed errors:
```javascript
try {
  await advert.strategies.get('invalid_id');
} catch (error) {
  if (error instanceof Advert.NotFoundError) {
    console.error('Strategy not found');
  } else if (error instanceof Advert.AuthenticationError) {
    console.error('Invalid API key');
  } else if (error instanceof Advert.RateLimitError) {
    console.error('Rate limit exceeded, retry after:', error.retryAfter);
  }
}
```

**Given** I want to use TypeScript
**When** I import the SDK
**Then** I get full type definitions:
```typescript
import { Advert, Strategy, Pillar } from '@advert/sdk';

const advert = new Advert({ apiKey: process.env.ADVERT_API_KEY! });

const strategy: Strategy = await advert.strategies.get('strat_123');
const pillar: Pillar = strategy.pillars[0];
```

**Given** I want to use the Python SDK
**When** I install the package
**Then** I run:
```bash
pip install advert-sdk
```

**Given** I initialize the Python SDK
**When** I import and configure it
**Then** I use:
```python
from advert import Advert

advert = Advert(
    api_key=os.environ["ADVERT_API_KEY"],
    environment="production",  # or "sandbox"
    timeout=30,
    retries=3
)
```

**Given** I want to list strategies (Python)
**When** I call the SDK method
**Then** I use:
```python
strategies = advert.strategies.list(page=1, page_size=10, status="ACTIVE")

print(strategies["data"])  # List of strategies
print(strategies["meta"]["total"])  # Total count
```

**Given** I want to create a strategy (Python)
**When** I call the SDK method
**Then** I use:
```python
new_strategy = advert.strategies.create(
    brand_name="Kweku's Coffee",
    industry="Food & Beverage",
    audience_age="30-50",
    audience_description="Urban professionals seeking premium African coffee"
)

print(new_strategy["id"])  # "strat_789"
```

**Given** I handle SDK errors (Python)
**When** an API error occurs
**Then** the SDK raises typed exceptions:
```python
from advert.exceptions import NotFoundError, AuthenticationError, RateLimitError

try:
    strategy = advert.strategies.get("invalid_id")
except NotFoundError:
    print("Strategy not found")
except AuthenticationError:
    print("Invalid API key")
except RateLimitError as e:
    print(f"Rate limit exceeded, retry after: {e.retry_after}")
```

**Given** I want to use type hints (Python)
**When** I import the SDK
**Then** I get type stubs:
```python
from advert import Advert
from advert.types import Strategy, Pillar

advert = Advert(api_key=os.environ["ADVERT_API_KEY"])

strategy: Strategy = advert.strategies.get("strat_123")
pillar: Pillar = strategy["pillars"][0]
```

**Given** I want SDK documentation
**When** I visit `https://docs.advert.app/sdk`
**Then** I see comprehensive SDK docs:
- Installation guides
- Authentication setup
- Code examples for all methods
- Type definitions reference
- Error handling guide
- Best practices

**Given** I want to contribute to the SDK
**When** I visit the GitHub repository
**Then** I see:
- JavaScript SDK: `github.com/advert-app/advert-js`
- Python SDK: `github.com/advert-app/advert-python`
- Open issues, contribution guidelines, CI/CD pipelines

**Given** the feature is implemented
**When** I review technical details
**Then** SDK packages are published:
- **JavaScript**: `@advert/sdk` on npm
- **Python**: `advert-sdk` on PyPI

**And** SDK features:
- Auto-generated from OpenAPI spec (ensures API parity)
- TypeScript definitions included
- Python type stubs (PEP 561)
- Automatic retries with exponential backoff
- Request timeouts
- Error handling with typed exceptions
- Rate limit handling (automatic retry-after)
- Environment support (production/sandbox)
- Logging/debugging support

**And** CI/CD pipeline:
- Unit tests (Jest for JS, pytest for Python)
- Integration tests against sandbox API
- Type checking (tsc, mypy)
- Linting (ESLint, Ruff)
- Auto-publish on version tag push

---

### Story 12.4: Webhook Configuration and Delivery

As a **developer building real-time integrations**,
I want **to configure webhooks to receive real-time event notifications from ADVERT**,
So that **my application can react to changes (strategy.generated, pillar.updated) without polling**.

**Acceptance Criteria:**

**Given** I am an Enterprise user
**When** I navigate to `/settings/integrations/webhooks`
**Then** I see the Webhooks management page
**And** the page displays:
- Page title: "Webhooks"
- Description: "Receive real-time event notifications via HTTP POST requests"
- Enterprise tier badge
- "Add Webhook Endpoint" button
- Table of existing webhooks (if any)

**Given** I click "Add Webhook Endpoint"
**When** the webhook creation modal opens
**Then** I see a form:
- **Endpoint URL** (required): `https://api.myapp.com/webhooks/advert`
  - Must be HTTPS (HTTP not allowed for security)
  - Validated format
- **Description** (optional): "Production webhook for strategy events"
- **Events to listen for** (checkboxes):
  - ☑ strategy.generated
  - ☑ strategy.updated
  - ☑ strategy.deleted
  - ☐ pillar.created
  - ☑ pillar.updated
  - ☐ pillar.deleted
  - ☐ export.completed
  - ☐ analytics.daily_summary
- **Secret** (auto-generated): `whsec_a1b2c3d4e5f6g7h8` (for signature verification)
  - "Regenerate Secret" button
- "Add Webhook" button

**Given** I fill in:
- Endpoint URL: `https://api.myapp.com/webhooks/advert`
- Events: strategy.generated, strategy.updated, pillar.updated
**And** I click "Add Webhook"
**Then** the webhook is created
**And** I see a confirmation modal:
- "Webhook Added Successfully"
- Endpoint URL displayed
- **Signing secret**: `whsec_a1b2c3d4e5f6g7h8` (copy button)
- Warning: "Save this secret securely. Use it to verify webhook signatures."
- "View Documentation" link
- "Done" button

**Given** the webhook is active
**When** I view the webhooks table
**Then** I see:
- **Endpoint**: `https://api.myapp.com/webhooks/advert`
- **Events**: "strategy.generated, strategy.updated, +1 more"
- **Status**: "Active" (green badge)
- **Last delivery**: "2026-02-05 14:45 UTC" or "Never"
- **Success rate**: "98.5% (197/200)" (last 200 attempts)
- **Actions**: "Edit", "Test", "View Logs", "Delete"

**Given** an event occurs
**When** a strategy is generated (event: `strategy.generated`)
**Then** ADVERT sends an HTTP POST request to my webhook endpoint:
```
POST https://api.myapp.com/webhooks/advert
Content-Type: application/json
X-Advert-Signature: t=1643990400,v1=5f8d7e6c4b3a2f1e0d9c8b7a6f5e4d3c2b1a
X-Advert-Event: strategy.generated
X-Advert-Delivery-ID: evt_del_123456
```

**Body:**
```json
{
  "id": "evt_123456",
  "type": "strategy.generated",
  "tenantId": "tenant_789",
  "occurredAt": "2026-02-05T14:45:30Z",
  "data": {
    "strategy": {
      "id": "strat_123",
      "brandName": "Zahra Fashion House",
      "industry": "Fashion & Apparel",
      "status": "ACTIVE",
      "createdAt": "2026-02-05T14:45:30Z"
    }
  }
}
```

**Given** I receive a webhook
**When** I want to verify its authenticity
**Then** I validate the `X-Advert-Signature` header:
1. Extract timestamp `t` and signature `v1` from header
2. Construct signed payload: `{t}.{requestBody}`
3. Compute HMAC-SHA256: `HMAC_SHA256(signingSecret, signedPayload)`
4. Compare computed signature with `v1`
5. Verify timestamp is within 5 minutes (prevent replay attacks)

**Example verification (JavaScript):**
```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const [tPart, v1Part] = signature.split(',');
  const timestamp = tPart.split('=')[1];
  const receivedSignature = v1Part.split('=')[1];

  const signedPayload = `${timestamp}.${payload}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');

  // Verify signature
  if (receivedSignature !== expectedSignature) {
    throw new Error('Invalid signature');
  }

  // Verify timestamp (within 5 minutes)
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(timestamp)) > 300) {
    throw new Error('Timestamp too old');
  }

  return true;
}
```

**Given** my webhook endpoint returns a non-200 status
**When** ADVERT delivers a webhook
**And** I return 500 Internal Server Error
**Then** ADVERT retries the webhook:
- Retry 1: After 5 seconds
- Retry 2: After 30 seconds
- Retry 3: After 2 minutes
- Retry 4: After 10 minutes
- Retry 5: After 1 hour
- Retry 6: After 6 hours (final attempt)

**And** each retry includes:
- `X-Advert-Retry-Count: 2` (header)
- Same `X-Advert-Delivery-ID` (idempotency)

**Given** my webhook endpoint fails all retries
**When** the 6th retry fails
**Then** the webhook status changes to "Failing" (yellow badge)
**And** I receive an email notification:
- "Webhook delivery failing: https://api.myapp.com/webhooks/advert"
- "We've attempted 6 deliveries over 8 hours without success."
- "Check your endpoint and logs."
- Link to webhook logs

**Given** I want to test my webhook
**When** I click "Test" on a webhook
**Then** I see a test modal:
- "Test Webhook"
- Event selector: "strategy.generated" (dropdown)
- "Send Test Event" button

**And** clicking "Send Test Event" triggers a test webhook delivery
**And** I see the result:
- Success: "Test webhook delivered successfully (200 OK, 145ms)"
- Failure: "Test webhook failed (500 Internal Server Error, 2.3s)"

**Given** I want to view webhook logs
**When** I click "View Logs" on a webhook
**Then** I see a logs page:
- Table of recent deliveries (last 100)
- Columns: Delivery ID, Event, Status (Success/Failed), Response Code, Response Time, Timestamp
- Filter by: Event type, Status, Date range
- Each row expandable to show:
  - Request body sent
  - Response received
  - Retry attempts (if any)

**Given** I want to disable a webhook temporarily
**When** I click "Edit" on a webhook
**And** I toggle "Active" switch to OFF
**Then** the webhook is disabled
**And** no events are delivered until I re-enable it

**Given** I want to delete a webhook
**When** I click "Delete" on a webhook
**Then** I see a confirmation modal:
- "Delete Webhook?"
- "You will no longer receive events at this endpoint."
- "Cancel" / "Delete" buttons

**And** confirming deletion removes the webhook
**And** no future events are delivered

**Given** I review supported events
**When** I view the webhooks documentation
**Then** I see all event types:
- `strategy.generated` - New strategy created
- `strategy.updated` - Strategy edited
- `strategy.deleted` - Strategy deleted
- `pillar.created` - New pillar added
- `pillar.updated` - Pillar modified
- `pillar.deleted` - Pillar removed
- `export.completed` - Export (PDF/PPTX) generated
- `analytics.daily_summary` - Daily analytics report
- `team.member_invited` - Team member added
- `team.member_removed` - Team member removed

**Given** the feature is implemented
**When** I review technical details
**Then** database model:
```prisma
model Webhook {
  id          String   @id @default(cuid())
  tenantId    String
  url         String   // HTTPS endpoint
  description String?
  events      String[] // ["strategy.generated", "pillar.updated"]
  secret      String   // Signing secret (hashed)
  status      WebhookStatus // ACTIVE, DISABLED, FAILING
  lastDeliveryAt DateTime?
  successRate Float?   // Rolling 200 deliveries
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  deliveries  WebhookDelivery[]
  @@index([tenantId, status])
}

model WebhookDelivery {
  id            String   @id @default(cuid())
  webhookId     String
  eventId       String
  eventType     String
  payload       Json
  responseCode  Int?
  responseBody  String?  @db.Text
  responseTime  Int?     // milliseconds
  retryCount    Int      @default(0)
  status        DeliveryStatus // PENDING, SUCCESS, FAILED
  deliveredAt   DateTime @default(now())
  webhook       Webhook  @relation(fields: [webhookId], references: [id], onDelete: Cascade)
  @@index([webhookId, status])
  @@index([eventId]) // For idempotency
}

enum WebhookStatus {
  ACTIVE
  DISABLED
  FAILING
}

enum DeliveryStatus {
  PENDING
  SUCCESS
  FAILED
}
```

**And** webhook delivery via Inngest:
- Event emitted: `webhooks/deliver`
- Inngest function handles retries with exponential backoff
- Signature generation using HMAC-SHA256
- Delivery tracking in `WebhookDelivery` table

---

### Story 12.5: API Usage Analytics Dashboard

As an **Enterprise user with API access**,
I want **to view API usage analytics and rate limit status**,
So that **I can monitor consumption, optimize usage, and avoid hitting rate limits**.

**Acceptance Criteria:**

**Given** I am an Enterprise user
**When** I navigate to `/settings/integrations/api-usage`
**Then** I see the API Usage Analytics dashboard
**And** the page displays:
- Page title: "API Usage & Analytics"
- Description: "Monitor API consumption, track endpoint usage, and view rate limit status"
- Enterprise tier badge

**Given** I view the dashboard
**When** the page loads
**Then** I see key metrics cards:

1. **Current Period Usage** (card):
   - Total requests: 42,573
   - Time period: "This month (Feb 1-5, 2026)"
   - Trend: +12% vs last month (sparkline chart)
   - Color: Green (healthy)

2. **Rate Limit Status** (card):
   - Current tier: "Enterprise (10,000 req/hour)"
   - Hourly usage: "1,247 / 10,000" (12.5% used)
   - Progress bar (green)
   - Next reset: "in 42 minutes"

3. **Success Rate** (card):
   - Success: 98.7% (42,021 requests)
   - Errors: 1.3% (552 requests)
   - Pie chart visualization

4. **Top Endpoints** (card):
   - 1. `GET /api/v1/strategies` - 18,432 calls (43%)
   - 2. `GET /api/v1/analytics/strategy/:id` - 9,214 calls (22%)
   - 3. `POST /api/v1/strategies` - 6,127 calls (14%)
   - 4. `PATCH /api/v1/pillars/:id` - 4,890 calls (11%)
   - 5. Other - 3,910 calls (10%)

**Given** I view the usage graph
**When** I scroll down
**Then** I see a time-series chart:
- X-axis: Time (hourly buckets for 24h view, daily for 30d view)
- Y-axis: Request count
- Line graph showing request volume over time
- Color-coded: Success (green), Client errors 4xx (yellow), Server errors 5xx (red)
- Time range selector: "24 hours", "7 days", "30 days", "90 days"

**Given** I select "7 days" view
**When** I click "7 days"
**Then** the chart updates to show daily request counts for the last 7 days

**Given** I view endpoint breakdown
**When** I scroll to "Endpoint Usage" table
**Then** I see a detailed table:
- Columns: Endpoint, Method, Total Calls, Success Rate, Avg Response Time, Last Called
- Sortable by any column
- Example rows:
  - `GET /api/v1/strategies`, 18,432 calls, 99.2%, 142ms, 2 mins ago
  - `POST /api/v1/strategies`, 6,127 calls, 97.8%, 1,230ms, 15 mins ago
  - `GET /api/v1/analytics/strategy/:id`, 9,214 calls, 98.9%, 87ms, 1 min ago

**Given** I view error breakdown
**When** I scroll to "Error Analysis" section
**Then** I see:
- **Error Distribution** (table):
  - 401 Unauthorized: 312 occurrences (56%)
  - 403 Forbidden: 128 occurrences (23%)
  - 404 Not Found: 89 occurrences (16%)
  - 429 Rate Limit Exceeded: 14 occurrences (2.5%)
  - 500 Internal Server Error: 9 occurrences (1.6%)
- Each error row expandable to show:
  - Recent examples (timestamps, endpoints affected)
  - Suggested fixes

**Given** I view rate limit history
**When** I scroll to "Rate Limit Events" section
**Then** I see:
- "Rate Limit Exceeded" events (if any)
- Table: Timestamp, API Key, Requests Made, Limit, Retry After
- Example: "2026-02-04 18:32 UTC, adv_live_...o5p6, 10,015 req/hour, 10,000 limit, Retry after 28 min"
- Warning: "You hit rate limits 3 times this month. Consider upgrading or optimizing usage."

**Given** I view usage by API key
**When** I scroll to "Usage by API Key" section
**Then** I see a breakdown:
- Table: API Key (masked), Name, Total Calls, Success Rate, Last Used
- Example rows:
  - `adv_live_...o5p6`, "Production API Key", 38,421 calls, 98.9%, 5 mins ago
  - `adv_live_...z3x1`, "Dev Sandbox Key", 4,152 calls, 96.2%, 2 hours ago
- Click on a key to filter all dashboard views by that key

**Given** I want to filter the dashboard
**When** I use the filter controls at the top
**Then** I can filter by:
- **Date range**: Last 24 hours, 7 days, 30 days, custom range
- **API key**: All keys, specific key
- **Endpoint**: All endpoints, specific endpoint
- **Status**: All, Success only, Errors only

**Given** I apply filters
**When** I select:
- Date range: Last 7 days
- API key: "Production API Key"
- Status: Errors only
**Then** all dashboard sections update to show only error requests from that key in the last 7 days

**Given** I want to export usage data
**When** I click "Export Data" button
**Then** I see export options:
- Format: CSV, JSON
- Data: "All usage data for current filters"
- "Download" button

**And** clicking "Download" generates a file:
- CSV: `api-usage-2026-02-05.csv` with columns: Timestamp, Endpoint, Method, Status, Response Time, API Key
- JSON: `api-usage-2026-02-05.json` with structured data

**Given** I receive usage alerts
**When** I hit 80% of my hourly rate limit
**Then** I receive an email notification:
- "API Rate Limit Warning - 80% Used"
- "You've made 8,000 of 10,000 allowed requests this hour."
- "Next reset: in 15 minutes"
- Link to API Usage dashboard

**Given** I hit 100% of my rate limit
**When** I exceed 10,000 requests/hour
**Then** I receive an email:
- "API Rate Limit Exceeded"
- "Your API key has been temporarily throttled."
- "Requests will resume in 42 minutes."
- "Consider optimizing API usage or contact sales to increase limits."

**Given** I want to set custom alerts
**When** I navigate to `/settings/integrations/api-alerts`
**Then** I can configure:
- Alert threshold: 75%, 85%, 95%
- Notification channel: Email, Webhook
- Recipients: My email, team emails

**Given** the feature is implemented
**When** I review technical details
**Then** API usage tracking:
- Every API request logged to `ApiRequestLog` table (or time-series DB like TimescaleDB)
- Aggregations computed daily via Inngest job
- Dashboard queries use materialized views for performance
- Real-time rate limit tracking via Redis

**And** database model:
```prisma
model ApiRequestLog {
  id            String   @id @default(cuid())
  tenantId      String
  apiKeyId      String
  endpoint      String
  method        String
  statusCode    Int
  responseTime  Int      // milliseconds
  errorCode     String?
  timestamp     DateTime @default(now())
  @@index([tenantId, timestamp])
  @@index([apiKeyId, timestamp])
  @@index([endpoint, timestamp])
}

model ApiUsageAggregate {
  id            String   @id @default(cuid())
  tenantId      String
  apiKeyId      String?
  date          DateTime @db.Date
  totalRequests Int
  successCount  Int
  errorCount    Int
  avgResponseTime Float
  @@unique([tenantId, apiKeyId, date])
  @@index([tenantId, date])
}
```

---

### Story 12.6: Zoho CRM Integration

As a **brand manager using Zoho CRM**,
I want **to connect my Zoho CRM account to sync contacts and link strategies to CRM contacts**,
So that **I can manage brand relationships in Zoho while creating strategies in ADVERT**.

**Acceptance Criteria:**

**Given** I want to connect Zoho CRM
**When** I navigate to `/settings/integrations/third-party`
**Then** I see the Third-Party Integrations page
**And** I see available integrations:
- **Zoho CRM** (card with logo)
  - Description: "Sync contacts and link strategies to Zoho CRM accounts"
  - Status: "Not connected"
  - "Connect" button
- **HubSpot** (card)
- **Monday.com** (card)
- **Asana** (card)

**Given** I click "Connect" on Zoho CRM
**When** the OAuth flow begins
**Then** I am redirected to Zoho OAuth consent screen:
- "ADVERT would like to access your Zoho CRM"
- Permissions requested:
  - Read contacts
  - Read accounts
  - Write notes
- "Allow" / "Deny" buttons

**Given** I click "Allow"
**When** Zoho redirects back to ADVERT
**Then** I return to `/settings/integrations/third-party?success=zoho`
**And** Zoho CRM card now shows:
- Status: "Connected" (green badge)
- Connected account: "mycompany.zohocrm.com"
- "Sync Now" button
- "Configure" button
- "Disconnect" button

**Given** the integration is connected
**When** I click "Configure"
**Then** I see configuration modal:
- **Sync Settings**:
  - ☑ Auto-sync contacts to ADVERT (every 6 hours)
  - ☐ Create Zoho notes when strategy is generated
  - ☐ Update Zoho account when strategy is updated
- **Field Mapping**:
  - ADVERT Brand Name → Zoho Account Name
  - ADVERT Industry → Zoho Industry field
  - ADVERT Contact Email → Zoho Contact Email
- "Save Configuration" button

**Given** I enable auto-sync
**And** I click "Save Configuration"
**Then** the configuration is saved
**And** an Inngest background job is scheduled:
- Job: `integrations/zoho/sync-contacts`
- Frequency: Every 6 hours

**Given** the first sync runs
**When** the Inngest job executes
**Then** ADVERT:
1. Fetches contacts from Zoho CRM via Zoho API
2. For each Zoho contact:
   - Checks if contact exists in ADVERT (match by email)
   - If exists: Updates contact details
   - If not: Creates new contact in ADVERT
3. Stores Zoho contact ID for reference

**Given** I create a new strategy in ADVERT
**When** I fill in the strategy form
**Then** I see a "Link to Zoho CRM" section:
- Dropdown: "Select Zoho Account"
- Options: List of Zoho accounts (fetched from Zoho API)
  - "Zahra Fashion House"
  - "Kweku's Coffee"
  - "Ama's Boutique"
- Select: "Zahra Fashion House"

**And** when I generate the strategy
**Then** the strategy is linked to the Zoho account
**And** the link is stored in the database:
```prisma
model Integration {
  id              String   @id @default(cuid())
  tenantId        String
  provider        IntegrationProvider // ZOHO, HUBSPOT, MONDAY, ASANA
  accessToken     String   @db.Text // Encrypted
  refreshToken    String?  @db.Text // Encrypted
  expiresAt       DateTime?
  config          Json     // Provider-specific config
  status          IntegrationStatus // CONNECTED, DISCONNECTED, ERROR
  lastSyncAt      DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  tenant          Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  linkedResources IntegrationLink[]
  @@unique([tenantId, provider])
}

model IntegrationLink {
  id             String   @id @default(cuid())
  integrationId  String
  resourceType   String   // STRATEGY, PILLAR
  resourceId     String   // Strategy or Pillar ID
  externalId     String   // Zoho Account ID, HubSpot Deal ID, etc.
  externalUrl    String?  // Link to external resource
  metadata       Json?
  createdAt      DateTime @default(now())
  integration    Integration @relation(fields: [integrationId], references: [id], onDelete: Cascade)
  @@unique([integrationId, resourceType, resourceId])
  @@index([resourceType, resourceId])
}

enum IntegrationProvider {
  ZOHO
  HUBSPOT
  MONDAY
  ASANA
}

enum IntegrationStatus {
  CONNECTED
  DISCONNECTED
  ERROR
}
```

**Given** I configured "Create Zoho notes when strategy is generated"
**When** I generate a strategy linked to a Zoho account
**Then** ADVERT creates a note in Zoho CRM:
- Zoho Account: "Zahra Fashion House"
- Note title: "ADVERT Strategy Generated"
- Note content:
  ```
  A new ADVERT strategy has been generated for Zahra Fashion House.

  Strategy: 6-Pillar Marketing Strategy
  Industry: Fashion & Apparel
  Target Audience: Women 25-40, fashion-conscious professionals

  View in ADVERT: https://advert.app/strategies/strat_123
  ```
- Created via Zoho API: `POST /crm/v2/Notes`

**Given** I click "Sync Now"
**When** I manually trigger a sync
**Then** ADVERT immediately runs the sync job
**And** I see a toast notification: "Syncing Zoho contacts... This may take a few minutes."
**And** when complete: "Zoho sync completed. 42 contacts synced."

**Given** I view a strategy linked to Zoho
**When** I open the strategy detail page
**Then** I see a "Zoho CRM" badge:
- Badge: "Zoho CRM" with logo
- Hover tooltip: "Linked to Zahra Fashion House"
- Click opens: "View in Zoho CRM" (external link to Zoho account page)

**Given** the Zoho access token expires
**When** ADVERT attempts a sync
**And** receives 401 Unauthorized from Zoho
**Then** ADVERT:
1. Uses refresh token to obtain new access token (OAuth 2.0 refresh flow)
2. Retries the sync
3. If refresh fails: Sets integration status to ERROR
4. Sends email notification: "Zoho CRM integration requires re-authentication"

**Given** I want to disconnect Zoho
**When** I click "Disconnect" on Zoho CRM card
**Then** I see confirmation modal:
- "Disconnect Zoho CRM?"
- "Existing links to Zoho accounts will be preserved, but no new syncs will occur."
- "Cancel" / "Disconnect" buttons

**And** confirming disconnection:
- Integration status set to DISCONNECTED
- Auto-sync jobs cancelled
- Access tokens revoked (if possible via Zoho API)
- Toast notification: "Zoho CRM disconnected"

---

### Story 12.7: HubSpot Campaign Sync Integration

As a **marketing manager using HubSpot**,
I want **to sync ADVERT strategies to HubSpot as campaign plans**,
So that **I can manage campaigns in HubSpot while keeping strategy details in ADVERT**.

**Acceptance Criteria:**

**Given** I want to connect HubSpot
**When** I navigate to `/settings/integrations/third-party`
**And** I click "Connect" on HubSpot card
**Then** I am redirected to HubSpot OAuth consent screen:
- "ADVERT would like to access your HubSpot"
- Permissions: Read/write campaigns, contacts, deals
- "Allow" / "Deny"

**Given** I authorize HubSpot
**When** I click "Allow"
**Then** I return to ADVERT with HubSpot connected
**And** HubSpot card shows:
- Status: "Connected"
- Connected portal: "MyCompany (12345678)"
- "Sync Now", "Configure", "Disconnect" buttons

**Given** I configure HubSpot sync
**When** I click "Configure"
**Then** I see configuration options:
- **Auto-sync strategies to HubSpot**:
  - ☑ Create HubSpot campaign when strategy is generated
  - ☑ Update HubSpot campaign when strategy is updated
  - ☐ Create HubSpot deals for each pillar
- **Campaign Settings**:
  - Campaign name format: `[Brand Name] - ADVERT Strategy`
  - Campaign type: "Marketing Campaign"
- "Save Configuration"

**Given** I generate a new strategy in ADVERT
**And** HubSpot integration is active with "Create campaign" enabled
**When** the strategy is generated
**Then** ADVERT creates a HubSpot campaign:
- Campaign name: "Zahra Fashion House - ADVERT Strategy"
- Campaign type: "Marketing Campaign"
- Description:
  ```
  6-Pillar ADVERT Marketing Strategy

  Industry: Fashion & Apparel
  Target Audience: Women 25-40, fashion-conscious professionals

  Pillars:
  1. Heritage Craftsmanship
  2. Sustainable Fashion
  3. Community & Culture
  4. Modern Design
  5. Digital Storytelling
  6. Customer Experience

  View full strategy: https://advert.app/strategies/strat_123
  ```
- Created via HubSpot API: `POST /marketing/v3/marketing-events`

**And** the campaign link is stored:
```
IntegrationLink:
  integrationId: "hubspot_integration_id"
  resourceType: "STRATEGY"
  resourceId: "strat_123"
  externalId: "hubspot_campaign_456"
  externalUrl: "https://app.hubspot.com/campaigns/12345678/456"
```

**Given** I update a strategy in ADVERT
**And** the strategy is linked to a HubSpot campaign
**When** I save changes (e.g., update brand name, add pillar)
**Then** ADVERT updates the HubSpot campaign:
- Campaign name updated (if brand name changed)
- Description updated with new pillar details
- Updated via HubSpot API: `PATCH /marketing/v3/marketing-events/{eventId}`

**Given** I view a strategy linked to HubSpot
**When** I open the strategy detail page
**Then** I see a "HubSpot" badge:
- Badge: "HubSpot" with logo
- Hover: "Synced as campaign: Zahra Fashion House - ADVERT Strategy"
- Click: Opens HubSpot campaign in new tab

**Given** I enable "Create HubSpot deals for each pillar"
**When** I generate a strategy with 6 pillars
**Then** ADVERT creates 6 HubSpot deals:
- Deal 1: "Zahra Fashion House - Pillar 1: Heritage Craftsmanship"
- Deal 2: "Zahra Fashion House - Pillar 2: Sustainable Fashion"
- ... (one deal per pillar)
- Each deal includes:
  - Amount: Estimated budget (if available)
  - Stage: "Strategy Planning"
  - Description: Big Idea, tactics, KPIs
  - Associated campaign: The main strategy campaign

**And** deals are linked:
```
IntegrationLink (per pillar):
  resourceType: "PILLAR"
  resourceId: "pillar_123"
  externalId: "hubspot_deal_789"
```

**Given** I manually push a strategy to HubSpot
**When** I click "Push to HubSpot" button on strategy page
**Then** the strategy is synced to HubSpot (creates or updates campaign)
**And** I see confirmation: "Strategy synced to HubSpot successfully"

**Given** I disconnect HubSpot
**When** I click "Disconnect"
**Then** existing links are preserved (read-only)
**And** no new syncs occur
**And** I can reconnect later to resume syncing

---

### Story 12.8: Monday.com and Asana Project Integration

As a **project manager using Monday.com or Asana**,
I want **to auto-create project boards/tasks from ADVERT strategies**,
So that **I can execute strategy pillars and tactics as trackable project tasks**.

**Acceptance Criteria:**

**Given** I want to connect Monday.com
**When** I navigate to `/settings/integrations/third-party`
**And** I click "Connect" on Monday.com card
**Then** I go through Monday.com OAuth flow
**And** upon success, Monday.com card shows "Connected"

**Given** I configure Monday.com
**When** I click "Configure" on Monday.com
**Then** I see options:
- **Auto-create boards**:
  - ☑ Create Monday.com board when strategy is generated
  - Board name format: `[Brand Name] Marketing Strategy`
- **Board structure**:
  - ☑ Create groups for each pillar
  - ☑ Create items for each tactic
  - ☐ Assign team members automatically
- "Save Configuration"

**Given** I generate a strategy with Monday.com enabled
**When** the strategy is generated
**Then** ADVERT creates a Monday.com board:
- Board name: "Zahra Fashion House Marketing Strategy"
- Groups (one per pillar):
  - Group 1: "Pillar 1: Heritage Craftsmanship"
  - Group 2: "Pillar 2: Sustainable Fashion"
  - ... (6 groups total)
- Items within each group (one per tactic):
  - Item: "Launch behind-the-scenes content series"
  - Item: "Partner with local artisans for co-creation"
  - ... (tactics from ADVERT)
- Each item includes:
  - Status column: "Not Started"
  - Owner column: Empty (can be assigned)
  - Due date column: Empty (can be set)
  - Notes: Big Idea, tactics, KPIs from ADVERT

**And** board is created via Monday.com API:
```
POST https://api.monday.com/v2
{
  "query": "mutation { create_board (board_name: \"Zahra Fashion House Marketing Strategy\", board_kind: public) { id } }"
}
```

**And** the board link is stored:
```
IntegrationLink:
  resourceType: "STRATEGY"
  resourceId: "strat_123"
  externalId: "monday_board_456"
  externalUrl: "https://myworkspace.monday.com/boards/456"
```

**Given** I view a strategy linked to Monday.com
**When** I open the strategy page
**Then** I see a "Monday.com" badge with link to the board

**Given** I want to connect Asana
**When** I click "Connect" on Asana card
**Then** I go through Asana OAuth flow
**And** upon success, Asana card shows "Connected"

**Given** I configure Asana
**When** I click "Configure" on Asana
**Then** I see options:
- **Auto-create projects**:
  - ☑ Create Asana project when strategy is generated
  - Project name format: `[Brand Name] Marketing Strategy`
- **Project structure**:
  - ☑ Create sections for each pillar
  - ☑ Create tasks for each tactic
  - ☑ Set due dates from ADVERT timeline (if available)
- "Save Configuration"

**Given** I generate a strategy with Asana enabled
**When** the strategy is generated
**Then** ADVERT creates an Asana project:
- Project name: "Zahra Fashion House Marketing Strategy"
- Sections (one per pillar):
  - "Pillar 1: Heritage Craftsmanship"
  - "Pillar 2: Sustainable Fashion"
  - ... (6 sections)
- Tasks within each section:
  - Task: "Launch behind-the-scenes content series"
  - Task: "Partner with local artisans for co-creation"
  - ... (tactics from ADVERT)
- Each task includes:
  - Description: Big Idea, tactics, KPIs
  - Due date: (if timeline available)
  - Assignee: Unassigned (can be assigned later)

**And** project is created via Asana API:
```
POST https://app.asana.com/api/1.0/projects
{
  "name": "Zahra Fashion House Marketing Strategy",
  "workspace": "workspace_id",
  "notes": "6-Pillar ADVERT Marketing Strategy. View in ADVERT: https://advert.app/strategies/strat_123"
}
```

**And** the project link is stored:
```
IntegrationLink:
  resourceType: "STRATEGY"
  resourceId: "strat_123"
  externalId: "asana_project_789"
  externalUrl: "https://app.asana.com/0/789/..."
```

**Given** I update a strategy
**And** it's linked to Monday.com or Asana
**When** I add a new tactic to a pillar
**Then** ADVERT creates a new item/task in the linked board/project
**And** the new tactic appears in the correct group/section

**Given** I delete a strategy
**And** it's linked to Monday.com or Asana
**When** I confirm deletion
**Then** ADVERT does NOT delete the external board/project (preserves work done)
**And** the link is removed from ADVERT
**And** I see a warning: "This strategy is linked to a Monday.com board. The board will not be deleted."

---

### Story 12.9: Integration Management and Disconnection

As a **user managing multiple integrations**,
I want **to view all connected integrations, monitor their status, and disconnect them when needed**,
So that **I can maintain control over third-party access and troubleshoot issues**.

**Acceptance Criteria:**

**Given** I navigate to `/settings/integrations`
**When** the page loads
**Then** I see an integrations overview:
- **API & Webhooks** section:
  - API Keys: "3 active keys"
  - Webhooks: "2 active endpoints"
  - API Usage: "42,573 requests this month"
  - Links to respective pages
- **Third-Party Integrations** section:
  - Connected: 3 (Zoho, HubSpot, Monday.com)
  - Available: 1 (Asana)
  - "Manage Integrations" button

**Given** I click "Manage Integrations"
**When** I navigate to `/settings/integrations/third-party`
**Then** I see all available integrations:
- **Connected Integrations** (top section):
  - Zoho CRM: Connected (green), Last sync: 2 hours ago, "Configure" / "Disconnect"
  - HubSpot: Connected (green), Last sync: 1 hour ago, "Configure" / "Disconnect"
  - Monday.com: Connected (green), Last sync: 3 days ago, "Configure" / "Disconnect"
- **Available Integrations** (bottom section):
  - Asana: Not connected, "Connect" button

**Given** an integration encounters an error
**When** the OAuth token expires and refresh fails
**Then** the integration status changes to "Error" (red badge)
**And** I see:
- Status: "Authentication Error"
- Message: "Your Zoho CRM connection needs to be re-authenticated."
- "Reconnect" button

**Given** I click "Reconnect"
**When** I re-authorize the OAuth flow
**Then** the integration status returns to "Connected"
**And** syncing resumes

**Given** I want to view integration activity
**When** I click "View Activity" on an integration
**Then** I see an activity log:
- Table of recent sync events:
  - Timestamp: "2026-02-05 14:30 UTC"
  - Event: "Synced 42 contacts from Zoho CRM"
  - Status: "Success" (green) or "Failed" (red)
  - Details: Expandable for error messages
- Last 50 events shown
- Filter by: Event type, Status, Date range

**Given** I want to disconnect an integration
**When** I click "Disconnect" on HubSpot
**Then** I see a detailed confirmation modal:
- "Disconnect HubSpot?"
- **What will happen**:
  - "Auto-sync will stop immediately"
  - "Existing links to HubSpot campaigns will be preserved (read-only)"
  - "You can reconnect anytime to resume syncing"
- **What won't happen**:
  - "Your HubSpot campaigns will not be deleted"
  - "Your ADVERT strategies will remain unchanged"
- Checkbox: "I understand that syncing will stop"
- "Cancel" / "Disconnect" buttons

**Given** I confirm disconnection
**When** I click "Disconnect"
**Then** the integration is disconnected:
- Status: "Disconnected" (gray badge)
- OAuth tokens revoked (best effort)
- Auto-sync jobs cancelled
- `Integration.status` set to DISCONNECTED
- Toast notification: "HubSpot disconnected successfully"

**And** the card moves to "Available Integrations" section with "Reconnect" button

**Given** I want to view all linked resources
**When** I click "View Linked Resources" on an integration
**Then** I see a list:
- "Zoho CRM - Linked Resources (12)"
- Table:
  - Resource: "Strategy: Zahra Fashion House"
  - External Link: "Zoho Account: Zahra Fashion House"
  - Last Synced: "2 hours ago"
  - Actions: "View in ADVERT" / "View in Zoho"
- Filter by: Resource type (Strategies, Pillars)

**Given** I want to unlink a specific resource
**When** I click "Unlink" on a linked resource
**Then** I see confirmation:
- "Unlink from Zoho CRM?"
- "The strategy will remain in ADVERT, but will no longer sync with Zoho."
- "Confirm" / "Cancel"

**And** confirming removes the `IntegrationLink` record
**And** future updates to the strategy won't sync to Zoho

**Given** I review integration permissions
**When** I click "View Permissions" on an integration
**Then** I see:
- **Permissions granted**:
  - Read contacts
  - Write notes
  - Read accounts
- **Scopes**:
  - `ZohoCRM.modules.contacts.READ`
  - `ZohoCRM.modules.notes.CREATE`
- "Modify Permissions" button (re-triggers OAuth for new scopes)

**Given** I want to re-authorize with different permissions
**When** I click "Modify Permissions"
**Then** I go through OAuth flow again
**And** can grant additional permissions
**And** updated scopes are saved

**Given** multiple users on my team manage integrations
**When** I view integration activity
**Then** I see who performed each action:
- "Connected by: Amina (amina@zahra.com) on 2026-02-01"
- "Last configured by: Kwame (kwame@zahra.com) on 2026-02-04"
- Audit trail for compliance

**Given** the feature is implemented
**When** I review technical details
**Then** integration management includes:
- OAuth 2.0 flows for all providers (Zoho, HubSpot, Monday.com, Asana)
- Token refresh logic (handles expiration automatically)
- Webhook delivery for sync events (if configured)
- Rate limiting per provider (respects external API limits)
- Error handling with user-friendly messages
- Activity logging for audit and troubleshooting

---

**Epic 12 Complete!**

Epic 12: Third-Party Integrations & API (9 stories) is now fully documented with comprehensive acceptance criteria covering:
- API key generation and management with granular permissions
- Public REST API endpoints with OAuth 2.0 authentication, rate limiting, and versioning
- Official SDKs for JavaScript and Python with type safety and error handling
- Webhook configuration and delivery with signature verification and retries
- API usage analytics dashboard with real-time monitoring and alerts
- Zoho CRM integration for contact sync and account linking
- HubSpot campaign sync for marketing automation
- Monday.com and Asana project integration for task management
- Comprehensive integration management with status monitoring and disconnection workflows

**Key Technical Highlights:**
- tRPC backend exposed as public REST API with OpenAPI documentation
- OAuth 2.0 for third-party integrations with token refresh
- Inngest for webhook delivery and background sync jobs
- Redis for rate limiting and real-time usage tracking
- Encrypted token storage for security
- Granular permission system for API keys
- Comprehensive activity logging and audit trails

**Next Steps:**
- Epic 13: Compliance, Security & Enterprise Features
- Epic 14: PWA, Accessibility & UX Polish

---

## EPIC 13: COMPLIANCE, SECURITY & ENTERPRISE FEATURES

**Epic Goal:** Meet enterprise compliance requirements with SOC 2 certification, GDPR compliance, advanced security controls, and enterprise-grade infrastructure options.

**FRs Covered:** FR87, FR90, FR99-FR112

**Stories:**
- 13.1: Enterprise Tier Sales Contact and Custom Quote Workflow
- 13.2: Bank Transfer Payment Processing (NET 30 Terms)
- 13.3: Additional User Provisioning and Billing
- 13.4: Privacy Policy and Terms of Service Acceptance
- 13.5: GDPR Data Deletion Workflow (Right to be Forgotten)
- 13.6: Complete Data Export in JSON Format
- 13.7: Comprehensive Audit Log Dashboard
- 13.8: Encryption Infrastructure (AES-256 at Rest, TLS 1.3 in Transit)
- 13.9: Security Breach Notification System
- 13.10: SOC 2 Audit Reports and Compliance Documentation
- 13.11: Automated Backup and Recovery System
- 13.12: Dedicated Infrastructure Request Workflow

---

### Story 13.1: Enterprise Tier Sales Contact and Custom Quote Workflow

As an **Enterprise prospect evaluating ADVERT for my organization**,
I want **to contact sales and request a custom quote tailored to my company's needs**,
So that **I can get pricing for large teams, custom SLAs, and dedicated infrastructure**.

**Acceptance Criteria:**

**Given** I am a user exploring pricing options
**When** I navigate to `/pricing`
**Then** I see three pricing tiers:
- **Starter**: €99/month (3 active strategies, 1 user)
- **Professional**: €299/month (unlimited strategies, 3 users included, €49/user for additional)
- **Enterprise**: "Custom Pricing - Contact Sales" (badge)

**Given** I want to learn about Enterprise tier
**When** I click on the Enterprise tier card
**Then** I see Enterprise features:
- Unlimited users
- API access & SDK
- SOC 2 Type II reports
- Custom data retention policies
- Dedicated infrastructure (optional)
- Bank transfer payment (NET 30 terms)
- Priority support with dedicated account manager
- Custom SLAs (99.9% uptime guarantee)
- "Contact Sales" button

**Given** I click "Contact Sales"
**When** the contact form modal opens
**Then** I see the Enterprise Contact Form:
- **Company name** (required): "Acme Marketing Group"
- **Your name** (required): "Sarah Johnson"
- **Work email** (required): "sarah@acmemarketing.com"
- **Phone number** (optional): "+1 555-123-4567"
- **Company size** (required, dropdown):
  - 1-10 employees
  - 11-50 employees
  - 51-200 employees
  - 201-1000 employees
  - 1000+ employees
- **Number of expected users** (required): "25 users"
- **Use case description** (optional, 500 chars):
  - "We're a full-service agency serving 40+ brand clients across West Africa. We need ADVERT for all our strategists with API integration to our project management system."
- **Required features** (checkboxes):
  - ☑ API & SDK access
  - ☑ SOC 2 compliance
  - ☐ Dedicated infrastructure
  - ☑ Bank transfer payment
  - ☐ Custom integrations
- **Preferred contact method**: Email, Phone, Video call
- **Timeline**: ASAP, 1-3 months, 3-6 months, Exploring
- Captcha verification
- "Submit Request" button

**Given** I fill in the required fields
**And** I click "Submit Request"
**Then** the request is submitted
**And** I see a confirmation message:
- "Thank you for your interest in ADVERT Enterprise!"
- "Our sales team will contact you within 1 business day."
- "Check your email (sarah@acmemarketing.com) for confirmation."
- "Expected response time: <24 hours on business days"

**And** I receive a confirmation email:
- Subject: "Your ADVERT Enterprise Quote Request - Ref #ENT-2026-02-001"
- Body:
  ```
  Hi Sarah,

  Thank you for your interest in ADVERT Enterprise!

  We've received your request for a custom quote for 25 users at Acme Marketing Group.

  What happens next:
  1. Our Enterprise team will review your requirements (within 24 hours)
  2. We'll prepare a custom proposal tailored to your needs
  3. We'll schedule a demo call to walk through the platform and pricing

  Your reference number: ENT-2026-02-001

  Questions? Reply to this email or call us at +225 XX XX XX XX.

  Best,
  ADVERT Enterprise Team
  ```

**Given** the sales team receives my request
**When** they review it in their CRM
**Then** they see:
- Lead details (name, email, company, size, users)
- Use case description
- Required features (API, SOC 2, bank transfer)
- Timeline and contact preference
- Lead score based on company size and urgency

**Given** the sales team prepares a custom quote
**When** they send me the proposal
**Then** I receive a detailed quote document:
- **Custom pricing**: "€7,500/month for 25 users (billed annually: €90,000/year)"
- **What's included**:
  - Unlimited strategies across all users
  - Full API & SDK access (10,000 req/hour)
  - SOC 2 Type II audit reports
  - Bank transfer payment with NET 30 terms
  - Priority support with 4-hour response SLA
  - Dedicated account manager
  - Onboarding and training for up to 50 users
  - 99.9% uptime SLA with service credits
- **Optional add-ons**:
  - Dedicated infrastructure: +€2,000/month
  - Custom integrations: €5,000 setup + €500/month maintenance
  - Additional users beyond 25: €250/user/month
- **Contract terms**: Annual commitment, NET 30 payment, 90-day cancellation notice

**Given** I accept the Enterprise quote
**When** I sign the contract
**Then** the sales team provisions my Enterprise tenant
**And** I receive onboarding instructions
**And** my account is upgraded to Enterprise tier with all features enabled

**Given** the feature is implemented
**When** I review technical details
**Then** database model:
```prisma
model EnterpriseQuoteRequest {
  id              String   @id @default(cuid())
  companyName     String
  contactName     String
  email           String
  phone           String?
  companySize     CompanySize
  expectedUsers   Int
  useCase         String?  @db.Text
  requiredFeatures Json    // Array of feature flags
  contactMethod   ContactMethod
  timeline        Timeline
  status          QuoteStatus // SUBMITTED, REVIEWING, QUOTED, ACCEPTED, REJECTED
  salesRepId      String?  // Assigned sales rep
  quoteAmount     Decimal? @db.Decimal(10, 2)
  quoteSentAt     DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  salesRep        User?    @relation(fields: [salesRepId], references: [id])
  @@index([email])
  @@index([status, createdAt])
}

enum CompanySize {
  SIZE_1_10
  SIZE_11_50
  SIZE_51_200
  SIZE_201_1000
  SIZE_1000_PLUS
}

enum ContactMethod {
  EMAIL
  PHONE
  VIDEO_CALL
}

enum Timeline {
  ASAP
  ONE_TO_THREE_MONTHS
  THREE_TO_SIX_MONTHS
  EXPLORING
}

enum QuoteStatus {
  SUBMITTED
  REVIEWING
  QUOTED
  ACCEPTED
  REJECTED
}
```

**And** tRPC procedures:
- `enterprise.requestQuote({ companyName, contactName, email, ... })`
- `enterprise.listQuoteRequests()` (admin only)
- `enterprise.sendQuote({ requestId, quoteAmount, terms })` (admin only)

---

### Story 13.2: Bank Transfer Payment Processing (NET 30 Terms)

As an **Enterprise customer with NET 30 payment terms**,
I want **to pay invoices via bank transfer instead of credit card**,
So that **I can follow my company's procurement policies and payment workflows**.

**Acceptance Criteria:**

**Given** I am an Enterprise tier customer
**When** my contract includes NET 30 payment terms
**Then** my tenant is configured with `paymentMethod: BANK_TRANSFER` and `paymentTerms: NET_30`

**Given** my monthly invoice is generated
**When** the billing cycle completes (e.g., end of month)
**Then** ADVERT generates an invoice:
- Invoice number: `INV-2026-02-001`
- Invoice date: `2026-02-28`
- Due date: `2026-03-30` (30 days from invoice date)
- Amount: `€7,500.00`
- Line items:
  - ADVERT Enterprise Plan (25 users) - Feb 2026: €7,500.00
  - Additional users (3 users @ €250/user) - Feb 2026: €750.00
  - Subtotal: €8,250.00
  - Tax (if applicable): €0.00
  - **Total Due: €8,250.00**
- Payment instructions:
  - Bank name: Standard Bank Côte d'Ivoire
  - Account name: ADVERT SAS
  - Account number: 0123456789
  - SWIFT/BIC: SBICABIDXXX
  - IBAN: CI93 0000 0123 4567 8901 2345
  - Reference: INV-2026-02-001 (REQUIRED)

**Given** the invoice is generated
**When** the system processes it
**Then** I receive an invoice email:
- Subject: "ADVERT Invoice INV-2026-02-001 - Due March 30, 2026"
- Attached: PDF invoice
- Body:
  ```
  Hi Sarah,

  Your ADVERT Enterprise invoice for February 2026 is ready.

  Invoice Number: INV-2026-02-001
  Amount Due: €8,250.00
  Due Date: March 30, 2026 (NET 30)

  Payment Instructions:
  Please transfer funds to:
  - Bank: Standard Bank Côte d'Ivoire
  - Account: ADVERT SAS (0123456789)
  - SWIFT: SBICABIDXXX
  - Reference: INV-2026-02-001 (IMPORTANT: Include this reference)

  Questions? Contact billing@advert.app

  View invoice online: https://advert.app/billing/invoices/INV-2026-02-001
  ```

**Given** I want to view my invoices
**When** I navigate to `/billing/invoices`
**Then** I see a table of all invoices:
- Columns: Invoice #, Date, Due Date, Amount, Status, Actions
- Example row:
  - INV-2026-02-001, Feb 28 2026, Mar 30 2026, €8,250.00, **Pending Payment** (yellow badge), "View", "Download PDF"
  - INV-2026-01-001, Jan 31 2026, Feb 28 2026, €7,500.00, **Paid** (green badge), "View", "Download PDF"

**Given** I click "View" on an invoice
**When** the invoice detail page opens
**Then** I see:
- Invoice header (number, dates, amount)
- Line items breakdown
- Payment instructions (bank details)
- Payment status: "Pending - Due March 30, 2026" or "Paid - Received March 15, 2026"
- "Download PDF" button
- "Mark as Paid" button (if admin reviewing)

**Given** I initiate a bank transfer
**When** I transfer €8,250.00 to ADVERT's bank account
**And** I include the reference "INV-2026-02-001"
**Then** my bank processes the transfer (1-3 business days)

**Given** ADVERT receives the bank transfer
**When** the finance team reconciles payments
**Then** they match the reference "INV-2026-02-001" to my invoice
**And** they mark the invoice as paid in the system

**Given** my invoice is marked as paid
**When** the status updates
**Then** the invoice status changes to "Paid" (green badge)
**And** I receive a payment confirmation email:
- Subject: "Payment Received - Invoice INV-2026-02-001"
- Body:
  ```
  Hi Sarah,

  We've received your payment for Invoice INV-2026-02-001.

  Amount Paid: €8,250.00
  Payment Date: March 15, 2026
  Payment Method: Bank Transfer

  Thank you for your business!

  Receipt: https://advert.app/billing/invoices/INV-2026-02-001
  ```

**Given** my invoice is overdue
**When** the due date passes without payment (e.g., April 1, 2026)
**Then** the invoice status changes to "Overdue" (red badge)
**And** I receive an overdue reminder email:
- Day 1 overdue: Friendly reminder
- Day 7 overdue: Urgent reminder with account manager CC'd
- Day 14 overdue: Final notice with service suspension warning
- Day 30 overdue: Account suspended (read-only access until payment)

**Given** I have questions about an invoice
**When** I click "Contact Billing"
**Then** I can send a message to billing@advert.app
**Or** I can call my dedicated account manager

**Given** the feature is implemented
**When** I review technical details
**Then** database model:
```prisma
model Invoice {
  id              String   @id @default(cuid())
  tenantId        String
  invoiceNumber   String   @unique // INV-2026-02-001
  invoiceDate     DateTime @db.Date
  dueDate         DateTime @db.Date
  subtotal        Decimal  @db.Decimal(10, 2)
  tax             Decimal  @db.Decimal(10, 2)
  total           Decimal  @db.Decimal(10, 2)
  currency        String   @default("USD")
  status          InvoiceStatus // DRAFT, PENDING, PAID, OVERDUE, CANCELLED
  paymentMethod   PaymentMethod // BANK_TRANSFER, CREDIT_CARD, STRIPE
  paidAt          DateTime?
  lineItems       Json     // Array of line items
  paymentInstructions Json? // Bank details for bank transfer
  notes           String?  @db.Text
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  tenant          Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  @@index([tenantId, status])
  @@index([invoiceNumber])
  @@index([dueDate, status])
}

enum InvoiceStatus {
  DRAFT
  PENDING
  PAID
  OVERDUE
  CANCELLED
}

enum PaymentMethod {
  BANK_TRANSFER
  CREDIT_CARD
  STRIPE
}
```

**And** automated processes:
- Invoice generation: Inngest job runs on last day of month
- Overdue reminders: Inngest job checks daily for overdue invoices
- Payment reconciliation: Manual or automated via bank API integration

---

### Story 13.3: Additional User Provisioning and Billing

As a **Professional tier customer**,
I want **to add additional users to my account and be billed €49/month per user**,
So that **my team can collaborate on strategies without upgrading to Enterprise**.

**Acceptance Criteria:**

**Given** I am a Professional tier customer
**When** my plan includes 3 users
**Then** my subscription is: "Professional - €299/month (3 users included)"

**Given** I want to add more users
**When** I navigate to `/settings/team`
**Then** I see my current team members:
- Table: Name, Email, Role, Status, Actions
- Example: "Sarah Johnson", "sarah@acme.com", "Owner", "Active", "Edit"/"Remove"
- Current count: "3/3 users included in plan"
- "Add Team Member" button

**Given** I click "Add Team Member"
**When** the modal opens
**Then** I see a message:
- "You've reached your user limit (3 users included in Professional plan)"
- "Add additional users for €49/month per user"
- Checkbox: "I understand additional users will be billed at €49/month"
- "Continue" button

**Given** I check the box and click "Continue"
**When** the invite form opens
**Then** I can invite a new user:
- Email: "john@acme.com"
- Role: Consultant, Brand Client (dropdown)
- "Send Invitation" button

**Given** I send the invitation
**When** the system processes it
**Then** the user is added to my team
**And** my billing is updated:
- New line item: "Additional User (John Doe) - €49/month"
- Updated total: €299 + €49 = **€348/month**
- Prorated charge for current billing cycle

**Given** the billing cycle completes
**When** my next invoice is generated
**Then** I see:
- Line items:
  - Professional Plan (3 users): €299.00
  - Additional Users (1 user): €49.00
  - **Total: €348.00**

**Given** I want to view my billing details
**When** I navigate to `/settings/billing`
**Then** I see:
- **Current Plan**: Professional (€299/month)
- **Users**:
  - Included: 3 users
  - Additional: 1 user @ €49/month
  - Total users: 4
- **Current billing**: €348/month
- **Next charge**: March 5, 2026 - €348.00
- **Add More Users** button

**Given** I add a 5th user (2nd additional user)
**When** the system updates billing
**Then** my new total is: €299 + €49 + €49 = **€397/month**

**Given** I want to remove an additional user
**When** I click "Remove" on "John Doe"
**Then** I see a confirmation:
- "Remove John Doe from your team?"
- "His access will be revoked immediately"
- "You'll save €49/month starting next billing cycle"
- "Cancel" / "Remove User"

**Given** I confirm removal
**When** the user is removed
**Then** the user's access is revoked
**And** my billing is updated:
- Additional Users: 0 users @ €49/month
- **Total: €299/month** (starting next cycle)
- Prorated credit for unused days in current cycle

**Given** I have 10+ additional users
**When** my monthly cost exceeds Enterprise pricing
**Then** I see a recommendation:
- Banner: "💡 Tip: With 13 additional users (€637/month), you might save money with Enterprise tier. Contact sales for a custom quote."
- "Contact Sales" button

**Given** the feature is implemented
**When** I review technical details
**Then** database model:
```prisma
model Subscription {
  id                  String   @id @default(cuid())
  tenantId            String   @unique
  tier                SubscriptionTier // STARTER, PROFESSIONAL, ENTERPRISE
  status              SubscriptionStatus // ACTIVE, CANCELLED, SUSPENDED
  basePrice           Decimal  @db.Decimal(10, 2) // €299 for Professional
  includedUsers       Int      @default(3) // 3 for Professional
  additionalUsers     Int      @default(0)
  pricePerAdditionalUser Decimal @db.Decimal(10, 2) @default(49.00)
  totalMonthlyPrice   Decimal  @db.Decimal(10, 2) // Computed: basePrice + (additionalUsers * pricePerAdditionalUser)
  billingCycle        BillingCycle // MONTHLY, ANNUAL
  currentPeriodStart  DateTime
  currentPeriodEnd    DateTime
  cancelAt            DateTime?
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  tenant              Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  @@index([tenantId, status])
}

enum SubscriptionTier {
  STARTER
  PROFESSIONAL
  ENTERPRISE
}

enum SubscriptionStatus {
  ACTIVE
  CANCELLED
  SUSPENDED
  PAST_DUE
}

enum BillingCycle {
  MONTHLY
  ANNUAL
}
```

**And** tRPC procedures:
- `billing.addAdditionalUser({ email, role })` - adds user and updates billing
- `billing.removeAdditionalUser({ userId })` - removes user and updates billing
- `billing.getSubscriptionDetails()` - returns plan, users, pricing
- `billing.previewBillingChange({ additionalUsersCount })` - shows cost preview

---

### Story 13.4: Privacy Policy and Terms of Service Acceptance

As a **new user signing up for ADVERT**,
I want **to review and accept the Privacy Policy and Terms of Service**,
So that **I understand how my data is used and my legal obligations**.

**Acceptance Criteria:**

**Given** I am signing up for ADVERT
**When** I complete the registration form
**Then** I see a checkbox before the "Create Account" button:
- ☐ "I have read and agree to the [Privacy Policy](#) and [Terms of Service](#)"
- Links open in new tabs
- "Create Account" button is disabled until checkbox is checked

**Given** I click on "Privacy Policy" link
**When** the privacy policy page opens
**Then** I see the complete ADVERT Privacy Policy:
- Last updated date: "Effective February 1, 2026"
- Sections:
  1. Information We Collect
  2. How We Use Your Information
  3. Data Sharing and Disclosure
  4. Data Retention
  5. Your Rights (GDPR Compliance)
  6. Security Measures
  7. Cookies and Tracking
  8. Children's Privacy
  9. International Data Transfers
  10. Changes to This Policy
  11. Contact Us

**Given** I read the Privacy Policy
**When** I review my data rights
**Then** I see:
- **Right to Access**: Request a copy of your data
- **Right to Rectification**: Correct inaccurate data
- **Right to Erasure**: Request data deletion ("Right to be Forgotten")
- **Right to Data Portability**: Export your data in JSON format
- **Right to Restrict Processing**: Limit how we use your data
- **Right to Object**: Opt out of certain data processing
- **Right to Withdraw Consent**: Stop consenting to data use at any time

**Given** I click on "Terms of Service" link
**When** the ToS page opens
**Then** I see the complete ADVERT Terms of Service:
- Last updated: "Effective February 1, 2026"
- Sections:
  1. Acceptance of Terms
  2. Description of Service
  3. User Accounts and Responsibilities
  4. Subscription and Payment Terms
  5. Intellectual Property Rights
  6. User Content and Licensing
  7. Prohibited Uses
  8. Service Availability and Modifications
  9. Limitation of Liability
  10. Indemnification
  11. Dispute Resolution and Arbitration
  12. Governing Law
  13. Termination
  14. Severability
  15. Entire Agreement
  16. Contact Information

**Given** I check the acceptance checkbox
**And** I click "Create Account"
**Then** my account is created
**And** my acceptance is recorded:
- Timestamp: "2026-02-05 14:30:00 UTC"
- IP address: "41.203.123.45" (logged for legal compliance)
- Document versions accepted:
  - Privacy Policy v1.2 (Effective 2026-02-01)
  - Terms of Service v1.3 (Effective 2026-02-01)

**Given** I am an existing user
**When** ADVERT updates the Privacy Policy or ToS
**Then** I receive an email notification:
- Subject: "Important: Updated Privacy Policy - Action Required"
- Body:
  ```
  Hi Sarah,

  We've updated our Privacy Policy to reflect new features and clarify how we protect your data.

  What changed:
  - Added section on API data processing
  - Updated data retention policies for Enterprise customers
  - Clarified third-party integration data sharing

  Action required:
  Please review and accept the updated Privacy Policy to continue using ADVERT.

  Review changes: https://advert.app/privacy-policy?version=1.3&changes=highlighted
  Accept new terms: https://advert.app/accept-updated-terms

  You have 30 days to review and accept. After March 7, 2026, you'll be prompted to accept upon login.
  ```

**Given** I log in after a policy update
**And** I haven't accepted the new terms
**When** the dashboard loads
**Then** I see a modal overlay (cannot be dismissed):
- Title: "Updated Terms - Action Required"
- "We've updated our Privacy Policy and Terms of Service."
- "Last updated: February 5, 2026"
- "What changed?" (expandable section with change summary)
- Links: "View Privacy Policy" | "View Terms of Service"
- Checkbox: ☐ "I have read and agree to the updated Privacy Policy and Terms of Service"
- "Accept and Continue" button (disabled until checkbox is checked)
- Small text: "You must accept to continue using ADVERT."

**Given** I accept the updated terms
**When** I click "Accept and Continue"
**Then** my acceptance is recorded
**And** the modal closes
**And** I can access the platform normally

**Given** I want to view my consent history
**When** I navigate to `/settings/privacy`
**Then** I see:
- **Your Consent History**:
  - Table: Document, Version, Accepted On, IP Address
  - Example rows:
    - Privacy Policy v1.3, Feb 5 2026 14:30 UTC, 41.203.123.45
    - Terms of Service v1.3, Feb 5 2026 14:30 UTC, 41.203.123.45
    - Privacy Policy v1.2, Jan 15 2026 10:15 UTC, 41.203.120.12 (previous acceptance)

**Given** the feature is implemented
**When** I review technical details
**Then** database model:
```prisma
model ConsentRecord {
  id            String   @id @default(cuid())
  userId        String
  documentType  ConsentDocumentType // PRIVACY_POLICY, TERMS_OF_SERVICE
  documentVersion String  // "v1.3"
  acceptedAt    DateTime @default(now())
  ipAddress     String
  userAgent     String?
  revoked       Boolean  @default(false)
  revokedAt     DateTime?
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId, documentType])
  @@index([acceptedAt])
}

enum ConsentDocumentType {
  PRIVACY_POLICY
  TERMS_OF_SERVICE
}

model LegalDocument {
  id            String   @id @default(cuid())
  documentType  ConsentDocumentType
  version       String   // "v1.3"
  effectiveDate DateTime @db.Date
  content       String   @db.Text // Markdown or HTML
  changesSummary String? @db.Text // Summary of changes from previous version
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  @@unique([documentType, version])
  @@index([documentType, isActive])
}
```

**And** tRPC procedures:
- `legal.getActivePrivacyPolicy()` - returns current privacy policy
- `legal.getActiveTermsOfService()` - returns current ToS
- `legal.acceptTerms({ privacyPolicyVersion, tosVersion })` - records consent
- `legal.getUserConsentHistory()` - returns user's consent records
- `legal.checkUserConsent()` - checks if user has accepted latest versions

---

### Story 13.5: GDPR Data Deletion Workflow (Right to be Forgotten)

As a **user exercising my GDPR rights**,
I want **to request deletion of all my personal data from ADVERT**,
So that **I can exercise my "Right to be Forgotten" as required by GDPR**.

**Acceptance Criteria:**

**Given** I want to delete my account and data
**When** I navigate to `/settings/privacy`
**Then** I see a "Data Rights" section:
- **Export Your Data**: Download all your data in JSON format
- **Request Data Deletion**: Permanently delete your account and data (cannot be undone)
- "Learn More About Your Rights" (link to GDPR explainer)

**Given** I click "Request Data Deletion"
**When** the deletion request modal opens
**Then** I see a warning:
- Title: "Delete Your Account and Data?"
- ⚠️ "This action is permanent and cannot be undone."
- **What will be deleted:**
  - Your account and profile information
  - All strategies and brand data you created
  - Your activity logs and audit trails
  - Payment information (except legally required records)
  - Third-party integration connections
- **What will be retained (legal obligation):**
  - Invoice records (7 years for tax compliance)
  - Payment transaction records
  - Consent records (proof of legal compliance)
- **Timeline:** "Deletion will be completed within 30 days as required by GDPR."
- Checkbox: ☐ "I understand this action is permanent and cannot be reversed"
- Input field: "Type DELETE to confirm" (verification)
- "Cancel" / "Request Deletion" (red button, destructive)

**Given** I check the box and type "DELETE"
**And** I click "Request Deletion"
**Then** I see a confirmation screen:
- "We're sorry to see you go!"
- "Your data deletion request has been submitted."
- **Request ID**: DRQ-2026-02-001
- **Status**: Pending Review
- **Timeline**: Completion within 30 days (by March 7, 2026)
- **What happens next:**
  1. Our team will review your request (1-2 business days)
  2. We'll send confirmation email with deletion timeline
  3. Your account will be deactivated immediately
  4. Data will be permanently deleted within 30 days
  5. You'll receive final confirmation when deletion is complete

**And** I am logged out immediately
**And** my account status changes to "PENDING_DELETION"

**Given** the deletion request is submitted
**When** the system processes it
**Then** I receive a confirmation email:
- Subject: "Your Data Deletion Request - Ref #DRQ-2026-02-001"
- Body:
  ```
  Hi Sarah,

  We've received your request to delete your account and personal data.

  Request ID: DRQ-2026-02-001
  Submitted: February 5, 2026 14:30 UTC
  Expected completion: Within 30 days (by March 7, 2026)

  What's happening:
  - Your account has been deactivated (you cannot log in)
  - Your data is scheduled for permanent deletion
  - Legally required records (invoices, payment history) will be retained per GDPR guidelines

  Changed your mind?
  You have 7 days to cancel this request. After February 12, 2026, deletion cannot be stopped.
  Cancel request: https://advert.app/cancel-deletion/DRQ-2026-02-001?token=abc123

  Questions? Contact privacy@advert.app

  Reference: DRQ-2026-02-001
  ```

**Given** I change my mind within 7 days
**When** I click the cancellation link in the email
**Then** I see a cancellation form:
- "Cancel Data Deletion Request?"
- Request details (ID, submission date, expiration)
- "Confirm Cancellation" button

**And** when I confirm, my account is reactivated
**And** the deletion request is cancelled
**And** I receive confirmation: "Your data deletion request has been cancelled. Your account is restored."

**Given** 7 days pass without cancellation
**When** the deletion grace period expires
**Then** the deletion becomes irreversible
**And** no cancellation is possible

**Given** the deletion request is being processed
**When** the ADVERT team executes the deletion
**Then** the following data is permanently deleted:
1. **User profile**: Name, email, phone, profile photo
2. **Strategies**: All strategies created by the user (if sole owner)
3. **Activity logs**: User actions, login history (except legally required audit trails)
4. **Integration tokens**: OAuth tokens for third-party services
5. **Team memberships**: User removed from all teams
6. **Preferences**: User settings, notification preferences
7. **Uploaded files**: Portfolio images, documents (Vercel Blob)

**And** the following data is **retained** for legal compliance:
1. **Invoice records**: 7 years (tax law requirement)
2. **Payment transaction logs**: 7 years (financial regulation)
3. **Consent records**: Proof of ToS/Privacy Policy acceptance
4. **Anonymized analytics**: Aggregated data with no PII

**Given** the deletion is complete
**When** all data is removed from production databases
**Then** I receive a final confirmation email:
- Subject: "Data Deletion Complete - Ref #DRQ-2026-02-001"
- Body:
  ```
  Hi,

  Your data deletion request (DRQ-2026-02-001) has been completed.

  All personal data associated with your account has been permanently deleted from ADVERT systems, except for legally required records (invoices, payment history) which will be retained per GDPR Article 17 exemptions.

  What was deleted:
  - Account profile and credentials
  - All strategies and brand data
  - Activity logs and preferences
  - Third-party integration connections

  What was retained (legal obligation):
  - Invoice records (7-year retention for tax compliance)
  - Payment transaction logs (financial regulations)

  You can no longer log in to ADVERT. If you wish to use ADVERT again in the future, you'll need to create a new account.

  Questions? Contact privacy@advert.app

  Reference: DRQ-2026-02-001
  Completed: March 1, 2026
  ```

**And** the user record is marked as deleted:
```prisma
// User record is NOT physically deleted, but anonymized/flagged
{
  id: "user_123",
  email: "deleted_user_abc123@advert.local", // Anonymized
  name: "[Deleted User]",
  status: "DELETED",
  deletedAt: "2026-03-01T10:00:00Z",
  deletionRequestId: "DRQ-2026-02-001"
}
```

**Given** I am an admin reviewing deletion requests
**When** I navigate to `/admin/data-requests`
**Then** I see a table of all GDPR requests:
- Columns: Request ID, User, Type, Status, Submitted, Due Date, Actions
- Example: DRQ-2026-02-001, sarah@acme.com, Deletion, Pending, Feb 5, Mar 7, "Review"/"Process"/"Cancel"
- Filters: Status (Pending/Approved/Completed/Cancelled), Type (Deletion/Export)

**Given** the feature is implemented
**When** I review technical details
**Then** database model:
```prisma
model DataDeletionRequest {
  id              String   @id @default(cuid())
  requestNumber   String   @unique // DRQ-2026-02-001
  userId          String
  status          DeletionRequestStatus // SUBMITTED, PENDING_REVIEW, APPROVED, IN_PROGRESS, COMPLETED, CANCELLED
  submittedAt     DateTime @default(now())
  reviewedAt      DateTime?
  completedAt     DateTime?
  cancelledAt     DateTime?
  cancellationDeadline DateTime // 7 days from submission
  cancellationToken String @unique // For email link
  reviewedBy      String? // Admin user ID
  notes           String?  @db.Text
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  reviewer        User?    @relation("DeletionReviewer", fields: [reviewedBy], references: [id])
  @@index([userId])
  @@index([status, submittedAt])
}

enum DeletionRequestStatus {
  SUBMITTED
  PENDING_REVIEW
  APPROVED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}
```

**And** Inngest jobs:
- `gdpr/process-deletion-request` - orchestrates deletion workflow
- `gdpr/anonymize-user-data` - anonymizes user records
- `gdpr/delete-user-files` - removes files from Vercel Blob
- `gdpr/send-deletion-confirmation` - sends final email

**And** audit trail:
- All deletion actions logged for compliance
- Retention: 7 years minimum per GDPR Article 17(3)

---

### Story 13.6: Complete Data Export in JSON Format

As a **user exercising my GDPR data portability rights**,
I want **to export all my data in a machine-readable JSON format**,
So that **I can transfer my data to another service or archive it personally**.

**Acceptance Criteria:**

**Given** I want to export my data
**When** I navigate to `/settings/privacy`
**Then** I see "Export Your Data" option:
- Description: "Download all your personal data in JSON format (GDPR data portability)"
- "Request Data Export" button

**Given** I click "Request Data Export"
**When** the export modal opens
**Then** I see export options:
- Title: "Export Your Data"
- "Your data will be compiled and sent to your email within 24 hours."
- **Export includes:**
  - ✅ Account profile and settings
  - ✅ All strategies and brand data
  - ✅ Team memberships and roles
  - ✅ Activity logs (last 90 days)
  - ✅ Billing and subscription history
  - ✅ Uploaded files (links to download)
- **Format**: JSON (machine-readable, GDPR compliant)
- "Request Export" button

**Given** I click "Request Export"
**When** the export request is submitted
**Then** I see a confirmation:
- "Export Requested Successfully!"
- "We're compiling your data. You'll receive a download link via email within 24 hours."
- **Request ID**: DEX-2026-02-001

**And** I receive a confirmation email:
- Subject: "Your Data Export Request - Ref #DEX-2026-02-001"
- Body:
  ```
  Hi Sarah,

  We're preparing your data export.

  Request ID: DEX-2026-02-001
  Requested: February 5, 2026 14:30 UTC
  Expected completion: Within 24 hours

  You'll receive a download link once your export is ready.

  Questions? Contact privacy@advert.app
  ```

**Given** the export is being processed
**When** the Inngest job runs
**Then** the system compiles my data:

1. **Profile Data** (`profile.json`):
```json
{
  "user": {
    "id": "user_123",
    "name": "Sarah Johnson",
    "email": "sarah@acme.com",
    "phone": "+1555123456",
    "company": "Acme Marketing Group",
    "role": "Agency Owner",
    "createdAt": "2026-01-15T10:00:00Z",
    "lastLoginAt": "2026-02-05T14:20:00Z",
    "emailVerified": true,
    "twoFactorEnabled": false
  },
  "preferences": {
    "language": "en",
    "timezone": "America/New_York",
    "notifications": {
      "email": true,
      "inApp": true,
      "weeklyDigest": false
    }
  }
}
```

2. **Strategies Data** (`strategies.json`):
```json
{
  "strategies": [
    {
      "id": "strat_456",
      "brandName": "Zahra Fashion House",
      "industry": "Fashion & Apparel",
      "createdAt": "2026-01-20T12:00:00Z",
      "updatedAt": "2026-02-03T16:30:00Z",
      "status": "ACTIVE",
      "pillars": [
        {
          "pillarNumber": 1,
          "title": "Heritage Craftsmanship",
          "bigIdea": "Every piece tells a story...",
          "tactics": [...]
        }
      ]
    }
  ]
}
```

3. **Team Data** (`team.json`):
```json
{
  "tenantMemberships": [
    {
      "tenantId": "tenant_789",
      "tenantName": "Acme Marketing Group",
      "role": "OWNER",
      "joinedAt": "2026-01-15T10:00:00Z"
    }
  ],
  "teamMembers": [
    {
      "name": "John Doe",
      "email": "john@acme.com",
      "role": "CONSULTANT",
      "invitedAt": "2026-01-20T14:00:00Z"
    }
  ]
}
```

4. **Activity Logs** (`activity.json`):
```json
{
  "activities": [
    {
      "timestamp": "2026-02-05T14:20:00Z",
      "action": "LOGIN",
      "ipAddress": "41.203.123.45",
      "userAgent": "Mozilla/5.0..."
    },
    {
      "timestamp": "2026-02-05T14:25:00Z",
      "action": "STRATEGY_CREATED",
      "resourceId": "strat_456",
      "details": "Created strategy for Zahra Fashion House"
    }
  ]
}
```

5. **Billing Data** (`billing.json`):
```json
{
  "subscription": {
    "tier": "PROFESSIONAL",
    "status": "ACTIVE",
    "billingCycle": "MONTHLY",
    "monthlyPrice": 348.00,
    "currentPeriodStart": "2026-02-01",
    "currentPeriodEnd": "2026-03-01"
  },
  "invoices": [
    {
      "invoiceNumber": "INV-2026-02-001",
      "date": "2026-02-01",
      "amount": 348.00,
      "status": "PAID",
      "paidAt": "2026-02-05"
    }
  ]
}
```

6. **Files Manifest** (`files.json`):
```json
{
  "uploadedFiles": [
    {
      "fileName": "zahra-logo.png",
      "uploadedAt": "2026-01-20T15:30:00Z",
      "size": 245678,
      "downloadUrl": "https://blob.vercel-storage.com/zahra-logo-abc123.png?token=xyz789",
      "expiresAt": "2026-02-12T00:00:00Z"
    }
  ]
}
```

**And** all JSON files are packaged into a ZIP archive:
- File name: `advert-data-export-DEX-2026-02-001.zip`
- Contents:
  - profile.json
  - strategies.json
  - team.json
  - activity.json
  - billing.json
  - files.json
  - README.txt (explains structure)

**Given** the export is complete
**When** the ZIP is ready
**Then** I receive a download email:
- Subject: "Your Data Export is Ready - Ref #DEX-2026-02-001"
- Body:
  ```
  Hi Sarah,

  Your data export is ready for download!

  Request ID: DEX-2026-02-001
  File size: 2.4 MB
  Expires: February 12, 2026 (7 days)

  Download your data:
  https://advert.app/exports/download/DEX-2026-02-001?token=secure_token_xyz

  What's included:
  - Profile and account settings
  - All strategies (6 strategies, 42 pillars)
  - Team memberships and activity
  - Billing and subscription history
  - Links to uploaded files

  This link expires in 7 days for security. After expiration, you can request a new export.

  Questions? Contact privacy@advert.app
  ```

**Given** I click the download link
**When** the download page opens
**Then** I see:
- "Your Data Export - DEX-2026-02-001"
- File size: 2.4 MB
- Expires: February 12, 2026 (5 days remaining)
- "Download ZIP" button (large, prominent)
- "Request New Export" button (if expired)

**Given** I download the ZIP
**When** I extract it
**Then** I see all JSON files with my data
**And** I can import this data into another service or archive it

**Given** the download link expires after 7 days
**When** I try to access it
**Then** I see: "This download link has expired. Request a new export from your account settings."

**Given** the feature is implemented
**When** I review technical details
**Then** database model:
```prisma
model DataExportRequest {
  id              String   @id @default(cuid())
  requestNumber   String   @unique // DEX-2026-02-001
  userId          String
  status          ExportRequestStatus // SUBMITTED, PROCESSING, COMPLETED, EXPIRED
  submittedAt     DateTime @default(now())
  completedAt     DateTime?
  expiresAt       DateTime? // 7 days from completion
  fileSize        Int?     // bytes
  downloadUrl     String?  // Secure signed URL
  downloadToken   String   @unique
  downloadCount   Int      @default(0) // Track # of downloads
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId])
  @@index([status, submittedAt])
}

enum ExportRequestStatus {
  SUBMITTED
  PROCESSING
  COMPLETED
  EXPIRED
}
```

**And** Inngest jobs:
- `gdpr/process-export-request` - compiles all user data
- `gdpr/package-export-zip` - creates ZIP archive
- `gdpr/upload-export-file` - uploads to Vercel Blob with expiration
- `gdpr/send-download-link` - sends email with secure link
- `gdpr/cleanup-expired-exports` - deletes exports after 7 days

---

### Story 13.7: Comprehensive Audit Log Dashboard

As an **Agency Owner or Enterprise admin**,
I want **to view comprehensive audit logs of all user activities with timestamps and IP addresses**,
So that **I can monitor security, troubleshoot issues, and maintain compliance**.

**Acceptance Criteria:**

**Given** I am an Agency Owner or admin
**When** I navigate to `/settings/audit-logs`
**Then** I see the Audit Logs dashboard

**Given** the dashboard loads
**When** I view the page
**Then** I see:
- Page title: "Audit Logs"
- Description: "Monitor all user activities, security events, and system changes"
- Filter controls at the top
- Table of audit events

**Given** I view the filter controls
**When** I want to filter logs
**Then** I see filter options:
- **Date range**: Last 24 hours, Last 7 days, Last 30 days, Last 90 days, Custom range
- **Event type** (dropdown):
  - All Events
  - Authentication (Login, Logout, Failed Login, Password Reset)
  - Strategy (Created, Updated, Deleted, Exported)
  - Team (Member Invited, Member Removed, Role Changed)
  - Settings (Profile Updated, Billing Changed, Integration Connected)
  - Security (2FA Enabled, API Key Created, Password Changed)
  - Data (Export Requested, Deletion Requested)
- **User** (dropdown): All Users, or specific team member
- **Action status**: All, Success, Failed
- **Search**: Free text search in event descriptions
- "Apply Filters" button

**Given** I view the audit log table
**When** no filters are applied
**Then** I see the most recent 50 events:
- Columns: Timestamp, User, Event, Action, Details, IP Address, Status
- Example rows:
  - `2026-02-05 14:30:15 UTC`, `Sarah Johnson`, `STRATEGY_UPDATED`, `Updated strategy "Zahra Fashion"`, `41.203.123.45`, `Success` (green)
  - `2026-02-05 14:25:00 UTC`, `John Doe`, `LOGIN`, `User logged in`, `41.203.120.10`, `Success` (green)
  - `2026-02-05 14:20:30 UTC`, `Unknown`, `LOGIN_FAILED`, `Failed login attempt for sarah@acme.com`, `102.45.67.89`, `Failed` (red)
  - `2026-02-05 13:15:00 UTC`, `Sarah Johnson`, `TEAM_MEMBER_INVITED`, `Invited john@acme.com as Consultant`, `41.203.123.45`, `Success` (green)
- Sortable by any column
- Pagination at bottom

**Given** I click on an event row
**When** the row expands
**Then** I see detailed event information:
- **Event ID**: `evt_log_abc123`
- **Timestamp**: `2026-02-05 14:30:15.423 UTC`
- **User**: Sarah Johnson (sarah@acme.com, user_123)
- **Event Type**: STRATEGY_UPDATED
- **Action**: Updated strategy "Zahra Fashion House"
- **IP Address**: 41.203.123.45
- **User Agent**: Mozilla/5.0 (Windows NT 10.0; Win64; x64)...
- **Status**: Success
- **Changes** (if applicable):
  - Before: { brandName: "Zahra Fashion" }
  - After: { brandName: "Zahra Fashion House" }
- **Metadata**: { strategyId: "strat_456", tenantId: "tenant_789" }

**Given** I want to see failed login attempts
**When** I filter by:
- Event type: "Authentication"
- Action status: "Failed"
- Date range: "Last 7 days"
**And** I click "Apply Filters"
**Then** I see only failed login attempts in the last 7 days:
- Example: `2026-02-05 14:20:30`, `Unknown`, `LOGIN_FAILED`, `Failed login for sarah@acme.com`, `102.45.67.89`
- Example: `2026-02-04 09:15:12`, `Unknown`, `LOGIN_FAILED`, `Failed login for admin@acme.com`, `185.234.56.78`

**And** I can identify potential security threats:
- Multiple failed logins from same IP
- Failed logins for non-existent accounts (brute force attempts)
- Failed logins from unusual geographic locations

**Given** I want to track a specific user's activity
**When** I filter by:
- User: "John Doe"
- Date range: "Last 30 days"
**Then** I see all of John's activities:
- Logins, logouts
- Strategies created/updated
- Exports generated
- Settings changed

**Given** I want to export audit logs
**When** I click "Export Logs" button
**Then** I see export options:
- **Format**: CSV, JSON
- **Date range**: Current filters or custom
- **Include**: All columns or selected columns
- "Download" button

**And** clicking "Download" generates a file:
- CSV: `audit-logs-2026-02-05.csv`
- JSON: `audit-logs-2026-02-05.json`

**Given** I review security events
**When** I filter by Event type: "Security"
**Then** I see security-related events:
- API key created/revoked
- Password changed
- 2FA enabled/disabled
- Integration connected/disconnected
- Data export requested
- Data deletion requested

**Given** I am a Professional tier user (not Enterprise)
**When** I navigate to `/settings/audit-logs`
**Then** I see limited audit logs:
- Only last 30 days (Enterprise: 90+ days)
- No export functionality (Enterprise only)
- Banner: "Upgrade to Enterprise for full audit log access (90+ days retention, CSV/JSON export)"

**Given** the feature is implemented
**When** I review technical details
**Then** database model:
```prisma
model AuditLog {
  id          String   @id @default(cuid())
  tenantId    String
  userId      String?  // Null for system events or failed logins
  eventType   AuditEventType
  action      String   // Human-readable action description
  resourceType String? // STRATEGY, USER, TEAM, INTEGRATION, etc.
  resourceId  String?  // ID of affected resource
  ipAddress   String
  userAgent   String?  @db.Text
  status      AuditStatus // SUCCESS, FAILED, PENDING
  metadata    Json?    // Additional event-specific data
  changesBefore Json?  // State before change
  changesAfter Json?   // State after change
  timestamp   DateTime @default(now())
  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  user        User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  @@index([tenantId, timestamp])
  @@index([userId, timestamp])
  @@index([eventType, timestamp])
  @@index([ipAddress, timestamp])
}

enum AuditEventType {
  // Authentication
  LOGIN
  LOGOUT
  LOGIN_FAILED
  PASSWORD_RESET
  PASSWORD_CHANGED
  MFA_ENABLED
  MFA_DISABLED

  // Strategy
  STRATEGY_CREATED
  STRATEGY_UPDATED
  STRATEGY_DELETED
  STRATEGY_EXPORTED

  // Team
  TEAM_MEMBER_INVITED
  TEAM_MEMBER_REMOVED
  TEAM_ROLE_CHANGED

  // Settings
  PROFILE_UPDATED
  BILLING_UPDATED
  INTEGRATION_CONNECTED
  INTEGRATION_DISCONNECTED

  // Security
  API_KEY_CREATED
  API_KEY_REVOKED
  WEBHOOK_CREATED
  WEBHOOK_DELETED

  // Data
  DATA_EXPORT_REQUESTED
  DATA_DELETION_REQUESTED

  // System
  SYSTEM_ERROR
  RATE_LIMIT_EXCEEDED
}

enum AuditStatus {
  SUCCESS
  FAILED
  PENDING
}
```

**And** audit logging middleware:
- All tRPC mutations automatically logged
- Authentication events logged via NextAuth callbacks
- API requests logged via middleware
- Background jobs log important events

**And** retention policy:
- Starter/Professional: 30 days
- Enterprise: 90+ days (configurable)
- Legally significant events: 7 years

---

### Story 13.8: Encryption Infrastructure (AES-256 at Rest, TLS 1.3 in Transit)

As a **security-conscious Enterprise customer**,
I want **my data encrypted with AES-256 at rest and TLS 1.3 in transit**,
So that **my sensitive strategy data and client information are protected from unauthorized access**.

**Acceptance Criteria:**

**Given** ADVERT stores sensitive data
**When** data is written to the database
**Then** it is encrypted at rest using AES-256

**Given** the database is PostgreSQL
**When** data is stored
**Then** encryption is configured:
- **Method**: Transparent Data Encryption (TDE) at database level
- **Key Management**: AWS KMS (Key Management Service) or equivalent
- **Algorithm**: AES-256-GCM
- **Key Rotation**: Automatic every 90 days

**Given** the application stores files
**When** files are uploaded (images, documents, exports)
**Then** they are encrypted in Vercel Blob:
- **Encryption**: AES-256 at rest (Vercel Blob default)
- **Access control**: Signed URLs with expiration
- **Retention**: Configurable per file type

**Given** sensitive fields need field-level encryption
**When** API keys, OAuth tokens, payment info are stored
**Then** they are encrypted at application level:
- **Method**: Field-level encryption using crypto library
- **Algorithm**: AES-256-CBC with unique IV per record
- **Key**: Application encryption key stored in environment variables
- **Example**: API keys stored as `keyHash` (bcrypt) + `encryptedKey` (AES-256)

**Given** data is transmitted between client and server
**When** a user accesses ADVERT
**Then** all connections use HTTPS with TLS 1.3:
- **Protocol**: TLS 1.3 (minimum TLS 1.2)
- **Certificate**: Valid SSL certificate from Let's Encrypt or commercial CA
- **Cipher suites**: Modern, secure ciphers only (no weak ciphers)
- **HSTS**: HTTP Strict Transport Security enabled
- **SSL Labs rating**: A+ (verified via SSL Labs test)

**Given** I want to verify ADVERT's encryption
**When** I check the SSL certificate
**Then** I see:
- Certificate issuer: Let's Encrypt or commercial CA
- Protocol: TLS 1.3
- Key exchange: ECDHE (Ephemeral Diffie-Hellman)
- Cipher: AES-256-GCM or ChaCha20-Poly1305
- SSL Labs grade: A+

**Given** ADVERT makes API calls to external services
**When** connecting to third-party APIs (Zoho, HubSpot, Stripe)
**Then** all connections use HTTPS/TLS 1.3

**Given** webhooks are sent to customer endpoints
**When** ADVERT delivers webhook events
**Then** webhooks require HTTPS:
- HTTP endpoints rejected with error message
- TLS certificate validation performed
- Self-signed certificates rejected (unless explicitly allowed)

**Given** database backups are created
**When** Inngest runs the backup job
**Then** backups are encrypted:
- **Method**: Encrypted backup files (pg_dump with encryption)
- **Storage**: AWS S3 with server-side encryption (SSE-KMS)
- **Access**: IAM roles with least privilege

**Given** I am an Enterprise customer
**When** I review security documentation
**Then** I see:
- **Encryption at Rest**: AES-256 for all data (database, files, backups)
- **Encryption in Transit**: TLS 1.3 for all connections
- **Key Management**: AWS KMS with automatic rotation
- **Compliance**: Meets SOC 2, GDPR, HIPAA encryption requirements

**Given** I want proof of encryption
**When** I request a security audit
**Then** ADVERT provides:
- SSL Labs report (A+ rating)
- Database encryption configuration documentation
- Key management policies
- Encryption architecture diagram

**Given** the feature is implemented
**When** I review technical details
**Then** encryption configuration:

**1. Database Encryption (PostgreSQL on Vercel/AWS):**
```sql
-- Enable Transparent Data Encryption (TDE)
ALTER DATABASE advert_production
  SET encryption = true
  WITH KEY_PROVIDER = 'aws_kms'
       KEY_ID = 'arn:aws:kms:us-east-1:123456789:key/abc-123';
```

**2. Application-Level Field Encryption (Prisma/Node.js):**
```typescript
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!; // 32 bytes
const ALGORITHM = 'aes-256-cbc';

export function encryptField(text: string): { iv: string; encrypted: string } {
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return { iv: iv.toString('hex'), encrypted };
}

export function decryptField(encrypted: string, iv: string): string {
  const decipher = createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), Buffer.from(iv, 'hex'));
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Usage in Prisma model
model ApiKey {
  id           String @id
  keyHash      String // bcrypt hash for validation
  encryptedKey String // AES-256 encrypted full key
  encryptionIV String // Initialization vector
}
```

**3. HTTPS/TLS Configuration (Next.js/Vercel):**
```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ]
      }
    ];
  }
};
```

**4. Webhook HTTPS Enforcement:**
```typescript
export async function deliverWebhook(webhook: Webhook, payload: Json) {
  // Validate HTTPS
  if (!webhook.url.startsWith('https://')) {
    throw new Error('Webhook URL must use HTTPS');
  }

  // Verify TLS certificate
  const response = await fetch(webhook.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Advert-Signature': generateSignature(payload, webhook.secret)
    },
    body: JSON.stringify(payload),
    // Reject self-signed certificates
    agent: new https.Agent({ rejectUnauthorized: true })
  });

  return response;
}
```

**And** security headers:
- HSTS (Strict-Transport-Security)
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Content-Security-Policy (CSP)

**And** monitoring:
- SSL certificate expiration alerts (30 days before expiry)
- TLS version monitoring (alert on TLS 1.2 usage)
- Encryption key rotation tracking

---

### Story 13.9: Security Breach Notification System

As an **ADVERT user affected by a potential security breach**,
I want **to be notified within 72 hours if my data is compromised**,
So that **I can take protective actions and ADVERT meets GDPR Article 33 requirements**.

**Acceptance Criteria:**

**Given** a security incident is detected
**When** the ADVERT security team identifies:
- Unauthorized access to user data
- Data exfiltration or leakage
- System compromise affecting user accounts
- Third-party service breach affecting ADVERT users
**Then** the incident response protocol is activated

**Given** the incident response protocol is activated
**When** the security team assesses the breach
**Then** they determine:
- **Severity**: Critical, High, Medium, Low
- **Scope**: Number of affected users/accounts
- **Data types affected**: Strategies, PII, payment info, credentials
- **Root cause**: Attack vector, vulnerability exploited
- **Remediation**: Steps taken to contain and fix

**Given** the breach affects personal data
**When** the severity is Critical or High
**Then** the notification timeline starts:
- **T+0**: Breach detected and confirmed
- **T+24h**: Internal incident report completed
- **T+48h**: Regulatory notification (GDPR Article 33: notify DPA within 72 hours)
- **T+72h**: User notification (GDPR Article 34: notify affected individuals)

**Given** users need to be notified
**When** the 72-hour window approaches
**Then** the security team prepares the user notification:
- **Subject**: "Important Security Notification - Action Required"
- **Content requirements**:
  - Nature of the breach (what happened)
  - Data types affected
  - Likely consequences
  - Measures taken to mitigate
  - Recommended actions for users
  - Contact information for questions

**Given** I am an affected user
**When** ADVERT sends the breach notification
**Then** I receive an email:
- Subject: "Important Security Notification - Action Required"
- Body:
  ```
  Hi Sarah,

  We're writing to inform you of a security incident that may have affected your ADVERT account.

  WHAT HAPPENED:
  On February 3, 2026, we detected unauthorized access to one of our database servers. Our security team immediately contained the breach and conducted a thorough investigation.

  WHAT DATA WAS AFFECTED:
  - Account email addresses (including yours: sarah@acme.com)
  - Encrypted password hashes (no plaintext passwords)
  - Strategy titles (not full content)
  - Account creation dates

  WHAT WAS NOT AFFECTED:
  - Your actual passwords (we use strong encryption)
  - Full strategy content and pillars
  - Payment information (stored separately with Stripe)
  - API keys and integration tokens

  LIKELY CONSEQUENCES:
  - Risk of phishing attempts using your email
  - No immediate risk to your account security
  - No financial data was exposed

  WHAT WE'VE DONE:
  - Immediately contained the breach and closed the vulnerability
  - Forced password reset for all affected accounts (see below)
  - Engaged external security firm for forensic analysis
  - Notified relevant data protection authorities
  - Enhanced our security monitoring and access controls

  WHAT YOU SHOULD DO:
  1. Reset your password immediately: https://advert.app/reset-password?token=xyz
  2. Enable two-factor authentication (2FA) for added security
  3. Be cautious of phishing emails claiming to be from ADVERT
  4. Review your account activity for any suspicious logins
  5. Contact us if you notice anything unusual

  QUESTIONS OR CONCERNS:
  We deeply apologize for this incident. Your trust is our priority.

  Contact our security team:
  - Email: security@advert.app
  - Phone: +225 XX XX XX XX (24/7 hotline)
  - Reference: INC-2026-02-001

  For detailed information, visit: https://advert.app/security/incident-2026-02-001

  Sincerely,
  ADVERT Security Team
  ```

**Given** the breach notification is sent
**When** users receive it
**Then** affected accounts are flagged:
- Forced password reset on next login
- Security banner displayed: "Important: Reset your password due to security incident"
- Link to incident details page

**Given** I log in after a breach notification
**When** I enter my credentials
**Then** I see a mandatory password reset screen:
- "Password Reset Required - Security Incident"
- "Due to a recent security incident, you must reset your password to continue."
- "New password" field (validation: min 12 chars, uppercase, lowercase, number, special char)
- "Confirm password" field
- Checkbox: ☑ "Enable two-factor authentication (recommended)"
- "Reset Password and Continue" button

**Given** I reset my password
**When** the new password is set
**Then** my account is marked as secure
**And** I receive confirmation email:
- "Your ADVERT password has been reset successfully"
- "If you didn't make this change, contact security@advert.app immediately"

**Given** ADVERT provides a public incident page
**When** I navigate to `https://advert.app/security/incident-2026-02-001`
**Then** I see:
- **Incident Summary**: Brief description of what happened
- **Timeline**: Key events (detection, containment, notification)
- **Impact**: Number of affected users, data types
- **Response**: Actions taken by ADVERT
- **Status**: Resolved, Ongoing investigation, etc.
- **FAQ**: Common questions answered
- **Updates**: Latest information (updated as investigation progresses)

**Given** I have questions about the breach
**When** I contact security@advert.app
**Then** I receive a response within 4 hours (priority support)
**And** I can request:
- Detailed information about my specific account
- Copy of the incident report (if applicable)
- Proof of remediation steps taken

**Given** ADVERT reports to regulatory authorities
**When** the breach is confirmed
**Then** ADVERT notifies:
- **GDPR**: National data protection authority (within 72 hours)
- **Local regulations**: Côte d'Ivoire data protection authority
- **Enterprise customers**: Contractual breach notification clauses

**Given** the incident is resolved
**When** the investigation is complete
**Then** ADVERT publishes a post-mortem:
- Root cause analysis
- Security improvements implemented
- Prevention measures for future
- Lessons learned

**Given** the feature is implemented
**When** I review technical details
**Then** incident management system:

**Database model:**
```prisma
model SecurityIncident {
  id              String   @id @default(cuid())
  incidentNumber  String   @unique // INC-2026-02-001
  detectedAt      DateTime
  severity        IncidentSeverity // CRITICAL, HIGH, MEDIUM, LOW
  status          IncidentStatus // DETECTED, INVESTIGATING, CONTAINED, RESOLVED
  affectedUsers   Int      // Count of affected users
  dataTypes       String[] // Types of data affected
  rootCause       String?  @db.Text
  description     String   @db.Text
  remediation     String?  @db.Text
  notifiedAt      DateTime? // When users were notified
  resolvedAt      DateTime?
  postMortemUrl   String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  notifications   BreachNotification[]
  @@index([severity, status])
  @@index([detectedAt])
}

model BreachNotification {
  id          String   @id @default(cuid())
  incidentId  String
  userId      String
  sentAt      DateTime @default(now())
  emailOpened Boolean  @default(false)
  openedAt    DateTime?
  actionTaken Boolean  @default(false) // Password reset completed
  incident    SecurityIncident @relation(fields: [incidentId], references: [id])
  user        User     @relation(fields: [userId], references: [id])
  @@index([incidentId, userId])
}

enum IncidentSeverity {
  CRITICAL
  HIGH
  MEDIUM
  LOW
}

enum IncidentStatus {
  DETECTED
  INVESTIGATING
  CONTAINED
  RESOLVED
}
```

**And** notification workflow (Inngest):
- `security/detect-incident` - triggered by monitoring/alerts
- `security/assess-severity` - determines impact and scope
- `security/notify-regulators` - sends GDPR notifications
- `security/notify-users` - sends user emails (batched)
- `security/track-response` - monitors password resets, user actions

**And** monitoring:
- Anomaly detection (unusual login patterns, data access)
- Rate limiting violations
- Failed authentication attempts
- API abuse
- Integration to SIEM (Security Information and Event Management)

---

### Story 13.10: SOC 2 Audit Reports and Compliance Documentation

As an **Enterprise customer evaluating ADVERT's security posture**,
I want **to access SOC 2 Type I and Type II audit reports**,
So that **I can verify ADVERT meets my organization's security and compliance requirements**.

**Acceptance Criteria:**

**Given** I am an Enterprise tier customer
**When** I navigate to `/settings/compliance`
**Then** I see the Compliance Dashboard:
- Page title: "Security & Compliance"
- Description: "Access audit reports, compliance documentation, and security certifications"
- Enterprise tier badge

**Given** I view the Compliance Dashboard
**When** the page loads
**Then** I see sections:
1. **SOC 2 Audit Reports**
2. **Security Certifications**
3. **Compliance Documentation**
4. **Security Policies**
5. **Contact Compliance Team**

**Given** I view the SOC 2 Audit Reports section
**When** I scroll to it
**Then** I see:
- **SOC 2 Type I Report** (Trust Services Criteria):
  - Report date: "December 31, 2025"
  - Auditor: "Deloitte & Touche LLP"
  - Status: "Passed" (green badge)
  - "Download Report (PDF)" button
  - File size: 45 pages, 2.3 MB
  - Requires NDA: Yes (must sign NDA to download)

- **SOC 2 Type II Report** (6-month audit period):
  - Report period: "July 1, 2025 - December 31, 2025"
  - Auditor: "Deloitte & Touche LLP"
  - Status: "Passed" (green badge)
  - "Download Report (PDF)" button
  - File size: 78 pages, 4.1 MB
  - Requires NDA: Yes

**Given** I click "Download Report" on SOC 2 Type II
**When** the download modal opens
**Then** I see NDA requirements:
- Title: "Non-Disclosure Agreement Required"
- "SOC 2 reports contain sensitive information about ADVERT's security controls."
- "To access this report, please review and sign our NDA."
- **NDA Summary**:
  - You agree not to share this report with third parties
  - Report is for internal evaluation purposes only
  - Valid for 12 months from signature date
- Checkbox: ☑ "I have read and agree to the NDA terms"
- "View Full NDA" (link to PDF)
- "Sign and Download" button

**Given** I check the box and click "Sign and Download"
**When** the NDA is signed
**Then** the report downloads immediately
**And** my signature is recorded:
- Signatory: Sarah Johnson (sarah@acme.com)
- Company: Acme Marketing Group
- Signed on: February 5, 2026 14:30 UTC
- IP address: 41.203.123.45

**And** I receive a confirmation email:
- Subject: "NDA Signed - SOC 2 Type II Report Access Granted"
- Body includes: NDA reference, expiration date, report access instructions

**Given** I download the SOC 2 Type II Report
**When** I open the PDF
**Then** I see:
- **Report Structure**:
  - Executive Summary
  - Management Assertion
  - Independent Auditor's Opinion
  - System Description (ADVERT's services, infrastructure, boundaries)
  - Trust Services Criteria:
    - **Security**: Logical/physical access, system monitoring
    - **Availability**: System uptime, failover procedures
    - **Confidentiality**: Data classification, encryption
    - **Processing Integrity**: Data accuracy, completeness
    - **Privacy**: PII handling, GDPR compliance
  - Testing Results (controls tested over 6 months)
  - Exceptions (if any)
  - Management Response

**Given** I review the SOC 2 Type II findings
**When** I read the report
**Then** I see key control areas:
- **Access Controls**: Multi-factor authentication, role-based access
- **Encryption**: AES-256 at rest, TLS 1.3 in transit
- **Monitoring**: 24/7 security monitoring, incident response
- **Change Management**: Code review, CI/CD pipelines
- **Vendor Management**: Third-party risk assessments
- **Business Continuity**: Backup/recovery, disaster recovery
- **Compliance**: GDPR, data residency requirements

**Given** I view the Security Certifications section
**When** I scroll to it
**Then** I see:
- **ISO 27001**: Information Security Management System
  - Status: "Certified" (valid until Dec 2026)
  - Certificate number: ISO27001-2023-12345
  - "Download Certificate (PDF)"
- **GDPR Compliance**: General Data Protection Regulation
  - Status: "Compliant"
  - Data Processing Agreement (DPA) available
  - "Download DPA Template"
- **PCI DSS Level 1** (if applicable for payment processing):
  - Status: "Compliant" (via Stripe - SAQ A)
  - "View Attestation of Compliance"

**Given** I view the Compliance Documentation section
**When** I scroll to it
**Then** I see downloadable documents:
- **Data Processing Agreement (DPA)** - Template for GDPR Article 28
- **Subprocessor List** - Third-party services with data access
- **Security Whitepaper** - Technical security architecture overview
- **Privacy Policy** - User data handling practices
- **Terms of Service** - Legal agreement
- **Service Level Agreement (SLA)** - Uptime guarantees (Enterprise only)
- **Business Continuity Plan** - Disaster recovery procedures
- **Incident Response Plan** - Security incident procedures

**Given** I view the Security Policies section
**When** I scroll to it
**Then** I see:
- **Information Security Policy**
- **Access Control Policy**
- **Encryption Policy**
- **Vulnerability Management Policy**
- **Incident Response Policy**
- **Data Retention Policy**
- **Business Continuity and Disaster Recovery Policy**

**Given** I want to request additional compliance information
**When** I click "Contact Compliance Team"
**Then** I see a contact form:
- Subject: "Compliance Inquiry - SOC 2 Type II Report"
- Message: "I have questions about your encryption key management..."
- "Send Message" button

**And** the compliance team receives my inquiry
**And** I receive a response within 1 business day

**Given** I am a Professional tier user (not Enterprise)
**When** I navigate to `/settings/compliance`
**Then** I see a paywall:
- "Security & Compliance - Enterprise Feature"
- "Access to SOC 2 audit reports, compliance documentation, and security certifications requires Enterprise tier."
- Feature list (SOC 2, ISO 27001, DPA, security policies)
- "Contact Sales" button

**Given** ADVERT undergoes annual SOC 2 audits
**When** a new report is available
**Then** Enterprise customers are notified:
- Email: "New SOC 2 Type II Report Available"
- "The latest SOC 2 Type II report (Jan-Jun 2026) is now available for download."
- Link to Compliance Dashboard

**Given** the feature is implemented
**When** I review technical details
**Then** database model:
```prisma
model ComplianceDocument {
  id            String   @id @default(cuid())
  documentType  ComplianceDocType
  title         String
  description   String?  @db.Text
  fileUrl       String   // Vercel Blob URL (private)
  fileSize      Int      // bytes
  version       String   // "2025 Type II", "v1.3"
  effectiveDate DateTime @db.Date
  expiresAt     DateTime? @db.Date
  requiresNDA   Boolean  @default(false)
  tierRequired  SubscriptionTier // ENTERPRISE, PROFESSIONAL, etc.
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  downloads     DocumentDownload[]
  @@index([documentType, tierRequired])
}

model DocumentDownload {
  id          String   @id @default(cuid())
  documentId  String
  userId      String
  downloadedAt DateTime @default(now())
  ipAddress   String
  ndaSigned   Boolean  @default(false)
  ndaSignedAt DateTime?
  document    ComplianceDocument @relation(fields: [documentId], references: [id])
  user        User     @relation(fields: [userId], references: [id])
  @@index([userId, documentId])
}

enum ComplianceDocType {
  SOC2_TYPE_I
  SOC2_TYPE_II
  ISO_27001
  GDPR_DPA
  SECURITY_WHITEPAPER
  PRIVACY_POLICY
  TERMS_OF_SERVICE
  SLA
  INCIDENT_RESPONSE
}
```

**And** tRPC procedures:
- `compliance.listDocuments()` - returns available docs for user's tier
- `compliance.downloadDocument({ documentId, signNDA })` - downloads doc
- `compliance.signNDA({ documentId })` - records NDA signature
- `compliance.requestComplianceInfo({ subject, message })` - contact form

---

### Story 13.11: Automated Backup and Recovery System

As an **ADVERT administrator**,
I want **automated daily backups with 30-day retention and point-in-time recovery**,
So that **we can recover from data loss, corruption, or disasters without significant downtime**.

**Acceptance Criteria:**

**Given** ADVERT operates in production
**When** the backup schedule runs
**Then** automated backups are performed:
- **Frequency**: Daily at 02:00 UTC (low-traffic time)
- **Retention**: 30 days (rolling window)
- **Backup types**:
  - Full database backup (PostgreSQL pg_dump)
  - File storage backup (Vercel Blob metadata)
  - Configuration backup (environment variables, secrets metadata - not actual secrets)

**Given** the daily backup job runs
**When** it executes at 02:00 UTC
**Then** the backup process:
1. Creates a PostgreSQL dump:
   - Command: `pg_dump --format=custom --compress=9 advert_production > backup-2026-02-05.dump`
   - Encryption: AES-256 during dump
   - File size: ~500 MB compressed
2. Uploads to AWS S3 backup bucket:
   - Bucket: `advert-backups` (private, versioning enabled)
   - Path: `s3://advert-backups/daily/2026-02-05/database-2026-02-05-02-00.dump.enc`
   - Encryption: SSE-KMS (server-side encryption with AWS KMS)
3. Captures Vercel Blob file manifest:
   - List of all files with metadata (paths, sizes, timestamps)
   - Saved as JSON: `blob-manifest-2026-02-05.json`
4. Logs backup completion:
   - Status: SUCCESS or FAILED
   - Duration: 8 minutes 32 seconds
   - Size: 487 MB
   - Verification: Checksum (SHA-256)

**Given** a backup completes successfully
**When** the job finishes
**Then** a verification check runs:
- Restore test: Attempt to restore backup to staging environment
- Checksum verification: Compare checksums
- Integrity check: Query test records from restored DB
- If verification fails: Alert security team immediately

**Given** I am an admin
**When** I navigate to `/admin/backups`
**Then** I see the Backup Dashboard:
- **Last Backup**: February 5, 2026 02:00 UTC (Status: Success, 487 MB, 8m 32s)
- **Next Backup**: February 6, 2026 02:00 UTC (in 18 hours)
- **Retention**: 30 days (30 backups stored)
- **Total Storage**: 14.2 GB (30 daily backups)
- **Backup Health**: All systems operational (green)

**Given** I view the backup history table
**When** I scroll down
**Then** I see:
- Columns: Date, Status, Size, Duration, Verification, Actions
- Example rows:
  - `2026-02-05 02:00`, `Success` (green), `487 MB`, `8m 32s`, `Verified` (green), "Restore"/"Download"
  - `2026-02-04 02:00`, `Success` (green), `485 MB`, `8m 45s`, `Verified` (green), "Restore"/"Download"
  - `2026-02-03 02:00`, `Failed` (red), `—`, `—`, `—`, "View Error"
  - ... (30 days of history)
- Pagination: 10 backups per page

**Given** a backup fails
**When** the job encounters an error (e.g., S3 unavailable, DB connection timeout)
**Then** the system:
1. Logs the failure with error details
2. Alerts the ops team via PagerDuty/email:
   - Subject: "🚨 Backup Failed - 2026-02-03 02:00 UTC"
   - Error: "S3 bucket unreachable after 3 retry attempts"
3. Retries the backup:
   - Retry 1: After 10 minutes
   - Retry 2: After 30 minutes
   - Retry 3: After 1 hour
4. If all retries fail: Escalate to on-call engineer

**Given** I need to restore from a backup
**When** I click "Restore" on a specific backup
**Then** I see a restoration modal:
- Title: "⚠️ Restore Database from Backup"
- Warning: "This will replace the current database with the backup from February 3, 2026 02:00 UTC."
- **Impact**:
  - All data created after February 3, 2026 02:00 UTC will be lost
  - Downtime: Estimated 15-30 minutes during restoration
  - Current production database will be backed up before restoration
- **Restoration Options**:
  - ☑ Restore to staging environment (test first - recommended)
  - ☐ Restore to production environment (requires confirmation)
- Input field: "Type RESTORE to confirm" (verification)
- "Cancel" / "Restore" (red button, destructive)

**Given** I type "RESTORE" and confirm
**When** I click "Restore"
**Then** the restoration process begins:
1. Create emergency backup of current DB (safety measure)
2. Put application in maintenance mode (users see "Scheduled Maintenance" page)
3. Download backup from S3
4. Decrypt backup file
5. Restore to PostgreSQL:
   - Command: `pg_restore --clean --if-exists backup-2026-02-03.dump`
6. Verify restoration (run integrity checks)
7. Bring application back online
8. Send notification: "Database restored successfully from 2026-02-03 backup"

**Given** the restoration completes
**When** the application comes back online
**Then** admins receive notification:
- Email: "Database Restoration Complete - 2026-02-03 Backup"
- Status: Success (green) or Failed (red)
- Duration: 22 minutes
- Verification: All integrity checks passed

**Given** I want point-in-time recovery (PITR)
**When** I need to restore to a specific timestamp (not just daily backup)
**Then** I can use PostgreSQL PITR:
- Requires: Write-Ahead Log (WAL) archiving enabled
- Granularity: Recover to any second within the last 30 days
- Process: Restore latest full backup + replay WAL logs to desired timestamp

**Given** disaster strikes (e.g., entire region failure)
**When** the primary infrastructure is unavailable
**Then** the disaster recovery plan activates:
1. Backups are stored in multiple regions (geo-redundancy):
   - Primary: AWS us-east-1
   - Secondary: AWS eu-west-1
2. Restore latest backup to disaster recovery environment
3. Update DNS to point to DR environment
4. RTO (Recovery Time Objective): 4 hours
5. RPO (Recovery Point Objective): 24 hours (last successful daily backup)

**Given** I want to verify backup integrity regularly
**When** the weekly verification job runs (every Sunday)
**Then** the system:
- Restores 3 random backups to staging
- Runs automated tests against restored databases
- Generates verification report
- Alerts if any backup fails verification

**Given** the feature is implemented
**When** I review technical details
**Then** database model:
```prisma
model Backup {
  id              String   @id @default(cuid())
  backupDate      DateTime @db.Date
  backupTime      DateTime // Actual timestamp of backup
  status          BackupStatus // SUCCESS, FAILED, IN_PROGRESS
  backupType      BackupType // FULL, INCREMENTAL
  fileSize        BigInt?  // bytes
  duration        Int?     // seconds
  s3Path          String?  // S3 object key
  checksum        String?  // SHA-256
  verified        Boolean  @default(false)
  verifiedAt      DateTime?
  errorMessage    String?  @db.Text
  createdAt       DateTime @default(now())
  restorations    Restoration[]
  @@index([backupDate, status])
}

model Restoration {
  id              String   @id @default(cuid())
  backupId        String
  environment     RestoreEnvironment // PRODUCTION, STAGING
  requestedBy     String   // User ID
  status          RestorationStatus // PENDING, IN_PROGRESS, COMPLETED, FAILED
  startedAt       DateTime
  completedAt     DateTime?
  duration        Int?     // seconds
  errorMessage    String?  @db.Text
  backup          Backup   @relation(fields: [backupId], references: [id])
  @@index([backupId, status])
}

enum BackupStatus {
  SUCCESS
  FAILED
  IN_PROGRESS
}

enum BackupType {
  FULL
  INCREMENTAL
}

enum RestoreEnvironment {
  PRODUCTION
  STAGING
}

enum RestorationStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  FAILED
}
```

**And** Inngest jobs:
- `backup/daily-full-backup` - runs at 02:00 UTC daily
- `backup/verify-backup` - runs after each backup
- `backup/weekly-integrity-check` - runs every Sunday
- `backup/cleanup-old-backups` - deletes backups > 30 days old

**And** monitoring/alerting:
- Backup failure alerts (PagerDuty + email)
- Backup size anomaly detection (flag if size deviates >20% from average)
- Verification failure alerts
- Storage capacity monitoring (alert if S3 bucket >80% quota)

---

### Story 13.12: Dedicated Infrastructure Request Workflow

As an **Enterprise customer with strict security or performance requirements**,
I want **to request dedicated infrastructure (isolated database, dedicated compute)**,
So that **my data is completely isolated from other tenants and I have guaranteed resources**.

**Acceptance Criteria:**

**Given** I am evaluating ADVERT Enterprise
**When** I have specific infrastructure requirements:
- Data residency requirements (must be hosted in specific region/country)
- Security isolation requirements (no shared infrastructure)
- Performance requirements (guaranteed resources, no "noisy neighbor" effect)
- Compliance requirements (dedicated environment for audit purposes)
**Then** I can request dedicated infrastructure

**Given** I am an Enterprise customer
**When** I navigate to `/settings/enterprise/infrastructure`
**Then** I see the Infrastructure Settings page:
- Page title: "Enterprise Infrastructure"
- **Current Plan**: Shared Multi-Tenant Infrastructure
  - Region: US East (Virginia)
  - Database: Shared PostgreSQL (isolated via RLS)
  - Compute: Shared serverless (Vercel)
  - Storage: Shared Vercel Blob
- **Upgrade Available**: Dedicated Infrastructure
  - Dedicated PostgreSQL database
  - Dedicated compute instances
  - Dedicated storage bucket
  - Custom region selection
  - Starting at +€2,000/month
- "Request Dedicated Infrastructure" button

**Given** I click "Request Dedicated Infrastructure"
**When** the request form modal opens
**Then** I see:
- Title: "Request Dedicated Infrastructure"
- Description: "Get a completely isolated environment with dedicated resources"

**Form fields:**
- **Deployment Region** (required, dropdown):
  - US East (Virginia)
  - US West (Oregon)
  - Europe (Ireland)
  - Europe (Frankfurt)
  - Africa (Cape Town)
  - Custom region (specify)
- **Infrastructure Requirements** (checkboxes):
  - ☑ Dedicated PostgreSQL database (private RDS instance)
  - ☑ Dedicated compute resources (reserved Vercel instances)
  - ☑ Dedicated storage bucket (private S3 bucket)
  - ☐ Private VPC with VPN access
  - ☐ Custom domain (e.g., acme.advert.app)
  - ☐ Private subnet/IP whitelist
- **Performance Tier** (radio buttons):
  - Standard: 2 vCPU, 4 GB RAM, 100 GB storage
  - Enhanced: 4 vCPU, 8 GB RAM, 250 GB storage
  - Premium: 8 vCPU, 16 GB RAM, 500 GB storage
- **Estimated Monthly Cost**: €2,500/month (auto-calculated based on selections)
- **Justification** (optional, 500 chars):
  - "We require data residency in EU for GDPR compliance. Our legal team mandates dedicated infrastructure for audit purposes."
- **Preferred Start Date**: ASAP, Within 1 month, Within 3 months
- "Submit Request" button

**Given** I fill in the form
**And** I select:
- Region: Europe (Frankfurt)
- Requirements: Dedicated DB, Dedicated compute, Dedicated storage, Private VPC
- Performance: Enhanced
- Estimated cost: €4,200/month
**And** I click "Submit Request"
**Then** the request is submitted
**And** I see confirmation:
- "Dedicated Infrastructure Request Submitted"
- Request ID: DIN-2026-02-001
- "Our Enterprise team will contact you within 1 business day to discuss your requirements and provide a detailed quote."

**And** I receive a confirmation email:
- Subject: "Your Dedicated Infrastructure Request - Ref #DIN-2026-02-001"
- Body:
  ```
  Hi Sarah,

  We've received your request for dedicated infrastructure.

  Request ID: DIN-2026-02-001
  Requested: February 5, 2026 14:30 UTC

  Your Requirements:
  - Region: Europe (Frankfurt)
  - Dedicated PostgreSQL database
  - Dedicated compute resources (Enhanced: 4 vCPU, 8 GB RAM)
  - Dedicated storage bucket
  - Private VPC with VPN access
  - Estimated cost: €4,200/month

  What happens next:
  1. Our Enterprise Solutions Architect will review your requirements (within 24 hours)
  2. We'll schedule a call to discuss your needs and finalize specifications
  3. We'll provide a detailed quote with implementation timeline
  4. Upon approval, we'll provision your dedicated environment (3-5 business days)

  Your dedicated account manager:
  Name: Michael Chen
  Email: michael.chen@advert.com
  Phone: +1 555-987-6543

  Questions? Reply to this email or call Michael directly.

  Reference: DIN-2026-02-001
  ```

**Given** the ADVERT team reviews my request
**When** they assess my requirements
**Then** they prepare a detailed proposal:

**Proposal Document (sent within 3 business days):**
- **Executive Summary**: Recommended dedicated infrastructure architecture
- **Technical Specifications**:
  - Dedicated PostgreSQL RDS instance (db.r5.xlarge: 4 vCPU, 32 GB RAM)
  - Dedicated Vercel compute (reserved capacity)
  - Private S3 bucket with encryption
  - VPC configuration (private subnet, NAT gateway, VPN endpoint)
  - Region: EU-Central-1 (Frankfurt)
- **Security Enhancements**:
  - Isolated network (no shared infrastructure)
  - Custom SSL certificate
  - IP whitelisting for VPN access
  - Dedicated audit logging
- **Performance Guarantees**:
  - No "noisy neighbor" effect
  - Guaranteed 4 vCPU, 32 GB RAM
  - 99.9% uptime SLA (with service credits)
  - <100ms query response time (P95)
- **Compliance**:
  - Data residency: EU (GDPR compliant)
  - SOC 2 Type II audit specific to dedicated environment
  - Custom data retention policies
- **Pricing**:
  - Monthly cost: €5,200/month (billed annually: €62,400/year)
  - Setup fee: €3,000 (one-time)
  - Included: Infrastructure, maintenance, monitoring, support
  - Not included: Data transfer costs (billed separately)
- **Implementation Timeline**:
  - Contract signed: Day 0
  - Infrastructure provisioning: Days 1-3
  - Data migration: Days 4-5
  - Testing and validation: Days 6-7
  - Go-live: Day 8 (within 10 business days from contract signature)

**Given** I accept the proposal
**When** I sign the contract
**Then** ADVERT provisions my dedicated infrastructure:
1. **Day 1-2**: Provision resources
   - Create dedicated PostgreSQL RDS instance
   - Reserve Vercel compute capacity
   - Create private S3 bucket
   - Configure VPC and networking
2. **Day 3-4**: Configuration and security
   - SSL certificate installation
   - VPN setup
   - Firewall rules and IP whitelist
   - Monitoring and alerting setup
3. **Day 5-6**: Data migration
   - Export data from shared environment
   - Import to dedicated database
   - Verification and integrity checks
4. **Day 7**: Testing
   - Performance testing
   - Security testing
   - User acceptance testing
5. **Day 8**: Go-live
   - DNS cutover
   - Monitoring active
   - Dedicated support hotline active

**Given** my dedicated infrastructure is provisioned
**When** I log in to ADVERT
**Then** I see indicators:
- Badge: "Dedicated Infrastructure" (Enterprise badge)
- Dashboard footer: "Hosted in: EU-Frankfurt (Dedicated)"
- Settings page shows:
  - Infrastructure Type: Dedicated
  - Region: EU-Central-1 (Frankfurt)
  - Database: Dedicated PostgreSQL RDS
  - Compute: Reserved Vercel capacity
  - VPN Access: Enabled
  - Custom domain: acme.advert.app

**Given** I have dedicated infrastructure
**When** I navigate to `/settings/enterprise/infrastructure`
**Then** I see:
- **Infrastructure Details**:
  - Type: Dedicated
  - Region: EU-Frankfurt
  - Database: PostgreSQL (4 vCPU, 32 GB RAM, 250 GB storage)
  - Uptime: 99.97% (last 30 days)
  - Performance: Avg query time 45ms (P95: 89ms)
- **VPN Access**:
  - VPN endpoint: vpn.acme.advert.app
  - Status: Connected (green)
  - "Download VPN Config" button
- **Monitoring**:
  - CPU usage: 32% (last hour)
  - Memory usage: 18 GB / 32 GB (56%)
  - Storage: 87 GB / 250 GB (35%)
  - Active connections: 12 / 100
- **Support**:
  - Dedicated account manager: Michael Chen
  - 24/7 support hotline: +1 555-987-6543
  - "Contact Support" button

**Given** the feature is implemented
**When** I review technical details
**Then** database model:
```prisma
model DedicatedInfrastructure {
  id              String   @id @default(cuid())
  requestNumber   String   @unique // DIN-2026-02-001
  tenantId        String   @unique // One dedicated infra per tenant
  region          String   // eu-central-1, us-east-1, etc.
  status          InfraStatus // REQUESTED, PROVISIONING, ACTIVE, DECOMMISSIONED
  databaseInstance String? // RDS instance ID
  computeReserved  Boolean  @default(false)
  storageConfig   Json?    // S3 bucket details, VPC config
  vpcEnabled      Boolean  @default(false)
  vpcEndpoint     String?
  customDomain    String?
  monthlyCost     Decimal  @db.Decimal(10, 2)
  setupFee        Decimal? @db.Decimal(10, 2)
  provisionedAt   DateTime?
  goLiveAt        DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  tenant          Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  @@index([status, tenantId])
}

enum InfraStatus {
  REQUESTED
  PROVISIONING
  ACTIVE
  DECOMMISSIONED
}
```

**And** provisioning workflow (Inngest + Infrastructure-as-Code):
- Terraform/Pulumi scripts to provision resources
- Automated testing and validation
- Monitoring setup (DataDog, CloudWatch)
- Alerting configuration

---

**Epic 13 Complete!**

Epic 13: Compliance, Security & Enterprise Features (12 stories) is now fully documented with comprehensive acceptance criteria covering:
- Enterprise sales contact and custom quote workflow with detailed inquiry forms
- Bank transfer payment processing (NET 30 terms) with invoice generation and tracking
- Additional user provisioning and billing (€49/month per user)
- Privacy policy and terms of service acceptance with consent tracking
- GDPR data deletion workflow (right to be forgotten) with 7-day grace period
- Complete data export in JSON format (data portability)
- Comprehensive audit log dashboard with filtering and export
- Encryption infrastructure (AES-256 at rest, TLS 1.3 in transit) with key management
- Security breach notification system (72-hour GDPR compliance)
- SOC 2 audit reports and compliance documentation with NDA requirements
- Automated backup and recovery system with 30-day retention and point-in-time recovery
- Dedicated infrastructure request workflow with custom region and performance tiers

**Key Technical Highlights:**
- GDPR Article 33/34 compliance (breach notifications within 72 hours)
- SOC 2 Type I and Type II audit reports with NDA workflow
- AES-256 encryption at rest, TLS 1.3 in transit
- Automated daily backups with 30-day retention
- Comprehensive audit logs with 90-day retention (Enterprise)
- Dedicated infrastructure options (isolated DB, compute, storage, VPC)
- Bank transfer payment processing (NET 30 terms)
- User provisioning and per-user billing
- Data export in JSON format (GDPR data portability)

**Next Steps:**
- Epic 14: PWA, Accessibility & UX Polish

---

## EPIC 14: PWA, ACCESSIBILITY & UX POLISH

**Epic Goal:** Deliver exceptional user experience with Progressive Web App capabilities, full accessibility compliance, multilingual support, and delightful interactions across all devices.

**FRs Covered:** UX requirements from design specification (no numbered FRs, but critical for user adoption)

**NFRs Addressed:** NFR-A1 to NFR-A5 (all accessibility requirements), UX requirements

**Stories:**
- 14.1: Progressive Web App (PWA) Setup and Service Worker
- 14.2: Offline Editing Capabilities and Intelligent Sync
- 14.3: Keyboard Navigation and Documented Shortcuts
- 14.4: WCAG 2.1 Level AA Compliance (Semantic HTML, ARIA, Color Contrast)
- 14.5: Screen Reader Support and Testing
- 14.6: French Localization (i18n) for Francophone African Markets
- 14.7: Responsive Design Optimization (Desktop, Laptop, Tablet, Mobile)
- 14.8: Touch Optimization for Mobile Experience
- 14.9: Framer Motion Animations and Micro-Celebrations
- 14.10: Interactive Onboarding Tutorial and First-Time User Experience

---

### Story 14.1: Progressive Web App (PWA) Setup and Service Worker

As a **user who frequently accesses ADVERT on desktop or mobile**,
I want **ADVERT to be installable as a Progressive Web App with offline capabilities**,
So that **I can access it like a native app without browser chrome and continue working offline**.

**Acceptance Criteria:**

**Given** ADVERT is configured as a PWA
**When** I visit `https://advert.app` in a supported browser
**Then** the browser detects it as installable:
- Chrome/Edge: "Install ADVERT" icon appears in address bar
- Safari: "Add to Home Screen" available in Share menu
- Firefox: "Install" prompt available

**Given** I am using Chrome on desktop
**When** I visit ADVERT for the 2nd time (engagement heuristic)
**Then** I see an install prompt banner:
- "Install ADVERT for quick access and offline use"
- ADVERT icon and name
- "Install" button / "Not now" button

**Given** I click "Install"
**When** the installation completes
**Then** ADVERT opens in a standalone window:
- No browser address bar
- No browser tabs
- Custom title bar with ADVERT branding
- App icon in taskbar (Windows/macOS/Linux)
- Launches like a native application

**Given** I am using a mobile device (iOS/Android)
**When** I add ADVERT to my home screen
**Then** I see:
- ADVERT icon on home screen with custom app icon
- Splash screen on launch (ADVERT logo + brand colors)
- Full-screen experience (no browser UI)
- Status bar themed to match ADVERT colors

**Given** the PWA manifest is configured
**When** I inspect the manifest at `/manifest.json`
**Then** I see:
```json
{
  "name": "ADVERT - AI-Powered Brand Strategy",
  "short_name": "ADVERT",
  "description": "Create 6-pillar marketing strategies with AI co-pilot in <10 minutes",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "theme_color": "#6366F1",
  "background_color": "#FFFFFF",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/maskable-icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "categories": ["productivity", "business"],
  "screenshots": [
    {
      "src": "/screenshots/desktop-1.png",
      "sizes": "1920x1080",
      "type": "image/png",
      "form_factor": "wide"
    },
    {
      "src": "/screenshots/mobile-1.png",
      "sizes": "750x1334",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ]
}
```

**Given** the service worker is configured
**When** I inspect `/sw.js` (service worker)
**Then** I see caching strategies:
- **Cache-first**: Static assets (CSS, JS, images, fonts)
- **Network-first**: API calls (tRPC endpoints)
- **Stale-while-revalidate**: Strategy pages (show cached, fetch fresh in background)
- **Runtime caching**: Dynamic content with versioned cache names

**Given** I use ADVERT regularly
**When** the app is installed
**Then** the service worker caches:
- Core app shell (HTML, CSS, JS bundles)
- Static assets (icons, fonts, images)
- Recently viewed strategies (last 5)
- Dashboard data (cached for quick load)

**Given** ADVERT releases an update
**When** a new version is deployed
**Then** the service worker:
1. Detects the new version
2. Downloads new assets in background
3. Shows update notification: "New version available. Refresh to update."
4. Prompts user to reload: "Refresh Now" button
5. Clears old cache and installs new version

**Given** I want to uninstall the PWA
**When** I use the browser's uninstall option
**Then** ADVERT is removed:
- Chrome: Settings > Apps > ADVERT > Uninstall
- iOS: Long-press icon > Remove App
- Android: Long-press icon > Uninstall

**Given** the feature is implemented
**When** I review technical details
**Then** PWA configuration:

**Service Worker (`/src/sw.ts` with Workbox):**
```typescript
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

// Precache app shell (built at compile time)
precacheAndRoute(self.__WB_MANIFEST);

// Cache static assets (cache-first)
registerRoute(
  ({ request }) => ['style', 'script', 'image', 'font'].includes(request.destination),
  new CacheFirst({
    cacheName: 'static-assets',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// API calls (network-first with offline fallback)
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/trpc/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 10,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60, // 5 minutes
      }),
    ],
  })
);

// Strategy pages (stale-while-revalidate)
registerRoute(
  ({ url }) => url.pathname.startsWith('/strategies/'),
  new StaleWhileRevalidate({
    cacheName: 'strategies-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 24 * 60 * 60, // 24 hours
      }),
    ],
  })
);

// Listen for update messages
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
```

**Next.js PWA Plugin (`next.config.js`):**
```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: require('./pwa-cache-config'),
});

module.exports = withPWA({
  // Next.js config
});
```

**And** PWA testing:
- Lighthouse PWA audit: Score 100/100
- Manifest validation
- Service worker registration
- Offline functionality testing
- Install prompt testing across browsers

---

### Story 14.2: Offline Editing Capabilities and Intelligent Sync

As a **user working on strategies in areas with unreliable internet**,
I want **to edit strategies offline and have changes sync automatically when I reconnect**,
So that **I can work uninterrupted regardless of connectivity**.

**Acceptance Criteria:**

**Given** I am online and working on a strategy
**When** my internet connection drops
**Then** I see a subtle notification:
- Toast (bottom-left): "⚠️ You're offline. Changes will sync when you reconnect."
- Offline indicator in header: "Offline" badge (gray)
- Strategy editor remains fully functional

**Given** I am offline
**When** I edit a strategy:
- Change brand name: "Zahra Fashion" → "Zahra Fashion House"
- Update pillar 1 big idea
- Add a new tactic
**Then** all changes are saved locally:
- IndexedDB stores pending changes
- UI shows "Saved locally" indicator (cloud icon with sync indicator)
- No error messages or degraded experience

**Given** I have offline changes
**When** I view the changes indicator
**Then** I see:
- Cloud icon with orange dot: "3 changes pending sync"
- Tooltip: "You have unsaved changes that will sync when online"

**Given** I am offline and create a new strategy
**When** I fill in the strategy details and click "Generate"
**Then** the system:
- Queues the generation request locally
- Shows: "Strategy queued. Will generate when you're back online."
- Saves the strategy as "Draft (Offline)"

**Given** my internet connection returns
**When** I come back online
**Then** the system automatically:
1. Detects connectivity restored
2. Shows toast: "✅ Back online. Syncing changes..."
3. Uploads pending changes to server
4. Resolves any conflicts (if any)
5. Shows toast: "✅ All changes synced successfully"
6. Updates offline indicator to "Online" (green)

**Given** I made offline changes
**And** another team member also edited the same strategy online
**When** I sync my changes
**Then** a conflict is detected
**And** I see a conflict resolution UI:
- Modal: "Sync Conflict Detected"
- "The strategy 'Zahra Fashion House' was edited by John Doe while you were offline."
- **Conflicting fields**:
  - Brand Name:
    - Your version (offline): "Zahra Fashion House"
    - Current version (server): "Zahra Fashion Co."
    - Radio buttons: ☑ Keep mine | ☐ Use theirs
  - Pillar 1 Big Idea:
    - Your version: "Heritage craftsmanship..."
    - Current version: "Authentic heritage..."
    - Radio buttons: ☐ Keep mine | ☑ Use theirs
- "Resolve Conflicts" button

**Given** I resolve all conflicts
**And** I click "Resolve Conflicts"
**Then** the merged changes are saved
**And** the strategy is updated with my selections

**Given** I want to see what data is available offline
**When** I navigate to `/settings/offline`
**Then** I see the Offline Settings page:
- **Offline Storage Status**:
  - Cached strategies: 12 strategies (23.4 MB)
  - Cached assets: 156 files (8.7 MB)
  - Total storage used: 32.1 MB / 50 MB available
  - "Clear Offline Data" button
- **Sync Status**:
  - Last sync: "2 minutes ago"
  - Pending changes: 0
  - "Sync Now" button (force sync)
- **Offline Preferences**:
  - ☑ Enable offline mode
  - ☑ Auto-sync when online
  - ☑ Download strategies for offline use (last 10 viewed)
  - ☐ Download all strategies (may use significant storage)

**Given** I enable "Download all strategies"
**When** I toggle the setting
**Then** the system:
- Shows progress: "Downloading 42 strategies for offline use... 18/42 (43%)"
- Downloads strategies in background
- Stores in IndexedDB
- Shows completion: "All strategies available offline (87.5 MB)"

**Given** I want to manually sync
**When** I click "Sync Now"
**Then** the system:
- Forces immediate sync of pending changes
- Fetches latest data from server
- Shows progress indicator
- Confirms: "Sync complete. Everything up to date."

**Given** I am running low on storage
**When** offline cache exceeds 80% of quota (40 MB / 50 MB)
**Then** I see a warning:
- Banner: "Offline storage almost full. Consider clearing old cached data."
- "Manage Storage" button (opens Offline Settings)

**Given** the feature is implemented
**When** I review technical details
**Then** offline architecture:

**IndexedDB Schema (via Dexie.js):**
```typescript
import Dexie, { Table } from 'dexie';

export interface OfflineStrategy {
  id: string;
  data: Strategy;
  lastModified: Date;
  syncStatus: 'synced' | 'pending' | 'conflict';
  pendingChanges?: Partial<Strategy>;
}

export interface SyncQueue {
  id?: number;
  operation: 'create' | 'update' | 'delete';
  resourceType: 'strategy' | 'pillar';
  resourceId: string;
  payload: any;
  timestamp: Date;
  retries: number;
}

class AdvertDatabase extends Dexie {
  strategies!: Table<OfflineStrategy>;
  syncQueue!: Table<SyncQueue>;

  constructor() {
    super('AdvertOfflineDB');
    this.version(1).stores({
      strategies: 'id, lastModified, syncStatus',
      syncQueue: '++id, timestamp, resourceType',
    });
  }
}

export const db = new AdvertDatabase();
```

**Offline Sync Manager:**
```typescript
export class OfflineSyncManager {
  async saveOfflineChange(strategy: Strategy, changes: Partial<Strategy>) {
    await db.strategies.put({
      id: strategy.id,
      data: strategy,
      lastModified: new Date(),
      syncStatus: 'pending',
      pendingChanges: changes,
    });

    await db.syncQueue.add({
      operation: 'update',
      resourceType: 'strategy',
      resourceId: strategy.id,
      payload: changes,
      timestamp: new Date(),
      retries: 0,
    });
  }

  async syncPendingChanges() {
    const pendingItems = await db.syncQueue.where('retries').below(3).toArray();

    for (const item of pendingItems) {
      try {
        await this.syncItem(item);
        await db.syncQueue.delete(item.id!);
      } catch (error) {
        // Increment retries, handle conflicts
        await db.syncQueue.update(item.id!, { retries: item.retries + 1 });
      }
    }
  }

  async syncItem(item: SyncQueue) {
    // Call tRPC mutation with item.payload
    // Handle conflicts if server version differs
  }
}
```

**Online/Offline Detection:**
```typescript
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Trigger sync
      syncManager.syncPendingChanges();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("You're offline. Changes will sync when you reconnect.");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
```

**And** conflict resolution strategy:
- Last-write-wins for most fields
- User-prompt for critical fields (brand name, pillar titles)
- Automatic merge for non-conflicting fields

---

### Story 14.3: Keyboard Navigation and Documented Shortcuts

As a **power user who prefers keyboard efficiency**,
I want **complete keyboard navigation and documented shortcuts for all key actions**,
So that **I can use ADVERT without a mouse and work faster**.

**Acceptance Criteria:**

**Given** I open ADVERT
**When** I press the `Tab` key
**Then** focus moves sequentially through all interactive elements:
- Logo/home link
- Navigation menu items
- Strategy cards
- Action buttons
- Form inputs
- Footer links
**And** each focused element has a visible focus ring (blue outline, 2px solid)

**Given** I navigate the main menu
**When** I use keyboard shortcuts
**Then** global shortcuts work:
- `Ctrl+K` (or `Cmd+K` on Mac): Open command palette/search
- `Ctrl+N`: Create new strategy
- `Ctrl+S`: Save current strategy
- `Ctrl+E`: Export current strategy
- `Esc`: Close modals/dropdowns
- `?`: Open keyboard shortcuts help modal

**Given** I press `Ctrl+K`
**When** the command palette opens
**Then** I see a search interface:
- Input field (auto-focused): "Search strategies, commands..."
- Commands list:
  - "Create New Strategy" (Ctrl+N)
  - "Export Strategy" (Ctrl+E)
  - "View Dashboard" (Ctrl+D)
  - "Go to Analytics" (Ctrl+A)
  - "Settings" (Ctrl+,)
- Recent strategies:
  - "Zahra Fashion House"
  - "Kweku's Coffee"
- Type to filter commands and strategies
- Arrow keys to navigate, Enter to execute

**Given** I am editing a strategy
**When** I use editor shortcuts
**Then** they work:
- `Ctrl+S`: Save strategy
- `Ctrl+Z`: Undo
- `Ctrl+Y` (or `Ctrl+Shift+Z`): Redo
- `Ctrl+B`: Bold text (if rich text editor)
- `Ctrl+I`: Italic text
- `Tab`: Indent (in text areas)
- `Shift+Tab`: Outdent

**Given** I am viewing a strategy
**When** I use navigation shortcuts
**Then** they work:
- `J`: Scroll down / Next pillar
- `K`: Scroll up / Previous pillar
- `E`: Edit current pillar
- `X`: Expand/collapse current pillar
- `G then H`: Go to home/dashboard
- `G then S`: Go to strategies list
- `G then A`: Go to analytics

**Given** I am in a modal or dropdown
**When** I press `Esc`
**Then** the modal/dropdown closes
**And** focus returns to the trigger element

**Given** I want to see all keyboard shortcuts
**When** I press `?` (question mark)
**Then** a keyboard shortcuts modal opens:

**Shortcuts Modal:**
- Title: "Keyboard Shortcuts"
- Organized by category:

**Global Shortcuts:**
- `Ctrl+K`: Command palette
- `Ctrl+N`: New strategy
- `Ctrl+S`: Save
- `Ctrl+E`: Export
- `Esc`: Close modal
- `?`: This help

**Navigation:**
- `J`: Scroll down / Next item
- `K`: Scroll up / Previous item
- `G H`: Go to home
- `G S`: Go to strategies
- `G A`: Go to analytics

**Editing:**
- `Ctrl+Z`: Undo
- `Ctrl+Y`: Redo
- `Ctrl+B`: Bold
- `Ctrl+I`: Italic
- `Tab`: Indent
- `Shift+Tab`: Outdent

**Search & Command:**
- `Ctrl+K`: Command palette
- `/`: Focus search
- `Esc`: Clear search

**Modal ends with:**
- Footer: "Tip: Hold Ctrl (or Cmd on Mac) to see more shortcuts in context"
- "Close" button (or press Esc)

**Given** I am using a screen reader
**When** I navigate with keyboard
**Then** ARIA live regions announce:
- "Navigated to Strategies page"
- "Opened command palette"
- "Strategy saved successfully"
- "Modal closed"

**Given** I am on a Mac
**When** I use keyboard shortcuts
**Then** `Cmd` replaces `Ctrl`:
- `Cmd+K`: Command palette
- `Cmd+N`: New strategy
- `Cmd+S`: Save
- etc.

**Given** the feature is implemented
**When** I review technical details
**Then** keyboard shortcuts implementation:

**Global Shortcuts Hook:**
```typescript
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export function useKeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? event.metaKey : event.ctrlKey;

      // Command palette
      if (modKey && event.key === 'k') {
        event.preventDefault();
        openCommandPalette();
      }

      // New strategy
      if (modKey && event.key === 'n') {
        event.preventDefault();
        router.push('/strategies/new');
      }

      // Save
      if (modKey && event.key === 's') {
        event.preventDefault();
        saveCurrentStrategy();
      }

      // Export
      if (modKey && event.key === 'e') {
        event.preventDefault();
        exportCurrentStrategy();
      }

      // Help
      if (event.key === '?' && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        openShortcutsModal();
      }

      // Escape (close modals)
      if (event.key === 'Escape') {
        closeAllModals();
      }

      // Vim-style navigation
      if (event.key === 'j' && !isInputFocused()) {
        event.preventDefault();
        scrollDown();
      }
      if (event.key === 'k' && !isInputFocused()) {
        event.preventDefault();
        scrollUp();
      }

      // Go to commands (g + h, g + s, etc.)
      if (event.key === 'g' && !isInputFocused()) {
        setWaitingForSecondKey('g');
      }
    };

    const isInputFocused = () => {
      const activeElement = document.activeElement;
      return (
        activeElement?.tagName === 'INPUT' ||
        activeElement?.tagName === 'TEXTAREA' ||
        activeElement?.isContentEditable
      );
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);
}
```

**Focus Management:**
```typescript
export function useFocusTrap(isOpen: boolean, ref: RefObject<HTMLElement>) {
  useEffect(() => {
    if (!isOpen) return;

    const element = ref.current;
    if (!element) return;

    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    element.addEventListener('keydown', handleTab);
    firstElement.focus();

    return () => element.removeEventListener('keydown', handleTab);
  }, [isOpen, ref]);
}
```

**And** visual focus indicators (global CSS):
```css
/* Global focus styles */
*:focus-visible {
  outline: 2px solid #6366F1; /* Indigo-500 */
  outline-offset: 2px;
  border-radius: 4px;
}

/* Button focus */
button:focus-visible {
  outline: 2px solid #6366F1;
  outline-offset: 2px;
}

/* Link focus */
a:focus-visible {
  outline: 2px solid #6366F1;
  outline-offset: 2px;
}

/* Skip to main content link */
.skip-to-main {
  position: absolute;
  top: -100px;
  left: 0;
  background: #6366F1;
  color: white;
  padding: 8px 16px;
  text-decoration: none;
  z-index: 9999;
}

.skip-to-main:focus {
  top: 0;
}
```

---

### Story 14.4: WCAG 2.1 Level AA Compliance (Semantic HTML, ARIA, Color Contrast)

As a **user with disabilities or accessibility needs**,
I want **ADVERT to meet WCAG 2.1 Level AA standards**,
So that **I can use all features regardless of my abilities (visual, auditory, motor, cognitive)**.

**Acceptance Criteria:**

**Given** ADVERT is built with accessibility in mind
**When** I run automated accessibility tests (axe, Lighthouse)
**Then** I achieve:
- Lighthouse Accessibility score: 95+ / 100
- axe DevTools: 0 violations
- WAVE browser extension: 0 errors

**Given** ADVERT uses semantic HTML
**When** I inspect the DOM structure
**Then** I see proper semantic elements:
- `<header>` for site header with logo and navigation
- `<nav>` for navigation menus with `aria-label="Main navigation"`
- `<main>` for primary content with `id="main"`
- `<section>` for distinct sections
- `<article>` for strategy cards
- `<aside>` for sidebars
- `<footer>` for site footer
- `<h1>` to `<h6>` in logical hierarchy (no skipped levels)
- `<button>` for buttons (not `<div onclick>`)
- `<a href>` for links (with meaningful text, not "click here")

**Given** I view a strategy page
**When** I inspect the heading structure
**Then** I see logical hierarchy:
- `<h1>`: "Zahra Fashion House - Brand Strategy" (page title, only one H1)
- `<h2>`: "Pillar 1: Heritage Craftsmanship" (pillar titles)
- `<h3>`: "Big Idea", "Tactics", "KPIs" (subsections)
- `<h4>`: Individual tactic titles (if needed)
- No skipped levels (no h1 → h3 without h2)

**Given** ADVERT uses proper ARIA attributes
**When** I inspect interactive elements
**Then** I see:
- Buttons: `<button aria-label="Export strategy">` (if icon-only)
- Links: `<a href="/strategies/123" aria-label="View Zahra Fashion House strategy">`
- Form inputs: `<input id="brand-name" aria-describedby="brand-name-help" aria-required="true">`
- Modals: `<div role="dialog" aria-modal="true" aria-labelledby="modal-title">`
- Dropdowns: `<button aria-expanded="false" aria-haspopup="true">`
- Tabs: `<button role="tab" aria-selected="true" aria-controls="panel-1">`
- Loading states: `<div role="status" aria-live="polite">Loading strategies...</div>`

**Given** ADVERT provides text alternatives
**When** I inspect images and icons
**Then** I see:
- Images: `<img src="zahra-logo.png" alt="Zahra Fashion House logo">`
- Decorative images: `<img src="pattern.svg" alt="" role="presentation">` (empty alt)
- Icons with semantic meaning: `<svg aria-label="Export"><path...></svg>`
- Icons purely decorative: `<svg aria-hidden="true"><path...></svg>`

**Given** ADVERT uses sufficient color contrast
**When** I check text and background colors
**Then** contrast ratios meet WCAG AA:
- **Normal text** (< 18pt): 4.5:1 minimum
  - Example: #1F2937 (gray-800) on #FFFFFF (white) = 15.8:1 ✅
- **Large text** (≥ 18pt or ≥ 14pt bold): 3:1 minimum
  - Example: #6B7280 (gray-500) on #FFFFFF = 4.6:1 ✅
- **UI components** (buttons, borders): 3:1 minimum
  - Example: Button border #D1D5DB (gray-300) on #FFFFFF = 1.3:1 ❌ → Use #9CA3AF (gray-400) = 2.8:1 ✅

**Given** I am colorblind
**When** I view ADVERT
**Then** information is not conveyed by color alone:
- Success: Green checkmark icon + "Success" text
- Error: Red X icon + "Error" text
- Warning: Yellow warning icon + "Warning" text
- Required fields: Red asterisk + "required" label

**Given** ADVERT uses forms
**When** I inspect form inputs
**Then** I see proper labeling:
```html
<label for="brand-name">Brand Name <span class="text-red-500">*</span></label>
<input
  type="text"
  id="brand-name"
  name="brandName"
  aria-required="true"
  aria-describedby="brand-name-help brand-name-error"
/>
<span id="brand-name-help" class="text-sm text-gray-600">
  Enter your brand's official name
</span>
<span id="brand-name-error" role="alert" aria-live="assertive" class="text-red-600">
  Brand name is required
</span>
```

**Given** I use keyboard navigation
**When** I tab through the page
**Then** focus order is logical:
- Top to bottom, left to right
- All interactive elements reachable
- No focus traps (except intentional modal traps)
- Skip link available: "Skip to main content" (visible on focus)

**Given** I encounter interactive elements
**When** I interact with them
**Then** they have clear focus indicators:
- 2px solid outline (#6366F1 indigo)
- 2px offset from element
- Visible on all backgrounds
- Not removed by CSS (`outline: none` forbidden)

**Given** I use motion-sensitive settings
**When** I have `prefers-reduced-motion` enabled
**Then** animations are reduced/removed:
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**Given** I have low vision
**When** I zoom the page to 200%
**Then** the layout remains functional:
- No horizontal scrolling (up to 400% zoom)
- Text reflows properly
- No overlapping content
- All functionality accessible

**Given** ADVERT provides error messages
**When** I submit a form with errors
**Then** errors are announced and clear:
- Error summary at top: `<div role="alert" aria-live="assertive">Form contains 2 errors</div>`
- Inline errors linked: `aria-describedby="email-error"`
- Error focus moved to first error field
- Error messages descriptive: "Email is required" (not "Invalid input")

**Given** I use dynamic content
**When** content updates (loading, success, error)
**Then** changes are announced:
- Loading: `<div role="status" aria-live="polite">Loading strategies...</div>`
- Success: `<div role="alert" aria-live="assertive">Strategy saved successfully</div>`
- Error: `<div role="alert" aria-live="assertive">Failed to save strategy. Please try again.</div>`

**Given** the feature is implemented
**When** I review technical details
**Then** accessibility configuration:

**Accessibility Testing (CI/CD):**
```typescript
// cypress/e2e/accessibility.cy.ts
describe('Accessibility Tests', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.injectAxe(); // cypress-axe plugin
  });

  it('has no detectable accessibility violations on homepage', () => {
    cy.checkA11y();
  });

  it('has no detectable accessibility violations on strategy page', () => {
    cy.visit('/strategies/strat_123');
    cy.checkA11y();
  });

  it('meets contrast requirements', () => {
    cy.checkA11y(null, {
      rules: {
        'color-contrast': { enabled: true }
      }
    });
  });

  it('has proper heading hierarchy', () => {
    cy.get('h1').should('have.length', 1);
    cy.get('h2').should('exist');
    // No h1 → h3 skips
  });
});
```

**Semantic HTML Component:**
```typescript
export function StrategyCard({ strategy }: { strategy: Strategy }) {
  return (
    <article
      className="strategy-card"
      aria-labelledby={`strategy-${strategy.id}-title`}
    >
      <h3 id={`strategy-${strategy.id}-title`}>
        {strategy.brandName}
      </h3>
      <p className="text-gray-600">
        {strategy.industry}
      </p>
      <a
        href={`/strategies/${strategy.id}`}
        aria-label={`View ${strategy.brandName} strategy details`}
      >
        View Details
      </a>
    </article>
  );
}
```

**ARIA Live Regions:**
```typescript
export function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className={`toast toast-${type}`}
    >
      <Icon type={type} aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
```

**And** accessibility checklist:
- ✅ Semantic HTML5 elements
- ✅ ARIA attributes where needed
- ✅ Alt text for all images
- ✅ Color contrast 4.5:1 (normal text), 3:1 (large text, UI)
- ✅ Keyboard navigation (all features accessible)
- ✅ Focus indicators (visible, high contrast)
- ✅ Form labels and error messages
- ✅ ARIA live regions for dynamic content
- ✅ Skip navigation link
- ✅ Heading hierarchy (no skipped levels)
- ✅ Reduced motion support
- ✅ Zoom support (up to 200-400%)

---

### Story 14.5: Screen Reader Support and Testing

As a **blind or low-vision user using a screen reader**,
I want **ADVERT to be fully navigable and understandable with NVDA, JAWS, or VoiceOver**,
So that **I can independently use all features without visual cues**.

**Acceptance Criteria:**

**Given** I use a screen reader (NVDA, JAWS, VoiceOver)
**When** I navigate to ADVERT
**Then** I hear the page structure announced:
- "ADVERT - AI-Powered Brand Strategy - Main navigation - 4 items"
- "Link: Home, Link: Strategies, Link: Analytics, Button: Create New Strategy"

**Given** I navigate the main page
**When** I use screen reader navigation commands
**Then** I can navigate by:
- Headings (H key in NVDA/JAWS): Jump between H1, H2, H3, etc.
- Landmarks (D key): Jump between header, nav, main, footer
- Links (Tab / Link List): Navigate all links
- Buttons (B key): Jump between buttons
- Forms (F key): Jump to form fields

**Given** I land on a strategy page
**When** the page loads
**Then** I hear:
- "Zahra Fashion House - Brand Strategy - Main content - 6 sections"
- "Heading level 1: Zahra Fashion House"
- "Heading level 2: Pillar 1 - Heritage Craftsmanship"
- "Button: Edit pillar, Button: Expand/Collapse"

**Given** I navigate a form
**When** I tab through form fields
**Then** I hear proper labels and hints:
- "Brand Name, edit text, required, Enter your brand's official name"
- "Industry, combo box, Select your industry sector"
- "Target Audience Age, edit text, Example: 25-40"

**Given** I encounter an error
**When** I submit a form with validation errors
**Then** I hear:
- "Alert: Form contains 2 errors"
- "Email, edit text, required, invalid, Email is required"
- Focus moves to first error field

**Given** I use dynamic content (strategy generation)
**When** the AI generates a pillar
**Then** I hear progress updates:
- "Status: Generating pillar 1 of 6..."
- "Status: Pillar 1 complete"
- "Alert: Strategy generated successfully"

**Given** I interact with a modal
**When** a modal opens
**Then** I hear:
- "Dialog: Export Strategy"
- "Heading level 2: Choose Export Format"
- Focus trapped in modal (Tab cycles within modal)
- "Button: Cancel, Button: Export PDF"

**Given** I close a modal
**When** I press Escape or click Cancel
**Then** focus returns to the trigger button:
- "Button: Export Strategy, collapsed"

**Given** I navigate tables (analytics)
**When** I encounter data tables
**Then** tables have proper structure:
```html
<table>
  <caption>Strategy Performance Metrics</caption>
  <thead>
    <tr>
      <th scope="col">Strategy Name</th>
      <th scope="col">Coherence Score</th>
      <th scope="col">Created Date</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Zahra Fashion House</th>
      <td>81</td>
      <td>January 20, 2026</td>
    </tr>
  </tbody>
</table>
```
**And** I hear:
- "Table with 3 columns and 5 rows"
- "Strategy Name column header"
- "Row 1, Zahra Fashion House, Coherence Score 81, Created Date January 20, 2026"

**Given** I use buttons with icons only
**When** I tab to icon buttons
**Then** I hear descriptive labels:
- `<button aria-label="Export strategy"><IconDownload /></button>` → "Export strategy, button"
- `<button aria-label="Delete strategy"><IconTrash /></button>` → "Delete strategy, button"

**Given** I encounter loading states
**When** content is loading
**Then** I hear announcements:
- `<div role="status" aria-live="polite">Loading strategies...</div>` → "Loading strategies"
- No announcement spam (updates debounced)

**Given** I navigate a multi-step wizard
**When** I go through strategy creation steps
**Then** I hear progress:
- "Step 1 of 4: Brand Information"
- "Step 2 of 4: Interview Framework, current step"
- Breadcrumb: "Home, Strategies, Create Strategy, Step 2, current page"

**Given** I use custom components (accordions, tabs)
**When** I interact with them
**Then** they announce state:
- Accordion: `<button aria-expanded="false" aria-controls="pillar-1-content">Pillar 1: Heritage Craftsmanship</button>` → "Pillar 1: Heritage Craftsmanship, button, collapsed"
- Tabs: `<button role="tab" aria-selected="true" aria-controls="tab-panel-1">Overview</button>` → "Overview, tab, selected, 1 of 4"

**Given** ADVERT uses notifications/toasts
**When** a toast appears
**Then** I hear immediate announcement:
- `<div role="alert" aria-live="assertive">Strategy saved successfully</div>` → "Alert: Strategy saved successfully"
- Toast auto-dismisses after 5 seconds (no action required)

**Given** I test with multiple screen readers
**When** I run compatibility tests
**Then** ADVERT works with:
- **NVDA** (Windows, free): All features accessible
- **JAWS** (Windows, commercial): All features accessible
- **VoiceOver** (macOS/iOS, built-in): All features accessible
- **TalkBack** (Android, built-in): All features accessible

**Given** the feature is implemented
**When** I review technical details
**Then** screen reader optimization:

**ARIA Live Region Component:**
```typescript
export function AriaLive({
  message,
  priority = 'polite'
}: {
  message: string;
  priority?: 'polite' | 'assertive'
}) {
  return (
    <div
      role={priority === 'assertive' ? 'alert' : 'status'}
      aria-live={priority}
      aria-atomic="true"
      className="sr-only" // Screen reader only (visually hidden)
    >
      {message}
    </div>
  );
}
```

**Screen Reader Only Utility Class:**
```css
/* Visually hidden but accessible to screen readers */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Show on focus (for skip links) */
.sr-only-focusable:focus {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

**Modal with Focus Trap:**
```typescript
export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useFocusTrap(isOpen, modalRef); // Custom hook from Story 14.3

  useEffect(() => {
    if (isOpen) {
      // Save last focused element
      const lastFocused = document.activeElement as HTMLElement;

      // Move focus to modal
      modalRef.current?.focus();

      // Return focus on close
      return () => lastFocused?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="modal-title" ref={modalRef} tabIndex={-1}>
      <h2 id="modal-title">{title}</h2>
      {children}
      <button onClick={onClose} aria-label="Close dialog">Close</button>
    </div>
  );
}
```

**And** screen reader testing workflow:
1. Manual testing with NVDA (Windows) - weekly
2. Manual testing with VoiceOver (macOS) - weekly
3. Automated tests with @axe-core/react - every PR
4. User testing with blind users - monthly
5. Accessibility audit - quarterly

---

### Story 14.6: French Localization (i18n) for Francophone African Markets

As a **French-speaking user in Francophone Africa**,
I want **ADVERT fully localized in French**,
So that **I can use the platform in my native language without language barriers**.

**Acceptance Criteria:**

**Given** ADVERT supports multiple languages
**When** I visit ADVERT for the first time
**Then** the system detects my browser language:
- Browser language: `fr-FR` or `fr-*` → Default to French
- Browser language: `en-*` → Default to English
- Display language selector in header

**Given** I want to change language
**When** I click the language selector (header, right side)
**Then** I see a dropdown:
- 🇬🇧 English
- 🇫🇷 Français
- Current selection highlighted

**Given** I select "Français"
**When** I click it
**Then** the entire UI switches to French:
- Navigation: "Accueil", "Stratégies", "Analyses", "Paramètres"
- Buttons: "Créer une stratégie", "Exporter", "Enregistrer"
- Forms: "Nom de la marque", "Secteur d'activité"
- Messages: "Stratégie enregistrée avec succès"
- My preference saved to user profile

**Given** I view a strategy in French
**When** the page loads
**Then** I see:
- Page title: "Zahra Fashion House - Stratégie de Marque"
- Pillar titles: "Pilier 1: Authenticité", "Pilier 2: Distinction", etc.
- Buttons: "Modifier", "Exporter", "Dupliquer", "Archiver"
- Tooltips: "Cliquez pour développer le pilier"
- Status: "Actif", "Brouillon", "Archivé"

**Given** I create a new strategy in French
**When** I fill in the form
**Then** labels are in French:
- "Nom de la marque": "Maison de Mode Zahra"
- "Secteur d'activité": "Mode et Habillement"
- "Public cible (âge)": "25-40 ans"
- "Description du public": "Femmes professionnelles soucieuses de la mode"
- Placeholder text: "Ex: Femmes urbaines de 25-40 ans..."

**Given** I generate a strategy
**When** the AI co-pilot communicates
**Then** prompts are in French:
- "Parlons de votre marque. Quel est le nom de votre marque?"
- "Décrivez votre public cible en quelques mots."
- "Génial! Je génère maintenant votre stratégie à 8 piliers. Cela prendra environ 8 minutes."
- Progress: "Génération du pilier 2 sur 6..."
- Completion: "Stratégie générée avec succès! 🎉"

**Given** I encounter validation errors
**When** I submit incomplete form
**Then** error messages are in French:
- "Le nom de la marque est requis"
- "Veuillez sélectionner un secteur d'activité"
- "L'adresse email est invalide"
- "Le mot de passe doit contenir au moins 12 caractères"

**Given** I view notifications
**When** I receive toasts/alerts
**Then** they are in French:
- Success: "Stratégie enregistrée avec succès"
- Error: "Échec de l'enregistrement. Veuillez réessayer."
- Warning: "Vous êtes hors ligne. Les modifications seront synchronisées lors de la reconnexion."
- Info: "Nouvelle version disponible. Actualisez pour mettre à jour."

**Given** I view dates and times
**When** I see timestamps
**Then** they use French formatting:
- Date: "5 février 2026" (not "February 5, 2026")
- Time: "14h30" (not "2:30 PM")
- Relative: "Il y a 2 minutes", "Dans 3 jours"

**Given** I view numbers and currency
**When** I see formatted values
**Then** they use French conventions:
- Numbers: "1 234,56" (not "1,234.56")
- Currency: "299,00 €" or "299 €" (not "€299.00")
- Percentages: "85 %" (space before %)

**Given** I export a strategy
**When** I download PDF
**Then** the PDF is in French:
- Title: "Stratégie de Marque - Maison de Mode Zahra"
- Sections: "Piliers Stratégiques", "Tactiques", "Indicateurs de Performance"
- Footer: "Généré avec ADVERT le 5 février 2026"

**Given** I receive emails
**When** ADVERT sends me notifications
**Then** emails are in French:
- Subject: "Votre stratégie a été générée avec succès"
- Body: "Bonjour Sarah, Votre stratégie pour Maison de Mode Zahra est prête..."
- Buttons: "Voir la stratégie", "Gérer les paramètres"

**Given** content is user-generated (strategy data)
**When** I view strategies
**Then** user content remains in original language:
- Brand name: "Zahra Fashion House" (not translated)
- Pillar titles: User's input language preserved
- System UI: Translated to French
- Clear separation between system UI and user content

**Given** the AI generates content
**When** I use French language setting
**Then** AI responses are in French:
- Big ideas in French
- Tactics in French
- KPIs in French
- Explanations and tooltips in French

**Given** the feature is implemented
**When** I review technical details
**Then** i18n configuration:

**i18n Setup (next-i18next):**
```typescript
// next-i18next.config.js
module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr'],
    localeDetection: true,
  },
  reloadOnPrerender: process.env.NODE_ENV === 'development',
};
```

**Translation Files:**
```json
// public/locales/fr/common.json
{
  "nav": {
    "home": "Accueil",
    "strategies": "Stratégies",
    "analytics": "Analyses",
    "settings": "Paramètres"
  },
  "strategy": {
    "create": "Créer une stratégie",
    "edit": "Modifier",
    "export": "Exporter",
    "delete": "Supprimer",
    "duplicate": "Dupliquer",
    "archive": "Archiver",
    "status": {
      "active": "Actif",
      "draft": "Brouillon",
      "archived": "Archivé"
    }
  },
  "form": {
    "brandName": "Nom de la marque",
    "industry": "Secteur d'activité",
    "targetAudience": "Public cible",
    "save": "Enregistrer",
    "cancel": "Annuler"
  },
  "validation": {
    "required": "Ce champ est requis",
    "invalidEmail": "Adresse email invalide",
    "minLength": "Minimum {{count}} caractères requis"
  },
  "notifications": {
    "success": {
      "saved": "Stratégie enregistrée avec succès",
      "created": "Stratégie créée avec succès",
      "deleted": "Stratégie supprimée"
    },
    "error": {
      "saveFailed": "Échec de l'enregistrement. Veuillez réessayer.",
      "networkError": "Erreur de connexion. Vérifiez votre connexion Internet."
    }
  }
}
```

**Usage in Components:**
```typescript
import { useTranslation } from 'next-i18next';

export function StrategyCard({ strategy }: { strategy: Strategy }) {
  const { t } = useTranslation('common');

  return (
    <article>
      <h3>{strategy.brandName}</h3>
      <button>{t('strategy.edit')}</button>
      <button>{t('strategy.export')}</button>
      <span className="status">{t(`strategy.status.${strategy.status}`)}</span>
    </article>
  );
}
```

**Date/Number Formatting:**
```typescript
import { useTranslation } from 'next-i18next';

export function useFormatting() {
  const { i18n } = useTranslation();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(i18n.language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
    // en: "February 5, 2026"
    // fr: "5 février 2026"
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(i18n.language).format(num);
    // en: "1,234.56"
    // fr: "1 234,56"
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
    // en: "€299.00"
    // fr: "299,00 €"
  };

  return { formatDate, formatNumber, formatCurrency };
}
```

**And** translation coverage:
- UI strings: 100% translated
- Error messages: 100% translated
- Email templates: 100% translated
- AI prompts: 100% translated
- Documentation: 100% translated

---

### Story 14.7: Responsive Design Optimization (Desktop, Laptop, Tablet, Mobile)

As a **user accessing ADVERT on various devices**,
I want **a responsive design that adapts seamlessly to my screen size**,
So that **I have an optimal experience whether on desktop, laptop, tablet, or mobile**.

**Acceptance Criteria:**

**Given** ADVERT supports multiple screen sizes
**When** I access it on different devices
**Then** breakpoints are:
- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1023px (md, lg)
- **Laptop**: 1024px - 1365px (xl)
- **Desktop**: ≥ 1366px (2xl)

**Given** I view ADVERT on desktop (1920×1080)
**When** the page loads
**Then** I see:
- **Layout**: Multi-column layout
  - Sidebar navigation (left, 240px wide)
  - Main content (center, fluid)
  - Optional right panel for analytics (320px)
- **Strategy cards**: 3 columns in grid
- **Typography**: Base font size 16px, comfortable line height 1.5
- **Spacing**: Generous padding and margins
- **Images**: Full resolution

**Given** I view ADVERT on laptop (1366×768)
**When** the page loads
**Then** I see:
- **Layout**: Condensed multi-column
  - Collapsible sidebar (auto-collapse on smaller laptops)
  - Main content (fluid, takes most space)
  - Right panel hidden by default (toggle button)
- **Strategy cards**: 2-3 columns
- **Typography**: Same as desktop
- **Spacing**: Slightly reduced

**Given** I view ADVERT on tablet (768×1024, portrait)
**When** the page loads
**Then** I see:
- **Layout**: Single column with bottom navigation
  - Sidebar collapsed to hamburger menu (top-left)
  - Main content (full width)
  - Bottom navigation bar (sticky)
- **Strategy cards**: 2 columns in portrait, 3 in landscape
- **Typography**: Slightly larger touch targets (44×44px minimum)
- **Spacing**: Comfortable for touch interaction

**Given** I view ADVERT on mobile (375×667, iPhone SE)
**When** the page loads
**Then** I see:
- **Layout**: Single column, mobile-first
  - Hamburger menu (top-left)
  - Full-width content
  - Sticky bottom navigation
  - Floating action button (FAB) for "Create Strategy"
- **Strategy cards**: 1 column, card-based design
- **Typography**: Readable font sizes (16px minimum for body)
- **Spacing**: Optimized for thumb reach zones

**Given** I create a strategy on mobile
**When** I fill in the form
**Then** the form is mobile-optimized:
- Stacked form fields (full width)
- Large input fields (48px height minimum)
- Large buttons (48px height, full width)
- Native mobile keyboards (type="email" shows @ key)
- Autofocus disabled (prevents unwanted keyboard pop-up)

**Given** I view a strategy on mobile
**When** the page loads
**Then** pillars are displayed:
- Accordion-style (collapsed by default)
- Tap to expand pillar
- Swipe left/right to navigate between pillars (optional)
- Floating "Edit" button (bottom-right)

**Given** I use the navigation on mobile
**When** I tap the hamburger menu
**Then** a slide-out drawer opens:
- Full-screen navigation menu
- Large touch-friendly links
- Search bar at top
- User profile at bottom
- "Close" button (top-right)
- Swipe right to close

**Given** I view analytics on tablet
**When** I access the Analytics page
**Then** charts adapt:
- Charts responsive (resize to viewport)
- Simplified charts on mobile (fewer data points, larger labels)
- Horizontal scroll for tables (if needed)
- "View Full Chart" button to open in full screen

**Given** I rotate my device (tablet/mobile)
**When** orientation changes
**Then** layout adjusts:
- Portrait → Landscape: More columns in grids
- Landscape → Portrait: Single column, stacked
- No horizontal scrolling
- Smooth transition (CSS transition: 0.3s ease)

**Given** I use a foldable device (Samsung Galaxy Fold)
**When** the device unfolds
**Then** layout adapts to new screen size:
- Folded (small screen): Mobile layout
- Unfolded (large screen): Tablet layout
- Media query detects fold state

**Given** the feature is implemented
**When** I review technical details
**Then** responsive design system:

**Tailwind Breakpoints:**
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
  },
};
```

**Responsive Component Example:**
```typescript
export function StrategyGrid({ strategies }: { strategies: Strategy[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
      {strategies.map(strategy => (
        <StrategyCard key={strategy.id} strategy={strategy} />
      ))}
    </div>
  );
}

export function ResponsiveSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile: Hamburger + Drawer */}
      <div className="lg:hidden">
        <button onClick={() => setIsOpen(true)} aria-label="Open menu">
          <IconMenu />
        </button>
        <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <Navigation />
        </Drawer>
      </div>

      {/* Desktop: Static Sidebar */}
      <aside className="hidden lg:block w-60 border-r">
        <Navigation />
      </aside>
    </>
  );
}
```

**Responsive Typography:**
```css
/* Base (mobile) */
body {
  font-size: 16px;
  line-height: 1.5;
}

h1 {
  font-size: 1.875rem; /* 30px */
}

/* Tablet */
@media (min-width: 768px) {
  h1 {
    font-size: 2.25rem; /* 36px */
  }
}

/* Desktop */
@media (min-width: 1024px) {
  h1 {
    font-size: 3rem; /* 48px */
  }
}
```

**And** responsive testing:
- Chrome DevTools responsive mode
- Real device testing (iPhone, Android, iPad)
- BrowserStack for cross-device testing
- Responsive screenshots in CI/CD

---

### Story 14.8: Touch Optimization for Mobile Experience

As a **mobile user interacting with ADVERT via touchscreen**,
I want **touch-optimized interactions (tap targets, swipe gestures, haptic feedback)**,
So that **I have a smooth, native-like mobile experience**.

**Acceptance Criteria:**

**Given** I use ADVERT on a touchscreen device
**When** I interact with UI elements
**Then** all touch targets meet size requirements:
- **Minimum size**: 44×44px (WCAG 2.1 AA, Apple HIG)
- **Ideal size**: 48×48px (Material Design)
- **Spacing**: 8px minimum between adjacent touch targets

**Given** I view buttons on mobile
**When** I inspect button sizes
**Then** they are touch-friendly:
- Primary buttons: 48px height, full width on mobile
- Secondary buttons: 44px height minimum
- Icon buttons: 48×48px (icon + padding)
- Small buttons (tags, chips): 32px height, 8px padding

**Given** I view form inputs on mobile
**When** I tap an input field
**Then** it is easy to tap:
- Input height: 48px minimum
- Label above input (not placeholder-only)
- Clear tap area (no tiny checkboxes)
- Radio buttons: 32×32px
- Checkboxes: 32×32px

**Given** I interact with a dropdown on mobile
**When** I tap it
**Then** I see a native-like picker:
- Bottom sheet on iOS/Android
- Large touch-friendly options
- "Done" button to confirm
- Native scroll physics

**Given** I swipe on mobile
**When** I use swipe gestures
**Then** they work:
- **Swipe left/right on strategy cards**: Navigate between strategies
- **Swipe right from edge**: Open navigation drawer
- **Swipe down to refresh**: Pull-to-refresh on lists (strategies, analytics)
- **Swipe to dismiss**: Dismiss notifications/toasts
- Smooth animations (60fps)

**Given** I perform a pull-to-refresh
**When** I pull down on the strategies list
**Then** I see:
- Loading spinner appears at top
- List refreshes with latest data
- "Updated just now" confirmation
- Haptic feedback on refresh (if supported)

**Given** I use pinch-to-zoom
**When** I pinch on charts or images
**Then** zoom works:
- Charts: Pinch to zoom in/out (reveal more data points)
- Images: Pinch to zoom on portfolio images
- PDF previews: Pinch to zoom
- Smooth animation, no jank

**Given** I use a long-press gesture
**When** I long-press on a strategy card
**Then** a context menu appears:
- "Edit"
- "Duplicate"
- "Export"
- "Archive"
- "Delete"
- Haptic feedback on long-press (if supported)

**Given** my device supports haptic feedback
**When** I interact with ADVERT
**Then** I feel tactile feedback:
- Light tap on button press
- Medium tap on successful action (save, export)
- Heavy tap on error
- Pattern on strategy generation complete

**Given** I drag and drop on mobile
**When** I reorder items (pillars, tactics)
**Then** drag-and-drop works:
- Long-press to initiate drag (haptic feedback)
- Item lifts with shadow
- Drop zones highlighted
- Smooth animations
- Haptic feedback on drop

**Given** I tap near the edge of the screen
**When** I use my thumb
**Then** the UI is thumb-friendly:
- Important actions in thumb reach zones:
  - Bottom third: Primary actions (save, next)
  - Top third: Secondary actions (back, close)
  - Center: Content viewing
- FAB (Floating Action Button) in bottom-right for "Create Strategy"

**Given** I accidentally tap
**When** I tap a destructive action (delete)
**Then** I see confirmation:
- Modal: "Delete strategy?"
- Large "Cancel" button (easy to tap)
- "Delete" button (requires second tap)
- 300ms delay prevents double-tap accidents

**Given** I use mobile Safari on iOS
**When** I scroll
**Then** scroll behavior is optimized:
- `-webkit-overflow-scrolling: touch` for momentum scrolling
- No scroll bounce on fixed headers
- Smooth scrolling with native feel

**Given** I use ADVERT in landscape mode
**When** I rotate my phone
**Then** touch targets remain accessible:
- No elements hidden by keyboard in landscape
- Buttons remain reachable
- No horizontal scrolling required

**Given** the feature is implemented
**When** I review technical details
**Then** touch optimization:

**Touch Target Utilities (Tailwind):**
```css
/* Minimum touch target size */
.touch-target {
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Ideal touch target */
.touch-target-lg {
  min-width: 48px;
  min-height: 48px;
}
```

**Swipe Gesture Hook:**
```typescript
import { useSwipeable } from 'react-swipeable';

export function StrategyCard({ strategy, onSwipeLeft, onSwipeRight }: Props) {
  const handlers = useSwipeable({
    onSwipedLeft: onSwipeLeft,
    onSwipedRight: onSwipeRight,
    trackMouse: true, // Also works with mouse for testing
    delta: 50, // 50px swipe threshold
  });

  return <div {...handlers}>...</div>;
}
```

**Haptic Feedback:**
```typescript
export function triggerHaptic(type: 'light' | 'medium' | 'heavy' = 'medium') {
  if ('vibrate' in navigator) {
    const patterns = {
      light: 10,
      medium: 20,
      heavy: 30,
    };
    navigator.vibrate(patterns[type]);
  }
}

// Usage
<button onClick={() => {
  saveStrategy();
  triggerHaptic('medium');
}}>
  Save Strategy
</button>
```

**Pull-to-Refresh:**
```typescript
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

export function StrategiesList() {
  const { refreshStrategies } = useStrategies();

  const { isRefreshing } = usePullToRefresh({
    onRefresh: async () => {
      await refreshStrategies();
      triggerHaptic('light');
    },
    threshold: 80, // 80px pull threshold
  });

  return (
    <div>
      {isRefreshing && <Spinner />}
      {/* strategies list */}
    </div>
  );
}
```

**And** mobile-specific features:
- Native-like scroll physics
- Swipe gestures for common actions
- Bottom sheets for modals (mobile)
- Haptic feedback for important actions
- Touch-friendly spacing and sizing
- Pull-to-refresh on lists
- Long-press context menus

---

### Story 14.9: Framer Motion Animations and Micro-Celebrations

As a **user interacting with ADVERT**,
I want **delightful animations and micro-celebrations for key achievements**,
So that **the experience feels polished, engaging, and rewarding**.

**Acceptance Criteria:**

**Given** I navigate between pages
**When** I click a link or navigate
**Then** I see smooth page transitions:
- Fade-in animation (duration: 0.2s)
- Content slides in from right (50px offset)
- No jarring layout shifts
- Skeleton loaders during data fetch

**Given** I hover over interactive elements
**When** I move my mouse over buttons, cards, links
**Then** I see hover animations:
- Buttons: Scale 1.05, shadow increases
- Cards: Lift (translateY -4px), shadow increases
- Links: Underline slides in from left
- Icons: Rotate or bounce slightly
- Transition: 0.2s ease-out

**Given** I click a button
**When** I press and release
**Then** I see button feedback:
- Press: Scale 0.95 (button compresses)
- Release: Scale 1.0 (button bounces back)
- Ripple effect spreads from click point (Material Design style)
- Duration: 0.15s

**Given** I open a modal
**When** I click "Export Strategy"
**Then** I see modal animation:
- Backdrop fades in (0.2s)
- Modal scales up from 0.9 to 1.0 (spring animation)
- Content fades in after modal appears
- Focus trap activates smoothly

**Given** I close a modal
**When** I click "Cancel" or press Esc
**Then** I see exit animation:
- Modal scales down to 0.9
- Backdrop fades out
- Smooth 0.2s transition
- Focus returns to trigger button

**Given** I expand an accordion (pillar)
**When** I click "Expand"
**Then** I see smooth expand animation:
- Icon rotates 180° (chevron down → up)
- Content height animates from 0 to auto
- Content fades in (0.3s)
- Smooth ease-out easing

**Given** I complete a key action (save strategy)
**When** the save succeeds
**Then** I see a micro-celebration:
- Toast slides in from bottom with checkmark ✅
- Checkmark icon animates (scale pulse)
- Confetti animation (optional, for major milestones)
- Success sound (optional, if audio enabled)

**Given** I generate a strategy for the first time
**When** the generation completes
**Then** I see a celebration animation:
- 🎉 Confetti bursts from center
- Success modal with animated checkmark
- "Congratulations on your first strategy!" message
- "View Strategy" button pulses gently

**Given** I delete a strategy
**When** I confirm deletion
**Then** I see a smooth exit animation:
- Card fades out
- Adjacent cards slide to fill space
- Toast confirms: "Strategy deleted"
- Undo button available for 5 seconds

**Given** I reorder items (drag-and-drop)
**When** I drag a pillar to reorder
**Then** I see smooth animations:
- Dragged item lifts with shadow
- Other items shift to make space
- Drop zones pulse/highlight
- Smooth layout transitions (auto-animate)

**Given** I view loading states
**When** data is fetching
**Then** I see skeleton loaders:
- Shimmer animation (gradient moves left to right)
- Placeholder blocks fade in
- Content cross-fades in when loaded
- No layout shifts

**Given** I see progress indicators
**When** strategy generation is in progress
**Then** I see animated progress:
- Progress bar fills smoothly (not choppy)
- Pillar icons appear one by one with scale animation
- Current pillar pulses gently
- Percentage counts up smoothly (not instant jumps)

**Given** I enable reduced motion
**When** I have `prefers-reduced-motion: reduce` enabled
**Then** animations are simplified:
- No spring animations (use simple fade)
- No confetti or celebratory animations
- Reduced transition durations (0.01ms)
- Instant state changes for critical interactions

**Given** the feature is implemented
**When** I review technical details
**Then** animation implementation:

**Framer Motion Setup:**
```bash
npm install framer-motion
```

**Page Transition Animation:**
```typescript
import { motion } from 'framer-motion';

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
```

**Button with Hover/Tap Animation:**
```typescript
export function AnimatedButton({ children, onClick }: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
}
```

**Modal Animation:**
```typescript
export function AnimatedModal({ isOpen, children }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.div
            className="modal"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.3 }}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

**Confetti Celebration (canvas-confetti):**
```typescript
import confetti from 'canvas-confetti';

export function celebrateSuccess() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });
}

// Usage
<button onClick={() => {
  saveStrategy();
  celebrateSuccess();
}}>
  Complete Strategy
</button>
```

**List Item Exit Animation:**
```typescript
export function StrategyList({ strategies }: Props) {
  return (
    <motion.div layout>
      <AnimatePresence>
        {strategies.map(strategy => (
          <motion.div
            key={strategy.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.2 }}
          >
            <StrategyCard strategy={strategy} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
```

**Reduced Motion Support:**
```typescript
import { useReducedMotion } from 'framer-motion';

export function ResponsiveAnimation({ children }: Props) {
  const shouldReduceMotion = useReducedMotion();

  const variants = {
    initial: shouldReduceMotion
      ? { opacity: 0 }
      : { opacity: 0, y: 20 },
    animate: shouldReduceMotion
      ? { opacity: 1 }
      : { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      transition={{ duration: shouldReduceMotion ? 0.01 : 0.3 }}
    >
      {children}
    </motion.div>
  );
}
```

**And** animation guidelines:
- Duration: 0.2-0.3s for most transitions
- Easing: ease-out for entrances, ease-in for exits
- Spring animations for playful interactions
- Confetti sparingly (major milestones only)
- Always respect `prefers-reduced-motion`

---

### Story 14.10: Interactive Onboarding Tutorial and First-Time User Experience

As a **new user trying ADVERT for the first time**,
I want **an interactive onboarding tutorial that guides me through key features**,
So that **I quickly understand how to use ADVERT and create my first strategy with confidence**.

**Acceptance Criteria:**

**Given** I am a new user
**When** I complete registration and log in for the first time
**Then** I see a welcome screen:
- Title: "Welcome to ADVERT! 🎉"
- Subtitle: "Let's create your first 6-pillar strategy in <10 minutes"
- "Start Tutorial" button (primary)
- "Skip for now" link (subtle)

**Given** I click "Start Tutorial"
**When** the tutorial begins
**Then** I see a step-by-step guided tour:

**Step 1: Dashboard Overview (Spotlight)**
- Dark overlay with spotlight on dashboard
- Tooltip: "This is your dashboard. Here you'll see all your strategies and quick actions."
- "Next" button
- Progress indicator: "1 of 5"

**Step 2: Create Strategy Button (Spotlight)**
- Spotlight on "Create New Strategy" button
- Tooltip: "Click here anytime to start a new brand strategy. Let's try it now!"
- "Create Strategy" button (actionable)
- "Skip Tutorial" link

**Step 3: Strategy Form (Guided Input)**
- Spotlight on brand name field
- Tooltip: "First, tell us your brand's name. We'll use this throughout your strategy."
- Pre-filled example: "Zahra Fashion House" (user can edit)
- Field autofocused
- "Next" button appears when valid input entered

**Step 4: AI Co-Pilot Introduction**
- Spotlight on AI co-pilot panel
- Tooltip: "Meet your AI co-pilot! I'll ask questions to understand your brand and generate your strategy automatically."
- Animated avatar waves 👋
- "Let's Go!" button

**Step 5: Generate First Strategy (Demo Mode)**
- Tutorial creates a demo strategy with the user
- AI co-pilot asks simplified questions:
  - "What industry are you in?" → Dropdown with suggestions
  - "Who is your target audience?" → Short text input
  - "What makes your brand unique?" → Text area (optional)
- Progress bar shows generation (accelerated in demo mode)
- Takes ~2 minutes (faster than production)

**Step 6: Strategy Generated (Success Celebration)**
- Confetti animation 🎉
- Modal: "Your First Strategy is Ready!"
- Preview of generated strategy with 6 pillars
- "Explore Your Strategy" button
- Badge earned: "First Strategy Created" 🏆

**Step 7: Strategy Features Tour (Interactive)**
- Spotlight on each feature:
  - Pillar 1: "Each strategy has 6 pillars. Click to expand."
  - Edit button: "Make changes anytime by clicking Edit."
  - Export button: "Export as PDF, PowerPoint, or Excel."
  - Analytics: "Track your strategy performance here."
- "Got it!" button advances to next spotlight

**Step 8: Tutorial Complete**
- Modal: "You're All Set! 🚀"
- "You've learned the basics of ADVERT. Here's what to do next:"
  - ✅ Explore your demo strategy
  - ✅ Create your first real strategy
  - ✅ Invite team members (Professional tier)
  - ✅ Export and share with clients
- "Start Creating" button (primary)
- "View Help Center" link

**Given** I skip the tutorial
**When** I click "Skip for now"
**Then** I can access the tutorial later:
- Help menu → "Restart Tutorial"
- Settings → "Onboarding Tutorial"
- Keyboard shortcut: Shift + ?

**Given** I return to ADVERT after completing onboarding
**When** I log in on subsequent visits
**Then** I don't see the tutorial again
**But** I see contextual tips:
- First time viewing Analytics: "Tip: Your Campaign Coherence Score measures strategy completeness."
- First time exporting: "Tip: Choose PDF for client presentations, Excel for detailed data."
- First time inviting team member: "Tip: Assign strategies to specific team members for collaboration."

**Given** I create my first real strategy post-onboarding
**When** I complete it
**Then** I see a congratulatory modal:
- "Awesome! Your First Strategy is Complete! 🎉"
- Stats: "6 pillars created, 24 tactics defined, 12 KPIs tracked"
- "Share your achievement" (optional social share)
- "Create Another Strategy" button

**Given** I reach milestones
**When** I achieve key actions
**Then** I unlock achievements:
- 🏆 "First Strategy" - Create your first strategy
- 🏆 "Strategy Pro" - Create 5 strategies
- 🏆 "Collaborator" - Invite your first team member
- 🏆 "Presenter" - Export your first PDF
- 🏆 "Analyst" - View analytics 10 times
- Achievements visible in Settings → Achievements

**Given** I need help at any time
**When** I click the "?" icon (Help)
**Then** I see:
- "Help Center" link
- "Restart Tutorial"
- "Keyboard Shortcuts"
- "What's New" (changelog)
- "Contact Support"

**Given** the feature is implemented
**When** I review technical details
**Then** onboarding implementation:

**Tutorial State Management:**
```typescript
interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector for spotlight
  action?: () => void;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'dashboard-overview',
    title: 'Welcome to Your Dashboard',
    description: 'This is your central hub for all strategies.',
    target: '#dashboard',
  },
  {
    id: 'create-strategy',
    title: 'Create Your First Strategy',
    description: 'Click here to start building your brand strategy.',
    target: '#create-strategy-button',
    action: () => router.push('/strategies/new?tutorial=true'),
  },
  // ... more steps
];

export function useTutorial() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const skipTutorial = () => setIsActive(false);

  return { currentStep, isActive, nextStep, skipTutorial, tutorialSteps };
}
```

**Spotlight Component (react-joyride):**
```typescript
import Joyride, { Step } from 'react-joyride';

export function OnboardingTutorial() {
  const { isActive, tutorialSteps } = useTutorial();

  return (
    <Joyride
      steps={tutorialSteps}
      run={isActive}
      continuous
      showSkipButton
      showProgress
      styles={{
        options: {
          primaryColor: '#6366F1', // Indigo
          zIndex: 10000,
        },
        spotlight: {
          borderRadius: 8,
        },
      }}
    />
  );
}
```

**Progress Tracking:**
```prisma
model UserProgress {
  id                  String   @id @default(cuid())
  userId              String   @unique
  onboardingCompleted Boolean  @default(false)
  tutorialCompleted   Boolean  @default(false)
  firstStrategyAt     DateTime?
  achievementsUnlocked String[] // Array of achievement IDs
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  user                User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Achievement {
  id          String   @id @default(cuid())
  code        String   @unique // FIRST_STRATEGY, STRATEGY_PRO, etc.
  title       String
  description String
  icon        String   // Emoji or icon name
  createdAt   DateTime @default(now())
}
```

**Contextual Tips Component:**
```typescript
export function ContextualTip({ tipId, message, target }: TipProps) {
  const [dismissed, setDismissed] = useState(false);
  const { hasSeenTip } = useUserProgress();

  if (dismissed || hasSeenTip(tipId)) return null;

  return (
    <Popover target={target}>
      <div className="tip">
        <p>{message}</p>
        <button onClick={() => {
          setDismissed(true);
          markTipAsSeen(tipId);
        }}>
          Got it!
        </button>
      </div>
    </Popover>
  );
}
```

**And** onboarding best practices:
- Show value early (create demo strategy in 2 minutes)
- Allow skipping at any point
- Never more than 7 steps per flow
- Celebrate achievements with confetti
- Contextual help when needed
- Track progress for analytics

---

**Epic 14 Complete!** 🎉🎉🎉

Epic 14: PWA, Accessibility & UX Polish (10 stories) is now fully documented with comprehensive acceptance criteria covering:
- Progressive Web App setup with service worker and installable manifest
- Offline editing capabilities with intelligent sync and conflict resolution
- Complete keyboard navigation with documented shortcuts and command palette
- WCAG 2.1 Level AA compliance (semantic HTML, ARIA, 4.5:1 contrast)
- Screen reader support tested with NVDA, JAWS, VoiceOver
- French localization (i18n) for Francophone African markets with full UI translation
- Responsive design optimization for desktop (1920×1080), laptop (1366×768), tablet (768×1024), mobile (375×667)
- Touch optimization with 44×44px minimum targets, swipe gestures, haptic feedback
- Framer Motion animations with micro-celebrations and reduced motion support
- Interactive onboarding tutorial with guided 5-step tour and achievement system

**Key Technical Highlights:**
- PWA with Workbox service worker (cache-first for assets, network-first for API)
- IndexedDB offline storage with conflict resolution UI
- Keyboard shortcuts (Ctrl+K command palette, Ctrl+S save, Vim-style j/k navigation)
- WCAG 2.1 Level AA (Lighthouse 95+, axe 0 violations)
- next-i18next for French/English with Intl formatting
- Tailwind responsive breakpoints (sm/md/lg/xl/2xl)
- Touch gestures (swipe, pull-to-refresh, long-press, pinch-zoom)
- Framer Motion animations (spring, exit transitions, confetti)
- react-joyride onboarding with achievement system

---

## Epic 15: Pilier I - Implementation Planner

**Goal:** Enable consultants to transform strategic recommendations into comprehensive implementation roadmaps, bridging the strategy-to-execution gap.

**User Outcome:** Consultants can create 12-24 month implementation roadmaps with dependencies, milestones, resource allocation, and risk mitigation in <2 hours. Clients receive detailed execution plans with 80%+ adoption rates.

**Why This Epic Matters:** Traditional strategy consulting ends with recommendations; clients are left asking "but how do we actually do this?" Pilier I answers that question with specificity—turning abstract strategy into concrete, executable roadmaps with dependencies, risks, and quick wins.

**Key Features:**
- 12-24 month implementation timeline generation
- Dependency mapping and critical path analysis
- Resource allocation and capacity planning
- Risk mitigation strategies with contingency plans
- Quick wins identification for immediate traction
- ROI calculators and business case justification
- Milestone tracking and KPI frameworks
- Integration with Pilier S cockpit for real-time progress visibility

**User Stories:**

### Story 15.1: Create Implementation Roadmap from Strategy

As a **consultant**,
I want **to convert ADVERT strategy recommendations into a detailed 12-24 month implementation roadmap**,
So that **clients have a clear, actionable path forward and I can deliver "strategy-to-execution" services**.

**Acceptance Criteria:**
- Roadmap generated from any ADVERT nucleus (all 6 pillars)
- Timeline configurable: 6/12/18/24 months
- Minimum 15 implementation phases with milestones
- Dependency mapping between phases shown visually
- Resource requirements estimated per phase
- Created in <120 minutes by experienced consultant

---

### Story 15.2: Identify Quick Wins from Roadmap

As a **consultant**,
I want **to automatically identify 5+ quick wins from the implementation roadmap**,
So that **clients can see immediate traction and build confidence in the broader plan**.

**Acceptance Criteria:**
- Quick wins are implementable in 30-90 days
- Each quick win has measurable success criteria
- Quick wins don't require significant resources
- At least 1 quick win ready to start immediately (Month 1)
- Quick wins linked to Pilier S cockpit for tracking

---

### Story 15.3: Calculate Implementation ROI

As a **consultant**,
I want **to generate ROI calculations and business case justification for the implementation roadmap**,
So that **clients can present the investment case to their leadership/board**.

**Acceptance Criteria:**
- Investment required per phase calculated
- Revenue/cost savings projections for each phase
- Break-even point identified
- ROI summary in <15 minutes
- Professional business case format exportable

---

### Story 15.4: Risk Mitigation Planning

As a **consultant**,
I want **to identify risks at each implementation phase and develop mitigation strategies**,
So that **clients are prepared for challenges and can adjust proactively**.

**Acceptance Criteria:**
- Risk register generated for all 15+ implementation phases
- Probability and impact scoring (High/Medium/Low)
- Mitigation strategy for each high-priority risk
- Contingency plans for critical path risks
- Risk monitoring dashboard in Pilier S

---

### Story 15.5: Resource Allocation & Capacity Planning

As a **consultant**,
I want **to estimate required team size, skills, and capacity for each implementation phase**,
So that **clients know how to staff the initiative appropriately**.

**Acceptance Criteria:**
- Resource requirements per phase (headcount, skills, time commitment)
- Build-vs-buy recommendations for specialized roles
- Timeline for hiring/onboarding if needed
- Capacity constraints and bottlenecks identified
- Org chart template provided for resourcing

---

### Story 15.6: Export Implementation Roadmap

As a **consultant**,
I want **to export the implementation roadmap in multiple formats for client delivery**,
So that **clients can share the plan across their organization**.

**Acceptance Criteria:**
- Export formats: PDF (professional), PowerPoint (presentation), Excel (detailed plan)
- Gantt chart visualization included
- Editable templates for team customization
- Branded with client logo and colors
- <30 seconds export time

---

## Epic 16: Pilier S - Strategic Cockpit Interface

**Goal:** Deliver a real-time strategic and operational dashboard that serves as both a client deliverable and an operational control center.

**User Outcome:** Agencies and brands have a unified dashboard showing real-time strategy execution progress, financial metrics, campaign coherence, superfan health, and KPI tracking. The cockpit becomes the single source of truth for strategic performance.

**Why This Epic Matters:** Strategy documents are static artifacts; by Month 2 they're gathering dust. Pilier S transforms strategy into a living system with real-time visibility. Executives can see at a glance: Are we on track? What's working? What needs adjustment? The cockpit enables monthly strategic conversations backed by data instead of gut feel.

**Key Features:**
- Real-time dashboard of all 6 pillars + Pilier I implementation progress
- Financial clarity: budget allocation, spend tracking, ROI monitoring
- Campaign coherence scoring with real-time updates
- Superfan community health metrics and growth tracking
- Implementation progress linked to Pilier I roadmaps
- Multi-user access with role-based permissions
- <2 second load times with <100ms real-time updates
- WCAG 2.1 AA accessibility compliance
- Mobile responsive for executive review on-the-go

**User Stories:**

### Story 16.1: Build Strategic Cockpit Dashboard Layout

As a **designer/developer**,
I want **to create an intuitive, information-rich dashboard layout showing all key metrics**,
So that **executives can grasp strategic status at a glance**.

**Acceptance Criteria:**
- 6 pillar status cards (progress %, key metrics, alerts)
- Pilier I implementation progress (phases complete, on-track status)
- Campaign coherence score (real-time update)
- Superfan growth trend graph
- Financial metrics widget (budget vs. actual, ROI)
- Quick actions panel (export, share, update data)
- Responsive on desktop (1920×1080), tablet (768×1024)
- Load time <2 seconds

---

### Story 16.2: Implement Real-Time Data Synchronization

As a **developer**,
I want **to sync cockpit data with ADVERT nucleus and Pilier I in real-time**,
So that **users always see current strategic status without manual refresh**.

**Acceptance Criteria:**
- WebSocket or Server-Sent Events (SSE) for real-time updates
- <100ms latency for data refresh
- All 6 pillars sync automatically when updated
- Pilier I implementation progress updates in real-time
- Financial data syncs from connected tools (Zoho, HubSpot)
- Graceful degradation if real-time connection fails (fallback to polling)

---

### Story 16.3: Financial Clarity Dashboard Module

As a **brand director**,
I want **to see exactly where budget goes and how to multiply ROI**,
So that **I can make data-driven decisions and prove value to my CFO**.

**Acceptance Criteria:**
- Budget allocation visualization (pie/bar chart by channel/tactic)
- Spend tracking with variance from plan (budget vs. actual)
- ROI projection calculator (if trend continues, what's final ROI?)
- Unit economics module (cost per superfan, cost per impression, etc.)
- Monthly trend tracking (3/6/12 month views)
- Predictability forecast (confidence level in projections)
- Exportable as "Board-ready" report

---

### Story 16.4: Campaign Coherence Monitoring

As a **consultant**,
I want **to track campaign coherence score in real-time as client executes strategy**,
So that **we can identify coherence drift early and adjust**.

**Acceptance Criteria:**
- Coherence score calculated from pillar alignment metrics
- Real-time updates as client provides execution data
- Alerts when coherence drops below threshold (80%)
- Drill-down to see which pillars are drifting
- Recommendations for alignment corrections
- Historical trend showing coherence trajectory

---

### Story 16.5: Superfan Health & Growth Tracking

As a **brand director**,
I want **to see superfan count growth over time and segment by behavior/engagement**,
So that **I can prove community building to my CEO**.

**Acceptance Criteria:**
- Superfan count dashboard with growth graph
- Segmentation by acquisition source (organic, paid, referral, etc.)
- Engagement metrics (content consumption, share rate, advocacy actions)
- Retention cohort analysis (% retained month-over-month)
- Predictive forecast (if trend continues, how many superfans in 12 months?)
- Comparison to benchmarks ("Your growth is 2.3x sector average")

---

### Story 16.6: Implementation Progress Dashboard (Pilier I Integration)

As a **consultant**,
I want **to track real-time progress against the implementation roadmap**,
So that **we can see what's on track, what's slipping, and adjust proactively**.

**Acceptance Criteria:**
- Gantt chart showing phase progress
- Percentage complete per phase
- Status indicators (on-track, at-risk, off-track)
- Milestone completion tracking
- Resource utilization vs. capacity
- Risk status (active risks, mitigations in progress)
- Monthly performance trending

---

### Story 16.7: Multi-User Access & Permissions

As a **agency owner**,
I want **to control who can see/edit what on the cockpit**,
So that **clients see appropriate data, internal teams have full access, executives see summaries**.

**Acceptance Criteria:**
- 4 role types: Agency Owner (full), Consultant (edit), Client (view-only), Executive (summary only)
- Granular permissions by section (some users see financials, others don't)
- Real-time collaboration (multiple users viewing/editing simultaneously)
- Activity log showing who changed what and when
- Session management (track active users, log out inactive sessions)

---

### Story 16.8: Export & Share Strategic Reports

As a **consultant**,
I want **to export cockpit state as professional reports in multiple formats**,
So that **I can share progress with stakeholders in their preferred format**.

**Acceptance Criteria:**
- Export formats: PDF (executive summary), PowerPoint (presentation), Excel (detailed data)
- Branding applied (logo, colors, fonts)
- Customizable content (which sections to include)
- <5 seconds export time for PDF (100 pages)
- Email share directly from cockpit
- Schedule automatic reports (weekly/monthly email)

---

### Story 16.9: WCAG 2.1 AA Accessibility Compliance

As a **user with accessibility needs**,
I want **to use the cockpit fully via keyboard navigation and screen readers**,
So that **I'm not excluded from strategic decision-making**.

**Acceptance Criteria:**
- All features accessible via keyboard only (no mouse required)
- Screen reader tested and compatible (NVDA, JAWS, VoiceOver)
- 4.5:1 contrast ratio for all text
- Semantic HTML with proper ARIA labels
- Focus management with visible focus indicators
- Alt text on all charts and visualizations
- Keyboard shortcuts documented (Ctrl+E export, Ctrl+S save, etc.)

---

### Story 16.10: Mobile-Responsive Strategic Review

As a **executive on the go**,
I want **to check strategic progress from my phone or tablet**,
So that **I don't need a laptop to stay informed**.

**Acceptance Criteria:**
- Full responsive design (768px minimum for tablet)
- Summary view optimized for mobile (key metrics, alerts only)
- Touch-friendly buttons (44×44px minimum)
- Readable charts and graphs on smaller screens
- Offline mode with last-synced data available
- Performance <3 seconds load on 4G connection

---

## 🎊 ALL 16 EPICS COMPLETE! 🎊

**ADVERT v2.0 Epic Breakdown is now 100% complete!**

**Final Statistics:**
- **Total Epics**: 16 (14 original + 2 new Pilier I & S)
- **Total Stories**: 149 stories (129 original + 20 new)
- **Total FRs Covered**: 120+ functional requirements
- **Total NFRs Covered**: 35+ non-functional requirements
- **Document Size**: ~16,000+ lines of detailed specifications

**Epic Summary:**
1. ✅ **Epic 1**: Project Foundation & Technical Setup (8 stories)
2. ✅ **Epic 2**: User Authentication & Account Management (6 stories)
3. ✅ **Epic 3**: Strategy Creation with AI Co-Pilot (6 stories)
4. ✅ **Epic 4**: Strategy Management & Editing (6 stories)
5. ✅ **Epic 5**: Team Collaboration & Permissions (6 stories)
6. ✅ **Epic 6**: Export & Deliverables Engine (6 stories)
7. ✅ **Epic 7**: Financial Clarity Dashboard (6 stories)
8. ✅ **Epic 8**: Analytics & Pattern Recognition (6 stories)
9. ✅ **Epic 9**: Role-Based Access Control (RBAC) (6 stories)
10. ✅ **Epic 10**: Advanced Analytics & Benchmarking (6 stories)
11. ✅ **Epic 11**: Creative Concierge Marketplace (8 stories)
12. ✅ **Epic 12**: Third-Party Integrations & API (9 stories)
13. ✅ **Epic 13**: Compliance, Security & Enterprise Features (12 stories)
14. ✅ **Epic 14**: PWA, Accessibility & UX Polish (10 stories)
15. ✅ **Epic 15**: Pilier I - Implementation Planner (6 stories)
16. ✅ **Epic 16**: Pilier S - Strategic Cockpit Interface (10 stories)

**The complete epic breakdown is ready for:**
- Development team implementation
- Sprint planning and story estimation
- Product backlog prioritization
- Stakeholder review and approval
- Technical architecture alignment

**Next Steps:**
- Review and approve epic breakdown
- Prioritize epics for MVP vs Growth phases
- Estimate story points for sprint planning
- Begin implementation of Epic 1 (Project Foundation)

🚀 Ready to build ADVERT!
