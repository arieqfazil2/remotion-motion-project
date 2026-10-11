// Legacy MotionPreview styling. UNESA-Promo uses footageCues/cameraMoves below.
// Seconds are editable; no speaker names or unverified promotional claims.
export type Cue = {enabled:boolean; start:number; duration:number; title:string; subtitle:string; x:number; y:number};
export const palette = {navy:'#102E50', gold:'#D9B66F', white:'#F7F6F2'}; // provisional, not an official brand specification
export const opening: Cue = {enabled:false,start:0.8,duration:4.5,title:'Program Magister (S2)',subtitle:'Universitas Negeri Surabaya',x:0.07,y:0.68};
export const lowerThird: Cue = {enabled:false,start:8,duration:4,title:'',subtitle:'',x:0.07,y:0.76};
export const closing: Cue = {enabled:false,start:0,duration:4,title:'Program Magister (S2)',subtitle:'Universitas Negeri Surabaya',x:0.07,y:0.68};
export const camera = {enabled:false,start:0,end:5,maxScale:1.025,originX:50,originY:50};
export const logo = {enabled:false,path:'assets/logo-unesa.png'};

// Authored from the 61.416667s proxy, 24fps. Final source stays Gabungan.mov.
// Scene-relative seconds keep these timings independent of original FPS.
export type FootageCue = Cue & {id:string};
export const footageCues:FootageCue[] = [
 {id:'Opening identity',enabled:true,start:.6,duration:4.1,title:'Program Magister (S2)',subtitle:'Universitas Negeri Surabaya',x:.08,y:.82},
 {id:'Pascasarjana lower third',enabled:true,start:25.6,duration:4.3,title:'Pascasarjana',subtitle:'Universitas Negeri Surabaya',x:.08,y:.83},
 {id:'Closing identity',enabled:true,start:57,duration:4.416667,title:'Program Magister (S2)',subtitle:'Universitas Negeri Surabaya',x:.08,y:.83},
];
// Subtle motion only, avoids aggressive cropping of faces and campus signage.
export const cameraMoves = [
 {start:.15,end:5.15,scale:1.012,x:50,y:48},
 {start:5.25,end:10.25,scale:1.016,x:52,y:52},
 {start:10.35,end:15.08,scale:1.010,x:50,y:54},
 {start:15.17,end:19.87,scale:1.010,x:50,y:53},
 {start:19.96,end:25.16,scale:1.016,x:43,y:53},
 {start:25.25,end:30.78,scale:1.012,x:50,y:52},
 {start:30.88,end:36.49,scale:1.010,x:50,y:55},
 {start:36.59,end:41.90,scale:1.012,x:55,y:58},
 {start:42.01,end:49.82,scale:1.012,x:50,y:57},
 {start:49.92,end:54.74,scale:1.010,x:50,y:58},
 {start:54.84,end:61.416667,scale:1.014,x:55,y:63},
];
// Edge accents preserve the existing cut and do not obscure the speaker.
export const cutAccents=[5.208333,19.916667,30.833333,41.958333,54.791667];
