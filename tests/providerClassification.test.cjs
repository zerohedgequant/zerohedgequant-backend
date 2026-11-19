"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizeYahooClassification } = require("../lib/providerClassification");

test("missing, dash and placeholder classifications stay Unclassified", () => {
  assert.deepEqual(normalizeYahooClassification({ sector: "-", industry: "Unclassified" }), {
    sector: "Unclassified",
    industry: "Unclassified",
    classificationProvider: null,
    classificationStatus: "unclassified",
    classificationAsOf: null
  });
});

test("complete provider mappings are marked verified", () => {
  const result = normalizeYahooClassification({ sector: "Technology", industry: "Software—Application" }, {}, "2026-11-19T10:00:00.000Z");
  assert.equal(result.sector, "Technology");
  assert.equal(result.industry, "Software—Application");
  assert.equal(result.classificationProvider, "Yahoo Finance");
  assert.equal(result.classificationStatus, "provider_verified");
});

test("one provider field is marked partial and the other remains Unclassified", () => {
  const result = normalizeYahooClassification({ sector: "Financial Services", industry: "-" });
  assert.equal(result.sector, "Financial Services");
  assert.equal(result.industry, "Unclassified");
  assert.equal(result.classificationProvider, "Yahoo Finance");
  assert.equal(result.classificationStatus, "partial");
});

test("a fallback Yahoo field is used only when it contains a real provider label", () => {
  const result = normalizeYahooClassification({ sector: "Unclassified", industry: "" }, { sector: "Consumer Defensive", industry: "-" });
  assert.equal(result.sector, "Consumer Defensive");
  assert.equal(result.industry, "Unclassified");
  assert.equal(result.classificationStatus, "partial");
});
