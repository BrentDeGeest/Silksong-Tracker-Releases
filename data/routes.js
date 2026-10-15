// ---------- route network ----------
// Waypoints sit in the middle of the real corridors, so a route follows the passages on the map.
// Edges can need an ability ("cling", "swift", ...); routes avoid those until you have them.
const NV={
 // Moss Grotto, Bone Bottom, Mosshome
 mg_ch:[1083,2692],mg_up:[1045,2640],bb_w:[1045,2588],bb_t:[1160,2588],bb_e:[1265,2588],
 mh1:[1045,2480],mh1b:[1045,2440],mh2:[1045,2405],mh3:[1045,2365],mh_c:[1200,2405],mh_sp:[1207,2365],mh_dr:[1300,2365],
 mh4:[1045,2200],mh_w:[1046,2150],mh_top:[1045,2010],
 wm_e:[990,2440],wm_m:[700,2440],wm_w:[350,2425],wm_z:[630,2330],wm_t:[735,2310],wm_k:[742,2414],wm_sb:[737,2380],wm_n:[935,2232],
 bg_e:[900,2585],bg_w:[600,2585],bg_c:[742,2545],mg_rc:[878,2625],
 bs_e:[930,1990],bs_w:[600,1990],bs_up:[975,1760],bs_t:[1032,1682],bs_r:[1150,1820],bs_cf:[800,1775],bs_pn:[480,1756],bs_gg:[1320,1566],bs_j:[1480,1530],bs_s:[857,1668],bs_sh:[857,1495],bs_l:[612,1676],
 wa_1:[1180,2689],wa_t:[1355,2689],wa_pw:[1450,2684],wa_e:[1497,2706],wa_er:[1640,2738],wa_b:[1355,2784],wa_bn:[1279,2791],wa_mid:[1350,2755],wa_ml:[1172,2750],wa_sn:[1299,2717],wa_w:[1205,2797],wa_w2:[1060,2794],wa_mm:[862,2787],wa_ev0:[1400,2796],wa_ev:[1452,2811],
 // The Marrow
 mw_b1:[1340,2588],mw_g:[1405,2550],mw_sk:[1520,2470],mw_b2:[1450,2588],mw_b3:[1700,2585],mw_b4:[1850,2580],mw_b5:[2030,2580],mw_b6:[2200,2580],
 mw_u1:[1300,2405],mw_u2:[1450,2405],mw_u3:[1560,2410],mw_nr:[1560,2346],mw_u4:[1640,2410],mw_n:[1870,2409],mw_m:[1720,2470],mw_cv:[1830,2500],
 mw_s1:[2030,2500],mw_s2:[2030,2440],bv_b:[2045,2405],bv_t:[2098,2245],
 // Hunter's March
 hm1:[2150,2440],hm2:[2255,2440],hm3:[2265,2378],hm4:[2550,2378],hm5:[2780,2380],hm_b:[2866,2410],hm_d:[2778,2418],hm_n:[2770,2300],hm_bn:[2815,2327],hm_e:[2990,2410],hm_ch:[3140,2372],hm_ne:[2800,2252],hm_st:[2985,2325],hm_x:[3250,2270],
 // Deep Docks
 dd_w:[2290,2590],dd_m1:[2450,2595],dd_m2:[2560,2600],dd_m3:[2690,2605],dd_bs:[2757,2612],
 dd_u1:[2470,2560],dd_u2:[2604,2560],dd_u3:[2780,2550],dd_sp:[2594,2490],
 dd_f:[2560,2670],dd_l1:[2400,2760],dd_l2:[2560,2760],dd_l3:[2850,2760],dd_l4:[3100,2760],
 dd_s:[2400,2840],dd_b4:[2413,2905],dd_bt:[2600,2870],dd_db:[2853,2880],
 // Far Fields
 ff_w1:[2860,2600],ff_w2:[3100,2600],ff_lo:[3231,2690],
 ff_c0:[3295,2300],ff_c1:[3305,2440],ff_c2:[3305,2600],ff_c3:[3305,2700],
 ff_pr:[3414,2440],ff_ss:[3397,2574],ff_ch:[3452,2700],ff_bw:[3590,2690],ff_e:[3800,2700],ff_cd:[4090,2712],ff_wc:[4205,2714],
 ff_p2:[3560,2440],ff_sc:[3592,2520],ff_up:[3600,2380],ff_uw:[3345,2290],ff_fl:[3565,2414],ff_e1:[3900,2380],ff_cin:[4178,2380],
 // Greymoor, Craw Lake, Sinner's Road
 gm_j:[3290,2035],gm_bw:[3394,2016],gm_sk:[3462,2030],gm_e:[3550,2010],gm_bs:[3550,1915],gm_cr:[3700,2060],gm_cl:[3690,1905],
 gm_m1:[3050,2015],gm_hh:[2811,2015],gm_w1:[2650,2030],gm_y:[2500,1960],gm_tw:[2498,1900],gm_wp:[2459,1810],gm_w2:[2550,2120],gm_w3:[2400,2160],gm_bh:[2300,2172],
 sr1:[3061,1880],sr_b1:[3061,1835],sr2:[3300,1880],sr3:[3555,1870],
 // Bellhart & Shellwood
 bh_e:[2230,2172],bh_t:[2135,2172],bh_w:[1950,2180],bh_up:[2062,2030],
 sw_lo1:[1900,2215],sw_lo2:[1500,2215],sw_l1:[1460,2330],sw_l2:[1465,2200],sw_l3:[1470,2080],sw_m:[1470,2005],
 sw_bw:[1255,2003],sw_3:[1320,2100],sw_n:[1600,1930],sw_wb:[1100,2150],sw_lb:[1145,2148],sw_lt:[1143,2003],sw_wy:[1336,2003],sw_j:[1466,2152],sw_ch:[1790,2212],sw_g:[1640,2150],sw_p:[1730,2158],sw_t:[1765,2070],
 // The Citadel
 gg_h:[1590, 1535],gg_t:[1600, 1412],gg_al:[1668, 1425],gg_m:[1682, 1540],gg_lb:[1682, 1700],gg_s:[1648, 1665],uw_w:[1760, 1705],uw_b1:[1823, 1730],uw_m:[1832, 1612],uw_up:[1832, 1470],uw_ar:[1975, 1555],uw_c1:[2110, 1530],uw_t:[2140, 1490],uw_mid:[2340, 1600],uw_tb:[2395, 1590],uw_low:[2306, 1660],uw_cau:[2500, 1565],uw_arch:[2600, 1518],uw_claw:[2560, 1610],uw_ch:[2575, 1468],uw_e:[2740, 1540],uw_se:[2756, 1640],cc_s1:[1700, 1370],cc_ub:[1975, 1385],cc_s2:[1835, 1310],cc_v:[1850, 1252],cc_g:[1830, 1170],cc_w:[1880, 1050],sl_e:[1560, 1050],cc_bell:[1930, 1015],cc_nw:[1882, 918],cc_n:[2100, 918],cc_din:[2300, 1066],cc_db:[2305, 1116],cc_spa:[1990, 1150],cc_c:[2250, 1195],cc_wk:[2331, 1250],cc_e:[2560, 1200],cc_pit:[2690, 1258],cc_gb:[2820, 1262],cc_rot:[2635, 990],hh_e:[1990, 862],hh_f:[2120, 860],hh_b:[2040, 875],hh_r:[1990, 785],hh_v:[2045, 692],hh_t:[2088, 565],hh_c:[2223, 716],hh_s:[2300, 842],hh_ve:[2370, 882],cg_b:[2334, 968],cg_sw:[2270, 990],cg_d:[2430, 962],cg_u:[2430, 760],cg_top:[2500, 615],cg_lift:[2425, 545],cg_se:[2600, 1110],cg_e:[2560, 895],cr_l:[2425, 470],cr_map:[2410, 415],cr_top:[2420, 262],cr_tube:[2500, 470],cr_se:[2530, 470],cr_term:[2565, 465],me_h:[2745, 895],me_b:[2745, 848],me_l:[2612, 828],me_t:[2700, 692],me_d:[2690, 640],me_ne:[2860, 690],me_e:[2970, 825],sc_sh:[2945, 900],sc_m:[3030, 950],sc_e:[3200, 965],sc_s:[3037, 988],wv_n:[3037, 1020],wv_u:[3151, 1066],wv_c:[3120, 1090],wv_box:[2950, 1100],wv_g:[2735, 1006],wv_w:[2784, 1065],wv_cog:[2998, 1221],wv_s:[3140, 1263],wv_l:[3259, 1264],wv_st:[2863, 1206],ww_b:[2350, 1265],ww_w:[2150, 1320],ww_p:[2120, 1420],ww_m:[2357, 1366],ww_e:[2520, 1320],ww_cr:[2705, 1395],eo_ph:[3045, 1390],eo_b:[3100, 1478],eo_o:[3000, 1565]
};
// Waypoints nudged into the corridor they belong to (built from the map image)
Object.assign(NV,{"mh_sp":[1206,2362],"mh_top":[1046,2006],"wm_m":[702,2422],"wm_w":[374,2454],"wm_n":[934,2226],"bs_e":[930,1998],"bs_up":[962,1774],"bs_gg":[1322,1550],"wa_w":[1206,2794],"mw_s2":[2030,2438],"hm_d":[2778,2418],"hm_n":[2770,2298],"dd_l1":[2402,2794],"dd_bt":[2606,2882],"ff_c3":[3302,2702],"ff_up":[3606,2382],"gm_cr":[3698,2062],"gm_m1":[3050,2010],"gm_w2":[2554,2126],"bh_w":[1950,2160],"sw_lo1":[1885,2160],"sw_lo2":[1502,2226],"gg_h":[1594,1534],"gg_al":[1670,1434],"gg_s":[1654,1662],"uw_ar":[1974,1562],"uw_low":[2306,1654],"cc_s1":[1706,1370],"cc_s2":[1822,1310],"cc_v":[1850,1246],"cc_g":[1830,1158],"sl_e":[1566,1062],"cc_nw":[1882,914],"cc_din":[2306,1066],"cc_db":[2305,1090],"cc_spa":[1986,1154],"cc_c":[2250,1170],"cc_wk":[2282,1236],"cc_e":[2562,1218],"cc_pit":[2690,1250],"cc_gb":[2822,1254],"hh_b":[2042,862],"hh_r":[1990,782],"hh_v":[2058,694],"hh_c":[2222,710],"hh_s":[2302,830],"hh_ve":[2358,890],"cg_sw":[2274,990],"cg_lift":[2430,546],"sc_m":[3030,946],"wv_c":[3122,1078],"wv_box":[2958,1102],"wv_g":[2734,994],"wv_s":[3142,1258],"wv_l":[3290,1266],"ww_b":[2282,1300],"ww_w":[2150,1326],"ww_p":[2122,1414],"ww_m":[2358,1350],"ww_cr":[2674,1362]});

const NE=[
 ["mg_ch","mg_up"],["mg_up","bb_w"],["bb_w","bb_t"],["bb_t","bb_e"],["bb_e","mw_b1"],
 ["bb_w","mh1"],["mh1","mh1b"],["mh1b","mh2"],["mh2","mh3"],["mh2","mh_c"],["mh_c","mw_u1"],["mh3","mh_sp"],["mh_sp","mh_dr"],
 ["mh4","mh_w"],["mh_w","mh_top"],["mh_w","sw_wb"],["mh_top","bs_e"],["bs_e","bs_w"],["bs_e","bs_up"],["mh_top","sw_lt"],
 ["mh1b","wm_e"],["wm_e","wm_k"],["wm_k","wm_m"],["wm_m","wm_w"],["wm_m","wm_z"],["bb_w","bg_e"],["bg_e","bg_w"],["bg_e","bg_c"],["bg_c","bg_w"],["mg_rc","mg_up"],["mg_rc","bg_e"],
 ["mg_ch","wa_1"],["wa_1","wa_t"],["wa_t","wa_pw"],["wa_pw","wa_e"],["wa_e","wa_er"],["wa_t","wa_mid"],["wa_mid","wa_b"],["wa_mid","wa_ml"],["wa_mid","wa_sn"],["wa_b","wa_bn"],["wa_bn","wa_w"],["wa_w","wa_w2"],["wa_w2","wa_mm"],["wa_b","wa_ev0"],["wa_ev0","wa_ev"],
 ["mw_b1","mw_b2"],["mw_b1","mw_g"],["mw_g","mw_b2"],["mw_b2","mw_b3"],["mw_b3","mw_b4"],["mw_b4","mw_b5"],["mw_b5","mw_b6"],["mw_b6","dd_w"],
 ["mw_b4","mw_cv"],["mw_u1","mw_u2"],["mw_u2","mw_u3"],["mw_u3","mw_u4"],["mw_u4","mw_n"],["mw_n","mw_s2"],["mw_g","mw_sk"],["mw_sk","mw_u2"],["mw_u4","mw_m"],["mw_m","mw_b3"],
 ["mw_b5","mw_s1"],["mw_s1","mw_s2"],["mw_s2","hm1"],["mw_s2","bv_b"],["bv_b","bv_t"],["bv_t","bh_t"],["hm1","hm2"],["hm2","hm3"],["hm3","hm4"],["hm4","hm5"],["hm5","hm_b"],["hm5","hm_n"],["hm_n","hm_bn"],
 ["hm_b","hm_d"],["hm_d","dd_u3"],["hm_d","dd_sp"],["dd_sp","dd_u3"],["hm_b","hm_e"],["hm_e","hm_ch"],["hm_n","hm_ne"],["hm_bn","hm_st"],["hm_st","hm_x"],["hm_x","ff_c0"],["hm_x","ff_uw"],["ff_uw","ff_up"],
 ["mw_nr","sw_l1"],["mw_nr","mw_u3"],["sw_l1","sw_l2"],["sw_j","sw_l2"],["sw_l3","sw_j"],["sw_l3","sw_m"],["sw_wy","sw_m"],["sw_bw","sw_wy"],["sw_lt","sw_bw"],["sw_lb","sw_lt"],["sw_wb","sw_lb"],["sw_lb","sw_j"],["sw_3","sw_j"],["sw_m","sw_n"],
 ["sw_l2","sw_lo2"],["sw_lo2","sw_ch"],["sw_j","sw_g"],["sw_g","sw_p"],["sw_p","sw_lo1"],["sw_lo1","sw_t"],["sw_t","sw_g"],["sw_lo1","bh_w"],["bh_w","bh_t"],["bh_t","bh_e"],["bh_t","bh_up"],["bh_e","gm_bh"],
 ["gm_bh","gm_w3"],["gm_w3","gm_w2"],["gm_w2","gm_w1"],["gm_w1","gm_y"],["gm_w1","gm_hh"],["gm_hh","gm_m1"],["gm_m1","gm_j"],
 ["gm_j","gm_bw"],["gm_bw","gm_sk"],["gm_sk","gm_e"],["gm_sk","gm_bs"],["gm_e","gm_cr"],["gm_cr","gm_cl"],["gm_m1","sr1"],["sr1","sr_b1"],["sr1","sr2"],["sr2","sr3"],
 ["gm_j","ff_c0"],["ff_c0","ff_c1"],["ff_c1","ff_c2"],["ff_c2","ff_c3"],["ff_c1","ff_pr"],["ff_pr","ff_p2"],["ff_p2","ff_fl"],["ff_fl","ff_up"],["ff_up","ff_e1"],["ff_e1","ff_cin"],
 ["ff_c2","ff_ss"],["ff_c3","ff_ch"],["ff_ch","ff_bw"],["ff_bw","ff_e"],["ff_e","ff_cd"],["ff_cd","ff_wc"],["ff_c2","ff_w2"],["ff_w2","ff_w1"],["ff_w1","dd_u3"],
 ["ff_c3","ff_lo"],["ff_lo","dd_l4"],
 ["dd_w","dd_m1"],["dd_m1","dd_m2"],["dd_m2","dd_m3"],["dd_m3","dd_bs"],["dd_m1","dd_u1"],["dd_u1","dd_u2"],["dd_u2","dd_u3"],["dd_u2","dd_sp"],
 ["dd_m2","dd_f"],["dd_f","dd_l2"],["dd_l2","dd_l1"],["dd_l2","dd_l3"],["dd_l3","dd_l4"],
 ["dd_l1","dd_s"],["dd_s","dd_b4"],["dd_s","dd_bt"],["dd_bt","dd_db"],["dd_l3","dd_db"],
 ["wm_w","bg_w"],["gm_y","gm_tw"],["gm_tw","gm_wp"],
 ["bs_up","bs_t"],["bs_t","bs_s"],["bs_s","bs_l"],["bs_s","bs_sh"],["bs_up","bs_r"],["bs_up","bs_cf"],["bs_cf","bs_pn"],["bs_t","bs_gg"],["bs_gg","bs_j"],
 ["wm_k","wm_sb"],["wm_sb","wm_t"],["wm_z","wm_t"],["wm_t","wm_n"],["wm_n","mh4"],["ff_p2","ff_sc"],["ff_sc","ff_bw"],
 ["bs_j", "gg_h"],["gg_h", "gg_t"],["gg_t", "gg_al"],["gg_h", "gg_m"],["gg_m", "gg_lb"],["gg_lb", "gg_s"],["gg_al", "cc_s1"],["gg_lb", "uw_w"],["uw_w", "uw_b1"],["uw_w", "uw_m"],["uw_m", "uw_up"],["uw_up", "uw_ar"],["uw_ar", "cc_ub"],["uw_ar", "uw_c1"],["uw_c1", "uw_t"],["uw_c1", "uw_mid"],["uw_mid", "uw_tb"],["uw_mid", "uw_low"],["uw_tb", "uw_cau"],["uw_cau", "uw_arch"],["uw_cau", "uw_claw"],["uw_arch", "uw_ch"],["uw_cau", "uw_e"],["uw_e", "uw_se"],["uw_b1", "gm_wp"],["cc_s1", "cc_s2"],["cc_ub", "cc_s2"],["cc_s2", "cc_v"],["cc_v", "cc_g"],["cc_g", "cc_w"],["cc_w", "sl_e"],["cc_w", "cc_bell"],["cc_bell", "cc_nw"],["cc_nw", "cc_n"],["cc_w", "cc_spa"],["cc_spa", "cc_c"],["cc_n", "cc_din"],["cc_din", "cc_db"],["cc_db", "cc_c"],["cc_c", "cc_wk"],["cc_wk", "cc_e"],["cc_e", "cc_pit"],["cc_pit", "cc_gb"],["cc_din", "cg_sw"],["cg_sw", "cg_b"],["cg_b", "cg_d"],["cc_e", "cg_se"],["cg_se", "cc_rot"],["cc_rot", "wv_g"],["cc_gb", "wv_st"],["cc_gb", "eo_ph"],["cc_nw", "hh_e"],["hh_e", "hh_f"],["hh_f", "hh_b"],["hh_e", "hh_r"],["hh_r", "hh_v"],["hh_r", "hh_t"],["hh_f", "hh_c"],["hh_c", "hh_s"],["hh_s", "hh_ve"],["hh_ve", "cg_b"],["cg_d", "cg_u"],["cg_u", "cg_top"],["cg_u", "cg_lift"],["cg_d", "cg_se"],["cg_d", "cg_e"],["cg_lift", "cr_l"],["cr_l", "cr_map"],["cr_map", "cr_top"],["cr_l", "cr_tube"],["cr_tube", "cr_se"],["cr_se", "cr_term"],["cg_e", "me_h"],["me_h", "sc_sh"],["me_h", "me_b"],["me_b", "me_l"],["me_b", "me_e"],["me_b", "me_t"],["me_t", "me_d"],["me_t", "me_ne"],["sc_sh", "sc_m"],["sc_m", "sc_e"],["sc_m", "sc_s"],["sc_s", "wv_n"],["wv_n", "wv_u"],["wv_u", "wv_c"],["wv_c", "wv_box"],["wv_g", "wv_box"],["wv_box", "wv_w"],["wv_c", "wv_cog"],["wv_cog", "wv_s"],["wv_s", "wv_l"],["wv_cog", "wv_st"],["wv_st", "uw_e"],["cc_wk", "ww_b"],["ww_b", "ww_m"],["ww_b", "ww_w"],["ww_w", "ww_p"],["ww_m", "ww_e"],["ww_e", "ww_cr"],["ww_cr", "uw_e"],["eo_ph", "eo_b"],["eo_b", "eo_o"],["eo_o", "sr3"]
];
// Mount Fay (from the wiki map outline) and the Slab Bellway it is entered from
Object.assign(NV,{"sl_bw":[1236,1185],"fy_e0":[1152,1207],"fy_se":[993,1197],"fy_e1":[1127,849],"fy_b2":[1068,845],"fy_top":[1108,526],"fy_sum":[1113,463],"fy_nw":[879,501],"fy_mid":[924,908],"fy_fl":[700,869],"fy_c":[610,779],"fy_mm":[486,566],"fy_w":[392,1013],"fy_wb":[392,1073],"fy_ms":[322,1040],"fy_mc":[548,1105],"fy_low":[665,1043]});
NE.push(["sl_e","sl_bw"],["sl_bw","fy_e0"],["fy_e0","fy_se"],["fy_e0","fy_e1"],["fy_e1","fy_b2"],["fy_e1","fy_top"],["fy_top","fy_sum"],["fy_top","fy_nw"],["fy_nw","fy_c"],["fy_e1","fy_mid"],["fy_se","fy_mid"],["fy_mid","fy_fl"],["fy_fl","fy_c"],["fy_c","fy_mm"],["fy_c","fy_w"],["fy_w","fy_wb"],["fy_w","fy_ms"],["fy_wb","fy_mc"],["fy_w","fy_low"],["fy_low","fy_mid"]);
// Sands of Karak (from the wiki map outline)
Object.assign(NV,{"kk_dn":[412,1618],"kk_lk":[528,1530],"kk_sw":[670,1513],"kk_mid":[857,1459],"kk_in":[857,1371],"kk_cr":[692,1360],"kk_top":[857,1294],"kk_vn":[857,1245],"kk_w1":[725,1277],"kk_rc":[588,1272],"kk_ct":[456,1267],"kk_e1":[1000,1442],"kk_e2":[1153,1404],"kk_ek":[1384,1404]});
NE.push(["bs_pn","kk_dn"],["kk_dn","kk_lk"],["kk_lk","kk_sw"],["kk_sw","kk_mid"],["bs_sh","kk_mid"],["kk_mid","kk_in"],["kk_in","kk_cr"],["kk_in","kk_top"],["kk_top","kk_vn"],["kk_top","kk_w1"],["kk_w1","kk_rc"],["kk_rc","kk_ct"],["kk_mid","kk_e1"],["kk_e1","kk_e2"],["kk_e2","kk_ek"]);
// Bilewater (from the wiki map outline)
Object.assign(NV,{"bw_in":[3480,1702],"bw_s0":[3633,1667],"bw_se1":[3804,1659],"bw_mur":[4100,1659],"bw_se0":[3796,1566],"bw_c0":[3509,1543],"bw_bw":[3340,1605],"bw_w1":[3245,1519],"bw_tb":[3245,1411],"bw_cp":[3610,1465],"bw_c1":[3509,1341],"bw_qs":[3618,1294],"bw_ms":[4029,1294],"bw_c2":[3478,1232],"bw_m1":[3727,1224],"bw_eb":[3932,1240],"bw_top":[3505,1053],"bw_hav":[3641,1061],"bw_e1":[3843,1139],"bw_ne":[4084,1046],"bw_end":[4348,1046]});
NE.push(["sr3","bw_in"],["bw_in","bw_s0"],["bw_s0","bw_se1"],["bw_se1","bw_mur"],["bw_se1","bw_se0"],["bw_se0","bw_c0"],["bw_c0","bw_bw"],["bw_bw","bw_w1"],["bw_w1","eo_b"],["wv_l","bw_tb"],["bw_c0","bw_cp"],["bw_c0","bw_c1"],["bw_c1","bw_qs"],["bw_qs","bw_ms"],["bw_c1","bw_c2"],["bw_c2","bw_m1"],["bw_m1","bw_eb"],["bw_c2","bw_top"],["bw_top","bw_hav"],["bw_top","bw_e1"],["bw_e1","bw_ne"],["bw_ne","bw_end"]);
// Putrified Ducts (from the wiki map outline)
Object.assign(NV,{"pd_w0":[3200,832],"pd_w1":[3420,836],"pd_sh":[3585,860],"pd_bw":[3640,831],"pd_low":[3640,915],"pd_wr":[3850,905],"pd_sw":[3430,975],"pd_key":[3322,950],"pd_e1":[3980,960],"pd_fl":[4125,964],"pd_pl":[4390,965]});
NE.push(["me_e","pd_w0"],["pd_w0","pd_w1"],["pd_w1","pd_sh"],["pd_sh","pd_bw"],["pd_sh","pd_low"],["pd_low","pd_wr"],["pd_sh","pd_sw"],["pd_sw","pd_key"],["pd_low","pd_e1"],["pd_e1","pd_fl"],["pd_fl","pd_pl"]);
// Verdania and Lost Verdania (from the wiki map outline)
Object.assign(NV,{"vd_in":[3835,2040],"vd_p":[3998,2040],"vd_c":[4107,1972],"vd_w":[3908,1899],"vd_cd":[4250,1840],"vd_e":[4553,2012]});
NE.push(["gm_cr","vd_in"],["vd_in","vd_p"],["vd_p","vd_c"],["vd_c","vd_w"],["vd_c","vd_cd"],["vd_c","vd_e"]);
// The Abyss (no marked wiki map: spots read off the app map and the wiki's text, all approximate)
Object.assign(NV,{"ab_bell":[2840,3165],"ab_top":[2500,3085],"ab_w":[2350,3200],"ab_bot":[2330,3375],"ab_lace":[2426,3385],"ab_wn":[2610,3259],"ab_ws":[2732,3350]});
NE.push(["dd_db","ab_bell"],["ab_bell","ab_top"],["ab_top","ab_w"],["ab_w","ab_bot"],["ab_bot","ab_lace"],["ab_lace","ab_wn"],["ab_wn","ab_ws"]);
