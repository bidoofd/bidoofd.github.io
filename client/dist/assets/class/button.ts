import Phaser from 'phaser';

abstract class BaseButton extends Phaser.GameObjects.Text {
    protected graphics: Phaser.GameObjects.Graphics;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        text: string,
        style: Phaser.GameObjects.TextStyle | null,

        private defaultBackgroundColor: string, private hoverBackgroundColor: string, private activeBackgroundColor: string,
        private defaultTextColor: string, private hoverTextColor: string, private activeTextColor: string
    ) {
        super(scene, x, y, text, style!);

        // Outline graphic
        this.graphics = this.scene.add.graphics();
        this.updateStroke(x, y, this.width + 16, this.height + 16, 8, 0x000000);

        // Sets the default button style
        this.setFontFamily('Courier')
            .setFontSize('16px')
            .setPadding(8)
            .setBackgroundColor(this.defaultBackgroundColor)
            .setFill(this.defaultTextColor);

        // Button interaction
        this.setInteractive({ useHandCursor: true })
            .on('pointerover', () => this.enterButtonHoverState())
            .on('pointerout', () => this.enterButtonRestState())
            .on('pointerdown', () => this.enterButtonActiveState())
            .on('pointerup', () => {
                this.enterButtonHoverState();
                this.onClick();
            });
    }

    protected abstract onClick(): void;

    // Gives a popping effect for the stroke around the box / removes the stroke effect
    private updateStroke(x: number, y: number, width: number, height: number, strokeWidth: number, strokeColor: number) {
        this.graphics.clear();
        this.graphics.fillStyle(0xffffff).fillRect(x, y, width, height);
        this.graphics.lineStyle(strokeWidth, strokeColor).strokeRect(x, y, width, height);
    }

    // Entering the button hover state when hovering over the button with the mouse, and with darkest colour and gray text
    protected enterButtonHoverState() {
        this.setBackgroundColor(this.hoverBackgroundColor)
            .setFill(this.hoverTextColor);
        this.updateStroke(this.x, this.y, this.width, this.height, 12, 0x000000);
    }

    // Entering the button rest state when nothing is over the button, with lightest colour and darkest text
    protected enterButtonRestState() {
        this.setBackgroundColor(this.defaultBackgroundColor)
            .setFill(this.defaultTextColor);
        this.updateStroke(this.x, this.y, this.width, this.height, 8, 0x000000);
    }

    // Entering the button active state when clicking with the darkest colour, lightest text
    protected enterButtonActiveState() {
        this.setBackgroundColor(this.activeBackgroundColor)
            .setFill(this.activeTextColor);
    }
}

export class PageButton extends BaseButton {
    constructor(scene: Phaser.Scene, x: number, y: number, text: string, style: Phaser.GameObjects.TextStyle | null, callback: () => void) {
        super(
            scene, x, y, text, style,
            "#ffc799", // defaultBackgroundColor
            "#ffac66", // hoverBackgroundColor
            "#ff9033", // activeBackgroundColor
            "#000000", // defaultTextColor
            "#f0f0f0", // hoverTextColor
            "#ffffff", // activeTextColor
        );

        this.onClick = callback;
    }

    protected onClick: () => void;
}

export class Button extends BaseButton {
    constructor(scene: Phaser.Scene, x: number, y: number, text: string, style: Phaser.GameObjects.TextStyle | null, callback: () => void) {
        super(
            scene, x, y, text, style,
            "#ff9999", // defaultBackgroundColor
            "#ff6666", // hoverBackgroundColor
            "#ff3333", // activeBackgroundColor
            "#000000", // defaultTextColor
            "#f0f0f0", // hoverTextColor
            "#ffffff", // activeTextColor
        );

        this.onClick = callback;
    }

    protected onClick: () => void;
}
