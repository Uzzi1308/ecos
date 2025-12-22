import EnemigoEmocional from '../entities/EnemigoEmocional.js'; // Añade esta línea al inicio

export class Inicio extends Phaser.Scene {
    constructor() {
        super({ key: 'Inicio' });
    }

    create() {
        console.log('🎮 Escena Inicio cargada - Modo Placeholder');

        this.crearFondoConImagen();

        // 1. Crear mundo básico
        this.crearMundoBasico();

        // 2. Crear jugador
        this.crearJugador();

        // 3. Configurar controles
        this.configurarControles();

        // 4. Configurar cámara
        this.configurarCamara();

        // 5. Crear UI básica
        this.crearUIBasica();

        // 6. Mostrar instrucciones
        this.mostrarInstrucciones();

        // 7. Escuchar eventos de enemigos
        this.configurarEventos();

        console.log('✅ Escena lista para jugar');

        // estas 2 lineas son para ver hitbox
        this.physics.world.createDebugGraphic();
        this.physics.world.drawDebug = true;
    }

    crearFondoConImagen() {
        console.log('🖼️ Creando fondo...');
        
        // Verificar si la textura existe
        if (this.textures.exists('mi_fondo')) {
            console.log('✅ Usando imagen de fondo real');
            
            // Crear fondo con tu imagen
            this.fondo = this.add.image(640, 360, 'mi_fondo');
            
            // Ajustar al tamaño de la pantalla
            this.fondo.setDisplaySize(1280, 720);
            this.fondo.setDepth(-100); // Muy al fondo
            
            // Opcional: si quieres que el fondo se mueva con la cámara (parallax)
            this.fondo.setScrollFactor(0.1); // Se mueve muy lentamente
            
        } else {
            console.log('⚠️ Usando fondo placeholder');
            
            // Fondo de emergencia (igual que antes)
            const graphics = this.add.graphics();
            graphics.fillGradientStyle(
                0x1a1a2e, 0x1a1a2e, // Color superior
                0x16213e, 0x16213e, // Color inferior
                1, 1, 1, 1
            );
            graphics.fillRect(0, 0, 1280, 720);
            
            // Estrellas de fondo (placeholder)
            for (let i = 0; i < 60; i++) {
                const x = Phaser.Math.Between(0, 1280);
                const y = Phaser.Math.Between(0, 720);
                const size = Phaser.Math.FloatBetween(0.5, 2);
                const alpha = Phaser.Math.FloatBetween(0.1, 0.4);
                
                const star = this.add.circle(x, y, size, 0xffffff, alpha);
                star.setDepth(-99);
                
                this.tweens.add({
                    targets: star,
                    alpha: { from: alpha, to: alpha * 0.5 },
                    duration: Phaser.Math.Between(2000, 4000),
                    yoyo: true,
                    repeat: -1,
                    delay: Phaser.Math.Between(0, 3000)
                });
            }
        }
    }

    crearMundoBasico() {
        const getKey = (base) => {
            const real = `${base}_real`;
            return this.textures.exists(real) ? real : base;
        };

        // Suelo principal
        this.suelo = this.physics.add.staticSprite(640, 700, getKey('plataforma_basica'));
        this.suelo.displayWidth = 1280;
        this.suelo.displayHeight = 40;
        this.suelo.refreshBody();
        this.suelo.body.setSize(1280, 40);

        // Plataformas flotantes
        const plataformas = [
            { x: 300, y: 550, type: getKey('plataforma_basica'), width: 200, fragil: false },
            { x: 600, y: 450, type: getKey('plataforma_movil'), width: 180, fragil: false },
            { x: 900, y: 350, type: getKey('plataforma_fragil'), width: 160, fragil: true },
            { x: 1100, y: 500, type: getKey('plataforma_basica'), width: 150, fragil: false }
        ];

        this.plataformasGrupo = this.physics.add.group({
            immovable: true,
            allowGravity: false
        });

        plataformas.forEach(p => {
            const plat = this.physics.add.sprite(p.x, p.y, p.type);
            plat.displayWidth = p.width;
            plat.displayHeight = 20;

            // CONFIGURAR CUERPO FÍSICO
            plat.body.setImmovable(true);
            plat.body.setAllowGravity(false);

            // ✅ AÑADIR PROPIEDAD FRÁGIL
            plat.esFragil = p.fragil || false;
            plat.contador = null;
            plat.textoContador = null;
            plat.timerDestruccion = null; // ✅ Añadido para el timer

            // AÑADIR AL GRUPO
            this.plataformasGrupo.add(plat);

            // Animación para plataforma móvil
            if (p.type === 'plataforma_movil') {
                this.tweens.add({
                    targets: plat,
                    y: p.y - 50,
                    duration: 2000,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut',
                    onUpdate: () => {
                        plat.body.updateFromGameObject();
                    }
                });
            }

            // Animación para plataforma frágil (parpadeo sutil)
            if (p.type === 'plataforma_fragil') {
                this.tweens.add({
                    targets: plat,
                    alpha: 0.8,
                    duration: 800,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }
        });

        // Crear algunos recuerdos para recolectar
        this.recuerdosGrupo = this.physics.add.staticGroup();
        const posicionesRecuerdos = [
            { x: 350, y: 500 },
            { x: 650, y: 400 },
            { x: 950, y: 300 },
            { x: 1150, y: 450 }
        ];

        posicionesRecuerdos.forEach(pos => {
            const recuerdo = this.add.sprite(pos.x, pos.y, getKey('recuerdo'));
            this.physics.add.existing(recuerdo, true);
            this.recuerdosGrupo.add(recuerdo);
        });

        // ✅ MODIFICADO: Crear enemigos emocionales usando la nueva clase
        this.enemigosGrupo = this.physics.add.group();
        const emociones = [
            { x: 500, y: 620, tipo: 'miedo' },
            { x: 800, y: 620, tipo: 'duda' },
            { x: 1200, y: 620, tipo: 'celos' },
            { x: 400, y: 400, tipo: 'silencio' }
        ];

        emociones.forEach(e => {
            const enemigo = new EnemigoEmocional(this, e.x, e.y, e.tipo);
            this.enemigosGrupo.add(enemigo);
        });
    }

    crearJugador() {
    // Verificar si existe la textura real
    const textureKey = this.textures.exists('protagonista_real') ? 'protagonista_real' : 'protagonista';
    console.log('👤 Usando textura:', textureKey);
    
    // Crear sprite CON FÍSICA desde el inicio
    this.jugador = this.physics.add.sprite(200, 500, textureKey);
    
    // Asegurarse de usar el frame 0 inicialmente
    this.jugador.setFrame(0);
    
    // Intentar reproducir animación
    if (this.anims.exists('quieto')) {
        this.jugador.play('quieto');
    } else {
        console.warn('⚠️ Animación "quieto" no encontrada');
    }

    // Configurar cuerpo de física
    this.jugador.body.setSize(28, 42);
    this.jugador.body.setOffset(2, 6);
    this.jugador.body.setCollideWorldBounds(true);
    this.jugador.body.setGravityY(300);

    // ✅ COLISIÓN CON PLATAFORMAS (CON DETECCIÓN DE FRÁGILES)
    this.physics.add.collider(
        this.jugador, 
        this.plataformasGrupo,
        (jugador, plataforma) => {
            // Detectar si es plataforma frágil y el jugador está encima
            if (plataforma.esFragil && 
                jugador.body.touching.down && 
                plataforma.body.touching.up) {
                this.activarPlataformaFragil(plataforma);
            }
        }
    );

    // Colisión con suelo
    this.physics.add.collider(this.jugador, this.suelo);

    // ✅ MODIFICADO: Colisión con enemigos (solo daño si no está resuelto)
    this.physics.add.collider(this.jugador, this.enemigosGrupo, (jugador, enemigo) => {
        if (enemigo && !enemigo.resuelto) {
            this.recibirDano();
        }
    });

    // Overlap con recuerdos (recolección)
    this.physics.add.overlap(this.jugador, this.recuerdosGrupo, (jugador, recuerdo) => {
        this.recolectarRecuerdo(recuerdo);
    });

    // ✅ Inicializar flag de invulnerabilidad
    this.invulnerable = false;
}

    configurarControles() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.teclaE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        this.teclaR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        console.log('🎮 Controles configurados: Flechas + ESPACIO');
    }

    configurarCamara() {
        this.cameras.main.startFollow(this.jugador, true, 0.08, 0.08);
        this.cameras.main.setBounds(0, 0, 1280, 720);
        this.physics.world.setBounds(0, 0, 1280, 720);
    }

    configurarEventos() {
        // Escuchar cuando un enemigo se calma
        this.events.on('enemigoCalmado', (data) => {
            console.log(`🎭 Enemigo ${data.tipo} calmado en (${data.x}, ${data.y})`);
            
            // Mostrar mensaje
            const mensajes = {
                miedo: "El miedo se transforma en seguridad",
                duda: "La duda se transforma en conexión",
                celos: "Los celos se transforman en impulso",
                silencio: "El silencio crea espacio para la calma"
            };
            
            this.mostrarMensajeHabilidad(mensajes[data.tipo]);
            
            // Aumentar recuerdos o puntos
            this.recuerdosRecolectados += 2;
            this.textoRecuerdos.setText(`Recuerdos: ${this.recuerdosRecolectados}`);
        });
    }

    crearUIBasica() {
        this.recuerdosRecolectados = 0;
        this.textoRecuerdos = this.add.text(20, 20, 'Recuerdos: 0', {
            fontSize: '24px',
            color: '#f1c40f',
            stroke: '#000000',
            strokeThickness: 4
        }).setScrollFactor(0);

        this.vida = 100;
        this.barraVida = this.add.rectangle(150, 35, 100, 15, 0x2ecc71);
        this.barraVida.setScrollFactor(0);

        const botonMenu = this.add.text(1200, 20, 'Menú', {
            fontSize: '20px',
            color: '#ffffff',
            backgroundColor: '#e74c3c',
            padding: { x: 15, y: 8 }
        }).setScrollFactor(0).setInteractive();

        botonMenu.on('pointerdown', () => {
            this.scene.start('Menu');
        });
    }

    mostrarInstrucciones() {
        const instrucciones = this.add.text(20, 60, 
            'Controles:\n← → Moverse\n↑ Saltar\nE Escuchar\nR Recordar\nClic en enemigos para calmarlos',
            {
                fontSize: '16px',
                color: '#ffffff',
                backgroundColor: 'rgba(0,0,0,0.5)',
                padding: { x: 10, y: 5 }
            }
        ).setScrollFactor(0);

        this.time.delayedCall(10000, () => {
            this.tweens.add({
                targets: instrucciones,
                alpha: 0,
                duration: 1000,
                onComplete: () => instrucciones.destroy()
            });
        });
    }

    // ========== MÉTODO NUEVO PARA ACTIVAR PLATAFORMAS FRÁGILES ==========
    activarPlataformaFragil(plat) {
        // Solo activar si no tiene contador activo
        if (!plat.contador) {
            console.log('🔴 Activando plataforma frágil en:', plat.x, plat.y);
            
            plat.contador = 180; // 3 segundos a 60 FPS
            plat.setTint(0xff6666);
            this.mostrarContadorPlataforma(plat);
            
            // Crear timer que reduce el contador
            plat.timerDestruccion = this.time.addEvent({
                delay: 16, // ~60 FPS
                callback: () => {
                    plat.contador--;
                    
                    // Efecto de parpadeo más intenso cerca del final
                    if (plat.contador < 60) {
                        plat.alpha = (plat.contador % 10 < 5) ? 0.4 : 1;
                    }
                    
                    // Actualizar texto del contador
                    if (plat.textoContador) {
                        const segundos = Math.ceil(plat.contador / 60);
                        plat.textoContador.setText(segundos.toString());
                    }
                    
                    // Destruir cuando llegue a 0
                    if (plat.contador <= 0) {
                        console.log('💥 Destruyendo plataforma!');
                        plat.timerDestruccion.remove();
                        this.destruirPlataformaSimple(plat);
                    }
                },
                loop: true
            });
        }
    }

    resetearPlataformaFragil(plat) {
        if (plat.contador) {
            plat.contador = null;
            plat.clearTint();
            plat.alpha = 1;
            
            if (plat.timerDestruccion) {
                plat.timerDestruccion.remove();
                plat.timerDestruccion = null;
            }
            
            if (plat.textoContador) {
                plat.textoContador.destroy();
                plat.textoContador = null;
            }
        }
    }

    mostrarContadorPlataforma(plat) {
        plat.textoContador = this.add.text(
            plat.x,
            plat.y - 35,
            '3',
            {
                fontSize: '24px',
                fontStyle: 'bold',
                color: '#ff0000',
                stroke: '#000',
                strokeThickness: 4
            }
        ).setOrigin(0.5);
    }

    destruirPlataformaSimple(plat) {
        if (!plat || !plat.body) return;

        console.log('💥 Destruyendo plataforma frágil en:', plat.x, plat.y);

        // Efecto visual de destrucción con círculos simples
        for (let i = 0; i < 15; i++) {
            const angulo = Phaser.Math.Between(0, 360);
            const velocidad = Phaser.Math.Between(50, 150);
            const velocidadX = Math.cos(angulo * Math.PI / 180) * velocidad;
            const velocidadY = Math.sin(angulo * Math.PI / 180) * velocidad;

            const particula = this.add.circle(
                plat.x + Phaser.Math.Between(-10, 10),
                plat.y + Phaser.Math.Between(-5, 5),
                Phaser.Math.Between(3, 6),
                0xff6666
            );

            this.tweens.add({
                targets: particula,
                x: particula.x + velocidadX,
                y: particula.y + velocidadY,
                alpha: 0,
                scale: 0,
                duration: 800,
                ease: 'Power2',
                onComplete: () => particula.destroy()
            });
        }

        // Sonido o feedback
        this.cameras.main.shake(200, 0.01);

        // Mensaje visual
        const textoExplosion = this.add.text(
            plat.x,
            plat.y,
            '💥',
            {
                fontSize: '32px'
            }
        ).setOrigin(0.5);

        this.tweens.add({
            targets: textoExplosion,
            scale: 2,
            alpha: 0,
            duration: 600,
            onComplete: () => textoExplosion.destroy()
        });

        // Eliminar texto del contador
        if (plat.textoContador) {
            plat.textoContador.destroy();
        }

        // Destruir la plataforma
        plat.destroy();
    }

    recibirDano() {
        if (this.invulnerable) return;

        this.vida -= 10;
        if (this.vida < 0) this.vida = 0;

        this.barraVida.width = this.vida;
        this.barraVida.fillColor = this.vida > 50 ? 0x2ecc71 : this.vida > 25 ? 0xf39c12 : 0xe74c3c;

        this.jugador.setTint(0xff0000);

        if (this.jugador.body.velocity.x >= 0) {
            this.jugador.body.setVelocityX(-200);
        } else {
            this.jugador.body.setVelocityX(200);
        }
        this.jugador.body.setVelocityY(-150);

        this.time.delayedCall(300, () => {
            this.jugador.clearTint();
        });

        this.invulnerable = true;
        this.time.delayedCall(1000, () => {
            this.invulnerable = false;
        });

        if (this.vida <= 0) {
            this.gameOver();
        }
    }

    recolectarRecuerdo(recuerdo) {
        if (recuerdo.recolectar && typeof recuerdo.recolectar === 'function') {
            recuerdo.recolectar(this.jugador);
            this.recuerdosRecolectados++;
            this.textoRecuerdos.setText(`Recuerdos: ${this.recuerdosRecolectados}`);
            this.mostrarFeedbackRecuerdo();
        } else {
            this.recuerdosRecolectados++;
            this.textoRecuerdos.setText(`Recuerdos: ${this.recuerdosRecolectados}`);
            this.mostrarFeedbackRecuerdo();

            const efecto = this.add.circle(recuerdo.x, recuerdo.y, 20, 0xF1C40F, 0.6);
            this.tweens.add({
                targets: efecto,
                scale: 3,
                alpha: 0,
                duration: 500,
                onComplete: () => efecto.destroy()
            });

            recuerdo.destroy();
        }
    }

    mostrarFeedbackRecuerdo() {
        const feedback = this.add.text(
            this.jugador.x,
            this.jugador.y - 50,
            '+1 ',
            {
                fontSize: '18px',
                fontStyle: 'bold',
                color: '#F1C40F',
                stroke: '#000',
                strokeThickness: 4
            }
        ).setOrigin(0.5);

        this.tweens.add({
            targets: feedback,
            y: feedback.y - 60,
            alpha: 0,
            duration: 1200,
            ease: 'Power2',
            onComplete: () => feedback.destroy()
        });
    }

    gameOver() {
        console.log('💀 Game Over');

        this.jugador.body.setVelocity(0, 0);
        this.input.keyboard.enabled = false;

        const gameOverText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            'GAME OVER\n\nRecuerdos recolectados: ' + this.recuerdosRecolectados + '\n\nHaz clic para volver al menú',
            {
                fontSize: '32px',
                color: '#e74c3c',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 6
            }
        ).setOrigin(0.5).setScrollFactor(0);

        gameOverText.setInteractive();
        gameOverText.on('pointerdown', () => {
            this.scene.start('Menu');
        });
    }

    update() {
        // Verificar si el juego terminó
        if (this.vida <= 0) return;

        // MOVIMIENTO HORIZONTAL
        if (this.cursors.left.isDown) {
            this.jugador.body.setVelocityX(-200);
            this.jugador.play('caminar', true);
            this.jugador.flipX = true;
        } else if (this.cursors.right.isDown) {
            this.jugador.body.setVelocityX(200);
            this.jugador.play('caminar', true);
            this.jugador.flipX = false;
        } else {
            this.jugador.body.setVelocityX(0);
            if (this.jugador.body.onFloor()) {
                this.jugador.play('quieto', true);
            }
        }

        // SALTO
        if (this.spaceBar.isDown && this.jugador.body.onFloor()) {
            this.jugador.body.setVelocityY(-400);
            this.jugador.play('saltar', true);
        }

        // HABILIDADES
        if (Phaser.Input.Keyboard.JustDown(this.teclaE)) {
            this.usarHabilidadEscuchar();
        }

        if (Phaser.Input.Keyboard.JustDown(this.teclaR)) {
            this.usarHabilidadRecordar();
        }

        // Verificar caída al vacío
        if (this.jugador.y > 750) {
            this.respawn();
        }

        // Verificar si llegó al final del nivel
        if (this.jugador.x > 1250) {
            this.completarNivel();
        }

        this.plataformasGrupo.children.iterate(plat => {
            if (plat && plat.esFragil && plat.contador) {
                // Verificar si el jugador ya no está encima
                const jugadorEnPlataforma = 
                    this.jugador.body.bottom <= plat.body.top + 5 &&
                    this.jugador.body.bottom >= plat.body.top &&
                    Math.abs(this.jugador.x - plat.x) < plat.displayWidth / 2;
                
                if (!jugadorEnPlataforma && plat.contador > 0) {
                    this.resetearPlataformaFragil(plat);
                    console.log('🔄 Jugador salió de la plataforma frágil');
                }
            }
            return true;
        });

        // ✅ ACTUALIZAR ENEMIGOS EMOCIONALES
        if (this.enemigosGrupo) {
            this.enemigosGrupo.children.iterate(enemigo => {
                if (enemigo && enemigo.update && !enemigo.resuelto) {
                    enemigo.update();
                }
                return true;
            });
        }
    }

    usarHabilidadEscuchar() {
        console.log('👂 Habilidad: Escuchar');

        const onda = this.add.circle(this.jugador.x, this.jugador.y, 10, 0x3498db, 0.5);
        this.tweens.add({
            targets: onda,
            radius: 100,
            alpha: 0,
            duration: 800,
            onComplete: () => onda.destroy()
        });

        this.mostrarMensajeHabilidad('Escuchando emociones...');
    }

    usarHabilidadRecordar() {
        console.log('💭 Habilidad: Recordar');

        for (let i = 0; i < 3; i++) {
            const memoria = this.add.circle(
                this.jugador.x + Phaser.Math.Between(-30, 30),
                this.jugador.y + Phaser.Math.Between(-30, 30),
                5,
                0xf1c40f
            );

            this.tweens.add({
                targets: memoria,
                y: memoria.y - 50,
                alpha: 0,
                duration: 1000,
                onComplete: () => memoria.destroy()
            });
        }

        this.mostrarMensajeHabilidad('Recordando momentos...');
    }

    mostrarMensajeHabilidad(texto) {
        const mensaje = this.add.text(
            this.jugador.x,
            this.jugador.y - 60,
            texto,
            {
                fontSize: '16px',
                color: '#ffffff',
                backgroundColor: 'rgba(0,0,0,0.7)',
                padding: { x: 10, y: 5 }
            }
        ).setOrigin(0.5);

        this.tweens.add({
            targets: mensaje,
            y: mensaje.y - 20,
            alpha: 0,
            duration: 1500,
            onComplete: () => mensaje.destroy()
        });
    }

    respawn() {
        this.jugador.x = 200;
        this.jugador.y = 500;
        this.jugador.body.setVelocity(0, 0);

        this.vida = Math.max(0, this.vida - 20);
        this.barraVida.width = this.vida;
        this.barraVida.fillColor = this.vida > 50 ? 0x2ecc71 : this.vida > 25 ? 0xf39c12 : 0xe74c3c;

        this.cameras.main.flash(300, 255, 255, 255);

        if (this.vida <= 0) {
            this.gameOver();
        }
    }

    completarNivel() {
        console.log('✅ Nivel completado!');

        this.input.keyboard.enabled = false;

        const victoriaText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            '¡NIVEL COMPLETADO!\n\nRecuerdos: ' + this.recuerdosRecolectados + '\n\nHaz clic para continuar',
            {
                fontSize: '36px',
                color: '#2ecc71',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 6
            }
        ).setOrigin(0.5).setScrollFactor(0);

        for (let i = 0; i < 20; i++) {
            const confeti = this.add.rectangle(
                Phaser.Math.Between(0, 1280),
                Phaser.Math.Between(0, 200),
                10,
                10,
                Phaser.Math.Between(0, 0xffffff)
            );

            this.tweens.add({
                targets: confeti,
                y: 720,
                rotation: Phaser.Math.Between(0, 360),
                duration: Phaser.Math.Between(1000, 3000),
                onComplete: () => confeti.destroy()
            });
        }

        victoriaText.setInteractive();
        victoriaText.on('pointerdown', () => {
            this.registry.set('recuerdos_totales', this.recuerdosRecolectados);
            this.scene.start('Menu');
        });
    }

    // ========== MÉTODOS DE TRANSFORMACIÓN PARA ENEMIGOS ==========
    
    crearPlataforma(x, y) {
        const plataforma = this.physics.add.staticSprite(x, y + 40, 'plataforma_basica');
        plataforma.displayWidth = 100;
        plataforma.displayHeight = 20;
        plataforma.setTint(0x4444ff); // Azul para miedo
        plataforma.setAlpha(0.8);
        this.plataformasGrupo.add(plataforma);
        
        // Animación de aparición
        this.tweens.add({
            targets: plataforma,
            y: plataforma.y - 20,
            alpha: 1,
            duration: 800,
            ease: 'Back.out'
        });
    }

    crearPuente(x, y) {
        for (let i = 0; i < 3; i++) {
            const segmento = this.physics.add.staticSprite(x + (i * 50), y + 30, 'plataforma_basica');
            segmento.displayWidth = 40;
            segmento.displayHeight = 15;
            segmento.setTint(0x888888); // Gris para duda
            segmento.setAlpha(0.9);
            this.plataformasGrupo.add(segmento);
            
            // Animación secuencial
            this.tweens.add({
                targets: segmento,
                y: segmento.y - 10,
                alpha: 1,
                duration: 400,
                delay: i * 200,
                ease: 'Sine.easeOut'
            });
        }
    }

    crearImpulso(x, y) {
        const impulso = this.add.zone(x, y, 60, 60);
        this.physics.add.existing(impulso, true);
        
        const area = this.add.circle(x, y, 30, 0xff4444, 0.3); // Rojo para celos
        
        // Animación pulsante
        this.tweens.add({
            targets: area,
            scale: 1.5,
            alpha: 0.6,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
        
        // Colisión con jugador
        this.physics.add.overlap(this.jugador, impulso, () => {
            this.jugador.body.setVelocityY(-500); // Impulso hacia arriba
            this.mostrarMensajeHabilidad('¡Impulso emocional!');
        });
    }

    crearZonaSilencio(x, y) {
        const zona = this.add.circle(x, y, 80, 0x000000, 0.2); // Negro para silencio
        zona.setStrokeStyle(2, 0xffffff, 0.5);
        
        // Texto de zona
        const texto = this.add.text(x, y - 90, 'ZONA DE SILENCIO\n(Reduce velocidad de enemigos)', {
            fontSize: '14px',
            color: '#ffffff',
            align: 'center',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);
        
        // Efecto en enemigos
        this.enemigosGrupo.children.iterate(enemigo => {
            if (enemigo && !enemigo.resuelto) {
                const dist = Phaser.Math.Distance.Between(x, y, enemigo.x, enemigo.y);
                if (dist < 80) {
                    enemigo.setVelocity(enemigo.body.velocity.x * 0.5, enemigo.body.velocity.y * 0.5);
                }
            }
            return true;
        });
    }
}