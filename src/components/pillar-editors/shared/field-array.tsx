// ==========================================================================
// C.E.H2 — Field Array
// Shared dynamic array field component.
// ==========================================================================

"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

// ---------------------------------------------------------------------------
// StringArrayField — for arrays of simple strings (e.g., valeurs, canaux)
// ---------------------------------------------------------------------------

interface StringArrayFieldProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export function StringArrayField({
  label,
  values,
  onChange,
  placeholder = "Ajouter un élément",
}: StringArrayFieldProps) {
  const addItem = () => onChange([...values, ""]);
  const removeItem = (idx: number) => onChange(values.filter((_, i) => i !== idx));
  const updateItem = (idx: number, val: string) => {
    const next = [...values];
    next[idx] = val;
    onChange(next);
  };

  return (
    <div>
      <Label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      <div className="space-y-1.5">
        {values.map((v, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              value={v}
              onChange={(e) => updateItem(i, e.target.value)}
              placeholder={placeholder}
              className="text-sm"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-red-500"
              onClick={() => removeItem(i)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addItem} className="mt-1">
          <Plus className="mr-1 h-3.5 w-3.5" />
          Ajouter
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ObjectArrayField — for arrays of objects with configurable fields
// ---------------------------------------------------------------------------

interface FieldDef {
  key: string;
  label: string;
  type?: "text" | "number";
  placeholder?: string;
}

interface ObjectArrayFieldProps<T extends Record<string, unknown>> {
  label: string;
  items: T[];
  onChange: (items: T[]) => void;
  fields: FieldDef[];
  defaultItem: T;
}

export function ObjectArrayField<T extends Record<string, unknown>>({
  label,
  items,
  onChange,
  fields,
  defaultItem,
}: ObjectArrayFieldProps<T>) {
  const addItem = () => onChange([...items, { ...defaultItem }]);
  const removeItem = (idx: number) => onChange(items.filter((_, i) => i !== idx));
  const updateItem = (idx: number, key: string, val: unknown) => {
    const next = [...items];
    next[idx] = { ...next[idx]!, [key]: val } as T;
    onChange(next);
  };

  return (
    <div>
      <Label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="relative rounded-lg border bg-muted/10 p-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 h-6 w-6 text-muted-foreground hover:text-red-500"
              onClick={() => removeItem(i)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
            <div className="grid gap-2 sm:grid-cols-2">
              {fields.map((field) => (
                <div key={field.key}>
                  <Label className="mb-0.5 block text-[10px] font-medium text-muted-foreground">
                    {field.label}
                  </Label>
                  <Input
                    value={String(item[field.key] ?? "")}
                    onChange={(e) =>
                      updateItem(
                        i,
                        field.key,
                        field.type === "number" ? Number(e.target.value) || 0 : e.target.value,
                      )
                    }
                    placeholder={field.placeholder}
                    type={field.type === "number" ? "number" : "text"}
                    className="h-8 text-xs"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addItem}>
          <Plus className="mr-1 h-3.5 w-3.5" />
          Ajouter
        </Button>
      </div>
    </div>
  );
}
