import"./modulepreload-polyfill-B5Qt9EMX.js";import{S as d,a as S,b as l,M as m}from"./s2-lerp-anim-CO5UdZaq.js";import{B as v,S as f}from"./base-memory-scene-O8q0nCz9.js";import{S as y,t as b}from"./s2-code-50wdqqyA.js";import"./s2-step-animator-CaQhDVDm.js";const C="Etat de la mémoire : conditionnelles",k=`**type:int** **fn:main**(**type:void**) {
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
}`,g=1.5,L=new d(640,360).scale(g),w=new S(new d(0,0),new d(8,4.5),L);class M extends v{memory;code;constructor(e){super(e,w),this.setDefaultFont(14),this.code=new y(this),this.code.setParent(this.getSVG()),this.setDefaultCodeStyle(this.code),this.code.setContent(b(k)),this.setDefaultFont(16);const r=10;this.memory=new f(this,r,{isStacked:!0,addressStart:64,addressPrefix:"@",addressRadix:10}),this.memory.setParent(this.getSVG()),this.setDefaultMemoryStyle(this.memory),this.update(),this.createAnimation()}createAnimation(){this.animator.makeStep();const e=m.LIME_2,r=m.DEEP_ORANGE_2;let t=1;this.code.animateSetCurrentLine(t++,this.animator);const o=this.memory.createMemoryId(),u=this.memory.createMemoryId();let i=this.animator.createLabelAtCurrentTime();o.animateSetNameAndValue("a","3",this.animator,{label:i,valueColor:e}),u.animateSetNameAndValue("b","2",this.animator,{label:i,offset:200,valueColor:e}),this.animator.makeStep(),this.update(),this.code.animateSetCurrentLine(t++,this.animator),this.memory.createMemoryId().animateSetNameAndValue("c","99",this.animator,{valueColor:r}),this.animator.makeStep(),this.update(),this.code.animateSetCurrentLine(t++,this.animator);const s=this.memory.createMemoryId();s.animateSetNameAndValue("f","3.5",this.animator,{valueColor:e}),this.animator.makeStep(),this.update(),t++,this.code.animateSetCurrentLine(t++,this.animator),this.animator.makeStep(),this.update(),t++,this.code.animateSetCurrentLine(t++,this.animator),this.animator.makeStep(),this.update(),this.code.animateSetCurrentLine(t++,this.animator),i=this.animator.createLabelAtCurrentTime();const h=this.code.createTokenHighlight([{lineIndex:t-1,content:"a"},{lineIndex:t-1,content:"b"}],m.CYAN);h.animateFadeIn(this.animator,{label:i}),o.animateHighlightIn(this.animator,{label:i,offset:100,color:m.CYAN}),this.animator.makeStep(),this.update(),o.animateCopyValue(u,this.animator,{color:e}),this.animator.makeStep(),this.update(),i=this.animator.createLabelAtCurrentTime(),h.animateFadeOut(this.animator,{label:i}),o.animateHighlightOut(this.animator,{label:i,offset:100}),this.code.animateSetCurrentLine(t++,this.animator),s.animateSetValue("7",this.animator,{color:e}),this.animator.makeStep(),this.update(),this.code.animateSetCurrentLine(t++,this.animator),this.animator.makeStep(),this.update(),t++,this.code.animateSetCurrentLine(t++,this.animator),u.animateSetValue("0",this.animator,{color:e}),this.code.animateSetCurrentLine(t++,this.animator),this.animator.makeStep(),this.update(),this.code.animateSetCurrentLine(t++,this.animator),this.animator.makeStep(),this.update(),this.code.animateSetCurrentLine(t++,this.animator),s.animateSetValue("6",this.animator,{color:e}),this.animator.makeStep(),this.update(),this.code.animateSetCurrentLine(t++,this.animator),this.animator.makeStep(),this.update(),this.code.animateSetCurrentLine(t++,this.animator),s.animateSetValue("12",this.animator,{color:e}),this.animator.makeStep(),this.update(),this.code.animateSetCurrentLine(t++,this.animator),this.animator.makeStep(),this.update(),t+=2,this.code.animateSetCurrentLine(t++,this.animator),this.animator.makeStep(),this.update(),this.code.animateSetCurrentLine(t++,this.animator),this.animator.makeStep(),this.update()}}const c=document.querySelector("#app");c&&(c.innerHTML=`
        <div>
            <h1>${C}</h1>
            <svg xmlns="http://www.w3.org/2000/svg" id=test-svg class="responsive-svg" preserveAspectRatio="xMidYMid meet"></svg>
            <div class="figure-nav">
                <div>Animation : <input type="range" id="slider" min="0" max="100" step="1" value="0" style="width:50%"></div>
                <button id="reset-button"><i class="fa-solid fa-backward-fast"></i></button>
                <button id="prev-button"><i class="fa-solid fa-step-backward"></i></button>
                <button id="play-button"><i class="fa-solid fa-redo"></i></button>
                <button id="next-button"><i class="fa-solid fa-step-forward"></i></button>
                <button id="full-button"><i class="fa-solid fa-play"></i></button>
            </div>
        </div>`);const p=c?.querySelector("#test-svg"),n=document.querySelector("#slider");if(p&&n){const a=new M(p);let e=-1;a.animator.reset(),document.querySelector("#reset-button")?.addEventListener("click",()=>{e=-1,a.animator.stop(),a.animator.reset(),n.value="0"}),document.querySelector("#prev-button")?.addEventListener("click",()=>{e=l.clamp(e-1,0,a.animator.getStepCount()-1),a.animator.resetStep(e),a.update();const t=a.animator.getStepStartTime(e)/a.animator.getMasterDuration();n.value=(t*100).toString()}),document.querySelector("#next-button")?.addEventListener("click",()=>{e=l.clamp(e+1,0,a.animator.getStepCount()-1),a.animator.playStep(e);const t=a.animator.getStepStartTime(e)/a.animator.getMasterDuration();n.value=(t*100).toString()}),document.querySelector("#play-button")?.addEventListener("click",()=>{a.animator.playStep(e)}),document.querySelector("#full-button")?.addEventListener("click",()=>{a.animator.playMaster(),n.value="0"}),n.addEventListener("input",()=>{const t=n.valueAsNumber/100*a.animator.getMasterDuration();a.animator.stop(),a.animator.setMasterElapsed(t),e=a.animator.getStepIndexFromElapsed(t),a.getSVG().update()})}
