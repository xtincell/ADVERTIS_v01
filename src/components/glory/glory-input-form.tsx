"use client";

// =============================================================================
// COMP C.GLORY — GloryInputForm
// =============================================================================
// Dynamic form renderer for GLORY tool inputs.
// Renders appropriate controls based on GloryToolInput.type definitions.
// Supports: text, textarea, select, multiselect, number, toggle.
// =============================================================================

import { cn } from "~/lib/utils";
import { type GloryToolInput } from "~/lib/types/glory-tools";
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

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface GloryInputFormProps {
  inputs: GloryToolInput[];
  values: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function GloryInputForm({
  inputs,
  values,
  onChange,
  disabled = false,
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
}

function FormField({ input, value, onChange, disabled }: FormFieldProps) {
  const fieldId = `glory-input-${input.key}`;

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
            {(input.options ?? []).map((opt) => (
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
}

function MultiSelectField({
  input,
  value,
  onChange,
  disabled,
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
      {(input.options ?? []).map((opt) => {
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
