"use strict";
function canRefreshUpstoxSession(exchange, allowedUserId) {
  const expected=typeof allowedUserId==="string"?allowedUserId.trim():"";
  return Boolean(expected.length>=3 && expected.length<=100 &&
    exchange && typeof exchange==="object" &&
    typeof exchange.access_token==="string" && exchange.access_token.length>=20 &&
    typeof exchange.user_id==="string" && exchange.user_id===expected &&
    (exchange.broker==null||exchange.broker==="UPSTOX") &&
    exchange.is_active!==false);
}
module.exports={canRefreshUpstoxSession};
