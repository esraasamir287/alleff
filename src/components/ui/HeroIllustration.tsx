interface HeroIllustrationProps {
  className?: string;
}

export function HeroIllustration({ className = '' }: HeroIllustrationProps) {
  return (
    <svg
      viewBox="0 0 560 520"
      role="img"
      aria-label="طالبة بكالوريا تدرس البرمجة والذكاء الاصطناعي على جهاز محمول"
      className={`h-full w-full ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="hi-screen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#12124A" />
          <stop offset="100%" stopColor="#6C35C9" />
        </linearGradient>
        <linearGradient id="hi-base" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6C35C9" />
          <stop offset="100%" stopColor="#482680" />
        </linearGradient>
        <linearGradient id="hi-circle" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F6F2FF" />
          <stop offset="100%" stopColor="#E8DDFB" />
        </linearGradient>
      </defs>

      {/* Background decorative blob */}
      <ellipse cx="280" cy="250" rx="250" ry="210" fill="url(#hi-circle)" />

      {/* Floating code brackets */}
      <g fill="#6C35C9" opacity="0.18">
        <path d="M70 90 L55 110 L70 130" stroke="#6C35C9" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M120 70 L140 90 L120 110" stroke="#6C35C9" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g fill="#F4C542" opacity="0.85">
        <circle cx="470" cy="110" r="6" />
        <circle cx="495" cy="150" r="4" />
        <circle cx="445" cy="155" r="3" />
      </g>

      {/* AI neural nodes - top right */}
      <g stroke="#6C35C9" strokeWidth="2" opacity="0.5">
        <line x1="430" y1="60" x2="470" y2="40" />
        <line x1="430" y1="60" x2="470" y2="90" />
        <line x1="470" y1="40" x2="510" y2="65" />
        <line x1="470" y1="90" x2="510" y2="65" />
      </g>
      <g fill="#6C35C9">
        <circle cx="430" cy="60" r="5" />
        <circle cx="470" cy="40" r="5" />
        <circle cx="470" cy="90" r="5" />
        <circle cx="510" cy="65" r="7" fill="#F4C542" />
      </g>

      {/* Laptop base */}
      <rect x="150" y="360" width="260" height="22" rx="10" fill="url(#hi-base)" />
      <rect x="185" y="378" width="190" height="10" rx="5" fill="#482680" />

      {/* Laptop screen */}
      <rect x="175" y="210" width="210" height="155" rx="14" fill="#0e0e3a" />
      <rect x="185" y="220" width="190" height="135" rx="8" fill="url(#hi-screen)" />

      {/* Code lines on screen */}
      <g fontFamily="monospace" fontSize="11" fill="#F4C542" opacity="0.95">
        <text x="198" y="245">def learn_ai():</text>
      </g>
      <g fontFamily="monospace" fontSize="11" fill="#FFFFFF" opacity="0.85">
        <text x="210" y="263">student = "Baccalaureate"</text>
        <text x="210" y="280">return understand()</text>
      </g>
      <g fontFamily="monospace" fontSize="11" fill="#E8DDFB" opacity="0.7">
        <text x="198" y="305">&gt; بدء رحلة التعلم</text>
      </g>
      <rect x="198" y="320" width="120" height="6" rx="3" fill="#F4C542" opacity="0.8" />
      <rect x="198" y="332" width="80" height="6" rx="3" fill="#E8DDFB" opacity="0.5" />

      {/* Student figure - head */}
      <circle cx="280" cy="120" r="34" fill="#F4C542" />
      {/* Hair */}
      <path d="M248 115 Q248 86 280 86 Q312 86 312 115 Q312 100 300 95 Q290 92 280 92 Q270 92 260 95 Q248 100 248 115 Z" fill="#12124A" />
      {/* Face highlight */}
      <circle cx="270" cy="118" r="3" fill="#12124A" />
      <circle cx="290" cy="118" r="3" fill="#12124A" />
      <path d="M272 132 Q280 138 288 132" stroke="#12124A" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* Body / shoulders */}
      <path d="M225 200 Q225 165 280 160 Q335 165 335 200 L335 230 L225 230 Z" fill="#6C35C9" />
      {/* Collar / shirt accent */}
      <path d="M265 162 L280 178 L295 162" stroke="#F4C542" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />

      {/* Arms reaching to laptop */}
      <path d="M232 205 Q210 270 215 345" stroke="#6C35C9" strokeWidth="18" fill="none" strokeLinecap="round" />
      <path d="M328 205 Q350 270 345 345" stroke="#6C35C9" strokeWidth="18" fill="none" strokeLinecap="round" />
      {/* Hands */}
      <circle cx="215" cy="345" r="10" fill="#F4C542" />
      <circle cx="345" cy="345" r="10" fill="#F4C542" />

      {/* Floating book - left */}
      <g transform="translate(70 250) rotate(-12)">
        <rect x="0" y="0" width="70" height="50" rx="6" fill="#FFFFFF" stroke="#6C35C9" strokeWidth="2" />
        <rect x="6" y="8" width="58" height="4" rx="2" fill="#E8DDFB" />
        <rect x="6" y="18" width="45" height="4" rx="2" fill="#E8DDFB" />
        <rect x="6" y="28" width="52" height="4" rx="2" fill="#E8DDFB" />
        <rect x="6" y="38" width="30" height="4" rx="2" fill="#F4C542" />
      </g>

      {/* Floating AI chip - right */}
      <g transform="translate(440 250)">
        <rect x="0" y="0" width="60" height="60" rx="10" fill="#12124A" />
        <rect x="8" y="8" width="44" height="44" rx="6" fill="#6C35C9" />
        <text x="30" y="38" textAnchor="middle" fontFamily="sans-serif" fontSize="16" fontWeight="bold" fill="#F4C542">AI</text>
        {/* chip pins */}
        <g stroke="#6C35C9" strokeWidth="3" strokeLinecap="round">
          <line x1="-6" y1="18" x2="0" y2="18" />
          <line x1="-6" y1="30" x2="0" y2="30" />
          <line x1="-6" y1="42" x2="0" y2="42" />
          <line x1="60" y1="18" x2="66" y2="18" />
          <line x1="60" y1="30" x2="66" y2="30" />
          <line x1="60" y1="42" x2="66" y2="42" />
          <line x1="18" y1="-6" x2="18" y2="0" />
          <line x1="30" y1="-6" x2="30" y2="0" />
          <line x1="42" y1="-6" x2="42" y2="0" />
          <line x1="18" y1="60" x2="18" y2="66" />
          <line x1="30" y1="60" x2="30" y2="66" />
          <line x1="42" y1="60" x2="42" y2="66" />
        </g>
      </g>

      {/* Small sparkles */}
      <g fill="#F4C542">
        <path d="M120 180 L124 190 L128 180 L124 170 Z" opacity="0.8" />
        <path d="M460 200 L463 208 L466 200 L463 192 Z" opacity="0.7" />
      </g>
    </svg>
  );
}
