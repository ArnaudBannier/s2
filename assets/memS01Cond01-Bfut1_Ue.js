import"./modulepreload-polyfill-B5Qt9EMX.js";import{M as c}from"./mtl-colors-Dc808x-9.js";import{S as l,j as p}from"./s2-playable-Bdq8E5_G.js";import{B as v,S as f}from"./base-memory-scene-DN59_yEU.js";import{S as C,t as k}from"./s2-code-DjLR-8B-.js";import{l as y,s as b}from"./radix-colors-dark-CR1Y1j7h.js";import"./s2-lerp-anim-CJb7usyt.js";import"./s2-step-animator-B7uTbjFC.js";const g="Etat de la mémoire : conditionnelles",L=`**type:int** **fn:main**(**type:void**) {
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
}`;class w extends v{memory;code;constructor(e){super(e),this.setDefaultFont(14),this.code=new C(this),this.code.setParent(this.getSVG()),this.setDefaultCodeStyle(this.code),this.code.setContent(k(L)),this.code.data.minExtents.set(2.5,4,this.getWorldSpace()),this.setDefaultFont(16);const n=10;this.memory=new f(this,n,{isStacked:!0,addressStart:64,addressPrefix:"@",addressRadix:10}),this.memory.setParent(this.getSVG()),this.setDefaultMemoryStyle(this.memory),this.update(),this.createAnimation()}createAnimation(){this.animator.makeStep();const e=p.fromHex(y[12]),n=p.fromHex(b[10]);let t=1;this.code.animateSetCurrentLine(t++,this.animator);const o=this.memory.createMemoryId(),m=this.memory.createMemoryId();let i=this.animator.createLabelAtCurrentTime();o.animateSetNameAndValue("a","3",this.animator,{label:i,valueColor:e}),m.animateSetNameAndValue("b","2",this.animator,{label:i,offset:200,valueColor:e}),this.animator.makeStep(),this.update(),this.code.animateSetCurrentLine(t++,this.animator);const u=this.memory.createMemoryId();u.animateSetNameAndValue("c","99",this.animator,{valueColor:e}),this.animator.makeStep(),this.update(),this.code.animateSetCurrentLine(t++,this.animator);const s=this.memory.createMemoryId();s.animateSetNameAndValue("f","3.5",this.animator,{valueColor:e}),this.animator.makeStep(),this.update(),t++,this.code.animateSetCurrentLine(t++,this.animator),this.animator.makeStep(),this.update(),t++,this.code.animateSetCurrentLine(t++,this.animator),this.animator.makeStep(),this.update(),this.code.animateSetCurrentLine(t++,this.animator),i=this.animator.createLabelAtCurrentTime();const d=this.code.createTokenHighlight([{lineIndex:t-1,content:"a"},{lineIndex:t-1,content:"b"}],c.CYAN);d.animateFadeIn(this.animator,{label:i}),o.animateHighlightIn(this.animator,{label:i,offset:100,color:c.CYAN}),this.animator.makeStep(),this.update(),o.animateCopyValue(m,this.animator,{color:e}),this.animator.makeStep(),this.update(),i=this.animator.createLabelAtCurrentTime(),d.animateFadeOut(this.animator,{label:i}),o.animateHighlightOut(this.animator,{label:i,offset:100}),this.code.animateSetCurrentLine(t++,this.animator),s.animateSetValue("7",this.animator,{color:e}),this.animator.makeStep(),this.update(),this.code.animateSetCurrentLine(t++,this.animator),this.animator.makeStep(),this.update(),t++,this.code.animateSetCurrentLine(t++,this.animator),m.animateSetValue("0",this.animator,{color:e}),this.animator.makeStep(),this.update(),this.code.animateSetCurrentLine(t++,this.animator),this.animator.makeStep(),this.update(),this.code.animateSetCurrentLine(t++,this.animator),this.animator.makeStep(),this.update(),this.code.animateSetCurrentLine(t++,this.animator),s.animateSetValue("6",this.animator,{color:e}),this.animator.makeStep(),this.update(),this.code.animateSetCurrentLine(t++,this.animator),this.animator.makeStep(),this.update(),this.code.animateSetCurrentLine(t++,this.animator),s.animateSetValue("12",this.animator,{color:e}),this.animator.makeStep(),this.update(),this.code.animateSetCurrentLine(t++,this.animator),this.animator.makeStep(),this.update(),t+=2,this.code.animateSetCurrentLine(t++,this.animator),this.animator.makeStep(),this.update(),this.code.animateSetCurrentLine(t++,this.animator),this.animator.makeStep(),this.update(),this.code.animateSetCurrentLine(t++,this.animator),i=this.animator.createLabelAtCurrentTime(),s.animateColor(n,this.animator,{label:i}),u.animateColor(n,this.animator,{label:i}),m.animateColor(n,this.animator,{label:i}),o.animateColor(n,this.animator,{label:i}),this.animator.makeStep(),this.update()}}const h=document.querySelector("#app");h&&(h.innerHTML=`
        <div>
            <h1>${g}</h1>
            <svg xmlns="http://www.w3.org/2000/svg" id=test-svg class="responsive-svg" preserveAspectRatio="xMidYMid meet"></svg>
            <div class="figure-nav">
                <div>Animation : <input type="range" id="slider" min="0" max="100" step="1" value="0" style="width:50%"></div>
                <button id="reset-button"><i class="fa-solid fa-backward-fast"></i></button>
                <button id="prev-button"><i class="fa-solid fa-step-backward"></i></button>
                <button id="play-button"><i class="fa-solid fa-redo"></i></button>
                <button id="next-button"><i class="fa-solid fa-step-forward"></i></button>
                <button id="full-button"><i class="fa-solid fa-play"></i></button>
            </div>
        </div>`);const S=h?.querySelector("#test-svg"),r=document.querySelector("#slider");if(S&&r){const a=new w(S);let e=-1;a.animator.reset(),document.querySelector("#reset-button")?.addEventListener("click",()=>{e=-1,a.animator.stop(),a.animator.reset(),r.value="0"}),document.querySelector("#prev-button")?.addEventListener("click",()=>{e=l.clamp(e-1,0,a.animator.getStepCount()-1),a.animator.resetStep(e),a.update();const t=a.animator.getStepStartTime(e)/a.animator.getMasterDuration();r.value=(t*100).toString()}),document.querySelector("#next-button")?.addEventListener("click",()=>{e=l.clamp(e+1,0,a.animator.getStepCount()-1),a.animator.playStep(e);const t=a.animator.getStepStartTime(e)/a.animator.getMasterDuration();r.value=(t*100).toString()}),document.querySelector("#play-button")?.addEventListener("click",()=>{a.animator.playStep(e)}),document.querySelector("#full-button")?.addEventListener("click",()=>{a.animator.playMaster(),r.value="0"}),r.addEventListener("input",()=>{const t=r.valueAsNumber/100*a.animator.getMasterDuration();a.animator.stop(),a.animator.setMasterElapsed(t),e=a.animator.getStepIndexFromElapsed(t),a.getSVG().update()})}
