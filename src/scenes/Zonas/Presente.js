import Protagonista from '../../entities/Protagonista.js';
import Controles from '../../config/Controles.js';
import DialogoSystem from '../../systems/DialogoSystem.js';
import UISystem from '../../systems/UISystem.js';
import EfectosVisuales from '../../systems/EfectosVisuales.js';
import HabilidadManager from '../../managers/HabilidadManager.js';
import AudioManager from '../../managers/AudioManager.js';
import EnemigoEmocional from '../../entities/EnemigoEmocional.js';
import Memoria from '../../entities/Memoria.js';

export default class Presente extends Phaser.Scene {
    constructor() {
        super({ key: 'Presente' });
        
        this.jugador = null;
        this.controles = null;
        this.sistemas = {};
        this.areasReflexion = [];
        this.eleccionesFinales = [];
        this.finalAlcanzado = null;
    }
    
    create() {
        console.log('Cargando zona: El Presente');
        
        const datosJugador = this.registry.get('jugadorData');
        
        // ========== CARGAR MAPA ==========
        this.cargarMapa();
        
        // ========== CREAR JUGADOR ==========
        this.crearJugador(datosJugador);
        
        // ========== INICIALIZAR SISTEMAS ==========
        this.inicializarSistemas();
        
        // ========== CONFIGURAR ZONA DEL PRESENTE ==========
        this.configurarZonaPresente();
        
        // ========== CONFIGURAR CÁMARA ==========
        this.configurarCamara();
        
        // ========== CONFIGURAR EVENTOS ==========
        this.configurarEventos();
        
        // ========== MOSTRAR MENSAJE FINAL ==========
        this.mostrarMensajeBienvenida();
    }
    
    cargarMapa() {
        this.mapa = this.make.tilemap({ key: 'mapa_presente' });
        const tileset = this.mapa.addTilesetImage('tileset_emocional', 'tileset_emocional');
        
        this.capas = {
            fondo: this.mapa.createLayer('fondo', tileset, 0, 0),
            plataformas: this.mapa.createLayer('plataformas', tileset, 0, 0),
            detalle: this.mapa.createLayer('detalle', tileset, 0, 0),
            colisiones: this.mapa.createLayer('colisiones', tileset, 0, 0),
            objetos: this.mapa.getObjectLayer('objetos'),
            futuro: this.mapa.createLayer('futuro', tileset, 0, 0)
        };
        
        // Configurar colisiones
        if (this.capas.colisiones) {
            this.capas.colisiones.setCollisionByProperty({ colisiona: true });
        }
        
        // Capa de futuro inicialmente invisible
        if (this.capas.futuro) {
            this.capas.futuro.setVisible(false).setAlpha(0);
        }
        
        // Sin tint (colores naturales)
        this.capas.fondo.clearTint();
        this.capas.plataformas.clearTint();
        this.capas.detalle.clearTint();
        
        // Claridad máxima
        this.capas.fondo.setAlpha(1);
        this.capas.plataformas.setAlpha(1);
        this.capas.detalle.setAlpha(0.9);
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
        
        // Aplicar filtro de paz
        this.efectosVisuales.aplicarFiltroEmocional('paz');
        
        // Ocultar algunas UI elements para la experiencia final
        this.time.delayedCall(2000, () => {
            if (this.uiSystem.barraConfianza) {
                this.uiSystem.barraConfianza.setAlpha(0.3);
            }
        });
    }
    
    configurarZonaPresente() {
        // Crear áreas de reflexión
        this.crearAreasReflexion();
        
        // Crear elecciones finales
        this.crearEleccionesFinales();
        
        // Crear portal final
        this.crearPortalFinal();
        
        // Efectos de partículas de paz
        this.crearParticulasPaz();
    }
    
    crearAreasReflexion() {
        if (!this.capas.objetos) return;
        
        this.capas.objetos.objects.forEach(obj => {
            if (obj.type === 'area_reflexion') {
                this.crearAreaReflexion(obj);
            }
        });
    }
    
    crearAreaReflexion(obj) {
        const area = this.add.zone(obj.x, obj.y, obj.width, obj.height);
        area.setData('tipo', 'reflexion');
        area.setData('visitada', false);
        area.setData('dialogo', obj.properties?.dialogo || 'Un momento para reflexionar...');
        area.setData('tema', obj.properties?.tema || 'general');
        
        // Indicador visual sutil
        const indicador = this.add.graphics();
        indicador.lineStyle(1, 0xffffff, 0.2);
        indicador.strokeRect(obj.x, obj.y, obj.width, obj.height);
        
        // Overlap con jugador
        this.physics.add.overlap(this.jugador, area, (jugador, areaObj) => {
            if (!areaObj.getData('visitada')) {
                this.activarAreaReflexion(areaObj, indicador);
            }
        });
        
        this.areasReflexion.push({ area, indicador });
    }
    
    activarAreaReflexion(area, indicador) {
        area.setData('visitada', true);
        
        // Mostrar diálogo de reflexión
        const tema = area.getData('tema');
        const dialogos = {
            inicio: "Recuerdo el comienzo, lleno de esperanza y miedo.",
            distancia: "Los silencios que nos separaron también nos enseñaron a escuchar.",
            recuerdos: "Cada memoria, feliz o triste, nos hizo quienes somos.",
            conflicto: "Las discusiones fueron difíciles, pero necesarias para crecer.",
            confianza: "Aprender a confiar fue nuestro mayor logro.",
            futuro: "¿Qué nos depara el camino que elegimos?"
        };
        
        const dialogo = dialogos[tema] || area.getData('dialogo');
        
        this.dialogoSystem.mostrar(
            dialogo,
            area.x + area.width/2, area.y + area.height/2 - 50,
            { nombre: 'Reflexión', autoAvanzar: true, tiempoAutoAvance: 5000 }
        );
        
        // Efecto visual
        indicador.clear();
        indicador.lineStyle(2, 0xffffff, 0.5);
        indicador.strokeRect(area.x, area.y, area.width, area.height);
        indicador.fillStyle(0xffffff, 0.1);
        indicador.fillRect(area.x, area.y, area.width, area.height);
        
        // Aumentar confianza
        this.jugador.confianza = Phaser.Math.Clamp(this.jugador.confianza + 5, 0, 100);
        this.events.emit('cambioConfianza', this.jugador.confianza);
    }
    
    crearEleccionesFinales() {
        if (!this.capas.objetos) return;
        
        this.capas.objetos.objects.forEach(obj => {
            if (obj.type === 'eleccion_final') {
                this.crearEleccionFinal(obj);
            }
        });
    }
    
    crearEleccionFinal(obj) {
        const eleccion = this.add.zone(obj.x, obj.y, obj.width, obj.height);
        eleccion.setData('tipo', 'eleccion');
        eleccion.setData('tomada', false);
        eleccion.setData('opcion', obj.properties?.opcion || 'A');
        eleccion.setData('consecuencia', obj.properties?.consecuencia || 'neutral');
        eleccion.setData('dialogo', obj.properties?.dialogo || 'Una elección importante...');
        
        // Indicador visual
        const color = this.getColorConsecuencia(eleccion.getData('consecuencia'));
        const indicador = this.add.graphics();
        indicador.lineStyle(2, color, 0.5);
        indicador.strokeRect(obj.x, obj.y, obj.width, obj.height);
        
        // Texto
        const texto = this.add.text(
            obj.x + obj.width/2,
            obj.y + obj.height/2,
            `Opción ${eleccion.getData('opcion')}`,
            {
                fontFamily: 'Courier New',
                fontSize: '16px',
                color: Phaser.Display.Color.IntegerToColor(color).rgba,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                padding: { x: 10, y: 5 }
            }
        ).setOrigin(0.5).setAlpha(0.7);
        
        // Overlap con jugador
        this.physics.add.overlap(this.jugador, eleccion, (jugador, eleccionObj) => {
            if (!eleccionObj.getData('tomada')) {
                this.presentarEleccionFinal(eleccionObj, indicador, texto);
            }
        });
        
        this.eleccionesFinales.push({ eleccion, indicador, texto });
    }
    
    getColorConsecuencia(consecuencia) {
        const colores = {
            positiva: 0x2ecc71, // Verde
            negativa: 0xe74c3c, // Rojo
            neutral: 0x3498db, // Azul
            mixta: 0x9b59b6   // Púrpura
        };
        
        return colores[consecuencia] || colores.neutral;
    }
    
    presentarEleccionFinal(eleccion, indicador, texto) {
        // Mostrar diálogo de la elección
        this.dialogoSystem.mostrar(
            eleccion.getData('dialogo') + "\n\n" +
            "¿Qué camino eliges?",
            eleccion.x + eleccion.width/2, eleccion.y + eleccion.height/2 - 50,
            { 
                nombre: 'Elección Importante', 
                pausarJuego: true,
                callback: () => {
                    this.mostrarMenuEleccion(eleccion, indicador, texto);
                }
            }
        );
    }
    
    mostrarMenuEleccion(eleccion, indicador, texto) {
        // Crear menú de elección
        const centerX = eleccion.x + eleccion.width/2;
        const centerY = eleccion.y + eleccion.height/2;
        
        const menu = this.add.container(centerX, centerY);
        
        const fondo = this.add.rectangle(0, 0, 300, 150, 0x000000, 0.9)
            .setStrokeStyle(2, 0xffffff);
        
        const pregunta = this.add.text(0, -40, "¿Qué eliges?", {
            fontFamily: 'Courier New',
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        // Opciones
        const opcion1 = this.add.text(-70, 20, "Aceptar", {
            fontFamily: 'Courier New',
            fontSize: '16px',
            color: '#aaaaaa',
            backgroundColor: 'rgba(52, 152, 219, 0.3)',
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5).setInteractive();
        
        const opcion2 = this.add.text(70, 20, "Reflexionar", {
            fontFamily: 'Courier New',
            fontSize: '16px',
            color: '#aaaaaa',
            backgroundColor: 'rgba(52, 152, 219, 0.3)',
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5).setInteractive();
        
        // Efectos hover
        [opcion1, opcion2].forEach(opcion => {
            opcion.on('pointerover', () => {
                opcion.setStyle({ color: '#ffffff' });
            });
            
            opcion.on('pointerout', () => {
                opcion.setStyle({ color: '#aaaaaa' });
            });
        });
        
        // Acciones
        opcion1.on('pointerdown', () => {
            this.tomarEleccion(eleccion, 'aceptar', menu, indicador, texto);
        });
        
        opcion2.on('pointerdown', () => {
            this.tomarEleccion(eleccion, 'reflexionar', menu, indicador, texto);
        });
        
        menu.add([fondo, pregunta, opcion1, opcion2]);
        menu.setDepth(1000);
    }
    
    tomarEleccion(eleccion, decision, menu, indicador, texto) {
        // Destruir menú
        menu.destroy();
        
        // Marcar elección como tomada
        eleccion.setData('tomada', true);
        eleccion.setData('decision', decision);
        
        // Actualizar indicador
        const color = decision === 'aceptar' ? 0x2ecc71 : 0x3498db;
        indicador.clear();
        indicador.lineStyle(2, color, 0.8);
        indicador.strokeRect(eleccion.x, eleccion.y, eleccion.width, eleccion.height);
        indicador.fillStyle(color, 0.2);
        indicador.fillRect(eleccion.x, eleccion.y, eleccion.width, eleccion.height);
        
        // Actualizar texto
        texto.setText(decision === 'aceptar' ? 'Aceptado' : 'Reflexionado')
            .setColor(Phaser.Display.Color.IntegerToColor(color).rgba)
            .setAlpha(1);
        
        // Efecto según consecuencia
        const consecuencia = eleccion.getData('consecuencia');
        this.aplicarConsecuenciaEleccion(consecuencia, decision);
        
        // Mostrar mensaje
        const mensajes = {
            positiva: "Has elegido el camino del crecimiento.",
            negativa: "Esta elección tendrá sus consecuencias.",
            neutral: "Has tomado una decisión equilibrada.",
            mixta: "Como todo en la vida, esta elección tiene luces y sombras."
        };
        
        this.dialogoSystem.mostrarDialogoSistema(
            mensajes[consecuencia] || "Elección registrada.",
            consecuencia === 'negativa' ? 'advertencia' : 'info'
        );
        
        // Reanudar juego
        this.physics.resume();
    }
    
    aplicarConsecuenciaEleccion(consecuencia, decision) {
        // Afectar la confianza del jugador según la elección
        let cambio = 0;
        
        if (consecuencia === 'positiva' && decision === 'aceptar') {
            cambio = 20;
        } else if (consecuencia === 'negativa' && decision === 'aceptar') {
            cambio = -15;
        } else if (consecuencia === 'neutral') {
            cambio = 5;
        } else if (consecuencia === 'mixta') {
            cambio = decision === 'aceptar' ? 10 : -5;
        } else {
            cambio = 0;
        }
        
        this.jugador.confianza = Phaser.Math.Clamp(this.jugador.confianza + cambio, 0, 100);
        this.events.emit('cambioConfianza', this.jugador.confianza);
        
        // Efecto visual
        if (cambio > 0) {
            this.efectosVisuales.efectoCuracion(this.jugador.x, this.jugador.y);
        } else if (cambio < 0) {
            this.efectosVisuales.efectoDano(this.jugador.x, this.jugador.y);
        }
    }
    
    crearPortalFinal() {
        if (!this.capas.objetos) return;
        
        const portalObj = this.capas.objetos.objects.find(obj => obj.type === 'portal_final');
        if (!portalObj) return;
        
        this.portalFinal = this.physics.add.sprite(portalObj.x, portalObj.y, null);
        this.portalFinal.setData('activado', false);
        
        // Efecto visual del portal
        const particulas = this.add.particles('particula_emocion');
        
        this.portalEmitter = particulas.createEmitter({
            x: portalObj.x,
            y: portalObj.y,
            speed: { min: 20, max: 100 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.3, end: 0 },
            alpha: { start: 0.5, end: 0 },
            tint: 0xffffff,
            blendMode: 'ADD',
            lifespan: 2000,
            quantity: 5,
            frequency: 100
        });
        
        // Anillo del portal
        this.portalAnillo = this.add.circle(portalObj.x, portalObj.y, 50, 0xffffff, 0.1);
        this.portalAnillo.setStrokeStyle(2, 0xffffff, 0.5);
        
        // Animación del portal
        this.tweens.add({
            targets: [this.portalAnillo, this.portalEmitter],
            scale: 1.2,
            alpha: 0.8,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Overlap con jugador
        this.physics.add.overlap(this.jugador, this.portalFinal, () => {
            this.intentarActivarPortalFinal();
        });
    }
    
    intentarActivarPortalFinal() {
        if (this.portalFinal.getData('activado')) return;
        
        // Verificar condiciones para activar el portal
        const areasVisitadas = this.areasReflexion.filter(a => a.area.getData('visitada')).length;
        const eleccionesTomadas = this.eleccionesFinales.filter(e => e.eleccion.getData('tomada')).length;
        
        if (areasVisitadas >= 3 && eleccionesTomadas >= 2) {
            this.activarPortalFinal();
        } else {
            const mensaje = `Necesitas reflexionar en ${3 - areasVisitadas} área(s) más ` +
                           `y tomar ${2 - eleccionesTomadas} elección(es) más.`;
            
            this.dialogoSystem.mostrar(
                mensaje,
                this.portalFinal.x, this.portalFinal.y - 50,
                { nombre: 'Portal Inactivo', autoAvanzar: true, tiempoAutoAvance: 3000 }
            );
        }
    }
    
    activarPortalFinal() {
        console.log('¡Portal final activado!');
        
        this.portalFinal.setData('activado', true);
        
        // Efecto visual mejorado
        this.portalEmitter.setQuantity(20);
        this.portalEmitter.setSpeed({ min: 50, max: 200 });
        
        this.portalAnillo.setFillStyle(0x9b59b6, 0.3);
        this.portalAnillo.setStrokeStyle(3, 0x9b59b6, 0.8);
        
        // Mostrar mensaje
        this.dialogoSystem.mostrar(
            "El portal al futuro se ha abierto.\n\n" +
            "¿Estás listo para ver adónde te llevará\n" +
            "este viaje emocional?",
            this.portalFinal.x, this.portalFinal.y - 50,
            { 
                nombre: 'Portal Activado', 
                pausarJuego: true,
                callback: () => {
                    this.mostrarOpcionesFinal();
                }
            }
        );
    }
    
    mostrarOpcionesFinal() {
        const centerX = this.portalFinal.x;
        const centerY = this.portalFinal.y;
        
        const menu = this.add.container(centerX, centerY);
        
        const fondo = this.add.rectangle(0, 0, 400, 200, 0x000000, 0.9)
            .setStrokeStyle(3, 0x9b59b6);
        
        const pregunta = this.add.text(0, -60, "¿CÓMO QUIERES FINALIZAR?", {
            fontFamily: 'Courier New',
            fontSize: '20px',
            color: '#9b59b6',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        // Opciones según progreso del jugador
        const opciones = [];
        
        // Opción 1: Final Conectado (requiere mucho progreso)
        if (this.jugador.confianza >= 80 && this.jugador.recuerdosRecolectados >= 4) {
            opciones.push({
                texto: "ABRAZAR EL FUTURO",
                final: 'conectado',
                color: 0x2ecc71
            });
        }
        
        // Opción 2: Final Abierto (siempre disponible)
        opciones.push({
            texto: "CONTINUAR EL VIAJE",
            final: 'abierto',
            color: 0x3498db
        });
        
        // Opción 3: Final Distante (si no hay mucho progreso)
        if (this.jugador.confianza < 50) {
            opciones.push({
                texto: "GUARDAR DISTANCIA",
                final: 'distante',
                color: 0xe74c3c
            });
        }
        
        // Crear botones
        const botones = [];
        
        opciones.forEach((opcion, index) => {
            const yPos = -10 + (index * 50);
            
            const boton = this.add.text(0, yPos, opcion.texto, {
                fontFamily: 'Courier New',
                fontSize: '16px',
                color: '#ffffff',
                backgroundColor: Phaser.Display.Color.IntegerToColor(opcion.color).rgba,
                padding: { x: 20, y: 10 }
            }).setOrigin(0.5).setInteractive();
            
            // Efectos hover
            boton.on('pointerover', () => {
                boton.setScale(1.05);
            });
            
            boton.on('pointerout', () => {
                boton.setScale(1);
            });
            
            boton.on('pointerdown', () => {
                this.seleccionarFinal(opcion.final, menu);
            });
            
            botones.push(boton);
        });
        
        menu.add([fondo, pregunta, ...botones]);
        menu.setDepth(1000);
    }
    
    seleccionarFinal(tipoFinal, menu) {
        console.log(`Final seleccionado: ${tipoFinal}`);
        
        // Destruir menú
        menu.destroy();
        
        // Guardar el final alcanzado
        this.finalAlcanzado = tipoFinal;
        const guardadoManager = this.registry.get('guardadoManager');
        if (guardadoManager) {
            guardadoManager.registrarFinal(tipoFinal);
        }
        
        // Mostrar secuencia final según el tipo
        this.mostrarSecuenciaFinal(tipoFinal);
    }
    
    mostrarSecuenciaFinal(tipoFinal) {
        // Detener todos los sistemas
        this.physics.pause();
        this.jugador.setVelocity(0, 0);
        
        // Efecto visual de transición
        this.cameras.main.fadeOut(2000, 0, 0, 0);
        
        // Mostrar mensaje final después del fade
        this.time.delayedCall(2000, () => {
            this.mostrarPantallaFinal(tipoFinal);
        });
    }
    
    mostrarPantallaFinal(tipoFinal) {
        // Limpiar escena
        this.children.removeAll();
        
        // Fondo según el final
        const coloresFondo = {
            conectado: 0x2ecc71,
            abierto: 0x3498db,
            distante: 0xe74c3c
        };
        
        this.add.rectangle(640, 360, 1280, 720, coloresFondo[tipoFinal] || 0x000000);
        
        // Título
        const titulos = {
            conectado: "FINAL CONECTADO",
            abierto: "FINAL ABIERTO",
            distante: "FINAL DISTANTE"
        };
        
        this.add.text(640, 150, titulos[tipoFinal], {
            fontFamily: 'Courier New',
            fontSize: '48px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        // Descripción del final
        const descripciones = {
            conectado: 
                "Has construido una conexión profunda y significativa.\n\n" +
                "Cada recuerdo recolectado, cada conflicto resuelto,\n" +
                "cada momento de confianza te ha llevado aquí.\n" +
                "El futuro se ve brillante cuando caminas juntos.",
                
            abierto:
                "El viaje continúa, y eso está bien.\n\n" +
                "No todas las respuestas tienen que estar claras,\n" +
                "no todos los caminos tienen que estar definidos.\n" +
                "A veces, lo importante es seguir caminando.",
                
            distante:
                "Algunas distancias son difíciles de cerrar.\n\n" +
                "Pero incluso en la distancia, hay aprendizaje.\n" +
                "Cada experiencia, feliz o dolorosa,\n" +
                "es parte de lo que nos hace humanos."
        };
        
        this.add.text(640, 300, descripciones[tipoFinal], {
            fontFamily: 'Courier New',
            fontSize: '20px',
            color: '#ffffff',
            align: 'center',
            lineSpacing: 10,
            wordWrap: { width: 800 }
        }).setOrigin(0.5);
        
        // Estadísticas
        const estadisticas = `Confianza final: ${Math.floor(this.jugador.confianza)}%\n` +
                            `Recuerdos: ${this.jugador.recuerdosRecolectados}/5\n` +
                            `Enemigos calmados: ${this.jugador.enemigosCalmados}\n` +
                            `Habilidades: ${Object.values(this.jugador.habilidades).filter(h => h).length}/4`;
        
        this.add.text(640, 450, estadisticas, {
            fontFamily: 'Courier New',
            fontSize: '18px',
            color: '#ffffff',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            padding: { x: 20, y: 15 }
        }).setOrigin(0.5);
        
        // Botón para volver al menú
        const botonMenu = this.add.text(640, 580, "VOLVER AL MENÚ", {
            fontFamily: 'Courier New',
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: { x: 30, y: 15 }
        }).setOrigin(0.5).setInteractive();
        
        botonMenu.on('pointerover', () => {
            botonMenu.setStyle({ color: '#ffff00' });
        });
        
        botonMenu.on('pointerout', () => {
            botonMenu.setStyle({ color: '#ffffff' });
        });
        
        botonMenu.on('pointerdown', () => {
            this.scene.start('Menu');
        });
        
        // Créditos
        this.add.text(640, 650, "Gracias por jugar 'Ecos entre Nosotros'", {
            fontFamily: 'Courier New',
            fontSize: '14px',
            color: '#aaaaaa',
            fontStyle: 'italic'
        }).setOrigin(0.5);
    }
    
    crearParticulasPaz() {
        // Partículas suaves y lentas
        const particulas = this.add.particles('particula_emocion');
        
        const emitter = particulas.createEmitter({
            x: { min: 0, max: this.mapa.widthInPixels },
            y: { min: 0, max: this.mapa.heightInPixels },
            speed: { min: 5, max: 20 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.05, end: 0 },
            alpha: { start: 0.1, end: 0 },
            tint: 0xffffff,
            blendMode: 'ADD',
            lifespan: 3000,
            quantity: 0.2,
            frequency: 3000
        });
        
        this.particulasPaz = { particulas, emitter };
    }
    
    configurarCamara() {
        this.cameras.main.startFollow(this.jugador, true, 0.08, 0.08);
        this.cameras.main.setBounds(0, 0, this.mapa.widthInPixels, this.mapa.heightInPixels);
        this.cameras.main.setBackgroundColor(0x444444);
        
        // Zoom out ligeramente para ver más del presente
        this.cameras.main.setZoom(0.9);
    }
    
    configurarEventos() {
        // Evento de cambio de confianza
        this.events.on('cambioConfianza', (confianza) => {
            this.uiSystem.actualizarBarraConfianza(confianza);
            
            // Revelar capa de futuro si la confianza es alta
            if (confianza >= 70 && this.capas.futuro && !this.capas.futuro.visible) {
                this.revelarFuturo();
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
    
    revelarFuturo() {
        if (!this.capas.futuro) return;
        
        console.log('¡Revelando el futuro!');
        
        this.capas.futuro.setVisible(true);
        
        // Animación de aparición
        this.tweens.add({
            targets: this.capas.futuro,
            alpha: 0.6,
            duration: 3000,
            ease: 'Power2'
        });
        
        // Mostrar mensaje
        this.dialogoSystem.mostrar(
            "Con suficiente confianza, el futuro se vuelve visible.\n\n" +
            "No es un camino predeterminado, sino posibilidades\n" +
            "que puedes elegir caminar juntos.",
            640, 300,
            { nombre: 'Visión del Futuro', autoAvanzar: true, tiempoAutoAvance: 5000 }
        );
    }
    
    mostrarMensajeBienvenida() {
        this.time.delayedCall(1500, () => {
            this.dialogoSystem.mostrar(
                "Este es el presente, el momento en que todo converge.\n\n" +
                "Los recuerdos del pasado, las lecciones aprendidas,\n" +
                "la confianza construida... todo está aquí, ahora.\n\n" +
                "¿Qué harás con él?",
                this.jugador.x, this.jugador.y - 100,
                { nombre: 'El Presente', autoAvanzar: true, tiempoAutoAvance: 6000 }
            );
        });
    }
    
    update() {
        if (!this.jugador || this.finalAlcanzado) return;
        
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
    }
}