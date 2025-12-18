import Phaser from 'phaser';
import { config } from './config/GameConfig.js';

// Inicializar el juego cuando la página cargue
window.addEventListener('load', () => {
    const game = new Phaser.Game(config);
    
    // Exponer para debugging
    window.game = game;
    
    // Ocultar loading
    document.getElementById('loading').style.display = 'none';
});