export function IntegrationMark({
  id,
  className = "size-3.5",
}: {
  id: string;
  className?: string;
}) {
  const cls = `shrink-0 ${className}`;
  switch (id) {
    case "x":
      return (
        <svg viewBox="0 0 24 24" className={cls} aria-hidden>
          <path fill="currentColor" d="M18.9 2H22l-6.8 7.8L22.7 22h-6.3l-4.9-7.2L6 22H2.9l7.3-8.4L1.5 2h6.5l4.4 6.6L18.9 2Zm-1.1 18h1.7L6.3 3.9H4.5L17.8 20Z" />
        </svg>
      );
    case "hackernews":
      return (
        <svg viewBox="0 0 24 24" className={cls} aria-hidden>
          <rect width="24" height="24" rx="4" fill="#ff6600" />
          <path fill="#fff" d="M7.2 6.4h2.2l2.6 5.1 2.6-5.1h2.2l-4 7.2V17.6h-1.6v-4z" />
        </svg>
      );
    case "github":
      return (
        <svg viewBox="0 0 24 24" className={cls} aria-hidden>
          <path
            fill="currentColor"
            d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.9.6-3.5-1.4-3.5-1.4-.5-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.7.4-1.1.6-1.3-2.3-.3-4.7-1.2-4.7-5.2 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.6 9.6 0 0 1 5 0c2-.1 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.7.7 1 1.6 1 2.7 0 4-2.4 4.9-4.7 5.2.4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A10 10 0 0 0 12 2Z"
          />
        </svg>
      );
    case "reddit":
      return (
        <svg viewBox="0 0 24 24" className={cls} aria-hidden>
          <circle cx="12" cy="12" r="12" fill="#ff4500" />
          <circle cx="8.5" cy="12.2" r="1.4" fill="#fff" />
          <circle cx="15.5" cy="12.2" r="1.4" fill="#fff" />
          <path fill="#fff" d="M8.2 15.2c1.1 1.2 6.5 1.2 7.6 0-.9 1.8-6.7 1.8-7.6 0Z" />
        </svg>
      );
    case "gmail":
      return (
        <svg viewBox="0 0 24 24" className={cls} aria-hidden>
          <path fill="#ea4335" d="M2 6.5 12 13l10-6.5V18a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z" />
          <path fill="#fbbc05" d="M2 6.5 12 13V4L4 6.5z" />
          <path fill="#34a853" d="M22 6.5 12 13V4l8 2.5z" />
          <path fill="#c5221f" d="M2 6.5V18l8-5z" />
        </svg>
      );
    case "grok":
      return (
        <svg viewBox="0 0 24 24" className={cls} aria-hidden>
          <circle cx="12" cy="12" r="11" fill="#17120e" />
          <path fill="#fff6eb" d="M8 8h3.2l5 8H13L8 8Zm5.2 0H16v8h-2.8l-1.4-2.2L13.2 8Z" />
        </svg>
      );
    case "calendar":
      return (
        <svg viewBox="0 0 24 24" className={cls} aria-hidden>
          <rect x="3" y="5" width="18" height="16" rx="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path fill="currentColor" d="M7 3h1.6v4H7zm8.4 0H17v4h-1.6z" />
          <path fill="currentColor" d="M3 9h18v1.6H3z" />
        </svg>
      );
    case "slack":
      return (
        <svg viewBox="0 0 24 24" className={cls} aria-hidden>
          <path fill="#e01e5a" d="M6 14.5A2.5 2.5 0 1 1 3.5 12H6z" />
          <path fill="#36c5f0" d="M9.5 6A2.5 2.5 0 1 1 12 3.5V6z" />
          <path fill="#2eb67d" d="M18 9.5A2.5 2.5 0 1 1 20.5 12H18z" />
          <path fill="#ecb22e" d="M14.5 18A2.5 2.5 0 1 1 12 20.5V18z" />
        </svg>
      );
    default:
      return (
        <span className={`${cls} inline-block rounded-sm bg-foreground/20`} aria-hidden />
      );
  }
}
