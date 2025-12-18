export default class Confianza extends Phaser.Scene {
    constructor() {
        super({ key: 'Confianza' });
        
        this.jugador = null;
        this.controles = null;
        this.sistemas = {};
        this.saltosDeConfianza = [];
        this.plataformasInvisibles = [];
        this.pruebasSuperadas = 0;
    }
    
    create() {
        console.log('Cargando zona: La Confianza');
        
        const datosJugador = this.registry.get('jugadorData');
        
        // ========== CARGAR MAPA ==========
        this.cargarMapa();
        
        // ========== CREAR JUGADOR ==========
        this.crearJugador(datosJugador);
        
        // ========== INICIALIZAR SISTEMAS ==========
        this.inicializarSistemas();
        
        // ========== CONFIGURAR ZONA DE CONFIANZA ==========
        this.configurarZonaConfianza();
        
        // ========== CONFIGURAR CÁMARA ==========
        this.configurarCamara();
        
        // ========== CONFIGURAR EVENTOS ==========
        this.configurarEventos();
        
        // ========== MOSTRAR INTRODUCCIÓN ==========
        this.mostrarIntroduccion();
    }
    
    cargarMapa() {
        this.mapa = this.make.tilemap({ key: 'mapa_confianza' });
        const tileset = this.mapa.addTilesetImage('tileset_emocional', 'tileset_emocional');
        
        this.capas = {
            fondo: this.mapa.createLayer('fondo', tileset, 0, 0),
            plataformas: this.mapa.createLayer('plataformas', tileset, 0, 0),
            detalle: this.mapa.createLayer('detalle', tileset, 0, 0),
            colisiones: this.mapa.createLayer('colisiones', tileset, 0, 0),
            objetos: this.mapa.getObjectLayer('objetos'),
            invisibles: this.mapa.createLayer('invisibles', tileset, 0, 0)
        };
        
        // Configurar colisiones
        if (this.capas.colisiones) {
            this.capas.colisiones.setCollisionByProperty({ colisiona: true });
        }
        
        // Ocultar capa de invisibles
        if (this.capas.invisibles) {
            this.capas.invisibles.setVisible(false);
            this.capas.invisibles.setAlpha(0);
        }
        
        // Tinte verde esperanzador
        const tint = 0x88ff88;
        this.capas.fondo.setTint(tint);
        this.capas.plataformas.setTint(tint);
        this.capas.detalle.setTint(tint);
        
        // Efecto de claridad
        this.capas.fondo.setAlpha(0.9);
        this.capas.detalle.setAlpha(0.8);
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
        
        // Aplicar filtro de esperanza
        this.efectosVisuales.aplicarFiltroEmocional('esperanza');
    }
    
    configurarZonaConfianza() {
        // Crear saltos de confianza
        this.crearSaltosDeConfianza();
        
        // Crear plataformas que aparecen al confiar
        this.crearPlataformasDeConfianza();
        
        // Crear pruebas de confianza
        this.crearPruebasDeConfianza();
        
        // Efectos de partículas de confianza
        this.crearParticulasConfianza();
    }
    
    crearSaltosDeConfianza() {
        if (!this.capas.objetos) return;
        
        this.capas.objetos.objects.forEach(obj => {
            if (obj.type === 'salto_confianza') {
                this.crearZonaSaltoConfianza(obj);
            }
        });
    }
    
    crearZonaSaltoConfianza(obj) {
        const zona = this.add.zone(obj.x, obj.y, obj.width, obj.height);
        zona.setData('tipo', 'salto_confianza');
        zona.setData('activada', false);
        
        // Indicador visual
        const indicador = this.add.graphics();
        indicador.lineStyle(2, 0x88ff88, 0.3);
        indicador.strokeRect(obj.x, obj.y, obj.width, obj.height);
        
        // Texto indicador
        const texto = this.add.text(
            obj.x + obj.width/2, 
            obj.y + obj.height/2, 
            'Confía y salta',
            {
                fontFamily: 'Courier New',
                fontSize: '14px',
                color: '#88ff88',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                padding: { x: 5, y: 2 }
            }
        ).setOrigin(0.5).setAlpha(0.7);
        
        // Overlap con jugador
        this.physics.add.overlap(this.jugador, zona, (jugador, zonaObj) => {
            if (!zonaObj.getData('activada')) {
                this.activarSaltoConfianza(zonaObj, indicador, texto);
            }
        });
        
        this.saltosDeConfianza.push({ zona, indicador, texto });
    }
    
    activarSaltoConfianza(zona, indicador, texto) {
        zona.setData('activada', true);
        
        // Mostrar instrucción
        this.dialogoSystem.mostrar(
            "Para cruzar, necesitas confiar.\n\n" +
            "Suelta todos los controles y espera...\n" +
            "Luego salta con ESPACIO.",
            zona.x + zona.width/2, zona.y + zona.height/2 - 50,
            { nombre: 'Prueba de Confianza', autoAvanzar: true, tiempoAutoAvance: 4000 }
        );
        
        // Efecto visual
        indicador.clear();
        indicador.lineStyle(2, 0x2ecc71, 0.7);
        indicador.strokeRect(zona.x, zona.y, zona.width, zona.height);
        indicador.fillStyle(0x2ecc71, 0.2);
        indicador.fillRect(zona.x, zona.y, zona.width, zona.height);
        
        texto.setColor('#2ecc71').setAlpha(1);
        
        // Hacer que el salto de confianza esté disponible para el jugador
        this.jugador.saltoConfianzaDisponible = true;
        
        // Temporizador para desactivar si no se usa
        this.time.delayedCall(10000, () => {
            if (zona.getData('activada')) {
                this.desactivarSaltoConfianza(zona, indicador, texto);
            }
        });
    }
    
    desactivarSaltoConfianza(zona, indicador, texto) {
        zona.setData('activada', false);
        this.jugador.saltoConfianzaDisponible = false;
        
        indicador.clear();
        indicador.lineStyle(2, 0x88ff88, 0.3);
        indicador.strokeRect(zona.x, zona.y, zona.width, zona.height);
        
        texto.setColor('#88ff88').setAlpha(0.7);
    }
    
    crearPlataformasDeConfianza() {
        if (!this.capas.objetos) return;
        
        this.capas.objetos.objects.forEach(obj => {
            if (obj.type === 'plataforma_confianza') {
                this.crearPlataformaConfianza(obj);
            }
        });
    }
    
    crearPlataformaConfianza(obj) {
        // Plataforma invisible inicialmente
        const plataforma = this.physics.add.sprite(obj.x, obj.y, null);
        plataforma.setAlpha(0);
        plataforma.setData('visible', false);
        plataforma.setData('confianzaRequerida', obj.properties?.confianza || 70);
        
        // Crear cuerpo de colisión
        plataforma.body.setSize(obj.width, obj.height);
        plataforma.setImmovable(true);
        
        // Indicador visual
        const indicador = this.add.graphics();
        indicador.lineStyle(2, 0x88ff88, 0.2);
        indicador.strokeRect(obj.x, obj.y, obj.width, obj.height);
        indicador.fillStyle(0x88ff88, 0.1);
        indicador.fillRect(obj.x, obj.y, obj.width, obj.height);
        
        // Texto con confianza requerida
        const texto = this.add.text(
            obj.x + obj.width/2,
            obj.y + obj.height/2,
            `Confianza: ${plataforma.getData('confianzaRequerida')}`,
            {
                fontFamily: 'Courier New',
                fontSize: '12px',
                color: '#88ff88',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                padding: { x: 5, y: 2 }
            }
        ).setOrigin(0.5).setAlpha(0.5);
        
        // Colisión con jugador
        this.physics.add.collider(this.jugador, plataforma, () => {
            this.revelarPlataformaConfianza(plataforma, indicador, texto);
        });
        
        this.plataformasInvisibles.push({ plataforma, indicador, texto });
    }
    
    revelarPlataformaConfianza(plataforma, indicador, texto) {
        if (plataforma.getData('visible')) return;
        
        const confianzaRequerida = plataforma.getData('confianzaRequerida');
        
        if (this.jugador.confianza >= confianzaRequerida) {
            // Revelar plataforma
            plataforma.setData('visible', true);
            
            // Crear sprite visible
            const sprite = this.add.sprite(plataforma.x, plataforma.y, 'plataforma_basica');
            sprite.setAlpha(0).setScale(plataforma.width / 32, plataforma.height / 32);
            
            // Animación de aparición
            this.tweens.add({
                targets: sprite,
                alpha: 0.8,
                duration: 1000,
                ease: 'Power2'
            });
            
            // Remover indicadores
            indicador.destroy();
            texto.destroy();
            
            // Efecto de sonido
            this.sound.play('sfx_confiar', { volume: 0.3 });
            
            // Aumentar confianza del jugador
            this.jugador.confianza = Phaser.Math.Clamp(this.jugador.confianza + 5, 0, 100);
            this.events.emit('cambioConfianza', this.jugador.confianza);
            
            // Registrar prueba superada
            this.pruebasSuperadas++;
            
        } else {
            // Mostrar mensaje de confianza insuficiente
            this.dialogoSystem.mostrar(
                `Necesitas al menos ${confianzaRequerida}% de confianza\n` +
                `para que esta plataforma se revele.\n` +
                `Tu confianza actual: ${Math.floor(this.jugador.confianza)}%`,
                plataforma.x, plataforma.y - 50,
                { nombre: 'Confianza Insuficiente', autoAvanzar: true, tiempoAutoAvance: 3000 }
            );
        }
    }
    
    crearPruebasDeConfianza() {
        if (!this.capas.objetos) return;
        
        this.capas.objetos.objects.forEach(obj => {
            if (obj.type === 'prueba_confianza') {
                this.crearPruebaConfianza(obj);
            }
        });
    }
    
    crearPruebaConfianza(obj) {
        const prueba = this.add.zone(obj.x, obj.y, obj.width, obj.height);
        prueba.setData('tipo', 'prueba_confianza');
        prueba.setData('completada', false);
        prueba.setData('dialogo', obj.properties?.dialogo || 'Una prueba de confianza...');
        
        // Overlap con jugador
        this.physics.add.overlap(this.jugador, prueba, (jugador, pruebaObj) => {
            if (!pruebaObj.getData('completada')) {
                this.iniciarPruebaConfianza(pruebaObj);
            }
        });
    }
    
    iniciarPruebaConfianza(prueba) {
        prueba.setData('completada', true);
        
        // Mostrar diálogo de la prueba
        this.dialogoSystem.mostrar(
            prueba.getData('dialogo'),
            prueba.x + prueba.width/2, prueba.y + prueba.height/2 - 50,
            { nombre: 'Prueba de Confianza', pausarJuego: true }
        );
        
        // Después del diálogo, dar recompensa
        this.time.delayedCall(3000, () => {
            this.completarPruebaConfianza(prueba);
        });
    }
    
    completarPruebaConfianza(prueba) {
        // Aumentar confianza del jugador
        this.jugador.confianza = Phaser.Math.Clamp(this.jugador.confianza + 15, 0, 100);
        this.events.emit('cambioConfianza', this.jugador.confianza);
        
        // Efecto visual
        this.efectosVisuales.efectoCuracion(prueba.x + prueba.width/2, prueba.y + prueba.height/2);
        
        // Mostrar mensaje
        this.dialogoSystem.mostrarDialogoSistema(
            '¡Prueba de confianza superada! +15% Confianza',
            'exito'
        );
        
        // Registrar prueba superada
        this.pruebasSuperadas++;
    }
    
    crearParticulasConfianza() {
        // Partículas de luz/esperanza
        const particulas = this.add.particles('particula_emocion');
        
        const emitter = particulas.createEmitter({
            x: { min: 0, max: this.mapa.widthInPixels },
            y: { min: 0, max: this.mapa.heightInPixels },
            speedY: { min: -20, max: -5 },
            speedX: { min: -10, max: 10 },
            scale: { start: 0.1, end: 0 },
            alpha: { start: 0.2, end: 0 },
            tint: 0x88ff88,
            blendMode: 'ADD',
            lifespan: 2000,
            quantity: 0.5,
            frequency: 2000
        });
        
        this.particulasConfianza = { particulas, emitter };
    }
    
    configurarCamara() {
        this.cameras.main.startFollow(this.jugador, true, 0.08, 0.08);
        this.cameras.main.setBounds(0, 0, this.mapa.widthInPixels, this.mapa.heightInPixels);
        this.cameras.main.setBackgroundColor(0x224422);
    }
    
    configurarEventos() {
        // Evento de cambio de confianza
        this.events.on('cambioConfianza', (confianza) => {
            this.uiSystem.actualizarBarraConfianza(confianza);
            
            // Verificar si se desbloquea habilidad "Confiar"
            if (confianza >= 60 && !this.jugador.habilidades.confiar) {
                this.habilidadManager.desbloquearHabilidad('confiar');
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
    
    mostrarIntroduccion() {
        this.time.delayedCall(1000, () => {
            this.dialogoSystem.mostrar(
                "La confianza se construye paso a paso.\n\n" +
                "Aquí, el camino solo se revela cuando crees en él.\n" +
                "A veces, avanzar requiere soltar el control...",
                this.jugador.x, this.jugador.y - 100,
                { nombre: 'La Confianza', autoAvanzar: true, tiempoAutoAvance: 4000 }
            );
        });
    }
    
    // ========== MECÁNICA DE SALTO DE CONFIANZA ==========
    
    ejecutarSaltoConfianza() {
        if (this.jugador.saltoConfianzaDisponible && this.jugador.habilidades.confiar) {
            const exito = this.jugador.ejecutarSaltoConfianza();
            
            if (exito) {
                // Aumentar confianza
                this.jugador.confianza = Phaser.Math.Clamp(this.jugador.confianza + 10, 0, 100);
                this.events.emit('cambioConfianza', this.jugador.confianza);
                
                // Registrar prueba superada
                this.pruebasSuperadas++;
            }
            
            return exito;
        }
        
        return false;
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
            this.habilidadManager.usarHabilidad('perdonar');
        }
        
        // Salto de confianza (se activa automáticamente)
        if (input.space && this.jugador.saltoConfianzaDisponible) {
            this.ejecutarSaltoConfianza();
        }
        
        // Pausa
        if (input.pausa) {
            this.uiSystem.togglePausa();
        }
        
        // Verificar si completó todas las pruebas
        if (this.pruebasSuperadas >= 5 && !this.todasPruebasCompletadas) {
            this.todasPruebasCompletadas = true;
            this.mostrarMensajeCompleto();
        }
        
        // Verificar transición a siguiente zona
        if (this.jugador.x > this.mapa.widthInPixels - 100) {
            this.transicionarAZona('Presente');
        }
    }
    
    mostrarMensajeCompleto() {
        this.dialogoSystem.mostrar(
            "Has demostrado una confianza inquebrantable.\n\n" +
            "Cada prueba superada te ha hecho más fuerte,\n" +
            "más seguro de lo que juntos pueden lograr.",
            640, 300,
            { nombre: 'Confianza Consolidada', pausarJuego: true }
        );
    }
    
    transicionarAZona(zona) {
        // Verificar si completó suficientes pruebas
        if (this.pruebasSuperadas < 3) {
            this.dialogoSystem.mostrar(
                "Necesitas superar más pruebas de confianza\n" +
                "para poder avanzar al presente.",
                this.jugador.x, this.jugador.y - 100,
                { nombre: 'No Estás Listo', autoAvanzar: true, tiempoAutoAvance: 3000 }
            );
            return;
        }
        
        // Guardar datos
        const datosJugador = this.jugador.getDatosGuardado();
        this.registry.set('jugadorData', datosJugador);
        
        // Efecto de transición
        this.efectosVisuales.efectoTransicionZona('confianza', zona);
        
        this.time.delayedCall(1000, () => {
            this.scene.start(zona);
        });
    }
}