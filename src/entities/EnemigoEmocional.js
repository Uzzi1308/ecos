export default class EnemigoEmocional extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, tipo) {
        super(scene, x, y, `enemigo_${tipo}`);
        
        this.tipo = tipo; // 'miedo', 'duda', 'celos', 'silencio'
        this.estado = 'activo';
        this.intensidad = 100;
        this.resuelto = false;
        
        // Propiedades según tipo
        this.configurarPorTipo();
        
        // Interacción con el jugador
        this.setInteractive();
        this.on('pointerdown', this.interactuar, this);
        
        // Animación de latido emocional
        this.crearAnimacionLatido();
    }
    
    configurarPorTipo() {
        const configs = {
            miedo: {
                velocidad: 80,
                color: 0x4444ff,
                comportamiento: 'huir',
                dialogo: "Tengo miedo de que me abandones"
            },
            duda: {
                velocidad: 40,
                color: 0x888888,
                comportamiento: 'circular',
                dialogo: "¿Realmente me quieres?"
            },
            celos: {
                velocidad: 120,
                color: 0xff4444,
                comportamiento: 'perseguir',
                dialogo: "Siempre miras a otrxs"
            },
            silencio: {
                velocidad: 0,
                color: 0x000000,
                comportamiento: 'estatico',
                dialogo: "..."
            }
        };
        
        this.config = configs[this.tipo];
        this.setTint(this.config.color);
    }
    
    crearAnimacionLatido() {
        this.scene.tweens.add({
            targets: this,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    interactuar() {
        if (this.resuelto) return;
        
        // Mostrar diálogo emocional
        this.scene.sistemaDialogo.mostrar(this.config.dialogo, this.x, this.y - 50);
        
        // Reducir intensidad
        this.intensidad -= 20;
        
        // Verificar si se "calma"
        if (this.intensidad <= 0) {
            this.calmar();
        } else {
            // Feedback visual
            this.scene.tweens.add({
                targets: this,
                alpha: 0.5,
                duration: 200,
                yoyo: true
            });
        }
    }
    
    calmar() {
        this.resuelto = true;
        this.estado = 'calmado';
        
        // Cambiar apariencia
        this.clearTint();
        this.setAlpha(0.6);
        this.setScale(0.8);
        
        // Dejar de moverse
        this.setVelocity(0, 0);
        
        // Emitir evento
        this.scene.events.emit('enemigoCalmado', {
            tipo: this.tipo,
            x: this.x,
            y: this.y
        });
        
        // Transformarse en algo útil
        this.transformarEnUtilidad();
    }
    
    transformarEnUtilidad() {
        // Según el tipo, se transforma en algo diferente
        const transformaciones = {
            miedo: 'plataforma_segura',
            duda: 'puente',
            celos: 'impulso_aereo',
            silencio: 'zona_silencio'
        };
        
        const nuevaUtilidad = this.scene.physics.add.sprite(
            this.x, 
            this.y, 
            transformaciones[this.tipo]
        );
        
        // Animación de transformación
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                this.destroy();
                
                // La nueva utilidad aparece
                this.scene.tweens.add({
                    targets: nuevaUtilidad,
                    alpha: 1,
                    scale: 1,
                    from: 0,
                    duration: 500
                });
            }
        });
    }
    
    update() {
        if (!this.resuelto) {
            this.moverSegunComportamiento();
        }
    }
    
    moverSegunComportamiento() {
        const jugador = this.scene.jugador;
        
        switch(this.config.comportamiento) {
            case 'huir':
                this.huirDeJugador(jugador);
                break;
            case 'perseguir':
                this.perseguirJugador(jugador);
                break;
            case 'circular':
                this.movimientoCircular();
                break;
        }
    }
    
    huirDeJugador(jugador) {
        const dx = this.x - jugador.x;
        const dy = this.y - jugador.y;
        const distancia = Math.sqrt(dx*dx + dy*dy);
        
        if (distancia < 200) {
            const angulo = Math.atan2(dy, dx);
            this.setVelocity(
                Math.cos(angulo) * this.config.velocidad,
                Math.sin(angulo) * this.config.velocidad
            );
        } else {
            this.setVelocity(0, 0);
        }
    }
}