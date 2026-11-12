/* Standalone mocked smoke test. Run with `node test-local.cjs`.
   No real MongoDB, SMTP, Google API, or Next.js runtime is used. */
const assert = require('node:assert/strict');
const path = require('node:path');
const Module = require('node:module');
const fs = require('node:fs');
const ts = require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js');
const records = new Map();
let sheets = 0, emails = [];
const knownForms = ['stall','visitor','contact','sponsorship','partner','speaker','delegate','media','brochure'];
class ObjectId { constructor(value) { this.value = value } toString() {return this.value} }
class Q {
  constructor(fn) {this.fn=fn; this.n=Infinity;this.order=null;this.fields=''}
  select(fields) {this.fields=fields;return this}
  sort(spec){this.order=spec;return this}
  limit(n){this.n=n;return this}
  lean(){return Promise.resolve(this.fn(this.n))}
  then(a,b){return this.lean().then(a,b)}
}
function matches(doc,filter){
  if (!doc) return false;
  return Object.entries(filter||{}).every(([key,val])=>{
    if(key==='$or')return val.some(f=>matches(doc,f));
    if(key==='$expr')return true;
    const actual = key.split('.').reduce((a,p)=>a?.[p],doc);
    if(val&&typeof val==='object'&&!(val instanceof Date)){
      if ('$exists' in val)return (actual!==undefined)===val.$exists;
      if ('$lte' in val)return actual===undefined?false:actual<=val.$lte;
      if ('$in' in val)return val.$in.includes(actual);
    }
    return String(actual)===String(val)
  })
}
function set(doc,updates) {
  for(const [k,v] of Object.entries(updates.$set||{}))if(v!==undefined) doc[k]=v;
  for(const [k,v] of Object.entries(updates.$inc||{}))doc[k]=(doc[k]??0)+v;
  for(const k of Object.keys(updates.$unset||{}))delete doc[k];
  doc.updatedAt=new Date();return doc;
}
const FakeDraft={
  findOne(filter){return new Q(()=>Array.from(records.values()).find(doc=>matches(doc,filter))||null)},
  findOneAndUpdate(filter,updates){return new Q(()=>{const doc=Array.from(records.values()).find(d=>matches(d,filter));return doc?set(doc,updates):null})},
  updateOne(filter,updates){return Promise.resolve((()=>{const doc=Array.from(records.values()).find(d=>matches(d,filter));if(doc){set(doc,updates);return {modifiedCount:1}}return {modifiedCount:0}})())},
  async create(data) {if(records.has(data.submissionKey)){const e=new Error('duplicate');e.code=11000;throw e}
    const doc={_id:data.submissionKey,createdAt:new Date(),updatedAt:new Date(),
      sheetRevision:-1, revision:0, mail1Sent:false,mail2Sent:false,...data};
    records.set(data.submissionKey,doc);return doc},
  find(filter){return new Q(limit=>Array.from(records.values()).filter(d=>
    (d.sheetRevision < d.revision || (d.state==='submitted'&&(!d.mail1Sent||!d.mail2Sent)))
  ).slice(0,limit))},
};
const aliases={
  'server-only':{},'mongoose':{Types:{ObjectId}},
  '@/lib/db/connect':{connectDb:async()=>{}},
  '@/lib/forms/draft-model':{WebsiteDraft:FakeDraft},
  '@/lib/forms/sheets-sync':{
    assertSubmissionKey:(s)=>{if(!/^[A-Za-z0-9_-]{8,100}$/.test(s))throw Error('bad key')},
    assertWebForm:(s)=>{if(!knownForms.includes(s))throw Error('bad form')},
    sanitizeWebsiteDraftData:(d)=>({...d,email:typeof d.email==='string'?d.email.toLowerCase():undefined}),
    syncWebsiteDraftToSheet:async(key)=>{const d=records.get(key);if(d.sheetRevision<d.revision){sheets++;d.sheetRevision=d.revision;d.sheetRange=`'Website Enquries'!A${sheets}:T${sheets}`}
      return {synced:true,sheetRange:d.sheetRange}},
    saveWebsiteDraft:()=>{throw Error('unused')},
  },
  '@/lib/forms/email':{emailRecipients:()=>['first@example.com','second@example.com']},
  '@/lib/forms/website-email':{sendWebsiteNotification:async(args)=>{emails.push(args.recipient)}},
};
const originalLoad=Module._load;
Module._load=function(request,parent,isMain){if(request in aliases)return aliases[request];return originalLoad.apply(this,arguments)};
require.extensions['.ts']=function(module,filename){let text=fs.readFileSync(filename,'utf8');let compiled=ts.transpileModule(text,{fileName:filename,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;module._compile(compiled,filename)};
const P=require(path.join(__dirname,'lib/website-forms/pipeline.ts'));
(async()=>{
  const key='11111111-1111-4111-8111-111111111111';
  const info={submissionKey:key,form:'stall',data:{fullName:'A Person',email:'TEST@example.com',phone:'+919876543210'},ref:'ST-2027-001',finalEntity:'Lead',finalEntityId:'507f1f77bcf86cd799439011'};
  const first=await P.finalizeWebsiteDraft(info); assert.equal(first.newlyFinalized,true);
  assert.equal(records.get(key).data.email,'test@example.com');
  const again=await P.finalizeWebsiteDraft(info);assert.equal(again.newlyFinalized,false);
  assert.equal(records.size,1);
  const d=await P.deliverWebsiteDraft(key);
  assert.equal(d.sheetSynced,true);assert.equal(d.emailsPending,0);
  assert.equal(emails.length,2);assert.equal(sheets,1);
  await P.deliverWebsiteDraft(key);assert.equal(sheets,1);assert.equal(emails.length,2);
  await assert.rejects(P.finalizeWebsiteDraft({...info,form:'brochure'}),e=>e.name==='DraftConflictError');
  await assert.rejects(P.finalizeWebsiteDraft({...info,ref:'ST-OTHER'}),e=>e.name==='DraftConflictError');
  const bKey='22222222-2222-4222-8222-222222222222';
  records.set(bKey,{_id:bKey,submissionKey:bKey,form:'brochure',state:'draft',data:{email:'b@example.com'},revision:2,sheetRevision:1,
    mail1Sent:false,mail2Sent:false,createdAt:new Date(),updatedAt:new Date()});
  assert.equal(await P.findFinalBrochureSubmission(bKey,'b@example.com'),false);
  await P.deliverWebsiteDraft(bKey);assert.equal(emails.length,2);assert.equal(sheets,2);
  await P.finalizeWebsiteDraft({submissionKey:bKey,form:'brochure',data:{email:'b@example.com'},ref:bKey});
  assert.equal(await P.findFinalBrochureSubmission(bKey,'b@example.com'),true);
  assert.equal(await P.findFinalBrochureSubmission(bKey,'wrong@example.com'),false);
  const processed=await P.processPendingWebsiteDrafts(5);
  assert.equal(processed.completed,1);assert.equal(emails.length,4);assert.equal(sheets,3);
  console.log('PASS: first save, repeat submit, form/ref conflicts, Sheet revision upsert, no draft email, 2 organiser emails, brochure final retry, cron recovery');
})().catch(e=>{console.error(e);process.exitCode=1});
