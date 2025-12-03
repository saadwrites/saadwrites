import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Logo: React.FC<LogoProps> = ({ className = "", showText = true, size = 'md' }) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-24 h-24", 
    xl: "w-32 h-32"
  };

  const textSizes = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-5xl",
    xl: "text-7xl"
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${sizeClasses[size]} relative shrink-0`}>
        <svg 
          viewBox="0 0 100 100" 
          className="w-full h-full drop-shadow-sm" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="siteGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#b45309', stopOpacity: 1 }} /> {/* Dark Gold */}
              <stop offset="50%" style={{ stopColor: '#d97706', stopOpacity: 1 }} /> {/* Medium Gold */}
              <stop offset="100%" style={{ stopColor: '#fbbf24', stopOpacity: 1 }} /> {/* Light Gold */}
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          
          {/* 
             Sleek Feather Quill Design
             - Sharp quill tip (calamus)
             - Elegant curve
             - Distinct gaps/notches to look like a feather, not a leaf
          */}
          <g transform="translate(15, 10) scale(0.75) rotate(-15, 50, 50)">
            {/* The main vane (feather part) */}
            <path 
              d="M50,95 C50,95 48,70 20,45 C10,35 15,20 15,20 C35,25 45,40 50,55 C55,40 75,10 90,5 C90,5 85,25 70,40 C65,45 60,50 60,50 L65,55 C65,55 58,60 55,62 L60,68 C60,68 52,75 50,95 Z" 
              fill="url(#siteGoldGradient)" 
              stroke="#78350f" 
              strokeWidth="0.5"
            />
            {/* The Rachis (Central Shaft) - White/Light for contrast */}
            <path 
              d="M50,95 Q50,60 90,5" 
              fill="none" 
              stroke="rgba(255,255,255,0.6)" 
              strokeWidth="2" 
              strokeLinecap="round"
            />
          </g>
        </svg>
      </div>
      
      {showText && (
        <div className="flex flex-col select-none">
          <h1 className={`${textSizes[size]} font-kalpurush font-bold text-charcoal dark:text-stone-100 tracking-tight leading-none`}>
            SaadWrites
          </h1>
          {(size === 'lg' || size === 'xl') && (
            <span className="text-xs md:text-sm text-gold font-serif uppercase tracking-[0.4em] ml-1 mt-2 opacity-90 block">
              Thought & Ink
            </span>
          )}
        </div>
      )}
    </div>
  );
};