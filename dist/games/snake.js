import {surface, clear, rect, text, DIRECTIONS, swipeDirection} from './shared.js';
export function canTurn(from,to){return from.x+to.x!==0||from.y+to.y!==0;}
export function snakeCollision(body, next, eating, size=16){return next.x<0||next.y<0||next.x>=size||next.y>=size||body.slice(0,eating?body.length:-1).some(p=>p.x===next.x&&p.y===next.y);}
export function createSnake(mount,api){
  const {ctx}=surface(mount);let body=[],food,dir,nextDir,elapsed=0,points=0,running=false,startPoint,changed=false;
  function foodAt(){const empty=[];for(let y=0;y<16;y++)for(let x=0;x<16;x++)if(!body.some(p=>p.x===x&&p.y===y))empty.push({x,y});return empty[Math.floor(Math.random()*empty.length)];}
  function reset(preview=false){body=preview?[{x:10,y:5},{x:9,y:5},{x:8,y:5},{x:7,y:5},{x:6,y:5},{x:6,y:6},{x:6,y:7},{x:6,y:8},{x:5,y:8},{x:4,y:8}]:[{x:7,y:8},{x:6,y:8},{x:5,y:8}];dir={x:1,y:0};nextDir=dir;food=preview?{x:12,y:5}:foodAt();elapsed=0;points=0;changed=false;running=!preview;draw();}
  function turn(name){const d=DIRECTIONS[name];if(running&&d&&!changed&&canTurn(dir,d)){nextDir=d;changed=true;}}
  function draw(){clear(ctx);rect(ctx,21,19,358,358,'#213528',12);for(let y=0;y<16;y++)for(let x=0;x<16;x++)rect(ctx,24+x*22,22+y*22,20,20,(x+y)%2?'#203326':'#23382a',2);
    if(food){rect(ctx,27+food.x*22,25+food.y*22,14,14,'#ff997e',5);}
    [...body].reverse().forEach((p,i)=>rect(ctx,25+p.x*22,23+p.y*22,18,18,i===body.length-1?'#c9f86a':'#78b968',4));
    const h=body[0];if(h){ctx.fillStyle='#25432b';const x=25+h.x*22,y=23+h.y*22;if(dir.x){ctx.fillRect(x+(dir.x>0?12:3),y+4,3,3);ctx.fillRect(x+(dir.x>0?12:3),y+11,3,3)}else{ctx.fillRect(x+4,y+(dir.y>0?12:3),3,3);ctx.fillRect(x+11,y+(dir.y>0?12:3),3,3)}}
  }
  function step(){dir=nextDir;changed=false;const h={x:body[0].x+dir.x,y:body[0].y+dir.y},eating=!!food&&h.x===food.x&&h.y===food.y;
    if(snakeCollision(body,h,eating)){running=false;api.finish('That’s a wrap.',`${points} snacks collected. Find your flow again.`);return;}
    body.unshift(h);if(eating){points++;api.score(points);food=foodAt();if(!food){running=false;api.finish('The whole board is yours!',`All ${points} snacks collected. A perfect run.`)}}else body.pop();
  }
  reset(true);
  return {start(){reset();api.score(0)},direction:turn,pointerDown(p){startPoint=p},pointerUp(p){const d=swipeDirection(startPoint,p);if(d)turn(d);startPoint=null},tick(dt){if(running){elapsed+=dt;const period=Math.max(.075,.17-points*.004);if(elapsed>=period){elapsed%=period;step()}}draw()},destroy(){running=false}};
}
