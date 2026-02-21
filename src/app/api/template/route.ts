// =============================================================================
// ROUTE R.13 — Template
// =============================================================================
// GET  /api/template
// Template CRUD operations. Generates and serves an ADVERTIS Fiche de Marque
// Excel template (.xlsx) with all 25 A-D-V-E variables pre-structured for
// easy data entry. Includes instructions sheet + per-pillar worksheets.
// Auth:         None (public template download)
// Dependencies: exceljs, interview-schema (getFicheDeMarqueSchema)
// =============================================================================

import { NextResponse } from "next/server";
import ExcelJS from "exceljs";

import { getFicheDeMarqueSchema } from "~/lib/interview-schema";

// Pillar colors matching PILLAR_CONFIG
const PILLAR_COLORS: Record<string, string> = {
  A: "C45A3C",
  D: "2D5A3D",
  V: "C49A3C",
  E: "3C7AC4",
};

const PILLAR_TITLES: Record<string, string> = {
  A: "Authenticite",
  D: "Distinction",
  V: "Valeur",
  E: "Engagement",
};

export async function GET() {
  try {
    const schema = getFicheDeMarqueSchema();

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "ADVERTIS";
    workbook.created = new Date();

    // -----------------------------------------------------------------------
    // Sheet 1: Instructions
    // -----------------------------------------------------------------------
    const instructionsSheet = workbook.addWorksheet("Instructions", {
      properties: { tabColor: { argb: "FF333333" } },
    });

    instructionsSheet.columns = [
      { width: 80 },
    ];

    const titleRow = instructionsSheet.addRow([
      "ADVERTIS — Template Fiche de Marque",
    ]);
    titleRow.font = { bold: true, size: 18, color: { argb: "FF1A1A1A" } };
    titleRow.height = 30;

    instructionsSheet.addRow([""]);

    const instructions = [
      "Ce fichier Excel est un template pour renseigner les 26 variables de la Fiche de Marque ADVERTIS.",
      "",
      "COMMENT UTILISER CE TEMPLATE :",
      "1. Chaque onglet correspond a un pilier (A, D, V, E).",
      "2. Pour chaque variable, remplissez la colonne 'Votre reponse'.",
      "3. Les variables marquees avec une etoile (*) sont prioritaires.",
      "4. Une fois rempli, importez ce fichier dans ADVERTIS via 'Import de fichier'.",
      "5. L'IA analysera vos reponses et generera automatiquement les piliers R, T, I, S.",
      "",
      "CONSEILS :",
      "- Plus vos reponses sont detaillees, meilleure sera la qualite de la strategie generee.",
      "- Vous n'etes pas oblige de remplir toutes les variables, mais visez au minimum les prioritaires (*).",
      "- Utilisez les exemples dans la colonne 'Exemple' comme guide.",
      "",
      "PILIERS :",
      "A — Authenticite : ADN de marque, Purpose, Vision, Valeurs (7 variables)",
      "D — Distinction : Positionnement, Personas, Identite visuelle (7 variables)",
      "V — Valeur : Proposition de valeur, Pricing, Unit Economics (6 variables)",
      "E — Engagement : Touchpoints, Rituels, AARRR, Communaute (6 variables)",
    ];

    for (const line of instructions) {
      const row = instructionsSheet.addRow([line]);
      if (
        line.startsWith("COMMENT") ||
        line.startsWith("CONSEILS") ||
        line.startsWith("PILIERS")
      ) {
        row.font = { bold: true, size: 12, color: { argb: "FF1A1A1A" } };
      } else if (line.match(/^[A-E] —/)) {
        row.font = { bold: true, size: 11, color: { argb: "FF2D5A3D" } };
      } else {
        row.font = { size: 11, color: { argb: "FF444444" } };
      }
    }

    // -----------------------------------------------------------------------
    // Sheets 2-5: One sheet per pillar (A, D, V, E)
    // -----------------------------------------------------------------------
    for (const section of schema) {
      const pillarType = section.pillarType;
      const pillarColor = PILLAR_COLORS[pillarType] ?? "333333";
      const pillarTitle = PILLAR_TITLES[pillarType] ?? pillarType;

      const sheet = workbook.addWorksheet(
        `${pillarType} — ${pillarTitle}`,
        {
          properties: { tabColor: { argb: `FF${pillarColor}` } },
        },
      );

      // Column widths
      sheet.columns = [
        { header: "ID", width: 8 },
        { header: "Priorite", width: 10 },
        { header: "Variable", width: 30 },
        { header: "Description", width: 60 },
        { header: "Votre reponse", width: 80 },
        { header: "Exemple", width: 60 },
      ];

      // Header row styling
      const headerRow = sheet.getRow(1);
      headerRow.font = {
        bold: true,
        size: 11,
        color: { argb: "FFFFFFFF" },
      };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: `FF${pillarColor}` },
      };
      headerRow.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };
      headerRow.height = 25;

      // Data rows
      for (const variable of section.variables) {
        const row = sheet.addRow([
          variable.id,
          variable.priority ? "* Prioritaire" : "",
          variable.label,
          variable.description,
          "", // Empty — user fills this in
          variable.placeholder.replace(/^Ex:\s*/, ""),
        ]);

        // Style data rows
        row.alignment = { vertical: "top", wrapText: true };
        row.height = 60;

        // Priority indicator styling
        if (variable.priority) {
          const priorityCell = row.getCell(2);
          priorityCell.font = {
            bold: true,
            color: { argb: "FFCC8800" },
            size: 10,
          };
        }

        // ID cell styling
        const idCell = row.getCell(1);
        idCell.font = {
          bold: true,
          size: 11,
          color: { argb: `FF${pillarColor}` },
        };
        idCell.alignment = { vertical: "top", horizontal: "center" };

        // Description cell: smaller, grey
        const descCell = row.getCell(4);
        descCell.font = { size: 10, color: { argb: "FF666666" } };

        // Response cell: highlighted with light background
        const responseCell = row.getCell(5);
        responseCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFFDE7" }, // light yellow
        };
        responseCell.border = {
          top: { style: "thin", color: { argb: "FFDDDDDD" } },
          bottom: { style: "thin", color: { argb: "FFDDDDDD" } },
          left: { style: "thin", color: { argb: "FFDDDDDD" } },
          right: { style: "thin", color: { argb: "FFDDDDDD" } },
        };

        // Example cell: italic, grey
        const exampleCell = row.getCell(6);
        exampleCell.font = {
          italic: true,
          size: 10,
          color: { argb: "FF888888" },
        };
      }

      // Freeze the header row
      sheet.views = [{ state: "frozen", ySplit: 1 }];
    }

    // -----------------------------------------------------------------------
    // Generate buffer and respond
    // -----------------------------------------------------------------------
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition":
          'attachment; filename="ADVERTIS_Fiche_de_Marque_Template.xlsx"',
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("Template generation error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la generation du template" },
      { status: 500 },
    );
  }
}
