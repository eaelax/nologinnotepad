'use client';

import React from 'react';

interface AppLogoProps {
  size?: number;
  className?: string;
  tileRadius?: number;
}

export const AppLogo: React.FC<AppLogoProps> = ({ size = 28, className = '', tileRadius = 116 }) => {
  return (
    <div
      style={{ width: `${size}px`, height: `${size}px` }}
      className={`shrink-0 select-none flex items-center justify-center rounded-lg shadow-xs overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 512 512"
        width="100%"
        height="100%"
        className="w-full h-full block"
      >
        {/* Solid Black Rounded Squircle Tile */}
        <rect
          width="512"
          height="512"
          rx={tileRadius}
          fill="#000000"
          stroke="rgba(255, 255, 255, 0.14)"
          strokeWidth="6"
        />

        {/* Outer Rounded Notepad Frame: Bold White Stroke */}
        <rect
          x="114"
          y="107"
          width="284"
          height="320"
          rx="58"
          fill="none"
          stroke="#ffffff"
          strokeWidth="38"
          strokeLinejoin="round"
        />

        {/* 3 Top Binder Rings: White Capsules crossing top edge */}
        <rect x="162" y="67" width="34" height="78" rx="17" fill="#ffffff" />
        <rect x="239" y="67" width="34" height="78" rx="17" fill="#ffffff" />
        <rect x="316" y="67" width="34" height="78" rx="17" fill="#ffffff" />

        {/* 3 Horizontal Ruled Lines inside Notepad */}
        <rect x="170" y="185" width="172" height="32" rx="16" fill="#ffffff" />
        <rect x="170" y="251" width="172" height="32" rx="16" fill="#ffffff" />
        <rect x="170" y="317" width="172" height="32" rx="16" fill="#ffffff" />
      </svg>
    </div>
  );
};
