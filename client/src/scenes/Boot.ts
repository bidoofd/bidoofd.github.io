import { Scene } from 'phaser';
    
export class Boot extends Scene
{
    constructor ()
    {
        super('Boot');
    }

    preload ()
    {

        // Preloads asset images
        this.load.image('player', 'assets/images/smiley.png');
        this.load.image('block', 'assets/images/blueBlock.png');
        this.load.image('ground', 'assets/images/redBlock.png');
        this.load.image('logo', '/assets/images/logo.png')
    }

    create ()
    {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.

        // Start MainMenu scene
        this.scene.start('MainMenu');
    }
}
