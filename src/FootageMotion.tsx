import React from 'react';
import {AbsoluteFill,Easing,Sequence,interpolate,useCurrentFrame,useVideoConfig} from 'remotion';
import {footageCues,cameraMoves,cutAccents,palette,type FootageCue} from './timing';
const clamp={extrapolateLeft:'clamp' as const,extrapolateRight:'clamp' as const};
export const useFootageCamera=()=>{
 const frame=useCurrentFrame();const {fps}=useVideoConfig();const time=frame/fps;
 const move=cameraMoves.find(m=>time>=m.start&&time<m.end);
 if(!move)return {scale:1,transformOrigin:'50% 50%'};
 // Return to neutral before every hard cut; never zoom across different shots.
 return {scale:interpolate(time,[move.start,move.start+.6,move.end-.6,move.end],[1,move.scale,move.scale,1],{...clamp,easing:Easing.bezier(.42,0,.58,1)}),transformOrigin:`${move.x}% ${move.y}%`};
};
const FootageCard:React.FC<{cue:FootageCue}>=({cue})=>{
 const f=useCurrentFrame();const {fps,width,height}=useVideoConfig();const end=Math.round(cue.duration*fps);const portrait=height>width;
 return <div style={{position:'absolute',left:`${cue.x*100}%`,top:`${cue.y*100}%`,width:'84%',boxSizing:'border-box',padding:width*.025,color:palette.white,fontFamily:'Arial, sans-serif',
 opacity:interpolate(f,[0,.4*fps,end-.4*fps,end],[0,1,1,0],clamp),clipPath:`inset(0 ${interpolate(f,[0,.65*fps],[100,0],{...clamp,easing:Easing.bezier(.16,1,.3,1)})}% 0 0)`}}>
 <div style={{position:'absolute',inset:0,background:'linear-gradient(100deg,#071321ed,#071321aa)',borderLeft:`${Math.max(2,width*.003)}px solid ${palette.gold}`,borderRadius:width*.008}}/>
 <div style={{position:'relative',fontSize:width*(portrait?.022:.012),letterSpacing:width*.004,color:palette.gold,marginBottom:height*.006}}>UNESA</div>
 <div style={{overflow:'hidden',position:'relative'}}><div style={{fontSize:width*(portrait?.061:.032),fontWeight:600,lineHeight:1.13,letterSpacing:-width*.001,translate:`0 ${interpolate(f,[.1*fps,.7*fps],[45,0],{...clamp,easing:Easing.bezier(.16,1,.3,1)})}%`}}>{cue.title}</div></div>
 {cue.subtitle&&<div style={{position:'relative',fontSize:width*(portrait?.034:.018),lineHeight:1.3,marginTop:height*.006,opacity:interpolate(f,[.3*fps,.9*fps],[0,1],clamp)}}>{cue.subtitle}</div>}
 <div style={{position:'relative',overflow:'hidden',height:Math.max(1,width*.002),width:interpolate(f,[.15*fps,.95*fps],[0,width*.36],clamp),background:palette.gold,boxShadow:`0 0 8px ${palette.gold}66`,marginTop:height*.01}}>
 <div style={{width:width*.15,height:'100%',background:'linear-gradient(90deg,transparent,#fff,transparent)',translate:`${interpolate(f,[.6*fps,1.9*fps],[-width*.15,width*.4],clamp)}px 0`}}/></div>
 </div>;
};
const CutAccent:React.FC=()=>{const f=useCurrentFrame();const {fps,width}=useVideoConfig();return <div style={{position:'absolute',left:'4%',bottom:'5%',height:2,width:width*.22,background:`linear-gradient(90deg,transparent,${palette.gold},transparent)`,opacity:interpolate(f,[0,.15*fps,.65*fps],[0,.45,0],clamp),scale:`${interpolate(f,[0,.65*fps],[.3,1],clamp)} 1`}}/>;};
export const FootageGraphics:React.FC=()=>{const {fps}=useVideoConfig();return <AbsoluteFill style={{pointerEvents:'none'}}>
 {/* All cards use one editable data template in timing.ts; no unverified speaker names. */}
 {footageCues.filter(c=>c.enabled).map(c=><Sequence key={c.id} name={c.id} from={Math.round(c.start*fps)} durationInFrames={Math.round(c.duration*fps)} premountFor={fps}><FootageCard cue={c}/></Sequence>)}
 {cutAccents.map(t=><Sequence key={t} name={`Cut accent ${t}s`} from={Math.round(t*fps)} durationInFrames={Math.round(.65*fps)} premountFor={fps}><CutAccent/></Sequence>)}
 </AbsoluteFill>;};
