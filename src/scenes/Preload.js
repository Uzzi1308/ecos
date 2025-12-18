export class Preload extends Phaser.Scene {
    constructor() {
        super({ key: 'Preload' });
    }

    preload() {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        
        // Barra de progreso
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        const loadingText = this.add.text(centerX, centerY - 30, 
            'Cargando emociones...', {
            fontSize: '20px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(centerX - 160, centerY, 320, 50);
        
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0x3498db, 1);
            progressBar.fillRect(centerX - 150, centerY + 10, 
                300 * value, 30);
            loadingText.setText(`Cargando: ${Math.floor(value * 100)}%`);
        });
        
        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
        });
        
        this.load.on('filecomplete', (key, type) => {
            console.log(`✅ ${key} cargado (${type})`);
        });
        
        this.load.on('loaderror', (file) => {
            console.error(`❌ Error cargando ${file.key}: ${file.src}`);
            this.createFallbackAsset(file.key);
        });
        
        // CARGAR ASSETS PLACEHOLDER (gráficos)
        this.createPlaceholderAssets();
        
        // CARGAR MAPAS TILED (con manejo de errores)
        this.loadTilemaps();
        
        // CARGAR TILESET
        this.load.image('tileset_emocional', 'assets/tilesets/emocional.png');
        
        // CARGAR AUDIOS
        this.loadAudio();
    }

    createPlaceholderAssets() {
        const graphics = this.make.graphics({x: 0, y: 0, add: false});
        
        // Partícula
        graphics.fillStyle(0xffffff);
        graphics.fillRect(0, 0, 4, 4);
        graphics.generateTexture('particula_emocion', 4, 4);
        graphics.generateTexture('particula_recuerdo', 4, 4);
        graphics.clear();
        
        // Sprite del protagonista
        graphics.fillStyle(0x3498db);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('protagonista', 32, 32);
        graphics.clear();
        
        // Recuerdo
        graphics.fillStyle(0xffff00);
        graphics.fillCircle(8, 8, 8);
        graphics.generateTexture('recuerdo', 16, 16);
        graphics.clear();
        
        // Enemigos
        ['miedo', 'duda', 'celos', 'silencio'].forEach((tipo, i) => {
            const colors = [0x4444ff, 0x888888, 0xff4444, 0x000000];
            graphics.fillStyle(colors[i]);
            graphics.fillCircle(16, 16, 12);
            graphics.generateTexture(`enemigo_${tipo}`, 32, 32);
            graphics.clear();
        });
        
        // Plataformas
        graphics.fillStyle(0x8b4513);
        graphics.fillRect(0, 0, 64, 16);
        graphics.generateTexture('plataforma_basica', 64, 16);
        graphics.generateTexture('plataforma_fragil', 64, 16);
        graphics.generateTexture('plataforma_movil', 64, 16);
        
        graphics.destroy();
    }

    loadTilemaps() {
        const mapas = [
            'inicio', 'distancia', 'recuerdos', 
            'conflicto', 'confianza', 'presente'
        ];
        
        mapas.forEach(mapa => {
            try {
                this.load.tilemapTiledJSON(`mapa_${mapa}`, `assets/mapas/${mapa}.json`);
            } catch (error) {
                console.warn(`⚠️ No se pudo cargar mapa ${mapa}, usando fallback`);
            }
        });
    }

    loadAudio() {
        console.log('Iniciando carga de audios...');

        // MÚSICA (archivos OGG)
        const musica = [
            'inicio', 'distancia', 'recuerdos', 
            'conflicto', 'confianza', 'presente'
        ];
        
        musica.forEach(track => {
            this.load.audio(`musica_${track}`, `assets/audio/musica/${track}.ogg`);
        });

        // SFX (archivos WAV)
        const sfx = [
            'salto', 'escuchar', 'recuerdo', 'perdonar',
            'confiar', 'recuerdo_recolectado', 'enemigo_interactuar',
            'ui_click', 'ui_hover', 'texto', 'plataforma_rota',
            'portal', 'transicion'
        ];
        
        sfx.forEach(sound => {
            this.load.audio(`sfx_${sound}`, `assets/audio/sfx/${sound}.wav`);
        });
    }

    createFallbackAsset(key) {
        // Crear asset de respaldo si falla la carga
        if (key.includes('mapa_')) {
            console.log(`Creando mapa fallback para ${key}`);
            // Crear mapa simple procedural
            this.registry.set(`${key}_fallback`, true);
        } else if (key.includes('musica_') || key.includes('sfx_')) {
            console.log(`Audio ${key} no disponible, continuando sin él`);
        }
    }

    create() {
        // Crear animaciones básicas
        this.createAnimations();
        
        // Verificar audios cargados
        this.verifyAudioAssets();
        
        console.log('Preload completado, iniciando Menu');
        
        this.cameras.main.fadeOut(1000, 0, 0, 0);
        this.time.delayedCall(1000, () => {
            this.scene.start('Menu');
        });
    }

    createAnimations() {
        this.anims.create({
            key: 'caminar',
            frames: [{ key: 'protagonista', frame: 0 }],
            frameRate: 10,
            repeat: -1
        });
        
        this.anims.create({
            key: 'quieto',
            frames: [{ key: 'protagonista', frame: 0 }],
            frameRate: 1
        });
        
        this.anims.create({
            key: 'saltar',
            frames: [{ key: 'protagonista', frame: 0 }],
            frameRate: 1
        });
        
        this.anims.create({
            key: 'escuchar',
            frames: [{ key: 'protagonista', frame: 0 }],
            frameRate: 3,
            repeat: 0
        });
        
        this.anims.create({
            key: 'recuerdo_flotar',
            frames: [{ key: 'recuerdo', frame: 0 }],
            frameRate: 4,
            repeat: -1
        });
    }

    verifyAudioAssets() {
        console.log('=== VERIFICACIÓN DE AUDIOS ===');
        const audioCache = this.cache.audio;
        
        const audioKeys = [
            'musica_inicio', 'musica_distancia', 'musica_recuerdos',
            'musica_conflicto', 'musica_confianza', 'musica_presente',
            'sfx_salto', 'sfx_escuchar', 'sfx_recuerdo', 'sfx_perdonar',
            'sfx_confiar', 'sfx_recuerdo_recolectado', 'sfx_enemigo_interactuar',
            'sfx_ui_click', 'sfx_ui_hover', 'sfx_texto', 'sfx_plataforma_rota',
            'sfx_portal', 'sfx_transicion'
        ];
        
        let audioSuccess = true;
        
        audioKeys.forEach(key => {
            if (audioCache.has(key)) {
                console.log(`✅ ${key}: OK`);
            } else {
                console.error(`❌ ${key}: NO ENCONTRADO`);
                audioSuccess = false;
            }
        });
        
        if (!audioSuccess) {
            console.warn('⚠️ Algunos audios no se cargaron.');
        } else {
            console.log('🎵 Todos los audios cargados correctamente');
        }
    }
}