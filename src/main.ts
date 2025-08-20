// import './style.css'
// import { Vector2 } from './math/vector2.ts'
// import { Camera2 } from './math/camera2.ts';
// import { SVGBuilder } from './svg/svg-builder.ts';
// import { SVGGridBuilder } from './svg/svg-grid-builder.ts';
// import { SVGPathBuilder } from './svg/svg-path-builder.ts';
// import { SVGNode } from './svg/svg-node.ts';
// import { AnimationScheduler } from './utils/anim-scheduler.ts';
// import { animate, svg, createTimeline } from 'animejs';
// import { MTL } from './utils/mtl-colors.ts';
// import type { SVGAttributeMap } from './svg/svg-builder.ts';

// const viewport = new Vector2(640.0, 360.0);
// let camera = new Camera2(
//     new Vector2(8.0, 4.5),
//     new Vector2(8.0, 4.5),
//     viewport,
//     1.0
// );

// let appDiv = document.querySelector<HTMLDivElement>('#app');

// if (appDiv) {
//     appDiv.innerHTML = `
//         <div>
//         <h1>My first SVG</h1>
//         <svg width="${viewport.width}" height="${viewport.height}" xmlns="http://www.w3.org/2000/svg" id=test-svg>
//             <rect width="${viewport.width}" height="${viewport.height}" x="0" y="0" fill="grey" />
//         </svg>
//         <div>Angle : <input type="range" id="slider-angle" min="0" max="360" value="0"></div>
//         <div>
//         <button id="reverse-button">Retour</button>
//         <button id="animate-button">Avancer</button>
//         </div>
//         </div>
//     `;
// }

// let animScheduler = new AnimationScheduler();

// function createSVG(svgElement: SVGSVGElement, angle: number): void {
//     svgElement.innerHTML = "";
//     let svgBuilder = new SVGBuilder(camera, svgElement);
//     const defsElement = SVGBuilder.createDefsElement();
//     svgElement.appendChild(defsElement);
//     const marker = svgBuilder.createArrowTipMarker();
//     marker.setAttribute('id', 'arrow-head');
//     defsElement.appendChild(marker);

//     const lineStyle: SVGAttributeMap = {
//         'stroke': MTL.TEAL,
//         'stroke-width': '4',
//         'fill': 'transparent',
//         'stroke-linecap': 'round'
//     }
//     const arrowStyle: SVGAttributeMap = {
//         'fill': MTL.TEAL
//     }
//     const nodeBackground: SVGAttributeMap = {
//         'fill': MTL.LIGHT_BLUE_1,
//         'stroke': MTL.LIGHT_BLUE,
//         'stroke-width': '4'
//     };
//     const edgeStyle : SVGAttributeMap = {
//         //...lineStyle,
//         'start-outer-sep': '0',
//         'end-outer-sep': '0.4',
//         'tension': '0.5',
//         'angle': '45',
//         's-curve': 'true',
//         'r': '5',
//         'sweep-flag': '0'
//     }

//     let pathElement = new SVGPathBuilder(svgBuilder).moveTo(0, 0).lineTo(10, 5).curveTo(3, 0, 0, 3, 15, 0).build();
//     //pathElement.setAttribute('stroke', primaryColor);
//     //pathElement.setAttribute('class', 'svg-shape');
//     pathElement.setAttribute('fill', 'var(--secondary-color)');

//     let circleElement = svgBuilder.createCircle(1, 1, 1);
//     circleElement.setAttribute('id', 'circle-to-animate');

//     let gridElement = new SVGGridBuilder(svgBuilder).setLower(0, 0).setUpper(16, 9).build();
//     gridElement.setAttribute('stroke', 'black');
//     svgBuilder.rotateDeg(gridElement, angle, 8, 1);
//     svgBuilder.appendChildren([pathElement, circleElement, gridElement]);

//     let node1 = new SVGNode(svgBuilder).setPosition(2, 5).addText('Noeud 1').addBackground(nodeBackground);
//     const node2 = new SVGNode(svgBuilder).setPosition(8, 2).addText('Noeud 2').addBackground(nodeBackground);
//     svgBuilder.appendChildren([node1.getSVGElement(), node2.getSVGElement()]);
//     node1.adjustSize();
//     node2.adjustSize();

//     //const line1 = node1.curveEdgeTo(node2, { edge: edgeStyle, path: lineStyle });
//     const line1 = node1.circleEdgeTo(node2, { edge: edgeStyle, path: lineStyle });
//     svgElement.appendChild(line1);
//     // textElement.setAttribute("text-anchor", "middle"); // text-anchor="start | middle | end"
//     // textElement.setAttribute("dominant-baseline", "middle"); // auto | middle | hanging + autres
//     // svgElement.appendChild(textElement);

//     const line = new SVGPathBuilder(svgBuilder)
//         .moveTo(4, 4)
//         .curveTo(2, 0, 0, -2, 8, 8)
//         .curveTo(0, 2, 0, -2, 10, 8)
//         .setAttributes(lineStyle).build();
//     svgElement.appendChild(line);

//     const arrow = svgBuilder.createArrowTipSymbol();
//     arrow.id = 'arrow-symbol';
//     svgElement.appendChild(arrow);

//     const arrowHead = SVGBuilder.createUseElement(arrowStyle);
//     arrowHead.setAttribute('href', '#arrow-symbol');
//     arrowHead.setAttribute('width', '16');
//     arrowHead.setAttribute('height', '16');
//     arrowHead.setAttribute('x', '-8');
//     arrowHead.setAttribute('y', '-8');
//     arrowHead.setAttribute('opacity', '0')
//     svgElement.appendChild(arrowHead);

//     const drawableLine = svg.createDrawable(line);

//     animScheduler.reset();
//     animScheduler.append(
//         createTimeline({autoplay: false}).add(
//             drawableLine,
//             {
//                 draw: '0 1',
//                 ease: 'inOutQuad',
//                 duration: 500,
//                 loop: false
//             },
//             'start'
//         ).add(
//             arrowHead,
//             {
//                 ease: 'inOutQuad',
//                 duration: 500,
//                 opacity : '1',
//                 ...svg.createMotionPath(line)
//             },
//             '<<'
//         )
//     );
//     animScheduler.append(
//         animate(circleElement, {
//             r: {
//                 to: 250,
//             },
//             duration: 500,
//             easing: 'inOut',
//             loop: false,
//             autoplay: false
//         })
//     );
//     animScheduler.append(
//         createTimeline({autoplay: false}).add(
//             gridElement,
//             {
//                 'stroke-width': 10,//{ to: [1, 10] },
//                 'stroke': { to: [MTL.BLUE_9, MTL.BLUE] },
//                 duration: 500,
//                 easing: 'inOut',
//                 loop: false
//             },
//             'start'
//         )
//     );
// }

// document.querySelector<HTMLButtonElement>("#animate-button")?.addEventListener("click",
//     () => { animScheduler.playForward(); }
// );
// document.querySelector<HTMLButtonElement>("#reverse-button")?.addEventListener("click",
//     () => { animScheduler.playBackward(); }
// );

// const svgElement = appDiv?.querySelector<SVGSVGElement>('#test-svg');
// const slider = document.querySelector<HTMLInputElement>('#slider-angle');
// if (svgElement && slider) {
//     createSVG(svgElement, slider.valueAsNumber);

//     slider.addEventListener("input", () => {
//         createSVG(svgElement, slider.valueAsNumber);
//     });
// }
