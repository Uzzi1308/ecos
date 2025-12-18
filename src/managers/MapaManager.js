export default class MapaManager {
    constructor(scene) {
        this.scene = scene;
        this.mapas = new Map();
        this.conexiones = [];
        this.recuerdosRecolectados = [];
        this.estadoEmocionalGlobal = 'neutral';
        this.zonasDesbloqueadas = new Set(['inicio']);
        
        this.cargarConfiguracionMapas();
        this.configurarEventos();
    }
    
    cargarConfiguracionMapas() {
        // Configuración de cada zona
        this.configZonas = {
            inicio: {
                nombre: 'El Inicio',
                estado: 'disponible',
                emocion: 'calma',
                conexiones: ['distancia'],
                recuerdosRequeridos: 0,
                color: 0x88ccff
            },
            distancia: {
                nombre: 'La Distancia',
                estado: 'bloqueado',
                emocion: 'tristeza',
                conexiones: ['recuerdos', 'inicio'],
                recuerdosRequeridos: 1,
                color: 0xaaaaaa
            },
            recuerdos: {
                nombre: 'Recuerdos Compartidos',
                estado: 'bloqueado',
                emocion: 'nostalgia',
                conexiones: ['conflicto', 'distancia'],
                recuerdosRequeridos: 2,
                color: 0xffcc88
            },
            conflicto: {
                nombre: 'El Conflicto',
                estado: 'bloqueado',
                emocion: 'tension',
                conexiones: ['confianza', 'recuerdos'],
                recuerdosRequeridos: 3,
                color: 0xff8888
            },
            confianza: {
                nombre: 'La Confianza',
                estado: 'bloqueado',
                emocion: 'esperanza',
                conexiones: ['presente', 'conflicto'],
                recuerdosRequeridos: 4,
                color: 0x88ff88
            },
            presente: {
                nombre: 'El Presente',
                estado: 'bloqueado',
                emocion: 'paz',
                conexiones: ['confianza'],
                recuerdosRequeridos: 5,
                color: 0xffffff
            }
        };
    }
    
    configurarEventos() {
        // Escuchar eventos de recuerdos recolectados
        this.scene.events.on('recuerdoRecolectado', (datos) => {
            this.agregarRecuerdo(datos.tipo);
        });
        
        // Escuchar eventos de enemigos calmados
        this.scene.events.on('enemigoCalmado', () => {
            this.verificarDesbloqueos();
        });
    }
    
    cargarZona(nombreZona) {
        const config = this.configZonas[nombreZona];
        if (!config || config.estado === 'bloqueado') {
            console.log(`Zona ${nombreZona} no disponible`);
            return null;
        }
        
        console.log(`Cargando zona: ${config.nombre}`);
        
        try {
            // Cargar mapa Tiled
            const mapa = this.scene.make.tilemap({ key: `mapa_${nombreZona}` });
            
            // Cargar tileset
            const tileset = mapa.addTilesetImage('tileset_emocional', 'tileset_emocional');
            
            if (!tileset) {
                console.error(`No se pudo cargar tileset para ${nombreZona}`);
                return null;
            }
            
            // Crear capas
            const capas = {
                fondo: mapa.createLayer('fondo', tileset, 0, 0),
                plataformas: mapa.createLayer('plataformas', tileset, 0, 0),
                detalle: mapa.createLayer('detalle', tileset, 0, 0),
                colisiones: mapa.createLayer('colisiones', tileset, 0, 0),
                objetos: mapa.getObjectLayer('objetos')
            };
            
            // Configurar colisiones
            if (capas.colisiones) {
                capas.colisiones.setCollisionByProperty({ colisiona: true });
            }
            
            // Aplicar efectos emocionales
            this.aplicarEfectosEmocionales(nombreZona, capas);
            
            // Procesar objetos del mapa
            const objetosProcesados = this.procesarObjetosMapa(capas.objetos, nombreZona);
            
            // Guardar referencia al mapa
            this.mapas.set(nombreZona, {
                mapa: mapa,
                tileset: tileset,
                capas: capas,
                objetos: objetosProcesados,
                cargado: true
            });
            
            // Actualizar estado emocional global
            this.estadoEmocionalGlobal = config.emocion;
            
            return {
                mapa: mapa,
                capas: capas,
                objetos: objetosProcesados
            };
            
        } catch (error) {
            console.error(`Error cargando zona ${nombreZona}:`, error);
            return null;
        }
    }
    
    procesarObjetosMapa(objetosLayer, nombreZona) {
        if (!objetosLayer || !objetosLayer.objects) {
            return [];
        }
        
        const objetosProcesados = [];
        
        objetosLayer.objects.forEach(obj => {
            const objeto = {
                tipo: obj.type || obj.name,
                x: obj.x,
                y: obj.y,
                width: obj.width,
                height: obj.height,
                propiedades: obj.properties || {}
            };
            
            // Procesar según tipo
            switch(objeto.tipo) {
                case 'spawn_jugador':
                    objeto.esSpawn = true;
                    break;
                    
                case 'enemigo':
                    objeto.tipoEnemigo = objeto.propiedades.tipo || 'duda';
                    break;
                    
                case 'recuerdo':
                    objeto.tipoRecuerdo = objeto.propiedades.tipo || 'felicidad';
                    break;
                    
                case 'portal':
                    objeto.zonaDestino = objeto.propiedades.zona;
                    objeto.spawnDestino = objeto.propiedades.spawn;
                    break;
                    
                case 'plataforma_movil':
                    objeto.velocidad = objeto.propiedades.velocidad || 100;
                    objeto.distancia = objeto.propiedades.distancia || 200;
                    break;
                    
                case 'trigger':
                    objeto.evento = objeto.propiedades.evento;
                    objeto.accion = objeto.propiedades.accion;
                    break;
            }
            
            objetosProcesados.push(objeto);
        });
        
        return objetosProcesados;
    }
    
    aplicarEfectosEmocionales(zona, capas) {
        const config = this.configZonas[zona];
        if (!config) return;
        
        // Aplicar tint a todas las capas visibles
        Object.values(capas).forEach(capa => {
            if (capa && capa.setTint) {
                capa.setTint(config.color);
                capa.setAlpha(config.emocion === 'tension' ? 0.9 : 1);
            }
        });
        
        // Efectos especiales por emoción
        switch(config.emocion) {
            case 'tristeza':
                this.aplicarEfectoLluvia();
                break;
                
            case 'tension':
                this.aplicarEfectoTemblor();
                break;
                
            case 'nostalgia':
                this.aplicarEfectoVignette();
                break;
        }
    }
    
    aplicarEfectoLluvia() {
        // Crear efecto de lluvia con partículas
        const particulas = this.scene.add.particles('particula_emocion');
        
        particulas.createEmitter({
            x: { min: 0, max: 1280 },
            y: -50,
            speedY: { min: 200, max: 400 },
            speedX: { min: -50, max: 50 },
            scale: { start: 0.1, end: 0 },
            alpha: { start: 0.3, end: 0 },
            tint: 0x4444ff,
            lifespan: 2000,
            quantity: 5,
            frequency: 100
        });
    }
    
    aplicarEfectoTemblor() {
        // Temblor leve en la cámara
        this.scene.cameras.main.shake(10000, 0.002);
    }
    
    aplicarEfectoVignette() {
        // Efecto vignette (oscurecimiento en bordes)
        const vignette = this.scene.add.graphics();
        vignette.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0, 0, 0.3, 0.7);
        vignette.fillRect(0, 0, 1280, 720);
        vignette.setAlpha(0.3);
    }
    
    agregarRecuerdo(tipo) {
        if (!this.recuerdosRecolectados.includes(tipo)) {
            this.recuerdosRecolectados.push(tipo);
            console.log(`Recuerdo agregado: ${tipo}. Total: ${this.recuerdosRecolectados.length}`);
            
            this.verificarDesbloqueos();
            
            // Emitir evento
            this.scene.events.emit('mapaActualizado', {
                recuerdos: this.recuerdosRecolectados.length,
                zonasDesbloqueadas: this.zonasDesbloqueadas.size
            });
        }
    }
    
    verificarDesbloqueos() {
        Object.keys(this.configZonas).forEach(zona => {
            const config = this.configZonas[zona];
            
            if (config.estado === 'bloqueado' && 
                this.recuerdosRecolectados.length >= config.recuerdosRequeridos) {
                
                this.desbloquearZona(zona);
            }
        });
    }
    
    desbloquearZona(zona) {
        const config = this.configZonas[zona];
        if (!config || config.estado !== 'bloqueado') return;
        
        console.log(`¡Zona desbloqueada: ${config.nombre}!`);
        
        config.estado = 'disponible';
        this.zonasDesbloqueadas.add(zona);
        
        // Mostrar notificación
        this.mostrarNotificacionDesbloqueo(zona);
        
        // Emitir evento
        this.scene.events.emit('zonaDesbloqueada', {
            zona: zona,
            nombre: config.nombre,
            emocion: config.emocion
        });
    }
    
    mostrarNotificacionDesbloqueo(zona) {
        const config = this.configZonas[zona];
        if (!config) return;
        
        const centerX = this.scene.cameras.main.centerX;
        const centerY = this.scene.cameras.main.centerY;
        
        // Panel de notificación
        const panel = this.scene.add.rectangle(centerX, centerY, 500, 80, 0x000000, 0.8)
            .setStrokeStyle(2, config.color);
        
        // Texto de notificación
        const titulo = this.scene.add.text(centerX, centerY - 15, '¡NUEVA ZONA DISPONIBLE!', {
            fontFamily: 'Courier New',
            fontSize: '18px',
            color: '#ffffff',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        const nombreZona = this.scene.add.text(centerX, centerY + 15, config.nombre, {
            fontFamily: 'Courier New',
            fontSize: '24px',
            color: Phaser.Display.Color.IntegerToColor(config.color).rgba,
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        // Animación
        panel.setAlpha(0).setScale(0.8);
        titulo.setAlpha(0);
        nombreZona.setAlpha(0);
        
        this.scene.tweens.add({
            targets: [panel, titulo, nombreZona],
            alpha: 1,
            scale: 1,
            duration: 500,
            ease: 'Back.out'
        });
        
        // Desvanecer después de 3 segundos
        this.scene.time.delayedCall(3000, () => {
            this.scene.tweens.add({
                targets: [panel, titulo, nombreZona],
                alpha: 0,
                y: '-=20',
                duration: 500,
                onComplete: () => {
                    panel.destroy();
                    titulo.destroy();
                    nombreZona.destroy();
                }
            });
        });
    }
    
    // ========== UTILIDADES ==========
    
    getZonaActual() {
        // Determinar zona actual basada en la escena
        const escenaActual = this.scene.scene.key.toLowerCase();
        return this.configZonas[escenaActual] ? escenaActual : 'inicio';
    }
    
    getZonasDisponibles() {
        return Array.from(this.zonasDesbloqueadas);
    }
    
    getRecuerdosRecolectados() {
        return this.recuerdosRecolectados.length;
    }
    
    getProgreso() {
        const totalZonas = Object.keys(this.configZonas).length;
        const totalRecuerdos = 5; // Máximo de recuerdos únicos
        
        return {
            zonas: {
                desbloqueadas: this.zonasDesbloqueadas.size,
                total: totalZonas,
                porcentaje: (this.zonasDesbloqueadas.size / totalZonas) * 100
            },
            recuerdos: {
                recolectados: this.recuerdosRecolectados.length,
                total: totalRecuerdos,
                porcentaje: (this.recuerdosRecolectados.length / totalRecuerdos) * 100
            }
        };
    }
    
    // ========== DEBUG ==========
    
    desbloquearTodasZonas() {
        Object.keys(this.configZonas).forEach(zona => {
            this.desbloquearZona(zona);
        });
    }
    
    resetearProgreso() {
        this.recuerdosRecolectados = [];
        this.zonasDesbloqueadas.clear();
        this.zonasDesbloqueadas.add('inicio');
        
        Object.keys(this.configZonas).forEach(zona => {
            if (zona !== 'inicio') {
                this.configZonas[zona].estado = 'bloqueado';
            }
        });
    }
}