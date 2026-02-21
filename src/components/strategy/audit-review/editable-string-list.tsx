// ==========================================================================
// C.AR4 — Editable String List
// Reusable list editor.
// ==========================================================================

"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";

interface EditableStringListProps {
  value: string[];
  onChange: (value: string[]) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  maxItems?: number;
}

export function EditableStringList({
  value,
  onChange,
  label,
  placeholder = "Ajouter un item...",
  className,
  maxItems = 20,
}: EditableStringListProps) {
  const [newItem, setNewItem] = useState("");

  const addItem = () => {
    const trimmed = newItem.trim();
    if (!trimmed || value.length >= maxItems) return;
    onChange([...value, trimmed]);
    setNewItem("");
  };

  const removeItem = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, newValue: string) => {
    const updated = [...value];
    updated[index] = newValue;
    onChange(updated);
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= value.length) return;
    const updated = [...value];
    const temp = updated[newIndex]!;
    updated[newIndex] = updated[index]!;
    updated[index] = temp;
    onChange(updated);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <p className="text-sm font-medium text-foreground">{label}</p>
      )}

      {value.length > 0 && (
        <ul className="space-y-1.5">
          {value.map((item, index) => (
            <li key={index} className="group flex items-center gap-1.5">
              <div className="flex flex-col opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => moveItem(index, -1)}
                  disabled={index === 0}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                  aria-label="Monter"
                >
                  <GripVertical className="h-3 w-3" />
                </button>
              </div>
              <Input
                value={item}
                onChange={(e) => updateItem(index, e.target.value)}
                className="h-8 text-sm"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => removeItem(index)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {value.length < maxItems && (
        <div className="flex items-center gap-1.5">
          <Input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder={placeholder}
            className="h-8 text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addItem();
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={addItem}
            disabled={!newItem.trim()}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
