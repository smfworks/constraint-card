# Constraint Card

Paste **must / must-not / stop** rules → get a shareable **agent constitution card** (PNG + copy text).

Contract is the agreement. Permit is the tool allowlist. **Constraint Card is the standing constitution** — hard rules the agent must keep.

**Write the bound. Print the card. Not enforcement — share the bound.**

[![MIT License](https://img.shields.io/badge/license-MIT-00D4FF?labelColor=0A0F1F)](LICENSE)

SMF Works viral kit:

1. **[Paste → Skill](https://github.com/smfworks/paste-to-skill)** ([demo](https://paste-to-skill.vercel.app)) — what to run
2. **[Skill Lint](https://github.com/smfworks/skill-lint)** — grade / fix
3. **[Agent Contract](https://github.com/smfworks/agent-contract)** — roles, success, stop
4. **[Tool Permit](https://github.com/smfworks/tool-permit)** — **GO / ALLOWLIST**
5. **Constraint Card (this)** — standing constitution
6. **[Refuse Card](https://github.com/smfworks/refuse-card)** — **NO / HOLD** twin
7. **[Agent Receipt](https://github.com/smfworks/agent-receipt)** ([demo](https://agent-receipt-green.vercel.app)) — what happened

Also in the kit: [Skill Card](https://github.com/smfworks/skill-card), [Prompt Diff](https://github.com/smfworks/prompt-diff), [Redact Before Share](https://github.com/smfworks/redact-before-share), [Context Budget](https://github.com/smfworks/context-budget), [Session Timeline](https://github.com/smfworks/session-timeline).

## Why a constraint card?

Agent work fails when the standing rules live in a chat scroll. A card is small enough to screenshot and specific enough to argue with — research-only vs PR comments vs inbox drafts vs support guardrails.

It is a **lab artifact for communication**. It is **not an enforcement runtime** and **not a legal instrument**. Pair it with an Agent Contract, a Tool Permit, a Refuse Card, a real sandbox, and a human. Judgment stays human.

The optional paste splitter is **heuristic** (keywords: must, never, do not, stop if, abort when). Approximate. Review the buckets.

## Quickstart

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

```bash
npm run build
npm run preview
npm test
```

Node 20+ (22 recommended). Client-side only — no auth, no backend, no API keys, no secrets.

## Use it

1. Pick **Research only**, **PR comments**, **Inbox drafts**, or **Support**, or write your own title.
2. Optional: name the **agent**, **scope**, and **session**.
3. Add **MUST** (green), **MUST NOT** (amber), and **STOP CONDITIONS** (cyan). Or paste a rule dump and split it.
4. **Download PNG**, **Copy share text**, or **Copy JSON**. **Load sample** fills research-only. **Reset** clears the compositor.

Other tools can emit the JSON schema below and skip the builder.

## Samples

Shipped in [`public/samples/`](public/samples/):

| File | Bound |
| --- | --- |
| `research-only.json` | Read-only survey. Cite, don't send, abort on secrets. |
| `pr-comments-only.json` | Comments only. Human merges. Stop if asked to deploy. |
| `inbox-drafts-no-send.json` | Drafts in the composer. Human sends. |
| `customer-support-guardrails.json` | Policy + escalate. No refunds, no account hopping. |

Load one in the app with `?sample=research-only`.

## Input / output schema

Canonical JSON Schema: [`public/schema/constraint-card.schema.json`](public/schema/constraint-card.schema.json)

Minimal constitution:

```json
{
  "title": "Research agent constitution",
  "must": ["Cite sources with links or paths"],
  "mustNot": ["Never send email or post publicly"],
  "stop": ["Stop if asked to publish or send outbound"]
}
```

Printed output (what the card represents):

| Field | Notes |
| --- | --- |
| `schema` | `smf.constraint-card.v1` |
| `id` | `CC-xxxx` serial |
| `title` | Short name for the constitution |
| `agent` | Optional who this binds |
| `scope` | Optional one-liner bound |
| `session` | Optional window label |
| `must` | Standing positive rules |
| `mustNot` | Standing prohibitions |
| `stop` | Abort / stop-if bullets |
| `issuedAt` | ISO-8601 UTC |
| `heuristic` | Always `true` — this is a demo printer |

Aliases accepted on ingest: `name` / `issuedFor` / `mustDo` / `must_not` / `never` / `stopIf` / `stopConditions` / `expiry`.

## Host a demo

Static files from `npm run build` (output: `dist/`). `vercel.json` rewrites unknown paths to `index.html` for SPA hosting.

Or Docker:

```bash
docker build -t constraint-card .
docker run --rm -p 8080:80 constraint-card
```

Then open [http://localhost:8080](http://localhost:8080).

## Stack

Vite + React + TypeScript. Constitution serialization is client-side (no model, no keys). PNG export via `html-to-image`. Fonts: Inter, Space Grotesk, JetBrains Mono. Palette: navy `#0A0F1F`, cyan `#00D4FF`, GO green `#34D399`, amber `#F59E0B`.

## Built by SMF Works

[SMF Works](https://smfworks.com) is a human-AI research lab. We publish what we learn, ship open agent tools, and install stacks on hardware you own.

Intelligence is abundant. Judgment is the product.

- Lab: [smfworks.com](https://smfworks.com)
- GitHub: [github.com/smfworks](https://github.com/smfworks)
- X: [@MichaelGannotti](https://x.com/MichaelGannotti)
- Twin: [Agent Contract](https://github.com/smfworks/agent-contract) — the agreement
- Twin: [Tool Permit](https://github.com/smfworks/tool-permit) — GO / ALLOWLIST
- Twin: [Refuse Card](https://github.com/smfworks/refuse-card) — NO / HOLD
- Sister: [Agent Receipt](https://github.com/smfworks/agent-receipt) — what happened

MIT licensed. **Not an enforcement runtime. Not a legal instrument.** This is a shareable constitution card, not an audit, not a sandbox, and not a hosted agent.

## License

[MIT](LICENSE) © 2026 SMF Works
