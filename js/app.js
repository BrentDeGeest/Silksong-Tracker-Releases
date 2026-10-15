const IMG="img/map.jpg",W=4843,H=3633;
const COL={red:"#e03131",orange:"#f08c00",green:"#2f9e44",done:"#868e96"};let NPCC="#1c7c8c";
const LB={green:"Available now",orange:"Via pogo / skip",red:"Blocked",done:"Collected"};
const WIKI=p=>"https://hollowknight.wiki/w/"+p;

// ---------- abilities & progress flags ----------
const PW=[["spear","Silkspear"],["swift","Swift Step"],["drift","Drifter's Cloak"],["cling","Cling Grip"],["needo","Needolin"],["claw","Clawline"],["fay","Faydown Cloak"],["soar","Silk Soar"]];
const KEYS=[["skey","Simple Key"],["wkey","White Key"],["surgk","Surgeon's Key"],["archk","Architect's Key"]];
const FLAGS=[["widow","Beat Widow (Bellhart freed)"],["rebirth","Finished Greyroot's Rite of Rebirth"],["act2","Reached Act 2 (the Citadel)"],["act3","Reached Act 3"]];





// ---------- state ----------
let S={done:{},have:{},alt:{},pos:{},areas:null,hideDone:false,marks:{}};
try{const raw=localStorage.getItem("ss5");if(raw)Object.assign(S,JSON.parse(raw));else{const o=JSON.parse(localStorage.getItem("bb4")||"{}");if(o.done)S.done=o.done;if(o.have)S.have=o.have;if(o.alt)S.alt=o.alt;}}catch(e){}
if(!S.areas){let returning=!!(Object.keys(S.done).length||Object.keys(S.have).length);try{if(localStorage.getItem("ss5"))returning=true}catch(e){}S.areas={};(returning?ROUTE:DEF_AREAS).forEach(a=>S.areas[a]=1);S._init=1}
// Progress is keyed by item id. Item ids are kept stable across app updates so saved progress always carries over.
if(!S.marks)S.marks={};
const CITA=["gate", "cchor", "chall", "ccog", "ccrad", "cmem", "csong", "cvault", "cward", "cunder", "organ"];
// Entries merged into another id (duplicates): a tick on the old id carries over to the one that stays.
const MERGED={fleaWT:"uwFlea2",b_sl3:"b_sl1",csc99:"songpass",a1g763:"crawl"};
function migCit(){if(S.areas&&S.areas.citadel){CITA.forEach(a=>S.areas[a]=1);delete S.areas.citadel}
 Object.keys(MERGED).forEach(o=>["done","alt","open"].forEach(k=>{if(S[k]&&S[k][o]){S[k][MERGED[o]]=S[k][o];delete S[k][o]}}))}
migCit();
if(!S.nav1){S.nav1=1;if(S.off)delete S.off.rest}
if(S.hideRest){S.off=S.off||{};S.off.rest=1;delete S.hideRest}
const localSave=()=>{try{localStorage.setItem("ss5",JSON.stringify(S))}catch(e){}};
function save(stamp=true){if(stamp)S.t=Date.now();localSave();queueCloud()}
if(S._init){delete S._init;localSave()}
// ---------- cloud sync (Claude account, private per person) ----------
let cloudRef=null,cloudBusy=false,cloudDirty=false,cloudTimer=null,sync="local";
function queueCloud(){if(!cloudRef)return;cloudDirty=true;clearTimeout(cloudTimer);cloudTimer=setTimeout(pushCloud,1500)}
async function pushCloud(){if(!cloudRef||cloudBusy||!cloudDirty)return;cloudBusy=true;cloudDirty=false;
 try{await cloudRef.set({s:JSON.stringify(S),t:S.t||0});sync="cloud"}
 catch(e){if(e&&(e.code==="invalid_argument"||e.code==="revoked"||e.code==="not_granted"))cloudRef=null;sync=cloudRef?"retry":"local";if(cloudRef)cloudDirty=true}
 cloudBusy=false;if(cloudDirty)queueCloud();syncUI()}
function syncUI(){const el=document.getElementById("syncl");if(el)el.innerHTML="<small>"+syncText()+"</small>"}
function syncText(){return sync==="cloud"?"☁️ Synced to your Claude account. Your progress follows you to any device and survives every app update.":sync==="retry"?"☁️ Couldn't reach the cloud just now; will retry. Progress is safe on this device.":"📱 Saved on this device. It survives app updates on this link. Use a backup code to move it to another device."}
(async()=>{try{
 if(!window.claude||!claude.use)return;
 const [db,user]=await Promise.all([claude.use("db"),claude.use("user")]);if(!db||!user)return;
 const id=await user.id();if(!id)return;
 const ref=db.doc("data/users/"+id+"/progress");const snap=await ref.get();cloudRef=ref;sync="cloud";
 const hasLocal=Object.keys(S.done).length||Object.keys(S.have).length;
 if(snap.exists){const d=snap.data()||{};let remote=null;try{remote=JSON.parse(d.s)}catch(e){}
  if(remote&&(remote.t||0)>=(S.t||0)){S=Object.assign({done:{},have:{},alt:{},pos:{},areas:{},hideDone:false,marks:{}},remote);migCit();localSave();fogKey="";refresh()}
  else if(hasLocal){cloudDirty=true;pushCloud()}}
 else if(hasLocal){cloudDirty=true;pushCloud()}
 syncUI();
}catch(e){cloudRef=null;sync="local";syncUI()}})();
// ---------- backup codes ----------
function backupCode(){return btoa(unescape(encodeURIComponent(JSON.stringify(S))))}
function copyBackup(){const c=backupCode();try{navigator.clipboard.writeText(c)}catch(e){}document.getElementById("bk").innerHTML=`<textarea readonly onclick="this.select()">${c}</textarea><small>Copied. Paste it somewhere safe, or into "Restore" on another device.</small>`}
function restoreBackup(){const v=(document.getElementById("rin").value||"").trim();if(!v)return;try{const o=JSON.parse(decodeURIComponent(escape(atob(v))));if(!o||typeof o.done!=="object")throw 0;if(!confirm("Replace your current progress with this backup?"))return;S=Object.assign({done:{},have:{},alt:{},pos:{},areas:{},hideDone:false,marks:{}},o);migCit();save();fogKey="";refresh();alert("Progress restored.")}catch(e){alert("That code doesn't look right. Copy the whole code and try again.")}}

const byId=id=>IT.find(i=>i.id===id);
// Things you collect several of. A chip like "Craftmetal" lists every place to get one.
const RES={craft:{n:"Craftmetal",f:i=>i.t==="craft",d:"Crafting material. Several tools cost one each."},
 berry:{n:"Mossberries",f:i=>i.gl==="berry",d:"Wish ingredient for the Moss Druid. Some grow in the open, others are carried by Aknids you have to kill."},
 pollip:{n:"Pollip Hearts",f:i=>i.n==="Pollip Heart",c:6,d:"Break the big bud on a purple Pollip flower. Greyroot wants 6."},
 plasm:{n:"Plasmium",f:i=>i.id.startsWith("pl")&&i.t==="quest",d:"Glowing blue buds in the Wormways. Stab them with a fully charged Needle Phial."},
 flint:{n:"Flintbeetles",f:i=>i.id.startsWith("fbeetle"),c:3,d:"Three Flintbeetles burrow into the Marrow's walls once you've taken the wish (after reaching Greymoor or Shellwood). The third one has two possible spots."},
 hoker:{n:"Spine Cores",f:i=>i.id==="hoker",d:"Hit Hokers to make them drop cores. The Seamstress wants 25."},
 throw:{n:"A throwing tool",f:i=>["pin","tpin","longpin","curve"].includes(i.id),c:1,d:"Any one of these lets you play Loddie's pin-throwing game."},
 flea:{n:"Lost fleas",f:i=>i.t==="flea",c:5,d:"Save 5 fleas to move the Flea Caravan and get the Flea Brew."},
 flea12:{n:"12 lost fleas",f:i=>i.t==="flea",c:12,d:"Save 12 fleas. After the Last Judge, the Flea Caravan then moves up to the Grand Gate."},
 cog:{n:"Cogheart Pieces",f:i=>i.n==="Cogheart Piece",c:3,d:"Find all 3 to wake the Second Sentinel (Final Audience wish)."},
 melody:{n:"The Threefold Melody",f:i=>["ballador","archMelody","cardinius"].includes(i.id),d:"Three melodies that move the lift to the Cradle: Conductor's (High Halls), Architect's (Cogwork Core) and Vaultkeeper's (Whispering Vaults)."}};
const wById=id=>WISH.find(w=>w.id===id);
function objSt(w,j){const o=w.o[j],v=(S.wc||{})[w.id+"."+j];
 if(o.k==="i")return{ok:has(o.id)};if(o.k==="a")return{ok:!!S.areas[o.a]};
 if(o.k==="r"){const n=Math.min(resDone(o.r),o.c);return{ok:n>=o.c,n,c:o.c}}
 if(o.k==="n"){const n=Math.min(+v||0,o.c);return{ok:n>=o.c,n,c:o.c}}
 return{ok:!!v}}
const wDone=w=>!!(S.wd||{})[w.id]||(w.rw?w.rw.every(has):w.o.every((o,j)=>objSt(w,j).ok));
const wOpen=w=>(w.need||[]).every(req);
const wSt=w=>wDone(w)?"done":wOpen(w)?"open":"locked";
const wArea=w=>{const a=w.at;if(a.startsWith("A:"))return a.slice(2);if(a.startsWith("G:"))return G[a.slice(2)].a;return areaOf(byId(a))};
const WCOL={done:"#5c5f66",open:"#9c36b5",locked:"#c92a2a"},WLB={done:"Done",open:"To do",locked:"Not available yet"};
const wProg=w=>w.o.filter((o,j)=>objSt(w,j).ok).length;
const wProgTxt=w=>{if(w.o.length===1&&w.o[0].c){const t=objSt(w,0);return t.n+'/'+t.c}return wProg(w)+'/'+w.o.length};
const resItems=r=>IT.filter(RES[r].f);
const resDone=r=>resItems(r).filter(i=>S.done[i.id]).length;
const has=id=>{if(id.startsWith("O:"))return!!(S.open||{})[id.slice(2)];if(id.startsWith("R:")){const r=id.slice(2);return resDone(r)>=(RES[r].c||resItems(r).length)}if(id.startsWith("G:"))return gst(id.slice(2))==="done";if(id==="widow"&&S.done.needo)return true;if(id.startsWith("A:"))return!!S.areas[id.slice(2)];if(id.startsWith("W:")){const w=wById(id.slice(2));return!!w&&wDone(w)}return!!(S.have[id]||S.done[id])};
const req=n=>n.split("|").some(has);
const nm1=id=>{if(id.startsWith("W:")){const w=wById(id.slice(2));return"Finish "+(w?w.n:"a wish")}if(id.startsWith("O:")){const g=GATES.find(x=>x.id===id.slice(2));return"Open "+(g?g.n:"it")+" from the other side"}if(id.startsWith("R:"))return RES[id.slice(2)].n;if(id.startsWith("G:"))return G[id.slice(2)].n;if(id.startsWith("A:")){const a=AREAS.find(x=>x.id===id.slice(2));return"Reach "+(a?a.n:id)}const p=[...PW,...KEYS,...FLAGS].find(p=>p[0]===id);if(p)return p[1];const i=byId(id);return i?(i.t==="boss"?"Beat ":"")+i.n:id};
const nm=id=>id.split("|").map(nm1).join(" or ");
const needs=i=>[...(i.g&&G[i.g].need||[]),...(i.need||[])];
const areaOf=i=>i.g?G[i.g].a:i.a;
const vis=i=>!!S.areas[areaOf(i)];
const REST=i=>i.t==="bench"||i.t==="bellway"||i.t==="tube";
const QUEST=i=>i.t==="quest";
const CATS=[["power","✦ Power-ups & crests"],["boss","💀 Bosses"],["upg","🎭 Upgrades & tools"],["coll","📿 Collectibles"],["quest","🌸 Quest pickups"],["rest","🪑 Benches & fast travel"],["blk","🧱 Walls, doors & shortcuts"],["extra","🪙 Deposits & map seller"]];
const catOf=i=>kindOf(i).k; // map layers use the same categories as the checklist
const layerOn=c=>!(S.off||{})[c];
const cnt=i=>vis(i)&&!REST(i)&&!QUEST(i)&&i.t!=="extra";
// ---------- difficulty meter (ratings in data/difficulty.js) ----------
const DIFFL=["","Easy","Moderate","Tricky","Hard","Very hard"],DIFFC=["","#2f9e44","#74b816","#f08c00","#e8590c","#e03131"];
const DIFF_T=["boss","crest","power","rosary","misc","spool","mask","tool","craft","key","locket","flea","quest"];
// Pickups without their own rating: the fight in front of them, else what their text says about the way there.
function diffAuto(i){if(!DIFF_T.includes(i.t)||i.price||(i.g&&G[i.g]&&G[i.g].gl==="shop"))return 0;
 let d=0;try{itemLocks(i).forEach(g=>{if(DIFF.gate[g.id])d=Math.max(d,DIFF.gate[g.id])})}catch(e){}
 const t=(i.h||"")+" "+(i.tip||"");
 if(/gauntlet|arena|ambush|boss/i.test(t))d=Math.max(d,3);
 else if(/parkour|platforming|spikes|saws?\b|timed|race|precise|tricky|careful|moving platform|lava|thorns|pogo|updraft|wind\b|crumbl|chase/i.test(t))d=Math.max(d,2);
 return d||1}
function diffBase(kind,id){if(kind==="area")return DIFF.area[id]||0;if(kind==="wish")return DIFF.wish[id]||0;if(kind==="gate")return DIFF.gate[id]||0;
 const i=byId(id);return i?(DIFF.it[id]||diffAuto(i)):0}
// Things that change a rating once you have them: [what, change, why]. "what" is an ability, key, flag or item id (a|b = either).
function diffMods(kind,id){return((DIFF.mod||{})[kind]||{})[id]||[]}
function diffOf(kind,id){const b=diffBase(kind,id);if(!b)return 0;let d=b;diffMods(kind,id).forEach(m=>{if(req(m[0]))d+=m[1]});return Math.max(1,Math.min(5,d))}
function diffPips(d){return `<span class="dfp" style="--c:${DIFFC[d]}" aria-hidden="true">${[1,2,3,4,5].map(n=>`<i class="${n<=d?'on':''}"></i>`).join("")}</span>`}
function diffRow(kind,id,what){const d=diffOf(kind,id);if(!d)return"";const b=diffBase(kind,id);
 const ms=diffMods(kind,id).map(m=>{const on=req(m[0]),easier=m[1]<0,nmz=m[0].split("|").map(nm).join(" or ");
  return `<li class="${on?'on':''}"><span aria-hidden="true">${easier?'▼':'▲'}</span> ${on?(easier?'Easier':'Harder')+' because you have':(easier?'Gets easier with':'Gets harder with')} <b>${nmz}</b>${m[2]?': '+m[2]:''}</li>`}).join("");
 return `<div class="dfr" role="img" aria-label="Difficulty: ${DIFFL[d]}, ${d} out of 5"><span>${what||'Difficulty'}</span>${diffPips(d)}<b style="color:${DIFFC[d]}">${DIFFL[d]}</b>${d!==b?`<small>(${DIFFL[b]} without)</small>`:''}</div>${ms?`<ul class="dfm">${ms}</ul>`:''}`}
function st(i){if(S.done[i.id])return"done";if(needs(i).every(req))return"green";return"red"}
const kids=g=>IT.filter(i=>i.g===g);
function gst(g){if(!kids(g).length)return (G[g].need||[]).every(req)?"green":"red";const s=kids(g).map(st);return s.every(x=>x==="done")?"done":s.includes("green")?"green":s.includes("orange")?"orange":"red"}
const gp=g=>S.pos[g]||G[g].p;
const pos=i=>S.pos[i.id]||i.p;

// ---------- glyphs ----------
const GL={
spear:'<path d="M4 20L17 7M13 4h7v7"/>',dash:'<path d="M3 12h9M5 8h7M5 16h7M14 6l6 6-6 6"/>',
bell:'<path d="M6 17h12M8 17c0-6 1-9 4-9s4 3 4 9M12 6V4M10 19a2 2 0 004 0"/>',
rs:'<circle cx="12" cy="11" r="6" stroke-dasharray="0.5 3.2" stroke-width="3.4"/><path d="M12 17v4"/>',
mask:'<path d="M5 6c4-3 10-3 14 0l-3 12-4 3-4-3z M12 6v6l3 3"/>',pouch:'<path d="M8 8h8l2 10H6z M9 8c0-2 6-2 6 0"/>',
magnet:'<path d="M7 4v8a5 5 0 0010 0V4 M7 8h3 M14 8h3"/>',key:'<circle cx="8" cy="8" r="3.5"/><path d="M10.5 10.5L19 19M15.5 15.5l2.5-2.5M13 13l2-2"/>',
spool:'<path d="M7 5h10M7 19h10M9 5v14M15 5v14M9 9l6 2M9 13l6 2"/>',pend:'<path d="M12 3v5M12 8l5 5-5 8-5-8z"/>',
scroll:'<path d="M7 5h10v12a2 2 0 01-2 2H7z M9 9h6M9 12h6"/>',pin:'<circle cx="17" cy="7" r="2.5"/><path d="M15.2 8.8L5 19"/>',
crest:'<path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z"/>',locket:'<circle cx="12" cy="14" r="6"/><path d="M9 8l3-5 3 5"/>',
effigy:'<circle cx="12" cy="6" r="3"/><path d="M7 21l2-9h6l2 9z"/>',
skull:'<path d="M6 12a6 6 0 1112 0v3h-2v3h-2v-2h-4v2H8v-3H6z"/><circle cx="9.5" cy="11.5" r="1"/><circle cx="14.5" cy="11.5" r="1"/>',
shop:'<path d="M4 9l2-5h12l2 5M5 9v11h14V9M9 20v-6h6v6"/>',eye:'<path d="M3 12s4-6 9-6 9 6 9 6-4 6-9 6-9-6-9-6z"/><circle cx="12" cy="12" r="2.5"/>',
craft:'<path d="M6 8l6-4 6 4v8l-6 4-6-4z"/>',flea:'<circle cx="12" cy="13" r="5"/><path d="M8 9L5 5M16 9l3-4M7 17l-3 3M17 17l3 3"/>',
wish:'<path d="M5 4h14v16H5z M8 8h8M8 12h8M8 16h5"/>',anvil:'<path d="M4 8h12c0 3 2 4 4 4v2H8l-2 3h8 M4 8l2 4"/>',
target:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/>',lace:'<path d="M5 19L19 5M5 5l14 14"/>',
flint:'<path d="M5 18l4-12 4 6 2-4 4 10z"/>',cloak:'<path d="M12 3l-7 17h14z M9 12h6"/>',storm:'<path d="M12 12m-2 0a2 2 0 104 0a2 2 0 10-4 0 M12 4a8 8 0 018 8 M20 12a8 8 0 01-8 8 M12 20a8 8 0 01-8-8 M4 12a8 8 0 018-8"/>',claw:'<path d="M7 20V9a3 3 0 016 0v4M13 13V7a3 3 0 016 0v13"/>',bench:'<path d="M4 11h16M5 11V8h14v3M6 11v7M18 11v7"/>',bellway:'<path d="M7 16h10M8 16c0-5 1.5-8 4-8s4 3 4 8M12 6V4M5 20h14"/>',tube:'<rect x="4" y="8" width="16" height="8" rx="4"/><path d="M9 8v8M15 8v8"/>',flower:'<circle cx="12" cy="12" r="2.5"/><path d="M12 4v5M12 15v5M4 12h5M15 12h5"/>',berry:'<circle cx="9" cy="14" r="4"/><circle cx="15" cy="14" r="4"/><path d="M12 10V5l3-1"/>',drop:'<path d="M12 4c3 5 6 8 6 11a6 6 0 01-12 0c0-3 3-6 6-11z"/>',silk:'<path d="M5 6c6 0 8 3 7 6s1 6 7 6 M5 12c3 0 5 1 6 3"/>',map:'<path d="M4 6l5-2 6 2 5-2v14l-5 2-6-2-5 2z M9 4v14M15 6v14"/>'};
const glyph=(k,x,y,s=.58,c="#fff")=>`<g transform="translate(${x-12*s},${y-12*s}) scale(${s})" fill="none" stroke="${c}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" pointer-events="none">${GL[k]}</g>`;

// ---------- map / pan-zoom ----------
const svg=document.getElementById("map");
function fogURL(){
 const k=16,c=document.createElement("canvas");c.width=Math.ceil(W/k);c.height=Math.ceil(H/k);const x=c.getContext("2d");
 x.fillStyle="rgba(8,6,5,.93)";x.fillRect(0,0,c.width,c.height);
 x.globalCompositeOperation="destination-out";try{x.filter="blur(2px)"}catch(e){}
 x.fillStyle="#000";AREAS.filter(a=>S.areas[a.id]).forEach(a=>a.r.forEach(r=>{x.fillRect(r[0]/k,r[1]/k,(r[2]-r[0])/k,(r[3]-r[1])/k)}));
 return c.toDataURL();
}
let fogKey="";
function drawFog(){const key=AREAS.map(a=>S.areas[a.id]?1:0).join("");if(key===fogKey)return;fogKey=key;document.getElementById("fogimg").setAttribute("href",fogURL())}
function unlockArea(id){if(moved>=8)return;S.areas[id]=1;save();refresh()}
svg.innerHTML=`<image href="${IMG}" width="${W}" height="${H}"/><image id="fogimg" width="${W}" height="${H}" preserveAspectRatio="none" style="pointer-events:none"/><g id="fogl"></g><g id="o"></g>`;
const HOME=[1020,2330,400,420];let vb=HOME.slice();
function setVB(){svg.setAttribute("viewBox",vb.join(" "));const s=sc();if(!lastS||Math.abs(s/lastS-1)>.02||ovOn(s)!==ovOn(lastS)){if(!drawQ)drawQ=requestAnimationFrame(()=>{drawQ=0;drawOv()})}}
const sc=()=>Math.max(vb[2]/svg.clientWidth,vb[3]/svg.clientHeight);
function zoom(f,cx,cy){const nw=Math.min(W*1.2,Math.max(110,vb[2]*f)),r=nw/vb[2];const px=cx??vb[0]+vb[2]/2,py=cy??vb[1]+vb[3]/2;vb=[px-(px-vb[0])*r,py-(py-vb[1])*r,nw,vb[3]*r];setVB()}
const toW=(cx,cy)=>{const b=svg.getBoundingClientRect(),s=sc(),ox=(b.width-vb[2]/s)/2,oy=(b.height-vb[3]/s)/2;return[vb[0]+(cx-b.left-ox)*s,vb[1]+(cy-b.top-oy)*s]};
const P=new Map();let moved=0,drag=null,edit=false;
svg.addEventListener("pointerdown",e=>{P.set(e.pointerId,[e.clientX,e.clientY]);moved=0;try{svg.setPointerCapture(e.pointerId)}catch(_){}
 clearTimeout(lpT);if(P.size===1&&!dragMk&&!drag&&!placing&&!pickHere&&!e.target.closest(".ic,.mk,.unl,.arl")){const cx=e.clientX,cy=e.clientY;lpT=setTimeout(()=>{if(P.size===1&&moved<8){moved=99;const w=toW(cx,cy);dropMarker(w[0],w[1])}},550)}});
svg.addEventListener("pointermove",e=>{
 if(!P.has(e.pointerId))return;
 if(dragMk&&S.marks[dragMk]){const w=toW(e.clientX,e.clientY);const m=S.marks[dragMk];m.x=Math.round(w[0]-dragOff[0]);m.y=Math.round(w[1]-dragOff[1]);moved+=9;drawOv();return}
 if(drag){const w=toW(e.clientX,e.clientY);S.pos[drag]=[Math.round(w[0]),Math.round(w[1])];moved+=9;drawOv();return}
 const o=P.get(e.pointerId);
 if(P.size===1){const s=sc();vb[0]-=(e.clientX-o[0])*s;vb[1]-=(e.clientY-o[1])*s;moved+=Math.abs(e.clientX-o[0])+Math.abs(e.clientY-o[1]);P.set(e.pointerId,[e.clientX,e.clientY]);setVB()}
 else{const a=[...P.values()],d0=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]);P.set(e.pointerId,[e.clientX,e.clientY]);const b=[...P.values()],d1=Math.hypot(b[0][0]-b[1][0],b[0][1]-b[1][1]);moved+=9;if(d0>0&&d1>0){const w=toW((b[0][0]+b[1][0])/2,(b[0][1]+b[1][1])/2);zoom(d0/d1,w[0],w[1])}}
});
const up=e=>{P.delete(e.pointerId);clearTimeout(lpT);if(drag){drag=null;save()}if(dragMk){dragMk=null;save()}};
svg.addEventListener("pointerup",up);svg.addEventListener("pointercancel",up);
svg.addEventListener("wheel",e=>{e.preventDefault();const w=toW(e.clientX,e.clientY);zoom(e.deltaY>0?1.15:.87,w[0],w[1])},{passive:false});
svg.addEventListener("click",e=>{if(placing&&moved<8){e.stopImmediatePropagation();e.preventDefault();const w=toW(e.clientX,e.clientY);setPlacing(false);dropMarker(w[0],w[1])}},true);
svg.addEventListener("click",e=>{if(pickHere&&moved<8){e.stopImmediatePropagation();e.preventDefault();const w=toW(e.clientX,e.clientY);hereFromMap(w[0],w[1])}},true);
svg.addEventListener("contextmenu",e=>{e.preventDefault();if(e.target.closest(".ic,.mk"))return;clearTimeout(lpT);moved=99;const w=toW(e.clientX,e.clientY);dropMarker(w[0],w[1])});
svg.addEventListener("click",e=>{if(e.defaultPrevented||pickHere)return;document.getElementById("lpop").classList.remove("on");if(moved<8&&!e.target.closest(".ic,.mk")){openG=null;openC=null;closeSheet();drawOv()}});
document.getElementById("zi").onclick=()=>zoom(.65);document.getElementById("zo").onclick=()=>zoom(1.5);
document.getElementById("zh").onclick=()=>{vb=HOME.slice();setVB()};document.getElementById("za").onclick=()=>{vb=[0,0,W,H];setVB()};

let sel=null,openG=null;
function iconDown(e,id){if(!edit)return;e.stopPropagation();if(byId(id)&&byId(id).g)return;drag=id;P.set(e.pointerId,[e.clientX,e.clientY]);try{svg.setPointerCapture(e.pointerId)}catch(_){}}
function tapItem(id){if(moved>=8)return;selMk=null;sel=id;openC=null;showItem(id);drawOv()}
let backC=null;
function tapGroup(g){if(moved>=8)return;gFrom=null;backC=(openC!==null&&sheet.classList.contains('up'))?openC:null;openG=g;openC=null;sel=null;selMk=null;showGroup(g);drawOv()}
function goBack(){const c=CL[backC];openG=null;openC=backC;backC=null;if(c)showCluster(c);else closeSheet();drawOv()}

// ---------- map drawing: constant-size icons that never overlap ----------
// Icons keep the same size on screen at every zoom. Where icons would collide, they sit side by side
// in a small row (thin lines point to their real spots). Where it's too busy for that, they fold into
// one numbered bubble that opens a simple list, like the shop menus.
let R_PX=11,GAP_PX=31;const FAN_MAX=6;
let CL=[],openC=null,lastS=0,drawQ=0;
const ORDER={green:0,orange:1,red:2,done:3};
function markers(){
 const M=[];
 Object.keys(G).forEach(k=>{const g=G[k],fl=flash&&flash.key===k;if(!fl&&!S.areas[g.a])return;const ks=kids(k);if(!fl&&(g.shop?!layerOn("shop"):ks.length?!ks.some(itemOn):!(g.npc&&layerOn("npc"))))return;const s=gst(k);if(!fl&&S.hideDone&&s==="done")return;const c=gp(k);M.push({key:k,grp:k,x:c[0],y:c[1],s,pr:3})});
 IT.forEach(i=>{const fl=flash&&flash.key===i.id;if(REST(i)&&(i.t==="bench"||i.t==="tube")&&sc()>2.2&&!fl&&!(R&&R.res&&R.res.st&&R.res.st.i.id===i.id))return;if(i.g||(!fl&&(!vis(i)||!itemOn(i))))return;const s=st(i);if(!fl&&S.hideDone&&s==="done"&&!(i.t==="boss"&&bossT(i)!=="side"))return;const p=pos(i);M.push({key:i.id,it:i,x:p[0],y:p[1],s,pr:REST(i)?4:(i.t==="power"||i.t==="boss"||i.t==="crest")?2:QUEST(i)?0:1})});
 return M;
}
const half=c=>{const n=c.m.length;return n===1?[R_PX+3,R_PX+3]:n<=4?[n*GAP_PX/2+2,R_PX+6]:n<=FAN_MAX?[3*GAP_PX/2+2,GAP_PX]:[19,19]};
function cluster(M,s){
 const C=[];
 if(edit){M.forEach(m=>C.push({x:m.x,y:m.y,m:[m]}));return C}
 const D=GAP_PX*s;
 M.slice().sort((a,b)=>b.pr-a.pr).forEach(m=>{let best=null,bd=D;C.forEach(c=>{const d=Math.hypot(c.x-m.x,c.y-m.y);if(d<bd){bd=d;best=c}});if(best){best.m.push(m)}else C.push({x:m.x,y:m.y,m:[m]})});
 for(let guard=0;guard<60;guard++){
  C.forEach(c=>{c.x=c.m.reduce((t,m)=>t+m.x,0)/c.m.length;c.y=c.m.reduce((t,m)=>t+m.y,0)/c.m.length});
  let hit=false;
  for(let a=0;a<C.length&&!hit;a++)for(let b=a+1;b<C.length;b++){const A=half(C[a]),B=half(C[b]);
   if(Math.abs(C[a].x-C[b].x)<(A[0]+B[0]+3)*s&&Math.abs(C[a].y-C[b].y)<(A[1]+B[1]+3)*s){C[a].m.push(...C[b].m);C.splice(b,1);hit=true;break}}
  if(!hit)break}
 return C;
}
function slots(c,s){ // where each member of a small group sits: a tidy row (or two rows), ordered like the real map
 const n=c.m.length,g=GAP_PX*s;
 if(n===1)return[[c.m[0].x,c.m[0].y]];
 if(n<=4){c.m.sort((a,b)=>a.x-b.x);return c.m.map((m,j)=>[c.x+(j-(n-1)/2)*g,c.y])}
 c.m.sort((a,b)=>a.y-b.y);const top=c.m.slice(0,3).sort((a,b)=>a.x-b.x),bot=c.m.slice(3).sort((a,b)=>a.x-b.x);c.m=top.concat(bot);
 return c.m.map((m,j)=>{const row=j<3?0:1,inRow=row?bot.length:3,col=row?j-3:j;return[c.x+(col-(inRow-1)/2)*g,c.y+(row-.5)*g]});
}
function iconSVG(m,x,y,k,s){
 if(m.it&&REST(m.it))return navIcon(m.it,x,y,k,s,m.solo);
 const tg=isTgt(m)?"tgt":"";
 const sl=(m.it&&sel===m.it.id)||(m.grp&&openG===m.grp),dn=m.s==="done";
 if(m.grp){const g=G[m.grp],ks=kids(m.grp),d=ks.filter(i=>S.done[i.id]).length,guide=g.kind==="guide";
  const npc=!ks.length,fillc=npc?(m.s==="red"?COL.red:NPCC):guide&&!dn?'#5c4a8a':COL[m.s];
  return `<g class="ic ${dn?'done':''} ${sl?'sel':''} ${tg}" transform="translate(${x} ${y}) scale(${k})" onpointerdown="iconDown(event,'${m.grp}')" onclick="tapGroup('${m.grp}')"><circle r="17" fill="transparent"/><rect class="b" x="-10" y="-10" width="20" height="20" rx="${npc?10:guide?3:5}" fill="${fillc}"/>${glyph(g.gl,0,0,.5)}${stBadge(m.s)}${npc?'':`<g transform="translate(9 -9)"><rect x="-7" y="-5" width="14" height="10" rx="5" fill="#111" stroke="#fff" stroke-width=".8"/><text x="0" y="3" font-size="7" font-weight="700" text-anchor="middle" fill="#fff">${ks.length-d}</text></g>`}</g>`}
 const i=m.it,s2=m.s,pw=i.t==="power";
 if(i.t==="boss"){const r=BOSS_R[bossT(i)],q=r*.72;return `<g class="ic boss ${dn?'done':''} ${sl?'sel':''} ${tg}" transform="translate(${x} ${y}) scale(${k})" onpointerdown="iconDown(event,'${i.id}')" onclick="tapItem('${i.id}')"><circle r="${r+6}" fill="transparent"/>${bossBody(i,COL[s2],sl)}${i.tip&&!dn?`<circle cx="${q}" cy="${-q}" r="3.4" fill="#ffd43b" stroke="#000" stroke-width=".8"/>`:""}<g transform="translate(${r-9} ${r-9})">${stBadge(s2)}</g></g>`}
 const shape=REST(i)?`<rect class="b" x="-7.5" y="-7.5" width="15" height="15" rx="3" fill="${dn?COL.done:'#3b6fb5'}"/>`:QUEST(i)?`<rect class="b" x="-6.5" y="-6.5" width="13" height="13" rx="2" transform="rotate(45)" fill="${dn?COL.done:'#9c36b5'}"/>`:`<circle class="b" r="${pw?11:9}" fill="${COL[s2]}"/>`;
 const ring="";
 const tip=i.tip&&!dn?`<circle cx="8" cy="-8" r="3.2" fill="#ffd43b" stroke="#000" stroke-width=".8"/>`:"";
 return `<g class="ic ${dn?'done':''} ${sl?'sel':''} ${tg}" transform="translate(${x} ${y}) scale(${k})" onpointerdown="iconDown(event,'${i.id}')" onclick="tapItem('${i.id}')"><circle r="16" fill="transparent"/>${ring}${shape}${glyph(i.gl,0,0,pw?.55:.46)}${tip}${REST(i)||QUEST(i)?'':stBadge(s2)}</g>`;
}
function bubbleSVG(c,idx,k){
 const n=c.m.length,best=c.m.reduce((b,m)=>ORDER[m.s]<ORDER[b]?m.s:b,"done"),left=c.m.filter(m=>m.s!=="done").length;
 return `<g class="ic cl ${openC===idx?'sel':''}" transform="translate(${c.x} ${c.y}) scale(${k})" onclick="tapCluster(${idx})"><circle r="19" fill="transparent"/><circle r="14" fill="rgba(20,17,15,.92)" stroke="${COL[best]}" stroke-width="3"/><circle class="b" r="14" fill="none" stroke="none"/><text y="4" font-size="11" font-weight="800" text-anchor="middle" fill="#fff">${n}</text>${left&&best!=="done"?`<circle cx="11" cy="-11" r="4" fill="${COL[best]}" stroke="#000" stroke-width=".8"/>`:''}</g>`;
}
// ---------- area overview: zoomed far out, icons make way for big area names ----------
// Each area shows its name with "found / total" collectibles under it (same count as the checklist).
// The labels grow on screen the further you zoom out; where they would collide they shrink, and in a
// real crush the smaller area keeps only its count. Tap a name to zoom into that area.
const OV_S=2.6; // world units per screen pixel where the overview takes over (gates already hide here)
function ovOn(s){try{return s>=OV_S&&!!SET().ovw}catch(e){return false}} // safe before settings load
let ovWas=false;
function areaSplit(n){if(n.length<=13)return[n];const a=n.indexOf(" & ");if(a>0)return[n.slice(0,a),n.slice(a+1)];
 const sp=[...n.matchAll(/ /g)].map(m=>m.index);if(!sp.length)return[n];const mid=n.length/2,i=sp.reduce((b,x)=>Math.abs(x-mid)<Math.abs(b-mid)?x:b);return[n.slice(0,i),n.slice(i+1)]}
function areaLabelsSVG(s,fresh){
 const t=Math.min(1,Math.max(0,(s-OV_S)/6)),PX=15+11*t,MIN=10; // name size on screen: 15px → 26px as you zoom out
 const L=AREAS.map(a=>{const r=a.r.reduce((m,q)=>(q[2]-q[0])*(q[3]-q[1])>(m[2]-m[0])*(m[3]-m[1])?q:m);
  const its=IT.filter(i=>areaOf(i)===a.id&&COUNTED(i));
  return{a,x:(r[0]+r[2])/2,y:(r[1]+r[3])/2,ln:areaSplit(a.n),n:its.length,d:its.filter(i=>S.done[i.id]).length,open:!!S.areas[a.id],px:PX,lv:0}});
 // box in world units, centred on the area
 const box=l=>{const p=l.px*s,cw=l.n?Math.max(4,String(l.d).length+String(l.n).length+3)*.62*p*.8:0;
  const w=l.lv?cw:Math.max(cw,...l.ln.map(x=>x.length*.56*p)),h=(l.lv?0:l.ln.length*1.12*p)+(l.n?1.25*p:0);return[w/2+3*s,h/2+3*s]};
 // who gives way first: locked areas before unlocked ones, then the one with fewer collectibles
 const rank=l=>(l.open?1e4:0)+l.n;
 for(let g=0;g<400;g++){const sh=new Set(),dr=new Set();
  for(let i=0;i<L.length;i++){const A=L[i];if(A.lv>1)continue;const ba=box(A);
   for(let j=i+1;j<L.length;j++){const B=L[j];if(B.lv>1)continue;const bb=box(B);
    if(Math.abs(A.x-B.x)<ba[0]+bb[0]&&Math.abs(A.y-B.y)<ba[1]+bb[1]){
     const big=A.px!==B.px?(A.px>B.px?A:B):(rank(A)<rank(B)?A:B),small=big===A?B:A;
     if(big.px>MIN)sh.add(big);else if(small.px>MIN)sh.add(small);else dr.add(rank(A)<rank(B)?A:B)}}}
  if(!sh.size&&!dr.size)break;
  sh.forEach(l=>l.px=Math.max(MIN,l.px*.93));if(!sh.size)dr.forEach(l=>l.lv+=l.open?1:2)} // a locked area never shows a bare count
 let o="";
 L.forEach(l=>{if(l.lv>1)return;const p=l.px*s,full=l.n&&l.d===l.n,b=box(l);
  const nl=l.lv?0:l.ln.length,top=l.y-b[1]+3*s;let y=top,h="";
  for(let i=0;i<nl;i++){y+=p*1.0;h+=`<text class="arn" x="${l.x}" y="${y}" style="font-size:${p}px">${esc(l.ln[i])}</text>`;y+=p*.12}
  if(l.n){const cp=p*.72,cnt=!l.open?`🔒 ${l.n} to find`:full?`✓ ${l.d} / ${l.n}`:`${l.d} / ${l.n}`;y+=cp*1.05;
   h+=`<text class="arc" x="${l.x}" y="${y}" style="font-size:${cp}px">${cnt}</text>`;
   if(l.open){const bw=Math.min(b[0]*1.4,cp*5),bh=Math.max(2*s,cp*.18);y+=cp*.3;
    h+=`<rect class="bg" x="${l.x-bw/2}" y="${y}" width="${bw}" height="${bh}" rx="${bh/2}"/><rect class="fg" x="${l.x-bw/2}" y="${y}" width="${bw*(l.d/l.n)}" height="${bh}" rx="${bh/2}"/>`}}
  const lbl=`${l.a.n}: ${l.open?`${l.d} of ${l.n} found`:'locked'}`;
  o+=`<g class="arl${l.open?'':' lk'}${full?' full':''}${fresh?' in':''}" role="button" aria-label="${esc(lbl)}" onclick="tapAreaLabel('${l.a.id}')"><title>${esc(lbl)} · tap to zoom in</title><rect class="hit" x="${l.x-b[0]}" y="${l.y-b[1]}" width="${2*b[0]}" height="${2*b[1]}"/>${h}</g>`});
 return o;
}
function tapAreaLabel(id){if(moved>=8)return;const a=AREAS.find(x=>x.id===id);if(!a)return;
 zoomTo(a.r.flatMap(r=>[r[0],r[2]]),a.r.flatMap(r=>[r[1],r[3]]));
 if(sc()>=OV_S*.95)zoom(OV_S*.8/sc()); // always land zoomed in far enough to see the icons
}
function drawOv(){
 drawFog();
 const s=sc(),k=R_PX/9*s;lastS=s;let L="",o="",top="";const ov=ovOn(s);
 if(ov)L=areaLabelsSVG(s,!ovWas);ovWas=ov;
 if(!ov)AREAS.filter(a=>!S.areas[a.id]).forEach(a=>{const r=a.r.reduce((m,q)=>(q[2]-q[0])*(q[3]-q[1])>(m[2]-m[0])*(m[3]-m[1])?q:m),cx=(r[0]+r[2])/2,cy=(r[1]+r[3])/2;
  const fs=Math.max(38,Math.min(80,Math.min(r[2]-r[0],r[3]-r[1])*.16)),bw=fs*3.6,bh=fs*1.25,n=IT.filter(i=>areaOf(i)===a.id&&!REST(i)&&!QUEST(i)&&i.t!=="extra").length;
  L+=`<g class="fogA"><text class="fogt" x="${cx}" y="${cy-fs*.25}" style="font-size:${fs}px">${a.n}</text>${n?`<text class="fogs" x="${cx}" y="${cy+fs*.45}" style="font-size:${fs*.42}px">${n} items to find</text>`:''}
  <g class="unl" onclick="unlockArea('${a.id}')"><rect x="${cx-bw/2}" y="${cy+fs*.75}" width="${bw}" height="${bh}" rx="${bh/2}"/><text x="${cx}" y="${cy+fs*.75+bh*.66}" style="font-size:${fs*.5}px">🔓 Unlock</text></g></g>`});
 document.getElementById("fogl").innerHTML=L;
 if(s<.75&&SET().labels)LM.forEach(l=>o+=`<text class="ml lm" style="font-size:${9*s}px" x="${l[1]}" y="${l[2]}">${l[0]}</text>`);
 flashAlive();const MS=ov?markers().filter(m=>(flash&&m.key===flash.key)||(m.it&&sel===m.it.id)||(m.grp&&openG===m.grp)):markers(),FM=flash&&MS.find(m=>m.key===flash.key);
 const BM=MS.filter(m=>m!==FM&&m.it&&m.it.t==="boss");CL=cluster(MS.filter(m=>m!==FM&&!BM.includes(m)),s);let late="";let fp=null;if(flash&&(flash.key.startsWith('area:')||flash.key.startsWith('gate:')))fp=[flash.x,flash.y];
 if(openC!==null&&!CL[openC])openC=null;
 CL.forEach((c,idx)=>{
  const n=c.m.length;
  c.m.forEach(m=>m.solo=n===1);if(n>FAN_MAX){const nv=c.m.filter(m=>m.it&&REST(m.it));if(nv.length){c.m=c.m.filter(m=>!nv.includes(m));nv.forEach(m=>{m.solo=1;late+=iconSVG(m,m.x,m.y,k,s)})}if(c.m.length)o+=bubbleSVG(c,idx,k);if(flash&&c.m.some(m=>m.key===flash.key))fp=[c.x,c.y];return}
  const P=slots(c,s);
  if(n>1){const h=half(c);o+=`<rect x="${c.x-h[0]*s}" y="${c.y-h[1]*s}" width="${2*h[0]*s}" height="${2*h[1]*s}" rx="${12*s}" fill="rgba(10,8,7,.55)" stroke="rgba(255,255,255,.18)" stroke-width="${s}"/>`;
   c.m.forEach((m,j)=>{const d=Math.hypot(P[j][0]-m.x,P[j][1]-m.y);if(d>5*s)o+=`<line x1="${m.x}" y1="${m.y}" x2="${P[j][0]}" y2="${P[j][1]}" stroke="rgba(255,255,255,.5)" stroke-width="${1.2*s}"/><circle cx="${m.x}" cy="${m.y}" r="${2.4*s}" fill="#fff" stroke="#000" stroke-width="${.6*s}"/>`})}
  c.m.forEach((m,j)=>{if(flash&&m.key===flash.key)fp=[P[j][0],P[j][1]];const svgI=iconSVG(m,P[j][0],P[j][1],k,s);const isSel=(m.it&&sel===m.it.id)||(m.grp&&openG===m.grp);if(isSel){top+=svgI+`<text class="ml" style="font-size:${11*s}px" x="${P[j][0]}" y="${P[j][1]-(flash&&m.key===flash.key?58:17)*s}">${m.it?m.it.n:G[m.grp].n}</text>`}else o+=svgI});
 });
 // Bosses: bigger, and on top of whatever else is at their spot. A boss that would cover other pins sits just above them,
 // with a thin line to its real spot. Biggest (must beat) first, so they get the best place.
 const BP=[];BM.sort((a,b)=>BOSS_R[bossT(b.it)]-BOSS_R[bossT(a.it)]).forEach(m=>{const r=BOSS_R[bossT(m.it)]*k;let x=m.x,y=m.y;
  const hit=CL.find(c=>{if(!c.m.length)return false;const h=half(c);return Math.abs(x-c.x)<h[0]*s+r&&Math.abs(y-c.y)<h[1]*s+r});
  if(hit){x=hit.x;y=hit.y-half(hit)[1]*s-r-2*s}
  for(let g=0;g<8&&BP.some(q=>Math.hypot(q[0]-x,q[1]-y)<q[2]+r+2*s);g++)x+=r*1.2;
  BP.push([x,y,r]);m.solo=1;if(flash&&m.key===flash.key)fp=[x,y];
  const ln=Math.hypot(x-m.x,y-m.y)>5*s?`<line x1="${m.x}" y1="${m.y}" x2="${x}" y2="${y}" stroke="rgba(255,255,255,.6)" stroke-width="${1.4*s}"/><circle cx="${m.x}" cy="${m.y}" r="${2.6*s}" fill="#fff" stroke="#000" stroke-width="${.6*s}"/>`:"",ic=iconSVG(m,x,y,k,s);
  if(sel===m.it.id)top+=ln+ic+`<text class="ml" style="font-size:${11*s}px" x="${x}" y="${y-r-9*s}">${m.it.n}</text>`;else late+=ln+ic});
 if(FM){FM.solo=1;fp=[FM.x,FM.y];top+=iconSVG(FM,FM.x,FM.y,k,s)+`<text class="ml" style="font-size:${11*s}px" x="${FM.x}" y="${FM.y-58*s}">${esc(FM.it?FM.it.n:G[FM.grp].n)}</text>`}
 const mk=marksSVG(s,k);o+=mk.o;top+=mk.top;if(flash&&flash.key.startsWith("mk:")&&S.marks[flash.key.slice(3)]){const m=S.marks[flash.key.slice(3)];fp=[m.x,m.y-20*k]}
 if(fp)top+=`<g class="flash${flash.calm?' calm':''}" transform="translate(${fp[0]} ${fp[1]}) scale(${k})" pointer-events="none"><circle class="pl" r="16"/><circle class="pl d2" r="16"/><circle r="19" fill="none" stroke="#ffd43b" stroke-width="3"/><path class="arw" d="M0 -24 l-7 -11 h14 z" fill="#ffd43b" stroke="#000" stroke-width="1"/></g>`;
 const rt=routeSVG(s,k),OE=document.getElementById("o");OE.classList.toggle("routing",!!(R&&R.res));OE.innerHTML=rt.o+gatesSVG(s,k)+o+late+(ov?"":navSVG(s,k))+rt.top+top;
}
function tapCluster(idx){if(moved>=8)return;selMk=null;openC=idx;sel=null;openG=null;showCluster(CL[idx]);drawOv()}
function zoomTo(xs,ys,minW=260){const x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);const w=Math.max(minW,(x1-x0)*1.8),h=Math.max(minW,(y1-y0)*1.8);vb=[(x0+x1)/2-w/2,(y0+y1)/2-h/2,w,h];setVB()}
function zoomCluster(){const c=CL[openC];if(!c)return;const xs=c.m.map(m=>m.x),ys=c.m.map(m=>m.y);openC=null;closeSheet();zoomTo(xs,ys);drawOv()}
function areaName(list){const t={};list.forEach(m=>{const a=m.grp?G[m.grp].a:areaOf(m.it);t[a]=(t[a]||0)+1});const a=Object.keys(t).sort((x,y)=>t[y]-t[x])[0];return(AREAS.find(x=>x.id===a)||{}).n||""}
function groupRow(k){const g=G[k],ks=kids(k),d=ks.filter(i=>S.done[i.id]).length,s=gst(k),c=!ks.length?(s==="red"?COL.red:NPCC):g.kind==='guide'&&s!=='done'?'#5c4a8a':COL[s];
 return `<div class="li gr" style="--c:${c}" onclick="tapGroup('${k}')"><svg class="gi" viewBox="-12 -12 24 24" width="30" height="30"><rect x="-11" y="-11" width="22" height="22" rx="5" fill="${c}"/>${glyph(g.gl,0,0,.62)}</svg><div><b>${g.n}</b><br><small>${ks.length?`${d} / ${ks.length} collected · open menu`:'Character · tap for details'}</small></div><span class="chev">›</span></div>`}
function showCluster(c){
 const m=c.m.slice().sort((a,b)=>ORDER[a.s]-ORDER[b.s]||b.pr-a.pr);
 sc_.innerHTML=`<div class="sh"><div class="t"><b>${areaName(c.m)}</b><br><small>${m.length} things in this spot · ${m.filter(x=>x.s==="done").length} done</small></div><button class="x" onclick="openC=null;closeSheet();drawOv()">✕</button></div>
 <div class="acts" style="margin-top:6px"><button class="prim" onclick="zoomCluster()">🔍 Zoom in here</button></div>
 <div class="kids">${m.map(x=>x.grp?groupRow(x.grp):row(x.it)).join("")}</div>`;
 sheet.classList.add("up");
}


// ---------- wishes: list, sheet ----------
let WF="open",gFrom=null;
function wRow(w){const s=wSt(w),miss=(w.need||[]).filter(n=>!req(n));
 return `<div class="wrow" style="--c:${WCOL[s]}" onclick="closeDrawer();showWish('${w.id}')"><div><b>${w.n}</b><small>${w.kind} · ${s==="locked"?'Needs '+miss.map(nm).join(', '):w.gt}</small></div><span class="wp">${s==="done"?'✓':wProgTxt(w)}</span><span class="chev">›</span></div>`}
function wishTab(){const N={open:0,locked:0,done:0};WISH.forEach(w=>N[wSt(w)]++);
 let h=`<p><small>Every wish (quest) in the areas mapped so far. Tap one for its steps; 📍 shows each spot on the map.</small></p><div class="chips">${["open","locked","done"].map(k=>`<button class="chip ${WF===k?'on':''}" style="--c:${WCOL[k]}" onclick="WF='${k}';renderDrawer()">${WLB[k]} ${N[k]}</button>`).join("")}<button class="chip ${WF==='all'?'on':''}" onclick="WF='all';renderDrawer()">All ${WISH.length}</button></div>`;
 const L=WISH.filter(w=>WF==="all"||wSt(w)===WF),mn=L.filter(w=>w.kind==="Main");if(mn.length)h+=`<div class="ar">Story</div>`+mn.map(wRow).join("");
 AREAS.forEach(a=>{const xs=L.filter(w=>w.kind!=="Main"&&wArea(w)===a.id);if(xs.length)h+=`<div class="ar">${a.n}</div>`+xs.map(wRow).join("")});
 if(!L.length)h+=`<p><small>Nothing here right now.</small></p>`;return h}
function wGo(t,wid){if(!t)return;if(t.startsWith("A:"))moveToArea(t.slice(2));else if(t.startsWith("G:")){gFrom=wid;moveToGroup(t.slice(2))}else moveTo(t,'W:'+wid)}
function wObjRow(w,j){const o=w.o[j],st=objSt(w,j),key=w.id+"."+j;let ctl="",go="";
 if(o.k==="i")go=`showReq('${o.id}','W:${w.id}')`;else if(o.k==="r")go=`showReq('R:${o.r}','W:${w.id}')`;else if(o.k==="a")go=`moveToArea('${o.a}')`;else if(o.go)go=`wGo('${o.go}','${w.id}')`;
 if(o.k==="n")ctl=`<div class="stp2"><button aria-label="One less" onclick="wSet('${key}',${st.n-1},${o.c})">−</button><input type="number" inputmode="numeric" min="0" max="${o.c}" value="${st.n}" aria-label="${o.t} so far" onchange="wSet('${key}',this.value,${o.c})"><small>of ${o.c}</small><button aria-label="One more" onclick="wSet('${key}',${st.n+1},${o.c})">+</button></div>`;
 const lead=o.k==="t"?`<input type="checkbox" ${st.ok?'checked':''} aria-label="Done" onchange="wSet('${key}',this.checked?1:0,1)">`:`<span class="wi">${st.ok?'✓':(o.k==="r"?st.n:j+1)}</span>`;
 const lbl=o.k==="r"?`${o.t} <b>${st.n}/${st.c}</b>`:o.k==="n"?`Collect ${o.c} ${o.t}`:o.t;
 return `<div class="wob ${st.ok?'ok':''}">${lead}<div class="wt">${lbl}${o.h?`<small>${o.h}</small>`:''}${ctl}</div>${go?`<button class="wgo" onclick="${go}" aria-label="Show where">📍</button>`:''}</div>`}
function wSet(key,v,max){S.wc=S.wc||{};v=Math.max(0,Math.min(+v||0,max));if(v)S.wc[key]=v;else delete S.wc[key];save();refresh()}
function setWish(id,v){const w=wById(id);S.wd=S.wd||{};if(v)S.wd[id]=1;else delete S.wd[id];
 if(w.rw)w.rw.forEach(r=>{if(byId(r)){S.done[r]=!!v;if(!v)delete S.have[r]}else S.have[r]=!!v});
 save();toast(v?(w.rw?"Wish done. Reward marked as collected.":"Wish done."):"Wish back on your list.");refresh()}
function showWish(id){const w=wById(id),s=wSt(w),miss=(w.need||[]).filter(n=>!req(n));sel=null;openG=null;selMk=null;gFrom=null;
 const giv=w.at.startsWith("A:")?`moveToArea('${w.at.slice(2)}')`:w.at.startsWith("G:")?`gFrom='${w.id}';moveToGroup('${w.at.slice(2)}')`:`moveTo('${w.at}','W:${w.id}')`;
 const rl=(w.rw||[]).concat(w.rwl||[]).filter(byId);
 sc_.innerHTML=`<div class="wsheet" data-w="${w.id}"><div class="sh"><div class="t"><b>${w.n}</b><br><span class="badge" style="background:${WCOL[s]}">${WLB[s]}</span> <small>· ${w.kind} wish</small></div>${rptBtn('wish',w.id)}<button class="x" aria-label="Close" onclick="closeSheet();drawOv()">✕</button></div>
 <div class="short">${w.d}</div>${diffRow("wish",w.id,"Wish difficulty")}
 <div class="wgv"><div><small>Where you get it</small><b>${w.gt}</b></div><button class="wgo" onclick="${giv}" aria-label="Show where">📍</button></div>
 ${miss.length?`<div class="needl">Opens once you have</div><div>${reqChips(miss,'W:'+w.id)}</div>`:''}
 <div class="needl">Steps · ${wProg(w)} of ${w.o.length} done</div>${w.o.map((o,j)=>wObjRow(w,j)).join("")}
 <div class="needl">Reward</div>${w.rwt?`<div class="short" style="margin-top:4px">${w.rwt}</div>`:''}${rl.length?`<div>${rl.map(r=>`<button class="req use ${S.done[r]?'ok':''}" onclick="moveTo('${r}','W:${w.id}')">${S.done[r]?'✓ ':''}${byId(r).n} <span class="ri">ⓘ</span></button>`).join("")}</div>`:''}
 <div class="acts"><button class="${s==='done'?'sec':'prim'}" onclick="setWish('${w.id}',${s==='done'?0:1})">${s==='done'?'Undo':'Mark wish done'}</button><a class="sec" href="${WIKI(w.w)}" target="_blank" rel="noopener">Wiki ↗</a></div></div>`;
 sheet.classList.add("up");}
function wishesAt(k){const L=WISH.filter(w=>w.at==="G:"+k);return L.length?`<div class="needl">Wishes here</div>`+L.map(w=>wRow(w).replace("closeDrawer();","openG=null;")).join(""):""}
// ---------- bottom sheet ----------
const sheet=document.getElementById("sheet"),sc_=document.getElementById("sc");
var lastSheet=null;
function closeSheet(){if(sheet.classList.contains("up")&&sc_.innerHTML.trim()){const t=sc_.querySelector(".sh .t b");
  lastSheet={kind:sc_.querySelector(".herepick")?"here":sc_.querySelector(".rsheet")?"route":"other",html:sc_.innerHTML,sel,selMk,openG,gFrom,itemFrom:sel?itemFrom:"",lbl:t?t.textContent.trim():"Show again"}}
 if(pickHere)endPickHere();sheet.classList.remove("up");sel=null;selMk=null;gFrom=null;gFocus=null;updReopen()}
function reopenOK(){const s=lastSheet;if(!s)return false;if(s.kind==="route"||s.kind==="here")return!!(R&&R.res)||s.kind==="here";if(s.selMk&&!S.marks[s.selMk])return false;return true}
function updReopen(){const b=document.getElementById("reo");if(!b)return;const on=!sheet.classList.contains("up")&&reopenOK();
 if(on){const s=lastSheet,l=s.kind==="route"?"Directions":s.kind==="here"?"Where are you?":s.lbl.replace(/^[^\w‹]+/,"");b.querySelector(".rl").textContent=l||"Show again"}
 b.classList.toggle("on",on)}
function reopenSheet(){const s=lastSheet;if(!reopenOK())return updReopen();moved=0;
 if(s.kind==="route"){showSteps();return}
 if(s.kind==="here"){showHerePick();return}
 if(s.selMk){tapMk(s.selMk);return}
 if(s.sel&&byId(s.sel)){sel=s.sel;openG=s.openG;showItem(s.sel,s.itemFrom||"");drawOv();return}
 if(s.openG&&G[s.openG]){openG=s.openG;gFrom=s.gFrom;showGroup(s.openG);drawOv();return}
 sc_.innerHTML=s.html;sheet.classList.add("up");sheet.scrollTop=0;drawOv()}
function reqChips(list,from){return list.map(n=>`<button class="req ${req(n)?'ok':'no'}" onclick="${n.startsWith('O:')?`showGate('${n.slice(2)}')`:`showReq('${n}','${from||''}')`}" aria-label="Where to get ${nm(n)}">${req(n)?'✓':'✗'} ${nm(n)} <span class="ri">ⓘ</span></button>`).join("")}
const cntTxt=n=>{if(!n.startsWith("R:"))return"";const r=n.slice(2),c=RES[r].c||resItems(r).length;return ` ${Math.min(resDone(r),c)}/${c}`};
function useChips(list,from){return list.map(n=>`<button class="req use ${has(n)?'ok':''}" onclick="showReq('${n}','${from||''}')" aria-label="Where to get ${nm(n)}">${has(n)?'✓ ':''}${nm(n)}${cntTxt(n)} <span class="ri">ⓘ</span></button>`).join("")}
// ---------- "where do I get this?" ----------
const REQSRC={widow:["needo"],act2:["judge"],skey:["skey","skeyR"]};
const srcOf=n=>{if(n.startsWith("A:")||n.startsWith("G:"))return[];if(n.startsWith("R:"))return resItems(n.slice(2)).map(i=>i.id);return REQSRC[n]||(byId(n)?[n]:[])};
let flash=null,flashT=null;
function backBtn(from){if(!from)return"";if(from.startsWith("W:")){const w=wById(from.slice(2));return w?`<button class="back" onclick="showWish('${w.id}')">‹ Back to ${w.n}</button>`:""}const g=from.startsWith("G:");const lbl=g?G[from.slice(2)].n:(byId(from)||{}).n;return `<button class="back" onclick="${g?`openG='${from.slice(2)}';showGroup('${from.slice(2)}')`:`sel='${from}';showItem('${from}')`};drawOv()">‹ Back to ${lbl}</button>`}
function showReq(need,from){
 const alts=need.split("|");let h=backBtn(from);
 h+=`<div class="sh"><div class="t"><b>${alts.length>1?'Any one of these':nm(need)}</b><br><span class="badge" style="background:${req(need)?COL.green:COL.red}">${req(need)?'You have this':'Still needed'}</span></div><button class="x" onclick="closeSheet();drawOv()">✕</button></div>`;
 alts.forEach(n=>{
  if(n.startsWith("G:")){const k=n.slice(2),g=G[k],ks=kids(k);h+=`<div class="rq"><b>${g.n}</b> <small>· ${(AREAS.find(a=>a.id===g.a)||{}).n||''}</small><p>${g.d}</p>${g.need&&g.need.some(x=>!req(x))?`<div class="warn">First you need: ${g.need.filter(x=>!req(x)).map(nm).join(', ')}</div><div>${reqChips(g.need.filter(x=>!req(x)),from)}</div>`:''}<div class="acts"><button class="prim" onclick="moveToGroup('${k}')">📍 Move to</button><button class="sec" onclick="backC=null;openG='${k}';showGroup('${k}');drawOv()">Open menu</button></div></div>`;return}
  if(n.startsWith("R:")){const r=n.slice(2),list=resItems(r).sort((a,b)=>ORDER[st(a)]-ORDER[st(b)]);
   h+=`<div class="rq"><p>${RES[r].d}</p><small>${resDone(r)} of ${list.length} spots done${RES[r].c?` · you need ${RES[r].c}`:''}</small></div>`;
   h+=list.map(i=>{const si=st(i),miss=needs(i).filter(x=>!req(x));return `<div class="rqr" style="--c:${COL[si]}"><div class="rqt"><b>${i.n}</b><small>${i.g?G[i.g].n:(AREAS.find(a=>a.id===i.a)||{}).n||''}${i.price?' · '+i.price:''}${S.done[i.id]?' · done':miss.length?' · needs '+miss.map(nm).join(', '):''}</small><details><summary>Where</summary><p>${i.h}</p></details></div><button class="mv" onclick="moveTo('${i.id}','${from}')" aria-label="Move to ${i.n}">📍</button></div>`}).join("");return}
  if(n.startsWith("A:")){const a=AREAS.find(x=>x.id===n.slice(2));h+=`<div class="rq"><b>${a?a.n:n}</b><p>Reach this area once. Its items unlock when you mark it as visited.</p><div class="acts"><button class="prim" onclick="moveToArea('${n.slice(2)}')">📍 Move to</button>${S.areas[n.slice(2)]?'':`<button class="sec" onclick="S.areas['${n.slice(2)}']=1;save();refresh();showReq('${need}','${from}')">I've been there</button>`}</div></div>`;return}
  const src=srcOf(n);
  if(n==="act2")h+=`<div class="rq"><p>Act 2 starts when you enter the Citadel, after beating the Last Judge at the Grand Gate.</p></div>`;
  if(n==="widow")h+=`<div class="rq"><p>Widow is the boss above Bellhart. Beating her gives you Needolin.</p></div>`;
  if(n==="rebirth")h+=`<div class="rq"><p>Greyroot in the heart of Shellwood gives the Rite of Rebirth wish. Finishing it opens the Chapel of the Witch and the lower western road to the Marrow.</p><div class="acts"><button class="prim" onclick="moveToGroup('greyroot')">📍 Move to Greyroot</button><button class="sec" onclick="setPw('rebirth',${has('rebirth')?0:1});showReq('${need}','${from}')">${has('rebirth')?'Undo':'Done it'}</button></div></div>`;
  src.forEach(id=>{const i=byId(id),miss=needs(i).filter(x=>!req(x)),own=has(n);
   h+=`<div class="rq"><b>${i.n}</b> <small>· ${i.g?G[i.g].n:(AREAS.find(a=>a.id===i.a)||{}).n||''}</small>${i.price?` <small>· ${i.price}</small>`:''}<p>${i.h}</p>${miss.length?`<div class="warn">First you need: ${miss.map(nm).join(', ')}</div><div>${reqChips(miss,from)}</div>`:''}
   <div class="acts"><button class="prim" onclick="moveTo('${id}','${from}')">📍 Move to</button><button class="sec" onclick="markHave('${n}','${id}',${own?0:1});showReq('${need}','${from}')">${own?'Undo':'I have it'}</button></div></div>`});
  if(!src.length&&!n.startsWith("A:")&&n!=="act2"&&n!=="widow"&&n!=="rebirth")h+=`<div class="rq"><p>Not on the map yet.</p></div>`;
 });
 sc_.innerHTML=h;sheet.classList.add("up");sheet.scrollTop=0;
}
function markHave(n,id,v){if(PW.some(p=>p[0]===n)||KEYS.some(p=>p[0]===n)||FLAGS.some(p=>p[0]===n)){setPw(n,!!v)}else{S.done[id]=!!v;save();refresh()}}
// keep=1: the indicator stays on the target for as long as its card is open (pulses for 5s, then sits still).
function startFlash(key,x,y,keep){flash={key,x,y,keep:!!keep};clearTimeout(flashT);flashT=setTimeout(()=>{if(!flash)return;if(flash.keep)flash.calm=1;else flash=null;drawOv()},5000)}
function flashAlive(){if(!flash||!flash.keep)return;const k=flash.key,up=sheet.classList.contains("up");
 const on=k.startsWith("mk:")?selMk===k.slice(3):k.startsWith("gate:")?!!sc_.querySelector('[data-gate="'+k.slice(5)+'"]'):(sel===k||openG===k);if(!up||!on){flash=null;clearTimeout(flashT)}}
function centerOn(p){const w=Math.max(260,Math.min(vb[2],420));vb=[p[0]-w/2,p[1]-w/2,w,w];vb[1]+=.2*svg.clientHeight*sc();setVB()}
function moveTo(id,from){const i=byId(id);let p;if(i.g){p=gp(i.g);openG=i.g}else p=pos(i);
 sel=i.g?null:id;closeDrawer();centerOn(p);
 startFlash(i.g?i.g:id,p[0],p[1],1);
 if(i.g){backC=null;showGroup(i.g)}else showItem(id,from);
 drawOv()}
function moveToGroup(k){const p=gp(k);closeDrawer();centerOn(p);openG=k;sel=null;backC=null;startFlash(k,p[0],p[1],1);showGroup(k);drawOv()}
function moveToArea(a){const A=AREAS.find(x=>x.id===a);const r=A.r[0];closeDrawer();vb=[r[0]-40,r[1]-40,r[2]-r[0]+80,r[3]-r[1]+80];setVB();startFlash("area:"+a,(r[0]+r[2])/2,(r[1]+r[3])/2);closeSheet();drawOv()}
let itemFrom;
// "What's in the way": the lock or wall in front of an item, plus the lever that opens it, with a button that frames them all.
function lockBlock(i){const L=itemLocks(i);if(!L.length)return"";const lev=g=>(BY[g.id]||[]).length;
 const rows=L.map(g=>{const st=gState(g),isLev=L.some(d=>(BY[d.id]||[]).includes(g.id));return `<div class="rqr" style="--c:${GCOL[st]}" onclick="goToGate('${g.id}')"><div class="rqt"><b>${GEMO[gIc(g)]} ${g.n}</b><small>${isLev?'The lever for it · ':''}${st==='done'?'✓ '+(g.k==='lever'?'Pulled':'Done'):gLbl(g)}${g.need.length?' · needs '+g.need.map(nm1).join(' + '):''} · tap to see it on the map</small></div></div>`}).join("");
 const many=L.length>1||L.some(g=>(BY[g.id]||[]).length);
 return `<div class="needl">What's in the way</div>${rows}${many?`<button class="btn" style="margin-top:6px" onclick="showLocks('${i.id}')">🔍 Show the item, door and lever together</button>`:''}`}
function showLocks(id){const i=byId(id),L=itemLocks(i),ip=placeOf(i);gFocus=L.map(g=>g.id);gFocus.it=ip;const ps=[ip,...L.map(gPos)];closeDrawer();zoomTo(ps.map(q=>q[0]),ps.map(q=>q[1]),220);vb[1]+=.22*svg.clientHeight*sc();setVB();drawOv()}
function showPair(id){const g=gById(id),L=[g,...gLinks(g)],ps=L.map(gPos);gFocus=L.map(x=>x.id);zoomTo(ps.map(q=>q[0]),ps.map(q=>q[1]),220);vb[1]+=.22*svg.clientHeight*sc();setVB();startFlash('gate:'+id,ps[0][0],ps[0][1],1);drawOv()}
function showItem(id,from){itemFrom=from;
 const i=byId(id),s=st(i),miss=needs(i).filter(n=>!req(n));{const L=itemLocks(i);gFocus=L.length?L.map(g=>g.id):null;if(gFocus)gFocus.it=placeOf(i)}
 sc_.innerHTML=`${from&&from!==id?backBtn(from):''}<div class="sh"><div class="t"><b>${i.n}</b><br><span class="badge" style="background:${(REST(i)||QUEST(i))&&s!=='red'?(s==='done'?COL.done:(REST(i)?'#3b6fb5':'#9c36b5')):COL[s]}">${REST(i)?(s==='done'?'Unlocked':s==='red'?'Blocked':'Not unlocked yet'):QUEST(i)?(s==='done'?'Picked up':s==='red'?'Blocked':'Quest pickup'):LB[s]}</span>${i.g?` <small>· ${G[i.g].n}</small>`:""}</div>${rptBtn('it',i.id)}<button class="x" onclick="closeSheet();drawOv()">✕</button></div>
 <div class="short">${i.s}${i.price?` <b>${i.price}</b>`:""}</div>${i.t==="boss"?bossLine(i):""}${missLine("it",i.id)}${picCard("it",i.id)}${diffRow("it",i.id,i.t==="boss"?"Boss difficulty":"How hard to get")}
 ${needs(i).length?`<div class="needl">${miss.length?'Needs (tap for where to get it)':'Requirements'}</div><div>${reqChips(needs(i),id)}</div>`:""}
 <div class="acts a3"><button class="${S.done[i.id]?'sec':'prim'}" onclick="toggle('${i.id}');showItem('${i.id}',itemFrom)">${S.done[i.id]?'↺ Undo':(REST(i)?'✓ Unlocked':QUEST(i)?'✓ Picked up':'✓ Collected')}</button><button class="way" onclick="showWay('it','${i.id}')">🧭 Directions</button><button class="ih ${S.here&&S.here.id===i.id?'on':''}" title="I'm here" aria-label="I'm here" onclick="setHere('${i.id}')">📍${S.here&&S.here.id===i.id?' Here':''}</button></div>
 ${lockBlock(i)}
 <details><summary>Where & how</summary><p>${i.h}</p>${!i.e&&!i.g?`<div class="warn">Pin position is approximate. Turn on "Move icons" under More to fix it.</div>`:""}</details>
 ${i.tip?`<details class="tips"><summary>💡 Tips & tricks</summary><p>${i.tip}</p></details>`:""}
 ${i.uses?`<div class="needl">Bring along / helps</div><div>${useChips(i.uses,id)}</div>`:''}
 <a class="wl" href="${WIKI(i.w)}" target="_blank" rel="noopener">Wiki + screenshots ↗</a>`;
 sheet.classList.add("up");picTap("it",id);
}
function showGroup(k){
 const g=G[k],ks=kids(k);
 sc_.innerHTML=`${gFrom&&wById(gFrom)?`<button class="back" onclick="showWish('${gFrom}')">‹ Back to ${wById(gFrom).n}</button>`:backC!==null?'<button class="back" onclick="goBack()">‹ Back to this spot</button>':''}<div class="sh"><div class="t"><b>${g.n}</b><br><small>${ks.length?ks.filter(i=>S.done[i.id]).length+' / '+ks.length+' collected':g.npc?'Character':'Wishes'}</small></div>${rptBtn('g',k)}<button class="x" onclick="openG=null;backC=null;closeSheet();drawOv()">✕</button></div>
 <div class="short">${g.d}</div>${g.when?`<div class="gwhen">🕒 <b>When and where:</b> ${g.when}</div>`:""}${missLine("g",k)}${picCard("g",k)}${g.need?`<div>${reqChips(g.need,'G:'+k)}</div>`:""}${g.uses?`<div class="needl">Bring along</div><div>${useChips(g.uses,'G:'+k)}</div>`:''}
 <div class="wayr"><button class="way" onclick="showWay('g','${k}','bench')">🧭 From a bench</button>${IT.some(wayOK)?`<button class="way wb" onclick="showWay('g','${k}','way')">🔔 By Bellway</button>`:''}</div>
 ${wishesAt(k)}<div class="kids">${ks.map(i=>row(i)).join("")}</div>${g.sells?`<div class="needl">${ks.length?"Also sells":"Sells"}</div><ul class="gsell">${g.sells.map(x=>`<li><span>${x[0]}${x[2]?`<small>${x[2]}</small>`:""}</span><b>${x[1]} 📿</b></li>`).join("")}</ul>`:""}
 <div class="acts"><a class="sec" href="${WIKI(g.w)}" target="_blank" rel="noopener">Wiki + screenshots ↗</a></div>`;
 sheet.classList.add("up");picTap("g",k);
}
function toggle(id){S.done[id]=!S.done[id];if(S.done[id])buzz();if(S.done[id]&&byId(id))S.here={id,src:'tick'};save();refresh()}

// ---------- drawer ----------
// Tabs: Guide (story) · Checklist (things you collect, by category) · Wishes · Abilities (what you have)
// · World (areas, NPCs, doors, levers, walls, gauntlets, your markers) · More (legend, settings, backup).
// A search box on top finds anything by name.
let tab="list",F="avail",CK=null,WK=null,Q="";
const drw=document.body;
function openDrawer(t){if(t)tab=t;drw.classList.add("open");renderDrawer()}
function closeDrawer(){drw.classList.remove("open");const q=document.getElementById("q");if(q)q.blur()}
document.getElementById("menu").onclick=()=>{setQ("");openDrawer()};
document.getElementById("dclose").onclick=closeDrawer;document.getElementById("story").onclick=()=>{storyOpen=null;setQ("");openDrawer("story")};document.getElementById("scrim").onclick=closeDrawer;
document.querySelectorAll(".tabs button").forEach(b=>b.onclick=()=>{tab=b.dataset.t;if(tab==="list")CK=null;if(tab==="world")WK=null;renderDrawer();document.getElementById("db").scrollTop=0});
document.getElementById("avail").onclick=()=>{setQ("");CK="all";F="avail";openDrawer("list")};
document.getElementById("hs").onclick=()=>openSearch();
function openSearch(){openDrawer();const q=document.getElementById("q");setTimeout(()=>{q.focus({preventScroll:true});q.select()},60)}
function setQ(v){Q=v;const q=document.getElementById("q");if(q&&q.value!==v)q.value=v;document.body.classList.toggle("searching",!!v.trim())}
(function(){const q=document.getElementById("q");
 q.addEventListener("input",()=>{setQ(q.value);renderDrawer();document.getElementById("db").scrollTop=0});
 q.addEventListener("keydown",e=>{if(e.key==="Escape"){e.stopPropagation();if(Q){setQ("");renderDrawer()}else closeDrawer()}
  else if(e.key==="Enter"){const f=document.querySelector("#db .sr");if(f){e.preventDefault();f.click()}}});
 document.getElementById("qx").onclick=()=>{setQ("");renderDrawer();q.focus()};
 document.addEventListener("keydown",e=>{const t=e.target,typing=t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA");
  if(!typing&&(e.key==="/"||((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"))){e.preventDefault();openSearch()}
  else if(e.key==="Escape"&&!typing&&drw.classList.contains("open"))closeDrawer()});
})();

// ---------- checklist categories ----------
const COUNTED=i=>!REST(i)&&!QUEST(i)&&i.t!=="extra";
const KINDS=[
 {k:"abil",n:"Abilities & crests",ic:"✦",f:i=>i.t==="power"||i.t==="crest"||i.t==="drift"},
 {k:"upg",n:"Masks, spool & lockets",ic:"❤️",f:i=>["mask","spool","locket"].includes(i.t)},
 {k:"tool",n:"Tools",ic:"🗡️",f:i=>i.t==="tool"},
 {k:"boss",n:"Bosses",ic:"💀",f:i=>i.t==="boss"},
 {k:"flea",n:"Fleas",ic:"🪲",f:i=>i.t==="flea"},
 {k:"keys",n:"Keys & Craftmetal",ic:"🔑",f:i=>i.t==="key"||i.t==="craft"},
 {k:"ros",n:"Rosaries",ic:"📿",f:i=>i.t==="rosary"},
 {k:"misc",n:"Relics & other finds",ic:"✨",f:COUNTED},
 {k:"rest",n:"Benches & fast travel",ic:"🪑",f:REST,side:1},
 {k:"quest",n:"Quest pickups",ic:"🌸",f:QUEST,side:1},
 {k:"extra",n:"Maps, shards & deposits",ic:"🪙",f:i=>i.t==="extra",side:1}];
const kindOf=i=>KINDS.find(K=>K.f(i))||KINDS[7];
// ---------- boss tiers: must beat · main boss · optional ----------
// "must": the story does not go on without it. "main": a big boss on the main road that has another way around
// (or, for the Old Hearts in Act 3, one of four of which you need three). Everything else is optional.
const BOSS_T={must:["mossm","bellb","chorus","splinter","needo","dancers","lace2","gms","lostlace"],main:["lace","moor","conch","judge","phantom","nyleth","khann","a1Karm","clover"]};
const bossT=i=>BOSS_T.must.includes(i.id)?"must":BOSS_T.main.includes(i.id)?"main":"side";
const BOSS_L={must:["👑 Story boss","You have to beat this one: the story does not go on without it."],main:["Main boss","A big boss on the main road. There is another way, so you can come back to it later."],side:["Optional boss","Not needed for the story. Fight it for its reward, or skip it."]};
// Boss pins are bigger than other pins and show the boss's face (img/boss/, made by tools/build_boss_faces.py).
// Size and ring tell the kind: must beat = biggest, gold outer ring and crown · main = middle, solid ring · optional = smallest, dashed ring.
const BOSS_R={must:17,main:14.5,side:12};
const bossFace=i=>i.w?"img/boss/"+decodeURIComponent(i.w).replace(/[^A-Za-z0-9_]/g,"_")+".webp":"";
function bossBody(i,col,sl){const t=bossT(i),r=BOSS_R[t],f=bossFace(i);
 return `<circle r="${r+1.6}" fill="#14110f"/>`+(f?`<image href="${f}" x="${-r}" y="${-r}" width="${2*r}" height="${2*r}" preserveAspectRatio="xMidYMid slice" clip-path="url(#bfc-${t})"/>`:`<circle r="${r}" fill="${col}"/>${glyph(i.gl,0,0,r/19)}`)
  +`<circle r="${r}" fill="none" stroke="${col}" stroke-width="${t==="side"?2.4:3}"${t==="side"?' stroke-dasharray="5 3"':''}/>`
  +(t==="must"?`<circle r="${r+3.4}" fill="none" stroke="#ffd43b" stroke-width="2"/><path transform="translate(0 ${-(r+3.4)+13.5})" d="M-7 -14.5l-1.2-6.2 3.6 3.2L0 -22l2.6 5 3.6-3.2-1.2 6.2z" fill="#ffd43b" stroke="#14110f" stroke-width=".9" stroke-linejoin="round"/>`:"")
  +(sl?`<circle r="${r+(t==="must"?6.6:4.2)}" fill="none" stroke="#fff" stroke-width="2.2"/>`:"")}
document.body.insertAdjacentHTML("beforeend",`<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${Object.keys(BOSS_R).map(t=>`<clipPath id="bfc-${t}"><circle r="${BOSS_R[t]}"/></clipPath>`).join("")}</defs></svg>`);
const bossLine=i=>{const t=bossT(i),L=BOSS_L[t];return `<div class="btier ${t}"><b>${L[0]}</b> · ${L[1]}</div>`};
// ---------- map layers: a category can be switched as a whole, or opened up to switch single kinds ----------
// S.off holds the hidden layers. A category with kinds below it is stored as "category.kind" (for example "extra.map").
const SUBS={abil:[["crest","Crests",i=>i.t==="crest"],["power","Abilities",()=>true]],
 upg:[["mask","Mask Shards",i=>i.t==="mask"],["spool","Spool Fragments",i=>i.t==="spool"],["locket","Memory Lockets",()=>true]],
 boss:[["must","👑 Story bosses (must beat)",i=>bossT(i)==="must"],["main","Main bosses",i=>bossT(i)==="main"],["side","Optional bosses",()=>true]],
 keys:[["key","Keys",i=>i.t==="key"],["craft","Craftmetal",()=>true]],
 misc:[["scroll","Scrolls & commandments",i=>i.gl==="scroll"],["effigy","Effigies & statuettes",i=>i.gl==="effigy"],["silk","Silkeaters",i=>i.gl==="silk"],["shard","Beast Shards",i=>i.gl==="craft"],["other","Other finds",()=>true]],
 rest:[["bench","Benches",i=>i.t==="bench"],["bellway","Bellways",i=>i.t==="bellway"],["tube","Ventrica tubes",()=>true]],
 extra:[["map","Maps",i=>i.gl==="map"],["rs","Rosary deposits",i=>i.gl==="rs"],["shard","Shell shard deposits",()=>true]]};
const subOf=i=>{const c=catOf(i),u=SUBS[c];return u?c+"."+u.find(x=>x[2](i))[0]:c};
const itemOn=i=>layerOn(subOf(i));
const catKeys=c=>c==="g"?WSEC.filter(W=>W.f).map(W=>"g_"+W.k):SUBS[c]?SUBS[c].map(x=>c+"."+x[0]):[c];
const catOn=c=>catKeys(c).some(layerOn);
// older saves (and old backup codes) hid whole categories under their plain name: spread that over the kinds
function offNorm(){const o=S.off;if(!o)return;Object.keys(SUBS).forEach(c=>{if(o[c]){delete o[c];catKeys(c).forEach(k=>o[k]=1)}})}
const sk=i=>S.done[i.id]?"done":st(i)==="red"?"locked":"avail";
const aN=id=>(AREAS.find(a=>a.id===id)||{}).n||"";

function row(i,showCat){const s=st(i),m=needs(i).filter(n=>!req(n)),dn=S.done[i.id],K=kindOf(i);
 const sub=dn?(REST(i)?'Unlocked':'Collected'):[showCat?K.ic+' '+K.n:'',s==="orange"?'via a skip':'',i.price||''].filter(Boolean).join(' · ');
 return `<div class="li ${dn?'d':''}" style="--c:${COL[s]}"><input type="checkbox" ${dn?'checked':''} onchange="toggle('${i.id}')" aria-label="Collected: ${esc(i.n)}"><div class="lt" onclick="goTo('${i.id}')"><b>${i.n}</b>${sub?`<small class="ls">${sub}</small>`:''}${!dn&&m.length?`<span class="rc"><small>Needs</small>${m.map(n=>`<button class="req no" onclick="event.stopPropagation();listReq('${n}','${i.id}')" aria-label="Where to get ${nm(n)}">✗ ${nm(n)}</button>`).join("")}</span>`:''}</div>${dn?'':`<button class="rway" onclick="event.stopPropagation();listWay('${i.id}')" aria-label="Show the way to ${esc(i.n)}" title="Show the way">🧭</button>`}</div>`}
// From a list row: open "where do I get this?" or the way, straight from the list.
function listReq(n,id){closeDrawer();sel=byId(id).g?null:id;if(n.startsWith("O:"))showGate(n.slice(2));else showReq(n,id);drawOv()}
function listWay(id){moved=0;closeDrawer();const i=byId(id);sel=i.g?null:id;if(i.g)openG=i.g;showWay('it',id)}
function goTo(id){const i=byId(id),p=i.g?gp(i.g):pos(i);if(i.g)openG=i.g;sel=id;closeDrawer();centerOn(p);startFlash(i.g||id,p[0],p[1],1);showItem(id);drawOv()}

function ckCard(K){const xs=IT.filter(i=>vis(i)&&kindOf(i)===K),d=xs.filter(i=>S.done[i.id]).length,a=xs.filter(i=>sk(i)==="avail").length;
 return `<button class="ccard ${xs.length&&d===xs.length?'full':''}" onclick="CK='${K.k}';F='${a?'avail':'all'}';renderDrawer();document.getElementById('db').scrollTop=0"><span class="ci">${K.ic}</span><b>${K.n}</b><small>${xs.length?`${d} / ${xs.length}${a?` · <em>${a} to get</em>`:d===xs.length?' · all done':''}`:'None in your areas yet'}</small><i class="cb"><i style="width:${xs.length?d/xs.length*100:0}%"></i></i></button>`}
function ckLanding(){const pool=IT.filter(cnt),av=pool.filter(i=>sk(i)==="avail").length,d=pool.filter(i=>S.done[i.id]).length;
 let h=`<button class="hero" onclick="CK='all';F='avail';renderDrawer()"><span class="hdot"></span><span class="ht2"><b>${av} you can get right now</b><small>${d} of ${pool.length} collected in the areas you've found</small></span><span class="chev">›</span></button>`;
 h+=`<h3>Collectibles</h3><div class="cgrid">${KINDS.filter(K=>!K.side).map(ckCard).join("")}</div>`;
 h+=`<h3>Also on the map <small>(not counted in progress)</small></h3><div class="cgrid">${KINDS.filter(K=>K.side).map(ckCard).join("")}</div>`;
 const hidden=IT.filter(i=>!vis(i)&&COUNTED(i)).length;if(hidden)h+=`<p class="note">🌫 ${hidden} more items are in areas you haven't discovered yet. Unlock areas under World → Areas.</p>`;
 return h}
function ckList(){if(!["avail","locked","done","all"].includes(F))F="avail";
 const K=CK==="all"?null:KINDS.find(x=>x.k===CK),src=IT.filter(i=>vis(i)&&(K?kindOf(i)===K:cnt(i))),N={avail:0,locked:0,done:0};src.forEach(i=>N[sk(i)]++);
 let h=`<div class="subh"><button class="back" onclick="CK=null;renderDrawer()">‹ Categories</button><b>${K?K.ic+' '+K.n:'All collectibles'}</b></div>`;
 h+=`<div class="seg4">${[["avail","Can get",COL.green],["locked","Locked",COL.red],["done","Done",COL.done],["all","All",""]].map(([k,l,c])=>`<button class="${F===k?'on':''}" ${c?`style="--c:${c}"`:''} onclick="F='${k}';renderDrawer()">${l}<span>${k==="all"?src.length:N[k]}</span></button>`).join("")}</div>`;
 const flt=i=>F==="all"||sk(i)===F;let any=false;
 AREAS.forEach(a=>{const xs=src.filter(i=>areaOf(i)===a.id&&flt(i));if(!xs.length)return;any=true;h+=`<div class="ar">${a.n} <span>${xs.length}</span></div>`+xs.map(i=>row(i,!K)).join("")});
 if(!any)h+=`<p class="note">${!src.length?"Nothing here yet in the areas you've discovered.":F==="avail"?"Nothing you can get right now. Look under <b>Locked</b> to see what each one needs.":F==="done"?"Nothing collected here yet.":"All done here! 🎉"}</p>`;
 return h}

// ---------- World: areas, NPCs, doors, levers, walls, gauntlets, markers ----------
const WSEC=[
 {k:"areas",n:"Areas",ic:"🗺️",d:"Mark the places you've found. Undiscovered areas stay dark on the map."},
 {k:"npc",n:"Shops & NPCs",ic:"🛒",d:"Merchants, smiths, quest givers and area guides."},
 {k:"lock",n:"Locked doors & passages",ic:"🔒",d:"Ways that open with a power, after a boss or once you've opened them. Routes only go through them when they're open for you.",f:g=>["ability","boss","gate","door","toll","unsure"].includes(g.k)},
 {k:"key",n:"Key doors",ic:"🗝️",d:"Doors that take a key. Tick the ones you've unlocked.",f:g=>g.k==="key"},
 {k:"lever",n:"Levers & shortcuts",ic:"🎚️",d:"Levers, switches and shortcuts that open from one side. Tick what you've opened: routes use them from then on.",f:g=>g.k==="lever"||g.k==="shortcut"},
 {k:"wall",n:"Breakable walls & secrets",ic:"🧱",d:"Walls you can break. ✨ means there's a secret behind it you haven't collected.",f:g=>g.k==="wall"},
 {k:"fight",n:"Gauntlets & guards",ic:"⚔️",d:"Enemy gauntlets and guards that block the way until you clear them.",f:g=>g.k==="fight"},
 {k:"mk",n:"Your markers",ic:"📌",d:"Your own pins on the map."}];
function wsCount(W){
 if(W.k==="areas"){const n=AREAS.filter(a=>S.areas[a.id]).length;return `${n} / ${AREAS.length} found`}
 if(W.k==="npc"){const ks=Object.keys(G).filter(k=>S.areas[G[k].a]);return ks.length?`${ks.length} in your areas`:"None found yet"}
 if(W.k==="mk"){const n=Object.keys(S.marks).length;return n?`${n} marker${n>1?'s':''}`:"None yet"}
 const xs=GATES.filter(g=>gVis(g)&&g.k!=="seal"&&W.f(g));if(!xs.length)return"None in your areas yet";
 const tk=xs.filter(g=>GK[g.k].tick);if(tk.length)return `${tk.filter(g=>gState(g)==="done").length} / ${tk.length} done`;
 return `${xs.filter(g=>gState(g)!=="shut").length} / ${xs.length} open`}
function worldLanding(){return `<p class="note" style="margin-top:2px">Everything that stands in your way, plus places and people.</p>`+WSEC.map(W=>`<button class="wsec" onclick="WK='${W.k}';renderDrawer();document.getElementById('db').scrollTop=0"><span class="ci">${W.ic}</span><span class="ht2"><b>${W.n}</b><small>${wsCount(W)}</small></span><span class="chev">›</span></button>`).join("")}
function gateRow(g){const stt=gState(g),hd=hidOf(g),K=GK[g.k],ms=gateMiss(g),oneway=g.k==="shortcut"&&ms.length===1&&ms[0].startsWith("O:");
 const sub=stt==="done"?(hd?'✓ '+hd.n:'✓ Done'):oneway?'↩️ Opens from '+(g.from?'the '+aName(NA[g.from])+' side':'the other side'):stt==="shut"?'Needs '+ms.map(nm1).join(' + '):hd?(hd.done?'✓ ':'✨ ')+hd.n:stt==="open"&&K.blk?'✓ Open for you':K.l;
 return `<div class="li" style="--c:${GCOL[stt]}">${K.tick?`<input type="checkbox" aria-label="${K.tick}" ${ticked(g)?'checked':''} onchange="setOpen('${g.id}',this.checked)">`:`<span class="gem">${GEMO[gIc(g)]}</span>`}<div onclick="closeDrawer();showGate('${g.id}');const p=gPos(GATES.find(x=>x.id==='${g.id}'));lookAt(p[0],p[1])"><b>${g.n}</b><small class="ls">${sub}</small></div><span class="chev">›</span></div>`}
function worldSec(){const W=WSEC.find(x=>x.k===WK);let h=`<div class="subh"><button class="back" onclick="WK=null;renderDrawer()">‹ World</button><b>${W.ic} ${W.n}</b></div><p class="note">${W.d}</p>`;
 if(W.k==="areas"){
  h+=`<div class="acts" style="margin:0 0 6px"><button class="sec" onclick="setAllAreas(1)">Reveal all</button><button class="sec" onclick="setAllAreas(0)">Fog all</button></div>`;
  h+=AREAS.map(a=>{const n=IT.filter(i=>areaOf(i)===a.id&&COUNTED(i)),d=n.filter(i=>S.done[i.id]).length;return `<label class="tg"><input type="checkbox" ${S.areas[a.id]?'checked':''} onchange="S.areas['${a.id}']=this.checked?1:0;save();refresh()"><span>${a.n}${diffOf("area",a.id)?`<br><span class="dfa" title="Area difficulty: ${DIFFL[diffOf("area",a.id)]}">${diffPips(diffOf("area",a.id))}<em style="color:${DIFFC[diffOf("area",a.id)]}">${DIFFL[diffOf("area",a.id)]}</em></span>`:""}</span><small>${n.length?d+'/'+n.length:''}</small><button class="rs" title="Show on map" aria-label="Show ${a.n} on the map" onclick="event.preventDefault();moveToArea('${a.id}')">📍</button>${d?`<button class="rs" title="Reset items in this area" aria-label="Reset items in ${a.n}" onclick="event.preventDefault();resetArea('${a.id}')">↺</button>`:''}</label>`}).join("");
  return h}
 if(W.k==="mk")return h+markersTab();
 if(W.k==="npc"){let any=false;AREAS.forEach(a=>{const ks=Object.keys(G).filter(k=>G[k].a===a.id&&S.areas[a.id]).sort((x,y)=>(G[y].shop?1:0)-(G[x].shop?1:0));if(!ks.length)return;any=true;h+=`<div class="ar">${a.n}</div>`+ks.map(k=>groupRow(k).replace(`onclick="tapGroup('${k}')"`,`onclick="moveToGroup('${k}')"`)).join("")});if(!any)h+=`<p class="note">Discover an area first.</p>`;return h}
 const xs=GATES.filter(g=>gVis(g)&&g.k!=="seal"&&W.f(g));
 AREAS.forEach(a=>{const ys=xs.filter(g=>gArea(g)===a.id);if(ys.length)h+=`<div class="ar">${a.n} <span>${ys.length}</span></div>`+ys.map(gateRow).join("")});
 if(!xs.length)h+=`<p class="note">Nothing yet in the areas you've discovered.</p>`;
 return h}

// ---------- search ----------
const normQ=s=>String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/['’]/g,"").replace(/[^a-z0-9]+/g," ").trim();
let SIX=null;
function searchIndex(){if(SIX)return SIX;const L=[];
 const add=(n,kind,ic,area,go,desc,it,extra)=>L.push({n,kind,ic,area,go,it,x:extra,t:normQ(n),c:normQ(kind+" "+area),d:normQ(desc)});
 AREAS.forEach(a=>add(a.n,"Area","🗺️","",`moveToArea('${a.id}')`,"",null,{area:a.id}));
 IT.forEach(i=>{const K=kindOf(i);add(i.n,K.n,K.ic,aN(areaOf(i)),`goTo('${i.id}')`,[i.s,i.h].join(" "),i)});
 Object.keys(G).forEach(k=>{const g=G[k];add(g.n,g.kind==="guide"?"Area guide":"Shop & NPC","🛒",aN(g.a),`moveToGroup('${k}')`,g.d,null,{area:g.a})});
 GATES.filter(g=>g.k!=="seal").forEach(g=>{const W=WSEC.find(w=>w.f&&w.f(g));add(g.n,W?W.n:"Passage",GEMO[gIc(g)]||"🚪",aN(gArea(g)),`goToGate('${g.id}')`,g.h,null,{gate:g})});
 WISH.forEach(w=>add(w.n,"Wish · "+w.kind,"🌸","",`closeDrawer();showWish('${w.id}')`,w.d,null,{wish:w}));
 Object.keys(RES).forEach(r=>add(RES[r].n,"Collect several","🧺","",`closeDrawer();showReq('R:${r}','')`,RES[r].d));
 return SIX=L}
function hlQ(s,toks){let o=esc(s);toks.forEach(t=>{if(t.length<2)return;o=o.replace(new RegExp("("+t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+")","ig"),"<mark>$1</mark>")});return o}
function searchView(){const q=normQ(Q),toks=q.split(" ").filter(Boolean);if(!toks.length)return"";
 const L=searchIndex().concat(Object.keys(S.marks).map(id=>{const m=S.marks[id],n=m.lbl||"Untitled marker";return{n,kind:"Your marker",ic:"📌",area:areaAt(m.x,m.y),go:`goToMk('${id}')`,t:normQ(n),c:normQ("marker "+areaAt(m.x,m.y)),d:normQ(m.note)}}));
 const main=[],ment=[];let hid=0;
 const isDone=e=>e.it?!!S.done[e.it.id]:e.x&&e.x.gate?gState(e.x.gate)==="done":e.x&&e.x.wish?wSt(e.x.wish)==="done":false;
 L.forEach(e=>{let sc=0,inDesc=false;
  for(const t of toks){const w=(" "+e.t).indexOf(" "+t);if(w>=0)sc+=3;else if(e.t.includes(t))sc+=2;else if(e.c.includes(t))sc+=1;else if(e.d&&e.d.includes(t))inDesc=true;else return}
  if(e.t===q)sc+=6;else if(e.t.startsWith(q))sc+=3;
  if(e.it&&S.done[e.it.id])sc-=.5;
  if((e.it&&!vis(e.it))||(e.x&&e.x.area&&!S.areas[e.x.area]))sc-=.3;
  if(S.srHide&&isDone(e)){hid++;return}
  (inDesc&&sc<toks.length*2?ment:main).push([sc,e])});
 main.sort((a,b)=>b[0]-a[0]||a[1].n.localeCompare(b[1].n));ment.sort((a,b)=>b[0]-a[0]);
 const rowS=e=>{let dot="",sub=[e.kind,e.area].filter(Boolean).join(" · ");
  if(e.it){const s=st(e.it);dot=S.done[e.it.id]?'<span class="sok">✓</span>':`<span class="sdot" style="background:${COL[s]}" title="${LB[s]}"></span>`;if(!vis(e.it))sub+=" · 🌫 not discovered"}
  else if(e.x&&e.x.gate){const g=e.x.gate,s=gState(g);dot=s==="done"?'<span class="sok">✓</span>':`<span class="sdot" style="background:${GCOL[s]}"></span>`}
  else if(e.x&&e.x.wish){const s=wSt(e.x.wish);dot=s==="done"?'<span class="sok">✓</span>':`<span class="sdot" style="background:${WCOL[s]}"></span>`}
  else if(e.x&&e.x.area&&!S.areas[e.x.area])sub+=(sub?" · ":"")+"🌫 not discovered";
  return `<button class="sr" onclick="${e.go}"><span class="sic">${e.ic}</span><span class="stx"><b>${hlQ(e.n,toks)}</b><small>${esc(sub)}</small></span>${dot}</button>`};
 const cnt=main.length?(main.length>80?'Top 80 of '+main.length:main.length+' result'+(main.length>1?'s':'')):'No results';
 let h=`<div class="srbar"><span>${cnt}${hid?` · ${hid} collected hidden`:''}</span><label class="srh"><input type="checkbox" ${S.srHide?'checked':''} onchange="S.srHide=this.checked;save();renderDrawer()">Hide collected</label></div>`;
 if(!main.length&&!ment.length)return h+(hid?`<p class="note">All ${hid} match${hid>1?'es are':' is'} already collected. <button class="lnk" onclick="S.srHide=false;save();renderDrawer()">Show them</button></p>`:`<p class="note">No results for “${esc(Q.trim())}”. Try fewer letters, like “mask” or “bench”.</p>`);
 if(main.length)h+=main.slice(0,80).map(x=>rowS(x[1])).join("");
 if(ment.length)h+=`<details class="more" ${main.length?'':'open'}><summary>Mentioned in ${ment.length} description${ment.length>1?'s':''}</summary>${ment.slice(0,40).map(x=>rowS(x[1])).join("")}</details>`;
 return h}

function moreTab(){let h=`<button class="btn" style="font-weight:700" onclick="openSettings()">⚙️ Settings <small>· symbol size, colours, colour-blind modes, legend</small></button>`;
 h+=`<button class="btn" onclick="openSettings('legend')">🎨 Colour legend: what every colour and shape means</button><details class="sect"><summary>🧭 How to read the map</summary>
  <div class="chips" style="margin-top:8px"><span class="chip" style="--c:${COL.green}">Available</span><span class="chip" style="--c:${COL.red}">Blocked</span><span class="chip" style="--c:${COL.done}">Collected</span></div>
  <ul class="legend">
  <li><b>Round icons</b> are items. The colour shows whether you can get them yet.</li>
  <li><b>Square icons</b> are shops and NPCs; purple squares are area guides. Tap for a menu.</li>
  <li><b>Gold squares</b> are benches, <b>teal bells</b> Bellways, <b>purple capsules</b> Ventrica stations.</li>
  <li><b>Purple diamonds</b> are quest pickups. Bosses are the bigger pins with a face in them. The biggest, with a gold ring and a crown, are the ones you must beat; middle-sized with a solid ring are main bosses; the smallest, with a dashed ring, are optional. A gold dot means tips.</li>
  <li>Zoomed in, small squares show what's in the way: 🔒 locks, 🗝️ key doors, 🎚️ levers & shortcuts, 🧱 breakable walls, ⚔️ gauntlets. Green = open, red = locked, brown = something to do, grey = done. A gold star = a secret you haven't found.</li>
  <li>Tap any icon, then <b>🧭 Show the way</b> for a route from the nearest bench.</li>
  <li>Busy spots fold into a numbered bubble: tap it for a list, or zoom in. The ◧ button shows or hides each type.</li>
  <li>Zoom far out to see every area's name with how many collectibles you've found there. Tap a name to jump in.</li></ul></details>`;
 h+=`<h3>View</h3><label class="tg"><input type="checkbox" ${S.hideDone?'checked':''} onchange="S.hideDone=this.checked;save();refresh()"><span>Hide collected icons</span></label>`;
 h+=`<h3>Show on map</h3>`+layerToggles();
 h+=`<h3>Your progress</h3><p id="syncl"><small>${syncText()}</small></p>
  <button class="btn" onclick="copyBackup()">📋 Copy backup code</button><div id="bk"></div>
  <details style="margin:6px 0"><summary>Restore from a backup code</summary><textarea id="rin" placeholder="Paste a backup code here"></textarea><button class="btn" onclick="restoreBackup()">Restore</button></details>`;
 if(rptOn())h+=`<h3>Help make it better</h3><button class="btn" onclick="openReport()">⚠️ Report a bug or suggest a change</button>`;
 const pl=passList();
 h+=`<details class="sect"><summary>🛠 Fix the map</summary>${pl}<h3>Pin positions</h3><label class="tg"><input type="checkbox" ${edit?'checked':''} onchange="edit=this.checked;closeDrawer();drawOv()"><span>Move icons (drag them on the map)</span></label><button class="btn" onclick="exportPos()">Copy my pin positions</button><div id="exp"></div></details>`;
 h+=`<details class="sect"><summary>↺ Reset</summary>
  <button class="btn" onclick="resetItems()">↺ Reset collected items <small>(keeps abilities & areas)</small></button>
  <button class="btn" onclick="resetAbilities()">↺ Reset abilities & story progress</button>
  <button class="btn" onclick="setAllAreas(0)">🌫 Fog all areas again</button>
  <button class="btn" onclick="setAllAreas(1)">🔓 Reveal all areas</button>
  <button class="btn" onclick="resetPins()">↺ Reset moved pins</button>
  <button class="btn danger" onclick="resetAll()">Reset everything <small>(keeps your markers)</small></button>
  <p class="note">To fog or reset one area, use World → Areas.</p></details>`;
 h+=`<p class="note" style="margin-top:16px">Item data from the Hollow Knight Wiki and community checklists.${typeof APP_VERSION!=="undefined"?" Version "+APP_VERSION+".":""}</p>`;
 return h}

function abilTab(){let h=`<p class="note" style="margin-top:2px">Tick what you have. The map, routes and checklist use this to show what you can reach.</p>`;
 h+=`<h3>Abilities</h3>`+PW.map(p=>{const it=byId(p[0]);const on=has(p[0]);return `<label class="tg"><input type="checkbox" ${on?'checked':''} onchange="setPw('${p[0]}',this.checked)"><span>${p[1]}</span>${it?`<small>${aN(it.a)}</small>`:''}<button class="rs" title="Where to get it" aria-label="Where to get ${p[1]}" onclick="event.preventDefault();closeDrawer();showReq('${p[0]}','')">📍</button></label>`}).join("");
 h+=`<h3>Keys</h3>`+KEYS.map(p=>`<label class="tg"><input type="checkbox" ${has(p[0])?'checked':''} onchange="setPw('${p[0]}',this.checked)"><span>${p[1]}</span><button class="rs" aria-label="Where to get ${p[1]}" onclick="event.preventDefault();closeDrawer();showReq('${p[0]}','')">📍</button></label>`).join("");
 h+=`<h3>Story progress</h3>`+FLAGS.map(p=>`<label class="tg"><input type="checkbox" ${has(p[0])?'checked':''} onchange="setPw('${p[0]}',this.checked)"><span>${p[1]}</span><button class="rs" aria-label="How to get there" onclick="event.preventDefault();closeDrawer();showReq('${p[0]}','')">📍</button></label>`).join("");
 h+=`<h3>Materials you collect several of</h3>`+Object.keys(RES).map(r=>`<label class="tg"><span>${RES[r].n}</span><small>${cntTxt('R:'+r).trim()}</small><button class="rs" aria-label="Where to get ${RES[r].n}" onclick="event.preventDefault();closeDrawer();showReq('R:${r}','')">📍</button></label>`).join("");
 h+=`<p class="note">Doors, levers and walls are under the <b>World</b> tab.</p>`;
 return h}

function renderDrawer(){
 if(tab==="areas"){tab="world";WK="areas"}else if(tab==="mk"){tab="world";WK="mk"}
 document.querySelectorAll(".tabs button").forEach(b=>{const on=b.dataset.t===tab;b.classList.toggle("on",on);b.setAttribute("aria-selected",on)});
 const db=document.getElementById("db");let h="";
 if(Q.trim()){db.innerHTML=searchView();return}
 if(tab==="list")h=CK?ckList():ckLanding();
 else if(tab==="pw")h=abilTab();
 else if(tab==="story")h=guideSeg()+(GV==="tips"?tipsTab():GV==="miss"?missTab():GV==="build"?buildsTab():storyTab());
 else if(tab==="wish")h=wishTab();
 else if(tab==="world")h=WK?worldSec():worldLanding();
 else h=moreTab();
 db.innerHTML=h;
}
function setAllAreas(v){if(!v&&!confirm("Cover every area in fog again? Your collected items are kept."))return;AREAS.forEach(a=>S.areas[a.id]=v?1:0);save();refresh()}
function resetArea(id){const a=AREAS.find(x=>x.id===id);if(!confirm("Reset all collected items in "+a.n+"?"))return;IT.filter(i=>areaOf(i)===id).forEach(i=>{delete S.done[i.id];delete S.alt[i.id]});save();refresh()}
function resetItems(){if(!confirm("Uncheck every collected item? Abilities and areas stay as they are."))return;const keep=new Set(PW.map(p=>p[0]).concat(KEYS.map(k=>k[0])));Object.keys(S.done).forEach(k=>{if(!keep.has(k))delete S.done[k]});S.alt={};save();refresh()}
function resetAbilities(){if(!confirm("Clear all abilities, keys and story progress?"))return;S.have={};PW.concat(KEYS).forEach(p=>delete S.done[p[0]]);save();refresh()}
function resetPins(){if(!confirm("Put all moved pins back to their default spots?"))return;S.pos={};save();refresh()}
function resetAll(){if(!confirm("Reset EVERYTHING on this device: items, abilities, areas and pins? Your own markers are kept."))return;try{localStorage.removeItem("ss5");localStorage.removeItem("bb4")}catch(e){}S={done:{},have:{},alt:{},pos:{},areas:{},hideDone:false,marks:S.marks||{}};DEF_AREAS.forEach(a=>S.areas[a]=1);save();fogKey="";refresh()}
const gLayer=g=>{const W=WSEC.find(w=>w.f&&w.f(g));return"g_"+(W?W.k:"lock")};
// Old saves used coarser layer names; carry hidden layers over to the new ones.
(function(){const o=S.off;if(!o||o._v2)return;const m={power:["abil"],coll:["flea","ros","misc"],upg:["upg","tool","keys"],blk:["g_lock","g_key","g_lever","g_wall","g_fight"]};
 Object.keys(m).forEach(k=>{if(o[k]){delete o[k];m[k].forEach(x=>o[x]=1)}});o._v2=1})();
let LOPEN={};
function layerToggles(){offNorm();const c={npc:Object.keys(G).filter(k=>G[k].npc&&!G[k].shop&&!kids(k).length&&S.areas[G[k].a]).length,shop:Object.keys(G).filter(k=>G[k].shop&&S.areas[G[k].a]).length,mine:Object.keys(S.marks).length};
 IT.filter(vis).forEach(i=>{const k=subOf(i);c[k]=(c[k]||0)+1});GATES.filter(g=>gVis(g)&&g.k!=="seal").forEach(g=>{const k=gLayer(g);c[k]=(c[k]||0)+1});
 const leaf=(k,n)=>`<label class="tg"><input type="checkbox" ${layerOn(k)?'checked':''} onchange="setLayer('${k}',this.checked)"><span>${n}</span><small>${c[k]||0}</small></label>`;
 // a category: its tick box switches everything in it; the name opens it up to switch one kind at a time
 const cat=(id,n,ks)=>{const on=ks.filter(x=>layerOn(x[0])).length,mix=on>0&&on<ks.length,open=!!LOPEN[id],tot=ks.reduce((t,x)=>t+(c[x[0]]||0),0);
  return `<div class="lcat${open?' open':''}"><div class="tg"><input type="checkbox" aria-label="Show everything in ${n}" ${on?'checked':''} ${mix?'data-mix="1"':''} onchange="setCat('${id}',this.checked)"><button class="lx" aria-expanded="${open}" onclick="lOpen('${id}')"><span>${n}${mix?`<br><small>${on} of ${ks.length} shown</small>`:''}</span><small>${tot}</small><i aria-hidden="true">${open?'▾':'▸'}</i></button></div>${open?`<div class="lsub">${ks.map(x=>leaf(x[0],x[1])).join("")}</div>`:''}</div>`};
 const kind=K=>SUBS[K.k]?cat(K.k,K.ic+" "+K.n,SUBS[K.k].map(x=>[K.k+"."+x[0],x[1]])):leaf(K.k,K.ic+" "+K.n);
 return `<p class="lhint">Tick a box to show or hide a whole group. Tap a name with ▸ to pick single kinds.</p><div class="lall"><button onclick="setLayers(1)">Show all</button><button onclick="setLayers(0)">Hide all</button></div>`
  +`<div class="lgrp">Collectibles</div>`+KINDS.filter(K=>!K.side).map(kind).join("")
  +`<div class="lgrp">Also on the map</div>`+KINDS.filter(K=>K.side).map(kind).join("")+leaf("shop","🛒 Shops & sellers")+leaf("npc","🧑 Characters (NPCs)")
  +`<div class="lgrp">In the way (zoomed in)</div>`+cat("g","🧱 Doors, levers & walls",WSEC.filter(W=>W.f).map(W=>["g_"+W.k,W.ic+" "+W.n]))
  +`<div class="lgrp">Yours</div>`+leaf("mine","📌 My markers")}
function lpopDraw(){const p=document.getElementById("lpop"),y=p.scrollTop;p.innerHTML="<b style='font-size:14px'>Show on map</b>"+layerToggles();p.querySelectorAll("input[data-mix]").forEach(e=>e.indeterminate=true);p.scrollTop=y}
function lOpen(id){LOPEN[id]=!LOPEN[id];lpopDraw()}
function setCat(id){S.off=S.off||{};offNorm();const v=!catKeys(id).every(layerOn);/* half shown or hidden: show all · all shown: hide all */catKeys(id).forEach(k=>{if(v)delete S.off[k];else S.off[k]=1});save();refresh();if(document.getElementById("lpop").classList.contains("on"))lpopDraw()}
function setLayers(v){S.off=v?{_v2:1}:Object.assign({_v2:1},...KINDS.flatMap(K=>catKeys(K.k)).concat(catKeys("g")).map(k=>({[k]:1})),{mine:1,npc:1,shop:1});save();refresh();const p=document.getElementById("lpop");if(p.classList.contains("on"))lpopDraw();if(drw.classList.contains("open"))renderDrawer()}
function setLayer(k,v){S.off=S.off||{};offNorm();if(v)delete S.off[k];else S.off[k]=1;save();refresh();const p=document.getElementById("lpop");if(p.classList.contains("on"))lpopDraw()}
function toggleLayers(){const p=document.getElementById("lpop");if(p.classList.toggle("on"))lpopDraw()}
// ---------- story guide (up to Act 2) ----------
// Each step: k = the item/flag that proves it's done (ticking it also ticks that item), a = area to reveal,
// routes: main = most common way; others are alternatives. go = "itemId" | "G:group" | "A:area".
const SS=()=>S.story||(S.story={});
const areaRest=a=>IT.some(i=>areaOf(i)===a&&REST(i)&&S.done[i.id]);
const SHR=[
 {id:"marrow",n:"The Marrow",go:"bellb",h:"Right after the Bell Beast. Needed before Swift Step."},
 {id:"dd",n:"Deep Docks",b:"b_dd3",go:"lace",h:"On the right of Lace's arena, after beating her."},
 {id:"grey",n:"Greymoor (Craw Lake)",b:"b_gm1",go:"b_gm1",h:"Beat the watermound gauntlet, hit the balloon lever and ride the balloons up."},
 {id:"shell",n:"Shellwood",b:"b_sw3",go:"b_sw3",h:"Upper west Shellwood, just left of the Bellway. Climb the lift shaft at the west end of the lower road (Cling Grip)."},
 {id:"bell",n:"Bellhart",b:"b_bh2",go:"needo",h:"In the room where you fight Widow."}];
const shrOn=s=>!!(SS()["sh_"+s.id]||(s.b&&S.done[s.b])||(s.id==="marrow"&&has("swift")));
let storyOpen=null;
function storyState(){const d=new Array(STORY.length).fill(false);let later=false;
 for(let i=STORY.length-1;i>=0;i--){const s=STORY[i],own=!!(SS()[s.id]||s.chk());d[i]=own||later;if(own&&!s.noc)later=true;}
 return d}
function storyGo(g){if(g.startsWith("A:"))moveToArea(g.slice(2));else if(g.startsWith("G:"))moveToGroup(g.slice(2));else moveTo(g,"")}
function storyChips(list){return list.map(n=>`<button class="req ${req(n)?'ok':'no'}" onclick="closeDrawer();showReq('${n}','')" aria-label="Where to get ${nm(n)}">${req(n)?'✓':'✗'} ${nm(n)}${cntTxt(n)} <span class="ri">ⓘ</span></button>`).join("")}
function storyRoute(r,i,open){const ok=r.need.every(req),it=!r.go.includes(":")&&byId(r.go);
 return `<details class="sroute ${r.main?'main':''}" ${open?'open':''}><summary><span class="stag ${r.main?'m':''}">${r.main?'★ Most common':'Alt route'}</span> <b>${r.n}</b> <span class="sok ${ok?'y':'n'}">${ok?'✓ You can do this':'Needs more'}</span></summary>
 ${r.need.length?`<div class="needl">${ok?'Requirements':'You still need'}</div><div>${storyChips(r.need)}</div>`:''}
 <ol class="ssteps">${r.s.map(t=>`<li>${t}</li>`).join("")}</ol>${r.note?`<div class="snote">${r.note}</div>`:''}
 <div class="acts"><button class="sec" onclick="storyGo('${r.go}')">📍 Show on map</button>${it&&!S.done[it.id]?`<button class="prim" onclick="listWay('${it.id}')">🧭 Show the way</button>`:''}</div></details>`}
function storyBells(){return `<div class="sbells">${SHR.map(s=>{const on=shrOn(s);return `<label class="tg"><input type="checkbox" ${on?'checked':''} onchange="setShr('${s.id}',this.checked)"><span><b>${s.n}</b><br><small>${s.h}</small></span><button class="rs" aria-label="Show ${s.n} Bellshrine on the map" onclick="event.preventDefault();storyGo('${s.go}')">📍</button></label>`}).join("")}</div>`}
function setShr(id,v){const s=SHR.find(x=>x.id===id);SS()["sh_"+id]=v?1:0;if(!v)delete SS()["sh_"+id];if(s.b){S.done[s.b]=!!v;if(!v)delete S.done[s.b]}save();refresh()}
function storyBody(s){const ok=s.routes?s.routes.map(r=>r.need.every(req)):[],best=ok[0]?0:ok.indexOf(true);
 return `<p class="swhy">${s.why}</p>${s.bells?storyBells():s.routes.map((r,i)=>storyRoute(r,i,i===(best<0?0:best))).join("")}${s.opt?`<div class="sopt">💡 ${s.opt}</div>`:''}`}
function storyTab(){const d=storyState(),cur=d.indexOf(false),n=d.filter(Boolean).length;
 if(storyOpen===null)storyOpen=cur;
 let h=`<div class="shead"><b>${cur<0?'Act 1 complete — welcome to the Citadel!':'Act 1 · step '+(cur+1)+' of '+STORY.length}</b><div class="bar"><i style="width:${n/STORY.length*100}%"></i></div><small>Steps tick themselves off as you mark bosses, abilities and benches. Alt routes show other ways to get there.</small></div>`;
 if(cur>=0){const s=STORY[cur];h+=`<div class="snow"><div class="snowh"><span class="sn">${cur+1}</span><div><small>NEXT UP</small><b>${s.n}</b></div></div>${storyBody(s)}<div class="acts"><button class="prim" onclick="storyMark(${cur},1)">✓ I've done this</button></div></div>`}
 h+=`<h3>All steps to Act 2</h3>`;
 STORY.forEach((s,i)=>{if(i===cur)return;const dn=d[i],own=!!(SS()[s.id]||s.chk()),alt=s.routes&&s.routes.length>1;
  h+=`<details class="sstep ${dn?'d':''}" ${storyOpen===i?'open':''} ontoggle="if(this.open)storyOpen=${i}"><summary><span class="sn">${dn?'✓':i+1}</span><span class="st"><b>${s.n}</b>${alt?`<small>${s.routes.length} ways</small>`:''}${s.bells?`<small>${SHR.filter(shrOn).length}/5 rung</small>`:''}</span></summary>${storyBody(s)}
  <div class="acts">${dn&&own?`<button class="sec" onclick="storyMark(${i},0)">Undo</button>`:dn?`<small style="flex:1">Counted as done because a later step is.</small>`:`<button class="prim" onclick="storyMark(${i},1)">✓ I've done this</button>`}</div></details>`});
 return h}
function storyMark(i,v){const s=STORY[i];
 if(v){if(s.bells)SHR.forEach(x=>{SS()["sh_"+x.id]=1;if(x.b)S.done[x.b]=true});else if(s.k){if(PW.some(p=>p[0]===s.k))setPw(s.k,true);else S.done[s.k]=true;if(s.k==="judge"){S.have.act2=true}}else SS()[s.id]=1;if(s.a)S.areas[s.a]=1;storyOpen=STORY.findIndex((x,j)=>j>i&&!storyState()[j]);toast("✓ "+s.n)}
 else{delete SS()[s.id];if(s.bells)SHR.forEach(x=>{delete SS()["sh_"+x.id];if(x.b)delete S.done[x.b]});else if(s.k){delete S.done[s.k];delete S.have[s.k];if(s.k==="judge")delete S.have.act2}}
 save();refresh()}

function setPw(id,v){if(byId(id)){S.done[id]=v;if(!v)delete S.have[id]}else S.have[id]=v;save();refresh()}
function exportPos(){const o={};Object.keys(S.pos).forEach(k=>o[k]=S.pos[k]);const t=JSON.stringify(o);try{navigator.clipboard.writeText(t)}catch(e){}document.getElementById("exp").innerHTML=`<textarea readonly onclick="this.select()">${t||'{}'}</textarea><small>${Object.keys(o).length?'Copied. Paste it in the chat.':'You haven\'t moved any pins yet.'}</small>`}

// ---------- your own markers ----------
// Saved in S.marks, so they ride along with local saving, cloud sync and backup codes.
const MSYM={star:'<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.5 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>',
 excl:'<path d="M12 4v10 M12 18.5v.5"/>',quest:'<path d="M9 9a3 3 0 116 0c0 2.2-3 2.6-3 5 M12 18.5v.5"/>',
 heart:'<path d="M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z"/>',
 flag:'<path d="M6 21V4 M6 4h11l-2 4 2 4H6"/>',x:'<path d="M6 6l12 12M18 6L6 18"/>',
 lock:'<rect x="6" y="11" width="12" height="9" rx="1"/><path d="M9 11V8a3 3 0 016 0v3"/>',
 door:'<path d="M7 21V4h10v17 M4 21h16 M14 12v1"/>',
 skull:GL.skull,key:GL.key,bench:GL.bench,mask:GL.mask,spool:GL.spool,flea:GL.flea,shop:GL.shop,eye:GL.eye};
const MSYM_N={star:"Star",excl:"Important",quest:"Unknown / secret",heart:"Favourite",flag:"Goal",x:"Dead end",lock:"Locked",door:"Passage",skull:"Boss / danger",key:"Key",bench:"Bench",mask:"Mask shard",spool:"Spool",flea:"Flea",shop:"Shop / NPC",eye:"Look here"};
const MCOL=[["#e8b923","Gold"],["#e03131","Red"],["#f76707","Orange"],["#2f9e44","Green"],["#15aabf","Teal"],["#4c6ef5","Blue"],["#ae3ec9","Purple"],["#f1ece4","Bone white"]];
const lightCol=c=>c==="#f1ece4"||c==="#e8b923";
let selMk=null,dragMk=null,dragOff=[0,0],placing=false,lpT=null,toastT=null,undoMk=null;
const esc=t=>String(t||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const mGlyph=(k,s,stroke)=>`<g transform="translate(${-12*s},${-12*s}) scale(${s})" fill="none" stroke="${stroke}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">${MSYM[k]||MSYM.star}</g>`;
// A teardrop pin whose tip sits exactly on the marked spot, so it never reads as an item icon.
function pinSVG(m,id,k,s){const ink=lightCol(m.col)?"#14110f":"#fff";const lbl=m.lbl&&(s<1.3||selMk===id);
 return `<g class="mk ${selMk===id?'sel':''} ${m.dn?'dn':''}" transform="translate(${m.x} ${m.y}) scale(${k})" onpointerdown="mkDown(event,'${id}')" onclick="tapMk('${id}')"><circle cy="-20" r="18" fill="transparent"/><path d="M0 0 C-3 -7 -12 -12 -12 -21 A12 12 0 1 1 12 -21 C12 -12 3 -7 0 0z" fill="#000" opacity=".35" transform="translate(1.5 1.5)"/><path class="hd" d="M0 0 C-3 -7 -12 -12 -12 -21 A12 12 0 1 1 12 -21 C12 -12 3 -7 0 0z" fill="${m.col}" stroke="#14110f" stroke-width="1.4"/><g transform="translate(0 -21)">${mGlyph(m.sym,.58,ink)}</g>${m.dn?'<g transform="translate(9 -31)"><circle r="5.5" fill="#2f9e44" stroke="#000" stroke-width=".8"/><path d="M-2.5 0l1.8 1.8 3.2-3.6" fill="none" stroke="#fff" stroke-width="1.6"/></g>':''}</g>`+(lbl?`<text class="mkl" text-anchor="middle" style="font-size:${11*s}px" x="${m.x}" y="${m.y+13*s}">${esc(m.lbl)}</text>`:'')}
function marksSVG(s,k){let o="",top="";if(!layerOn("mine")){if(selMk&&S.marks[selMk])top=pinSVG(S.marks[selMk],selMk,k,s);return{o,top}}
 Object.keys(S.marks).sort((a,b)=>S.marks[a].y-S.marks[b].y).forEach(id=>{const m=S.marks[id];if(S.hideDone&&m.dn&&selMk!==id)return;const g=pinSVG(m,id,k,s);if(selMk===id)top+=g;else o+=g});
 return{o,top}}
function setPlacing(v){placing=v;document.body.classList.toggle("placing",v);if(v){closeDrawer();document.getElementById("lpop").classList.remove("on")}}
function togglePlacing(){setPlacing(!placing)}
document.addEventListener("keydown",e=>{if(e.key==="Escape"){if(placing)setPlacing(false);else if(R&&!sheet.classList.contains("up"))clearRoute();else if(selMk){closeSheet();drawOv()}}});
function areaAt(x,y){const a=AREAS.find(a=>a.r.some(r=>x>=r[0]&&x<=r[2]&&y>=r[1]&&y<=r[3]));return a?a.n:"Uncharted"}
let lastDrop=0;
function dropMarker(x,y){if(Date.now()-lastDrop<800)return;lastDrop=Date.now();const id="m"+Date.now().toString(36)+Math.random().toString(36).slice(2,5);const L=S.mkLast||{};
 S.marks[id]={x:Math.round(x),y:Math.round(y),sym:L.sym||"star",col:L.col||MCOL[0][0],lbl:"",note:"",dn:0,t:Date.now()};
 if(!layerOn("mine")){delete S.off.mine}
 save();selMk=id;sel=null;openG=null;openC=null;showMk(id,true);keepVisible(x,y);drawOv();refreshCounts()}
// The sheet covers the lower part of the screen: nudge the map so the pin stays in view.
function keepVisible(x,y){const b=svg.getBoundingClientRect(),s=sc(),oy=(b.height-vb[3]/s)/2,sy=(y-vb[1])/s+oy;const lim=b.height*.32;if(sy>lim){vb[1]+=(sy-lim)*s;setVB()}}
function mkDown(e,id){if(selMk!==id||placing)return;e.stopPropagation();clearTimeout(lpT);dragMk=id;const w=toW(e.clientX,e.clientY),m=S.marks[id];dragOff=[w[0]-m.x,w[1]-m.y];P.set(e.pointerId,[e.clientX,e.clientY]);moved=0;try{svg.setPointerCapture(e.pointerId)}catch(_){}}
function tapMk(id){if(moved>=8||placing)return;sel=null;openG=null;openC=null;selMk=id;showMk(id);keepVisible(S.marks[id].x,S.marks[id].y);drawOv()}
function showMk(id,fresh){const m=S.marks[id];if(!m)return closeSheet();
 const ink=lightCol(m.col)?"#14110f":"#fff";
 sc_.innerHTML=`<div class="sh"><div class="t"><b>${m.lbl?esc(m.lbl):(fresh?'New marker':'Untitled marker')}</b><br><small>${areaAt(m.x,m.y)} · ${fresh?'saved':'added '+new Date(m.t).toLocaleDateString()}</small></div><button class="x" aria-label="Close" onclick="closeSheet();drawOv()">✕</button></div>
 <div class="me" style="--mc:${m.col}">
  <input type="text" id="mk-lbl" maxlength="40" placeholder="Name (optional), e.g. Breakable wall" value="${esc(m.lbl)}" oninput="mkSet('${id}','lbl',this.value)" enterkeyhint="done" onkeydown="if(event.key==='Enter')this.blur()">
  <div class="mel">Symbol</div>
  <div class="syms" role="radiogroup" aria-label="Symbol">${Object.keys(MSYM).map(k=>`<button class="sym ${m.sym===k?'on':''}" role="radio" aria-checked="${m.sym===k}" title="${MSYM_N[k]}" aria-label="${MSYM_N[k]}" onclick="mkPick('${id}','sym','${k}')"><svg viewBox="-12 -12 24 24">${mGlyph(k,1,m.sym===k?ink:'currentColor')}</svg></button>`).join("")}</div>
  <div class="mel">Colour</div>
  <div class="sws" role="radiogroup" aria-label="Colour">${MCOL.map(([c,n])=>`<button class="sw ${m.col===c?'on':''}" role="radio" aria-checked="${m.col===c}" style="--c:${c}" title="${n}" aria-label="${n}" onclick="mkPick('${id}','col','${c}')"></button>`).join("")}</div>
  <div class="mel">Note</div>
  <textarea id="mk-note" maxlength="400" placeholder="e.g. Come back with Clawline. Hidden room behind the left wall." oninput="mkSet('${id}','note',this.value)">${esc(m.note)}</textarea>
  <label class="tg" style="margin:0"><input type="checkbox" ${m.dn?'checked':''} onchange="mkSet('${id}','dn',this.checked?1:0);showMk('${id}')"><span>Done: dim this marker</span></label>
  <div class="mhint">Saved automatically. Drag the pin on the map to move it.</div>
 </div>
 <div class="acts"><button class="prim" onclick="closeSheet();drawOv()">Done</button><button class="sec" style="color:var(--r)" onclick="deleteMk('${id}')">🗑 Delete</button></div>`;
 sheet.classList.add("up");if(fresh)sheet.scrollTop=0;
 if(fresh&&matchMedia("(pointer:fine)").matches){const el=document.getElementById("mk-lbl");if(el)el.focus()}}
let mkSaveT=null;
function mkSet(id,k,v){const m=S.marks[id];if(!m)return;m[k]=v;if(k==="lbl"){const b=sc_.querySelector(".sh b");if(b)b.textContent=v||"Untitled marker"}
 clearTimeout(mkSaveT);mkSaveT=setTimeout(()=>{save();if(drw.classList.contains("open")&&tab==="world"&&WK==="mk")renderDrawer()},350);drawOv()}
function mkPick(id,k,v){const m=S.marks[id];if(!m)return;m[k]=v;S.mkLast=Object.assign(S.mkLast||{},{[k]:v});save();
 const lbl=document.getElementById("mk-lbl"),note=document.getElementById("mk-note");if(lbl)m.lbl=lbl.value;if(note)m.note=note.value;showMk(id);drawOv()}
function deleteMk(id){const m=S.marks[id];if(!m)return;undoMk={id,m};delete S.marks[id];save();closeSheet();drawOv();refreshCounts();
 toast(`Deleted ${m.lbl?'“'+esc(m.lbl)+'”':'marker'}`,"Undo",()=>{S.marks[undoMk.id]=undoMk.m;undoMk=null;save();refreshCounts();moved=0;tapMk(id)})}
function toast(msg,act,fn){const t=document.getElementById("toast");t.innerHTML=`<span>${msg}</span>${act?`<button id="toast-act">${act}</button>`:''}`;t.classList.add("on");
 if(act)document.getElementById("toast-act").onclick=()=>{t.classList.remove("on");clearTimeout(toastT);fn()};clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove("on"),6000)}
function goToMk(id){const m=S.marks[id];if(!m)return;closeDrawer();const w=Math.max(260,Math.min(vb[2],420));vb=[m.x-w/2,m.y-w/2,w,w];setVB();selMk=id;sel=null;openG=null;openC=null;startFlash("mk:"+id,m.x,m.y,1);showMk(id);keepVisible(m.x,m.y);drawOv()}
function refreshCounts(){if(drw.classList.contains("open")&&tab==="world"&&WK==="mk")renderDrawer();const p=document.getElementById("lpop");if(p.classList.contains("on"))lpopDraw()}
let mkDelAll=false;
function markersTab(){const ids=Object.keys(S.marks).sort((a,b)=>S.marks[b].t-S.marks[a].t);let h="";
 h+=`<div class="acts" style="margin:4px 0 6px"><button class="prim" onclick="setPlacing(true)">📌 Add a marker</button></div>`;
 h+=`<p><small>Tap 📌 and then a spot on the map. Faster: long-press the map on a phone, or right-click on a PC. Markers are saved with your progress, so they're still here next time.</small></p>`;
 if(!ids.length)return h+`<div class="rq"><p><b>No markers yet</b></p><p>Mark things the tracker doesn't know about: a breakable wall, a ledge to come back to, where you died, a spot you want to show a friend.</p></div>`;
 h+=`<label class="tg"><input type="checkbox" ${layerOn('mine')?'checked':''} onchange="setLayer('mine',this.checked)"><span>Show my markers on the map</span><small>${ids.length}</small></label>`;
 const groups={};ids.forEach(id=>{const a=areaAt(S.marks[id].x,S.marks[id].y);(groups[a]=groups[a]||[]).push(id)});
 Object.keys(groups).forEach(a=>{h+=`<div class="ar">${a}</div>`+groups[a].map(id=>{const m=S.marks[id],ink=lightCol(m.col)?"#14110f":"#fff";
  return `<div class="mrow ${m.dn?'d':''}" onclick="goToMk('${id}')"><svg viewBox="-13 -34 26 36" width="26" height="36" aria-hidden="true"><path d="M0 0 C-3 -7 -12 -12 -12 -21 A12 12 0 1 1 12 -21 C12 -12 3 -7 0 0z" fill="${m.col}" stroke="#14110f" stroke-width="1.4"/><g transform="translate(0 -21)">${mGlyph(m.sym,.58,ink)}</g></svg><div><b>${m.lbl?esc(m.lbl):'Untitled marker'}</b><small>${m.note?esc(m.note):MSYM_N[m.sym]||''}</small></div><span class="chev">›</span></div>`}).join("")});
 h+=`<h3>Clean up</h3>`;
 h+=mkDelAll?`<div class="rq"><p>Delete all ${ids.length} markers? This can't be undone.</p><div class="acts"><button class="sec" style="color:var(--r)" onclick="S.marks={};mkDelAll=false;save();drawOv();renderDrawer()">Delete all</button><button class="sec" onclick="mkDelAll=false;renderDrawer()">Keep them</button></div></div>`
  :`<button class="btn" onclick="const n=Object.keys(S.marks).filter(k=>S.marks[k].dn);n.forEach(k=>delete S.marks[k]);save();drawOv();renderDrawer();toast(n.length?'Removed '+n.length+' done markers':'No done markers to remove')">Remove done markers</button><button class="btn danger" onclick="mkDelAll=true;renderDrawer()">Delete all markers</button>`;
 return h}




const NK=Object.keys(NV),ADJ={};NK.forEach(k=>ADJ[k]=[]);
const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
const ek=(a,b)=>a<b?a+"~"+b:b+"~"+a;
NE.forEach(([a,b])=>{const d=(NAVD.EL[ek(a,b)])||dist(NV[a],NV[b]);ADJ[a].push({to:b,d});ADJ[b].push({to:a,d})});
const GE={};GATES.forEach(g=>(g.e||[]).forEach(([a,b])=>(GE[ek(a,b)]=GE[ek(a,b)]||[]).push(g)));
// Nearest waypoint, preferring one in the same area so a route doesn't reach a spot through a wall.
function nearNode(p,a){a=a||areaIdAt(...p);let b=null,bd=1e9,s=null,sd=1e9;NK.forEach(k=>{const d=dist(NV[k],p);if(d<bd){bd=d;b=k}if(a&&NA[k]===a&&d<sd){sd=d;s=k}});return s&&sd<bd+140?[s,sd]:[b,bd]}
// Attach a spot to the closest corridor segment (same area preferred), so routes stop at it instead of overshooting.
function nearEdge(p,a,self){let best=null,bd=1e9,sb=null,sd=1e9;NE.forEach(([u,v])=>{const A=NV[u],B=NV[v],dx=B[0]-A[0],dy=B[1]-A[1],L2=dx*dx+dy*dy||1;let t=((p[0]-A[0])*dx+(p[1]-A[1])*dy)/L2;t=Math.max(0,Math.min(1,t));const q=[A[0]+dx*t,A[1]+dy*t],d=dist(p,q),L=Math.sqrt(L2);
  let e=[{n:u,d:d+L*t},{n:v,d:d+L*(1-t)}];if((GE[ek(u,v)]||[]).some(g=>GK[g.k].blk&&!(self&&g.need.includes(self))))e=[t>=.5?e[1]:e[0]];/* a spot behind a lock is only reached through it */if(d<bd){bd=d;best=e}if(a&&(NA[u]===a||NA[v]===a)&&d<sd){sd=d;sb=e}});
 const e=sb&&sd<bd+140?sb:best;e.gap=Math.min(sd,bd);return e}
const placeOf=i=>i.g?gp(i.g):pos(i);
// Area boxes overlap at the edges; the smallest box that holds the point wins.
const areaIdAt=(x,y)=>{let best=null,ba=1e12;AREAS.forEach(a=>a.r.forEach(r=>{if(x>=r[0]&&x<=r[2]&&y>=r[1]&&y<=r[3]){const ar=(r[2]-r[0])*(r[3]-r[1]);if(ar<ba){ba=ar;best=a.id}}}));return best};
const NPRE={mg:"moss",bg:"moss",bb:"bb",mh:"bb",wm:"worm",bs:"blast",wa:"weave",mw:"marrow",hm:"hunt",dd:"dd",ff:"far",gm:"grey",sr:"sinner",bh:"bell",sw:"shell",gg:"gate",uw:"cunder",cc:"cchor",hh:"chall",cg:"ccog",cr:"ccrad",me:"cmem",sc:"csong",wv:"cvault",ww:"cward",eo:"organ",sl:"slab"};
const NA={};NK.forEach(k=>NA[k]=NPRE[k.split("_")[0]]||areaIdAt(...NV[k]));NA.mh_top="blast";NA.mh4="bb";NA.gm_wp="wisp";NA.sc_e="cvault";NA.eo_ph="cunder"; // sc_e is the roof above the Whispering Vaults, east of Songclave; eo_ph is the top of Phantom's lift, in the passage the wiki maps as Underworks; mh_top is the bottom of the Blasted Steps pit; mh4 the tall Mosshome shaft below it; gm_wp is the Wisp Thicket end of the passage from Greymoor
const aName=id=>(AREAS.find(a=>a.id===id)||{}).n||"";
const TP=400,LOCKED=6000; // cost of one Bellway ride; extra cost of a locked passage in a "possible way"
// ---------- locks ----------
// blk = can stop a route · tick = you can mark it done yourself · ic = icon
const GK={ability:{l:"Needs a power",ic:"lock",blk:1},boss:{l:"Opens after a boss",ic:"lock",blk:1},gate:{l:"Opens once",ic:"lock",blk:1,tick:"I've opened it"},
 door:{l:"Opens with a power each time",ic:"lock",blk:1},key:{l:"Takes a key",ic:"key",blk:1,tick:"I've unlocked it"},shortcut:{l:"Shortcut: opens from one side",ic:"lever",blk:1,tick:"I've opened it"},
 unsure:{l:"Not verified",ic:"q"},wall:{l:"Breakable wall",ic:"wall",tick:"I've broken it"},lever:{l:"Lever or switch",ic:"lever",tick:"I've pulled it"},
 fight:{l:"Gauntlet or guard",ic:"fight",tick:"I've cleared it"},seal:{l:"Shuts for good when you leave",ic:"seal"},toll:{l:"Pay to enter",ic:"toll"}};
// Levers and the doors they open: a lever lists its door(s) in "opens"; BY is the reverse (door → its levers).
const BY={};GATES.forEach(g=>(g.opens||[]).forEach(d=>(BY[d]=BY[d]||[]).push(g.id)));
const gById=id=>GATES.find(x=>x.id===id);
// A door that a lever opens is drawn as a lock, so the door and its lever look different on the map.
const gIc=g=>BY[g.id]?"lock":GK[g.k].ic;
const gLbl=g=>BY[g.id]?"Locked door: a lever opens it":GK[g.k].l;
const gLinks=g=>[...(g.opens||[]),...(BY[g.id]||[])].map(gById).filter(Boolean);
// Ticking a lever also opens its door.
const ticked=g=>!!(S.open||{})[g.id]||(BY[g.id]||[]).some(l=>!!(S.open||{})[l]);
// Everything standing in front of an item: the lock or secret wall that hides it, locks listed on the item (lk), and the levers that open those.
const itemLocks=i=>{const L=GATES.filter(g=>g.hides===i.id||(i.g&&g.hides==='G:'+i.g)||(i.lk||[]).includes(g.id));L.slice().forEach(g=>(BY[g.id]||[]).forEach(l=>{const x=gById(l);if(x&&!L.includes(x))L.push(x)}));return L};
let gFocus=null; // gate ids to keep on the map (with dashed links) while their card is open
const needOK=g=>g.need.every(req);
// Open without caring about direction (for colours and lists). A shortcut counts as open once you've opened it.
const gateOpen=g=>g.k==="unsure"?true:g.k==="shortcut"?ticked(g):(g.k==="gate"||g.k==="key")?needOK(g)||ticked(g):needOK(g);
// Can you go u→v through it? Shortcuts also work from their own side.
const passOK=(g,u)=>gateOpen(g)||(g.k==="shortcut"&&u===g.from&&needOK(g));
const gateMiss=g=>{if(gateOpen(g))return[];const m=g.need.filter(n=>!req(n));return g.k==="shortcut"&&!m.length?["O:"+g.id]:m};
// Moving u→v: which locks sit on it, which are still shut, and whether you marked it blocked yourself.
function pass(u,v){const key=ek(u,v),b=(S.blk||{})[key],gs=(GE[key]||[]).filter(g=>!(R&&R.kind==="it"&&g.need.includes(R.id))),fails=gs.filter(g=>!passOK(g,u));
 return{gs,fails,user:!!b&&(b==="both"||b===u+">"+v),ok:!fails.length&&!(b&&(b==="both"||b===u+">"+v))}}
const hidOf=g=>g.hides?(g.hides.startsWith("G:")?{n:G[g.hides.slice(2)].n,p:gp(g.hides.slice(2)),done:gst(g.hides.slice(2))==="done",grp:g.hides.slice(2)}:{n:byId(g.hides).n,p:placeOf(byId(g.hides)),done:!!S.done[g.hides],it:g.hides}):null;
// Where the icon sits: its own spot, the middle of its passage, or just off the hidden thing, towards the nearest corridor.
function gPos(g){if(g.p)return g.p;if(g.e){const[a,b]=g.e[0];return g._em||(g._em=edgeMid(a,b))}
 const ip=hidOf(g).p,key=ip.join(",");if(g._k===key)return g._p;let best=null,bd=1e9;
 NE.forEach(([u,v])=>{const A=NV[u],B=NV[v],dx=B[0]-A[0],dy=B[1]-A[1],L2=dx*dx+dy*dy||1;const t=Math.max(0,Math.min(1,((ip[0]-A[0])*dx+(ip[1]-A[1])*dy)/L2)),q=[A[0]+dx*t,A[1]+dy*t],d=dist(ip,q);if(d<bd){bd=d;best=q}});
 const L=bd||1,off=bd<6?null:Math.min(24,bd*.55);g._k=key;g._p=off?[ip[0]+(best[0]-ip[0])/L*off,ip[1]+(best[1]-ip[1])/L*off]:[ip[0]-20,ip[1]-14];return g._p}
const gArea=g=>g.a?g.a:g.e?NA[g.e[0][0]]:g.hides&&g.hides.startsWith("G:")?G[g.hides.slice(2)].a:g.hides?areaOf(byId(g.hides)):areaIdAt(...gPos(g));
const gVis=g=>g.e?!!(S.areas[NA[g.e[0][0]]]||S.areas[NA[g.e[0][1]]]):!!S.areas[gArea(g)];
// done = ticked, or its secret is already collected · open/shut = lock state · info = nothing to unlock
function gState(g){if(ticked(g)||(g.hides&&GK[g.k].tick&&hidOf(g).done))return"done";if(g.k==="unsure")return"unsure";if(!GK[g.k].blk&&!g.need.length)return"info";return gateOpen(g)?"open":"shut"}
const GCOL={done:"#5c5f66",open:"#1f6f3a",shut:"#c92a2a",info:"#9a6324",unsure:"#f08c00"};
const GEMO={lock:"🔒",key:"🗝️",lever:"🎚️",wall:"🧱",fight:"⚔️",seal:"🚪",toll:"🪙",q:"❓"};
// Benches you can start from: in an area you've visited and not blocked.
const benchOK=i=>i.t==="bench"&&S.areas[areaOf(i)]&&needs(i).every(req);
const wayOK=i=>(i.t==="bellway"&&has("bellb")||i.t==="tube")&&S.areas[areaOf(i)]&&needs(i).every(req);
let R=null; // active route: {kind,id,start,res,pot}
function routeTarget(kind,id){if(kind==="g"){const g=G[id];return{n:g.n,p:gp(id),a:g.a,need:g.need||[]}}const i=byId(id);return{n:i.n,p:placeOf(i),a:areaOf(i),need:needs(i)}}
// maybe=false: only passages you can use now. maybe=true: also locked ones (at a high cost), to show what's in the way.
// Passages you marked blocked are never used. With a chosen bench the route may ride Bellways.
// ---------- corridor pathfinding ----------
// The map image is the navigation mesh: every corridor cell is a waypoint, solid rock is (almost) impassable.
// The hand-placed waypoints still decide which doors and locks a route takes; the line between them follows the corridors.
let NG=null;
function navGrid(){if(NG)return NG;const b=atob(NAVD.NAVG),g=new Uint8Array(NAVD.W*NAVD.H);let i=0,j=0;
 while(i<b.length){const v=b.charCodeAt(i++);let n=0,m=1,c;do{c=b.charCodeAt(i++);n+=(c&127)*m;m*=128}while(c&128);g.fill(v,j,j+n);j+=n}
 return NG=g}
const NCOST=[250,1,25]; // rock, corridor, wall line / label
const cellOf=p=>{const W=NAVD.W,H=NAVD.H,C=NAVD.C,x=Math.min(W-1,Math.max(0,Math.floor(p[0]/C))),y=Math.min(H-1,Math.max(0,Math.floor(p[1]/C)));return y*W+x};
const cellXY=i=>[(i%NAVD.W)*NAVD.C+NAVD.C/2,Math.floor(i/NAVD.W)*NAVD.C+NAVD.C/2];
function navSnap(p){const g=navGrid(),W=NAVD.W,H=NAVD.H,i0=cellOf(p);if(g[i0]===1)return i0;const x0=i0%W,y0=(i0-x0)/W;let best=i0,bd=1e9;
 for(let dy=-12;dy<=12;dy++)for(let dx=-12;dx<=12;dx++){const x=x0+dx,y=y0+dy;if(x<0||y<0||x>=W||y>=H)continue;const i=y*W+x;if(g[i]===1){const d=dx*dx+dy*dy;if(d<bd){bd=d;best=i}}}return best}
const NSC={};const nodeCell=k=>NSC[k]!==undefined?NSC[k]:(NSC[k]=navSnap(NV[k]));
let NF=null;
// Walking cost from p to every cell, up to lim (map pixels; rock costs far more than corridor).
function navField(p,lim){const g=navGrid(),W=NAVD.W,H=NAVD.H,N=W*H,C=NAVD.C;
 if(!NF)NF={c:new Float64Array(N),pv:new Int32Array(N),st:new Uint32Array(N),dn:new Uint32Array(N),t:0};
 const F=NF;F.t++;const T=F.t,s=navSnap(p);F.start=s;
 const hk=[],hv=[];
 const push=(k,v)=>{let i=hk.length;hk.push(k);hv.push(v);while(i>0){const q=(i-1)>>1;if(hk[q]<=k)break;hk[i]=hk[q];hv[i]=hv[q];i=q}hk[i]=k;hv[i]=v};
 const pop=()=>{const k=hk[0],v=hv[0],lk=hk.pop(),lv=hv.pop(),n=hk.length;if(n){let i=0;while(true){let l=2*i+1,r=l+1,m=i,mk=lk;if(l<n&&hk[l]<mk){m=l;mk=hk[l]}if(r<n&&hk[r]<mk){m=r;mk=hk[r]}if(m===i)break;hk[i]=hk[m];hv[i]=hv[m];i=m}hk[i]=lk;hv[i]=lv}return[k,v]};
 const DX=[1,-1,0,0,1,1,-1,-1],DY=[0,0,1,-1,1,-1,1,-1],DL=[1,1,1,1,Math.SQRT2,Math.SQRT2,Math.SQRT2,Math.SQRT2];
 F.c[s]=0;F.pv[s]=-1;F.st[s]=T;push(0,s);
 while(hk.length){const[k,i]=pop();if(F.dn[i]===T)continue;F.dn[i]=T;if(k>lim)break;
  const x=i%W,y=(i-x)/W,ci=NCOST[g[i]];
  for(let d=0;d<8;d++){const nx=x+DX[d],ny=y+DY[d];if(nx<0||ny<0||nx>=W||ny>=H)continue;const j=ny*W+nx;if(F.dn[j]===T)continue;
   const nk=k+(ci+NCOST[g[j]])/2*DL[d]*C;if(F.st[j]!==T||nk<F.c[j]){F.st[j]=T;F.c[j]=nk;F.pv[j]=i;push(nk,j)}}}
 return F}
const reached=(F,i)=>F.st[i]===F.t&&F.dn[i]===F.t;
function navTrace(F,i){const P=[];let k=i,guard=0;while(k>=0&&guard++<200000){P.push(cellXY(k));if(k===F.start)break;k=F.pv[k]}return P}
function rdp(P,e){if(P.length<3)return P;const a=P[0],b=P[P.length-1],dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy)||1;let bi=0,bd=-1;
 for(let i=1;i<P.length-1;i++){const d=Math.abs(dx*(a[1]-P[i][1])-dy*(a[0]-P[i][0]))/L;if(d>bd){bd=d;bi=i}}
 return bd>e?rdp(P.slice(0,bi+1),e).slice(0,-1).concat(rdp(P.slice(bi),e)):[a,b]}
const plen=P=>{let L=0;for(let i=1;i<P.length;i++)L+=dist(P[i-1],P[i]);return L};
function polyAt(P,s){for(let i=1;i<P.length;i++){const L=dist(P[i-1],P[i]);if(s<=L||i===P.length-1){const t=L?Math.min(1,s/L):0;return{i,q:[P[i-1][0]+(P[i][0]-P[i-1][0])*t,P[i-1][1]+(P[i][1]-P[i-1][1])*t]}}s-=L}return{i:1,q:P[0]}}
const polyMid=P=>polyAt(P,plen(P)/2).q;
// corridor polyline of a route edge, from u to v
const EPC={};
function edgeRaw(key){if(EPC[key])return EPC[key];const f=NAVD.EP[key],[A,B]=key.split("~");let P=[];
 if(f){for(let i=0;i<f.length;i+=2)P.push([f[i],f[i+1]]);P[0]=NV[A].slice();P[P.length-1]=NV[B].slice()}else P=[NV[A],NV[B]];
 return EPC[key]=P}
const edgePts=(u,v)=>{const key=ek(u,v),P=edgeRaw(key);return u===key.split("~")[0]?P:P.slice().reverse()};
const edgeMid=(u,v)=>polyMid(edgeRaw(ek(u,v)));
const ESC={};
function edgeSamples(key){if(ESC[key])return ESC[key];const P=edgeRaw(key),S=[];let s=0;
 for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i],L=dist(a,b),n=Math.max(1,Math.ceil(L/6));for(let j=0;j<n;j++){const t=j/n,q=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];S.push({i:cellOf(q),s:s+L*t,q})}s+=L}
 S.push({i:cellOf(P[P.length-1]),s,q:P[P.length-1]});S.L=s;return ESC[key]=S}
// Attach a spot to the closest corridor of the route network, measured by walking (so never through a wall).
function nearEdgeW(p,a,self,lim){lim=lim||700;let F;try{F=navField(p,lim)}catch(e){return nearEdge(p,a,self)}
 let best=null,bd=1e18,sb=null,sd=1e18;
 NE.forEach(([u,v])=>{const key=ek(u,v);if(best&&best.key===key)return;const S=edgeSamples(key);let mc=1e18,mq=null;
  for(const q of S)if(reached(F,q.i)&&F.c[q.i]<mc){mc=F.c[q.i];mq=q}
  if(!mq)return;const o={key,q:mq,c:mc};if(mc<bd){bd=mc;best=o}if(a&&(NA[u]===a||NA[v]===a)&&mc<sd){sd=mc;sb=o}});
 if(!best)return lim<2600?nearEdgeW(p,a,self,2600):nearEdge(p,a,self);
 const o=sb&&sd<bd+140?sb:best,[A,B]=o.key.split("~"),P=edgeRaw(o.key),S=edgeSamples(o.key),L=S.L;
 const tail=rdp(navTrace(F,o.q.i),5);tail[0]=o.q.q;if(dist(tail[tail.length-1],p)>1)tail.push(p);const w=plen(tail);
 const at=polyAt(P,o.q.s),pre=P.slice(0,at.i).concat([at.q]),post=[at.q].concat(P.slice(at.i));
 let e=[{n:A,d:o.q.s+w,pts:pre.concat(tail.slice(1))},{n:B,d:(L-o.q.s)+w,pts:post.slice().reverse().concat(tail.slice(1))}];
 const t=L?o.q.s/L:0;
 if((GE[o.key]||[]).some(g=>GK[g.k].blk&&!(self&&g.need.includes(self))))e=[t>=.5?e[1]:e[0]];/* a spot behind a lock is only reached through it */
 e.gap=w;return e}
// Benches, Bellways and Ventrica: nearest waypoint by walking (precomputed; worked out live for moved pins).
const RAC={};
function restAttach(i){const p=placeOf(i),def=i.g?G[i.g].p:i.p,bp=NAVD.BP[i.id];
 if(bp&&NV[bp[0]]&&p[0]===def[0]&&p[1]===def[1]&&Math.hypot(bp[2][0]-p[0],bp[2][1]-p[1])<16){if(!bp.pts){const P=[];for(let j=0;j<bp[2].length;j+=2)P.push([bp[2][j],bp[2][j+1]]);P[P.length-1]=NV[bp[0]].slice();bp.pts=P}return{n:bp[0],d:bp[1],pts:bp.pts}}
 const key=i.id+"@"+p.join(",");if(RAC[key])return RAC[key];
 let r=null;try{const F=navField(p,900),a=areaOf(i);let best=null,bd=1e18,sb=null,sd=1e18;
  NK.forEach(k=>{const c=nodeCell(k);if(!reached(F,c))return;const x=F.c[c];if(x<bd){bd=x;best=k}if(NA[k]===a&&x<sd){sd=x;sb=k}});
  if(best){const n=sb&&sd<bd+140?sb:best,P=rdp(navTrace(F,nodeCell(n)),5).reverse();P[0]=p;P.push(NV[n]);r={n,d:plen(P),pts:P}}}catch(e){}
 if(!r){const[n,d]=nearNode(p,areaOf(i));r={n,d,pts:[p,NV[n]]}}
 return RAC[key]=r}
// Clear line through corridor only (no wall in between)?
function navSee(a,b){const g=navGrid(),L=dist(a,b),n=Math.max(1,Math.ceil(L/2));for(let j=0;j<=n;j++){const t=j/n;if(g[cellOf([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t])]!==1)return false}return true}
// Remove out-and-back spurs: where the path comes back to a spot it already passed, skip the detour in between.
function deloop(P){if(P.length<2)return P;const D=[P[0]];
 for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i],L=dist(a,b),n=Math.max(1,Math.ceil(L/3));for(let j=1;j<=n;j++){const t=j/n;D.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t])}}
 const W=NAVD.W,out=[],seen=new Map();
 for(const q of D){const c=cellOf(q),cx=c%W,cy=(c-cx)/W;let k=-1;
  for(let dy=-2;dy<=2&&k<0;dy++)for(let dx=-2;dx<=2;dx++){const h=seen.get((cy+dy)*W+cx+dx);if(h!==undefined&&h<out.length-8&&navSee(out[h],q)){k=h;break}}
  if(k>=0){for(let m=k+1;m<out.length;m++){const cc=cellOf(out[m]);if(seen.get(cc)===m)seen.delete(cc)}out.length=k+1}
  out.push(q);const cq=cellOf(q);if(!seen.has(cq))seen.set(cq,out.length-1)}
 out[0]=P[0];out[out.length-1]=P[P.length-1];
 return rdp(out,2.5).map(q=>[Math.round(q[0]),Math.round(q[1])])}

function solve(kind,id,startId,rides,maybe){
 const T=routeTarget(kind,id),TL=nearEdgeW(T.p,T.a,kind==="it"?id:null),td=TL.gap;
 const ways=!rides?[]:IT.filter(wayOK).map(i=>{const p=placeOf(i),A=restAttach(i);return{i,p,n:A.n,d:A.d,pts:A.pts,key:"W:"+i.id}});
 const nbr=k=>{
  if(k==="T")return TL.map(e=>({to:e.n,d:e.d}));
  if(k.startsWith("W:")){const w=ways.find(x=>x.key===k);return[{to:w.n,d:w.d}].concat(ways.filter(x=>x!==w&&x.i.t===w.i.t).map(x=>({to:x.key,d:TP,ride:1})))}
  const L=ADJ[k].slice();ways.forEach(w=>{if(w.n===k)L.push({to:w.key,d:w.d})});TL.forEach(e=>{if(e.n===k)L.push({to:"T",d:e.d})});return L};
 // Dijkstra from the target outward (one run gives the cost from every bench); stepping k→n here means you walk n→k.
 const D={T:0},PV={},done=new Set(),Q=[["T",0]];
 while(Q.length){Q.sort((a,b)=>a[1]-b[1]);const[k,c]=Q.shift();if(done.has(k))continue;done.add(k);
  nbr(k).forEach(e=>{let pen=0;if(NV[k]&&NV[e.to]){const ps=pass(e.to,k);if(ps.user)return;if(!ps.ok){if(!maybe)return;pen=LOCKED*ps.fails.length}}
   const nc=c+e.d+pen;if(D[e.to]===undefined||nc<D[e.to]){D[e.to]=nc;PV[e.to]=k;Q.push([e.to,nc])}})}
 const cands=IT.filter(i=>benchOK(i)&&!(kind==='it'&&i.id===id&&S.restAt!==id)).map(i=>{const p=placeOf(i),A=restAttach(i),n=A.n,d=A.d;return{i,p,n,pts:A.pts,cost:D[n]===undefined?Infinity:D[n]+d}}).concat(ways.map(w=>({i:w.i,p:w.p,n:w.key,way:1,cost:D[w.key]===undefined?Infinity:D[w.key]}))).filter(c=>c.cost<Infinity).sort((a,b)=>a.cost-b.cost);
 if(!cands.length)return{none:true,T};
 const mode=(R&&R.mode)||'bench';let st=startId&&cands.find(c=>c.i.id===startId);
 if(startId&&!st){const r=solve(kind,id,null,mode==='way',maybe);if(!r.none)r.note=`${byId(startId).n} has no way there, so this starts from the nearest ${mode==='way'?'Bellway':'bench'} that does.`;return r}
 const auto=!st;if(!st)st=mode==='way'?(cands.find(c=>c.way)||cands[0]):(cands.find(c=>!c.way)||cands[0]);
 const chain=[st.n];let k=st.n,guard=0;while(k!=="T"&&guard++<400){k=PV[k];if(k===undefined)break;chain.push(k)}
 const ptOf=k=>k==="T"?T.p:k.startsWith("W:")?ways.find(x=>x.key===k).p:NV[k];
 const segs=[];let prev=st.p;
 chain.forEach((k,j)=>{const p=ptOf(k),from=j?chain[j-1]:null;let ride=false,gs=[],fails=[];
  if(from){const e=nbr(from).find(x=>x.to===k)||{};ride=!!e.ride;if(NV[from]&&NV[k]){const ps=pass(from,k);gs=ps.gs;fails=ps.fails}}
  if(dist(prev,p)>1||ride)segs.push({a:prev,b:p,ride,from,to:k,gs,fails,lock:fails.length>0});prev=p});
 segs.forEach(sg=>{if(sg.ride)return;const f=sg.from,t=sg.to;let P=null;
  if(!f)P=st.pts;
  else if(f.startsWith("W:")&&NV[t]){const w=ways.find(x=>x.key===f);P=w&&w.pts}
  else if(NV[f]&&t.startsWith("W:")){const w=ways.find(x=>x.key===t);P=w&&w.pts.slice().reverse()}
  else if(NV[f]&&NV[t])P=edgePts(f,t);
  else if(NV[f]&&t==="T"){const e=TL.find(x=>x.n===f);P=e&&e.pts}
  sg.pts=P&&P.length>1?P.map(q=>[Math.round(q[0]),Math.round(q[1])]):[sg.a,sg.b]});
 const walks=[];let cw=null;segs.forEach(sg=>{if(sg.ride){cw=null;return}if(!cw){cw=[sg.pts[0]];walks.push(cw)}cw.push(...sg.pts.slice(1))});
 return{T,st,auto,cands,segs,walks:walks.map(w=>{try{return deloop(w)}catch(e){return w}}),far:td>350,miss:T.need.filter(n=>!req(n)),maybe};
}
// Everything still missing on a possible way (powers, bosses, keys), without repeats.
function stillNeed(r){const s=new Set();(r.segs||[]).forEach(sg=>sg.fails.forEach(g=>gateMiss(g).forEach(n=>s.add(n))));return[...s]}
const wayName=k=>{const w=byId(k.slice(2));return w?w.n.replace(/\s*\(.*\)/,""):"Bellway"};
const mid=s=>s.pts&&s.pts.length>2?polyMid(s.pts):[(s.a[0]+s.b[0])/2,(s.a[1]+s.b[1])/2];
function routeSteps(r){
 const out=[{c:"go",t:`${r.fromHere?"You're at":'Start at'} <b>${r.st.i.n.replace(/\s*\(\d+\)/,'')}</b>${r.st.i.t==='bellway'&&!/Bellway/.test(r.st.i.n)?' (Bellway)':r.st.i.t==='tube'&&!/Ventrica/.test(r.st.i.n)?' (Ventrica)':''}`,p:r.st.p}];let area=areaOf(r.st.i);
 r.segs.forEach(s=>{
  if(s.ride){out.push({c:"ride",t:`Ride the ${byId(s.from.slice(2)).t==="tube"?"Ventrica":"Bellway"}: <b>${wayName(s.from)}</b> → <b>${wayName(s.to)}</b>`,p:s.b});area=areaOf(byId(s.to.slice(2)));return}
  s.gs.forEach(g=>{const m=mid(s);
   if(g.k==="unsure")out.push({c:"chk",pp:[s.from,s.to],t:`Not verified: <b>${g.n}</b>. Blocked for you? Tap here.`,p:m});
   else if(s.fails.includes(g))out.push({c:"w",g:g.id,t:g.k==="shortcut"&&!g.need.filter(n=>!req(n)).length?`↩️ <b>${g.n}</b>: only opens from the other side`:`🔒 <b>${g.n}</b>: needs ${gateMiss(g).map(nm).join(" + ")}`,p:m});
   else if(g.k==="shortcut"&&!ticked(g))out.push({c:"use",g:g.id,t:`Open <b>${g.n}</b> on your way through, then tick it`,p:m});
   else if(g.k==="wall")out.push({c:"use",g:g.id,t:`🧱 Break <b>${g.n}</b>`,p:m});
   else if(g.k==="fight")out.push({c:ticked(g)?"":"use",g:g.id,t:ticked(g)?`Past <b>${g.n}</b> (cleared)`:`⚔️ Fight through <b>${g.n}</b>`,p:m});
   else if(g.k==="lever")out.push({c:"use",g:g.id,t:`🎚️ <b>${g.n}</b>`,p:m});
   else if(g.k==="toll"||g.k==="seal")out.push({c:"",g:g.id,t:`${GEMO[gIc(g)]} <b>${g.n}</b>`,p:m});
   else if(g.k==="key"&&!(S.open||{})[g.id])out.push({c:"use",g:g.id,t:`Unlock <b>${g.n}</b> with your ${g.need.map(nm).join(" + ")}`,p:m});
   else out.push({c:"use",g:g.id,t:g.k==="ability"||g.k==="door"?`Use <b>${g.need.map(nm).join(" + ")}</b>: ${g.n}`:g.k==="boss"?`Through <b>${g.n}</b> (beaten)`:`Through <b>${g.n}</b> (open)`,p:m})});
  const a=NA[s.to];if(a&&a!==area){area=a;out.push({c:"",t:`Head into <b>${aName(a)}</b>`,p:s.b})}});
 out.push({c:"end",t:`<b>${r.T.n}</b> is here`,p:r.T.p});
 return out}
// ---------- directions: from where you are, a few route options to pick from (like a maps app) ----------
const HERE_ID="~here";
const snm=n=>n.replace(/\s*\(.*?\)/g,'');
// Where you are: what you set, else the last thing you ticked off, else the bench you rest at.
function hereSpot(){const h=S.here;
 if(h&&h.id&&byId(h.id)){const i=byId(h.id);return{i,p:placeOf(i),id:i.id,n:snm(i.n),src:h.src||'pick'}}
 if(h&&h.p){const a=areaIdAt(...h.p),n=h.n||'The spot you picked';return{p:h.p,n,src:'map',i:{id:HERE_ID,n,t:'here',a,p:h.p}}}
 if(S.restAt&&byId(S.restAt)){const i=byId(S.restAt);return{i,p:placeOf(i),id:i.id,n:snm(i.n),src:'pick'}}
 return null}
function setHere(id){const i=byId(id);if(!i)return;S.here={id,src:'pick'};if(i.t==='bench')S.restAt=id;save(false);
 if(R){calcRoute();fitRoute();drawOv();routeBar();showSteps()}else{if(pickHere||sc_.querySelector('.herepick')){closeSheet();lastSheet=null;updReopen()}toast(`📍 You're at ${snm(i.n)}. Directions start here now.`);drawOv();if(sel===id)showItem(id,itemFrom)}}
function restHere(id){setHere(id)}
function setStart(v){if(v&&!v.startsWith('~'))setHere(v)}
var pickHere=false;
function startPickHere(){pickHere=true;setPlacing(false);document.body.classList.add("pickhere");closeDrawer();document.getElementById("lpop").classList.remove("on")}
function cancelPickHere(){endPickHere();if(R&&R.res&&!R.res.needHere)showSteps();else{closeSheet();drawOv()}}
function endPickHere(){pickHere=false;document.body.classList.remove("pickhere")}
function hereFromMap(x,y){const c=navSnap([x,y]);if(x<0||y<0||x>W||y>H||navGrid()[c]!==1){toast('That spot is off the map. Tap on a room or corridor.');return}const q=cellXY(c);if(dist(q,[x,y])<60){x=q[0];y=q[1]}endPickHere();const a=areaIdAt(x,y);S.here={p:[Math.round(x),Math.round(y)],n:a?'A spot in '+aName(a):'The spot you picked',src:'map'};save(false);
 if(R){calcRoute();fitRoute();drawOv();routeBar();showSteps()}else{if(sc_.querySelector('.herepick')){closeSheet();lastSheet=null;updReopen()}toast('📍 Got it. Directions start from there now.');drawOv()}}
// Fast-travel stations you can use. Once you've ticked any station of a kind as unlocked, only ticked ones count.
const waysAssumed=()=>{const U=IT.filter(wayOK);return["bellway","tube"].filter(t=>U.some(i=>i.t===t)&&!U.some(i=>i.t===t&&S.done[i.id]))};
function wayList(H){const U=IT.filter(wayOK),L=U.filter(i=>S.done[i.id]||!U.some(j=>j.t===i.t&&S.done[j.id]));
 if(H&&H.i.id!==HERE_ID&&wayOK(H.i)&&!L.includes(H.i))L.push(H.i);return L}
function attachStart(H,wk){const i=H.i,out=[];
 if(i.id!==HERE_ID&&wk["W:"+i.id])out.push({to:"W:"+i.id,d:0,pts:[H.p,H.p]});
 if(i.id!==HERE_ID&&REST(i)){const A=restAttach(i);out.push({to:A.n,d:A.d,pts:A.pts});return out}
 const E=nearEdgesW(H.p,i.id===HERE_ID?i.a:areaOf(i),i.id===HERE_ID?null:i.id);
 E.forEach(e=>out.push({to:e.n,d:e.d,pts:(e.pts||[NV[e.n],H.p]).slice().reverse()}));return out}
// Like nearEdgeW, but keeps the few closest corridors, so a spot next to a lock can still be reached from its open side.
function nearEdgesW(p,a,self){let F;try{F=navField(p,700)}catch(e){return nearEdgeW(p,a,self)}
 const C=[];NE.forEach(([u,v])=>{const key=ek(u,v),Sm=edgeSamples(key);let mc=1e18,mq=null;for(const q of Sm)if(reached(F,q.i)&&F.c[q.i]<mc){mc=F.c[q.i];mq=q}
  if(mq)C.push({key,q:mq,c:mc+((a&&(NA[u]===a||NA[v]===a))?0:140)})});
 if(!C.length)return nearEdgeW(p,a,self);
 C.sort((x,y)=>x.c-y.c);const lim=C[0].c+120,out=[];let gap=1e9;
 C.filter(x=>x.c<=lim).slice(0,4).forEach(o=>{const[A,B]=o.key.split("~"),P=edgeRaw(o.key),L=edgeSamples(o.key).L;
  const tail=rdp(navTrace(F,o.q.i),5);tail[0]=o.q.q;if(dist(tail[tail.length-1],p)>1)tail.push(p);const w=plen(tail);gap=Math.min(gap,w);
  const at=polyAt(P,o.q.s),pre=P.slice(0,at.i).concat([at.q]),post=[at.q].concat(P.slice(at.i));
  let e=[{n:A,d:o.q.s+w,pts:pre.concat(tail.slice(1))},{n:B,d:(L-o.q.s)+w,pts:post.slice().reverse().concat(tail.slice(1))}];const t=L?o.q.s/L:0;
  if((GE[o.key]||[]).some(g=>GK[g.k].blk&&!(self&&g.need.includes(self))))e=[t>=.5?e[1]:e[0]];
  out.push(...e)});
 out.gap=gap;return out}
// One route from where you are to the target. o.rides: may ride Bellways/Ventrica · o.pen: cost multipliers per passage (for alternatives)
// o.lockPen: extra cost per locked passage (leave out = locked passages are never used)
function solveFrom(C,o){o=o||{};const{T,TL,SL}=C,ways=o.rides?C.ways:[],pen=o.pen||{},lp=o.lockPen===undefined?Infinity:o.lockPen,wk={};ways.forEach(w=>wk[w.key]=w);
 const tid=R&&R.kind==='it'?R.id:null;
 const nbr=k=>{if(k==="S")return SL.filter(e=>!e.to.startsWith("W:")||wk[e.to]);if(k==="T")return[];
  if(k.startsWith("W:")){const w=wk[k],L=[{to:w.n,d:w.d}].concat(ways.filter(x=>x!==w&&x.i.t===w.i.t).map(x=>({to:x.key,d:TP,ride:1})));if(tid&&w.i.id===tid)L.push({to:"T",d:0});return L}
  const L=ADJ[k].slice();ways.forEach(w=>{if(w.n===k)L.push({to:w.key,d:w.d})});TL.forEach(e=>{if(e.n===k)L.push({to:"T",d:e.d})});return L};
 const D={S:0},PV={},done=new Set(),hk=[],hv=[];
 const push=(c,k)=>{let i=hk.length;hk.push(c);hv.push(k);while(i>0){const q=(i-1)>>1;if(hk[q]<=c)break;hk[i]=hk[q];hv[i]=hv[q];i=q}hk[i]=c;hv[i]=k};
 const pop=()=>{const c=hk[0],k=hv[0],lc=hk.pop(),lk=hv.pop(),n=hk.length;if(n){let i=0;while(true){let l=2*i+1,r=l+1,m=i,mc=lc;if(l<n&&hk[l]<mc){m=l;mc=hk[l]}if(r<n&&hk[r]<mc){m=r;mc=hk[r]}if(m===i)break;hk[i]=hk[m];hv[i]=hv[m];i=m}hk[i]=lc;hv[i]=lk}return[c,k]};
 push(0,"S");
 while(hk.length){const[c,k]=pop();if(done.has(k))continue;done.add(k);if(k==="T")break;
  nbr(k).forEach(e=>{let add=e.d;if(NV[k]&&NV[e.to]){const ps=pass(k,e.to);if(ps.user)return;if(!ps.ok){if(lp===Infinity)return;add+=lp*ps.fails.length}add*=(pen[ek(k,e.to)]||1)}
   const nc=c+add;if(D[e.to]===undefined||nc<D[e.to]){D[e.to]=nc;PV[e.to]={k,e};push(nc,e.to)}})}
 if(D.T===undefined)return null;
 const chain=[];let k="T",guard=0;while(k!=="S"&&guard++<2000){const p=PV[k];chain.unshift({from:p.k,to:k,e:p.e});k=p.k}
 const wp=k=>k==="T"?T.p:k==="S"?C.H.p:k.startsWith("W:")?wk[k].p:NV[k];
 let real=0;const segs=[];
 chain.forEach(({from,to,e})=>{real+=e.ride?TP:e.d;let gs=[],fails=[];if(NV[from]&&NV[to]){const ps=pass(from,to);gs=ps.gs;fails=ps.fails}
  const a=wp(from),b=wp(to);if(!e.ride&&dist(a,b)<=1)return;let P=null;
  if(e.ride)P=null;else if(from==="S")P=e.pts;else if(from.startsWith("W:")&&NV[to])P=wk[from].pts;else if(NV[from]&&to.startsWith("W:"))P=wk[to].pts.slice().reverse();
  else if(NV[from]&&NV[to])P=edgePts(from,to);else if(NV[from]&&to==="T"){const t=TL.find(x=>x.n===from);P=t&&t.pts}
  segs.push({a,b,ride:!!e.ride,from:from==="S"?null:from,to,gs,fails,lock:fails.length>0,pts:P&&P.length>1?P.map(q=>[Math.round(q[0]),Math.round(q[1])]):[a,b]})});
 const walks=[];let cw=null;segs.forEach(sg=>{if(sg.ride){cw=null;return}if(!cw){cw=[sg.pts[0]];walks.push(cw)}cw.push(...sg.pts.slice(1))});
 const ekm=new Map();segs.forEach(sg=>{if(NV[sg.from]&&NV[sg.to])ekm.set(ek(sg.from,sg.to),plen(sg.pts))});
 return{T,st:{i:C.H.i,p:C.H.p},auto:false,cands:[],segs,walks:walks.map(w=>{try{return deloop(w)}catch(e){return w}}),far:C.td>350,miss:T.need.filter(n=>!req(n)),
  maybe:lp!==Infinity,blocked:segs.some(s=>s.lock),real,ekm,fromHere:true}}
// Share of route a's passages that route b also uses (by length).
function overlap(a,b){let t=0,sh=0;a.ekm.forEach((L,k)=>{t+=L;if(b.ekm.has(k))sh+=L});return t?sh/t:1}
const wName=k=>{const n=snm(wayName(k)).replace(/ (Bellway|Ventrica)$/,'');return n==='Grand'?'Grand Bellway':n};
const needTxt=L=>L.map(n=>{const t=nm1(n).replace(/^Finished /,'Finish ');return /^(Beat|Open|Finish|Reach) /.test(t)?t[0].toLowerCase()+t.slice(1):'get '+t}).join(' and ');
function labelRoute(r){const rides=r.segs.filter(s=>s.ride),ty=rides.map(s=>byId(s.from.slice(2)).t);r.rides=rides.length;
 r.icon=r.blocked?'🔒':rides.length?(ty.every(t=>t==='tube')?'🚋':'🔔'):'🚶';
 const rideTxt=rides.map(s=>`${wName(s.from)} → ${wName(s.to)}`).join(', then ');
 r.need=r.blocked?stillNeed(r):[];
 r.title=r.blocked?`Shorter once you ${needTxt(r.need)}`:rides.length?`${ty.every(t=>t==='tube')?'Ventrica':'Bellway'}: ${rideTxt}`:r.alt?'Walk, another way':'Walk';if(r.alt&&rides.length&&!r.blocked)r.title+=' (another way)';
 if(r.blocked&&rides.length)r.title+=` (rides ${rideTxt})`;
 const sa=areaOf(r.st.i),ea=r.T.a,seen=[];r.segs.forEach(s=>{if(s.ride)return;const a=NA[s.to];if(a&&a!==sa&&a!==ea&&!seen.includes(a))seen.push(a)});
 r.via=seen.map(aName).filter(Boolean);r.span=sa&&ea&&sa!==ea?`${aName(sa)} → ${aName(ea)}`:aName(ea||sa);
 let todo=0;r.segs.forEach(s=>s.gs.forEach(g=>{if(s.fails.includes(g))return;if((GK[g.k].tick&&!ticked(g)&&g.k!=="key")||((g.k==="ability"||g.k==="door")&&g.need.length))todo++}));r.todo=todo;
 r.sig=(r.blocked?'L':'O')+(r.alt?'a':'')+':'+rides.map(s=>s.from+'>'+s.to).join(',');return r}
function planRoutes(){const T=routeTarget(R.kind,R.id),H=hereSpot();
 if(!H){ // nobody told us where they are yet: start from the nearest bench, and ask
  if(!IT.some(benchOK))return[{needHere:true,none:true,T}];
  let r=solve(R.kind,R.id,null,false,false);if(r.none){r=Object.assign(solve(R.kind,R.id,null,false,true),{blocked:true})}
  if(r.none)return[r];r.icon='🪑';r.title='From the nearest bench to it';r.via=[];r.span='';r.rides=0;r.todo=0;r.need=r.blocked?stillNeed(r):[];r.sig='fb';r.noHere=true;r.real=0;return[r]}
 const TL=nearEdgesW(T.p,T.a,R.kind==="it"?R.id:null);
 const ways=wayList(H).map(i=>{const A=restAttach(i);return{i,p:placeOf(i),n:A.n,d:A.d,pts:A.pts,key:"W:"+i.id}}),wk={};ways.forEach(w=>wk[w.key]=w);
 const C={T,TL,td:TL.gap,H,ways,SL:attachStart(H,wk)};
 const open=[],same=(a,b)=>a.rides===b.rides&&overlap(a,b)>.85&&overlap(b,a)>.85&&a.segs.filter(s=>s.ride).map(s=>s.from+s.to).join()===b.segs.filter(s=>s.ride).map(s=>s.from+s.to).join();
 const add=r=>{if(!r||r.blocked)return;labelRoute(r);if(open.some(o=>same(o,r)))return;open.push(r)};
 const best=solveFrom(C,{rides:true}),walk=ways.length?solveFrom(C,{rides:false}):null;
 add(best);add(walk);
 // A different way round: make the passages of a route expensive and look again.
 const altOf=b=>{if(!b)return;const pen={};b.ekm.forEach((L,k)=>pen[k]=3.5);const a=solveFrom(C,{rides:b.rides>0,pen});if(a&&!a.blocked&&a.real<=b.real*1.7&&overlap(a,b)<.65){a.alt=1;add(a)}};
 open.sort((a,b)=>a.real-b.real);const base=open.slice();base.forEach(b=>{if(open.length<3)altOf(b)});
 open.sort((a,b)=>a.real-b.real);
 const out=open.slice(0,3),bestReal=out.length?out[0].real:Infinity;
 if(out.length){out[0].fastest=1;out.forEach(r=>r.pct=Math.round((r.real/bestReal-1)*100))}
 // A shorter way that's still locked: worth knowing about (a power or shortcut you're about to get).
 const ideal=solveFrom(C,{rides:true,lockPen:0});
 if(ideal&&ideal.blocked){labelRoute(ideal);if(out.length&&ideal.need.length<=2&&ideal.real<bestReal*.75){ideal.save=Math.round((1-ideal.real/bestReal)*100);out.push(ideal)}}
 if(!out.length){ // nothing open yet: the possible way with the fewest locks, plus the shortest one if it's different
  const pw=solveFrom(C,{rides:true,lockPen:LOCKED});
  if(pw){labelRoute(pw);pw.sig='P'+pw.sig;if(ideal&&ideal.blocked&&overlap(ideal,pw)>.85&&overlap(pw,ideal)>.85&&ideal.rides===pw.rides)ideal.drop=1;out.push(pw)}
  if(ideal&&ideal.blocked&&!ideal.drop&&ideal.need.length<=2&&(!pw||ideal.real<pw.real*.85))out.push(ideal);
  out.forEach(r=>{r.save=0;r.title=r.title.replace(/^Shorter once you/,'Possible once you')});
  if(out.length>1&&out[1]===ideal)ideal.title=ideal.title.replace(/^Possible once you/,'Shortest, once you')}
 // A station you haven't ticked as unlocked that would make the trip much shorter: ask about it.
 // A shorter way that is only shut because of shortcuts (a lever, a one-way gate) you may have opened already without ticking them: ask about it.
 R.scHint=null;if(ideal&&ideal.blocked){const nd=stillNeed(ideal),ref=out.find(o=>!o.blocked);
  if(nd.length&&nd.length<=3&&nd.every(n=>n.startsWith("O:"))&&(!ref||ideal.real<ref.real*.9))R.scHint={ids:nd.map(n=>n.slice(2)),save:ref?Math.round((1-ideal.real/ref.real)*100):0}}
 R.stHint=null;const allW=IT.filter(wayOK);
 if(allW.some(i=>!ways.some(w=>w.i===i))){const ways2=allW.map(i=>{const A=restAttach(i);return{i,p:placeOf(i),n:A.n,d:A.d,pts:A.pts,key:"W:"+i.id}}),wk2={};ways2.forEach(w=>wk2[w.key]=w);
  const r2=solveFrom({T,TL,td:TL.gap,H,ways:ways2,SL:attachStart(H,wk2)},{rides:true}),ref=out.find(o=>!o.blocked);
  if(r2&&!r2.blocked&&(!ref||r2.real<ref.real*.75)){const ids=[];r2.segs.forEach(sg=>{if(sg.ride)[sg.from,sg.to].forEach(k=>{const id=k.slice(2);if(!S.done[id]&&!ids.includes(id))ids.push(id)})});
   if(ids.length)R.stHint={ids,save:ref?Math.round((1-r2.real/ref.real)*100):0}}}
 if(!out.length)return[{none:true,T,blocked:true}];
 return out}
function showWay(kind,id){if(moved>=8)return;R={kind,id,pot:false};closeSheet();closeDrawer();openC=null;calcRoute();fitRoute();drawOv();routeBar();showSteps()}
// First try with what you have now; if there's no way, the options explain what's missing.
function calcRoute(){if(!R)return null;let opts=[];try{opts=planRoutes()}catch(e){console.error(e);opts=[{none:true,T:routeTarget(R.kind,R.id),blocked:true}]}
 R.opts=opts.filter(o=>!o.none);
 if(!R.opts.length){R.res=opts[0];R.sel=0;return R.res}
 // Keep a route you picked yourself only while you're still at the same spot; otherwise always show the fastest one.
 const H=hereSpot(),ctx=H?(H.id||H.p.join(",")):"";if(R.ctx!==ctx){R.ctx=ctx;R.picked=false}
 let j=R.picked?R.opts.findIndex(o=>o.sig===R.selSig):-1;
 if(j<0){j=R.opts.findIndex(o=>!o.blocked);if(j<0)j=0;R.pot=false;R.picked=false}
 R.sel=j;R.res=R.opts[j];R.selSig=R.res.sig;if(R.res.blocked&&R.opts.some(o=>!o.blocked))R.pot=true;return R.res}
function pickOpt(j){if(!R||!R.opts||!R.opts[j]||moved>=8)return;R.picked=true;R.sel=j;R.res=R.opts[j];R.selSig=R.res.sig;R.pot=!!R.res.blocked;fitRoute();drawOv();routeBar();showSteps()}
function routeBar(){const b=document.getElementById("rbar"),r=R&&R.res;if(!r){b.classList.remove("on");return}
 const x=`<button class="rx" aria-label="End route" onclick="clearRoute()">✕</button>`;b.classList.remove("blk");
 if(r.needHere){b.innerHTML=`<div class="rt" onclick="showHerePick()"><b>🧭 ${r.T.n}</b><small>Where are you? Tap to set it</small></div><button onclick="showHerePick()">📍 Set</button>${x}`;b.classList.add("on");return}
 const need=r.blocked?stillNeed(r).map(nm1).join(", "):"",n=(R.opts||[]).length;
 b.classList.toggle("blk",!!r.blocked);
 if(r.blocked&&r.none)b.innerHTML=`<div class="rt" onclick="showSteps()"><b>🔒 No known way to ${r.T.n}</b><small>Passages you marked blocked cut it off</small></div><button onclick="showSteps()">Why?</button>${x}`;
 else if(r.blocked&&!R.pot)b.innerHTML=`<div class="rt" onclick="showSteps()"><b>🔒 Can't reach ${r.T.n} yet</b><small>Needs ${need}</small></div><button onclick="showSteps()">Why?</button>${x}`;
 else{const H=hereSpot();b.innerHTML=`<div class="rt" onclick="showSteps()"><b>${r.blocked?'🔒 Possible way to ':'🧭 To '}${r.T.n}</b><small>${r.blocked?'once you have '+need:`📍 From ${H?H.n:snm(r.st.i.n)}${r.rides?' · '+(r.icon||'')+' '+r.title.replace(/^(Bellway|Ventrica): /,''):''}${r.miss.length?' · ⚠️ needs more to get it':''}`}</small></div><button onclick="showSteps()">${n>1?n+' routes':'Steps'}</button>${x}`}
 b.classList.add("on")}
// "Where are you?" picker
function showHerePick(){const H=hereSpot(),list=IT.filter(i=>REST(i)&&S.areas[areaOf(i)]),back=R&&R.res&&!R.res.needHere;
 const grp={};list.forEach(i=>{(grp[areaOf(i)]=grp[areaOf(i)]||[]).push(i)});
 const ico=i=>i.t==='bench'?'🪑':i.t==='tube'?'🚋':'🔔';
 const opts=AREAS.filter(a=>grp[a.id]).map(a=>`<optgroup label="${a.n}">${grp[a.id].map(i=>`<option value="${i.id}" ${H&&H.id===i.id?'selected':''}>${ico(i)} ${snm(i.n)}</option>`).join('')}</optgroup>`).join('');
 const c=[vb[0]+vb[2]/2,vb[1]+vb[3]/2],near=list.slice().sort((a,b)=>dist(placeOf(a),c)-dist(placeOf(b),c)).slice(0,4);
 sc_.innerHTML=`${back?'<button class="back" onclick="cancelPickHere()">‹ Back to the route</button>':''}<div class="rsheet herepick"><div class="sh"><div class="t"><b>📍 Where are you?</b><br><small>${R&&R.res&&R.res.T?'Directions to '+R.res.T.n+' start from here.':'Directions will start from here.'}</small></div><button class="x" aria-label="Close" onclick="cancelPickHere()">✕</button></div>
 <div class="hpk"><span class="hi" aria-hidden="true">👆</span><span>Tap the map where you are, or pick a bench below.</span></div>
 ${near.length?`<div class="needl">Nearby</div><div class="kids">${near.map(i=>`<button class="btn" onclick="setHere('${i.id}')">${ico(i)} ${snm(i.n)} <small>· ${aName(areaOf(i))}</small></button>`).join('')}</div>`:''}
 ${list.length?`<div class="needl">Or any bench or station</div><select class="stsel" aria-label="Pick a bench or station" onchange="if(this.value)setHere(this.value)"><option value="">Choose…</option>${opts}</select>`:'<p><small>No benches in the areas you\'ve turned on yet. Tap the map instead.</small></p>'}
 <small style="display:block;margin-top:10px">It also follows the last thing you tick off.</small></div>`;
 sheet.classList.add("up");sheet.scrollTop=0;sheetFull(false);startPickHere()}
function markShortcuts(){S.open=S.open||{};(R&&R.scHint?R.scHint.ids:[]).forEach(id=>S.open[id]=1);save();refresh();showSteps()}
function markStations(){(R&&R.stHint?R.stHint.ids:[]).forEach(id=>S.done[id]=1);save();refresh();showSteps()}
function markBB(){S.done.bellb=1;save();refresh();showSteps()}
function optCard(r,j){const on=j===R.sel,b=[];
 const tag=r.fastest?'<span class="otag ok">Fastest</span>':r.blocked?`<span class="otag no">${r.save>0?r.save+'% shorter':'Locked'}</span>`:r.pct>=5?`<span class="otag">+${r.pct}%</span>`:'';
 const title=r.blocked?r.title:r.rides?r.title.replace(/^(Bellway|Ventrica): /,'').replace(/ \(another way\)$/,''):r.title;
 if(on){if(r.rides)b.push(`${r.rides} ride${r.rides>1?'s':''}`);if(r.todo)b.push(`✦ ${r.todo} to open or use`)}
 const via=r.via&&r.via.length?'via '+r.via.join(' · '):r.span||'';
 return `<button class="ropt ${on?'on':''} ${r.blocked?'lk':''}" role="radio" aria-checked="${on}" onclick="pickOpt(${j})"><span class="rad" aria-hidden="true"></span><span class="oi">${r.icon}</span><span class="ot"><b>${title}${r.alt&&r.rides?' <small class="alt">other way</small>':''}</b>${on&&(via||b.length)?`<small>${[via].concat(b).filter(Boolean).join(' · ')}</small>`:''}</span>${tag}</button>`}
function showSteps(){const r=R&&R.res;if(!r)return;sel=null;openG=null;selMk=null;let h="";
 if(r.needHere){showHerePick();return}
 const H=hereSpot(),x=`<button class="x" aria-label="Close" onclick="closeSheet();drawOv()">✕</button>`;
 const head=t=>`<div class="sh"><div class="t"><b>${t}</b></div>${x}</div>`;
 const fromRow=H?`<button class="ftr" onclick="showHerePick()" aria-label="Change where you start"><span class="dt f"></span><span class="fl"><small>From</small><b>${H.n}</b></span><span class="cg">Change</span></button>`
  :`<button class="ftr nf" onclick="showHerePick()" aria-label="Set where you are"><span class="dt f"></span><span class="fl"><small>From · where are you?</small><b>${r.st?snm(r.st.i.n):'The nearest bench'}</b><em>A guess. Tap to set your real spot.</em></span><span class="cg">Set</span></button>`;
 const from=`<div class="fromto"><span class="ln"></span>${fromRow}<hr><div class="ftr"><span class="dt t"></span><span class="fl"><small>To</small><b>${r.T.n}</b></span></div></div>`;
 if(r.none){h=`<div class="rsheet">${head('🔒 No known way')}${from}<p><small>Even with every power, the passages you marked as blocked cut it off.</small></p>${passList()||''}<div class="acts"><button class="sec" onclick="clearRoute()">End route</button></div></div>`;
  sc_.innerHTML=h;sheet.classList.add("up");return}
 const ops=R.opts||[];
 const cards=ops.length>1||!r.noHere?`<div class="rhd"><b>${ops.length>1?ops.length+' ways to get there':'Route'}</b>${ops.length>1?'<small>Tap one to use it</small>':''}</div><div class="ropts" role="radiogroup" aria-label="Routes">${ops.map(optCard).join('')}</div>`:'';
 const bellHint=!has("bellb")&&IT.some(i=>i.t==='bellway'&&S.areas[areaOf(i)])?`<div class="hint"><span>🔔 Beaten the Bell Beast? Then routes can ride the Bellway.</span><button onclick="markBB()">Yes</button></div>`:'';
 const rideT=r.segs?r.segs.filter(s=>s.ride).map(s=>byId(s.from.slice(2)).t):[],asm=waysAssumed().filter(t=>rideT.includes(t));
 const help=`<details class="more"><summary>Route looks wrong?</summary><p><small>Tap the line on the map where it goes wrong to mark a passage blocked or one-way, like a shortcut you haven't opened yet.${asm.length?` Rides count every ${asm.includes('bellway')?'Bellway':'Ventrica'} station in the areas you've visited as unlocked; tick the ones you've opened (Checklist → 🪑 Benches) to use only those.`:''}${r.far?' The last stretch is a straight line: this spot is off the mapped paths.':''}</small></p></details>`;
 if(r.blocked&&!R.pot){
  h=`<div class="rsheet">${head("🔒 Can't get there yet")}${from}
  <div class="needl">What's in the way</div>${blockRow(r)}
  <div class="wayr"><button class="way" onclick="showPot(true)">Show the possible way</button></div>
  <div class="acts"><button class="sec" onclick="clearRoute()">End route</button></div></div>`;
  sc_.innerHTML=h;sheet.classList.add("up");sheet.scrollTop=0;fitRoute();drawOv();return}
 const steps=routeSteps(r);
 h=`<div class="rsheet">${head('🧭 Directions')}
 ${from}${R.stHint?`<div class="hint"><span>🔔 Unlocked ${R.stHint.ids.map(id=>'<b>'+snm(byId(id).n)+'</b>').join(' and ')}? Riding from there is ${R.stHint.save>0?R.stHint.save+'% ':''}shorter.</span><button onclick="markStations()">Yes</button></div>`:''}${R.scHint?`<div class="hint"><span>↩️ Already opened ${R.scHint.ids.map(id=>'<b>'+gById(id).n+'</b>').join(' and ')}? ${R.scHint.save>0?"Going through is "+R.scHint.save+"% shorter.":"Then there is a way through."}</span><button onclick="markShortcuts()">Yes</button></div>`:''}${cards}${bellHint}
 ${r.blocked?`<div class="rq"><div class="warn">Not open for you yet. Still needed:</div><div>${reqChips(stillNeed(r),'')}</div></div>`:''}
 ${r.miss.length?`<div class="rq"><div class="warn">You can walk there, but to get it you still need:</div><div>${reqChips(r.miss,'')}</div></div>`:''}
 <div class="needl">Steps${ops.length>1?' for the chosen route':''}</div><ol class="steps">${steps.map((s,j)=>`<li class="stp ${s.c}" onclick="${s.pp?`tapPass('${s.pp[0]}','${s.pp[1]}')`:s.g?`showGate('${s.g}')`:`lookAt(${s.p[0]},${s.p[1]})`}"><span class="n">${s.c==='chk'?'?':s.c==='w'?'🔒':s.c==='use'?'✦':s.c==='ride'?'🔔':s.c==='end'?'★':j+1}</span><span>${s.t}</span></li>`).join("")}</ol>
 ${help}
 <div class="acts"><button class="sec" onclick="clearRoute()">End route</button></div></div>`;
 sc_.innerHTML=h;sheet.classList.add("up");sheet.scrollTop=0;fitRoute();drawOv()}
// The other route options, greyed out under the chosen one. Tap one to switch, like a maps app.
function altSVG(r,s,k){let o="",top="";const ops=R.opts||[];if(ops.length<2)return{o,top};
 const mainPts=[];(r.walks||[]).forEach(w=>{for(let i=1;i<w.length;i++){const a=w[i-1],b=w[i],L=dist(a,b),n=Math.max(1,Math.ceil(L/25));for(let j=0;j<n;j++)mainPts.push([a[0]+(b[0]-a[0])*j/n,a[1]+(b[1]-a[1])*j/n])}});
 ops.forEach((a,j)=>{if(a===r||!a.walks)return;const col=a.blocked?'#e8898a':'#aab3bb';
  a.walks.forEach(pts=>{const P=pts.map(p=>p.join(",")).join(" ");
   o+=`<g class="ic alt" onclick="pickOpt(${j})"><polyline points="${P}" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="${10*s}" stroke-linejoin="round" stroke-linecap="round"/><polyline points="${P}" fill="none" stroke="${col}" stroke-width="${5*s}" stroke-linejoin="round" stroke-linecap="round" ${a.blocked?`stroke-dasharray="${8*s} ${6*s}"`:''}/><polyline points="${P}" fill="none" stroke="transparent" stroke-width="${24*s}" stroke-linecap="round" stroke-linejoin="round"/></g>`});
  a.segs.filter(sg=>sg.ride).forEach(sg=>{const d=dist(sg.a,sg.b),mx=(sg.a[0]+sg.b[0])/2,my=(sg.a[1]+sg.b[1])/2-Math.min(260,d*.28);
   o+=`<g class="ic alt" onclick="pickOpt(${j})"><path d="M${sg.a[0]} ${sg.a[1]} Q${mx} ${my} ${sg.b[0]} ${sg.b[1]}" fill="none" stroke="#7fb8c2" stroke-opacity=".8" stroke-width="${4*s}" stroke-dasharray="${10*s} ${8*s}"/><path d="M${sg.a[0]} ${sg.a[1]} Q${mx} ${my} ${sg.b[0]} ${sg.b[1]}" fill="none" stroke="transparent" stroke-width="${22*s}"/></g>`});
  // label it where it strays furthest from the chosen route
  let bp=null,bd=-1;a.walks.forEach(w=>{for(let i=1;i<w.length;i++){const p=[(w[i-1][0]+w[i][0])/2,(w[i-1][1]+w[i][1])/2];let m=1e9;for(const q of mainPts){const d=dist(p,q);if(d<m)m=d}if(m>bd){bd=m;bp=p}}});
  if(!bp&&a.segs.some(sg=>sg.ride)){const sg=a.segs.find(x=>x.ride);bp=[(sg.a[0]+sg.b[0])/2,(sg.a[1]+sg.b[1])/2-Math.min(260,dist(sg.a,sg.b)*.28)/2]}
  if(!bp)return;const lbl=`${a.icon} ${a.blocked?(a.save>0?a.save+'% shorter':'Locked'):a.fastest?'Fastest':'+'+a.pct+'%'}`,w=lbl.length*5.6+16;
  top+=`<g class="ic tgt" transform="translate(${bp[0]} ${bp[1]}) scale(${k})" onclick="pickOpt(${j})" style="cursor:pointer"><rect x="${-w/2}" y="-10" width="${w}" height="20" rx="10" fill="${a.blocked?'#7a2424':'#3a322d'}" stroke="#fff" stroke-width="1.2"/><text y="4" font-size="10" font-weight="800" fill="#fff" text-anchor="middle">${lbl}</text></g>`});
 return{o,top}}
// Your spot on the map, even without a route (like the blue dot in a maps app).
function youPin(p,k){return `<g transform="translate(${p[0]} ${p[1]}) scale(${k})" pointer-events="none"><circle r="9" fill="#1c7ed6" fill-opacity=".25"/><circle r="5.5" fill="#1c7ed6" stroke="#fff" stroke-width="2"/><rect x="-16" y="-27" width="32" height="15" rx="7.5" fill="#1c7ed6" stroke="#fff" stroke-width="1.1"/><text y="-16.5" font-size="9" font-weight="800" fill="#fff" text-anchor="middle">YOU</text></g>`}
// ---------- bottom sheet: opens small with the essentials; drag or tap the handle for more ----------
function sheetOvf(){const v=sheet.scrollHeight>sheet.clientHeight+6;if(v!==sheet.classList.contains("ovf"))sheet.classList.toggle("ovf",v)}
function sheetFull(v){sheet.classList.remove("free");sheet.style.maxHeight="";sheet.style.height="";sheet.classList.toggle("full",v);if(!v)sheet.scrollTop=0;requestAnimationFrame(sheetOvf);if(R&&R.res)setTimeout(()=>{fitRoute();drawOv()},240)}
(function(){const g=sheet.querySelector(".grab");let wasUp=sheet.classList.contains("up");
 new MutationObserver(()=>{const up=sheet.classList.contains("up");if(up!==wasUp){wasUp=up;if(sheet.classList.contains("full"))sheet.classList.remove("full")}requestAnimationFrame(sheetOvf);updReopen()}).observe(sheet,{attributes:true,attributeFilter:["class"]});
 new MutationObserver(()=>{requestAnimationFrame(sheetOvf);if(pickHere&&!sc_.querySelector(".herepick"))endPickHere()}).observe(sc_,{childList:true,subtree:true});
 const peekH=()=>Math.min(innerHeight*(innerWidth>=700?.6:.44),innerWidth>=700?innerHeight:380),fullH=()=>innerHeight*.88;
 // One drag, from the handle or the title. The card follows your finger and STAYS at the height where you let go (Brent, 13 Oct 2026: no snapping).
 // It only snaps at the very ends: at the top it becomes full, at the bottom it closes. At a hand-set height ("free") the content scrolls inside and only the handle/title resizes.
 let d=null,eatClick=false;
 const begin=(y,x,fromGrab)=>{d={y0:y,x0:x,y,t:performance.now(),hist:[[performance.now(),y]],h0:sheet.offsetHeight,full:sheet.classList.contains("full"),free:sheet.classList.contains("free"),st:sheet.scrollTop,grab:fromGrab,on:false}};
 const decide=(y,x)=>{if(!d||d.on)return d&&d.on;const dy=y-d.y0,dx=x-d.x0;if(Math.abs(dy)<8||Math.abs(dy)<Math.abs(dx))return false;
  if(d.grab||(!d.free&&dy<0&&!d.full)||(dy>0&&sheet.scrollTop<=0)){d.on=true;d.y0=y;sheet.classList.add("dragging");return true}d=null;return false};
 const follow=y=>{const now=performance.now();d.y=y;d.hist.push([now,y]);while(d.hist.length>2&&now-d.hist[0][0]>120)d.hist.shift();
  const h=Math.max(40,Math.min(fullH(),d.h0-(y-d.y0)));sheet.style.maxHeight=h+"px";sheet.style.height=h+"px"};
 const finish=()=>{if(!d)return;const was=d;d=null;if(!was.on)return;eatClick=true;setTimeout(()=>eatClick=false,350);
  const h=sheet.offsetHeight,fu=fullH();sheet.classList.remove("dragging");
  if(h>=fu-26){sheetFull(true);return}                                   // all the way up: full
  if(h<=96){sheet.classList.remove("free");sheet.style.maxHeight="";sheet.style.height="";closeSheet();drawOv();return} // all the way down: close
  sheet.classList.remove("full");sheet.classList.add("free");sheet.style.maxHeight=h+"px";sheet.style.height=h+"px"; // anywhere else: stay right here
  requestAnimationFrame(sheetOvf);if(R&&R.res)setTimeout(()=>{fitRoute();drawOv()},240)};
 // touch (phones): non-passive so the page doesn't scroll while the sheet is being dragged
 sheet.addEventListener("touchstart",e=>{if(e.touches.length!==1){d=null;return}if(e.target.closest("input,select,textarea"))return;const t=e.touches[0];begin(t.clientY,t.clientX,!!e.target.closest(".grab,.sh")&&!e.target.closest("button:not(.grab),a,input"))},{passive:true});
 sheet.addEventListener("touchmove",e=>{if(!d)return;const t=e.touches[0];if(!decide(t.clientY,t.clientX))return;if(e.cancelable)e.preventDefault();follow(t.clientY)},{passive:false});
 sheet.addEventListener("touchend",finish);sheet.addEventListener("touchcancel",finish);
 // mouse (PC): drag the handle or the title area
 sheet.addEventListener("pointerdown",e=>{if(e.pointerType!=="mouse"||e.button!==0||!e.target.closest(".grab,.sh"))return;if(e.target.closest("button:not(.grab),input,select,a"))return;e.preventDefault();begin(e.clientY,e.clientX,true);try{sheet.setPointerCapture(e.pointerId)}catch(_){}});
 sheet.addEventListener("dragstart",e=>e.preventDefault());
 sheet.addEventListener("pointermove",e=>{if(!d||e.pointerType!=="mouse")return;if(!decide(e.clientY,e.clientX))return;follow(e.clientY)});
 sheet.addEventListener("pointerup",e=>{if(e.pointerType==="mouse")finish()});sheet.addEventListener("pointercancel",e=>{if(e.pointerType==="mouse")finish()});
 // a drag that started on a button is not a tap on that button
 sheet.addEventListener("click",e=>{if(eatClick){e.stopPropagation();e.preventDefault();eatClick=false}},true);
 g.addEventListener("click",()=>{if(!eatClick)sheetFull(!sheet.classList.contains("full"))});
 g.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();sheetFull(!sheet.classList.contains("full"))}});
 sheet.addEventListener("wheel",e=>{if(e.deltaY>0&&!sheet.classList.contains("full")&&sheet.classList.contains("ovf"))sheetFull(true)},{passive:true});
 // keep the "open again" button in step with the drawer, marker placing and pick mode
 new MutationObserver(updReopen).observe(document.body,{attributes:true,attributeFilter:["class"]});
})();

const routeShown=r=>r&&!r.none&&(!r.blocked||R.pot);
function fitRoute(){const r=R&&R.res;if(!r)return;const cw=svg.clientWidth,ch=svg.clientHeight,top=70,fr=sheet.classList.contains("up")?Math.min(.62,sheet.offsetHeight/ch):0,usable=Math.max(120,ch*(1-fr)-top-10);
 let x0,x1,y0,y1;if(!routeShown(r)){const p=r.T.p;x0=p[0]-200;x1=p[0]+200;y0=p[1]-200;y1=p[1]+200}
 else{const xs=[r.st.p[0]],ys=[r.st.p[1]];r.segs.forEach(s=>(s.pts||[s.b]).forEach(q=>{xs.push(q[0]);ys.push(q[1])}));x0=Math.min(...xs)-50;x1=Math.max(...xs)+50;y0=Math.min(...ys)-60;y1=Math.max(...ys)+40;
  const mw=260;if(x1-x0<mw){const c=(x0+x1)/2;x0=c-mw/2;x1=c+mw/2}if(y1-y0<mw*.8){const c=(y0+y1)/2;y0=c-mw*.4;y1=c+mw*.4}}
 const s=Math.max((x1-x0)/(cw-24),(y1-y0)/usable),cx=(x0+x1)/2,cy=(y0+y1)/2;
 vb=[cx-cw*s/2,cy-usable*s/2-top*s,cw*s,ch*s];setVB()}
function clearRoute(){R=null;if(pickHere)endPickHere();document.getElementById("rbar").classList.remove("on");if(sheet.classList.contains("up")&&sc_.querySelector(".rsheet"))closeSheet();if(lastSheet&&(lastSheet.kind==="route"||lastSheet.kind==="here"))lastSheet=null;updReopen();drawOv()}

function showPot(v){if(!R)return;R.pot=v;fitRoute();drawOv();routeBar();showSteps()}

function blockRow(r){const need=stillNeed(r);const gs=[];r.segs.forEach(s=>s.fails.forEach(g=>{if(!gs.includes(g))gs.push(g)}));
 return gs.map(g=>`<div class="rqr" style="--c:var(--r)"><div class="rqt"><b>${g.k==="shortcut"?'↩️':'🔒'} ${g.n}</b><small>${g.h}</small><div>${reqChips(gateMiss(g),'')}</div>${GK[g.k].tick?`<label class="tg" style="margin:6px 0 0"><input type="checkbox" onchange="setOpen('${g.id}',this.checked)"><span>I've already opened this</span></label>`:''}</div></div>`).join("")}

function goToGate(id){closeDrawer();const g=GATES.find(x=>x.id===id),p=gPos(g);showGate(id);lookAt(p[0],p[1]);startFlash('gate:'+id,p[0],p[1],1);drawOv()}
function lookAt(x,y){const w=Math.min(vb[2],380);vb=[x-w/2,y-w/2,w,w];vb[1]+=.2*svg.clientHeight*sc();setVB();drawOv()}
// ---------- doors, gates and passages you correct ----------
function setOpen(id,v){S.open=S.open||{};if(v)S.open[id]=1;else delete S.open[id];save();refresh();if(R&&sheet.classList.contains("up")&&sc_.querySelector(".rsheet"))showSteps()}
function gateMid(g){return gPos(g)}
// A small row for a linked door or lever: tap it to jump there on the map.
function gLinkRow(x,what){const st=gState(x);return `<div class="rqr" style="--c:${GCOL[st]}" onclick="goToGate('${x.id}')"><div class="rqt"><b>${GEMO[gIc(x)]} ${x.n}</b><small>${what?what+' · ':''}${st==='done'?'✓ '+(x.k==='lever'?'Pulled':'Done'):gLbl(x)} · tap to see it on the map</small></div></div>`}
function linkRows(g){const by=(BY[g.id]||[]).map(gById).filter(Boolean),op=(g.opens||[]).map(gById).filter(Boolean);let h="";
 if(by.length)h+=`<div class="needl">🎚️ Opened by</div>`+by.map(l=>gLinkRow(l,l.side||'')).join("");
 if(op.length)h+=`<div class="needl">🚪 Opens</div>`+op.map(d=>gLinkRow(d,d.side||'')).join("");
 return h}
function showGate(id){const g=GATES.find(x=>x.id===id),stt=gState(g),p=gPos(g),K=GK[g.k],hd=hidOf(g);sel=null;openG=null;gFocus=[g.id,...gLinks(g).map(x=>x.id)];
 const badge={done:g.k==="wall"?"Broken":g.k==="fight"?"Cleared":"Done",open:K.blk?"Open for you":"You can do this",shut:K.blk?"Locked":"Needs more first",info:{wall:"Hit it to break it",lever:"Pull it",fight:"Fight through",seal:"Heads-up",toll:"Pay, or break the gears"}[g.k]||K.l,unsure:"Not verified"}[stt];
 const side=g.k==="shortcut"&&g.from&&!ticked(g)?`<div class="rq"><p>↩️ It only opens from the <b>${aName(NA[g.from])}</b> side${g.need.length?' once you have '+g.need.map(nm).join(' + '):''}. Routes can go through it from that side; from the other side only once you've opened it.</p></div>`:'';
 sc_.innerHTML=`${R&&R.res?'<button class="back" onclick="showSteps()">‹ Back to the route</button>':''}<div class="sh" data-gate="${g.id}"><div class="t"><b>${GEMO[gIc(g)]} ${g.n}</b><br><span class="badge" style="background:${GCOL[stt]}">${badge}</span> <small>· ${gLbl(g)} · ${aName(gArea(g))}</small></div>${rptBtn('gate',g.id)}<button class="x" aria-label="Close" onclick="closeSheet();drawOv()">✕</button></div>
 <div class="short">${g.h}</div>${missLine("gate",g.id)}${g.ctl?`<div class="ctl"><span aria-hidden="true">🔗</span><span><b>Controls:</b> ${g.ctl}</span></div>`:""}${picCard("gate",g.id)}${diffRow("gate",g.id,"Fight difficulty")}
 ${hd?`<div class="needl">${g.k==="seal"||g.k==="toll"?"About":"Behind it"}</div><div class="rqr" style="--c:${hd.done?COL.done:'#e8b923'}" onclick="${hd.grp?`openG='${hd.grp}';backC=null;showGroup('${hd.grp}');drawOv()`:`sel='${hd.it}';showItem('${hd.it}','');drawOv()`}"><div class="rqt"><b>${hd.done?'✓':'✨'} ${hd.n}</b><small>${hd.done?'Already collected':'Still to find'} · tap for details</small></div></div>`:''}
 ${linkRows(g)}
 ${g.need.length?`<div class="needl">Needs</div><div>${reqChips(g.need,'')}</div>`:''}${side}
 ${K.tick?`<label class="tg" style="margin-top:8px"><input type="checkbox" ${ticked(g)?'checked':''} onchange="setOpen('${g.id}',this.checked);showGate('${g.id}')"><span>${K.tick}</span></label>`:''}
 ${g.ap?`<div class="warn">Spot is approximate: look around this part of the room.</div>`:''}
 <div class="acts"><button class="sec" onclick="${gLinks(g).length?`showPair('${g.id}')`:`lookAt(${p[0]},${p[1]})`}">🔍 Show on map</button>${hd&&!hd.done?`<button class="way" onclick="${hd.grp?`showWay('g','${hd.grp}')`:`showWay('it','${hd.it}')`}">🧭 Show the way</button>`:''}</div>`;
 sheet.classList.add("up");picTap("gate",id);sheet.scrollTop=0}
function tapPass(u,v){if(moved>=8)return;const key=ek(u,v),b=(S.blk||{})[key],gs=GE[key]||[],A=aName(NA[u]),B=aName(NA[v]);sel=null;openG=null;
 sc_.innerHTML=`${R&&R.res?'<button class="back" onclick="showSteps()">‹ Back to the route</button>':''}<div class="sh"><div class="t"><b>This passage</b><br><small>${A}${A!==B?' → '+B:''}${b?' · you marked it '+(b==='both'?'blocked':'one-way'):''}</small></div><button class="x" aria-label="Close" onclick="closeSheet();drawOv()">✕</button></div>
 ${gs.map(g=>`<div class="rqr" style="--c:${gateOpen(g)?COL.green:COL.red}" onclick="showGate('${g.id}')"><div class="rqt"><b>${gateOpen(g)?'✓':'🔒'} ${g.n}</b><small>${gateOpen(g)?'Open for you':'Needs '+gateMiss(g).map(nm).join(' + ')} · tap for details</small></div></div>`).join("")}
 <p><small>Is the route wrong here? Tell the map and it finds another way. You can undo this any time under More.</small></p>
 <div class="kids"><button class="btn" onclick="setBlk('${key}','both')">🚫 I can't get through here</button>
 <button class="btn" onclick="setBlk('${key}','${u}>${v}')">↩️ Only works from the other side (one-way drop or a shortcut I haven't opened)</button>
 ${b?`<button class="btn" style="color:var(--g)" onclick="setBlk('${key}',null)">✓ It's open now</button>`:''}</div>`;
 sheet.classList.add("up");sheet.scrollTop=0}
function setBlk(key,v){S.blk=S.blk||{};if(v)S.blk[key]=v;else delete S.blk[key];save();
 toast(v?"Got it. Routes avoid that now.":"Passage open again.");if(R){calcRoute();fitRoute();routeBar();showSteps()}else closeSheet();drawOv();if(drw.classList.contains("open"))renderDrawer()}
function passList(){const ks=Object.keys(S.blk||{});if(!ks.length)return"";
 return `<h3>Passages you marked</h3>`+ks.map(k=>{const[a,b]=k.split("~"),v=S.blk[k],dir=v==="both"?"Blocked":"One-way only";
  return `<div class="tg"><span>${dir}<br><small>${aName(NA[a])}${NA[a]!==NA[b]?' ↔ '+aName(NA[b]):''}</small></span><button class="rs" style="width:auto;padding:0 10px" onclick="lookAt(${edgeMid(a,b).join(',')});closeDrawer()">📍</button><button class="rs" style="width:auto;padding:0 10px" onclick="setBlk('${k}',null)">Undo</button></div>`}).join("")}
function gatesTab(){return `<h3>Doors, keys & shortcuts</h3><p><small>Routes only go through these once they're open for you. The full list, with breakable walls and secret rooms, is under World.</small></p>`+GATES.filter(g=>GK[g.k].blk&&g.e&&gVis(g)).map(g=>{const ok=gateOpen(g),can=!!GK[g.k].tick;
 return `<label class="tg">${can?`<input type="checkbox" ${(S.open||{})[g.id]?'checked':''} onchange="setOpen('${g.id}',this.checked)">`:`<span style="flex:none;width:22px;text-align:center">${ok?'✓':'🔒'}</span>`}<span>${g.n}<br><small>${ok?'Open':'Needs '+gateMiss(g).map(nm).join(' + ')}</small></span><button class="rs" aria-label="Show ${g.n}" onclick="event.preventDefault();closeDrawer();showGate('${g.id}')">📍</button></label>`}).join("")}
const LOCKG='<rect x="6" y="11" width="12" height="9" rx="1.5"/><path d="M9 11V8a3 3 0 016 0v3"/>',OPENG='<rect x="6" y="11" width="12" height="9" rx="1.5"/><path d="M9 11V8a3 3 0 015.6-1.5"/>';
const GGL={key:'<circle cx="8" cy="12" r="4"/><path d="M12 12h9M18 12v3.5M15.5 12v2.5"/>',wall:'<rect x="3.5" y="5" width="17" height="14" rx="1"/><path d="M3.5 9.7h17M3.5 14.3h17M10 5v4.7M15 9.7v4.6M9 14.3V19"/>',
 lever:'<path d="M5 19.5h14"/><path d="M12 19.5L16.5 6"/><circle cx="17" cy="4.8" r="2.3"/>',fight:'<path d="M5 5l14 14M19 5L5 19M4 9l5-5M15 4l5 5"/>',
 seal:'<path d="M7 3.5h10M7 20.5h10M8 3.5c0 5 8 6 8 8.5s-8 3.5-8 8.5M16 3.5c0 5-8 6-8 8.5s8 3.5 8 8.5"/>',toll:'<circle cx="12" cy="12" r="8"/><path d="M12 7.5v9M14.5 9.5h-3.8a1.7 1.7 0 000 3.4h2.6a1.7 1.7 0 010 3.4H9.5"/>',
 q:'<path d="M9 9a3 3 0 115 2.2c-1.2.8-2 1.4-2 2.8M12 18h.01"/>'};
const lockIcon=(x,y,k,ok,ev,cls)=>`<g class="ic gt ${cls||''}" transform="translate(${x} ${y}) scale(${k})" ${ev||''}><circle r="15" fill="transparent"/><rect x="-9" y="-9" width="18" height="18" rx="5" fill="${ok?'#1f6f3a':'#c92a2a'}" stroke="#fff" stroke-width="1.6"/><g transform="translate(-7.8 -8.4) scale(.65)" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">${ok?OPENG:LOCKG}</g></g>`;
// One icon per kind; the colour says where you stand. A small gold star = a secret you haven't found yet.
function gateIcon(g,x,y,k,ev,cls){const stt=gState(g),ic=gIc(g),hd=hidOf(g),gl=ic==="lock"?(stt==="shut"?LOCKG:OPENG):GGL[ic],wall=ic==="wall";
 return `<g class="ic gt ${cls||''}" transform="translate(${x} ${y}) scale(${k})" ${ev||''} ${stt==="done"?'opacity=".6"':''}><circle r="15" fill="transparent"/><rect x="-9" y="-9" width="18" height="18" rx="${wall?2.5:5}" fill="${GCOL[stt]}" stroke="${g.ap?'#ffe8a3':'#fff'}" stroke-width="1.6" ${g.ap?'stroke-dasharray="3 2"':''}/><g transform="translate(-7.8 -7.8) scale(.65)" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${gl}</g>${hd&&!hd.done&&g.k!=="toll"?'<path d="M9 -13.5l1.4 2.9 3.1.4-2.3 2.1.6 3.1L9 -6.5l-2.8 1.5.6-3.1-2.3-2.1 3.1-.4z" fill="#ffd43b" stroke="#14110f" stroke-width=".8"/>':''}</g>`}
// Walls, doors and shortcuts (zoomed in), plus the passages you marked yourself (always).
function gatesSVG(s,k){let o="";const used=[],at={};/* two locks on one passage sit side by side */
 const foc=g=>!!(gFocus&&gFocus.includes(g.id));
 GATES.forEach(g=>{const fl=flash&&flash.key==="gate:"+g.id||foc(g);if(!fl&&(s>=2.6||!gVis(g)||!layerOn(gLayer(g))))return;const stt=gState(g);if(!fl&&S.hideDone&&stt==="done")return;const p=gPos(g).slice();while(used.some(q=>Math.hypot(q[0]-p[0],q[1]-p[1])<15*k))p[0]+=20*k;used.push(p);at[g.id]=p;o+=gateIcon(g,p[0],p[1],k*(s<1.6?.85:.72),`onclick="if(moved<8)showGate('${g.id}')"`)});
 // Dashed gold links: lever ↔ the door it opens, and lock → the item behind it (only while that card is open).
 if(gFocus){let ln="";const dash=`stroke="#ffd43b" stroke-width="${2.2*k}" stroke-dasharray="${6*k} ${4*k}" stroke-linecap="round" fill="none" pointer-events="none"`;
  gFocus.forEach(id=>{const g=gById(id);if(!g||!at[id])return;(g.opens||[]).forEach(d=>{if(at[d])ln+=`<line x1="${at[id][0]}" y1="${at[id][1]}" x2="${at[d][0]}" y2="${at[d][1]}" ${dash}/>`});
   if(gFocus.it&&!(g.opens||[]).length)ln+=`<line x1="${at[id][0]}" y1="${at[id][1]}" x2="${gFocus.it[0]}" y2="${gFocus.it[1]}" ${dash} opacity=".55"/>`});
  o=ln+o}
 Object.keys(S.blk||{}).forEach(key=>{const[a,b]=key.split("~");if(!NV[a]||!NV[b])return;const[x,y]=edgeMid(a,b);
  o+=`<g class="ic gt" transform="translate(${x} ${y}) scale(${k*.85})" onclick="tapPass('${a}','${b}')"><circle r="15" fill="transparent"/><rect x="-9" y="-9" width="18" height="18" rx="5" fill="#f08c00" stroke="#fff" stroke-width="1.6"/><text y="4.5" font-size="12" text-anchor="middle">${S.blk[key]==='both'?'🚫':'↩️'}</text></g>`});
 return o}
// Checklist → 🧱: every wall, door and shortcut in the areas you've visited.
function blkList(){const vis_=GATES.filter(g=>gVis(g)&&g.k!=="seal"),tk=vis_.filter(g=>GK[g.k].tick),dn=tk.filter(g=>gState(g)==="done").length,sec=vis_.filter(g=>g.hides&&g.k==="wall"),sf=sec.filter(g=>hidOf(g).done).length;
 let h=`<p><small>Breakable walls, doors, levers and shortcuts in the areas you've visited. ✨ = a secret behind it you haven't collected. Tick what you've opened: routes use shortcuts from then on. <b>${sf}/${sec.length}</b> secret walls found · <b>${dn}/${tk.length}</b> opened.</small></p>`;
 AREAS.forEach(a=>{const xs=vis_.filter(g=>gArea(g)===a.id);if(!xs.length)return;h+=`<div class="ar">${a.n}</div>`+xs.map(g=>{const stt=gState(g),hd=hidOf(g),K=GK[g.k];
  const ms=gateMiss(g),oneway=g.k==="shortcut"&&ms.length===1&&ms[0].startsWith("O:");
  const sub=stt==="done"?(hd?'✓ '+hd.n:'✓ done'):oneway?'↩️ Opens from '+(g.from?'the '+aName(NA[g.from])+' side':'the other side'):stt==="shut"?'Needs '+ms.map(nm1).join(' + '):hd?(hd.done?'✓ ':'✨ ')+hd.n:stt==="open"&&K.blk?'✓ Open for you':K.l;
  return `<div class="li" style="--c:${GCOL[stt]}">${K.tick?`<input type="checkbox" aria-label="${K.tick}" ${ticked(g)?'checked':''} onchange="setOpen('${g.id}',this.checked)">`:`<span style="flex:none;width:22px;text-align:center">${GEMO[gIc(g)]}</span>`}<div onclick="closeDrawer();showGate('${g.id}');const p=gPos(GATES.find(x=>x.id==='${g.id}'));lookAt(p[0],p[1])"><b>${K.tick?GEMO[gIc(g)]+' ':''}${g.n}</b><br><small>${sub}</small></div><span class="chev">›</span></div>`}).join("")});
 if(!vis_.length)h+=`<p><small>Nothing yet: unlock an area first.</small></p>`;
 return h}
// Gold line with flowing dashes and arrow chevrons every ~70px on screen; Bellway rides arc in teal; locked parts red.
function routeSVG(s,k){const r=R&&R.res;if(!r){const H=hereSpot();return{o:"",top:H&&S.here?youPin(H.p,k):""}}let o="",top="";
 const tp=r.T.p;
 if(r.needHere){top+=`<g transform="translate(${tp[0]} ${tp[1]}) scale(${k})" pointer-events="none"><circle class="rpl" r="17" fill="none" stroke="#ffd43b" stroke-width="3"/></g>`;return{o,top}}
  if(!routeShown(r)){top+=`<g transform="translate(${tp[0]} ${tp[1]}) scale(${k})" pointer-events="none"><circle class="rpl" r="17" fill="none" stroke="#e03131" stroke-width="3"/><rect x="-40" y="-37" width="80" height="17" rx="8.5" fill="#e03131" stroke="#fff" stroke-width="1.2"/><text y="-25" font-size="10" font-weight="800" fill="#fff" text-anchor="middle">🔒 NO WAY YET</text></g>`;return{o,top}}
 const walks=r.walks||[];{const A=altSVG(r,s,k);o+=A.o;top+=A.top}
 walks.forEach(pts=>{const P=pts.map(p=>p.join(",")).join(" ");
  o+=`<polyline points="${P}" fill="none" stroke="#000" stroke-opacity=".6" stroke-width="${11*s}" stroke-linejoin="round" stroke-linecap="round"/><polyline points="${P}" fill="none" stroke="#ffd43b" stroke-width="${6*s}" stroke-linejoin="round" stroke-linecap="round"/><polyline class="rflow" points="${P}" fill="none" stroke="#fff" stroke-opacity=".85" stroke-width="${2*s}" stroke-dasharray="${6*s} ${18*s}" style="--d:-${24*s}px" stroke-linecap="round"/>`;
  const gap=70*s;let carry=gap*.6;
  for(let j=1;j<pts.length;j++){const a=pts[j-1],b=pts[j],L=dist(a,b),ang=Math.atan2(b[1]-a[1],b[0]-a[0])*180/Math.PI;let t=carry;
   while(t<L){const x=a[0]+(b[0]-a[0])*t/L,y=a[1]+(b[1]-a[1])*t/L;o+=`<path d="M-4 -5.5 L3 0 L-4 5.5" transform="translate(${x} ${y}) rotate(${ang}) scale(${k})" fill="none" stroke="#14110f" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`;t+=gap}
   carry=t-L}});
 r.segs.forEach(sg=>{if(sg.ride||!NV[sg.from]||!NV[sg.to])return;const m=mid(sg);
  const PP=(sg.pts||[sg.a,sg.b]).map(q=>q.join(",")).join(" ");if(sg.lock)o+=`<polyline points="${PP}" fill="none" stroke="#e03131" stroke-width="${7*s}" stroke-dasharray="${8*s} ${6*s}" stroke-linecap="round" stroke-linejoin="round"/>`;
  // wide invisible strip: tap the route to correct a passage
  o+=`<g class="ic rh"><polyline points="${PP}" fill="none" stroke="transparent" stroke-width="${24*s}" stroke-linecap="round" stroke-linejoin="round" onclick="tapPass('${sg.from}','${sg.to}')"/></g>`;
  if(sg.gs.length&&sg.gs.every(g=>g.k==="unsure")&&!sg.lock){top+=`<g transform="translate(${m[0]} ${m[1]}) scale(${k})" onclick="tapPass('${sg.from}','${sg.to}')" class="ic tgt" style="cursor:pointer"><circle r="9" fill="#f08c00" stroke="#fff" stroke-width="1.6"/><text y="4" font-size="12" font-weight="900" fill="#fff" text-anchor="middle">?</text>${s<1.6?'<rect x="12" y="-8" width="72" height="16" rx="8" fill="#f08c00" stroke="#fff" stroke-width="1"/><text x="18" y="3.5" font-size="9" font-weight="700" fill="#fff">Not verified</text>':''}</g>`}
  else if(sg.gs.length){const g=sg.fails[0]||sg.gs.find(x=>x.k!=="unsure"),lbl=sg.lock?(g.k==="shortcut"&&!g.need.filter(n=>!req(n)).length?"Opens from other side":gateMiss(g).map(nm1).join(" + ")):(g.need.map(nm1).join(" + ")||GK[g.k].l);
   top+=`<g transform="translate(${m[0]} ${m[1]}) scale(${k})" onclick="showGate('${g.id}')" class="ic tgt" style="cursor:pointer">${GK[g.k].ic==="lock"?lockIcon(0,0,1,!sg.lock,'','tgt'):gateIcon(g,0,0,1,'','tgt')}${s<1.6?`<rect x="${12}" y="-8" width="${lbl.length*5.4+12}" height="16" rx="8" fill="${sg.lock?'#c92a2a':'#1f6f3a'}" stroke="#fff" stroke-width="1"/><text x="${18}" y="3.5" font-size="9" font-weight="700" fill="#fff">${lbl}</text>`:''}</g>`}});
 r.segs.filter(sg=>sg.ride).forEach(sg=>{const d=dist(sg.a,sg.b),mx=(sg.a[0]+sg.b[0])/2,my=(sg.a[1]+sg.b[1])/2-Math.min(260,d*.28);
  o+=`<path d="M${sg.a[0]} ${sg.a[1]} Q${mx} ${my} ${sg.b[0]} ${sg.b[1]}" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="${8*s}"/><path class="rflow" d="M${sg.a[0]} ${sg.a[1]} Q${mx} ${my} ${sg.b[0]} ${sg.b[1]}" fill="none" stroke="#3bc9db" stroke-width="${4*s}" stroke-dasharray="${10*s} ${8*s}" style="--d:-${18*s}px" stroke-linecap="round"/>`;
  const cx=(sg.a[0]+2*mx+sg.b[0])/4,cy=(sg.a[1]+2*my+sg.b[1])/4;top+=`<g transform="translate(${cx} ${cy}) scale(${k})" pointer-events="none"><rect x="-31" y="-9" width="62" height="18" rx="9" fill="#0c8599" stroke="#fff" stroke-width="1.3"/>${glyph(byId(sg.from.slice(2)).t==='tube'?'tube':'bellway',-20,0,.42)}<text x="5" y="3.5" font-size="9" font-weight="800" fill="#fff" text-anchor="middle">${byId(sg.from.slice(2)).t==='tube'?'Ventrica':'Bellway'}</text></g>`});
 const sp=r.st.p;top+=`<g transform="translate(${sp[0]} ${sp[1]}) scale(${k})" pointer-events="none"><circle r="15" fill="none" stroke="${r.fromHere?'#1c7ed6':'#2f9e44'}" stroke-width="3.5"/><rect x="-20" y="-35" width="40" height="17" rx="8.5" fill="${r.fromHere?'#1c7ed6':'#2f9e44'}" stroke="#fff" stroke-width="1.2"/><text y="-23" font-size="10" font-weight="800" fill="#fff" text-anchor="middle">${r.fromHere?'YOU':'START'}</text></g>`;
 top+=`<g transform="translate(${tp[0]} ${tp[1]}) scale(${k})" pointer-events="none"><circle class="rpl" r="17" fill="none" stroke="#ffd43b" stroke-width="3"/><rect x="-18" y="-37" width="36" height="17" rx="8.5" fill="#ffd43b" stroke="#14110f" stroke-width="1.2"/><text y="-25" font-size="10" font-weight="800" fill="#14110f" text-anchor="middle">HERE</text></g>`;
 return{o,top}}
// Benches and Bellways have their own look and never fold into a numbered bubble, so they're always findable.
// Bosses never fold into a bubble either (drawOv pulls them out and nudges them clear of the bubble and the bench next to them).
const isTgt=m=>R&&((R.kind==="g"&&m.grp===R.id)||(R.kind==="it"&&m.it&&(m.it.id===R.id||(byId(R.id).g&&m.grp===byId(R.id).g))));
function navIcon(i,x,y,k,s,solo){const blk=st(i)==="red",sl=sel===i.id,rest=S.restAt===i.id,isS=R&&R.res&&R.res.st&&R.res.st.i.id===i.id,short=i.n.replace(/\s*\(.*\)/,"");
 const cls=`ic nv ${blk?'nb':''} ${sl?'sel':''} ${isS?'tgt':''}`,ev=`onpointerdown="iconDown(event,'${i.id}')" onclick="tapItem('${i.id}')"`;
 if(i.t==="tube")return `<g class="${cls}" transform="translate(${x} ${y}) scale(${k})" ${ev}><circle r="16" fill="transparent"/>${rest?'<circle r="13" fill="none" stroke="#2f9e44" stroke-width="2.5"/>':''}<circle class="b" r="10" fill="${S.done[i.id]?'#9775fa':'#6741d9'}" stroke="#fff" stroke-width="1.8"/>${glyph('tube',0,0,.5)}${solo&&s<1.1?`<text class="nvl" y="23" font-size="9">Ventrica</text>`:''}</g>`;
 if(i.t==="bellway")return `<g class="${cls}" transform="translate(${x} ${y}) scale(${k})" ${ev}><circle r="18" fill="transparent"/><circle class="b" r="11.5" fill="#0c8599" stroke="#fff" stroke-width="2"/>${glyph('bellway',0,0,.56)}${solo&&s<1.3?`<text class="nvl" y="25" font-size="9.5">Bellway</text>`:''}</g>`;
 return `<g class="${cls}" transform="translate(${x} ${y}) scale(${k})" ${ev}><circle r="15" fill="transparent"/>${rest?'<circle r="13.5" fill="none" stroke="#2f9e44" stroke-width="2.5"/>':''}<rect class="b" x="-8.5" y="-8.5" width="17" height="17" rx="4" fill="${S.done[i.id]?'#e8b923':'#a8841c'}" stroke="#14110f" stroke-width="1.6"/>${glyph('bench',0,0,.5,'#14110f')}${solo&&s<.5&&!isS?`<text class="nvl bn" y="21" font-size="8">${short}</text>`:''}</g>`}
// Benches inside a shop or NPC spot (Halfway Home, Mort's...) get a small badge on that square.
function navSVG(s,k){let o="";
 IT.filter(i=>REST(i)&&i.g&&vis(i)&&itemOn(i)).forEach(i=>{const p=gp(i.g);o+=navIcon(i,p[0]+13*k,p[1]+13*k,k*.75,s,false)});
 return o}

function refresh(){
 if(R){calcRoute();routeBar()}
 const pool=IT.filter(cnt),d=pool.filter(i=>S.done[i.id]).length,g=pool.filter(i=>st(i)==="green").length;
 document.getElementById("prog").textContent=`${d} / ${pool.length} collected`;
 document.getElementById("pbar").style.width=(pool.length?d/pool.length*100:0)+"%";
 document.getElementById("avail").textContent=`● ${g} available`;
 drawOv();if(drw.classList.contains("open"))renderDrawer();
 if(sheet.classList.contains("up")){const wq=sc_.querySelector(".wsheet");if(wq){const t=sheet.scrollTop;showWish(wq.dataset.w);sheet.scrollTop=t}else if(sel)showItem(sel,itemFrom);else if(openG)showGroup(openG)}
}

// ===================== Settings =====================
const SETDEF={look:"silk",fx:1,startmenu:1,pic:"tap",sz:1,cb:"std",badges:0,theme:"auto",labels:1,ovw:1,bigui:0,lefty:0,haptic:1};
const SET=()=>Object.assign({},SETDEF,S.set||{});
const LOOKS=[["silk","Silksong","Crimson and bone, falling silk"],["hk","Hollow Knight","Pale blue souls in the dark"],["moss","Greenpath","Moss green, drifting spores"],["classic","Classic","The original look, light or dark"]];
// Colour sets. "rg" and "by" follow colour-blind-safe palettes (Okabe & Ito, Tol); badges add a shape so colour is never the only cue.
const PAL={
 std:{n:"Standard",d:"Green and red.",green:"#2f9e44",orange:"#f08c00",red:"#e03131",done:"#868e96",open:"#1f6f3a",shut:"#c92a2a",info:"#9a6324",unsure:"#f08c00",npc:"#1c7c8c"},
 rg:{n:"Red-green friendly",d:"For protanopia and deuteranopia (the most common). Blue, yellow, vermillion.",green:"#0072b2",orange:"#e69f00",red:"#d55e00",done:"#8a8f96",open:"#005a8c",shut:"#a84a00",info:"#7a6a2a",unsure:"#e69f00",npc:"#6c4f9e"},
 by:{n:"Blue-yellow friendly",d:"For tritanopia. Green, pink, red.",green:"#1a9850",orange:"#cc79a7",red:"#d7191c",done:"#8a8f96",open:"#13703b",shut:"#a8141a",info:"#8a5a2a",unsure:"#cc79a7",npc:"#3b5ba5"},
 hc:{n:"High contrast",d:"Brighter colours, white outlines and badges.",green:"#00c853",orange:"#ffab00",red:"#ff1744",done:"#9e9e9e",open:"#00a844",shut:"#e0002b",info:"#c77800",unsure:"#ffab00",npc:"#00b8d4"}};
function applySet(){const z=SET(),p=PAL[z.cb]||PAL.std;
 R_PX=11*z.sz;GAP_PX=31*z.sz;
 COL.green=p.green;COL.orange=p.orange;COL.red=p.red;COL.done=p.done;NPCC=p.npc;
 Object.assign(GCOL,{open:p.open,shut:p.shut,info:p.info,unsure:p.unsure});
 const r=document.documentElement;r.style.setProperty("--g",p.green);r.style.setProperty("--o",p.orange);r.style.setProperty("--r",p.red);r.style.setProperty("--d",p.done);
 if(z.theme==="auto")delete r.dataset.theme;else r.dataset.theme=z.theme;
 const lk=z.look||"silk",fxOn=z.fx&&!(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)?"1":"0";
 if(r.dataset.look!==lk||r.dataset.fx!==fxOn||(lk!=="classic"&&fxOn==="1"&&!document.querySelector("#wrap>.fxl"))){r.dataset.look=lk;r.dataset.fx=fxOn;if(typeof fxMount==="function")fxMount(document.getElementById("wrap"),18)}
 const b=document.body.classList;b.toggle("bigui",!!z.bigui);b.toggle("lefty",!!z.lefty);b.toggle("hc",z.cb==="hc");
 lastS=0}
const badgesOn=()=>{const z=SET();return !!z.badges||z.cb!=="std"};
// Small shape in the corner so status never depends on colour alone: lock = blocked, ~ = needs a skip, ✓ = done.
function stBadge(st){if(!badgesOn()||st==="green")return"";const p=st==="red"?'<rect x="-2.6" y="-.6" width="5.2" height="3.8" rx=".6" fill="#fff"/><path d="M-1.5-.6v-1.2a1.5 1.5 0 013 0v1.2" fill="none" stroke="#fff" stroke-width="1.1"/>':st==="orange"?'<path d="M-2.8 .8c.9-1.6 1.9-1.6 2.8 0s1.9 1.6 2.8 0" fill="none" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/>':'<path d="M-2.4 .1l1.6 1.7 3.2-3.4" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>';
 return `<g transform="translate(8 8)" pointer-events="none"><circle r="5.2" fill="#14110f" stroke="#fff" stroke-width=".8"/>${p}</g>`}
function buzz(){if(SET().haptic&&navigator.vibrate)try{navigator.vibrate(12)}catch(e){}}
function setS(k,v){S.set=Object.assign({},S.set||{},{[k]:v});applySet();save();refresh();renderSettings()}
let setScroll=null;
function openSettings(sec){document.getElementById("set").classList.add("on");renderSettings();backPush();
 const b=document.querySelector("#set .sbd");b.scrollTop=0;if(sec)setTimeout(()=>{const e=document.getElementById("set-"+sec);if(e)e.scrollIntoView({block:"start"})},30)}
function closeSettings(){document.getElementById("set").classList.remove("on")}
// sample icons for the preview and the legend
const legI=(fill,gl,o)=>{o=o||{};const r=o.r||9,sh=o.sq?`<rect class="b" x="-10" y="-10" width="20" height="20" rx="${o.rx??5}" fill="${fill}"/>`:o.dia?`<rect class="b" x="-6.5" y="-6.5" width="13" height="13" rx="2" transform="rotate(45)" fill="${fill}"/>`:`<circle class="b" r="${r}" fill="${fill}"${o.dim?' opacity=".55"':''}/>`;
 return `<g class="ic">${o.ring?`<circle r="13.5" fill="none" stroke="${fill}" stroke-width="2" stroke-dasharray="4 3"/>`:''}${sh}${gl?glyph(gl,0,0,o.gs||.46):''}${o.tip?'<circle cx="8" cy="-8" r="3.2" fill="#ffd43b" stroke="#000" stroke-width=".8"/>':''}${o.st?stBadge(o.st):''}${o.n!=null?`<g transform="translate(9 -9)"><rect x="-7" y="-5" width="14" height="10" rx="5" fill="#111" stroke="#fff" stroke-width=".8"/><text x="0" y="3" font-size="7" font-weight="700" text-anchor="middle" fill="#fff">${o.n}</text></g>`:''}</g>`};
const gateI=(st,gl)=>`<g class="ic"><rect x="-9" y="-9" width="18" height="18" rx="5" fill="${GCOL[st]}" stroke="#fff" stroke-width="1.6"/><g transform="translate(-7.8 -7.8) scale(.65)" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${gl}</g></g>`;
const lsvg=g=>`<svg viewBox="-15 -15 30 30" aria-hidden="true">${g}</svg>`;
const lrow=(icon,t,d)=>`<div class="lgr">${icon}<div><b>${t}</b>${d?`<small>${d}</small>`:''}</div></div>`;
function previewSVG(){const z=SET(),k=z.sz*11/9,xs=[["green","spear"],["red","key"],["done","flea"]];
 return `<svg class="prev" viewBox="0 0 320 64" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${xs.map((c,j)=>`<g transform="translate(${46+j*76} 32) scale(${k})">${legI(COL[c[0]],c[1],{st:c[0],dim:c[0]==="done"})}</g>`).join("")}</svg>`}
function renderSettings(){const z=SET(),B=document.getElementById("setB");if(!B)return;const sv=document.querySelector("#set .sbd"),top=sv?sv.scrollTop:0;
 const seg=(k,opts)=>`<div class="seg" role="radiogroup">${opts.map(([v,l])=>`<button role="radio" aria-checked="${z[k]===v}" class="${z[k]===v?'on':''}" onclick="setS('${k}',${JSON.stringify(v).replace(/"/g,"'")})">${l}</button>`).join("")}</div>`;
 const tog=(k,t,d)=>`<label class="tg"><input type="checkbox" ${z[k]?'checked':''} onchange="setS('${k}',this.checked?1:0)"><span>${t}${d?`<br><small>${d}</small>`:''}</span></label>`;
 let h=`<h3 id="set-pic">Pictures</h3><div class="scard"><div class="lab"><b>Show a picture of what a pin is</b></div>${seg('pic',[['tap','On the map too'],['card','Only in the description'],['off','Off']])}<p>Every card ends with a picture; tap it to see it on the whole screen. "On the map" also floats the picture above the pin you tapped, until you open the description.</p></div><h3 id="set-size">Map symbols</h3><div class="scard"><div class="lab"><b>Symbol size</b><span id="szv">${Math.round(z.sz*100)}%</span></div>
  <input class="rng" type="range" min="0.6" max="1.8" step="0.05" value="${z.sz}" aria-label="Symbol size" oninput="szLive(this.value)" onchange="setS('sz',+this.value)">
  <div class="rngl"><span>Smaller</span><button style="border:0;background:none;color:var(--acc);font-weight:700;padding:4px 8px" onclick="setS('sz',1)">Reset</button><span>Bigger</span></div><div id="szp">${previewSVG()}</div>
  <p>Bigger symbols are easier to tap on a phone. Busy spots fold into numbered bubbles sooner when symbols are big.</p></div>
  ${tog('labels','Place names on the map','Small labels like "Bellway" or "Lace arena" when zoomed in.')}
  ${tog('ovw','Area names when zoomed out','Zoom far out and the icons make way for big area names with how many collectibles you\'ve found. Tap a name to jump in.')}
  <label class="tg"><input type="checkbox" ${S.hideDone?'checked':''} onchange="S.hideDone=this.checked;save();refresh()"><span>Hide collected icons<br><small>Clears the map as you go.</small></span></label>`;
 h+=`<h3 id="set-colour">Colours</h3><div class="scard"><b>Colour-blind mode</b><p>Changes every status colour in the app and adds small shapes, so nothing depends on colour alone.</p>
  <div class="seg col" role="radiogroup">${Object.keys(PAL).map(k=>{const p=PAL[k];return `<button role="radio" aria-checked="${z.cb===k}" class="${z.cb===k?'on':''}" onclick="setS('cb','${k}')"><span class="dots">${["green","orange","red"].map(c=>`<i style="--c:${p[c]}"></i>`).join("")}</span><span><b>${p.n}</b><br><small>${p.d}</small></span></button>`}).join("")}</div></div>
  ${z.cb==="std"?tog('badges','Shape badges on icons','Adds 🔒 / ~ / ✓ to icons so you can tell their status without colour.'):''}
  <div class="scard" id="set-look"><b>Style</b><p>The colours and feel of the whole app.</p><div class="looks">${LOOKS.map(([k,n,d])=>`<button class="${z.look===k?'on':''}" aria-pressed="${z.look===k}" onclick="setS('look','${k}')"><span class="lk ${k}">${k!=="classic"?[12,30,48,66,84].map((x,i)=>`<i style="left:${x}%;top:${18+((i*37)%40)}%;background:${k==="silk"?(i%2?'#e04848':'#e8b923'):k==="hk"?'#cfe6ff':'#9be37f'};box-shadow:0 0 8px ${k==="silk"?'#e04848':k==="hk"?'#cfe6ff':'#9be37f'}"></i>`).join(""):""}<span>${n}</span></span><b>${n}</b><small>${d}</small></button>`).join("")}</div></div>
  ${tog('fx','Moving effects','Drifting silk threads, souls or spores on the main menu and the map.')}
  ${z.look==="classic"?`<div class="scard"><b>Light or dark</b><p>For the Classic style. The map itself always stays dark.</p>${seg('theme',[["auto","Auto"],["dark","Dark"],["light","Light"]])}</div>`:""}`;
 h+=`<h3 id="set-legend">Legend</h3><div class="scard"><p style="margin:0 0 4px">Colours follow your colour-blind mode. The small corner shapes mean the same in every mode.</p>
  ${lrow(lsvg(legI(COL.green,"spear",{st:"green"})),"Available now","You can get it with what you have.")}
  
  ${lrow(lsvg(legI(COL.red,"key",{st:"red"})),"Locked","Needs a power, key or boss first. Tap it to see what.")}
  ${lrow(lsvg(legI(COL.done,"flea",{st:"done",dim:1})),"Collected","Done. Hide these under Map symbols.")}
  </div><div class="scard">
  ${lrow(lsvg(legI(COL.green,"spear",{r:11,gs:.55})),"Big circle · power-up","Abilities and crests.")}
  ${[["must","bellb","Biggest, gold ring and crown"],["main","judge","Middle size, solid ring"],["side","skull","Smallest, dashed ring"]].map(a=>lrow(`<svg viewBox="-23 -27 46 50" aria-hidden="true"><g class="ic">${bossBody(byId(a[1]),COL.green,0)}</g></svg>`,a[2]+" · "+BOSS_L[a[0]][0].replace("👑 ","").toLowerCase(),BOSS_L[a[0]][1])).join("")}
  ${lrow(lsvg(legI(COL.green,"pin",{tip:1})),"Gold dot · tips","The item has a tip for the fight or the route.")}
  ${lrow(lsvg(legI(COL.green,"shop",{sq:1,n:3})),"Square · shop or menu","The number is how many things inside you still need.")}
  ${lrow(lsvg(legI(NPCC,"eye",{sq:1,rx:10})),"Round square · character","NPCs: who they are and what they want.")}
  ${lrow(lsvg(legI("#5c4a8a","map",{sq:1,rx:3})),"Purple square · area guide","An area whose spots aren't pinned one by one.")}
  ${lrow(lsvg(legI("#9c36b5","flower",{dia:1})),"Diamond · quest pickup","Wish ingredients. Not counted in progress.")}
  ${lrow(lsvg(`<rect x="-8.5" y="-8.5" width="17" height="17" rx="4" fill="#a8841c" stroke="#14110f" stroke-width="1.6"/>${glyph('bench',0,0,.5,'#14110f')}`),"Gold square · bench","Gets brighter once you've unlocked it.")}
  ${lrow(lsvg(`<circle r="11.5" fill="#0c8599" stroke="#fff" stroke-width="2"/>${glyph('bellway',0,0,.56)}`),"Teal circle · Bellway","Fast travel.")}
  ${lrow(lsvg(`<circle r="10" fill="#6741d9" stroke="#fff" stroke-width="1.8"/>${glyph('tube',0,0,.5)}`),"Purple circle · Ventrica","Fast travel in the Citadel.")}
  ${lrow(lsvg(`<circle r="14" fill="rgba(20,17,15,.92)" stroke="${COL.green}" stroke-width="3"/><text y="4" font-size="11" font-weight="800" text-anchor="middle" fill="#fff">7</text>`),"Bubble · busy spot","Tap for a list, or zoom in.")}
  </div><div class="scard"><b style="display:block;margin-bottom:4px">In the way (zoomed in)</b>
  ${lrow(lsvg(gateI("open",OPENG)),"Open","Works for you now. Routes use it.")}
  ${lrow(lsvg(gateI("shut",LOCKG)),"Locked","Routes avoid it until you have what it needs.")}
  ${lrow(lsvg(gateI("info",GGL.lever)),"Something to do","A lever, wall or gauntlet you can deal with.")}
  ${lrow(lsvg(gateI("done",GGL.wall)),"Done","You ticked it or found what's behind it.")}
  ${lrow(lsvg(gateI("info",GGL.wall)+'<path d="M9 -13.5l1.4 2.9 3.1.4-2.3 2.1.6 3.1L9 -6.5l-2.8 1.5.6-3.1-2.3-2.1 3.1-.4z" fill="#ffd43b" stroke="#14110f" stroke-width=".8"/>'),"Gold star · secret","Something hidden behind it you haven't collected.")}
  ${lrow('<span class="lgline"></span>',"Gold line · your route","Follow the arrows. Teal arcs are Bellway rides.")}
  </div>`;
 h+=`<h3 id="set-phone">Phone & controls</h3>
  ${tog('bigui','Bigger buttons','Larger zoom and map buttons, easier to hit with a thumb.')}
  ${tog('lefty','Buttons on the left','For left-handed use.')}
  ${tog('haptic','Vibrate when ticking','A short buzz when you mark something collected.')}
  ${tog('startmenu','Start menu','When the app opens: the newest update, every version in a list, and Start, Options and Quit. Off = straight to the map.')}

  <p class="note">Tip: Android's back button closes the open panel first, so you won't leave the app by accident.</p>`;
 h+=`<h3 id="set-update">Updates</h3><div class="scard"><b>Version ${typeof APP_VERSION!=="undefined"?APP_VERSION:"?"}</b><p>${BOOT.isApp()?"The app checks for updates every time it starts. You can also check right now.":"The web version always runs the newest version."}</p>
  <button class="btn" style="font-weight:700" onclick="BOOT.checkUpdate()">🔄 Check for updates</button><button class="btn" onclick="BOOT.openLog()">📜 Update log: what changed in every version</button></div>`;
 h+=`<p class="note" style="margin:18px 4px 4px">Unofficial fan-made app, free for everyone. Not made by or connected to Team Cherry. Hollow Knight and Hollow Knight: Silksong are trademarks of Team Cherry. Game facts and pictures come from the community wiki at hollowknight.wiki.</p>`;
 if(DONATE_URL)h+=`<h3 id="set-support">Support</h3><div class="scard"><b>❤️ Like the app?</b><p>It is free and stays free: no ads, nothing to buy. If you want to say thanks, you can leave a small donation. It helps keep it going.</p><button class="btn" style="font-weight:700" onclick="openDonate()">❤️ Support the app</button></div>`;
 B.innerHTML=h;if(sv)sv.scrollTop=top}
function szLive(v){v=+v;document.getElementById("szv").textContent=Math.round(v*100)+"%";S.set=Object.assign({},S.set||{},{sz:v});applySet();document.getElementById("szp").innerHTML=previewSVG();drawOv()}
// ===================== Back button =====================
// Android's back button goes back in the page history. Each open panel adds one step, so back closes the panel instead of leaving the app.
let backN=0,backSkip=0;
function anyOpen(){return (typeof hlpIsOpen==="function"&&hlpIsOpen())||picZoomOpen()||rptIsOpen()||document.getElementById("set").classList.contains("on")||document.getElementById("lpop").classList.contains("on")||sheet.classList.contains("up")||drw.classList.contains("open")}
function backPush(){if(backN===0){try{history.pushState({p:1},"");backN=1}catch(e){}}}
window.addEventListener("popstate",()=>{if(backSkip){backSkip=0;return}backN=0;
 const st=document.getElementById("set"),lp=document.getElementById("lpop");
 if(typeof hlpIsOpen==="function"&&hlpIsOpen())hClose();else if(picZoomOpen())picZoomClose();else if(rptIsOpen())closeReport();else if(st.classList.contains("on"))closeSettings();else if(lp.classList.contains("on"))lp.classList.remove("on");else if(sheet.classList.contains("full"))sheetFull(false);
 else if(sheet.classList.contains("up")){closeSheet();openG=null;openC=null;drawOv()}else if(drw.classList.contains("open"))closeDrawer();else if(R)clearRoute();
 if(anyOpen()||R)backPush()});
// keep one history step while anything is open; drop it again once everything is closed by hand
new MutationObserver(()=>{if(anyOpen())backPush();else if(backN&&!R){backN=0;backSkip=1;try{history.back()}catch(e){backSkip=0}}}).observe(document.body,{subtree:true,attributes:true,attributeFilter:["class"]});
applySet();setVB();refresh();
