import React from 'react';

// Empty backdrop — the redesign relies on a single flat warm-white surface
// instead of stacked radial gradients. Kept exported so pages that imported
// it (PageBackdrop) continue to compile cleanly.
const PageBackdrop: React.FC<{ className?: string }> = () => null;

export default PageBackdrop;
