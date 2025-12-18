export default class Protagonista extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'protagonista');
        
        // Estados emocionales
        this.estadoEmocional = 'neutral';
        this.confianza = 50; // 0-100
        this.memoriaActiva = false;
        
        // Habilidades desbloqueadas
        this.habilidades = {
            escuchar: false,
            esperar: false,
            confiar: false,
            recordar: false,
            perdonar: false
        };
        
        // Configuración física
        this.setCollideWorldBounds(true);
        this.body.setSize(20, 36);
        this.body.setOffset(6, 4);
        
        // Animaciones
        this.crearAnimaciones();
    }
    
    crearAnimaciones() {
        const anims = this.scene.anims;
        
        anims.create({
            key: 'caminar',
            frames: anims.generateFrameNumbers('protagonista', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        
        anims.create({
            key: 'quieto',
            frames: [{ key: 'protagonista', frame: 0 }]
        });
        
        anims.create({
            key: 'escuchar',
            frames: anims.generateFrameNumbers('protagonista', { start: 4, end: 6 }),
            frameRate: 3,
            repeat: 0
        });
    }
    
    usarHabilidad(hab) {
        switch(hab) {
            case 'escuchar':
                return this.activarEscucha();
            case 'confiar':
                return this.saltoDeConfianza();
            // ... otras habilidades
        }
    }
    
    activarEscucha() {
        if (!this.habilidades.escuchar) return false;
        
        this.memoriaActiva = true;
        this.setVelocityX(0);
        this.anims.play('escuchar', true);
        
        // Revelar caminos ocultos
        this.scene.revelarCaminosOcultos();
        
        // Temporizador de escucha
        this.scene.time.delayedCall(2000, () => {
            this.memoriaActiva = false;
        });
        
        return true;
    }
    
    saltoDeConfianza() {
        if (!this.habilidades.confiar) return false;
        
        // El jugador DEBE soltar todos los botones
        // Esta lógica se controla en update()
        return true;
    }
    
    update(controles) {
        // Lógica especial para salto de confianza
        if (this.habilidades.confiar && this.body.onFloor()) {
            this.scene.uiManager.mostrarIndicadorConfianza();
        }
        
        // Movimiento normal
        if (!this.memoriaActiva) {
            if (controles.left.isDown) {
                this.setVelocityX(-160);
                this.anims.play('caminar', true);
                this.flipX = true;
            } else if (controles.right.isDown) {
                this.setVelocityX(160);
                this.anims.play('caminar', true);
                this.flipX = false;
            } else {
                this.setVelocityX(0);
                this.anims.play('quieto', true);
            }
            
            if (controles.up.isDown && this.body.onFloor()) {
                this.setVelocityY(-400);
            }
        }
    }
}