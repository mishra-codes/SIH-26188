import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScanLine, CheckCircle, AlertTriangle, XCircle, Clock, ArrowRight } from 'lucide-react';
import { Card, Button, StatusBadge } from '../components/ui';

export default function Dashboard({ history }) {
  const navigate = useNavigate();
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);

  useEffect(() => {
    let mounted = true;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    async function loadVanta() {
      try {
        // Load THREE then Vanta net effect
        if (!window.THREE) {
          await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js');
        }
        await loadScript('https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.net.min.js');
        if (!mounted || !vantaRef.current || vantaEffect.current) return;

        vantaEffect.current = window.VANTA.NET({
          el: vantaRef.current,
          THREE: window.THREE,
          mouseControls: false,
          touchControls: false,
          gyroControls: false,
          minHeight: 200,
          minWidth: 200,
          scale: 1.0,
          scaleMobile: 1.0,
          color: 0x3a5a9a,
          backgroundColor: 0x1c2b4a,
          points: 8,
          maxDistance: 22,
          spacing: 18,
          showDots: false,
        });
      } catch {
        // Vanta optional — fall back silently
      }
    }

    loadVanta();
    return () => {
      mounted = false;
      if (vantaEffect.current) { vantaEffect.current.destroy(); vantaEffect.current = null; }
    };
  }, []);

  // Stats from history
  const total = history.length;
  const clear = history.filter(r => r.status === 'CLEAR').length;
  const review = history.filter(r => r.status === 'REVIEW').length;
  const highRisk = history.filter(r => r.status === 'HIGH-RISK').length;
  const avgRisk = total ? Math.round(history.reduce((a, r) => a + r.risk_score, 0) / total) : 0;

  return (
    <div>
      {/* ── Hero / Header ───────────────────────────────────── */}
      <div
        ref={vantaRef}
        style={{
          position: 'relative',
          minHeight: 200,
          padding: '48px 40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: 'var(--color-brand)',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,.45)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
            AI Document Screening Console
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#FFFFFF', marginBottom: 8, lineHeight: 1.2 }}>
            Passport Verification
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,.55)', maxWidth: 480, lineHeight: 1.6, marginBottom: 24 }}>
            Secure, AI-assisted identity screening for immigration officers.
            Submit a passport image for instant forensic analysis.
          </p>
          <Button
            size="md"
            onClick={() => navigate('/verify')}
            style={{ background: 'rgba(255,255,255,.12)', borderColor: 'rgba(255,255,255,.25)', color: '#fff' }}
            icon={<ScanLine size={15} />}
          >
            New Verification
          </Button>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────── */}
      <div style={{ padding: '32px 32px', maxWidth: 1100 }}>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
          <StatCard icon={<ScanLine size={18} />} label="Total Today" value={total} color="var(--color-text-primary)" />
          <StatCard icon={<CheckCircle size={18} />} label="Clear" value={clear} color="var(--color-clear)" />
          <StatCard icon={<AlertTriangle size={18} />} label="Review" value={review} color="var(--color-review)" />
          <StatCard icon={<XCircle size={18} />} label="High Risk" value={highRisk} color="var(--color-risk)" />
          {total > 0 && <StatCard icon={<Clock size={18} />} label="Avg Risk Score" value={`${avgRisk}`} color="var(--color-text-secondary)" />}
        </div>

        {/* Quick action + recent */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>

          {/* Quick action */}
          <Card style={{ padding: 24 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: 4, color: 'var(--color-text-primary)' }}>Quick Action</div>
            <p style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', marginBottom: 20, lineHeight: 1.5 }}>
              Upload a passport to begin a new verification screening.
            </p>
            <Button size="md" onClick={() => navigate('/verify')} style={{ width: '100%' }} icon={<ScanLine size={14} />}>
              Start Verification
            </Button>
          </Card>

          {/* Recent verifications */}
          <Card>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 600 }}>Recent Verifications</span>
              {history.length > 0 && (
                <button
                  onClick={() => navigate('/history')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: 'var(--color-brand-mid)', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}
                >
                  View all <ArrowRight size={12} />
                </button>
              )}
            </div>
            {history.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                <ScanLine size={28} style={{ marginBottom: 10, opacity: 0.35 }} />
                <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: 4 }}>No verifications yet</div>
                <div style={{ fontSize: '12px' }}>Completed screenings will appear here.</div>
              </div>
            ) : (
              <div>
                {history.slice(0, 5).map((r) => (
                  <div
                    key={r.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 20px', borderBottom: '1px solid var(--color-border)',
                      cursor: 'pointer', transition: 'background var(--transition-fast)',
                    }}
                    onClick={() => navigate('/history')}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-subtle)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {r.document?.name || r.filename}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: 1 }}>
                        {r.document?.passport_number || '—'} · {formatTime(r.timestamp)}
                      </div>
                    </div>
                    <StatusBadge status={r.status} />
                    <RiskPill score={r.risk_score} />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <Card style={{ padding: '18px 20px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
      <div style={{ color, marginTop: 2, opacity: 0.8 }}>{icon}</div>
      <div>
        <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)', marginTop: 3 }}>{label}</div>
      </div>
    </Card>
  );
}

function RiskPill({ score }) {
  const color = score >= 75 ? 'var(--color-risk)' : score >= 40 ? 'var(--color-review)' : 'var(--color-clear)';
  return (
    <span style={{
      fontSize: '11px', fontWeight: 700, color,
      background: 'var(--color-surface-2)', borderRadius: 'var(--radius-sm)',
      padding: '2px 6px', border: '1px solid var(--color-border)',
    }}>
      {score}
    </span>
  );
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

async function loadScript(src) {
  return new Promise((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
    const s = document.createElement('script');
    s.src = src; s.async = true;
    s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });
}
