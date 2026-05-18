// Hand-drawn lucide-style icons. Stroke-based, 24x24 viewBox.
// All take optional size + className.

const Ico = ({ d, size = 18, className = 'icon', style }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" style={style}>
    {Array.isArray(d) ? d.map((dd, i) => <path key={i} d={dd} />) : <path d={d} />}
  </svg>
);

const Icons = {
  Home: (p) => <Ico {...p} d={['M3 11l9-8 9 8', 'M5 10v10h14V10']} />,
  Dumbbell: (p) => <Ico {...p} d={['M6 6v12M18 6v12', 'M3 9v6M21 9v6', 'M6 12h12']} />,
  BarChart: (p) => <Ico {...p} d={['M3 21h18', 'M7 17V10', 'M12 17V5', 'M17 17v-8']} />,
  Plus: (p) => <Ico {...p} d={['M12 5v14', 'M5 12h14']} />,
  Sparkles: (p) => <Ico {...p} d={['M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z', 'M19 16l.7 2.1L22 19l-2.3.9L19 22l-.7-2.1L16 19l2.3-.9L19 16z']} />,
  Play: (p) => <Ico {...p} d={'M7 5l12 7-12 7V5z'} />,
  Pause: (p) => <Ico {...p} d={['M8 5v14', 'M16 5v14']} />,
  Check: (p) => <Ico {...p} d={'M5 12l4 4 10-10'} />,
  ArrowRight: (p) => <Ico {...p} d={['M5 12h14', 'M13 5l7 7-7 7']} />,
  ArrowUp: (p) => <Ico {...p} d={['M12 19V5', 'M5 12l7-7 7 7']} />,
  Close: (p) => <Ico {...p} d={['M6 6l12 12', 'M18 6L6 18']} />,
  Flame: (p) => <Ico {...p} d={'M12 3c0 4 4 5 4 9a4 4 0 1 1-8 0c0-2 1-3 1-4 0 1 1 2 2 2 0-3-1-4 1-7z'} />,
  Calendar: (p) => <Ico {...p} d={['M5 5h14v15H5z', 'M5 9h14', 'M9 3v4', 'M15 3v4']} />,
  Clock: (p) => <Ico {...p} d={['M12 7v5l3 2', 'M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18z']} />,
  Target: (p) => <Ico {...p} d={['M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18z', 'M12 17a5 5 0 1 1 0-10 5 5 0 0 1 0 10z', 'M12 13a1 1 0 1 1 0-2 1 1 0 0 1 0 2z']} />,
  Activity: (p) => <Ico {...p} d={'M3 12h4l2-6 4 12 2-6h6'} />,
  Coffee: (p) => <Ico {...p} d={['M4 11h13v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-6z', 'M17 13h2a2 2 0 0 1 0 4h-2', 'M7 4v2M11 4v2M15 4v2']} />,
  FastForward: (p) => <Ico {...p} d={'M4 5l8 7-8 7V5zm10 0l8 7-8 7V5z'} />,
  ChevronRight: (p) => <Ico {...p} d={'M9 6l6 6-6 6'} />,
  ChevronDown: (p) => <Ico {...p} d={'M6 9l6 6 6-6'} />,
  TrendUp: (p) => <Ico {...p} d={['M3 17l6-6 4 4 8-8', 'M14 7h7v7']} />,
  Settings: (p) => <Ico {...p} d={['M12 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6z', 'M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z']} />,
  Bolt: (p) => <Ico {...p} d={'M13 2L4 14h7l-1 8 9-12h-7l1-8z'} />,
  Layers: (p) => <Ico {...p} d={['M12 3l9 5-9 5-9-5 9-5z', 'M3 13l9 5 9-5', 'M3 18l9 5 9-5']} />,
  Search: (p) => <Ico {...p} d={['M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16z', 'M21 21l-4.5-4.5']} />,
  MoreH: (p) => <Ico {...p} d={['M6 12h.01', 'M12 12h.01', 'M18 12h.01']} />,
};

window.Icons = Icons;
