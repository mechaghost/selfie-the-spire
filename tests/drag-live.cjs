const assert = require('node:assert/strict');
const {chromium} = require('playwright-core');
const base = process.env.E2E_BASE || 'http://localhost:4187';
const seed = '72b23907-f7cf-4c98-95e8-5e64155244f8';
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.PW_CHROMIUM || (process.platform==='darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : undefined),args:['--enable-unsafe-swiftshader']});
 try {for(const viewport of [{width:1440,height:900},{width:844,height:390},{width:568,height:320}]) {
  const touch=viewport.width<1000;
  const page=await browser.newPage({viewport,hasTouch:touch,isMobile:touch});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(seed=>{const uuid=crypto.randomUUID.bind(crypto);let first=true;crypto.randomUUID=()=>{if(first){first=false;return seed;}return uuid();};},seed);
  if(touch) {await page.setViewportSize({width:390,height:844});await page.goto(base);await page.getByRole('dialog',{name:'Rotate your device'}).waitFor();await page.setViewportSize(viewport);await page.getByRole('dialog',{name:'Rotate your device'}).waitFor({state:'hidden'});}
  else await page.goto(base);
  await page.getByRole('button',{name:/Play a starter run/}).click();
  await page.locator('.map-node.available.type-combat').first().click();
  await page.locator('.battle-stage-visual[data-stage-status="ready"] canvas').waitFor();
  await page.waitForTimeout(500);
  const cdp=touch?await page.context().newCDPSession(page):null;
  if(touch) {
   const hand=page.locator('.hand-container'); const rect=await hand.boundingBox();
   const x=rect.x+rect.width/2,y=rect.y+Math.min(180,rect.height-20);
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});
   for(let i=1;i<=10;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-i*12,id:1}]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
   assert.ok(await hand.evaluate(e=>e.scrollTop)>0,'Vertical finger swipe scrolls side hand');
   assert.equal(await page.locator('.card-drag-preview').count(),0);
   await hand.evaluate(e=>e.scrollTo({top:0,behavior:'instant'}));
  }
  const save=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('stt_run')));
  async function drag(card,end,cancel=false) {
   await card.scrollIntoViewIfNeeded();await page.waitForTimeout(300);
   const box=await card.boundingBox();const start={x:box.x+box.width/2,y:Math.max(box.y+20,Math.min(viewport.height-30,box.y+box.height/2))};
   if(touch) await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...start,id:1}]});
   else {await page.mouse.move(start.x,start.y);await page.mouse.down();}
   for(let i=1;i<=12;i++) {const point={x:start.x+(end.x-start.x)*i/12,y:start.y+(end.y-start.y)*i/12};
    if(touch)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...point,id:1}]});else await page.mouse.move(point.x,point.y);
   }
   await page.locator('.card-drag-preview').waitFor();
   await page.screenshot({path:`tests/.e2e-out/drag-${viewport.width}.png`});
   if(touch) await cdp.send('Input.dispatchTouchEvent',{type:cancel?'touchCancel':'touchEnd',touchPoints:[]});else await page.mouse.up();
   await page.locator('.card-drag-preview').waitFor({state:'hidden'});
  }
  // Invalid drops and cancellation must preserve the exact stable checkpoint.
  const first=await save();
  const attack=page.locator('.hand-container .card.type-attack.playable').first();
  await drag(attack,touch?{x:20,y:viewport.height-10}:{x:viewport.width/2,y:20});assert.deepEqual(await save(),first);
  if(touch) {const target=await page.locator('.actor-target:not(:disabled)').first().boundingBox();await drag(attack,{x:target.x+target.width/2,y:target.y+target.height/2},true);assert.deepEqual(await save(),first);}
  const target=await page.locator('.actor-target:not(:disabled)').first().boundingBox();
  await drag(attack,{x:target.x+target.width/2,y:target.y+target.height/2});
  await page.waitForFunction(count=>JSON.parse(localStorage.getItem('stt_run')).hand.length<count,first.hand.length);
  const afterAttack=await save();assert.ok(afterAttack.enemies[0].hp<first.enemies[0].hp || afterAttack.enemies[0].statuses.length>first.enemies[0].statuses.length);
  await page.waitForFunction(()=>!document.querySelector('.end-turn-button').disabled);
  const skillId=afterAttack.hand.find(card=>card.type==='Skill' && card.cost<=afterAttack.player.energy).instanceId;
  const skill=page.locator('.hand-container .card.type-skill.playable').first();
  const arena=await page.locator('.battle-arena-content').boundingBox();
  await drag(skill,{x:arena.x+arena.width*.25,y:arena.y+arena.height*.7});
  await page.waitForFunction(id=>!JSON.parse(localStorage.getItem('stt_run')).hand.some(card=>card.instanceId===id),skillId);
  assert.ok((await save()).player.block>afterAttack.player.block);
  assert.deepEqual(errors,[]);
  console.log(`PASS ${viewport.width}x${viewport.height}: ${touch?'native touch':'mouse'} attack and self card drag, invalid drop${touch?', cancellation and portrait rotation':''}`);
  await page.waitForTimeout(1200);await page.screenshot({path:`tests/.e2e-out/layout-${viewport.width}.png`});await page.close();
 }} finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
