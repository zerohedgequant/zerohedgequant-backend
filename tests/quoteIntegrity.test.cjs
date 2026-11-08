const test=require("node:test");
const assert=require("node:assert/strict");
const {isUsableQuote}=require("../lib/quoteIntegrity");
test("reject absent and invalid prices instead of representing them as valid zero quotes",()=>{
  for(const input of [null,undefined,{}, {last_price:0},{last_price:-10},{last_price:NaN},{last_price:""},{last_price:"NA"}]){
    assert.equal(isUsableQuote(input),false,JSON.stringify(input));
  }
  assert.equal(isUsableQuote({last_price:2587.75}),true);
  assert.equal(isUsableQuote({last_price:"2587.75"}),true);
});
