'use client'

import { isValidElement, useEffect, useMemo, useRef, useState } from 'react'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { HeadingValidationState } from '@/lib/playground-model'
import { slugify } from '@/lib/playground-model'
import { stripFrontmatter } from '@/lib/markdown-utils'

type PreviewPaneProps = {
  markdown: string
  structureMode: boolean
  isDark: boolean
  headingStates: HeadingValidationState[]
  activeLine?: number
  onJumpToLine: (line: number) => void
  onScroll?: (event: React.UIEvent<HTMLDivElement>) => void
  containerRef?: React.RefObject<HTMLDivElement | null>
}

function MermaidBlock({ code, isDark }: { code: string; isDark: boolean }) {
  const [svg, setSvg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const diagramIdRef = useRef(`mermaid-${Math.random().toString(36).slice(2, 10)}`)

  useEffect(() => {
    let cancelled = false

    const render = async () => {
      try {
        const mermaid = (await import('mermaid')).default
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: isDark ? 'dark' : 'default',
        })

        const { svg: renderedSvg } = await mermaid.render(diagramIdRef.current, code)
        if (!cancelled) {
          setSvg(renderedSvg)
          setError(null)
        }
      } catch (renderError) {
        if (!cancelled) {
          setSvg(null)
          setError(renderError instanceof Error ? renderError.message : 'Mermaid rendering failed.')
        }
      }
    }

    void render()

    return () => {
      cancelled = true
    }
  }, [code, isDark])

  if (error) {
    return (
      <div className="my-4 rounded-lg border border-rose-500/40 bg-rose-500/8 p-3">
        <p className="text-xs font-semibold text-rose-400">Mermaid render error</p>
        <p className="mt-1 text-xs text-muted-foreground">{error}</p>
        <pre className="mt-2 overflow-auto rounded bg-muted p-2 text-xs text-foreground">{code}</pre>
      </div>
    )
  }

  if (!svg) {
    return (
      <div className="my-4 rounded-lg border border-border bg-muted p-3 text-xs text-muted-foreground">
        Rendering Mermaid diagram...
      </div>
    )
  }

  return (
    <div
      className="my-4 overflow-auto rounded-lg border border-border bg-muted p-3"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

const badgeTone = (errors: number, warnings: number) => {
  if (errors > 0) return 'danger'
  if (warnings > 0) return 'warning'
  return 'success'
}

export function PreviewPane(props: PreviewPaneProps) {
  const markdownPreview = useMemo(() => stripFrontmatter(props.markdown), [props.markdown])
  const stateByLine = useMemo(() => {
    const map = new Map<number, HeadingValidationState>()
    for (const state of props.headingStates) map.set(state.heading.line, state)
    return map
  }, [props.headingStates])

  return (
    <Card className="h-full min-h-0 overflow-hidden">
      <CardHeader>
        <CardTitle className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Preview</CardTitle>
      </CardHeader>

      <CardContent className="min-h-0 flex-1 p-0">
        <div
          ref={props.containerRef}
          onScroll={props.onScroll}
          className="h-full min-h-0 overflow-auto bg-muted/25 px-5 py-4"
        >
          <div className="play-preview-root">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeRaw, rehypeKatex]}
              components={{
                pre: ({ children, ...preProps }: any) => {
                  const child = Array.isArray(children) ? children[0] : children
                  if (isValidElement<{ className?: string; children?: unknown }>(child)) {
                    const className = child.props.className ?? ''
                    if (className.includes('language-mermaid')) {
                      const source = Array.isArray(child.props.children)
                        ? child.props.children.join('')
                        : String(child.props.children ?? '')
                      return <MermaidBlock code={source.replace(/\n$/, '')} isDark={props.isDark} />
                    }
                  }
                  return <pre {...preProps}>{children}</pre>
                },
                h1: ({ children, node, ...headingProps }: any) => {
                  const line = node?.position?.start?.line as number | undefined
                  const state = line ? stateByLine.get(line) : undefined
                  const errors = state ? state.issues.filter((issue) => issue.severity === 'error').length : 0
                  const warnings = state ? state.issues.filter((issue) => issue.severity === 'warning').length : 0
                  const text = String(children)
                  return (
                    <h1 id={line ? `${slugify(text)}-${line}` : undefined} {...headingProps}>
                      <button type="button" onClick={() => (line ? props.onJumpToLine(line) : undefined)} className="play-heading-button">
                        {children}
                      </button>
                      {props.structureMode && line ? (
                        <Badge variant={badgeTone(errors, warnings)} className="ml-2 align-middle">
                          {errors > 0 ? `${errors} error` : warnings > 0 ? `${warnings} warning` : 'valid'}
                        </Badge>
                      ) : null}
                    </h1>
                  )
                },
                h2: ({ children, node, ...headingProps }: any) => {
                  const line = node?.position?.start?.line as number | undefined
                  const state = line ? stateByLine.get(line) : undefined
                  const errors = state ? state.issues.filter((issue) => issue.severity === 'error').length : 0
                  const warnings = state ? state.issues.filter((issue) => issue.severity === 'warning').length : 0
                  const text = String(children)
                  const isActive = !!line && !!props.activeLine && line === props.activeLine
                  return (
                    <h2 id={line ? `${slugify(text)}-${line}` : undefined} {...headingProps} className={isActive ? 'play-heading-active' : undefined}>
                      <button type="button" onClick={() => (line ? props.onJumpToLine(line) : undefined)} className="play-heading-button">
                        {children}
                      </button>
                      {props.structureMode && line ? (
                        <Badge variant={badgeTone(errors, warnings)} className="ml-2 align-middle">
                          {errors > 0 ? `${errors} error` : warnings > 0 ? `${warnings} warning` : 'valid'}
                        </Badge>
                      ) : null}
                    </h2>
                  )
                },
                h3: ({ children, node, ...headingProps }: any) => {
                  const line = node?.position?.start?.line as number | undefined
                  const state = line ? stateByLine.get(line) : undefined
                  const errors = state ? state.issues.filter((issue) => issue.severity === 'error').length : 0
                  const warnings = state ? state.issues.filter((issue) => issue.severity === 'warning').length : 0
                  const text = String(children)
                  const isActive = !!line && !!props.activeLine && line === props.activeLine
                  return (
                    <h3 id={line ? `${slugify(text)}-${line}` : undefined} {...headingProps} className={isActive ? 'play-heading-active' : undefined}>
                      <button type="button" onClick={() => (line ? props.onJumpToLine(line) : undefined)} className="play-heading-button">
                        {children}
                      </button>
                      {props.structureMode && line ? (
                        <Badge variant={badgeTone(errors, warnings)} className="ml-2 align-middle">
                          {errors > 0 ? `${errors} error` : warnings > 0 ? `${warnings} warning` : 'valid'}
                        </Badge>
                      ) : null}
                    </h3>
                  )
                },
              }}
            >
              {markdownPreview}
            </ReactMarkdown>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
