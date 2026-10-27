const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {SessionHostThemeSync}=require('../dist/host-theme');
const {contrast,ensureContrast,onColor}=require('../dist/contrast');
const src=fs.readFileSync(path.join(__dirname,'../dist/index.js'),'utf8');
const K=new Function(src.slice(src.indexOf('class SessionManagerService {'),src.indexOf('SessionManagerService.ɵfac'))+';return SessionManagerService;')();
const palettes=()=>K.prototype.getThemePalettes();const c=new SessionHostThemeSync({store:{sessionManager:{}}},null,palettes);
const blend=(a,b,t)=>{const rgb=h=>h.slice(1).match(/../g).map(x=>parseInt(x,16));return '#'+rgb(a).map((x,i)=>Math.round(x*(1-t)+rgb(b)[i]*t).toString(16).padStart(2,'0')).join('');};
const rows=[];
for(const [key,p] of Object.entries(palettes())){
 const scheme=c.terminalScheme(key),foreground=contrast(scheme.foreground,scheme.background),ansi=Math.min(...scheme.colors.map(color=>contrast(color,scheme.background)));
 assert(foreground>=7,key+' terminal foreground '+foreground);assert(ansi>=7,key+' ANSI '+ansi);
 assert(contrast(scheme.selectionForeground,scheme.selection)>=7,key+' selection');
 const fg=p.fg||'#e8edf5',muted=p.muted||'#aab8ca';
 const surfaces=key==='graphiteGlass'?[p.a,p.b,'#43464d']:key==='ghibliSky'?[p.a,p.b,'#b0e0ee','#f1efdf']:p.light?[p.a,'#ffffff']:[p.a,blend(p.a,'#ffffff',.12)];
 const mainMin=Math.min(...surfaces.map(bg=>contrast(fg,bg))),mutedMin=Math.min(...surfaces.map(bg=>contrast(muted,bg)));
 assert(mainMin>=7,key+' main text '+mainMin);assert(mutedMin>=4.5,key+' secondary text '+mutedMin);
 if(key==='graphiteGlass'){
  const selected='#60636a'; // conservative bright glass + hover/selection composite
  for(const color of [fg,muted,p.accent,'#c4ebc9','#ffdfe3'])assert(contrast(color,selected)>=4.5,'graphite selected glass '+color);
 }
 if(p.light)assert(contrast('#19442d',p.a)>=4.5,key+' recording status');
 for(const bg of [p.a,p.accent,blend(p.a,fg,.1)])assert(contrast(onColor(bg),bg)>=4.5,key+' semantic foreground');
 rows.push({theme:p.label,main:mainMin.toFixed(2),secondary:mutedMin.toFixed(2),terminal:foreground.toFixed(2),ansiMinimum:ansi.toFixed(2)});
}
assert.equal(ensureContrast('#142c29','#8bcfe4'),'#142c29');assert.equal(ensureContrast('#ffffff','#000000'),'#ffffff');
assert(src.includes('text-shadow:none!important'));console.table(rows);
console.log('PASS eight themes: primary >=7, secondary >=4.5, all default-background terminal ANSI colors and selection >=7; already-readable colors preserved');
module.exports={rows};
