import type { JobSlug, OutcomeSlug, Status } from "./taxonomy";

export type Creator = {
  handle: string;
  url: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type UseCaseRecord = {
  kind: "use-case";
  slug: string;
  title: string;
  summary: string;
  agents: string[];
  category: JobSlug;
  outcome: OutcomeSlug;
  outcomes: OutcomeSlug[];
  status: Status;
  creator: Creator | null;
  sourceUrl: string;
  sourceLabel: string;
  prompt: string;
  promptAttribution: "creator" | "ours";
  promptCredit: string;
  whatTheyDid: string;
  howItWent: string;
  steps: string[];
  watchOut: string[];
  addedAt: string;
  updatedAt: string;
  legacyPath: string;
};

export type TemplateRecord = {
  kind: "template";
  slug: string;
  title: string;
  summary: string;
  description: string;
  agents: string[];
  category: JobSlug;
  outcome: OutcomeSlug;
  outcomes: OutcomeSlug[];
  status: Status;
  creator: Creator | null;
  sourceUrl: string | null;
  sourceLabel: string;
  installUrl: string | null;
  installNote: string | null;
  includes: string[];
  whatItDoes: string;
  howItWent: string;
  steps: string[];
  prompt: string;
  promptAttribution: "ours";
  faq: FaqItem[];
  addedAt: string | null;
  updatedAt: string | null;
  legacyPaths: string[];
};

export type RoundupRecord = {
  slug: string;
  title: string;
  intro: string;
  entries: { kind: "use-case" | "template"; slug: string }[];
};

export type CatalogFile = {
  generatedAt: string;
  useCases: UseCaseRecord[];
  templates: TemplateRecord[];
  roundups: RoundupRecord[];
};

export type GuideStep = {
  name: string;
  text: string;
};

export type GuideRecord = {
  kind: "guide";
  slug: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  summary: string;
  agents: string[];
  category: JobSlug;
  outcome: OutcomeSlug;
  outcomes: OutcomeSlug[];
  status: Status;
  statusNote: string;
  creator: Creator;
  creatorName: string;
  sourceUrl: string;
  sourceLabel: string;
  result: string;
  quote: string;
  who: string;
  setup: string[];
  steps: GuideStep[];
  prompt: string;
  promptAttribution: "ours" | "creator";
  promptCredit: string;
  results: string;
  watchOut: string[];
  installUrl: string | null;
  installLabel: string;
  installNote: string;
  credit: string;
  faq: FaqItem[];
  toolName: string;
  addedAt: string;
  updatedAt: string;
  legacyPath: string;
};

export type Published = UseCaseRecord | TemplateRecord | GuideRecord;

export type RelatedLink = {
  href: string;
  label: string;
  note: string;
};
