'use client'

import dynamic from 'next/dynamic'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
})

type SchemaPaneProps = {
  schemaCode: string
  onChange: (value: string) => void
  beforeMount: (monaco: any) => void
  onMount: (editor: any, monaco: any) => void
  editorTheme: string
}

export function SchemaPane(props: SchemaPaneProps) {
  return (
    <Card className="h-full min-h-0 overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Schema</CardTitle>
          <Badge variant="outline">TypeScript</Badge>
        </div>
      </CardHeader>

      <CardContent className="min-h-0 flex-1 p-0">
        <div className="h-full min-h-0 overflow-hidden">
          <MonacoEditor
            height="100%"
            beforeMount={props.beforeMount}
            onMount={props.onMount}
            language="typescript"
            theme={props.editorTheme}
            value={props.schemaCode}
            onChange={(value) => props.onChange(value ?? '')}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              lineHeight: 20,
              smoothScrolling: true,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 14, bottom: 14 },
              wordWrap: 'on',
            }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
