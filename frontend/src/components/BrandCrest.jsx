export function BrandCrest({ active = true, size = "default", compact = false }) {
  const wrapperSize = size === "large" ? "h-52 w-52" : "h-32 w-32";
  const tone = active ? "text-[#d96b1f]" : "text-zinc-600";

  return (
    <div className={`club-crest ${wrapperSize} ${tone}`} aria-hidden="true">
      <svg viewBox="0 0 240 240" className="h-full w-full overflow-visible" role="img">
        <defs>
          <linearGradient id="crestMetal" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor={active ? "#f2e5cf" : "#8a8a8a"} />
            <stop offset="0.32" stopColor={active ? "#7a7a72" : "#4b4b4b"} />
            <stop offset="0.62" stopColor={active ? "#d96b1f" : "#5f5f5f"} />
            <stop offset="1" stopColor="#161616" />
          </linearGradient>
          <radialGradient id="crestCore" cx="50%" cy="42%" r="62%">
            <stop offset="0" stopColor={active ? "#7d1d16" : "#333"} />
            <stop offset="0.56" stopColor="#151515" />
            <stop offset="1" stopColor="#050505" />
          </radialGradient>
          <filter id="crestGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={active ? "4" : "1"} result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <path d="M44 92 6 72l28 38-30 6 42 18 28-25-30-17Z" fill="#0b0b0b" stroke="url(#crestMetal)" strokeWidth="4" />
        <path d="m196 92 38-20-28 38 30 6-42 18-28-25 30-17Z" fill="#0b0b0b" stroke="url(#crestMetal)" strokeWidth="4" />
        <path d="M50 96 19 85l25 25-18 5 31 10 17-16-24-13Z" fill={active ? "#7d1d16" : "#282828"} opacity=".88" />
        <path d="m190 96 31-11-25 25 18 5-31 10-17-16 24-13Z" fill={active ? "#7d1d16" : "#282828"} opacity=".88" />

        <g transform="rotate(-38 120 126)">
          <rect x="112" y="48" width="16" height="128" rx="5" fill="url(#crestMetal)" stroke="#0b0b0b" strokeWidth="4" />
          <rect x="105" y="44" width="30" height="24" rx="5" fill="#111" stroke="url(#crestMetal)" strokeWidth="4" />
          <path d="M108 51h24M108 58h24" stroke={active ? "#d96b1f" : "#666"} strokeWidth="3" />
        </g>
        <g transform="rotate(38 120 126)">
          <rect x="112" y="48" width="16" height="128" rx="5" fill="url(#crestMetal)" stroke="#0b0b0b" strokeWidth="4" />
          <rect x="105" y="44" width="30" height="24" rx="5" fill="#111" stroke="url(#crestMetal)" strokeWidth="4" />
          <path d="M108 51h24M108 58h24" stroke={active ? "#d96b1f" : "#666"} strokeWidth="3" />
        </g>

        <circle cx="120" cy="118" r="72" fill="#090909" stroke="url(#crestMetal)" strokeWidth="7" />
        <circle cx="120" cy="118" r="59" fill="url(#crestCore)" stroke={active ? "#d96b1f" : "#555"} strokeWidth="3" strokeDasharray="3 7" />

        <path d="M120 70c-31 0-48 21-48 48 0 20 9 31 24 39v18l12 9 12-13 12 13 12-9v-18c15-8 24-19 24-39 0-27-17-48-48-48Z" fill="#d9d0c0" stroke="#111" strokeWidth="5" filter={active ? "url(#crestGlow)" : undefined} />
        <path d="m87 118 25-9-6 21-18-4Zm66 0-25-9 6 21 18-4Z" fill="#141414" />
        <path d="m120 128-9 15h18l-9-15Z" fill="#141414" />
        <path d="M101 154h38M108 161v14M120 159v13M132 161v14" stroke="#141414" strokeWidth="5" strokeLinecap="round" />

        <path d="M120 36c-16 0-30 4-43 11L66 31c16-10 34-15 54-15s38 5 54 15l-11 16c-13-7-27-11-43-11Z" fill="#080808" stroke={active ? "#d96b1f" : "#555"} strokeWidth="3" />
        <path d="M120 200c16 0 30-4 43-11l11 16c-16 10-34 15-54 15s-38-5-54-15l11-16c13 7 27 11 43 11Z" fill="#080808" stroke={active ? "#d96b1f" : "#555"} strokeWidth="3" />

        {!compact && (
          <>
            <text x="120" y="30" textAnchor="middle" fill={active ? "#f2e5cf" : "#777"} fontSize="10" fontWeight="900" letterSpacing="3">IRMÃOS</text>
            <text x="120" y="216" textAnchor="middle" fill={active ? "#f2e5cf" : "#777"} fontSize="9" fontWeight="900" letterSpacing="2">DO ASFALTO</text>
          </>
        )}
      </svg>
    </div>
  );
}
