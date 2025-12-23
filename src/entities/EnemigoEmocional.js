// EnemigoEmocional.js - VERSIÓN OPTIMIZADA Y PULIDA
export default class EnemigoEmocional extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, tipo) {
        // Determinar qué textura usar (real o placeholder)
        const textureKey = scene.textures.exists(`enemigo_${tipo}`) ? `enemigo_${tipo}` : 'enemigo_placeholder';
        
        super(scene, x, y, textureKey);
        
        this.tipo = tipo;
        this.estado = 'activo';
        this.resuelto = false;
        this.detectandoJugador = false;
        this.radioDeteccion = 200;
        this.ultimaInteraccion = 0;
        this.direccionActual = 1; // 1 = derecha, -1 = izquierda
        this.tiempoSinCambiar = 0;
        this.velocidadActual = 0;
        this.plataformaActual = null;
        this.estaSobrePlataforma = false;
        
        // Configurar propiedades según tipo
        this.configurarPorTipo();
        
        // IMPORTANTE: Añadir a la escena y física
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Configurar cuerpo físico
        if (this.body) {
            this.setCollideWorldBounds(true);
            this.body.setSize(26, 28);
            this.body.setOffset(3, 2);
            this.body.setBounce(0.1);
            this.body.setAllowGravity(true);
            this.body.setDrag(50, 0); // Añadir fricción horizontal
            this.body.setMaxVelocity(this.config.velocidad * 1.5, 600);
        } else {
            console.error('❌ Error: Cuerpo físico no disponible para', this.tipo);
        }
        
        // Iniciar animación
        this.iniciarAnimacion();
        
        // Interacción
        this.setInteractive({ pixelPerfect: false, useHandCursor: true });
        this.on('pointerdown', () => this.interactuar());
        
        // Efectos hover
        this.on('pointerover', () => {
            if (!this.resuelto) {
                this.scene.tweens.add({
                    targets: this,
                    scale: 1.15,
                    duration: 150,
                    ease: 'Back.out'
                });
                // Mostrar indicador de interacción
                this.mostrarIndicadorInteraccion();
            }
        });
        
        this.on('pointerout', () => {
            if (!this.resuelto) {
                this.scene.tweens.add({
                    targets: this,
                    scale: 1,
                    duration: 150
                });
                this.ocultarIndicadorInteraccion();
            }
        });
    }
    
    configurarPorTipo() {
        const configs = {
            miedo: {
                velocidad: 100,
                comportamiento: 'huir',
                dialogo: [
                    "Tengo miedo de perderte...",
                    "¿Y si ya no soy suficiente?",
                    "Me asusta la incertidumbre",
                    "No quiero que te vayas"
                ],
                saludMaxima: 3,
                color: 0x4444ff,
                radioDeteccion: 180,
                descripcion: "Huye del jugador cuando se acerca"
            },
            duda: {
                velocidad: 50,
                comportamiento: 'patrullar',
                dialogo: [
                    "¿Realmente me comprendes?",
                    "No sé si tomé la decisión correcta",
                    "A veces dudo de todo...",
                    "¿Será esto lo que quiero?"
                ],
                saludMaxima: 5,
                color: 0x888888,
                radioDeteccion: 150,
                descripcion: "Patrulla lentamente, perdido en pensamientos"
            },
            celos: {
                velocidad: 140,
                comportamiento: 'perseguir',
                dialogo: [
                    "¿Por qué miras a otrxs?",
                    "Siento que no soy tu prioridad",
                    "Me duele sentirme así",
                    "¿Soy importante para ti?"
                ],
                saludMaxima: 4,
                color: 0xff4444,
                radioDeteccion: 250,
                descripcion: "Persigue agresivamente al jugador"
            },
            silencio: {
                velocidad: 0,
                comportamiento: 'estatico',
                dialogo: [
                    "...",
                    "*silencio*",
                    "No hay palabras..."
                ],
                saludMaxima: 10,
                color: 0x222222,
                radioDeteccion: 100,
                descripcion: "Inmóvil, esperando comunicación"
            }
        };
        
        this.config = configs[this.tipo] || configs.miedo;
        this.salud = this.config.saludMaxima;
        this.radioDeteccion = this.config.radioDeteccion;
        
        // Aplicar tint según tipo
        this.setTint(this.config.color);
    }
    
    mostrarIndicadorInteraccion() {
        if (this.indicadorInteraccion) return;
        
        this.indicadorInteraccion = this.scene.add.text(
            this.x,
            this.y - 40,
            '💬 Click',
            {
                fontSize: '14px',
                color: '#ffffff',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                padding: { x: 8, y: 4 }
            }
        ).setOrigin(0.5).setDepth(150);
        
        // Animación flotante
        this.scene.tweens.add({
            targets: this.indicadorInteraccion,
            y: this.y - 45,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    ocultarIndicadorInteraccion() {
        if (this.indicadorInteraccion) {
            this.scene.tweens.killTweensOf(this.indicadorInteraccion);
            this.indicadorInteraccion.destroy();
            this.indicadorInteraccion = null;
        }
    }
    
    iniciarAnimacion() {
        const animKey = `enemigo_${this.tipo}_latido`;
        
        // Intentar usar animación si existe
        if (this.scene.anims.exists(animKey)) {
            this.play(animKey);
        } else {
            // Animación manual mejorada
            this.setFrame(0);
            
            this.animacionManual = this.scene.time.addEvent({
                delay: 500,
                callback: () => {
                    if (this.active && !this.resuelto) {
                        try {
                            const currentFrame = this.frame.name;
                            const totalFrames = this.texture.frameTotal;
                            
                            if (totalFrames > 1) {
                                this.setFrame(currentFrame === 0 ? 1 : 0);
                            }
                        } catch (e) {
                            this.setFrame(0);
                        }
                    }
                },
                loop: true
            });
        }
        
        // Efecto de respiración sutil
        this.scene.tweens.add({
            targets: this,
            scaleY: { from: 1, to: 1.05 },
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Efecto de brillo
        this.scene.tweens.add({
            targets: this,
            alpha: { from: 0.9, to: 1 },
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    interactuar() {
        if (this.resuelto) return;
        
        const now = this.scene.time.now;
        if (now - this.ultimaInteraccion < 500) return;
        this.ultimaInteraccion = now;
        
        console.log(`💬 Interactuando con ${this.tipo} (${this.salud}/${this.config.saludMaxima} HP)`);
        
        // Reducir salud
        this.salud--;
        
        // Mostrar diálogo aleatorio
        const dialogo = Phaser.Utils.Array.GetRandom(this.config.dialogo);
        this.mostrarDialogo(dialogo);
        
        // Efecto visual de retroceso mejorado
        const direccionRetroceso = this.x > this.scene.jugador.x ? 1 : -1;
        
        this.scene.tweens.add({
            targets: this,
            x: this.x + (direccionRetroceso * 15),
            alpha: 0.5,
            scaleX: 0.85,
            scaleY: 0.85,
            duration: 150,
            yoyo: true,
            ease: 'Back.out'
        });
        
        // Efecto de partículas
        this.crearEfectoImpacto();
        
        // Shake de cámara sutil
        this.scene.cameras.main.shake(100, 0.003);
        
        // Verificar si se calma
        if (this.salud <= 0) {
            this.calmar();
        } else {
            this.mostrarIndicadorSalud();
            
            // Reacción según comportamiento
            this.reaccionarAInteraccion();
        }
    }
    
    reaccionarAInteraccion() {
        switch(this.config.comportamiento) {
            case 'huir':
                // Aumentar velocidad temporalmente por miedo
                this.velocidadActual = this.config.velocidad * 1.5;
                this.scene.time.delayedCall(2000, () => {
                    this.velocidadActual = this.config.velocidad;
                });
                break;
                
            case 'perseguir':
                // Volverse más agresivo
                this.setTint(0xff0000);
                this.scene.time.delayedCall(1000, () => {
                    this.setTint(this.config.color);
                });
                break;
                
            case 'patrullar':
                // Detenerse brevemente, confundido
                this.velocidadActual = 0;
                this.scene.time.delayedCall(800, () => {
                    this.velocidadActual = this.config.velocidad;
                });
                break;
        }
    }
    
    crearEfectoImpacto() {
        // Partículas en círculo
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const particula = this.scene.add.circle(
                this.x,
                this.y,
                Phaser.Math.Between(2, 4),
                this.config.color,
                0.9
            ).setDepth(100);
            
            this.scene.tweens.add({
                targets: particula,
                x: this.x + Math.cos(angle) * 25,
                y: this.y + Math.sin(angle) * 25,
                alpha: 0,
                scale: 0.3,
                duration: 400,
                ease: 'Power2',
                onComplete: () => particula.destroy()
            });
        }
        
        // Texto flotante con daño
        const textoDano = this.scene.add.text(
            this.x,
            this.y - 20,
            '-1',
            {
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5).setDepth(101);
        
        this.scene.tweens.add({
            targets: textoDano,
            y: this.y - 50,
            alpha: 0,
            duration: 800,
            ease: 'Power2',
            onComplete: () => textoDano.destroy()
        });
    }
    
    mostrarDialogo(texto) {
        // Crear burbuja de diálogo más estilizada
        const padding = 12;
        const maxWidth = 220;
        
        // Crear texto temporal para medir
        const tempText = this.scene.add.text(0, 0, texto, {
            fontFamily: 'Arial, sans-serif',
            fontSize: '15px',
            wordWrap: { width: maxWidth - (padding * 2) }
        });
        
        const textWidth = tempText.width + (padding * 2);
        const textHeight = tempText.height + (padding * 2);
        tempText.destroy();
        
        // Fondo de la burbuja
        const fondoBurbuja = this.scene.add.graphics();
        fondoBurbuja.fillStyle(0x000000, 0.85);
        fondoBurbuja.fillRoundedRect(
            this.x - textWidth / 2,
            this.y - 60 - textHeight,
            textWidth,
            textHeight,
            8
        );
        fondoBurbuja.lineStyle(2, this.config.color, 1);
        fondoBurbuja.strokeRoundedRect(
            this.x - textWidth / 2,
            this.y - 60 - textHeight,
            textWidth,
            textHeight,
            8
        );
        fondoBurbuja.setDepth(99);
        
        // Pico de la burbuja
        fondoBurbuja.fillStyle(0x000000, 0.85);
        fondoBurbuja.fillTriangle(
            this.x - 8, this.y - 60,
            this.x + 8, this.y - 60,
            this.x, this.y - 50
        );
        fondoBurbuja.lineStyle(2, this.config.color, 1);
        fondoBurbuja.strokeTriangle(
            this.x - 8, this.y - 60,
            this.x + 8, this.y - 60,
            this.x, this.y - 50
        );
        
        // Texto del diálogo
        const textoDialogo = this.scene.add.text(
            this.x,
            this.y - 60 - textHeight / 2,
            texto,
            {
                fontFamily: 'Arial, sans-serif',
                fontSize: '15px',
                color: '#ffffff',
                align: 'center',
                wordWrap: { width: maxWidth - (padding * 2) }
            }
        ).setOrigin(0.5).setDepth(100);
        
        // Animación de entrada
        fondoBurbuja.setAlpha(0);
        textoDialogo.setAlpha(0);
        
        this.scene.tweens.add({
            targets: [fondoBurbuja, textoDialogo],
            alpha: 1,
            y: '-=10',
            duration: 300,
            ease: 'Back.out'
        });
        
        // Animación de salida
        this.scene.time.delayedCall(2500, () => {
            this.scene.tweens.add({
                targets: [fondoBurbuja, textoDialogo],
                alpha: 0,
                y: '-=20',
                duration: 500,
                ease: 'Power2',
                onComplete: () => {
                    fondoBurbuja.destroy();
                    textoDialogo.destroy();
                }
            });
        });
    }
    
    mostrarIndicadorSalud() {
        const porcentaje = this.salud / this.config.saludMaxima;
        const anchoTotal = 50;
        const anchoRelleno = porcentaje * anchoTotal;
        
        // Contenedor de la barra
        const contenedor = this.scene.add.container(this.x, this.y - 35);
        contenedor.setDepth(98);
        
        // Fondo de la barra
        const fondo = this.scene.add.rectangle(0, 0, anchoTotal + 4, 8, 0x000000, 0.7);
        
        // Barra de fondo gris
        const barraBG = this.scene.add.rectangle(0, 0, anchoTotal, 6, 0x333333);
        
        // Relleno de salud con color según porcentaje
        let colorRelleno;
        if (porcentaje > 0.6) colorRelleno = 0x2ecc71;
        else if (porcentaje > 0.3) colorRelleno = 0xf39c12;
        else colorRelleno = 0xe74c3c;
        
        const relleno = this.scene.add.rectangle(
            -(anchoTotal / 2) + (anchoRelleno / 2),
            0,
            anchoRelleno,
            6,
            colorRelleno
        );
        
        // Texto con corazones
        const corazones = '❤️'.repeat(this.salud) + '🖤'.repeat(this.config.saludMaxima - this.salud);
        const textoSalud = this.scene.add.text(
            0,
            -15,
            corazones,
            {
                fontSize: '12px'
            }
        ).setOrigin(0.5);
        
        contenedor.add([fondo, barraBG, relleno, textoSalud]);
        
        // Animación del contenedor
        contenedor.setAlpha(0);
        contenedor.setScale(0.8);
        
        this.scene.tweens.add({
            targets: contenedor,
            alpha: 1,
            scale: 1,
            duration: 200,
            ease: 'Back.out'
        });
        
        // Desvanecimiento
        this.scene.time.delayedCall(2000, () => {
            this.scene.tweens.add({
                targets: contenedor,
                alpha: 0,
                y: '-=15',
                duration: 500,
                onComplete: () => contenedor.destroy()
            });
        });
    }
    
    calmar() {
        if (this.resuelto) return;
        
        console.log(`✨ ${this.tipo} se ha calmado y transformado`);
        
        this.resuelto = true;
        this.estado = 'calmado';
        
        // Ocultar indicador de interacción
        this.ocultarIndicadorInteraccion();
        
        // Detener animación manual si existe
        if (this.animacionManual) {
            this.animacionManual.remove();
        }
        
        // Detener animación
        if (this.anims) {
            this.anims.stop();
        }
        
        // Detener todos los tweens
        this.scene.tweens.killTweensOf(this);
        
        // Cambiar apariencia
        this.setFrame(0);
        this.clearTint();
        this.setVelocity(0, 0);
        
        // Efecto de calma espectacular
        this.crearEfectoCalma();
        
        // Mensaje de transformación
        this.mostrarMensajeTransformacion();
        
        // Emitir evento
        this.scene.events.emit('enemigoCalmado', {
            tipo: this.tipo,
            x: this.x,
            y: this.y
        });
        
        // Transformar con delay
        this.scene.time.delayedCall(1500, () => {
            this.transformarEnUtilidad();
        });
    }
    
    mostrarMensajeTransformacion() {
        const mensajes = {
            miedo: "El miedo se transforma\nen seguridad 🛡️",
            duda: "La duda se transforma\nen conexión 🌉",
            celos: "Los celos se transforman\nen impulso 🚀",
            silencio: "El silencio crea\nespacio de paz 🕊️"
        };
        
        const mensaje = this.scene.add.text(
            this.x,
            this.y - 80,
            mensajes[this.tipo],
            {
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#ffffff',
                align: 'center',
                stroke: this.config.color,
                strokeThickness: 4,
                shadow: {
                    offsetX: 2,
                    offsetY: 2,
                    color: '#000000',
                    blur: 4,
                    fill: true
                }
            }
        ).setOrigin(0.5).setDepth(200).setAlpha(0);
        
        this.scene.tweens.add({
            targets: mensaje,
            alpha: 1,
            y: this.y - 100,
            scale: { from: 0.5, to: 1.2 },
            duration: 800,
            ease: 'Back.out',
            onComplete: () => {
                this.scene.time.delayedCall(1500, () => {
                    this.scene.tweens.add({
                        targets: mensaje,
                        alpha: 0,
                        y: mensaje.y - 30,
                        duration: 600,
                        onComplete: () => mensaje.destroy()
                    });
                });
            }
        });
    }
    
    crearEfectoCalma() {
        // Ondas expansivas múltiples
        for (let i = 0; i < 4; i++) {
            const onda = this.scene.add.circle(
                this.x,
                this.y,
                5,
                this.config.color,
                0.6
            ).setDepth(50);
            
            this.scene.tweens.add({
                targets: onda,
                radius: 80,
                alpha: 0,
                duration: 1200,
                delay: i * 250,
                ease: 'Power2',
                onComplete: () => onda.destroy()
            });
        }
        
        // Explosión de partículas en espiral
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            const particula = this.scene.add.circle(
                this.x,
                this.y,
                Phaser.Math.Between(3, 6),
                i % 2 === 0 ? this.config.color : 0xffffff,
                0.9
            ).setDepth(51);
            
            const distancia = Phaser.Math.Between(40, 80);
            
            this.scene.tweens.add({
                targets: particula,
                x: this.x + Math.cos(angle) * distancia,
                y: this.y + Math.sin(angle) * distancia - 30,
                alpha: 0,
                scale: 0,
                duration: 1000,
                delay: i * 30,
                ease: 'Power2',
                onComplete: () => particula.destroy()
            });
        }
        
        // Destello brillante
        const destello = this.scene.add.circle(this.x, this.y, 10, 0xffffff, 1).setDepth(52);
        this.scene.tweens.add({
            targets: destello,
            radius: 50,
            alpha: 0,
            duration: 600,
            ease: 'Power3',
            onComplete: () => destello.destroy()
        });
        
        // Animación del enemigo desvaneciéndose
        this.scene.tweens.add({
            targets: this,
            alpha: 0.3,
            scale: 0.7,
            duration: 1500,
            ease: 'Power2'
        });
    }
    
    transformarEnUtilidad() {
        const transformaciones = {
            miedo: { color: 0x4444ff, efecto: 'crearPlataforma' },
            duda: { color: 0x888888, efecto: 'crearPuente' },
            celos: { color: 0xff4444, efecto: 'crearImpulso' },
            silencio: { color: 0x222222, efecto: 'crearZonaSilencio' }
        };
        
        const transformacion = transformaciones[this.tipo];
        
        // Efecto de transformación
        this.crearEfectoTransformacion(transformacion.color);
        
        // Llamar a la función de transformación en la escena
        if (this.scene[transformacion.efecto]) {
            this.scene[transformacion.efecto](this.x, this.y);
        }
        
        // Destruir después de la transformación
        this.scene.time.delayedCall(1000, () => {
            this.destroy();
        });
    }
    
    crearEfectoTransformacion(color) {
        // Explosión de transformación
        for (let i = 0; i < 25; i++) {
            const particula = this.scene.add.circle(
                this.x,
                this.y,
                Phaser.Math.Between(3, 8),
                color,
                1
            ).setDepth(52);
            
            const angle = (i / 25) * Math.PI * 2;
            const distancia = Phaser.Math.Between(60, 120);
            
            this.scene.tweens.add({
                targets: particula,
                x: this.x + Math.cos(angle) * distancia,
                y: this.y + Math.sin(angle) * distancia,
                scale: 0,
                alpha: 0,
                duration: Phaser.Math.Between(700, 1200),
                ease: 'Power2',
                onComplete: () => particula.destroy()
            });
        }
        
        // Múltiples destellos
        for (let i = 0; i < 3; i++) {
            const destello = this.scene.add.circle(
                this.x, this.y, 5, 0xffffff, 1
            ).setDepth(53);
            
            this.scene.tweens.add({
                targets: destello,
                radius: 60,
                alpha: 0,
                duration: 600,
                delay: i * 200,
                ease: 'Power3',
                onComplete: () => destello.destroy()
            });
        }
    }
    
    update() {
        if (!this.active || this.resuelto) return;
        
        // Actualizar indicador de interacción si existe
        if (this.indicadorInteraccion) {
            this.indicadorInteraccion.x = this.x;
        }
        
        // Verificar si está sobre una plataforma
        this.estaSobrePlataforma = this.body.onFloor() || this.body.touching.down;
        
        this.detectarJugador();
        this.moverSegunComportamiento();
        this.verificarBordesPlataforma();
    }
    
    detectarJugador() {
        const jugador = this.scene.jugador;
        if (!jugador || !jugador.active) return;
        
        const distancia = Phaser.Math.Distance.Between(
            this.x, this.y, jugador.x, jugador.y
        );
        
        const detectandoAntes = this.detectandoJugador;
        this.detectandoJugador = distancia < this.radioDeteccion;
        
        // Cambiar visual cuando detecta
        if (this.detectandoJugador !== detectandoAntes && !this.resuelto) {
            this.scene.tweens.add({
                targets: this,
                alpha: this.detectandoJugador ? 1 : 0.85,
                scale: this.detectandoJugador ? 1.05 : 1,
                duration: 300,
                ease: 'Power2'
            });
        }
    }
    
    verificarBordesPlataforma() {
        // Solo aplicar para enemigos que patrullan
        if (this.config.comportamiento !== 'patrullar' || !this.estaSobrePlataforma) return;
        
        // Detectar si está cerca del borde
        const margen = 20;
        const siguienteX = this.x + (this.direccionActual * margen);
        
        // Usar raycast simple para detectar si hay suelo adelante
        const hayBordeAdelante = !this.scene.physics.world.bounds.contains(siguienteX, this.y + 20);
        
        if (hayBordeAdelante || this.x <= margen || this.x >= 1280 - margen) {
            this.cambiarDireccion();
        }
    }
    
    moverSegunComportamiento() {
        const jugador = this.scene.jugador;
        if (!jugador || !jugador.active) return;
        
        switch(this.config.comportamiento) {
            case 'huir':
                this.huirDeJugador(jugador);
                break;
                
            case 'perseguir':
                this.perseguirJugador(jugador);
                break;
                
            case 'patrullar':
                this.patrullar();
                break;
                
            case 'estatico':
                this.setVelocityX(0);
                break;
        }
    }
    
    huirDeJugador(jugador) {
        if (!this.detectandoJugador || !this.estaSobrePlataforma) {
            this.setVelocityX(this.body.velocity.x * 0.9); // Desacelerar gradualmente
            return;
        }
        
        const dx = this.x - jugador.x;
        const distancia = Math.abs(dx);
        
        if (distancia < this.radioDeteccion && distancia > 30) {
            const direccion = dx > 0 ? 1 : -1;
            const velocidadFinal = this.velocidadActual || this.config.velocidad;
            
            this.setVelocityX(direccion * velocidadFinal);
            this.flipX = direccion < 0;
        } else {
            this.setVelocityX(this.body.velocity.x * 0.85);
        }
    }
    
    perseguirJugador(jugador) {
        if (!this.detectandoJugador || !this.estaSobrePlataforma) {
            this.setVelocityX(this.body.velocity.x * 0.9);
            return;
        }
        
        const dx = jugador.x - this.x;
        const distancia = Math.abs(dx);
        
        if (distancia < this.radioDeteccion && distancia > 40) {
            const direccion = dx > 0 ? 1 : -1;
            this.setVelocityX(direccion * this.config.velocidad);
            this.flipX = direccion > 0;
        } else if (distancia <= 40) {
            // Muy cerca, ralentizar
            this.setVelocityX(this.body.velocity.x * 0.5);
        } else {
            this.setVelocityX(this.body.velocity.x * 0.9);
        }
    }
    
    patrullar() {
        if (!this.estaSobrePlataforma) return;
        
        this.tiempoSinCambiar += 16; // ~1 frame a 60fps
        
        // Cambiar dirección cada 3-5 segundos
        if (this.tiempoSinCambiar > Phaser.Math.Between(3000, 5000)) {
            this.cambiarDireccion();
            this.tiempoSinCambiar = 0;
        }
        
        // Movimiento constante
        this.setVelocityX(this.direccionActual * this.config.velocidad);
        this.flipX = this.direccionActual > 0;
    }
    
    cambiarDireccion() {
        this.direccionActual *= -1;
        this.tiempoSinCambiar = 0;
    }
    
    getDatos() {
        return {
            tipo: this.tipo,
            x: this.x,
            y: this.y,
            resuelto: this.resuelto,
            salud: this.salud,
            comportamiento: this.config.comportamiento
        };
    }
    
    destroy() {
        // Limpiar tweens
        this.scene.tweens.killTweensOf(this);
        
        // Limpiar indicador
        this.ocultarIndicadorInteraccion();
        
        // Limpiar timer de animación manual
        if (this.animacionManual) {
            this.animacionManual.remove();
        }
        
        // Remover listeners
        this.removeAllListeners();
        
        // Destruir sprite
        super.destroy();
    }
}