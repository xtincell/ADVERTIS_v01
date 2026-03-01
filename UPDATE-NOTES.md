# 🔧 UPDATE NOTES - TIER 2 Files

**Modifications détaillées requises pour les fichiers TIER 2**

---

## 📖 Guide Méthodologie

### 1. `docs/guide/ADVERTIS-Guide-Complet.md` ⭐ PRIORITÉ CRITIQUE

**Modifications majeures:**

#### A. Ajouter Chapitre "Pilier I: Innovation & Implementation"

Insérer après le Pilier T, avant les annexes:

```markdown
## Chapitre 8: Pilier I - Innovation & Implementation

### 8.1 Introduction
Le Pilier I transforme la stratégie en action concrète...

### 8.2 Composantes du Pilier I
- **I.1 Roadmap stratégique** (12-24 mois)
- **I.2 Budget & ressources**
- **I.3 Structure d'équipe**
- **I.4 Plan de lancement**
- **I.5 Quick wins** (90 premiers jours)

### 8.3 Livrables
Document I (50-80 pages):
- Roadmap visuel interactif
- Budget détaillé par phase
- Organigramme et rôles
- Timeline de déploiement
- Matrice de risques implémentation

### 8.4 Méthodologie
[Développer méthodologie de planification implémentation]

### 8.5 Outils & Templates
Référence: Annexe B - Template Pilier I
```

#### B. Mettre à Jour Chapitre "Pilier S: Stratégie"

**Clarifier nature duale:**

```markdown
## Chapitre 7: Pilier S - Stratégie (Document + Interface)

### 7.1 Introduction
Le Pilier S est DUAL par nature:
1. **Document S** - Strategy Bible (50-120 pages PDF)
2. **Interface S** - Strategic Cockpit (plateforme interactive)

### 7.2 Document S - Strategy Bible
[Contenu existant...]

### 7.3 Interface S - Strategic Cockpit
La plateforme interactive permet:
- **Visualisation temps réel** de tous les piliers
- **Navigation contextuelle** entre documents
- **Mode présentation** pour stakeholders
- **Export multi-format** (PDF, PowerPoint)
- **Tableaux de bord** stratégiques

Référence: docs/specifications/01-DOCUMENT-S-TEMPLATE.md
Guide technique: interface/INTEGRATION-GUIDE.md
```

#### C. Mettre à Jour Table des Matières

Remplacer:
```markdown
## Table des Matières
1. Introduction à ADVERT
2. Les 6 Piliers Fondamentaux
```

Par:
```markdown
## Table des Matières
1. Introduction à ADVERTIS
2. Les 8 Piliers Fondamentaux
   - S: Stratégie (Document + Interface)
   - A: Authenticité
   - D: Distinction
   - V: Valeur
   - E: Engagement
   - R: Risk Management
   - T: Tracking & Analytics
   - I: Innovation & Implementation
```

#### D. Chercher/Remplacer Globalement

```bash
# Dans ADVERTIS-Guide-Complet.md
sed -i 's/ADVERT /ADVERTIS /g' docs/guide/ADVERTIS-Guide-Complet.md
sed -i 's/méthode ADVERT/méthode ADVERTIS/g' docs/guide/ADVERTIS-Guide-Complet.md
sed -i 's/6 piliers/8 piliers/g' docs/guide/ADVERTIS-Guide-Complet.md
sed -i 's/six piliers/huit piliers/g' docs/guide/ADVERTIS-Guide-Complet.md
```

---

### 2. `docs/guide/annexes/annexe-a-variables.md`

**Ajouter variables Pilier I:**

```markdown
### Variables Pilier I - Implementation

#### Roadmap
- `{{roadmap_horizon}}` - Horizon planification (12/24/36 mois)
- `{{roadmap_phases}}` - Nombre de phases
- `{{phase_1_duration}}` - Durée phase 1
- `{{quick_wins}}` - Liste quick wins 90 jours

#### Budget
- `{{budget_total}}` - Budget total implémentation
- `{{budget_phase_1}}` - Budget phase 1
- `{{budget_contingency}}` - Réserve contingence (%)
- `{{roi_target}}` - ROI cible
- `{{payback_period}}` - Période retour sur investissement

#### Équipe
- `{{team_structure}}` - Structure organisationnelle
- `{{key_roles}}` - Rôles clés à recruter
- `{{team_size}}` - Taille équipe totale
- `{{external_partners}}` - Partenaires externes
```

**Mettre à jour variables Pilier S:**

```markdown
### Variables Pilier S - Stratégie (Dual)

#### Document S
- `{{strategy_vision}}` - Vision stratégique
- `{{strategic_pillars}}` - Piliers stratégiques
[Variables existantes...]

#### Interface S
- `{{interface_url}}` - URL cockpit stratégique
- `{{dashboard_modules}}` - Modules tableau de bord
- `{{export_formats}}` - Formats export disponibles
- `{{user_roles}}` - Rôles utilisateurs interface
```

---

### 3. `docs/guide/annexes/annexe-b-templates-piliers.md`

**Ajouter Template Pilier I:**

```markdown
## Template Document I - Innovation & Implementation

### Structure (50-80 pages)

#### Section 1: Executive Summary (2-3 pages)
- Synthèse roadmap
- Budget consolidé
- Timeline clés
- Quick wins highlights

#### Section 2: Roadmap Stratégique (15-20 pages)
- Vision 12-24 mois
- Phases de déploiement
- Dépendances critiques
- Timeline Gantt visuel

#### Section 3: Budget & Ressources (12-15 pages)
- Budget détaillé par phase
- Allocation par pilier
- Analyse ROI
- Scénarios optimiste/pessimiste

#### Section 4: Structure d'Équipe (8-10 pages)
- Organigramme cible
- Fiches de poste clés
- Plan de recrutement
- Partenaires externes

#### Section 5: Plan de Lancement (10-12 pages)
- Timeline 90 premiers jours
- Quick wins détaillés
- Gestion du changement
- Communication interne

#### Section 6: Risques & Mitigation (5-8 pages)
- Matrice risques implémentation
- Plans de contingence
- Facteurs de succès critiques
```

**Mettre à jour Template Pilier S:**

Ajouter note au début:

```markdown
## Template Document S - Stratégie

> **NOTE IMPORTANTE:** Le Pilier S est DUAL:
> 1. **Document S** (ce template) - Strategy Bible PDF
> 2. **Interface S** - Strategic Cockpit interactif
>
> Ce template couvre le Document S uniquement.
> Pour l'Interface S, voir: interface/INTEGRATION-GUIDE.md

### Structure (50-120 pages)
[Contenu existant...]
```

---

### 4. `docs/guide/annexes/annexe-c-questions-entretien.md`

**Ajouter questions Pilier I:**

```markdown
## Questions Discovery - Pilier I (Implementation)

### Roadmap & Timeline
1. Quel est votre horizon de planification stratégique?
2. Avez-vous une roadmap produit/service existante?
3. Quels sont vos jalons critiques pour les 12 prochains mois?
4. Comment priorisez-vous vos initiatives?
5. Quels quick wins pourriez-vous atteindre en 90 jours?

### Budget & Ressources
6. Quel budget avez-vous alloué à la transformation?
7. Comment est structuré votre budget (CAPEX/OPEX)?
8. Quel ROI attendez-vous de cette initiative?
9. Quel est votre modèle de financement (bootstrapping/VC/etc)?
10. Quelles sont vos contraintes budgétaires principales?

### Équipe & Organisation
11. Quelle est votre structure organisationnelle actuelle?
12. Quels rôles clés manquent-ils dans votre équipe?
13. Avez-vous un plan de recrutement?
14. Travaillez-vous avec des partenaires externes?
15. Comment gérez-vous le changement organisationnel?

### Lancement & Exécution
16. Quelle est votre expérience de lancement produit/marque?
17. Comment communiquez-vous en interne sur la stratégie?
18. Quels sont vos indicateurs de succès à court terme?
19. Quels risques d'implémentation anticipez-vous?
20. Avez-vous des dépendances critiques (tech, légal, etc)?
```

---

### 5. `docs/guide/annexes/annexe-e-template-strategie.md`

**Mettre à jour pour S dual:**

Ajouter section au début:

```markdown
# Template Stratégie - Pilier S (Dual Nature)

## Introduction: Les Deux Faces du Pilier S

Le Pilier S - Stratégie se manifeste sous deux formes complémentaires:

### 1. Document S - Strategy Bible (Statique)
- **Format:** PDF 50-120 pages
- **Usage:** Référence, présentation, archivage
- **Audience:** Board, investisseurs, partenaires stratégiques
- **Update:** Trimestriel ou lors de pivots majeurs

### 2. Interface S - Strategic Cockpit (Dynamique)
- **Format:** Plateforme web interactive
- **Usage:** Navigation, visualisation temps réel, collaboration
- **Audience:** Executive team, management, consultants
- **Update:** Temps réel via dashboard

## Quand Utiliser Chaque Format?

| Contexte | Document S | Interface S |
|----------|-----------|-------------|
| Board meeting | ✅ Primary | ⚪ Support |
| Pitch investisseur | ✅ Primary | ⚪ Demo |
| Travail quotidien équipe | ⚪ Référence | ✅ Primary |
| Audit & compliance | ✅ Primary | ⚪ Extract |
| Présentation client | ✅ Primary | ✅ Demo |
| Suivi KPI temps réel | ❌ | ✅ Primary |

[Contenu existant du template...]
```

---

## 🏗️ Architecture & Planning

### 6. `docs/architecture/architecture.md`

**Modifications simples (chercher/remplacer):**

```bash
sed -i 's/ADVERT /ADVERTIS /g' docs/architecture/architecture.md
sed -i 's/méthode ADVERT/méthode ADVERTIS/g' docs/architecture/architecture.md
sed -i 's/6 piliers/8 piliers/g' docs/architecture/architecture.md
```

**Vérifier manuellement:**
- Références aux modules "Strategy Creation" → mettre à jour pour refléter piliers I & S
- Capability domains → vérifier couverture des 8 piliers
- Functional requirements → ajouter requirements spécifiques I & S si manquants

---

### 7. `docs/architecture/INTERFACE-ARCHITECTURE.md`

**Clarifier architecture pour pilier S dual:**

Ajouter au début:

```markdown
# Interface Architecture - Strategic Cockpit (Pilier S)

## Vue d'Ensemble

Cette architecture décrit le **Strategic Cockpit** - la composante interactive du Pilier S.

### Distinction Document S vs Interface S

- **Document S (Strategy Bible):** Fichier PDF statique généré à partir de templates
- **Interface S (Strategic Cockpit):** Application web interactive décrite dans ce document

L'interface permet:
1. Navigation contextuelle entre les 8 piliers
2. Visualisation temps réel des KPI (Pilier T)
3. Exploration interactive du roadmap (Pilier I)
4. Mode présentation pour stakeholders
5. Export multi-format (PDF, PPT, Web)

[Contenu existant...]
```

---

### 8. `docs/architecture/advertis-agent-army-architecture.md`

**Mettre à jour agents pour 8 piliers:**

Ajouter agents spécialisés:

```markdown
## Nouveaux Agents ADVERTIS v2.0

### Agent I - Implementation Planner
**Responsabilité:** Génération roadmap et planification budget

**Capacités:**
- Analyse dépendances entre initiatives
- Optimisation timeline selon contraintes
- Calcul ROI et business case
- Génération diagrammes Gantt
- Identification quick wins

**Inputs:** Objectifs stratégiques, contraintes budget/temps, ressources disponibles
**Outputs:** Document I (roadmap, budget, plan de lancement)

### Agent S - Interface Orchestrator
**Responsabilité:** Coordination Strategic Cockpit et génération Document S

**Capacités:**
- Agrégation données de tous les agents (A, D, V, E, R, T, I)
- Génération visualisations dashboard
- Export multi-format (PDF, web, PPT)
- Navigation contextuelle intelligente
- Personnalisation par rôle utilisateur

**Inputs:** Données piliers A-I, préférences utilisateur, contexte session
**Outputs:** Interface S (cockpit) + Document S (PDF)

[Reste du contenu existant...]
```

---

### 9. `docs/planning/ADVERTIS_02-PRD.md`

**Mises à jour critiques:**

#### A. Success Metrics

Ajouter:

```markdown
### Success Metrics ADVERTIS v2.0

#### Nouveau: Pilier I - Implementation
- [ ] 95%+ consultants peuvent créer roadmap 12-24 mois en <2h
- [ ] Budget planning accuracy: ±10% vs. actual
- [ ] Quick wins identification: 5+ opportunités par projet
- [ ] ROI calculator: business case automatisé en <15min

#### Nouveau: Pilier S - Interface
- [ ] Strategic Cockpit load time: <2s
- [ ] Export PDF: <5s pour 100 pages
- [ ] Navigation: trouve n'importe quelle section en <3 clics
- [ ] Dashboard update: temps réel (<100ms latency)
- [ ] Accessibility: WCAG 2.1 AA compliance 100%
```

#### B. User Stories

Ajouter:

```markdown
### User Story: Implementation Planning (Pilier I)

**As a** strategic consultant
**I want to** generate a detailed implementation roadmap with budget
**So that** my client has a clear execution plan beyond strategy

**Acceptance Criteria:**
- Can input strategic priorities and generate 12-month roadmap
- Budget breakdown by phase with ROI calculations
- Quick wins identified for first 90 days
- Export to client-ready format (PDF + Gantt chart)

### User Story: Interactive Strategy Navigation (Pilier S)

**As a** C-level executive
**I want to** navigate our entire strategy interactively via web cockpit
**So that** I can explore details on-demand without reading 300-page PDF

**Acceptance Criteria:**
- Click any pilier to see detailed view
- Filter by theme, priority, timeline
- Real-time KPI dashboard (linked to Pilier T)
- Presentation mode for board meetings
- Export current view to PDF
```

---

### 10. `docs/planning/ADVERTIS-Product-Brief.md`

**Mettre à jour vision statement:**

Remplacer section "Product Vision" par:

```markdown
## Product Vision ADVERTIS v2.0

**ADVERTIS transforms brand strategy from static documents into dynamic, actionable ecosystems.**

### Evolution from ADVERT

ADVERT (v1.0) provided 6 foundational pillars. ADVERTIS (v2.0) makes explicit what was implicit:

**Pilier I - Innovation & Implementation** (NEW)
- Transforms strategy into executable roadmap
- Bridges the gap between "what" and "how"
- Ensures budget, timeline, and team alignment

**Pilier S - Stratégie** (ENHANCED - Dual Nature)
- **Document S:** Premium 50-120 page Strategy Bible
- **Interface S:** Interactive Strategic Cockpit for real-time navigation

### Why This Evolution Matters

Traditional brand strategy fails at implementation. 70% of strategies never execute.

ADVERTIS solves this by:
1. **Making implementation explicit** (Pilier I roadmap + budget)
2. **Dual-format delivery** (static PDF + interactive web)
3. **Real-time tracking** (dashboard KPI)
4. **Actionable from day one** (quick wins identification)

[Reste du contenu...]
```

---

### 11. `docs/planning/epics.md`

**Ajouter epics ADVERTIS:**

```markdown
## Epic: Pilier I - Implementation Planner

**Description:** Build AI-powered implementation roadmap generator

**User Value:** Consultants can create client-ready 12-24 month roadmaps with budget in <2h instead of 40+ hours manual work

**Stories:**
- [ ] As a consultant, I can input strategic priorities and generate phased roadmap
- [ ] As a consultant, I can calculate project budget by phase with ROI projections
- [ ] As a consultant, I can identify quick wins for first 90 days
- [ ] As a consultant, I can visualize roadmap as Gantt chart
- [ ] As a consultant, I can export roadmap to client-ready PDF

**Acceptance Criteria:**
- Roadmap generation: <5 min end-to-end
- Budget accuracy: validates against industry benchmarks
- Quick wins: 5-10 opportunities identified per project
- Export quality: client-presentation ready

---

## Epic: Pilier S - Strategic Cockpit Interface

**Description:** Build interactive web platform for navigating 8-pilier strategy

**User Value:** Executives can explore 300-page strategy on-demand via intuitive web interface instead of reading linear PDF

**Stories:**
- [ ] As an executive, I can navigate between 8 pillars via interactive dashboard
- [ ] As an executive, I can view real-time KPI dashboards (Pilier T integration)
- [ ] As an executive, I can export any view to PDF for sharing
- [ ] As a consultant, I can present strategy in fullscreen presentation mode
- [ ] As an admin, I can control user access by role (view/edit/export)

**Acceptance Criteria:**
- Load time: <2s for full interface
- Accessibility: WCAG 2.1 AA compliant
- Export: PDF generation <5s
- Responsive: mobile/tablet support
- Offline: progressive web app (PWA) capability
```

---

### 12-15. UX & Delivery Docs

**Modifications mineures (chercher/remplacer):**

```bash
cd docs/planning

# ux-design-specification.md
sed -i 's/AMARA/ADVERTIS/g' ux-design-specification.md
sed -i 's/6 piliers/8 piliers/g' ux-design-specification.md

# ux-spec-interface-presentation-advertis.md
sed -i 's/AMARA/ADVERTIS/g' ux-spec-interface-presentation-advertis.md

# ADVERTIS-MIGRATION-STATUS.md
# Réinitialiser tracking pour ADVERTIS v2.0
# (Garder structure, mettre à jour dates et milestones)

# ADVERTIS-DELIVERY.md
sed -i 's/AMARA/ADVERTIS/g' ADVERTIS-DELIVERY.md
sed -i 's/v2.0-2.5/v2.0/g' ADVERTIS-DELIVERY.md
```

---

## 🖥️ Interface Templates

### 16. `interface/templates/README-INTERFACE.md`

**Chercher/Remplacer:**

```bash
sed -i 's/AMARA/ADVERTIS/g' interface/templates/README-INTERFACE.md
sed -i 's/Amara/Advertis/g' interface/templates/README-INTERFACE.md
```

**Vérifier manuellement:**
- Narratif brand → s'assurer que contexte ADVERTIS fait sens
- Screenshots/références → mettre à jour si contiennent branding AMARA

---

### 17-19. HTML Templates

**Branding rapide:**

```bash
cd interface/templates

# Remplacements basiques
for file in *.html; do
  sed -i 's/AMARA/ADVERTIS/g' "$file"
  sed -i 's/Amara/Advertis/g' "$file"
  sed -i 's/amara/advertis/g' "$file"
done
```

**Vérifications manuelles critiques:**

#### `index.html`
- Ligne ~15: `<title>` → "ADVERTIS Strategic Platform"
- Ligne ~45: Hero heading → Mettre à jour value prop
- Ligne ~80: Navigation links → Vérifier références 8 piliers
- Footer: Mettre à jour copyright/branding

#### `strategic-overview.html`
- Section executive summary → Mettre à jour contexte narratif
- Pilier descriptions → Vérifier 8 piliers (S, A, D, V, E, R, T, I)
- KPI examples → Utiliser données génériques (pas AMARA-specific)

#### `export-to-pdf.html`
- Garder tel quel (générique)

---

## ✅ Validation Checklist

Après avoir fait toutes les modifications:

### Tests Automatisés

```bash
# 1. Vérifier aucune référence "ADVERT " (sans IS)
grep -r "ADVERT " docs/ | grep -v "ADVERTIS"
# ❌ Devrait retourner 0 résultats

# 2. Vérifier aucune référence "6 piliers"
grep -r "6 piliers" docs/
# ❌ Devrait retourner 0 résultats

# 3. Vérifier présence pilier I
grep -r "Pilier I" docs/guide/
# ✅ Devrait retourner multiples résultats

# 4. Vérifier S dual
grep -r "dual" docs/guide/ | grep -i "pilier s"
# ✅ Devrait retourner multiples résultats
```

### Revue Manuelle

- [ ] **ADVERTIS-Guide-Complet.md** - Chapitre I complet?
- [ ] **ADVERTIS-Guide-Complet.md** - Chapitre S mentionne dual nature?
- [ ] **Annexe A** - Variables I & S ajoutées?
- [ ] **Annexe B** - Template I ajouté?
- [ ] **Annexe C** - Questions I ajoutées?
- [ ] **Architecture.md** - Références 8 piliers?
- [ ] **ADVERTIS_02-PRD.md** - Success metrics I & S?
- [ ] **HTML templates** - Branding ADVERTIS?

---

## 🎯 Ordre de Priorité Recommandé

### Phase 1: Critique (Jour 1-2)
1. ✅ ADVERTIS-Guide-Complet.md (piliers I & S)
2. ✅ Annexes A, B, C (variables, templates, questions)
3. ✅ ADVERTIS_02-PRD.md (success metrics)

### Phase 2: Important (Jour 3-4)
4. ✅ architecture.md (terminologie)
5. ✅ ADVERTIS-Product-Brief.md (vision)
6. ✅ HTML templates (branding)

### Phase 3: Complémentaire (Jour 5)
7. ✅ epics.md (nouveaux epics)
8. ✅ UX specs (dual interface)
9. ✅ Agent architecture (agents I & S)

---

**Total effort estimé: 3-5 jours de travail focused**

**Documents impactés: 28 fichiers**
**Modifications majeures: 3 fichiers**
**Modifications mineures: 25 fichiers**
