'use client'

import * as React from 'react'
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const toggleGroupVariants = cva('inline-flex items-center rounded-md', {
  variants: {
    variant: {
      default: 'bg-muted text-muted-foreground p-0.5',
      outline: 'border border-border bg-background p-0.5',
    },
    size: {
      default: 'h-9',
      sm: 'h-8',
      lg: 'h-10',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
})

const toggleGroupItemVariants = cva(
  'inline-flex items-center justify-center rounded-sm text-xs font-medium transition-colors outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm',
  {
    variants: {
      size: {
        default: 'h-8 px-2.5',
        sm: 'h-7 px-2',
        lg: 'h-9 px-3',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
)

function ToggleGroup({ className, variant, size, children, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Root> & VariantProps<typeof toggleGroupVariants>) {
  return (
    <ToggleGroupPrimitive.Root className={cn(toggleGroupVariants({ variant, size }), className)} {...props}>
      {children}
    </ToggleGroupPrimitive.Root>
  )
}

function ToggleGroupItem({ className, size, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Item> & VariantProps<typeof toggleGroupItemVariants>) {
  return <ToggleGroupPrimitive.Item className={cn(toggleGroupItemVariants({ size }), className)} {...props} />
}

export { ToggleGroup, ToggleGroupItem }
