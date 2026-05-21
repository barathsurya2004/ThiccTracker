interface Props {
  on: boolean;
  onChange: (v: boolean) => void;
}

export default function ToggleSwitch({ on, onChange }: Props) {
  return (
    <button
      onClick={() => onChange(!on)}
      aria-pressed={on}
      style={{
        width: 44, height: 26, borderRadius: 999,
        background: on ? 'var(--accent)' : 'var(--surface-2)',
        border: '1px solid ' + (on ? 'transparent' : 'var(--hairline)'),
        position: 'relative',
        transition: 'background 0.2s',
      }}
    >
      <span style={{
        position: 'absolute', top: 2, left: on ? 20 : 2,
        width: 20, height: 20, borderRadius: '50%',
        background: on ? 'var(--accent-ink)' : 'var(--text)',
        transition: 'left 0.2s',
      }} />
    </button>
  );
}
