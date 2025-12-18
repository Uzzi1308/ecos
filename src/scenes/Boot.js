export class Boot extends Phaser.Scene {
    constructor() {
        super({ key: 'Boot' });
    }

    preload() {
        console.log('Boot scene iniciada');
    }

    create() {
        console.log('Boot completado, iniciando Preload');
        this.scene.start('Preload');
    }
}

export default class Controles {
    constructor(scene) {
        this.scene = scene;
        this.cursors = scene.input.keyboard.createCursorKeys();
        
        // Teclas de habilidades
        this.keys = {
            escuchar: scene.input.keyboard.addKey('E'),
            recordar: scene.input.keyboard.addKey('R'),
            perdonar: scene.input.keyboard.addKey('F'),
            pausa: scene.input.keyboard.addKey('P'),
            menu: scene.input.keyboard.addKey('ESC')
        };
        
        this.configurarEventos();
    }
    
    configurarEventos() {
        // Evento para evitar que F5 refresque la página
        this.scene.input.keyboard.on('keydown-F5', (event) => {
            event.preventDefault();
        });
        
        // Evento para evitar que F11 entre/salga de pantalla completa
        this.scene.input.keyboard.on('keydown-F11', (event) => {
            event.preventDefault();
            this.scene.scale.toggleFullscreen();
        });
    }
    
    update() {
        return {
            left: this.cursors.left.isDown,
            right: this.cursors.right.isDown,
            up: this.cursors.up.isDown,
            down: this.cursors.down.isDown,
            space: this.cursors.space.isDown,
            escuchar: Phaser.Input.Keyboard.JustDown(this.keys.escuchar),
            recordar: Phaser.Input.Keyboard.JustDown(this.keys.recordar),
            perdonar: Phaser.Input.Keyboard.JustDown(this.keys.perdonar),
            pausa: Phaser.Input.Keyboard.JustDown(this.keys.pausa),
            menu: Phaser.Input.Keyboard.JustDown(this.keys.menu)
        };
    }
}