'use client'

import React from 'react'
import { useField, FieldLabel } from '@payloadcms/ui'

// Ordered Mon-first for a natural week; values are UTC weekday numbers as strings.
const DAYS: Array<[string, string]> = [
  ['1', 'Mon'],
  ['2', 'Tue'],
  ['3', 'Wed'],
  ['4', 'Thu'],
  ['5', 'Fri'],
  ['6', 'Sat'],
  ['0', 'Sun'],
]

const PRESETS: Record<string, string[]> = {
  Weekdays: ['1', '2', '3', '4', '5'],
  Weekends: ['0', '6'],
  All: ['0', '1', '2', '3', '4', '5', '6'],
}

type Props = { path?: string; field?: { label?: unknown; required?: boolean } }

/**
 * Easy-select day-of-week picker. The underlying field stays a real `select hasMany`
 * (values '0'–'6'); this only swaps the input UI for toggle buttons + presets.
 * Styled with Payload's `btn` classes so it's theme-aware without Tailwind.
 */
export const DaysOfWeekPicker: React.FC<Props> = ({ path, field }) => {
  const { value, setValue } = useField<string[]>({ path: path || 'daysOfWeek' })
  const selected = new Set(value ?? [])

  const toggle = (v: string) => {
    const next = new Set(selected)
    if (next.has(v)) next.delete(v)
    else next.add(v)
    setValue([...next].sort())
  }

  return (
    <div className="field-type" style={{ marginBottom: '1.5rem' }}>
      <FieldLabel label={(field?.label as string) ?? 'Days of week'} path={path || 'daysOfWeek'} required={field?.required} />
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', margin: '6px 0 8px' }}>
        {DAYS.map(([v, label]) => (
          <button
            key={v}
            type="button"
            onClick={() => toggle(v)}
            aria-pressed={selected.has(v)}
            className={`btn btn--size-small ${selected.has(v) ? 'btn--style-primary' : 'btn--style-secondary'}`}
            style={{ minWidth: '54px', margin: 0 }}
          >
            {label}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {Object.entries(PRESETS).map(([name, vals]) => (
          <button
            key={name}
            type="button"
            onClick={() => setValue([...vals])}
            className="btn btn--style-secondary btn--size-small"
            style={{ margin: 0 }}
          >
            {name}
          </button>
        ))}
        <button type="button" onClick={() => setValue([])} className="btn btn--style-secondary btn--size-small" style={{ margin: 0 }}>
          Clear
        </button>
      </div>
    </div>
  )
}

export default DaysOfWeekPicker
