import type { ReactNode } from 'react';

interface Props {
  title?: string;
  left?: ReactNode;
  right?: ReactNode;
}

export default function TopNav({ title, left, right }: Props) {
  return (
    <div className="topnav">
      <div className="row" style={{ gap: 8 }}>
        {left}
        {title && <div className="t-h2">{title}</div>}
      </div>
      <div className="row" style={{ gap: 8 }}>{right}</div>
    </div>
  );
}
