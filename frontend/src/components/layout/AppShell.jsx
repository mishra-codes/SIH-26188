import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ScanLine, ClipboardList, Settings,
  Shield, ChevronRight, Menu, X, Circle,
} from 'lucide-react';
import { USE_MOCK } from '../../api/verification';

const NAV_ITEMS = [
  { to: '/',         label: 'Dashboard', icon: LayoutDashboard },
  { to: '/verify',   label: 'Verify',    icon: ScanLine },
  { to: '/history',  label: 'History',   icon: ClipboardList },
  { to: '/settings', label: 'Settings',  icon: Settings },
];

export default function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const pageTitle = NAV_ITEMS.find(n =>
    n.to === '/' ? location.pathname === '/' : location.pathname.startsWith(n.to)
  )?.label || 'Dashboard';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)' }}>

      {/* ── Sidebar (sticky, not fixed, on desktop) ─── */}
      <aside style={{
        width: 'var(--sidebar-width)',
        minHeight: '100vh',
        background: 'var(--color-brand)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
      }}>
        {/* Logo */}
        <div style={{ padding: '0 18px', height: 'var(--topbar-height)', display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={15} style={{ color: '#7EB3FF' }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '12.5px', color: '#F0F2F6', letterSpacing: '0.04em' }}>DOCSCREEN</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.03em' }}>SIH-26188</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '14px 10px', flex: 1 }} aria-label="Main navigation">
          <div style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 8px', marginBottom: 8 }}>Navigation</div>
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px',
                borderRadius: 'var(--radius-md)',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
                background: isActive ? 'rgba(255,255,255,0.13)' : 'transparent',
                textDecoration: 'none', fontWeight: isActive ? 600 : 400,
                fontSize: '13px', marginBottom: 2,
                transition: 'background 120ms ease, color 120ms ease',
              })}
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: '12px 18px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '11px', color: USE_MOCK ? 'rgba(245,201,122,0.75)' : 'rgba(74,222,128,0.75)' }}>
            <Circle size={5} style={{ fill: 'currentColor' }} />
            {USE_MOCK ? 'Mock mode' : 'Live'}
          </div>
        </div>
      </aside>

      {/* ── Right panel ───────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: '100vh' }}>

        {/* Topbar */}
        <header style={{
          height: 'var(--topbar-height)',
          background: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          padding: '0 28px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: 'var(--shadow-xs)',
          position: 'sticky', top: 0, zIndex: 100,
          flexShrink: 0,
        }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '12.5px' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Immigration Console</span>
            <ChevronRight size={13} style={{ color: 'var(--color-text-muted)' }} />
            <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{pageTitle}</span>
          </div>

          {/* Officer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>Officer K. Sharma</div>
              <div style={{ fontSize: '10.5px', color: 'var(--color-text-muted)' }}>Gate 7 — Terminal 2</div>
            </div>
            <div style={{
              width: 33, height: 33, borderRadius: '50%',
              background: 'var(--color-brand)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em', flexShrink: 0,
            }}>KS</div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
