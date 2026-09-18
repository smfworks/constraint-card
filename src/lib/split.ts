import { uniqueBullets } from "./card.ts";
import type { Bucket } from "../types.ts";

export interface SplitResult {
  must: string[];
  mustNot: string[];
  stop: string[];
  /** Lines that had no keyword and no active section header. */
  guessed: number;
}

const HEADER_STOP =
  /^(stop(?:\s*conditions?)?|abort(?:\s*when)?|halt|kill(?:\s*switch)?)\s*:?\s*$/i;
const HEADER_MUST_NOT =
  /^(must\s*not|must-not|mustn't|never|do\s*not|don't|forbidden|prohibited)\s*:?\s*$/i;
const HEADER_MUST = /^(musts?|always|required|shall|do)\s*:?\s*$/i;

const STOP_LINE =
  /\b(stop if|stop when|abort when|abort if|halt if|halt when|kill if|escalate if)\b/i;
const MUST_NOT_LINE =
  /\b(must not|must-not|mustn't|never|do not|don't|forbidden|prohibit)\b/i;
const MUST_LINE = /\b(must|always|required|shall)\b/i;

function stripDecor(line: string): string {
  return line
    .replace(/^\s*[-*•>]+\s*/, "")
    .replace(/^\s*\d+[.)]\s+/, "")
    .replace(/^\s*[\[(]?(?:must not|must|stop|never)[\])]\s*/i, "")
    .trim();
}

function headerBucket(line: string): Bucket | null {
  if (HEADER_STOP.test(line)) return "stop";
  if (HEADER_MUST_NOT.test(line)) return "mustNot";
  if (HEADER_MUST.test(line)) return "must";
  return null;
}

function classifyLine(line: string): Bucket | null {
  if (STOP_LINE.test(line)) return "stop";
  if (MUST_NOT_LINE.test(line)) return "mustNot";
  if (MUST_LINE.test(line)) return "must";
  return null;
}

/**
 * Heuristically split pasted free text into MUST / MUST NOT / STOP buckets.
 * Keywords: must, never, do not, stop if, abort when. Approximate — not a parser.
 */
export function splitPaste(raw: string): SplitResult {
  const must: string[] = [];
  const mustNot: string[] = [];
  const stop: string[] = [];
  let current: Bucket | null = null;
  let guessed = 0;

  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  for (const original of lines) {
    const line = stripDecor(original);
    if (!line) continue;

    const header = headerBucket(line);
    if (header) {
      current = header;
      continue;
    }

    const tagged = classifyLine(line);
    const bucket = tagged ?? current;
    if (!bucket) {
      guessed += 1;
      must.push(line);
      continue;
    }
    if (!tagged && current) {
      guessed += 1;
    }
    if (bucket === "must") must.push(line);
    else if (bucket === "mustNot") mustNot.push(line);
    else stop.push(line);
  }

  return {
    must: uniqueBullets(must),
    mustNot: uniqueBullets(mustNot),
    stop: uniqueBullets(stop),
    guessed,
  };
}

export function splitHasRules(result: SplitResult): boolean {
  return result.must.length + result.mustNot.length + result.stop.length > 0;
}
