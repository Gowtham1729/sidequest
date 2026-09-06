// Original synthesized sound design. Each cabinet has its own tonal center,
// tempo and phrase. Everything uses the existing engine's envelopes and mixer.
const tone=(note,duration=.1,wave='sine',gain=.18,at=0,endNote)=>({note,duration,wave,gain,at,...(endNote===undefined?{}:{endNote})});
const chord=(root,intervals,wave='sine')=>intervals.map((n,i)=>tone(root+n,.14+i*.05,wave,.17,i*.07));
function palette(root,bpm,wave,phrase,{quiet=false}={}){
 const sounds={
  start:chord(root,[0,7,12]),finish:chord(root,[7,4,0]),win:chord(root,[0,4,7,12],'triangle'),
  move:[tone(root-5,.035,wave,.08)],step:[tone(root-12,.035,'sine',.07)],
  rotate:[tone(root+7,.065,wave,.14,0,root+12)],lock:[tone(root-12,.09,'triangle',.18,0,root-19)],
  clear:chord(root,[0,7,12,16]),slide:[tone(root,.09,'sine',.14,0,root+5)],
  blocked:[tone(root-12,.07,'sine',.09,0,root-14)],reveal:chord(root,[0,7]),flag:[tone(root+5,.075,'triangle',.12)],
  toggle:[tone(root+12,.09,wave,.16,0,root+7)],place:[tone(root-5,.045,'triangle',.18),tone(root,.09,'sine',.12,.03)],
  flip:[tone(root+7,.07,'sine',.14),tone(root+12,.1,wave,.12,.035)],
  shoot:[tone(root-7,.09,'triangle',.13,0,root+5)],wall:[tone(root-12,.045,'sine',.09)],
  pop:chord(root,[7,12],wave),cascade:chord(root,[0,7,12,19]),stick:[tone(root,.06,'sine',.12)],
  warning:[tone(root-5,.14,'triangle',.12),tone(root-5,.14,'triangle',.12,.2)],
  putt:[tone(root-12,.035,'triangle',.22,0,root-19)],bounce:[tone(root-7,.065,'sine',.1,0,root-12)],
  cup:[tone(root-12,.085,'sine',.19,0,root-17),...chord(root,[7,12])],
  swish:[tone(root+19,.08,'triangle',.1,0,root+7),...chord(root,[0,7,12])],
  rim:[tone(root+19,.045,'triangle',.16),tone(root+7,.14,'sine',.13,.025)],
  lane:[tone(root-5,.07,'sine',.1,0,root)],coin:chord(root,[12,19]),gem:chord(root,[7,19]),
  crash:[tone(root-12,.18,'triangle',.19,0,root-24)],bomb:[tone(root-19,.22,'triangle',.2,0,root-26)],
  slice:[tone(root+24,.065,'triangle',.12,0,root+7),tone(root+12,.13,'sine',.15,.035)],
  hit:[tone(root+7,.12,wave,.18)],perfect:chord(root,[12,19]),
  miss:[tone(root-7,.16,'triangle',.13,0,root-14)],empty:[tone(root-12,.03,'sine',.045)],beat:[tone(root-24,.035,'triangle',.065)],
  one:[tone(root,.26,'sine',.23),tone(root+12,.13,'sine',.045)],
  two:[tone(root+4,.26,'sine',.23),tone(root+16,.13,'sine',.045)],
  three:[tone(root+7,.26,'sine',.23),tone(root+19,.13,'sine',.045)],
  four:[tone(root+12,.26,'sine',.23),tone(root+24,.13,'sine',.045)]
 };
 return {sounds,music:{bpm,steps:32,voices:quiet?[]:[
  {wave,gain:.085,duration:60/bpm*.36,notes:phrase.map(n=>n===null?null:root+n)},
  {wave:'sine',gain:.075,duration:.3,notes:Array.from({length:32},(_,i)=>i%8===0?root-24+(i>=16?5:0):i%8===5?root-17:null)}
 ]}};
}
const air=[0,null,7,null,12,null,7,null,4,null,7,null,11,null,7,null,5,null,9,null,12,null,9,null,4,null,7,null,12,null,null,null];
const pulse=[0,null,7,12,null,7,null,4,0,null,4,null,7,null,12,null,5,null,9,12,null,9,null,7,4,null,7,null,12,null,7,null];
const dusk=[0,null,null,3,null,7,null,null,10,null,null,7,null,3,null,null,5,null,null,8,null,12,null,null,7,null,null,3,null,0,null,null];
export const expansionProfiles={
 blocks:palette(60,116,'triangle',pulse),mines:palette(62,86,'sine',dusk),slide:palette(57,88,'sine',air),lights:palette(65,94,'sine',dusk),
 echo:palette(60,100,'sine',air,{quiet:true}),four:palette(64,100,'triangle',air),reversi:palette(55,90,'sine',dusk),
 bubbles:palette(67,112,'sine',pulse),golf:palette(60,82,'sine',air),hoops:palette(62,108,'triangle',pulse),
 sprint:palette(57,128,'triangle',pulse),slice:palette(65,122,'triangle',pulse),orbit:palette(59,104,'sine',dusk),maze:palette(62,96,'sine',air),
 rhythm:palette(60,125,'sine',pulse,{quiet:true})
};
