import React from 'react';
import {AbsoluteFill, Composition, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Video} from '@remotion/media';
import source from './source.json';
import {opening,lowerThird,closing,camera,logo,palette,type Cue} from './timing';

const clamp = {extrapolateLeft:'clamp' as const,extrapolateRight:'clamp' as const};
export const Title: React.FC<{cue:Cue}> = ({cue}) => {
 const frame=useCurrentFrame(); const {fps,width,height}=useVideoConfig();
 const end=Math.round(cue.duration*fps); const fade=Math.min(Math.round(.6*fps),Math.floor(end/3));
 return <div style={{position:'absolute',left:cue.x*width,top:cue.y*height,width:width*.68,fontFamily:'Arial, sans-serif',color:palette.white,
 opacity:interpolate(frame,[0,fade,end-fade,end],[0,1,1,0],clamp),translate:`0 ${interpolate(frame,[0,fade],[24,0],{...clamp,easing:Easing.bezier(.16,1,.3,1)})}px`}}>
 <div style={{position:'absolute',inset:'-25px -35px',background:'linear-gradient(100deg,rgba(7,19,33,.90),rgba(7,19,33,.20))',borderLeft:`3px solid ${palette.gold}`,borderRadius:3}}/>
 <div style={{position:'relative',fontSize:width*.013,letterSpacing:width*.003,color:palette.gold,marginBottom:height*.014}}>UNESA</div>
 <div style={{position:'relative',fontSize:width*.034,fontWeight:600,letterSpacing:-width*.0007,lineHeight:1.12,textShadow:'0 2px 12px #0008'}}>{cue.title}</div>
 <div style={{position:'relative',fontSize:width*.018,lineHeight:1.4,marginTop:height*.014}}>{cue.subtitle}</div>
 <div style={{position:'relative',height:2,width:interpolate(frame,[0,fps],[0,width*.22],clamp),background:palette.gold,marginTop:height*.025,boxShadow:`0 0 12px ${palette.gold}66`,overflow:'hidden'}}>
 <div style={{width:80,height:2,background:'linear-gradient(90deg,transparent,white,transparent)',translate:`${interpolate(frame,[0,2*fps],[-80,width*.3],clamp)}px 0`}}/></div>
 </div>;
};
export const Promo: React.FC = () => {
 const frame=useCurrentFrame(); const {fps}=useVideoConfig();
 const pulse=camera.enabled?interpolate(frame,[camera.start*fps,(camera.start+camera.end)/2*fps,camera.end*fps],[1,Math.min(1.04,camera.maxScale),1],{...clamp,easing:Easing.bezier(.42,0,.58,1)}):1;
 return <AbsoluteFill style={{background:'#000'}}>
 {source.available ? <Video src={staticFile('assets/Gabungan.mov')} premountFor={fps} volume={1} style={{width:'100%',height:'100%',objectFit:'contain',scale:pulse,transformOrigin:`${camera.originX}% ${camera.originY}%`}}/> : <AbsoluteFill style={{color:'white',alignItems:'center',justifyContent:'center',fontFamily:'Arial',fontSize:32}}>Masukkan public/assets/Gabungan.mov, lalu jalankan npm run prepare-video.</AbsoluteFill>}
 {opening.enabled&&<Sequence name="Opening typography" from={Math.round(opening.start*fps)} durationInFrames={Math.round(opening.duration*fps)} premountFor={fps}><Title cue={opening}/></Sequence>}
 {lowerThird.enabled&&lowerThird.title&&<Sequence name="Lower third" from={Math.round(lowerThird.start*fps)} durationInFrames={Math.round(lowerThird.duration*fps)} premountFor={fps}><Title cue={lowerThird}/></Sequence>}
 {closing.enabled&&<Sequence name="Closing overlay" from={Math.round(closing.start*fps)} durationInFrames={Math.round(closing.duration*fps)} premountFor={fps}><Title cue={closing}/></Sequence>}
 {logo.enabled&&<Img src={staticFile(logo.path)} style={{position:'absolute',right:'7%',top:'7%',width:'7%',height:'auto',objectFit:'contain'}}/>}
 </AbsoluteFill>;
};
export const MotionPreview:React.FC=()=>{
 const frame=useCurrentFrame(); const {fps}=useVideoConfig();
 return <AbsoluteFill style={{background:'radial-gradient(ellipse at 80% 25%,#24496a 0%,#10283f 35%,#07131f 85%)'}}>
 <AbsoluteFill style={{background:'linear-gradient(125deg,transparent 30%,#D9B66F0a 50%,transparent 70%)',translate:`${interpolate(frame,[0,12*fps],[-100,100],clamp)}px 0`}}/>
 <div style={{position:'absolute',left:'7%',top:'9%',fontFamily:'Arial',fontSize:22,letterSpacing:4,color:'#D9B66F'}}>PRATINJAU DESAIN MOTION</div>
 <div style={{position:'absolute',left:'7%',top:'16%',fontFamily:'Arial',fontSize:24,color:'#bbc7d2'}}>Latar demonstrasi • bukan footage Gabungan.mov</div>
 <Sequence name="Title design" from={fps} durationInFrames={5*fps} premountFor={fps}><Title cue={{...opening,duration:5}}/></Sequence>
 <Sequence name="Closing design" from={7*fps} durationInFrames={5*fps} premountFor={fps}><Title cue={{...closing,duration:5}}/></Sequence>
 </AbsoluteFill>;
};
export const Root:React.FC=()=> <>
 <Composition id="UNESA-Promo" component={Promo} width={source.width} height={source.height} fps={source.fps} durationInFrames={source.durationInFrames}/>
 <Composition id="MotionPreview" component={MotionPreview} width={1920} height={1080} fps={30} durationInFrames={360}/>
 </>;
