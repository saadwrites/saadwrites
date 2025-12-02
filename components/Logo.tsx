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
    lg: "w-32 h-32", 
    xl: "w-40 h-40"
  };

  const textSizes = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-5xl",
    xl: "text-7xl"
  };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className={`${sizeClasses[size]} relative shrink-0`}>
        <svg 
          viewBox="0 0 100 100" 
          className="w-full h-full" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#78350f', stopOpacity: 1 }} />
              <stop offset="40%" style={{ stopColor: '#b45309', stopOpacity: 1 }} />
              <stop offset="80%" style={{ stopColor: '#fbbf24', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#fcd34d', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          
          {/* 
            Premium Artistic Feather
            Matches reference: Curved spine, distinct deep notches on the bottom edge, sharp quill.
          */}
          <g transform="translate(10, 10) scale(0.8)">
            <path 
              d="
                M 25,95 
                C 35,85 45,70 50,60
                C 50,60 48,62 46,64
                C 42,68 35,75 35,75
                C 30,65 25,45 40,20
                C 55,5 75,5 85,5
                C 85,5 80,15 75,25
                C 70,35 68,40 68,40
                L 60,42
                L 65,48
                C 60,58 55,62 55,62
                L 48,65
                L 52,70
                C 45,80 35,90 25,95
                Z
              " 
              fill="url(#goldGradient)" 
            />
            {/* Central Spine for definition */}
            <path 
              d="M 25,95 C 45,75 60,45 85,5" 
              fill="none" 
              stroke="rgba(255,255,255,0.3)" 
              strokeWidth="1"
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
            <span className="text-xs md:text-sm text-gold font-serif uppercase tracking-[0.4em] ml-1 mt-3 opacity-90 border-t border-gold/30 pt-2 inline-block">
              Thought & Ink
            </span>
          )}
        </div>
      )}
    </div>
  );
};
