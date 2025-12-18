import Protagonista from '../../entities/Protagonista.js';
import Controles from '../../config/Controles.js';
import DialogoSystem from '../../systems/DialogoSystem.js';
import UISystem from '../../systems/UISystem.js';
import EfectosVisuales from '../../systems/EfectosVisuales.js';
import HabilidadManager from '../../managers/HabilidadManager.js';
import AudioManager from '../../managers/AudioManager.js';
import EnemigoEmocional from '../../entities/EnemigoEmocional.js';
import Memoria from '../../entities/Memoria.js';

export default class Inicio extends Phaser.Scene {
    constructor() {
        super({ key: 'Inicio' });
        
        this.jugador = null;
        this.controles = null;
        this.sistemas = {};
    }
    
    create() {
        console.log('Escena Inicio cargada');
        
        const datosJugador = this.registry.get('jugadorData');
        
        // ========== VERIFICAR SI HAY MAPA O USAR FALLBACK ==========
        const usarFallback = this.registry.get('mapa_inicio_fallback');
        
        if (usarFallback) {
            this.crearMapaFallback();
        } else {
            try {
                this.cargarMapa();
            } catch (error) {
                console.error('Error cargando mapa, usando fallback:', error);
                this.crearMapaFallback();
            }
        }
        
        // ========== CREAR JUGADOR ==========
        this.crearJugador(datosJugador);
        
        // ========== INICIALIZAR SISTEMAS ==========
        this.inicializarSistemas();
        
        // ========== CONFIGURAR CÁMARA ==========
        this.configurarCamara();
        
        // ========== CONFIGURAR EVENTOS ==========
        this.configurarEventos();
        
        // ========== MOSTRAR INTRODUCCIÓN ==========
        this.mostrarIntroduccion();
    }
    
    crearMapaFallback() {
        console.log('Usando mapa fallback para Inicio');
        
        // Fondo
        this.add.rectangle(640, 360, 2560, 720, 0x88ccff);
        
        // Suelo
        const suelo = this.add.rectangle(1280, 680, 2560, 80, 0x8b4513);
        this.physics.add.existing(suelo, true);
        
        // Plataformas de prueba
        const plataformas = [
            { x: 400, y: 600, w: 200, h: 20 },
            { x: 700, y: 500, w: 150, h: 20 },
            { x: 1000, y: 400, w: 200, h: 20 },
            { x: 1400, y: 500, w: 150, h: 20 }
        ];
        
        this.plataformasGrupo = this.physics.add.staticGroup();
        
        plataformas.forEach(p => {
            const plat = this.add.rectangle(p.x, p.y, p.w, p.h, 0x8b4513);
            this.physics.add.existing(plat, true);
            this.plataformasGrupo.add(plat);
        });
        
        // Guardar referencia para colisiones
        this.capas = {
            colisiones: this.plataformasGrupo,
            objetos: { objects: [] }
        };
        
        // Añadir spawn point virtual
        this.spawnPoint = { x: 100, y: 300 };
    }
    
    cargarMapa() {
        // Intentar cargar mapa Tiled
        try {
            this.mapa = this.make.tilemap({ key: 'mapa_inicio' });
            const tileset = this.mapa.addTilesetImage('tileset_emocional', 'tileset_emocional');
            
            if (!tileset) {
                throw new Error('Tileset no encontrado');
            }
            
            this.capas = {
                fondo: this.mapa.createLayer('fondo', tileset, 0, 0),
                plataformas: this.mapa.createLayer('plataformas', tileset, 0, 0),
                detalle: this.mapa.createLayer('detalle', tileset, 0, 0),
                colisiones: this.mapa.createLayer('colisiones', tileset, 0, 0),
                objetos: this.mapa.getObjectLayer('objetos')
            };
            
            // Configurar colisiones
            if (this.capas.colisiones) {
                this.capas.colisiones.setCollisionByProperty({ colisiona: true });
            }
            
            console.log('Mapa Tiled cargado correctamente');
        } catch (error) {
            throw error;
        }
    }
    
    crearJugador(datos) {
        // Determinar posición inicial
        let x, y;
        
        if (datos?.x && datos?.y) {
            x = datos.x;
            y = datos.y;
        } else if (this.capas?.objetos?.objects) {
            const spawn = this.capas.objetos.objects.find(obj => obj.type === 'spawn_jugador');
            x = spawn ? spawn.x : this.spawnPoint?.x || 100;
            y = spawn ? spawn.y : this.spawnPoint?.y || 300;
        } else {
            x = this.spawnPoint?.x || 100;
            y = this.spawnPoint?.y || 300;
        }
        
        this.jugador = new Protagonista(this, x, y);
        
        if (datos) {
            this.jugador.cargarDatos(datos);
        }
        
        // Configurar colisiones
        if (this.capas?.colisiones) {
            this.physics.add.collider(this.jugador, this.capas.colisiones);
        }
    }
    
    inicializarSistemas() {
        this.controles = new Controles(this);
        this.sistemas.dialogo = new DialogoSystem(this);
        this.sistemas.ui = new UISystem(this);
        this.sistemas.efectos = new EfectosVisuales(this);
        this.sistemas.habilidades = new HabilidadManager(this);
        this.sistemas.audio = new AudioManager(this);
        
        // Referencias rápidas
        this.dialogoSystem = this.sistemas.dialogo;
        this.uiSystem = this.sistemas.ui;
        this.efectosVisuales = this.sistemas.efectos;
        this.habilidadManager = this.sistemas.habilidades;
        this.audioManager = this.sistemas.audio;
    }
    
    configurarCamara() {
        this.cameras.main.startFollow(this.jugador, true, 0.08, 0.08);
        
        // Determinar límites según si hay mapa o fallback
        const width = this.mapa ? this.mapa.widthInPixels : 2560;
        const height = this.mapa ? this.mapa.heightInPixels : 720;
        
        this.cameras.main.setBounds(0, 0, width, height);
        this.cameras.main.setBackgroundColor(0x88ccff);
    }
    
    configurarEventos() {
        // Eventos para transición
        this.events.on('shutdown', () => {
            const guardadoManager = this.registry.get('guardadoManager');
            if (guardadoManager) {
                guardadoManager.actualizarProgreso(this);
                guardadoManager.guardar();
            }
        });
    }
    
    mostrarIntroduccion() {
        this.time.delayedCall(1500, () => {
            this.dialogoSystem.mostrar(
                "Todo comenzó aquí...\n\n" +
                "Un espacio donde éramos solo nosotros,\n" +
                "lleno de posibilidades y sueños compartidos.\n\n" +
                "Usa las flechas para moverte, ESPACIO para saltar.",
                this.jugador.x, this.jugador.y - 100,
                { nombre: 'El Inicio', autoAvanzar: true, tiempoAutoAvance: 5000 }
            );
        });
    }
    
    update() {
        if (!this.jugador) return;
        
        const input = this.controles.update();
        
        // Actualizar jugador
        this.jugador.update(input);
        
        // Actualizar sistemas
        if (this.uiSystem) this.uiSystem.update();
        if (this.efectosVisuales) this.efectosVisuales.update();
        
        // Verificar habilidades
        if (input.escuchar) {
            this.habilidadManager.usarHabilidad('escuchar');
        }
        
        if (input.recordar) {
            this.habilidadManager.usarHabilidad('recordar');
        }
        
        if (input.perdonar) {
            this.habilidadManager.usarHabilidad('perdonar');
        }
        
        // Pausa
        if (input.pausa) {
            this.uiSystem.togglePausa();
        }
        
        // Verificar transición a siguiente zona
        const limiteX = this.mapa ? this.mapa.widthInPixels : 2400;
        if (this.jugador.x > limiteX - 100) {
            this.transicionarAZona('Distancia');
        }
    }
    
    transicionarAZona(zona) {
        // Guardar datos
        const datosJugador = this.jugador.getDatosGuardado();
        this.registry.set('jugadorData', datosJugador);
        
        // Efecto de transición
        this.efectosVisuales.efectoTransicionZona('inicio', zona);
        
        this.time.delayedCall(1000, () => {
            this.scene.start(zona);
        });
    }
}