'use client'

import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
})

type EditorPaneProps = {
  markdown: string
  onChange: (value: string) => void
  onMount: (editor: any, monaco: any) => void
  beforeMount: (monaco: any) => void
  editorTheme: string
  wordWrap: boolean
  selectedText: string
  onShortcut: (id: string) => void
}

type ShortcutItem = {
  id: string
  label: string
  title: string
}

const shortcuts: ShortcutItem[] = [
  { id: 'bold', label: 'B', title: 'Bold' },
  { id: 'italic', label: 'I', title: 'Italic' },
  { id: 'inlineCode', label: '</>', title: 'Inline code' },
  { id: 'link', label: 'Link', title: 'Link' },
  { id: 'h2', label: 'H2', title: 'Heading 2' },
  { id: 'ul', label: 'UL', title: 'Bullet list' },
  { id: 'quote', label: 'Quote', title: 'Blockquote' },
  { id: 'task', label: 'Task', title: 'Task list' },
  { id: 'codeBlock', label: 'Code', title: 'Code block' },
  { id: 'table', label: 'Table', title: 'Table' },
  { id: 'mermaid', label: 'MMD', title: 'Mermaid' },
]

const floatingShortcuts = ['bold', 'italic', 'inlineCode', 'link', 'h2', 'ul', 'quote']

export function EditorPane(props: EditorPaneProps) {
  const hasSelection = props.selectedText.trim().length > 0

  return (
    <Card className="relative h-full min-h-0 overflow-hidden">
      <CardHeader className="gap-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Markdown</CardTitle>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {shortcuts.map((shortcut) => (
            <Button
              key={shortcut.id}
              type="button"
              variant="outline"
              size="sm"
              title={shortcut.title}
              onClick={() => props.onShortcut(shortcut.id)}
            >
              {shortcut.label}
            </Button>
          ))}
        </div>
      </CardHeader>

      {hasSelection ? (
        <div className="pointer-events-none absolute right-3 top-[72px] z-30 flex items-center gap-1 rounded-lg border border-border bg-popover/95 p-1.5 shadow-lg">
          {floatingShortcuts.map((id) => (
            <Button
              key={id}
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => props.onShortcut(id)}
              className="pointer-events-auto h-7 px-2 text-[10px] font-semibold uppercase tracking-[0.08em]"
            >
              {id === 'inlineCode' ? 'code' : id}
            </Button>
          ))}
        </div>
      ) : null}

      <CardContent className="min-h-0 flex-1 p-0">
        <div className="h-full min-h-0 overflow-hidden">
          <MonacoEditor
            height="100%"
            beforeMount={props.beforeMount}
            onMount={props.onMount}
            language="markdown"
            theme={props.editorTheme}
            value={props.markdown}
            onChange={(value) => props.onChange(value ?? '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineHeight: 22,
              smoothScrolling: true,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 14, bottom: 14 },
              wordWrap: props.wordWrap ? 'on' : 'off',
              glyphMargin: true,
              folding: true,
              autoClosingBrackets: 'always',
              autoClosingQuotes: 'always',
            }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
