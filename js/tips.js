// ---------- "Get stronger": easy health, silk, money and shards, plus simple builds ----------
// Shown in the Guide tab next to the story steps. The lists are worked out from the player's own progress
// (what they can reach now, easiest first); the fixed texts come from the sources listed in docs/reference/SOURCES.md.
let GV="story",TOPEN="hp";
const guideSeg=()=>`<div class="gseg" role="tablist">${[["story","📜 Story"],["tips","💪 Stronger"],["build","🧰 Builds"],["miss","⚠️ Don't miss"]].map(a=>`<button role="tab" aria-selected="${GV===a[0]}" class="${GV===a[0]?'on':''}" onclick="GV='${a[0]}';renderDrawer();document.getElementById('db').scrollTop=0">${a[1]}</button>`).join("")}</div>`;

// a checklist row with the area above it, so two things with the same name can be told apart
const trow=i=>`<div class="tarea">${(AREAS.find(a=>a.id===areaOf(i))||{}).n||""}</div>`+row(i,false);
// the easiest things of one kind that the player can get right now
const tipEasy=(f,n)=>IT.filter(i=>f(i)&&!S.done[i.id]&&st(i)!=="red").map(i=>[i,diffOf("it",i.id)||3]).sort((a,b)=>a[1]-b[1]).slice(0,n||5).map(a=>a[0]);
// what the locked ones of that kind are waiting for, most common first
function tipBlockers(f){const t={};let n=0;IT.filter(i=>f(i)&&!S.done[i.id]&&st(i)==="red").forEach(i=>{n++;needs(i).filter(x=>!req(x)).forEach(x=>t[x]=(t[x]||0)+1)});
 const top=Object.keys(t).sort((a,b)=>t[b]-t[a]).slice(0,3);return n?`<p class="tnote">${n} more ${n===1?"is":"are"} locked for now.${top.length?" They mostly wait for: "+top.map(x=>`<b>${nm(x)}</b> (${t[x]})`).join(", ")+".":""}</p>`:""}
function tipList(f,n,none){const xs=tipEasy(f,n),left=IT.filter(i=>f(i)&&!S.done[i.id]).length;
 if(!left)return `<p class="tnote">🎉 You have all of these.</p>`;
 return (xs.length?`<div class="tsub">Easiest ones you can get right now</div>`+xs.map(i=>trow(i)).join(""):`<p class="tnote">${none||"None you can reach right now."}</p>`)+tipBlockers(f)}
// one line for a tool, crest or character, with a button that shows it on the map
function tl(id,why){const i=byId(id);if(!i)return"";const dn=S.done[i.id],s=st(i);
 return `<div class="tli ${dn?'d':''}"><button onclick="moveTo('${id}')" aria-label="Show ${esc(i.n)} on the map"><b>${i.n}</b><span class="tst" style="--c:${dn?COL.done:COL[s]}">${dn?"✓ You have it":s==="red"?"Locked":"Can get now"}</span></button><p>${why}${i.price?` <i>Costs ${i.price}.</i>`:""}</p></div>`}
const tg=(k,why)=>G[k]?`<div class="tli"><button onclick="moveToGroup('${k}')" aria-label="Show ${esc(G[k].n)} on the map"><b>${G[k].n}</b><span class="tst" style="--c:#3b6fb5">Show on map</span></button><p>${why}</p></div>`:"";
const tsec=(id,ic,n,sub,body)=>`<details class="sstep tsec" ${TOPEN===id?'open':''} ontoggle="if(this.open)TOPEN='${id}'"><summary><span class="sn">${ic}</span><span class="st"><b>${n}</b><small>${sub}</small></span></summary><div class="tbody">${body}</div></details>`;
const cntOf=f=>{const a=IT.filter(f);return a.filter(i=>S.done[i.id]).length+" / "+a.length};

function tipsTab(){
 const isMask=i=>i.t==="mask",isSpool=i=>i.t==="spool",isHeart=i=>i.t==="misc"&&/^Silk Heart/.test(i.n),isRos=i=>i.t==="rosary",isDep=i=>i.t==="extra"&&i.gl==="rs",isShard=i=>i.t==="extra"&&i.gl==="craft";
 let h=`<div class="shead"><b>Get stronger, the easy way</b><small>More health, more silk, more money. Each list looks at what you have ticked in the app and shows the easiest things first. Tap a line to see it on the map.</small></div>`;

 h+=tsec("hp","❤️","More health",cntOf(isMask)+" Mask Shards",
  `<p>Your health is shown as <b>masks</b>. Every <b>4 Mask Shards</b> you find make one extra mask. Six shards can be found in Act 1, so one extra mask is possible before the Citadel.</p>`
  +tipList(isMask,6)
  +`<div class="tsub">Tools that keep you alive</div>`
  +tl("ward","No damage while you heal. Healing (Bind) is when most players get hit, so this is the best first pick for a beginner.")
  +tl("fmask","Saves you once from a hit that would have killed you.")
  +tl("multi","One heal gives back up to 4 masks instead of 3.")
  +tl("injector","Healing is 40% faster.")
  +tl("dice","A chance to block a hit completely.")
  +tl("belt","You get pushed back less, and stay safe a little longer after a hit.")
  +tl("resbind","One heal that costs no silk."));

 h+=tsec("silk","🧵","More silk",cntOf(isSpool)+" Spool Fragments · "+cntOf(isHeart)+" Silk Hearts",
  `<p><b>Silk</b> is the white thread you spend to heal and to use Silk Skills. Hitting enemies fills it. Every <b>2 Spool Fragments</b> make your spool bigger, so you can hold more. A <b>Silk Heart</b> makes a little silk grow back by itself when you are not fighting.</p>`
  +tipList(isSpool,6)
  +`<div class="tsub">Silk Hearts</div>`+IT.filter(isHeart).map(i=>trow(i)).join("")
  +`<div class="tsub">Tools and crests for silk</div>`
  +tl("weavel","Silk grows back faster, and it counts as one more Silk Heart.")
  +tl("spoolExt","Makes your spool bigger straight away.")
  +tl("dey","Gives back 1 silk for every 2 hits you take: handy while you are still learning a boss.")
  +tl("reaper","After you heal, enemies you hit drop extra bits of silk for 10 seconds. Its swings are wide but slow."));

 h+=tsec("money","📿","More money (rosaries)",cntOf(isRos)+" strings & necklaces",
  `<p><b>Rosaries</b> are the money of the game. Loose rosaries are dropped when you die. You get one chance to pick them up from the cocoon where you fell: die again first and they are gone.</p>
  <div class="tsub">Keep your money safe</div>
  <ul class="tul"><li><b>Tie them on a string before a hard part.</b> Shops and string machines turn 80 loose rosaries into a Rosary String worth 60. A string is never lost when you die; break it open when you want to spend it.</li>
  <li><b>Pick them up quickly.</b> Dropped rosaries roll away, and they vanish in spikes or when you leave the room.</li>
  <li><b>Spend before you explore.</b> Money in your pocket is money you can lose: buy the map, bench or tool first.</li></ul>`
  +tl("purse","You keep half your loose rosaries when you die.")
  +`<div class="tsub">Free money lying around</div><p>Strings and necklaces hang in corners and behind breakable walls. They are safe money: break one open when you need it (Frayed String 30, String 60, Necklace 120, Heavy Necklace 220, Pale Necklace 340).</p>`
  +tipList(isRos,6)
  +`<p class="tnote">Also on the map: <b>${IT.filter(i=>isDep(i)&&!S.done[i.id]).length}</b> rosary deposits you have not ticked yet (rocks, sacks, cymbals and bells that pay 20 to 40 each). Switch them on with the ◧ button, under "Maps, shards & deposits".</p>`
  +`<div class="tsub">Places to earn rosaries again and again</div><p>Enemies come back every time you sit on a bench. Sit, clear the same short stretch, sit again.</p>
  <ul class="tul"><li><b>Mosshome (Act 1, the easiest).</b> The pilgrims here carry rosaries, about 5 each. Sit on the Mosshome bench, walk through Mosshome and beat every pilgrim, come back and sit again. Slow but very safe. <button class="tgo" onclick="moveTo('b_mh')">Show the bench</button></li>
  <li><b>Greymoor, by Halfway Home (Act 1).</b> The corridor next to the tavern has a good row of enemies: about 50 rosaries in half a minute, but it is riskier. <button class="tgo" onclick="moveTo('b_hh')">Show the bench</button></li>
  <li><b>Songclave towards the High Halls (Act 2).</b> The big enemies in this hallway drop a lot, but take a while to beat. The Songclave bench is right behind you if it goes wrong. <button class="tgo" onclick="moveTo('scBench')">Show the bench</button></li>
  <li><b>Outside the Grand Bellway (Act 2).</b> Run left from the bench, beat the two enemies, come back: about 29 rosaries in a few seconds. <button class="tgo" onclick="moveTo('gbBench')">Show the bench</button></li>
  <li><b>Western Choral Chambers (Act 3).</b> A group of four void-touched enemies near the western bench gives about 70 to 80 a round if you bunch them together.</li></ul>
  <div class="tsub">Things to sell</div>`
  +tg("nScrounge","Buys the relics you find (scrolls, cylinders, effigies and so on).")
  +tg("druid","Buys Mossberries you have left over.")
  +`<p class="tnote">Wishes pay too: delivery wishes pay rosaries, and some wishes give a whole necklace.</p>
  <div class="tsub">Tools that bring in more</div>`
  +tl("brooch","Pulls dropped rosaries towards you, so none roll into spikes. Cheap and useful from the very start.")
  +tl("dice","Worn together with the Magnetite Brooch, rosaries fly to you sooner.")
  +tl("thief","Enemies drop more rosaries, but you lose a few every time you get hit. Only for stretches you already know well.")
  +tl("snitch","Hitting an enemy with Clawline shakes rosaries and shards out of it early."));

 h+=tsec("shards","🦴","More shell shards",IT.filter(i=>isShard(i)&&!S.done[i.id]).length+" deposits left",
  `<p><b>Shell shards</b> are what your red tools (the ones you throw or place) are refilled with when you sit on a bench. Most enemies drop some. You can carry 400 at first, and up to 800 with Tool Pouch upgrades.</p>`
  +tipList(isShard,5)
  +tl("pend","Enemies drop 25% more shell shards.")
  +tl("snitch","Clawline hits shake shards out of enemies too.")
  +`<ul class="tul"><li><b>Shard Bundles</b> are spare shards in your pocket: a bundle holds 80 and costs 50 rosaries in shops. Break one when you run out far from home.</li>
  <li>The quickest refill is simply walking in and out of a room with easy enemies: they come back each time.</li>
  <li>If a boss eats all your shards, play a few tries without red tools instead of grinding.</li></ul>`);

 h+=tsec("dmg","🗡️","Hit harder",cntOf(i=>/^(Sharpened Needle|Needle upgrade)/.test(i.n))+" needle upgrades",
  `<p>The surest way to hit harder is a sharper needle. Pinmaster Plinney upgrades it: the first time is free, and each of the three later ones needs one Pale Oil (the last two also cost 450 and 680 rosaries). There are exactly three Pale Oils in the game, so every one counts.</p>`
  +IT.filter(i=>/^(Sharpened Needle|Needle upgrade)/.test(i.n)).map(i=>trow(i)).join("")
  +`<div class="tsub">Pale Oil</div>`+IT.filter(i=>/^Pale Oil/.test(i.n)).map(i=>trow(i)).join("")
  +`<div class="tsub">Tools that add damage</div>`
  +tl("longclaw","Your needle reaches 20% further: you hit more often and stay a little safer.")
  +tl("flint","Use it for stronger needle hits for 8 seconds: save it for when a boss is stunned.")
  +tl("pollip","Most red tools also poison, for extra damage over time.")
  +tl("qsling","Throws 2 tools at a time.")
  +tl("voltfil","Silk Skills do 25% more damage.")
  +tl("pinbadge","Needle Strike charges 40% faster.")
  +tl("barbed","25% more needle damage, but every hit on you counts double. Not for beginners."));

 h+=tsec("build","🧰","Builds: what to wear","8 full builds",
  `<p>A <b>crest</b> decides how your needle swings and how many tools you can wear. Tools come in three colours: <b>red</b> ones you throw or place (they use shell shards), <b>blue</b> ones protect or help you by themselves, <b>yellow</b> ones help with exploring and money. Change crest and tools at any bench.</p>
  <button class="tgo big" onclick="GV='build';renderDrawer();document.getElementById('db').scrollTop=0">🧰 Open the 8 builds</button>`
  +`<div class="tsub">Abilities worth getting first</div><p>Not ticked yet, and the most things on the map wait for them:</p>`
  +(()=>{const t={};IT.forEach(i=>{if(!S.done[i.id])needs(i).forEach(x=>{x.split("|").forEach(y=>{if(PW.some(p=>p[0]===y)&&!has(y))t[y]=(t[y]||0)+1})})});
    const top=Object.keys(t).sort((a,b)=>t[b]-t[a]).slice(0,5);return top.length?top.map(y=>{const i=byId(y);return `<div class="tli"><button ${i?`onclick="moveTo('${y}')"`:'disabled'}><b>${nm(y)}</b><span class="tst" style="--c:#9c36b5">${t[y]} things need it</span></button></div>`}).join(""):`<p class="tnote">You have every ability the map asks for.</p>`})());
 return h}

// ---------- "Don't miss": things that can be missed, in two kinds (data/missable.js) ----------
const missGo=m=>m.go?(m.go[0]==="it"?`moveTo('${m.go[1]}')`:m.go[0]==="g"?`moveToGroup('${m.go[1]}')`:`closeDrawer();showGate('${m.go[1]}')`):"";
const missOf=(kind,id)=>MISS.find(m=>m.go&&m.go[0]===kind&&m.go[1]===id);
// the warning line on a pin's own card
function missLine(kind,id){const m=missOf(kind,id);if(!m||(m.done&&S.done[m.done]))return"";
 return `<div class="mwarn ${m.c}">⚠️ <b>${m.c==="gone"?"Can be missed for good":"Can be missed here"}.</b> ${m.till} ${m.t}${m.later?" <i>Still possible later: "+m.later+"</i>":""}</div>`}
function missCard(m){const dn=m.done&&S.done[m.done];
 return `<div class="mcard ${m.c} ${dn?'d':''}"><b>${dn?"✓ ":""}${m.n}</b>${dn?'<span class="mok">You have it</span>':''}<p class="mt">⏰ <b>Until:</b> ${m.till}</p><p>${m.t}</p>${m.later?`<p class="ml8">✅ <b>Still possible later:</b> ${m.later}</p>`:""}${m.go?`<button class="tgo" onclick="${missGo(m)}">Show on the map</button>`:""}</div>`}
function missTab(){const a=MISS.filter(m=>m.c==="gone"),b=MISS.filter(m=>m.c==="later");
 return `<div class="shead"><b>Things you can miss</b><small>Silksong lets you miss a few things if you move on too fast. This page lists them in two kinds, so you know which ones really matter. The same warning is shown on the pin's own card.</small></div>
 <h3>🔴 Gone for good <small>(${a.length})</small></h3><p class="tnote">Once the moment has passed, there is no way to get these on the same save.</p>${a.map(missCard).join("")}
 <h3>🟠 Missable here, but you can still get it later <small>(${b.length})</small></h3><p class="tnote">The first chance goes away, but the thing itself turns up somewhere else, sometimes for a higher price.</p>${b.map(missCard).join("")}
 <p class="tnote">Know one that is not on this list? Tell us with the ⚠ button on any card.</p>`}

// ---------- Builds page (data/builds.js) ----------
let BSORT="",BOPEN=null;
function buildHave(B){const ids=[B.crest,...B.skill.map(x=>x[0]),...B.red.map(x=>x[0]),...B.blue.map(x=>x[0]),...B.yellow.map(x=>x[0])].filter(id=>byId(id)&&!(B.id==="hunter"&&id===B.crest));return[ids.filter(id=>S.done[id]).length,ids.length]}
const bBars=B=>`<div class="bbars">${BUILD_R.map(([k,l])=>`<div class="bbar${BSORT===k?' on':''}"><span>${l}</span><i role="img" aria-label="${B.r[k]} out of 5"><b style="width:${B.r[k]*20}%"></b></i><em>${B.r[k]}</em></div>`).join("")}</div>`;
const bSlot=(B,k,name,cls)=>B[k].length?`<div class="tsub ${cls}">${name}</div>`+B[k].map(x=>tl(x[0],x[1])).join(""):"";
function buildCard(B){const open=BOPEN===B.id,hv=buildHave(B);
 return `<div class="bcard${open?' open':''}"><button class="bhead" aria-expanded="${open}" onclick="BOPEN=BOPEN==='${B.id}'?null:'${B.id}';renderDrawer()"><span class="bic">${B.ic}</span><span class="bt"><b>${B.n}</b><small>${B.kind} · ${B.crestN.replace(/ \(.*/,"")}</small></span><i aria-hidden="true">${open?'▾':'▸'}</i></button>
  <p class="bsum">${B.sum}</p><div class="btags">${B.tags.map(x=>`<span>${x}</span>`).join("")}</div>${bBars(B)}
  ${open?`<div class="bbody"><p class="tnote">🕒 <b>When:</b> ${B.act}. You have <b>${hv[0]} of ${hv[1]}</b> pieces ticked.</p>
   <div class="tsub">How it works</div><ol class="bhow">${B.how.map(x=>`<li>${x}</li>`).join("")}</ol>
   <div class="tsub">Crest</div>${B.id==="hunter"?`<div class="tli"><button onclick="moveToGroup('eva')"><b>Hunter Crest</b><span class="tst" style="--c:${COL.done}">✓ You start with it</span></button><p>Eva upgrades it twice. Tap to see where she is.</p></div>`:tl(B.crest,"The crest this build is made around.")}
   ${bSlot(B,"skill",B.skill.length>1?"Silk Skills":"Silk Skill","")}${bSlot(B,"red","Red tools (thrown or placed)","tsr")}${bSlot(B,"blue","Blue tools (work by themselves)","tsb")}${bSlot(B,"yellow","Yellow tools (help and explore)","tsy")}${bSlot(B,"extra","Swaps and extra slots","")}
   <p class="bgood">👍 <b>Good for:</b> ${B.good}</p><p class="bbad">👎 <b>Weak at:</b> ${B.bad}</p></div>`:`<button class="tgo" onclick="BOPEN='${B.id}';renderDrawer()">Tools and how to play it</button>`}</div>`}
function buildsTab(){const list=BSORT?BUILDS.slice().sort((a,b)=>b.r[BSORT]-a.r[BSORT]):BUILDS;
 return `<div class="shead"><b>Builds</b><small>A build is a crest, a Silk Skill and a set of tools that fit together. Each one below fits the real slots of its crest. The bars show what it is good at (5 is best). They are our own estimates.</small></div>
 <div class="tsub">Show the best first for…</div><div class="bsort">${[["","Any"],...BUILD_R].map(([k,l])=>`<button class="${BSORT===k?'on':''}" onclick="BSORT='${k}';renderDrawer()">${l}</button>`).join("")}</div>
 ${list.map(buildCard).join("")}
 <p class="tnote">Some slots on a crest start locked: Memory Lockets open them. Eva's Vesticrest later adds one more yellow slot, and then one more blue slot, to every crest.</p>`}
