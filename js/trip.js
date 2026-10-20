// ---------- Trip: several stops in one go ----------
// Lesson from delivery apps (Brent, 20 Oct 2026): with several stops, always show the WHOLE trip and make the NEXT stop obvious.
// S.trip = ["it:<id>" | "g:<key>", …] in visiting order. S.tripV = {key:1} for stops already visited.
// The map numbers every stop and joins them with a dashed line; the next stop is gold. Directions always go to the next stop,
// and "✓ Got it" ticks it off and starts the directions to the one after.
const tripList=()=>S.trip||(S.trip=[]);
const tripVis=()=>S.tripV||(S.tripV={});
function tripStop(k){const c=k.indexOf(":"),kind=k.slice(0,c),id=k.slice(c+1);
 if(kind==="it"){const i=byId(id);if(!i)return null;return{k,kind,id,n:i.n,p:placeOf(i),a:areaOf(i),done:!!tripVis()[k]||!!S.done[id]}}
 const g=G[id];if(!g)return null;return{k,kind,id,n:g.n,p:gp(id),a:g.a,done:!!tripVis()[k]}}
// a stop name with its area, so several "Mask Shard" stops can be told apart
const tripName=s=>s?s.n+(tripList().filter(k=>{const t=tripStop(k);return t&&t.n===s.n}).length>1?" · "+aN(s.a):""):"";
const tripStops=()=>tripList().map(tripStop).filter(s=>s&&s.p);
const tripNext=()=>tripStops().find(s=>!s.done)||null;
const inTrip=(kind,id)=>tripList().includes(kind+":"+id);
const tripStart=()=>{const H=hereSpot();return H&&H.p?H.p:null};
// visited stops stay first; the rest in a sensible order: each time the closest stop to where you are
function tripOrder(){const all=tripStops(),done=all.filter(s=>s.done),left=all.filter(s=>!s.done);let at=tripStart()||(done.length?done[done.length-1].p:left[0]&&left[0].p);const out=[];
 while(left.length){let b=0,bd=1e12;left.forEach((s,j)=>{const d=at?Math.hypot(s.p[0]-at[0],s.p[1]-at[1]):j;if(d<bd){bd=d;b=j}});const s=left.splice(b,1)[0];out.push(s);at=s.p}
 S.trip=done.map(s=>s.k).concat(out.map(s=>s.k));save()}
function tripAdd(kind,id,quiet){const k=kind+":"+id;if(tripList().includes(k))return false;tripList().push(k);delete tripVis()[k];tripOrder();drawOv();tripChip();
 if(!quiet){const n=tripStops().filter(s=>!s.done).length;toast(`🧭 Added to your trip (${n} stop${n>1?"s":""})`,"Show trip",tripPanel)}return true}
function tripRemove(k){S.trip=tripList().filter(x=>x!==k);delete tripVis()[k];save();drawOv();tripChip()}
function tripToggle(kind,id){if(inTrip(kind,id)){tripRemove(kind+":"+id);toast("Removed from your trip")}else tripAdd(kind,id);
 if(sheet.classList.contains("up")){if(kind==="it"&&sel===id)showItem(id,itemFrom);else if(kind==="g"&&openG===id)showGroup(id)}}
function tripClear(){S.trip=[];S.tripV={};save();if(R&&R.trip)clearRoute();closeSheet();drawOv();tripChip()}
// directions to the next stop
function tripGo(){const s=tripNext();if(!s){tripFinished();return}showWay(s.kind,s.id);if(R)R.trip=true;tripBanner()}
// the next stop is reached: tick it (items count as collected), then on to the one after
function tripGot(){const s=tripNext();if(!s)return;tripVis()[s.k]=1;if(s.kind==="it"&&!S.done[s.id])toggle(s.id);if(s.kind==="it")S.here={id:s.id,src:"tick"};save();
 const n=tripNext();if(n){tripGo();toast(`✓ ${esc(s.n)} done. Next stop: <b>${esc(n.n)}</b>`)}else tripFinished()}
function tripFinished(){if(R&&R.trip)clearRoute();drawOv();tripChip();sc_.innerHTML=`<div class="sh"><div class="t"><b>🎉 Trip finished!</b></div><button class="x" aria-label="Close" onclick="closeSheet()">✕</button></div><p>You visited every stop.</p><div class="acts"><button class="prim" onclick="tripClear()">Clear the trip</button><button class="sec" onclick="closeSheet()">Keep the list</button></div>`;sheet.classList.add("up")}
// the trip on the bottom card: every stop, numbered, the next one highlighted
function tripPanel(){const st=tripStops(),left=st.filter(s=>!s.done).length,nx=tripNext();sel=null;openG=null;
 if(!st.length){sc_.innerHTML=`<div class="sh"><div class="t"><b>🧭 Your trip</b></div><button class="x" aria-label="Close" onclick="closeSheet()">✕</button></div><p>Your trip is empty. Open any pin and tap <b>➕ Add to trip</b>, or ask the Helper something like “make a trip of the mask shards”.</p>`;sheet.classList.add("up");return}
 sc_.innerHTML=`<div class="sh"><div class="t"><b>🧭 Your trip</b><br><small>${left?`${left} of ${st.length} stop${st.length>1?"s":""} left`:"All stops visited"}</small></div><button class="x" aria-label="Close" onclick="closeSheet();drawOv()">✕</button></div>
  ${nx?`<div class="tripnx"><small>NEXT STOP</small><b>${esc(nx.n)}</b><span>${esc(aN(nx.a))}</span></div><div class="acts"><button class="way" onclick="tripGo()">🧭 Directions to it</button><button class="prim" onclick="tripGot()">✓ Got it, next</button></div>`:""}
  <ol class="tripl">${st.map((s,j)=>`<li class="${s.done?"d":""}${nx&&s.k===nx.k?" nx":""}"><span class="tn">${s.done?"✓":j+1}</span><button class="tt" onclick="${s.kind==="it"?`goTo('${s.id}')`:`moveToGroup('${s.id}')`}"><b>${esc(s.n)}</b><small>${esc(aN(s.a))}</small></button><button class="tx" aria-label="Remove from the trip" onclick="tripRemove('${s.k}');tripPanel()">✕</button></li>`).join("")}</ol>
  <div class="acts"><button class="sec" onclick="tripOrder();tripPanel();drawOv()">🔀 Best order from here</button><button class="sec" onclick="tripClear()">🗑 Clear trip</button></div>`;
 sheet.classList.add("up");fitTrip()}
function fitTrip(){const ps=tripStops().filter(s=>!s.done).map(s=>s.p);if(!ps.length)return;const xs=ps.map(p=>p[0]),ys=ps.map(p=>p[1]),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
 const w=Math.max(300,x1-x0+160),h=Math.max(300,y1-y0+160);vb=[(x0+x1)/2-w/2,(y0+y1)/2-h/2,w,h];vb[1]+=.18*h;setVB();drawOv()}
// on the route card: where this stop sits in the trip, and what comes after
function tripBanner(){if(!R||!R.trip)return;const st=tripStops(),nx=tripNext();if(!nx)return;const j=st.findIndex(s=>s.k===nx.k),after=st.slice(j+1).find(s=>!s.done);
 const box=sc_.querySelector(".rsheet");if(!box||box.querySelector(".tripbn"))return;
 box.insertAdjacentHTML("afterbegin",`<div class="tripbn"><span class="tn">${j+1}</span><div><small>TRIP · STOP ${j+1} OF ${st.length}</small><b>${esc(tripName(nx))}</b>${after?`<em>After this: ${esc(tripName(after))}</em>`:`<em>This is the last stop</em>`}</div><button class="prim" onclick="tripGot()">✓ Got it</button></div>`)}
// numbers and a dashed line on the map
function tripSVG(s,k){setTimeout(tripChip,0);const st=tripStops();if(!st.length)return"";const nx=tripNext(),left=st.filter(x=>!x.done);let o="";
 const st0=tripStart();const line=(st0&&nx?[st0]:[]).concat(left.map(x=>x.p));
 if(line.length>1)o+=`<polyline points="${line.map(p=>p.join(",")).join(" ")}" fill="none" stroke="#ffd43b" stroke-width="${2.2*s}" stroke-dasharray="${7*s} ${6*s}" stroke-linecap="round" opacity=".85" pointer-events="none"/>`;
 st.forEach((x,j)=>{const isN=nx&&x.k===nx.k,r=(isN?11:8.5)*k,y=x.p[1]-24*k;
  o+=`<g transform="translate(${x.p[0]} ${y})" class="tripm${isN?" nx":""}${x.done?" d":""}" style="cursor:pointer" onclick="tripPanel()">${isN?`<circle r="${r+5*k}" fill="none" stroke="#ffd43b" stroke-width="${2*k}" class="trippulse"/>`:""}<circle r="${r}" fill="${x.done?"#868e96":isN?"#ffd43b":"#14110f"}" stroke="${x.done?"#ccc":"#ffd43b"}" stroke-width="${1.6*k}"/><text y="${(isN?4.2:3.4)*k}" text-anchor="middle" font-size="${(isN?12:10)*k}" font-weight="800" fill="${isN?"#14110f":"#fff"}">${x.done?"✓":j+1}</text></g>`});
 return o}
// the trip button on the map
function tripChip(){let c=document.getElementById("tripchip");const st=tripStops(),left=st.filter(s=>!s.done).length;
 if(!st.length){if(c)c.remove();return}
 if(!c){c=document.createElement("button");c.id="tripchip";c.onclick=tripPanel;document.getElementById("wrap").appendChild(c)}
 c.innerHTML=left?`🧭 Trip · <b>${st.length-left+1}</b>/${st.length}<small>Next: ${esc(tripName(tripNext()))}</small>`:"🎉 Trip done"}
// "➕ Add to trip" on every item and shop/character card
function tripCardBtn(kind,id){const a=sc_.querySelector(".acts,.wayr");if(!a||sc_.querySelector(".tripadd"))return;const on=inTrip(kind,id);
 a.insertAdjacentHTML("afterend",`<div class="tripadd"><button class="${on?"on":""}" onclick="tripToggle('${kind}','${id}')">${on?"✓ In your trip · remove":"➕ Add to trip"}</button>${tripList().length?`<button onclick="tripPanel()">🧭 Show trip (${tripStops().filter(s=>!s.done).length})</button>`:""}</div>`)}
// hook into the app's cards and route card (classic global functions, so they can be wrapped)
(function(){const si=showItem,sg=showGroup,ss=showSteps;
 showItem=function(id){const r=si.apply(this,arguments);try{tripCardBtn("it",id)}catch(e){}return r};
 showGroup=function(k){const r=sg.apply(this,arguments);try{tripCardBtn("g",k)}catch(e){}return r};
 showSteps=function(){const r=ss.apply(this,arguments);try{tripBanner()}catch(e){}return r};
 setTimeout(tripChip,0)})();
