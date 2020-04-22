/// <reference path="./buttons.ts" />
namespace pxtmatrix {
    import svg = pxt.svgUtil;

    export interface SpriteHeaderHost {
        showGallery(): void;
        hideGallery(): void;
    }

    export class SpriteHeader {
        div: HTMLDivElement;
        root: svg.SVG;
        toggle: Toggle;
        undoButton: Button;
        redoButton: Button;

        constructor(protected host: SpriteHeaderHost) {
            this.div = document.createElement("div");
            this.div.setAttribute("id", "sprite-editor-header");

            this.root = new svg.SVG(this.div).id("sprite-editor-header-controls");
            this.toggle = new Toggle(this.root, { leftText: "Editor", rightText: "Gallery", baseColor: "#4B7BEC" });
            this.toggle.onStateChange(isLeft => {
                if (isLeft) {
                    this.host.hideGallery();
                }
                else {
                    this.host.showGallery();
                }
            });
        }

        getElement() {
            return this.div;
        }

        layout() {
            this.toggle.layout();
            this.toggle.translate((TOTAL_HEIGHT - this.toggle.width()) / 2, (HEADER_HEIGHT - this.toggle.height()) / 2);
        }
    }
}
