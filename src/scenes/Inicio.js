export class Inicio extends Phaser.Scene {
    constructor() {
        super({ key: 'Inicio' });
        this.plataformas = [];
        this.coleccionables = [];
        this.enemigos = [];
        this.tileSize = 32;
    }

    preload() {
        // Cargar el JSON del mapa si existe
        this.load.json('mapaData', 'assets/mapas/inicio.json');
        
        // También puedes crear partículas simples
        this.load.image('particula_estrella', 'assets/particles/star.png');
    }

    create() {
        console.log('🎮 Escena Inicio cargada - Modo Dinámico');
        
        // Intentar cargar mapa desde JSON o crear uno procedimental
        this.cargarMapaPersonalizado();
        
        // Crear jugador
        this.crearJugador();
        
        // Configurar física y colisiones
        this.configurarFisica();
        
        // Configurar cámara
        this.configurarCamara();
        
        // Controles
        this.configurarControles();
        
        // UI del juego
        this.crearUI();
        
        // Efectos visuales
        this.crearEfectosAmbientales();
        
        // Música ambiente
        this.iniciarMusicaAmbiente();
        
        console.log('✅ Mundo creado con éxito');
    }
    
    cargarMapaPersonalizado() {
        try {
            const mapaData = this.cache.json.get('mapaData');
            console.log('🗺️ Mapa cargado desde JSON:', mapaData.metadata.name);
            this.crearMapaDesdeJSON(mapaData);
        } catch (error) {
            console.log('⚠️ No se pudo cargar mapa, generando uno procedimental');
            this.crearMapaProcedimental();
        }
    }
    
    crearMapaDesdeJSON(mapaData) {
        const { layers, metadata } = mapaData;
        this.tileSize = metadata.tile_size || 64;
        
        // Fondo con gradiente
        this.crearFondoGradiente();
        
        // Crear capa de background
        if (layers.background) {
            this.crearCapaBackground(layers.background);
        }
        
        // Crear plataformas
        if (layers.platforms) {
            this.crearPlataformasJSON(layers.platforms);
        }
        
        // Crear obstáculos
        if (layers.obstacles) {
            this.crearObstaculosJSON(layers.obstacles);
        }
        
        // Crear coleccionables
        if (layers.collectibles) {
            this.crearColeccionablesJSON(layers.collectibles);
        }
        
        // Configurar zonas
        if (layers.zones) {
            this.crearZonasJSON(layers.zones);
        }
        
        // Configurar punto de spawn del jugador
        this.spawnPoint = {
            x: (layers.player?.spawn_x || 2) * this.tileSize,
            y: (layers.player?.spawn_y || 16) * this.tileSize
        };
    }
    
    crearMapaProcedimental() {
        // Fondo con gradiente emocional
        this.crearFondoGradiente();
        
        // Tamaño del mundo
        const worldWidth = 2560;
        const worldHeight = 720;
        
        // Suelo principal
        const suelo = this.add.rectangle(0, worldHeight - 50, worldWidth * 2, 100, 0x5d4037);
        this.physics.add.existing(suelo, true);
        suelo.y = worldHeight - 50;
        suelo.body.updateCenter();
        
        // Plataformas procedimentales
        this.crearPlataformasProcedimentales(worldWidth);
        
        // Coleccionables procedimentales
        this.crearColeccionablesProcedimentales();
        
        // Enemigos básicos
        this.crearEnemigosProcedimentales();
        
        // Punto de spawn
        this.spawnPoint = { x: 200, y: 500 };
    }
    
    crearFondoGradiente() {
        // Cielo con gradiente
        const gradient = this.add.graphics();
        const colors = [0x87CEEB, 0x4682B4, 0x1E3A5F];
        
        gradient.fillGradientStyle(
            colors[0], colors[0],
            colors[2], colors[2],
            1, 1, 1, 1
        );
        gradient.fillRect(0, 0, 2560, 720);
        
        // Nubes decorativas
        for (let i = 0; i < 15; i++) {
            const x = Phaser.Math.Between(0, 2560);
            const y = Phaser.Math.Between(50, 200);
            const size = Phaser.Math.Between(30, 80);
            
            const cloud = this.add.ellipse(x, y, size, size/2, 0xffffff, 0.7);
            cloud.setDepth(-1);
            
            // Animación de nubes
            this.tweens.add({
                targets: cloud,
                x: x + Phaser.Math.Between(100, 300),
                duration: Phaser.Math.Between(15000, 30000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }
    
    crearCapaBackground(backgroundLayer) {
        const width = backgroundLayer[0].length;
        const height = backgroundLayer.length;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (backgroundLayer[y][x] === 1) {
                    const block = this.add.rectangle(
                        x * this.tileSize + this.tileSize/2,
                        y * this.tileSize + this.tileSize/2,
                        this.tileSize, this.tileSize,
                        0x2c3e50,
                        0.8
                    );
                    block.setStrokeStyle(1, 0x3498db, 0.5);
                }
            }
        }
    }
    
    crearPlataformasJSON(platformsData) {
        platformsData.forEach(plat => {
            const x = plat.x * this.tileSize + (plat.width * this.tileSize)/2;
            const y = plat.y * this.tileSize + (plat.height * this.tileSize)/2;
            const width = plat.width * this.tileSize;
            const height = plat.height * this.tileSize;
            
            let platform;
            
            switch(plat.type) {
                case 'static':
                    platform = this.add.rectangle(x, y, width, height, 0x27ae60, 0.9);
                    platform.setStrokeStyle(2, 0x2ecc71);
                    break;
                    
                case 'moving_horizontal':
                    platform = this.add.rectangle(x, y, width, height, 0xf39c12, 0.9);
                    platform.setStrokeStyle(2, 0xe67e22);
                    
                    // Movimiento horizontal
                    this.tweens.add({
                        targets: platform,
                        x: x + (plat.range * this.tileSize),
                        duration: 2000,
                        yoyo: true,
                        repeat: -1,
                        ease: 'Sine.easeInOut'
                    });
                    break;
                    
                case 'moving_vertical':
                    platform = this.add.rectangle(x, y, width, height, 0x9b59b6, 0.9);
                    platform.setStrokeStyle(2, 0x8e44ad);
                    
                    // Movimiento vertical
                    this.tweens.add({
                        targets: platform,
                        y: y + (plat.range * this.tileSize),
                        duration: 1500,
                        yoyo: true,
                        repeat: -1,
                        ease: 'Sine.easeInOut'
                    });
                    break;
                    
                case 'fragile':
                    platform = this.add.rectangle(x, y, width, height, 0xe74c3c, 0.8);
                    platform.setStrokeStyle(1, 0xc0392b);
                    
                    // Efecto de parpadeo para plataformas frágiles
                    this.tweens.add({
                        targets: platform,
                        alpha: 0.6,
                        duration: 500,
                        yoyo: true,
                        repeat: -1
                    });
                    break;
                    
                default:
                    platform = this.add.rectangle(x, y, width, height, 0x95a5a6, 0.9);
            }
            
            // Añadir física
            if (plat.type !== 'moving_horizontal' && plat.type !== 'moving_vertical') {
                this.physics.add.existing(platform, true);
            } else {
                this.physics.add.existing(platform, true);
                platform.body.setImmovable(true);
            }
            
            this.plataformas.push(platform);
        });
    }
    
    crearPlataformasProcedimentales(worldWidth) {
        const platformTypes = [
            { color: 0x27ae60, height: 20 }, // Normal
            { color: 0xf39c12, height: 20 }, // Movible
            { color: 0x9b59b6, height: 15 }, // Delgada
            { color: 0x3498db, height: 25 }  // Ancha
        ];
        
        let lastX = 200;
        for (let i = 0; i < 15; i++) {
            const type = platformTypes[Phaser.Math.Between(0, platformTypes.length - 1)];
            const width = Phaser.Math.Between(80, 200);
            const x = lastX + Phaser.Math.Between(150, 300);
            const y = Phaser.Math.Between(300, 550);
            
            const platform = this.add.rectangle(x, y, width, type.height, type.color, 0.9);
            platform.setStrokeStyle(2, Phaser.Display.Color.GetColor(
                type.color >> 16,
                (type.color >> 8) & 0xFF,
                type.color & 0xFF
            ));
            
            this.physics.add.existing(platform, true);
            this.plataformas.push(platform);
            
            lastX = x;
            
            // Algunas plataformas con movimiento
            if (Math.random() > 0.7) {
                this.tweens.add({
                    targets: platform,
                    y: y + Phaser.Math.Between(-50, 50),
                    duration: Phaser.Math.Between(2000, 4000),
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }
        }
    }
    
    crearObstaculosJSON(obstaclesData) {
        obstaclesData.forEach(obs => {
            const x = obs.x * this.tileSize + this.tileSize/2;
            const y = obs.y * this.tileSize + this.tileSize/2;
            
            let obstacle;
            
            switch(obs.type) {
                case 'spikes':
                    obstacle = this.add.triangle(x, y, 0, 0, this.tileSize, 0, this.tileSize/2, this.tileSize, 0xe74c3c);
                    break;
                    
                case 'patrol_enemy':
                    obstacle = this.add.rectangle(x, y, this.tileSize, this.tileSize, 0x8e44ad, 0.9);
                    obstacle.setStrokeStyle(2, 0x9b59b6);
                    
                    // Movimiento de patrulla
                    this.tweens.add({
                        targets: obstacle,
                        x: x + (obs.range * this.tileSize),
                        duration: (obs.range * this.tileSize) / obs.speed * 1000,
                        yoyo: true,
                        repeat: -1,
                        ease: 'Linear'
                    });
                    break;
                    
                case 'boost':
                    obstacle = this.add.circle(x, y, this.tileSize/2, 0xf1c40f);
                    
                    // Animación de pulso
                    this.tweens.add({
                        targets: obstacle,
                        scale: 1.3,
                        duration: 500,
                        yoyo: true,
                        repeat: -1,
                        ease: 'Sine.easeInOut'
                    });
                    break;
                    
                default:
                    obstacle = this.add.rectangle(x, y, this.tileSize, this.tileSize, 0x7f8c8d);
            }
            
            this.physics.add.existing(obstacle, true);
            this.enemigos.push(obstacle);
        });
    }
    
    crearColeccionablesJSON(collectiblesData) {
        collectiblesData.forEach(item => {
            const x = item.x * this.tileSize + this.tileSize/2;
            const y = item.y * this.tileSize + this.tileSize/2;
            
            let collectible;
            
            switch(item.type) {
                case 'coin':
                    collectible = this.add.circle(x, y, 10, 0xf1c40f);
                    collectible.setStrokeStyle(2, 0xf39c12);
                    
                    // Animación de giro
                    this.tweens.add({
                        targets: collectible,
                        angle: 360,
                        duration: 2000,
                        repeat: -1,
                        ease: 'Linear'
                    });
                    break;
                    
                case 'health':
                    collectible = this.add.rectangle(x, y, 20, 20, 0xe74c3c);
                    collectible.setStrokeStyle(2, 0xc0392b);
                    
                    // Animación de flotación
                    this.tweens.add({
                        targets: collectible,
                        y: y - 15,
                        duration: 1000,
                        yoyo: true,
                        repeat: -1,
                        ease: 'Sine.easeInOut'
                    });
                    break;
                    
                case 'save_point':
                    collectible = this.add.rectangle(x, y, this.tileSize, this.tileSize * 2, 0x2ecc71, 0.5);
                    collectible.setStrokeStyle(3, 0x27ae60);
                    
                    // Animación de pulso
                    this.tweens.add({
                        targets: collectible,
                        alpha: 0.8,
                        duration: 800,
                        yoyo: true,
                        repeat: -1
                    });
                    break;
            }
            
            if (collectible) {
                this.physics.add.existing(collectible, true);
                this.coleccionables.push(collectible);
            }
        });
    }
    
    crearColeccionablesProcedimentales() {
        const collectibleTypes = [
            { shape: 'circle', color: 0xf1c40f, size: 10 }, // Moneda
            { shape: 'diamond', color: 0x9b59b6, size: 12 }, // Gema
            { shape: 'heart', color: 0xe74c3c, size: 15 }    // Vida
        ];
        
        for (let i = 0; i < 20; i++) {
            const type = collectibleTypes[Phaser.Math.Between(0, collectibleTypes.length - 1)];
            const x = Phaser.Math.Between(300, 2000);
            const y = Phaser.Math.Between(200, 600);
            
            let collectible;
            
            if (type.shape === 'circle') {
                collectible = this.add.circle(x, y, type.size, type.color);
            } else if (type.shape === 'diamond') {
                collectible = this.add.rectangle(x, y, type.size, type.size, type.color);
                collectible.angle = 45;
            } else {
                collectible = this.add.triangle(x, y, 0, -type.size, -type.size/2, type.size/3, type.size/2, type.size/3, type.color);
            }
            
            // Animación de flotación
            this.tweens.add({
                targets: collectible,
                y: y - 10,
                duration: 1500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            
            // Animación de rotación
            this.tweens.add({
                targets: collectible,
                angle: 360,
                duration: 3000,
                repeat: -1,
                ease: 'Linear'
            });
            
            this.physics.add.existing(collectible, true);
            this.coleccionables.push(collectible);
        }
    }
    
    crearEnemigosProcedimentales() {
        const enemyTypes = [
            { color: 0xe74c3c, size: 25, speed: 1 }, // Rojo - rápido
            { color: 0x3498db, size: 35, speed: 0.5 }, // Azul - lento
            { color: 0x9b59b6, size: 30, speed: 0.7 }  // Morado - medio
        ];
        
        for (let i = 0; i < 8; i++) {
            const type = enemyTypes[Phaser.Math.Between(0, enemyTypes.length - 1)];
            const x = Phaser.Math.Between(500, 2200);
            const y = Phaser.Math.Between(200, 600);
            
            const enemy = this.add.circle(x, y, type.size, type.color);
            enemy.setStrokeStyle(2, 0xffffff);
            
            // Ojos del enemigo
            this.add.circle(x - 8, y - 5, 5, 0x000000);
            this.add.circle(x + 8, y - 5, 5, 0x000000);
            
            // Movimiento de patrulla
            this.tweens.add({
                targets: enemy,
                x: x + Phaser.Math.Between(100, 300),
                duration: 3000 / type.speed,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            
            this.physics.add.existing(enemy, true);
            enemy.body.setImmovable(true);
            this.enemigos.push(enemy);
        }
    }
    
    crearZonasJSON(zonesData) {
        zonesData.forEach(zone => {
            const x = zone.x * this.tileSize;
            const y = zone.y * this.tileSize;
            const width = zone.width * this.tileSize;
            const height = zone.height * this.tileSize;
            
            // Crear área visual (solo para debug)
            const zoneRect = this.add.rectangle(
                x + width/2, 
                y + height/2, 
                width, 
                height, 
                0x3498db, 
                0.1
            );
            zoneRect.setStrokeStyle(2, 0x3498db, 0.3);
            
            // Texto de la zona
            const zoneText = this.add.text(
                x + width/2, 
                y - 20, 
                zone.name, 
                { 
                    fontSize: '16px', 
                    color: '#3498db',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    padding: { x: 5, y: 3 }
                }
            );
            zoneText.setOrigin(0.5);
        });
    }
    
    crearJugador() {
        this.jugador = this.add.circle(this.spawnPoint.x, this.spawnPoint.y, 20, 0x3498db);
        this.physics.add.existing(this.jugador);
        this.jugador.body.setCollideWorldBounds(true);
        
        // Contorno del jugador
        this.jugador.setStrokeStyle(3, 0x2980b9);
        
        // Ojos del jugador
        this.ojos = {
            izquierdo: this.add.circle(this.jugador.x - 8, this.jugador.y - 5, 5, 0xffffff),
            derecho: this.add.circle(this.jugador.x + 8, this.jugador.y - 5, 5, 0xffffff)
        };
        
        // Pupilas
        this.pupilas = {
            izquierda: this.add.circle(this.jugador.x - 8, this.jugador.y - 5, 2, 0x000000),
            derecha: this.add.circle(this.jugador.x + 8, this.jugador.y - 5, 2, 0x000000)
        };
    }
    
    configurarFisica() {
        // Colisiones con plataformas
        this.plataformas.forEach(plat => {
            this.physics.add.collider(this.jugador, plat);
        });
        
        // Colisiones con enemigos (daño)
        this.enemigos.forEach(enemy => {
            this.physics.add.overlap(this.jugador, enemy, () => {
                this.recibirDano();
            });
        });
        
        // Coleccionables
        this.coleccionables.forEach(item => {
            this.physics.add.overlap(this.jugador, item, (player, collectible) => {
                this.recolectarItem(collectible);
            });
        });
    }
    
    configurarCamara() {
        this.cameras.main.setBounds(0, 0, 2560, 720);
        this.cameras.main.startFollow(this.jugador, true, 0.05, 0.05);
        this.cameras.main.setZoom(1);
    }
    
    configurarControles() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        // Teclas adicionales para habilidades
        this.teclaE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        this.teclaR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        this.teclaF = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    }
    
    crearUI() {
        // Barra de vida
        this.vida = 100;
        this.barraVida = this.add.rectangle(100, 30, 200, 20, 0xe74c3c);
        this.barraVidaFondo = this.add.rectangle(100, 30, 204, 24, 0x000000, 0.5);
        this.barraVidaFondo.setStrokeStyle(2, 0xffffff);
        
        // Texto de vida
        this.textoVida = this.add.text(100, 30, '100/100', {
            fontSize: '14px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        // Contador de coleccionables
        this.coleccionablesRecolectados = 0;
        this.textoColeccionables = this.add.text(200, 60, 'Coleccionables: 0', {
            fontSize: '16px',
            color: '#f1c40f'
        });
        
        // Instrucciones
        this.add.text(20, 100, 'Controles:', {
            fontSize: '14px',
            color: '#bdc3c7'
        });
        this.add.text(20, 120, '←→ Moverse', { fontSize: '12px', color: '#95a5a6' });
        this.add.text(20, 140, '↑ Saltar', { fontSize: '12px', color: '#95a5a6' });
        this.add.text(20, 160, 'E Escuchar', { fontSize: '12px', color: '#95a5a6' });
        this.add.text(20, 180, 'R Recordar', { fontSize: '12px', color: '#95a5a6' });
        
        // Título de la zona
        this.tituloZona = this.add.text(640, 50, 'ZONA DE INICIO', {
            fontSize: '28px',
            color: '#ffffff',
            stroke: '#3498db',
            strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0);
        
        // Botón de pausa/menú
        const botonMenu = this.add.text(1250, 30, 'II', {
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#2c3e50',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setScrollFactor(0).setInteractive();
        
        botonMenu.on('pointerdown', () => {
            this.scene.pause();
            this.scene.launch('MenuPausa');
        });
    }
    
    crearEfectosAmbientales() {
        // Partículas de ambiente
        this.particulas = this.add.particles('particula_estrella');
        
        this.emitter = this.particulas.createEmitter({
            x: { min: 0, max: 2560 },
            y: 0,
            lifespan: 4000,
            speedY: { min: 20, max: 50 },
            scale: { start: 0.2, end: 0 },
            quantity: 1,
            frequency: 100,
            blendMode: 'ADD'
        });
        
        // Efecto de viento en las nubes (ya creadas en el fondo)
    }
    
    iniciarMusicaAmbiente() {
        // Música de fondo (si existe)
        try {
            this.musica = this.sound.add('musica_inicio', { volume: 0.3, loop: true });
            this.musica.play();
        } catch (error) {
            console.log('🎵 Modo sin música');
        }
    }
    
    recibirDano() {
        if (this.invulnerable) return;
        
        this.vida -= 10;
        if (this.vida < 0) this.vida = 0;
        
        // Actualizar barra de vida
        this.barraVida.width = (this.vida / 100) * 200;
        this.textoVida.setText(`${this.vida}/100`);
        
        // Efecto visual de daño
        this.jugador.setFillStyle(0xe74c3c);
        this.tweens.add({
            targets: this.jugador,
            fillColor: 0x3498db,
            duration: 300
        });
        
        // Invulnerabilidad temporal
        this.invulnerable = true;
        this.time.delayedCall(1000, () => {
            this.invulnerable = false;
        });
        
        // Game Over si la vida llega a 0
        if (this.vida <= 0) {
            this.gameOver();
        }
    }
    
    recolectarItem(item) {
        this.coleccionablesRecolectados++;
        this.textoColeccionables.setText(`Coleccionables: ${this.coleccionablesRecolectados}`);
        
        // Efecto de partículas al recolectar
        const emitter = this.add.particles('particula_estrella').createEmitter({
            x: item.x,
            y: item.y,
            speed: { min: -50, max: 50 },
            scale: { start: 0.5, end: 0 },
            lifespan: 500,
            quantity: 10
        });
        emitter.explode();
        
        // Sonido de coleccionable
        try {
            this.sound.play('sfx_recuerdo_recolectado', { volume: 0.3 });
        } catch (e) {}
        
        // Destruir el item
        item.destroy();
        
        // Eliminar de la lista
        const index = this.coleccionables.indexOf(item);
        if (index > -1) {
            this.coleccionables.splice(index, 1);
        }
    }
    
    gameOver() {
        console.log('💀 Game Over');
        
        // Efecto de fade out
        this.cameras.main.fadeOut(1000, 0, 0, 0);
        
        // Mostrar texto de Game Over
        const gameOverText = this.add.text(
            this.cameras.main.centerX, 
            this.cameras.main.centerY, 
            'GAME OVER\n\nColeccionables: ' + this.coleccionablesRecolectados,
            {
                fontSize: '48px',
                color: '#e74c3c',
                align: 'center'
            }
        ).setOrigin(0.5).setScrollFactor(0);
        
        this.time.delayedCall(2000, () => {
            this.scene.start('Menu');
        });
    }
    
    update() {
        // Movimiento horizontal
        if (this.cursors.left.isDown) {
            this.jugador.body.setVelocityX(-200);
            // Mover ojos
            this.ojos.izquierdo.x = this.jugador.x - 10;
            this.ojos.derecho.x = this.jugador.x + 6;
        } else if (this.cursors.right.isDown) {
            this.jugador.body.setVelocityX(200);
            // Mover ojos
            this.ojos.izquierdo.x = this.jugador.x - 6;
            this.ojos.derecho.x = this.jugador.x + 10;
        } else {
            this.jugador.body.setVelocityX(0);
            // Ojos centrados
            this.ojos.izquierdo.x = this.jugador.x - 8;
            this.ojos.derecho.x = this.jugador.x + 8;
        }
        
        // Salto
        if (this.spaceBar.isDown && this.jugador.body.onFloor()) {
            this.jugador.body.setVelocityY(-400);
            // Efecto de salto
            this.tweens.add({
                targets: this.jugador,
                scaleY: 0.8,
                duration: 100,
                yoyo: true
            });
        }
        
        // Habilidad Escuchar (E)
        if (Phaser.Input.Keyboard.JustDown(this.teclaE)) {
            this.usarHabilidadEscuchar();
        }
        
        // Habilidad Recordar (R)
        if (Phaser.Input.Keyboard.JustDown(this.teclaR)) {
            this.usarHabilidadRecordar();
        }
        
        // Habilidad Perdonar (F)
        if (Phaser.Input.Keyboard.JustDown(this.teclaF)) {
            this.usarHabilidadPerdonar();
        }
        
        // Actualizar posición de los ojos
        this.ojos.izquierdo.y = this.jugador.y - 5;
        this.ojos.derecho.y = this.jugador.y - 5;
        this.pupilas.izquierda.x = this.ojos.izquierdo.x;
        this.pupilas.izquierda.y = this.ojos.izquierdo.y;
        this.pupilas.derecha.x = this.ojos.derecho.x;
        this.pupilas.derecha.y = this.ojos.derecho.y;
        
        // Seguir al jugador con la cámara (ya está configurado)
        
        // Verificar si el jugador cayó al vacío
        if (this.jugador.y > 800) {
            this.respawn();
        }
        
        // Transición a siguiente zona
        if (this.jugador.x > 2400) {
            this.transicionarSiguienteZona();
        }
    }
    
    usarHabilidadEscuchar() {
        console.log('👂 Habilidad: Escuchar');
        
        // Efecto visual de onda sonora
        const onda = this.add.circle(this.jugador.x, this.jugador.y, 10, 0x3498db, 0.5);
        onda.setStrokeStyle(2, 0xffffff);
        
        this.tweens.add({
            targets: onda,
            radius: 150,
            alpha: 0,
            duration: 800,
            onComplete: () => onda.destroy()
        });
        
        // Mostrar diálogo
        this.mostrarDialogo('Escuchas... un eco del pasado');
    }
    
    usarHabilidadRecordar() {
        console.log('💭 Habilidad: Recordar');
        
        // Efecto visual de recuerdo
        for (let i = 0; i < 5; i++) {
            const memoria = this.add.circle(
                this.jugador.x + Phaser.Math.Between(-50, 50),
                this.jugador.y + Phaser.Math.Between(-50, 50),
                5,
                0xf1c40f
            );
            
            this.tweens.add({
                targets: memoria,
                y: memoria.y - 100,
                alpha: 0,
                duration: 1000,
                onComplete: () => memoria.destroy()
            });
        }
        
        // Mostrar diálogo
        this.mostrarDialogo('Recuerdas... momentos que creías olvidados');
    }
    
    usarHabilidadPerdonar() {
        console.log('🕊️ Habilidad: Perdonar');
        
        // Efecto visual de perdón
        const halo = this.add.circle(this.jugador.x, this.jugador.y - 30, 20, 0x2ecc71, 0.3);
        halo.setStrokeStyle(3, 0x27ae60);
        
        this.tweens.add({
            targets: halo,
            scale: 2,
            alpha: 0,
            duration: 1000,
            onComplete: () => halo.destroy()
        });
        
        // Mostrar diálogo
        this.mostrarDialogo('Perdonas... liberando el peso del pasado');
    }
    
    mostrarDialogo(texto) {
        const dialogo = this.add.text(
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
            targets: dialogo,
            y: dialogo.y - 20,
            alpha: 0,
            duration: 2000,
            onComplete: () => dialogo.destroy()
        });
    }
    
    respawn() {
        this.jugador.x = this.spawnPoint.x;
        this.jugador.y = this.spawnPoint.y;
        this.jugador.body.setVelocity(0, 0);
        
        // Efecto de respawn
        this.cameras.main.flash(300, 255, 255, 255);
    }
    
    transicionarSiguienteZona() {
        console.log('🚪 Transicionando a siguiente zona...');
        
        // Guardar progreso
        this.registry.set('coleccionables', this.coleccionablesRecolectados);
        
        // Efecto de transición
        this.cameras.main.fadeOut(1000, 0, 0, 0);
        
        // Detener música
        if (this.musica) {
            this.musica.stop();
        }
        
        this.time.delayedCall(1000, () => {
            // Aquí cargarías la siguiente zona
            // Por ahora, volvemos al menú
            this.scene.start('Menu');
        });
    }
}