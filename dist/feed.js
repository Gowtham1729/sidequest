import {shuffled} from './games/shared.js';
export class GameFeed {
  constructor(size,random=Math.random){this.size=size;this.random=random;this.items=[0,...shuffled(Array.from({length:size-1},(_,i)=>i+1),random)];this.cursor=0;}
  ensureNext(){if(this.cursor+1>=this.items.length){const next=shuffled(Array.from({length:this.size},(_,i)=>i),this.random);if(next[0]===this.current&&next.length>1)[next[0],next[1]]=[next[1],next[0]];this.items.push(...next);}}
  get current(){return this.items[this.cursor]}
  peek(){this.ensureNext();return this.items[this.cursor+1]}
  next(){this.ensureNext();this.cursor++;return this.current}
  previous(){if(this.cursor>0)this.cursor--;return this.current}
  select(index){if(index===this.current)return;this.items=[...this.items.slice(0,this.cursor+1),index,...shuffled(Array.from({length:this.size},(_,i)=>i).filter(i=>i!==index),this.random)];this.cursor++;}
}
