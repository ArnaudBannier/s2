import { type S2BaseScene } from '../s2-interface';
import { S2Element } from './s2-element';
import { svgNS, type S2StyleDecl } from '../s2-globals';

export class S2Style extends S2Element<SVGStyleElement> {
    protected rules: Record<string, S2StyleDecl>;

    constructor(scene: S2BaseScene) {
        const element = document.createElementNS(svgNS, 'style');
        super(element, scene);
        this.rules = {};
    }

    addRule(selector: string, declarations: S2StyleDecl): this {
        this.rules[selector] = declarations;
        return this;
    }

    getRule(selector: string): S2StyleDecl {
        if (selector in this.rules) {
            return this.rules[selector];
        } else {
            const rule: S2StyleDecl = {};
            this.rules[selector] = rule;
            return rule;
        }
    }

    removeRule(selector: string): this {
        delete this.rules[selector];
        return this;
    }

    update(): this {
        const children: Array<Text> = [];
        for (const [selector, declarations] of Object.entries(this.rules)) {
            const ruleString =
                selector +
                ' {' +
                Object.entries(declarations)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join('; ') +
                '; }';
            children.push(document.createTextNode(ruleString));
        }
        this.element.replaceChildren(...children);
        return this;
    }
}
