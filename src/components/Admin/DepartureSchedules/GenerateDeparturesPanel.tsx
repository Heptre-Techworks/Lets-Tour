'use client'

import React, { useState } from 'react'
import { useDocumentInfo, toast } from '@payloadcms/ui'

type Preview = {
  willCreate: number
  willSkip: number
  truncated: boolean
  dates: string[]
  skippedDates: string[]
}

/**
 * Preview & Generate control on a Departure Schedule. Mirrors GeneratePaymentLinkButton:
 * 'use client', useDocumentInfo for the saved id, fetch(credentials:'include'), toast.
 * Requires the schedule to be saved first (so generated departures can link back to it).
 */
export const GenerateDeparturesPanel: React.FC = () => {
  const { id } = useDocumentInfo()
  const [busy, setBusy] = useState<false | 'preview' | 'commit'>(false)
  const [preview, setPreview] = useState<Preview | null>(null)

  const call = async (mode: 'preview' | 'commit') => {
    if (!id) return
    setBusy(mode)
    try {
      const res = await fetch('/api/departures/generate', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduleId: id, mode }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`)
      if (mode === 'preview') {
        setPreview(data)
      } else {
        toast.success(`Created ${data.created} departure(s); skipped ${data.willSkip} existing.`)
        setPreview(null)
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Generation failed')
    } finally {
      setBusy(false)
    }
  }

  const label = 'Generate departures'

  if (!id) {
    return (
      <div style={{ margin: '0.5rem 0 1.5rem' }}>
        <strong style={{ color: 'var(--theme-elevation-800)' }}>{label}</strong>
        <p style={{ color: 'var(--theme-elevation-500)', fontSize: '0.85rem', margin: '0.35rem 0 0' }}>
          Save the schedule first to preview &amp; generate departures.
        </p>
      </div>
    )
  }

  return (
    <div
      style={{
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: 8,
        padding: '1rem 1.25rem',
        background: 'var(--theme-elevation-50)',
        margin: '0.5rem 0 1.5rem',
      }}
    >
      <strong style={{ color: 'var(--theme-elevation-800)' }}>{label}</strong>
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
        <button type="button" onClick={() => call('preview')} disabled={!!busy} className="btn btn--style-secondary btn--size-small" style={{ margin: 0 }}>
          {busy === 'preview' ? 'Previewing…' : 'Preview'}
        </button>
        <button
          type="button"
          onClick={() => call('commit')}
          disabled={!!busy || (preview?.willCreate ?? 0) === 0}
          className="btn btn--style-primary btn--size-small"
          style={{ margin: 0 }}
        >
          {busy === 'commit' ? 'Generating…' : preview ? `Generate ${preview.willCreate}` : 'Generate'}
        </button>
      </div>

      {preview && (
        <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--theme-elevation-800)' }}>
          <p style={{ margin: '0 0 0.4rem' }}>
            Will create <strong>{preview.willCreate}</strong>, skip <strong>{preview.willSkip}</strong> existing.
            {preview.truncated && <span style={{ color: 'var(--theme-warning-500)' }}> (capped — narrow the date range)</span>}
          </p>
          <div style={{ maxHeight: 180, overflow: 'auto', fontFamily: 'monospace', fontSize: '0.75rem', lineHeight: 1.6 }}>
            {preview.dates.map((d) => (
              <div key={`c-${d}`} style={{ color: 'var(--theme-success-500)' }}>
                + {d}
              </div>
            ))}
            {preview.skippedDates.map((d) => (
              <div key={`s-${d}`} style={{ color: 'var(--theme-elevation-500)' }}>
                = {d} (exists)
              </div>
            ))}
          </div>
        </div>
      )}

      <p style={{ color: 'var(--theme-elevation-500)', fontSize: '0.75rem', marginTop: '0.6rem', marginBottom: 0 }}>
        Additive: existing departures (including booked ones) are never modified or deleted.
      </p>
    </div>
  )
}

export default GenerateDeparturesPanel
