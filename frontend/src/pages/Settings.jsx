import React from 'react';
import { Card, SectionHeader } from '../components/ui';
import { USE_MOCK } from '../api/verification';

export default function Settings() {
  return (
    <div style={{ padding: 32, maxWidth: 640 }}>
      <SectionHeader
        title="Settings"
        subtitle="System configuration and officer preferences."
      />

      <Card style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: 16, color: 'var(--color-text-primary)' }}>API Configuration</div>

        <SettingRow
          label="API Mode"
          value={USE_MOCK ? 'Mock (development)' : 'Live backend'}
          note={USE_MOCK ? 'Toggle USE_MOCK in src/api/verification.js to connect to the real backend.' : 'Connected to backend at VITE_API_BASE.'}
          badge={USE_MOCK ? 'amber' : 'green'}
        />
        <SettingRow
          label="Endpoint"
          value={USE_MOCK ? '—' : (import.meta.env.VITE_API_BASE || 'http://localhost:8000')}
        />
        <SettingRow
          label="Backend route"
          value="POST /verify"
        />
      </Card>

      <Card style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: 16, color: 'var(--color-text-primary)' }}>Officer Profile</div>
        <SettingRow label="Name" value="Officer K. Sharma" />
        <SettingRow label="Gate" value="Gate 7 — Terminal 2" />
        <SettingRow label="Access Level" value="Standard Officer" />
      </Card>

      <Card style={{ padding: 24 }}>
        <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: 4, color: 'var(--color-text-primary)' }}>About</div>
        <div style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
          <strong>SIH-26188</strong> — AI-Based Fake Identity &amp; Document Screening System<br />
          Smart India Hackathon 2026 Project<br />
          Frontend build: feature/frontend
        </div>
      </Card>
    </div>
  );
}

function SettingRow({ label, value, note, badge }) {
  const badgeStyle = badge === 'amber'
    ? { background: 'var(--color-review-bg)', color: 'var(--color-review)', border: '1px solid var(--color-review-border)' }
    : badge === 'green'
    ? { background: 'var(--color-clear-bg)', color: 'var(--color-clear)', border: '1px solid var(--color-clear-border)' }
    : null;

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid var(--color-border)', gap: 16 }}>
      <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{label}</div>
      <div style={{ textAlign: 'right' }}>
        {badgeStyle ? (
          <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: 'var(--radius-sm)', ...badgeStyle }}>{value}</span>
        ) : (
          <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{value}</div>
        )}
        {note && <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: 3, maxWidth: 260 }}>{note}</div>}
      </div>
    </div>
  );
}
