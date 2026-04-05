import React from 'react';

type PageBackdropProps = {
    className?: string;
};

const PageBackdrop: React.FC<PageBackdropProps> = ({ className = '' }) => {
    return (
        <div aria-hidden="true" className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.98),_rgba(237,242,226,0.94)_45%,_rgba(215,226,185,0.9)_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(86,99,66,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(86,99,66,0.05)_1px,transparent_1px)] bg-[size:32px_32px] opacity-35 mix-blend-soft-light" />
            <div className="absolute -top-24 right-[-6rem] h-80 w-80 rounded-full bg-primary-container/40 blur-3xl" />
            <div className="absolute bottom-[-7rem] left-[-5rem] h-72 w-72 rounded-full bg-secondary-container/35 blur-3xl" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_48%,rgba(255,255,255,0.16)_100%)]" />
        </div>
    );
};

export default PageBackdrop;
