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
        
        // DEBUG: Para ver qué se carga
        this.load.on('filecomplete', (key, type) => {
            console.log(`✅ ${key} cargado (${type})`);
        });
        
        this.load.on('loaderror', (file) => {
            console.error(`❌ Error cargando ${file.key}: ${file.src}`);
        });
        
        // CARGAR ASSETS PLACEHOLDER (gráficos)
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
        
// // CARGAR AUDIOS REALES con las rutas CORRECTAS
// console.log('Iniciando carga de audios...');

// // MÚSICA (archivos OGG) 
// this.load.audio('musica_inicio', 'assets/audio/musica/inicio.ogg');
// this.load.audio('musica_distancia', 'assets/audio/musica/distancia.ogg');
// this.load.audio('musica_recuerdos', 'assets/audio/musica/recuerdos.ogg');
// this.load.audio('musica_conflicto', 'assets/audio/musica/conflicto.ogg');
// this.load.audio('musica_confianza', 'assets/audio/musica/confianza.ogg');
// this.load.audio('musica_presente', 'assets/audio/musica/presente.ogg');

// // SFX (archivos WAV)
// this.load.audio('sfx_salto', 'assets/audio/sfx/salto.wav');
// this.load.audio('sfx_escuchar', 'assets/audio/sfx/escuchar.wav');
// this.load.audio('sfx_recuerdo', 'assets/audio/sfx/recordar.wav');
// this.load.audio('sfx_perdonar', 'assets/audio/sfx/perdonar.wav');
// this.load.audio('sfx_confiar', 'assets/audio/sfx/confiar.wav');
// this.load.audio('sfx_recuerdo_recolectado', 'assets/audio/sfx/recuerdo_recolectado.wav');
// this.load.audio('sfx_enemigo_interactuar', 'assets/audio/sfx/enemigo_interactuar.wav');
// this.load.audio('sfx_ui_click', 'assets/audio/sfx/ui_click.wav');
// this.load.audio('sfx_ui_hover', 'assets/audio/sfx/ui_hover.wav');
// this.load.audio('sfx_texto', 'assets/audio/sfx/texto.wav');
// this.load.audio('sfx_plataforma_rota', 'assets/audio/sfx/plataforma_rota.wav');
// this.load.audio('sfx_portal', 'assets/audio/sfx/portal.wav');
// this.load.audio('sfx_transicion', 'assets/audio/sfx/transicion.wav');

console.log('=== PRUEBA DE AUDIO ===');
this.load.audio('tono_prueba', 'assets/audio/sfx/tono_prueba.mp3');
console.log('Cargando archivo de prueba: tono_prueba.mp3');
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
        
        // // Verificar qué audios se cargaron correctamente
        // console.log('=== VERIFICACIÓN DE AUDIOS ===');
        // const audioCache = this.cache.audio;
        
        // // Lista de todas las claves de audio que deberían estar
        // const audioKeys = [
        //     // Música
        //     'musica_inicio', 'musica_distancia', 'musica_recuerdos',
        //     'musica_conflicto', 'musica_confianza', 'musica_presente',
        //     // SFX
        //     'sfx_salto', 'sfx_escuchar', 'sfx_recuerdo', 'sfx_perdonar',
        //     'sfx_confiar', 'sfx_recuerdo_recolectado', 'sfx_enemigo_interactuar',
        //     'sfx_ui_click', 'sfx_ui_hover', 'sfx_texto', 'sfx_plataforma_rota',
        //     'sfx_portal', 'sfx_transicion'
        // ];
        
        // let audioSuccess = true;
        
        // audioKeys.forEach(key => {
        //     if (audioCache.has(key)) {
        //         const audio = audioCache.get(key);
        //         console.log(`✅ ${key}: ${audio.decoded ? 'DECODIFICADO' : 'Pendiente'}`);
        //     } else {
        //         console.error(`❌ ${key}: NO ENCONTRADO en caché`);
        //         audioSuccess = false;
        //     }
        // });
        
        // if (!audioSuccess) {
        //     console.warn('⚠️ Algunos audios no se cargaron. Verifica las rutas.');
        //     console.warn('Estructura esperada:');
        //     console.warn('- assets/audio/musica/*.ogg');
        //     console.warn('- assets/audio/sfx/*.wav');
        // } else {
        //     console.log('🎵 Todos los audios cargados correctamente');
        // }
        
        console.log('Preload completado, iniciando Menu');
        
        this.cameras.main.fadeOut(1000, 0, 0, 0);
        this.time.delayedCall(1000, () => {
            this.scene.start('Menu');
        });
    }
}