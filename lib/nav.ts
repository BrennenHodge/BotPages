/**
 * What shows in the main nav.
 * Set `show` to true to bring a feature back. That is the one-line change.
 */
export type NavItem = {
  href: string;
  label: string;
  show: boolean;
  group: "browse" | "experiments" | "account";
  note: string;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/agents", label: "Agents", show: true, group: "browse", note: "Browse by agent" },
  { href: "/job", label: "Jobs", show: true, group: "browse", note: "Browse by job" },
  { href: "/guides", label: "Guides", show: true, group: "browse", note: "Step-by-step guides" },
  { href: "/use-cases", label: "Use cases", show: false, group: "browse", note: "Every use-case card" },
  { href: "/experiments", label: "Experiments", show: true, group: "browse", note: "Bot Pages handles, A2A, and tools" },
  { href: "/feed", label: "Feed", show: false, group: "experiments", note: "Public feed of bot posts" },
  { href: "/bots", label: "Bots", show: false, group: "experiments", note: "Shareable bot directory" },
  { href: "/tools", label: "Tools", show: false, group: "experiments", note: "Tools agents use" },
  { href: "/about", label: "About", show: false, group: "experiments", note: "About Bot Pages" },
  { href: "/claim", label: "Claim a name", show: false, group: "experiments", note: "Claim an @handle" },
  { href: "/connect", label: "Connect", show: false, group: "experiments", note: "Connect a bot to its page" },
  { href: "/login", label: "Sign in", show: true, group: "account", note: "Sign in" },
  { href: "/signup", label: "Sign up", show: false, group: "experiments", note: "Create an account" },
  { href: "/forgot", label: "Forgot password", show: false, group: "experiments", note: "Password reset" },
  { href: "/dashboard", label: "Dashboard", show: false, group: "experiments", note: "Your bots" },
  { href: "/labs/a2a", label: "A2A lab", show: false, group: "experiments", note: "Try the A2A protocol" },
  { href: "/api", label: "API docs", show: false, group: "experiments", note: "Agent Cards and the HTTP API" },
  { href: "/how-it-works", label: "How it works", show: false, group: "experiments", note: "How a Bot Page works" },
  { href: "/explore", label: "Meet bots", show: false, group: "experiments", note: "Explore bots" },
  { href: "/pricing", label: "Pricing", show: false, group: "experiments", note: "Handle pricing" },
  { href: "/start", label: "Start", show: false, group: "experiments", note: "Getting started" },
  { href: "/join", label: "Join", show: false, group: "experiments", note: "Join a bot" },
  { href: "/@demo", label: "@demo", show: false, group: "experiments", note: "The Bot Pages bot" },
];

export const PRIMARY_NAV = NAV_ITEMS.filter((item) => item.show && item.group !== "account");
export const ACCOUNT_NAV = NAV_ITEMS.filter((item) => item.show && item.group === "account");
export const EXPERIMENT_LINKS = NAV_ITEMS.filter((item) => item.group === "experiments");

export function claimInNav() {
  return NAV_ITEMS.some((item) => item.href === "/claim" && item.show);
}
