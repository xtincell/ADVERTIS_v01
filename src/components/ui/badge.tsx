import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "~/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        ghost: "[a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        link: "text-primary underline-offset-4 [a&]:hover:underline",
        success:
          "bg-[oklch(0.65_0.19_155/12%)] text-[oklch(0.40_0.15_155)] border-[oklch(0.65_0.19_155/20%)] dark:bg-[oklch(0.65_0.19_155/15%)] dark:text-[oklch(0.78_0.14_155)]",
        warning:
          "bg-[oklch(0.76_0.17_75/12%)] text-[oklch(0.45_0.15_75)] border-[oklch(0.76_0.17_75/20%)] dark:bg-[oklch(0.76_0.17_75/15%)] dark:text-[oklch(0.82_0.13_75)]",
        info:
          "bg-[oklch(0.60_0.17_240/12%)] text-[oklch(0.38_0.12_240)] border-[oklch(0.60_0.17_240/20%)] dark:bg-[oklch(0.60_0.17_240/15%)] dark:text-[oklch(0.75_0.12_240)]",
        emerald:
          "bg-primary/10 text-primary border-primary/20 dark:bg-primary/15",
        rose:
          "bg-accent/10 text-accent border-accent/20 dark:bg-accent/15",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
