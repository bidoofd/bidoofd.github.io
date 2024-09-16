import { Scene } from 'phaser';

import { Button } from '../../dist/assets/class/button'

export class MainMenu extends Scene
{
    private levelOne: Button;

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        this.add.image((this.game.canvas.width / 2), (this.game.canvas.height / 2) - 100, 'logo')

        this.levelOne = new Button(this, (this.game.canvas.width / 2) - 50, (this.game.canvas.height / 2) - 25, 'Level One', null, () => this.gotoLevelOne());
        this.add.existing(this.levelOne);
        }

        gotoLevelOne() {
            this.scene.start('LevelOne')
          }
}
