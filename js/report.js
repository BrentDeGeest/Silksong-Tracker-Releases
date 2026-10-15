// ---------- reports: problems and ideas from players ----------
// A ⚠ button on every card asks "bug or suggestion?" and then opens a small form. Reports are sent to a Google Form, so nobody needs an account.
// url = the form's ".../formResponse" address · the rest = the form's field ids ("entry.123456").
// While url is empty the buttons stay hidden.
const REPORT={url:"https://docs.google.com/forms/d/e/1FAIpQLSfCc1Jhp1wcR92FJ_ljIDToLum-UqnBWZrZnVrQmpMJNgO6qQ/formResponse",type:"entry.1475101114",text:"entry.741198031",about:"entry.1696877764",info:"entry.733853802"};
const RPT_KEY="ssrq",RPT_MAX=1000;
let rptCur=null;
const rptOn=()=>!!REPORT.url;
const rptIsOpen=()=>{const e=document.getElementById("rpt");return !!(e&&e.classList.contains("on"))};
const RPT_IC=`<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 3.2 22 20.5H2Z" fill="#ffd43b" stroke="#14110f" stroke-width="1.4" stroke-linejoin="round"/><path d="M12 9.5v5.2" stroke="#14110f" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="17.6" r="1.25" fill="#14110f"/></svg>`;
// The small button on a card. kind: it = item · g = character/shop · gate = lock, lever, wall · wish
function rptBtn(kind,id){return rptOn()?`<button class="rb" aria-label="Report a bug or suggest a change for this" title="Report a bug or suggest a change" onclick="openReport('${kind}','${id}')">${RPT_IC}</button>`:""}
function rptAbout(kind,id){try{
  if(kind==="it"){const i=byId(id);return{n:i.n,a:aName(areaOf(i)),p:placeOf(i),st:st(i)}}
  if(kind==="g"){const g=G[id];return{n:g.n,a:aName(g.a),p:gp(id)}}
  if(kind==="gate"){const g=gById(id);return{n:g.n,a:aName(gArea(g)),p:gPos(g),st:gState(g)}}
  if(kind==="wish"){const w=wById(id);return{n:w.n+" (wish)",a:""}}
 }catch(e){}
 return null}
function rptUid(){try{let u=localStorage.getItem("ssuid");if(!u){u=Date.now().toString(36)+Math.random().toString(36).slice(2,10);localStorage.setItem("ssuid",u)}return u}catch(e){return""}}
function rptQueue(){try{return JSON.parse(localStorage.getItem(RPT_KEY)||"[]")}catch(e){return[]}}
function rptSaveQueue(q){try{localStorage.setItem(RPT_KEY,JSON.stringify(q.slice(-20)))}catch(e){}}
// Step 1: choose what it is. Step 2: write it. Bugs and suggestions are kept apart (the Type column) because they are handled differently.
const RPT_T={bug:{t:"Report a bug",s:"Bug",ph:"What's wrong, and what should it be? For example: this is in the wrong spot, it needs a different ability, or the text is unclear."},
 idea:{t:"Suggest a feature or change",s:"Suggestion",ph:"What would you like to see added or changed?"}};
function rptEl(){let el=document.getElementById("rpt");
 if(!el){el=document.createElement("div");el.id="rpt";el.setAttribute("role","dialog");el.setAttribute("aria-modal","true");el.setAttribute("aria-labelledby","rptT");
  el.addEventListener("click",e=>{if(e.target===el)closeReport()});document.body.appendChild(el)}
 return el}
const rptAb=()=>{const ab=rptCur&&rptCur.ab;return `<p class="rab">${ab?`About: <b>${esc(ab.n)}</b>${ab.a?" · "+esc(ab.a):""}`:"About the app in general"}</p>`};
function openReport(kind,id){
 rptCur={kind:kind||"app",id:id||"",ab:kind?rptAbout(kind,id):null,type:null};
 const el=rptEl();
 el.innerHTML=`<div class="rbox"><div class="rph"><b id="rptT">What would you like to do?</b><button class="x" aria-label="Close" onclick="closeReport()">✕</button></div>${rptAb()}
  <div class="rch"><button onclick="rptType('bug')"><i aria-hidden="true">🐞</i><span><b>Report a bug</b><small>Something is wrong, missing or in the wrong spot</small></span></button>
  <button onclick="rptType('idea')"><i aria-hidden="true">💡</i><span><b>Suggest a feature or change</b><small>An idea to make the app better</small></span></button></div></div>`;
 el.classList.add("on")}
function rptType(t){if(!rptCur||!RPT_T[t])return;rptCur.type=t;const T=RPT_T[t],ab=rptCur.ab;
 rptEl().innerHTML=`<div class="rbox"><div class="rph"><button class="x" aria-label="Back to the choice" onclick="openReport(${rptCur.kind==="app"?"":`'${rptCur.kind}','${rptCur.id}'`})">‹</button><b id="rptT">${T.t}</b><button class="x" aria-label="Close" onclick="closeReport()">✕</button></div>${rptAb()}
  <textarea id="rptX" maxlength="${RPT_MAX}" rows="5" aria-label="Your message" placeholder="${T.ph}" oninput="rptCount()"></textarea>
  <div class="rft"><small>No account needed. Sent with ${ab?"this pin's name":"your app version"} so it's easy to find.</small><small id="rptN"></small></div>
  <div class="rbt"><button onclick="closeReport()">Cancel</button><button class="rpri" id="rptS" onclick="sendReport()">Send</button></div></div>`;
 rptCount();setTimeout(()=>{const x=document.getElementById("rptX");if(x)x.focus()},60)}
function rptCount(){const x=document.getElementById("rptX"),n=document.getElementById("rptN"),s=document.getElementById("rptS");if(!x)return;
 const l=x.value.trim().length;if(n)n.textContent=x.value.length>RPT_MAX-200?x.value.length+" / "+RPT_MAX:"";if(s)s.disabled=l<3}
function closeReport(){const el=document.getElementById("rpt");if(el)el.classList.remove("on");rptCur=null}
function sendReport(){const x=document.getElementById("rptX");if(!x||!rptCur||!rptCur.type)return;const text=x.value.trim().slice(0,RPT_MAX);if(text.length<3)return;
 const c=rptCur,ab=c.ab,nat=!!(window.Capacitor&&typeof Capacitor.isNativePlatform==="function"&&Capacitor.isNativePlatform());
 const info={v:APP_VERSION,app:nat?"android":"web",kind:c.kind,id:c.id,uid:rptUid(),t:new Date().toISOString(),have:Object.keys(S.have||{}).filter(k=>S.have[k])};
 if(ab){if(ab.p)info.p=ab.p.map(Math.round);if(ab.st)info.st=ab.st}
 const q=rptQueue();q.push({type:RPT_T[c.type].s,text,about:ab?ab.n+(ab.a?" · "+ab.a:"")+" ["+c.kind+":"+c.id+"]":"The app in general",info:JSON.stringify(info)});rptSaveQueue(q);
 closeReport();toast(navigator.onLine===false?"Saved. It will be sent when you're back online.":c.type==="idea"?"Thank you! Your suggestion was sent.":"Thank you! Your bug report was sent.");flushReports()}
// Sends everything that is waiting. A report only leaves the queue once the request went through.
let rptBusy=false;
async function flushReports(){if(!rptOn()||rptBusy)return;rptBusy=true;
 try{let q=rptQueue();
  while(q.length){const r=q[0],b=new URLSearchParams();b.set(REPORT.type,r.type);b.set(REPORT.text,r.text);b.set(REPORT.about,r.about);b.set(REPORT.info,r.info);
   await fetch(REPORT.url,{method:"POST",mode:"no-cors",body:b});
   q=rptQueue();q.shift();rptSaveQueue(q)}
 }catch(e){}
 rptBusy=false}
window.addEventListener("online",flushReports);
window.addEventListener("load",()=>setTimeout(flushReports,4000));
