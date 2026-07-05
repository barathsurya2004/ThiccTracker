import { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Close } from './Icons';

/**
 * AdSense-shaped placeholders — no real ad network wired up yet.
 * Swap the placeholder markup for real <ins class="adsbygoogle"> / rewarded SDK
 * calls once you have a publisher ID (VITE_ADSENSE_CLIENT).
 */

export function BannerAd() {
  const { adsDisabled } = useApp();
  if (adsDisabled) return null;
  return (
    <div className="ad-banner" data-ad-client={import.meta.env.VITE_ADSENSE_CLIENT ?? ''}>
      <span className="t-small dim-2">Advertisement</span>
    </div>
  );
}

export function InterstitialGate({ onDone, title = 'Nice work.' }: { onDone: () => void; title?: string }) {
  const { adsDisabled } = useApp();

  useEffect(() => {
    if (adsDisabled) onDone();
    // only fire once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (adsDisabled) return null;

  return (
    <div className="ad-modal enter">
      <div className="ad-modal-card">
        <span className="t-caps dim-2">Advertisement</span>
        <div style={{ height: 16 }} />
        <div className="t-h3">{title}</div>
        <div className="t-small dim" style={{ marginTop: 6 }}>An ad would normally play here.</div>
        <button className="btn primary" style={{ marginTop: 24 }} onClick={onDone}>Continue</button>
      </div>
    </div>
  );
}

export function RewardedGate({ onUnlock, onDismiss }: { onUnlock: () => void; onDismiss: () => void }) {
  const { adsDisabled } = useApp();

  useEffect(() => {
    if (adsDisabled) onUnlock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (adsDisabled) return null;

  return (
    <div className="ad-modal enter">
      <button className="btn icon" onClick={onDismiss} style={{ position: 'absolute', top: 54, right: 20 }}>
        <Close width={16} height={16} />
      </button>
      <div className="ad-modal-card">
        <div className="pulse" style={{ width: 56, height: 56, borderRadius: 18, background: 'var(--accent)', color: 'var(--accent-ink)', display: 'grid', placeItems: 'center', margin: '0 auto' }}>
          <Sparkles width={24} height={24} />
        </div>
        <div className="t-h3" style={{ marginTop: 16 }}>Watch an ad to unlock AI</div>
        <div className="t-small dim" style={{ marginTop: 6 }}>
          A rewarded ad would normally play here before unlocking the AI plan builder.
        </div>
        <button className="btn primary" style={{ marginTop: 20 }} onClick={onUnlock}>Simulate ad watched</button>
      </div>
    </div>
  );
}
