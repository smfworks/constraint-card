import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { splitHasRules, splitPaste } from "./split.ts";

describe("splitPaste", () => {
  it("buckets keyword lines into must / must-not / stop", () => {
    const text = [
      "Must cite sources with links",
      "Never send email",
      "Do not write the working tree",
      "Stop if asked to publish",
      "Abort when credentials appear",
    ].join("\n");
    const result = splitPaste(text);
    assert.deepEqual(result.must, ["Must cite sources with links"]);
    assert.deepEqual(result.mustNot, ["Never send email", "Do not write the working tree"]);
    assert.deepEqual(result.stop, [
      "Stop if asked to publish",
      "Abort when credentials appear",
    ]);
    assert.equal(splitHasRules(result), true);
  });

  it("follows MUST / MUST NOT / STOP section headers", () => {
    const text = `
MUST
- Cite sources
- Stay read-only

MUST NOT
- Post publicly

STOP CONDITIONS
- Secrets in scope
`;
    const result = splitPaste(text);
    assert.deepEqual(result.must, ["Cite sources", "Stay read-only"]);
    assert.deepEqual(result.mustNot, ["Post publicly"]);
    assert.deepEqual(result.stop, ["Secrets in scope"]);
  });

  it("strips bullets and numbers, ignores blanks", () => {
    const result = splitPaste("1. Must stay in policy\n\n* Never issue refunds\n");
    assert.deepEqual(result.must, ["Must stay in policy"]);
    assert.deepEqual(result.mustNot, ["Never issue refunds"]);
  });

  it("guesses uncategorized lines into MUST", () => {
    const result = splitPaste("Cite sources with links\nNever send mail");
    assert.deepEqual(result.must, ["Cite sources with links"]);
    assert.deepEqual(result.mustNot, ["Never send mail"]);
    assert.equal(result.guessed, 1);
  });

  it("returns empty buckets for blank input", () => {
    const result = splitPaste("   \n\n");
    assert.deepEqual(result.must, []);
    assert.deepEqual(result.mustNot, []);
    assert.deepEqual(result.stop, []);
    assert.equal(splitHasRules(result), false);
  });
});
