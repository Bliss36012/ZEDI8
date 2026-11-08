import React from 'react';
import { AnimeAvatarConfig } from '../../types/hospital';

interface AnimeMascotProps {
  config?: AnimeAvatarConfig;
  role?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isMotile?: boolean;
  speakingText?: string;
  expressionOverride?: 'smile' | 'wink' | 'focused' | 'cheerful';
  onMascotClick?: () => void;
}

export const AnimeMascot: React.FC<AnimeMascotProps> = ({
  config,
  role = 'doctor',
  size = 'md',
  isMotile = true,
  speakingText,
  expressionOverride,
  onMascotClick,
}) => {
  // Default configs tailored for each department
  const defaultConfig: AnimeAvatarConfig = {
    gender: 'female',
    skinTone: '#8D5524',
    hairStyle: 'curly',
    hairColor: '#1F2937',
    scrubColor: '#0D9488',
    expression: 'smile',
    accessory: 'stethoscope',
    catchphrase: 'Afya Yako, Wajibu Wetu!',
    motilitySpeed: 'lively',
  };

  const finalConfig: AnimeAvatarConfig = {
    ...defaultConfig,
    ...config,
    expression: expressionOverride || config?.expression || 'smile',
  };

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-36 h-36',
    xl: 'w-48 h-48',
  }[size];

  const motilityClasses = isMotile
    ? finalConfig.motilitySpeed === 'hyper'
      ? 'animate-bounce'
      : finalConfig.motilitySpeed === 'calm'
      ? 'animate-pulse'
      : 'animate-[bounce_2.5s_infinite]'
    : '';

  return (
    <div
      onClick={onMascotClick}
      className={`relative inline-flex flex-col items-center select-none ${onMascotClick ? 'cursor-pointer group' : ''}`}
    >
      {/* Speech Bubble if speaking */}
      {speakingText && (
        <div className="absolute -top-12 z-20 left-1/2 -translate-x-1/2 min-w-[160px] max-w-[240px] px-3 py-1.5 bg-neutral-900/90 dark:bg-white/95 text-white dark:text-neutral-900 text-[11px] font-bold rounded-2xl shadow-xl border border-neutral-700 dark:border-neutral-300 text-center animate-fade-in pointer-events-none">
          <div className="line-clamp-2">{speakingText}</div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-900/90 dark:border-t-white/95" />
        </div>
      )}

      {/* Motile Anime Character SVG */}
      <div className={`relative ${sizeClasses} ${motilityClasses} transition-transform duration-300 group-hover:scale-105`}>
        <svg
          viewBox="0 0 120 120"
          className="w-full h-full drop-shadow-md overflow-visible"
        >
          <defs>
            <radialGradient id={`glow-${role}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={finalConfig.scrubColor} stopOpacity="0.3" />
              <stop offset="100%" stopColor={finalConfig.scrubColor} stopOpacity="0" />
            </radialGradient>
            <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.2" />
            </filter>
          </defs>

          {/* Aura Halo Glow */}
          <circle cx="60" cy="60" r="54" fill={`url(#glow-${role})`} />

          {/* Torso / Uniform Scrubs */}
          <path
            d="M 32 95 Q 60 88 88 95 L 94 120 L 26 120 Z"
            fill={finalConfig.scrubColor}
            filter="url(#shadow)"
          />

          {/* Scrubs V-Neck Collar */}
          <path
            d="M 50 94 L 60 106 L 70 94 Z"
            fill={finalConfig.skinTone}
          />
          <path
            d="M 47 94 L 60 108 L 73 94"
            stroke="#ffffff"
            strokeWidth="2"
            fill="none"
          />

          {/* Stethoscope around neck */}
          {finalConfig.accessory === 'stethoscope' && (
            <g className="animate-pulse">
              <path
                d="M 44 94 Q 40 108 52 114 Q 60 118 68 114 Q 78 108 76 94"
                fill="none"
                stroke="#0F172A"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <circle cx="60" cy="116" r="4.5" fill="#94A3B8" stroke="#0F172A" strokeWidth="2" />
              <circle cx="60" cy="116" r="2" fill="#E2E8F0" />
            </g>
          )}

          {/* Badge */}
          {(finalConfig.accessory === 'badge' || role === 'receptionist' || role === 'ceo') && (
            <rect
              x="72"
              y="102"
              width="14"
              height="10"
              rx="2"
              fill="#F8FAFC"
              stroke="#0284C7"
              strokeWidth="1.5"
            />
          )}

          {/* Clipboard Accessory in hand */}
          {finalConfig.accessory === 'clipboard' && (
            <g transform="translate(18, 92) rotate(-15)">
              <rect x="0" y="0" width="18" height="24" rx="2" fill="#D97706" stroke="#78350F" strokeWidth="1.5" />
              <rect x="2" y="4" width="14" height="18" rx="1" fill="#FEF3C7" />
              <rect x="5" y="-2" width="8" height="4" rx="1" fill="#94A3B8" />
              <line x1="4" y1="8" x2="14" y2="8" stroke="#92400E" strokeWidth="1" />
              <line x1="4" y1="12" x2="12" y2="12" stroke="#92400E" strokeWidth="1" />
            </g>
          )}

          {/* Neck */}
          <rect
            x="52"
            y="80"
            width="16"
            height="18"
            rx="3"
            fill={finalConfig.skinTone}
          />

          {/* Head & Face */}
          <ellipse
            cx="60"
            cy="56"
            rx="30"
            ry="32"
            fill={finalConfig.skinTone}
            filter="url(#shadow)"
          />

          {/* Cheeks / Blush */}
          <ellipse cx="40" cy="66" rx="4.5" ry="3" fill="#F43F5E" opacity="0.4" />
          <ellipse cx="80" cy="66" rx="4.5" ry="3" fill="#F43F5E" opacity="0.4" />

          {/* Hair Styles */}
          {finalConfig.hairStyle === 'hijab' ? (
            <path
              d="M 30 54 Q 30 20 60 20 Q 90 20 90 54 Q 92 84 82 92 Q 60 98 38 92 Q 28 84 30 54 Z"
              fill={finalConfig.scrubColor}
              opacity="0.95"
            />
          ) : finalConfig.hairStyle === 'curly' ? (
            <g fill={finalConfig.hairColor}>
              <circle cx="60" cy="28" r="22" />
              <circle cx="38" cy="34" r="16" />
              <circle cx="82" cy="34" r="16" />
              <circle cx="30" cy="50" r="13" />
              <circle cx="90" cy="50" r="13" />
            </g>
          ) : finalConfig.hairStyle === 'braids' ? (
            <g fill={finalConfig.hairColor}>
              <path d="M 32 40 Q 60 20 88 40 Q 92 68 84 84 L 80 82 Q 86 64 80 44 Q 60 30 40 44 Q 34 64 40 82 L 36 84 Q 28 68 32 40 Z" />
              <circle cx="60" cy="26" r="14" />
            </g>
          ) : (
            // Short hair
            <path
              d="M 30 52 Q 30 24 60 24 Q 90 24 90 52 Q 84 32 60 32 Q 36 32 30 52 Z"
              fill={finalConfig.hairColor}
            />
          )}

          {/* Eyes & Eyebrows */}
          {/* Eyebrows */}
          <path d="M 40 45 Q 47 42 53 45" stroke={finalConfig.hairColor} strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M 67 45 Q 73 42 80 45" stroke={finalConfig.hairColor} strokeWidth="2.5" strokeLinecap="round" fill="none" />

          {/* Eyes */}
          {finalConfig.expression === 'wink' ? (
            <>
              {/* Left Eye: Open & Sparkling */}
              <ellipse cx="46" cy="55" rx="5.5" ry="6.5" fill="#1E293B" />
              <circle cx="44.5" cy="53" r="2.2" fill="#FFFFFF" />
              <circle cx="48" cy="57" r="1" fill="#FFFFFF" />
              {/* Right Eye: Winking */}
              <path d="M 69 56 Q 74 62 79 56" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" fill="none" />
            </>
          ) : finalConfig.expression === 'focused' ? (
            <>
              <ellipse cx="46" cy="55" rx="4.5" ry="4.5" fill="#1E293B" />
              <ellipse cx="74" cy="55" rx="4.5" ry="4.5" fill="#1E293B" />
              <circle cx="45" cy="54" r="1.5" fill="#FFFFFF" />
              <circle cx="73" cy="54" r="1.5" fill="#FFFFFF" />
            </>
          ) : (
            // Big Sparkling Anime Smile / Cheerful Eyes
            <>
              <ellipse cx="46" cy="55" rx="6" ry="7.5" fill="#0F172A" />
              <ellipse cx="74" cy="55" rx="6" ry="7.5" fill="#0F172A" />
              <circle cx="44.5" cy="52.5" r="2.5" fill="#FFFFFF" />
              <circle cx="72.5" cy="52.5" r="2.5" fill="#FFFFFF" />
              <circle cx="48" cy="57" r="1.2" fill="#FFFFFF" />
              <circle cx="76" cy="57" r="1.2" fill="#FFFFFF" />
            </>
          )}

          {/* Glasses Accessory */}
          {finalConfig.accessory === 'glasses' && (
            <g stroke="#0F172A" strokeWidth="2" fill="none">
              <rect x="38" y="47" width="16" height="15" rx="3" fill="#E2E8F0" fillOpacity="0.25" />
              <rect x="66" y="47" width="16" height="15" rx="3" fill="#E2E8F0" fillOpacity="0.25" />
              <line x1="54" y1="54" x2="66" y2="54" />
            </g>
          )}

          {/* Headlamp Accessory */}
          {finalConfig.accessory === 'headlamp' && (
            <g>
              <ellipse cx="60" cy="30" rx="28" ry="4" fill="#334155" />
              <circle cx="60" cy="30" r="6" fill="#0284C7" stroke="#0F172A" strokeWidth="1.5" />
              <circle cx="60" cy="30" r="3.5" fill="#BAE6FD" />
            </g>
          )}

          {/* Mask Accessory */}
          {finalConfig.accessory === 'mask' ? (
            <path
              d="M 42 62 Q 60 66 78 62 L 76 76 Q 60 82 44 76 Z"
              fill="#E0F2FE"
              stroke="#0284C7"
              strokeWidth="1.5"
            />
          ) : (
            // Nose and Mouth
            <>
              {/* Cute nose */}
              <ellipse cx="60" cy="62" rx="1.5" ry="1" fill="#451A03" opacity="0.6" />

              {/* Mouth */}
              {finalConfig.expression === 'cheerful' ? (
                <path
                  d="M 52 69 Q 60 80 68 69 Z"
                  fill="#E11D48"
                  stroke="#9F1239"
                  strokeWidth="1"
                />
              ) : (
                <path
                  d="M 54 69 Q 60 75 66 69"
                  stroke="#881337"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />
              )}
            </>
          )}

          {/* Animated Waving Hand */}
          {isMotile && (
            <g className="origin-[25px_95px] animate-[wiggle_1.5s_ease-in-out_infinite]">
              <ellipse cx="25" cy="88" rx="6" ry="7" fill={finalConfig.skinTone} />
              <circle cx="27" cy="83" r="2.5" fill={finalConfig.skinTone} />
            </g>
          )}
        </svg>
      </div>

      {/* Department Mascot Name Label */}
      <span className="mt-1 text-[10px] font-extrabold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
        {role.replace('_', ' ')}
      </span>
    </div>
  );
};
