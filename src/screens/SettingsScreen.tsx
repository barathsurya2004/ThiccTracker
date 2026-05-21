import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import TopNav from '../components/TopNav';
import ToggleSwitch from '../components/ToggleSwitch';
import { Chev } from '../components/Icons';

const accentSwatches = [
  { name: 'Lime',   h: 130, l: 0.88, c: 0.19, ink: 'oklch(0.20 0.05 130)' },
  { name: 'Coral',  h: 28,  l: 0.74, c: 0.17, ink: 'oklch(0.99 0.005 240)' },
  { name: 'Azure',  h: 235, l: 0.74, c: 0.17, ink: 'oklch(0.99 0.005 240)' },
  { name: 'Violet', h: 295, l: 0.74, c: 0.17, ink: 'oklch(0.99 0.005 240)' },
];

function applyAccent(sw: typeof accentSwatches[0]) {
  document.documentElement.style.setProperty('--accent', `oklch(${sw.l} ${sw.c} ${sw.h})`);
  document.documentElement.style.setProperty('--accent-ink', sw.ink);
  localStorage.setItem('accent-name', sw.name);
  localStorage.setItem('accent-hue', String(sw.h));
}

function applyTheme(t: string) {
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('theme', t);
}

export default function SettingsScreen() {
  const { user, logout } = useApp();
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [activeAccent, setActiveAccent] = useState(() => localStorage.getItem('accent-name') || 'Lime');
  const [notif, setNotif] = useState({ workouts: true, deload: true, weekly: false });
  const [units, setUnits] = useState('kg');

  useEffect(() => {
    const saved = localStorage.getItem('accent-name');
    if (saved) {
      const sw = accentSwatches.find(s => s.name === saved);
      if (sw) applyAccent(sw);
    }
  }, []);

  const handleTheme = (t: string) => {
    setTheme(t);
    applyTheme(t === 'system' ? 'dark' : t);
  };

  const handleAccent = (sw: typeof accentSwatches[0]) => {
    setActiveAccent(sw.name);
    applyAccent(sw);
  };

  const SettingsRow = ({ title, sub, right, onClick, danger }: { title: string; sub?: string; right?: React.ReactNode; onClick?: () => void; danger?: boolean }) => (
    <button className="row-item" onClick={onClick}
      style={{ width: '100%', textAlign: 'left', background: 'transparent', cursor: onClick ? 'pointer' : 'default', color: danger ? 'var(--warn)' : 'inherit' }}>
      <div className="col" style={{ flex: 1 }}>
        <div className="t-body" style={{ fontWeight: 500 }}>{title}</div>
        {sub && <div className="t-small dim">{sub}</div>}
      </div>
      {right}
    </button>
  );

  const initials = user.name.split(' ').map(n => n[0]).join('').slice(0, 2);

  return (
    <div className="screen">
      <TopNav title="Settings" />
      <div className="section stack-24" style={{ paddingTop: 12 }}>

        {/* Profile card */}
        <div className="card" style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: 18, background: 'var(--accent)', color: 'var(--accent-ink)', display: 'grid', placeItems: 'center', fontWeight: 600, fontSize: 22, letterSpacing: '-0.02em', fontFamily: 'var(--ff-mono)' }}>
            {initials}
          </div>
          <div className="col" style={{ flex: 1, minWidth: 0 }}>
            <div className="t-h3">{user.name}</div>
            <div className="t-small dim" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
          </div>
          <button className="btn compact ghost" style={{ width: 'auto' }}>Edit</button>
        </div>

        {/* Appearance */}
        <div>
          <div className="t-caps" style={{ marginBottom: 10 }}>Appearance</div>
          <div className="card" style={{ padding: 0 }}>
            <div className="row-item">
              <div className="col" style={{ flex: 1 }}>
                <div className="t-body" style={{ fontWeight: 500 }}>Theme</div>
                <div className="t-small dim">Light, dark or follow system</div>
              </div>
              <div className="seg">
                {['light', 'dark', 'system'].map(t => (
                  <button key={t} className={theme === t ? 'on' : ''} onClick={() => handleTheme(t)}>{t}</button>
                ))}
              </div>
            </div>
            <div className="row-item">
              <div className="col" style={{ flex: 1 }}>
                <div className="t-body" style={{ fontWeight: 500 }}>Accent</div>
                <div className="t-small dim">Shifts primary actions & chart highlights</div>
              </div>
              <div className="row" style={{ gap: 8 }}>
                {accentSwatches.map(sw => (
                  <button key={sw.name} onClick={() => handleAccent(sw)} aria-label={sw.name}
                    style={{ width: 26, height: 26, borderRadius: 8, background: `oklch(${sw.l} ${sw.c} ${sw.h})`, outline: activeAccent === sw.name ? '2px solid var(--text)' : '1px solid var(--hairline)', outlineOffset: 2, transition: 'transform 0.12s' }} />
                ))}
              </div>
            </div>
            <div className="row-item">
              <div className="col" style={{ flex: 1 }}>
                <div className="t-body" style={{ fontWeight: 500 }}>Units</div>
                <div className="t-small dim">Used across the app</div>
              </div>
              <div className="seg">
                <button className={units === 'kg' ? 'on' : ''} onClick={() => setUnits('kg')}>kg</button>
                <button className={units === 'lb' ? 'on' : ''} onClick={() => setUnits('lb')}>lb</button>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div>
          <div className="t-caps" style={{ marginBottom: 10 }}>Notifications</div>
          <div className="card" style={{ padding: 0 }}>
            {[
              { key: 'workouts' as const, title: 'Workout reminders', sub: 'Before scheduled sessions' },
              { key: 'deload' as const,   title: 'Deload suggestions',  sub: 'When fatigue trend rises' },
              { key: 'weekly' as const,   title: 'Weekly recap',         sub: 'Sunday evening digest' },
            ].map(item => (
              <div className="row-item" key={item.key}>
                <div className="col" style={{ flex: 1 }}>
                  <div className="t-body" style={{ fontWeight: 500 }}>{item.title}</div>
                  <div className="t-small dim">{item.sub}</div>
                </div>
                <ToggleSwitch on={notif[item.key]} onChange={(v) => setNotif(n => ({ ...n, [item.key]: v }))} />
              </div>
            ))}
          </div>
        </div>

        {/* Profile */}
        <div>
          <div className="t-caps" style={{ marginBottom: 10 }}>Profile</div>
          <div className="card" style={{ padding: 0 }}>
            <SettingsRow title="Personal info" sub="Name, age, bodyweight" right={<Chev width={16} height={16} className="dim" />} />
            <SettingsRow title="Training goals" sub="Hypertrophy + aerobic base" right={<Chev width={16} height={16} className="dim" />} />
            <SettingsRow title="Connected apps" sub="Apple Health, Strava" right={<Chev width={16} height={16} className="dim" />} />
          </div>
        </div>

        <div>
          <div className="t-caps" style={{ marginBottom: 10 }}>Account</div>
          <div className="card" style={{ padding: 0 }}>
            <SettingsRow title="Export data" sub="CSV of all sessions" right={<Chev width={16} height={16} className="dim" />} />
            <SettingsRow title="Help & support" right={<Chev width={16} height={16} className="dim" />} />
            <SettingsRow danger title="Log out" onClick={logout} />
          </div>
        </div>

        <div className="t-small dim-2" style={{ textAlign: 'center', padding: '8px 0 24px' }}>
          Tonnage v1.0.0 — Build 2026.05.21
        </div>
      </div>
    </div>
  );
}
