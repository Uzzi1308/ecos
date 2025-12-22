// EnemigoEmocional.js
export default class EnemigoEmocional extends Phaser.Physics.Arcade.Sprite {
constructor(scene, x, y, tipo) {
    // Usa el spritesheet específico para cada tipo de enemigo
    super(scene, x, y, `enemigo_${tipo}`);
    
    this.tipo = tipo; // 'miedo', 'duda', 'celos', 'silencio'
    this.estado = 'activo';
    this.resuelto = false;
    this.detectandoJugador = false;
    this.radioDeteccion = 200;
    this.ultimaInteraccion = 0;
    
    // Propiedades según tipo
    this.configurarPorTipo();
    
    // 🔴 IMPORTANTE: AÑADIR A LA ESCENA Y FÍSICA PRIMERO
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // 🔴 AHORA SÍ configurar física (el cuerpo ya existe)
    if (this.body) {
        this.setCollideWorldBounds(true);
        this.body.setSize(24, 24);
        this.body.setOffset(4, 4);
        this.body.setBounce(0.2);
    } else {
        console.error('❌ Error: Cuerpo físico no disponible para', this.tipo);
    }
    
    // Iniciar animación
    this.iniciarAnimacion();
    
    // Interacción
    this.setInteractive();
    this.on('pointerdown', () => this.interactuar());
    
    // Sonidos
    this.sonidoInteraccion = scene.sound.add('sfx_texto');
}
    
    configurarPorTipo() {
        const configs = {
            miedo: {
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
                velocidad: 0,
                comportamiento: 'estatico',
                dialogo: ["..."],
                saludMaxima: 10
            }
        };
        
        this.config = configs[this.tipo];
        this.salud = this.config.saludMaxima;
        
        // Radio de detección según tipo
        if (this.tipo === 'miedo') this.radioDeteccion = 150;
        if (this.tipo === 'celos') this.radioDeteccion = 250;
    }
    
    iniciarAnimacion() {
        // Intentar usar animación si existe
        const animKey = `enemigo_${this.tipo}_latido`;
        
        if (this.scene.anims.exists(animKey)) {
            this.play(animKey);
        } else {
            // Animación manual simple: alternar entre frame 0 y 1
            this.setFrame(0);
            
            this.scene.time.addEvent({
                delay: 333, // 3 FPS
                callback: () => {
                    if (this.active && !this.resuelto) {
                        const currentFrame = this.frame ? this.frame.name : 0;
                        this.setFrame(currentFrame === 0 ? 1 : 0);
                    }
                },
                loop: true
            });
        }
        
        // Efecto de brillo sutil
        this.scene.tweens.add({
            targets: this,
            alpha: { from: 0.9, to: 1 },
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    interactuar() {
        if (this.resuelto) return;
        
        // Evitar interacciones muy seguidas
        const now = this.scene.time.now;
        if (now - this.ultimaInteraccion < 300) return;
        this.ultimaInteraccion = now;
        
        console.log(`Interactuando con ${this.tipo}`);
        
        // Reducir salud
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
        
        // Reproducir animación de daño si existe
        const danoAnim = `enemigo_${this.tipo}_dano`;
        if (this.scene.anims.exists(danoAnim)) {
            this.play(danoAnim);
        }
        
        // Verificar si se calma
        if (this.salud <= 0) {
            this.calmar();
        } else {
            // Mostrar indicador de salud
            this.mostrarIndicadorSalud();
        }
    }
    
    mostrarDialogo(texto) {
        // Intentar reproducir sonido
        try {
            this.sonidoInteraccion.play({ volume: 0.3 });
        } catch (e) {
            // Silencio si no hay sonido
        }
        
        // Crear burbuja de diálogo
        const dialogo = this.scene.add.text(this.x, this.y - 50, texto, {
            fontFamily: 'Arial, sans-serif',
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
        const relleno = this.scene.add.rectangle(
            this.x - 15, 
            this.y - 30, 
            (this.salud / this.config.saludMaxima) * 30, 
            4, 
            0x00ff00
        ).setOrigin(0, 0.5);
        
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
        
        // Detener animación
        if (this.anims) {
            this.anims.stop();
        }
        
        // Cambiar a frame estático
        this.setFrame(0);
        this.setAlpha(0.6);
        this.setScale(0.8);
        this.setVelocity(0, 0);
        
        // Detener tweens
        this.scene.tweens.killTweensOf(this);
        
        // Efecto de calma
        this.crearEfectoCalma();
        
        // Emitir evento
        this.scene.events.emit('enemigoCalmado', {
            tipo: this.tipo,
            x: this.x,
            y: this.y
        });
        
        // Transformar después de un delay
        this.scene.time.delayedCall(800, () => {
            this.transformarEnUtilidad();
        });
    }
    
    crearEfectoCalma() {
        // Efecto visual cuando se calma
        for (let i = 0; i < 10; i++) {
            const particula = this.scene.add.circle(
                this.x,
                this.y,
                Phaser.Math.Between(2, 4),
                0xffffff,
                0.8
            );
            
            const angle = (i / 10) * Math.PI * 2;
            const distancia = Phaser.Math.Between(30, 60);
            
            this.scene.tweens.add({
                targets: particula,
                x: this.x + Math.cos(angle) * distancia,
                y: this.y + Math.sin(angle) * distancia,
                alpha: 0,
                scale: 0,
                duration: 800,
                ease: 'Power2',
                onComplete: () => particula.destroy()
            });
        }
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
        } else {
            console.warn(`Método ${transformacion.efecto} no existe en la escena`);
        }
        
        // Destruir después de la transformación
        this.scene.time.delayedCall(1000, () => {
            this.destroy();
        });
    }
    
    crearEfectoTransformacion(color) {
        // Efecto de partículas simple
        for (let i = 0; i < 15; i++) {
            const particula = this.scene.add.circle(
                this.x,
                this.y,
                Phaser.Math.Between(2, 6),
                color,
                0.8
            );
            
            const angle = (i / 15) * Math.PI * 2;
            const distancia = Phaser.Math.Between(50, 100);
            
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
        
        // Cambiar alpha si detecta al jugador
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
    
    getDatos() {
        return {
            tipo: this.tipo,
            x: this.x,
            y: this.y,
            resuelto: this.resuelto,
            salud: this.salud
        };
    }
    
    destroy() {
        // Limpiar cualquier tween asociado
        this.scene.tweens.killTweensOf(this);
        
        // Llamar al destroy original
        super.destroy();
    }
}