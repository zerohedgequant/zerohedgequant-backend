const {test}=require('node:test');
const assert=require('node:assert/strict');
const {canRefreshUpstoxSession}=require('../upstox-auth-policy');
const valid={access_token:'sampletoken_'.repeat(4),user_id:'ACCOUNT123',broker:'UPSTOX',is_active:true};
test('accepts only exact approved brokerage account identity',()=>{
 assert.equal(canRefreshUpstoxSession(valid,'ACCOUNT123'),true);
 assert.equal(canRefreshUpstoxSession(valid,'ANOTHER123'),false);
 assert.equal(canRefreshUpstoxSession(valid,''),false);
 assert.equal(canRefreshUpstoxSession({...valid,user_id:''},'ACCOUNT123'),false);
});
test('refuses absent, invalid, and inactive account responses',()=>{
 assert.equal(canRefreshUpstoxSession(null,'ACCOUNT123'),false);
 assert.equal(canRefreshUpstoxSession({...valid,access_token:null},'ACCOUNT123'),false);
 assert.equal(canRefreshUpstoxSession({...valid,broker:'OTHER'},'ACCOUNT123'),false);
 assert.equal(canRefreshUpstoxSession({...valid,is_active:false},'ACCOUNT123'),false);
});
test('does not accept a distinct or whitespace-padded account identity',()=>{
 assert.equal(canRefreshUpstoxSession({...valid,user_id:'ACCOUNT123 '},'ACCOUNT123'),false);
 assert.equal(canRefreshUpstoxSession({...valid,user_id:'account123'},'ACCOUNT123'),false);
});
