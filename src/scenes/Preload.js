export class Preload extends Phaser.Scene {
    constructor() {
        super({ key: 'Preload' });
    }

    preload() {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        
        // Barra de progreso más elaborada
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        const loadingText = this.add.text(centerX, centerY - 30, 'Cargando emociones...', {
            fontSize: '20px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(centerX - 160, centerY, 320, 50);
        
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0x3498db, 1);
            progressBar.fillRect(centerX - 150, centerY + 10, 300 * value, 30);
            
            loadingText.setText(`Cargando: ${Math.floor(value * 100)}%`);
        });
        
        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            
            // Efecto de transición
            this.cameras.main.fadeOut(1000, 0, 0, 0);
            this.time.delayedCall(1000, () => {
                this.scene.start('Menu');
            });
        });
        
        // ========== CARGAR TODOS LOS ASSETS ==========
        
        // 1. SPRITES DEL PROTAGONISTA
        this.load.spritesheet('protagonista', 'assets/sprites/protagonista/protagonista.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        
        // 2. ENEMIGOS EMOCIONALES
        this.load.image('enemigo_miedo', 'assets/sprites/enemigos_emocionales/miedo.png');
        this.load.image('enemigo_duda', 'assets/sprites/enemigos_emocionales/duda.png');
        this.load.image('enemigo_celos', 'assets/sprites/enemigos_emocionales/celos.png');
        this.load.image('enemigo_silencio', 'assets/sprites/enemigos_emocionales/silencio.png');
        
        // 3. OBJETOS Y RECUERDOS
        this.load.spritesheet('recuerdo', 'assets/sprites/recuerdo.png', {
            frameWidth: 16,
            frameHeight: 16
        });
        
        // 4. PLATAFORMAS Y ELEMENTOS DEL ENTORNO
        this.load.image('plataforma_basica', 'assets/sprites/entornos/plataforma_basica.png');
        this.load.image('plataforma_fragil', 'assets/sprites/entornos/plataforma_fragil.png');
        this.load.image('plataforma_movil', 'assets/sprites/entornos/plataforma_movil.png');
        
        // 5. TILESETS (si usas mapas de tiles)
        this.load.image('tileset_emocional', 'assets/tilesets/tileset_emocional.png');
        
        // 6. MAPAS (JSON de Tiled)
        this.load.tilemapTiledJSON('mapa_inicio', 'assets/mapas/inicio.json');
        this.load.tilemapTiledJSON('mapa_distancia', 'assets/mapas/distancia.json');
        this.load.tilemapTiledJSON('mapa_recuerdos', 'assets/mapas/recuerdos.json');
        this.load.tilemapTiledJSON('mapa_conflicto', 'assets/mapas/conflicto.json');
        this.load.tilemapTiledJSON('mapa_confianza', 'assets/mapas/confianza.json');
        this.load.tilemapTiledJSON('mapa_presente', 'assets/mapas/presente.json');
        
        // 7. MÚSICA
        this.load.audio('musica_inicio', 'assets/audio/musica/inicio.ogg');
        this.load.audio('musica_distancia', 'assets/audio/musica/distancia.ogg');
        this.load.audio('musica_recuerdos', 'assets/audio/musica/recuerdos.ogg');
        this.load.audio('musica_conflicto', 'assets/audio/musica/conflicto.ogg');
        this.load.audio('musica_confianza', 'assets/audio/musica/confianza.ogg');
        this.load.audio('musica_presente', 'assets/audio/musica/presente.ogg');
        
        // 8. EFECTOS DE SONIDO
        this.load.audio('sfx_salto', 'assets/audio/sfx/salto.ogg');
        this.load.audio('sfx_recuerdo', 'assets/audio/sfx/recuerdo.ogg');
        this.load.audio('sfx_texto', 'assets/audio/sfx/texto.ogg');
        this.load.audio('sfx_plataforma_rota', 'assets/audio/sfx/plataforma_rota.ogg');
        this.load.audio('sfx_escuchar', 'assets/audio/sfx/escuchar.ogg');
        this.load.audio('sfx_confiar', 'assets/audio/sfx/confiar.ogg');
        this.load.audio('sfx_perdonar', 'assets/audio/sfx/perdonar.ogg');
        
        // 9. UI
        this.load.image('ui_corazon', 'assets/ui/corazon.png');
        this.load.image('ui_boton', 'assets/ui/boton.png');
        this.load.image('ui_barra', 'assets/ui/barra.png');
        
        // 10. PARTÍCULAS
        this.load.image('particula_recuerdo', 'assets/sprites/particulas/recuerdo.png');
        this.load.image('particula_emocion', 'assets/sprites/particulas/emocion.png');
    }

    create() {
        // ========== CREAR ANIMACIONES ==========
        
        // Animaciones del protagonista
        this.anims.create({
            key: 'caminar',
            frames: this.anims.generateFrameNumbers('protagonista', { start: 0, end: 3 }),
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
            frames: [{ key: 'protagonista', frame: 4 }],
            frameRate: 1
        });
        
        this.anims.create({
            key: 'escuchar',
            frames: this.anims.generateFrameNumbers('protagonista', { start: 5, end: 7 }),
            frameRate: 3,
            repeat: 0
        });
        
        // Animaciones de recuerdos
        this.anims.create({
            key: 'recuerdo_flotar',
            frames: this.anims.generateFrameNumbers('recuerdo', { start: 0, end: 3 }),
            frameRate: 4,
            repeat: -1
        });
        
        // ========== INICIALIZAR SISTEMAS GLOBALES ==========
        
        // Sistema de guardado
        if (!this.registry.has('guardadoManager')) {
            this.registry.set('guardadoManager', new (this.sys.game.context).GuardadoManager());
        }
        
        // Sistema de audio
        if (!this.registry.has('audioManager')) {
            this.registry.set('audioManager', new (this.sys.game.context).AudioManager(this));
        }
    }
}