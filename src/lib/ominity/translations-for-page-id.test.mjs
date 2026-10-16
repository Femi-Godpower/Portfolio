import assert from "node:assert/strict";
import { test } from "node:test";

import { translationsForPageId } from "./translations-for-page-id.ts";

test("joins per-locale routes on page id and marks the current locale canonical", () => {
  const routes = [
    { pageId: "2", locale: "en", path: "/terms-and-conditions" },
    { pageId: "2", locale: "nl", path: "/algemene-voorwaarden" },
    { pageId: "3", locale: "nl", path: "/contacteer-ons" },
  ];

  assert.deepEqual(translationsForPageId("2", "nl", routes), [
    { locale: "en", path: "/terms-and-conditions", slug: "terms-and-conditions" },
    { locale: "nl", path: "/algemene-voorwaarden", slug: "algemene-voorwaarden", canonical: true },
  ]);
});
