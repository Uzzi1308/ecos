export class Preload extends Phaser.Scene {
    constructor() {
        super({ key: 'Preload' });
        this.assetsCreados = false;
    }

    preload() {
        if (this.assetsCreados) {
            console.log('⚠️ Assets ya creados, saltando preload...');
            this.transicionAlMenu();
            return;
        }
        
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        console.log('📦 Cargando assets reales...');
        
        // FONDO
        this.load.image('mi_fondo', 'assets/fondo/mi_fondo.png');

        this.load.image('suelo_principal_real', 'assets/suelo/suelo_principal.png');
        
        // PERSONAJES - Spritesheet del protagonista
        this.load.spritesheet('protagonista_real', 'assets/personajes/protagonista.png', {
            frameWidth: 32,
            frameHeight: 48,
            endFrame: 1
        });

        // ENEMIGOS - Spritesheets con 2 frames cada uno
        this.load.spritesheet('enemigo_miedo', 'assets/enemigos/miedo.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        
        this.load.spritesheet('enemigo_duda', 'assets/enemigos/duda.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        
        this.load.spritesheet('enemigo_celos', 'assets/enemigos/celos.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        
        this.load.spritesheet('enemigo_silencio', 'assets/enemigos/silencio.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        
        // PLATAFORMAS
        this.load.image('plataforma_basica_real', 'assets/plataformas/plataforma_basica.png');
        this.load.image('plataforma_fragil_real', 'assets/plataformas/plataforma_fragil.png');
        this.load.image('plataforma_movil_real', 'assets/plataformas/plataforma_movil.png');
        
        // ITEMS
        this.load.spritesheet('recuerdo_real', 'assets/items/recuerdo.png', {
            frameWidth: 16,
            frameHeight: 16
        });
        
        // EFECTOS
        this.load.image('particula_real', 'assets/efectos/particula.png');
        
        // Eventos de carga
        this.load.on('loaderror', (file) => {
            console.warn('⚠️ No se pudo cargar:', file.key);
            console.warn('   Usando placeholder para:', file.key);
        });
        
        this.load.on('filecomplete', (key, type, texture) => {
            if (texture) {
                console.log(`✅ ${key} cargado (${texture.width}x${texture.height})`);
            } else {
                console.log(`✅ ${key} cargado`);
            }
        });
        
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
        
        // Handler de progreso
        const progressHandler = (value) => {
            if (progressBar && progressBar.active) {
                progressBar.clear();
                progressBar.fillStyle(0x3498db, 1);
                progressBar.fillRect(centerX - 150, centerY + 10, 300 * value, 30);
            }
            if (loadingText && loadingText.active) {
                loadingText.setText(`Preparando: ${Math.floor(value * 100)}%`);
            }
        };
        
        this.load.on('progress', progressHandler);
        
        this.load.on('complete', () => {
            console.log('📄 Carga completa');
            
            // Remover listener
            this.load.off('progress', progressHandler);
            
            // Destruir elementos de progreso
            this.destroyProgressElements();
            
            console.log('✅ Assets cargados, creando placeholders de respaldo...');
            
            // Crear assets si no se han creado antes
            if (!this.assetsCreados) {
                this.crearTodosLosAssetsPlaceholder();
                this.assetsCreados = true;
            }
        });
        
        // Iniciar carga
        this.load.start();
    }

    // Método para destruir elementos de progreso
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
        console.log('🎮 Creando assets placeholder de respaldo...');
        
        // 1. Assets básicos (solo si no existen versiones reales)
        this.createPlaceholderAssets();
        
        // 2. Tileset emocional
        this.crearTilesetEmocional();
        
        // 3. Audios placeholder
        this.crearAudiosPlaceholder();
        
        // 4. Preparar mapas fallback
        this.prepararMapasFallback();
        
        // 5. Crear animaciones DESPUÉS de los assets
        this.createAnimaciones();
        
        // 6. Transición al menú
        this.transicionAlMenu();
    }
    
    createPlaceholderAssets() {
        const graphics = this.make.graphics({x: 0, y: 0, add: false});

        // ===== SUELO PRINCIPAL =====
if (!this.textures.exists('suelo_principal_real')) {
    console.log('📦 Creando suelo_principal placeholder');
    
    graphics.fillStyle(0x654321);  // Color marrón oscuro
    graphics.fillRect(0, 0, 1400, 40);
    
    // Añadir patrón para que parezca suelo
    graphics.fillStyle(0x8b4513);  // Marrón más claro
    for (let i = 0; i < 1400; i += 80) {
        graphics.fillRect(i, 0, 40, 4);     // Líneas horizontales
        graphics.fillRect(i + 20, 36, 40, 4);
    }
    
    // Bordes superior e inferior
    graphics.fillStyle(0x000000, 0.3);
    graphics.fillRect(0, 0, 1400, 2);
    graphics.fillRect(0, 38, 1400, 2);
    
    this.crearTexturaConFrames(graphics, 'suelo_principal', 1400, 40);
    graphics.clear();
} else {
    console.log('✅ Usando suelo_principal real');
}
        
        // ===== PROTAGONISTA =====
        if (this.textures.exists('protagonista_real')) {
            console.log('✅ Usando protagonista real');
        } else {
            console.log('📦 Creando protagonista placeholder');
            
            // Frame 0 - Quieto
            graphics.fillStyle(0x3498db);
            graphics.fillRect(0, 0, 32, 32);
            graphics.fillStyle(0x2980b9);
            graphics.fillRect(8, 32, 16, 16);
            
            // Frame 1 - Caminando
            graphics.fillStyle(0x3498db);
            graphics.fillRect(32, 0, 32, 32);
            graphics.fillStyle(0x2980b9);
            graphics.fillRect(40, 32, 16, 16);
            
            this.crearTexturaConFrames(graphics, 'protagonista', 32, 48, 2);
            graphics.clear();
        }
        
        // ===== RECUERDO =====
        if (!this.textures.exists('recuerdo_real')) {
            console.log('📦 Creando recuerdo placeholder');
            
            // Frame 0
            graphics.fillStyle(0xffff00);
            graphics.fillCircle(8, 8, 8);
            
            // Frame 1
            graphics.fillStyle(0xffdd00);
            graphics.fillCircle(24, 8, 7);
            
            // Frame 2
            graphics.fillStyle(0xffff00);
            graphics.fillCircle(40, 8, 8);
            
            this.crearTexturaConFrames(graphics, 'recuerdo', 16, 16, 3);
            graphics.clear();
        } else {
            console.log('✅ Usando recuerdo real');
        }
        
        // ===== ENEMIGOS =====
        ['miedo', 'duda', 'celos', 'silencio'].forEach((tipo) => {
            const key = `enemigo_${tipo}`;
            
            if (!this.textures.exists(key)) {
                console.log(`📦 Creando placeholder para ${key}`);
                
                const colors = {
                    miedo: { base: 0x4444ff, claro: 0x8888ff },
                    duda: { base: 0x888888, claro: 0xcccccc },
                    celos: { base: 0xff4444, claro: 0xff8888 },
                    silencio: { base: 0x000000, claro: 0x333333 }
                };
                
                const color = colors[tipo];
                
                // Frame 0 (base)
                graphics.fillStyle(color.base);
                this.dibujarEnemigoFrame(graphics, 0, 0, tipo, 0);
                
                // Frame 1 (claro - latido)
                graphics.fillStyle(color.claro);
                this.dibujarEnemigoFrame(graphics, 32, 0, tipo, 1);
                
                this.crearTexturaConFrames(graphics, key, 32, 32, 2);
                graphics.clear();
            } else {
                console.log(`✅ Usando ${key} real`);
                const tex = this.textures.get(key);
                console.log(`   Dimensiones: ${tex.source[0].width}x${tex.source[0].height}`);
                console.log(`   Frames: ${tex.frameTotal}`);
            }
        });
        
        // ===== PLATAFORMAS =====
        const plataformas = ['basica', 'fragil', 'movil'];
        const colores = [0x8b4513, 0xa0522d, 0xcd853f];
        
        plataformas.forEach((tipo, i) => {
            const keyReal = `plataforma_${tipo}_real`;
            if (!this.textures.exists(keyReal)) {
                console.log(`📦 Creando plataforma_${tipo} placeholder`);
                
                graphics.fillStyle(colores[i]);
                graphics.fillRect(0, 0, 64, 16);
                
                if (tipo === 'fragil') {
                    graphics.lineStyle(2, 0x000000, 0.5);
                    graphics.strokeRect(0, 0, 64, 16);
                }
                
                if (tipo === 'movil') {
                    graphics.fillStyle(0x000000, 0.3);
                    graphics.fillCircle(16, 8, 4);
                    graphics.fillCircle(48, 8, 4);
                }
                
                this.crearTexturaConFrames(graphics, `plataforma_${tipo}`, 64, 16);
                graphics.clear();
            } else {
                console.log(`✅ Usando plataforma_${tipo} real`);
            }
        });
        
        graphics.destroy();
        console.log('👤 Assets verificados/creados');
    }

    // Método auxiliar para dibujar formas de enemigos
    dibujarEnemigoFrame(graphics, xOffset, yOffset, tipo, frameNum) {
        const x = xOffset + 16;
        const y = yOffset + 16;
        const size = frameNum === 0 ? 12 : 10;
        
        switch(tipo) {
            case 'miedo':
                // Círculo (miedo)
                graphics.fillCircle(x, y, size);
                // Ojitos
                if (frameNum === 0) {
                    graphics.fillStyle(0x000000);
                    graphics.fillCircle(x - 4, y - 3, 2);
                    graphics.fillCircle(x + 4, y - 3, 2);
                }
                break;
                
            case 'duda':
                // Cuadrado (duda)
                graphics.fillRect(x - 8, y - 8, 16, 16);
                // Signo de interrogación
                if (frameNum === 0) {
                    graphics.fillStyle(0x000000);
                    graphics.fillCircle(x, y + 4, 2);
                }
                break;
                
            case 'celos':
                // Triángulo (celos)
                graphics.beginPath();
                graphics.moveTo(x, y - size);
                graphics.lineTo(x + size, y + size - 2);
                graphics.lineTo(x - size, y + size - 2);
                graphics.closePath();
                graphics.fillPath();
                break;
                
            case 'silencio':
                // Círculo grande (silencio)
                graphics.fillCircle(x, y, size + 2);
                // Boca cerrada
                if (frameNum === 0) {
                    graphics.fillStyle(0xffffff);
                    graphics.fillRect(x - 6, y + 2, 12, 2);
                }
                break;
        }
    }

    // Método para crear texturas con frames
    crearTexturaConFrames(graphics, key, width, height, numFrames = 1) {
        // Generar textura completa
        graphics.generateTexture(key, width * numFrames, height);
        
        // Añadir frames manualmente
        const texture = this.textures.get(key);
        for (let i = 0; i < numFrames; i++) {
            texture.add(i, 0, i * width, 0, width, height);
        }
        
        console.log(`✅ Textura '${key}' creada con ${numFrames} frames`);
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
            
            const colorObj = Phaser.Display.Color.ValueToColor(emocion.color);
            graphics.fillStyle(Phaser.Display.Color.GetColor(
                colorObj.red * 0.8,
                colorObj.green * 0.8,
                colorObj.blue * 0.8
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
        
        console.log('🗺️ Mapas configurados para generación procedural');
    }

    createAnimaciones() {
        console.log('🎬 Creando animaciones...');
        
        try {
            // ===== ANIMACIONES DEL PROTAGONISTA =====
            const texProtagonista = this.textures.exists('protagonista_real') 
                ? 'protagonista_real' 
                : 'protagonista';
            
            console.log(`🎬 Usando textura para animaciones: ${texProtagonista}`);
            
            if (this.textures.exists(texProtagonista)) {
                const totalFrames = this.textures.get(texProtagonista).frameTotal;
                console.log(`   Total de frames: ${totalFrames}`);
                
                // Animación caminar (si hay 2+ frames)
                if (totalFrames >= 2) {
                    this.anims.create({
                        key: 'caminar',
                        frames: this.anims.generateFrameNumbers(texProtagonista, { 
                            start: 0, 
                            end: 1 
                        }),
                        frameRate: 6,
                        repeat: -1
                    });
                    console.log('   ✅ Animación "caminar" creada');
                } else {
                    // Fallback si solo hay 1 frame
                    this.anims.create({
                        key: 'caminar',
                        frames: [{ key: texProtagonista, frame: 0 }],
                        frameRate: 1
                    });
                    console.log('   ⚠️ Animación "caminar" con 1 frame');
                }
                
                // Animación quieto
                this.anims.create({
                    key: 'quieto',
                    frames: [{ key: texProtagonista, frame: 0 }],
                    frameRate: 1
                });
                console.log('   ✅ Animación "quieto" creada');
                
                // Animación saltar
                this.anims.create({
                    key: 'saltar',
                    frames: [{ key: texProtagonista, frame: totalFrames > 1 ? 1 : 0 }],
                    frameRate: 1
                });
                console.log('   ✅ Animación "saltar" creada');
            }
            
            // ===== ANIMACIONES DE ENEMIGOS =====
            ['miedo', 'duda', 'celos', 'silencio'].forEach(tipo => {
                const key = `enemigo_${tipo}`;
                
                if (this.textures.exists(key)) {
                    const frameTotal = this.textures.get(key).frameTotal;
                    console.log(`📊 ${key}: ${frameTotal} frames disponibles`);
                    
                    // Solo crear animación si tiene 2+ frames
                    if (frameTotal >= 2) {
                        this.anims.create({
                            key: `enemigo_${tipo}_latido`,
                            frames: [
                                { key: key, frame: 0 },
                                { key: key, frame: 1 }
                            ],
                            frameRate: 3,
                            repeat: -1,
                            yoyo: true
                        });
                        console.log(`   ✅ Animación "enemigo_${tipo}_latido" creada`);
                    } else {
                        console.warn(`   ⚠️ ${key} solo tiene ${frameTotal} frame(s), sin animación`);
                    }
                } else {
                    console.warn(`   ⚠️ Textura ${key} no existe`);
                }
            });
            
            // ===== ANIMACIÓN DEL RECUERDO =====
            if (this.textures.exists('recuerdo')) {
                const frameTotal = this.textures.get('recuerdo').frameTotal;
                
                if (frameTotal >= 3) {
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
                    console.log('   ✅ Animación "recuerdo_flotar" creada');
                } else {
                    // Fallback con frames disponibles
                    this.anims.create({
                        key: 'recuerdo_flotar',
                        frames: [{ key: 'recuerdo', frame: 0 }],
                        frameRate: 1
                    });
                    console.log('   ⚠️ Animación "recuerdo_flotar" con frames limitados');
                }
            }
            
            console.log('🎬 Animaciones creadas correctamente');
            
        } catch (error) {
            console.error('❌ Error creando animaciones:', error);
        }
    }
    
    transicionAlMenu() {
        console.log('✅ Preload completado exitosamente');
        
        // Pequeño delay para asegurar que todo está listo
        this.time.delayedCall(300, () => {
            this.cameras.main.fadeOut(800, 0, 0, 0);
            
            this.time.delayedCall(800, () => {
                console.log('🚀 Iniciando Menú...');
                this.scene.start('Menu');
            });
        });
    }
}