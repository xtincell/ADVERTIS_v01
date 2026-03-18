# ADVERTIS — Design System & Development Rules

## Figma MCP Integration Rules

These rules define how to translate Figma inputs into code for this project and must be followed for every Figma-driven change.

### Required Flow (do not skip)

1. Run `get_design_context` first to fetch the structured representation for the exact node(s)
2. If the response is too large or truncated, run `get_metadata` to get the high-level node map, then re-fetch only the required node(s) with `get_design_context`
3. Run `get_screenshot` for a visual reference of the node variant being implemented
4. Only after you have both `get_design_context` and `get_screenshot`, download any assets needed and start implementation
5. Translate the output (usually React + Tailwind) into this project's conventions, styles, and framework
6. Validate against Figma for 1:1 look and behavior before marking complete

### Implementation Rules

- Treat Figma MCP output as a representation of design and behavior, not as final code
- Reuse existing components from `~/components/ui/` instead of duplicating functionality
- Use the project's OKLCH color system, typography scale, and spacing tokens consistently
- Respect existing routing (Next.js App Router), state management, and data-fetch patterns
- Strive for 1:1 visual parity with the Figma design
- Validate the final UI against the Figma screenshot for both look and behavior

---

## Project Architecture

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 (native `@theme` syntax, no `tailwind.config.js`)
- **Components**: shadcn/ui "new-york" style, Radix UI primitives
- **State**: React Hook Form + Zod for forms; tRPC for data fetching
- **Auth**: NextAuth.js 5 (JWT sessions)
- **Database**: Prisma ORM (PostgreSQL, 87 models)
- **Path alias**: `~/` maps to `./src/`

---

## Component Organization

| Type | Location |
|------|----------|
| UI primitives (Button, Card, Input...) | `src/components/ui/*.tsx` |
| Feature components | `src/components/[domain]/*.tsx` |
| Layout shells & navigation | `src/components/shells/*.tsx` |
| Layout components (header) | `src/components/layout/*.tsx` |
| Hooks | `src/hooks/*.ts` |
| Utility functions | `src/lib/utils.ts` |

- IMPORTANT: Always check `src/components/ui/` for existing components before creating new ones
- Place new UI primitives in `src/components/ui/`
- Place domain-specific components in `src/components/[domain]/`
- Components use PascalCase filenames for multi-word (`PageHeader.tsx`) or kebab-case for shadcn (`page-header.tsx`)

---

## Styling Rules

### Tailwind CSS v4

- IMPORTANT: Use Tailwind utility classes for all styling. No CSS modules, no styled-components, no inline styles
- Design tokens are defined as CSS custom properties in `src/styles/globals.css`
- All `className` merging must use the `cn()` utility from `~/lib/utils`

### Color System (OKLCH)

- IMPORTANT: Never hardcode hex or RGB colors. Use CSS variables or Tailwind tokens
- Brand primary (Rouge-Orange): `--color-primary` / `oklch(0.63 0.22 34)`
- Brand light: `--color-brand-light` / `oklch(0.78 0.15 34)`
- Accent (Rose): `--color-accent` / `oklch(0.62 0.25 12)`
- Tertiary (Amber): `--color-tertiary` / `oklch(0.76 0.19 75)`
- Semantic: `--color-success`, `--color-warning`, `--color-info`
- UI variables: `--background`, `--foreground`, `--card`, `--muted`, `--border`, `--ring`

### Typography

- Display font: "Plus Jakarta Sans" (headings, hero text)
- Body font: "Inter" (body text, UI elements)
- Mono font: "SF Mono", "Monaco" (code)
- Use typography utility classes: `.text-display-xl`, `.text-display-lg`, `.text-display-sm`, `.text-body-lg`

### Spacing & Radius

- Base radius: `0.625rem` (stored in `--radius`)
- Radius scales: `--radius-sm` through `--radius-4xl`
- Use Tailwind's default spacing scale

### Shadows

- Multi-level: `--shadow-xs` through `--shadow-2xl`
- Brand glows: `--shadow-glow-brand`, `--shadow-glow-rose`, `--shadow-glow-amber`

### Animations

- Easing: `--ease-spring`, `--ease-out-expo`, `--ease-smooth`
- Durations: `--duration-fast` (150ms), `--duration-normal` (250ms), `--duration-slow` (400ms)
- Utility classes: `.animate-page-enter`, `.animate-fade-in`, `.animate-scale-in`
- IMPORTANT: Always respect `prefers-reduced-motion`

---

## Component Patterns

### Variant System (CVA)

All components with visual variants MUST use `class-variance-authority`:

```tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";

const myVariants = cva("base-classes", {
  variants: {
    variant: { default: "...", primary: "..." },
    size: { default: "...", sm: "...", lg: "..." },
  },
  defaultVariants: { variant: "default", size: "default" },
});

function MyComponent({ className, variant, size, ...props }: MyComponentProps) {
  return <div className={cn(myVariants({ variant, size }), className)} {...props} />;
}
```

### data-slot Attributes

- Add `data-slot="component-name"` to root elements for CSS targeting
- Add `data-variant` and `data-size` when applicable

### Radix UI Wrapping

- All interactive components (Dialog, Select, Popover, etc.) wrap Radix UI headless primitives
- Support the `asChild` prop pattern via `Slot.Root` for polymorphic rendering

### Accessibility

- IMPORTANT: Include `focus-visible` ring styles on all interactive elements
- Support `aria-invalid`, `aria-disabled`, and other ARIA attributes
- Use semantic HTML (button, nav, main, section, etc.)

---

## Icon System

- IMPORTANT: Use `lucide-react` exclusively. Do NOT install or import other icon libraries
- Size pattern: `className="size-4"` (or size-5, size-6)
- In buttons: icons auto-sized with `[&_svg:not([class*='size-'])]:size-4`

---

## Asset Handling

- IMPORTANT: If the Figma MCP server returns a localhost source for an image or SVG, use that source directly
- IMPORTANT: DO NOT use or create placeholders if a localhost source is provided
- IMPORTANT: DO NOT import/add new icon packages — all assets should come from Figma payload or lucide-react
- Store static assets in `public/`
- Use Next.js `<Image>` component for optimized images

---

## Form Patterns

- Use React Hook Form + Zod for all forms
- Form structure: `Form` > `FormField` > `FormItem` > `FormLabel` + `FormControl` + `FormMessage`
- All schemas in Zod, validated server-side via tRPC

---

## Special Effects (available in globals.css)

- Glassmorphism: `.glass` (20px blur, 75% opacity), `.glass-subtle` (12px blur, 85% opacity)
- Gradient text: `.text-gradient` (brand Rouge-Orange to Rose)
- Gradient button: `.btn-gradient`
- Hero background: `.bg-mesh`
- Shimmer loading: `.shimmer`
- Card hover: lift effect with `hover:-translate-y-0.5` + shadow transition
- Stagger animation: `.stagger-children` (50ms delays, up to 10 items)

---

## Development Conventions

- Strict TypeScript (`strict: true`, `noUncheckedIndexedAccess: true`)
- ESLint + Prettier for formatting
- Imports: use `~/` path alias, never relative beyond parent (`../..`)
- No `any` types in component props
- Server components by default; add `"use client"` only when needed (hooks, interactivity)
- tRPC for all data mutations/queries; API routes only for external integrations
