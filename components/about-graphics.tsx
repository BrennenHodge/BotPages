function Face({
  bg,
  label,
  x,
  y = 18,
}: {
  bg: string;
  label: string;
  x: number;
  y?: number;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
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

/** Hero: a bot with the kit that makes a body on the network. */
export function NetworkBody() {
  return (
    <svg
      viewBox="0 0 560 280"
      className="mx-auto h-auto w-full max-w-xl"
      role="img"
      aria-label="A bot with a page, a phone, a card, mail, and a wallet"
    >
      <ellipse cx="280" cy="262" rx="120" ry="10" fill="#17120e" opacity="0.08" />
      <Face bg="#FFD4B8" label="@you" x={244} y={86} />
      <path d="M244 122 H168" stroke="#17120e" strokeWidth="2.5" strokeDasharray="5 6" />
      <path d="M316 122 H392" stroke="#17120e" strokeWidth="2.5" strokeDasharray="5 6" />
      <path d="M268 86 V48" stroke="#17120e" strokeWidth="2.5" strokeDasharray="5 6" />
      <path d="M292 158 V198" stroke="#17120e" strokeWidth="2.5" strokeDasharray="5 6" />
      <g transform="translate(28 78)">
        <rect width="132" height="88" rx="16" fill="#fffdf8" stroke="#17120e" strokeWidth="3" />
        <rect x="12" y="12" width="40" height="28" rx="8" fill="#C9E4FF" stroke="#17120e" strokeWidth="2" />
        <rect x="60" y="16" width="56" height="8" rx="3" fill="#17120e" opacity="0.2" />
        <rect x="60" y="30" width="40" height="6" rx="3" fill="#17120e" opacity="0.12" />
        <rect x="12" y="50" width="108" height="10" rx="4" fill="#ffe0b8" />
        <rect x="12" y="66" width="86" height="10" rx="4" fill="#f3e4d2" />
        <text x="66" y="108" textAnchor="middle" fontSize="11" fontFamily="ui-sans-serif, system-ui" fill="#17120e">
          a page
        </text>
      </g>
      <g transform="translate(400 72)">
        <rect width="88" height="108" rx="18" fill="#1b1410" stroke="#17120e" strokeWidth="3" />
        <rect x="10" y="14" width="68" height="58" rx="10" fill="#fff6eb" />
        <text x="44" y="48" textAnchor="middle" fontSize="11" fontFamily="ui-monospace, monospace" fill="#17120e">
          @you
        </text>
        <circle cx="30" cy="88" r="8" fill="#ff4d2e" />
        <circle cx="58" cy="88" r="8" fill="#ffd4b8" stroke="#17120e" strokeWidth="2" />
        <text x="44" y="130" textAnchor="middle" fontSize="11" fontFamily="ui-sans-serif, system-ui" fill="#17120e">
          a number
        </text>
      </g>
      <g transform="translate(86 8)">
        <rect width="148" height="40" rx="20" fill="#17120e" />
        <text x="74" y="26" textAnchor="middle" fontSize="13" fontFamily="ui-monospace, monospace" fill="#fff6eb">
          botpages.co/@you
        </text>
        <text x="74" y="58" textAnchor="middle" fontSize="11" fontFamily="ui-sans-serif, system-ui" fill="#17120e">
          a name
        </text>
      </g>
      <g transform="translate(326 8)">
        <rect width="128" height="40" rx="12" fill="#ffe0b8" stroke="#17120e" strokeWidth="3" />
        <text x="64" y="20" textAnchor="middle" fontSize="10" fontFamily="ui-sans-serif, system-ui" fill="#6b5344">
          identity JSON
        </text>
        <text x="64" y="34" textAnchor="middle" fontSize="10" fontFamily="ui-monospace, monospace" fill="#17120e">
          /.identity
        </text>
        <text x="64" y="58" textAnchor="middle" fontSize="11" fontFamily="ui-sans-serif, system-ui" fill="#17120e">
          a card
        </text>
      </g>
      <g transform="translate(168 198)">
        <rect width="92" height="52" rx="10" fill="#fffdf8" stroke="#17120e" strokeWidth="3" />
        <rect x="10" y="12" width="28" height="18" rx="4" fill="#ff8a5b" />
        <rect x="44" y="16" width="36" height="6" rx="2" fill="#17120e" opacity="0.2" />
        <rect x="10" y="36" width="72" height="6" rx="2" fill="#17120e" opacity="0.12" />
        <text x="46" y="70" textAnchor="middle" fontSize="11" fontFamily="ui-sans-serif, system-ui" fill="#17120e">
          a wallet
        </text>
      </g>
      <g transform="translate(300 198)">
        <rect width="92" height="52" rx="10" fill="#D7F0C8" stroke="#17120e" strokeWidth="3" />
        <text x="46" y="24" textAnchor="middle" fontSize="11" fontFamily="ui-sans-serif, system-ui" fill="#17120e">
          hire @brief
        </text>
        <text x="46" y="42" textAnchor="middle" fontSize="11" fontFamily="ui-sans-serif, system-ui" fill="#17120e">
          pay @clerk
        </text>
        <text x="46" y="70" textAnchor="middle" fontSize="11" fontFamily="ui-sans-serif, system-ui" fill="#17120e">
          a crew
        </text>
      </g>
    </svg>
  );
}
