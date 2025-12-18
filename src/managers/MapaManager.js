export default class MapaManager {
    constructor(scene) {
        this.scene = scene;
        this.mapas = new Map();
        this.conexiones = [];
        this.recuerdosRecolectados = [];
        this.estadoEmocionalGlobal = 'neutral';
        
        this.cargarMapas();
    }
    
    cargarMapas() {
        // Carga asíncrona de cada zona
        const zonas = ['inicio', 'distancia', 'recuerdos', 'conflicto', 'confianza', 'presente'];
        
        zonas.forEach(zona => {
            this.mapas.set(zona, {
                cargado: false,
                tileset: null,
                capas: {},
                objetos: [],
                estado: 'bloqueado' // bloqueado, disponible, completado
            });
        });
        
        // La zona de inicio siempre disponible
        this.mapas.get('inicio').estado = 'disponible';
    }
    
    cargarZona(nombreZona, x, y) {
        const zona = this.mapas.get(nombreZona);
        
        if (!zona || zona.estado === 'bloqueado') {
            return false;
        }
        
        // Crea el mapa de tiles
        const map = this.scene.make.tilemap({ key: `mapa_${nombreZona}` });
        const tileset = map.addTilesetImage('tileset_emocional', 'tileset');
        
        // Capas específicas para cada zona
        const capas = {
            fondo: map.createLayer('fondo', tileset, 0, 0),
            plataformas: map.createLayer('plataformas', tileset, 0, 0),
            detalle: map.createLayer('detalle', tileset, 0, 0),
            colisiones: map.createLayer('colisiones', tileset, 0, 0)
        };
        
        // Configurar colisiones
        capas.colisiones.setCollisionByProperty({ colisiona: true });
        
        // Procesar objetos del mapa
        const objetos = map.getObjectLayer('objetos').objects;
        this.procesarObjetos(objetos, nombreZona);
        
        // Aplicar filtro emocional
        this.aplicarFiltroEmocional(nombreZona, capas);
        
        zona.cargado = true;
        zona.tileset = tileset;
        zona.capas = capas;
        
        return true;
    }
    
    aplicarFiltroEmocional(zona, capas) {
        const filtros = {
            inicio: { tint: 0x88ccff, alpha: 0.9 },
            distancia: { tint: 0xaaaaaa, alpha: 0.7 },
            conflicto: { tint: 0xff8888, alpha: 0.8 },
            recuerdos: { tint: 0xffcc88, alpha: 1.0 },
            confianza: { tint: 0x88ff88, alpha: 1.0 },
            presente: { tint: 0xffffff, alpha: 1.0 }
        };
        
        const filtro = filtros[zona] || filtros.neutral;
        
        Object.values(capas).forEach(capa => {
            if (capa) {
                capa.setTint(filtro.tint);
                capa.setAlpha(filtro.alpha);
            }
        });
    }
    
    agregarRecuerdo(recuerdo) {
        this.recuerdosRecolectados.push(recuerdo);
        
        // Desbloquear nuevas áreas basadas en recuerdos
        this.actualizarConexiones();
        
        // Cambiar estado emocional de zonas
        this.actualizarEstadosEmocionales();
    }
    
    actualizarConexiones() {
        const conexionesPorRecuerdo = {
            'recuerdo_1': ['inicio', 'distancia'],
            'recuerdo_2': ['distancia', 'recuerdos'],
            'recuerdo_3': ['conflicto', 'confianza'],
            'recuerdo_4': ['confianza', 'presente']
        };
        
        this.recuerdosRecolectados.forEach(recuerdo => {
            if (conexionesPorRecuerdo[recuerdo.id]) {
                const [origen, destino] = conexionesPorRecuerdo[recuerdo.id];
                this.conectarZonas(origen, destino);
            }
        });
    }
    
    conectarZonas(zonaA, zonaB) {
        const conexion = `${zonaA}-${zonaB}`;
        if (!this.conexiones.includes(conexion)) {
            this.conexiones.push(conexion);
            this.mapas.get(zonaB).estado = 'disponible';
            
            // Evento para actualizar el mapa del juego
            this.scene.events.emit('zonaDesbloqueada', zonaB);
        }
    }
}