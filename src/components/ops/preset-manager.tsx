// ==========================================================================
// C.O9 — Preset Manager
// Strategy preset configuration.
// ==========================================================================

"use client";

import { useState } from "react";
import {
  BookTemplate,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  X,
  Sparkles,
  Lock,
  Package,
} from "lucide-react";

import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";
import { BRIEF_TYPE_LABELS, BRIEF_TYPES } from "~/lib/constants";

// ---------------------------------------------------------------------------
// PresetManager
// ---------------------------------------------------------------------------

export function PresetManager() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: presets, isLoading, refetch } = api.translation.presets.getAll.useQuery();

  const seedMutation = api.translation.presets.seedDefaults.useMutation({
    onSuccess: () => void refetch(),
  });

  const deleteMutation = api.translation.presets.delete.useMutation({
    onSuccess: () => void refetch(),
  });

  const systemPresets = presets?.filter((p) => p.isSystem) ?? [];
  const customPresets = presets?.filter((p) => !p.isSystem) ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookTemplate className="h-5 w-5 text-terracotta" />
          <h3 className="text-lg font-semibold">Presets de Briefs</h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {presets?.length ?? 0} preset{(presets?.length ?? 0) > 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {systemPresets.length === 0 && (
            <button
              onClick={() => seedMutation.mutate()}
              disabled={seedMutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              {seedMutation.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Sparkles className="h-3 w-3" />
              )}
              Initialiser les presets système
            </button>
          )}

          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-terracotta px-3 py-1.5 text-xs font-medium text-white hover:bg-terracotta/90 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Nouveau preset
          </button>
        </div>
      </div>

      {/* System presets */}
      {systemPresets.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Presets système
          </h4>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {systemPresets.map((preset) => (
              <PresetCard
                key={preset.id}
                preset={preset}
                isSystem
              />
            ))}
          </div>
        </div>
      )}

      {/* Custom presets */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Presets personnalisés
        </h4>

        {customPresets.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {customPresets.map((preset) =>
              editingId === preset.id ? (
                <PresetForm
                  key={preset.id}
                  preset={preset}
                  onSuccess={() => {
                    void refetch();
                    setEditingId(null);
                  }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <PresetCard
                  key={preset.id}
                  preset={preset}
                  onEdit={() => setEditingId(preset.id)}
                  onDelete={() => deleteMutation.mutate({ id: preset.id })}
                  isDeleting={deleteMutation.isPending}
                />
              ),
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center rounded-lg border border-dashed">
            <Package className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">
              Aucun preset personnalisé. Créez-en un après 2-3 missions similaires.
            </p>
          </div>
        )}
      </div>

      {/* Create form */}
      {showCreateForm && (
        <PresetForm
          onSuccess={() => {
            void refetch();
            setShowCreateForm(false);
          }}
          onCancel={() => setShowCreateForm(false)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Preset Card
// ---------------------------------------------------------------------------

function PresetCard({
  preset,
  isSystem = false,
  onEdit,
  onDelete,
  isDeleting,
}: {
  preset: {
    id: string;
    name: string;
    description: string | null;
    briefTypes: unknown;
    vertical: string | null;
    isSystem: boolean;
  };
  isSystem?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
}) {
  const briefTypes = Array.isArray(preset.briefTypes)
    ? (preset.briefTypes as string[])
    : [];

  return (
    <div
      className={cn(
        "rounded-xl border p-4 shadow-sm",
        isSystem ? "bg-muted/30 border-muted" : "bg-white",
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="text-sm font-semibold truncate">{preset.name}</h4>
            {isSystem && (
              <span title="Preset système"><Lock className="h-3 w-3 text-muted-foreground shrink-0" /></span>
            )}
          </div>
          {preset.description && (
            <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
              {preset.description}
            </p>
          )}
        </div>

        {!isSystem && (
          <div className="flex items-center gap-0.5 ml-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="rounded p-1 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 transition-colors"
                title="Modifier"
              >
                <Pencil className="h-3 w-3" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                disabled={isDeleting}
                className="rounded p-1 text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Supprimer"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Brief type tags */}
      <div className="flex flex-wrap gap-1 mt-2">
        {briefTypes.map((bt) => (
          <span
            key={bt}
            className={cn(
              "rounded-full px-2 py-0.5 text-[9px] font-medium border",
              isSystem
                ? "bg-white text-muted-foreground border-muted"
                : "bg-terracotta/5 text-terracotta border-terracotta/20",
            )}
          >
            {BRIEF_TYPE_LABELS[bt] ?? bt}
          </span>
        ))}
      </div>

      {/* Vertical badge */}
      {preset.vertical && (
        <span className="mt-2 inline-block rounded-full bg-purple-50 px-2 py-0.5 text-[9px] font-medium text-purple-600 border border-purple-200">
          {preset.vertical}
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Preset Form (Create / Edit)
// ---------------------------------------------------------------------------

function PresetForm({
  preset,
  onSuccess,
  onCancel,
}: {
  preset?: {
    id: string;
    name: string;
    description: string | null;
    briefTypes: unknown;
    vertical: string | null;
  };
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const isEdit = !!preset;
  const existingTypes = Array.isArray(preset?.briefTypes)
    ? (preset.briefTypes as string[])
    : [];

  const [name, setName] = useState(preset?.name ?? "");
  const [description, setDescription] = useState(preset?.description ?? "");
  const [vertical, setVertical] = useState(preset?.vertical ?? "");
  const [selectedTypes, setSelectedTypes] = useState<string[]>(existingTypes);

  const createMutation = api.translation.presets.create.useMutation({
    onSuccess,
  });

  const updateMutation = api.translation.presets.update.useMutation({
    onSuccess,
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = () => {
    if (!name.trim() || selectedTypes.length === 0) return;

    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      briefTypes: selectedTypes,
      vertical: vertical || undefined,
    };

    if (isEdit && preset) {
      updateMutation.mutate({ id: preset.id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type],
    );
  };

  return (
    <div className="rounded-xl border border-terracotta/20 bg-terracotta/5 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-terracotta">
          {isEdit ? "Modifier le preset" : "Nouveau preset personnalisé"}
        </h4>
        <button onClick={onCancel} className="rounded p-1 hover:bg-muted">
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* Name + Description */}
      <div className="grid gap-2 sm:grid-cols-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom du preset *"
          className="rounded-md border bg-white px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-terracotta"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optionnel)"
          className="rounded-md border bg-white px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-terracotta"
        />
      </div>

      {/* Vertical */}
      <select
        value={vertical}
        onChange={(e) => setVertical(e.target.value)}
        className="rounded-md border bg-white px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-terracotta"
      >
        <option value="">Tout vertical</option>
        <option value="FMCG">FMCG</option>
        <option value="TECH">Tech</option>
        <option value="HEALTH_PUBLIC">Santé Publique</option>
        <option value="INSTITUTIONAL">Institutionnel</option>
        <option value="CULTURE">Culture</option>
        <option value="LUXURY">Luxe</option>
        <option value="NGO">ONG</option>
      </select>

      {/* Brief type selection */}
      <div>
        <p className="text-[10px] font-semibold text-muted-foreground mb-1.5">
          Types de briefs inclus *
        </p>
        <div className="flex flex-wrap gap-1.5">
          {BRIEF_TYPES.map((bt) => {
            const isSelected = selectedTypes.includes(bt);
            return (
              <button
                key={bt}
                onClick={() => toggleType(bt)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[10px] font-medium border transition-colors",
                  isSelected
                    ? "bg-terracotta text-white border-terracotta"
                    : "bg-white text-muted-foreground border-muted hover:border-terracotta/50",
                )}
              >
                {BRIEF_TYPE_LABELS[bt] ?? bt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !name.trim() || selectedTypes.length === 0}
          className="inline-flex items-center gap-1.5 rounded-md bg-terracotta px-3 py-1.5 text-xs font-medium text-white hover:bg-terracotta/90 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Plus className="h-3 w-3" />
          )}
          {isEdit ? "Enregistrer" : "Créer le preset"}
        </button>
        <button
          onClick={onCancel}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
