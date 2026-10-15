// ---------- pictures of what a pin stands for ----------
// PICS (data/pics.js) maps pins to pictures in img/pins/. A pin uses its own picture if it has one (PICS.it / g / gate),
// otherwise the picture of its wiki page (PICS.w).
// Every card ends with the pin's picture. Setting "pic": tap = it also floats above the pin on the map until the card is
// slid all the way up · card = only in the card · off = no pictures. Tapping a picture shows it on the whole screen.
const picMode=()=>{try{return SET().pic||"tap"}catch(e){return"tap"}};
function picFile(kind,id){try{
  if(kind==="it"){const i=byId(id);return PICS.it[id]||(i&&i.w&&PICS.w[decodeURIComponent(i.w)])||(i&&i.g&&picFile("g",i.g))||""}
  if(kind==="g"){const g=G[id];return PICS.g[id]||(g&&g.w&&PICS.w[decodeURIComponent(g.w)])||""}
  if(kind==="gate"){const g=gById(id);if(PICS.gate[id])return PICS.gate[id];if(g&&g.hides)return g.hides.startsWith("G:")?picFile("g",g.hides.slice(2)):picFile("it",g.hides);return""}
 }catch(e){}return""}
const picAlt=(kind,id)=>{try{return esc(kind==="it"?byId(id).n:kind==="g"?G[id].n:gById(id).n)}catch(e){return""}};
function picCard(){return""} // kept for older card templates; the picture is now added at the end of the card by picTap
// Called when a card has been drawn: adds the picture at the end of the card and, in "tap" mode, floats it above the pin.
let picAt=null,picRaf=0,picTtl="";
function picHide(){picAt=null;const e=document.getElementById("picpop");if(e)e.classList.remove("on");cancelAnimationFrame(picRaf)}
function picTap(kind,id){picHide();const mode=picMode();if(mode==="off")return;const f=picFile(kind,id);if(!f)return;
 const alt=picAlt(kind,id);
 try{sc_.insertAdjacentHTML("beforeend",`<figure class="pcf"><button class="pcb" aria-label="Show the picture of ${alt} on the whole screen" onclick="picZoom('${f}')"><img src="img/pins/${f}" alt="Picture of ${alt}" loading="lazy" onerror="this.closest('.pcf').remove()"><span aria-hidden="true">⤢</span></button></figure>`)}catch(e){}
 if(mode!=="tap")return;
 let p=null;try{p=kind==="it"?placeOf(byId(id)):kind==="g"?gp(id):gPos(gById(id))}catch(e){}if(!p)return;
 let e=document.getElementById("picpop");if(!e){e=document.createElement("button");e.id="picpop";e.setAttribute("aria-label","Show this picture on the whole screen");document.body.appendChild(e)}
 e.onclick=()=>picZoom(f);e.innerHTML=`<img src="img/pins/${f}" alt="" onerror="picHide()">`;picAt=p;const t=document.querySelector("#sc .sh b");picTtl=t?t.textContent:"";e.classList.add("on");picPlace()}
function picPlace(){const e=document.getElementById("picpop");if(!e||!picAt)return;
 const ttl=document.querySelector("#sc .sh b");if(!sheet.classList.contains("up")||!ttl||ttl.textContent!==picTtl){picHide();return}
 try{const pt=svg.createSVGPoint();pt.x=picAt[0];pt.y=picAt[1];const s=pt.matrixTransform(svg.getScreenCTM()),w=e.offsetWidth||160,h=e.offsetHeight||110;
  const top=document.querySelector("header").getBoundingClientRect().bottom+6,bot=sheet.getBoundingClientRect().top-6;
  let x=Math.max(8+w/2,Math.min(innerWidth-8-w/2,s.x)),y=s.y-26-h;const below=y<top;if(below)y=s.y+26;
  // once the description is opened up (card pulled up, or a section unfolded) the picture is in the card, so the floating one goes away
  const reading=sheet.classList.contains("full");
  const off=reading||s.y<top-10||s.y>bot+10||s.x<-10||s.x>innerWidth+10||y+h>bot+40;
  e.style.opacity=off?"0":"1";e.style.pointerEvents=off?"none":"auto";e.style.left=(x-w/2)+"px";e.style.top=y+"px";e.classList.toggle("below",below)}catch(err){}
 picRaf=requestAnimationFrame(picPlace)}
// ---------- picture on the whole screen ----------
const picZoomOpen=()=>{const e=document.getElementById("piczoom");return !!(e&&e.classList.contains("on"))};
function picZoom(f){let e=document.getElementById("piczoom");
 if(!e){e=document.createElement("div");e.id="piczoom";e.setAttribute("role","dialog");e.setAttribute("aria-modal","true");e.setAttribute("aria-label","Picture");e.addEventListener("click",picZoomClose);document.body.appendChild(e)}
 e.innerHTML=`<img src="img/pins/${f}" alt=""><button class="x" aria-label="Close the picture">✕</button><small>Tap anywhere to close</small>`;e.classList.add("on")}
function picZoomClose(){const e=document.getElementById("piczoom");if(e)e.classList.remove("on")}
document.addEventListener("keydown",ev=>{if(ev.key==="Escape"&&picZoomOpen())picZoomClose()});
