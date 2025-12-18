export class Menu extends Phaser.Scene {
    constructor() {
        super({ key: 'Menu' });
        this.botones = [];
        this.musicaMenu = null;
    }

    create() {
        // Fondo con gradiente emocional
        this.crearFondoEmocional();
        
        // Título del juego
        this.crearTitulo();
        
        // Botones del menú
        this.crearBotonesMenu();
        
        // Información de controles
        this.crearInfoControles();
        
        // Música de menú
        // this.musicaMenu = this.sound.add('musica_inicio', { 
        //     volume: 0.4,
        //     loop: true 
        // });
        // this.musicaMenu.play();
        
        // Efectos de partículas sutiles
        this.crearParticulasMenu();

            this.time.delayedCall(1000, () => { // Espera 1 segundo
        try {
            const testSound = this.sound.add('tono_prueba', { volume: 0.7 });
            testSound.play();
            console.log('✅ SONIDO DE PRUEBA REPRODUCIÉNDOSE');
            
            // Verifica en consola
            console.log('Audio cargado en cache:', this.cache.audio.has('tono_prueba'));
        } catch (error) {
            console.error('❌ Error al reproducir:', error);
        }
    });
    }
    
    crearFondoEmocional() {
        // Gradiente que cambia de color
        const gradient = this.add.graphics();
        const colors = [0x3498db, 0x9b59b6, 0xe74c3c, 0x2ecc71];
        let colorIndex = 0;
        
        const dibujarGradiente = () => {
            gradient.clear();
            
            const color = colors[colorIndex];
            const nextColor = colors[(colorIndex + 1) % colors.length];
            
            gradient.fillGradientStyle(
                color, color,
                nextColor, nextColor,
                1, 1, 1, 1
            );
            
            gradient.fillRect(0, 0, 1280, 720);
        };
        
        dibujarGradiente();
        
        // Transición de colores cada 5 segundos
        this.time.addEvent({
            delay: 5000,
            callback: () => {
                colorIndex = (colorIndex + 1) % colors.length;
                dibujarGradiente();
            },
            loop: true
        });
        
        // Efecto de estrellas/titileo
        for (let i = 0; i < 50; i++) {
            const x = Phaser.Math.Between(0, 1280);
            const y = Phaser.Math.Between(0, 720);
            const size = Phaser.Math.Between(1, 3);
            const star = this.add.circle(x, y, size, 0xffffff, 0.5);
            
            this.tweens.add({
                targets: star,
                alpha: { from: 0.2, to: 0.8 },
                duration: Phaser.Math.Between(1000, 3000),
                yoyo: true,
                repeat: -1,
                delay: Phaser.Math.Between(0, 2000)
            });
        }
    }
    
    crearTitulo() {
        // Título principal con efecto
        const titulo = this.add.text(640, 150, 'ECOS ENTRE NOSOTROS', {
            fontFamily: 'Courier New',
            fontSize: '64px',
            color: '#ffffff',
            stroke: '#3498db',
            strokeThickness: 6,
            shadow: {
                offsetX: 4,
                offsetY: 4,
                color: '#000000',
                blur: 5,
                stroke: true,
                fill: true
            }
        }).setOrigin(0.5);
        
        // Subtítulo
        const subtitulo = this.add.text(640, 220, 'Un viaje emocional', {
            fontFamily: 'Courier New',
            fontSize: '24px',
            color: '#cccccc',
            fontStyle: 'italic'
        }).setOrigin(0.5);
        
        // Efecto de parpadeo en el título
        this.tweens.add({
            targets: titulo,
            alpha: { from: 0.8, to: 1 },
            duration: 2000,
            yoyo: true,
            repeat: -1
        });
    }
    
    crearBotonesMenu() {
        const botonesConfig = [
            { texto: 'NUEVA PARTIDA', y: 320, accion: 'nuevaPartida' },
            { texto: 'CONTINUAR', y: 380, accion: 'continuar' },
            { texto: 'CONFIGURACIÓN', y: 440, accion: 'configuracion' },
            { texto: 'CRÉDITOS', y: 500, accion: 'creditos' },
            { texto: 'SALIR', y: 560, accion: 'salir' }
        ];
        
        botonesConfig.forEach((config, index) => {
            const boton = this.add.text(640, config.y, config.texto, {
                fontFamily: 'Courier New',
                fontSize: '28px',
                color: '#aaaaaa',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                padding: { x: 20, y: 10 }
            }).setOrigin(0.5).setInteractive();
            
            // Efecto hover
            boton.on('pointerover', () => {
                boton.setStyle({ color: '#ffffff', backgroundColor: 'rgba(52, 152, 219, 0.7)' });
                this.sound.play('sfx_texto', { volume: 0.2 });
                
                // Efecto visual adicional
                this.tweens.add({
                    targets: boton,
                    scale: 1.05,
                    duration: 200,
                    ease: 'Power2'
                });
            });
            
            boton.on('pointerout', () => {
                boton.setStyle({ color: '#aaaaaa', backgroundColor: 'rgba(0, 0, 0, 0.5)' });
                this.tweens.add({
                    targets: boton,
                    scale: 1,
                    duration: 200
                });
            });
            
            boton.on('pointerdown', () => {
                this.sound.play('sfx_recuerdo', { volume: 0.3 });
                this.ejecutarAccion(config.accion);
            });
            
            // Animación de entrada escalonada
            boton.setAlpha(0).setScale(0.8);
            this.tweens.add({
                targets: boton,
                alpha: 1,
                scale: 1,
                duration: 500,
                delay: 200 + (index * 100),
                ease: 'Back.out'
            });
            
            this.botones.push(boton);
        });
    }
    
    ejecutarAccion(accion) {
        switch(accion) {
            case 'nuevaPartida':
                this.transicionarAInicio(true);
                break;
                
            case 'continuar':
                this.cargarPartida();
                break;
                
            case 'configuracion':
                this.scene.launch('Configuracion');
                break;
                
            case 'creditos':
                this.mostrarCreditos();
                break;
                
            case 'salir':
                this.salirDelJuego();
                break;
        }
    }
    
    transicionarAInicio(nuevaPartida = false) {
        // Detener música
        if (this.musicaMenu) {
            this.musicaMenu.stop();
        }
        
        // Efecto de transición
        this.cameras.main.fadeOut(1000, 0, 0, 0);
        
        // Limpiar partida anterior si es nueva
        if (nuevaPartida) {
            const guardadoManager = this.registry.get('guardadoManager');
            guardadoManager.limpiar();
        }
        
        this.time.delayedCall(1000, () => {
            this.scene.start('Inicio');
        });
    }
    
    cargarPartida() {
        const guardadoManager = this.registry.get('guardadoManager');
        const datos = guardadoManager.cargar();
        
        if (datos && datos.zonaActual) {
            this.transicionarAInicio(false);
        } else {
            // No hay partida guardada
            const mensaje = this.add.text(640, 620, 'No hay partida guardada', {
                fontFamily: 'Courier New',
                fontSize: '20px',
                color: '#e74c3c'
            }).setOrigin(0.5);
            
            this.tweens.add({
                targets: mensaje,
                alpha: 0,
                duration: 1000,
                delay: 2000,
                onComplete: () => mensaje.destroy()
            });
        }
    }
    
    crearInfoControles() {
        const controles = this.add.text(640, 680, 
            'Controles: ↑↓←→ Moverse | E Escuchar | R Recordar | F Perdonar', {
            fontFamily: 'Courier New',
            fontSize: '14px',
            color: '#777777'
        }).setOrigin(0.5);
    }
    
crearParticulasMenu() {

    this.particulas = this.add.particles(0, 0, 'particula_emocion', {
        x: { min: 0, max: this.cameras.main.width },
        y: this.cameras.main.height,
        lifespan: 3000,
        speedY: { min: -100, max: -50 },
        speedX: { min: -20, max: 20 },
        scale: { start: 0.5, end: 0 },
        alpha: { start: 0.8, end: 0 },
        blendMode: 'ADD',
        frequency: 50,
        quantity: 1,
        gravityY: 20
    });
}
    
    mostrarCreditos() {
        // Crear panel de créditos
        const panel = this.add.rectangle(640, 360, 800, 500, 0x000000, 0.9)
            .setStrokeStyle(2, 0x3498db);
        
        const titulo = this.add.text(640, 180, 'CRÉDITOS', {
            fontFamily: 'Courier New',
            fontSize: '40px',
            color: '#3498db'
        }).setOrigin(0.5);
        
        const creditos = [
            'DESARROLLO Y DISEÑO',
            'Tu Nombre',
            '',
            'MÚSICA Y SONIDOS',
            'Artistas de OpenGameArt',
            '',
            'AGRADECIMIENTOS ESPECIALES',
            'A todas las personas que creen',
            'en el poder de las emociones',
            '',
            '¡Gracias por jugar!'
        ];
        
        creditos.forEach((linea, index) => {
            const y = 250 + (index * 30);
            const color = index % 3 === 0 ? '#3498db' : '#ffffff';
            const size = index % 3 === 0 ? '20px' : '16px';
            
            this.add.text(640, y, linea, {
                fontFamily: 'Courier New',
                fontSize: size,
                color: color
            }).setOrigin(0.5);
        });
        
        const botonCerrar = this.add.text(640, 550, 'VOLVER', {
            fontFamily: 'Courier New',
            fontSize: '24px',
            color: '#aaaaaa',
            backgroundColor: 'rgba(52, 152, 219, 0.3)',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();
        
        botonCerrar.on('pointerover', () => {
            botonCerrar.setStyle({ color: '#ffffff' });
        });
        
        botonCerrar.on('pointerout', () => {
            botonCerrar.setStyle({ color: '#aaaaaa' });
        });
        
        botonCerrar.on('pointerdown', () => {
            this.sound.play('sfx_texto', { volume: 0.2 });
            panel.destroy();
            titulo.destroy();
            botonCerrar.destroy();
            
            // Destruir todos los textos de créditos
            this.children.list.forEach(child => {
                if (child.type === 'Text' && child !== titulo && child !== botonCerrar) {
                    child.destroy();
                }
            });
        });
    }
    
    salirDelJuego() {
        // Efecto de salida
        this.cameras.main.fadeOut(1000, 0, 0, 0);
        
        this.time.delayedCall(1000, () => {
            // En un navegador, no podemos cerrar la ventana automáticamente
            const mensaje = this.add.text(640, 360, '¡Gracias por jugar!', {
                fontFamily: 'Courier New',
                fontSize: '32px',
                color: '#ffffff'
            }).setOrigin(0.5);
            
            // Redirigir después de 2 segundos
            this.time.delayedCall(2000, () => {
                window.location.href = 'about:blank';
            });
        });
    }
    
    update() {
        // Animaciones sutiles de botones
        this.botones.forEach((boton, index) => {
            const offset = Math.sin(this.time.now / 1000 + index) * 2;
            boton.y = boton.y + (offset * 0.1);
        });
    }
}