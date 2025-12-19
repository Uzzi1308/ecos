export class Preload extends Phaser.Scene {
    constructor() {
        super({ key: 'Preload' });
        this.assetsCreados = false; // <-- AÑADIDO: bandera para controlar
    }

    preload() {
        // Si ya se crearon assets, saltar todo
        if (this.assetsCreados) {
            console.log('⚠️ Assets ya creados, saltando preload...');
            this.transicionAlMenu();
            return;
        }
        
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        
        // Guardar referencias para destruirlas después
        this.progressElements = {};
        
        // Barra de progreso
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        const loadingText = this.add.text(centerX, centerY - 30, 
            'Preparando experiencia emocional...', {
            fontSize: '20px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // Guardar referencias
        this.progressElements.bar = progressBar;
        this.progressElements.box = progressBox;
        this.progressElements.text = loadingText;
        
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(centerX - 160, centerY, 320, 50);
        
        // Usar arrow function para mantener el contexto
        const progressHandler = (value) => {
            if (progressBar && progressBar.active) {
                progressBar.clear();
                progressBar.fillStyle(0x3498db, 1);
                progressBar.fillRect(centerX - 150, centerY + 10, 
                    300 * value, 30);
            }
            if (loadingText && loadingText.active) {
                loadingText.setText(`Preparando: ${Math.floor(value * 100)}%`);
            }
        };
        
        this.load.on('progress', progressHandler);
        
        this.load.on('complete', () => {
            console.log('🔄 Evento complete llamado');
            
            // Remover el listener de progreso primero
            this.load.off('progress', progressHandler);
            
            // Destruir elementos de progreso de forma segura
            this.destroyProgressElements();
            
            console.log('✅ Todos los placeholders listos');
            
            // SOLO crear assets si no se han creado antes
            if (!this.assetsCreados) {
                this.crearTodosLosAssetsPlaceholder();
                this.assetsCreados = true;
            }
        });
        
        // ========== NO CARGAR NADA EXTERNO ==========
        console.log('Modo placeholder activado - sin archivos externos');
        
        // Forzar carga inmediata
        this.load.start();
        
        // Simular progreso con menos delays
        this.time.delayedCall(50, () => {
            this.load.emit('progress', 0.2);
        });
        this.time.delayedCall(200, () => {
            this.load.emit('progress', 0.5);
        });
        this.time.delayedCall(400, () => {
            this.load.emit('progress', 0.8);
        });
        this.time.delayedCall(600, () => {
            this.load.emit('progress', 1);
            this.load.emit('complete');
        });
    }

    // Método para destruir elementos de progreso de forma segura
    destroyProgressElements() {
        if (this.progressElements) {
            if (this.progressElements.bar && this.progressElements.bar.destroy) {
                this.progressElements.bar.destroy();
            }
            if (this.progressElements.box && this.progressElements.box.destroy) {
                this.progressElements.box.destroy();
            }
            if (this.progressElements.text && this.progressElements.text.destroy) {
                this.progressElements.text.destroy();
            }
            this.progressElements = null;
        }
    }

    crearTodosLosAssetsPlaceholder() {
        console.log('🎮 CREANDO ASSETS POR PRIMERA VEZ...');
        
        // 1. Assets básicos
        this.createPlaceholderAssets();
        
        // 2. Tileset emocional
        this.crearTilesetEmocional();
        
        // 3. Audios placeholder (silenciosos)
        this.crearAudiosPlaceholder();
        
        // 4. Marcar todos los mapas para usar fallback
        this.prepararMapasFallback();
        
        // 5. Crear animaciones INMEDIATAMENTE después de los assets
        this.createAnimaciones();
        
        // 6. Transición al menú INMEDIATAMENTE
        this.transicionAlMenu();
    }
    
    crearTilesetEmocional() {
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        
        const emociones = [
            { color: 0x3498db, name: 'tranquilidad' },
            { color: 0x2ecc71, name: 'esperanza' },
            { color: 0xe74c3c, name: 'pasión' },
            { color: 0xf39c12, name: 'alegría' },
            { color: 0x9b59b6, name: 'misterio' },
            { color: 0x34495e, name: 'seriedad' },
            { color: 0x1abc9c, name: 'frescura' },
            { color: 0xe67e22, name: 'calidez' }
        ];
        
        emociones.forEach((emocion, index) => {
            const x = (index % 4) * 64;
            const y = Math.floor(index / 4) * 64;
            
            graphics.fillStyle(emocion.color);
            graphics.fillRect(x, y, 64, 64);
            
            graphics.fillStyle(Phaser.Display.Color.GetColor(
                Phaser.Display.Color.ValueToColor(emocion.color).red * 0.8,
                Phaser.Display.Color.ValueToColor(emocion.color).green * 0.8,
                Phaser.Display.Color.ValueToColor(emocion.color).blue * 0.8
            ));
            graphics.fillRect(x + 8, y + 8, 48, 48);
            
            graphics.lineStyle(2, 0x000000, 0.3);
            graphics.strokeRect(x, y, 64, 64);
        });
        
        graphics.generateTexture('tileset_emocional', 256, 128);
        graphics.destroy();
        console.log('🎨 Tileset emocional creado');
    }
    
    crearAudiosPlaceholder() {
        try {
            const audioKeys = [
                'musica_inicio', 'musica_distancia', 'musica_recuerdos',
                'musica_conflicto', 'musica_confianza', 'musica_presente',
                'sfx_salto', 'sfx_escuchar', 'sfx_recuerdo', 'sfx_perdonar',
                'sfx_confiar', 'sfx_recuerdo_recolectado', 'sfx_enemigo_interactuar',
                'sfx_ui_click', 'sfx_ui_hover', 'sfx_texto', 'sfx_plataforma_rota',
                'sfx_portal', 'sfx_transicion'
            ];
            
            audioKeys.forEach(key => {
                this.cache.audio.add(key, { buffer: null });
            });
            
            console.log('🔇 Audios placeholder creados (silenciosos)');
        } catch (error) {
            console.log('⚠️ No se pudieron crear audios placeholder');
        }
    }
    
    prepararMapasFallback() {
        const mapas = ['inicio', 'distancia', 'recuerdos', 'conflicto', 'confianza', 'presente'];
        
        mapas.forEach(mapa => {
            this.registry.set(`mapa_${mapa}_fallback`, true);
            this.registry.set(`mapa_${mapa}_procedural`, true);
        });
        
        console.log('🗺️ Todos los mapas usarán generación procedural');
    }

    // NUEVO MÉTODO: Crear texturas con frames
    crearTexturaConFrames(graphics, key, width, height, numFrames = 1) {
        // Generar textura
        graphics.generateTexture(key, width * numFrames, height);
        
        // Añadir frames manualmente
        for (let i = 0; i < numFrames; i++) {
            // Para cada frame, añadir una región diferente
            this.textures.get(key).add(i, 0, i * width, 0, width, height);
        }
        
        console.log(`✅ Textura '${key}' creada con ${numFrames} frames`);
    }

    createPlaceholderAssets() {
        const graphics = this.make.graphics({x: 0, y: 0, add: false});
        
        // PARTÍCULA (con frames)
        graphics.fillStyle(0xffffff);
        graphics.fillRect(0, 0, 4, 4);
        this.crearTexturaConFrames(graphics, 'particula_emocion', 4, 4);
        this.crearTexturaConFrames(graphics, 'particula_recuerdo', 4, 4);
        graphics.clear();
        
        // PROTAGONISTA (con 2 frames para animación)
        graphics.fillStyle(0x3498db);
        // Frame 0
        graphics.fillRect(0, 0, 32, 32);
        graphics.fillStyle(0x2980b9);
        graphics.fillRect(8, 32, 16, 16);
        
        // Frame 1 (ligeramente diferente para animación)
        graphics.fillStyle(0x3498db);
        graphics.fillRect(32, 0, 32, 32);
        graphics.fillStyle(0x2980b9);
        graphics.fillRect(40, 32, 16, 16);
        graphics.fillStyle(0x1a5276);
        graphics.fillRect(36, 36, 8, 8);
        
        this.crearTexturaConFrames(graphics, 'protagonista', 32, 48, 2);
        graphics.clear();
        
        // RECUERDO (con frames para animación de flotar)
        graphics.fillStyle(0xffff00);
        // Frame 0
        graphics.fillCircle(8, 8, 8);
        // Frame 1 (más alto)
        graphics.fillCircle(24, 6, 8);
        // Frame 2 (más bajo)
        graphics.fillCircle(40, 10, 8);
        
        this.crearTexturaConFrames(graphics, 'recuerdo', 16, 16, 3);
        graphics.clear();
        
        // ENEMIGOS
        ['miedo', 'duda', 'celos', 'silencio'].forEach((tipo, i) => {
            const colors = [0x4444ff, 0x888888, 0xff4444, 0x000000];
            
            graphics.fillStyle(colors[i]);
            if (i === 0) {
                graphics.fillCircle(16, 16, 12);
            } else if (i === 1) {
                graphics.fillRect(8, 8, 16, 16);
            } else if (i === 2) {
                graphics.beginPath();
                graphics.moveTo(16, 4);
                graphics.lineTo(28, 28);
                graphics.lineTo(4, 28);
                graphics.closePath();
                graphics.fillPath();
            } else {
                graphics.fillCircle(16, 16, 16);
            }
            
            this.crearTexturaConFrames(graphics, `enemigo_${tipo}`, 32, 32);
            graphics.clear();
        });
        
        // PLATAFORMAS
        graphics.fillStyle(0x8b4513);
        graphics.fillRect(0, 0, 64, 16);
        this.crearTexturaConFrames(graphics, 'plataforma_basica', 64, 16);
        graphics.clear();
        
        graphics.fillStyle(0xa0522d);
        graphics.fillRect(0, 0, 64, 16);
        graphics.strokeRect(0, 0, 64, 16);
        this.crearTexturaConFrames(graphics, 'plataforma_fragil', 64, 16);
        graphics.clear();
        
        graphics.fillStyle(0xcd853f);
        graphics.fillRect(0, 0, 64, 16);
        graphics.fillStyle(0x000000, 0.3);
        graphics.fillCircle(16, 8, 4);
        graphics.fillCircle(48, 8, 4);
        this.crearTexturaConFrames(graphics, 'plataforma_movil', 64, 16);
        
        graphics.destroy();
        console.log('👤 Assets de personajes y objetos creados');
    }

    createAnimaciones() {
        console.log('🎬 Creando animaciones básicas...');
        
        try {
            // Verificar que las texturas existen
            if (!this.textures.exists('protagonista')) {
                console.error('❌ Textura "protagonista" no existe');
                return;
            }
            
            if (!this.textures.exists('recuerdo')) {
                console.error('❌ Textura "recuerdo" no existe');
                return;
            }
            
            // ANIMACIONES DEL PROTAGONISTA
            this.anims.create({
                key: 'caminar',
                frames: [
                    { key: 'protagonista', frame: 0 },
                    { key: 'protagonista', frame: 1 }
                ],
                frameRate: 5,
                repeat: -1
            });
            
            this.anims.create({
                key: 'quieto',
                frames: [{ key: 'protagonista', frame: 0 }],
                frameRate: 1
            });
            
            this.anims.create({
                key: 'saltar',
                frames: [{ key: 'protagonista', frame: 1 }],
                frameRate: 1
            });
            
            this.anims.create({
                key: 'escuchar',
                frames: [
                    { key: 'protagonista', frame: 0 },
                    { key: 'protagonista', frame: 1 }
                ],
                frameRate: 3,
                repeat: 0
            });
            
            // ANIMACIÓN DEL RECUERDO
            this.anims.create({
                key: 'recuerdo_flotar',
                frames: [
                    { key: 'recuerdo', frame: 0 },
                    { key: 'recuerdo', frame: 1 },
                    { key: 'recuerdo', frame: 2 }
                ],
                frameRate: 4,
                repeat: -1,
                yoyo: true
            });
            
            console.log('🎬 Animaciones básicas creadas correctamente');
        } catch (error) {
            console.error('❌ Error creando animaciones:', error);
        }
    }
    
    // NUEVO MÉTODO: Transición al menú
    transicionAlMenu() {
        console.log('✅ Preload completado exitosamente');
        
        // Pequeño delay para mostrar que todo está listo
        this.time.delayedCall(300, () => {
            this.cameras.main.fadeOut(800, 0, 0, 0);
            
            this.time.delayedCall(800, () => {
                console.log('🚀 Iniciando Menú...');
                this.scene.start('Menu');
            });
        });
    }

    // ELIMINAR el método create() - todo se maneja en transicionAlMenu()
}