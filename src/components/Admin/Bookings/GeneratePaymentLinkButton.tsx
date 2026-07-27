'use client'

import React, { useState } from 'react'
import { useDocumentInfo, toast } from '@payloadcms/ui'

// Custom UI field on the Bookings edit view. Calls the server route to create a
// Razorpay payment link for this booking, then shows the link with a copy button.
export const GeneratePaymentLinkButton: React.FC = () => {
  const { id } = useDocumentInfo()
  const [loading, setLoading] = useState(false)
  const [url, setUrl] = useState<string | null>(null)

  const generate = async () => {
    if (!id) return
    setLoading(true)
    setUrl(null)
    try {
      const res = await fetch('/api/razorpay/create-payment-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ bookingId: id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`)
      setUrl(data.url)
      toast.success('Payment link created and emailed to the customer.')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to create payment link')
    } finally {
      setLoading(false)
    }
  }

  const copy = async () => {
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied.')
    } catch {
      toast.error('Could not copy link.')
    }
  }

  return (
    <div style={{ margin: '0.5rem 0 1rem' }}>
      <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: 'var(--theme-elevation-800)' }}>
        Payment Link
      </label>
      {!id ? (
        <p style={{ color: 'var(--theme-elevation-500)', fontSize: '0.85rem', margin: 0 }}>
          Save the booking first to generate a payment link.
        </p>
      ) : (
        <>
          <button
            type="button"
            onClick={generate}
            disabled={loading}
            className="btn btn--style-primary btn--size-small"
            style={{ opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Generating…' : 'Generate & Email Payment Link'}
          </button>
          {url && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
              <a href={url} target="_blank" rel="noreferrer" style={{ color: 'var(--theme-primary-500)', fontSize: '0.85rem', wordBreak: 'break-all' }}>
                {url}
              </a>
              <button type="button" onClick={copy} className="btn btn--style-secondary btn--size-small">
                Copy
              </button>
            </div>
          )}
          <p style={{ color: 'var(--theme-elevation-500)', fontSize: '0.75rem', marginTop: '0.5rem', marginBottom: 0 }}>
            Uses the amount still due (total − paid). Requires the gateway to be enabled for this booking.
          </p>
        </>
      )}
    </div>
  )
}

export default GeneratePaymentLinkButton
