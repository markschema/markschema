'use client'

import { useRef } from 'react'
import { Moon, SunMedium, WandSparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

type ToolbarProps = {
  title: string
  onTitleChange: (value: string) => void
  onImportFile: (file: File) => Promise<void> | void
  rightPaneView: 'preview' | 'schema'
  onRightPaneViewChange: (view: 'preview' | 'schema') => void
  onRun: () => void
  autoValidate: boolean
  onAutoValidateChange: (enabled: boolean) => void
  wordWrap: boolean
  onWordWrapChange: (enabled: boolean) => void
  scrollSync: boolean
  onScrollSyncChange: (enabled: boolean) => void
  theme: 'dark' | 'light'
  onThemeToggle: () => void
}

function SettingSwitch({
  id,
  label,
  checked,
  onCheckedChange,
}: {
  id: string
  label: string
  checked: boolean
  onCheckedChange: (value: boolean) => void
}) {
  return (
    <label htmlFor={id} className="inline-flex items-center gap-2 text-xs text-muted-foreground">
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
      <span>{label}</span>
    </label>
  )
}

export function TopToolbar(props: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  return (
    <header className="rounded-xl border border-border bg-card/95 px-3 py-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.16)] backdrop-blur">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Input
            value={props.title}
            onChange={(event) => props.onTitleChange(event.target.value)}
            aria-label="Document title"
            className="w-full bg-background pr-24"
            placeholder="Document title"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.markdown,.mdx,text/markdown,text/plain"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (!file) return
              void Promise.resolve(props.onImportFile(file)).catch(() => {
                // Avoid unhandled rejections bubbling to Next overlay.
              })
              event.currentTarget.value = ''
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="absolute right-1 top-1/2 h-7 -translate-y-1/2 px-2 text-xs"
            onClick={() => fileInputRef.current?.click()}
          >
            Import
          </Button>
        </div>

        <ToggleGroup
          type="single"
          value={props.rightPaneView}
          onValueChange={(value) => {
            if (value === 'preview' || value === 'schema') {
              props.onRightPaneViewChange(value)
            }
          }}
          variant="outline"
          size="sm"
          aria-label="Right pane"
        >
          <ToggleGroupItem value="preview" aria-label="Show preview">
            Preview
          </ToggleGroupItem>
          <ToggleGroupItem value="schema" aria-label="Show schema">
            Schema
          </ToggleGroupItem>
        </ToggleGroup>

        <Button type="button" onClick={props.onRun} size="sm" className="gap-2 font-semibold">
          <WandSparkles className="size-3.5" />
          Validate
        </Button>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={props.onThemeToggle}
              aria-label={props.theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {props.theme === 'dark' ? <SunMedium /> : <Moon />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {props.theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-4">
        <SettingSwitch id="auto-validate" label="Auto validate" checked={props.autoValidate} onCheckedChange={props.onAutoValidateChange} />
        <SettingSwitch id="wrap-lines" label="Wrap lines" checked={props.wordWrap} onCheckedChange={props.onWordWrapChange} />
        <SettingSwitch id="sync-scroll" label="Sync scroll" checked={props.scrollSync} onCheckedChange={props.onScrollSyncChange} />
      </div>
    </header>
  )
}
