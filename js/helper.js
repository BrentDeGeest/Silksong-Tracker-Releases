// ---------- Helper chat: ask in plain words, the app shows or does it ----------
// No AI and no internet: the question is matched against everything the app knows (pins, areas, abilities, wishes, pages,
// settings, map filters, builds) and answered with buttons that take you there, start directions or change a setting.
// It remembers the last thing you asked about, so "take me there" or "what does it need" work as follow-ups.
const HLP={log:[],last:null,acts:[],idx:null};
const hNorm=s=>normQ(s).replace(/\b(\w+) s\b/g,"$1s");
const H_STOP=new Set(("a an the to of for in on at is are am i me my you your it its this that these those there where wheres what whats which how "+
 "can could do does did please pls show find get go open bring want need with and or from up be been was were will would should "+
 "tell about any some see look looking located location place spot thing things one ones im ive id dont cant isnt got have has just "+
 "now here then also more again still very really ok okay thanks thank hey hi hello game app map").split(" "));
// everyday words for things the game calls differently
const H_SYN=[["hit points","mask shard"],["heart piece","mask shard"],["heart pieces","mask shard"],["mask piece","mask shard"],["mask pieces","mask shard"],["health upgrade","mask shard"],["more health","mask shard"],["extra health","mask shard"],
 ["silk upgrade","spool fragment"],["more silk","spool fragment"],["spool piece","spool fragment"],["save point","bench"],["save points","benches"],["checkpoint","bench"],["resting spot","bench"],
 ["fast travel","bellway"],["stag station","bellway"],["tram","ventrica"],["map seller","shakra"],["map lady","shakra"],["cartographer","shakra"],
 ["double jump","faydown cloak"],["wall jump","cling grip"],["wall climb","cling grip"],["wall cling","cling grip"],["glide","drifters cloak"],["dash","swift step"],["sprint","swift step"],
 ["grapple","clawline"],["grappling hook","clawline"],["hook","clawline"],["super jump","silk soar"],["superjump","silk soar"],["harp","needolin"],["the instrument","needolin"],
 ["money","rosaries"],["currency","rosaries"],["cash","rosaries"],["geo","rosaries"],["coins","rosaries"],["final boss","grand mother silk"],["first boss","moss mother"],
 ["blacksmith","pinmaster plinney"],["smith","pinmaster plinney"],["needle upgrade","needle upgrade"],["nail upgrade","needle upgrade"],["charms","tools"],["charm","tool"]];
const hSyn=q=>{let s=" "+q+" ";H_SYN.forEach(([a,b])=>{s=s.split(" "+a+" ").join(" "+b+" ")});return s.trim()};
const hStem=t=>t.length>4&&t.endsWith("ies")?t.slice(0,-3)+"y":t.length>3&&/(ches|shes|xes|sses)$/.test(t)?t.slice(0,-2):t.length>3&&t.endsWith("s")&&!t.endsWith("ss")?t.slice(0,-1):t;
function hLev(a,b){if(Math.abs(a.length-b.length)>2)return 9;const d=Array.from({length:a.length+1},(_,i)=>[i]);for(let j=1;j<=b.length;j++)d[0][j]=j;
 for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return d[a.length][b.length]}
function hTok(qt,nt){if(qt===nt)return 3;const a=hStem(qt),b=hStem(nt);if(a===b)return 3;if(qt.length>=3&&nt.startsWith(qt))return 2;
 if(qt.length>=5&&nt.length>=4&&hLev(a,b)<=(qt.length>=8?2:1))return 1.6;return 0}

// ---------- pages, settings and map filters the helper can reach ----------
const H_PAGES=[
 ["Checklist","checklist list collectibles collection items todo",()=>{CK=null;openDrawer("list")},"Everything to collect, area by area, with what you can get right now."],
 ["Wishes (quests)","wishes wish quests quest wishwall tasks",()=>openDrawer("wish"),"All wishes (the game's quests): open, locked and done."],
 ["Abilities","abilities ability powers skills upgrades movement tick",()=>openDrawer("pw"),"Tick the abilities, keys and story steps you have. The map uses this to colour every pin."],
 ["World","world places people passages",()=>{WK=null;openDrawer("world")},"Areas, shops and characters, locks, levers, breakable walls and your markers."],
 ["Areas","areas area list regions discover fog unlock areas",()=>{WK="areas";openDrawer("world")},"Every area: tick the ones you have found so they light up on the map."],
 ["Shops & characters","shops shop npcs npc characters people merchants vendors sellers",()=>{WK="npc";openDrawer("world")},"Every shop and character in the areas you have found."],
 ["Breakable walls","breakable walls secret walls secrets",()=>{WK="wall";openDrawer("world")},"Every breakable wall, and the secrets behind them."],
 ["Levers & shortcuts","levers lever switches shortcuts shortcut",()=>{WK="lever";openDrawer("world")},"Levers, switches and one-way shortcuts. Tick what you have opened and directions use it."],
 ["Locked doors","locked doors locks doors passages",()=>{WK="lock";openDrawer("world")},"Doors and passages that need a power, a boss or opening once."],
 ["Key doors","key doors keys locked keys",()=>{WK="key";openDrawer("world")},"Doors that take a key."],
 ["Gauntlets","gauntlets gauntlet arenas arena fights ambush",()=>{WK="fight";openDrawer("world")},"Enemy gauntlets and guards that block the way."],
 ["My markers","my markers marker markers pins my pins notes",()=>{WK="mk";openDrawer("world")},"Your own pins on the map."],
 ["Story guide","story guide walkthrough steps main story what next",()=>{GV="story";openDrawer("story")},"The main story, step by step, up to the Citadel."],
 ["Get stronger","get stronger stronger tips farming farm farm spots spot grind grinding upgrades health silk money tips earn",()=>{GV="tips";openDrawer("story")},"The easiest health and silk upgrades, money tips and farming spots."],
 ["Builds","builds build loadout loadouts setups setup crest crests tools equipment",()=>{GV="build";openDrawer("story")},"8 ready-made builds with how to play them."],
 ["Don't miss","dont miss missable missables miss permanently missable",()=>{GV="miss";openDrawer("story")},"Things you can miss for good, and things you can still get later."],
 ["Settings","settings options preferences config",()=>openSettings(),"Pictures, symbol size, colours, colour-blind modes, the legend and phone controls."],
 ["Legend","legend colours colors symbols icons meaning key what does mean",()=>openSettings("legend"),"What every colour, shape and symbol on the map means."],
 ["Map filter","map filter filters layers show hide categories",()=>{closeDrawer();toggleLayers()},"Switch whole groups of pins on or off, or open a group to pick single kinds."],
 ["Backup code","backup back up save code export copy progress transfer keep safe",()=>{openDrawer("more");setTimeout(()=>{const e=document.querySelector('#db button[onclick="copyBackup()"]');if(e)e.scrollIntoView({block:"center"})},60)},"Copy a code with all your progress, to keep it safe or move it to another device."],
 ["Restore a backup","restore import load backup paste code progress bring back get back",()=>{openDrawer("more");setTimeout(()=>{const e=document.querySelector('#rin');if(e){e.closest("details").open=true;e.scrollIntoView({block:"center"})}},60)},"Paste a backup code to bring your progress back."],
 ["Check for updates","check for updates update updates new version newer version upgrade latest version download update install update get update update app",()=>BOOT.checkUpdate(),"Looks for a newer version right now, without restarting the app."],
 ["Update log","update log changelog change log patch notes whats new what s new versions version history history news",()=>BOOT.openLog(),"Every version, with what changed and pictures."],
 ["Report a problem","report bug problem broken wrong mistake suggest suggestion feedback idea",()=>{closeDrawer();openReport()},"Send a bug report or an idea. No account needed."],
 ["Reset","reset start over clear progress delete progress",()=>{openDrawer("more");setTimeout(()=>{const d=[...document.querySelectorAll("#db details.sect")].find(x=>/Reset/.test(x.textContent));if(d){d.open=true;d.scrollIntoView({block:"start"})}},60)},"Reset buttons, each asks first. Your markers are always kept."],
 ["How to read the map","how to read the map read map icons explained help map",()=>{openDrawer("more");setTimeout(()=>{const d=[...document.querySelectorAll("#db details.sect")].find(x=>/How to read/.test(x.textContent));if(d){d.open=true;d.scrollIntoView({block:"start"})}},60)},"A short explanation of the pins and symbols."],
 ["Add a marker","add marker place marker new marker drop pin own pin note on map",()=>{closeDrawer();togglePlacing()},"Tap the map where your own marker should go."],
 ["Search","search look up",()=>openSearch(),"Search every pin, wish and place by name."],
 ["Where am I","where am i set position my location starting point start point",()=>{closeDrawer();showHerePick()},"Tell the app where you are, so directions start from there."],
];
// settings: [label, words, key, value(s)]
const H_SETS=[
 ["Style","style look theme skin colours colors hollow knight silksong greenpath classic","look"],
 ["Moving effects","effects particles animations animation moving sparkles","fx"],
 ["Symbol size","icon size symbol size pin size icons symbols pins size","sz"],
 ["Pictures","pictures picture images image photos screenshots","pic"],
 ["Colour-blind mode","colour blind color blind colourblind colorblind protanopia deuteranopia tritanopia red green blue yellow high contrast","cb"],
 ["Theme","theme dark mode light mode night mode dark light","theme"],
 ["Hide collected icons","hide collected show collected collected icons done icons finished icons","hideDone"],
 ["Place names on the map","place names labels names on map","labels"],
 ["Area names when zoomed out","area names zoomed out overview","ovw"],
 ["Bigger buttons","bigger buttons big buttons large buttons button size","bigui"],
 ["Buttons on the left","left handed lefty buttons on the left left hand right handed","lefty"],
 ["Vibrate when ticking","vibrate vibration haptic buzz","haptic"],
 ["Shape badges on icons","badges shapes shape badges","badges"],
];
// map filter words -> layer keys (see SUBS / catKeys in tips.js and app.js)
const H_LAYERS=[["story bosses|must beat bosses|main story bosses","boss.must"],["main bosses","boss.main"],["optional bosses|side bosses","boss.side"],["bosses|boss","cat:boss"],
 ["rosary deposits|money deposits|deposits","extra.rs"],["shard deposits|shell shard deposits|shell shards","extra.shard"],["maps|map","extra.map"],
 ["benches|bench","rest.bench"],["bellways|bellway","rest.bellway"],["ventricas|ventrica|tubes","rest.tube"],["fast travel","cat:rest"],
 ["fleas|flea","flea"],["mask shards|masks|mask shard","upg.mask"],["spool fragments|spools|spool","upg.spool"],["memory lockets|lockets","upg.locket"],
 ["tools|tool","tool"],["crests|crest","abil.crest"],["abilities|powers","abil.power"],["keys","keys.key"],["craftmetal","keys.craft"],["rosaries|rosary strings|strings|necklaces","ros"],
 ["relics|other finds|scrolls","cat:misc"],["quest pickups|quest items|quests","quest"],["shops|shop|sellers|vendors|merchants","shop"],["npcs|npc|characters|people","npc"],
 ["my markers|markers","mine"],["breakable walls|walls|secrets","g_wall"],["levers|shortcuts|switches","g_lever"],["locked doors|locks|doors","g_lock"],["key doors","g_key"],["gauntlets|arenas|fights","g_fight"],
 ["everything|all pins|all","ALL"]];
// kinds of things you can ask about as a group ("nearest bench", "fleas in Greymoor", "easiest mask shard")
const H_CATS=[["mask shards|mask shard|masks","Mask Shards",i=>i.t==="mask"],["spool fragments|spool fragment|spools","Spool Fragments",i=>i.t==="spool"],["fleas|flea","Fleas",i=>i.t==="flea"],
 ["benches|bench","Benches",i=>i.t==="bench"],["bellways|bellway","Bellways",i=>i.t==="bellway"],["ventricas|ventrica","Ventrica stations",i=>i.t==="tube"],["memory lockets|lockets|locket","Memory Lockets",i=>i.t==="locket"],
 ["craftmetal","Craftmetal",i=>i.t==="craft"],["rosary strings|rosaries|strings|necklaces","Rosary strings and necklaces",i=>i.t==="rosary"],["bosses|boss","Bosses",i=>i.t==="boss"],
 ["story bosses|must beat bosses","Story bosses",i=>i.t==="boss"&&bossT(i)==="must"],["optional bosses","Optional bosses",i=>i.t==="boss"&&bossT(i)==="side"],
 ["crests|crest","Crests",i=>i.t==="crest"],["tools|tool","Tools",i=>i.t==="tool"],["simple keys|keys","Keys",i=>i.t==="key"],["maps|map","Maps",i=>i.t==="extra"&&i.gl==="map"],
 ["rosary deposits|deposits","Rosary deposits",i=>i.t==="extra"&&i.gl==="rs"],["shard deposits|shell shard deposits","Shell shard deposits",i=>i.t==="extra"&&i.gl==="craft"],
 ["quest pickups|quest items","Quest pickups",i=>i.t==="quest"],["silk hearts|silk heart","Silk Hearts",i=>/^Silk Heart/.test(i.n)],["pale oil","Pale Oil",i=>/^Pale Oil/.test(i.n)],
 ["beast shards|beast shard","Beast Shards",i=>/^Beast Shard/.test(i.n)],["silkeaters|silkeater","Silkeaters",i=>/^Silkeater/.test(i.n)],["relics","Relics",i=>i.t==="misc"&&/scroll|effigy|harp|cylinder|commandment/i.test(i.n)]];

// ---------- the index of everything that can be named ----------
function hIndex(){if(HLP.idx)return HLP.idx;const L=[];
 const add=(n,kw,kind,id,extra)=>{const nn=hNorm(n);L.push(Object.assign({n,kind,id,orig:hNorm((extra&&extra.o)||n),tk:nn.split(" ").filter(Boolean),kw:hNorm(kw||"").split(" ").filter(Boolean),full:nn},extra||{}))};
 IT.forEach(i=>add(i.n.replace(/\s*\(.*?\)\s*/g," ").trim()||i.n,i.n+" "+kindOf(i).n+" "+aN(areaOf(i)),"it",i.id,{o:i.n}));
 Object.keys(G).forEach(k=>add(G[k].n,(G[k].shop?"shop seller merchant vendor ":"")+(G[k].npc?"npc character ":"")+aN(G[k].a),"g",k));
 GATES.filter(g=>g.k!=="seal").forEach(g=>add(g.n,"passage "+aN(gArea(g)),"gate",g.id));
 WISH.forEach(w=>add(w.n,"wish quest "+w.kind,"wish",w.id));
 AREAS.forEach(a=>add(a.n,"area region","area",a.id));
 [...PW,...KEYS,...FLAGS].forEach(p=>add(p[1],"ability power "+p[0],"pw",p[0]));
 H_PAGES.forEach((p,j)=>add(p[0],p[1],"page",j));
 H_SETS.forEach((s,j)=>add(s[0],s[1],"set",j));
 (typeof BUILDS!=="undefined"?BUILDS:[]).forEach(B=>add(B.n,"build "+B.kind+" "+B.crestN+" "+B.tags.join(" "),"build",B.id));
 return HLP.idx=L}
function hFind(q,kinds){const toks=q.split(" ").filter(t=>t&&!H_STOP.has(t));if(!toks.length)return[];const out=[];
 const glued=toks.join("");
 hIndex().forEach(e=>{if(kinds&&!kinds.includes(e.kind))return;let sc=0,miss=0;
  // words typed together or with a typo ("mosmother") against the whole name
  const whole=e.full.replace(/ /g,""),gl=toks.length<=2&&glued.length>=7&&whole.length>=7&&hLev(glued,whole)<=(glued.length>=10?2:1)&&glued!==whole;
  for(const t of toks){let b=0;e.tk.forEach(x=>b=Math.max(b,hTok(t,x)));if(!b)e.kw.forEach(x=>b=Math.max(b,hTok(t,x)*.45));if(b)sc+=b;else miss++}
  if(gl){out.push([5,e]);return}
  if(miss&&!(toks.length>=3&&miss===1))return;sc-=miss*2.5;
  const nm=e.tk.filter(x=>!H_STOP.has(x));if(nm.every(x=>toks.some(t=>hTok(t,x)>=2)))sc+=1.5;
  if(e.full===toks.join(" "))sc+=5;else if(e.full===q)sc+=4;
  if(e.tk[0]&&toks.some(t=>hTok(t,e.tk[0])>=3))sc+=.6;                                     // the name starts with what you typed
  if(e.kind==="area"&&!miss&&toks.every(t=>e.tk.some(x=>hTok(t,x)>=2)))sc+=2;               // "greymoor" means the area
  if(e.kind==="g"&&!miss)sc+=.8;                                                            // people before the things they sell
  if(e.kind==="gate")sc-=.4;if(e.kind==="wish")sc-=.2;if(e.kind==="it"&&S.done[e.id])sc-=.15;
  if(sc>=2)out.push([sc,e])});
 return out.sort((a,b)=>b[0]-a[0]).map(x=>Object.assign({sc:x[0]},x[1]))}

// ---------- small helpers for answers ----------
const hEsc=s=>esc(String(s==null?"":s));
function hAct(fn,closeFirst){HLP.acts.push({fn,closeFirst});return HLP.acts.length-1}
function hRun(j){const a=HLP.acts[j];if(!a)return;if(a.closeFirst)hClose();try{a.fn()}catch(e){console.error(e);hSay("Sorry, that did not work. Try again, or use the menu.")}}
const hBtn=(label,fn,close=true,cls="")=>`<button class="hb ${cls}" onclick="hRun(${hAct(fn,close)})">${label}</button>`;
const hBtns=(...b)=>`<div class="hbs">${b.filter(Boolean).join("")}</div>`;
const hDot=c=>`<i class="hdot" style="background:${c}"></i>`;
function hItemState(i){const s=st(i);if(S.done[i.id])return[COL.done,REST(i)?"Unlocked":"Collected"];if(s==="red")return[COL.red,"Locked for now"];return[COL.green,REST(i)?"Not unlocked yet":"You can get it now"]}
function hHere(){const H=typeof hereSpot==="function"?hereSpot():null;if(H&&H.p)return{p:H.p,n:H.n};if(typeof vb!=="undefined"&&vb)return{p:[vb[0]+vb[2]/2,vb[1]+vb[3]/2],n:"the part of the map you are looking at",guess:1};return null}
const hDist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
const hPosIt=i=>{try{return placeOf(i)}catch(e){return null}};

// one thing, explained, with buttons
function hAboutItem(i,mode){HLP.last={kind:"it",id:i.id};const [c,lbl]=hItemState(i),miss=needs(i).filter(n=>!req(n)),A=aN(areaOf(i));
 let h=`<b>${hEsc(i.n)}</b><br><small>${hDot(c)}${lbl}${A?" · "+hEsc(A):""}${i.price?" · "+hEsc(i.price):""}</small><p>${i.s||""}</p>`;
 if(mode==="need"||(miss.length&&!S.done[i.id]))h+=miss.length?`<p>🔒 <b>Still needed:</b> ${miss.map(nm).join(", ")}.</p>`:`<p>✅ You have everything it needs.</p>`;
 if(mode==="need"&&i.h)h+=`<p><b>How to get there:</b> ${i.h}</p>`;
 if(mode==="tip"&&i.tip)h+=`<p>💡 <b>Tips:</b> ${i.tip}</p>`;
 const mOf=typeof missOf==="function"?missOf("it",i.id):null;if(mOf&&!(mOf.done&&S.done[mOf.done]))h+=`<p>⚠️ <b>Can be missed:</b> ${mOf.till}</p>`;
 return h+hBtns(hBtn("📍 Show on the map",()=>goTo(i.id)),hBtn("🧭 Directions",()=>showWay("it",i.id)),
  miss.length?hBtn("🔍 What it needs",()=>{closeDrawer();showReq(miss[0],"")}):"",
  S.done[i.id]?hBtn("↩ Not collected",()=>{toggle(i.id);hSay(`Unticked <b>${hEsc(i.n)}</b>.`)},false):hBtn(REST(i)?"✓ I unlocked it":"✓ I have it",()=>{toggle(i.id);hSay(`Ticked <b>${hEsc(i.n)}</b>. ${REST(i)?"":"Nice!"}`,hBtns(hBtn("↩ Undo",()=>{toggle(i.id);hSay("Undone.")},false)))},false))}
function hAboutGroup(k){HLP.last={kind:"g",id:k};const g=G[k],ks=kids(k);
 let h=`<b>${hEsc(g.n)}</b><br><small>${hEsc(aN(g.a))}${ks.length?` · ${ks.filter(i=>S.done[i.id]).length} of ${ks.length} collected`:""}</small><p>${g.d||""}</p>`;
 if(g.when)h+=`<p>🕒 ${g.when}</p>`;if(g.need&&g.need.some(n=>!req(n)))h+=`<p>🔒 <b>Still needed:</b> ${g.need.filter(n=>!req(n)).map(nm).join(", ")}.</p>`;
 return h+hBtns(hBtn("📍 Show on the map",()=>moveToGroup(k)),hBtn("🧭 Directions",()=>showWay("g",k)))}
function hAboutGate(g){HLP.last={kind:"gate",id:g.id};const s=gState(g),miss=gateMiss(g);
 return `<b>${hEsc(g.n)}</b><br><small>${hEsc(aN(gArea(g)))} · ${s==="done"?"Done":s==="open"?"Open for you":s==="shut"?"Locked":"Something to do"}</small><p>${g.h||""}</p>${g.ctl?`<p>🔗 <b>Controls:</b> ${g.ctl}</p>`:""}${miss.length?`<p>🔒 <b>Needs:</b> ${miss.map(nm).join(", ")}.</p>`:""}`
  +hBtns(hBtn("📍 Show on the map",()=>goToGate(g.id)))}
function hAboutArea(a){HLP.last={kind:"area",id:a.id};const its=IT.filter(i=>areaOf(i)===a.id&&COUNTED(i)),d=its.filter(i=>S.done[i.id]).length,on=!!S.areas[a.id];
 const av=its.filter(i=>!S.done[i.id]&&st(i)!=="red").length;
 return `<b>${hEsc(a.n)}</b><br><small>${on?"Found":"Not found yet (dark on the map)"} · ${d} of ${its.length} collected${on?` · ${av} you can get now`:""}</small>`
  +hBtns(hBtn("🗺️ Show the area",()=>moveToArea(a.id)),!on?hBtn("🔓 I've found it",()=>{unlockArea(a.id);hSay(`${hEsc(a.n)} is lit up on the map now.`)},false):"",hBtn("✅ Its checklist",()=>{CK="all";F="avail";openDrawer("list");setTimeout(()=>{const e=[...document.querySelectorAll("#db .ar")].find(x=>x.textContent.startsWith(a.n));if(e)e.scrollIntoView({block:"start"})},80)}))}
function hAboutPw(id){HLP.last={kind:"pw",id};const p=[...PW,...KEYS,...FLAGS].find(x=>x[0]===id),on=has(id),i=byId(id);
 const users=IT.filter(x=>!S.done[x.id]&&needs(x).some(n=>n.split("|").includes(id))).length;
 return `<b>${hEsc(p[1])}</b><br><small>${on?"✓ You have it":"Not ticked yet"}${i?" · "+hEsc(aN(areaOf(i))):""}</small><p>${i&&i.s?i.s:""}</p>${users?`<p>${users} thing${users>1?"s":""} on the map still wait for it.</p>`:""}`
  +hBtns(hBtn("📍 Where to get it",()=>{closeDrawer();showReq(id,"")}),i?hBtn("🧭 Directions",()=>showWay("it",id)):"",
   hBtn(on?"↩ I don't have it":"✓ I have it",()=>{setPw(id,!on);hSay(on?`Unticked <b>${hEsc(p[1])}</b>.`:`Ticked <b>${hEsc(p[1])}</b>. The map is updated.`)},false))}
function hAboutWish(w){HLP.last={kind:"wish",id:w.id};const s=wSt(w);
 return `<b>${hEsc(w.n)}</b><br><small>Wish · ${w.kind} · ${s==="done"?"Done":s==="locked"?"Locked":"Open"}</small><p>${w.d||""}</p>${w.gt?`<p>📍 ${w.gt}</p>`:""}`+hBtns(hBtn("🌸 Open the wish",()=>{closeDrawer();showWish(w.id)}))}
function hAboutPage(j){const p=H_PAGES[j];return `<b>${p[0]}</b><p>${p[3]}</p>`+hBtns(hBtn("Open it",p[2]))}
function hAboutBuild(id){const B=BUILDS.find(x=>x.id===id);return `<b>${B.ic} ${hEsc(B.n)}</b><br><small>${B.kind} · ${hEsc(B.crestN)}</small><p>${B.sum}</p>`+hBtns(hBtn("🧰 Open this build",()=>{GV="build";BOPEN=id;openDrawer("story")}))}
function hAbout(e,mode){if(e.kind==="it")return hAboutItem(byId(e.id),mode);if(e.kind==="g")return hAboutGroup(e.id);if(e.kind==="gate")return hAboutGate(gById(e.id));
 if(e.kind==="area")return hAboutArea(AREAS.find(a=>a.id===e.id));if(e.kind==="pw")return hAboutPw(e.id);if(e.kind==="wish")return hAboutWish(wById(e.id));
 if(e.kind==="page")return hAboutPage(e.id);if(e.kind==="set")return hSetting(H_SETS[e.id][2],null,"");if(e.kind==="build")return hAboutBuild(e.id);return""}

// a list of things of one kind
function hList(label,items,how){const here=hHere();let xs=items.slice();
 if(how.area)xs=xs.filter(i=>areaOf(i)===how.area);
 const todo=xs.filter(i=>!S.done[i.id]),done=xs.length-todo.length;
 if(!xs.length)return `I could not find any ${hEsc(label.toLowerCase())}${how.area?" in "+hEsc(aN(how.area)):""}.`;
 let list=how.all?xs:(todo.length?todo:xs);
 if(how.near&&here)list=list.map(i=>[i,hPosIt(i)]).filter(x=>x[1]).sort((a,b)=>hDist(a[1],here.p)-hDist(b[1],here.p)).map(x=>x[0]);
 else list=list.sort((a,b)=>(st(a)==="red")-(st(b)==="red")||(diffOf("it",a.id)||3)-(diffOf("it",b.id)||3));
 if(how.near&&REST(list[0]||{})&&!how.all){const un=list.filter(i=>S.done[i.id]);if(un.length&&how.unlocked)list=un}
 const top=list.slice(0,6);
 let h=`<b>${hEsc(label)}${how.area?" in "+hEsc(aN(how.area)):""}</b><br><small>${done} of ${xs.length} ${REST(xs[0])?"unlocked":"collected"}${how.near&&here?` · nearest to ${hEsc(here.n)} first`:" · easiest first"}</small>`;
 h+=`<div class="hlist">${top.map(i=>{const [c,lbl]=hItemState(i);return `<div class="hrow">${hDot(c)}<span><b>${hEsc(i.n)}</b><small>${hEsc(aN(areaOf(i)))} · ${lbl}</small></span>${hBtn("📍",()=>goTo(i.id),true,"sm")}${hBtn("🧭",()=>showWay("it",i.id),true,"sm")}</div>`}).join("")}</div>`;
 if(list.length>top.length)h+=`<small>…and ${list.length-top.length} more.</small>`;
 if(top.length===1)HLP.last={kind:"it",id:top[0].id};
 return h+hBtns(how.near&&(!here||here.guess)?hBtn("📍 Tell me where I am",()=>showHerePick()):"",hBtn("✅ Open the checklist",()=>{CK=null;openDrawer("list")}))}

// ---------- settings and map filters ----------
function hSetting(key,txt){const z=SET(),off=/\b(off|disable|disabled|no|stop|remove|without|dont|hide|turn off|switch off|never)\b/.test(txt),on=/\b(on|enable|enabled|yes|start|show|turn on|switch on|want)\b/.test(txt);
 const prev=key==="hideDone"?S.hideDone:z[key];let v=null,msg="";
 const setv=(k,val)=>{if(k==="hideDone"){S.hideDone=!!val;save();refresh()}else setS(k,val);if(document.getElementById("set").classList.contains("on"))renderSettings()};
 if(key==="sz"){if(/\b(bigger|larger|huge|increase|up|more)\b/.test(txt))v=Math.min(1.8,Math.round((z.sz+.2)*20)/20);else if(/\b(smaller|tiny|decrease|down|less)\b/.test(txt))v=Math.max(.6,Math.round((z.sz-.2)*20)/20);else if(/\b(reset|normal|default)\b/.test(txt))v=1;if(v!=null)msg=`Symbols are now ${Math.round(v*100)}% (they were ${Math.round(z.sz*100)}%).`}
 else if(key==="pic"){if(off&&!/\bonly\b/.test(txt))v="off";else if(/\b(card|description|only)\b/.test(txt))v="card";else if(on||/\bmap\b/.test(txt))v="tap";if(v)msg=v==="off"?"Pictures are off.":v==="card"?"Pictures now only show inside the description.":"Pictures now float above the pin you tap, and show in the description."}
 else if(key==="cb"){if(/\b(off|normal|standard|default|no)\b/.test(txt))v="std";else if(/\b(protan|deuteran|red green|red|green)\b/.test(txt))v="rg";else if(/\b(tritan|blue yellow|blue|yellow)\b/.test(txt))v="by";else if(/\b(high contrast|contrast|bright)\b/.test(txt))v="hc";
  if(v)msg=`Colours are now set to <b>${PAL[v].n}</b>. ${PAL[v].d}`}
 else if(key==="look"){if(/\bhollow knight\b|\bhk\b/.test(txt))v="hk";else if(/\bsilksong\b|\bsilk\b|\bred\b|\bcrimson\b/.test(txt))v="silk";else if(/\bgreen ?path\b|\bgreen\b|\bmoss\b/.test(txt))v="moss";else if(/\bclassic\b|\boriginal\b|\bold\b|\bnormal\b/.test(txt))v="classic";if(v)msg=`The style is now <b>${(LOOKS.find(x=>x[0]===v)||[,v])[1]}</b>.`}
 else if(key==="fx"){v=off?0:1;msg=v?"Moving effects are on.":"Moving effects are off."}
 else if(key==="theme"){if(/\bdark|night\b/.test(txt))v="dark";else if(/\blight|day\b/.test(txt))v="light";else if(/\bauto|system|automatic\b/.test(txt))v="auto";if(v)msg=`Menus and panels are now ${v==="auto"?"following your phone or computer":v}.`}
 else if(key==="lefty"){if(/\bright hand/.test(txt))v=0;else if(off)v=0;else v=1;msg=v?"The map buttons are on the left now.":"The map buttons are back on the right."}
 else if(key==="hideDone"){v=/\bshow\b/.test(txt)?false:off&&!/\bhide\b/.test(txt)?false:true;msg=v?"Collected pins are hidden from the map now.":"Collected pins show on the map again."}
 else if(["labels","ovw","bigui","haptic","badges"].includes(key)){if(off)v=0;else if(on||/\b(bigger|big|large)\b/.test(txt))v=1;
  const L={labels:"Place names on the map",ovw:"Area names when zoomed out",bigui:"Bigger buttons",haptic:"Vibrate when ticking",badges:"Shape badges on icons"}[key];if(v!=null)msg=`<b>${L}</b> is now ${v?"on":"off"}.`}
 const sec={look:"colour",fx:"colour",sz:"size",pic:"pic",cb:"colour",theme:"colour",labels:"size",ovw:"size",hideDone:"size",bigui:"phone",lefty:"phone",haptic:"phone",badges:"colour"}[key];
 const name=(H_SETS.find(s=>s[2]===key)||[key])[0];
 if(v==null||v===prev)return (v===prev&&v!=null?`<b>${name}</b> is already set like that.`:`This is the <b>${name}</b> setting.`)+hBtns(hBtn("⚙️ Open it in Settings",()=>openSettings(sec)));
 setv(key,v);return `✅ ${msg}`+hBtns(hBtn("↩ Undo",()=>{setv(key,prev);hSay("Undone: it is back how it was.")},false),hBtn("⚙️ Open Settings",()=>openSettings(sec)))}
function hLayerWord(q){for(const [w,k] of H_LAYERS){for(const p of w.split("|"))if(new RegExp("\\b"+p+"\\b").test(q))return{k,w:p}}return null}
function hLayerName(k){if(k==="ALL")return"every kind of pin";if(k.startsWith("cat:")){const K=KINDS.find(x=>x.k===k.slice(4));return K?K.n:k.slice(4)}
 for(const c in SUBS){const s=SUBS[c].find(x=>c+"."+x[0]===k);if(s)return s[1]}const K=KINDS.find(x=>x.k===k);if(K)return K.n;const W=WSEC.find(x=>"g_"+x.k===k);if(W)return W.n;return{shop:"Shops & sellers",npc:"Characters",mine:"Your markers"}[k]||k}
function hLayer(L,txt){const only=/\bonly\b|\bjust\b/.test(txt),off=!only&&/\b(hide|off|remove|disable|without|no)\b/.test(txt);const before=JSON.stringify(S.off||{}),name=hLayerName(L.k);
 const keys=L.k==="ALL"?null:L.k.startsWith("cat:")?catKeys(L.k.slice(4)):[L.k];
 if(!keys){setLayers(off?0:1)}else if(only){setLayers(0);S.off=S.off||{};keys.forEach(k=>delete S.off[k]);save();refresh()}else{S.off=S.off||{};keys.forEach(k=>{if(off)S.off[k]=1;else delete S.off[k]});save();refresh()}
 const lp=document.getElementById("lpop");if(lp&&lp.classList.contains("on"))lpopDraw();
 if(L.k==="ALL")return `✅ ${off?"Every pin is hidden from the map now.":"Every kind of pin shows on the map again."}`+hBtns(hBtn("↩ Undo",()=>{S.off=JSON.parse(before);save();refresh();hSay("Undone: the map filter is back how it was.")},false),hBtn("◧ Open the map filter",()=>{closeDrawer();toggleLayers()}));
 return `✅ ${only?`Only <b>${hEsc(name)}</b> are shown on the map now.`:off?`<b>${hEsc(name)}</b> ${L.k==="ALL"?"are":"are"} hidden from the map now.`:`<b>${hEsc(name)}</b> show on the map again.`}`
  +hBtns(hBtn("↩ Undo",()=>{S.off=JSON.parse(before);save();refresh();hSay("Undone: the map filter is back how it was.")},false),hBtn("◧ Open the map filter",()=>{closeDrawer();toggleLayers()}))}

// ---------- understanding a question ----------
function hAnswer(raw){const q0=hNorm(raw);if(!q0)return null;const q=hSyn(q0);const hq=re=>re.test(q);
 const last=HLP.last;const refersBack=/\b(it|there|that|this one|that one|them)\b/.test(q0)&&!hFind(q).some(e=>e.sc>=5);
 // greetings and help
 if(/^(help|hi|hello|hey|yo|hallo|menu|start|what can you do|what can i ask|how does this work|commands|\?+)$/.test(q))return hHelp();
 if(hq(/^(thanks|thank you|thx|ty|cool|great|nice|ok|okay)$/))return "You're welcome! Ask me anything else about the app or the map.";
 // follow-ups about the last thing
 if(last&&refersBack){
  if(hq(/\b(take me|directions?|route|way|lead|guide|navigate|go there|get there)\b/)&&(last.kind==="it"||last.kind==="g")){const L=last;return{run:()=>showWay(L.kind,L.id),txt:"🧭 Starting directions. Follow the gold line on the map."}}
  if(hq(/\b(need|needs|requirement|locked|unlock|why)\b/)&&last.kind==="it")return hAboutItem(byId(last.id),"need");
  if(hq(/\b(show|where|find|see)\b/)){const L=last;return{run:()=>L.kind==="it"?goTo(L.id):L.kind==="g"?moveToGroup(L.id):L.kind==="gate"?goToGate(L.id):L.kind==="area"?moveToArea(L.id):0,txt:"📍 Here it is on the map."}}
  if(hq(/\b(got|have|collected|found|beat|beaten|killed|done|tick)\b/)&&last.kind==="it"){const i=byId(last.id);if(!S.done[i.id])toggle(i.id);return `Ticked <b>${hEsc(i.n)}</b>.`+hBtns(hBtn("↩ Undo",()=>{toggle(i.id);hSay("Undone.")},false))}}
 // donations
 if(hq(/\b(donate|donation|donations|support (the )?(app|you|developer|dev)|tip jar|buy (you|me) a coffee|ko ?fi|patreon|pay|paypal)\b/))return DONATE_URL?`The app is free and stays free. If you want to say thanks, you can leave a small donation.`+hBtns(hBtn("❤️ Support the app",()=>openDonate(),false)):"The app is completely free. There is no donation link yet, but sending a bug report or an idea with the ⚠ button helps a lot too!";
 // updates and the version
 if(hq(/\b(what|which) version\b|\bversion (do i have|is this|am i on)\b|\bmy version\b/))return `You have <b>version ${hEsc(BOOT.version())}</b>.`+hBtns(hBtn("🔄 Check for updates",()=>BOOT.checkUpdate()),hBtn("📜 Update log",()=>BOOT.openLog()));
 if(hq(/\b(update|updates|upgrade|newer version|new version|latest version)\b/)&&!hq(/\b(log|notes|history|changelog|whats new|what s new|changed)\b/))return{run:()=>BOOT.checkUpdate(),txt:"🔄 Checking for a newer version…"};
 if(hq(/\b(update log|changelog|change log|patch notes|whats new|what s new|what changed|version history)\b/))return{run:()=>BOOT.openLog(),txt:"📜 Opening the update log."};
 // what now / stuck
 if(hq(/\b(what now|what next|whats next|next step|what (should|do|can) i do|i m stuck|im stuck|stuck|lost|where (do|should) i go( next)?|what to do|what can i get)\b/))return hNext();
 // progress
 if(!hq(/\b(restore|backup|back up|reset|save code|copy|transfer|delete)\b/)&&hq(/\b(progress|how far|completion|percent|how many .*(have|got|found|collected|left)|how much .*(left|done))\b/))return hProgress(q);
 // legend / what does X mean
 if(hq(/\b(what (does|do|is|are)|meaning of|means?)\b.*\b(colou?rs?|red|green|grey|gray|orange|purple|dashed|crown|gold|ring|star|dot|square|diamond|bubble|number|line|icon|symbol|pin|shape)\b/)||hq(/\blegend\b/))
  return `On the map: <b>green</b> = you can get it now, <b>red</b> = locked (needs something first), <b>grey</b> = collected. Bigger pins with a face are bosses (gold ring and crown = must beat). Squares are shops and characters, diamonds are quest pickups, a gold dot means tips, and a numbered bubble is a busy spot: tap it or zoom in.`+hBtns(hBtn("🎨 Open the full legend",()=>openSettings("legend")),hBtn("🧭 How to read the map",H_PAGES.find(p=>p[0]==="How to read the map")[2]));
 // where am I / I'm at
 const imAt=q.match(/\b(?:i m|im|i am|currently)\s+(?:at|in|on|near|by|sitting at|resting at)\s+(.+)$/)||q.match(/\b(?:start from|starting from|set (?:my )?(?:location|position|start)(?: to)?)\s+(.+)$/);
 if(imAt){const f=hFind(imAt[1],["it","area"]).filter(e=>e.kind==="area"||REST(byId(e.id)));if(f.length){const e=f[0];
   if(e.kind==="it"){setHere(e.id);return `📍 Got it: you're at <b>${hEsc(byId(e.id).n)}</b>. Directions start from there now.`}
   const bs=IT.filter(i=>REST(i)&&areaOf(i)===e.id);return `Which bench or station in <b>${hEsc(aN(e.id))}</b> are you at?<div class="hlist">${bs.slice(0,8).map(i=>`<div class="hrow"><span><b>${hEsc(i.n)}</b></span>${hBtn("I'm here",()=>{setHere(i.id);hSay(`📍 You're at <b>${hEsc(i.n)}</b>.`)},false,"sm")}</div>`).join("")}</div>`+hBtns(hBtn("📍 Pick it on the map",()=>showHerePick()))}}
 if(hq(/\bwhere am i\b|\bset (my )?(location|position|start)\b/))return `Directions start from where you are. Pick your bench or station, or tap a spot on the map.`+hBtns(hBtn("📍 Set where I am",()=>showHerePick()));
 // settings
 const sMatch=H_SETS.map((s,j)=>{let b=0;s[1].split(" ").forEach(w=>{if(w.length>2&&new RegExp("\\b"+w+"\\b").test(q))b++});return[b,s[2]]}).sort((a,b)=>b[0]-a[0])[0];
 const sizeQ=hq(/\b(bigger|larger|smaller|tiny|huge)\b.*\b(icons?|symbols?|pins?)\b|\b(icons?|symbols?|pins?)\b.*\b(bigger|larger|smaller|tiny|huge)\b/);
 if(sizeQ)return hSetting("sz",q);
 if(hq(/\b(bigger|big|larger) buttons\b/))return hSetting("bigui",q);
 if(hq(/\b(hollow knight|silksong|greenpath|green path|classic|original look|old look)\b/)&&hq(/\b(theme|style|look|skin|colou?rs?|mode|make it|switch|change|use|set)\b/))return hSetting("look",q);
 if(hq(/\b(effects?|particles?|animations?|sparkles?)\b/))return hSetting("fx",q);
 if(hq(/\b(dark|light|night) (mode|theme)\b/))return hSetting("theme",q);
 if(hq(/\b(theme|style|look|skin)s?\b/))return hSetting("look",q);
 if(hq(/\bcolou?r ?blind|colorblind|colourblind|protanop|deuteranop|tritanop|high contrast\b/))return hSetting("cb",q);
 if(hq(/\b(left hand|lefty|right hand|buttons on the left)/))return hSetting("lefty",q);
 if(hq(/\b(hide|show)\b.*\b(collected|done|finished|completed)\b/))return hSetting("hideDone",q);
 if(hq(/\b(pictures?|images?|photos?|screenshots?)\b/)&&hq(/\b(off|on|only|disable|enable|hide|show|stop|card|description|turn|switch|dont|no)\b/))return hSetting("pic",q);
 if(hq(/\b(vibrat\w*|haptic|buzz)\b/))return hSetting("haptic",q);
 if(hq(/\b(place names|labels)\b/)&&hq(/\b(on|off|hide|show|turn|switch)\b/))return hSetting("labels",q);
 // map filter
 const L=hLayerWord(q);if(L&&(hq(/\b(hide|unhide|turn (on|off)|switch (on|off)|only|filter|remove|disable|enable)\b/)||new RegExp("^(show|show all|show the)\\s+"+L.w+"( again)?( on the map)?$").test(q)))return hLayer(L,q);
 // builds
 if(hq(/\bbuilds?\b|\bloadouts?\b|\bsetups?\b/)){const sort=hq(/\bboss/)?"boss":hq(/\b(crowd|group|swarm|gauntlet|arena|many enemies)/)?"crowd":hq(/\b(surviv|tank|safe|live|beginner|easy)/)?(hq(/\beasy|beginner/)?"easy":"live"):hq(/\b(explor|travel)/)?"explore":hq(/\b(dodg|fast|speed|evasive|mobil)/)?"move":"";
  const b=hFind(q,["build"]).filter(e=>e.sc>=4);if(b.length)return hAboutBuild(b[0].id);
  return `There are 8 ready-made builds${sort?`; I'll show the best ones for <b>${BUILD_R.find(x=>x[0]===sort)[1].toLowerCase()}</b> first`:""}.`+hBtns(hBtn("🧰 Open the builds",()=>{GV="build";BSORT=sort;BOPEN=null;openDrawer("story")}))}
 if(hq(/\bmiss(able|ables)?\b|\bdont miss\b|\bcan i miss\b|\bmissed\b/)&&!hq(/\bmission/))return H_PAGES.find(p=>p[0]==="Don't miss")&&hAboutPage(H_PAGES.findIndex(p=>p[0]==="Don't miss"));
 // intent words for the rest
 const wantWay=hq(/\b(take me|bring me|lead me|guide me|directions?|route|navigate|way to|how (do|can) i get to|get me to|go to|travel to|walk to)\b/);
 const wantNeed=hq(/\b(what do i need|what does it need|requirements?|needs|why (is|cant|can t|can not)|why locked|is .* locked|locked|how (do|can) i (get|unlock|reach|beat|open|obtain)|how to (get|unlock|reach|beat|open|obtain))\b/);
 const um=q.match(/^(?:unlock|reveal|discover|i found|i discovered|i reached|i made it to|i m in|im in|i am in|i arrived in)\s+(.+)$/);
 if(um){const fa=hFind(um[1],["area"]);if(fa.length&&fa[0].sc>=3){const a=fa[0];if(S.areas[a.id])return `<b>${hEsc(a.n)}</b> is already lit up on the map.`+hBtns(hBtn("🗺️ Show it",()=>moveToArea(a.id)));unlockArea(a.id);HLP.last={kind:"area",id:a.id};return `✅ <b>${hEsc(a.n)}</b> is lit up on the map now.`+hBtns(hBtn("↩ Undo",()=>{S.areas[a.id]=0;save();refresh();hSay("Undone.")},false),hBtn("🗺️ Show it",()=>moveToArea(a.id)))}}
 const wantTick=hq(/\b(i (got|have|found|beat|killed|collected|unlocked|opened|picked up|defeated)|mark (as )?(done|collected)|tick off)\b/);
 const near=hq(/\b(nearest|closest|near me|nearby|close by|closest to me)\b/);
 // strip the intent words before matching names
 let rest=q.replace(/\b(take me to|take me|bring me to|lead me to|guide me to|get me to|directions? to|route to|the way to|way to|how (do|can) i get to|navigate to|go to|travel to|walk to|what do i need for|what do i need to|what does .* need|requirements? for|how (do|can) i (get|unlock|reach|beat|open|obtain)|how to (get|unlock|reach|beat|open|obtain)|why (is|cant|can t|can not)|is|locked|i (got|have|found|beat|killed|collected|unlocked|opened|picked up|defeated)|mark (as )?(done|collected)|tick off|nearest|closest|near me|nearby|close by|where is|where are|where can i find|where do i find|wheres|find|show me|show|easiest|easy|next|all|every|remaining|missing|left|open|the)\b/g," ").replace(/\s+/g," ").trim();
 // an area named in the question ("fleas in greymoor")
 let area=null;const ai=rest.match(/\b(?:in|at|around|inside)\s+(.+)$/);if(ai){const fa=hFind(ai[1],["area"]);if(fa.length&&fa[0].sc>=3){area=fa[0].id;rest=rest.slice(0,ai.index).trim()}}
 // a whole kind of thing
 const cat=H_CATS.find(([w])=>w.split("|").some(p=>new RegExp("^(?:"+p+")$").test(rest)));
 if(cat){const items=IT.filter(cat[2]);if(wantWay&&near){const here=hHere();const c=items.filter(i=>(REST(i)||!S.done[i.id])&&st(i)!=="red").map(i=>[i,hPosIt(i)]).filter(x=>x[1]);
   if(here&&c.length){c.sort((a,b)=>hDist(a[1],here.p)-hDist(b[1],here.p));const i=c[0][0];HLP.last={kind:"it",id:i.id};return{run:()=>showWay("it",i.id),txt:`🧭 Directions to the nearest: <b>${hEsc(i.n)}</b> (${hEsc(aN(areaOf(i)))}).`}}}
  return hList(cat[1],items,{near,area,all:hq(/\b(all|every)\b/),unlocked:near&&REST(items[0]||{})})+(/^Rosary/.test(cat[1])?hBtns(hBtn("💪 Money tips and farming spots",()=>{GV="tips";TOPEN="money";openDrawer("story")})):/^(Mask|Spool)/.test(cat[1])?hBtns(hBtn("💪 Get stronger",()=>{GV="tips";TOPEN=/^Mask/.test(cat[1])?"hp":"silk";openDrawer("story")})):"")}
 if(!rest&&area)return hAboutArea(AREAS.find(a=>a.id===area));
 // a page by name ("open the checklist", "settings")
 const found=hFind(rest||q);
 if(!found.length)return hNoMatch(raw);
 const top=found[0],close=found.filter(e=>e.sc>=top.sc-1.2);
 // many things with the same name (e.g. "Mask Shard") -> list them
 const same0=close.filter(e=>e.kind==="it"&&e.full===top.full),ex=same0.filter(e=>e.orig===rest||e.orig===q),plain=same0.filter(e=>e.orig===e.full),same=ex.length===1?ex:plain.length===1&&same0.length<=3?plain:same0;
 if(top.kind==="it"&&same.length>1){const items=same.map(e=>byId(e.id));if(wantWay&&near){const here=hHere();if(here){const c=items.filter(i=>!S.done[i.id]&&st(i)!=="red").map(i=>[i,hPosIt(i)]).filter(x=>x[1]).sort((a,b)=>hDist(a[1],here.p)-hDist(b[1],here.p));if(c.length){const i=c[0][0];return{run:()=>showWay("it",i.id),txt:`🧭 Directions to the nearest <b>${hEsc(i.n)}</b> (${hEsc(aN(areaOf(i)))}).`}}}}
  return hList(items[0].n.replace(/\s*\(.*?\)/g,""),IT.filter(i=>hNorm(i.n.replace(/\s*\(.*?\)\s*/g," ").trim())===top.full),{near,area,all:hq(/\b(all|every)\b/)})}
 // clearly one thing
 const distinct=close.filter((e,j)=>close.findIndex(x=>x.n===e.n&&x.kind===e.kind)===j);
 if(distinct.length===1||top.sc>=distinct[1].sc+2||top.full===rest){const e=top;
  if(wantTick&&e.kind==="it"){const i=byId(e.id);HLP.last={kind:"it",id:i.id};if(S.done[i.id])return `<b>${hEsc(i.n)}</b> is already ticked.`;toggle(i.id);return `✅ Ticked <b>${hEsc(i.n)}</b>.`+hBtns(hBtn("↩ Undo",()=>{toggle(i.id);hSay("Undone.")},false))}
  if(wantTick&&e.kind==="pw"){if(!req(e.id))setPw(e.id,true);HLP.last={kind:"pw",id:e.id};return `✅ Ticked <b>${hEsc(nm(e.id))}</b>. Every pin that needed it is updated.`}
  if(wantTick&&e.kind==="area"){unlockArea(e.id);return `✅ <b>${hEsc(aN(e.id))}</b> is lit up on the map now.`}
  if(wantWay&&(e.kind==="it"||e.kind==="g")){HLP.last={kind:e.kind,id:e.id};return{run:()=>showWay(e.kind,e.id),txt:`🧭 Starting directions to <b>${hEsc(e.n)}</b>. Follow the gold line on the map.`}}
  if(wantWay&&e.kind==="area")return{run:()=>moveToArea(e.id),txt:`🗺️ Here is <b>${hEsc(e.n)}</b>. Pick something in it and I can give directions.`};
  if(e.kind==="page"&&!wantNeed)return{run:H_PAGES[e.id][2],txt:`Opening <b>${H_PAGES[e.id][0]}</b>.`};
  if(e.kind==="set")return hSetting(H_SETS[e.id][2],q);
  return hAbout(e,hq(/\b(beat|defeat|kill|fight|tips?|trick|hard|help with)\b/)&&e.kind==="it"&&byId(e.id).tip?"tip":wantNeed?"need":"")}
 // a few good candidates: let the player pick
 return `Which one do you mean?<div class="hlist">${distinct.slice(0,6).map(e=>`<div class="hrow"><span><b>${hEsc(e.n)}</b><small>${hKindLabel(e)}</small></span>${hBtn("This one",()=>hShow(hAbout(e,wantNeed?"need":"")),false,"sm")}</div>`).join("")}</div>`}
function hKindLabel(e){if(e.kind==="it"){const i=byId(e.id);return hEsc(kindOf(i).n+" · "+aN(areaOf(i)))}return{g:"Shop or character · "+hEsc(aN((G[e.id]||{}).a)),gate:"Door, lever or passage",wish:"Wish",area:"Area",pw:"Ability",page:"Page in the app",set:"Setting",build:"Build"}[e.kind]||""}
function hNext(){const d=storyState(),cur=d.indexOf(false),av=IT.filter(i=>cnt(i)&&vis(i)&&!S.done[i.id]&&st(i)!=="red").sort((a,b)=>(diffOf("it",a.id)||3)-(diffOf("it",b.id)||3));
 let h=cur>=0?`<b>Next story step:</b> ${hEsc(STORY[cur].n)}.`:`You have finished the Act 1 story steps.`;
 h+=`<br><small>${av.length} things you can get right now in the areas you have found.</small>`;
 if(av.length)h+=`<div class="hlist">${av.slice(0,4).map(i=>`<div class="hrow">${hDot(COL.green)}<span><b>${hEsc(i.n)}</b><small>${hEsc(aN(areaOf(i)))}</small></span>${hBtn("📍",()=>goTo(i.id),true,"sm")}${hBtn("🧭",()=>showWay("it",i.id),true,"sm")}</div>`).join("")}</div>`;
 return h+hBtns(hBtn("📜 Open the story guide",()=>{GV="story";openDrawer("story")}),hBtn("✅ Everything I can get",()=>{CK="all";F="avail";openDrawer("list")}))}
function hProgress(q){const all=IT.filter(COUNTED),d=all.filter(i=>S.done[i.id]).length;const rows=[["Mask Shards",i=>i.t==="mask"],["Spool Fragments",i=>i.t==="spool"],["Fleas",i=>i.t==="flea"],["Memory Lockets",i=>i.t==="locket"],["Bosses",i=>i.t==="boss"],["Benches",i=>i.t==="bench"]];
 const cat=H_CATS.find(([w])=>w.split("|").some(p=>new RegExp("\\b"+p+"\\b").test(q)));
 if(cat){const xs=IT.filter(cat[2]);return `<b>${cat[1]}:</b> ${xs.filter(i=>S.done[i.id]).length} of ${xs.length} ${REST(xs[0]||{})?"unlocked":"collected"}.`+hBtns(hBtn("✅ Open the checklist",()=>{CK=null;openDrawer("list")}))}
 return `<b>Your progress:</b> ${d} of ${all.length} collectibles (${Math.round(d/Math.max(1,all.length)*100)}%).<div class="hlist">${rows.map(([n,f])=>{const xs=IT.filter(f);return `<div class="hrow"><span>${n}</span><b>${xs.filter(i=>S.done[i.id]).length} / ${xs.length}</b></div>`}).join("")}</div>`+hBtns(hBtn("✅ Open the checklist",()=>{CK=null;openDrawer("list")}))}
function hNoMatch(raw){const q=raw.trim();
 return `Sorry, I don't know “${hEsc(q)}” yet. Try a name from the game (“Moss Mother”, “Bellhart”), a kind of thing (“nearest bench”, “mask shards”) or something in the app (“bigger icons”, “hide deposits”).`
  +hBtns(hBtn("🔍 Search the app for it",()=>{openSearch();setQ(q);renderDrawer()}),hBtn("💡 What can I ask?",()=>hShow(hHelp()),false))}
function hHelp(){return `I can find anything in the app and take you there. Try:<ul class="hul">
 <li><b>Where is</b> Moss Mother? · Where can I find Pale Oil?</li><li><b>Take me to</b> the nearest bench · Directions to Widow</li>
 <li><b>What do I need for</b> the Last Judge? · Why is this locked?</li><li><b>Mask shards</b> · Fleas in Greymoor · Easiest spool fragment</li>
 <li>I got Cling Grip · I'm at the Bone Bottom bench</li><li>What should I do next? · My progress</li>
 <li>Bigger icons · Dark mode · Colour blind red green · Pictures off</li><li>Hide deposits · Only bosses · Show everything</li>
 <li>Best build for bosses · What can I miss? · Open the checklist · Report a bug</li></ul>After an answer you can say “take me there” or “what does it need”.`}

// ---------- the chat window ----------
const H_CHIPS=["What should I do next?","Nearest bench","Mask shards","Bigger icons","Hide deposits","What can I miss?"];
function hDraw(){const L=document.getElementById("hlog");if(!L)return;
 L.innerHTML=HLP.log.map(m=>`<div class="hm ${m.me?"me":""}">${m.me?hEsc(m.t):m.t}</div>`).join("");L.scrollTop=L.scrollHeight}
function hSay(t,extra){HLP.log.push({me:0,t:t+(extra||"")});if(HLP.log.length>80)HLP.log.splice(0,HLP.log.length-80);hDraw()}
const hShow=t=>hSay(t);
function hAsk(text){text=String(text||"").trim();if(!text)return;HLP.log.push({me:1,t:text});const inp=document.getElementById("hin");if(inp)inp.value="";
 let a;try{a=hAnswer(text)}catch(e){console.error(e);a="Sorry, something went wrong with that question. Try asking it a little differently."}
 if(a&&typeof a==="object"&&a.run){hSay(a.txt);hClose();setTimeout(()=>{try{a.run()}catch(e){console.error(e)}},60)}else hSay(a||hNoMatch(text))}
function hOpen(){let P=document.getElementById("hlp");
 if(!P){P=document.createElement("div");P.id="hlp";P.setAttribute("role","dialog");P.setAttribute("aria-label","Helper");
  P.innerHTML=`<div class="hhd"><span class="hav" aria-hidden="true">💬</span><b>Helper</b><small>Ask anything about the app or the map</small><button class="hx" aria-label="Close the helper" onclick="hClose()">✕</button></div>
  <div id="hlog" aria-live="polite"></div><div class="hchips">${H_CHIPS.map(c=>`<button onclick="hAsk(this.textContent)">${c}</button>`).join("")}</div>
  <form class="hform" onsubmit="event.preventDefault();hAsk(document.getElementById('hin').value)"><input id="hin" type="text" autocomplete="off" enterkeyhint="send" placeholder="Ask, e.g. “where is Moss Mother?”" aria-label="Your question"><button type="submit" aria-label="Send">➤</button></form>`;
  document.body.appendChild(P)}
 if(!HLP.log.length)hSay(`Hi! I can find anything in the app, take you to it on the map and start directions. What are you looking for?`);
 HLP.idx=null;P.classList.add("on");hDraw();if(typeof backPush==="function")backPush();
 if(innerWidth>=700)setTimeout(()=>{const i=document.getElementById("hin");if(i)i.focus()},80)}
function hClose(){const P=document.getElementById("hlp");if(P)P.classList.remove("on")}
const hlpIsOpen=()=>{const P=document.getElementById("hlp");return !!(P&&P.classList.contains("on"))};
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&hlpIsOpen())hClose()});
