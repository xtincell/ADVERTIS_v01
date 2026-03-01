---
stepsCompleted: ["step-01-init", "step-02-discovery", "step-03-success", "step-04-journeys", "step-05-domain", "step-06-innovation", "step-07-project-type", "step-08-scoping", "step-09-functional", "step-10-nonfunctional", "step-11-polish"]
inputDocuments:
  - "/workspaces/ADVERT_01/_bmad-output/planning-artifacts/product-brief-ADVERT_01-2026-02-04.md"
  - "/workspaces/ADVERT_01/_bmad-output/brainstorming/brainstorming-session-2026-02-04.md"
documentCounts:
  briefCount: 1
  researchCount: 0
  brainstormingCount: 1
  projectDocsCount: 0
classification:
  projectType: "saas_b2b"
  domain: "general"
  complexity: "medium-high"
  projectContext: "greenfield"
workflowType: 'prd'
projectName: 'ADVERT_01'
---

# Product Requirements Document - ADVERT_01

**Author:** spark01
**Date:** 2026-02-04

## Success Criteria

### User Success

**Primary Users (MVP):** Agency Directors utilisant ADVERT pour servir leurs clients brands

**User Success = "Worth It" Moment:**
Quand l'agency director livre une stratégie ADVERT-powered à son client et:
1. Le client dit: "C'est exactement ce dont j'avais besoin" (précision)
2. L'agency réalise: "J'ai livré en 4 semaines ce qui prenait 3 mois avant" (vitesse)
3. Le client voit: "Mon score de cohérence campagne est passé de 52 à 81" (impact mesurable)

**Specific User Outcomes:**
- **Immediate (30-60 days):**
  - Campaign Coherence Score improvement: +20-40 points
  - Financial Clarity Index: Budget-reality alignment +40%
  - Client satisfaction: "Shivers" moment quand ils voient planning qui match budget + monthly traction reports

- **Long-term (6-12 months):**
  - Client superfan count: 0 → 100-300+ superfans
  - Agency reputation: First award submissions
  - Talent retention: Agency keeps top creatives (vs exodus)

**Emotional Success:**
- Agency director feels: "Je peux enfin rivaliser avec McCann/Havas"
- Brand director feels: "J'ai enfin la clarté financière et la preuve de traction pour mon Board"
- Creative talent feels: "Je reste en Afrique, mon travail a de la valeur"

### Business Success

**North Star Metric:** Number of Superfans (aggregate across all ADVERT-powered brands)
- NOT revenue, NOT customers → Superfans qui évangélisent activement

**MVP Validation (Month 6):**
- **5 consulting clients** signed and paid = Demand validated
- **15 consulting clients** delivered with 80%+ satisfaction = Model validated
- **€300k revenue** generated = Halfway to Year 1 goal
- **20+ SaaS beta users** with <30% monthly churn = SaaS adoption validated

**Year 1 Success:**
- **Revenue:** €780k (€600k consulting + €180k SaaS)
- **Clients:** 30 consulting engagements completed
- **SaaS:** 50 subscribers
- **Proof:** 5+ detailed case studies showing superfan growth for clients

**Year 2 Success:**
- **Revenue:** €2.7M (€2M consulting + €600k SaaS + €100k concierge)
- **Market presence:** Abidjan domination → "If you're serious about brand strategy, you use ADVERT"
- **Concierge launch:** 20 talents onboarded, 10 brands using service

**Year 3 Success:**
- **Revenue:** €6.8M
- **Market expansion:** 7+ African cities (Abidjan, Dakar, Lagos, Accra, Nairobi, etc.)
- **Impact:** Measurable talent retention (creative professionals staying in Africa vs expatriation)

### Technical Success

**AI Generation Performance:**
- **Speed:** Complete ADVERT file (6 pillars, 40+ variables) generated in **<10 minutes**
- **Precision:** 80%+ content directly usable (20% requires human refinement - this is the hybrid workflow)
- **Cost efficiency:** API costs <$1 per strategy generation (maintain 93%+ gross margins)

**System Reliability:**
- **Multi-agent coordination:** 6 pillar agents execute sequentially without failures
- **Data consistency:** Living document - modify one variable → intelligent cascade adjustments work correctly
- **Meta-variable generation:** Context-adaptive variables generate appropriately for different sectors

**SaaS Platform (MVP):**
- **Uptime:** 99%+ (not 99.9% - that's overkill for MVP)
- **Load time:** Dashboard loads <3 seconds
- **User onboarding:** New user completes first strategy generation <30 minutes

**Integration Capability (Post-MVP):**
- API/SDK functional for connecting to Zoho, HubSpot, Monday, Asana
- Bi-directional data flow: ADVERT nucleus ↔ Enterprise OS

### Measurable Outcomes

**3-Month Success Indicators:**
- 5 consulting clients signed
- 1+ case study documented (SPAWT + 1)
- SaaS MVP functional for personal use

**6-Month Success Indicators:**
- 15 consulting clients delivered (80%+ satisfaction)
- €300k revenue milestone
- 20 SaaS beta users
- 3+ case studies published

**12-Month Success Indicators:**
- 30 consulting clients (Year 1 goal)
- €780k revenue
- 50 SaaS subscribers
- Concierge soft-launched
- "ADVERT sells ADVERT" - meta case study demonstrating methodology

**Impact Proof (18-24 months):**
- Aggregate superfan count across ADVERT-powered brands: 5,000+
- Client testimonials: "Revenue increased 23% in 12 months"
- Talent retention stories: Creatives who stayed in Africa because of ADVERT ecosystem

## Product Scope

### MVP - Minimum Viable Product

**Timeline:** Months 1-12

**Core Functionality:**
1. **ADVERT Nucleus (6 Pillars):**
   - Single-LLM architecture (Claude Sonnet 3.5)
   - Sequential generation: A→D→V→E→R→T
   - 40+ variables with meta-variable generation
   - Integrated frameworks: Schwartz Values, Ikigai, Hero's Journey, AARRR

2. **UI (Web App):**
   - Collapsible sections (pillar summaries expandable)
   - Wizard mode (step-by-step questionnaire)
   - Smart templates (fashion, fintech, FMCG, B2B SaaS pre-filled)
   - AI co-pilot mode (high-level input → full draft)

3. **Consulting Deliverable:**
   - ADVERT file generation (Excel → SaaS)
   - 3-6-12 month strategy output
   - Visual dashboards (basic charts, heatmaps)

4. **User Management:**
   - Authentication (email/password)
   - Basic project storage (save/load ADVERT files)
   - Single-user accounts (no multi-tenant yet)

**What's NOT in MVP:**
- ❌ Enterprise OS (operational view) - Post-MVP
- ❌ Creative Concierge marketplace - Soft-launch Month 12-18
- ❌ Multi-agent architecture - Single LLM sufficient for MVP
- ❌ API/SDK integrations - Post-MVP
- ❌ Advanced analytics/benchmarking - Requires data accumulation

### Growth Features (Post-MVP)

**Timeline:** Year 2 (Months 13-24)

**Phase 1: SaaS Maturity**
- Multi-tenant architecture (agencies manage multiple client brands)
- Team collaboration (invite team members, roles/permissions)
- Payment integration (Paystack, Flutterwave, mobile money)
- Tiered pricing (Starter €99, Professional €299, Enterprise custom)

**Phase 2: Data & Intelligence**
- Benchmarking: "Your coherence score 81 vs sector average 65"
- Pattern recognition: "Brands with ritual X see 2.8x superfan growth"
- Predictive insights: "Brands with your profile succeed with Strategy A 78%"

**Phase 3: Concierge Launch**
- Talent marketplace (50+ African creatives vetted)
- Brand-talent matching (AI-assisted)
- Escrow payments (75% talent, 25% platform)
- Portfolio building & certification

**Phase 4: Integrations**
- API/SDK for third-party tools
- Zoho/HubSpot/Monday connectors
- Native integrations with marketing platforms

### Vision (Future)

**Timeline:** Year 3+ (Months 25+)

**Enterprise OS Integration:**
- Full dual-view: Strategic nucleus + Operational OS
- Invoicing, project tracking, talent management
- Bi-directional data flow feeding ADVERT intelligence

**ADVERT Alliance:**
- Network of ADVERT-certified consultants
- Shared learnings, referrals, best practices
- White-label options for large agencies

**Market Intelligence Product:**
- Sell aggregate insights (anonymized data from 500+ brands)
- Industry benchmarks as standalone product
- Competitive intelligence service

**Geographic Expansion:**
- Pan-African presence (15+ cities)
- Francophone + Anglophone + Lusophone markets
- "The African agency sophistication platform"

**Ultimate Vision:**
- Democratize sophisticated marketing across Africa
- Break mediocrity cycle & talent exodus
- Shift Overton window for African brands
- Systematize what only giants can do → accessible to all


## User Journeys

### Journey 1: Amina - Agency Director's Breakthrough

**Who is Amina?**
Amina Diallo, 34 ans, directrice d'une agence conseil à Abidjan (12 employés). Diplômée de marketing, 8 ans d'expérience. Elle a lancé son agence il y a 3 ans avec l'ambition de rivaliser avec les géants. Mais elle est coincée dans le **cercle vicieux de la médiocrité**: petits budgets → clients peu exigeants → impossible de retenir les top talents → livrables incohérents → pas d'awards → pas de gros comptes.

**Opening Scene - Le Point de Rupture:**
C'est vendredi soir, 21h. Amina fixe son Excel "Stratégie_Marque_Client_v7_FINAL.xlsx". Ça fait 6 semaines qu'elle travaille dessus. Le client attend lundi. Elle sait que c'est... moyen. Pas terrible. Juste assez bon pour un budget de 8 millions FCFA. Son meilleur designer vient de démissionner - il part à Paris chez Publicis. C'est le 3ème en 18 mois.

Elle pense: "Je ne peux pas continuer comme ça. McCann livre en 4 semaines ce qui me prend 3 mois, et c'est 10x meilleur. Comment je suis censée grandir?"

**Rising Action - La Découverte:**
Lundi matin, café networking. Un confrère mentionne: "Tu as entendu parler de ADVERT? spark01 a lancé un truc - méthode propriétaire + IA. Il a livré une stratégie complète pour SPAWT en 4 semaines. J'ai vu le doc, c'est du niveau Havas mais à fraction du prix."

Amina est sceptique mais désespérée. Elle contacte spark01. Démo: interface web, 6 pillars (Authenticité, Distinction, Valeur, Engagement, Risk, Track), AI co-pilot mode. spark01 explique: "Tu fournis l'insight humain - 6h d'interview client. ADVERT génère le reste en 10 minutes. Tu affines. Total: 4 semaines au lieu de 12."

Prix: €20k package ADVERT Brand Launch. C'est cher pour Amina, mais...

**The Climax - Premier Client ADVERT-Powered:**
Amina tente avec son prochain client (marque cosmétique locale, budget 15 millions FCFA). Elle fait l'interview de 6h avec le fondateur (Ikigai, valeurs Schwartz, Hero's Journey). Upload documents. Lance ADVERT.

10 minutes plus tard: **80 pages. Complet.** 

Authenticité pillar a extrait la vraie mission (pas du bullshit corporate). Distinction a créé 3 personas précis avec buying journey. Engagement a défini rituels always-on + calendrier campagnes 12 mois. Risk a challengé TOUT avec SWOT individuels.

Amina passe 1 semaine à affiner (ton, visuels, ajustements). Semaine 4: Présentation client.

Le client lit. Silence. Puis: "Amina... c'est **exactement** ce dont j'avais besoin. Comment t'as fait ça? C'est du niveau international."

**Resolution - La Nouvelle Réalité:**
6 mois plus tard:

- Amina a livré 8 stratégies ADVERT-powered
- Son score de satisfaction client: 92% (vs 68% avant)
- Elle a gagné son premier gros compte (30 millions FCFA) en battant une agence McCann sur pitch
- Elle a embauché 2 nouveaux talents - ils restent parce que le travail est award-worthy
- Son agence a soumis 3 campagnes aux Cannes Lions Africain
- Ses clients génèrent en moyenne 180 superfans en 6 mois (métrique qu'elle track maintenant)

Amina dit à ses confrères: "ADVERT m'a donné les armes pour rivaliser. Je livre McCann-level en 4 semaines. Et mes clients le voient."

**Capabilities Revealed:**
- AI-powered strategy generation (<10 min complete file)
- 6-pillar framework UI (collapsible, wizard mode)
- Client interview templates (Ikigai, Schwartz, Hero's Journey)
- Campaign calendar generation
- SWOT automation per variable
- Strategy refinement/editing interface
- Export formats (PDF, PowerPoint-ready)
- Case study documentation

---

### Journey 2: Kofi - Brand Director's Financial Salvation

**Who is Kofi?**
Kofi Mensah, 41 ans, Brand Director pour une chaîne retail au Ghana (50+ magasins). Il gère un budget marketing de €300k/an. Pression du Board pour ROI. Son cauchemar: budgets déconnectés de la réalité, projections financières africaines "fantaisistes", impossible de prouver traction. Le Board menace de couper 40% du budget si pas de résultats mesurables Q2.

**Opening Scene - Existential Threat:**
Réunion Board. CFO demande: "Kofi, où vont ces €75k marketing Q1? Quels résultats concrets?"

Kofi montre PowerPoint: campagnes social media, visibilité brand, "engagement en hausse". CFO n'est pas convaincu: "Des likes ne paient pas les salaires. Prouve-moi ROI ou je coupe le budget."

Kofi sort frustré. Il pense: "J'ai besoin de clarté financière + preuve de traction. Mais comment?"

**Rising Action - La Recherche Désespérée:**
Kofi cherche "marketing ROI tool Africa" - rien de pertinent. Il contacte agences locales - propositions vagues. Il est sur le point d'engager consultant à €50k quand collègue au Nigeria dit: "Essaie ADVERT. Ils ont un Financial Clarity Index - tu vois exactement où l'argent va et comment le multiplier."

Kofi s'inscrit (Professional Edition, €299/mois). Interface: Dashboard Financial Clarity. Il input son budget Q1 (€75k). ADVERT demande: objectifs? Cibles? Canaux actuels?

**The Climax - Budget Meets Reality:**
ADVERT génère:

1. **Budget Breakdown Précis:**
   - Social ads: €25k → Expected reach 450k, conversion 1.2% = 5,400 customers
   - Influencer partnerships: €15k → Estimated superfan creation: 120
   - In-store activations: €20k → Foot traffic uplift: 18%
   - Content production: €15k → Brand awareness: +12%

2. **Unit Economics Calculator:**
   - Customer acquisition cost: €13.89
   - Average customer value: €67
   - LTV: €201 (3 repeat purchases)
   - ROI projection: 4.8x over 12 months

3. **Monthly Traction Reports (Automated):**
   - Superfan count growth graph
   - Campaign coherence score
   - Budget vs actual spend variance
   - Predictability forecast

Kofi présente ça au Board. CFO: **"Enfin! C'est ce que je voulais voir. Précis, mesurable, défendable. Approuvé."**

**Resolution - From Threat to Authority:**
12 mois plus tard:

- Kofi a prouvé 23% revenue increase directement attribuable à stratégies ADVERT
- Son budget a AUGMENTÉ à €420k (pas coupé)
- Board le voit maintenant comme stratégique (pas dépense)
- Il a créé 890 superfans (customers qui évangélisent activement)
- Son Campaign Coherence Score: 87 (vs 52 avant)
- Il dort mieux la nuit

Kofi dit: "ADVERT m'a sauvé mon poste. Et transformé ma relation avec le CFO."

**Capabilities Revealed:**
- Financial Clarity Dashboard
- Budget allocation visualizer
- ROI projection calculator
- Unit economics module (CODB calculator)
- Monthly traction report automation
- Superfan count tracking
- Campaign coherence scoring
- Predictability forecasting
- Board-ready export formats

---

### Journey 3: Yasmine - Creative Talent's African Dream

**Who is Yasmine?**
Yasmine Touré, 28 ans, illustratrice freelance à Dakar. Talentueuse (Behance featured artist). Mais coincée: projets locaux paient 50k-150k FCFA (€80-€240), délais impossibles, clients qui demandent révisions infinies, pas de crédit portfolio. Elle considère sérieusement expatriation à Paris. Glass ceiling insupportable.

**Opening Scene - The Exodus Temptation:**
Email de recruteur parisien: "Poste junior designer chez Publicis Paris. Salaire €32k + portfolio opportunities. Intéressée?"

Yasmine hésite. €32k = 21 millions FCFA. Vs ses 6 millions actuels. Mais quitter Dakar? Famille? Culture?

Elle pense: "Pourquoi je dois partir pour être payée équitablement et travailler sur projets quality?"

**Rising Action - The Alternative Emerges:**
Message LinkedIn: "ADVERT Creative Concierge cherche talents africains. Projets premium brands. 75% commission (vs 50% Fiverr). Portfolio rights garantis. Certifications. Community."

Yasmine sceptique (encore un marketplace qui exploite). Mais elle creuse:
- Commission: 75% talent, 25% plateforme (vs Fiverr 50/50)
- Projet moyen: 2-5 millions FCFA (€3k-€8k)
- Full creative ownership pour portfolio
- Credits garantis
- ADVERT certification = crédibilité

Elle s'inscrit. Upload portfolio. Vetting process (review qualité). Approuvée.

**The Climax - Premier Projet Premium:**
Match AI: Marque cosmétique Côte d'Ivoire (cliente d'Amina!) cherche illustratrice pour direction artistique complète. Budget: 4 millions FCFA (€6.5k). Timeline: 4 semaines.

Brief structuré (template ADVERT Engagement pillar). Clair. Professionnel. Pas de scope creep.

Yasmine livre:
- Visual identity (couleurs, typo, mood)
- 12 illustrations custom
- Brand mascot
- Social media templates

Client **ravi**. Paiement escrow released. Yasmine reçoit 3 millions FCFA (€4.9k). **Plus qu'un mois normal.**

Bonus: Rights portfolio + credit public. Elle post case study Behance → Featured.

**Resolution - Staying Home, Thriving:**
18 mois plus tard:

- Yasmine a complété 24 projets via Concierge
- Revenue annuel: 42 millions FCFA (€68k) - **2x son objectif Paris**
- Portfolio world-class (5 Featured Behance projects)
- ADVERT-Certified Creative Strategist (formation 6-pillar framework)
- Elle mentor 3 junior designers Dakar
- **Elle a refusé Paris**

Yasmine dit: "ADVERT m'a permis de rester en Afrique, gagner équitablement, et travailler sur projets qui comptent. Je ne pars plus."

**Capabilities Revealed:**
- Talent profile & portfolio showcase
- AI-powered brand-talent matching algorithm
- Structured brief templates (from ADVERT pillars)
- Escrow payment system (75/25 split)
- Project milestone tracking
- Portfolio rights management
- Mutual rating system (2-way reviews)
- ADVERT certification program
- Community features (mentorship, collaboration)
- Dispute resolution process

---

### Journey 4: DevTeam at AgencyHub - API Integration Success

**Who is DevTeam?**
AgencyHub, grosse agence multi-offices (Lagos, Accra, Nairobi - 80 employés). CTO Chidi a entendu parler ADVERT. Problème: ils utilisent déjà Zoho pour operations, HubSpot pour CRM, Monday pour projets. Ils veulent ADVERT strategic nucleus MAIS intégré à leur stack existant. Pas question de tout migrer.

**Opening Scene - Integration Need:**
Chidi au PM spark01: "ADVERT est puissant, mais mes teams utilisent déjà 5 outils. Je ne peux pas leur demander de switcher tout vers nouvelle plateforme. Vous avez une API?"

spark01 (Post-MVP, Year 2): "Oui. API REST + SDK disponibles. Documentation complète. Webhooks pour events."

**Rising Action - Technical Discovery:**
DevTeam de Chidi (2 backend devs) explorent:
- API docs: `/api/v1/strategies` endpoints
- Authentication: OAuth 2.0
- SDK: npm package `@advert/sdk`
- Webhooks: strategy.generated, pillar.updated, superfan.milestone

Ils testent:
```javascript
const advert = new AdvertSDK(apiKey);
const strategy = await advert.strategies.generate({
  clientData: zohoContact,
  goals: ['superfan-growth', 'campaign-coherence'],
  frameworks: ['all']
});
```

Ça marche. 9 minutes → stratégie complète retournée.

**The Climax - Seamless Integration:**
DevTeam build custom integration:

1. **Zoho → ADVERT:** Nouveau client Zoho → auto-create ADVERT strategy draft
2. **ADVERT → HubSpot:** Stratégie generated → sync to HubSpot as campaign plan
3. **ADVERT → Monday:** Pillar completion → create Monday tasks per campaign element
4. **Superfan Tracking:** ADVERT superfan count → custom Zoho dashboard widget

Live en 3 semaines. AgencyHub teams continuent workflow habituel. ADVERT intégré invisiblement.

**Resolution - Best of Both Worlds:**
6 mois plus tard:

- AgencyHub a documenté 45 stratégies ADVERT via API
- Aucun changement workflow teams (adoption 100%)
- Zoho dashboard montre superfan metrics en temps réel
- Ils ont white-labeled ADVERT comme "AgencyHub Strategy Engine"
- Revenue per consultant +40% (productivity boost)

Chidi dit: "API nous a permis d'adopter ADVERT sans disruption. Nos tools existants + ADVERT brain = combinaison gagnante."

**Capabilities Revealed:**
- REST API (`/api/v1/*` endpoints)
- OAuth 2.0 authentication
- SDK (npm, pip, gems)
- Webhooks (strategy, pillar, superfan events)
- API documentation (OpenAPI/Swagger)
- Rate limiting & usage tiers
- White-label capabilities
- Custom integration support
- Developer portal & sandbox
- API analytics dashboard

---

### Journey Requirements Summary

Les 4 journeys révèlent ces **capability areas critiques:**

**Core Strategy Generation:**
- AI-powered 6-pillar framework (A-D-V-E-R-T)
- <10 min complete file generation
- 40+ variables with meta-generation
- Wizard mode + AI co-pilot
- Smart templates per sector
- Interview frameworks (Ikigai, Schwartz, Hero's Journey)

**Financial Intelligence:**
- Budget allocation visualizer
- ROI projection calculator
- Unit economics module (CODB)
- Campaign coherence scoring
- Monthly traction reports
- Predictability forecasting

**Marketplace Operations:**
- Talent profile & portfolio system
- AI matching algorithm
- Escrow payments (75/25 split)
- Structured brief templates
- Milestone tracking
- Mutual ratings
- Dispute resolution

**Integration & APIs:**
- REST API endpoints
- OAuth 2.0 auth
- SDKs (multiple languages)
- Webhooks for events
- White-label support
- Developer documentation

**User Management:**
- Multi-tenant architecture (agencies)
- Team collaboration & permissions
- Project storage & versioning
- Export formats (PDF, PPT, etc.)
- Dashboard analytics

**Data & Intelligence:**
- Superfan count tracking
- Benchmarking (sector averages)
- Pattern recognition
- Predictive insights
- Historical tracking


## Domain-Specific Requirements

### Compliance & Regulatory

**Money Transmitter Licensing:**
- ADVERT operates a two-sided marketplace with escrow payments (75% talent, 25% platform)
- **Approach:** Use Paystack/Flutterwave escrow services rather than holding funds directly
- **Rationale:** Third-party payment processors already hold money transmitter licenses across African markets (Côte d'Ivoire, Ghana, Nigeria, Kenya, etc.)
- **Benefit:** Avoid regulatory burden of obtaining licenses in 8+ jurisdictions

**Data Privacy (GDPR-Equivalent):**
- **Policy:** Adopt GDPR-like standards even though not EU-based
- **Requirements:**
  - User consent for data collection
  - Right to deletion (users can request data removal)
  - Data portability (users can export their data)
  - Transparent privacy policy explaining data use
- **Data Anonymization:** Aggregate insights NEVER expose individual brand or talent specifics
- **Example:** "Brands in fintech sector see 2.8x superfan growth with ritual X" (anonymized) vs "Brand ABC has 450 superfans" (not shared publicly)

**Intellectual Property Contracts:**
- **Clear IP ownership:** Template contracts define rights explicitly
- **Talent Rights:** Full creative ownership + portfolio usage rights
- **Brand Rights:** Perpetual commercial usage license
- **Credits:** Mandatory attribution for talent reputation building
- **Purpose:** Prevent disputes and protect both parties

### Technical Constraints

**Payment Infrastructure (African Markets):**
- **Multi-modal payment acceptance required:**
  - **Primary:** Mobile money (MTN, Orange Money, M-Pesa, Wave)
  - **Secondary:** Card payments (Paystack, Flutterwave, Stripe)
  - **Enterprise:** Bank transfers (NET 30 terms)
  - **Optional:** Crypto (USDC/USDT stablecoins)
- **Challenges:**
  - Transaction failures: 60-70% success rate industry average (vs 95%+ in developed markets)
  - Currency volatility (multi-currency pricing)
  - Chargeback fraud risk
- **Mitigations:**
  - Multi-modal redundancy (if MTN fails, try Orange Money)
  - Annual pre-pay discounts (reduce transaction frequency)
  - Dunning management (automated retry logic, 3 attempts over 10 days)
  - Local bank accounts in major markets
  - Expected payment success rate: 85-90%

**API Security Standards (Post-MVP):**
- **Authentication:** OAuth 2.0 (industry standard for API access)
- **Authorization:** API keys with scopes/permissions (read-only, read-write, admin)
- **Rate Limiting:** Prevent abuse and DDoS attacks
  - Professional tier: 1000 requests/hour
  - Enterprise tier: Custom limits
- **Audit Logs:** Track all API access for enterprise clients (compliance requirement)
- **Key Rotation:** Periodic key refresh policies
- **Monitoring:** API analytics dashboard (usage, errors, performance)

**Data Security:**
- **Encryption at rest:** All sensitive data encrypted in database
- **Encryption in transit:** HTTPS/TLS for all communications
- **Access controls:** Role-based permissions (RBAC)
- **Backup & recovery:** Automated daily backups, 30-day retention
- **Data residency:** Cloud hosting (AWS/GCP) with consideration for African data sovereignty

**Content Moderation (Marketplace):**
- **Portfolio vetting:** Manual review for first 200 talents (quality + appropriateness)
- **Automated flagging:** AI-powered detection of inappropriate content
- **Community reporting:** Users can report suspicious activity
- **Quality scoring:** Track talent performance, flag outliers
- **Ban policies:** Repeat offenders removed from platform

### Integration Requirements

**Payment Processors:**
- **Paystack:** Nigeria, Ghana, South Africa (card + mobile money)
- **Flutterwave:** Pan-African (multi-currency, escrow support)
- **Mobile Money APIs:**
  - MTN Mobile Money API
  - Orange Money API
  - M-Pesa API (Kenya, Tanzania)
  - Wave API (Senegal, Côte d'Ivoire)
- **Stripe:** International clients fallback

**Cloud & Infrastructure:**
- **Hosting:** AWS or GCP (auto-scaling, managed services)
- **Database:** PostgreSQL (relational data for 40+ variables, user accounts)
- **AI/LLM:** Anthropic Claude API or OpenAI GPT-4 API
- **CDN:** CloudFront or CloudFlare (asset delivery)
- **Monitoring:** Datadog or New Relic (performance, uptime)

**Third-Party Tools (Enterprise Integrations):**
- **CRM:** Zoho, HubSpot connectors (API/webhooks)
- **Project Management:** Monday, Asana integrations
- **Marketing Automation:** Integration with Meta Business Suite (future)

### Risk Mitigations

**Payment Fraud & Disputes:**
- **Escrow system:** Funds held until delivery confirmed
- **Milestone payments:** 50% upfront, 50% on completion
- **Payment protection:** First €50k/year chargebacks covered by platform
- **Dispute resolution:** Independent arbitrator reviews, objective quality rubric
- **Fraud detection:** Transaction velocity limits, device fingerprinting, AI fraud scoring
- **Payout delays:** 7-day hold on withdrawals (catch fraud before money leaves)

**Data Breach Prevention:**
- **Security measures:** Encryption, access controls, audit logs
- **Incident response plan:** Documented procedures for breach handling
- **Insurance:** Cyber liability coverage (€1M)
- **Compliance:** GDPR-equivalent privacy practices
- **Penetration testing:** Annual security audits

**IP Disputes (Creative Work):**
- **Clear contracts:** Pre-agreed deliverables checklist
- **Portfolio verification:** Watermark concierge work
- **Mediation process:** Platform mediates if deliverables don't meet standards
- **Escrow protection:** Payment released only when both parties satisfied
- **Legal framework:** Terms of Service with arbitration clause

**Platform Abuse & Quality Control:**
- **Talent vetting:** Manual approval for first 200 talents
- **Rating system:** Two-way reviews (brand rates talent, talent rates brand)
- **Dispute history:** >20% dispute rate = "High Risk" flag
- **Quality tiers:** "High confidence" vs "Low confidence" data scoring
- **Account verification:** Email + phone + payment method + LinkedIn/company website
- **Fake account detection:** Same IP creating multiple accounts = ban

**Market Timing & Adoption Risk:**
- **Validation:** Pre-launch interviews with 50+ agency directors
- **Beta pricing:** Offer first 10 clients €15k (de-risk price sensitivity)
- **Flexible business model:** If SaaS slow, pivot consulting-only (profitable, sustainable)
- **Early warning signals:** Track leading indicators (inquiries, demos, RSVPs)
- **Pivot triggers:** Month 3 checkpoint - if <5 clients signed, pivot or double-down


## Innovation & Novel Patterns

### Detected Innovation Areas

ADVERT demonstrates **7 distinct innovation vectors** that differentiate it from traditional marketing strategy tools and SaaS B2B platforms:

**1. Multi-Agent AI Architecture (6 Specialized Pillar Agents)**
- **Innovation:** Sequential coordination of 6 domain-specific AI agents (Authenticité → Distinction → Valeur → Engagement → Risk → Track)
- **Novel Approach:** Unlike single-prompt AI tools, ADVERT orchestrates specialized agents with interdependencies - Distinction agent receives Authenticité context, Risk agent challenges all previous pillars
- **Technical Novelty:** Agent handoff protocol with context preservation across 6 sequential executions
- **Current State:** MVP uses single-LLM architecture (Claude Sonnet 3.5); multi-agent architecture planned for Growth phase

**2. Psychology-Grounded Proprietary Methodology**
- **Innovation:** Systematizing "cult brand creation" through integration of Schwartz Values Theory, Ikigai framework, Hero's Journey archetypal mapping, and AARRR funnel dynamics
- **Novel Approach:** Traditional marketing lacks psychological rigor - ADVERT makes implicit psychology explicit and actionable
- **Differentiation:** Competitors offer campaign planning; ADVERT delivers identity architecture + operational strategy
- **Defensibility:** Framework documented, trademark-able, difficult to replicate without deep psychology understanding

**3. Meta-Variable Generation System**
- **Innovation:** Context-adaptive variable generation rather than fixed questionnaire templates
- **Novel Approach:** AI analyzes sector/company/goals → generates 40+ relevant variables dynamically
- **Example:** Fintech brand gets "Trust Signals" variable; Fashion brand gets "Aesthetic Codes" variable
- **Technical Challenge:** Requires sophisticated prompt engineering + variable taxonomy system

**4. Data Trojan Horse Strategy via Creative Concierge**
- **Innovation:** Marketplace as intelligence acquisition mechanism, not just revenue stream
- **Novel Approach:** 75% commission to talent (vs 50% Fiverr) positions platform as talent-first - data accumulation is strategic byproduct
- **Intelligence Value:** Brief templates → reveal brand priorities; project patterns → identify winning strategies; talent performance → quality benchmarking
- **Competitive Moat:** First-mover advantage in African creative marketplace data

**5. North Star Metric = Superfans (Contrarian SaaS Philosophy)**
- **Innovation:** Rejecting ARR/MRR/CAC as primary success metrics in favor of aggregate superfan count across ADVERT-powered brands
- **Novel Approach:** Product success measured by customer outcomes (superfans created) rather than revenue extraction
- **Philosophical Stance:** "ADVERT succeeds when our clients' brands have superfans, not when we maximize ARPU"
- **Risk Factor:** This is the **MOST RISKY innovation** - investors expect SaaS metrics, not impact metrics; hard to benchmark; fundraising challenge

**6. StratCreaOf Positioning ("Strategic Creative Officer")**
- **Innovation:** Creating new job title category that doesn't exist yet
- **Novel Approach:** CMO focuses on brand; COO focuses on operations; StratCreaOf is the synthesis - strategic nucleus connected to operational execution
- **Market Gap:** Addresses "strategy-execution disconnect" endemic in African agencies
- **Positioning Risk:** Education required (no existing market category); could confuse vs simplify

**7. Democratizing McCann/Havas Sophistication**
- **Innovation:** Making €500k+ consulting sophistication accessible at €20k (consulting) or €299/mo (SaaS)
- **Novel Approach:** AI compression of expertise - what took 3 months + 5 consultants now takes 4 weeks + 1 agency director + ADVERT
- **Impact Thesis:** Break mediocrity cycle + talent exodus by elevating African agency capabilities pan-continent
- **Economic Model:** 10x price reduction through AI efficiency while maintaining 93%+ gross margins

### Market Context & Competitive Landscape

**Existing Solutions & Their Limitations:**

**Traditional Consulting (McCann, Havas, Ogilvy):**
- **Strengths:** Deep expertise, proven methodologies, global credibility
- **Weaknesses:** Expensive (€500k-€2M engagements), slow (3-12 months), inaccessible to 98% of African agencies, not operationalized
- **ADVERT Differentiation:** 10x cheaper, 3x faster, AI-powered, operationally integrated

**Marketing Strategy Tools (HubSpot, Marketo, Monday Marketing):**
- **Strengths:** Campaign execution, project tracking, automation
- **Weaknesses:** No strategic nucleus, template-based (not context-adaptive), US-centric frameworks, no superfan methodology
- **ADVERT Differentiation:** Psychology-grounded identity architecture, Africa-specific context, superfan-oriented outcomes

**Creative Marketplaces (Fiverr, Upwork, 99designs):**
- **Strengths:** Global talent pool, established escrow, transparent pricing
- **Weaknesses:** Race-to-bottom pricing (exploitative to talent), no quality curation, transactional (not strategic)
- **ADVERT Differentiation:** 75% commission (vs 50%), ADVERT-certified talent, strategic brief templates, African talent focus

**AI Content Tools (Jasper, Copy.ai, ChatGPT):**
- **Strengths:** Fast content generation, low cost, accessible
- **Weaknesses:** Generic output, no strategic framework, prompt engineering burden on user, no psychological grounding
- **ADVERT Differentiation:** Structured 6-pillar methodology, psychology integration, strategy + execution, living document

**Competitive Gaps ADVERT Fills:**

1. **Strategy-Execution Bridge:** Competitors do strategy OR execution, not both tightly coupled
2. **Psychological Rigor:** Marketing tools lack Schwartz/Ikigai/Hero's Journey depth
3. **Africa-Specific Context:** US/EU frameworks don't address African market realities (payment infrastructure, talent retention, budget constraints)
4. **Superfan Methodology:** No competitor systematizes cult brand creation
5. **Living Document:** Static deliverables vs ADVERT's dynamic, modify-one-variable-cascade-updates approach

**Market Timing & Readiness:**

- **AI Maturity:** Claude/GPT-4 performance sufficient for high-quality generation (2023+ capability)
- **African SaaS Adoption:** Mobile-first infrastructure + fintech explosion (Paystack, Flutterwave) enabling digital payments
- **Talent Crisis Awareness:** Agency directors openly discuss talent exodus - problem recognition high
- **Proof Points:** SPAWT case study demonstrates methodology viability

### Validation Approach

**Most Defensible Innovation: Psychology-Grounded Proprietary Methodology**

**Why Most Defensible:**
- Documented framework (6 pillars) with clear psychological foundations
- Based on established theories (Schwartz Values, Ikigai, Hero's Journey) - credibility via academic rigor
- Trademark/IP protection possible (framework naming, process documentation)
- Network effects: More usage → More data → Better insights → Stronger methodology
- Difficult to reverse-engineer without deep psychology + marketing expertise

**Validation Strategy:**

**Phase 1: Methodology Effectiveness (Months 1-6)**
- **Metric:** Client satisfaction scores across 15 consulting engagements
- **Target:** 80%+ clients rate deliverable as "Exceeded Expectations"
- **Proof Point:** SPAWT case study already validates framework works - need replication
- **Data Collection:** Post-delivery surveys, client testimonials, before/after coherence scores

**Phase 2: Outcomes Validation (Months 6-12)**
- **Metric:** Superfan count growth for ADVERT-powered brands
- **Target:** Brands generate 100-300 superfans within 6 months of strategy deployment
- **Measurement:** Client-reported metrics (tracked via monthly traction reports)
- **Case Studies:** Document 5+ detailed stories of superfan creation

**Phase 3: AI Generation Quality (Months 1-12)**
- **Metric:** Percentage of AI-generated content directly usable (vs requiring refinement)
- **Target:** 80%+ content usable (20% human refinement acceptable)
- **Method:** Track consultant editing time; survey "How much did you change?"
- **Benchmark:** Compare ADVERT output quality to manual consultant-created strategies

**Phase 4: Speed & Efficiency (Months 1-12)**
- **Metric:** Time from client interview to final deliverable
- **Target:** <4 weeks (vs 3 months traditional consulting)
- **Proof:** Document timestamps across 30 engagements
- **Cost Validation:** Maintain 93%+ gross margins (API costs <$1 per generation)

**Phase 5: Competitive Differentiation (Months 6-18)**
- **Metric:** Win rate on competitive pitches (ADVERT-powered agency vs traditional agencies)
- **Target:** 60%+ win rate when ADVERT-powered agencies compete on equal-budget pitches
- **Story Collection:** Document pitch wins (e.g., Amina beats McCann on 30M FCFA account)

**Phase 6: North Star Metric Viability (Months 12-24)**
- **Metric:** Correlation between superfan count and client revenue growth
- **Target:** Demonstrate statistically significant relationship (e.g., +100 superfans → +15% revenue)
- **Purpose:** Validate that superfan metric is NOT vanity - it predicts business outcomes
- **Challenge:** This is the **MOST RISKY innovation** - must prove investors this metric matters

**Validation Checkpoints & Pivot Triggers:**

**Month 3 Checkpoint:**
- IF <5 consulting clients signed → Pricing issue OR demand issue → Pivot to lower price point or increase outreach
- IF 5+ clients signed but <70% satisfaction → Methodology needs refinement → Double-down on quality

**Month 6 Checkpoint:**
- IF 15 clients delivered with 80%+ satisfaction → Methodology validated → Proceed to SaaS MVP launch
- IF <15 clients OR <70% satisfaction → Consulting model not working → Fundamental methodology rethink required

**Month 12 Checkpoint:**
- IF 30 clients + 50 SaaS subscribers → Demand validated → Scale to Concierge launch
- IF <20 clients → Market timing wrong OR positioning unclear → Strategic pivot or shut down

### Risk Mitigation

**Risk 1: North Star Metric (Superfans) Doesn't Resonate with Investors**

**Risk Level:** HIGH (Most Risky Innovation)

**Failure Scenario:** Investors demand traditional SaaS metrics (ARR, CAC, LTV); superfan metric seen as vanity/unmeasurable; fundraising fails

**Mitigation Strategies:**
- **Dual Metrics:** Track superfans AS WELL AS ARR/MRR - don't abandon SaaS metrics, add superfans as leading indicator
- **Causation Proof:** Build data showing superfan count → revenue growth correlation (12-month lag study)
- **Customer Testimonials:** "We grew revenue 23% after ADVERT created 450 superfans" - make it tangible
- **Benchmark Creation:** Publish "Superfan Index" research - establish ADVERT as thought leader defining new metric category
- **Pivot Option:** If investors reject, reframe as "Customer Outcome Score" (more palatable B2B language)

**Risk 2: AI Generation Quality Insufficient (Below 80% Usability)**

**Risk Level:** MEDIUM-HIGH (Core Technical Assumption)

**Failure Scenario:** AI output requires 50%+ manual editing; consultants spend same time as manual creation; value proposition collapses

**Mitigation Strategies:**
- **Prompt Engineering Investment:** Dedicate Month 1-3 to iterative prompt refinement with real client data
- **Hybrid Workflow Design:** Position ADVERT as "AI co-pilot" not "AI replacement" - 80% AI + 20% human is the intended model
- **Quality Benchmarking:** Measure baseline (manual consultant output quality) → Compare ADVERT output → Iterate until parity
- **Fallback Position:** If AI quality insufficient, pivot to "AI-assisted template" (less ambitious but still valuable)
- **Technology Hedge:** Monitor Claude/GPT-4 advancements - quality improving monthly (2025-2026 trajectory positive)

**Risk 3: Multi-Agent Coordination Fails (Technical Complexity)**

**Risk Level:** LOW (MVP Doesn't Require It)

**Failure Scenario:** 6-agent architecture doesn't coordinate properly; context loss between agents; output incoherent

**Mitigation Strategies:**
- **MVP Single-LLM:** Start with single Claude Sonnet 3.5 call (simpler, proven) - multi-agent is Growth phase enhancement
- **Sequential Validation:** Test agent handoffs offline before production deployment
- **Rollback Plan:** If multi-agent fails, single-LLM with structured prompt sections achieves 90% of value
- **Progressive Enhancement:** Add agents one-by-one (start with A-D-V as 3-agent, then add E-R-T)

**Risk 4: Creative Concierge Marketplace Fails (Chicken-Egg Problem)**

**Risk Level:** MEDIUM (Post-MVP Feature)

**Failure Scenario:** Not enough talent OR not enough brands → marketplace empty → no network effects

**Mitigation Strategies:**
- **Consulting-First Seeding:** Amina's clients (consulting engagements) become first Concierge customers - demand pre-validated
- **Manual Talent Curation:** Vet first 200 talents personally (quality over quantity) - hand-pick portfolio winners
- **Guaranteed Utilization:** Promise first 50 talents "minimum 1 project in Month 1" - platform subsidizes if needed
- **Brand Incentives:** First 20 brands get 20% discount on Concierge projects (early adopter pricing)
- **Pivot Option:** If marketplace fails, pivot to "ADVERT-Certified Talent Network" (directory, not marketplace)

**Risk 5: StratCreaOf Positioning Confuses Market**

**Risk Level:** LOW-MEDIUM (Positioning/Marketing Risk)

**Failure Scenario:** "What's a StratCreaOf?" confusion; agencies don't understand value prop; adoption friction

**Mitigation Strategies:**
- **A/B Testing:** Test "StratCreaOf" vs "Strategic Marketing Platform" vs "Brand Strategy Tool" in outreach campaigns
- **Education Content:** Publish thought leadership explaining strategy-execution gap + StratCreaOf solution
- **Customer Language:** Listen to how clients describe ADVERT - adopt their language if clearer
- **Fallback Position:** If StratCreaOf doesn't land, simplify to "ADVERT: Strategic Brand Platform for African Agencies"

**Risk 6: Payment Infrastructure Failures (African Markets)**

**Risk Level:** MEDIUM (Operational Reality)

**Failure Scenario:** 40%+ payment failures; customer churn due to billing issues; cash flow disruptions

**Mitigation Strategies:**
- **Multi-Modal Redundancy:** MTN fails → Orange Money fallback → Paystack card fallback (3-layer safety)
- **Annual Pre-Pay Incentives:** 20% discount for annual payment (reduces transaction frequency + failure risk)
- **Dunning Management:** Automated retry logic (3 attempts over 10 days before cancellation)
- **Local Bank Accounts:** Establish Côte d'Ivoire, Ghana, Nigeria bank accounts for manual transfers
- **Expected Performance:** 85-90% success rate (vs 60% baseline) with mitigations in place

**Risk 7: Talent Exodus Continues (Impact Thesis Fails)**

**Risk Level:** LOW (Long-Term Societal Risk)

**Failure Scenario:** African creative talent still leaves for Paris/London despite ADVERT; glass ceiling persists

**Mitigation Strategies:**
- **Yasmine Stories:** Document talent retention case studies - show ADVERT enables local earning parity
- **Certification Value:** ADVERT-Certified Creative becomes credential that commands higher local rates
- **Community Building:** Foster African creative community (mentorship, collaboration) - social ties reduce exodus
- **Impact Measurement:** Track "Talent Retention Rate" as secondary metric (survey Concierge talent: "Still planning to emigrate?")
- **Reframe Success:** Even if exodus continues, ADVERT success = elevated agency quality + better client outcomes

**Overall Risk Philosophy:**

ADVERT embraces **progressive de-risking**:
- Month 3: Demand validation (can we sell consulting?)
- Month 6: Methodology validation (does the framework work?)
- Month 12: SaaS validation (will people subscribe?)
- Month 18: Concierge validation (does marketplace work?)
- Month 24: Impact validation (are we changing African marketing landscape?)

Each phase validates assumptions BEFORE scaling investment. If any phase fails, clear pivot triggers defined.


## SaaS B2B Specific Requirements

### Project-Type Overview

ADVERT is a **SaaS B2B platform** serving African marketing agencies and their enterprise brand clients. The architecture must support:

- **Primary Users:** Agency directors, consultants, and strategists who create and manage brand strategies
- **Secondary Users:** Brand directors and marketing teams who consume insights and reports (view-only access)
- **Tertiary Users:** Developers who integrate ADVERT into existing enterprise toolchains via API/SDK

**Key SaaS B2B Characteristics:**
- Multi-tenant architecture with agency-level data isolation
- Role-based access control (RBAC) with hierarchical permissions
- Tiered subscription model (Starter, Professional, Enterprise)
- Third-party integrations (CRM, project management, payment processors)
- Enterprise compliance requirements (SOC 2, ISO 27001 roadmap)

**Business Model Alignment:**
- MVP focuses on consulting delivery (manual SaaS usage)
- Growth phase adds self-service SaaS with team collaboration
- Vision phase delivers enterprise-grade platform with white-label options

### Multi-Tenancy Model

**MVP (Months 1-12): Single-Tenant Architecture**

**Rationale:**
- Simplifies initial development (no tenant isolation complexity)
- Consulting business model doesn't require multi-tenancy initially
- Each agency gets dedicated instance or namespace
- Reduces security risk during validation phase

**Implementation:**
- Database: Single schema per agency (e.g., `advert_agency_amina`, `advert_agency_agencyhub`)
- Authentication: Separate user pools per tenant
- Data isolation: Physical separation (no shared tables)
- Deployment: Containerized instances (Docker/Kubernetes namespaces)

**Limitations:**
- Higher infrastructure cost (no resource sharing)
- Manual provisioning for new agencies
- No cross-tenant analytics or benchmarking

---

**Growth Phase (Months 13-24): Multi-Tenant Architecture**

**Tenant Definition:**
- **Tenant = Agency** (not individual brands)
- Each agency manages multiple client brands within their tenant
- Example: Amina's agency (tenant_id: `amina_agency`) contains brands: SPAWT, CosmétiqueCo, FinTechABC

**Data Isolation Strategy:**

**Option A: Row-Level Tenancy (Chosen Approach)**
- Shared database with `tenant_id` column on all tables
- PostgreSQL Row-Level Security (RLS) policies enforce isolation
- Benefits: Cost-efficient, easier maintenance, enables cross-tenant analytics
- Risks: Requires rigorous security testing, query performance overhead

**Schema Design Example:**
```sql
CREATE TABLE strategies (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  brand_name VARCHAR(255),
  pillar_data JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Row-Level Security Policy
CREATE POLICY tenant_isolation ON strategies
  USING (tenant_id = current_setting('app.current_tenant')::UUID);
```

**Tenant Provisioning Flow:**
1. Agency signs up (new tenant created)
2. Tenant configuration: branding, domain (optional custom subdomain: `amina.advert.com`)
3. Agency Owner invited (first user with full permissions)
4. Team members added with role assignments

**Cross-Tenant Features:**
- **Benchmarking:** "Your coherence score (81) vs sector average (65)" - anonymized aggregate data
- **Pattern Recognition:** "Brands in fintech sector with ritual X see 2.8x superfan growth" - cross-tenant insights
- **Data Privacy:** Individual brand data NEVER exposed across tenants; only anonymized aggregates

**Enterprise Customization (Year 2+):**
- Custom subdomains (`agencyhub.advert.com`)
- White-label branding (logo, colors, email templates)
- Dedicated infrastructure option (isolated database for enterprise clients)
- SSO integration (SAML, OAuth with enterprise identity providers)

### Permission Model (RBAC)

**Role-Based Access Control Matrix:**

ADVERT implements a **4-tier role hierarchy** with granular permissions:

| **Permission**                     | **Agency Owner** | **Consultant** | **Brand Client** | **Developer** |
|------------------------------------|------------------|----------------|------------------|---------------|
| Create new brand strategies        | ✅               | ✅             | ❌               | ✅ (API)      |
| Edit own strategies                | ✅               | ✅             | ❌               | ✅ (API)      |
| Edit others' strategies            | ✅               | ❌             | ❌               | ❌            |
| Delete strategies                  | ✅               | ⚠️ (own only)  | ❌               | ❌            |
| View all agency strategies         | ✅               | ✅             | ⚠️ (assigned)    | ✅ (API)      |
| Export reports (PDF, PowerPoint)   | ✅               | ✅             | ✅               | ✅ (API)      |
| View financial clarity dashboard   | ✅               | ✅             | ✅               | ✅ (API)      |
| Manage team members                | ✅               | ❌             | ❌               | ❌            |
| Assign roles & permissions         | ✅               | ❌             | ❌               | ❌            |
| Manage billing & subscription      | ✅               | ❌             | ❌               | ❌            |
| Access API keys                    | ✅               | ❌             | ❌               | ✅            |
| White-label customization          | ⚠️ (Enterprise)  | ❌             | ❌               | ❌            |
| View audit logs                    | ✅               | ❌             | ❌               | ❌            |

**Role Definitions:**

**1. Agency Owner**
- **Who:** Amina (agency director), Chidi (CTO at AgencyHub)
- **Capabilities:** Full platform control, billing management, team administration
- **Use Case:** Strategic oversight, business operations, team coordination
- **Limit:** 1-3 per tenant (primary + backup owners)

**2. Consultant**
- **Who:** Agency strategists, junior consultants, account managers
- **Capabilities:** Create and edit strategies for client brands, generate reports, collaborate on projects
- **Use Case:** Day-to-day strategy creation and client delivery
- **Limit:** Unlimited (scales with team size)
- **Constraint:** Cannot delete others' work or manage billing (prevents accidental data loss)

**3. Brand Client (View-Only)**
- **Who:** Kofi (Brand Director), CMOs, marketing managers at client companies
- **Capabilities:** View assigned strategies, access dashboards, export reports
- **Use Case:** Client transparency - brands see their ADVERT files and track progress
- **Limit:** Unlimited (each brand can have multiple viewers)
- **Constraint:** Read-only access (cannot modify strategies, protects agency IP)
- **Assignment:** Consultant assigns Brand Client to specific strategies only (no access to other agency clients)

**4. Developer (API Access)**
- **Who:** DevTeam at AgencyHub, technical integrators, automation engineers
- **Capabilities:** Programmatic access via API/SDK, create/read strategies, trigger generation workflows
- **Use Case:** Integration with Zoho, HubSpot, Monday, custom automation
- **Limit:** API keys per tier (Professional: 2 keys, Enterprise: unlimited)
- **Constraint:** Cannot access UI, manage billing, or invite users (API-only scope)

**Permission Inheritance:**
- Agency Owner inherits all Consultant permissions + administrative capabilities
- Consultant can perform all creation/editing tasks but not administrative functions
- Brand Client inherits read permissions only
- Developer has parallel access via API (separate permission scope)

**Special Permissions:**

**Project Assignment (Consultant → Brand Client):**
- Consultant creates strategy for "CosmétiqueCo"
- Consultant invites Kofi (Brand Director at CosmétiqueCo) as Brand Client
- Kofi receives email: "You've been invited to view CosmétiqueCo's ADVERT strategy"
- Kofi can ONLY see CosmétiqueCo strategy (not other agency clients)

**Audit Trail (Agency Owner Only):**
- View logs: "Who created what, when, from where"
- Track changes: "Consultant A edited Pillar D on 2026-03-15 at 14:32"
- Security monitoring: Unusual access patterns, failed login attempts
- Compliance requirement for enterprise clients

**MVP Simplification:**
- MVP launches with **2 roles only**: Agency Owner + Consultant (no Brand Client or Developer roles)
- Growth phase adds Brand Client (view-only access)
- Post-MVP adds Developer (API access)
- Rationale: Reduce complexity, validate core workflows first

### Subscription Tiers

**Tiered Pricing Strategy:**

ADVERT offers **3 subscription tiers** with progressive feature unlocks and usage limits:

---

**Starter Tier - €99/month**

**Target Audience:**
- Solo consultants, small agencies (1-3 employees)
- Testing ADVERT before committing to consulting package
- Agencies with low client volume (<5 brands/year)

**Features & Limits:**
- **Active Strategies:** 3 concurrent (archive old ones to create new)
- **Users:** 1 (Agency Owner only, no team collaboration)
- **AI Generations:** 10/month (enough for 3 strategies + revisions)
- **Storage:** 5GB (documents, exports, assets)
- **Templates:** Basic sector templates (Fashion, Fintech, FMCG, B2B SaaS)
- **Export Formats:** PDF only (no PowerPoint, no branded templates)
- **Support:** Email support (48-hour response time)
- **Analytics:** Basic metrics (coherence score, pillar summaries)

**What's NOT Included:**
- ❌ Team collaboration (no Consultant role)
- ❌ Brand Client access (no view-only sharing)
- ❌ Advanced analytics (no benchmarking, no predictive insights)
- ❌ Third-party integrations (no Zoho, HubSpot, Monday)
- ❌ API access
- ❌ Priority support

**Use Case Example:**
- Solo consultant creates 3 strategies/month for clients
- Uses Starter tier as AI co-pilot tool
- Exports PDFs for client delivery
- Upgrades to Professional when team grows

---

**Professional Tier - €299/month** ⭐ (Most Popular)

**Target Audience:**
- Amina's agency (5-15 employees)
- Established agencies with consistent client flow (10-30 brands/year)
- Agencies needing team collaboration and client transparency

**Features & Limits:**
- **Active Strategies:** Unlimited
- **Users:** 3 included (Agency Owner + 2 Consultants), +€49/mo per additional user
- **AI Generations:** Unlimited
- **Storage:** 50GB
- **Templates:** Advanced sector templates + custom template builder
- **Export Formats:** PDF, PowerPoint, Excel, branded templates
- **Support:** Priority email + live chat (4-hour response time)
- **Analytics:** Advanced analytics (benchmarking, superfan tracking, coherence trends)
- **Brand Client Access:** ✅ Invite unlimited view-only clients
- **Team Collaboration:** ✅ Shared workspace, activity feed, comments
- **Version History:** 90-day rollback (restore previous strategy versions)

**What's NOT Included:**
- ❌ Third-party integrations (manual workflow only)
- ❌ API access (no programmatic access)
- ❌ White-label customization
- ❌ Custom subdomain
- ❌ Dedicated support

**Use Case Example:**
- Amina's agency (Agency Owner + 2 Consultants)
- Creates 20 strategies/year across sectors
- Invites brand clients (Kofi) to view dashboards
- Exports branded PowerPoints for client presentations
- Tracks superfan metrics and benchmarks against sector averages

**Pricing Math:**
- Base: €299/mo (3 users)
- Add 2 more Consultants: +€98/mo (5 users total)
- Total: €397/mo for 5-person team

---

**Enterprise Tier - Custom Pricing** (Starts at €999/month)

**Target Audience:**
- AgencyHub (50+ employees, multi-office)
- Large agencies with high-volume needs (50+ brands/year)
- Agencies requiring white-label, API, and enterprise compliance

**Features & Limits:**
- **Active Strategies:** Unlimited
- **Users:** Unlimited (no per-user fees)
- **AI Generations:** Unlimited (dedicated rate limits)
- **Storage:** 500GB+ (scalable)
- **Templates:** All templates + custom-built templates by ADVERT team
- **Export Formats:** All formats + custom export builders
- **Support:** Dedicated success manager + phone support (1-hour SLA)
- **Analytics:** Full analytics suite + custom reports
- **Brand Client Access:** ✅ Unlimited
- **Team Collaboration:** ✅ Advanced (approval workflows, audit logs)
- **Third-Party Integrations:** ✅ Zoho, HubSpot, Monday, Asana connectors
- **API Access:** ✅ REST API + SDK (npm, pip) + webhooks
- **Developer Role:** ✅ API keys for DevTeam
- **White-Label:** ✅ Custom branding (logo, colors, domain)
- **Custom Subdomain:** ✅ `agencyhub.advert.com`
- **SSO Integration:** ✅ SAML, OAuth (enterprise identity providers)
- **Compliance:** ✅ SOC 2 reports, custom DPAs, dedicated infrastructure option
- **Version History:** Unlimited rollback

**Custom Add-Ons:**
- **Dedicated Infrastructure:** Isolated database + compute (€2k+/mo)
- **Custom AI Training:** Fine-tune models on agency's historical data (€5k-€15k one-time)
- **Professional Services:** Implementation support, training, custom integrations (€10k-€50k)

**Use Case Example:**
- AgencyHub (80 employees, 100+ brands)
- DevTeam integrates ADVERT API with Zoho + HubSpot + Monday
- White-labeled as "AgencyHub Strategy Engine"
- SSO with Google Workspace for seamless team login
- Dedicated success manager onboards teams, provides training

**Pricing Model:**
- Base: €999/mo (up to 10 users, basic integrations)
- Volume pricing: €1,500-€5,000/mo (50+ users, full feature access)
- Custom quote: For dedicated infrastructure, custom AI training

---

**Annual Discount:**
- 20% off annual pre-pay (all tiers)
- Reduces payment transaction failures (African payment infrastructure challenge)
- Improves cash flow predictability

**Free Trial:**
- 14-day free trial (Professional tier features)
- No credit card required
- Converts to Starter automatically if no upgrade

**Upgrade Path:**
- Starter → Professional: Immediate (prorated billing)
- Professional → Enterprise: Sales call required (custom quote)
- Downgrade: Allowed, takes effect next billing cycle (no prorated refunds)

### Integration Strategy

**Integration Philosophy:**

ADVERT operates as the **"Strategic Nucleus"** connected to third-party **"Operational OS"** tools. Integrations enable:
- **Bi-directional data flow:** ADVERT strategy → CRM campaigns; CRM results → ADVERT traction reports
- **Workflow automation:** New Zoho client → auto-create ADVERT strategy draft
- **Unified dashboard:** Superfan metrics visible in HubSpot, Monday task creation from ADVERT pillars

**Phased Integration Roadmap:**

---

**MVP (Months 1-12): Payment Processors Only**

**Priority:** Enable revenue collection across African payment infrastructure

**Integrations:**
1. **Paystack** (Nigeria, Ghana, South Africa)
   - Card payments (Visa, Mastercard)
   - Mobile money (MTN, Orange Money)
   - Bank transfers (direct debit)
   - Use case: Subscription billing, Concierge escrow

2. **Flutterwave** (Pan-African, 30+ countries)
   - Multi-currency support (USD, NGN, GHS, KES, XOF, etc.)
   - Escrow API (Concierge marketplace payments)
   - Payout API (talent payments, 75% commission distribution)
   - Use case: Primary payment gateway, marketplace transactions

3. **Mobile Money Direct APIs** (Fallback/Redundancy)
   - MTN Mobile Money API
   - Orange Money API
   - M-Pesa API (Kenya, Tanzania)
   - Wave API (Senegal, Côte d'Ivoire)
   - Use case: When Paystack/Flutterwave fail (multi-modal redundancy)

**Implementation Notes:**
- Webhook listeners for payment events (success, failure, chargeback)
- Dunning management (3 retry attempts over 10 days)
- Fraud detection (transaction velocity limits, device fingerprinting)
- Expected success rate: 85-90% (vs 60% baseline African infrastructure)

---

**Growth Phase (Months 13-24): CRM & Project Management**

**Priority:** Enable enterprise workflow integration (Journey 4 requirement)

**CRM Integrations:**

1. **Zoho CRM** (Popular in African agencies)
   - **Trigger:** New contact created → Auto-create ADVERT strategy draft
   - **Sync:** Strategy completion → Add campaign plan to Zoho
   - **Data Flow:** ADVERT superfan count → Custom Zoho field
   - **Use Case:** AgencyHub uses Zoho for client management, ADVERT for strategy

2. **HubSpot** (Global standard, enterprise clients)
   - **Trigger:** Deal marked "Closed Won" → Generate ADVERT strategy
   - **Sync:** Pillar completion → Create HubSpot workflow tasks
   - **Data Flow:** Campaign coherence score → HubSpot dashboard widget
   - **Use Case:** Enterprise agencies with existing HubSpot subscriptions

**Implementation Approach:**
- Native integrations (not Zapier) for reliability
- OAuth 2.0 authentication (secure, user-controlled)
- Bi-directional sync (ADVERT ↔ CRM, not one-way)
- Field mapping UI (map ADVERT variables to CRM fields)

**Project Management Integrations:**

1. **Monday.com** (Visual workflow, popular with agencies)
   - **Trigger:** Pillar generated → Create Monday board with tasks
   - **Sync:** Strategy milestones → Monday timeline items
   - **Data Flow:** Campaign calendar → Monday project schedule
   - **Use Case:** Convert ADVERT strategy into executable project plan

2. **Asana** (Task management, developer-friendly API)
   - **Trigger:** Risk pillar → Create Asana tasks for mitigation actions
   - **Sync:** Engagement pillar rituals → Recurring Asana tasks
   - **Data Flow:** Track pillar completion → Asana project progress
   - **Use Case:** Agencies using Asana for internal operations

**Developer Experience:**
- Integration marketplace UI (browse, enable, configure)
- Pre-built templates ("Map ADVERT Engagement → Monday Board")
- Sandbox environment (test integrations without production data)
- Documentation: Step-by-step setup guides, API examples

---

**Vision Phase (Months 25+): Marketing Automation & Analytics**

**Priority:** Close the loop - strategy creation → execution → results → insights

**Marketing Platform Integrations:**

1. **Meta Business Suite** (Facebook, Instagram ads)
   - **Use Case:** ADVERT campaign calendar → Auto-schedule Meta ads
   - **Data Flow:** Ad performance → ADVERT traction reports
   - **Insight:** "Campaign A generated 120 superfans (Meta + Instagram)"

2. **Google Analytics 4**
   - **Use Case:** Track website behavior correlated with ADVERT campaigns
   - **Data Flow:** GA4 conversion events → ADVERT superfan scoring
   - **Insight:** "Users from ritual X have 3.2x higher LTV"

3. **Mailchimp / SendGrid** (Email marketing)
   - **Use Case:** ADVERT audience personas → Mailchimp segments
   - **Data Flow:** Email engagement → ADVERT superfan identification

**Advanced Integration: ADVERT API/SDK** (Post-MVP, Year 2)

**REST API (`/api/v1/*`):**
- Authentication: OAuth 2.0
- Endpoints:
  - `POST /api/v1/strategies` - Create new strategy
  - `GET /api/v1/strategies/{id}` - Retrieve strategy
  - `PUT /api/v1/strategies/{id}/pillars/{pillar}` - Update pillar
  - `GET /api/v1/analytics/superfans` - Get superfan metrics
  - `POST /api/v1/generate` - Trigger AI generation workflow

**SDK Support:**
- **npm:** `@advert/sdk` (JavaScript/TypeScript)
- **pip:** `advert-sdk` (Python)
- **Webhooks:** Real-time events (strategy.generated, pillar.updated, superfan.milestone)

**Use Case (Journey 4 - DevTeam):**
```javascript
const advert = new AdvertSDK(apiKey);
const strategy = await advert.strategies.generate({
  clientData: zohoContact,
  goals: ['superfan-growth', 'campaign-coherence'],
  frameworks: ['all']
});
// Returns complete ADVERT strategy in 9 minutes
```

**Integration Marketplace Revenue:**
- Premium integrations: +€49-€99/mo per connector (Enterprise only)
- White-label partners: Revenue share (10% of customer subscription)
- Custom integration services: Professional services revenue (€10k-€50k)

### Compliance Requirements

**Compliance Roadmap: Progressive Certification**

ADVERT approaches compliance as **progressive maturity** aligned with business phase:

---

**MVP (Months 1-12): Foundation Security & Privacy**

**Priority:** Operational security sufficient for consulting business, beta SaaS users

**Requirements:**

**1. GDPR-Equivalent Data Privacy** (Already covered in Domain Requirements)
- User consent for data collection (opt-in, not opt-out)
- Right to deletion (users request data removal within 30 days)
- Data portability (users export data in JSON format)
- Transparent privacy policy (plain language, no legal jargon)

**2. Encryption Standards**
- **At Rest:** AES-256 encryption for all sensitive data (strategies, user info, payment details)
- **In Transit:** TLS 1.3 for all HTTPS communications
- **Key Management:** AWS KMS or GCP Cloud KMS (managed keys, rotation policies)

**3. Access Controls**
- **Authentication:** bcrypt password hashing, 2FA optional (email/SMS)
- **Authorization:** Role-based access control (RBAC matrix enforced at application layer)
- **Session Management:** JWT tokens, 24-hour expiry, refresh token rotation

**4. Basic Audit Logging**
- **Events Logged:** User login, strategy creation/edit/delete, permission changes, billing events
- **Retention:** 90-day log retention (sufficient for debugging, not compliance)
- **Access:** Agency Owner only (no user-facing audit UI yet)

**5. Backup & Recovery**
- **Frequency:** Automated daily backups (database, file storage)
- **Retention:** 30-day backup retention (point-in-time recovery)
- **Testing:** Monthly backup restoration test (ensure recoverability)

**6. Incident Response Plan** (Basic)
- **Documentation:** Security incident playbook (detect → contain → notify → remediate)
- **Notification:** Email users within 72 hours of confirmed breach (GDPR-equivalent)
- **Contact:** security@advert.com for vulnerability reports

**7. Vendor Security (Third-Party)**
- **Cloud Provider:** AWS or GCP (SOC 2 compliant infrastructure)
- **Payment Processors:** Paystack, Flutterwave (PCI-DSS compliant)
- **AI Provider:** Anthropic (Claude API) - review data handling policies

**What's NOT Required Yet:**
- ❌ SOC 2 certification (too expensive for MVP, €20k-€50k audit)
- ❌ ISO 27001 (overkill for early stage)
- ❌ Penetration testing (internal security review sufficient)
- ❌ Dedicated security team (founder handles security initially)

---

**Growth Phase (Months 13-24): SOC 2 Type I Certification**

**Priority:** Enterprise credibility - large agencies require SOC 2 for vendor approval

**Why SOC 2?**
- **Enterprise Requirement:** AgencyHub (80 employees) won't sign contract without SOC 2
- **Competitive Advantage:** "ADVERT is SOC 2 compliant" → trust signal vs competitors
- **Investor Signal:** Shows operational maturity, de-risks due diligence

**SOC 2 Trust Service Criteria (TSC):**

**1. Security** (CC6.0)
- Logical/physical access controls
- System monitoring (intrusion detection, anomaly detection)
- Change management (code deployment procedures, rollback capability)
- Risk assessment program (quarterly security reviews)

**2. Availability** (A1.0)
- 99%+ uptime SLA (not 99.9% yet, that's Year 3)
- Disaster recovery plan (RTO: 4 hours, RPO: 1 hour)
- Performance monitoring (Datadog, New Relic)
- Capacity planning (scale for 2x user growth)

**3. Confidentiality** (C1.0)
- Tenant data isolation (row-level security enforced)
- Encryption at rest/transit (already implemented MVP)
- Confidentiality agreements (NDAs with employees, contractors)

**4. Processing Integrity** (PI1.0)
- Data validation (AI generation quality checks)
- Error handling (graceful failures, retry logic)
- Transaction completeness (payment processing integrity)

**5. Privacy** (P1.0) - Optional for ADVERT
- GDPR-equivalent privacy (already implemented MVP)
- Data retention policies (delete data after account closure)
- Marketing opt-in/opt-out (user controls)

**SOC 2 Type I vs Type II:**
- **Type I:** Controls exist at a point in time (easier, faster, cheaper)
- **Type II:** Controls operate effectively over 6-12 months (more rigorous)
- **Year 2 Goal:** SOC 2 Type I (prove controls exist)
- **Year 3 Goal:** SOC 2 Type II (prove controls work over time)

**Implementation Timeline:**
- **Month 13-15:** Gap assessment (identify what's missing vs SOC 2 requirements)
- **Month 16-18:** Remediation (implement missing controls, document policies)
- **Month 19-21:** Readiness audit (internal or external pre-audit)
- **Month 22-24:** Official SOC 2 Type I audit (€20k-€50k cost)

**Vendor Selection:**
- **Auditor:** Choose from AICPA-approved firms (Drata, Vanta automate compliance)
- **Automation Tools:** Drata (€12k-€24k/year) or Vanta (€15k-€30k/year) streamline evidence collection

**What This Enables:**
- ✅ Enterprise sales (no more "We need SOC 2" blockers)
- ✅ Higher contract values (enterprise clients pay premium for compliance)
- ✅ Competitive moat (smaller competitors can't afford SOC 2)

---

**Vision Phase (Months 25+): SOC 2 Type II + ISO 27001**

**Priority:** Global enterprise expansion, government/financial services clients

**SOC 2 Type II:**
- **Difference from Type I:** Auditor monitors controls for 6-12 months (vs point-in-time)
- **Timeline:** Start Type II audit immediately after Type I certification
- **Cost:** €30k-€70k (more expensive due to longer audit period)
- **Outcome:** "ADVERT has maintained effective security controls for 12 months"

**ISO 27001 Certification:**
- **Why ISO 27001?** International standard, required for EU/global enterprise clients
- **Scope:** Information Security Management System (ISMS)
- **Requirements:** Risk management framework, 114 controls across 14 domains
- **Timeline:** 12-18 months from start to certification
- **Cost:** €50k-€150k (audit + implementation)

**ISO 27001 Benefits:**
- ✅ Global recognition (SOC 2 is US-centric, ISO 27001 is international)
- ✅ Government contracts (many governments require ISO 27001)
- ✅ Financial services (banks, insurance require ISO 27001 for vendors)
- ✅ Ultimate trust signal ("ADVERT: SOC 2 Type II + ISO 27001 certified")

**Additional Compliance (Industry-Specific):**

**Financial Services Clients:**
- PCI-DSS Level 1 (if processing >6M card transactions/year)
- FINRA regulations (if serving US financial institutions)
- Local regulations (Nigerian SEC, Ghana SEC, etc.)

**Healthcare Clients (Future):**
- HIPAA compliance (if ADVERT used for pharma/healthcare brands)
- Not priority for MVP (healthcare vertical is Year 3+)

**African-Specific Regulations:**
- **Data Sovereignty:** Preference for African cloud regions (AWS Cape Town, GCP Johannesburg)
- **Nigeria NDPR:** Nigeria Data Protection Regulation (GDPR-equivalent)
- **Kenya Data Protection Act:** Similar to GDPR
- **ECOWAS Data Protection:** Regional framework (West Africa)

**Compliance Operating Costs (Annual):**
- **SOC 2 Type I:** €20k-€50k/year (annual re-audit)
- **SOC 2 Type II:** €30k-€70k/year
- **ISO 27001:** €30k-€60k/year (surveillance audits)
- **Automation Tools:** €15k-€30k/year (Drata, Vanta)
- **Total Year 3+:** €95k-€210k/year compliance budget

**ROI Justification:**
- Enterprise contracts: €50k-€200k/year (compliance pays for itself with 1-2 enterprise deals)
- Risk mitigation: Avoid €1M+ breach costs, legal liability, reputation damage
- Competitive advantage: Compliance moat vs smaller competitors

### Implementation Considerations

**Technical Architecture for SaaS B2B:**

**Infrastructure Stack:**
- **Cloud Provider:** AWS or GCP (SOC 2 compliant, African regions available)
- **Compute:** Kubernetes (EKS or GKE) for containerized multi-tenant deployment
- **Database:** PostgreSQL with Row-Level Security (RLS) for tenant isolation
- **Caching:** Redis (session management, rate limiting, temporary data)
- **Object Storage:** S3 or Cloud Storage (strategy exports, assets, backups)
- **CDN:** CloudFront or CloudFlare (asset delivery, DDoS protection)

**Development Priorities (Phased):**

**Phase 1 (MVP - Months 1-6):**
- Single-tenant SaaS with basic RBAC (Agency Owner + Consultant roles)
- Payment integration (Paystack, Flutterwave) for subscription billing
- Core ADVERT generation engine (6-pillar AI workflow)
- PDF export only (simplify MVP scope)

**Phase 2 (MVP - Months 7-12):**
- Brand Client role (view-only access, client transparency)
- Advanced analytics (coherence scoring, superfan tracking)
- PowerPoint export + branded templates
- Team collaboration (activity feed, comments)

**Phase 3 (Growth - Months 13-18):**
- Multi-tenant architecture migration (row-level tenancy)
- CRM integrations (Zoho, HubSpot connectors)
- API/SDK (REST API, npm package, webhooks)
- SOC 2 Type I preparation

**Phase 4 (Growth - Months 19-24):**
- Project management integrations (Monday, Asana)
- White-label customization (Enterprise tier)
- SOC 2 Type I certification
- Advanced RBAC (custom roles, granular permissions)

**Development Team Size:**
- MVP: 2-3 full-stack engineers + 1 product manager (spark01)
- Growth: 5-7 engineers (2 backend, 2 frontend, 1 DevOps, 1 integrations, 1 AI/ML)
- Vision: 10-15 engineers (scale team with revenue)

**Key Technical Risks:**

**1. Multi-Tenancy Complexity**
- **Risk:** Row-level security policies fail, tenant data leaks
- **Mitigation:** Extensive integration testing, penetration testing pre-launch, gradual rollout (10 tenants → 50 → all)

**2. Payment Infrastructure Failures**
- **Risk:** 40%+ payment failures disrupt cash flow
- **Mitigation:** Multi-modal redundancy (covered in Domain Requirements), dunning management, annual pre-pay incentives

**3. API Rate Limits (AI Provider)**
- **Risk:** Claude API rate limits block generation during peak usage
- **Mitigation:** Queue system (generate strategies asynchronously), fallback to GPT-4, tiered rate limits per subscription

**4. Integration Maintenance Burden**
- **Risk:** CRM/PM tools change APIs, integrations break, support tickets spike
- **Mitigation:** Focus on 2-3 integrations initially (not 20), partner with Zapier for long-tail integrations, dedicated integrations engineer

**Success Metrics (SaaS B2B Specific):**

**Month 6:**
- 20 SaaS beta users (validation of self-service model)
- <30% monthly churn (product-market fit signal)
- 80%+ users activate within 7 days (onboarding effectiveness)

**Month 12:**
- 50 SaaS subscribers (Professional tier dominating)
- €180k SaaS revenue (50 users × €299/mo × 12 months)
- 3+ Enterprise pilot clients (API integration validation)

**Month 24:**
- 200 SaaS subscribers (€600k ARR)
- 5+ Enterprise clients (€50k-€200k contracts)
- SOC 2 Type I certified (enterprise credibility)
- 10+ active integrations (CRM, PM, marketing automation)

### Success Metrics for Pilier I (Implementation Planner)

**Consultant Productivity & Planning Speed:**
- 95%+ of consultants can create comprehensive 12-24 month roadmap in <2 hours
- Implementation timeline accuracy: ±10% variance vs. actual delivery dates
- Quick wins identification: 5+ implementable opportunities identified per project
- ROI calculator accuracy: Business case projections within 15 minutes

**Implementation Quality:**
- Roadmap adoption rate: 80%+ of clients adopt proposed implementation timeline without major revisions
- Dependency identification: 100% of critical path dependencies flagged before execution
- Risk mitigation: 90%+ of identified risks successfully mitigated through planning
- Stakeholder alignment: 85%+ of stakeholders confirm implementation plan readiness

**User Satisfaction:**
- Consultant satisfaction: 4.5+/5.0 stars for implementation planning features
- Client acceptance rate: 80%+ of implementation plans accepted on first presentation
- Ease of use: 90%+ of new users create first roadmap without assistance within first session

### Success Metrics for Pilier S (Strategic Cockpit Interface)

**Performance & Speed:**
- Strategic Cockpit load time: <2 seconds on 5+ Mbps connection (target: 1.5s average, 2s max at 95th percentile)
- PDF export of complete strategy: <5 seconds for 100-page documents
- Real-time dashboard updates: <100ms latency for live data refresh
- Navigation responsiveness: All interactive actions respond in <300ms

**Usability & Navigation:**
- Information findability: Users locate any section in <3 clicks from dashboard
- Navigation effectiveness: 95%+ of users find required information without help
- Dashboard comprehension: 90%+ of users understand key metrics within first 2 minutes
- Keyboard accessibility: 100% of core features accessible via keyboard only

**Interface Quality & Accessibility:**
- WCAG 2.1 AA compliance: 100% of interface elements meet accessibility standards
- Contrast ratio compliance: All text and UI elements meet 4.5:1 (normal) and 3:1 (large) ratios
- Screen reader compatibility: 100% of interface readable and navigable via screen readers
- Mobile responsiveness: Cockpit functional and readable on devices from 768px (tablet) upward

**Strategic Insight Delivery:**
- Dashboard update frequency: Real-time or <15 minute sync for all integrated data
- Data accuracy: 99%+ accuracy for financial and performance metrics displayed
- Insight generation: 80%+ of users report insights help with strategic decisions
- Drill-down capability: Users can navigate from summary to detail in <2 clicks

**Export & Deliverable Speed:**
- Strategic report generation: <30 seconds for standard PDF export
- Custom report builds: <60 seconds for complex custom format requests
- Data consistency: 100% consistency between cockpit display and exported reports
- Multi-format support: Export works without errors for PDF, Excel, PowerPoint, and JSON formats


## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach: Revenue-First Validation MVP**

ADVERT adopts a **consulting-led, SaaS-enabled** MVP strategy that prioritizes revenue generation and methodology validation before platform scaling:

**Strategic Rationale:**

**1. Revenue First = Sustainability**
- **Problem:** Many SaaS startups burn cash building platforms nobody wants
- **ADVERT Solution:** Consulting business (€20k packages) funds SaaS development - profitable from Month 1
- **Validation:** If agencies won't pay €20k for methodology, they won't subscribe at €299/mo
- **Cash Flow:** €600k consulting revenue (Year 1) sustains 2-3 engineers building SaaS MVP

**2. Methodology Validation Before Scale**
- **Problem:** Can't validate 6-pillar framework + AI generation quality without real clients
- **ADVERT Solution:** 30 consulting engagements = 30 real-world tests of methodology
- **Proof Points:** SPAWT case study + 29 more = undeniable methodology effectiveness
- **Risk Mitigation:** If methodology fails, pivot BEFORE investing €500k in SaaS platform

**3. Manual-First, Automate-Later**
- **Problem:** Building full automation before understanding user workflow = wasted features
- **ADVERT Solution:** spark01 delivers consulting manually (Excel → Claude API → refinement) - observes friction points
- **Insight Generation:** "Agencies need Brand Client view-only access" discovered through consulting, not guessed
- **Efficient Build:** Only automate workflows proven valuable through manual delivery

**4. Network Effects from Day 1**
- **Problem:** SaaS platforms need users to generate data; no users = no data = no insights
- **ADVERT Solution:** Consulting clients generate 30 ADVERT files (Year 1) = training data for benchmarking
- **Competitive Moat:** "Your coherence score (81) vs sector average (65)" impossible without data accumulation
- **Concierge Seeding:** Amina's consulting clients become first Creative Concierge customers (demand pre-validated)

**5. Proof Before Fundraising**
- **Problem:** Investors skeptical of "North Star = Superfans" metric without validation
- **ADVERT Solution:** €780k Year 1 revenue + 5 case studies + 50 SaaS subscribers = undeniable traction
- **Fundraising Leverage:** "We're already profitable, raising to scale faster" > "We need money to validate"

**MVP Philosophy Summary:**

> "ADVERT's MVP is not the minimum PRODUCT, it's the minimum PATH TO VALIDATION. We prove:
> 1. Agencies will pay for methodology (consulting demand)
> 2. Methodology creates superfans (client outcomes)
> 3. Self-service SaaS is desired (beta adoption)
> 4. Platform has competitive moat (data accumulation)
>
> Only THEN do we scale platform investment."

**Resource Requirements (MVP - Months 1-12):**

**Team Composition:**
- **1x Founder/PM** (spark01): Product vision, consulting delivery, client interviews, fundraising
- **2x Full-Stack Engineers:** Web app (React/Next.js frontend, Node.js/Python backend, PostgreSQL)
- **0.5x Designer** (contract/part-time): UI/UX for SaaS interface, export templates
- **0.25x DevOps** (contract): AWS/GCP setup, CI/CD pipelines, monitoring

**Total Headcount:** 3.75 FTE (lean team, high leverage through AI tooling)

**Budget Estimate (Year 1):**
- **Salaries:** €300k (2 engineers × €100k, 0.5 designer × €60k, 0.25 DevOps × €80k)
- **Infrastructure:** €24k (€2k/mo AWS/GCP + Claude API costs)
- **Tools & Software:** €12k (GitHub, Figma, monitoring, productivity tools)
- **Marketing:** €50k (case study production, awards submissions, conference presence)
- **Legal & Compliance:** €15k (contracts, privacy policy, basic compliance)
- **Contingency:** €50k (unexpected costs, contractor surge capacity)
- **Total MVP Budget:** €451k

**Funding Strategy:**
- **Self-Funded Option:** €600k consulting revenue covers €451k expenses = €149k profit (sustainable)
- **Angel Round Option:** Raise €500k-€1M to accelerate SaaS development, hire faster, expand marketing
- **Rationale:** Revenue-first model means fundraising is optional, not mandatory - reduces pressure

**Technical Stack (MVP):**
- **Frontend:** React + Next.js (modern, fast, SSR for SEO)
- **Backend:** Node.js + Express OR Python + FastAPI (depending on AI integration preference)
- **Database:** PostgreSQL (relational data, mature, scales well)
- **AI/LLM:** Anthropic Claude API (Sonnet 3.5 for MVP, upgrade to Opus for quality if needed)
- **Hosting:** AWS (ECS or Lambda) OR GCP (Cloud Run)
- **Authentication:** Auth0 or Clerk (managed auth, reduces security burden)
- **Payments:** Paystack + Flutterwave SDKs
- **Monitoring:** Datadog or New Relic (application performance monitoring)

**Why NOT Multi-Agent AI in MVP?**
- **Complexity:** 6-agent orchestration adds 3-6 months development time
- **Cost:** Multi-agent = 6x API calls = higher costs during validation phase
- **Quality:** Single Claude Sonnet 3.5 call with structured prompt achieves 85%+ of multi-agent value
- **Decision:** Single-LLM MVP, multi-agent in Growth phase (Year 2) when value proven

**Why NOT Creative Concierge in MVP?**
- **Chicken-Egg:** Marketplace needs both supply (talent) AND demand (brands) - hard to bootstrap
- **Focus:** Consulting + SaaS already stretches 3-person team; adding marketplace = dilution
- **Data Dependency:** Concierge benefits from ADVERT-generated briefs (pillar templates) - need ADVERT adoption first
- **Decision:** Soft-launch Concierge Month 12-18 after consulting seeds demand

### MVP Feature Set (Phase 1 - Months 1-12)

**Core User Journeys Supported:**

**Primary Journey: Amina (Agency Director)**
- ✅ **Journey Coverage:** 100% (consulting delivery workflow)
- **Key Moments:**
  - Interview client using ADVERT frameworks (Ikigai, Schwartz, Hero's Journey)
  - Generate 6-pillar strategy via web interface (or manual Claude API initially)
  - Edit/refine AI output (20% human touch)
  - Export branded PDF for client presentation
  - Track client satisfaction and outcomes

**Secondary Journey: Kofi (Brand Director) - Partial**
- ⚠️ **Journey Coverage:** 60% (view-only access added Month 6-12)
- **Supported:**
  - View ADVERT strategy dashboard (read-only)
  - See campaign coherence score
  - Export reports
- **NOT Supported in MVP:**
  - Monthly traction reports (automated) - manual delivery initially
  - Superfan count tracking (manual spreadsheet, not automated dashboard)
  - Financial Clarity Index calculator (future feature)

**Tertiary Journey: Yasmine (Creative Talent) - NOT MVP**
- ❌ **Journey Coverage:** 0% (Creative Concierge is Post-MVP)
- **Rationale:** Marketplace requires critical mass; consulting clients become first demand (Month 12+)

**Quaternary Journey: DevTeam (API Integration) - NOT MVP**
- ❌ **Journey Coverage:** 0% (API/SDK is Post-MVP)
- **Rationale:** Enterprise integration needs come after SaaS adoption validated

**Must-Have Capabilities (Non-Negotiable for MVP):**

**1. ADVERT Strategy Generation (6 Pillars)**
- **Status:** MUST HAVE - This IS the product
- **Technical Approach:**
  - Single Claude Sonnet 3.5 API call with structured prompt
  - Sequential generation: A→D→V→E→R→T (simulated within single call initially)
  - 40+ variables with context-adaptive generation
- **Quality Target:** 80%+ usable content (20% human refinement)
- **Speed Target:** <10 minutes complete generation
- **Fallback:** If AI quality insufficient, manual template + AI assist (hybrid)

**2. Web Interface (SaaS Platform - Basic)**
- **Status:** MUST HAVE - Distinguishes from pure consulting
- **Features:**
  - User authentication (email/password, no social login MVP)
  - Create new strategy (wizard mode OR AI co-pilot mode)
  - View strategy dashboard (6 pillars collapsible sections)
  - Edit strategy (text editing, not advanced formatting)
  - Save/load strategies (project storage)
- **NOT Included:**
  - Team collaboration (no comments, no activity feed)
  - Version history (no rollback in MVP)
  - Advanced templates (fashion, fintech pre-fills are Growth phase)

**3. Consulting Deliverable Export**
- **Status:** MUST HAVE - Core revenue generator
- **Formats:**
  - PDF export (branded, professional)
  - Excel export (for agencies who want data manipulation)
- **NOT Included:**
  - PowerPoint export (Growth phase)
  - Custom branded templates (manual for MVP, automated later)

**4. User Management (Single-User Accounts)**
- **Status:** MUST HAVE - Basic security and data isolation
- **Features:**
  - Sign up / login
  - Password reset (email-based)
  - Single-user accounts (no multi-user tenants)
  - Basic profile (name, email, company)
- **NOT Included:**
  - Team collaboration (Agency Owner + Consultant roles are Growth phase)
  - Brand Client view-only access (Growth phase)
  - SSO / SAML (Enterprise feature)

**5. Payment Processing (Subscription Billing)**
- **Status:** MUST HAVE - Revenue collection essential
- **Integration:**
  - Paystack integration (card + mobile money)
  - Flutterwave fallback (multi-currency)
- **Features:**
  - Subscribe to Starter (€99) or Professional (€299)
  - Annual pre-pay option (20% discount)
  - Basic dunning (3 retry attempts on failure)
- **NOT Included:**
  - Enterprise custom billing (manual invoicing for MVP)
  - Escrow for Concierge (not needed until marketplace launch)

**6. Interview Framework Templates**
- **Status:** MUST HAVE - Differentiation from generic AI tools
- **Content:**
  - Ikigai exploration questions
  - Schwartz Values assessment
  - Hero's Journey brand archetype mapping
  - AARRR funnel stage identification
- **Format:** PDF worksheets + in-app wizard (guides consultant through client interview)
- **Rationale:** Proves ADVERT is methodology, not just AI wrapper

**7. Basic Analytics Dashboard**
- **Status:** MUST HAVE - User value visibility
- **Metrics:**
  - Campaign Coherence Score (calculated from pillar completeness)
  - Pillar completion status (6/6 complete vs 4/6)
  - Strategy count (how many created)
- **NOT Included:**
  - Benchmarking (no sector averages without data)
  - Superfan tracking (manual initially, automated Growth phase)
  - Predictive insights (requires data accumulation)

**Nice-to-Have (Explicitly Deferred to Post-MVP):**

**Deferred to Phase 2 (Growth):**
- Multi-tenant architecture (agencies managing multiple brands)
- Team collaboration (Agency Owner + Consultant roles)
- Brand Client view-only access
- Advanced analytics (benchmarking, superfan tracking automation)
- PowerPoint export + branded templates
- Smart sector templates (fashion, fintech, FMCG pre-fills)
- Version history (90-day rollback)

**Deferred to Phase 3 (Vision):**
- Creative Concierge marketplace
- API/SDK for integrations
- CRM/PM connectors (Zoho, HubSpot, Monday)
- Multi-agent AI architecture (6 specialized agents)
- Enterprise features (white-label, SSO, custom subdomains)
- SOC 2 certification

**MVP Launch Criteria (Definition of "Done"):**

**Functional Readiness:**
- ✅ 10 beta users can sign up, create strategy, export PDF (end-to-end functional)
- ✅ AI generation works 8/10 times with 80%+ usable content
- ✅ Payment processing success rate >85%
- ✅ No critical bugs blocking core workflows

**Business Readiness:**
- ✅ 5 consulting clients delivered (methodology validated)
- ✅ 2 case studies documented (marketing collateral)
- ✅ Pricing finalized and tested (€99/€299 tiers)
- ✅ Legal foundation (privacy policy, terms of service, client contracts)

**Market Readiness:**
- ✅ Website live (landing page, demo video, pricing)
- ✅ Beta waitlist (50+ signups from network + outreach)
- ✅ Sales process defined (demo script, objection handling)

**Launch Decision: Month 6 Checkpoint**
- IF 15 consulting clients delivered with 80%+ satisfaction → Launch SaaS publicly
- IF <15 OR <70% satisfaction → Delay SaaS launch, fix methodology issues

### Post-MVP Features

**Phase 2: Growth Features (Months 13-24 / Year 2)**

**Strategic Objective: Scale SaaS, Launch Concierge, Enable Enterprise**

**Timing Rationale:**
- Consulting business proven (€600k Year 1 revenue)
- Methodology validated (30 case studies, 80%+ satisfaction)
- SaaS adoption confirmed (50 subscribers, <30% churn)
- Data accumulated (50+ ADVERT files for benchmarking)

**2.1 Multi-Tenant Architecture (Q1 Year 2)**

**Why Now:**
- Amina's agency (5 people) needs collaboration - single-user MVP insufficient
- AgencyHub (80 employees) identified as Enterprise prospect - multi-tenant required
- Competitive positioning: "Team collaboration" becomes sales differentiator

**Technical Migration:**
- Database refactor: Add `tenant_id` to all tables, implement Row-Level Security (RLS)
- Authentication upgrade: Multi-user management, role assignments
- UI additions: Team settings, user invitations, permissions management

**Business Impact:**
- **Upsell Opportunity:** Professional tier (€299) includes 3 users, +€49/mo per additional
- **Retention Improvement:** Team collaboration increases stickiness (network effects within tenant)
- **Enterprise Enablement:** Multi-tenancy prerequisite for large agency deals

**Development Timeline:** 3-4 months (complex, requires data migration + security testing)

**2.2 Team Collaboration & RBAC (Q1-Q2 Year 2)**

**Features:**
- **4 Roles:** Agency Owner, Consultant, Brand Client (view-only), Developer (API access)
- **Permissions Matrix:** Granular controls (create, edit, delete, view, manage billing)
- **Activity Feed:** "Consultant A edited Pillar D on 2026-03-15"
- **Comments:** Threaded discussions on specific pillars
- **Assignments:** "Consultant B is responsible for Brand X strategy"

**User Stories Enabled:**
- Amina (Agency Owner) invites 2 Consultants → They collaborate on client strategies
- Kofi (Brand Director) invited as Brand Client → View-only access to his brand's strategy
- DevTeam (Developer) gets API key → Integrates ADVERT with Zoho

**2.3 Creative Concierge Marketplace Launch (Q2-Q3 Year 2)**

**Why Now:**
- **Demand Pre-Seeded:** 30 consulting clients (Year 1) + 50-100 SaaS users = potential Concierge customers
- **Brief Templates Ready:** ADVERT Engagement pillar generates structured creative briefs (marketplace differentiator)
- **Revenue Diversification:** Consulting + SaaS proven; add third revenue stream

**MVP Marketplace Features:**
- **Talent Onboarding:** Manual vetting (first 50-200 talents), portfolio showcase
- **Brand-Talent Matching:** AI-assisted matching based on ADVERT pillar data
- **Escrow Payments:** Paystack/Flutterwave escrow, 75% talent / 25% platform split
- **Project Management:** Milestone tracking, deliverable uploads, mutual reviews
- **Dispute Resolution:** Platform mediation process

**Soft Launch Strategy:**
- **Month 1-3:** Invite 20 handpicked talents (Yasmine profile), onboard 5 pilot brands
- **Month 4-6:** Open applications, grow to 50 talents
- **Month 7-12:** Scale to 200 talents, target 50 brands using service

**Success Metrics:**
- 20 projects completed (Month 6)
- 80%+ satisfaction both sides
- €100k GMV (Gross Merchandise Value)
- 25% platform commission = €25k revenue

**2.4 Advanced Analytics & Benchmarking (Q3 Year 2)**

**Why Now:**
- Data accumulated: 100+ ADVERT files across sectors
- User demand: "How do I compare to others?" question emerges
- Competitive moat: First-mover advantage in African marketing benchmarking data

**Features:**
- **Sector Benchmarks:** "Your coherence score (81) vs fintech average (67)"
- **Pattern Recognition:** "Brands with ritual X see 2.8x superfan growth"
- **Predictive Insights:** "Brands with your profile succeed with Strategy A 78% of the time"
- **Historical Tracking:** Trend lines showing improvement over time

**Data Privacy:**
- Individual brand data NEVER exposed
- Only anonymized aggregates shared
- Opt-in for benchmark participation (incentive: free insights)

**2.5 CRM/PM Integrations (Q4 Year 2)**

**Why Now:**
- Enterprise clients (AgencyHub) require integrations for adoption
- Professional tier users request Zoho/HubSpot sync
- API foundation built (Developer role enabled)

**Phase 2A Integrations:**
- **Zoho CRM:** New contact → Auto-create ADVERT strategy draft
- **HubSpot:** Strategy completion → Sync campaign plan to HubSpot
- **Monday.com:** Pillar tasks → Auto-create Monday board

**Phase 2B: API/SDK Public Launch (Q4 Year 2)**
- REST API (`/api/v1/*` endpoints)
- OAuth 2.0 authentication
- npm SDK (`@advert/sdk`)
- Webhooks (strategy.generated, pillar.updated events)
- Developer documentation portal

**Revenue Impact:**
- Premium integrations: +€49-€99/mo (Enterprise tier add-on)
- API access: Enterprise tier only (gating mechanism)
- Developer adoption: Enable ecosystem (consultants build custom tools)

**2.6 SOC 2 Type I Preparation & Certification (Q3-Q4 Year 2)**

**Why Now:**
- Enterprise sales blocker: "We need SOC 2 for vendor approval"
- Competitive advantage: Smaller competitors can't afford €20k-€50k audit
- Investor signal: Operational maturity demonstrated

**Implementation:**
- Month 1-3: Gap assessment (identify missing controls)
- Month 4-6: Remediation (implement security controls, document policies)
- Month 7-9: Readiness audit (internal pre-audit)
- Month 10-12: Official SOC 2 Type I audit

**Cost:** €20k-€50k (audit + compliance automation tools like Drata/Vanta)

**Outcome:** "ADVERT is SOC 2 Type I certified" → Unlock €50k-€200k enterprise contracts

---

**Phase 3: Expansion Features (Months 25+ / Year 3+)**

**Strategic Objective: Enterprise Platform, Geographic Expansion, Market Intelligence**

**3.1 Multi-Agent AI Architecture (Q1-Q2 Year 3)**

**Why Deferred Until Now:**
- Single-LLM MVP sufficient for validation (85% quality achieved)
- Multi-agent complexity not justified without proven demand
- Year 3: 200 subscribers = revenue supports R&D investment

**Technical Upgrade:**
- 6 specialized agents: Authenticité, Distinction, Valeur, Engagement, Risk, Track
- Sequential coordination with context handoff
- Agent-specific fine-tuning (Risk agent trained on challenge/mitigation patterns)

**Quality Improvement:**
- 85% → 95% usable content (reduce human refinement from 20% → 5%)
- Deeper pillar interdependencies (Risk agent challenges ALL previous pillars contextually)

**Cost Analysis:**
- 6x API calls vs 1x = higher per-generation cost
- Offset by premium pricing: "ADVERT Pro with Multi-Agent AI" tier at €499/mo

**3.2 Enterprise OS Integration (Q2-Q3 Year 3)**

**Vision Fulfillment:**
- Dual-view: Strategic Nucleus (ADVERT) + Operational OS (invoicing, project tracking, talent management)
- Bi-directional data flow: Operations feed strategy insights, strategy informs operations

**Technical Approach:**
- Build operational modules OR partner with existing tools (Monday, Asana, Zoho)
- Likely: Partnership approach (focus on strategy, integrate with best-of-breed operations tools)

**3.3 ADVERT Alliance (Network Effects) (Q3-Q4 Year 3)**

**Concept:**
- Network of ADVERT-certified consultants across Africa
- Shared learnings, referral network, best practices exchange
- White-label options for large agencies (custom branding)

**Business Model:**
- Certification program: €2k-€5k per consultant (training + credential)
- Alliance membership: €500/year (access to network, co-marketing)
- White-label: €5k setup + 20% revenue share

**Impact:**
- **Geographic Expansion:** Certified consultants in Lagos, Nairobi, Dakar expand reach without hiring
- **Quality Control:** ADVERT brand maintained through certification standards
- **Revenue:** Certification + memberships = €200k-€500k annual recurring

**3.4 Market Intelligence Product (Year 3+)**

**Vision:**
- Sell aggregate insights (anonymized data from 500+ brands)
- Industry benchmarks as standalone product
- Competitive intelligence service

**Product:**
- **ADVERT Insights:** Annual report on African marketing trends (€5k-€10k per report)
- **Sector Deep-Dives:** "Fintech Marketing in Africa 2027" (€2k per report)
- **Custom Research:** Commissioned studies for agencies/brands (€20k-€50k)

**Data Moat:**
- First-mover advantage: Only platform with 500+ African brand strategies documented
- Network effects: More brands → Better insights → More brands subscribe

**3.5 Geographic Expansion (Year 3+)**

**Phase 3A: Anglophone Africa (Q1-Q2 Year 3)**
- Nigeria (Lagos), Kenya (Nairobi), South Africa (Johannesburg, Cape Town)
- Language: English (no localization needed)
- Payment: Local mobile money integrations (M-Pesa, etc.)

**Phase 3B: Francophone Africa (Q3-Q4 Year 3)**
- Senegal (Dakar), Cameroon (Douala), DRC (Kinshasa)
- Language: French localization (UI + templates)
- Payment: Orange Money, Wave

**Phase 3C: Lusophone Africa (Year 4)**
- Angola (Luanda), Mozambique (Maputo)
- Language: Portuguese localization
- Partnership approach: Local consultants certified as ADVERT Alliance members

**Expansion Strategy:**
- NOT direct hiring in each city (too expensive)
- ADVERT Alliance model: Certify local consultants, they deliver using ADVERT platform
- SaaS self-service: Platform accessible globally, no physical presence needed

**3.6 SOC 2 Type II + ISO 27001 (Year 3)**

**Why Now:**
- Global enterprise expansion requires international compliance (ISO 27001)
- SOC 2 Type II proves controls work over time (vs Type I point-in-time)
- Government/financial services clients require both certifications

**Investment:** €50k-€150k (audits + implementation + annual maintenance)

**ROI:** Unlock €100k-€500k annual contracts (government, banks, large multinationals)

### Risk Mitigation Strategy

**Technical Risks & Mitigations:**

**Risk 1: AI Generation Quality Insufficient**
- **Scenario:** Claude API produces <80% usable content, requires 50%+ manual editing
- **Impact:** Value proposition collapses (not faster than manual creation)
- **Likelihood:** Medium (AI quality unpredictable)
- **Mitigation:**
  - **Prompt Engineering Investment:** Dedicate Month 1-3 to iterative refinement with real client data
  - **Hybrid Workflow Design:** Position as "AI co-pilot" not "AI replacement" - 80/20 is the target, not 100% automation
  - **Quality Benchmarking:** Measure baseline manual consultant output → Compare ADVERT → Iterate until parity
  - **Fallback:** If single-LLM insufficient, multi-agent architecture in MVP (adds 3 months, €50k)
  - **Technology Hedge:** Monitor Claude/GPT-4 advancements - quality improving monthly

**Risk 2: Payment Processing Failures (African Infrastructure)**
- **Scenario:** 40%+ transaction failures disrupt cash flow, customer churn
- **Impact:** Revenue shortfall, customer frustration, competitive disadvantage
- **Likelihood:** High (African payment infrastructure is 60-70% success rate baseline)
- **Mitigation:**
  - **Multi-Modal Redundancy:** MTN fails → Orange Money → Paystack card (3-layer fallback)
  - **Dunning Management:** Automated 3 retry attempts over 10 days
  - **Annual Pre-Pay Incentives:** 20% discount reduces transaction frequency
  - **Local Bank Accounts:** Manual transfer option (Côte d'Ivoire, Ghana, Nigeria)
  - **Target:** 85-90% success rate with mitigations (industry-leading)

**Risk 3: Multi-Tenant Security Breach**
- **Scenario:** Tenant data leak, Row-Level Security (RLS) policy failure
- **Impact:** Reputation damage, legal liability, customer exodus
- **Likelihood:** Low (if properly implemented and tested)
- **Mitigation:**
  - **Extensive Testing:** Integration tests, penetration testing pre-launch
  - **Gradual Rollout:** 10 tenants → 50 → All (phased migration from single-tenant)
  - **Security Audits:** External security review before multi-tenant launch
  - **Cyber Insurance:** €1M coverage (cost: €5k-€15k/year)
  - **Incident Response Plan:** Documented playbook (detect → contain → notify → remediate)

**Risk 4: API Rate Limits (Claude API)**
- **Scenario:** Peak usage hits Claude API rate limits, generation queue backlogs
- **Impact:** User frustration, "Loading..." spinner for 30+ minutes
- **Likelihood:** Medium (as user base scales)
- **Mitigation:**
  - **Asynchronous Queue:** Strategies generate in background, user notified when ready (not real-time blocking)
  - **Tiered Rate Limits:** Professional tier prioritized over Starter tier
  - **Fallback Provider:** GPT-4 as backup when Claude hits limits
  - **Enterprise Negotiation:** Dedicated rate limits with Anthropic for high-volume usage
  - **Caching:** Cache repeated generation patterns (e.g., "Fashion brand in Abidjan" template)

**Market Risks & Mitigations:**

**Risk 5: Agencies Won't Pay for AI (Skepticism)**
- **Scenario:** "Why pay €20k when I can use ChatGPT for free?"
- **Impact:** Low consulting demand, revenue shortfall
- **Likelihood:** Medium (AI commoditization is real threat)
- **Mitigation:**
  - **Methodology Differentiation:** ADVERT is NOT ChatGPT - it's 6-pillar framework + psychology + structured output
  - **Proof Points:** SPAWT case study + testimonials demonstrate value beyond generic AI
  - **Consulting Delivery:** Human expertise (spark01) + AI = hybrid value (not pure automation)
  - **Pricing Strategy:** Beta pricing €15k (de-risk adoption), then €20k after 10 clients
  - **ROI Calculator:** "You spend €50k on 3-month consultant, ADVERT delivers in 4 weeks for €20k"

**Risk 6: Superfan Metric Doesn't Resonate**
- **Scenario:** Investors/customers don't understand or care about superfan count
- **Impact:** Fundraising difficulty, marketing message confusion
- **Likelihood:** Medium-High (contrarian metric is risky)
- **Mitigation:**
  - **Dual Metrics:** Track superfans AND traditional SaaS metrics (ARR, MRR, CAC, LTV)
  - **Causation Proof:** Build data showing superfan count → revenue growth correlation (12-month study)
  - **Customer Testimonials:** "We grew revenue 23% after ADVERT created 450 superfans"
  - **Education Campaign:** Publish thought leadership explaining why superfans > vanity metrics
  - **Pivot Option:** Rebrand as "Customer Outcome Score" if superfan language doesn't land

**Risk 7: Concierge Marketplace Fails (Chicken-Egg)**
- **Scenario:** Not enough talent OR not enough brands → empty marketplace
- **Impact:** Wasted development investment, feature abandoned
- **Likelihood:** Medium (marketplaces are hard to bootstrap)
- **Mitigation:**
  - **Demand Pre-Seeding:** Consulting clients (30 brands Year 1) become first Concierge customers
  - **Supply Curation:** Manually vet first 50-200 talents (quality > quantity)
  - **Guaranteed Utilization:** Promise first 50 talents "1 project in Month 1" (platform subsidizes if needed)
  - **Brand Incentives:** First 20 brands get 20% discount on projects
  - **Pivot Option:** If marketplace fails, pivot to "ADVERT-Certified Talent Directory" (referral, not marketplace)

**Resource Risks & Mitigations:**

**Risk 8: Can't Hire Engineers (Talent Shortage)**
- **Scenario:** African tech talent shortage, can't find 2 engineers
- **Impact:** Development delays, MVP launch pushed 6-12 months
- **Likelihood:** Medium (competitive hiring market)
- **Mitigation:**
  - **Remote-First:** Hire globally, not just Côte d'Ivoire (access broader talent pool)
  - **Equity Incentives:** Offer 0.5-1% equity to early engineers (upside beyond salary)
  - **Contract-to-Hire:** Start with contractors (Upwork, Toptal), convert to full-time
  - **Founder Coding:** spark01 builds MVP v0.1 (no-code tools like Bubble, then rewrite properly)
  - **Timeline Buffer:** Plan for 12-month MVP, aim for 8 months (33% buffer)

**Risk 9: Consulting Doesn't Generate Expected Revenue**
- **Scenario:** Only 10 clients signed (vs 30 target), €200k revenue (vs €600k)
- **Impact:** Can't fund SaaS development, burn personal savings
- **Likelihood:** Medium (sales is unpredictable)
- **Mitigation:**
  - **Pre-Launch Pipeline:** 50+ agency director interviews (demand validation before launch)
  - **Beta Pricing:** €15k for first 10 clients (reduce price sensitivity)
  - **Referral Incentives:** €2k referral fee for clients who introduce new clients
  - **Pivot Trigger:** Month 3 checkpoint - if <5 clients, pivot pricing or positioning
  - **Downside Plan:** If consulting fails, SaaS-only model (skip consulting, bootstrap with personal savings)

**Risk 10: Team Burnout (Founder + 2 Engineers)**
- **Scenario:** 3-person team building consulting + SaaS + marketing = unsustainable workload
- **Impact:** Quality degrades, bugs accumulate, team quits
- **Likelihood:** Medium-High (startups are intense)
- **Mitigation:**
  - **Scope Discipline:** Ruthlessly cut nice-to-haves, ship lean MVP
  - **Consulting Limit:** Cap at 3-5 clients/month (vs 10+), prioritize quality over volume
  - **Contract Support:** Hire contractors for non-core tasks (design, DevOps, marketing content)
  - **Founder Workload:** spark01 focuses on consulting delivery + fundraising, delegates engineering management
  - **Milestone Bonuses:** Pay team bonuses at MVP launch, Month 6, Month 12 (morale boost)

**Overall Risk Philosophy:**

ADVERT adopts **progressive de-risking** with clear checkpoints:

- **Month 3:** Demand validation (5+ clients signed)
- **Month 6:** Methodology validation (15 clients, 80%+ satisfaction)
- **Month 12:** SaaS validation (50 subscribers, <30% churn)
- **Month 18:** Concierge validation (20 projects completed)
- **Month 24:** Enterprise validation (5 Enterprise clients)

**At each checkpoint:**
- ✅ **Pass:** Proceed to next phase with confidence
- ⚠️ **Marginal:** Double-down (increase investment, refine approach)
- ❌ **Fail:** Pivot or shut down (no sunk cost fallacy)

**Example: Month 6 Checkpoint Failure**
- **Scenario:** Only 10 clients delivered (vs 15), 60% satisfaction (vs 80%)
- **Analysis:** Methodology isn't working OR positioning is wrong
- **Decision Tree:**
  - IF client feedback = "AI output too generic" → Invest in multi-agent architecture, improve prompts
  - IF client feedback = "Too expensive for value" → Lower price to €12k, increase volume
  - IF client feedback = "Don't need strategy, need execution" → Pivot to "Strategy + Concierge Bundle"
  - IF no clear signal → Shut down, return to corporate job, avoid burning more savings

**Pivot-Friendly Architecture:**
- SaaS platform is modular: ADVERT core can be repurposed for adjacent markets (PR agencies, investment firms needing market analysis)
- Consulting skills are transferable: If ADVERT fails, spark01 is now expert consultant (hired by agencies or brands)
- Network is valuable: 50+ agency director relationships = consulting opportunities regardless of ADVERT success


## Functional Requirements

**CAPABILITY CONTRACT:** This section defines every capability ADVERT must have. Any feature not listed here will NOT exist in the final product unless explicitly added. This is the binding contract for UX design, architecture, and implementation.

### User Management & Authentication

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

### Strategy Creation & AI Generation

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

### Strategy Management & Editing

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

### Team Collaboration & Permissions

- **FR32:** Agency Owners can add Consultants who can create and edit strategies (Growth Phase)
- **FR33:** Consultants can create and edit strategies they are assigned to (Growth Phase)
- **FR34:** Agency Owners can invite Brand Clients with view-only access to specific strategies (Growth Phase)
- **FR35:** Brand Clients can view assigned strategies but cannot edit them (Growth Phase)
- **FR36:** Agency Owners can assign specific strategies to specific team members (Growth Phase)
- **FR37:** Team members can view an activity feed showing who edited what and when (Growth Phase)
- **FR38:** Team members can add comments to specific pillars with threaded discussions (Growth Phase)
- **FR39:** Team members can mention other team members in comments using @mentions (Growth Phase)
- **FR40:** Users receive notifications for strategy updates, comments, and mentions relevant to them (Growth Phase)

### Export & Deliverables

- **FR41:** Users can export strategies as branded PDF documents
- **FR42:** Users can export strategies as Excel spreadsheets
- **FR43:** Users can export strategies as PowerPoint presentations (Growth Phase)
- **FR44:** Users can apply custom branded templates to exports (logo, colors, fonts) (Growth Phase)
- **FR45:** Users can customize export format by selecting specific pillars to include
- **FR46:** Users can download export files to their device
- **FR47:** Users can email exports directly to clients from the platform (Optional)

### Analytics & Insights

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

### Creative Concierge Marketplace

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

### Third-Party Integrations

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

### Payment & Billing

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

### Compliance & Security

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


## Non-Functional Requirements

**Quality Attributes:** This section defines HOW WELL ADVERT must perform. Each NFR is specific, measurable, and testable. Only categories relevant to ADVERT's business context are included.

### Performance

**NFR-P1: AI Strategy Generation Speed**
- Complete 6-pillar ADVERT strategy generation (all 40+ variables) in **less than 10 minutes** from initiation to completion
- Target: 8 minutes average, 10 minutes maximum (99th percentile)
- Measurement: Time from "Generate" button click to "Generation Complete" notification
- Rationale: Users (Amina) expect fast turnaround; 10 minutes enables same-session workflow

**NFR-P2: Dashboard Load Time**
- Web application dashboard loads and becomes interactive in **less than 3 seconds** on standard broadband connection (5 Mbps+)
- Target: 2 seconds average, 3 seconds maximum (95th percentile)
- Measurement: Time from URL request to First Contentful Paint + Time to Interactive
- Rationale: Consulting workflow requires frequent dashboard access; slow load = friction

**NFR-P3: Strategy View/Edit Responsiveness**
- Strategy view and edit actions (expand pillar, save edit, navigate sections) respond in **less than 500ms**
- Target: 300ms average, 500ms maximum (95th percentile)
- Measurement: Time from user action to UI update confirmation
- Rationale: Editing is frequent workflow; lag disrupts user flow state

**NFR-P4: Export Generation Time**
- PDF and Excel exports generate in **less than 30 seconds** for typical strategy (80 pages, 40 variables)
- PowerPoint exports generate in **less than 60 seconds** (Growth Phase)
- Measurement: Time from "Export" click to download ready
- Rationale: Users export frequently for client delivery; slow exports create bottlenecks

**NFR-P5: API Response Time (Post-MVP - Growth Phase)**
- REST API endpoints respond in **less than 2 seconds** for read operations (GET requests)
- Strategy generation API (`POST /api/v1/strategies/generate`) completes in **less than 10 minutes** (async)
- Measurement: HTTP request to response time (excluding AI generation for async operations)
- Rationale: Enterprise integrations (DevTeam journey) require predictable API performance

**NFR-P6: Concurrent User Support**
- System supports **100 concurrent active users** (MVP) without performance degradation >10%
- System supports **500 concurrent users** (Growth Phase) and **2000 concurrent users** (Vision Phase)
- Measurement: Load testing with simulated concurrent sessions, monitor response time degradation
- Rationale: SaaS scalability requirement; peak usage during business hours (9am-5pm WAT)

### Security

**NFR-S1: Data Encryption at Rest**
- All sensitive data encrypted using **AES-256 encryption** in database and file storage
- Sensitive data includes: user passwords, payment information, client strategies, API keys
- Implementation: AWS KMS or GCP Cloud KMS for key management with automatic key rotation every 90 days
- Verification: Security audit confirms encryption implementation, no plaintext sensitive data in database dumps

**NFR-S2: Data Encryption in Transit**
- All client-server communications use **TLS 1.3** (or TLS 1.2 minimum) for HTTPS
- No unencrypted HTTP endpoints exposed (all HTTP redirects to HTTPS)
- Certificate validity maintained (auto-renewal via Let's Encrypt or equivalent)
- Verification: SSL Labs scan achieves A+ rating, no TLS vulnerabilities detected

**NFR-S3: Authentication Security**
- User passwords hashed using **bcrypt** with minimum work factor 12
- Optional two-factor authentication (2FA) via email or SMS (Growth Phase)
- Session tokens: JWT with 24-hour expiry, refresh token rotation on use
- Failed login attempts: Account lockout after 5 failed attempts within 15 minutes (unlock via email)
- Verification: Penetration testing confirms no authentication bypass vulnerabilities

**NFR-S4: Multi-Tenant Data Isolation (Growth Phase)**
- **Row-Level Security (RLS)** policies enforce tenant data isolation in PostgreSQL
- No tenant can access another tenant's data via SQL injection, API manipulation, or UI exploits
- Annual penetration testing validates isolation (no cross-tenant data leaks)
- Verification: Security audit with simulated attack attempts, automated integration tests confirm RLS policies

**NFR-S5: Payment Security**
- **PCI-DSS compliance** via third-party processors (Paystack, Flutterwave) - platform does NOT store card numbers
- Platform stores only: customer_id references, last 4 digits (masked), payment status
- Payment webhooks validated via cryptographic signatures (prevent spoofing)
- Verification: Annual PCI-DSS self-assessment questionnaire (SAQ A), no stored card data in database

**NFR-S6: API Security (Post-MVP - Growth Phase)**
- API authentication via **OAuth 2.0** with scoped permissions (read, write, admin)
- API rate limiting: Professional tier 1000 requests/hour, Enterprise tier custom limits
- API keys: 256-bit random generation, hashed storage, rotation capability
- Webhook signatures: HMAC-SHA256 signing prevents webhook spoofing
- Verification: API security testing, rate limit testing, webhook signature validation tests

**NFR-S7: Audit Logging (Growth Phase)**
- Security-relevant events logged: Login attempts, permission changes, data access, API calls, billing changes
- Audit logs retained for **90 days** (Professional tier), 1 year (Enterprise tier)
- Logs include: Timestamp, User ID, IP address, Action performed, Resource affected
- Log access: Agency Owners only (RBAC enforced)
- Verification: Audit log completeness testing, log tampering protection validation

**NFR-S8: Incident Response**
- Security breach notification: Users notified within **72 hours** of confirmed breach (GDPR-equivalent)
- Incident response plan documented and tested annually
- Security contact: security@advert.com monitored 24/7 (Growth Phase)
- Vulnerability disclosure program established (Year 2+)

**NFR-S9: Compliance Certifications**
- **MVP (Year 1):** GDPR-equivalent privacy practices, encryption, basic security controls
- **Growth (Year 2):** SOC 2 Type I certification achieved by Month 24
- **Vision (Year 3+):** SOC 2 Type II certification, ISO 27001 certification (for global enterprise expansion)
- Verification: Third-party audit reports, compliance documentation publicly available

### Scalability

**NFR-SC1: User Growth Support**
- System architecture supports **10x user growth** with less than 10% performance degradation
- MVP target: 50 users → Must support 500 users without re-architecture
- Growth target: 500 users → Must support 5,000 users (Year 3) with horizontal scaling
- Measurement: Load testing at 10x current user base, monitor response time degradation
- Rationale: Avoid costly re-architecture during rapid growth phases

**NFR-SC2: Multi-Tenant Scalability (Growth Phase)**
- Database supports **10,000+ tenants** (agencies) with Row-Level Security (RLS) performance overhead <15%
- Query performance: Tenant-scoped queries complete in <500ms regardless of total tenant count
- Tenant provisioning: New tenant creation completes in <5 seconds (automated)
- Measurement: Database performance testing with 10k+ tenant dataset, query execution plan analysis
- Rationale: SaaS B2B model requires efficient multi-tenancy for cost-effective scaling

**NFR-SC3: AI Generation Scalability**
- System handles **100 concurrent AI strategy generations** without queue delays >5 minutes
- Asynchronous queue: Strategies processed in FIFO order with tier-based prioritization (Enterprise > Professional > Starter)
- Rate limit handling: Graceful degradation when Claude API rate limits hit (fallback to GPT-4 or queue delay notification)
- Measurement: Load testing with 100 concurrent generation requests, monitor queue depth and completion times
- Rationale: Peak usage scenarios (multiple agencies generating strategies simultaneously during business hours)

**NFR-SC4: Database Scalability**
- PostgreSQL database handles **1M+ strategy records** without query performance degradation >20%
- Indexing strategy: Tenant_id, created_at, status fields indexed for fast queries
- Archive strategy: Strategies older than 2 years archived to cold storage (optional retrieval)
- Measurement: Database performance benchmarking with 1M+ record dataset
- Rationale: Long-term data accumulation for benchmarking and pattern recognition

**NFR-SC5: Storage Scalability**
- File storage (S3/Cloud Storage) supports **10TB+ data** (exports, assets, backups) with cost-efficient tiering
- Hot storage: Recent exports (30 days), Warm storage: Backups (30-90 days), Cold storage: Archives (90+ days)
- Storage costs: <€100/month per 1TB (leveraging cloud provider pricing tiers)
- Rationale: Long-term export and backup retention requirements scale with user base

**NFR-SC6: Geographic Scalability (Vision Phase)**
- System supports **multi-region deployment** for African markets (West, East, Southern Africa)
- Latency targets: <200ms response time for users within each region
- Data residency: Option for enterprise clients to specify data storage region (compliance requirement)
- Measurement: Response time testing from Lagos, Nairobi, Johannesburg, Dakar
- Rationale: Pan-African expansion (Year 3+) requires regional presence for performance and compliance

### Reliability & Availability

**NFR-R1: System Uptime**
- **MVP (Year 1):** 99%+ uptime (allows ~3.65 days downtime/year or 7.3 hours/month)
- **Growth (Year 2+):** 99.5%+ uptime (allows ~1.83 days downtime/year or 3.6 hours/month)
- Target NOT 99.9% (too expensive for early-stage SaaS; enterprise SLAs negotiate custom)
- Measurement: Uptime monitoring (Datadog, New Relic), monthly availability reports
- Rationale: Consulting business requires reliable platform; tolerate scheduled maintenance windows

**NFR-R2: Backup & Recovery**
- **Automated daily backups** of database and file storage with 30-day retention
- Backup testing: Monthly restoration test ensures recoverability (no corrupt backups)
- Recovery Time Objective (RTO): **4 hours** (time to restore service after outage)
- Recovery Point Objective (RPO): **1 hour** (maximum data loss acceptable)
- Measurement: Disaster recovery drills quarterly, RTO/RPO tracking during incidents
- Rationale: Client strategies are business-critical IP; data loss = reputation damage + legal liability

**NFR-R3: Payment Processing Reliability**
- Payment transaction success rate: **85-90%** (realistic target for African payment infrastructure)
- Multi-modal fallback: If Paystack fails → try Flutterwave → try direct mobile money API
- Dunning management: 3 automated retry attempts over 10 days for failed payments
- Manual fallback: Bank transfer option for enterprise clients (NET 30 terms)
- Measurement: Payment success rate tracking, failed payment analysis by provider/method
- Rationale: 60-70% baseline success rate in Africa; 85-90% achievable with multi-modal redundancy

**NFR-R4: Graceful Degradation**
- If AI provider (Claude API) unavailable: Queue requests, notify user of delay (don't fail silently)
- If export generation fails: Retry automatically 3 times, then notify user with error details
- If payment processor down: Display status message, offer alternative payment methods
- If third-party integration fails: Log error, notify user, continue core functionality (don't block)
- Rationale: External dependencies will fail; graceful degradation maintains user trust

**NFR-R5: Error Handling & User Communication**
- All system errors display **user-friendly error messages** (not technical stack traces)
- Critical errors: Logged + monitored + alert engineering team (Slack/PagerDuty)
- User-facing errors include: What happened, Why it happened (if known), What to do next
- Example: "Strategy generation failed because AI service is temporarily unavailable. Your request is queued and will complete within 30 minutes. We'll email you when ready."
- Measurement: Error message clarity testing (user feedback), error monitoring coverage

**NFR-R6: Monitoring & Alerting**
- **Application Performance Monitoring (APM):** Datadog or New Relic tracks response times, error rates, user sessions
- Alerts configured for: Uptime <99%, Error rate >5%, Response time >5 seconds, Payment failures >20%
- On-call rotation: Engineering responds to critical alerts within 1 hour (Growth Phase)
- Measurement: Mean Time to Detect (MTTD) <10 minutes, Mean Time to Resolve (MTTR) <4 hours

### Integration Reliability

**NFR-I1: Third-Party API Uptime (Growth Phase)**
- ADVERT system maintains **99%+ availability** even if third-party integrations (Zoho, HubSpot, Monday) are down
- Integration failures: Logged, retried 3 times with exponential backoff, user notified if unresolved
- Core functionality unaffected: Users can create strategies, export, use analytics even if CRM integration fails
- Measurement: Integration error rate tracking, system availability independent of third-party status

**NFR-I2: ADVERT API Uptime (Post-MVP - Enterprise)**
- REST API maintains **99.5%+ uptime** for Enterprise tier customers
- API SLA: Response time <2 seconds (95th percentile), error rate <1%
- Webhook delivery: **99%+ success rate** with automatic retries (3 attempts with exponential backoff)
- Measurement: API uptime monitoring, SLA compliance reporting for Enterprise customers
- Rationale: Enterprise integrations (DevTeam journey) are business-critical for large agencies

**NFR-I3: API Rate Limiting**
- **Professional tier:** 1000 requests/hour (allows ~17 requests/minute)
- **Enterprise tier:** Custom negotiated limits (10,000+ requests/hour for high-volume integrations)
- Rate limit exceeded: Return HTTP 429 with Retry-After header (don't silently fail)
- Rate limit visibility: Dashboard shows current usage vs limit
- Measurement: Rate limit enforcement testing, customer usage analytics

**NFR-I4: Data Sync Consistency**
- CRM/PM integrations: Data synced within **5 minutes** of changes (near real-time, not instant)
- Conflict resolution: Last-write-wins with user notification if conflicts detected
- Sync status visibility: Users see "Last synced 3 minutes ago" with refresh capability
- Measurement: Sync latency monitoring, conflict detection testing

**NFR-I5: API Versioning & Backward Compatibility**
- API versioning: `/api/v1/`, `/api/v2/` (explicit version in URL)
- Backward compatibility: v1 maintained for minimum 12 months after v2 release (no breaking changes)
- Deprecation notice: 6 months advance notice for deprecated endpoints
- Measurement: API version usage analytics, customer migration tracking
- Rationale: Enterprise customers (AgencyHub) cannot tolerate sudden API breaking changes

### Accessibility

**NFR-A1: Keyboard Navigation**
- All core functionality accessible via **keyboard only** (no mouse required)
- Tab order logical and intuitive (follows visual layout)
- Keyboard shortcuts documented: Ctrl+S (save), Ctrl+E (export), Esc (close modals)
- Focus indicators visible (clear highlight on focused elements)
- Measurement: Manual keyboard navigation testing, user feedback from keyboard-only users

**NFR-A2: Screen Reader Compatibility**
- Basic **WCAG 2.1 Level A** compliance for screen reader users
- Semantic HTML: Proper heading hierarchy (H1→H2→H3), ARIA labels on interactive elements
- Alt text on images and icons
- Form labels properly associated with inputs
- Measurement: Screen reader testing (NVDA, JAWS), automated accessibility scanning (Axe, Lighthouse)
- Rationale: Some agency team members may have visual impairments; basic accessibility is good practice

**NFR-A3: Color Contrast**
- Text and interactive elements meet **WCAG 2.1 Level AA** contrast ratios:
  - Normal text (body copy): 4.5:1 contrast minimum
  - Large text (headings, buttons): 3:1 contrast minimum
- No information conveyed by color alone (use icons + text)
- Measurement: Automated contrast checking (Axe, Contrast Checker), manual visual inspection

**NFR-A4: Responsive Design**
- Web application functional on **desktop (1920×1080), laptop (1366×768), tablet (768×1024)**
- Mobile responsive (optional nice-to-have, not critical for MVP)
- No horizontal scrolling required at standard resolutions
- Measurement: Manual responsive testing across device sizes, cross-browser testing (Chrome, Firefox, Safari, Edge)
- Rationale: B2B agencies work on desktops/laptops; mobile is secondary

**NFR-A5: Language Localization (Post-MVP - Growth Phase)**
- French localization: Full UI translation for Francophone African markets (Senegal, Côte d'Ivoire, Cameroon)
- English default: Initial MVP English-only (Anglophone markets: Nigeria, Ghana, Kenya, South Africa)
- Portuguese localization: Future (Year 3+) for Lusophone markets (Angola, Mozambique)
- Measurement: Translation completeness (100% UI strings translated), localization testing with native speakers

**Accessibility Note:** ADVERT is B2B SaaS serving marketing agencies (not general public), so full WCAG 2.1 Level AAA compliance is not required. Basic keyboard navigation and screen reader support (Level A/AA) are sufficient for MVP. Enterprise clients may request enhanced accessibility (negotiated separately).

