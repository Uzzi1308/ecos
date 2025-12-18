export default class Protagonista extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'protagonista');
        
        // Estados emocionales del protagonista
        this.estadoEmocional = 'neutral';
        this.confianza = 50; // 0-100
        this.memoriaActiva = false;
        this.invulnerable = false;
        this.contadorSinControles = 0;
        this.saltoConfianzaDisponible = false;
        
        // Habilidades desbloqueadas
        this.habilidades = {
            escuchar: false,
            esperar: false,
            confiar: false,
            recordar: false,
            perdonar: false
        };
        
        // Estadísticas
        this.recuerdosRecolectados = 0;
        this.enemigosCalmados = 0;
        this.tiempoEscuchando = 0;
        
        // Configuración física
        this.setCollideWorldBounds(true);
        this.body.setSize(20, 28);
        this.body.setOffset(6, 4);
        
        // Velocidades
        this.velocidadCaminar = 160;
        this.fuerzaSalto = 400;
        this.fuerzaSaltoConfianza = 600;
        
        // Efectos visuales
        this.efectoEscucha = null;
        this.indicadorConfianza = null;
        
        // Sonidos
        this.sonidoSalto = scene.sound.add('sfx_salto');
        this.sonidoConfianza = scene.sound.add('sfx_confiar');
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Iniciar animación
        this.anims.play('quieto', true);
        
        // Configurar seguimiento de cámara
        scene.cameras.main.startFollow(this, true, 0.08, 0.08);
        
        // Eventos
        this.escena = scene;
    }
    
    // ========== HABILIDADES ==========
    
    usarHabilidad(hab) {
        switch(hab) {
            case 'escuchar':
                return this.activarEscucha();
            case 'confiar':
                return this.prepararSaltoConfianza();
            case 'recordar':
                return this.activarRecordar();
            case 'perdonar':
                return this.activarPerdonar();
            default:
                return false;
        }
    }
    
    activarEscucha() {
        if (!this.habilidades.escuchar || this.memoriaActiva) return false;
        
        console.log('Activando escucha...');
        
        this.memoriaActiva = true;
        this.setVelocityX(0);
        this.anims.play('escuchar', true);
        
        // Efecto visual de escucha
        this.crearEfectoEscucha();
        
        // Revelar caminos ocultos en la escena
        if (this.escena.revelarCaminosOcultos) {
            this.escena.revelarCaminosOcultos();
        }
        
        // Sonido
        this.escena.sound.play('sfx_escuchar', { volume: 0.5 });
        
        // Temporizador de escucha (2 segundos)
        this.escena.time.delayedCall(2000, () => {
            this.memoriaActiva = false;
            this.anims.play('quieto', true);
            
            // Remover efecto visual
            if (this.efectoEscucha) {
                this.efectoEscucha.destroy();
                this.efectoEscucha = null;
            }
        });
        
        return true;
    }
    
    crearEfectoEscucha() {
        // Círculo de onda expansiva
        this.efectoEscucha = this.escena.add.circle(this.x, this.y, 10, 0x3498db, 0.3);
        
        this.escena.tweens.add({
            targets: this.efectoEscucha,
            radius: 300,
            alpha: 0,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => {
                if (this.efectoEscucha) {
                    this.efectoEscucha.destroy();
                    this.efectoEscucha = null;
                }
            }
        });
    }
    
    prepararSaltoConfianza() {
        if (!this.habilidades.confiar || !this.body.onFloor()) return false;
        
        this.saltoConfianzaDisponible = true;
        
        // Mostrar indicador visual
        this.mostrarIndicadorConfianza();
        
        return true;
    }
    
    mostrarIndicadorConfianza() {
        if (this.indicadorConfianza) {
            this.indicadorConfianza.destroy();
        }
        
        this.indicadorConfianza = this.escena.add.text(this.x, this.y - 40, '¡CONFÍA!', {
            fontFamily: 'Courier New',
            fontSize: '16px',
            color: '#2ecc71',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            padding: { x: 5, y: 2 }
        }).setOrigin(0.5);
        
        // Animación del indicador
        this.escena.tweens.add({
            targets: this.indicadorConfianza,
            y: this.y - 60,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                if (this.indicadorConfianza) {
                    this.indicadorConfianza.destroy();
                    this.indicadorConfianza = null;
                }
            }
        });
    }
    
    ejecutarSaltoConfianza() {
        if (!this.saltoConfianzaDisponible) return false;
        
        console.log('¡Salto de confianza!');
        
        // Salto más alto y con impulso
        this.setVelocityY(-this.fuerzaSaltoConfianza);
        this.saltoConfianzaDisponible = false;
        
        // Efecto visual
        this.escena.efectosVisuales.efectoSaltoConfianza(this.x, this.y);
        
        // Sonido
        this.sonidoConfianza.play();
        
        // Remover indicador si existe
        if (this.indicadorConfianza) {
            this.indicadorConfianza.destroy();
            this.indicadorConfianza = null;
        }
        
        return true;
    }
    
    activarRecordar() {
        if (!this.habilidades.recordar) return false;
        
        console.log('Activando recordar...');
        
        // Efecto visual
        this.escena.cameras.main.flash(300, 255, 255, 255, false);
        
        // Sonido
        this.escena.sound.play('sfx_recuerdo', { volume: 0.3 });
        
        // Reconstruir áreas del pasado en la escena
        if (this.escena.reconstruirAreas) {
            this.escena.reconstruirAreas();
        }
        
        return true;
    }
    
    activarPerdonar() {
        if (!this.habilidades.perdonar) return false;
        
        console.log('Activando perdonar...');
        
        // Efecto visual
        this.escena.efectosVisuales.efectoHabilidadUsada('perdonar', this.x, this.y);
        
        // Sonido
        this.escena.sound.play('sfx_perdonar', { volume: 0.3 });
        
        // Transformar enemigos cercanos
        if (this.escena.transformarEnemigosCercanos) {
            this.escena.transformarEnemigosCercanos(this.x, this.y, 150);
        }
        
        return true;
    }
    
    // ========== MOVIMIENTO Y FÍSICA ==========
    
    update(controles) {
        // Actualizar contador para salto de confianza
        this.actualizarContadorConfianza(controles);
        
        // Movimiento normal (si no está en modo escucha)
        if (!this.memoriaActiva) {
            this.procesarMovimiento(controles);
        }
        
        // Actualizar efectos visuales
        this.actualizarEfectos();
        
        // Actualizar estadísticas
        if (this.memoriaActiva) {
            this.tiempoEscuchando += 1/60; // Aproximadamente 60 FPS
        }
    }
    
    actualizarContadorConfianza(controles) {
        // El salto de confianza se activa cuando el jugador suelta todos los controles
        const sinControles = !controles.left && !controles.right && 
                            !controles.up && !controles.down && 
                            !controles.space;
        
        if (sinControles && this.body.onFloor() && this.habilidades.confiar) {
            this.contadorSinControles++;
            
            // Después de 1 segundo sin controles, activar salto de confianza
            if (this.contadorSinControles > 60) { // ~60 FPS
                this.prepararSaltoConfianza();
            }
        } else {
            this.contadorSinControles = 0;
            this.saltoConfianzaDisponible = false;
        }
        
        // Si tiene salto de confianza disponible y presiona espacio, ejecutarlo
        if (this.saltoConfianzaDisponible && controles.space) {
            this.ejecutarSaltoConfianza();
        }
    }
    
    procesarMovimiento(controles) {
        // Movimiento horizontal
        if (controles.left) {
            this.setVelocityX(-this.velocidadCaminar);
            this.anims.play('caminar', true);
            this.flipX = true;
        } else if (controles.right) {
            this.setVelocityX(this.velocidadCaminar);
            this.anims.play('caminar', true);
            this.flipX = false;
        } else {
            this.setVelocityX(0);
            if (this.body.onFloor()) {
                this.anims.play('quieto', true);
            }
        }
        
        // Salto
        if (controles.up && this.body.onFloor()) {
            this.setVelocityY(-this.fuerzaSalto);
            this.anims.play('saltar', true);
            this.sonidoSalto.play();
        }
        
        // Gravedad variable para caída más realista
        if (!this.body.onFloor() && this.body.velocity.y > 0) {
            this.body.gravity.y = 1200; // Gravedad mayor al caer
        } else {
            this.body.gravity.y = 800; // Gravedad normal
        }
    }
    
    actualizarEfectos() {
        // Actualizar posición del efecto de escucha
        if (this.efectoEscucha) {
            this.efectoEscucha.x = this.x;
            this.efectoEscucha.y = this.y;
        }
        
        // Actualizar posición del indicador de confianza
        if (this.indicadorConfianza) {
            this.indicadorConfianza.x = this.x;
            this.indicadorConfianza.y = this.y - 40;
        }
    }
    
    // ========== INTERACCIÓN CON EL MUNDO ==========
    
    recolectarRecuerdo(recuerdo) {
        this.recuerdosRecolectados++;
        
        // Aumentar confianza
        this.confianza = Phaser.Math.Clamp(this.confianza + 10, 0, 100);
        
        // Efecto visual
        this.escena.efectosVisuales.efectoRecuerdoRecolectado(this.x, this.y, recuerdo.tipo);
        
        // Desbloquear habilidades según recuerdos recolectados
        this.verificarHabilidades();
        
        // Emitir evento
        this.escena.events.emit('recuerdoRecolectado', {
            tipo: recuerdo.tipo,
            total: this.recuerdosRecolectados
        });
    }
    
    calmarEnemigo(enemigo) {
        this.enemigosCalmados++;
        
        // Aumentar confianza
        this.confianza = Phaser.Math.Clamp(this.confianza + 5, 0, 100);
        
        // Emitir evento
        this.escena.events.emit('enemigoCalmado', {
            tipo: enemigo.tipo,
            total: this.enemigosCalmados
        });
    }
    
    verificarHabilidades() {
        // Desbloquear habilidades según recuerdos recolectados
        if (this.recuerdosRecolectados >= 1 && !this.habilidades.escuchar) {
            this.habilidades.escuchar = true;
            this.escena.events.emit('habilidadDesbloqueada', 'escuchar');
        }
        
        if (this.recuerdosRecolectados >= 2 && !this.habilidades.confiar) {
            this.habilidades.confiar = true;
            this.escena.events.emit('habilidadDesbloqueada', 'confiar');
        }
        
        if (this.recuerdosRecolectados >= 3 && !this.habilidades.recordar) {
            this.habilidades.recordar = true;
            this.escena.events.emit('habilidadDesbloqueada', 'recordar');
        }
        
        if (this.recuerdosRecolectados >= 4 && !this.habilidades.perdonar) {
            this.habilidades.perdonar = true;
            this.escena.events.emit('habilidadDesbloqueada', 'perdonar');
        }
    }
    
    // ========== ESTADOS EMOCIONALES ==========
    
    cambiarEstadoEmocional(nuevoEstado) {
        this.estadoEmocional = nuevoEstado;
        
        // Ajustar propiedades según estado emocional
        switch(nuevoEstado) {
            case 'feliz':
                this.velocidadCaminar = 180;
                this.fuerzaSalto = 420;
                break;
                
            case 'triste':
                this.velocidadCaminar = 140;
                this.fuerzaSalto = 380;
                break;
                
            case 'confiado':
                this.velocidadCaminar = 170;
                this.fuerzaSaltoConfianza = 650;
                break;
                
            default: // neutral
                this.velocidadCaminar = 160;
                this.fuerzaSalto = 400;
                this.fuerzaSaltoConfianza = 600;
        }
        
        // Emitir evento
        this.escena.events.emit('cambioEmocional', nuevoEstado);
    }
    
    // ========== GETTERS Y SETTERS ==========
    
    getDatosGuardado() {
        return {
            x: this.x,
            y: this.y,
            confianza: this.confianza,
            habilidades: this.habilidades,
            recuerdosRecolectados: this.recuerdosRecolectados,
            enemigosCalmados: this.enemigosCalmados,
            tiempoEscuchando: this.tiempoEscuchando
        };
    }
    
    cargarDatos(datos) {
        if (datos) {
            this.x = datos.x || this.x;
            this.y = datos.y || this.y;
            this.confianza = datos.confianza || this.confianza;
            this.habilidades = datos.habilidades || this.habilidades;
            this.recuerdosRecolectados = datos.recuerdosRecolectados || 0;
            this.enemigosCalmados = datos.enemigosCalmados || 0;
            this.tiempoEscuchando = datos.tiempoEscuchando || 0;
        }
    }
}