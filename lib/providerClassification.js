"use strict";

function cleanProviderLabel(value) {
  if (typeof value !== "string") return null;
  const label = value.trim();
  if (!label || label === "-" || ["unclassified", "n/a", "na", "not available"].includes(label.toLowerCase())) return null;
  return label;
}

function normalizeYahooClassification(primary = {}, fallback = {}, asOf = null) {
  const sector = cleanProviderLabel(primary?.sector) || cleanProviderLabel(fallback?.sector);
  const industry = cleanProviderLabel(primary?.industry) || cleanProviderLabel(fallback?.industry);
  return {
    sector: sector || "Unclassified",
    industry: industry || "Unclassified",
    classificationProvider: sector || industry ? "Yahoo Finance" : null,
    classificationStatus: sector && industry ? "provider_verified" : sector || industry ? "partial" : "unclassified",
    classificationAsOf: asOf || primary?.classificationAsOf || fallback?.classificationAsOf || null
  };
}

module.exports = { normalizeYahooClassification };
