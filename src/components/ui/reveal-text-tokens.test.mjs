import assert from "node:assert/strict";
import { test } from "node:test";

import { tokenize } from "./reveal-text-tokens.ts";

const render = (text) => tokenize(text).map((t) => (t.accent ? `[${t.word}]` : t.word) + (t.space ? " " : "")).join("");

test("keeps punctuation glued to an accent word", () => {
  assert.equal(render("What's *next*?"), "What's [next]?");
});

test("keeps the spaces around an accent word in the middle", () => {
  assert.equal(render("I want to *discover* it all"), "I want to [discover] it all");
});

test("splits a multi-word accent into accented words", () => {
  assert.equal(render("Step by *step by step*"), "Step by [step] [by] [step]");
});
