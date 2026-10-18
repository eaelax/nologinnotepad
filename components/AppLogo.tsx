'use client';

import React from 'react';

interface AppLogoProps {
  size?: number;
  className?: string;
  tileRadius?: number;
}

export const AppLogo: React.FC<AppLogoProps> = ({ size = 28, className = '' }) => {
  return (
    <div
      style={{ width: `${size}px`, height: `${size}px` }}
      className={`shrink-0 select-none flex items-center justify-center relative ${className}`}
      aria-hidden="true"
    >
      {/* Light theme PNG logo */}
      <img
        src="/nologinnotepad-lighttheme-logo.png"
        alt="NoLoginNotepad"
        width={size}
        height={size}
        className="w-full h-full object-contain block dark:hidden pointer-events-none"
        loading="eager"
        onError={(e) => {
          e.currentTarget.src = '/icon.svg';
        }}
      />
      {/* Dark theme PNG logo */}
      <img
        src="/nologinnotepad-darktheme-logo.png"
        alt="NoLoginNotepad"
        width={size}
        height={size}
        className="w-full h-full object-contain hidden dark:block pointer-events-none"
        loading="eager"
        onError={(e) => {
          e.currentTarget.src = '/icon.svg';
        }}
      />
    </div>
  );
};
