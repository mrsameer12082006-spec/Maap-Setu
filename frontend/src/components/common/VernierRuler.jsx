import React from 'react';

/**
 * Precision Metrology Scaler / Ruler Divider
 * Features hierarchical tick marks: Major (8px), Half (6px), and Minor (4px)
 * Repeating over a 50px precision block with 0.4 opacity.
 */
export const VernierRuler = ({ className = '', height = 'h-2' }) => {
  return (
    <div
      className={`w-full ${height} border-b border-slate-200 select-none ${className}`}
      style={{
        backgroundImage: `url('data:image/svg+xml;utf8,<svg width="50" height="8" xmlns="http://www.w3.org/2000/svg"><path d="M0,0 v8 M5,4 v4 M10,4 v4 M15,4 v4 M20,4 v4 M25,2 v6 M30,4 v4 M35,4 v4 M40,4 v4 M45,4 v4" stroke="%2394a3b8" stroke-width="1" fill="none"/></svg>')`,
        backgroundRepeat: 'repeat-x',
        backgroundPosition: 'bottom',
        opacity: 0.4
      }}
      aria-hidden="true"
    />
  );
};
