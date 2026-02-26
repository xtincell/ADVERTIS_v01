"use client";

// =============================================================================
// COMP C.GLORY — GloryInputForm
// =============================================================================
// Dynamic form renderer for GLORY tool inputs.
// Renders appropriate controls based on GloryToolInput.type definitions.
// Supports: text, textarea, select, multiselect, number, toggle.
// Enhanced with field enrichment: suggestion chips, pre-fill, dynamic options.
// =============================================================================

import { cn } from "~/lib/utils";
import { type GloryToolInput, type FieldEnrichment } from "~/lib/types/glory-tools";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { HelpCircle } from "lucide-react";
import { SuggestionChips } from "./suggestion-chips";
import { Skeleton } from "~/components/ui/skeleton";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface GloryInputFormProps {
  inputs: GloryToolInput[];
  values: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
  disabled?: boolean;
  /** Field enrichment data from strategy (suggestions, defaults, dynamic options) */
  enrichments?: Record<string, FieldEnrichment>;
  /** Whether enrichment data is still loading */
  enrichmentsLoading?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function GloryInputForm({
  inputs,
  values,
  onChange,
  disabled = false,
  enrichments = {},
  enrichmentsLoading = false,
}: GloryInputFormProps) {
  return (
    <div className="space-y-5">
      {inputs.map((input) => (
        <FormField
          key={input.key}
          input={input}
          value={values[input.key]}
          onChange={(val) => onChange(input.key, val)}
          disabled={disabled}
          enrichment={enrichments[input.key]}
          enrichmentLoading={enrichmentsLoading}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Single form field renderer
// ---------------------------------------------------------------------------
interface FormFieldProps {
  input: GloryToolInput;
  value: unknown;
  onChange: (value: unknown) => void;
  disabled: boolean;
  enrichment?: FieldEnrichment;
  enrichmentLoading?: boolean;
}

function FormField({
  input,
  value,
  onChange,
  disabled,
  enrichment,
  enrichmentLoading,
}: FormFieldProps) {
  const fieldId = `glory-input-${input.key}`;

  // Resolve options: use dynamicOptions from enrichment if available, else static
  const options = enrichment?.dynamicOptions?.length
    ? enrichment.dynamicOptions
    : (input.options ?? []);

  // Handle suggestion click
  const handleSuggestionSelect = (suggestion: string) => {
    if (input.type === "textarea") {
      // For textarea, append (or replace if empty)
      const current = (value as string) ?? "";
      onChange(current ? `${current}\n${suggestion}` : suggestion);
    } else {
      // For text/number, replace
      onChange(suggestion);
    }
  };

  return (
    <div className="space-y-1.5">
      {/* Label */}
      <div className="flex items-center gap-1.5">
        <Label htmlFor={fieldId} className="text-sm font-medium">
          {input.label}
          {input.required && <span className="text-red-500 ml-0.5">*</span>}
        </Label>
        {input.helpText && (
          <span
            className="inline-flex items-center text-muted-foreground"
            title={input.helpText}
          >
            <HelpCircle className="h-3.5 w-3.5" />
          </span>
        )}
      </div>

      {/* Help text (displayed under label) */}
      {input.helpText && (
        <p className="text-xs text-muted-foreground">{input.helpText}</p>
      )}

      {/* Context hint from enrichment */}
      {enrichment?.contextHint && (
        <p className="text-xs text-[#6C5CE7]/80 italic">
          {enrichment.contextHint}
        </p>
      )}

      {/* Suggestion chips (loading skeleton or actual chips) */}
      {enrichmentLoading && (input.type === "text" || input.type === "textarea") && (
        <div className="flex gap-1.5 mb-2">
          <Skeleton className="h-6 w-24 rounded-full bg-[#6C5CE7]/10" />
          <Skeleton className="h-6 w-32 rounded-full bg-[#6C5CE7]/10" />
          <Skeleton className="h-6 w-20 rounded-full bg-[#6C5CE7]/10" />
        </div>
      )}
      {!enrichmentLoading && enrichment?.suggestions && enrichment.suggestions.length > 0 && (
        <SuggestionChips
          suggestions={enrichment.suggestions}
          mode={input.type === "textarea" ? "append" : "replace"}
          onSelect={handleSuggestionSelect}
        />
      )}

      {/* Control */}
      {input.type === "text" && (
        <Input
          id={fieldId}
          type="text"
          placeholder={input.placeholder ?? ""}
          value={(value as string) ?? (input.defaultValue as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="border-gray-300 focus-visible:ring-[#6C5CE7]/30"
        />
      )}

      {input.type === "textarea" && (
        <Textarea
          id={fieldId}
          placeholder={input.placeholder ?? ""}
          value={(value as string) ?? (input.defaultValue as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          rows={4}
          className="border-gray-300 focus-visible:ring-[#6C5CE7]/30 resize-y"
        />
      )}

      {input.type === "number" && (
        <Input
          id={fieldId}
          type="number"
          placeholder={input.placeholder ?? ""}
          value={(value as number) ?? (input.defaultValue as number) ?? ""}
          onChange={(e) => onChange(e.target.valueAsNumber || 0)}
          disabled={disabled}
          className="border-gray-300 focus-visible:ring-[#6C5CE7]/30 max-w-[200px]"
        />
      )}

      {input.type === "select" && (
        <Select
          value={(value as string) ?? (input.defaultValue as string) ?? ""}
          onValueChange={(val) => onChange(val)}
          disabled={disabled}
        >
          <SelectTrigger
            id={fieldId}
            className="border-gray-300 focus:ring-[#6C5CE7]/30"
          >
            <SelectValue placeholder={input.placeholder ?? "Choisir..."} />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {input.type === "multiselect" && (
        <MultiSelectField
          input={input}
          value={value}
          onChange={onChange}
          disabled={disabled}
          options={options}
        />
      )}

      {input.type === "toggle" && (
        <div className="flex items-center gap-2 pt-1">
          <Checkbox
            id={fieldId}
            checked={
              (value as boolean) ?? (input.defaultValue as boolean) ?? false
            }
            onCheckedChange={(checked) => onChange(checked === true)}
            disabled={disabled}
            className="data-[state=checked]:bg-[#6C5CE7] data-[state=checked]:border-[#6C5CE7]"
          />
          <Label
            htmlFor={fieldId}
            className="text-sm font-normal cursor-pointer"
          >
            {input.placeholder ?? "Activer"}
          </Label>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Multiselect — checkbox group
// ---------------------------------------------------------------------------
interface MultiSelectFieldProps {
  input: GloryToolInput;
  value: unknown;
  onChange: (value: unknown) => void;
  disabled: boolean;
  options: { value: string; label: string }[];
}

function MultiSelectField({
  input,
  value,
  onChange,
  disabled,
  options,
}: MultiSelectFieldProps) {
  const selected = Array.isArray(value) ? (value as string[]) : [];

  const handleToggle = (optionValue: string, checked: boolean) => {
    if (checked) {
      onChange([...selected, optionValue]);
    } else {
      onChange(selected.filter((v) => v !== optionValue));
    }
  };

  return (
    <div className="flex flex-col gap-2 pt-1">
      {options.map((opt) => {
        const checkId = `glory-multi-${input.key}-${opt.value}`;
        return (
          <div key={opt.value} className="flex items-center gap-2">
            <Checkbox
              id={checkId}
              checked={selected.includes(opt.value)}
              onCheckedChange={(checked) =>
                handleToggle(opt.value, checked === true)
              }
              disabled={disabled}
              className="data-[state=checked]:bg-[#6C5CE7] data-[state=checked]:border-[#6C5CE7]"
            />
            <Label
              htmlFor={checkId}
              className="text-sm font-normal cursor-pointer"
            >
              {opt.label}
            </Label>
          </div>
        );
      })}
    </div>
  );
}
