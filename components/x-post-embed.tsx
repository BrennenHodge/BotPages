"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: (el?: HTMLElement) => void;
      };
    };
  }
}

export function XPostEmbed({ url }: { url: string }) {
  const rootRef = useRef<HTMLDivElement>(null);

  function hydrate() {
    const root = rootRef.current;
    if (root) window.twttr?.widgets.load(root);
  }

  useEffect(() => {
    hydrate();
  }, [url]);

  return (
    <div ref={rootRef} className="overflow-hidden [&_iframe]:max-w-full [&_.twitter-tweet]:my-0">
      <blockquote className="twitter-tweet" data-dnt="true" data-width="100%">
        <a href={url}>View post on X</a>
      </blockquote>
      <Script src="https://platform.twitter.com/widgets.js" strategy="lazyOnload" onReady={hydrate} />
    </div>
  );
}
