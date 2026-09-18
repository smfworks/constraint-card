import type { ConstraintCardDoc } from "../types.ts";

const SHARE_URL = "https://github.com/smfworks/constraint-card";

export function formatStampTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  return `${dd} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()} · ${hh}:${mm} UTC`;
}

export function formatShareText(card: ConstraintCardDoc): string {
  const must = card.must.map((line) => `• ${line}`).join("\n");
  const mustNot = card.mustNot.map((line) => `• ${line}`).join("\n");
  const stop = card.stop.map((line) => `• ${line}`).join("\n");
  const lines = [
    "⚖️ Constraint Card",
    card.title || "Untitled constitution",
    card.agent ? `Agent: ${card.agent}` : "",
    card.scope ? `Scope: ${card.scope}` : "",
    card.session ? `Session: ${card.session}` : "",
    "",
    "MUST",
    must || "• (none)",
    "",
    "MUST NOT",
    mustNot || "• (none)",
    "",
    "STOP CONDITIONS",
    stop || "• (none)",
    "",
    "Not enforcement — share the bound.",
    "Constraint Card · SMF Works",
    SHARE_URL,
  ];
  return lines
    .filter((line, index, all) => !(line === "" && all[index - 1] === ""))
    .join("\n");
}

export function formatCompactStats(card: ConstraintCardDoc): string {
  const session = card.session || "standing";
  return `${card.must.length} must · ${card.mustNot.length} must not · ${card.stop.length} stop · ${session}`;
}
