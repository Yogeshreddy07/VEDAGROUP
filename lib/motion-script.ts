// Runs before first paint (inlined in layout.tsx): enables `html.motion` unless reduced motion or automation.
// Failsafe: if the Motion component never mounts, content is un-hidden after 4s.
export const motionScript=`(function(){try{var d=document.documentElement;if(navigator.webdriver||matchMedia('(prefers-reduced-motion: reduce)').matches)return;d.classList.add('motion');setTimeout(function(){if(!window.__vgMotion)d.classList.remove('motion')},4000)}catch(e){}})()`;
