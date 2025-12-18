export default class Distancia extends Phaser.Scene {
    constructor() {
        super({ key: 'Distancia' });
        
        this.jugador = null;
        this.controles = null;
        this.vientoActivo = true;
        this.intensidadViento = 150;
        this.plataformasFragiles = [];
    }
    
    preload() {
        // Cargar assets específicos de esta zona
        this.load.image('tileset_distancia', 'assets/tilesets/distancia.png');
        this.load.tilemapTiledJSON('mapa_distancia', 'assets/mapas/distancia.json');
        this.load.image('plataforma_fragil', 'assets/sprites/plataforma_fragil.png');
        this.load.spritesheet('enemigo_duda', 'assets/sprites/enemigos/duda.png', {
            frameWidth: 32, frameHeight: 32
        });
    }
    
    create() {
        // Crear mapa
        const mapa = this.make.tilemap({ key: 'mapa_distancia' });
        const tileset = mapa.addTilesetImage('distancia', 'tileset_distancia');
        
        // Capas
        const capaFondo = mapa.createLayer('fondo', tileset, 0, 0);
        const capaPlataformas = mapa.createLayer('plataformas', tileset, 0, 0);
        const capaColisiones = mapa.createLayer('colisiones', tileset, 0, 0);
        
        // Configurar colisiones
        capaColisiones.setCollisionByProperty({ colisiona: true });
        
        // Aplicar efecto visual de distancia
        this.aplicarEfectoDistancia();
        
        // Crear jugador
        this.jugador = new Protagonista(this, 100, 300);
        this.add.existing(this.jugador);
        this.physics.add.existing(this.jugador);
        
        // Colisiones
        this.physics.add.collider(this.jugador, capaColisiones);
        
        // Crear enemigos de duda
        this.crearEnemigosDuda(mapa);
        
        // Crear plataformas frágiles
        this.crearPlataformasFragiles(mapa);
        
        // Sistema de viento
        this.crearSistemaViento();
        
        // Controles
        this.controles = this.input.keyboard.createCursorKeys();
        
        // Evento para habilidad "Escuchar"
        this.input.keyboard.on('keydown-E', () => {
            if (this.jugador.habilidades.escuchar) {
                this.jugador.usarHabilidad('escuchar');
            }
        });
        
        // Cámara
        this.cameras.main.startFollow(this.jugador);
        this.cameras.main.setBounds(0, 0, mapa.widthInPixels, mapa.heightInPixels);
        
        // Música
        this.sonidoFondo = this.sound.add('musica_distancia', {
            volume: 0.3,
            loop: true
        });
        this.sonidoFondo.play();
        
        // UI
        this.crearUI();
    }
    
    aplicarEfectoDistancia() {
        // Aplicar desenfoque a capas lejanas
        this.children.list.forEach(child => {
            if (child.type === 'TilemapLayer' && child.layer.name === 'fondo') {
                child.setAlpha(0.6);
                
                // Efecto de parallax
                child.setScrollFactor(0.5);
            }
        });
        
        // Partículas de polvo/viento
        this.particulasViento = this.add.particles('particula_viento');
        this.emitterViento = this.particulasViento.createEmitter({
            x: { min: 0, max: 1280 },
            y: 0,
            speedY: { min: 100, max: 300 },
            speedX: { min: -50, max: -200 },
            scale: { start: 0.5, end: 0 },
            lifespan: 2000,
            quantity: 5,
            frequency: 100
        });
    }
    
    crearEnemigosDuda(mapa) {
        const objetos = mapa.getObjectLayer('enemigos').objects;
        
        objetos.forEach(obj => {
            const duda = new EnemigoEmocional(this, obj.x, obj.y, 'duda');
            this.add.existing(duda);
            this.physics.add.existing(duda);
            
            // Configurar físicas
            duda.body.setCollideWorldBounds(true);
            duda.body.setBounce(0.2);
            
            // Movimiento errático (como la duda)
            this.time.addEvent({
                delay: Phaser.Math.Between(1000, 3000),
                callback: () => {
                    if (!duda.resuelto) {
                        duda.setVelocityX(Phaser.Math.Between(-80, 80));
                    }
                },
                loop: true
            });
        });
    }
    
    crearPlataformasFragiles(mapa) {
        const objetos = mapa.getObjectLayer('plataformas_fragiles').objects;
        
        objetos.forEach(obj => {
            const plataforma = this.physics.add.sprite(obj.x, obj.y, 'plataforma_fragil');
            plataforma.setOrigin(0, 0);
            plataforma.resistencia = 3;
            
            // Hacerla estática
            plataforma.body.setImmovable(true);
            plataforma.body.allowGravity = false;
            
            // Colisión con jugador
            this.physics.add.collider(this.jugador, plataforma, () => {
                this.danarPlataforma(plataforma);
            });
            
            this.plataformasFragiles.push(plataforma);
        });
    }
    
    danarPlataforma(plataforma) {
        if (plataforma.resistencia <= 0) return;
        
        plataforma.resistencia--;
        
        // Efecto visual
        this.tweens.add({
            targets: plataforma,
            alpha: 0.5,
            duration: 100,
            yoyo: true
        });
        
        if (plataforma.resistencia <= 0) {
            // Destruir plataforma
            this.tweens.add({
                targets: plataforma,
                alpha: 0,
                scale: 0,
                duration: 500,
                onComplete: () => {
                    plataforma.destroy();
                    this.plataformasFragiles = this.plataformasFragiles.filter(p => p !== plataforma);
                }
            });
            
            // Sonido
            this.sound.play('sfx_plataforma_rota', { volume: 0.3 });
        }
    }
    
    crearSistemaViento() {
        // Zonas de viento (definidas en Tiled)
        this.zonaViento = this.physics.add.staticGroup();
        
        // El viento empuja al jugador hacia atrás
        this.time.addEvent({
            delay: 100,
            callback: () => {
                if (this.vientoActivo && this.jugador) {
                    // Aplicar fuerza constante hacia la izquierda
                    this.jugador.body.velocity.x -= this.intensidadViento * 0.01;
                    
                    // Efecto visual de partículas
                    this.emitterViento.setPosition(this.jugador.x + 100, this.jugador.y - 100);
                }
            },
            loop: true
        });
    }
    
    crearUI() {
        // Indicador de viento
        this.textoViento = this.add.text(20, 20, 'Viento fuerte', {
            fontFamily: 'PixelFont',
            fontSize: '16px',
            color: '#88aaff'
        }).setScrollFactor(0);
        
        // Indicador de confianza
        this.barraConfianza = this.add.rectangle(1200, 30, 200, 20, 0x444444)
            .setScrollFactor(0)
            .setOrigin(0.5);
        
        this.rellenoConfianza = this.add.rectangle(1100, 30, 0, 16, 0x88ff88)
            .setScrollFactor(0)
            .setOrigin(0, 0.5);
    }
    
    update() {
        if (!this.jugador) return;
        
        // Actualizar jugador
        this.jugador.update(this.controles);
        
        // Actualizar barra de confianza
        const anchoConfianza = (this.jugador.confianza / 100) * 180;
        this.rellenoConfianza.width = anchoConfianza;
        
        // Efecto de viento en partículas
        if (this.vientoActivo) {
            this.textoViento.setText(`Viento fuerte: ${Math.round(this.intensidadViento)}`);
            
            // Parpadeo del texto
            if (Phaser.Math.Between(0, 100) > 90) {
                this.textoViento.setAlpha(0.7);
            } else {
                this.textoViento.setAlpha(1);
            }
        }
        
        // Verificar si el jugador alcanzó el final de la zona
        if (this.jugador.x > 2400) {
            this.transicionarAZona('Recuerdos');
        }
    }
    
    transicionarAZona(zona) {
        // Guardar progreso
        const datos = {
            confianza: this.jugador.confianza,
            habilidades: this.jugador.habilidades,
            x: 100, // Posición inicial en la nueva zona
            y: 300
        };
        
        this.registry.set('jugador', datos);
        
        // Transición
        this.scene.get('EfectosVisuales').transicionEmocional('Distancia', zona);
    }
}