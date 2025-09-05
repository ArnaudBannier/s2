// import { type S2BaseScene } from '../s2-interface';
// import { S2Element } from './s2-element';
// import { svgNS, type S2SVGAttributes } from '../s2-globals';

// export class S2Style extends S2Element {
//     protected rules: Record<string, S2SVGAttributes>;
//     protected element: SVGStyleElement;

//     constructor(scene: S2BaseScene) {
//         const element = document.createElementNS(svgNS, 'style');
//         super(scene);
//         this.element = element;
//         this.rules = {};
//     }

//     getSVGElement(): SVGStyleElement {
//         return this.element;
//     }

//     addRule(selector: string, declarations: S2SVGAttributes): this {
//         this.rules[selector] = declarations;
//         return this;
//     }

//     getRule(selector: string): S2SVGAttributes {
//         if (selector in this.rules) {
//             return this.rules[selector];
//         } else {
//             const rule: S2SVGAttributes = {};
//             this.rules[selector] = rule;
//             return rule;
//         }
//     }

//     removeRule(selector: string): this {
//         delete this.rules[selector];
//         return this;
//     }

//     update(): this {
//         const children: Array<Text> = [];
//         for (const [selector, declarations] of Object.entries(this.rules)) {
//             const ruleString =
//                 selector +
//                 ' {' +
//                 Object.entries(declarations)
//                     .map(([key, value]) => `${key}: ${value}`)
//                     .join('; ') +
//                 '; }';
//             children.push(document.createTextNode(ruleString));
//         }
//         this.element.replaceChildren(...children);
//         return this;
//     }
// }
