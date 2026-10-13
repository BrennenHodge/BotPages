import type { Metadata } from "next";
import { BRAND, SITE_ORIGIN, STATUS_LABEL, jobBySlug, outcomeBySlug, type Status } from "./taxonomy";

export function canonical(path: string) {
  return `${SITE_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}

export function robotsFor(indexable: boolean): Metadata["robots"] {
  return indexable ? { index: true, follow: true } : { index: false, follow: true };
}

export function pageMeta(input: {
  path: string;
  title: string;
  description: string;
  indexable?: boolean;
  absoluteTitle?: boolean;
}): Metadata {
  const title = input.absoluteTitle ? { absolute: input.title } : input.title;
  const url = canonical(input.path);
  return {
    title,
    description: input.description,
    alternates: { canonical: url },
    robots: robotsFor(input.indexable !== false),
    openGraph: { title: input.title, description: input.description, url, type: "website" },
  };
}

export function clip(text: string, max = 155) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}

export function cardTitle(category: string, agent: string, outcome: string) {
  const job = jobBySlug(category)?.label ?? category;
  const result = outcomeBySlug(outcome)?.label ?? outcome;
  const full = `${job} with ${agent}: ${result}`;
  if (full.length <= 60) return full;
  return clip(`${job} with ${agent}`, 60);
}

export function statusText(status: Status) {
  return STATUS_LABEL[status];
}

export type Crumb = { name: string; path: string };

export function breadcrumbLd(items: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: canonical(item.path),
    })),
  };
}

export function itemListLd(name: string, path: string, rows: { title: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    url: canonical(path),
    numberOfItems: rows.length,
    itemListElement: rows.map((row, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: row.title,
      url: canonical(row.href),
    })),
  };
}

export function collectionLd(name: string, path: string, aboutName?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    url: canonical(path),
    isPartOf: { "@type": "WebSite", name: BRAND, url: SITE_ORIGIN },
    ...(aboutName ? { about: { "@type": "SoftwareApplication", name: aboutName } } : {}),
  };
}
