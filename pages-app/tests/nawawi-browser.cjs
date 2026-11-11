const {chromium}=require('@playwright/test');
const assert=require('node:assert/strict');
const url=process.env.ARABIKOS_TEST_URL||'http://127.0.0.1:4173/';
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 try{
  for(const width of [390,1440]){
   const context=await browser.newContext({viewport:{width,height:900},hasTouch:width===390,isMobile:width===390});
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   const cdp=await context.newCDPSession(page),touch=async(type,x,y)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'||type==='touchCancel'?[]:[{x,y,id:1,radiusX:1,radiusY:1,force:1}]});
   await page.goto(url);await page.getByRole('button',{name:'Практика',exact:true}).click();
   assert.equal(await page.locator('.shelf-volume').count(),2);assert.equal(await page.locator('.shelf-book-caption').count(),0);
   assert(await page.locator('.nawawi-cover img').evaluate(i=>i.complete&&i.naturalWidth>0));assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   await page.getByRole('button',{name:/40 хадисов/}).click();
   const selectedPage=()=>page.locator('.nawawi-pagination [role="status"]').innerText(),gloss=()=>page.locator('#nawawi-word-meaning'),nodes=()=>page.locator('[data-nawawi-word]');
   const point=async locator=>{await locator.evaluate(el=>el.scrollIntoView({block:'center'}));const r=await locator.boundingBox();return {x:r.x+r.width/2,y:r.y+r.height/2}};
   let token=nodes().first(),p=await point(token);
   // A quick real tap/click never opens a translation, including after the hold delay.
   if(width===390){await touch('touchStart',p.x,p.y);await page.waitForTimeout(70);await touch('touchEnd')}else await token.click();
   assert.equal(await gloss().count(),0);await page.waitForTimeout(1550);assert.equal(await gloss().count(),0,'Quick release must cancel pending hold');
   // A deliberate stationary hold opens only after 1500 ms and stays after release.
   p=await point(token);if(width===390)await touch('touchStart',p.x,p.y);else{await page.mouse.move(p.x,p.y);await page.mouse.down()}
   await page.waitForTimeout(1100);assert.equal(await gloss().count(),0,'No gloss before hold threshold');await page.waitForTimeout(470);await gloss().waitFor();
   if(width===390)await touch('touchEnd');else await page.mouse.up();assert.equal(await gloss().count(),1,'Completed hold remains after release');
   const wordRect=await token.boundingBox(),tip=await gloss().boundingBox();assert(tip.y+tip.height<wordRect.y,'Gloss must be above selected word');
   await page.getByRole('button',{name:'Добавить слово в словарь',exact:true}).click();assert(await page.getByRole('button',{name:'Слово уже в словаре'}).isDisabled());assert.equal(await page.evaluate(()=>Object.keys(JSON.parse(localStorage.getItem('arabikos-madinah-v1')).reading.cards).length),1);
   const firstStatus=await selectedPage();await page.keyboard.press('Escape');
   // Each new word needs its own hold. A drag across words cannot translate or turn a leaf.
   const a=await point(nodes().nth(0)),bx=a.x+16,by=a.y;
   if(width===390){await touch('touchStart',a.x,a.y);await touch('touchMove',bx,by);await page.waitForTimeout(1550);await touch('touchEnd')}else{await page.mouse.move(a.x,a.y);await page.mouse.down();await page.mouse.move(bx,by,{steps:5});await page.waitForTimeout(1550);await page.mouse.up()}
   assert.equal(await selectedPage(),firstStatus);assert.equal(await gloss().count(),0,'Word drag must not translate');
   if(width===390){
    // Native touchscreen scrolling starts on a word; CDP delivers real browser touch events.
    assert.equal(await nodes().first().evaluate(el=>getComputedStyle(el).touchAction),'pan-y');
    await page.evaluate(()=>{window.__readerTouchCancels=0;document.addEventListener('pointercancel',()=>window.__readerTouchCancels++,{capture:true})});
    const sc=await point(nodes().nth(8)),beforeScroll=await page.evaluate(()=>scrollY);await touch('touchStart',sc.x,sc.y);
    for(let i=1;i<=8;i++){await touch('touchMove',sc.x,sc.y-i*22);await page.waitForTimeout(20)}await touch('touchEnd');await page.waitForTimeout(1550);
    assert((await page.evaluate(()=>scrollY))>beforeScroll+40,'Dragging vertically from an Arabic word must scroll the page');assert.equal(await gloss().count(),0,'Scrolling must never translate');assert((await page.evaluate(()=>window.__readerTouchCancels))>0,'Native pan must cancel the word pointer');
    const cancel=await point(nodes().first());await touch('touchStart',cancel.x,cancel.y);await page.waitForTimeout(700);await touch('touchCancel');await page.waitForTimeout(900);assert.equal(await gloss().count(),0,'Native touchCancel must cancel pending translation');
   }
   // Right swipe advances an Arabic book; left swipe returns to the previous leaf.
   await page.locator('.nawawi-running-head').first().evaluate(el=>el.scrollIntoView({block:'center'}));const head=await page.locator('.nawawi-running-head').first().boundingBox(),y=head.y+5,left=head.x+28,right=Math.min(head.x+head.width-18,left+130);
   if(width===390){await touch('touchStart',left,y);await touch('touchMove',right,y);await touch('touchEnd')}else{await page.mouse.move(left,y);await page.mouse.down();await page.mouse.move(right,y,{steps:6});await page.mouse.up()}
   await page.waitForTimeout(680);assert.notEqual(await selectedPage(),firstStatus);
   const forwardStatus=await selectedPage();await page.locator('.nawawi-running-head').first().evaluate(el=>el.scrollIntoView({block:'center'}));const backHead=await page.locator('.nawawi-running-head').first().boundingBox(),backY=backHead.y+5,backLeft=backHead.x+28,backRight=Math.min(backHead.x+backHead.width-18,backLeft+130);
   if(width===390){await touch('touchStart',backRight,backY);await touch('touchMove',backLeft,backY);await touch('touchEnd')}else{await page.mouse.move(backRight,backY);await page.mouse.down();await page.mouse.move(backLeft,backY,{steps:6});await page.mouse.up()}
   await page.waitForTimeout(680);assert.equal(await selectedPage(),firstStatus);await page.getByRole('button',{name:'Следующая страница',exact:true}).click();await page.waitForTimeout(680);assert.equal(await selectedPage(),forwardStatus);
   const resumed=await selectedPage();await page.getByRole('button',{name:'На книжную полку',exact:true}).click();await page.getByRole('button',{name:/40 хадисов/}).click();assert.equal(await selectedPage(),resumed);
   await page.getByRole('combobox',{name:'Выбрать хадис'}).selectOption('5');await page.waitForTimeout(680);assert(await page.getByText('Смысловой перевод хадиса 5',{exact:true}).isVisible());
   // Keyboard Enter remains immediate and accessible without waiting for a pointer hold.
   token=nodes().first();await token.focus();await page.keyboard.press('Enter');await gloss().waitFor();await page.keyboard.press('Escape');
   await page.getByRole('group',{name:/Открытая книга/}).focus();await page.keyboard.press('ArrowLeft');await page.waitForTimeout(680);assert(await page.getByRole('button',{name:'Следующая страница',exact:true}).isDisabled());
   const end=await selectedPage();await page.reload();await page.getByRole('button',{name:'Практика',exact:true}).click();await page.getByRole('button',{name:/40 хадисов/}).click();assert.equal(await selectedPage(),end);
   await page.getByRole('button',{name:'На книжную полку',exact:true}).click();await page.getByRole('button',{name:/Предложения/}).click();assert(await page.getByText('Сначала пройдите первый урок',{exact:true}).isVisible());
   await page.getByRole('button',{name:'Практика',exact:true}).click();await page.evaluate(()=>{document.documentElement.dataset.theme='dark';document.documentElement.dataset.palette='neon'});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   await page.getByRole('button',{name:/40 хадисов/}).click();assert.equal(await page.locator('.nawawi-leaf').first().evaluate(el=>getComputedStyle(el).color),'rgb(62, 48, 32)');
   assert.deepEqual(errors,[]);await context.close();console.log(`PASS: ${width}px shelf, real cover, deliberate 1500ms hold, tap/drag/scroll/cancel suppression, anchored persistent gloss, physical Arabic swipes, dictionary, bookmarks, chapters, keyboard, end bounds, dark/neon theme`);
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
