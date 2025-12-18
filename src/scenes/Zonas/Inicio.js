import Protagonista from '../../entities/Protagonista.js';
import Controles from '../../config/Controles.js';
import DialogoSystem from '../../systems/DialogoSystem.js';
import UISystem from '../../systems/UISystem.js';
import EfectosVisuales from '../../systems/EfectosVisuales.js';
import HabilidadManager from '../../managers/HabilidadManager.js';
import AudioManager from '../../managers/AudioManager.js';
import EnemigoEmocional from '../../entities/EnemigoEmocional.js';
import Memoria from '../../entities/Memoria.js';

export default class Inicio extends Phaser.Scene {
    constructor() {
        super({ key: 'Inicio' });
    }
    
    create() {
        console.log('Escena Inicio cargada');
        
        // Fondo simple
        this.add.rectangle(640, 360, 1280, 720, 0x88ccff);
        
        // Título
        this.add.text(640, 200, 'ECOS ENTRE NOSOTROS', {
            fontFamily: 'Arial',
            fontSize: '48px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        // Mensaje
        this.add.text(640, 300, 'Zona de Inicio', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        // Instrucciones temporales
        this.add.text(640, 400, 
            'Usa las flechas para moverte\n' +
            'ESPACIO para saltar\n' +
            'P para pausar', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // Crear jugador simple
        this.jugador = this.physics.add.sprite(200, 500, 'protagonista');
        this.jugador.setCollideWorldBounds(true);
        
        // Crear plataforma de prueba
        const plataforma = this.add.rectangle(400, 600, 800, 50, 0x8b4513);
        this.physics.add.existing(plataforma, true);
        this.physics.add.collider(this.jugador, plataforma);
        
        // Controles básicos
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // Cámara
        this.cameras.main.startFollow(this.jugador);
        this.cameras.main.setBounds(0, 0, 1280, 720);
    }
    
    update() {
        if (!this.jugador) return;
        
        // Movimiento básico
        if (this.cursors.left.isDown) {
            this.jugador.setVelocityX(-160);
        } else if (this.cursors.right.isDown) {
            this.jugador.setVelocityX(160);
        } else {
            this.jugador.setVelocityX(0);
        }
        
        // Salto
        if (this.cursors.space.isDown && this.jugador.body.touching.down) {
            this.jugador.setVelocityY(-400);
        }
    }
}