'use strict';
const channels=hex=>hex.slice(1).match(/../g).map(x=>parseInt(x,16));
const luminance=hex=>channels(hex).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;}).reduce((sum,x,i)=>sum+x*[.2126,.7152,.0722][i],0);
const contrast=(a,b)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
const blend=(a,b,t)=>'#'+channels(a).map((x,i)=>Math.round(x*(1-t)+channels(b)[i]*t).toString(16).padStart(2,'0')).join('');
const onColor=bg=>contrast('#000000',bg)>contrast('#ffffff',bg)?'#000000':'#ffffff';
function ensureContrast(fg,bg,target=7){
 if(contrast(fg,bg)>=target)return fg;
 const end=onColor(bg);let low=0,high=1;
 for(let i=0;i<20;i++){const mid=(low+high)/2;if(contrast(blend(fg,end,mid),bg)>=target)high=mid;else low=mid;}
 return blend(fg,end,high);
}
module.exports={contrast,ensureContrast,onColor};
