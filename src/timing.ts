// Seconds; these are design examples, NOT timings derived from Gabungan.mov.
// Enable only after checking narration, faces, existing titles and scene cuts.
export type Cue = {enabled:boolean; start:number; duration:number; title:string; subtitle:string; x:number; y:number};
export const palette = {navy:'#102E50', gold:'#D9B66F', white:'#F7F6F2'}; // provisional, not an official brand specification
export const opening: Cue = {enabled:false,start:0.8,duration:4.5,title:'Program Magister (S2)',subtitle:'Universitas Negeri Surabaya',x:0.07,y:0.68};
export const lowerThird: Cue = {enabled:false,start:8,duration:4,title:'',subtitle:'',x:0.07,y:0.76};
export const closing: Cue = {enabled:false,start:0,duration:4,title:'Program Magister (S2)',subtitle:'Universitas Negeri Surabaya',x:0.07,y:0.68};
export const camera = {enabled:false,start:0,end:5,maxScale:1.025,originX:50,originY:50};
export const logo = {enabled:false,path:'assets/logo-unesa.png'};
