// ==========================================================================
// C.MS3 — Manual Data Form
// Manual market data entry.
// ==========================================================================

"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  Database,
  FileText,
  Users,
  Upload,
} from "lucide-react";
import { cn } from "~/lib/utils";
import type {
  ManualDataCategory,
  ManualDataEntry,
} from "~/lib/types/market-study";
import { MANUAL_SOURCE_TYPES } from "~/lib/types/market-study";

interface ManualDataFormProps {
  entries: ManualDataEntry[];
  onAdd: (data: {
    title: string;
    content: string;
    category: ManualDataCategory;
    sourceType: string;
  }) => Promise<void>;
  onRemove: (entryId: string) => Promise<void>;
  onUploadFile?: (file: File) => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

const CATEGORY_CONFIG: Record<
  ManualDataCategory,
  { label: string; icon: React.ComponentType<{ className?: string }>; description: string }
> = {
  internal: {
    label: "Données internes",
    icon: Database,
    description: "CRM, ventes, analytics, enquêtes satisfaction",
  },
  external: {
    label: "Données externes",
    icon: FileText,
    description: "Rapports sectoriels, études de marché, presse",
  },
  interview: {
    label: "Entretiens",
    icon: Users,
    description: "Clients, prospects, experts métier, focus groups",
  },
};

export function ManualDataForm({
  entries,
  onAdd,
  onRemove,
  onUploadFile,
  isLoading,
  className,
}: ManualDataFormProps) {
  const [activeCategory, setActiveCategory] =
    useState<ManualDataCategory>("internal");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [sourceType, setSourceType] = useState(
    MANUAL_SOURCE_TYPES.internal[0] ?? "",
  );
  const [isAdding, setIsAdding] = useState(false);

  const handleCategoryChange = (category: ManualDataCategory) => {
    setActiveCategory(category);
    setSourceType(MANUAL_SOURCE_TYPES[category][0] ?? "");
  };

  const handleAdd = async () => {
    if (!title.trim() || !content.trim()) return;
    setIsAdding(true);
    try {
      await onAdd({
        title: title.trim(),
        content: content.trim(),
        category: activeCategory,
        sourceType,
      });
      setTitle("");
      setContent("");
    } finally {
      setIsAdding(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadFile) return;
    await onUploadFile(file);
    e.target.value = ""; // Reset input
  };

  const categoryEntries = entries.filter(
    (e) => e.category === activeCategory,
  );

  return (
    <div className={cn("space-y-4", className)}>
      {/* Category tabs */}
      <div className="flex gap-1 rounded-lg border bg-muted/30 p-1">
        {(Object.keys(CATEGORY_CONFIG) as ManualDataCategory[]).map(
          (category) => {
            const config = CATEGORY_CONFIG[category];
            const Icon = config.icon;
            const count = entries.filter(
              (e) => e.category === category,
            ).length;

            return (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-all",
                  activeCategory === category
                    ? "bg-white shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/50",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{config.label}</span>
                {count > 0 && (
                  <span className="ml-1 rounded-full bg-terracotta/10 px-1.5 text-[10px] text-terracotta">
                    {count}
                  </span>
                )}
              </button>
            );
          },
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {CATEGORY_CONFIG[activeCategory].description}
      </p>

      {/* Add form */}
      <div className="space-y-3 rounded-lg border border-dashed p-3">
        <div className="flex gap-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre de la donnée"
            className="flex-1 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30"
          />
          <select
            value={sourceType}
            onChange={(e) => setSourceType(e.target.value)}
            className="rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30"
          >
            {MANUAL_SOURCE_TYPES[activeCategory].map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Collez ou saisissez vos données ici..."
          rows={4}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-terracotta/30"
        />

        <div className="flex items-center justify-between">
          {/* File upload */}
          {onUploadFile && (
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-dashed px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted/50 transition-colors">
              <Upload className="h-3.5 w-3.5" />
              Importer un fichier
              <input
                type="file"
                onChange={handleFileUpload}
                accept=".pdf,.docx,.xlsx,.csv,.txt"
                className="hidden"
              />
            </label>
          )}

          <button
            onClick={handleAdd}
            disabled={!title.trim() || !content.trim() || isAdding || isLoading}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-4 py-1.5 text-xs font-medium transition-colors",
              title.trim() && content.trim()
                ? "bg-terracotta text-white hover:bg-terracotta/90"
                : "bg-muted text-muted-foreground cursor-not-allowed",
            )}
          >
            <Plus className="h-3.5 w-3.5" />
            Ajouter
          </button>
        </div>
      </div>

      {/* Existing entries */}
      {categoryEntries.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Données ajoutées ({categoryEntries.length})
          </h4>

          {categoryEntries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-start justify-between rounded-lg border p-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{entry.title}</p>
                  <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                    {entry.sourceType}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {entry.content}
                </p>
              </div>

              <button
                onClick={() => onRemove(entry.id)}
                className="ml-2 shrink-0 p-1 text-muted-foreground hover:text-red-500 transition-colors"
                title="Supprimer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
