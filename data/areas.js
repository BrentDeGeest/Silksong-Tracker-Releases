// ---------- areas (fog of war) ----------
const AREAS=[
 {id:"moss",n:"Moss Grotto & Bonegrave",r:[[490,2490,1220,2768]]},
 {id:"bb",n:"Bone Bottom & Mosshome",r:[[960,2200,1320,2610]]},
 {id:"marrow",n:"The Marrow",r:[[1300,2240,2340,2640]]},
 {id:"dd",n:"Deep Docks",r:[[2240,2465,3260,2985]]},
 {id:"far",n:"Far Fields",r:[[3240,2190,4350,2790],[2890,2420,3250,2700]]},
 {id:"hunt",n:"Hunter's March",r:[[2240,2235,3240,2470],[2046,2420,2240,2470]]},
 {id:"grey",n:"Greymoor & Craw Lake",r:[[2190,1800,3160,2200],[3150,1850,3800,2110]]},
 {id:"shell",n:"Shellwood",r:[[1040,1780,1920,2245]]},
 {id:"bell",n:"Bellhart",r:[[1910,1880,2215,2410]]},
 {id:"worm",n:"Wormways",r:[[170,2200,965,2500]]},
 {id:"weave",n:"Weavenest Atla",r:[[980,2650,1720,2850],[820,2768,980,2850]]},
 {id:"blast",n:"Blasted Steps",r:[[394,1576,1226,2003],[1226,1500,1392,1576]]},
 {id:"karak",n:"Sands of Karak",r:[[372,1193,1423,1576],[1380,1350,1422,1415],[820,1150,912,1193]]},
 {id:"fay",uses:["weavel", "flint", "phial"],n:"Mount Fay",r:[[285,438,1182,1182],[930,1170,1182,1222]]},
 {id:"slab",n:"The Slab",r:[[1182,766,1554,1248]]},
 {id:"gate",n:"Grand Gate",r:[[1314, 1380, 1751, 1576], [1530, 1576, 1740, 1720]]},
 {id:"cchor",n:"Choral Chambers",r:[[1560, 870, 2380, 1290], [1600, 1240, 2010, 1420], [2380, 1120, 2640, 1300], [2640, 1236, 2960, 1300], [2560, 1000, 2660, 1120]]},
 {id:"chall",n:"High Halls",r:[[1840, 470, 2370, 880]]},
 {id:"ccog",n:"Cogwork Core",r:[[2380, 520, 2560, 1120], [2560, 880, 2700, 1000], [2200, 930, 2380, 1000]]},
 {id:"ccrad",n:"The Cradle",r:[[2370, 140, 2680, 520]]},
 {id:"cmem",n:"Memorium",r:[[2580, 590, 3150, 880]]},
 {id:"csong",n:"Songclave",r:[[2870, 850, 3015, 945]]},
 {id:"cvault",n:"Whispering Vaults",r:[[2660, 1000, 3290, 1235], [2850, 1235, 3290, 1300], [3015, 850, 3290, 1000], [2870, 945, 3015, 1000], [2700, 920, 2870, 1000]]},
 {id:"cward",n:"Whiteward",r:[[2020, 1235, 2700, 1440]]},
 {id:"cunder",n:"Underworks",r:[[1730, 1430, 2850, 1720], [1740, 1380, 2020, 1430], [2850, 1300, 3200, 1500]]},
 {id:"organ",n:"Exhaust Organ",r:[[2850, 1500, 3290, 1625], [3200, 1300, 3290, 1500]]},
 {id:"wisp",n:"Wisp Thicket",r:[[2014,1664,2890,1800]]},
 {id:"sinner",n:"Sinner's Road",r:[[2885,1690,3470,1960]]},
 {id:"ducts",n:"Putrified Ducts",r:[[3284,744,4444,985]]},
 {id:"bile",n:"Bilewater",r:[[3394,985,4225,1708],[3270,1560,3394,1640],[3215,1385,3270,1440],[3095,1430,3140,1475],[4225,1000,4380,1100],[3330,1460,3394,1505]]},
 {id:"verd",n:"Verdania",r:[[3831,1751,4663,2058],[3800,1920,3831,1970]]},
 {id:"abyss",n:"The Abyss",r:[[1970,3000,2890,3415]]}];
const ROUTE=["moss","bb","marrow","dd","far","grey","shell","bell"];
const DEF_AREAS=["moss","bb"];
const TRACKED=["moss","bb","marrow","dd","far","hunt","grey","shell","bell","worm","sinner","weave","wisp","blast","slab","gate","cchor","chall","ccog","ccrad","cmem","csong","cvault","cward","cunder","organ","karak","fay","ducts","bile","verd","abyss"]; // areas with item data (not used by the app itself)

// Landmarks: shown as small labels when zoomed in
const LM=[["Bellway",1573,2425],["Bellshrine",2765,2630],["Lace arena",2640,2638],["Diving Bell",2840,2920],["Bench / town",1150,2605],["Weaver Spire",1208,2335],["Weaver Spire",2593,2470],["Chapel of the Wanderer",565,2630],["Ruined Chapel",885,2655],["Pilgrim's Rest",3410,2470],["Weavenest Cindril",4205,2735],["Chapel of the Beast",3135,2398],["Halfway Home",2827,2055],["Weaver Spire",3695,1830],["Craw Lake",3700,2090],["Bellhart →",2230,2175],["Weaver Spire",1549,1890],["Greyroot",1571,2120],["Bellhart town",2085,2185],["Weavenest Karn",192,2400],["Zylotol's lab",630,2292],["Pinstress",470,1726],["Lumble",590,1700],["Grand Gate",1470,1506],["Shakra",1150,1840],["Karmelita (Act 3)",3700,2228]];
