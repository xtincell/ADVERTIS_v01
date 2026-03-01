#!/bin/bash

# ===================================================================
# ADVERTIS Auto-Update Script
# ===================================================================
# Applique les modifications TIER 2 automatisables
# (chercher/remplacer terminologie ADVERT → ADVERTIS)
#
# IMPORTANT: Ce script fait les mises à jour BASIQUES uniquement.
# Vous devez MANUELLEMENT compléter les modifications critiques
# listées dans UPDATE-NOTES.md
# ===================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           ADVERTIS Auto-Update Script v1.0                ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo ""

# Vérifier qu'on est dans ADVERTIS_TRANSFER
if [[ ! -f "README.md" ]] || [[ ! -d "docs" ]]; then
    echo -e "${RED}❌ ERROR: Exécuter ce script depuis ADVERTIS_TRANSFER root directory${NC}"
    exit 1
fi

echo -e "${YELLOW}⚠️  AVERTISSEMENT:${NC}"
echo "   Ce script modifie les fichiers en place."
echo "   Assurez-vous d'avoir une backup ou d'être dans un repo git."
echo ""
read -p "   Continuer? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Opération annulée.${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🚀 Démarrage des mises à jour automatiques...${NC}"
echo ""

# ===================================================================
# PHASE 1: Terminologie Globale
# ===================================================================

echo -e "${BLUE}[1/5] Mise à jour terminologie globale...${NC}"

# Fonction de remplacement sécurisée
safe_replace() {
    local file=$1
    local pattern=$2
    local replacement=$3

    if [[ -f "$file" ]]; then
        # Utiliser perl pour remplacements plus fiables
        perl -pi -e "s/$pattern/$replacement/g" "$file"
        echo "  ✓ $file"
    fi
}

# Remplacements dans docs/architecture/
for file in docs/architecture/*.md; do
    if [[ -f "$file" ]]; then
        safe_replace "$file" "ADVERT(?!IS)" "ADVERTIS"
        safe_replace "$file" "6 piliers" "8 piliers"
        safe_replace "$file" "six piliers" "huit piliers"
    fi
done

# Remplacements dans docs/planning/
for file in docs/planning/*.md; do
    if [[ -f "$file" ]]; then
        safe_replace "$file" "AMARA" "ADVERTIS"
        safe_replace "$file" "Amara" "Advertis"
    fi
done

echo -e "${GREEN}  ✅ Terminologie mise à jour${NC}"
echo ""

# ===================================================================
# PHASE 2: Guide Méthodologie (Updates Basiques)
# ===================================================================

echo -e "${BLUE}[2/5] Mise à jour guide méthodologie (basique)...${NC}"

# Guide principal
if [[ -f "docs/guide/ADVERTIS-Guide-Complet.md" ]]; then
    safe_replace "docs/guide/ADVERTIS-Guide-Complet.md" "ADVERT(?!IS)" "ADVERTIS"
    safe_replace "docs/guide/ADVERTIS-Guide-Complet.md" "méthode ADVERT" "méthode ADVERTIS"
    safe_replace "docs/guide/ADVERTIS-Guide-Complet.md" "6 piliers" "8 piliers"
    safe_replace "docs/guide/ADVERTIS-Guide-Complet.md" "six piliers" "huit piliers"
    echo "  ✓ ADVERTIS-Guide-Complet.md"
fi

# Annexes
for file in docs/guide/annexes/*.md; do
    if [[ -f "$file" ]]; then
        safe_replace "$file" "ADVERT(?!IS)" "ADVERTIS"
        safe_replace "$file" "6 piliers" "8 piliers"
        echo "  ✓ $(basename $file)"
    fi
done

echo -e "${YELLOW}  ⚠️  ATTENTION: Modifications manuelles requises!${NC}"
echo "     Voir UPDATE-NOTES.md sections 1-5 pour:"
echo "     - Ajouter chapitre Pilier I"
echo "     - Mettre à jour chapitre Pilier S (dual nature)"
echo "     - Ajouter variables/templates/questions I & S"
echo ""

# ===================================================================
# PHASE 3: HTML Templates (Branding)
# ===================================================================

echo -e "${BLUE}[3/5] Mise à jour templates HTML...${NC}"

for file in interface/templates/*.html; do
    if [[ -f "$file" ]]; then
        safe_replace "$file" "AMARA" "ADVERTIS"
        safe_replace "$file" "Amara" "Advertis"
        safe_replace "$file" "amara" "advertis"
        echo "  ✓ $(basename $file)"
    fi
done

# README interface
if [[ -f "interface/templates/README-INTERFACE.md" ]]; then
    safe_replace "interface/templates/README-INTERFACE.md" "AMARA" "ADVERTIS"
    safe_replace "interface/templates/README-INTERFACE.md" "Amara" "Advertis"
    echo "  ✓ README-INTERFACE.md"
fi

echo -e "${YELLOW}  ⚠️  ATTENTION: Vérification manuelle requise!${NC}"
echo "     Vérifier narratif et contexte dans HTML templates"
echo "     Voir UPDATE-NOTES.md sections 16-19"
echo ""

# ===================================================================
# PHASE 4: UX Specifications
# ===================================================================

echo -e "${BLUE}[4/5] Mise à jour UX specifications...${NC}"

if [[ -f "docs/planning/ux-design-specification.md" ]]; then
    safe_replace "docs/planning/ux-design-specification.md" "AMARA" "ADVERTIS"
    safe_replace "docs/planning/ux-design-specification.md" "6 piliers" "8 piliers"
    echo "  ✓ ux-design-specification.md"
fi

if [[ -f "docs/planning/ux-spec-interface-presentation-advertis.md" ]]; then
    safe_replace "docs/planning/ux-spec-interface-presentation-advertis.md" "AMARA" "ADVERTIS"
    echo "  ✓ ux-spec-interface-presentation-advertis.md"
fi

echo -e "${GREEN}  ✅ UX specs mises à jour${NC}"
echo ""

# ===================================================================
# PHASE 5: Validation
# ===================================================================

echo -e "${BLUE}[5/5] Validation automatique...${NC}"
echo ""

# Test 1: Vérifier absence de "ADVERT " (sans IS)
echo "  Test 1: Recherche 'ADVERT ' orphelin..."
ADVERT_COUNT=$(grep -r "ADVERT " docs/ 2>/dev/null | grep -v "ADVERTIS" | wc -l || echo "0")
if [[ "$ADVERT_COUNT" -eq 0 ]]; then
    echo -e "    ${GREEN}✓ Aucune référence 'ADVERT ' trouvée${NC}"
else
    echo -e "    ${YELLOW}⚠ $ADVERT_COUNT références 'ADVERT ' trouvées (review recommandé)${NC}"
fi

# Test 2: Vérifier absence de "6 piliers"
echo "  Test 2: Recherche '6 piliers'..."
SIX_COUNT=$(grep -r "6 piliers" docs/ 2>/dev/null | wc -l || echo "0")
if [[ "$SIX_COUNT" -eq 0 ]]; then
    echo -e "    ${GREEN}✓ Aucune référence '6 piliers' trouvée${NC}"
else
    echo -e "    ${YELLOW}⚠ $SIX_COUNT références '6 piliers' trouvées (review recommandé)${NC}"
fi

# Test 3: Vérifier présence "8 piliers"
echo "  Test 3: Vérification '8 piliers'..."
EIGHT_COUNT=$(grep -r "8 piliers" docs/ 2>/dev/null | wc -l || echo "0")
if [[ "$EIGHT_COUNT" -gt 0 ]]; then
    echo -e "    ${GREEN}✓ $EIGHT_COUNT références '8 piliers' trouvées${NC}"
else
    echo -e "    ${YELLOW}⚠ Aucune référence '8 piliers' trouvée (vérifier)${NC}"
fi

# Test 4: Vérifier branding AMARA résiduel
echo "  Test 4: Recherche 'AMARA' résiduel..."
AMARA_COUNT=$(grep -r "AMARA" interface/ docs/planning/ 2>/dev/null | wc -l || echo "0")
if [[ "$AMARA_COUNT" -eq 0 ]]; then
    echo -e "    ${GREEN}✓ Aucune référence 'AMARA' trouvée${NC}"
else
    echo -e "    ${YELLOW}⚠ $AMARA_COUNT références 'AMARA' trouvées (check docs/reference/)${NC}"
fi

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Mises à jour automatiques terminées!${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""

# ===================================================================
# NEXT STEPS
# ===================================================================

echo -e "${YELLOW}📋 PROCHAINES ÉTAPES MANUELLES REQUISES:${NC}"
echo ""
echo "1. ${BLUE}Guide Complet (CRITIQUE)${NC}"
echo "   → Ouvrir docs/guide/ADVERTIS-Guide-Complet.md"
echo "   → Ajouter Chapitre 8: Pilier I"
echo "   → Mettre à jour Chapitre 7: Pilier S (dual nature)"
echo "   → Mettre à jour table des matières"
echo ""
echo "2. ${BLUE}Annexes (IMPORTANT)${NC}"
echo "   → docs/guide/annexes/annexe-a-variables.md (variables I & S)"
echo "   → docs/guide/annexes/annexe-b-templates-piliers.md (template I)"
echo "   → docs/guide/annexes/annexe-c-questions-entretien.md (questions I)"
echo ""
echo "3. ${BLUE}Planning Docs (IMPORTANT)${NC}"
echo "   → docs/planning/ADVERTIS_02-PRD.md (success metrics I & S)"
echo "   → docs/planning/ADVERTIS-Product-Brief.md (vision statement)"
echo "   → docs/planning/epics.md (epics I & S)"
echo ""
echo "4. ${BLUE}Architecture (MOYEN)${NC}"
echo "   → docs/architecture/INTERFACE-ARCHITECTURE.md (S dual)"
echo "   → docs/architecture/advertis-agent-army-architecture.md (agents I & S)"
echo ""
echo "5. ${BLUE}HTML Templates (OPTIONNEL)${NC}"
echo "   → Vérifier narratif context dans interface/templates/*.html"
echo ""
echo -e "📄 ${BLUE}Guide détaillé: UPDATE-NOTES.md${NC}"
echo -e "📊 ${BLUE}Vue d'ensemble: README.md${NC}"
echo ""
echo -e "${GREEN}Bonne migration ADVERTIS! 🚀${NC}"
echo ""

# Générer rapport
REPORT_FILE="update-report-$(date +%Y%m%d-%H%M%S).txt"
{
    echo "ADVERTIS Auto-Update Report"
    echo "==========================="
    echo "Date: $(date)"
    echo ""
    echo "Tests de Validation:"
    echo "  - 'ADVERT ' orphelins: $ADVERT_COUNT"
    echo "  - '6 piliers' références: $SIX_COUNT"
    echo "  - '8 piliers' références: $EIGHT_COUNT"
    echo "  - 'AMARA' résiduels: $AMARA_COUNT"
    echo ""
    echo "Fichiers modifiés:"
    echo "  - docs/architecture/*.md"
    echo "  - docs/planning/*.md"
    echo "  - docs/guide/*.md"
    echo "  - interface/templates/*"
    echo ""
    echo "Prochaines étapes: Voir UPDATE-NOTES.md"
} > "$REPORT_FILE"

echo -e "${GREEN}📄 Rapport généré: $REPORT_FILE${NC}"
echo ""
