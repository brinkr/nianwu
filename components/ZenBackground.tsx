import React from 'react';

const ZenBackground = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-[#f2f0e9]">
      <svg className="w-full h-full opacity-60" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <filter id="blurFilter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="20" />
          </filter>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e7e5e4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#d6d3d1" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="grad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f5f5f4" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#fffbeb" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="grad3" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#d6d3d1" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#e7e5e4" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Orb 1: Top Left - Breathing Warmth */}
        <circle cx="20" cy="20" r="40" fill="url(#grad1)" filter="url(#blurFilter)">
          <animate attributeName="cx" values="20;30;20" dur="20s" repeatCount="indefinite" />
          <animate attributeName="cy" values="20;10;20" dur="25s" repeatCount="indefinite" />
          <animate attributeName="r" values="40;45;40" dur="15s" repeatCount="indefinite" />
        </circle>

        {/* Orb 2: Bottom Right - Grounding Coolness */}
        <circle cx="80" cy="80" r="35" fill="url(#grad2)" filter="url(#blurFilter)">
          <animate attributeName="cx" values="80;70;80" dur="22s" repeatCount="indefinite" />
          <animate attributeName="cy" values="80;90;80" dur="28s" repeatCount="indefinite" />
          <animate attributeName="r" values="35;40;35" dur="18s" repeatCount="indefinite" />
        </circle>

        {/* Orb 3: Center/Moving - Subtle Flow */}
        <circle cx="50" cy="50" r="25" fill="url(#grad3)" filter="url(#blurFilter)">
          <animate attributeName="cx" values="50;60;40;50" dur="30s" repeatCount="indefinite" />
          <animate attributeName="cy" values="50;40;60;50" dur="35s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;0.6;0.3" dur="10s" repeatCount="indefinite" />
        </circle>
      </svg>
      
      {/* Subtle Grain Overlay */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-multiply pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")` }}></div>
    </div>
  );
};

export default ZenBackground;
