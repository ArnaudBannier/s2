import"./modulepreload-polyfill-B5Qt9EMX.js";import{M as h}from"./mtl-colors-BFHaR8KK.js";import{S as l}from"./s2-playable-CCYpOjF1.js";import{B as S,S as v}from"./base-memory-scene-GOBt8O9p.js";import{S as f,t as C}from"./s2-code-4Hk3M5NT.js";import"./s2-lerp-anim-BiCWT6VV.js";import"./s2-step-animator-Btxnf0HZ.js";const k="Etat de la mémoire : conditionnelles",y=`**type:int** **fn:main**(**type:void**) {
    **type:int** **var:a** = **num:3**, **var:b** = **num:2**;
    **type:char** **var:c** = **str:'c'**;
    **type:float** **var:f** = **var:a** + **num:0.5f**;
    
    **kw:if** (**var:a** == **var:b**) {
        **var:c**++;
    }
    **kw:if** (**var:a** = **var:b**) {
        **var:f** *= **num:2**;
    }
    
    **var:b** = (**var:a** == (**var:b** - **num:1**));
    **kw:switch** (**var:b**) {
    **kw:case** **num:0** :
        **var:f** -= **num:1**;
    **kw:case** **num:1** :
        **var:f** *= **num:2**;
        **kw:break**;
    **kw:default** :
        **var:a** = **num:7**;
    }
    **kw:return** **num:0**;
}`;class b extends S{memory;code;constructor(e){super(e),this.setDefaultFont(14),this.code=new f(this),this.code.setParent(this.getSVG()),this.setDefaultCodeStyle(this.code),this.code.setContent(C(y)),this.code.data.minExtents.set(2.5,4,this.getWorldSpace()),this.setDefaultFont(16);const n=10;this.memory=new v(this,n,{isStacked:!0,addressStart:64,addressPrefix:"@",addressRadix:10}),this.memory.setParent(this.getSVG()),this.setDefaultMemoryStyle(this.memory),this.update(),this.createAnimation()}createAnimation(){this.animator.makeStep();const e=h.LIME_2,n=h.GREY_5;let t=1;this.code.animateSetCurrentLine(t++,this.animator);const o=this.memory.createMemoryId(),m=this.memory.createMemoryId();let i=this.animator.createLabelAtCurrentTime();o.animateSetNameAndValue("a","3",this.animator,{label:i,valueColor:e}),m.animateSetNameAndValue("b","2",this.animator,{label:i,offset:200,valueColor:e}),this.animator.makeStep(),this.update(),this.code.animateSetCurrentLine(t++,this.animator);const d=this.memory.createMemoryId();d.animateSetNameAndValue("c","99",this.animator,{valueColor:e}),this.animator.makeStep(),this.update(),this.code.animateSetCurrentLine(t++,this.animator);const s=this.memory.createMemoryId();s.animateSetNameAndValue("f","3.5",this.animator,{valueColor:e}),this.animator.makeStep(),this.update(),t++,this.code.animateSetCurrentLine(t++,this.animator),this.animator.makeStep(),this.update(),t++,this.code.animateSetCurrentLine(t++,this.animator),this.animator.makeStep(),this.update(),this.code.animateSetCurrentLine(t++,this.animator),i=this.animator.createLabelAtCurrentTime();const c=this.code.createTokenHighlight([{lineIndex:t-1,content:"a"},{lineIndex:t-1,content:"b"}],h.CYAN);c.animateFadeIn(this.animator,{label:i}),o.animateHighlightIn(this.animator,{label:i,offset:100,color:h.CYAN}),this.animator.makeStep(),this.update(),o.animateCopyValue(m,this.animator,{color:e}),this.animator.makeStep(),this.update(),i=this.animator.createLabelAtCurrentTime(),c.animateFadeOut(this.animator,{label:i}),o.animateHighlightOut(this.animator,{label:i,offset:100}),this.code.animateSetCurrentLine(t++,this.animator),s.animateSetValue("7",this.animator,{color:e}),this.animator.makeStep(),this.update(),this.code.animateSetCurrentLine(t++,this.animator),this.animator.makeStep(),this.update(),t++,this.code.animateSetCurrentLine(t++,this.animator),m.animateSetValue("0",this.animator,{color:e}),this.animator.makeStep(),this.update(),this.code.animateSetCurrentLine(t++,this.animator),this.animator.makeStep(),this.update(),this.code.animateSetCurrentLine(t++,this.animator),this.animator.makeStep(),this.update(),this.code.animateSetCurrentLine(t++,this.animator),s.animateSetValue("6",this.animator,{color:e}),this.animator.makeStep(),this.update(),this.code.animateSetCurrentLine(t++,this.animator),this.animator.makeStep(),this.update(),this.code.animateSetCurrentLine(t++,this.animator),s.animateSetValue("12",this.animator,{color:e}),this.animator.makeStep(),this.update(),this.code.animateSetCurrentLine(t++,this.animator),this.animator.makeStep(),this.update(),t+=2,this.code.animateSetCurrentLine(t++,this.animator),this.animator.makeStep(),this.update(),this.code.animateSetCurrentLine(t++,this.animator),this.animator.makeStep(),this.update(),this.code.animateSetCurrentLine(t++,this.animator),i=this.animator.createLabelAtCurrentTime(),s.animateColor(n,this.animator,{label:i}),d.animateColor(n,this.animator,{label:i}),m.animateColor(n,this.animator,{label:i}),o.animateColor(n,this.animator,{label:i}),this.animator.makeStep(),this.update()}}const u=document.querySelector("#app");u&&(u.innerHTML=`
        <div>
            <h1>${k}</h1>
            <svg xmlns="http://www.w3.org/2000/svg" id=test-svg class="responsive-svg" preserveAspectRatio="xMidYMid meet"></svg>
            <div class="figure-nav">
                <div>Animation : <input type="range" id="slider" min="0" max="100" step="1" value="0" style="width:50%"></div>
                <button id="reset-button"><i class="fa-solid fa-backward-fast"></i></button>
                <button id="prev-button"><i class="fa-solid fa-step-backward"></i></button>
                <button id="play-button"><i class="fa-solid fa-redo"></i></button>
                <button id="next-button"><i class="fa-solid fa-step-forward"></i></button>
                <button id="full-button"><i class="fa-solid fa-play"></i></button>
            </div>
        </div>`);const p=u?.querySelector("#test-svg"),r=document.querySelector("#slider");if(p&&r){const a=new b(p);let e=-1;a.animator.reset(),document.querySelector("#reset-button")?.addEventListener("click",()=>{e=-1,a.animator.stop(),a.animator.reset(),r.value="0"}),document.querySelector("#prev-button")?.addEventListener("click",()=>{e=l.clamp(e-1,0,a.animator.getStepCount()-1),a.animator.resetStep(e),a.update();const t=a.animator.getStepStartTime(e)/a.animator.getMasterDuration();r.value=(t*100).toString()}),document.querySelector("#next-button")?.addEventListener("click",()=>{e=l.clamp(e+1,0,a.animator.getStepCount()-1),a.animator.playStep(e);const t=a.animator.getStepStartTime(e)/a.animator.getMasterDuration();r.value=(t*100).toString()}),document.querySelector("#play-button")?.addEventListener("click",()=>{a.animator.playStep(e)}),document.querySelector("#full-button")?.addEventListener("click",()=>{a.animator.playMaster(),r.value="0"}),r.addEventListener("input",()=>{const t=r.valueAsNumber/100*a.animator.getMasterDuration();a.animator.stop(),a.animator.setMasterElapsed(t),e=a.animator.getStepIndexFromElapsed(t),a.getSVG().update()})}
