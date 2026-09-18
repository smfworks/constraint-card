import {
  EMPTY_DRAFT,
  CARD_SCHEMA,
  MAX_BULLET_LENGTH,
  MAX_BULLETS,
  type ConstraintCardDoc,
  type ConstraintDraft,
} from "../types.ts";

export function normalizeBullet(raw: string): string | null {
  const text = raw.trim().replace(/\s+/g, " ");
  if (!text) return null;
  if (text.length > MAX_BULLET_LENGTH) return text.slice(0, MAX_BULLET_LENGTH).trim();
  return text;
}

export function uniqueBullets(raw: readonly string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const item of raw) {
    const bullet = normalizeBullet(item);
    if (!bullet) continue;
    const key = bullet.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(bullet);
    if (out.length >= MAX_BULLETS) break;
  }
  return out;
}

export function addBullet(list: readonly string[], raw: string): string[] {
  const bullet = normalizeBullet(raw);
  if (!bullet) return [...list];
  const key = bullet.toLowerCase();
  if (list.some((item) => item.toLowerCase() === key)) return [...list];
  if (list.length >= MAX_BULLETS) return [...list];
  return [...list, bullet];
}

export function removeBullet(list: readonly string[], raw: string): string[] {
  const bullet = normalizeBullet(raw);
  if (!bullet) return [...list];
  const key = bullet.toLowerCase();
  return list.filter((item) => item.toLowerCase() !== key);
}

export function fnv1a(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function cardId(seed: string): string {
  const hex = fnv1a(seed).toString(16).toUpperCase().padStart(8, "0");
  return `CC-${hex.slice(0, 4)}`;
}

export function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return slug || "constitution";
}

export function serializeCard(
  draft: ConstraintDraft,
  issuedAt: Date = new Date(),
): ConstraintCardDoc {
  const title = draft.title.trim();
  const agent = draft.agent.trim();
  const scope = draft.scope.trim();
  const session = draft.session.trim();
  const must = uniqueBullets(draft.must);
  const mustNot = uniqueBullets(draft.mustNot);
  const stop = uniqueBullets(draft.stop);
  const issued = issuedAt.toISOString();
  const seed = [title, agent, scope, session, must.join(","), mustNot.join(","), stop.join(",")].join(
    "|",
  );

  return {
    schema: CARD_SCHEMA,
    id: cardId(seed),
    title,
    agent,
    scope,
    session,
    must,
    mustNot,
    stop,
    issuedAt: issued,
    heuristic: true,
  };
}

export function cardToJson(card: ConstraintCardDoc): string {
  return `${JSON.stringify(card, null, 2)}\n`;
}

export function canExport(card: ConstraintCardDoc): boolean {
  return Boolean(card.title && card.must.length > 0 && card.mustNot.length > 0 && card.stop.length > 0);
}

export function draftFromCard(card: ConstraintCardDoc): ConstraintDraft {
  return {
    title: card.title,
    agent: card.agent,
    scope: card.scope,
    session: card.session,
    must: [...card.must],
    mustNot: [...card.mustNot],
    stop: [...card.stop],
  };
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function readString(record: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return "";
}

export function parseCardObject(value: unknown): ConstraintDraft | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;

  const title = readString(record, ["title", "name"]);
  const agent = readString(record, ["agent", "issuedFor"]);
  const scope = typeof record.scope === "string" ? record.scope : "";
  const session = readString(record, ["session", "expiry", "window"]);
  const must = asStringArray(record.must ?? record.mustDo ?? record.always);
  const mustNot = asStringArray(
    record.mustNot ?? record.must_not ?? record.never ?? record.deny,
  );
  const stop = asStringArray(
    record.stop ?? record.stopIf ?? record.stopConditions ?? record.abort,
  );

  if (
    !title.trim() &&
    !agent.trim() &&
    must.length === 0 &&
    mustNot.length === 0 &&
    stop.length === 0
  ) {
    return null;
  }

  return {
    title: title.trim(),
    agent: agent.trim(),
    scope: scope.trim(),
    session: session.trim(),
    must: uniqueBullets(must),
    mustNot: uniqueBullets(mustNot),
    stop: uniqueBullets(stop),
  };
}

export function parseCardText(raw: string): ConstraintDraft | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    return parseCardObject(JSON.parse(trimmed));
  } catch {
    return null;
  }
}

export function cloneDraft(draft: ConstraintDraft = EMPTY_DRAFT): ConstraintDraft {
  return {
    ...draft,
    must: [...draft.must],
    mustNot: [...draft.mustNot],
    stop: [...draft.stop],
  };
}

export function mergeBuckets(
  draft: ConstraintDraft,
  incoming: { must: string[]; mustNot: string[]; stop: string[] },
): ConstraintDraft {
  return {
    ...draft,
    must: uniqueBullets([...draft.must, ...incoming.must]),
    mustNot: uniqueBullets([...draft.mustNot, ...incoming.mustNot]),
    stop: uniqueBullets([...draft.stop, ...incoming.stop]),
  };
}
