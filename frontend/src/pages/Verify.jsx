import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  FileImage,
  X,
  ScanLine,
  ZoomIn,
  ZoomOut,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from 'lucide-react';

import { STATES } from '../hooks/useVerification';
import {
  Card,
  Button,
  StatusBadge,
  CheckBadge,
  Spinner,
  SectionHeader,
} from '../components/ui';

export default function Verify({ hook, onResult }) {
  const {
    state,
    file,
    previewUrl,
    result,
    error,
    selectFile,
    startVerification,
    reset,
  } = hook;

  function handleFileSelect(f) {
    if (!f) return;

    const allowed = ['image/jpeg', 'image/png'];

    if (!allowed.includes(f.type)) {
      alert('Please upload a JPEG or PNG passport image.');
      return;
    }

    if (f.size > 20 * 1024 * 1024) {
      alert('File size must be under 20 MB.');
      return;
    }

    selectFile(f);
  }

  async function handleVerify() {
    await startVerification();
  }

  // Call onResult after result arrives
  React.useEffect(() => {
    if (state === STATES.RESULT && result) {
      onResult(result, file);
    }
  }, [state, result, file, onResult]);

  return (
    <div
      style={{
        padding: '32px',
        maxWidth: 960,
        margin: '0 auto',
      }}
    >
      <SectionHeader
        title="Document Verification"
        subtitle="Upload a passport image to run AI-assisted forensic screening."
        action={
          state !== STATES.IDLE && (
            <Button
              variant="ghost"
              size="sm"
              onClick={reset}
              icon={<RotateCcw size={13} />}
            >
              New verification
            </Button>
          )
        }
      />

      {state === STATES.IDLE && (
        <DropZone onFile={handleFileSelect} />
      )}

      {state === STATES.UPLOADING && (
        <PreviewStep
          previewUrl={previewUrl}
          file={file}
          onVerify={handleVerify}
          onReset={reset}
        />
      )}

      {state === STATES.LOADING && (
        <LoadingState file={file} />
      )}

      {state === STATES.RESULT && result && (
        <ResultView
          result={result}
          previewUrl={previewUrl}
          onReset={reset}
        />
      )}

      {state === STATES.ERROR && (
        <ErrorState
          message={error}
          onReset={reset}
        />
      )}
    </div>
  );
}

/* ── Drop Zone ───────────────────────────────────────────────────── */

function DropZone({ onFile }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);

    const f = e.dataTransfer.files[0];

    if (f) {
      onFile(f);
    }
  }

  return (
    <Card
      style={{
        border: `2px dashed ${
          dragging
            ? 'var(--color-brand-mid)'
            : 'var(--color-border-strong)'
        }`,
        background: dragging
          ? 'var(--color-info-bg)'
          : 'var(--color-surface)',
        padding: '64px 40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        transition:
          'border-color var(--transition-fast), background var(--transition-fast)',
        boxShadow: 'none',
      }}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        style={{ display: 'none' }}
        onChange={(e) => onFile(e.target.files[0])}
        aria-label="Upload passport image"
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 'var(--radius-xl)',
            background: dragging
              ? 'var(--color-info-bg)'
              : 'var(--color-surface-2)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
          }}
        >
          <UploadCloud
            size={28}
            style={{
              color: dragging
                ? 'var(--color-brand-mid)'
                : 'var(--color-text-muted)',
            }}
          />
        </div>

        <div
          style={{
            fontSize: '15px',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            marginBottom: 6,
          }}
        >
          {dragging
            ? 'Release to upload'
            : 'Upload passport image'}
        </div>

        <div
          style={{
            fontSize: '13px',
            color: 'var(--color-text-muted)',
            marginBottom: 20,
          }}
        >
          Drag and drop, or click to browse
        </div>

        <Button
          size="sm"
          variant="secondary"
          style={{ pointerEvents: 'none' }}
          icon={<FileImage size={13} />}
        >
          Browse files
        </Button>

        <div
          style={{
            fontSize: '11px',
            color: 'var(--color-text-muted)',
            marginTop: 16,
          }}
        >
          JPEG or PNG · Max 20 MB
        </div>
      </div>
    </Card>
  );
}

/* ── Preview step ────────────────────────────────────────────────── */

function PreviewStep({
  previewUrl,
  file,
  onVerify,
  onReset,
}) {
  const [zoom, setZoom] = useState(1);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 360px',
        gap: 24,
      }}
    >
      {/* Document viewer */}

      <Card
        style={{
          padding: 24,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <span
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
            }}
          >
            Document Preview
          </span>

          <div style={{ display: 'flex', gap: 6 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setZoom((z) => Math.min(2, z + 0.25))
              }
              icon={<ZoomIn size={13} />}
              aria-label="Zoom in"
            />

            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setZoom((z) => Math.max(0.5, z - 0.25))
              }
              icon={<ZoomOut size={13} />}
              aria-label="Zoom out"
            />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoom(1)}
            >
              Reset
            </Button>
          </div>
        </div>

        <div
          style={{
            background: 'var(--color-bg-subtle)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 260,
            padding: 8,
          }}
        >
          <img
            src={previewUrl}
            alt="Passport preview"
            style={{
              maxWidth: '100%',
              maxHeight: 400,
              borderRadius: 'var(--radius-sm)',
              boxShadow: 'var(--shadow-md)',
              transform: `scale(${zoom})`,
              transformOrigin: 'center center',
              transition: 'transform var(--transition-base)',
            }}
          />
        </div>
      </Card>

      {/* Action panel */}

      <Card
        style={{
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: 12,
              color: 'var(--color-text-primary)',
            }}
          >
            Document Ready
          </div>

          <div
            style={{
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              display: 'flex',
              gap: 10,
              alignItems: 'flex-start',
            }}
          >
            <FileImage
              size={16}
              style={{
                color: 'var(--color-text-muted)',
                flexShrink: 0,
                marginTop: 2,
              }}
            />

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: '12.5px',
                  fontWeight: 500,
                  color: 'var(--color-text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {file?.name}
              </div>

              <div
                style={{
                  fontSize: '11px',
                  color: 'var(--color-text-muted)',
                  marginTop: 2,
                }}
              >
                {formatFileSize(file?.size)}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            padding: '12px 14px',
            background: 'var(--color-info-bg)',
            border: '1px solid #BFCFE8',
            borderRadius: 'var(--radius-md)',
            fontSize: '12px',
            color: 'var(--color-info)',
            lineHeight: 1.5,
          }}
        >
          Verification will run OCR, MRZ decoding, expiry validation,
          and forensic tampering analysis.
        </div>

        <Button
          size="lg"
          onClick={onVerify}
          style={{ width: '100%' }}
          icon={<ScanLine size={16} />}
        >
          Start Verification
        </Button>

        <Button
          size="md"
          variant="secondary"
          onClick={onReset}
          style={{ width: '100%' }}
          icon={<X size={14} />}
        >
          Remove and start over
        </Button>
      </Card>
    </div>
  );
}

/* ── Loading state ───────────────────────────────────────────────── */

const STEPS = [
  {
    label: 'Reading document data',
    sub: 'OCR extraction',
  },
  {
    label: 'Validating MRZ zone',
    sub: 'Check digit verification',
  },
  {
    label: 'Checking document expiry',
    sub: 'Date validation',
  },
  {
    label: 'Analysing for tampering',
    sub: 'Pixel-level forensics',
  },
  {
    label: 'Calculating risk',
    sub: 'Evidence-based risk fusion',
  },
];

function LoadingState({ file }) {
  const [step, setStep] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) =>
        Math.min(s + 1, STEPS.length - 1)
      );
    }, 420);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card
      style={{
        padding: '40px 32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 28,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <Spinner size={36} />

        <div
          style={{
            fontSize: '15px',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
          }}
        >
          Verifying document…
        </div>

        <div
          style={{
            fontSize: '12.5px',
            color: 'var(--color-text-muted)',
          }}
        >
          {file?.name}
        </div>
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: 420,
        }}
      >
        {STEPS.map((s, i) => (
          <div
            key={s.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '8px 0',
              opacity: i > step + 1 ? 0.3 : 1,
              transition: 'opacity var(--transition-base)',
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background:
                  i < step
                    ? 'var(--color-clear-bg)'
                    : i === step
                      ? 'var(--color-brand)'
                      : 'var(--color-surface-2)',
                border: `1px solid ${
                  i < step
                    ? 'var(--color-clear-border)'
                    : i === step
                      ? 'var(--color-brand)'
                      : 'var(--color-border)'
                }`,
              }}
            >
              {i < step ? (
                <CheckCircle
                  size={12}
                  style={{
                    color: 'var(--color-clear)',
                  }}
                />
              ) : i === step ? (
                <Spinner size={10} color="#fff" />
              ) : (
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background:
                      'var(--color-border-strong)',
                    display: 'block',
                  }}
                />
              )}
            </div>

            <div>
              <div
                style={{
                  fontSize: '12.5px',
                  fontWeight: i === step ? 600 : 400,
                  color:
                    i <= step
                      ? 'var(--color-text-primary)'
                      : 'var(--color-text-muted)',
                }}
              >
                {s.label}
              </div>

              {i === step && (
                <div
                  style={{
                    fontSize: '11px',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  {s.sub}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ── Result view ─────────────────────────────────────────────────── */

function ResultView({
  result,
  previewUrl,
  onReset,
}) {
  const {
    status,
    risk_score,
    document: doc,
    checks,
    reasons,
  } = result;

  const [expanded, setExpanded] = useState(false);

  const statusConfig = {
    CLEAR: {
      color: 'var(--color-clear)',
      bg: 'var(--color-clear-bg)',
      border: 'var(--color-clear-border)',
      icon: <CheckCircle size={22} />,
      label: 'Document cleared for entry.',
    },

    REVIEW: {
      color: 'var(--color-review)',
      bg: 'var(--color-review-bg)',
      border: 'var(--color-review-border)',
      icon: <AlertTriangle size={22} />,
      label: 'Manual review required before clearance.',
    },

    'HIGH-RISK': {
      color: 'var(--color-risk)',
      bg: 'var(--color-risk-bg)',
      border: 'var(--color-risk-border)',
      icon: <XCircle size={22} />,
      label: 'Document flagged. Do not clear without supervisor.',
    },
  };

  const cfg =
    statusConfig[status] || statusConfig.REVIEW;

  const checkLabels = {
    ocr: 'OCR Extraction',
    mrz: 'MRZ Validation',
    expiry: 'Expiry Check',
    tampering: 'Tampering Detection',
    face: 'Face Verification',
    consistency: 'Field Consistency',
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}
    >
      {/* Status banner */}

      <div
        style={{
          padding: '18px 24px',
          background: cfg.bg,
          border: `1px solid ${cfg.border}`,
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <div style={{ color: cfg.color }}>
          {cfg.icon}
        </div>

        <div style={{ flex: 1 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 2,
            }}
          >
            <StatusBadge
              status={status}
              size="lg"
            />

            <span
              style={{
                fontSize: '15px',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
              }}
            >
              {cfg.label}
            </span>
          </div>

          <div
            style={{
              fontSize: '12.5px',
              color: 'var(--color-text-secondary)',
            }}
          >
            Risk score:{' '}
            <strong style={{ color: cfg.color }}>
              {risk_score}/100
            </strong>
          </div>
        </div>

        <RiskBar score={risk_score} />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 20,
        }}
      >
        {/* Document image + info */}

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <Card style={{ padding: 16 }}>
            <div
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--color-text-muted)',
                marginBottom: 12,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Document
            </div>

            <div
              style={{
                background: 'var(--color-bg-subtle)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                marginBottom: 16,
                display: 'flex',
                justifyContent: 'center',
                padding: 8,
              }}
            >
              <img
                src={previewUrl}
                alt="Passport"
                style={{
                  maxWidth: '100%',
                  maxHeight: 220,
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              />
            </div>

            <InfoGrid
              data={[
                {
                  label: 'Passport No.',
                  value: doc?.passport_number,
                },
                {
                  label: 'Full Name',
                  value: doc?.name,
                },
                {
                  label: 'Nationality',
                  value: doc?.nationality,
                },
                {
                  label: 'Date of Birth',
                  value: doc?.date_of_birth_fmt,
                },
                {
                  label: 'Date of Expiry',
                  value: doc?.date_of_expiry_fmt,
                },
                {
                  label: 'Issued By',
                  value: doc?.issuing_country,
                },
              ]}
            />
          </Card>
        </div>

        {/* Checks + risk factors */}

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <Card style={{ padding: 20 }}>
            <div
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--color-text-muted)',
                marginBottom: 14,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Verification Checks
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              {Object.entries(checks || {}).map(
                ([key, val]) => (
                  <div
                    key={key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '13px',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      {checkLabels[key] || key}
                    </span>

                    <CheckBadge result={val} />
                  </div>
                )
              )}
            </div>
          </Card>

          <Card style={{ padding: 20 }}>
            <button
              onClick={() =>
                setExpanded((e) => !e)
              }
              style={{
                display: 'flex',
                width: '100%',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                {status === 'CLEAR'
                  ? 'Verification Notes'
                  : 'Risk Factors'}
              </span>

              {expanded ? (
                <ChevronUp size={14} />
              ) : (
                <ChevronDown size={14} />
              )}
            </button>

            {expanded && (
              <div
                style={{
                  marginTop: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                {reasons?.length ? (
                  reasons.map((r, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        gap: 10,
                        fontSize: '12.5px',
                        color: 'var(--color-text-secondary)',
                        lineHeight: 1.5,
                      }}
                    >
                      <span
                        style={{
                          color:
                            status === 'CLEAR'
                              ? 'var(--color-clear)'
                              : 'var(--color-review)',
                          flexShrink: 0,
                          marginTop: 2,
                        }}
                      >
                        {status === 'CLEAR'
                          ? '✓'
                          : '⚠'}
                      </span>

                      <span>{r}</span>
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      fontSize: '12.5px',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    No additional verification notes.
                  </div>
                )}
              </div>
            )}
          </Card>

          <Button
            variant="secondary"
            size="md"
            onClick={onReset}
            style={{ width: '100%' }}
            icon={<RotateCcw size={14} />}
          >
            Verify another document
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ── Risk Bar ────────────────────────────────────────────────────── */

function RiskBar({ score }) {
  const color =
    score >= 70
      ? 'var(--color-risk)'
      : score >= 30
        ? 'var(--color-review)'
        : 'var(--color-clear)';

  return (
    <div
      style={{
        textAlign: 'right',
        minWidth: 80,
      }}
    >
      <div
        style={{
          fontSize: '26px',
          fontWeight: 700,
          color,
          lineHeight: 1,
        }}
      >
        {score}
      </div>

      <div
        style={{
          fontSize: '10px',
          color: 'var(--color-text-muted)',
          marginBottom: 4,
        }}
      >
        Risk score
      </div>

      <div
        style={{
          width: 80,
          height: 5,
          background: 'var(--color-border)',
          borderRadius: 99,
        }}
      >
        <div
          style={{
            width: `${score}%`,
            height: '100%',
            background: color,
            borderRadius: 99,
            transition: 'width 600ms ease',
          }}
        />
      </div>
    </div>
  );
}

/* ── Info grid ───────────────────────────────────────────────────── */

function InfoGrid({ data }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px 16px',
      }}
    >
      {data.map(({ label, value }) => (
        <div key={label}>
          <div
            style={{
              fontSize: '10.5px',
              fontWeight: 600,
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: 2,
            }}
          >
            {label}
          </div>

          <div
            style={{
              fontSize: '12.5px',
              fontWeight: 500,
              color: 'var(--color-text-primary)',
            }}
          >
            {value || '—'}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Error state ─────────────────────────────────────────────────── */

function ErrorState({ message, onReset }) {
  return (
    <Card
      style={{
        padding: '48px 32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 'var(--radius-xl)',
          background: 'var(--color-risk-bg)',
          border: '1px solid var(--color-risk-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <XCircle
          size={24}
          style={{
            color: 'var(--color-risk)',
          }}
        />
      </div>

      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontSize: '15px',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            marginBottom: 6,
          }}
        >
          Verification failed
        </div>

        <div
          style={{
            fontSize: '13px',
            color: 'var(--color-text-secondary)',
            maxWidth: 400,
          }}
        >
          {message}
        </div>

        <div
          style={{
            fontSize: '12px',
            color: 'var(--color-text-muted)',
            marginTop: 6,
          }}
        >
          Retry or perform manual inspection.
        </div>
      </div>

      <Button
        size="md"
        onClick={onReset}
        icon={<RotateCcw size={14} />}
      >
        Try again
      </Button>
    </Card>
  );
}

/* ── helpers ─────────────────────────────────────────────────────── */

function formatFileSize(bytes) {
  if (!bytes) return '';

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}