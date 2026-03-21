'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type UIEvent } from 'react'
import { EditorPane } from '@/components/playground/editor-pane'
import { PreviewPane } from '@/components/playground/preview-pane'
import { ResultPane } from '@/components/playground/result-pane'
import { SchemaPane } from '@/components/playground/schema-pane'
import { TopToolbar } from '@/components/playground/top-toolbar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  type GroupImperativeHandle,
} from '@/components/ui/resizable'
import type { TypeMdIssue, TypeMdIssueCode } from '@/lib/mdshape'
import { md } from '@/lib/mdshape'
import {
  buildValidationView,
  getDocumentStorageKey,
  getPrefsStorageKey,
  mapIssuesToHeadings,
  parseHeadingNodes,
  type ExecutionOutput,
  type PlaygroundResult,
  type ResultTab,
  type ThemeMode,
} from '@/lib/playground-model'
import { inferDocumentTitle, isLikelyUrl } from '@/lib/markdown-utils'
import { MONACO_MDSHAPE_ALIAS_DTS, MONACO_MDSHAPE_PACKAGE_DTS } from '@/lib/monaco-mdshape-dts'

const DEFAULT_MARKDOWN = `---
title: mdshape
version: 1
---

# What is mdshape?

## Overview

- Name: mdshape
- Category: Schema Validation
- License: MIT

## Description

**mdshape** is a TypeScript library that lets you define schemas for Markdown documents. Think of it as **Zod or Yup for Markdown** — it parses and validates the structure of your \`.md\` files, extracting typed data you can trust.

## Use Cases

### RAG Pipelines

**SUMMARY:** Validate Markdown before feeding it into your retrieval-augmented generation pipeline. Catch structural errors early and ensure consistent document formats.

### PDF-to-Markdown

**SUMMARY:** After converting PDFs to Markdown, use mdshape to verify the output matches your expected structure — headings, sections, metadata, and fields.

### Documentation Standards

**SUMMARY:** Enforce consistent structure across your docs: required sections, valid metadata, and properly formatted content.
`

const DEFAULT_SCHEMA = `import { md } from '@markschema/mdshape'

const useCaseSchema = md.object({
  title: md.headingText(),
  summary: md.match.label('SUMMARY').value(md.string().min(20)),
})

const schema = md.document({
  metadata: md.metadataObject(
    md.object({
      title: md.string().min(1),
      version: md.coerce.number().pipeline(md.number().int().min(1)),
    })
  ),
  title: md.heading(1),
  overview: md.section('Overview').fields({
    Name: md.string().min(1),
    Category: md.string(),
    License: md.enum(['MIT', 'Apache-2.0', 'GPL-3.0']),
  }),
  description: md.section('Description').paragraph(),
  useCases: md
    .section('Use Cases')
    .subsections(3)
    .each(useCaseSchema)
    .min(2),
})`

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))
const inferTitleFromFileName = (fileName: string) => fileName.replace(/\.(md|markdown|mdx)$/i, '').trim()
const MOBILE_MEDIA_QUERY = '(max-width: 767px)'
const SUPPORT_EMAIL = 'daniel@refiski.com'
const DOCS_URL = 'https://docs.markschema.com'
const GITHUB_URL = 'https://github.com/markschema/markschema'
const ISSUES_URL = 'https://github.com/markschema/markschema/issues'

type PlaygroundUrlSeed = {
  title?: string
  markdown?: string
  schemaCode?: string
  rightPaneView?: 'preview' | 'schema'
  autoValidate?: boolean
}

const parseBooleanQueryValue = (value: string | null): boolean | undefined => {
  if (!value) return undefined
  if (value === '1' || value.toLowerCase() === 'true') return true
  if (value === '0' || value.toLowerCase() === 'false') return false
  return undefined
}

const decodeBase64UrlUtf8 = (input: string): string | undefined => {
  try {
    const normalized = input.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4)
    const binary = atob(padded)
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0))
    return new TextDecoder().decode(bytes)
  } catch {
    return undefined
  }
}

const readPlaygroundUrlSeed = (search: string): PlaygroundUrlSeed | null => {
  const params = new URLSearchParams(search)
  const markdown = params.get('markdown') ?? decodeBase64UrlUtf8(params.get('markdown64') ?? '')
  const schemaCode = params.get('schema') ?? decodeBase64UrlUtf8(params.get('schema64') ?? '')
  const title = params.get('title') ?? undefined
  const viewParam = params.get('view')
  const rightPaneView = viewParam === 'preview' || viewParam === 'schema' ? viewParam : undefined
  const autoValidate = parseBooleanQueryValue(params.get('autoValidate'))

  if (!markdown && !schemaCode && !title && !rightPaneView && autoValidate === undefined) {
    return null
  }

  return {
    title: title?.trim() ? title.trim() : undefined,
    markdown: markdown ?? undefined,
    schemaCode: schemaCode ?? undefined,
    rightPaneView,
    autoValidate,
  }
}

function normalizeParseResult(rawResult: unknown, markdown: string): PlaygroundResult {
  if (!rawResult || typeof rawResult !== 'object' || typeof (rawResult as any).success !== 'boolean') {
    return {
      success: false,
      error: {
        issues: [
          {
            code: 'transform_failed' as TypeMdIssueCode,
            message: 'Schema execution must return a safeParse-like object with a boolean success field.',
            path: [],
          },
        ],
      },
    }
  }

  const parseResult = rawResult as {
    success: boolean
    data?: unknown
    error?: {
      issues?: TypeMdIssue[]
      format?: (source: string) => unknown
    }
  }

  if (parseResult.success) {
    return {
      success: true,
      data: parseResult.data,
    }
  }

  return {
    success: false,
    error: {
      issues: parseResult.error?.issues ?? [
        {
          code: 'transform_failed',
          message: 'safeParse returned success=false without issues.',
          path: [],
        },
      ],
      formatted:
        parseResult.error && typeof parseResult.error.format === 'function'
          ? parseResult.error.format(markdown)
          : undefined,
    },
  }
}

function runSchemaFromEditor(schemaCode: string, markdown: string): ExecutionOutput {
  const sanitizedCode = schemaCode
    .replace(/^\s*import\s+[\s\S]*?from\s+['"][^'"]+['"]\s*;?\s*$/gm, '')
    .replace(/^\s*export\s+default\s+/gm, '')
    .replace(/^\s*export\s+(const|let|var|function|class)\s+/gm, '$1 ')

  const evaluator = new Function(
    'md',
    'markdown',
    `
${sanitizedCode}
let __schema
if (typeof schema !== 'undefined') __schema = schema
if (!__schema && typeof createSchema === 'function') __schema = createSchema(md)
if (!__schema && typeof buildSchema === 'function') __schema = buildSchema(md)

if (!__schema || typeof __schema.safeParse !== 'function') {
  throw new Error('Define \\\`const schema = ...\\\` (or createSchema/buildSchema) returning a mdshape schema with safeParse(markdown).')
}

return {
  schema: __schema,
  parseResult: __schema.safeParse(markdown),
}
`,
  )

  return evaluator(md, markdown) as ExecutionOutput
}

export function PlaygroundClient() {
  const [theme, setTheme] = useState<ThemeMode>('dark')
  const [isMobile, setIsMobile] = useState(false)
  const [rightPaneView, setRightPaneView] = useState<'preview' | 'schema'>('preview')
  const [splitRatio, setSplitRatio] = useState(62)
  const [mobileStackRatio, setMobileStackRatio] = useState(56)
  const [resultPaneSize, setResultPaneSize] = useState(36)
  const [prefsLoaded, setPrefsLoaded] = useState(false)
  const [resultTab, setResultTab] = useState<ResultTab>('success')
  const [title, setTitle] = useState('')
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN)
  const [schemaCode, setSchemaCode] = useState(DEFAULT_SCHEMA)
  const [autoValidate, setAutoValidate] = useState(true)
  const [wordWrap, setWordWrap] = useState(true)
  const [scrollSync, setScrollSync] = useState(true)
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const [selectedText, setSelectedText] = useState('')
  const [result, setResult] = useState<PlaygroundResult | null>(null)
  const [activeLine, setActiveLine] = useState<number | undefined>(undefined)

  const markdownEditorRef = useRef<any>(null)
  const schemaEditorRef = useRef<any>(null)
  const monacoRef = useRef<any>(null)
  const previewContainerRef = useRef<HTMLDivElement | null>(null)
  const markdownDecorationsRef = useRef<string[]>([])
  const pendingPasteSelectionRef = useRef<any>(null)
  const horizontalGroupRef = useRef<GroupImperativeHandle | null>(null)
  const verticalGroupRef = useRef<GroupImperativeHandle | null>(null)
  const layoutModeRef = useRef<'desktop' | 'mobile' | null>(null)
  const mdshapeTypesDisposableRef = useRef<{ dispose: () => void } | null>(null)
  const scrollSyncEnabledRef = useRef(scrollSync)
  const syncingFromEditorRef = useRef(false)
  const syncingFromPreviewRef = useRef(false)
  const seededFromUrlRef = useRef(false)
  const supportDialogRef = useRef<HTMLDialogElement | null>(null)

  const docKey = useMemo(() => getDocumentStorageKey(title), [title])
  const editorThemeName = theme === 'dark' ? 'mdshape-linear-dark' : 'mdshape-linear-light'

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setTheme(prefersDark ? 'dark' : 'light')
  }, [])

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY)
    const syncMobileState = (event?: MediaQueryListEvent) => {
      setIsMobile(event?.matches ?? mediaQuery.matches)
    }

    syncMobileState()
    mediaQuery.addEventListener('change', syncMobileState)
    return () => mediaQuery.removeEventListener('change', syncMobileState)
  }, [])

  useEffect(() => {
    document.body.dataset.playgroundTheme = theme
    document.documentElement.dataset.playgroundTheme = theme
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    scrollSyncEnabledRef.current = scrollSync
  }, [scrollSync])

  useEffect(() => {
    const monaco = monacoRef.current
    if (!monaco) return
    monaco.editor.setTheme(theme === 'dark' ? 'mdshape-linear-dark' : 'mdshape-linear-light')
  }, [theme])

  useEffect(() => {
    const seed = readPlaygroundUrlSeed(window.location.search)
    if (!seed) return

    seededFromUrlRef.current = true
    if (seed.title !== undefined) setTitle(seed.title)
    if (seed.markdown !== undefined) setMarkdown(seed.markdown)
    if (seed.schemaCode !== undefined) setSchemaCode(seed.schemaCode)
    if (seed.rightPaneView !== undefined) setRightPaneView(seed.rightPaneView)
    if (seed.autoValidate !== undefined) setAutoValidate(seed.autoValidate)
  }, [])

  useEffect(() => {
    const rawPrefs = localStorage.getItem(getPrefsStorageKey())
    if (!rawPrefs) {
      setPrefsLoaded(true)
      return
    }

    try {
      const parsed = JSON.parse(rawPrefs)
      if (typeof parsed.theme === 'string') setTheme(parsed.theme)
      if (parsed.rightPaneView === 'preview' || parsed.rightPaneView === 'schema') setRightPaneView(parsed.rightPaneView)
      if (typeof parsed.splitRatio === 'number' && Number.isFinite(parsed.splitRatio)) {
        const ratio = parsed.splitRatio <= 1 ? parsed.splitRatio * 100 : parsed.splitRatio
        setSplitRatio(clamp(ratio, 28, 72))
      }
      if (typeof parsed.mobileStackRatio === 'number' && Number.isFinite(parsed.mobileStackRatio)) {
        setMobileStackRatio(clamp(parsed.mobileStackRatio, 42, 72))
      }
      if (typeof parsed.resultPaneSize === 'number' && Number.isFinite(parsed.resultPaneSize)) {
        setResultPaneSize(clamp(parsed.resultPaneSize, 0, 100))
      } else if (typeof parsed.resultPaneHeight === 'number' && Number.isFinite(parsed.resultPaneHeight)) {
        const estimatedSize = (parsed.resultPaneHeight / 900) * 100
        setResultPaneSize(clamp(estimatedSize, 0, 100))
      }
      if (typeof parsed.wordWrap === 'boolean') setWordWrap(parsed.wordWrap)
      if (typeof parsed.autoValidate === 'boolean') setAutoValidate(parsed.autoValidate)
    } catch {
      // keep defaults
    } finally {
      setPrefsLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (!prefsLoaded) return
    localStorage.setItem(
      getPrefsStorageKey(),
      JSON.stringify({
        theme,
        rightPaneView,
        splitRatio,
        mobileStackRatio,
        resultPaneSize,
        wordWrap,
        autoValidate,
        scrollSync,
      }),
    )
  }, [prefsLoaded, theme, rightPaneView, splitRatio, mobileStackRatio, resultPaneSize, wordWrap, autoValidate, scrollSync])

  useEffect(() => {
    if (!prefsLoaded) return
    const mode = isMobile ? 'mobile' : 'desktop'
    if (layoutModeRef.current === mode) return
    const nextResultPaneSize = mode === 'mobile' ? clamp(resultPaneSize, 24, 42) : clamp(resultPaneSize, 18, 62)

    if (nextResultPaneSize !== resultPaneSize) {
      setResultPaneSize(nextResultPaneSize)
    }

    horizontalGroupRef.current?.setLayout({
      editor: mode === 'mobile' ? mobileStackRatio : splitRatio,
      secondary: mode === 'mobile' ? 100 - mobileStackRatio : 100 - splitRatio,
    })
    verticalGroupRef.current?.setLayout({
      workspace: 100 - nextResultPaneSize,
      results: nextResultPaneSize,
    })
    layoutModeRef.current = mode
  }, [prefsLoaded, isMobile, splitRatio, mobileStackRatio, resultPaneSize])

  useEffect(() => {
    if (!monacoRef.current) return
    const raf = window.requestAnimationFrame(() => {
      markdownEditorRef.current?.layout()
      schemaEditorRef.current?.layout()
    })

    return () => window.cancelAnimationFrame(raf)
  }, [rightPaneView])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      localStorage.setItem(
        docKey,
        JSON.stringify({
          title,
          markdown,
          schemaCode,
          updatedAt: Date.now(),
        }),
      )
    }, 280)

    return () => window.clearTimeout(timer)
  }, [docKey, markdown, schemaCode, title])

  useEffect(() => {
    if (seededFromUrlRef.current) return
    const draft = localStorage.getItem(docKey)
    if (!draft) return

    try {
      const parsed = JSON.parse(draft)
      if (typeof parsed.title === 'string') setTitle(parsed.title)
      if (typeof parsed.markdown === 'string') setMarkdown(parsed.markdown)
      if (typeof parsed.schemaCode === 'string') setSchemaCode(parsed.schemaCode)
    } catch {
      // ignore invalid draft
    }
  }, [docKey])

  const run = () => {
    try {
      const execution = runSchemaFromEditor(schemaCode, markdown)
      const normalized = normalizeParseResult(execution.parseResult, markdown)
      setResult(normalized)
      setResultTab(normalized.success ? 'success' : 'error')
      setCopyState('idle')
    } catch (error) {
      const failure: PlaygroundResult = {
        success: false,
        error: {
          issues: [
            {
              code: 'transform_failed',
              message: error instanceof Error ? error.message : 'Unknown runtime error while executing schema code.',
              path: [],
            },
          ],
        },
      }
      setResult(failure)
      setResultTab('error')
      setCopyState('idle')
    }
  }

  useEffect(() => {
    if (!autoValidate) return
    const timer = window.setTimeout(() => run(), 260)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markdown, schemaCode, autoValidate])

  useEffect(() => {
    if (!result || !markdownEditorRef.current || !monacoRef.current) return

    const editor = markdownEditorRef.current
    const model = editor.getModel()
    if (!model) return

    if (result.success || !result.error) {
      markdownDecorationsRef.current = editor.deltaDecorations(markdownDecorationsRef.current, [])
      return
    }

    const severityIssues = buildValidationView(result.error.issues)
    const decorations = severityIssues
      .filter((issue) => issue.line !== undefined)
      .map((issue) => {
        const line = Math.max(1, Math.min(issue.line ?? 1, model.getLineCount()))
        const maxColumn = model.getLineMaxColumn(line)
        const isWarning = issue.severity === 'warning'
        const isInfo = issue.severity === 'info'

        return {
          range: new monacoRef.current.Range(line, 1, line, maxColumn),
          options: {
            isWholeLine: true,
            className: isWarning
              ? 'play-editor-line-warning'
              : isInfo
                ? 'play-editor-line-info'
                : 'play-editor-line-error',
            glyphMarginClassName: isWarning
              ? 'play-editor-glyph-warning'
              : isInfo
                ? 'play-editor-glyph-info'
                : 'play-editor-glyph-error',
            glyphMarginHoverMessage: [{ value: `${issue.code}: ${issue.message}` }],
          },
        }
      })

    markdownDecorationsRef.current = editor.deltaDecorations(markdownDecorationsRef.current, decorations)
  }, [result])

  const headingNodes = useMemo(() => parseHeadingNodes(markdown), [markdown])
  const validationView = useMemo(() => buildValidationView(result?.error?.issues ?? []), [result])
  const headingStates = useMemo(
    () => mapIssuesToHeadings(headingNodes, validationView),
    [headingNodes, validationView],
  )

  const jsonPayload = useMemo(() => {
    if (!result) {
      return { message: 'Run schema to inspect JSON output.' }
    }

    if (resultTab === 'success') {
      return result.success ? result.data : { message: 'No success payload for this run.' }
    }

    if (resultTab === 'error') {
      return result.success ? { message: 'No error payload for this run.' } : result.error
    }
    return result
  }, [result, resultTab])

  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(jsonPayload, null, 2))
      setCopyState('copied')
      window.setTimeout(() => setCopyState('idle'), 1100)
    } catch {
      setCopyState('failed')
    }
  }

  const jumpToLine = (line?: number) => {
    if (!line || !markdownEditorRef.current) return
    const editor = markdownEditorRef.current
    const model = editor.getModel()
    if (!model) return
    const safeLine = Math.max(1, Math.min(line, model.getLineCount()))
    editor.revealLineInCenter(safeLine)
    editor.setPosition({ lineNumber: safeLine, column: 1 })
    editor.focus()
    setActiveLine(safeLine)
  }

  const withEditorSelection = (handler: (editor: any, model: any, selection: any) => void) => {
    const editor = markdownEditorRef.current
    if (!editor) return
    const model = editor.getModel()
    const selection = editor.getSelection()
    if (!model || !selection) return
    handler(editor, model, selection)
    editor.focus()
  }

  const replaceSelection = (text: string) => {
    withEditorSelection((editor, _model, selection) => {
      editor.executeEdits('markdown-shortcut', [{ range: selection, text, forceMoveMarkers: true }])
    })
  }

  const wrapSelection = (prefix: string, suffix = prefix, placeholder = 'text') => {
    withEditorSelection((editor, model, selection) => {
      const selected = model.getValueInRange(selection)
      const content = selected || placeholder
      editor.executeEdits('markdown-shortcut', [{ range: selection, text: `${prefix}${content}${suffix}`, forceMoveMarkers: true }])
    })
  }

  const prefixLines = (prefixFactory: (line: string, index: number) => string) => {
    withEditorSelection((editor, model, selection) => {
      const startLine = selection.startLineNumber
      const endLine = selection.endLineNumber
      const lines: string[] = []
      for (let line = startLine; line <= endLine; line += 1) {
        lines.push(model.getLineContent(line))
      }

      const replaced = lines.map((line, index) => prefixFactory(line, index)).join('\n')

      editor.executeEdits('markdown-shortcut', [
        {
          range: {
            startLineNumber: startLine,
            startColumn: 1,
            endLineNumber: endLine,
            endColumn: model.getLineMaxColumn(endLine),
          },
          text: replaced,
          forceMoveMarkers: true,
        },
      ])
    })
  }

  const insertBlock = (block: string) => {
    withEditorSelection((editor, _model, selection) => {
      editor.executeEdits('markdown-shortcut', [{ range: selection, text: block, forceMoveMarkers: true }])
    })
  }

  const applyShortcut = (id: string) => {
    switch (id) {
      case 'bold':
        wrapSelection('**')
        return
      case 'italic':
        wrapSelection('*')
        return
      case 'inlineCode':
        wrapSelection('`')
        return
      case 'link':
        replaceSelection('[link text](https://example.com)')
        return
      case 'h2':
        prefixLines((line) => `## ${line.replace(/^#{1,6}\s+/, '')}`)
        return
      case 'ul':
        prefixLines((line) => `- ${line.replace(/^([-*+]\s+|\d+\.\s+|\[[ xX]\]\s+)/, '')}`)
        return
      case 'quote':
        prefixLines((line) => `> ${line.replace(/^>\s+/, '')}`)
        return
      case 'task':
        prefixLines((line) => `- [ ] ${line.replace(/^([-*+]\s+|\d+\.\s+|\[[ xX]\]\s+)/, '')}`)
        return
      case 'codeBlock':
        insertBlock('```ts\nconst value = 1\n```')
        return
      case 'table':
        insertBlock('| Column | Value |\n| --- | --- |\n| A | 1 |\n')
        return
      case 'mermaid':
        insertBlock('```mermaid\nflowchart TD\n  A[Start] --> B[Review]\n  B --> C[Approve]\n```')
        return
      default:
        return
    }
  }

  const makeSmartEnterEdit = (editor: any) => {
    const model = editor.getModel()
    const selection = editor.getSelection()
    if (!model || !selection || !selection.isEmpty()) return false

    const lineNumber = selection.startLineNumber
    const lineContent = model.getLineContent(lineNumber)
    const trimmed = lineContent.trim()

    if (/^```/.test(trimmed)) {
      const indent = /^(\s*)/.exec(lineContent)?.[1] ?? ''
      const insert = `\n${indent}\n${indent}\`\`\``
      editor.executeEdits('smart-enter', [{ range: selection, text: insert, forceMoveMarkers: true }])
      editor.setPosition({ lineNumber: lineNumber + 1, column: indent.length + 1 })
      return true
    }

    const taskMatch = /^(\s*[-*+]\s+\[[ xX]\]\s+)(.*)$/.exec(lineContent)
    if (taskMatch) {
      const prefix = taskMatch[1] ?? ''
      const content = (taskMatch[2] ?? '').trim()
      const insert = content ? `\n${prefix}` : '\n'
      editor.executeEdits('smart-enter', [{ range: selection, text: insert, forceMoveMarkers: true }])
      return true
    }

    const bulletMatch = /^(\s*[-*+]\s+)(.*)$/.exec(lineContent)
    if (bulletMatch) {
      const prefix = bulletMatch[1] ?? ''
      const content = (bulletMatch[2] ?? '').trim()
      const insert = content ? `\n${prefix}` : '\n'
      editor.executeEdits('smart-enter', [{ range: selection, text: insert, forceMoveMarkers: true }])
      return true
    }

    const orderedMatch = /^(\s*)(\d+)\.\s+(.*)$/.exec(lineContent)
    if (orderedMatch) {
      const indent = orderedMatch[1] ?? ''
      const index = Number(orderedMatch[2] ?? '0')
      const content = (orderedMatch[3] ?? '').trim()
      const insert = content ? `\n${indent}${index + 1}. ` : '\n'
      editor.executeEdits('smart-enter', [{ range: selection, text: insert, forceMoveMarkers: true }])
      return true
    }

    return false
  }

  const beforeMonacoMount = (monaco: any) => {
    monacoRef.current = monaco

    const tsDefaults = monaco.languages.typescript.typescriptDefaults
    tsDefaults.setCompilerOptions({
      allowNonTsExtensions: true,
      allowJs: true,
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      noEmit: true,
      strict: false,
    })

    if (!mdshapeTypesDisposableRef.current) {
      const packageLib = tsDefaults.addExtraLib(
        MONACO_MDSHAPE_PACKAGE_DTS,
        'file:///node_modules/@markschema/mdshape/index.d.ts',
      )
      const aliasLib = tsDefaults.addExtraLib(
        MONACO_MDSHAPE_ALIAS_DTS,
        'file:///node_modules/mdshape/index.d.ts',
      )
      mdshapeTypesDisposableRef.current = {
        dispose: () => {
          packageLib.dispose()
          aliasLib.dispose()
        },
      }
    }

    monaco.editor.defineTheme('mdshape-linear-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6B7280' },
        { token: 'keyword', foreground: 'A78BFA' },
        { token: 'string', foreground: '34D399' },
        { token: 'number', foreground: 'F59E0B' },
        { token: 'type.identifier', foreground: '60A5FA' },
      ],
      colors: {
        'editor.background': '#0B0D12',
        'editor.foreground': '#E5E7EB',
        'editor.lineHighlightBackground': '#111827',
        'editor.selectionBackground': '#1F2937',
        'editorLineNumber.foreground': '#4B5563',
        'editorLineNumber.activeForeground': '#E5E7EB',
        'editorCursor.foreground': '#A78BFA',
        'editorGutter.background': '#0B0D12',
      },
    })

    monaco.editor.defineTheme('mdshape-linear-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6B7280' },
        { token: 'keyword', foreground: '7C3AED' },
        { token: 'string', foreground: '047857' },
      ],
      colors: {
        'editor.background': '#FFFFFF',
        'editor.foreground': '#0F172A',
        'editor.lineHighlightBackground': '#F1F5F9',
        'editor.selectionBackground': '#DBEAFE',
        'editorLineNumber.foreground': '#94A3B8',
        'editorLineNumber.activeForeground': '#0F172A',
        'editorCursor.foreground': '#7C3AED',
        'editorGutter.background': '#FFFFFF',
      },
    })
  }

  const configureEditor = (editorInstance: any, monaco: any, kind: 'markdown' | 'schema') => {
    monacoRef.current = monaco
    monaco.editor.setTheme(editorThemeName)

    if (kind === 'schema') {
      schemaEditorRef.current = editorInstance
      editorInstance.updateOptions({ fontLigatures: true })
      const schemaModel = editorInstance.getModel()
      if (schemaModel && schemaCode && schemaModel.getValueLength() === 0) {
        schemaModel.setValue(schemaCode)
      }
      editorInstance.layout()
      return
    }

    markdownEditorRef.current = editorInstance
    editorInstance.updateOptions({ fontLigatures: true })
    const markdownModel = editorInstance.getModel()
    if (markdownModel && markdown && markdownModel.getValueLength() === 0) {
      markdownModel.setValue(markdown)
    }
    editorInstance.layout()

    editorInstance.onDidChangeCursorSelection((event: any) => {
      const model = editorInstance.getModel()
      if (!model) return

      const selected = model.getValueInRange(event.selection)
      setSelectedText(selected)
      setActiveLine(event.selection.startLineNumber)
    })

    editorInstance.onKeyDown((event: any) => {
      const isMetaPaste = (event.metaKey || event.ctrlKey) && event.keyCode === monaco.KeyCode.KeyV
      if (isMetaPaste) {
        pendingPasteSelectionRef.current = editorInstance.getSelection()
      }

      if (event.keyCode === monaco.KeyCode.Enter) {
        const handled = makeSmartEnterEdit(editorInstance)
        if (handled) {
          event.preventDefault()
          event.stopPropagation()
        }
      }
    })

    editorInstance.onDidPaste((event: any) => {
      const model = editorInstance.getModel()
      if (!model) return

      const pastedText = model.getValueInRange(event.range)
      const previousSelection = pendingPasteSelectionRef.current
      pendingPasteSelectionRef.current = null

      if (!previousSelection || !pastedText || !isLikelyUrl(pastedText)) {
        return
      }

      const selectedBeforePaste = model.getValueInRange(previousSelection)
      if (!selectedBeforePaste.trim()) {
        return
      }

      editorInstance.executeEdits('smart-paste-link', [
        {
          range: event.range,
          text: `[${selectedBeforePaste}](${pastedText.trim()})`,
          forceMoveMarkers: true,
        },
      ])
    })

    editorInstance.onDidScrollChange((event: any) => {
      if (!scrollSyncEnabledRef.current || !previewContainerRef.current || syncingFromPreviewRef.current) return
      const model = editorInstance.getModel()
      if (!model) return
      const layoutInfo = editorInstance.getLayoutInfo?.()
      const editorViewportHeight = layoutInfo?.height ?? 0
      const maxEditorScroll = Math.max(0, event.scrollHeight - editorViewportHeight)
      const ratio = maxEditorScroll > 0 ? event.scrollTop / maxEditorScroll : 0
      const preview = previewContainerRef.current
      const maxPreviewScroll = preview.scrollHeight - preview.clientHeight
      syncingFromEditorRef.current = true
      preview.scrollTop = ratio * Math.max(0, maxPreviewScroll)
      window.requestAnimationFrame(() => {
        syncingFromEditorRef.current = false
      })
    })
  }

  const handlePreviewScroll = useCallback((event: UIEvent<HTMLDivElement>) => {
    if (!scrollSyncEnabledRef.current || syncingFromEditorRef.current || !markdownEditorRef.current) return

    const editor = markdownEditorRef.current
    const model = editor.getModel()
    if (!model) return

    const preview = event.currentTarget
    const maxPreviewScroll = preview.scrollHeight - preview.clientHeight
    const ratio = maxPreviewScroll > 0 ? preview.scrollTop / maxPreviewScroll : 0

    const layoutInfo = editor.getLayoutInfo?.()
    const editorViewportHeight = layoutInfo?.height ?? 0
    const maxEditorScroll = Math.max(0, editor.getScrollHeight() - editorViewportHeight)

    syncingFromPreviewRef.current = true
    editor.setScrollTop(ratio * maxEditorScroll)
    window.requestAnimationFrame(() => {
      syncingFromPreviewRef.current = false
    })
  }, [])

const handleImportFile = useCallback(
    async (file: File) => {
      try {
        const content = await file.text()
        const titleFromFile = inferTitleFromFileName(file.name)

        setTitle(titleFromFile || inferDocumentTitle(content))
        setMarkdown(content)
        setResult(null)
        setCopyState('idle')
        setResultTab('success')
      } catch {
        // Mobile browsers can reject file reads in edge cases; keep UI stable.
      }
    },
    [setTitle, setMarkdown, setResult, setCopyState, setResultTab],
  )

  const topPanelSize = 100 - resultPaneSize

  return (
    <section className="flex h-full min-h-0 w-full flex-col gap-3 overflow-hidden rounded-2xl border border-border bg-card/95 p-3 shadow-[0_24px_60px_rgba(0,0,0,0.18)] backdrop-blur">
      <TopToolbar
        title={title}
        onTitleChange={setTitle}
        onImportFile={handleImportFile}
        rightPaneView={rightPaneView}
        onRightPaneViewChange={setRightPaneView}
        onRun={run}
        autoValidate={autoValidate}
        onAutoValidateChange={setAutoValidate}
        wordWrap={wordWrap}
        onWordWrapChange={setWordWrap}
        scrollSync={scrollSync}
        onScrollSyncChange={setScrollSync}
        theme={theme}
        onThemeToggle={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
      />

      <div className="min-h-0 flex-1 overflow-hidden">
        <ResizablePanelGroup
          groupRef={verticalGroupRef}
          direction="vertical"
          className="min-h-0"
          onLayoutChanged={(layout) => {
            if (typeof layout.results !== 'number') return
            setResultPaneSize(clamp(layout.results, 0, 100))
          }}
        >
          <ResizablePanel id="workspace" minSize="0%" defaultSize={`${topPanelSize}%`} className="min-h-0 min-w-0">
            <ResizablePanelGroup
              groupRef={horizontalGroupRef}
              direction={isMobile ? 'vertical' : 'horizontal'}
              className="min-h-0"
              onLayoutChanged={(layout) => {
                if (typeof layout.editor !== 'number') return
                if (isMobile) {
                  setMobileStackRatio(clamp(layout.editor, 42, 72))
                  return
                }
                setSplitRatio(clamp(layout.editor, 28, 72))
              }}
            >
              <ResizablePanel
                id="editor"
                minSize={isMobile ? '30%' : '0%'}
                defaultSize={`${isMobile ? mobileStackRatio : splitRatio}%`}
                className="min-h-0 min-w-0"
              >
                <div className={`h-full min-h-0 min-w-0 ${isMobile ? 'pb-1.5' : 'pr-1.5'}`}>
                  <EditorPane
                    markdown={markdown}
                    onChange={(value) => {
                      setMarkdown(value)
                      if (title.trim() !== '' && title === inferDocumentTitle(markdown)) {
                        setTitle(inferDocumentTitle(value))
                      }
                    }}
                    beforeMount={beforeMonacoMount}
                    onMount={(editor, monaco) => configureEditor(editor, monaco, 'markdown')}
                    editorTheme={editorThemeName}
                    wordWrap={wordWrap}
                    selectedText={selectedText}
                    onShortcut={applyShortcut}
                  />
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle className={isMobile ? 'h-3' : undefined} />

              <ResizablePanel
                id="secondary"
                minSize={isMobile ? '28%' : '0%'}
                defaultSize={`${100 - (isMobile ? mobileStackRatio : splitRatio)}%`}
                className="min-h-0 min-w-0"
              >
                <div className={`h-full min-h-0 min-w-0 ${isMobile ? 'pt-1.5' : 'pl-1.5'}`}>
                  {rightPaneView === 'schema' ? (
                    <SchemaPane
                      schemaCode={schemaCode}
                      onChange={setSchemaCode}
                      beforeMount={beforeMonacoMount}
                      onMount={(editor, monaco) => configureEditor(editor, monaco, 'schema')}
                      editorTheme={editorThemeName}
                    />
                  ) : (
                    <PreviewPane
                      markdown={markdown}
                      structureMode={false}
                      isDark={theme === 'dark'}
                      headingStates={headingStates}
                      activeLine={activeLine}
                      onJumpToLine={jumpToLine}
                      onScroll={handlePreviewScroll}
                      containerRef={previewContainerRef}
                    />
                  )}
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel id="results" minSize="0%" maxSize="100%" defaultSize={`${resultPaneSize}%`} className="min-h-0 min-w-0">
            <div className="h-full min-h-0">
              <ResultPane
                activeTab={resultTab}
                onTabChange={setResultTab}
                payload={jsonPayload}
                onCopy={copyJson}
                copyState={copyState}
                hasError={Boolean(result && !result.success)}
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <div className="-mt-1 flex items-center justify-between px-1">
        <Badge variant={result?.success ? 'success' : result ? 'danger' : 'outline'}>
          {result?.success ? 'Validation passed' : `Validation issues: ${result?.error?.issues?.length ?? 0}`}
        </Badge>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" asChild>
            <a href={DOCS_URL} target="_blank" rel="noreferrer">
              Docs
            </a>
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={() => supportDialogRef.current?.showModal()}>
            Support
          </Button>
          <Button type="button" variant="outline" size="sm" asChild>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer">
              GitHub
            </a>
          </Button>
          <Button type="button" variant="outline" size="sm" asChild>
            <a href={ISSUES_URL} target="_blank" rel="noreferrer">
              Issues
            </a>
          </Button>
        </div>
      </div>

      {!prefsLoaded ? <div className="hidden" aria-hidden /> : null}

      <dialog
        ref={supportDialogRef}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 m-0 rounded-lg border bg-background p-6 shadow-lg backdrop:bg-black/50"
        onClick={(e) => { if (e.target === e.currentTarget) supportDialogRef.current?.close() }}
      >
        <div className="flex flex-col gap-4 min-w-75">
          <h2 className="text-lg font-semibold">Support</h2>
          <p className="text-sm text-muted-foreground">
            Need help or have a question? Reach out to us via email:
          </p>
          <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
            <span className="select-all font-mono">{SUPPORT_EMAIL}</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="ml-auto"
              onClick={() => navigator.clipboard.writeText(SUPPORT_EMAIL)}
            >
              Copy
            </Button>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => supportDialogRef.current?.close()}>
            Close
          </Button>
        </div>
      </dialog>
    </section>
  )
}
