import { Boot } from '../scenes/Boot.js';
import { Preload } from '../scenes/Preload.js';
import { Menu } from '../scenes/Menu.js';
import { Inicio } from '../scenes/Zonas/Inicio.js';
import { Distancia } from '../scenes/Zonas/Distancia.js';
import { Recuerdos } from '../scenes/Zonas/Recuerdos.js';
import { Conflicto } from '../scenes/Zonas/Conflicto.js';
import { Confianza } from '../scenes/Zonas/Confianza.js';
import { Presente } from '../scenes/Zonas/Presente.js';

export const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    pixelArt: true,
    roundPixels: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
            debug: false
        }
    },
    scene: [Boot, Preload, Menu, Inicio, Distancia, Recuerdos, Conflicto, Confianza, Presente],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    parent: 'game-container'
};