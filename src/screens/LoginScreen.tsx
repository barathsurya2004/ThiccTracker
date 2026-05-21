import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { load, save, KEYS } from '../utils/storage';
import { Bolt, Arrow } from '../components/Icons';

interface Creds { email: string; password: string; name: string; }

export default function LoginScreen() {
  const { login } = useApp();
  const [mode, setMode] = useState<'signin' | 'signup'>(() => {
    const existing = load<Creds | null>(KEYS.credentials, null);
    return existing ? 'signin' : 'signup';
  });
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (mode === 'signup' && !name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      if (mode === 'signup') {
        const existing = load<Creds | null>(KEYS.credentials, null);
        if (existing && existing.email.toLowerCase() === email.toLowerCase()) {
          setError('An account with this email already exists. Sign in instead.');
          setLoading(false);
          return;
        }
        const creds: Creds = { email: email.trim(), password, name: name.trim() };
        save(KEYS.credentials, creds);
        login({ name: name.trim(), email: email.trim(), avatar: null });
      } else {
        const stored = load<Creds | null>(KEYS.credentials, null);
        if (!stored) {
          setError('No account found. Create one first.');
          setMode('signup');
          setLoading(false);
          return;
        }
        if (stored.email.toLowerCase() !== email.toLowerCase()) {
          setError('Email not found.');
          setLoading(false);
          return;
        }
        if (stored.password !== password) {
          setError('Incorrect password.');
          setLoading(false);
          return;
        }
        login({ name: stored.name, email: stored.email, avatar: null });
      }
    }, 600);
  };

  return (
    <div className="screen no-tab" style={{ paddingTop: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100%' }}>
      <div className="section" style={{ paddingTop: 48, paddingBottom: 48 }}>
        {/* Brand */}
        <div className="col" style={{ alignItems: 'flex-start', gap: 4 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'var(--accent)', color: 'var(--accent-ink)',
            display: 'grid', placeItems: 'center',
            boxShadow: '0 8px 24px color-mix(in oklch, var(--accent) 30%, transparent)',
          }}>
            <Bolt width={28} height={28} />
          </div>
          <div className="t-display" style={{ marginTop: 20, letterSpacing: '-0.04em' }}>Tonnage.</div>
          <div className="t-body dim" style={{ maxWidth: 260, marginTop: 6 }}>
            Periodized training, made measurable.
          </div>
        </div>

        <div style={{ height: 32 }} />

        <div className="seg" style={{ width: '100%' }}>
          <button className={mode === 'signin' ? 'on' : ''} onClick={() => { setMode('signin'); setError(''); }} style={{ flex: 1 }}>Sign in</button>
          <button className={mode === 'signup' ? 'on' : ''} onClick={() => { setMode('signup'); setError(''); }} style={{ flex: 1 }}>Create account</button>
        </div>

        <form onSubmit={submit} className="stack-12" style={{ marginTop: 20 }}>
          {mode === 'signup' && (
            <input className="field" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} autoComplete="name" />
          )}
          <input className="field" type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
          <input className="field" type="password" placeholder="Password (min 6 chars)" value={password} onChange={e => setPassword(e.target.value)} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} />

          {error && (
            <div style={{
              padding: '12px 14px', borderRadius: 12,
              background: 'color-mix(in oklch, var(--warn) 12%, var(--surface))',
              border: '1px solid color-mix(in oklch, var(--warn) 30%, transparent)',
              color: 'var(--warn)', fontSize: 13,
            }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn primary" disabled={loading}>
            {loading ? (mode === 'signup' ? 'Creating account…' : 'Signing in…') : (mode === 'signin' ? 'Continue' : 'Create account')}
            {!loading && <Arrow width={16} height={16} />}
          </button>
        </form>

        <div className="t-small" style={{ marginTop: 24, textAlign: 'center', color: 'var(--text-3)' }}>
          Your data stays on this device.
        </div>
      </div>
    </div>
  );
}
