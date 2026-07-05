import { useLayoutEffect, useState, type RefObject } from 'react';

export interface TutorialStep {
  title: string;
  description: string;
  targetRef: RefObject<HTMLElement | null>;
}

const PAD = 8;

export default function TutorialOverlay({ steps, onDone }: { steps: TutorialStep[]; onDone: () => void }) {
  const [idx, setIdx] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const step = steps[idx];

  useLayoutEffect(() => {
    const el = step.targetRef.current;
    setRect(el ? el.getBoundingClientRect() : null);
  }, [idx, step.targetRef]);

  if (!rect) return null;

  const flipAbove = rect.bottom > window.innerHeight * 0.55;
  const isLast = idx === steps.length - 1;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300 }} onClick={e => e.stopPropagation()}>
      <div
        style={{
          position: 'fixed',
          top: rect.top - PAD, left: rect.left - PAD,
          width: rect.width + PAD * 2, height: rect.height + PAD * 2,
          borderRadius: 14,
          boxShadow: '0 0 0 9999px rgba(0,0,0,0.75)',
          pointerEvents: 'none',
          transition: 'top 0.25s ease, left 0.25s ease, width 0.25s ease, height 0.25s ease',
        }}
      />
      <div
        className="card enter"
        style={{
          position: 'fixed',
          left: 20, right: 20,
          [flipAbove ? 'bottom' : 'top']: flipAbove
            ? window.innerHeight - rect.top + PAD + 12
            : rect.bottom + PAD + 12,
          maxWidth: 360, margin: '0 auto',
        }}
      >
        <div className="t-caps dim-2">Step {idx + 1} of {steps.length}</div>
        <div className="t-h3" style={{ marginTop: 6 }}>{step.title}</div>
        <div className="t-small dim" style={{ marginTop: 4 }}>{step.description}</div>
        <div className="row" style={{ gap: 8, marginTop: 14 }}>
          <button className="btn ghost compact" style={{ width: 'auto' }} onClick={onDone}>Skip</button>
          <div style={{ flex: 1 }} />
          <button className="btn primary compact" style={{ width: 'auto' }} onClick={() => (isLast ? onDone() : setIdx(i => i + 1))}>
            {isLast ? 'Done' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
