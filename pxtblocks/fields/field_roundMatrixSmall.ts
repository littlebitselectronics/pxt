/// <reference path="../../built/pxtlib.d.ts" />


namespace pxtblockly {
    import svg = pxt.svgUtil;
  
  
    interface ParsedSpriteEditorOptions {
        sizes: [number, number][];
        initColor: number;
        initWidth: number;
        initHeight: number;
    }
  
    // 32 is specifically chosen so that we can scale the images for the default
    // sprite sizes without getting browser anti-aliasing
    const PREVIEW_WIDTH = 64;
    const PADDING = 5;
    const BG_PADDING = 4;
    const BG_WIDTH = BG_PADDING * 2 + PREVIEW_WIDTH;
    const TOTAL_WIDTH = PADDING * 2 + BG_PADDING * 2 + PREVIEW_WIDTH;
    const DEFAULT_COLOR = "#AAA4AE";
  
    export class FieldRoundMatrixSmall extends Blockly.Field implements Blockly.FieldCustom {
        public isFieldCustom_ = true;
  
        private params: ParsedSpriteEditorOptions;
        private blocksInfo: pxtc.BlocksInfo;
        private editor: pxtmatrix.SpriteEditor;
        private state: pxtmatrix.Bitmap;
        private lightMode: boolean;
        private undoStack: pxtmatrix.CanvasState[];
        private redoStack: pxtmatrix.CanvasState[];
        private colors: string[];
        private text_: string;
  
        constructor(text: string, params: any, validator?: Function) {
            super(text, validator);
            this.colors = [
              '#8E07BA','#FF8A00', '#FFC200',
              '#FFFF00', '#B50000', '#FF0000',
              '#FF8981', '#FEFFB0', '#6473FE',
              '#C51973', '#F051A2', '#FFB3FC',
              '#003E96', '#003EFE', '#00E0FF',
              '#AEFFFF', '#B9FFB9', '#02FFA9',
              '#37B800', '#37FF00', '#00ABBF',
              '#C7C7C7']
            this.text_ = text;
        }
  
        /**
         * Initalize values
         */
        init() {
            if (this.fieldGroup_) {
                // Field has already been initialized once.
                return;
            }
            // Build the DOM.
            this.fieldGroup_ = Blockly.utils.dom.createSvgElement('g', {}, null);
            if (!this.visible_) {
                (this.fieldGroup_ as any).style.display = 'none';
            }
  
            if (!this.state) {
                this.state = new pxtmatrix.Bitmap(7, 7);
            }
  
            this.redrawPreview();
  
            this.updateEditable();
            (this.sourceBlock_ as Blockly.BlockSvg).getSvgRoot().appendChild(this.fieldGroup_);
  
            // Force a render.
            this.render_();
            (this as any).mouseDownWrapper_ = Blockly.bindEventWithChecks_((this as any).getClickTarget_(), "mousedown", this, (this as any).onMouseDown_)
        }
  
        /**
         * Show the inline free-text editor on top of the text.
         * @private
         */
        showEditor_() {
            const windowSize = goog.dom.getViewportSize();
            const scrollOffset = goog.style.getViewportPageOffset(document);
  
            // If there is an existing drop-down someone else owns, hide it immediately and clear it.
            Blockly.DropDownDiv.hideWithoutAnimation();
            Blockly.DropDownDiv.clearContent();
  
            let contentDiv = Blockly.DropDownDiv.getContentDiv() as HTMLDivElement;
  
            this.editor = new pxtmatrix.SpriteEditor(this.state, this.blocksInfo, this.lightMode, this.colors);
            this.editor.initializeUndoRedo(this.undoStack, this.redoStack);
  
            this.editor.render(contentDiv);
            this.editor.rePaint();
  
            this.editor.onClose(() => {
                this.undoStack = this.editor.getUndoStack();
                this.redoStack = this.editor.getRedoStack();
                Blockly.DropDownDiv.hideIfOwner(this);
            });
  
            this.editor.setActiveColor(1, true);
          //   if (!this.params.sizes.some(s => s[0] === this.state.width && s[1] === this.state.height)) {
          //       this.params.sizes.push([this.state.width, this.state.height]);
          //}
            this.editor.setSizePresets([[7,7]]);
  
            goog.style.setHeight(contentDiv, this.editor.outerHeight() + 1);
            goog.style.setWidth(contentDiv, this.editor.outerWidth() + 1);
            goog.style.setStyle(contentDiv, "overflow", "hidden");
            goog.style.setStyle(contentDiv, "max-height", "500px");
            pxt.BrowserUtils.addClass(contentDiv.parentElement, "sprite-editor-dropdown")
  
            Blockly.DropDownDiv.setColour("#2c3e50", "#2c3e50");
            Blockly.DropDownDiv.showPositionedByBlock(this, this.sourceBlock_, () => {
                this.editor.closeEditor();
                this.state = this.editor.bitmap().image;
                this.redrawPreview();
                if (this.sourceBlock_ && Blockly.Events.isEnabled()) {
                    Blockly.Events.fire(new Blockly.Events.BlockChange(
                        this.sourceBlock_, 'field', this.name, this.text_, this.getText()));
                }
  
                goog.style.setHeight(contentDiv, null);
                goog.style.setWidth(contentDiv, null);
                goog.style.setStyle(contentDiv, "overflow", null);
                goog.style.setStyle(contentDiv, "max-height", null);
                pxt.BrowserUtils.removeClass(contentDiv.parentElement, "sprite-editor-dropdown");
                this.editor.removeKeyListeners();
            });
  
            this.editor.addKeyListeners();
            this.editor.layout();
        }
  
        private isInFlyout() {
            return ((this.sourceBlock_.workspace as Blockly.WorkspaceSvg).getParentSvg() as SVGElement).className.baseVal == "blocklyFlyout";
        }
  
        render_() {
            super.render_();
            this.size_.height = TOTAL_WIDTH
            this.size_.width = TOTAL_WIDTH;
        }
  
        getText() {
          return pxtmatrix.bitmapToImageLiteral(this.state, pxt.editor.FileType.TypeScript);
        }
  
        setText(newText: string) {
            if (newText == null) {
                return;
            }
            this.parseBitmap(newText);
            this.redrawPreview();
  
            super.setText(newText);
        }
  
        private redrawPreview() {
            if (!this.fieldGroup_) return;
            pxsim.U.clear(this.fieldGroup_);
  
            const bg = new svg.Rect()
                .at(PADDING * 2, PADDING * 2)
                .size(PREVIEW_WIDTH, PREVIEW_WIDTH)
                .fill("#000000")
                .stroke("#898989", 1)
                .corner(8);
  
            this.fieldGroup_.appendChild(bg.el);
  
            const cellSize = 64 / 8
  
            for (let i = 0; i < 7; i++) {
              for (let j = 0; j< 7 ; j++) {
                if ( (i==0 && (j==0 || j==6)) || (i==6 && (j==0||j==6))) {
                  continue
                }
                const fillColor = this.getColor(this.state.get(i,j))
                const rect = new svg.Rect()
                  .at((cellSize*i) + PADDING*3, (cellSize*j)+PADDING*3)
                  .size(cellSize - 1, cellSize - 1)
                  .fill(fillColor, 1)
                  .corner(2)
                this.fieldGroup_.appendChild(rect.el)
              }
            }
  
            if (this.state) {
                const data = this.renderPreview();
                const img = new svg.Image()
                    .src(data)
                    .at(PADDING + BG_PADDING, PADDING + BG_PADDING)
                    .size(PREVIEW_WIDTH, PREVIEW_WIDTH);
                //this.fieldGroup_.appendChild(img.el);
            }
        }
  
        private parseBitmap(newText: string) {
            const bmp = pxtmatrix.imageLiteralToBitmap(newText);
  
            // Ignore invalid bitmaps
            if (bmp && bmp.width && bmp.height) {
                this.state = bmp;
            }
        }
  
        /**
         * Scales the image to 32x32 and returns a data uri. In light mode the preview
         * is drawn with no transparency (alpha is filled with background color)
         */
        private renderPreview() {
            //const colors = pxt.appTarget.runtime.palette.slice(1);
            const canvas = document.createElement("canvas");
            canvas.width = PREVIEW_WIDTH;
            canvas.height = PREVIEW_WIDTH;
  
            // Works well for all of our default sizes, does not work well if the size is not
            // a multiple of 2 or is greater than 32 (i.e. from the decompiler)
            const cellSize = Math.min(PREVIEW_WIDTH / this.state.width, PREVIEW_WIDTH / this.state.height);
  
            // Center the image if it isn't square
            const xOffset = Math.max(Math.floor((PREVIEW_WIDTH * (1 - (this.state.width / this.state.height))) / 2), 0);
            const yOffset = Math.max(Math.floor((PREVIEW_WIDTH * (1 - (this.state.height / this.state.width))) / 2), 0);
  
            let context: CanvasRenderingContext2D;
            context = canvas.getContext("2d", { alpha: true });
            context.fillStyle = "#ff0000";
            context.beginPath()
            context.arc(32, 32, 32, 0, 2 * Math.PI, false)
            context.fill()
  
            return canvas.toDataURL();
        }
  
        private getColor(val : number) {
          if(val - 1 >= 0 && val - 1 < this.colors.length) {
              return this.colors[val-1]
          } else {
              return DEFAULT_COLOR;
          }
        }
    }
  
    function parseFieldOptions(opts: FieldSpriteEditorOptions) {
        const parsed: ParsedSpriteEditorOptions = {
            sizes: [
                [8, 8],
            ],
            initColor: 1,
            initWidth: 8,
            initHeight: 8,
        };
  
        if (!opts) {
            return parsed;
        }
  
        if (opts.sizes != null) {
            const pairs = opts.sizes.split(";");
            const sizes: [number, number][] = [];
            for (let i = 0; i < pairs.length; i++) {
                const pair = pairs[i].split(",");
                if (pair.length !== 2) {
                    continue;
                }
  
                let width = parseInt(pair[0]);
                let height = parseInt(pair[1]);
  
                if (isNaN(width) || isNaN(height)) {
                    continue;
                }
  
                const screenSize = pxt.appTarget.runtime && pxt.appTarget.runtime.screenSize;
                if (width < 0 && screenSize)
                    width = screenSize.width;
                if (height < 0 && screenSize)
                    height = screenSize.height;
  
                sizes.push([width, height]);
            }
            if (sizes.length > 0) {
                parsed.sizes = sizes;
                parsed.initWidth = sizes[0][0];
                parsed.initHeight = sizes[0][1];
            }
        }
  
        parsed.initColor = withDefault(opts.initColor, parsed.initColor);
        parsed.initWidth = withDefault(opts.initWidth, parsed.initWidth);
        parsed.initHeight = withDefault(opts.initHeight, parsed.initHeight);
  
        return parsed;
  
        function withDefault(raw: string, def: number) {
            const res = parseInt(raw);
            if (isNaN(res)) {
                return def;
            }
            return res;
        }
    }
  }
  