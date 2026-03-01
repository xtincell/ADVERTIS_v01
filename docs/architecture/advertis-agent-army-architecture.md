# Architecture de l'Armée d'Agents ADVERTIS

**Date:** 2026-02-15
**Auteur:** BMad Master + spark01
**Version:** 2.0 (ADVERTIS with Piliers I & S)

---

## Vue d'Ensemble

Ce document définit l'architecture complète du système multi-agent ADVERTIS pour la création systématisée de cultes de marque.

ADVERTIS étend le framework original ADVERT avec 2 piliers supplémentaires:
- **Pilier I (Implementation):** Génération de feuilles de route exécutables avec budget et timelines
- **Pilier S (Strategic Interface):** Orchestration de l'Interface S (Strategic Cockpit) et génération du Document S

---

## Hiérarchie de Commandement

```
                    ┌─────────────────────┐
                    │   CONDUCTOR         │
                    │   Agent Maître      │
                    │   (Orchestrateur)   │
                    └──────────┬──────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
┌───────────────┐    ┌─────────────────┐    ┌───────────────┐
│  VALIDATOR    │    │   SYNTHESIS     │    │ SLOP          │
│ (Contrôle     │    │  (Agrégation)   │    │ DETECTOR      │
│  Qualité)     │    │                 │    │ (Anti-BS)     │
└───────────────┘    └─────────────────┘    └───────────────┘
        │                      │                      │
        └──────────────────────┼──────────────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
   ┌─────────────────────────────────────────────────────┐
   │            LES 8 AGENTS PILIERS                     │
   │         (Exécution Séquentielle)                    │
   │                                                     │
   │   [A] → [D] → [V] → [E] → [R] → [T] → [I] → [S]    │
   └─────────────────────────────────────────────────────┘
```

---

## Les 6 Agents Piliers

### [A] Agent AUTHENTICITÉ

**Mission:** Extraire l'ADN fondamental de la marque

| Module | Input | Output |
|--------|-------|--------|
| Identity Extractor | Nom, archétype, citation fondateur | Fiche identité |
| Hero's Journey Mapper | Interview/docs | 5 étapes narratives |
| Ikigai Processor | 4 cercles guidés | Vision/Mission/Skills |
| Schwartz Values Wheel | Choix forcé 10 valeurs | Hiérarchie valeurs |
| Community Hierarchy | Segmentation | 6 niveaux (Pioneer→Members) |
| Timeline Narrator | Histoire | 4 actes narratifs |

**Dépendances:** Aucune (PREMIER pilier)
**Output vers:** Agent [D]

---

### [D] Agent DISTINCTION

**Mission:** Créer la différenciation compétitive

| Module | Input | Output |
|--------|-------|--------|
| Persona Builder | Data client | Personas + buying journey |
| Competitive Mapper | Marché | 4+ concurrents classifiés |
| Promise Crafter | Valeur [A] | Master + Sub-promises |
| Positioning Engine | [A] + Marché | Statement + 5 axes + VS |
| Tone of Voice Designer | Valeurs [A] | Traits + Never/Always Says |
| Visual Identity Director | Essence [A] | Couleurs, mood, symboles |
| Language Asset Generator | ToV | Mantras, vocabulaire propriétaire |

**Dépendances:** Agent [A] complété
**Output vers:** Agent [V]

---

### [V] Agent VALEUR

**Mission:** Définir l'économie de la valeur

| Module | Input | Output |
|--------|-------|--------|
| Product Ladder Builder | Offre | Freemium→Premium tiers |
| CODB Calculator | Coûts ops | Coût opérationnel précis |
| Value-for-Brand Analyzer | [A][D] | Tangible + Intangible value |
| Value-for-Customer Analyzer | Personas [D] | Tangible + Intangible value |
| Cost-for-Brand Calculator | Ops | CAPEX/OPEX + opportunity |
| Cost-for-Customer Calculator | Pricing | Prix + time/effort |
| Unit Economics Engine | Tous | Margins, LTV, CAC |

**Dépendances:** Agents [A][D] complétés
**Output vers:** Agent [E]

---

### [E] Agent ENGAGEMENT

**Mission:** Systématiser les interactions tribales

| Module | Input | Output |
|--------|-------|--------|
| Touchpoint Mapper | Journey | Physique/Digital/Humain |
| Ritual Designer (Always-On) | Valeurs [A] | 3-5 habitudes récurrentes |
| Ritual Designer (Cyclique) | Calendrier | Events annuels |
| Community Principles Writer | [A][D] | 5-10 règles de conduite |
| Anti-Behavior Definer | Valeurs | 3-5 tabous |
| Common Enemy Identifier | Marché | 3-6 ennemis externes |
| Gamification Architect | Hiérarchie [A] | 3-5 niveaux + rites passage |
| AARRR Metrics Builder | Funnel | B2C + B2B metrics |
| KPI Dashboard Generator | Tous | Dashboard complet |

**Dépendances:** Agents [A][D][V] complétés
**Output vers:** Agent [R]

---

### [R] Agent RISK

**Mission:** Challenger et stress-tester TOUT

| Module | Input | Output |
|--------|-------|--------|
| Variable SWOT Generator | Chaque variable | 40+ SWOTs individuels |
| SWOT Aggregator | Tous SWOTs | SWOT global |
| Risk Score Calculator | SWOTs | Score 0-100 |
| Mitigation Recommender | Risks | Actions prioritaires |
| Assumption Challenger | [A][D][V][E] | Questions critiques |
| Blind Spot Detector | Tout | Angles morts identifiés |

**Dépendances:** Agents [A][D][V][E] complétés
**Output vers:** Agent [T]

---

### [T] Agent TRACK

**Mission:** Valider contre la réalité marché

| Module | Input | Output |
|--------|-------|--------|
| Data Source Aggregator | 3 sources | Data existante + online + interviews |
| Cross-Validator | Sources multiples | Résolution conflits |
| Credibility Scorer | Sources | Score fraîcheur/précision/source |
| Market Reality Reporter | Data | État du marché |
| TAM/SAM/SOM Calculator | Marché | Sizing marché |
| Competitive Landscape Mapper | Concurrents | Carte compétitive |
| Trend Identifier | Data | Tendances émergentes |
| Gap Finder | [A-E] vs Marché | Opportunités |
| Red Flag Alerter | Tout | Warnings critiques |

**Dépendances:** Agents [A][D][V][E][R] complétés
**Output vers:** Agent [I]

---

### [I] Agent IMPLEMENTATION (Planificateur)

**Mission:** Générer feuille de route exécutable avec budget et timeline

| Module | Input | Output |
|--------|-------|--------|
| Roadmap Generator | [A-T] insights | 36-month phased roadmap |
| Dependency Analyzer | Initiatives | Mapping dépendances + critical path |
| Timeline Optimizer | Dépendances + constraints | Chronologie optimale |
| Budget Planner | Scope + constraints | Allocation budget par phase |
| ROI Calculator | Budget + projections | ROI projections 3-6-12 mois |
| Gantt Diagram Builder | Timeline + budget | Visualisations interactives |
| Quick Wins Identifier | Roadmap | Wins rapides (0-3 mois) |
| Launch Plan Generator | Phases | Go-to-market strategy |
| Resource Mapper | Roadmap | Besoins compétences + équipes |

**Responsabilités:**
- Transformer insights stratégiques en plan d'exécution détaillé
- Identifier dépendances entre initiatives
- Optimiser timeline pour maximiser quick wins
- Calculer ROI et business case
- Générer diagrammes Gantt interactifs

**Capabilités:**
- Dependency analysis (identifier goulots d'étranglement)
- Timeline optimization (chemin critique)
- ROI calculation (projection revenue/cost)
- Gantt diagrams (visuelle interactive)
- Quick wins identification (premières victoires)
- Phased breakdown (0-3, 3-6, 6-12, 12+ mois)

**Inputs:**
- Strategic objectives from [A-T]
- Budget constraints (total allocation)
- Time constraints (launch date)
- Resource availability
- Market opportunities

**Outputs:**
- Document I: Implementation Roadmap (strategic execution plan)
  * Executive summary
  * 36-month phased roadmap
  * Detailed phased breakdown (phases 0, 1, 2, 3)
  * Budget allocation and investment strategy
  * ROI projections and business case
  * Team structure requirements
  * Key milestones (7+)
  * Change management strategy
  * Risk mitigation timeline

**Dépendances:** Agents [A][D][V][E][R][T] complétés
**Output vers:** Agent [S]

---

### [S] Agent INTERFACE (Orchestrateur Cockpit Stratégique)

**Mission:** Orchestrer Strategic Cockpit et générer Document S + Interface S

| Module | Input | Output |
|--------|-------|--------|
| Data Aggregator | Outputs [A-I] | Consolidated data hub |
| Dashboard Builder | Aggregated data | Real-time KPI visualizations |
| Navigation Engine | Piliers [A-I] | Contextual navigation system |
| Interactive Roadmap | Agent [I] outputs | Gantt + dependency visualizations |
| Export Engine | All data | PDF/PPT/Markdown/JSON exports |
| Presentation Mode | Interface data | Stakeholder presentation flow |
| Role-Based Personalizer | User context | Personalized views per role |
| Multi-Format Exporter | Cockpit state | Document S generation (PDF) |
| Contextual Analyzer | Navigation | Smart recommendations |

**Responsabilités:**
- Orchestrer Strategic Cockpit (Interface S) - application web unifiée
- Générer Document S (PDF) - strategic bible
- Agréger et afficher données temps réel de tous les piliers
- Offrir navigation contextuelle entre piliers
- Supporter présentation stakeholders
- Enabler export multi-formats

**Capabilités:**
- Data aggregation from all piliers (A-I)
- Real-time dashboard visualizations
- Interactive roadmap with Gantt charts
- Multi-format export (PDF Document S, web, PowerPoint, Markdown)
- Presentation mode with speaker notes
- Contextual navigation and smart recommendations
- Role-based personalization (Agency Owner, Brand Director, Creative, DevTeam)
- Live KPI tracking and performance scoring
- Collaborative annotation and commenting

**Inputs:**
- Outputs from all agents [A-I]
- User session context (role, preferences)
- Navigation history
- Export preferences
- Presentation settings

**Outputs:**
- Interface S: Strategic Cockpit (web app)
  * Navigation across all 8 piliers
  * Real-time KPI dashboard
  * Interactive roadmap visualization
  * Presentation mode
  * Multi-format export capabilities
  * Contextual navigation system
  * Role-based personalized views

- Document S: Strategic Bible (PDF export)
  * Executive summary
  * Strategic context overview
  * Customer insights synthesis
  * Brand strategy (ADVERTIS synthesis of A-I)
  * Implementation roadmap (from Agent I)
  * Performance framework and metrics
  * Multi-format output (PDF, web, PPT)

**Dépendances:** Agents [A][D][V][E][R][T][I] complétés
**Output:** Fiche ADVERTIS Complète + Interface S + Document S

---

## Agents Transversaux (Support)

### CONDUCTOR (Orchestrateur Maître)

```yaml
Rôle: Chef d'orchestre de l'armée
Responsabilités:
  - Séquencer l'exécution A→D→V→E→R→T
  - Router les outputs entre agents
  - Gérer les dépendances
  - Déclencher agents transversaux
  - Arbitrer conflits
  - Rapporter progress à l'humain
```

### VALIDATOR (Contrôle Qualité)

```yaml
Rôle: Gardien de la cohérence
Responsabilités:
  - Vérifier complétude chaque output
  - Valider cohérence inter-piliers
  - Checker alignement avec [A] fondamental
  - Bloquer si incohérence détectée
Trigger: Après chaque agent pilier
```

### SYNTHESIS (Agrégateur)

```yaml
Rôle: Tisseur de connections
Responsabilités:
  - Croiser insights entre piliers
  - Identifier patterns émergents
  - Générer recommandations transverses
  - Produire executive summary
Trigger: Après [R], avant [T]
```

### SLOP DETECTOR (Anti-Bullshit)

```yaml
Rôle: Éliminateur de fluff
Responsabilités:
  - Détecter jargon vide ("excellence", "innovation")
  - Flaguer généralités non-actionnables
  - Exiger spécificité et mesurabilité
  - Rejeter outputs "corporate BS"
Trigger: Sur chaque output avant validation
```

---

## Le Schéma Universel (Protocol Agent)

Chaque agent ADVERTIS respecte ce schéma:

```
┌─────────────────────────────────────────────────────────┐
│                   PROTOCOL AGENT ADVERTIS              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. RECEIVE                                             │
│     ├── Input du Conductor                              │
│     ├── Outputs agents précédents (dépendances)         │
│     └── Context global (shared knowledge base)          │
│                                                         │
│  2. ANALYZE                                             │
│     ├── Parser les inputs                               │
│     ├── Identifier gaps/manques                         │
│     └── Déterminer modules à activer                    │
│                                                         │
│  3. GENERATE                                            │
│     ├── Exécuter modules séquentiellement               │
│     ├── Produire méta-variables contextuelles           │
│     └── Documenter raisonnement                         │
│                                                         │
│  4. VALIDATE                                            │
│     ├── Self-check cohérence interne                    │
│     ├── Cross-check avec piliers précédents             │
│     └── Slop detection (anti-BS)                        │
│                                                         │
│  5. OUTPUT                                              │
│     ├── Structured data (JSON/YAML)                     │
│     ├── Human-readable summary                          │
│     └── Confidence score + flags                        │
│                                                         │
│  6. HANDOFF                                             │
│     ├── Push to shared knowledge base                   │
│     ├── Signal completion au Conductor                  │
│     └── Trigger agent suivant                           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Flow d'Exécution Complet

```
[INPUT HUMAIN]
      │
      ▼
┌─────────────┐
│ CONDUCTOR   │──────────────────────────────────────────┐
└─────┬───────┘                                          │
      │                                                  │
      ▼                                                  │
┌─────────────┐    ┌──────────┐    ┌──────────┐         │
│ [A] AUTHEN. │───▶│ SLOP DET │───▶│ VALIDATOR│─────────┤
└─────────────┘    └──────────┘    └──────────┘         │
      │                                                  │
      ▼                                                  │
┌─────────────┐    ┌──────────┐    ┌──────────┐         │
│ [D] DISTINC.│───▶│ SLOP DET │───▶│ VALIDATOR│─────────┤
└─────────────┘    └──────────┘    └──────────┘         │
      │                                                  │
      ▼                                                  │
┌─────────────┐    ┌──────────┐    ┌──────────┐         │
│ [V] VALEUR  │───▶│ SLOP DET │───▶│ VALIDATOR│─────────┤
└─────────────┘    └──────────┘    └──────────┘         │
      │                                                  │
      ▼                                                  │
┌─────────────┐    ┌──────────┐    ┌──────────┐         │
│ [E] ENGAGE. │───▶│ SLOP DET │───▶│ VALIDATOR│─────────┤
└─────────────┘    └──────────┘    └──────────┘         │
      │                                                  │
      ▼                                                  │
┌─────────────┐    ┌──────────┐    ┌──────────┐         │
│ [R] RISK    │───▶│ SLOP DET │───▶│ VALIDATOR│─────────┤
└─────────────┘    └──────────┘    └──────────┘         │
      │                                                  │
      ▼                                                  │
┌─────────────┐    ┌──────────┐    ┌──────────┐         │
│ [T] TRACK   │───▶│ SLOP DET │───▶│ VALIDATOR│─────────┤
└─────────────┘    └──────────┘    └──────────┘         │
      │                                                  │
      ▼                                                  │
┌─────────────┐    ┌──────────┐    ┌──────────┐         │
│ [I] IMPLEM. │───▶│ SLOP DET │───▶│ VALIDATOR│─────────┤
└─────────────┘    └──────────┘    └──────────┘         │
      │                                                  │
      ▼                                                  │
┌─────────────┐                                          │
│ SYNTHESIS   │◀─────────────────────────────────────────┘
└─────┬───────┘
      │
      ▼
┌─────────────┐    ┌──────────┐    ┌──────────┐
│ [S] INTERF. │───▶│ SLOP DET │───▶│ VALIDATOR│
└─────────────┘    └──────────┘    └──────────┘
      │
      ▼
┌──────────────────────────────────────────────────────┐
│         FICHE ADVERTIS COMPLETE                      │
│    + INTERFACE S (Strategic Cockpit)                 │
│    + DOCUMENT S (Strategic Bible PDF)                │
│    + STRATEGIE 3-6-12 MOIS                           │
└──────────────────────────────────────────────────────┘
```

---

## Récapitulatif Armée

| Type | Nombre | Agents |
|------|--------|--------|
| **Piliers** | 8 | A, D, V, E, R, T, I, S |
| **Transversaux** | 4 | Conductor, Validator, Synthesis, Slop Detector |
| **Total** | **12 agents** | |
| **Modules** | ~50+ | Répartis dans les 8 piliers |

---

## Prochaines Étapes

1. Détailler les prompts de chaque agent pilier (A-I) et agents transversaux
2. Créer les fichiers agents BMAD-compatible avec support complet pour Piliers I & S
3. Définir le shared knowledge base schema pour ADVERTIS complète
4. Implémenter le Conductor orchestrator avec orchestration I → S
5. Développer Agent I (Implementation Planner) et ses modules de timeline/budget
6. Développer Agent S (Interface Orchestrator) et l'Interface S (Strategic Cockpit)
7. Implémenter multi-format export engine dans Agent S

---

*Document généré par BMad Master pour le projet ADVERTIS v2.0 (avec Piliers I & S)*
