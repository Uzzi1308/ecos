export default class EfectosVisuales {
    constructor(scene) {
        this.scene = scene;
        this.particulas = null;
        this.filtros = [];
        
        this.crearSistemasDeParticulas();
    }
    
    crearSistemasDeParticulas() {
        // Partículas para recuerdos
        this.particulasRecuerdos = this.scene.add.particles('particula_recuerdo');
        
        // Partículas para transiciones emocionales
        this.particulasEmocion = this.scene.add.particles('particula_emocion');
    }
    
    transicionEmocional(zonaAnterior, zonaNueva) {
        // Oscurecer pantalla
        const overlay = this.scene.add.rectangle(
            this.scene.cameras.main.centerX,
            this.scene.cameras.main.centerY,
            this.scene.cameras.main.width,
            this.scene.cameras.main.height,
            0x000000,
            0
        );
        
        // Animación de fade
        this.scene.tweens.add({
            targets: overlay,
            alpha: 1,
            duration: 800,
            ease: 'Power2',
            onComplete: () => {
                // Cambiar de escena
                this.scene.scene.start(zonaNueva);
                
                // Fade in
                this.scene.tweens.add({
                    targets: overlay,
                    alpha: 0,
                    duration: 800,
                    delay: 300
                });
            }
        });
    }
    
    efectoRecuerdoRecolectado(x, y, tipo) {
        // Efecto de partículas
        const emitter = this.particulasRecuerdos.createEmitter({
            x: x,
            y: y,
            speed: { min: 50, max: 150 },
            angle: { min: 0, max: 360 },
            scale: { start: 1, end: 0 },
            blendMode: 'ADD',
            lifespan: 1000,
            quantity: 30
        });
        
        // Color según tipo de recuerdo
        const colores = {
            felicidad: 0xffff88,
            tristeza: 0x8888ff,
            amor: 0xff8888,
            esperanza: 0x88ff88
        };
        
        emitter.setTint(colores[tipo] || 0xffffff);
        
        // Destruir después
        this.scene.time.delayedCall(1000, () => {
            emitter.destroy();
        });
    }
    
    cambiarPaletaEmocional(emocion) {
        const paletas = {
            alegria: { principal: 0xffcc00, secundario: 0xff9966, fondo: 0x664400 },
            tristeza: { principal: 0x4466ff, secundario: 0x88aaff, fondo: 0x222244 },
            calma: { principal: 0x88cc88, secundario: 0xccffcc, fondo: 0x446644 },
            conflicto: { principal: 0xff4444, secundario: 0xff8888, fondo: 0x442222 }
        };
        
        const paleta = paletas[emocion] || paletas.calma;
        
        // Aplicar a capas del mapa
        const capas = this.scene.map.children.list.filter(
            child => child.type === 'TilemapLayer'
        );
        
        capas.forEach(capa => {
            this.scene.tweens.add({
                targets: capa,
                tint: paleta.fondo,
                duration: 2000,
                ease: 'Power2'
            });
        });
    }
}