'use client'

import { Fragment, useEffect, useMemo, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

type JsonNode = null | string | number | boolean | JsonNode[] | { [key: string]: JsonNode }

function normalizeJsonNode(input: unknown, seen: WeakSet<object>): JsonNode {
  if (input === null) return null

  const inputType = typeof input
  if (inputType === 'string' || inputType === 'number' || inputType === 'boolean') {
    return input as string | number | boolean
  }
  if (inputType === 'bigint') return `${String(input)}n`
  if (inputType === 'undefined') return '[undefined]'
  if (inputType === 'symbol') return String(input)
  if (inputType === 'function') return '[function]'

  if (inputType !== 'object') return String(input)

  const value = input as object
  if (seen.has(value)) return '[circular]'
  seen.add(value)

  if (value instanceof Date) return value.toISOString()
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack ?? '',
    }
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeJsonNode(item, seen))
  }

  const record: { [key: string]: JsonNode } = {}
  for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
    record[key] = normalizeJsonNode(nested, seen)
  }
  return record
}

function isContainer(node: JsonNode): node is JsonNode[] | { [key: string]: JsonNode } {
  return Array.isArray(node) || (!!node && typeof node === 'object')
}

function formatPrimitive(node: Exclude<JsonNode, JsonNode[] | { [key: string]: JsonNode }>) {
  if (node === null) return { text: 'null', tone: 'text-slate-500 dark:text-slate-400' }
  if (typeof node === 'string') return { text: JSON.stringify(node), tone: 'text-emerald-700 dark:text-emerald-400' }
  if (typeof node === 'number') return { text: String(node), tone: 'text-sky-700 dark:text-sky-400' }
  if (typeof node === 'boolean') return { text: String(node), tone: 'text-violet-700 dark:text-violet-400' }
  return { text: String(node), tone: 'text-foreground' }
}

export function JsonTreeView({ value }: { value: unknown }) {
  const [collapsedMap, setCollapsedMap] = useState<Record<string, boolean>>({})

  const normalizedValue = useMemo(() => normalizeJsonNode(value, new WeakSet<object>()), [value])

  useEffect(() => {
    setCollapsedMap({})
  }, [normalizedValue])

  const toggle = (path: string) => {
    setCollapsedMap((current) => ({
      ...current,
      [path]: !current[path],
    }))
  }

  const renderNode = (
    node: JsonNode,
    path: string,
    depth: number,
    options?: {
      label?: string
      isLast?: boolean
    },
  ) => {
    const indent = depth * 16
    const isLast = options?.isLast ?? true
    const label = options?.label
    const comma = isLast ? '' : ','
    const rowKey = `${path}:${label ?? 'root'}`
    const keyPrefix = label ? (
      <>
        <span className="text-amber-700 dark:text-amber-300">&quot;{label}&quot;</span>
        <span className="text-muted-foreground">: </span>
      </>
    ) : null

    if (!isContainer(node)) {
      const primitive = formatPrimitive(node)
      return (
        <div key={rowKey} className="font-mono text-xs leading-6 md:text-sm" style={{ paddingLeft: `${indent}px` }}>
          {keyPrefix}
          <span className={primitive.tone}>{primitive.text}</span>
          <span className="text-muted-foreground">{comma}</span>
        </div>
      )
    }

    const children = Array.isArray(node)
      ? node.map((child) => ({ label: undefined, child }))
      : Object.entries(node).map(([key, child]) => ({ label: key, child }))
    const collapsed = collapsedMap[path] ?? false
    const openToken = Array.isArray(node) ? '[' : '{'
    const closeToken = Array.isArray(node) ? ']' : '}'
    const countLabel = Array.isArray(node) ? `${children.length} items` : `${children.length} keys`

    if (children.length === 0) {
      return (
        <div key={rowKey} className="font-mono text-xs leading-6 md:text-sm" style={{ paddingLeft: `${indent}px` }}>
          {keyPrefix}
          <span className="text-foreground">
            {openToken}
            {closeToken}
          </span>
          <span className="text-muted-foreground">{comma}</span>
        </div>
      )
    }

    return (
      <Fragment key={rowKey}>
        <div className="flex items-center gap-1 font-mono text-xs leading-6 md:text-sm" style={{ paddingLeft: `${indent}px` }}>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => toggle(path)}
            className="size-4"
            aria-label={collapsed ? 'Expand node' : 'Collapse node'}
          >
            {collapsed ? <Plus className="size-3" /> : <Minus className="size-3" />}
          </Button>

          {keyPrefix}
          <span className="text-foreground">{openToken}</span>
          {collapsed ? (
            <>
              <span className="text-muted-foreground">{` /* ${countLabel} */ ${closeToken}`}</span>
              <span className="text-muted-foreground">{comma}</span>
            </>
          ) : null}
        </div>

        {!collapsed
          ? (
              <>
                {children.map(({ label: childLabel, child }, index, list) =>
                  renderNode(child, `${path}.${index}`, depth + 1, {
                    label: childLabel,
                    isLast: index === list.length - 1,
                  }),
                )}
                <div className="font-mono text-xs leading-6 md:text-sm" style={{ paddingLeft: `${indent}px` }}>
                  <span className="text-foreground">{closeToken}</span>
                  <span className="text-muted-foreground">{comma}</span>
                </div>
              </>
            )
          : null}
      </Fragment>
    )
  }

  return (
    <div className="rounded-lg border border-border/60 bg-background/80 p-2.5">
      <div className="flex flex-col gap-0.5 pb-1">{renderNode(normalizedValue, 'root', 0)}</div>
    </div>
  )
}
