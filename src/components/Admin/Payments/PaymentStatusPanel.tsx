'use client'

import React, { useEffect, useState } from 'react'

type Status = {
  envEnabled: boolean
  keysConfigured: boolean
  webhookConfigured: boolean
  operationalEnabled: boolean
  effectiveEnabled: boolean
  mode: string
}

const dot = (ok: boolean): React.CSSProperties => ({
  display: 'inline-block',
  width: '10px',
  height: '10px',
  borderRadius: '50%',
  marginRight: '8px',
  background: ok ? 'var(--theme-success-500)' : 'var(--theme-error-500)',
})

const Row: React.FC<{ ok: boolean; label: string; hint?: string }> = ({ ok, label, hint }) => (
  <li style={{ display: 'flex', alignItems: 'center', padding: '4px 0', fontSize: '0.85rem' }}>
    <span style={dot(ok)} />
    <span style={{ color: 'var(--theme-elevation-800)' }}>{label}</span>
    {hint && <span style={{ color: 'var(--theme-elevation-500)', marginLeft: '6px' }}>— {hint}</span>}
  </li>
)

// Read-only panel on the Payment Settings global. Reports whether the gateway is
// actually live, computed server-side from env + this global. Never shows secrets.
export const PaymentStatusPanel: React.FC = () => {
  const [status, setStatus] = useState<Status | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    fetch('/api/razorpay/status', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`Status ${r.status}`))))
      .then((d) => active && setStatus(d))
      .catch((e) => active && setError(e instanceof Error ? e.message : 'Failed to load status'))
    return () => {
      active = false
    }
  }, [])

  const effective = status?.effectiveEnabled

  return (
    <div
      style={{
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: '8px',
        padding: '1rem 1.25rem',
        marginBottom: '1.5rem',
        background: 'var(--theme-elevation-50)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <strong style={{ color: 'var(--theme-elevation-800)' }}>Razorpay Gateway</strong>
        {status && (
          <span
            style={{
              padding: '2px 10px',
              borderRadius: '999px',
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#fff',
              background: effective ? 'var(--theme-success-500)' : 'var(--theme-elevation-400)',
            }}
          >
            {effective ? `LIVE (${status.mode})` : 'INACTIVE'}
          </span>
        )}
      </div>

      {error && <p style={{ color: 'var(--theme-error-500)', fontSize: '0.8rem' }}>{error}</p>}
      {!status && !error && <p style={{ color: 'var(--theme-elevation-500)', fontSize: '0.8rem' }}>Checking…</p>}

      {status && (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          <Row ok={status.envEnabled} label="PAYMENTS_ENABLED (env master switch)" hint={status.envEnabled ? 'on' : 'set to true in env'} />
          <Row ok={status.keysConfigured} label="Razorpay API keys" hint={status.keysConfigured ? 'configured' : 'missing RAZORPAY_KEY_ID / SECRET'} />
          <Row ok={status.webhookConfigured} label="Webhook secret" hint={status.webhookConfigured ? 'configured' : 'set RAZORPAY_WEBHOOK_SECRET'} />
          <Row ok={status.operationalEnabled} label="Enable Online Payments (below)" hint={status.operationalEnabled ? 'on' : 'toggle on to go live'} />
        </ul>
      )}
      <p style={{ color: 'var(--theme-elevation-500)', fontSize: '0.75rem', marginTop: '0.75rem', marginBottom: 0 }}>
        Secrets are read from environment variables and are never stored here.
      </p>
    </div>
  )
}

export default PaymentStatusPanel
