import assert from 'node:assert/strict';
export function environment(width=390,height=844){
 const observers=[],calls=[],texts=[];let removed=false;let depth=0;
 const gradient={addColorStop(){}};
 const numeric=['fillRect','clearRect','strokeRect','moveTo','lineTo','translate','scale','rotate','setTransform','arc','roundRect','ellipse','quadraticCurveTo','bezierCurveTo'];
 const ctx={canvas:null,measureText:s=>({width:String(s).length*7}),createLinearGradient:()=>gradient,createRadialGradient:()=>gradient,save(){depth++;},restore(){depth=Math.max(0,depth-1);},fillText(value,x,y){assert.ok(Number.isFinite(x)&&Number.isFinite(y));texts.push({value:String(value),x,y});if(texts.length>500)texts.splice(0,250);}};
 for(const name of numeric)ctx[name]=(...args)=>{for(const arg of args)if(typeof arg==='number')assert.ok(Number.isFinite(arg),`${name} non-finite argument`);if(name==='arc')assert.ok(args[2]>=0,'negative radius');};
 for(const name of ['beginPath','closePath','fill','stroke','clip','setLineDash'])ctx[name]=()=>{};
 const canvas={setAttribute(){},getContext:()=>ctx,remove(){removed=true;}};ctx.canvas=canvas;
 const mount={clientWidth:width,clientHeight:height,replaceChildren(){}};
 globalThis.window={innerWidth:width,innerHeight:height,devicePixelRatio:2};
 globalThis.document={createElement:()=>canvas,getElementById:id=>({offsetHeight:id==='top-hud'?110:115})};
 globalThis.getComputedStyle=()=>({getPropertyValue:()=>0});
 globalThis.ResizeObserver=class{constructor(fn){this.fn=fn;this.disconnected=false;observers.push(this);}observe(){}disconnect(){this.disconnected=true;}};
 const api={score:n=>{assert.ok(Number.isFinite(n)&&n>=0);calls.push(['score',n]);},finish:(...a)=>calls.push(['finish',...a]),audio:{play:(...a)=>calls.push(['sound',...a])}};
 return {mount,api,calls,texts,ctx,resize(w,h){mount.clientWidth=w;mount.clientHeight=h;window.innerWidth=w;window.innerHeight=h;observers.forEach(o=>o.fn());},checkCleanup(){assert.ok(removed);assert.ok(observers.every(o=>o.disconnected));},checkStack(){assert.ok(depth<=1,'unbalanced drawing state stack');}};
}
