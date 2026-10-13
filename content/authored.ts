import type { GuideRecord, UseCaseRecord } from "@/lib/use-cases/types";

const PUBLISHED = "2026-10-13T00:00:00.000Z";

/** Simon Willison's Claude Code card. Facts are from his post of Oct 23, 2025. */
export const SIMON_CARD: UseCaseRecord = {
  kind: "use-case",
  slug: "build-terminal-to-html-tool-claude-code",
  title: "Build a terminal-to-HTML sharing tool with one prompt",
  summary:
    "Simon Willison gave Claude Code for web one detailed prompt and got a working tool that turns pasted terminal output into a shareable link.",
  agents: ["claude-code"],
  category: "software",
  outcome: "build",
  outcomes: ["build", "save-time"],
  status: "worked",
  creator: { handle: "simonw", url: "https://x.com/simonw" },
  sourceUrl: "https://simonwillison.net/2025/Oct/23/claude-code-for-web-video/",
  sourceLabel: "Simon Willison, blog post, Oct 23, 2025",
  prompt: `Build a new tool called terminal-to-html which lets the user copy RTF directly
from their terminal and paste it into a paste area, it then produces the HTML
version of that in a textarea with a copy button, below is a button that says
"Save this to a Gist", and below that is a full preview.`,
  promptAttribution: "creator",
  promptCredit: "Creator's prompt (opening lines, full prompt at the source)",
  whatTheyDid:
    "Simon kept converting terminal sessions into shareable HTML by hand. He'd copy the output, paste it into his rtf-to-html tool, paste the HTML into a GitHub Gist, grab the Gist ID, and share a gistpreview link, several times a day. He pointed Claude Code for web at his simonw/tools repo and asked for a new terminal-to-html tool. The key move was telling it to reuse how two existing tools in the repo already worked: rtf-to-html.html for the conversion, and openai-audio-output.html for the Save to Gist sign-in flow.",
  howItWent:
    'Worked. In his words: "It\'s exactly what I asked for, and the green-on-black terminal aesthetic is spot on too." The catch is that the prompt was long. He says it took him several minutes to type. He recorded the whole build in an 11-minute video.',
  steps: [
    "Point Claude Code for web at the simonw/tools repo.",
    "Ask for a new terminal-to-html tool, and tell it to reuse rtf-to-html.html for the conversion.",
    "Tell it to reuse the Save to Gist sign-in flow from openai-audio-output.html.",
    "Review the result against the prompt. Simon's post says the tool matched what he asked for.",
  ],
  watchOut: [
    "The prompt was long. Simon says it took him several minutes to type.",
    "The full prompt is on his post. The block on this page is the opening lines only.",
  ],
  addedAt: "2025-10-23T00:00:00.000Z",
  updatedAt: PUBLISHED,
  legacyPath: "",
};

/** Damo (@green_tuff) hosting guide. Source post and install link checked Oct 13, 2026. */
export const HOSTING_GUIDE: GuideRecord = {
  kind: "guide",
  slug: "move-website-hosting-in-four-days",
  title: "Move your website hosting in four days with a Grok Bot team",
  seoTitle: "Move Your Website Hosting in 4 Days with a Grok Bot Team",
  seoDescription:
    'Damo asked his Grok Bot "chief" to fix a hosting problem. In 4 days it moved domains, rebuilt the site on GitHub and set up Cloudflare. Steps + install link.',
  summary:
    'Damo handed a hosting problem to the Grok Bot he calls his "chief." In 4 days it moved domains, rebuilt the site on GitHub, and set up Cloudflare.',
  agents: ["grok-bot"],
  category: "software",
  outcome: "build",
  outcomes: ["build"],
  status: "partly-worked",
  statusNote: "Worked (launch unconfirmed)",
  creator: { handle: "green_tuff", url: "https://x.com/green_tuff" },
  creatorName: "Damo",
  sourceUrl: "https://x.com/green_tuff/status/2100217965962789215",
  sourceLabel: "Source post, September 16, 2026",
  result:
    'Damo had a hosting problem. He handed it to the Grok Bot he calls his "chief" and asked it to put together a team to fix it. In his words, posted on September 16, 2026:',
  quote:
    "In 4 days, chief transferred domains to a new registrar, built a new website in a GitHub repository, set up a Cloudflare hosting account, and tested it. All records set. We go live this Friday.",
  who: "Damo has a website and a hosting problem he needed solved. He didn't say what the issue was. Moving a site isn't one task, it's a chain: domain transfer, rebuild, new host, DNS records, testing. Each step waits on the last. He posted this in reply to Grok's call for people to share how they've worked Grok Bot into their work.",
  setup: [
    'The bot: a lead bot Damo calls his "chief." In the post he linked a public template, Operations Manager by Damion. Its listing describes it as an "Operations Manager front door for a small business bot team" that "coordinates specialists, runs lean morning/weekly routines, and only escalates hard gates to you."',
    "The accounts involved, as he named them: a domain registrar (old and new), GitHub (the new site lives in a repository), and Cloudflare (the new hosting account and records).",
    "What he didn't share: the exact prompt, which logins or connectors he gave it, or the names of the specialist bots. The steps below are our suggested way to copy the shape of his setup, not his exact routine.",
  ],
  steps: [
    {
      name: "Install the template",
      text: "Add Operations Manager by Damion to your Grok Bot, or use your own lead bot if you already have one. Read its instructions before you add it, and never paste a password into chat.",
    },
    {
      name: "Write the problem down in one message",
      text: "Name the domain, where it's hosted now, what's wrong, and where you want it to end up. Damo's target was a new registrar, a GitHub repo and Cloudflare.",
    },
    {
      name: "Ask it to build the team first",
      text: "Have it name the specialists, what each one owns, and what it needs from you before anything changes.",
    },
    {
      name: "Set your gates",
      text: 'Decide up front what needs your yes: starting the domain transfer, any payment, changing DNS, and the go-live switch. The template is built to escalate "hard gates" to you, so tell it what yours are.',
    },
    {
      name: "Give access one account at a time",
      text: "Connect the registrar, GitHub and Cloudflare as each step needs them, through the proper login or connector flow rather than by pasting keys into chat.",
    },
    {
      name: "Rebuild before you switch",
      text: "Have the team build the new site in a GitHub repo and set up the new hosting while the old site stays up.",
    },
    {
      name: "Test, then set records",
      text: "Ask for a checklist (pages load, forms work, email still routes) before it sets the final records.",
    },
    {
      name: "Pick a go-live day",
      text: "Damo set his for the Friday after the work was done. Keep the old host until the new site has run cleanly.",
    },
  ],
  prompt: `You are my operations chief. Our website hosting needs to move.
Current setup: <domain>, registrar <X>, host <Y>. Problem: <what's wrong>.
Goal: domain at <new registrar>, site in a GitHub repo, hosted on Cloudflare.

First, propose a small team of specialists and what each one owns.
List every step that needs my approval: transfers, payments, DNS changes, go-live.
Do nothing irreversible without my yes. After each step, report what's done,
what's stuck, and what you need from me.`,
  promptAttribution: "ours",
  promptCredit: "Starter prompt (ours, not Damo's)",
  results:
    "What Damo posted, and nothing more: in 4 days his chief transferred the domains to a new registrar, built a new website in a GitHub repository, set up a Cloudflare hosting account, tested it, and set all records. He said they would go live that Friday. We haven't seen a follow-up post confirming the launch yet. If he posts one, we'll add it here and change the badge to Worked.",
  watchOut: [
    "Domain transfers and DNS changes are the risky part. A wrong record can take your site or email offline. Keep those behind your approval.",
    "Don't cancel the old host early. Wait until the new site has been live and checked.",
  ],
  installUrl: "https://x.ai/bot/qQ0fMeAgyYvPV8jAPmVw_",
  installLabel: "Add Operations Manager by Damion to Grok Bot",
  installNote: "Shared publicly by the creator. Read the instructions before you install.",
  credit: "Setup by Damo, @green_tuff.",
  faq: [
    {
      question: "Can Grok Bot move my website to a new host?",
      answer: "Damo's chief did it in four days, by his account. You still approve the risky steps.",
    },
    {
      question: "Do I need to be a developer?",
      answer:
        "Damo didn't mention writing code. His chief built the site in a GitHub repo. You still own the accounts and approve each gate.",
    },
    {
      question: "What does assembling a team mean?",
      answer:
        "You give one lead bot the whole problem. It sets up specialist bots for each part and coordinates them, coming back to you only for decisions.",
    },
  ],
  toolName: "Operations Manager by Damion",
  addedAt: "2026-09-16T00:00:00.000Z",
  updatedAt: PUBLISHED,
  legacyPath: "/ways/move-website-hosting-in-four-days",
};
