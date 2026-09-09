import React, { useState, useMemo } from 'react';
import { Search, Filter, ClipboardList, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Card, StatusBadge, CheckBadge, SectionHeader, Button } from '../components/ui';

export default function History({ history }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [expanded, setExpanded] = useState(null);

  const STATUS_OPTS = ['ALL', 'CLEAR', 'REVIEW', 'HIGH-RISK'];

  const filtered = useMemo(() => {
    return history.filter(r => {
      const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
      const q = search.toLowerCase();
      const matchSearch = !q
        || r.document?.name?.toLowerCase().includes(q)
        || r.document?.passport_number?.toLowerCase().includes(q)
        || r.document?.nationality?.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [history, search, statusFilter]);

  return (
    <div style={{ padding: 32 }}>
      <SectionHeader
        title="Verification History"
        subtitle={`${history.length} total record${history.length !== 1 ? 's' : ''} this session.`}
      />

      {/* Filters */}
      <Card style={{ padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or passport number…"
            style={searchInputStyle}
            aria-label="Search records"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 2 }}
              aria-label="Clear search"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Status filter */}
        <div style={{ display: 'flex', gap: 4 }}>
          {STATUS_OPTS.map(opt => (
            <button
              key={opt}
              onClick={() => setStatusFilter(opt)}
              style={{
                padding: '5px 10px',
                fontSize: '11.5px',
                fontWeight: statusFilter === opt ? 600 : 400,
                borderRadius: 'var(--radius-sm)',
                border: '1px solid',
                borderColor: statusFilter === opt ? 'var(--color-brand)' : 'var(--color-border)',
                background: statusFilter === opt ? 'var(--color-brand)' : 'transparent',
                color: statusFilter === opt ? '#fff' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      </Card>

      {/* Table */}
      <Card style={{ overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <EmptyState hasHistory={history.length > 0} />
        ) : (
          <div>
            {/* Header */}
            <div style={rowStyle(false, true)}>
              <Cell w={90} label="Time" header />
              <Cell w={120} label="Passport No." header />
              <Cell flex label="Passenger" header />
              <Cell w={100} label="Nationality" header />
              <Cell w={70} label="Risk" header />
              <Cell w={110} label="Status" header />
              <Cell w={60} label="" header />
            </div>

            {/* Rows */}
            {filtered.map(r => (
              <React.Fragment key={r.id}>
                <div
                  style={rowStyle(true)}
                  onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-subtle)'}
                  onMouseLeave={e => e.currentTarget.style.background = expanded === r.id ? 'var(--color-info-bg)' : 'transparent'}
                >
                  <Cell w={90}>{formatTime(r.timestamp)}</Cell>
                  <Cell w={120}><code style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{r.document?.passport_number || '—'}</code></Cell>
                  <Cell flex style={{ fontWeight: 500 }}>{r.document?.name || r.filename}</Cell>
                  <Cell w={100}>{r.document?.nationality || '—'}</Cell>
                  <Cell w={70}>
                    <span style={{
                      fontSize: '12px', fontWeight: 700,
                      color: r.risk_score >= 75 ? 'var(--color-risk)' : r.risk_score >= 40 ? 'var(--color-review)' : 'var(--color-clear)',
                    }}>{r.risk_score}</span>
                  </Cell>
                  <Cell w={110}><StatusBadge status={r.status} /></Cell>
                  <Cell w={60}>
                    <span style={{ color: 'var(--color-text-muted)', display: 'flex' }}>
                      {expanded === r.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </span>
                  </Cell>
                </div>

                {/* Expanded detail */}
                {expanded === r.id && (
                  <div style={{ padding: '16px 20px', background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
                      {/* Doc info */}
                      <div>
                        <div style={detailHeader}>Document Information</div>
                        <InfoRow label="Full Name" value={r.document?.name} />
                        <InfoRow label="Date of Birth" value={r.document?.date_of_birth_fmt} />
                        <InfoRow label="Expiry" value={r.document?.date_of_expiry_fmt} />
                        <InfoRow label="Issuing Country" value={r.document?.issuing_country} />
                      </div>
                      {/* Checks */}
                      <div>
                        <div style={detailHeader}>Verification Checks</div>
                        {Object.entries(r.checks).map(([key, val]) => (
                          <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{checkLabel(key)}</span>
                            <CheckBadge result={val} />
                          </div>
                        ))}
                      </div>
                      {/* Reasons */}
                      <div>
                        <div style={detailHeader}>Findings</div>
                        {r.reasons?.map((reason, i) => (
                          <div key={i} style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: 6, display: 'flex', gap: 6 }}>
                            <span style={{ color: r.status === 'CLEAR' ? 'var(--color-clear)' : 'var(--color-review)' }}>
                              {r.status === 'CLEAR' ? '✓' : '⚠'}
                            </span>
                            {reason}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </Card>

      {filtered.length > 0 && filtered.length !== history.length && (
        <div style={{ marginTop: 12, fontSize: '12px', color: 'var(--color-text-muted)', textAlign: 'center' }}>
          Showing {filtered.length} of {history.length} records
        </div>
      )}
    </div>
  );
}

function EmptyState({ hasHistory }) {
  return (
    <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
      <ClipboardList size={30} style={{ marginBottom: 12, opacity: 0.3 }} />
      <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: 4, color: 'var(--color-text-secondary)' }}>
        {hasHistory ? 'No records match your filters.' : 'No verification records yet.'}
      </div>
      <div style={{ fontSize: '12.5px' }}>
        {hasHistory ? 'Try adjusting the search or status filter.' : 'Completed passport screenings will appear here.'}
      </div>
    </div>
  );
}

function Cell({ children, label, w, flex, header, style = {} }) {
  return (
    <div style={{
      width: w || undefined, flex: flex ? 1 : undefined, flexShrink: flex ? 1 : 0,
      fontSize: header ? '11px' : '12.5px',
      fontWeight: header ? 600 : 400,
      color: header ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
      textTransform: header ? 'uppercase' : undefined,
      letterSpacing: header ? '0.05em' : undefined,
      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      ...style,
    }}>
      {label || children}
    </div>
  );
}

function rowStyle(clickable = false, isHeader = false) {
  return {
    display: 'flex', alignItems: 'center', gap: 12, padding: '11px 20px',
    borderBottom: '1px solid var(--color-border)',
    cursor: clickable ? 'pointer' : undefined,
    background: isHeader ? 'var(--color-surface-2)' : 'transparent',
    transition: 'background var(--transition-fast)',
  };
}

const detailHeader = {
  fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
  letterSpacing: '0.06em', color: 'var(--color-text-muted)', marginBottom: 10,
};

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
      <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{label}</span>
      <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{value || '—'}</span>
    </div>
  );
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function checkLabel(key) {
  const map = { ocr: 'OCR', mrz: 'MRZ', expiry: 'Expiry', tampering: 'Tampering', face: 'Face', consistency: 'Consistency' };
  return map[key] || key;
}

const searchInputStyle = {
  width: '100%',
  padding: '7px 32px',
  fontSize: '13px',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  background: 'var(--color-surface)',
  color: 'var(--color-text-primary)',
  outline: 'none',
  fontFamily: 'inherit',
};
