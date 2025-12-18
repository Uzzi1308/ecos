export default class Recuerdos extends Phaser.Scene {
    constructor() {
        super({ key: 'Recuerdos' });
        
        this.jugador = null;
        this.controles = null;
        this.sistemas = {};
        this.memoriasReconstruibles = [];
        this.areasReconstruidas = new Set();
    }
    
    create() {
        console.log('Cargando zona: Recuerdos Compartidos');
        
        // Cargar datos del jugador
        const datosJugador = this.registry.get('jugadorData');
        
        // ========== CARGAR MAPA ==========
        this.cargarMapa();
        
        // ========== CREAR JUGADOR ==========
        this.crearJugador(datosJugador);
        
        // ========== INICIALIZAR SISTEMAS ==========
        this.inicializarSistemas();
        
        // ========== CONFIGURAR ZONA ESPECIAL ==========
        this.configurarZonaRecuerdos();
        
        // ========== CONFIGURAR CÁMARA ==========
        this.configurarCamara();
        
        // ========== CONFIGURAR EVENTOS ==========
        this.configurarEventos();
        
        // ========== MOSTRAR MENSAJE INICIAL ==========
        this.mostrarMensajeInicial();
    }
    
    cargarMapa() {
        this.mapa = this.make.tilemap({ key: 'mapa_recuerdos' });
        const tileset = this.mapa.addTilesetImage('tileset_emocional', 'tileset_emocional');
        
        this.capas = {
            fondo: this.mapa.createLayer('fondo', tileset, 0, 0),
            plataformas: this.mapa.createLayer('plataformas', tileset, 0, 0),
            detalle: this.mapa.createLayer('detalle', tileset, 0, 0),
            colisiones: this.mapa.createLayer('colisiones', tileset, 0, 0),
            objetos: this.mapa.getObjectLayer('objetos'),
            // Capa especial para áreas destruidas/reconstruibles
            destruido: this.mapa.createLayer('destruido', tileset, 0, 0)
        };
        
        // Configurar colisiones
        if (this.capas.colisiones) {
            this.capas.colisiones.setCollisionByProperty({ colisiona: true });
        }
        
        // Ocultar capa de destruido inicialmente
        if (this.capas.destruido) {
            this.capas.destruido.setVisible(false);
            this.capas.destruido.setAlpha(0.3);
        }
        
        // Tinte cálido para la zona de recuerdos
        const tint = 0xffcc88;
        this.capas.fondo.setTint(tint);
        this.capas.plataformas.setTint(tint);
        this.capas.detalle.setTint(tint);
        
        // Efecto de nostalgia
        this.capas.fondo.setAlpha(0.7);
        this.capas.detalle.setAlpha(0.6);
    }
    
    crearJugador(datos) {
        // Buscar spawn point
        const spawn = this.capas.objetos.objects.find(obj => obj.type === 'spawn_jugador');
        const x = datos?.x || (spawn ? spawn.x : 100);
        const y = datos?.y || (spawn ? spawn.y : 300);
        
        this.jugador = new Protagonista(this, x, y);
        
        // Cargar datos del jugador
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
        
        // Asignar para acceso fácil
        this.dialogoSystem = this.sistemas.dialogo;
        this.uiSystem = this.sistemas.ui;
        this.efectosVisuales = this.sistemas.efectos;
        this.habilidadManager = this.sistemas.habilidades;
        this.audioManager = this.sistemas.audio;
        
        // Aplicar filtro de nostalgia
        this.efectosVisuales.aplicarFiltroEmocional('nostalgia');
    }
    
    configurarZonaRecuerdos() {
        // Crear áreas reconstruibles
        this.crearAreasReconstruibles();
        
        // Crear recuerdos especiales
        this.crearRecuerdosEspeciales();
        
        // Efectos de partículas de memoria
        this.crearParticulasMemoria();
    }
    
    crearAreasReconstruibles() {
        if (!this.capas.objetos) return;
        
        this.capas.objetos.objects.forEach(obj => {
            if (obj.type === 'area_reconstruible') {
                this.crearAreaReconstruible(obj);
            }
        });
    }
    
    crearAreaReconstruible(obj) {
        const area = this.add.zone(obj.x, obj.y, obj.width, obj.height);
        area.setData('id', obj.properties?.id || 'area_' + Date.now());
        area.setData('reconstruida', false);
        area.setData('dialogo', obj.properties?.dialogo || 'Un recuerdo olvidado...');
        
        // Indicador visual
        const indicador = this.add.graphics();
        indicador.lineStyle(2, 0xffcc88, 0.5);
        indicador.strokeRect(obj.x, obj.y, obj.width, obj.height);
        indicador.fillStyle(0xffcc88, 0.1);
        indicador.fillRect(obj.x, obj.y, obj.width, obj.height);
        
        // Texto indicador
        const texto = this.add.text(obj.x + obj.width/2, obj.y + obj.height/2, '???', {
            fontFamily: 'Courier New',
            fontSize: '16px',
            color: '#ffcc88',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            padding: { x: 5, y: 2 }
        }).setOrigin(0.5).setAlpha(0.7);
        
        // Guardar referencia
        this.memoriasReconstruibles.push({
            area: area,
            indicador: indicador,
            texto: texto,
            x: obj.x,
            y: obj.y,
            width: obj.width,
            height: obj.height,
            dialogo: area.getData('dialogo')
        });
    }
    
    crearRecuerdosEspeciales() {
        if (!this.capas.objetos) return;
        
        this.capas.objetos.objects.forEach(obj => {
            if (obj.type === 'recuerdo_especial') {
                const tipo = obj.properties?.tipo || 'amor';
                const recuerdo = new Memoria(this, obj.x, obj.y, tipo);
                
                // Hacerlo más brillante
                recuerdo.setScale(1.5);
                
                // Colisión con jugador
                this.physics.add.overlap(this.jugador, recuerdo, (jugador, recuerdoObj) => {
                    if (recuerdoObj.recolectar(jugador)) {
                        this.dialogoSystem.mostrarDialogoEmocional(tipo, obj.x, obj.y);
                        
                        // Desbloquear habilidad de recordar si no está desbloqueada
                        if (!this.jugador.habilidades.recordar) {
                            this.habilidadManager.desbloquearHabilidad('recordar');
                        }
                    }
                });
            }
        });
    }
    
    crearParticulasMemoria() {
        // Partículas flotantes que parecen recuerdos
        const particulas = this.add.particles('particula_recuerdo');
        
        particulas.createEmitter({
            x: { min: 0, max: this.mapa.widthInPixels },
            y: { min: 0, max: this.mapa.heightInPixels },
            speedY: { min: -10, max: 10 },
            speedX: { min: -10, max: 10 },
            scale: { start: 0.1, end: 0 },
            alpha: { start: 0.1, end: 0 },
            tint: 0xffcc88,
            blendMode: 'ADD',
            lifespan: 5000,
            quantity: 0.5, // Partículas por segundo
            frequency: 2000
        });
    }
    
    configurarCamara() {
        this.cameras.main.startFollow(this.jugador, true, 0.08, 0.08);
        this.cameras.main.setBounds(0, 0, this.mapa.widthInPixels, this.mapa.heightInPixels);
        this.cameras.main.setBackgroundColor(0x664400);
    }
    
    configurarEventos() {
        // Evento para usar habilidad "Recordar"
        this.events.on('habilidadDesbloqueadaCompleta', (habilidad) => {
            if (habilidad.nombre === 'Recordar') {
                this.dialogoSystem.mostrar(
                    "Ahora puedes reconstruir áreas del pasado.\n\n" +
                    "Usa la habilidad 'Recordar' cerca de áreas destruidas\n" +
                    "para recuperar lo que una vez estuvo aquí.",
                    640, 300,
                    { nombre: 'Memoria', pausarJuego: true }
                );
            }
        });
        
        // Evento de shutdown para guardar
        this.events.on('shutdown', () => {
            const guardadoManager = this.registry.get('guardadoManager');
            if (guardadoManager) {
                guardadoManager.actualizarProgreso(this);
                guardadoManager.guardar();
            }
        });
    }
    
    mostrarMensajeInicial() {
        this.time.delayedCall(1500, () => {
            this.dialogoSystem.mostrar(
                "Los recuerdos compartidos flotan en el aire como polvo de estrellas...\n\n" +
                "Algunos están rotos, otros olvidados.\n" +
                "Pero juntos, podemos reconstruirlos.",
                this.jugador.x, this.jugador.y - 100,
                { nombre: 'Recuerdos', autoAvanzar: true, tiempoAutoAvance: 4000 }
            );
        });
    }
    
    // ========== MECÁNICA ESPECIAL: RECONSTRUIR ÁREAS ==========
    
    reconstruirAreas() {
        if (!this.jugador.habilidades.recordar) return;
        
        console.log('Intentando reconstruir áreas...');
        
        let areasReconstruidas = 0;
        
        this.memoriasReconstruibles.forEach(memoria => {
            if (memoria.area.getData('reconstruida')) return;
            
            // Verificar si el jugador está cerca
            const distancia = Phaser.Math.Distance.Between(
                this.jugador.x, this.jugador.y,
                memoria.x + memoria.width/2, memoria.y + memoria.height/2
            );
            
            if (distancia < 200) { // Radio de reconstrucción
                this.reconstruirArea(memoria);
                areasReconstruidas++;
            }
        });
        
        if (areasReconstruidas > 0) {
            this.dialogoSystem.mostrarDialogoSistema(
                `${areasReconstruidas} área(s) reconstruida(s)`,
                'exito'
            );
        }
    }
    
    reconstruirArea(memoria) {
        console.log(`Reconstruyendo área: ${memoria.area.getData('id')}`);
        
        // Marcar como reconstruida
        memoria.area.setData('reconstruida', true);
        
        // Mostrar diálogo del recuerdo
        this.dialogoSystem.mostrar(
            memoria.dialogo,
            memoria.x + memoria.width/2, memoria.y + memoria.height/2 - 50,
            { nombre: 'Recuerdo Recuperado', autoAvanzar: true, tiempoAutoAvance: 3000 }
        );
        
        // Efecto visual
        this.efectosVisuales.efectoMemoriaRecuperada();
        
        // Remover indicadores
        memoria.indicador.destroy();
        memoria.texto.destroy();
        
        // Revelar capa destruida (que en realidad muestra lo reconstruido)
        if (this.capas.destruido) {
            // Crear una copia visible de esta área
            const graphics = this.add.graphics();
            graphics.fillStyle(0xffcc88, 0.3);
            graphics.fillRect(memoria.x, memoria.y, memoria.width, memoria.height);
            
            // Agregar a la lista de áreas reconstruidas
            this.areasReconstruidas.add(memoria.area.getData('id'));
        }
        
        // Aumentar confianza del jugador
        this.jugador.confianza = Phaser.Math.Clamp(this.jugador.confianza + 5, 0, 100);
        this.events.emit('cambioConfianza', this.jugador.confianza);
    }
    
    // ========== UPDATE ==========
    
    update() {
        if (!this.jugador) return;
        
        const input = this.controles.update();
        
        // Actualizar jugador
        this.jugador.update(input);
        
        // Actualizar UI
        if (this.uiSystem) this.uiSystem.update();
        if (this.efectosVisuales) this.efectosVisuales.update();
        
        // Verificar habilidades
        if (input.escuchar) {
            this.habilidadManager.usarHabilidad('escuchar');
        }
        
        if (input.recordar) {
            const usada = this.habilidadManager.usarHabilidad('recordar');
            if (usada) {
                this.reconstruirAreas();
            }
        }
        
        if (input.perdonar) {
            this.habilidadManager.usarHabilidad('perdonar');
        }
        
        // Pausa
        if (input.pausa) {
            this.uiSystem.togglePausa();
        }
        
        // Verificar transición a siguiente zona
        if (this.jugador.x > this.mapa.widthInPixels - 100) {
            this.transicionarAZona('Conflicto');
        }
        
        // Verificar si reconstruyó todas las áreas
        if (this.areasReconstruidas.size >= 3 && !this.todasAreasReconstruidas) {
            this.todasAreasReconstruidas = true;
            this.mostrarMensajeCompleto();
        }
    }
    
    mostrarMensajeCompleto() {
        this.dialogoSystem.mostrar(
            "Has reconstruido nuestros recuerdos.\n\n" +
            "Aunque algunos siguen borrosos, ahora podemos ver\n" +
            "el camino que recorrimos juntos.",
            640, 300,
            { nombre: 'Memoria Completa', pausarJuego: true }
        );
    }
    
    transicionarAZona(zona) {
        // Guardar datos
        const datosJugador = this.jugador.getDatosGuardado();
        this.registry.set('jugadorData', datosJugador);
        
        // Efecto de transición
        this.efectosVisuales.efectoTransicionZona('recuerdos', zona);
        
        this.time.delayedCall(1000, () => {
            this.scene.start(zona);
        });
    }
}