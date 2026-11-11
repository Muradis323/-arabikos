const {chromium}=require('@playwright/test');
const assert=require('node:assert/strict');
const url=process.env.ARABIKOS_TEST_URL||'http://127.0.0.1:4173/';
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 try{
  for(const width of [390,1440]){
   const context=await browser.newContext({viewport:{width,height:900},hasTouch:width===390});
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(url);await page.getByRole('button',{name:'Практика',exact:true}).click();
   assert.equal(await page.locator('.shelf-volume').count(),2);
   assert.equal(await page.locator('.shelf-book-caption').count(),0);
   assert(await page.locator('.nawawi-cover img').evaluate(i=>i.complete&&i.naturalWidth>0));
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   await page.getByRole('button',{name:/40 хадисов/}).click();
   const selectedPage=()=>page.locator('.nawawi-pagination [role="status"]').innerText();
   let token=page.locator('[data-nawawi-word]').first();await token.click();
   await page.locator('#nawawi-word-meaning').waitFor();
   const wordRect=await token.boundingBox(),tip=await page.locator('#nawawi-word-meaning').boundingBox();
   assert(tip.y+tip.height<wordRect.y,'Gloss must be above selected word');
   await page.getByRole('button',{name:'Добавить слово в словарь',exact:true}).click();
   assert(await page.getByRole('button',{name:'Слово уже в словаре'}).isDisabled());
   assert.equal(await page.evaluate(()=>Object.keys(JSON.parse(localStorage.getItem('arabikos-madinah-v1')).reading.cards).length),1);
   const firstStatus=await selectedPage();await page.keyboard.press('Escape');
   // Dragging across words updates translation without flipping the book.
   const nodes=page.locator('[data-nawawi-word]'),a=await nodes.nth(0).boundingBox(),b=await nodes.nth(1).boundingBox();
   await page.mouse.move(a.x+a.width/2,a.y+a.height/2);await page.mouse.down();await page.mouse.move(b.x+b.width/2,b.y+b.height/2,{steps:5});await page.mouse.up();
   assert.equal(await selectedPage(),firstStatus);assert.equal(await page.locator('#nawawi-word-meaning strong').innerText(),await nodes.nth(1).innerText());
   await page.keyboard.press('Escape');
   // Touch swipe on the running head (free page space).
   const head=await page.locator('.nawawi-running-head').first().boundingBox();
   await page.dispatchEvent('.nawawi-book','pointerdown',{pointerId:9,clientX:head.x+180,clientY:head.y+5,button:0,isPrimary:true});
   await page.dispatchEvent('.nawawi-book','pointerup',{pointerId:9,clientX:head.x+60,clientY:head.y+5,button:0,isPrimary:true});
   await page.waitForTimeout(680);assert.notEqual(await selectedPage(),firstStatus);
   const resumed=await selectedPage();await page.getByRole('button',{name:'На книжную полку',exact:true}).click();await page.getByRole('button',{name:/40 хадисов/}).click();assert.equal(await selectedPage(),resumed);
   await page.getByRole('combobox',{name:'Выбрать хадис'}).selectOption('5');await page.waitForTimeout(680);
   assert(await page.getByText('Смысловой перевод хадиса 5',{exact:true}).isVisible());
   // Keyboard word activation, dictionary deduplication, chapter-end bounds.
   token=page.locator('[data-nawawi-word]').first();await token.focus();await page.keyboard.press('Enter');await page.locator('#nawawi-word-meaning').waitFor();await page.keyboard.press('Escape');
   await page.getByRole('group',{name:/Открытая книга/}).focus();await page.keyboard.press('ArrowLeft');await page.waitForTimeout(680);
   assert(await page.getByRole('button',{name:'Следующая страница',exact:true}).isDisabled());
   const end=await selectedPage();await page.reload();await page.getByRole('button',{name:'Практика',exact:true}).click();await page.getByRole('button',{name:/40 хадисов/}).click();assert.equal(await selectedPage(),end);
   await page.getByRole('button',{name:'На книжную полку',exact:true}).click();await page.getByRole('button',{name:/Предложения/}).click();assert(await page.getByText('Сначала пройдите первый урок',{exact:true}).isVisible());
   await page.getByRole('button',{name:'Практика',exact:true}).click();
   await page.evaluate(()=>{document.documentElement.dataset.theme='dark';document.documentElement.dataset.palette='neon'});
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   await page.getByRole('button',{name:/40 хадисов/}).click();assert.equal(await page.locator('.nawawi-leaf').first().evaluate(el=>getComputedStyle(el).color),'rgb(62, 48, 32)');
   assert.deepEqual(errors,[]);await context.close();console.log(`PASS: ${width}px shelf, real cover, anchored gloss, finger scrub, swipe, saved dictionary, bookmarks, chapters, keyboard, end bounds, dark/neon theme`);
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
