import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const base: IconProps = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' } as IconProps;

export const Home = (p: IconProps) => <svg {...base} {...p}><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/></svg>;
export const Plan = (p: IconProps) => <svg {...base} {...p}><rect x="3" y="4" width="18" height="17" rx="3"/><path d="M3 9h18M8 2v4M16 2v4"/></svg>;
export const Play = (p: IconProps) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M7 4l13 8L7 20z"/></svg>;
export const Chart = (p: IconProps) => <svg {...base} {...p}><path d="M4 20V8M10 20V4M16 20v-9M22 20H2"/></svg>;
export const Gear = (p: IconProps) => <svg {...base} {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>;
export const Dumbbell = (p: IconProps) => <svg {...base} {...p}><path d="M6 4v16M10 7v10M14 7v10M18 4v16M2 10v4M22 10v4M6 10h4M14 10h4M6 14h4M14 14h4"/></svg>;
export const Wave = (p: IconProps) => <svg {...base} {...p}><path d="M2 12c2 0 2 -3 5 -3s3 3 5 3 2-3 5-3 3 3 5 3"/><path d="M2 17c2 0 2 -3 5 -3s3 3 5 3 2-3 5-3 3 3 5 3"/></svg>;
export const Bodyweight = (p: IconProps) => <svg {...base} {...p}><circle cx="12" cy="5" r="2.2"/><path d="M5 11l4-2 3 1 3-1 4 2M9 10v11M15 10v11"/></svg>;
export const Rest = (p: IconProps) => <svg {...base} {...p}><path d="M4 6h7l-7 12h7M14 6h7l-7 12h7"/></svg>;
export const Fire = (p: IconProps) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 2s4 4 4 8a4 4 0 0 1-8 0c0-2 1-3 1-3-2 2-4 4-4 7a7 7 0 0 0 14 0c0-5-7-12-7-12z"/></svg>;
export const Plus = (p: IconProps) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" {...p}><path d="M12 5v14M5 12h14"/></svg>;
export const Trash = (p: IconProps) => <svg {...base} strokeWidth={1.6} {...p}><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>;
export const Check = (p: IconProps) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 12l5 5L20 6"/></svg>;
export const Chev = (p: IconProps) => <svg {...base} strokeWidth={1.8} {...p}><path d="M9 6l6 6-6 6"/></svg>;
export const ChevDown = (p: IconProps) => <svg {...base} strokeWidth={1.8} {...p}><path d="M6 9l6 6 6-6"/></svg>;
export const ChevLeft = (p: IconProps) => <svg {...base} strokeWidth={1.8} {...p}><path d="M15 6l-6 6 6 6"/></svg>;
export const Bolt = (p: IconProps) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M13 2L3 14h7l-1 8 10-12h-7z"/></svg>;
export const Sparkles = (p: IconProps) => <svg {...base} {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.5 5.5l2.8 2.8M15.7 15.7l2.8 2.8M18.5 5.5l-2.8 2.8M8.3 15.7l-2.8 2.8"/></svg>;
export const Close = (p: IconProps) => <svg {...base} strokeWidth={1.8} {...p}><path d="M6 6l12 12M18 6L6 18"/></svg>;
export const Skip = (p: IconProps) => <svg {...base} strokeWidth={1.8} {...p}><path d="M5 4l10 8-10 8zM19 5v14"/></svg>;
export const Arrow = (p: IconProps) => <svg {...base} strokeWidth={1.8} {...p}><path d="M5 12h14M13 5l7 7-7 7"/></svg>;
export const ArrowUp = (p: IconProps) => <svg {...base} strokeWidth={1.8} {...p}><path d="M7 14l5-5 5 5"/></svg>;
export const User = (p: IconProps) => <svg {...base} {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>;
