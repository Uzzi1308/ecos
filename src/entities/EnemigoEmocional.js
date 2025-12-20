export default class EnemigoEmocional extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, tipo) {
        super(scene, x, y, `enemigo_${tipo}`);
        
        this.tipo = tipo; // 'miedo', 'duda', 'celos', 'silencio'
        this.estado = 'activo';
        this.intensidad = 100; 
        this.resuelto = false;
        this.detectandoJugador = false;
        this.radioDeteccion = 200;
        
        // Propiedades según tipo
        this.configurarPorTipo();
        
        // Configuración física
        this.setCollideWorldBounds(true);
        this.body.setSize(24, 24);
        this.body.setOffset(4, 8);
        this.body.setBounce(0.2);
        
        // Interacción
        this.setInteractive();
        this.on('pointerdown', () => this.interactuar());
        
        // Tween de latido emocional
        this.crearAnimacionLatido();
        
        // Sonidos
        this.sonidoInteraccion = scene.sound.add('sfx_texto');
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Grupo para partículas
        this.particulas = null;
    }
    
    configurarPorTipo() {
        const configs = {
            miedo: {
                color: 0x4444ff,
                velocidad: 80,
                comportamiento: 'huir',
                dialogo: [
                    "Tengo miedo de que me abandones",
                    "¿Y si no soy suficiente?",
                    "Me asusta lo que podría pasar"
                ],
                saludMaxima: 3
            },
            duda: {
                color: 0x888888,
                velocidad: 40,
                comportamiento: 'circular',
                dialogo: [
                    "¿Realmente me quieres?",
                    "No sé si esto está bien",
                    "A veces no entiendo lo que sientes"
                ],
                saludMaxima: 5
            },
            celos: {
                color: 0xff4444,
                velocidad: 120,
                comportamiento: 'perseguir',
                dialogo: [
                    "Siempre miras a otrxs",
                    "¿Por qué no me prestas atención?",
                    "Siento que no soy importante"
                ],
                saludMaxima: 4
            },
            silencio: {
                color: 0x000000,
                velocidad: 0,
                comportamiento: 'estatico',
                dialogo: ["..."],
                saludMaxima: 10
            }
        };
        
        this.config = configs[this.tipo];
        this.salud = this.config.saludMaxima;
        this.setTint(this.config.color);
        
        // Radio de detección según tipo
        if (this.tipo === 'miedo') this.radioDeteccion = 150;
        if (this.tipo === 'celos') this.radioDeteccion = 250;
    }
    
    crearAnimacionLatido() {
        // Animación de pulso/latido
        this.scene.tweens.add({
            targets: this,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Cambio sutil de brillo
        this.scene.tweens.add({
            targets: this,
            alpha: { from: 0.8, to: 1 },
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    interactuar() {
        if (this.resuelto) return;
        
        console.log(`Interactuando con ${this.tipo}`);
        
        // Reducir salud/intensidad
        this.salud--;
        
        // Mostrar diálogo aleatorio
        const dialogo = Phaser.Utils.Array.GetRandom(this.config.dialogo);
        this.mostrarDialogo(dialogo);
        
        // Efecto visual de retroceso
        this.scene.tweens.add({
            targets: this,
            alpha: 0.5,
            duration: 200,
            yoyo: true
        });
        
        // Verificar si se calma
        if (this.salud <= 0) {
            this.calmar();
        } else {
            // Mostrar indicador de salud
            this.mostrarIndicadorSalud();
        }
    }
    
    mostrarDialogo(texto) {
        this.sonidoInteraccion.play({ volume: 0.3 });
        
        // Crear burbuja de diálogo
        const dialogo = this.scene.add.text(this.x, this.y - 50, texto, {
            fontFamily: 'Courier New',
            fontSize: '14px',
            color: '#ffffff',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: { x: 10, y: 5 },
            wordWrap: { width: 200 }
        }).setOrigin(0.5);
        
        // Animación de la burbuja
        this.scene.tweens.add({
            targets: dialogo,
            y: this.y - 80,
            alpha: 0,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => dialogo.destroy()
        });
    }
    
    mostrarIndicadorSalud() {
        // Crear indicador de salud
        const barra = this.scene.add.rectangle(this.x, this.y - 30, 30, 4, 0xff0000);
        const relleno = this.scene.add.rectangle(this.x - 15, this.y - 30, 
            (this.salud / this.config.saludMaxima) * 30, 4, 0x00ff00)
            .setOrigin(0, 0.5);
        
        // Animación de desvanecimiento
        this.scene.tweens.add({
            targets: [barra, relleno],
            alpha: 0,
            y: this.y - 40,
            duration: 1000,
            onComplete: () => {
                barra.destroy();
                relleno.destroy();
            }
        });
    }
    
    calmar() {
        if (this.resuelto) return;
        
        console.log(`${this.tipo} se ha calmado`);
        
        this.resuelto = true;
        this.estado = 'calmado';
        
        // Cambiar apariencia
        this.clearTint();
        this.setAlpha(0.6);
        this.setScale(0.8);
        this.setVelocity(0, 0);
        
        // Detener animaciones de latido
        this.scene.tweens.killTweensOf(this);
        
        // Emitir evento
        this.scene.events.emit('enemigoCalmado', {
            tipo: this.tipo,
            x: this.x,
            y: this.y
        });
        
        // Transformar en algo útil después de un delay
        this.scene.time.delayedCall(500, () => {
            this.transformarEnUtilidad();
        });
    }
    
    transformarEnUtilidad() {
        const transformaciones = {
            miedo: {
                tipo: 'plataforma_segura',
                color: 0x4444ff,
                efecto: 'crearPlataforma'
            },
            duda: {
                tipo: 'puente',
                color: 0x888888,
                efecto: 'crearPuente'
            },
            celos: {
                tipo: 'impulso_aereo',
                color: 0xff4444,
                efecto: 'crearImpulso'
            },
            silencio: {
                tipo: 'zona_silencio',
                color: 0x000000,
                efecto: 'crearZonaSilencio'
            }
        };
        
        const transformacion = transformaciones[this.tipo];
        
        // Efecto de transformación
        this.crearEfectoTransformacion(transformacion.color);
        
        // Llamar a la función de transformación en la escena si existe
        if (this.scene[transformacion.efecto]) {
            this.scene[transformacion.efecto](this.x, this.y);
        }
        
        // Destruir el enemigo después de la transformación
        this.scene.time.delayedCall(1000, () => {
            this.destroy();
        });
    }
    
crearEfectoTransformacion(color) {
    // SOLUCIÓN: Usa efectos con gráficos en lugar de partículas
    for (let i = 0; i < 20; i++) {
        const particula = this.scene.add.circle(
            this.x,
            this.y,
            Phaser.Math.Between(2, 6),
            color,
            0.8
        );
        
        // Calcular dirección radial
        const angle = (i / 20) * Math.PI * 2;
        const distancia = Phaser.Math.Between(50, 120);
        
        this.scene.tweens.add({
            targets: particula,
            x: this.x + Math.cos(angle) * distancia,
            y: this.y + Math.sin(angle) * distancia,
            scale: 0,
            alpha: 0,
            duration: Phaser.Math.Between(600, 1000),
            ease: 'Power2',
            onComplete: () => particula.destroy()
        });
    }
}
    
    update() {
        if (!this.resuelto) {
            this.moverSegunComportamiento();
            this.detectarJugador();
        }
    }
    
    detectarJugador() {
        const jugador = this.scene.jugador;
        if (!jugador) return;
        
        const distancia = Phaser.Math.Distance.Between(
            this.x, this.y, jugador.x, jugador.y
        );
        
        this.detectandoJugador = distancia < this.radioDeteccion;
        
        // Cambiar color si detecta al jugador
        if (this.detectandoJugador) {
            this.setAlpha(1);
        } else {
            this.setAlpha(0.8);
        }
    }
    
    moverSegunComportamiento() {
        const jugador = this.scene.jugador;
        if (!jugador) return;
        
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
                
            case 'estatico':
                // No se mueve
                break;
        }
    }
    
    huirDeJugador(jugador) {
        if (!this.detectandoJugador) {
            this.setVelocity(0, 0);
            return;
        }
        
        const dx = this.x - jugador.x;
        const dy = this.y - jugador.y;
        const distancia = Math.sqrt(dx * dx + dy * dy);
        
        if (distancia < this.radioDeteccion) {
            const angulo = Math.atan2(dy, dx);
            this.setVelocity(
                Math.cos(angulo) * this.config.velocidad,
                Math.sin(angulo) * this.config.velocidad
            );
        }
    }
    
    perseguirJugador(jugador) {
        if (!this.detectandoJugador) {
            this.setVelocity(0, 0);
            return;
        }
        
        const dx = jugador.x - this.x;
        const dy = jugador.y - this.y;
        const distancia = Math.sqrt(dx * dx + dy * dy);
        
        if (distancia < this.radioDeteccion) {
            const angulo = Math.atan2(dy, dx);
            this.setVelocity(
                Math.cos(angulo) * this.config.velocidad,
                Math.sin(angulo) * this.config.velocidad
            );
        }
    }
    
    movimientoCircular() {
        // Movimiento aleatorio en patrones circulares
        if (Phaser.Math.Between(0, 100) > 95) {
            const angulo = Phaser.Math.Between(0, 360) * (Math.PI / 180);
            this.setVelocity(
                Math.cos(angulo) * this.config.velocidad,
                Math.sin(angulo) * this.config.velocidad
            );
        }
    }
    
    // ========== GETTERS ==========
    
    getDatos() {
        return {
            tipo: this.tipo,
            x: this.x,
            y: this.y,
            resuelto: this.resuelto,
            salud: this.salud
        };
    }
}