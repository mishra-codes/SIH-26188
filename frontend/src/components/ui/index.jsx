import React from 'react';

/* ── Badge ───────────────────────────────────────────────────────── */
export function Badge({ children, variant = 'default', size = 'sm' }) {
  const styles = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontWeight: 600,
    letterSpacing: '0.01em',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid',
    lineHeight: 1,
    padding: size === 'lg' ? '6px 12px' : '3px 8px',
    fontSize: size === 'lg' ? '13px' : '11px',
  };

  const variants = {
    default: { background: 'var(--color-surface-2)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' },
    clear:    { background: 'var(--color-clear-bg)', borderColor: 'var(--color-clear-border)', color: 'var(--color-clear)' },
    review:   { background: 'var(--color-review-bg)', borderColor: 'var(--color-review-border)', color: 'var(--color-review)' },
    risk:     { background: 'var(--color-risk-bg)', borderColor: 'var(--color-risk-border)', color: 'var(--color-risk)' },
    info:     { background: 'var(--color-info-bg)', borderColor: '#BFCFE8', color: 'var(--color-info)' },
    pass:     { background: 'var(--color-clear-bg)', borderColor: 'var(--color-clear-border)', color: 'var(--color-clear)' },
    fail:     { background: 'var(--color-risk-bg)', borderColor: 'var(--color-risk-border)', color: 'var(--color-risk)' },
    suspicious: { background: 'var(--color-review-bg)', borderColor: 'var(--color-review-border)', color: 'var(--color-review)' },
  };

  return (
    <span style={{ ...styles, ...(variants[variant] || variants.default) }}>
      {children}
    </span>
  );
}

/* ── StatusBadge ─────────────────────────────────────────────────── */
export function StatusBadge({ status, size = 'sm' }) {
  const map = { CLEAR: 'clear', REVIEW: 'review', 'HIGH-RISK': 'risk' };
  return <Badge variant={map[status] || 'default'} size={size}>{status}</Badge>;
}

/* ── CheckBadge ──────────────────────────────────────────────────── */
export function CheckBadge({ result }) {
  const map = { PASS: 'pass', FAIL: 'fail', SUSPICIOUS: 'suspicious' };
  return <Badge variant={map[result] || 'default'}>{result}</Badge>;
}

/* ── Card ────────────────────────────────────────────────────────── */
export function Card({ children, style = {}, className = '', onClick }) {
  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-xs)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ── Button ──────────────────────────────────────────────────────── */
export function Button({ children, variant = 'primary', size = 'md', onClick, disabled, type = 'button', style = {}, icon }) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    fontFamily: 'inherit',
    fontWeight: 500,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.55 : 1,
    border: '1px solid transparent',
    borderRadius: 'var(--radius-md)',
    transition: 'background var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast)',
    outline: 'none',
    whiteSpace: 'nowrap',
    lineHeight: 1.2,
    ...( size === 'sm' ? { padding: '6px 12px', fontSize: '12px' } : {}),
    ...( size === 'md' ? { padding: '8px 16px', fontSize: '13.5px' } : {}),
    ...( size === 'lg' ? { padding: '11px 22px', fontSize: '14.5px' } : {}),
  };

  const variants = {
    primary:   { background: 'var(--color-brand)', borderColor: 'var(--color-brand)', color: '#FFF' },
    secondary: { background: 'var(--color-surface)', borderColor: 'var(--color-border-strong)', color: 'var(--color-text-primary)' },
    ghost:     { background: 'transparent', borderColor: 'transparent', color: 'var(--color-text-secondary)' },
    danger:    { background: 'var(--color-risk)', borderColor: 'var(--color-risk)', color: '#FFF' },
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{ ...base, ...(variants[variant] || variants.primary), ...style }}
      onMouseEnter={(e) => {
        if (disabled) return;
        if (variant === 'primary') e.currentTarget.style.background = 'var(--color-brand-light)';
        if (variant === 'secondary') e.currentTarget.style.background = 'var(--color-surface-2)';
        if (variant === 'ghost') e.currentTarget.style.background = 'var(--color-bg-subtle)';
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        const v = variants[variant] || variants.primary;
        e.currentTarget.style.background = v.background;
      }}
    >
      {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
      {children}
    </button>
  );
}

/* ── Divider ─────────────────────────────────────────────────────── */
export function Divider({ style = {} }) {
  return <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '0', ...style }} />;
}

/* ── Spinner ─────────────────────────────────────────────────────── */
export function Spinner({ size = 20, color = 'var(--color-brand)' }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 24 24" fill="none"
      style={{ animation: 'spin 0.8s linear infinite' }}
      aria-hidden="true"
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.2" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/* ── SectionHeader ───────────────────────────────────────────────── */
export function SectionHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
      <div>
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: subtitle ? 4 : 0 }}>{title}</h2>
        {subtitle && <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
