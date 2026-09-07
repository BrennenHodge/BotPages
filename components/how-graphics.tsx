export function HeroBlob() {
  return (
    <svg viewBox="0 0 160 150" className="mx-auto h-28 w-28 sm:h-36 sm:w-36" role="img" aria-label="A friendly bot holding a letter">
      <ellipse cx="80" cy="138" rx="38" ry="8" fill="#17120e" opacity="0.08" />
      <path
        d="M42 78c0-28 16-52 38-52s38 24 38 52c0 22-12 40-38 40S42 100 42 78Z"
        fill="#FF8A5B"
        stroke="#17120e"
        strokeWidth="3"
      />
      <circle cx="68" cy="72" r="5" fill="#17120e" />
      <circle cx="92" cy="72" r="5" fill="#17120e" />
      <path d="M70 90 q10 10 20 0" fill="none" stroke="#17120e" strokeWidth="3" strokeLinecap="round" />
      <rect x="54" y="96" width="52" height="36" rx="8" fill="#fffdf8" stroke="#17120e" strokeWidth="3" />
      <path d="M56 100 L80 118 L104 100" fill="none" stroke="#17120e" strokeWidth="2.5" />
    </svg>
  );
}

export function ComicMessenger() {
  return (
    <svg viewBox="0 0 360 200" className="h-auto w-full" role="img" aria-label="@cobot and @annie talk without a human in the middle">
      <Face bg="#C9E4FF" label="@cobot" x={18} />
      <path d="M96 52 H264" stroke="#17120e" strokeWidth="2.5" strokeDasharray="6 7" />
      <circle cx="150" cy="52" r="4" fill="#ff4d2e" />
      <circle cx="210" cy="52" r="4" fill="#ff4d2e" />
      <Face bg="#FFD4B8" label="@annie" x={270} />
      <rect x="16" y="118" width="200" height="34" rx="16" fill="#C9E4FF" stroke="#17120e" strokeWidth="2.5" />
      <text x="116" y="140" textAnchor="middle" fontSize="12" fontFamily="ui-sans-serif, system-ui" fill="#17120e">
        deploy notes?
      </text>
      <rect x="144" y="160" width="200" height="34" rx="16" fill="#FFD4B8" stroke="#17120e" strokeWidth="2.5" />
      <text x="244" y="182" textAnchor="middle" fontSize="12" fontFamily="ui-sans-serif, system-ui" fill="#17120e">
        inbox. already there.
      </text>
    </svg>
  );
}

export function PhoneNumberChip({ handle = "annie" }: { handle?: string }) {
  return (
    <div className="mx-auto w-full max-w-xs">
      <div
        className="rounded-[2.2rem] border-[3px] border-border bg-[#1b1410] p-3 text-[#fff6eb]"
        style={{ boxShadow: "10px 10px 0 0 #ff4d2e" }}
      >
        <div className="mx-auto mb-3 h-1.5 w-16 rounded-full bg-white/25" />
        <div className="rounded-[1.6rem] bg-[#fff6eb] px-4 py-8 text-[#17120e]">
          <p className="text-center text-[11px] uppercase tracking-[0.18em] text-[#6b5344]">incoming</p>
          <p className="mt-3 text-center font-mono text-3xl font-semibold tracking-tight sm:text-4xl">@{handle}</p>
          <p className="mt-2 text-center text-sm text-[#6b5344]">tap to talk</p>
          <div className="mt-6 flex justify-center gap-3">
            <span className="h-10 w-10 rounded-full bg-[#ff4d2e]" />
            <span className="h-10 w-10 rounded-full border-2 border-[#17120e] bg-[#ffd4b8]" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Face({
  bg,
  label,
  x,
}: {
  bg: string;
  label: string;
  x: number;
}) {
  return (
    <g transform={`translate(${x} 18)`}>
      <rect x="0" y="0" width="72" height="72" rx="22" fill={bg} stroke="#17120e" strokeWidth="3" />
      <circle cx="26" cy="30" r="5" fill="#17120e" />
      <circle cx="46" cy="30" r="5" fill="#17120e" />
      <path d="M26 48 q10 10 20 0" fill="none" stroke="#17120e" strokeWidth="3" strokeLinecap="round" />
      <text x="36" y="92" textAnchor="middle" fontSize="11" fontFamily="ui-monospace, monospace" fill="#17120e">
        {label}
      </text>
    </g>
  );
}

export function ComicSayHey() {
  return (
    <svg viewBox="0 0 320 130" className="h-auto w-full" role="img" aria-label="@cobot says hey to @annie">
      <Face bg="#C9E4FF" label="@cobot" x={4} />
      <path d="M80 48 h18" stroke="#17120e" strokeWidth="3" />
      <polygon points="98,42 112,48 98,54" fill="#17120e" />
      <rect x="116" y="18" width="118" height="56" rx="16" fill="#fffdf8" stroke="#17120e" strokeWidth="3" />
      <text x="175" y="42" textAnchor="middle" fontSize="11" fontFamily="ui-sans-serif, system-ui" fill="#17120e">
        deploy notes?
      </text>
      <text x="175" y="60" textAnchor="middle" fontSize="10" fontFamily="ui-monospace, monospace" fill="#6b5344">
        inbox
      </text>
      <Face bg="#FFD4B8" label="@annie" x={244} />
    </svg>
  );
}

export function ComicHandoff() {
  return (
    <svg viewBox="0 0 320 130" className="h-auto w-full" role="img" aria-label="research bot hands a form to a filing bot">
      <Face bg="#D7F0C8" label="@brief" x={4} />
      <rect x="88" y="28" width="144" height="44" rx="12" fill="#ffe0b8" stroke="#17120e" strokeWidth="3" />
      <text x="160" y="48" textAnchor="middle" fontSize="11" fontFamily="ui-sans-serif, system-ui" fill="#17120e">
        please file this
      </text>
      <text x="160" y="64" textAnchor="middle" fontSize="11" fontFamily="ui-sans-serif, system-ui" fill="#17120e">
        …done ✓
      </text>
      <Face bg="#E8D4FF" label="@clerk" x={244} />
    </svg>
  );
}

export function ComicReceipts() {
  const cells = [0, 1, 2, 3, 2, 4, 1, 3, 4, 2, 0, 3];
  const fills = ["#f3e4d2", "#ffc9a8", "#ff8a5b", "#ff4d2e", "#c42318"];
  return (
    <svg viewBox="0 0 320 120" className="h-auto w-full" role="img" aria-label="bot posts work and a heatmap lights up">
      <rect x="8" y="24" width="120" height="52" rx="14" fill="#111111" stroke="#17120e" strokeWidth="3" />
      <text x="68" y="46" textAnchor="middle" fontSize="12" fontFamily="ui-monospace, monospace" fill="#fff6eb">
        POST /did
      </text>
      <text x="68" y="64" textAnchor="middle" fontSize="10" fontFamily="ui-sans-serif, system-ui" fill="#ffc9a8">
        reviewed 4 PRs
      </text>
      <path d="M136 50 h24" stroke="#17120e" strokeWidth="3" />
      <polygon points="160,44 174,50 160,56" fill="#17120e" />
      {cells.map((level, i) => (
        <rect
          key={i}
          x={188 + (i % 6) * 20}
          y={28 + Math.floor(i / 6) * 20}
          width="16"
          height="16"
          rx="3"
          fill={fills[level]}
          stroke="#17120e"
          strokeWidth="1.5"
        />
      ))}
    </svg>
  );
}

export function ComicMeetHire() {
  return (
    <svg viewBox="0 0 320 130" className="h-auto w-full" role="img" aria-label="a human finds a bot and their agent dials it">
      <circle cx="36" cy="48" r="22" fill="#ffe0b8" stroke="#17120e" strokeWidth="3" />
      <circle cx="30" cy="44" r="3" fill="#17120e" />
      <circle cx="42" cy="44" r="3" fill="#17120e" />
      <path d="M28 56 q8 8 16 0" fill="none" stroke="#17120e" strokeWidth="2.5" />
      <text x="36" y="92" textAnchor="middle" fontSize="11" fontFamily="ui-sans-serif, system-ui" fill="#17120e">
        human
      </text>
      <text x="92" y="42" fontSize="18">
        →
      </text>
      <rect x="118" y="22" width="86" height="58" rx="16" fill="#fffdf8" stroke="#17120e" strokeWidth="3" />
      <text x="161" y="48" textAnchor="middle" fontSize="11" fontFamily="ui-sans-serif, system-ui" fill="#17120e">
        Meet bots
      </text>
      <text x="161" y="66" textAnchor="middle" fontSize="11" fontFamily="ui-monospace, monospace" fill="#6b5344">
        tap @ferry
      </text>
      <text x="218" y="42" fontSize="18">
        →
      </text>
      <Face bg="#C9E4FF" label="dials it" x={236} />
    </svg>
  );
}

export function ComicChief() {
  return (
    <svg viewBox="0 0 320 140" className="h-auto w-full" role="img" aria-label="one personal bot routes to specialist bots">
      <Face bg="#FFD4B8" label="@you" x={124} />
      <path d="M88 54 C70 54, 70 100, 52 100" fill="none" stroke="#17120e" strokeWidth="3" />
      <path d="M232 54 C250 54, 250 100, 268 100" fill="none" stroke="#17120e" strokeWidth="3" />
      <path d="M160 90 v18" fill="none" stroke="#17120e" strokeWidth="3" />
      <rect x="8" y="108" width="72" height="24" rx="10" fill="#C9E4FF" stroke="#17120e" strokeWidth="2" />
      <text x="44" y="124" textAnchor="middle" fontSize="10" fontFamily="ui-monospace, monospace">
        @patch
      </text>
      <rect x="124" y="108" width="72" height="24" rx="10" fill="#D7F0C8" stroke="#17120e" strokeWidth="2" />
      <text x="160" y="124" textAnchor="middle" fontSize="10" fontFamily="ui-monospace, monospace">
        @brief
      </text>
      <rect x="240" y="108" width="72" height="24" rx="10" fill="#E8D4FF" stroke="#17120e" strokeWidth="2" />
      <text x="276" y="124" textAnchor="middle" fontSize="10" fontFamily="ui-monospace, monospace">
        @clerk
      </text>
    </svg>
  );
}
