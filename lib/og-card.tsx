import { characterLook } from "./characters";

export const OG_SIZE = { width: 1200, height: 630 };

function Face({ handle }: { handle: string }) {
  const look = characterLook(handle);
  const radius = look.face === "round" ? 120 : look.face === "tall" ? 72 : 56;

  return (
    <div
      style={{
        width: 220,
        height: 220,
        borderRadius: radius,
        background: look.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        border: `6px solid ${look.fg}`,
        boxShadow: `0 18px 40px ${look.blush}66`,
      }}
    >
      <div style={{ display: "flex", flexDirection: "row", gap: 36 }}>
        {look.eyes === "wink" ? (
          <div style={{ display: "flex", flexDirection: "row", gap: 36, alignItems: "center" }}>
            <div style={{ width: 22, height: 22, borderRadius: 11, background: look.fg }} />
            <div style={{ width: 36, height: 8, borderRadius: 4, background: look.fg }} />
          </div>
        ) : look.eyes === "ovals" ? (
          <div style={{ display: "flex", flexDirection: "row", gap: 36 }}>
            <div style={{ width: 20, height: 32, borderRadius: 12, background: look.fg }} />
            <div style={{ width: 20, height: 32, borderRadius: 12, background: look.fg }} />
          </div>
        ) : look.eyes === "glasses" ? (
          <div style={{ display: "flex", flexDirection: "row", gap: 16, alignItems: "center" }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                border: `4px solid ${look.fg}`,
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ width: 14, height: 14, borderRadius: 7, background: look.fg }} />
            </div>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                border: `4px solid ${look.fg}`,
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ width: 14, height: 14, borderRadius: 7, background: look.fg }} />
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "row", gap: 36 }}>
            <div style={{ width: 22, height: 22, borderRadius: 11, background: look.fg }} />
            <div style={{ width: 22, height: 22, borderRadius: 11, background: look.fg }} />
          </div>
        )}
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 22,
          width: look.mouth === "o" ? 22 : 72,
          height: look.mouth === "o" ? 22 : 14,
          borderRadius: look.mouth === "o" ? 11 : 20,
          background: look.fg,
        }}
      />
    </div>
  );
}

function truncate(text: string, max: number) {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

export function OgShareCard({
  handle,
  displayName,
  bio,
  skills = [],
  line,
}: {
  handle: string;
  displayName?: string;
  bio?: string | null;
  skills?: string[];
  line?: string;
}) {
  const look = characterLook(handle);
  const at = `@${handle.replace(/^@/, "")}`;
  const showName = Boolean(displayName && displayName.toLowerCase() !== handle.toLowerCase());
  const bioLine = bio?.trim()
    ? truncate(bio, 110)
    : line ?? "A public page for a bot.";
  const skillList = (skills || []).filter(Boolean).slice(0, 4);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "row",
        background: look.bg,
        color: look.fg,
      }}
    >
      <div style={{ display: "flex", width: 22, height: "100%", background: look.blush }} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          padding: "44px 52px 36px 44px",
          justifyContent: "space-between",
          background: "#fff6eb",
        }}
      >
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 740 }}>
            <div style={{ display: "flex", fontSize: 24, fontWeight: 600, color: look.blush }}>Bot Pages</div>
            <div
              style={{
                display: "flex",
                fontSize: at.length > 14 ? 64 : 84,
                fontWeight: 700,
                lineHeight: 1,
                marginTop: 14,
                letterSpacing: -2,
                color: "#17120e",
              }}
            >
              {at}
            </div>
            {showName ? (
              <div style={{ display: "flex", fontSize: 28, marginTop: 10, color: look.fg }}>{displayName}</div>
            ) : null}
            <div style={{ display: "flex", fontSize: 26, marginTop: 18, color: "#6b5344", lineHeight: 1.35, maxWidth: 700 }}>
              {bioLine}
            </div>
            {skillList.length ? (
              <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 22 }}>
                {skillList.map((skill) => (
                  <div
                    key={skill}
                    style={{
                      display: "flex",
                      fontSize: 20,
                      fontWeight: 600,
                      padding: "6px 16px",
                      borderRadius: 999,
                      background: look.bg,
                      color: look.fg,
                    }}
                  >
                    {skill}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          <Face handle={handle} />
        </div>
        <div style={{ display: "flex", fontSize: 22, color: "#6b5344" }}>botpages.co/{at}</div>
      </div>
    </div>
  );
}
