'use client'

import { Copy, CopyCheck } from 'lucide-react'
import { JsonTreeView } from '@/components/json-tree-view'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { ResultTab } from '@/lib/playground-model'
import { cn } from '@/lib/utils'

type ResultPaneProps = {
  activeTab: ResultTab
  onTabChange: (tab: ResultTab) => void
  payload: unknown
  onCopy: () => void
  copyState: 'idle' | 'copied' | 'failed'
  hasError: boolean
}

export function ResultPane(props: ResultPaneProps) {
  const copyLabel = props.copyState === 'copied' ? 'Copied' : 'Copy JSON'

  return (
    <Card className="h-full min-h-0 overflow-hidden">
      <CardHeader className="flex-row items-center justify-between gap-2 py-2.5">
        <Tabs value={props.activeTab} onValueChange={(value) => props.onTabChange(value as ResultTab)} className="gap-0">
          <TabsList className="h-8">
            <TabsTrigger value="success" className="px-3 text-[11px] uppercase tracking-[0.08em]">
              Success
            </TabsTrigger>
            <TabsTrigger
              value="error"
              className={cn(
                'px-3 text-[11px] uppercase tracking-[0.08em]',
                props.hasError && 'text-destructive data-[state=active]:bg-destructive/10 data-[state=active]:text-destructive',
              )}
            >
              Error
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Button type="button" variant="outline" size="sm" onClick={props.onCopy} className="gap-1.5">
          {props.copyState === 'copied' ? <CopyCheck className="size-3.5" /> : <Copy className="size-3.5" />}
          {copyLabel}
        </Button>
      </CardHeader>

      <CardContent className="min-h-0 flex-1 p-0">
        <div className="h-full min-h-0 overflow-auto bg-background/60 px-4 py-3">
          <JsonTreeView value={props.payload ?? { message: 'No payload available.' }} />
          {props.copyState === 'failed' ? (
            <p className="mt-3 text-xs font-medium text-destructive">Failed to copy JSON.</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
