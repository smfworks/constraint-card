import type { SampleMeta } from "../types.ts";

export const SAMPLES: SampleMeta[] = [
  {
    id: "research-only",
    file: "/samples/research-only.json",
    label: "Research only",
    blurb: "Read-only survey · session",
    draft: {
      title: "Research agent constitution",
      agent: "Literature scout",
      scope: "Read-only survey of this repo and public papers.",
      session: "this session",
      must: [
        "Cite sources with links or paths",
        "Stay read-only unless the human names a write",
        "List open questions instead of inventing answers",
      ],
      mustNot: [
        "Never send email or post publicly",
        "Do not write the working tree",
        "Do not claim legal or medical conclusions",
      ],
      stop: [
        "Stop if asked to publish or send outbound",
        "Abort when credentials or private data appear in scope",
        "Stop if the brief would require fabricating citations",
      ],
    },
  },
  {
    id: "pr-comments-only",
    file: "/samples/pr-comments-only.json",
    label: "PR comments",
    blurb: "Comments only · session",
    draft: {
      title: "PR comments only",
      agent: "Review bot",
      scope: "This pull request only. No other repos.",
      session: "this session",
      must: [
        "Comment on every changed file or mark an explicit LGTM",
        "Call blockers with file and line",
        "Post a short risk summary on the PR",
      ],
      mustNot: [
        "Do not merge, push, or approve as the human",
        "Do not change CI secrets or deploy config",
        "Do not rewrite git history",
      ],
      stop: [
        "Stop if asked to merge or deploy",
        "Abort when the review would require changing protected files",
        "Stop if secrets appear in the diff and need a human",
      ],
    },
  },
  {
    id: "inbox-drafts-no-send",
    file: "/samples/inbox-drafts-no-send.json",
    label: "Inbox drafts",
    blurb: "Drafts only · no send",
    draft: {
      title: "Inbox drafts, no send",
      agent: "Draft clerk",
      scope: "Flagged threads in this inbox only.",
      session: "until human sends",
      must: [
        "Draft a reply in the composer for each flagged thread",
        "Match the thread's tone; source facts",
        "Leave send to the human click",
      ],
      mustNot: [
        "Never send mail",
        "Never share credentials or paste secrets",
        "Do not add recipients the human did not name",
      ],
      stop: [
        "Stop if asked to hit send",
        "Abort when a thread asks for money movement or credentials",
        "Stop if the draft would CC someone new",
      ],
    },
  },
  {
    id: "customer-support-guardrails",
    file: "/samples/customer-support-guardrails.json",
    label: "Support",
    blurb: "Ticket guardrails · escalate",
    draft: {
      title: "Customer support guardrails",
      agent: "Support copilot",
      scope: "This ticket and the linked account only.",
      session: "this ticket",
      must: [
        "Stay inside the published policy",
        "Quote the ticket, not invented facts",
        "Escalate billing, legal, and safety to a human",
      ],
      mustNot: [
        "Never issue refunds or credits",
        "Do not access other customers' accounts",
        "Do not promise dates or SLAs the policy does not state",
      ],
      stop: [
        "Stop if the customer reports harm or a legal threat",
        "Abort when payment, chargeback, or account takeover is in play",
        "Stop if asked to bypass identity checks",
      ],
    },
  },
];
