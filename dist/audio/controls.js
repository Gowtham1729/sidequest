export function bindAudioControls(audio, {open, current}) {
  const $=id=>document.getElementById(id);
  $('audio-open').addEventListener('click', () => {
    void audio.unlock();
    $('audio-description').textContent=`${current().title} has its own soundtrack. Set the mix you like.`;
    open();
  });
  for (const key of ['muted','effects','music']) {
    $(`audio-${key}`).addEventListener('change', event => { void audio.unlock(); audio.update({[key]:event.target.checked}); });
  }
  for (const key of ['effects','music']) {
    $(`audio-${key}-volume`).addEventListener('input', event => { void audio.unlock(); audio.update({[`${key}Volume`]:Number(event.target.value)/100}); });
  }
  $('audio-preview').addEventListener('click', async () => {
    if (await audio.unlock()) audio.play('start');
    else $('audio-description').textContent='Audio couldn’t start. Try again, or keep playing quietly.';
  });
  audio.subscribe(p => {
    for (const key of ['muted','effects','music']) $(`audio-${key}`).checked=p[key];
    for (const key of ['effects','music']) {
      const value=Math.round(p[`${key}Volume`]*100), slider=$(`audio-${key}-volume`);
      slider.value=value; slider.disabled=p.muted||!p[key];
      slider.setAttribute('aria-valuetext',`${value} percent`);
      $(`audio-${key}-value`).textContent=`${value}%`;
    }
    const effects=p.effects&&p.effectsVolume>0, music=p.music&&p.musicVolume>0;
    const label=p.muted||(!effects&&!music)?'Sound off':effects&&music?'Sound on':music?'Music only':'Effects only';
    $('audio-chip-label').textContent=label;
    $('audio-open').setAttribute('aria-label',`${label}. Open sound and music settings`);
    $('audio-open').dataset.muted=String(p.muted||(!effects&&!music));
    $('audio-preview').disabled=p.muted||!effects;
  });
}
