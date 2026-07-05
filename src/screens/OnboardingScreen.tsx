import { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { MEV_MRV } from '../utils/muscleMap';
import { Dumbbell, Sparkles, Check, Bolt, Arrow } from '../components/Icons';

const SLIDE_COUNT = 5;

/* ── Slide 2 mini demo: static MEV/MRV bars, animated fill on mount ── */
function MiniVolumeDemo({ active }: { active: boolean }) {
  const rows = [
    { name: 'Chest', done: 7, ...MEV_MRV.Chest },
    { name: 'Back', done: 14, ...MEV_MRV.Back },
    { name: 'Quads', done: 21, ...MEV_MRV.Quads },
  ];
  return (
    <div className="card stack-12" style={{ marginTop: 20 }}>
      {rows.map(row => {
        const max = row.mrv * 1.15;
        const pct = (v: number) => Math.min(100, (v / max) * 100);
        return (
          <div key={row.name}>
            <div className="between" style={{ marginBottom: 6 }}>
              <span className="t-small" style={{ fontWeight: 500 }}>{row.name}</span>
              <span className="t-mono t-small dim">{row.done} sets</span>
            </div>
            <div className="volbar">
              <div className="zone" style={{ left: 0, width: `${pct(row.mev)}%`, background: 'color-mix(in oklch, var(--text-3) 15%, transparent)' }} />
              <div className="zone" style={{ left: `${pct(row.mev)}%`, width: `${pct(row.mav) - pct(row.mev)}%`, background: 'color-mix(in oklch, var(--accent) 12%, transparent)' }} />
              <div className="zone" style={{ left: `${pct(row.mav)}%`, width: `${pct(row.mrv) - pct(row.mav)}%`, background: 'color-mix(in oklch, var(--accent) 22%, transparent)' }} />
              <div className="fill" style={{ width: active ? `${pct(row.done)}%` : '0%', transition: 'width 0.8s ease' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TrustItem({ text }: { text: string }) {
  return (
    <div className="row" style={{ gap: 10 }}>
      <div style={{ width: 22, height: 22, borderRadius: 999, background: 'color-mix(in oklch, var(--accent) 18%, transparent)', color: 'var(--accent)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        <Check width={12} height={12} />
      </div>
      <span className="t-body">{text}</span>
    </div>
  );
}

export default function OnboardingScreen() {
  const { setHasSeenOnboarding, loginGuest, setScreen } = useApp();
  const [idx, setIdx] = useState(0);
  const [dragPx, setDragPx] = useState(0);
  const dragging = useRef(false);
  const startX = useRef(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const notifRequested = useRef(false);

  useEffect(() => {
    if (idx >= SLIDE_COUNT - 1 && !notifRequested.current) {
      notifRequested.current = true;
      if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    }
  }, [idx]);

  const goTo = (next: number) => setIdx(Math.max(0, Math.min(SLIDE_COUNT - 1, next)));
  const skip = () => goTo(SLIDE_COUNT - 1);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    startX.current = e.clientX;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    setDragPx(e.clientX - startX.current);
  };
  const endDrag = () => {
    if (!dragging.current) return;
    dragging.current = false;
    const width = trackRef.current?.parentElement?.clientWidth || 1;
    const threshold = width * 0.18;
    if (dragPx < -threshold) goTo(idx + 1);
    else if (dragPx > threshold) goTo(idx - 1);
    setDragPx(0);
  };

  const goEmail = () => { setHasSeenOnboarding(true); setScreen('login'); };
  const goGuest = () => { setHasSeenOnboarding(true); loginGuest(); };

  return (
    <div className="screen no-tab" style={{ paddingTop: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {idx < SLIDE_COUNT - 1 && (
        <button className="t-small" onClick={skip} style={{ position: 'absolute', top: 54, right: 20, zIndex: 5, color: 'var(--text-2)', fontWeight: 500 }}>
          Skip
        </button>
      )}

      <div
        style={{ flex: 1, overflow: 'hidden', touchAction: 'pan-y' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div
          ref={trackRef}
          style={{
            display: 'flex', width: `${SLIDE_COUNT * 100}%`, height: '100%',
            transform: `translateX(calc(-${idx * (100 / SLIDE_COUNT)}% + ${dragPx}px))`,
            transition: dragging.current ? 'none' : 'transform 0.35s ease',
          }}
        >
          {/* Slide 1 — Hook */}
          <div style={{ width: `${100 / SLIDE_COUNT}%`, flexShrink: 0, padding: '80px 24px 0' }}>
            <div style={{ width: 72, height: 72, borderRadius: 22, background: 'var(--accent)', color: 'var(--accent-ink)', display: 'grid', placeItems: 'center', boxShadow: '0 12px 32px color-mix(in oklch, var(--accent) 35%, transparent)' }}>
              <Dumbbell width={32} height={32} />
            </div>
            <div className="t-display" style={{ marginTop: 28, letterSpacing: '-0.03em' }}>STOP GUESSING.<br />START TRACKING.</div>
            <div className="t-body dim" style={{ marginTop: 14, maxWidth: 280 }}>
              Free to use. No subscription. No 20-question quiz.
            </div>
          </div>

          {/* Slide 2 — Problem */}
          <div style={{ width: `${100 / SLIDE_COUNT}%`, flexShrink: 0, padding: '80px 24px 0' }}>
            <div className="t-h1" style={{ letterSpacing: '-0.025em' }}>MOST LIFTERS TRAIN<br />IN THE DARK.</div>
            <div className="t-body dim" style={{ marginTop: 14, maxWidth: 300 }}>
              Tonnage tracks your weekly sets per muscle against MEV/MAV/MRV — the volume landmarks that actually drive growth.
            </div>
            <MiniVolumeDemo active={idx === 1} />
          </div>

          {/* Slide 3 — AI */}
          <div style={{ width: `${100 / SLIDE_COUNT}%`, flexShrink: 0, padding: '80px 24px 0' }}>
            <div style={{ width: 72, height: 72, borderRadius: 22, background: 'var(--surface)', border: '1px solid var(--hairline)', color: 'var(--accent)', display: 'grid', placeItems: 'center' }}>
              <Sparkles width={30} height={30} />
            </div>
            <div className="t-display" style={{ marginTop: 28, letterSpacing: '-0.03em' }}>YOUR PLAN,<br />BUILT BY AI.</div>
            <div className="card" style={{ marginTop: 20, padding: '14px 16px' }}>
              <div className="t-small dim">"3 day PPL, intermediate, focus on hypertrophy"</div>
            </div>
            <div className="t-small dim" style={{ marginTop: 12 }}>Unlocked by watching a short ad. That's it.</div>
          </div>

          {/* Slide 4 — Trust */}
          <div style={{ width: `${100 / SLIDE_COUNT}%`, flexShrink: 0, padding: '80px 24px 0' }}>
            <div className="t-h1" style={{ letterSpacing: '-0.025em' }}>NO CATCH.</div>
            <div className="stack-16" style={{ marginTop: 24 }}>
              <TrustItem text="Free forever" />
              <TrustItem text="No subscription" />
              <TrustItem text="Guest mode, no account needed" />
              <TrustItem text="Your data stays on this device" />
              <TrustItem text="Reminders you control" />
            </div>
            <div className="t-small dim" style={{ marginTop: 20 }}>
              We'll ask for notification permission on the next screen.
            </div>
          </div>

          {/* Slide 5 — Auth */}
          <div style={{ width: `${100 / SLIDE_COUNT}%`, flexShrink: 0, padding: '80px 24px 0' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--accent)', color: 'var(--accent-ink)', display: 'grid', placeItems: 'center', boxShadow: '0 8px 24px color-mix(in oklch, var(--accent) 30%, transparent)' }}>
              <Bolt width={28} height={28} />
            </div>
            <div className="t-h1" style={{ marginTop: 20, letterSpacing: '-0.025em' }}>READY TO LIFT?</div>
            <div className="stack-12" style={{ marginTop: 24 }}>
              <button className="btn primary" onClick={goEmail}>
                Sign in with email
                <Arrow width={16} height={16} />
              </button>
              <button className="btn ghost" onClick={goGuest}>Continue without account</button>
            </div>
          </div>
        </div>
      </div>

      <div className="row" style={{ justifyContent: 'center', gap: 6, padding: '0 0 40px' }}>
        {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
          <div key={i} style={{
            height: 8, width: i === idx ? 24 : 8, borderRadius: 999,
            background: i === idx ? 'var(--accent)' : 'var(--surface-2)',
            transition: 'width 0.25s ease, background 0.25s ease',
          }} />
        ))}
      </div>
    </div>
  );
}
