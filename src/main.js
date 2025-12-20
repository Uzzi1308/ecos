import { Boot } from './scenes/Boot.js';
import { Preload } from './scenes/Preload.js';
import { Menu } from './scenes/Menu.js';
import { Inicio } from './scenes/Inicio.js';

const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'game',
    backgroundColor: '#000000',
    scene: [Boot, Preload, Menu, Inicio], // <-- Inicio agregado
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

const game = new Phaser.Game(config);
console.log('Phaser version:', Phaser.VERSION);
console.log('Game iniciado');