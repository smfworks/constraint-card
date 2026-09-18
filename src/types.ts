export type Bucket = "must" | "mustNot" | "stop";

export interface ConstraintDraft {
  title: string;
  agent: string;
  scope: string;
  session: string;
  must: string[];
  mustNot: string[];
  stop: string[];
}

export interface ConstraintCardDoc {
  schema: "smf.constraint-card.v1";
  id: string;
  title: string;
  agent: string;
  scope: string;
  session: string;
  must: string[];
  mustNot: string[];
  stop: string[];
  issuedAt: string;
  heuristic: true;
}

export interface SampleMeta {
  id: string;
  file: string;
  label: string;
  blurb: string;
  draft: ConstraintDraft;
}

export const CARD_SCHEMA = "smf.constraint-card.v1" as const;

export const EMPTY_DRAFT: ConstraintDraft = {
  title: "",
  agent: "",
  scope: "",
  session: "",
  must: [],
  mustNot: [],
  stop: [],
};

export const MAX_BULLET_LENGTH = 160;
export const MAX_BULLETS = 8;
