import {spawnSync} from 'node:child_process';
import {existsSync,readFileSync,mkdirSync} from 'node:fs';
const metadata=JSON.parse(readFileSync('src/source.json','utf8'));
if(!existsSync('public/assets/Gabungan.mov')||!metadata.available){console.error('Video asli belum siap. Jalankan npm run prepare-video setelah memasukkan Gabungan.mov.');process.exit(1);}
mkdirSync('out',{recursive:true});
const result=spawnSync(process.platform==='win32'?'npx.cmd':'npx',['remotion','render','src/index.ts','UNESA-Promo','out/UNESA-S2-motion.mp4','--codec=h264','--crf=16','--pixel-format=yuv420p','--audio-codec=aac','--audio-bitrate=320k'],{stdio:'inherit',shell:process.platform==='win32'});
process.exit(result.status??1);
