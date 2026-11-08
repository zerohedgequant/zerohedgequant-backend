"use strict";
// An absent or zero upstream quote is not a real price. In particular,
// a successful Yahoo fundamental lookup must not disguise an Upstox outage.
function isUsableQuote(quote) {
  return !!quote && typeof quote === "object" &&
    Number.isFinite(Number(quote.last_price)) &&
    Number(quote.last_price) > 0;
}
module.exports = {isUsableQuote};
