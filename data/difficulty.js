// ---------- difficulty ratings ----------
// 1 = Easy · 2 = Moderate · 3 = Tricky · 4 = Hard · 5 = Very hard
// An area's rating is about getting through it (enemies, platforming, hazards, how far apart the benches are).
// Bosses, arenas (gates of kind "fight"), wishes and pickups are rated on their own, separate from their area.
// Pickups without an entry here get a rating worked out from their text and from the fight in front of them (see diffOf in app.js).
// These are first estimates: change a number here whenever a rating feels off.
const DIFF={
 area:{moss:1,bb:1,marrow:1,dd:2,far:2,hunt:3,grey:2,shell:2,bell:1,worm:2,weave:2,blast:3,karak:4,fay:5,slab:3,gate:2,
  cchor:3,chall:4,ccog:3,ccrad:3,cmem:2,csong:1,cvault:2,cward:3,cunder:3,organ:3,wisp:2,sinner:3,ducts:4,bile:5,verd:3,abyss:4},
 // bosses (items)
 it:{a1RosPilBW:2,lostlace:5,farsight:3,palestag:4,clover:4,conjHeart:4,vog:4,mapPD:3,wreath:2,longclaw:3,craftPL:2,groal:5,tbud:3,ruinedT:3,qsling:3,maskBW:4,fleaBW1:3,fleaBW2:3,seekSoul:5,thring:4,ragingc:3,khann:4,voltvyrm:3,watcher:4,crustnut:3,fleaK:3,mossm:1,bellb:2,skull:2,lace:2,fore:3,chorus:2,moor:3,splinter:3,needo:3,craggler:2,lugoli:2,fotf:3,conch:2,judge:4,
  a1MossM2:2,a1SkullT2:3,a1RosPilB:2,a1RosPilS:1,a1MossMs:2,a1Zango:3,a1Gurr:3,a1Karm:5,a1Crawf:4,seth:4,nyleth:4,belleater:3,
  sentinel:3,dancers:3,lace2:4,pinstB:4,fay:5,fleaFay:4,memcrys:3,maskFay:3,maskBV:4,silkshotW:4,gms:3,brood:3,garmond:2,trobbio:3,ttrobbio:4,unravelled:3,phantom:3},
 // arenas and gauntlets (gates)
 gate:{uwsteam:3,uwmidA:3,uwcaul:3,trobl:3,ccwest:3,forum:5,dancersG:3,cogsw:3,cogse:4,cogne:4,laceG:4,memne:3,vaultin:2,sherma:3,
  moss:1,mossrc:1,f_lockM:2,mwbeast:2,g_wander:2,mwgaunt:1,skarrg:2,moorg:3,hhgaunt:3,swgaunt:2,pinst:3,f_mask4:3,
  a1g566:2,a1g567:2,a1g568:3,a1g569:2,a1g570:3,f_fleaF1:2,a1g1307:2,f_skeyR:3,a1g571:3,a1g1373:4,a1g1352:3,a1g1261:3},
 wish:{main:3,bbrep:1,bridge:1,tyrant:2,garb:1,flint:2,fleas:2,berry:1,pollip:2,alch:2,spines:1,roach:2,bugs:2,crawbug:2,silver:1,
  courier:3,resto:1,oil:3,rebirth:2,infest:3,beastfly:4,fastest:4,hidden:3,darkh:3,melodyq:4,sbuild:1,wmerch:2,finepins:2,cloaks:2,
  sstrong:1,wailing:3,lmerch:2,balm:3,taste:3,audience:3,pam:5,silksoul:3},
 // What changes a rating once the player has it: [what, change, why]. "what" = an ability, key, flag or item id ("a|b" = either one).
 // A negative change makes it easier, a positive one harder. The card shows the rating for what the player has right now,
 // and lists each of these so they can see what would make it easier.
 mod:{
  area:{ducts:[["wreath",-1,"the Wreath of Purity protects you from Muckmaggots"]],fay:[["fay",-2,"the Faydown Cloak stops you freezing"]]},
  it:{palestag:[["longclaw",-1,"the Longclaw lets you reach her from under her platform"]],vog:[["soar",-2,"you can fly up instead of riding the Barnaks"],["belt",-1,"the Weighted Belt slows the Barnaks' pull"]],groal:[["phial",-1,"with the Plasmium Phial you can heal even while infested"],["conchcut",-1,"thrown tools let you hit him from the safe corners"]],voltvyrm:[["soar",-1,"Silk Soar makes the climb to Voltnest much easier"]],fleaK:[["soar",-1,"you can fly straight up to it"]],
   dancers:[["ascGrip",-1,"cling to the middle of a side wall and most attacks miss you"]],
   belleater:[["drift",-1,"float over its charge along the floor"]],
   nyleth:[["storm",-1,"Thread Storm hits hard while she clings to a wall"]],
   fay:[["flint",-1,"using the Flintslate warms you up and slows the frost"],["pimp",-1,"the blast of your own Pimpillo warms you up"]],
   fleaFay:[["fay",-2,"the Faydown Cloak stops you freezing"]],
   memcrys:[["fay",-1,"the Faydown Cloak stops you freezing"]],
   silkshotW:[["fay",-2,"the Faydown Cloak stops you freezing"]]
  },
  gate:{},
  wish:{}
 }
};
