

import { Boot } from './scenes/Boot.js';
import { Preload } from './scenes/Preload.js';
import { Menu } from './scenes/Menu.js';

const config = {
    type: Phaser.AUTO,  // Phaser es global ahora
    width: 800,
    height: 600,
    parent: 'game',
    backgroundColor: '#000000',
    scene: [Boot, Preload, Menu],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

// Inicia el juego
const game = new Phaser.Game(config);

// Para debug
console.log('Phaser version:', Phaser.VERSION);
console.log('Game iniciado');