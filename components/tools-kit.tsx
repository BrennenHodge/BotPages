import type { ReactNode } from "react";
import type { ToolSlug } from "@/lib/tools";

const ink = "#17120e";

function Face({ bg, x, y = 18 }: { bg: string; x: number; y?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="0" y="0" width="64" height="64" rx="20" fill={bg} stroke={ink} strokeWidth="3" />
      <circle cx="23" cy="26" r="4.5" fill={ink} />
      <circle cx="41" cy="26" r="4.5" fill={ink} />
      <path d="M23 42 q9 9 18 0" fill="none" stroke={ink} strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

/** Hero: the seven tools as a body on the network. */
export function ToolsOrchestra() {
  return (
    <svg
      viewBox="0 0 560 300"
      className="mx-auto h-auto w-full max-w-xl"
      role="img"
      aria-label="A bot surrounded by identity, phone, email, cards, crypto, secrets, and a browser"
    >
      <ellipse cx="280" cy="286" rx="130" ry="10" fill={ink} opacity="0.08" />
      <Face bg="#FFD4B8" x={248} y={108} />
      <text x="280" y="196" textAnchor="middle" fontSize="11" fontFamily="ui-monospace, monospace" fill={ink}>
        @you
      </text>
      <path d="M248 140 H168" stroke={ink} strokeWidth="2.5" strokeDasharray="5 6" />
      <path d="M312 140 H392" stroke={ink} strokeWidth="2.5" strokeDasharray="5 6" />
      <path d="M268 108 V58" stroke={ink} strokeWidth="2.5" strokeDasharray="5 6" />
      <path d="M292 172 V214" stroke={ink} strokeWidth="2.5" strokeDasharray="5 6" />
      <path d="M258 172 L198 230" stroke={ink} strokeWidth="2.5" strokeDasharray="5 6" />
      <path d="M302 172 L362 230" stroke={ink} strokeWidth="2.5" strokeDasharray="5 6" />

      <g transform="translate(206 8)">
        <rect width="148" height="42" rx="12" fill="#ffe0b8" stroke={ink} strokeWidth="3" />
        <text x="74" y="18" textAnchor="middle" fontSize="10" fontFamily="ui-sans-serif, system-ui" fill="#6b5344">
          identity JSON
        </text>
        <text x="74" y="34" textAnchor="middle" fontSize="11" fontFamily="ui-monospace, monospace" fill={ink}>
          /@you/.identity
        </text>
      </g>

      <g transform="translate(28 96)">
        <rect width="132" height="80" rx="16" fill="#fffdf8" stroke={ink} strokeWidth="3" />
        <path d="M16 22 L66 48 L116 22" fill="none" stroke={ink} strokeWidth="2.5" />
        <rect x="16" y="22" width="100" height="40" rx="8" fill="#C9E4FF" stroke={ink} strokeWidth="2" />
        <text x="66" y="46" textAnchor="middle" fontSize="11" fontFamily="ui-monospace, monospace" fill={ink}>
          you@…
        </text>
        <text x="66" y="98" textAnchor="middle" fontSize="11" fontFamily="ui-sans-serif, system-ui" fill={ink}>
          mail
        </text>
      </g>

      <g transform="translate(400 88)">
        <rect width="88" height="100" rx="18" fill="#1b1410" stroke={ink} strokeWidth="3" />
        <rect x="10" y="14" width="68" height="52" rx="10" fill="#fff6eb" />
        <text x="44" y="44" textAnchor="middle" fontSize="11" fontFamily="ui-monospace, monospace" fill={ink}>
          @you
        </text>
        <circle cx="30" cy="82" r="7" fill="#ff4d2e" />
        <circle cx="58" cy="82" r="7" fill="#ffd4b8" stroke={ink} strokeWidth="2" />
        <text x="44" y="122" textAnchor="middle" fontSize="11" fontFamily="ui-sans-serif, system-ui" fill={ink}>
          a number
        </text>
      </g>

      <g transform="translate(36 228)">
        <rect width="92" height="48" rx="10" fill="#17120e" stroke={ink} strokeWidth="3" />
        <circle cx="22" cy="24" r="8" fill="#ffe0b8" />
        <rect x="38" y="16" width="40" height="6" rx="2" fill="#fff6eb" opacity="0.5" />
        <rect x="38" y="28" width="28" height="6" rx="2" fill="#fff6eb" opacity="0.25" />
        <text x="46" y="66" textAnchor="middle" fontSize="11" fontFamily="ui-sans-serif, system-ui" fill={ink}>
          vault
        </text>
      </g>

      <g transform="translate(154 228)">
        <rect width="92" height="48" rx="10" fill="#fffdf8" stroke={ink} strokeWidth="3" />
        <rect x="10" y="12" width="28" height="16" rx="4" fill="#ff8a5b" />
        <rect x="44" y="16" width="36" height="6" rx="2" fill={ink} opacity="0.2" />
        <rect x="10" y="34" width="72" height="6" rx="2" fill={ink} opacity="0.12" />
        <text x="46" y="66" textAnchor="middle" fontSize="11" fontFamily="ui-sans-serif, system-ui" fill={ink}>
          a card
        </text>
      </g>

      <g transform="translate(314 228)">
        <rect width="92" height="48" rx="10" fill="#D7F0C8" stroke={ink} strokeWidth="3" />
        <rect x="14" y="14" width="28" height="22" rx="6" fill="#fffdf8" stroke={ink} strokeWidth="2" />
        <rect x="48" y="18" width="30" height="6" rx="2" fill={ink} opacity="0.2" />
        <rect x="48" y="30" width="22" height="6" rx="2" fill={ink} opacity="0.12" />
        <text x="46" y="66" textAnchor="middle" fontSize="11" fontFamily="ui-sans-serif, system-ui" fill={ink}>
          a wallet
        </text>
      </g>

      <g transform="translate(432 228)">
        <rect width="96" height="48" rx="10" fill="#fffdf8" stroke={ink} strokeWidth="3" />
        <rect x="10" y="10" width="76" height="28" rx="6" fill="#FFD4B8" stroke={ink} strokeWidth="2" />
        <circle cx="68" cy="30" r="5" fill="#ff4d2e" />
        <text x="48" y="66" textAnchor="middle" fontSize="11" fontFamily="ui-sans-serif, system-ui" fill={ink}>
          hands
        </text>
      </g>
    </svg>
  );
}

function IdentityGlyph() {
  return (
    <>
      <rect width="148" height="88" rx="18" fill="#ffe0b8" stroke={ink} strokeWidth="3" />
      <text x="74" y="34" textAnchor="middle" fontSize="11" fontFamily="ui-sans-serif, system-ui" fill="#6b5344">
        identity JSON
      </text>
      <text x="74" y="54" textAnchor="middle" fontSize="13" fontFamily="ui-monospace, monospace" fill={ink}>
        /.identity
      </text>
      <rect x="28" y="66" width="92" height="8" rx="4" fill={ink} opacity="0.12" />
    </>
  );
}

function PhoneGlyph() {
  return (
    <>
      <rect x="40" y="4" width="68" height="84" rx="16" fill="#1b1410" stroke={ink} strokeWidth="3" />
      <rect x="48" y="14" width="52" height="48" rx="10" fill="#fff6eb" />
      <text x="74" y="42" textAnchor="middle" fontSize="11" fontFamily="ui-monospace, monospace" fill={ink}>
        @you
      </text>
      <circle cx="62" cy="74" r="6" fill="#ff4d2e" />
      <circle cx="86" cy="74" r="6" fill="#ffd4b8" stroke={ink} strokeWidth="2" />
    </>
  );
}

function EmailGlyph() {
  return (
    <>
      <rect x="18" y="18" width="112" height="56" rx="14" fill="#C9E4FF" stroke={ink} strokeWidth="3" />
      <path d="M22 24 L74 50 L126 24" fill="none" stroke={ink} strokeWidth="2.5" />
      <text x="74" y="70" textAnchor="middle" fontSize="11" fontFamily="ui-monospace, monospace" fill={ink}>
        you@
      </text>
    </>
  );
}

function CardsGlyph() {
  return (
    <>
      <rect x="16" y="18" width="116" height="58" rx="12" fill="#fffdf8" stroke={ink} strokeWidth="3" />
      <rect x="16" y="18" width="116" height="18" rx="12" fill="#ff8a5b" />
      <rect x="28" y="48" width="36" height="10" rx="3" fill={ink} opacity="0.16" />
      <rect x="72" y="50" width="44" height="8" rx="3" fill={ink} opacity="0.1" />
    </>
  );
}

function CryptoGlyph() {
  return (
    <>
      <rect x="28" y="14" width="92" height="64" rx="14" fill="#D7F0C8" stroke={ink} strokeWidth="3" />
      <rect x="42" y="28" width="28" height="36" rx="8" fill="#fffdf8" stroke={ink} strokeWidth="2.5" />
      <rect x="78" y="34" width="28" height="8" rx="3" fill={ink} opacity="0.2" />
      <rect x="78" y="48" width="20" height="8" rx="3" fill={ink} opacity="0.12" />
    </>
  );
}

function SecretsGlyph() {
  return (
    <>
      <rect x="30" y="12" width="88" height="68" rx="16" fill="#17120e" stroke={ink} strokeWidth="3" />
      <circle cx="74" cy="40" r="12" fill="#ffe0b8" />
      <rect x="70" y="40" width="8" height="18" rx="3" fill="#ffe0b8" />
      <circle cx="74" cy="40" r="4" fill="#17120e" />
    </>
  );
}

function BrowserGlyph() {
  return (
    <>
      <rect x="16" y="16" width="116" height="60" rx="12" fill="#fffdf8" stroke={ink} strokeWidth="3" />
      <rect x="16" y="16" width="116" height="16" rx="12" fill="#FFD4B8" />
      <circle cx="30" cy="24" r="3.5" fill="#ff4d2e" />
      <circle cx="42" cy="24" r="3.5" fill="#ffe0b8" stroke={ink} strokeWidth="1.5" />
      <path d="M40 54 L70 44 L58 70 Z" fill="#ff4d2e" stroke={ink} strokeWidth="2" />
    </>
  );
}

const GLYPHS: Record<ToolSlug, () => ReactNode> = {
  identity: IdentityGlyph,
  phone: PhoneGlyph,
  email: EmailGlyph,
  cards: CardsGlyph,
  crypto: CryptoGlyph,
  secrets: SecretsGlyph,
  browser: BrowserGlyph,
};

export function ToolGlyph({ slug, className }: { slug: ToolSlug; className?: string }) {
  const Glyph = GLYPHS[slug];
  return (
    <svg viewBox="0 0 148 88" className={className} role="img" aria-hidden="true">
      <Glyph />
    </svg>
  );
}
