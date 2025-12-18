import Protagonista from '../../entities/Protagonista.js';
import Controles from '../../config/Controles.js';
import DialogoSystem from '../../systems/DialogoSystem.js';
import UISystem from '../../systems/UISystem.js';
import EfectosVisuales from '../../systems/EfectosVisuales.js';
import HabilidadManager from '../../managers/HabilidadManager.js';
import AudioManager from '../../managers/AudioManager.js';
import EnemigoEmocional from '../../entities/EnemigoEmocional.js';
import Memoria from '../../entities/Memoria.js';

export default class Conflicto extends Phaser.Scene {
    constructor() {
        super({ key: 'Conflicto' });
        
        this.jugador = null;
        this.controles = null;
        this.sistemas = {};
        this.nivelTension = 0;
        this.enemigosActivos = [];
        this.plataformasInestables = [];
    }
    
    create() {
        console.log('Cargando zona: El Conflicto');
        
        const datosJugador = this.registry.get('jugadorData');
        
        // ========== CARGAR MAPA ==========
        this.cargarMapa();
        
        // ========== CREAR JUGADOR ==========
        this.crearJugador(datosJugador);
        
        // ========== INICIALIZAR SISTEMAS ==========
        this.inicializarSistemas();
        
        // ========== CONFIGURAR ZONA DE CONFLICTO ==========
        this.configurarZonaConflicto();
        
        // ========== CONFIGURAR CÁMARA ==========
        this.configurarCamara();
        
        // ========== CONFIGURAR EVENTOS ==========
        this.configurarEventos();
        
        // ========== INICIAR SISTEMA DE TENSIÓN ==========
        this.iniciarSistemaTension();
    }
    
    cargarMapa() {
        this.mapa = this.make.tilemap({ key: 'mapa_conflicto' });
        const tileset = this.mapa.addTilesetImage('tileset_emocional', 'tileset_emocional');
        
        this.capas = {
            fondo: this.mapa.createLayer('fondo', tileset, 0, 0),
            plataformas: this.mapa.createLayer('plataformas', tileset, 0, 0),
            detalle: this.mapa.createLayer('detalle', tileset, 0, 0),
            colisiones: this.mapa.createLayer('colisiones', tileset, 0, 0),
            objetos: this.mapa.getObjectLayer('objetos'),
            peligro: this.mapa.createLayer('peligro', tileset, 0, 0)
        };
        
        // Configurar colisiones
        if (this.capas.colisiones) {
            this.capas.colisiones.setCollisionByProperty({ colisiona: true });
        }
        
        // Configurar zona de peligro (daño)
        if (this.capas.peligro) {
            this.capas.peligro.setAlpha(0.5).setTint(0xff0000);
        }
        
        // Tinte rojizo para la zona de conflicto
        const tint = 0xff8888;
        this.capas.fondo.setTint(tint);
        this.capas.plataformas.setTint(tint);
        this.capas.detalle.setTint(tint);
        
        // Efecto de tensión visual
        this.capas.fondo.setAlpha(0.8);
        this.capas.detalle.setAlpha(0.7);
    }
    
    crearJugador(datos) {
        const spawn = this.capas.objetos.objects.find(obj => obj.type === 'spawn_jugador');
        const x = datos?.x || (spawn ? spawn.x : 100);
        const y = datos?.y || (spawn ? spawn.y : 300);
        
        this.jugador = new Protagonista(this, x, y);
        
        if (datos) {
            this.jugador.cargarDatos(datos);
        }
        
        // Configurar colisiones
        this.physics.add.collider(this.jugador, this.capas.colisiones);
        
        // Colisión con zona de peligro
        if (this.capas.peligro) {
            this.physics.add.overlap(this.jugador, this.capas.peligro, () => {
                this.recibirDano();
            });
        }
    }
    
    inicializarSistemas() {
        this.controles = new Controles(this);
        this.sistemas.dialogo = new DialogoSystem(this);
        this.sistemas.ui = new UISystem(this);
        this.sistemas.efectos = new EfectosVisuales(this);
        this.sistemas.habilidades = new HabilidadManager(this);
        this.sistemas.audio = new AudioManager(this);
        
        this.dialogoSystem = this.sistemas.dialogo;
        this.uiSystem = this.sistemas.ui;
        this.efectosVisuales = this.sistemas.efectos;
        this.habilidadManager = this.sistemas.habilidades;
        this.audioManager = this.sistemas.audio;
        
        // Aplicar filtro de tensión
        this.efectosVisuales.aplicarFiltroEmocional('tension');
    }
    
    configurarZonaConflicto() {
        // Crear enemigos de celos
        this.crearEnemigosCelos();
        
        // Crear plataformas inestables
        this.crearPlataformasInestables();
        
        // Crear obstáculos emocionales
        this.crearObstaculosEmocionales();
        
        // Efectos de partículas de conflicto
        this.crearParticulasConflicto();
    }
    
    crearEnemigosCelos() {
        if (!this.capas.objetos) return;
        
        this.capas.objetos.objects.forEach(obj => {
            if (obj.type === 'enemigo_celos') {
                const enemigo = new EnemigoEmocional(this, obj.x, obj.y, 'celos');
                
                // Configurar comportamiento agresivo
                enemigo.config.velocidad = 150; // Más rápido que lo normal
                enemigo.radioDeteccion = 300; // Mayor rango de detección
                
                // Configurar colisiones
                this.physics.add.collider(enemigo, this.capas.colisiones);
                this.physics.add.collider(this.jugador, enemigo, (jugador, enemigoObj) => {
                    // En el conflicto, los enemigos son más difíciles de calmar
                    enemigoObj.interactuar();
                    this.aumentarTension(10);
                });
                
                this.enemigosActivos.push(enemigo);
            }
        });
    }
    
    crearPlataformasInestables() {
        if (!this.capas.objetos) return;
        
        this.capas.objetos.objects.forEach(obj => {
            if (obj.type === 'plataforma_inestable') {
                const plataforma = this.physics.add.sprite(obj.x, obj.y, 'plataforma_fragil');
                plataforma.setImmovable(true);
                plataforma.setData('resistencia', 3);
                plataforma.setData('temblando', false);
                
                // Colisión con jugador
                this.physics.add.collider(this.jugador, plataforma, () => {
                    this.danarPlataforma(plataforma);
                });
                
                this.plataformasInestables.push(plataforma);
            }
        });
    }
    
    crearObstaculosEmocionales() {
        if (!this.capas.objetos) return;
        
        this.capas.objetos.objects.forEach(obj => {
            if (obj.type === 'obstaculo_emocional') {
                const obstaculo = this.physics.add.sprite(obj.x, obj.y, null);
                obstaculo.setAlpha(0).setData('tipo', obj.properties?.tipo || 'duda');
                
                // Crear zona de colisión
                this.physics.add.existing(obstaculo);
                obstaculo.body.setSize(obj.width, obj.height);
                
                // Efecto visual
                const efecto = this.add.graphics();
                efecto.lineStyle(2, 0xff4444, 0.3);
                efecto.strokeRect(obj.x, obj.y, obj.width, obj.height);
                
                // Overlap con jugador
                this.physics.add.overlap(this.jugador, obstaculo, () => {
                    const tipo = obstaculo.getData('tipo');
                    this.mostrarDialogoObstaculo(tipo, obstaculo.x, obstaculo.y);
                    this.aumentarTension(5);
                });
            }
        });
    }
    
    crearParticulasConflicto() {
        // Partículas de chispas/energía negativa
        const particulas = this.add.particles('particula_emocion');
        
        const emitter = particulas.createEmitter({
            x: { min: 0, max: this.mapa.widthInPixels },
            y: { min: 0, max: this.mapa.heightInPixels },
            speed: { min: 20, max: 80 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.2, end: 0 },
            alpha: { start: 0.3, end: 0 },
            tint: 0xff4444,
            blendMode: 'ADD',
            lifespan: 1000,
            quantity: 0.3,
            frequency: 1000
        });
        
        this.particulasConflicto = { particulas, emitter };
    }
    
    configurarCamara() {
        this.cameras.main.startFollow(this.jugador, true, 0.08, 0.08);
        this.cameras.main.setBounds(0, 0, this.mapa.widthInPixels, this.mapa.heightInPixels);
        this.cameras.main.setBackgroundColor(0x442222);
        
        // Temblor leve de cámara para tensión
        this.cameras.main.shake(10000, 0.001);
    }
    
    configurarEventos() {
        // Evento para habilidad "Perdonar"
        this.events.on('habilidadDesbloqueadaCompleta', (habilidad) => {
            if (habilidad.nombre === 'Perdonar') {
                this.dialogoSystem.mostrar(
                    "El perdón puede calmar la tormenta.\n\n" +
                    "Usa la habilidad 'Perdonar' cerca de enemigos\n" +
                    "para transformar su ira en entendimiento.",
                    640, 300,
                    { nombre: 'Revelación', pausarJuego: true }
                );
            }
        });
        
        // Evento de shutdown
        this.events.on('shutdown', () => {
            const guardadoManager = this.registry.get('guardadoManager');
            if (guardadoManager) {
                guardadoManager.actualizarProgreso(this);
                guardadoManager.guardar();
            }
        });
    }
    
    iniciarSistemaTension() {
        this.nivelTension = 0;
        
        // Mostrar mensaje inicial
        this.time.delayedCall(1000, () => {
            this.dialogoSystem.mostrar(
                "La tensión se siente en el aire...\n\n" +
                "Cada paso es incierto, cada palabra pesa.\n" +
                "¿Podremos encontrar el camino a través del conflicto?",
                this.jugador.x, this.jugador.y - 100,
                { nombre: 'El Conflicto', autoAvanzar: true, tiempoAutoAvance: 4000 }
            );
        });
        
        // Sistema que aumenta la tensión con el tiempo
        this.time.addEvent({
            delay: 5000,
            callback: () => {
                if (this.nivelTension < 100) {
                    this.aumentarTension(1);
                }
            },
            loop: true
        });
    }
    
    // ========== MECÁNICAS DE CONFLICTO ==========
    
    aumentarTension(cantidad) {
        this.nivelTension = Phaser.Math.Clamp(this.nivelTension + cantidad, 0, 100);
        
        // Actualizar efectos según nivel de tensión
        this.actualizarEfectosTension();
        
        // Emitir evento para UI si es necesario
        this.events.emit('cambioTension', this.nivelTension);
    }
    
    actualizarEfectosTension() {
        // Ajustar efectos visuales según tensión
        const intensidad = this.nivelTension / 100;
        
        // Temblor de cámara
        this.cameras.main.shakeEffect.reset();
        this.cameras.main.shake(100, 0.001 * intensidad);
        
        // Color de tint
        const tintValue = Math.floor(0xff * intensidad);
        const tint = Phaser.Display.Color.GetColor(0xff, 0xff - tintValue, 0xff - tintValue);
        
        this.capas.fondo.setTint(tint);
        this.capas.plataformas.setTint(tint);
        
        // Velocidad de enemigos
        const velocidadExtra = 50 * intensidad;
        this.enemigosActivos.forEach(enemigo => {
            if (!enemigo.resuelto) {
                enemigo.config.velocidad = 150 + velocidadExtra;
            }
        });
        
        // Intensidad de partículas
        if (this.particulasConflicto && this.particulasConflicto.emitter) {
            this.particulasConflicto.emitter.setQuantity(0.3 + (intensidad * 0.7));
        }
    }
    
    danarPlataforma(plataforma) {
        if (plataforma.getData('temblando')) return;
        
        let resistencia = plataforma.getData('resistencia');
        resistencia--;
        
        if (resistencia <= 0) {
            // Destruir plataforma
            this.destruirPlataforma(plataforma);
        } else {
            // Dañar plataforma
            plataforma.setData('resistencia', resistencia);
            plataforma.setData('temblando', true);
            
            // Efecto visual
            this.tweens.add({
                targets: plataforma,
                alpha: 0.5,
                duration: 200,
                yoyo: true,
                onComplete: () => {
                    plataforma.setData('temblando', false);
                }
            });
            
            // Sonido
            this.sound.play('sfx_plataforma_rota', { volume: 0.3 });
            
            // Aumentar tensión
            this.aumentarTension(5);
        }
    }
    
    destruirPlataforma(plataforma) {
        // Efecto de destrucción
        this.tweens.add({
            targets: plataforma,
            alpha: 0,
            scale: 0,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                plataforma.destroy();
                
                // Remover de la lista
                const index = this.plataformasInestables.indexOf(plataforma);
                if (index > -1) {
                    this.plataformasInestables.splice(index, 1);
                }
            }
        });
        
        // Partículas
        this.efectosVisuales.efectoInteraccion(plataforma.x, plataforma.y, 'plataforma');
        
        // Aumentar tensión
        this.aumentarTension(10);
    }
    
    recibirDano() {
        // El jugador no tiene salud, pero pierde confianza
        this.jugador.confianza = Phaser.Math.Clamp(this.jugador.confianza - 5, 0, 100);
        this.events.emit('cambioConfianza', this.jugador.confianza);
        
        // Efecto visual
        this.efectosVisuales.efectoDano(this.jugador.x, this.jugador.y);
        
        // Aumentar tensión
        this.aumentarTension(15);
        
        // Sonido
        this.sound.play('sfx_plataforma_rota', { volume: 0.5 });
    }
    
    mostrarDialogoObstaculo(tipo, x, y) {
        const dialogos = {
            duda: "¿Por qué siempre tienes que tener la razón?",
            celos: "Siento que prefieres a otras personas",
            miedo: "Tengo miedo de que esto no funcione",
            silencio: "..."
        };
        
        this.dialogoSystem.mostrar(
            dialogos[tipo] || "Algo duele...",
            x, y - 50,
            { nombre: tipo.charAt(0).toUpperCase() + tipo.slice(1), autoAvanzar: true, tiempoAutoAvance: 2000 }
        );
    }
    
    // ========== TRANSFORMACIÓN CON PERDÓN ==========
    
    transformarEnemigosCercanos(x, y, radio) {
        let transformados = 0;
        
        this.enemigosActivos.forEach(enemigo => {
            if (enemigo.resuelto) return;
            
            const distancia = Phaser.Math.Distance.Between(x, y, enemigo.x, enemigo.y);
            if (distancia < radio) {
                enemigo.calmar();
                transformados++;
                
                // Reducir tensión por cada enemigo calmado
                this.aumentarTension(-20);
            }
        });
        
        if (transformados > 0) {
            this.dialogoSystem.mostrarDialogoSistema(
                `${transformados} enemigo(s) transformado(s) con perdón`,
                'exito'
            );
        }
        
        return transformados;
    }
    
    // ========== UPDATE ==========
    
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
            const usada = this.habilidadManager.usarHabilidad('perdonar');
            if (usada) {
                this.transformarEnemigosCercanos(this.jugador.x, this.jugador.y, 150);
            }
        }
        
        // Pausa
        if (input.pausa) {
            this.uiSystem.togglePausa();
        }
        
        // Verificar si la tensión es muy alta
        if (this.nivelTension >= 80 && !this.alertaAltaTension) {
            this.alertaAltaTension = true;
            this.mostrarAlertaAltaTension();
        }
        
        // Verificar transición a siguiente zona
        if (this.jugador.x > this.mapa.widthInPixels - 100) {
            this.transicionarAZona('Confianza');
        }
    }
    
    mostrarAlertaAltaTension() {
        this.dialogoSystem.mostrar(
            "La tensión es demasiado alta...\n\n" +
            "Necesitas encontrar una forma de calmarla\n" +
            "antes de que sea demasiado.",
            640, 300,
            { nombre: 'Alerta', color: 0xff0000, pausarJuego: true }
        );
    }
    
    transicionarAZona(zona) {
        // Si la tensión es muy alta, no permitir salir
        if (this.nivelTension > 70) {
            this.dialogoSystem.mostrar(
                "No puedes avanzar con tanta tensión.\n\n" +
                "Necesitas resolver algunos conflictos primero.",
                this.jugador.x, this.jugador.y - 100,
                { nombre: 'Bloqueado', autoAvanzar: true, tiempoAutoAvance: 3000 }
            );
            return;
        }
        
        // Guardar datos
        const datosJugador = this.jugador.getDatosGuardado();
        this.registry.set('jugadorData', datosJugador);
        
        // Efecto de transición
        this.efectosVisuales.efectoTransicionZona('conflicto', zona);
        
        this.time.delayedCall(1000, () => {
            this.scene.start(zona);
        });
    }
}