import { describe, expect, it } from 'vitest'
import { md } from './index'
import type { BaseSchema } from './core/schema'

describe('date schema', () => {
  const timestampMillis = 1710072000000
  const timestampSeconds = 1710072000

  it('defaults to ISO input and Date output', () => {
    const schema = md.date()
    const result = schema.safeParse('2026-03-10T12:00:00.000Z')

    expect(result.success).toBe(true)
    if (result.success) {
      const value: Date = result.data
      expect(value).toBeInstanceOf(Date)
      expect(value.toISOString()).toBe('2026-03-10T12:00:00.000Z')
    }
  })

  it('keeps the date-only string shape when only input is date-only', () => {
    const schema = md.date({ input: 'date-only' })
    const result = schema.safeParse('2026-03-10')

    expect(result.success).toBe(true)
    if (result.success) {
      const value: string = result.data
      expect(value).toBe('2026-03-10')
    }
  })

  it('supports explicit date-only output for ISO input', () => {
    const schema = md.date({ input: 'iso', output: 'date-only' })
    const result = schema.safeParse('2026-03-10T12:00:00.000Z')

    expect(result.success).toBe(true)
    if (result.success) {
      const value: string = result.data
      expect(value).toBe('2026-03-10')
    }
  })

  it('supports converting date-only input to Date output', () => {
    const schema = md.date({ input: 'date-only', output: 'date' })
    const result = schema.safeParse('2026-03-10')

    expect(result.success).toBe(true)
    if (result.success) {
      const value: Date = result.data
      expect(value.toISOString()).toBe('2026-03-10T00:00:00.000Z')
    }
  })

  it('keeps timestamp shape when only input is timestamp', () => {
    const schema = md.date({ input: 'timestamp' })
    const result = schema.safeParse(timestampMillis)

    expect(result.success).toBe(true)
    if (result.success) {
      const value: number = result.data
      expect(value).toBe(timestampMillis)
    }
  })

  it('accepts timestamp seconds input and normalizes to milliseconds output', () => {
    const schema = md.date({ input: 'timestamp' })
    const result = schema.safeParse(timestampSeconds)

    expect(result.success).toBe(true)
    if (result.success) {
      const value: number = result.data
      expect(value).toBe(timestampMillis)
    }
  })

  it('supports converting timestamp input to Date output', () => {
    const schema = md.date({ input: 'timestamp', output: 'date' })
    const result = schema.safeParse(timestampMillis)

    expect(result.success).toBe(true)
    if (result.success) {
      const value: Date = result.data
      expect(value.toISOString()).toBe('2024-03-10T12:00:00.000Z')
    }
  })

  it('allows all input/output combinations', () => {
    const cases: Array<{
      schema: BaseSchema<unknown, unknown>
      input: unknown
      expectedType: 'date' | 'string' | 'number'
    }> = [
      { schema: md.date({ input: 'iso', output: 'timestamp' }), input: '2026-03-10T12:00:00.000Z', expectedType: 'number' },
      { schema: md.date({ input: 'date-only', output: 'iso' }), input: '2026-03-10', expectedType: 'string' },
      { schema: md.date({ input: 'timestamp', output: 'date-only' }), input: timestampMillis, expectedType: 'string' },
      { schema: md.date({ input: 'timestamp', output: 'iso' }), input: timestampMillis, expectedType: 'string' },
    ]

    for (const entry of cases) {
      const result = entry.schema.safeParse(entry.input)
      expect(result.success).toBe(true)
      if (!result.success) {
        continue
      }
      if (entry.expectedType === 'date') {
        expect(result.data).toBeInstanceOf(Date)
      } else {
        expect(typeof result.data).toBe(entry.expectedType)
      }
    }
  })

  it('rejects date-only input when ISO input is required', () => {
    const result = md.date({ input: 'iso' }).safeParse('2026-03-10')

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.code).toBe('invalid_date')
    }
  })

  it('rejects invalid calendar values for date-only input', () => {
    const result = md.date({ input: 'date-only' }).safeParse('2026-02-30')

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.code).toBe('invalid_date')
    }
  })

  it('rejects non-numeric values for timestamp input', () => {
    const result = md.date({ input: 'timestamp' }).safeParse('not-a-timestamp')

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.code).toBe('invalid_date')
    }
  })

  it('keeps legacy as:string behavior mapped to ISO output', () => {
    const schema = md.date({ as: 'string' })
    const result = schema.safeParse('2026-03-10T12:00:00.000Z')

    expect(result.success).toBe(true)
    if (result.success) {
      const value: string = result.data
      expect(value).toBe('2026-03-10T12:00:00.000Z')
    }
  })
})
