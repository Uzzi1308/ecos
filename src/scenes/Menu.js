export class Menu extends Phaser.Scene {
    constructor() {
        super({ key: 'Menu' });
        this.botones = [];
        this.musicaMenu = null;
    }

    create() {
        // Obtener dimensiones de la pantalla
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;
        const centerX = screenWidth / 2;
        const centerY = screenHeight / 2;
        
        console.log(`🏠 Menú principal - Tamaño: ${screenWidth}x${screenHeight}`);
        
        // Fondo que se adapta
        this.crearFondoAdaptable();
        
        // Título (usando porcentajes)
        this.crearTitulo(centerX, screenHeight * 0.15);
        
        // Botones (usando porcentajes)
        this.crearBotonesMenu(centerX, screenHeight * 0.45);
        
        // Información de controles
        this.crearInfoControles(centerX, screenHeight * 0.85);
        
        console.log('🎵 Modo sin música temporal');
        
        // Efectos visuales
        this.crearEfectosVisuales();
    }
    
    crearFondoAdaptable() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Fondo sólido
        this.cameras.main.setBackgroundColor(0x1a1a2e);
        
        // Gradiente
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(
            0x1a1a2e, 0x1a1a2e,
            0x16213e, 0x16213e,
            1, 1, 1, 1
        );
        graphics.fillRect(0, 0, width, height);
        
        // Estrellas de fondo
        for (let i = 0; i < 60; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const size = Phaser.Math.FloatBetween(0.5, 2);
            const alpha = Phaser.Math.FloatBetween(0.1, 0.4);
            
            const star = this.add.circle(x, y, size, 0xffffff, alpha);
            
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
    
    crearTitulo(centerX, yPos) {
        // Título principal
        const titulo = this.add.text(centerX, yPos, 'ECOS ENTRE NOSOTROS', {
            fontFamily: 'Arial, sans-serif',
            fontSize: this.getFontSize(48, 64), // Tamaño responsive
            fontWeight: 'bold',
            color: '#ffffff',
            align: 'center',
            stroke: '#3498db',
            strokeThickness: 6,
            shadow: {
                offsetX: 3,
                offsetY: 3,
                color: '#000000',
                blur: 6,
                stroke: true,
                fill: true
            }
        }).setOrigin(0.5);
        
        // Animación sutil
        this.tweens.add({
            targets: titulo,
            alpha: { from: 0.9, to: 1 },
            duration: 1500,
            yoyo: true,
            repeat: -1
        });
        
        // Subtítulo
        const subtitulo = this.add.text(centerX, yPos + 60, 'Un viaje emocional', {
            fontFamily: 'Arial, sans-serif',
            fontSize: this.getFontSize(20, 24),
            color: '#bdc3c7',
            fontStyle: 'italic'
        }).setOrigin(0.5);
    }
    
    crearBotonesMenu(centerX, startY) {
        const botonesConfig = [
            { texto: 'NUEVA PARTIDA', accion: 'nuevaPartida' },
            { texto: 'CONTINUAR', accion: 'continuar' },
            { texto: 'OPCIONES', accion: 'configuracion' },
            { texto: 'CRÉDITOS', accion: 'creditos' },
            { texto: 'SALIR', accion: 'salir' }
        ];
        
        const buttonSpacing = 60;
        const buttonWidth = 320;
        const buttonHeight = 50;
        
        botonesConfig.forEach((config, index) => {
            const buttonY = startY + (index * buttonSpacing);
            
            // Fondo del botón
            const fondoBoton = this.add.rectangle(
                centerX, 
                buttonY, 
                buttonWidth, 
                buttonHeight, 
                0x2c3e50, 
                0.7
            ).setStrokeStyle(1, 0x3498db, 0.5);
            
            // Texto del botón
            const boton = this.add.text(centerX, buttonY, config.texto, {
                fontFamily: 'Arial, sans-serif',
                fontSize: this.getFontSize(20, 24),
                color: '#ecf0f1',
                align: 'center'
            }).setOrigin(0.5);
            
            // Área interactiva
            const areaInteractiva = this.add.zone(
                centerX, 
                buttonY, 
                buttonWidth, 
                buttonHeight
            ).setInteractive();
            
            // Efectos hover
            areaInteractiva.on('pointerover', () => {
                fondoBoton.setFillStyle(0x3498db, 0.8);
                fondoBoton.setStrokeStyle(2, 0xffffff, 0.8);
                boton.setColor('#ffffff');
                boton.setScale(1.05);
                
                // Sonido si está disponible
                try {
                    this.sound.play('sfx_ui_hover', { volume: 0.3 });
                } catch (e) {
                    // Silencio si no hay sonido
                }
            });
            
            areaInteractiva.on('pointerout', () => {
                fondoBoton.setFillStyle(0x2c3e50, 0.7);
                fondoBoton.setStrokeStyle(1, 0x3498db, 0.5);
                boton.setColor('#ecf0f1');
                boton.setScale(1);
            });
            
            areaInteractiva.on('pointerdown', () => {
                fondoBoton.setFillStyle(0x2980b9, 0.9);
                boton.setScale(0.95);
                
                // Sonido de clic
                try {
                    this.sound.play('sfx_ui_click', { volume: 0.4 });
                } catch (e) {
                    // Silencio
                }
                
                // Acción con delay
                this.time.delayedCall(150, () => {
                    this.ejecutarAccion(config.accion);
                });
            });
            
            // Animación de entrada
            fondoBoton.setAlpha(0).setScale(0.9);
            boton.setAlpha(0).setScale(0.9);
            
            this.tweens.add({
                targets: [fondoBoton, boton],
                alpha: 1,
                scale: 1,
                duration: 600,
                delay: 200 + (index * 100),
                ease: 'Back.out'
            });
            
            this.botones.push({ 
                fondo: fondoBoton, 
                texto: boton, 
                area: areaInteractiva,
                accion: config.accion 
            });
        });
    }
    
    crearInfoControles(centerX, yPos) {
        const controles = this.add.text(centerX, yPos, 
            'Controles: ← → Moverse | ↑ Saltar | E Interactuar | R Recordar', {
            fontFamily: 'Arial, sans-serif',
            fontSize: this.getFontSize(14, 16),
            color: '#7f8c8d'
        }).setOrigin(0.5);
    }
    
    crearEfectosVisuales() {
        const width = this.cameras.main.width;
        
        // Algunas partículas simples
        for (let i = 0; i < 15; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = this.cameras.main.height + 10;
            const size = Phaser.Math.FloatBetween(1, 2);
            
            const particula = this.add.circle(x, y, size, 0xffffff, 0.2);
            
            this.tweens.add({
                targets: particula,
                y: y - 150,
                x: x + Phaser.Math.Between(-30, 30),
                alpha: { from: 0.2, to: 0 },
                scale: { from: 1, to: 0.3 },
                duration: Phaser.Math.Between(2000, 4000),
                onComplete: () => particula.destroy()
            });
        }
    }
    
    // Método auxiliar para tamaños de fuente responsive
    getFontSize(minSize, maxSize) {
        const width = this.cameras.main.width;
        // Ajusta el tamaño según el ancho de pantalla
        if (width < 800) return `${minSize}px`;
        if (width > 1280) return `${maxSize}px`;
        
        // Interpolación lineal
        const size = minSize + (maxSize - minSize) * ((width - 800) / (1280 - 800));
        return `${Math.round(size)}px`;
    }
    
    ejecutarAccion(accion) {
        console.log(`🔘 Acción: ${accion}`);
        
        switch(accion) {
            case 'nuevaPartida':
                this.transicionarAInicio(true);
                break;
                
            case 'continuar':
                this.cargarPartida();
                break;
                
            case 'configuracion':
                this.mostrarMensajeTemporal('Opciones en desarrollo');
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
        console.log('🚀 Iniciando juego...');
        
        // Desactivar interacciones durante la transición
        this.botones.forEach(boton => {
            boton.area.disableInteractive();
        });
        
        // Fade out
        this.cameras.main.fadeOut(800, 0, 0, 0);
        
        this.time.delayedCall(800, () => {
            // Cambiar a la escena Inicio
            this.scene.start('Inicio');
        });
    }
    
    cargarPartida() {
        console.log('📂 Cargando partida...');
        
        const centerX = this.cameras.main.width / 2;
        const mensaje = this.add.text(centerX, 620, 'No hay partidas guardadas aún', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '20px',
            color: '#e74c3c',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setDepth(10);
        
        // Animación del mensaje
        this.tweens.add({
            targets: mensaje,
            y: 600,
            duration: 300,
            yoyo: true,
            onComplete: () => {
                this.tweens.add({
                    targets: mensaje,
                    alpha: 0,
                    duration: 1000,
                    delay: 1500,
                    onComplete: () => mensaje.destroy()
                });
            }
        });
    }
    
    mostrarCreditos() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Fondo semi-transparente
        const fondoCreditos = this.add.rectangle(
            centerX, 
            centerY, 
            width * 0.8, 
            height * 0.7, 
            0x000000, 
            0.85
        ).setStrokeStyle(3, 0x3498db, 0.7).setDepth(5);
        
        // Título
        const tituloCreditos = this.add.text(
            centerX, 
            centerY - height * 0.25, 
            'CRÉDITOS', {
            fontFamily: 'Arial, sans-serif',
            fontSize: this.getFontSize(32, 48),
            color: '#3498db',
            fontWeight: 'bold'
        }).setOrigin(0.5).setDepth(6);
        
        // Texto de créditos
        const creditos = [
            'DESARROLLADO CON PHASER 3',
            '',
            'Arte y diseño: Placeholder',
            'Programación: Tú',
            'Música: Placeholder',
            '',
            '¡Gracias por jugar!'
        ];
        
        creditos.forEach((linea, index) => {
            const y = centerY - height * 0.15 + (index * 35);
            const esTitulo = index === 0 || linea === '';
            
            this.add.text(centerX, y, linea, {
                fontFamily: 'Arial, sans-serif',
                fontSize: esTitulo ? '20px' : '18px',
                color: esTitulo ? '#3498db' : '#ffffff',
                fontStyle: esTitulo ? 'bold' : 'normal'
            }).setOrigin(0.5).setDepth(6);
        });
        
        // Botón cerrar
        const botonCerrar = this.add.text(
            centerX, 
            centerY + height * 0.2, 
            'VOLVER AL MENÚ', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '24px',
            color: '#ecf0f1',
            backgroundColor: '#2c3e50',
            padding: { x: 30, y: 15 }
        }).setOrigin(0.5).setDepth(6).setInteractive();
        
        botonCerrar.on('pointerover', () => {
            botonCerrar.setBackgroundColor('#3498db');
            botonCerrar.setColor('#ffffff');
        });
        
        botonCerrar.on('pointerout', () => {
            botonCerrar.setBackgroundColor('#2c3e50');
            botonCerrar.setColor('#ecf0f1');
        });
        
        botonCerrar.on('pointerdown', () => {
            // Cerrar todo
            fondoCreditos.destroy();
            tituloCreditos.destroy();
            botonCerrar.destroy();
            
            // Destruir textos de créditos
            this.children.list.forEach(child => {
                if (child.type === 'Text' && child !== botonCerrar) {
                    child.destroy();
                }
            });
        });
    }
    
    mostrarMensajeTemporal(texto) {
        const centerX = this.cameras.main.width / 2;
        const mensaje = this.add.text(centerX, 620, texto, {
            fontFamily: 'Arial, sans-serif',
            fontSize: '18px',
            color: '#f39c12',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setDepth(10);
        
        this.tweens.add({
            targets: mensaje,
            alpha: 0,
            duration: 800,
            delay: 2000,
            onComplete: () => mensaje.destroy()
        });
    }
    
    salirDelJuego() {
        console.log('👋 Saliendo...');
        
        this.cameras.main.fadeOut(1000, 0, 0, 0);
        
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        
        const despedida = this.add.text(centerX, centerY, '¡Gracias por jugar!', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '36px',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(10);
        
        this.time.delayedCall(2000, () => {
            // En navegador, no podemos cerrar la ventana
            despedida.setText('Recarga la página para volver a jugar');
            despedida.setFontSize(24);
            despedida.setY(centerY + 60);
        });
    }
    
    update() {
        // Animación sutil de botones
        if (this.botones && this.botones.length > 0) {
            this.botones.forEach((boton, index) => {
                const tiempo = this.time.now / 1000;
                const offset = Math.sin(tiempo * 2 + index) * 0.5;
                boton.texto.y = boton.fondo.y + offset;
            });
        }
    }
}