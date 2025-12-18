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
        
        // CARGAR ASSETS PLACEHOLDER
        // Por ahora, crear gráficos simples en lugar de cargar imágenes
        
        // Crear un pixel para partículas
        const graphics = this.make.graphics({x: 0, y: 0, add: false});
        graphics.fillStyle(0xffffff);
        graphics.fillRect(0, 0, 4, 4);
        graphics.generateTexture('particula_emocion', 4, 4);
        graphics.generateTexture('particula_recuerdo', 4, 4);
        graphics.destroy();
        
        // Sprite del protagonista placeholder
        const protaGraphics = this.make.graphics({x: 0, y: 0, add: false});
        protaGraphics.fillStyle(0x3498db);
        protaGraphics.fillRect(0, 0, 32, 32);
        protaGraphics.generateTexture('protagonista', 32, 32);
        protaGraphics.destroy();
        
        // Recuerdo placeholder
        const recuerdoGraphics = this.make.graphics({x: 0, y: 0, add: false});
        recuerdoGraphics.fillStyle(0xffff00);
        recuerdoGraphics.fillCircle(8, 8, 8);
        recuerdoGraphics.generateTexture('recuerdo', 16, 16);
        recuerdoGraphics.destroy();
        
        // Enemigos placeholder
        ['miedo', 'duda', 'celos', 'silencio'].forEach((tipo, i) => {
            const enemyGraphics = this.make.graphics({x: 0, y: 0, add: false});
            const colors = [0x4444ff, 0x888888, 0xff4444, 0x000000];
            enemyGraphics.fillStyle(colors[i]);
            enemyGraphics.fillCircle(16, 16, 12);
            enemyGraphics.generateTexture(`enemigo_${tipo}`, 32, 32);
            enemyGraphics.destroy();
        });
        
        // Plataformas placeholder
        const platGraphics = this.make.graphics({x: 0, y: 0, add: false});
        platGraphics.fillStyle(0x8b4513);
        platGraphics.fillRect(0, 0, 64, 16);
        platGraphics.generateTexture('plataforma_basica', 64, 16);
        platGraphics.generateTexture('plataforma_fragil', 64, 16);
        platGraphics.generateTexture('plataforma_movil', 64, 16);
        platGraphics.destroy();
        
        // AUDIO PLACEHOLDER (silencio)
        const silentAudio = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
        
        ['musica_inicio', 'musica_distancia', 'musica_recuerdos', 
         'musica_conflicto', 'musica_confianza', 'musica_presente',
         'sfx_salto', 'sfx_recuerdo', 'sfx_texto', 'sfx_plataforma_rota',
         'sfx_escuchar', 'sfx_confiar', 'sfx_perdonar'].forEach(key => {
            this.load.audio(key, silentAudio);
        });
    }

    create() {
        // Crear animaciones básicas
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
        
        console.log('Preload completado, iniciando Menu');
        
        this.cameras.main.fadeOut(1000, 0, 0, 0);
        this.time.delayedCall(1000, () => {
            this.scene.start('Menu');
        });
    }
}