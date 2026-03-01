# 📄 AMARA Strategic Package - Export Guide

## ✅ Package complet créé avec succès !

**Localisation :** `/workspaces/ADVERT_01/_bmad-output/AMARA-Strategic-Package-v1.0.zip`

**Taille :** 135 KB (compressé) | 680 KB (décompressé)

---

## 🚀 Export PDF - 3 Méthodes

### **Méthode 1: Export Tool Intégré** ⭐ RECOMMANDÉ

1. **Ouvrir l'outil d'export :**
   - Décompressez le ZIP
   - Ouvrez `export-to-pdf.html` dans votre navigateur

2. **Exporter les documents :**
   - Cliquez sur un document → s'ouvre dans un nouvel onglet
   - Appuyez sur `Ctrl+P` (Windows/Linux) ou `Cmd+P` (Mac)
   - Sélectionnez **"Enregistrer en PDF"** comme destination
   - Activez **"Graphiques d'arrière-plan"** dans les options
   - Cliquez sur **Enregistrer**

3. **Export groupé :**
   - Cliquez sur **"Export All (Sequential)"**
   - Les 8 documents s'ouvrent automatiquement
   - Répétez Ctrl+P sur chaque onglet

**Avantages :** Aucune installation requise, fonctionne sur tous les OS, qualité parfaite

---

### **Méthode 2: Export Manuel Direct**

1. Ouvrez `index.html` dans votre navigateur
2. Naviguez vers chaque document (S, A, D, V, E, R, T, I)
3. Pour chaque document :
   - `Ctrl+P` ou `Cmd+P`
   - Destination : **Enregistrer en PDF**
   - Paramètres :
     - Format : **A4**
     - Marges : **Par défaut** (ou 15mm côtés, 20mm haut/bas)
     - Échelle : **100%**
     - Graphiques d'arrière-plan : **✓ Activé**
   - Nom de fichier suggéré : `AMARA-Document-X-NomDocument.pdf`

**Noms suggérés :**
```
AMARA-Document-S-Strategy.pdf
AMARA-Document-A-Authenticite.pdf
AMARA-Document-D-Distinction.pdf
AMARA-Document-V-Valeur.pdf
AMARA-Document-E-Engagement.pdf
AMARA-Document-R-Risk.pdf
AMARA-Document-T-Track.pdf
AMARA-Document-I-Implementation.pdf
```

---

### **Méthode 3: Ligne de Commande (Avancé)**

Si vous souhaitez automatiser avec Puppeteer (nécessite dépendances système) :

```bash
# Installation des dépendances (Ubuntu/Debian)
sudo apt-get install -y \
  chromium-browser \
  libatk-bridge2.0-0 \
  libcups2 \
  libdrm2 \
  libxkbcommon0 \
  libgbm1

# Générer les PDFs
cd _bmad-output
node generate-pdfs.js
```

**Note :** Cette méthode peut nécessiter des ajustements selon votre environnement.

---

## 📦 Contenu du Package

### Documents Stratégiques (8)

| Doc | Nom | Sections | Taille | Pages Estimées |
|-----|-----|----------|--------|----------------|
| **S** | Strategy Bible | 6 | 69 KB | ~25 pages |
| **A** | Authenticité | 7 | 75 KB | ~28 pages |
| **D** | Distinction | 9 | 91 KB | ~32 pages |
| **V** | Valeur | 6 | 85 KB | ~30 pages |
| **E** | Engagement | 7 | 90 KB | ~33 pages |
| **R** | Risk | 7 | 61 KB | ~22 pages |
| **T** | Track | 5 | 14 KB | ~8 pages |
| **I** | Implementation | 7 | 32 KB | ~15 pages |

**Total Estimé :** ~193 pages de stratégie complète

### Fichiers Supplémentaires

- `index.html` - Hub de navigation principal
- `export-to-pdf.html` - 🆕 Outil d'export interactif
- `strategic-overview.html` - Vue d'ensemble stratégique
- `README.md` - Documentation complète
- `assets/` - Design system (CSS, JS)

---

## 💡 Conseils Pro

### Qualité PDF Optimale

1. **Résolution :** Utilisez Chrome ou Edge pour la meilleure fidélité
2. **Couleurs :** Activez "Graphiques d'arrière-plan" pour le système OKLCH
3. **Typographie :** La police Inter sera intégrée automatiquement
4. **Marges :** Gardez les marges par défaut pour une mise en page équilibrée

### Organisation des Fichiers

```
📁 AMARA-Strategic-Package/
├── 📄 HTML-Version/          (dossier décompressé)
│   ├── index.html
│   ├── export-to-pdf.html
│   └── documents/
└── 📄 PDF-Exports/           (créez ce dossier)
    ├── AMARA-Document-S-Strategy.pdf
    ├── AMARA-Document-A-Authenticite.pdf
    ├── ... (tous les PDFs)
    └── AMARA-Complete-Package.pdf  (optionnel: fusionné)
```

### Fusionner les PDFs (Optionnel)

Si vous souhaitez un seul PDF avec les 8 documents :

**En ligne :**
- [Adobe Acrobat Online](https://www.adobe.com/acrobat/online/merge-pdf.html)
- [Smallpdf](https://smallpdf.com/merge-pdf)
- [PDFtk](https://www.pdflabs.com/tools/pdftk-the-pdf-toolkit/) (CLI)

**Commande PDFtk :**
```bash
pdftk AMARA-Document-*.pdf cat output AMARA-Complete-Package.pdf
```

---

## ✅ Checklist de Livraison

- [x] 8 documents ADVERT complets (S, A, D, V, E, R, T, I)
- [x] Interface de navigation interactive
- [x] Outil d'export PDF intégré
- [x] Design system avec OKLCH colors
- [x] Documentation complète (README.md)
- [x] Package ZIP prêt à partager (135 KB)
- [x] Guide d'export PDF (ce document)

---

## 🎯 Prochaines Étapes

1. **✅ Décompressez le ZIP** et testez `export-to-pdf.html`
2. **📄 Exportez les PDFs** en utilisant la Méthode 1
3. **📤 Partagez** le package avec les stakeholders
4. **🔄 Itérez** selon les retours de l'équipe

---

## 📞 Support

Pour toute question sur l'export ou le package :
- Consultez le `README.md` dans le package
- Référez-vous aux instructions dans `export-to-pdf.html`
- Contactez l'équipe BMAD pour assistance

---

**AMARA Strategic Package v1.0**
*Généré par BMAD Framework | 2026-02-13*

🎨 Wear Your Story | Crafted with purpose, worn with pride
