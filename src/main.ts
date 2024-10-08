import { Boot } from './scenes/Boot';
import { Game as MainGame } from './scenes/Game';
import { GameOver } from './scenes/GameOver';
import { MainMenu } from './scenes/MainMenu';
import { LevelOne } from './scenes/levels/LevelOne';
import { LevelTwo } from './scenes/levels/LevelTwo';
import { LevelThree } from './scenes/levels/LevelThree';
import { LevelFour } from './scenes/levels/LevelFour';
import { LevelFive } from './scenes/levels/LevelFive';
import { LevelSelector } from './scenes/LevelSelector';

import { Game, Types } from "phaser";

const config: Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    parent: 'game-container',
    backgroundColor: '#028af8',
    scale: {
        mode: Phaser.Scale.CENTER_BOTH,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        zoom: 2
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 600, y: 600 },
            debug: false
        }
    },
    scene: [
        Boot,
        MainMenu,
        LevelSelector,
        LevelOne,
        LevelTwo,
        LevelThree,
        LevelFour,
        LevelFive,
        MainGame,
        GameOver
    ]
};

export default new Game(config);
