(() => {
  const D = window.ARABIKOS_DATA;
  const app = document.getElementById('app');
  const nav = [...document.querySelectorAll('.nav-btn')];
  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');
  const xpText = document.getElementById('xpText');

  const storeKey = 'arabikos-progress-v1';
  const defaultState = { known: [], xp: 0, section: 'home', sentenceIndex: 0, verbIndex: 0, storyIndex: 0, storyPage: 0, wordFilter: 'all' };
  let state = loadState();

  function loadState(){
    try { return {...defaultState, ...JSON.parse(localStorage.getItem(storeKey) || '{}')}; }
    catch { return {...defaultState}; }
  }
  function saveState(){ localStorage.setItem(storeKey, JSON.stringify(state)); updateProgress(); }
  function isKnown(id){ return state.known.includes(id); }
  function wordById(id){ return D.words.find(w => w.id === id); }
  function escapeHtml(s=''){ return s.replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
  function shuffled(arr){ return arr.map(v=>[Math.random(),v]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]); }
  function sectionHeader(kicker,title,desc){ return `<div class="section-title"><div><div class="kicker">${kicker}</div><h2>${title}</h2><p>${desc}</p></div></div>`; }

  function updateProgress(){
    const learned = state.known.length;
    const pct = Math.round((learned / D.words.length) * 100);
    progressBar.style.width = pct + '%';
    progressText.textContent = pct + '%';
    xpText.textContent = `${state.xp} XP · ${learned} слов изучено`;
  }

  function setSection(name){
    state.section = name; saveState();
    nav.forEach(b=>b.classList.toggle('active', b.dataset.section === name));
    render();
    window.scrollTo({top:0, behavior:'smooth'});
  }

  nav.forEach(b => b.addEventListener('click', () => setSection(b.dataset.section)));
  document.getElementById('resetBtn').addEventListener('click', () => {
    if(confirm('Сбросить весь учебный прогресс?')) { state = {...defaultState}; saveState(); render(); }
  });

  function renderHome(){
    const learned = state.known.length;
    const unlockedSentences = D.sentenceExercises.filter(x=>x.required.every(isKnown)).length;
    const unlockedStories = D.stories.filter(x=>x.required.every(isKnown)).length;
    const next = D.words.find(w=>!isKnown(w.id));
    app.innerHTML = `
      <div class="hero">
        <div>
          <div class="kicker">Учись через открытие</div>
          <h2>Сначала слово.<br>Потом язык оживает.</h2>
          <p>Ты изучаешь новое слово с огласовками и корнем. После этого оно начинает появляться в заданиях, правилах, глаголах и маленьких рассказах. Ничего лишнего: словарь построен на лексике Корана.</p>
          <div class="row">
            <button class="primary-btn" id="continueBtn">${next ? 'Продолжить слова' : 'Повторить слова'}</button>
            <button class="secondary-btn" id="sentBtn">Открытые задания</button>
          </div>
        </div>
        <div class="hero-arabic">اِقْرَأْ</div>
      </div>
      <div class="dashboard">
        <div class="dash-card"><h3>Изучено слов</h3><strong>${learned}/${D.words.length}</strong><p>Слова становятся строительными блоками следующих уроков.</p></div>
        <div class="dash-card"><h3>Предложения</h3><strong>${unlockedSentences}/${D.sentenceExercises.length}</strong><p>Открываются только задания из уже знакомых слов.</p></div>
        <div class="dash-card"><h3>Рассказы</h3><strong>${unlockedStories}/${D.stories.length}</strong><p>Короткие страницы листаются как маленькая старая книга.</p></div>
      </div>
      <div class="spacer"></div>
      <div class="notice"><strong>Принцип Арабикоса:</strong> новое слово не бросается в тебя кирпичом. Сначала знакомство, потом узнавание, потом предложение, и только затем текст.</div>
    `;
    document.getElementById('continueBtn').onclick = () => setSection('words');
    document.getElementById('sentBtn').onclick = () => setSection('sentences');
  }

  function renderAlphabet(){
    app.innerHTML = sectionHeader('Основа','Алфавит','28 букв. Нажми на букву, чтобы увидеть её крупнее и запомнить визуальную форму.') + `
      <div class="grid three">${D.alphabet.map(([ar,name],i)=>`<button class="letter-card" data-i="${i}"><div class="ar">${ar}</div><div class="name">${name}</div></button>`).join('')}</div>
      <div id="letterFocus" class="quiz-box" style="margin-top:18px"><div class="muted">Выбери букву выше.</div></div>`;
    app.querySelectorAll('.letter-card').forEach(btn=>btn.onclick=()=>{
      const [ar,name] = D.alphabet[+btn.dataset.i];
      document.getElementById('letterFocus').innerHTML = `<div class="ar-big">${ar} ـ${ar}ـ ـ${ar}</div><h3>${name}</h3><p class="muted">Смотри на форму отдельно и в соединении. На следующем этапе сюда можно добавить аудио произношения и уроки махраджа.</p>`;
    });
  }

  function wordUnlockState(word){
    if(isKnown(word.id)) return 'known';
    const earlier = D.words.filter(w => w.level < word.level);
    const threshold = Math.min(earlier.length, Math.max(0, (word.level-1)*6));
    const knownEarlier = earlier.filter(w=>isKnown(w.id)).length;
    return knownEarlier >= threshold ? 'open' : 'locked';
  }

  function highlightedExample(word){
    if(word.id==='rabb') return 'رَبِّ<span class="ending">كَ</span>';
    if(word.id==='kitab') return 'كِتَابُ<span class="ending">هُ</span>';
    if(word.id==='nas') return 'النَّاسِ';
    if(word.id==='iman') return 'مُؤْمِنُ<span class="ending">ونَ</span>';
    if(word.type==='предлог') return `<span class="focus">${word.ar}</span> الْكِتَابِ`;
    return word.ar;
  }

  function renderWords(){
    const filters = [['all','Все'],['noun','Имена'],['verb','Глаголы'],['prep','Предлоги'],['particle','Частицы'],['known','Изучено']];
    const filterFn = w => state.wordFilter==='all' || (state.wordFilter==='noun' && ['имя','существительное','указательное слово'].includes(w.type)) || (state.wordFilter==='verb' && w.type==='глагол') || (state.wordFilter==='prep' && w.type==='предлог') || (state.wordFilter==='particle' && w.type==='союз') || (state.wordFilter==='known' && isKnown(w.id));
    app.innerHTML = sectionHeader('Словарь','Слова Корана','Изучай их по очереди. Огласовки крупные, корень виден сразу, а окончания подсвечиваются в примерах.') + `
      <div class="level-strip">${[1,2,3,4].map(l=>{const ws=D.words.filter(w=>w.level===l);const done=ws.every(w=>isKnown(w.id));const open=ws.some(w=>wordUnlockState(w)!=='locked');return `<span class="level-node ${done?'done':open?'current':'locked'}">Уровень ${l} · ${ws.filter(w=>isKnown(w.id)).length}/${ws.length}</span>`}).join('')}</div>
      <div class="filter-row">${filters.map(([id,label])=>`<button class="filter-btn ${state.wordFilter===id?'active':''}" data-filter="${id}">${label}</button>`).join('')}</div>
      <div class="grid two">${D.words.filter(filterFn).map(w=>{
        const status=wordUnlockState(w); const locked=status==='locked';
        return `<article class="word-card ${locked?'locked':''}">
          ${status==='known'?'<span class="known">✓ изучено</span>':locked?'<span class="lock">🔒</span>':''}
          <div class="arabic">${highlightedExample(w)}</div>
          <div class="meaning">${escapeHtml(w.ru)}</div>
          <div class="meta"><span class="tag">${w.type}</span><span class="tag">уровень ${w.level}</span>${w.form?`<span class="tag">форма ${w.form}</span>`:''}</div>
          <div class="root">Корень: ${w.root}</div>
          <div class="word-actions">
            <button class="${status==='known'?'secondary-btn':'primary-btn'} learn-btn" data-id="${w.id}" ${locked?'disabled':''}>${status==='known'?'Повторить':'Выучил слово'}</button>
          </div>
        </article>`}).join('')}</div>`;
    app.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{state.wordFilter=b.dataset.filter; saveState(); renderWords();});
    app.querySelectorAll('.learn-btn').forEach(b=>b.onclick=()=>{
      const id=b.dataset.id;
      if(!isKnown(id)){ state.known.push(id); state.xp += 10; saveState(); }
      renderWords();
    });
  }

  function renderVerbs(){
    const verbs = D.words.filter(w=>w.type==='глагол');
    const unlockedQuiz = D.verbQuiz.filter(q=>isKnown(q.required));
    const q = unlockedQuiz.length ? unlockedQuiz[state.verbIndex % unlockedQuiz.length] : null;
    app.innerHTML = sectionHeader('Сарф','Глаголы','Смотри на корень и модель. В тесте нужно определить форму глагола.') + `
      <div class="grid two">${verbs.map(v=>isKnown(v.id)?`<article class="verb-card"><div class="verb-pattern">${v.ar}</div><h3>${v.ru}</h3><p>Корень: <span class="ar">${v.root}</span> · форма: <strong>${v.form}</strong></p></article>`:`<article class="verb-card locked"><div class="ar-big">🔒</div><h3>Неизученный глагол</h3><p>Сначала открой его в разделе «Слова».</p></article>`).join('')}</div>
      <div class="spacer"></div>
      ${q?`<div class="quiz-box"><div class="kicker">Тест формы</div><h3>Какая это форма глагола?</h3><div class="prompt-ar">${q.ar}</div><div class="muted">Корень: ${q.root}</div><div class="choice-list">${q.options.map(o=>`<button class="choice-btn" data-form="${o}">Форма <strong>${o}</strong></button>`).join('')}</div><div id="verbFeedback" class="feedback"></div></div>`:`<div class="notice"><strong>Пока тест закрыт.</strong> Сначала изучи хотя бы один глагол в разделе «Слова».</div>`}`;
    if(q){ app.querySelectorAll('[data-form]').forEach(b=>b.onclick=()=>{
      const ok=b.dataset.form===q.answer; const f=document.getElementById('verbFeedback');
      f.className='feedback '+(ok?'ok':'bad'); f.textContent=ok?'Верно. +5 XP':'Не эта форма. Посмотри на добавочные буквы и удвоение.';
      if(ok){ state.xp+=5; state.verbIndex=(state.verbIndex+1)%unlockedQuiz.length; saveState(); setTimeout(renderVerbs,550); }
    }); }
  }

  function renderPrepositions(){
    const preps=D.words.filter(w=>w.type==='предлог');
    app.innerHTML = sectionHeader('Связки','Предлоги','Сначала изучи предлог как слово. После этого смотри, как он влияет на окончание следующего слова.') + `
      <div class="grid two">${preps.map(p=>isKnown(p.id)?`<article class="lesson-card"><div class="ar-big">${p.ar}</div><h3>${p.ru}</h3><p>Пример: <span class="rule-example">${p.ar} الْكِتَابِ</span></p></article>`:`<article class="lesson-card locked"><div class="ar-big">🔒</div><h3>Неизученный предлог</h3><p>Сначала открой его в разделе «Слова».</p></article>`).join('')}</div>
      <div class="spacer"></div><div class="notice"><strong>Следи за концом слова:</strong> после предлога часто увидишь касру: <span class="rule-example">فِي الْكِتَابِ</span>. Подсветка окончаний в следующих версиях может стать отдельным режимом.</div>`;
  }

  function renderSentences(){
    const unlocked=D.sentenceExercises.filter(x=>x.required.every(isKnown));
    if(!unlocked.length){ app.innerHTML=sectionHeader('Тренировка','Предложения','Задания собираются только из тех слов, которые ты уже прошёл.')+`<div class="notice"><strong>Нужно открыть первые слова.</strong> Выучи несколько слов уровня 1, и здесь появятся первые сборки предложений.</div>`; return; }
    const q=unlocked[state.sentenceIndex%unlocked.length];
    const chips=shuffled(q.words.map((w,i)=>({w,i})));
    app.innerHTML=sectionHeader('Тренировка','Собери предложение','Нажимай на арабские слова в правильном порядке. Перевод дан как подсказка.')+`
      <div class="quiz-box" id="sentenceQuiz"><div class="kicker">Задание ${state.sentenceIndex%unlocked.length+1} из ${unlocked.length}</div><h3>${q.ru}</h3>
      <div id="answerZone" class="answer-zone empty"></div>
      <div id="chips" class="chips">${chips.map((x,idx)=>`<button class="word-chip" data-idx="${idx}" data-word="${escapeHtml(x.w)}">${x.w}</button>`).join('')}</div>
      <div class="row"><button id="checkSentence" class="primary-btn">Проверить</button><button id="clearSentence" class="secondary-btn">Очистить</button></div><div id="sentenceFeedback" class="feedback"></div></div>`;
    let picked=[];
    const zone=document.getElementById('answerZone');
    function drawPicked(){zone.classList.toggle('empty',picked.length===0);zone.innerHTML=picked.map((x,i)=>`<button class="word-chip" data-picked="${i}">${x.word}</button>`).join('');document.querySelectorAll('[data-picked]').forEach(b=>b.onclick=()=>{const item=picked.splice(+b.dataset.picked,1)[0];document.querySelector(`[data-idx="${item.idx}"]`).classList.remove('selected');drawPicked();});}
    document.querySelectorAll('#chips .word-chip').forEach(b=>b.onclick=()=>{if(b.classList.contains('selected'))return;b.classList.add('selected');picked.push({idx:+b.dataset.idx,word:b.dataset.word});drawPicked();});
    document.getElementById('clearSentence').onclick=()=>{picked=[];document.querySelectorAll('#chips .word-chip').forEach(x=>x.classList.remove('selected'));drawPicked();document.getElementById('sentenceFeedback').textContent='';};
    document.getElementById('checkSentence').onclick=()=>{const ok=JSON.stringify(picked.map(x=>x.word))===JSON.stringify(q.answer);const f=document.getElementById('sentenceFeedback');f.className='feedback '+(ok?'ok':'bad');f.textContent=ok?'Верно. Предложение собрано. +8 XP':'Порядок пока неверный. Попробуй ещё раз.';if(ok){state.xp+=8;state.sentenceIndex=(state.sentenceIndex+1)%unlocked.length;saveState();setTimeout(renderSentences,650);}};
  }

  function renderRules(){
    const count=state.known.length;
    app.innerHTML=sectionHeader('Нахв + сарф','Правила','Правила открываются тогда, когда у тебя уже есть слова, на которых их можно увидеть.')+`<div class="grid two">${D.rules.map(r=>{const open=count>=r.minKnown;return `<article class="rule-card ${open?'':'locked'}"><h3>${open?r.title:'🔒 Правило откроется позже'}</h3><p>${open?r.text:`Нужно изучить ${r.minKnown} слов. Сейчас: ${count}.`}</p>${open?`<div class="rule-example">${r.example}</div>`:''}</article>`}).join('')}</div>`;
  }

  function renderStories(){
    const available=D.stories.filter(s=>s.required.every(isKnown));
    if(!available.length){ app.innerHTML=sectionHeader('Чтение','Маленькие рассказы','Страницы листаются как книга. Текст составлен из знакомой коранической лексики и не выдаётся за аят.')+`<div class="notice"><strong>Рассказы пока закрыты.</strong> Продолжай учить слова. Первый рассказ откроется, когда будут знакомы его ключевые слова.</div>`; return; }
    state.storyIndex=Math.min(state.storyIndex,available.length-1); const story=available[state.storyIndex]; state.storyPage=Math.min(state.storyPage,story.pages.length-1); const p=story.pages[state.storyPage];
    app.innerHTML=sectionHeader('Чтение','Маленькие рассказы','Это учебные мини-тексты из знакомой лексики, а не цитаты из Корана.')+`
      <div class="filter-row">${available.map((s,i)=>`<button class="filter-btn ${i===state.storyIndex?'active':''}" data-story="${i}">${s.titleRu}</button>`).join('')}</div>
      <div class="story-stage"><div class="story-book"><div class="story-title"><div class="ar">${story.title}</div><div>${story.titleRu}</div></div><div class="story-page-ar">${p.ar}</div><div class="story-ru">${p.ru}</div></div>
      <div class="story-controls"><button class="secondary-btn" id="prevPage">← Назад</button><div class="page-dots">${story.pages.map((_,i)=>`<span class="dot ${i===state.storyPage?'active':''}"></span>`).join('')}</div><button class="primary-btn" id="nextPage">Дальше →</button></div></div>`;
    app.querySelectorAll('[data-story]').forEach(b=>b.onclick=()=>{state.storyIndex=+b.dataset.story;state.storyPage=0;saveState();renderStories();});
    document.getElementById('prevPage').onclick=()=>{state.storyPage=(state.storyPage-1+story.pages.length)%story.pages.length;saveState();renderStories();};
    document.getElementById('nextPage').onclick=()=>{state.storyPage=(state.storyPage+1)%story.pages.length;state.xp+=2;saveState();renderStories();};
  }

  function render(){
    const routes={home:renderHome,alphabet:renderAlphabet,words:renderWords,verbs:renderVerbs,prepositions:renderPrepositions,sentences:renderSentences,rules:renderRules,stories:renderStories};
    (routes[state.section]||renderHome)();
  }

  if('serviceWorker' in navigator){ window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{})); }
  updateProgress();
  nav.forEach(b=>b.classList.toggle('active',b.dataset.section===state.section));
  render();
})();
