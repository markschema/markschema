'use client'

import { GripHorizontal } from 'lucide-react'
import * as React from 'react'
import {
  Group,
  Panel,
  Separator,
  type GroupImperativeHandle,
  type GroupProps,
  type PanelProps,
  type SeparatorProps,
} from 'react-resizable-panels'
import { cn } from '@/lib/utils'

type ResizablePanelGroupProps = Omit<GroupProps, 'orientation'> & {
  direction: 'horizontal' | 'vertical'
  groupRef?: React.Ref<GroupImperativeHandle | null>
}

function ResizablePanelGroup({ className, direction, children, ...props }: ResizablePanelGroupProps) {
  return (
    <Group
      orientation={direction}
      className={cn('flex h-full w-full overflow-hidden data-[group-orientation=vertical]:flex-col', className)}
      {...props}
    >
      {children}
    </Group>
  )
}

function ResizablePanel(props: PanelProps) {
  return <Panel {...props} />
}

function ResizableHandle({ withHandle, className, ...props }: SeparatorProps & { withHandle?: boolean }) {
  return (
    <Separator
      className={cn(
        'group relative flex shrink-0 touch-none select-none items-center justify-center transition-colors',
        'aria-[orientation=horizontal]:h-3 aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:cursor-row-resize',
        'aria-[orientation=vertical]:h-full aria-[orientation=vertical]:w-3 aria-[orientation=vertical]:cursor-col-resize',
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          'pointer-events-none absolute bg-border/80 group-hover:bg-ring/70',
          'group-aria-[orientation=horizontal]:inset-x-0 group-aria-[orientation=horizontal]:top-1/2 group-aria-[orientation=horizontal]:h-px group-aria-[orientation=horizontal]:-translate-y-1/2',
          'group-aria-[orientation=vertical]:inset-y-0 group-aria-[orientation=vertical]:left-1/2 group-aria-[orientation=vertical]:w-px group-aria-[orientation=vertical]:-translate-x-1/2',
        )}
      />
      {withHandle ? (
        <div className="z-10 flex size-5 items-center justify-center rounded-sm border border-border bg-card text-muted-foreground shadow-sm">
          <GripHorizontal className="size-3.5" />
        </div>
      ) : null}
    </Separator>
  )
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
export type { GroupImperativeHandle }
