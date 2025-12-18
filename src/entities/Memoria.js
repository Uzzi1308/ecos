export default class Memoria extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, tipo) {
        super(scene, x, y, 'recuerdo');
        
        this.tipo = tipo; // 'felicidad', 'tristeza', 'amor', 'esperanza'
        this.recolectada = false;
        this.valor = 1;
        
        // Propiedades según tipo
        this.configurarPorTipo();
        
        // Configuración física
        this.body.setAllowGravity(false);
        this.setImmovable(true);
        
        // Animación
        this.anims.play('recuerdo_flotar', true);
        
        // Efecto de brillo
        this.crearEfectoBrillo();
        
        // Tween de flotación
        this.crearAnimacionFlotar();
        
        // Sonido
        this.sonidoRecoleccion = scene.sound.add('sfx_recuerdo');
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
    }
    
    configurarPorTipo() {
        const configs = {
            felicidad: {
                color: 0xffff00,
                dialogo: [
                    "Recuerdo cuando reíamos sin parar",
                    "Ese día todo era perfecto",
                    "La alegría que sentí contigo"
                ],
                efecto: 'aumentarConfianza'
            },
            tristeza: {
                color: 0x0000ff,
                dialogo: [
                    "Aquí lloré en silencio",
                    "El dolor que nos unió",
                    "Aprendí que juntos éramos más fuertes"
                ],
                efecto: 'curarHeridas'
            },
            amor: {
                color: 0xff00ff,
                dialogo: [
                    "Tu mano en la mía me dio paz",
                    "El primer 'te quiero'",
                    "Sentí que todo tenía sentido"
                ],
                efecto: 'desbloquearHabilidad'
            },
            esperanza: {
                color: 0x00ff00,
                dialogo: [
                    "Creímos que podíamos superarlo",
                    "La luz al final del túnel",
                    "Juntos podíamos con todo"
                ],
                efecto: 'revelarCamino'
            }
        };
        
        this.config = configs[this.tipo];
        this.setTint(this.config.color);
    }
    
    crearEfectoBrillo() {
        // Efecto de brillo pulsante
        this.scene.tweens.add({
            targets: this,
            alpha: { from: 0.7, to: 1 },
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
        
        // Brillo exterior
        const brillo = this.scene.add.circle(this.x, this.y, 20, this.config.color, 0.2);
        
        this.scene.tweens.add({
            targets: brillo,
            scale: { from: 0.8, to: 1.2 },
            alpha: { from: 0.1, to: 0.3 },
            duration: 1500,
            yoyo: true,
            repeat: -1
        });
        
        // Hacer que el brillo siga al recuerdo
        this.scene.events.on('update', () => {
            if (brillo && this.active) {
                brillo.x = this.x;
                brillo.y = this.y;
            }
        });
        
        // Guardar referencia para destruir luego
        this.brillo = brillo;
    }
    
    crearAnimacionFlotar() {
        // Movimiento de flotación suave
        this.scene.tweens.add({
            targets: this,
            y: this.y - 10,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Rotación leve
        this.scene.tweens.add({
            targets: this,
            angle: 5,
            duration: 3000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    recolectar(jugador) {
        if (this.recolectada) return;
        
        console.log(`Recolectando recuerdo de ${this.tipo}`);
        
        this.recolectada = true;
        
        // Mostrar diálogo
        this.mostrarDialogo();
        
        // Efecto visual de recolección
        this.crearEfectoRecoleccion();
        
        // Sonido
        this.sonidoRecoleccion.play({ volume: 0.5 });
        
        // Aplicar efecto al jugador
        this.aplicarEfecto(jugador);
        
        // Destruir después de un delay
        this.scene.time.delayedCall(1000, () => {
            this.destroy();
            if (this.brillo) {
                this.brillo.destroy();
            }
        });
        
        return true;
    }
    
    mostrarDialogo() {
        const dialogo = Phaser.Utils.Array.GetRandom(this.config.dialogo);
        
        const texto = this.scene.add.text(this.x, this.y - 40, dialogo, {
            fontFamily: 'Courier New',
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: { x: 10, y: 5 },
            wordWrap: { width: 200 }
        }).setOrigin(0.5);
        
        // Animación del texto
        this.scene.tweens.add({
            targets: texto,
            y: this.y - 80,
            alpha: 0,
            duration: 3000,
            ease: 'Power2',
            onComplete: () => texto.destroy()
        });
    }
    
    crearEfectoRecoleccion() {
        // Partículas de recolección
        const particulas = this.scene.add.particles('particula_recuerdo');
        
        const emitter = particulas.createEmitter({
            x: this.x,
            y: this.y,
            speed: { min: 50, max: 150 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 1, end: 0 },
            tint: this.config.color,
            blendMode: 'ADD',
            lifespan: 1000,
            quantity: 30
        });
        
        // Efecto de expansión
        this.scene.tweens.add({
            targets: this,
            scale: 2,
            alpha: 0,
            duration: 500,
            ease: 'Power2'
        });
        
        // Detener y destruir partículas
        this.scene.time.delayedCall(1000, () => {
            emitter.stop();
            this.scene.time.delayedCall(500, () => {
                emitter.destroy();
                particulas.destroy();
            });
        });
    }
    
    aplicarEfecto(jugador) {
        if (!jugador) return;
        
        // Aplicar efecto según tipo de recuerdo
        switch(this.config.efecto) {
            case 'aumentarConfianza':
                jugador.confianza = Phaser.Math.Clamp(jugador.confianza + 15, 0, 100);
                break;
                
            case 'curarHeridas':
                // En este juego no hay salud, pero podría usarse para algo
                break;
                
            case 'desbloquearHabilidad':
                // El jugador maneja el desbloqueo de habilidades automáticamente
                break;
                
            case 'revelarCamino':
                if (this.scene.revelarCaminosOcultos) {
                    this.scene.revelarCaminosOcultos();
                }
                break;
        }
        
        // Emitir evento de recuerdo recolectado
        this.scene.events.emit('recuerdoRecolectado', {
            tipo: this.tipo,
            x: this.x,
            y: this.y,
            efecto: this.config.efecto
        });
    }
    
    // ========== GETTERS ==========
    
    getDatos() {
        return {
            tipo: this.tipo,
            x: this.x,
            y: this.y,
            recolectada: this.recolectada
        };
    }
    
    update() {
        // Rotación continua suave
        this.angle += 0.5;
    }
}