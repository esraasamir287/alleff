interface AuthVisualProps {
  variant?: 'full' | 'compact';
}

export function AuthVisual({ variant = 'full' }: AuthVisualProps) {
  if (variant === 'compact') {
    return (
      <svg
        viewBox="0 0 320 120"
        role="img"
        aria-label="رسم تعليمي للبرمجة والذكاء الاصطناعي"
        className="h-auto w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="av-c-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F6F2FF" />
            <stop offset="100%" stopColor="#E8DDFB" />
          </linearGradient>
          <linearGradient id="av-c-screen" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#12124A" />
            <stop offset="100%" stopColor="#6C35C9" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="320" height="120" rx="16" fill="url(#av-c-bg)" />
        {/* mini laptop */}
        <rect x="110" y="30" width="100" height="60" rx="8" fill="#0e0e3a" />
        <rect x="117" y="37" width="86" height="46" rx="4" fill="url(#av-c-screen)" />
        <rect x="125" y="44" width="50" height="4" rx="2" fill="#F4C542" />
        <rect x="125" y="53" width="70" height="4" rx="2" fill="#FFFFFF" opacity="0.8" />
        <rect x="125" y="62" width="40" height="4" rx="2" fill="#E8DDFB" opacity="0.7" />
        <rect x="100" y="90" width="120" height="8" rx="4" fill="#6C35C9" />
        {/* AI node */}
        <circle cx="260" cy="40" r="7" fill="#F4C542" />
        <circle cx="280" cy="60" r="5" fill="#6C35C9" />
        <line x1="260" y1="40" x2="280" y2="60" stroke="#6C35C9" strokeWidth="2" opacity="0.5" />
        {/* brackets */}
        <path d="M50 50 L40 60 L50 70" stroke="#6C35C9" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
        <path d="M70 50 L80 60 L70 70" stroke="#6C35C9" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 480 480"
      role="img"
      aria-label="طالبة تتعلم البرمجة والذكاء الاصطناعي عبر جهاز محمول"
      className="h-auto w-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="av-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F6F2FF" />
          <stop offset="100%" stopColor="#E8DDFB" />
        </linearGradient>
        <linearGradient id="av-screen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#12124A" />
          <stop offset="100%" stopColor="#6C35C9" />
        </linearGradient>
        <linearGradient id="av-base" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6C35C9" />
          <stop offset="100%" stopColor="#482680" />
        </linearGradient>
      </defs>

      {/* Background */}
      <ellipse cx="240" cy="240" rx="220" ry="200" fill="url(#av-bg)" />

      {/* Floating brackets */}
      <g stroke="#6C35C9" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.35">
        <path d="M70 110 L55 130 L70 150" />
        <path d="M110 90 L130 110 L110 130" />
      </g>

      {/* AI neural network - top right */}
      <g stroke="#6C35C9" strokeWidth="2" opacity="0.5">
        <line x1="380" y1="70" x2="415" y2="50" />
        <line x1="380" y1="70" x2="415" y2="95" />
        <line x1="415" y1="50" x2="450" y2="72" />
        <line x1="415" y1="95" x2="450" y2="72" />
      </g>
      <g fill="#6C35C9">
        <circle cx="380" cy="70" r="5" />
        <circle cx="415" cy="50" r="5" />
        <circle cx="415" cy="95" r="5" />
        <circle cx="450" cy="72" r="7" fill="#F4C542" />
      </g>

      {/* Laptop base */}
      <rect x="130" y="340" width="220" height="20" rx="9" fill="url(#av-base)" />
      <rect x="160" y="356" width="160" height="8" rx="4" fill="#482680" />

      {/* Laptop screen */}
      <rect x="155" y="200" width="180" height="140" rx="12" fill="#0e0e3a" />
      <rect x="164" y="209" width="162" height="122" rx="7" fill="url(#av-screen)" />

      {/* Code on screen */}
      <g fontFamily="monospace" fontSize="10" fill="#F4C542">
        <text x="175" y="230">def learn():</text>
      </g>
      <g fontFamily="monospace" fontSize="10" fill="#FFFFFF" opacity="0.85">
        <text x="186" y="247">student = "Baccalaureate"</text>
        <text x="186" y="263">return understand()</text>
      </g>
      <g fontFamily="monospace" fontSize="10" fill="#E8DDFB" opacity="0.7">
        <text x="175" y="285">&gt; ابدأ التعلم</text>
      </g>
      <rect x="175" y="298" width="100" height="5" rx="2.5" fill="#F4C542" opacity="0.8" />
      <rect x="175" y="309" width="65" height="5" rx="2.5" fill="#E8DDFB" opacity="0.5" />

      {/* Student head */}
      <circle cx="240" cy="120" r="30" fill="#F4C542" />
      <path d="M212 116 Q212 90 240 90 Q268 90 268 116 Q268 103 258 98 Q250 95 240 95 Q230 95 222 98 Q212 103 212 116 Z" fill="#12124A" />
      <circle cx="231" cy="118" r="2.5" fill="#12124A" />
      <circle cx="249" cy="118" r="2.5" fill="#12124A" />
      <path d="M233 130 Q240 135 247 130" stroke="#12124A" strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* Body */}
      <path d="M190 190 Q190 158 240 153 Q290 158 290 190 L290 215 L190 215 Z" fill="#6C35C9" />
      <path d="M228 155 L240 170 L252 155" stroke="#F4C542" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />

      {/* Arms */}
      <path d="M196 195 Q175 250 180 320" stroke="#6C35C9" strokeWidth="16" fill="none" strokeLinecap="round" />
      <path d="M284 195 Q305 250 300 320" stroke="#6C35C9" strokeWidth="16" fill="none" strokeLinecap="round" />
      <circle cx="180" cy="320" r="9" fill="#F4C542" />
      <circle cx="300" cy="320" r="9" fill="#F4C542" />

      {/* Floating book - left */}
      <g transform="translate(60 230) rotate(-10)">
        <rect x="0" y="0" width="60" height="42" rx="5" fill="#FFFFFF" stroke="#6C35C9" strokeWidth="2" />
        <rect x="5" y="7" width="50" height="3.5" rx="1.75" fill="#E8DDFB" />
        <rect x="5" y="15" width="38" height="3.5" rx="1.75" fill="#E8DDFB" />
        <rect x="5" y="23" width="44" height="3.5" rx="1.75" fill="#E8DDFB" />
        <rect x="5" y="31" width="25" height="3.5" rx="1.75" fill="#F4C542" />
      </g>

      {/* AI chip - right */}
      <g transform="translate(390 230)">
        <rect x="0" y="0" width="52" height="52" rx="9" fill="#12124A" />
        <rect x="7" y="7" width="38" height="38" rx="5" fill="#6C35C9" />
        <text x="26" y="33" textAnchor="middle" fontFamily="sans-serif" fontSize="14" fontWeight="bold" fill="#F4C542">AI</text>
        <g stroke="#6C35C9" strokeWidth="2.5" strokeLinecap="round">
          <line x1="-5" y1="16" x2="0" y2="16" />
          <line x1="-5" y1="26" x2="0" y2="26" />
          <line x1="-5" y1="36" x2="0" y2="36" />
          <line x1="52" y1="16" x2="57" y2="16" />
          <line x1="52" y1="26" x2="57" y2="26" />
          <line x1="52" y1="36" x2="57" y2="36" />
          <line x1="16" y1="-5" x2="16" y2="0" />
          <line x1="26" y1="-5" x2="26" y2="0" />
          <line x1="36" y1="-5" x2="36" y2="0" />
          <line x1="16" y1="52" x2="16" y2="57" />
          <line x1="26" y1="52" x2="26" y2="57" />
          <line x1="36" y1="52" x2="36" y2="57" />
        </g>
      </g>

      {/* Sparkles */}
      <g fill="#F4C542">
        <path d="M100 170 L103 178 L106 170 L103 162 Z" opacity="0.8" />
        <path d="M410 180 L412 186 L414 180 L412 174 Z" opacity="0.7" />
      </g>
    </svg>
  );
}
