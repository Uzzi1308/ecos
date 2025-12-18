export class Inicio extends Phaser.Scene {
    constructor() {
        super({ key: 'Inicio' });
        
        this.jugador = null;
        this.controles = null;
        this.sistemas = {};
        this.objetosInteractivos = [];
        this.recuerdos = [];
        this.enemigos = [];
    }
    
    create() {
        console.log('Cargando zona: El Inicio');
        
        // ========== CARGAR MAPA ==========
        this.cargarMapa();
        
        // ========== CREAR JUGADOR ==========
        this.crearJugador();
        
        // ========== INICIALIZAR SISTEMAS ==========
        this.inicializarSistemas();
        
        // ========== CREAR OBJETOS INTERACTIVOS ==========
        this.crearObjetosInteractivos();
        
        // ========== CONFIGURAR CÁMARA ==========
        this.configurarCamara();
        
        // ========== CONFIGURAR EVENTOS ==========
        this.configurarEventos();
        
        // ========== INICIAR MÚSICA ==========
        this.iniciarMusica();
        
        // ========== MOSTRAR MENSAJE DE BIENVENIDA ==========
        this.mostrarMensajeBienvenida();
    }
    
    cargarMapa() {
        // Cargar mapa Tiled
        this.mapa = this.make.tilemap({ key: 'mapa_inicio' });
        const tileset = this.mapa.addTilesetImage('tileset_emocional', 'tileset_emocional');
        
        // Crear capas
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
        
        // Aplicar efecto visual de inicio (brillo suave)
        this.capas.fondo.setAlpha(0.9);
        this.capas.plataformas.setAlpha(0.95);
        this.capas.detalle.setAlpha(0.8);
        
        // Tinte azul claro para la zona de inicio
        this.capas.fondo.setTint(0x88ccff);
        this.capas.plataformas.setTint(0x88ccff);
        this.capas.detalle.setTint(0x88ccff);
    }
    
    crearJugador() {
        // Buscar punto de spawn en el mapa
        const spawn = this.capas.objetos.objects.find(obj => obj.type === 'spawn_jugador');
        const x = spawn ? spawn.x : 100;
        const y = spawn ? spawn.y : 300;
        
        // Crear jugador
        this.jugador = new Protagonista(this, x, y);
        
        // Cargar datos guardados si existen
        const guardadoManager = this.registry.get('guardadoManager');
        if (guardadoManager) {
            guardadoManager.cargarEnEscena(this);
        }
        
        // Configurar colisiones
        this.physics.add.collider(this.jugador, this.capas.colisiones);
        
        // Seguimiento de cámara
        this.cameras.main.startFollow(this.jugador, true, 0.08, 0.08);
        this.cameras.main.setBounds(0, 0, this.mapa.widthInPixels, this.mapa.heightInPixels);
    }
    
    inicializarSistemas() {
        // Sistema de controles
        this.controles = new Controles(this);
        
        // Sistema de diálogos
        this.sistemas.dialogo = new DialogoSystem(this);
        
        // Sistema de UI
        this.sistemas.ui = new UISystem(this);
        
        // Sistema de efectos visuales
        this.sistemas.efectos = new EfectosVisuales(this);
        
        // Manager de habilidades
        this.sistemas.habilidades = new HabilidadManager(this);
        
        // Manager de mapa
        this.sistemas.mapa = new MapaManager(this);
        
        // Manager de audio
        this.sistemas.audio = new AudioManager(this);
        
        // Asignar a this para acceso fácil
        this.dialogoSystem = this.sistemas.dialogo;
        this.uiSystem = this.sistemas.ui;
        this.efectosVisuales = this.sistemas.efectos;
        this.habilidadManager = this.sistemas.habilidades;
        this.mapaManager = this.sistemas.mapa;
        this.audioManager = this.sistemas.audio;
    }
    
    crearObjetosInteractivos() {
        if (!this.capas.objetos || !this.capas.objetos.objects) return;
        
        this.capas.objetos.objects.forEach(obj => {
            switch(obj.type) {
                case 'recuerdo':
                    this.crearRecuerdo(obj);
                    break;
                    
                case 'enemigo':
                    this.crearEnemigo(obj);
                    break;
                    
                case 'plataforma_movil':
                    this.crearPlataformaMovil(obj);
                    break;
                    
                case 'trigger':
                    this.crearTrigger(obj);
                    break;
                    
                case 'portal':
                    this.crearPortal(obj);
                    break;
            }
        });
    }
    
    crearRecuerdo(obj) {
        const tipo = obj.properties?.tipo || 'felicidad';
        const recuerdo = new Memoria(this, obj.x, obj.y, tipo);
        
        // Configurar colisión con jugador
        this.physics.add.overlap(this.jugador, recuerdo, (jugador, recuerdoObj) => {
            if (recuerdoObj.recolectar(jugador)) {
                // Actualizar UI
                this.uiSystem.actualizarContadorRecuerdos(jugador.recuerdosRecolectados);
                
                // Mostrar diálogo
                this.dialogoSystem.mostrarDialogoEmocional(tipo, obj.x, obj.y);
            }
        });
        
        this.recuerdos.push(recuerdo);
    }
    
    crearEnemigo(obj) {
        const tipo = obj.properties?.tipo || 'miedo';
        const enemigo = new EnemigoEmocional(this, obj.x, obj.y, tipo);
        
        // Configurar colisiones
        this.physics.add.collider(enemigo, this.capas.colisiones);
        this.physics.add.collider(enemigo, this.jugador, (jugador, enemigoObj) => {
            // El jugador no recibe daño, solo interacción
            enemigoObj.interactuar();
        });
        
        this.enemigos.push(enemigo);
    }
    
    crearPlataformaMovil(obj) {
        const plataforma = this.physics.add.sprite(obj.x, obj.y, 'plataforma_movil');
        plataforma.setImmovable(true);
        plataforma.body.allowGravity = false;
        
        const velocidad = obj.properties?.velocidad || 100;
        const distancia = obj.properties?.distancia || 200;
        
        // Movimiento horizontal
        this.tweens.add({
            targets: plataforma,
            x: plataforma.x + distancia,
            duration: distancia / velocidad * 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Colisión con jugador
        this.physics.add.collider(this.jugador, plataforma);
    }
    
    crearTrigger(obj) {
        const trigger = this.physics.add.sprite(obj.x, obj.y, null);
        trigger.setAlpha(0);
        trigger.body.setSize(obj.width, obj.height);
        
        // Configurar overlap con jugador
        this.physics.add.overlap(this.jugador, trigger, () => {
            const evento = obj.properties?.evento;
            const accion = obj.properties?.accion;
            
            if (evento && accion) {
                this.ejecutarTrigger(evento, accion);
                trigger.destroy(); // Trigger de un solo uso
            }
        });
    }
    
    crearPortal(obj) {
        const portal = this.physics.add.sprite(obj.x, obj.y, null);
        portal.setAlpha(0.5).setTint(0x9b59b6);
        
        // Efecto visual del portal
        this.tweens.add({
            targets: portal,
            alpha: { from: 0.3, to: 0.7 },
            scale: { from: 0.9, to: 1.1 },
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
        
        // Configurar overlap con jugador
        this.physics.add.overlap(this.jugador, portal, () => {
            const zonaDestino = obj.properties?.zona || 'distancia';
            const spawnDestino = obj.properties?.spawn || 'default';
            
            this.transicionarAZona(zonaDestino, spawnDestino);
        });
    }
    
    ejecutarTrigger(evento, accion) {
        console.log(`Trigger activado: ${evento} -> ${accion}`);
        
        switch(evento) {
            case 'tutorial_escuchar':
                this.mostrarTutorialEscuchar();
                break;
                
            case 'primer_recuerdo':
                this.mostrarTutorialRecuerdos();
                break;
                
            case 'primer_enemigo':
                this.mostrarTutorialEnemigos();
                break;
        }
    }
    
    mostrarTutorialEscuchar() {
        this.dialogoSystem.mostrar(
            "A veces, para avanzar, necesitas detenerte y escuchar.\n\n" +
            "Presiona E para usar la habilidad 'Escuchar'.\n" +
            "Te revelará caminos ocultos en el mundo.",
            640, 300,
            { nombre: 'Guía', pausarJuego: true }
        );
    }
    
    mostrarTutorialRecuerdos() {
        this.dialogoSystem.mostrar(
            "Los recuerdos son fragmentos de experiencias pasadas.\n\n" +
            "Acércate a ellos para recolectarlos.\n" +
            "Cada recuerdo te dará nuevas habilidades.",
            640, 300,
            { nombre: 'Guía', pausarJuego: true }
        );
    }
    
    mostrarTutorialEnemigos() {
        this.dialogoSystem.mostrar(
            "Los enemigos aquí no son para combatir, sino para entender.\n\n" +
            "Acércate y haz click sobre ellos para interactuar.\n" +
            "Escucha lo que tienen que decir.",
            640, 300,
            { nombre: 'Guía', pausarJuego: true }
        );
    }
    
    configurarCamara() {
        this.cameras.main.setBackgroundColor(0x88aadd);
        this.cameras.main.setZoom(1);
    }
    
    configurarEventos() {
        // Evento para actualizar guardado
        this.events.on('shutdown', () => {
            const guardadoManager = this.registry.get('guardadoManager');
            if (guardadoManager) {
                guardadoManager.actualizarProgreso(this);
                guardadoManager.guardar();
            }
        });
        
        // Evento de cambio de confianza
        this.events.on('cambioConfianza', (confianza) => {
            this.uiSystem.actualizarBarraConfianza(confianza);
        });
        
        // Evento de habilidad desbloqueada
        this.events.on('habilidadDesbloqueadaCompleta', (habilidad) => {
            this.uiSystem.agregarHabilidadUI(habilidad.nombre);
            this.dialogoSystem.mostrarDialogoSistema(
                `¡Habilidad ${habilidad.nombre} desbloqueada!`,
                'exito'
            );
        });
    }
    
    iniciarMusica() {
        if (this.audioManager) {
            this.audioManager.cambiarMusicaPorEscena('inicio');
        }
    }
    
    mostrarMensajeBienvenida() {
        this.time.delayedCall(1000, () => {
            this.dialogoSystem.mostrar(
                "Este es el comienzo de todo.\n\n" +
                "Aquí es donde nuestras miradas se encontraron por primera vez.\n" +
                "Todo era nuevo, y el miedo se confundía con la emoción...",
                640, 300,
                { nombre: 'El Inicio', autoAvanzar: true, tiempoAutoAvance: 5000 }
            );
        });
    }
    
    transicionarAZona(zona, spawn) {
        console.log(`Transicionando a zona: ${zona}, spawn: ${spawn}`);
        
        // Guardar datos del jugador
        const datosJugador = this.jugador.getDatosGuardado();
        this.registry.set('jugadorData', datosJugador);
        
        // Guardar progreso
        const guardadoManager = this.registry.get('guardadoManager');
        if (guardadoManager) {
            guardadoManager.actualizarProgreso(this);
            guardadoManager.guardar();
        }
        
        // Efecto de transición
        this.efectosVisuales.efectoTransicionZona('inicio', zona);
        
        // Cambiar de escena después del efecto
        this.time.delayedCall(1000, () => {
            this.scene.start(zona);
        });
    }
    
    revelarCaminosOcultos() {
        // Revelar plataformas ocultas en la zona
        const objetosOcultos = this.children.list.filter(child => 
            child.type === 'Sprite' && child.alpha === 0
        );
        
        objetosOcultos.forEach(obj => {
            this.tweens.add({
                targets: obj,
                alpha: 0.8,
                duration: 1000,
                ease: 'Power2'
            });
        });
        
        // Efecto visual
        this.efectosVisuales.efectoRevelacion();
    }
    
    update() {
        if (!this.jugador) return;
        
        // Actualizar controles
        const input = this.controles.update();
        
        // Actualizar jugador
        this.jugador.update(input);
        
        // Actualizar sistemas
        if (this.uiSystem) this.uiSystem.update();
        if (this.efectosVisuales) this.efectosVisuales.update();
        
        // Verificar uso de habilidades
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
        
        // Verificar si el jugador llega al final de la zona
        if (this.jugador.x > this.mapa.widthInPixels - 100) {
            this.transicionarAZona('Distancia', 'inicio');
        }
    }
}