import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { SAMPLES } from "../data/samples.ts";
import { CARD_SCHEMA, EMPTY_DRAFT } from "../types.ts";
import {
  canExport,
  cardId,
  cardToJson,
  parseCardObject,
  parseCardText,
  serializeCard,
  slugify,
} from "./card.ts";

const sampleDir = join(fileURLToPath(new URL(".", import.meta.url)), "../../public/samples");
const frozen = new Date("2026-09-18T13:20:00.000Z");

function loadPublicSample(id: string): unknown {
  return JSON.parse(readFileSync(join(sampleDir, `${id}.json`), "utf8"));
}

describe("serializeCard", () => {
  it("emits a stable v1 constitution", () => {
    const card = serializeCard(SAMPLES[0].draft, frozen);
    assert.equal(card.schema, CARD_SCHEMA);
    assert.match(card.id, /^CC-[0-9A-F]{4}$/);
    assert.equal(card.issuedAt, frozen.toISOString());
    assert.equal(card.heuristic, true);
    assert.equal(canExport(card), true);
  });

  it("does not export until title and all three buckets are filled", () => {
    assert.equal(canExport(serializeCard(EMPTY_DRAFT, frozen)), false);
    assert.equal(canExport(serializeCard({ ...SAMPLES[0].draft, must: [] }, frozen)), false);
    assert.equal(canExport(serializeCard({ ...SAMPLES[0].draft, title: "" }, frozen)), false);
  });
});

describe("public samples", () => {
  for (const sample of SAMPLES) {
    it(`${sample.id} JSON matches the in-app draft`, () => {
      const file = loadPublicSample(sample.id);
      const fromFile = parseCardObject(file);
      assert.ok(fromFile, `failed to parse ${sample.id}.json`);
      const expected = serializeCard(sample.draft, frozen);
      const actual = serializeCard(fromFile, frozen);
      assert.equal(actual.title, expected.title);
      assert.equal(actual.agent, expected.agent);
      assert.equal(actual.scope, expected.scope);
      assert.equal(actual.session, expected.session);
      assert.deepEqual(actual.must, expected.must);
      assert.deepEqual(actual.mustNot, expected.mustNot);
      assert.deepEqual(actual.stop, expected.stop);
      assert.equal(canExport(actual), true);
    });
  }

  it("ships four named samples", () => {
    assert.deepEqual(
      SAMPLES.map((sample) => sample.id),
      [
        "research-only",
        "pr-comments-only",
        "inbox-drafts-no-send",
        "customer-support-guardrails",
      ],
    );
  });
});

describe("JSON roundtrip", () => {
  it("parses its own pretty JSON and aliases", () => {
    const card = serializeCard(SAMPLES[2].draft, frozen);
    const parsed = parseCardText(cardToJson(card));
    assert.ok(parsed);
    assert.equal(parsed.title, card.title);
    assert.deepEqual(parsed.mustNot, card.mustNot);

    const aliased = parseCardObject({
      name: "Alias constitution",
      issuedFor: "Clerk",
      mustDo: ["Stay in policy"],
      never: ["Never send mail"],
      stopIf: ["Stop if asked to send"],
    });
    assert.ok(aliased);
    assert.equal(aliased.title, "Alias constitution");
    assert.equal(aliased.agent, "Clerk");
    assert.deepEqual(aliased.must, ["Stay in policy"]);
    assert.deepEqual(aliased.mustNot, ["Never send mail"]);
    assert.deepEqual(aliased.stop, ["Stop if asked to send"]);
  });
});

describe("helpers", () => {
  it("builds a stable CC id and slug", () => {
    assert.equal(cardId("same"), cardId("same"));
    assert.notEqual(cardId("same"), cardId("other"));
    assert.match(cardId("same"), /^CC-[0-9A-F]{4}$/);
    assert.equal(slugify("PR comments only"), "pr-comments-only");
    assert.equal(slugify("   "), "constitution");
  });
});
