export default class EfectosVisuales {
    constructor(scene) {
        this.scene = scene;
        this.particulas = new Map();
        this.filtros = [];
        this.efectosActivos = new Set();
    }
    
    // ========== EFECTOS DE PARTÍCULAS ==========
    
    crearParticulasViento(x, y) {
        const particulas = this.scene.add.particles('particula_emocion');
        
        const emitter = particulas.createEmitter({
            x: x,
            y: y,
            speedY: { min: 100, max: 300 },
            speedX: { min: -200, max: -50 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 0.3, end: 0 },
            tint: 0xaaaaaa,
            blendMode: 'NORMAL',
            lifespan: 2000,
            quantity: 5,
            frequency: 100
        });
        
        this.particulas.set('viento', { particulas, emitter });
        return emitter;
    }
    
    crearParticulasLluvia() {
        const particulas = this.scene.add.particles('particula_emocion');
        
        const emitter = particulas.createEmitter({
            x: { min: 0, max: 1280 },
            y: -50,
            speedY: { min: 200, max: 400 },
            speedX: { min: -50, max: 50 },
            scale: { start: 0.1, end: 0 },
            alpha: { start: 0.3, end: 0 },
            tint: 0x4444ff,
            blendMode: 'NORMAL',
            lifespan: 2000,
            quantity: 10,
            frequency: 50
        });
        
        this.particulas.set('lluvia', { particulas, emitter });
        return emitter;
    }
    
    crearParticulasPolvo() {
        const particulas = this.scene.add.particles('particula_emocion');
        
        const emitter = particulas.createEmitter({
            x: { min: 0, max: 1280 },
            y: 720,
            speedY: { min: -50, max: -10 },
            speedX: { min: -20, max: 20 },
            scale: { start: 0.2, end: 0 },
            alpha: { start: 0.1, end: 0 },
            tint: 0x8b4513,
            blendMode: 'NORMAL',
            lifespan: 3000,
            quantity: 3,
            frequency: 200
        });
        
        this.particulas.set('polvo', { particulas, emitter });
        return emitter;
    }
    
    // ========== FILTROS Y EFECTOS VISUALES ==========
    
    aplicarFiltroEmocional(emocion) {
        this.removerFiltros();
        
        switch(emocion) {
            case 'tristeza':
                this.aplicarFiltroTristeza();
                break;
                
            case 'tension':
                this.aplicarFiltroTension();
                break;
                
            case 'nostalgia':
                this.aplicarFiltroNostalgia();
                break;
                
            case 'felicidad':
                this.aplicarFiltroFelicidad();
                break;
                
            case 'paz':
                this.aplicarFiltroPaz();
                break;
        }
    }
    
    aplicarFiltroTristeza() {
        // Tinte azul y desaturación
        const tint = this.scene.cameras.main.postFX.addColorMatrix();
        tint.saturate(-0.5, true);
        tint.tint(0.7, 0.7, 1, true);
        
        this.filtros.push(tint);
        this.efectosActivos.add('tristeza');
    }
    
    aplicarFiltroTension() {
        // Tinte rojo y contraste aumentado
        const tint = this.scene.cameras.main.postFX.addColorMatrix();
        tint.contrast(0.2, true);
        tint.tint(1, 0.8, 0.8, true);
        
        // Efecto de vibración leve
        this.scene.cameras.main.shake(10000, 0.001);
        
        this.filtros.push(tint);
        this.efectosActivos.add('tension');
    }
    
    aplicarFiltroNostalgia() {
        // Sepia y vignette
        const sepia = this.scene.cameras.main.postFX.addColorMatrix();
        sepia.sepia();
        
        const vignette = this.scene.cameras.main.postFX.addVignette(0.5, 0.5, 0.8, 0.8);
        
        this.filtros.push(sepia, vignette);
        this.efectosActivos.add('nostalgia');
    }
    
    aplicarFiltroFelicidad() {
        // Brillo aumentado y saturación
        const bright = this.scene.cameras.main.postFX.addColorMatrix();
        bright.brightness(0.1, true);
        bright.saturate(0.3, true);
        
        this.filtros.push(bright);
        this.efectosActivos.add('felicidad');
    }
    
    aplicarFiltroPaz() {
        // Desenfoque leve y tinte azul claro
        const blur = this.scene.cameras.main.postFX.addBlur(1, 1, 0);
        const tint = this.scene.cameras.main.postFX.addColorMatrix();
        tint.tint(0.9, 0.9, 1, true);
        
        this.filtros.push(blur, tint);
        this.efectosActivos.add('paz');
    }
    
    removerFiltros() {
        this.filtros.forEach(filtro => {
            if (filtro && filtro.destroy) {
                filtro.destroy();
            }
        });
        
        this.filtros = [];
        this.efectosActivos.clear();
        
        // Detener efectos de cámara
        this.scene.cameras.main.shakeEffect.reset();
        this.scene.cameras.main.flashEffect.reset();
    }
    
    // ========== EFECTOS ESPECIALES ==========
    
    efectoTransicionZona(zonaOrigen, zonaDestino) {
        // Efecto de vortex/portal
        const centerX = this.scene.cameras.main.centerX;
        const centerY = this.scene.cameras.main.centerY;
        
        const vortex = this.scene.add.circle(centerX, centerY, 10, 0x9b59b6, 0.8);
        
        this.scene.tweens.add({
            targets: vortex,
            radius: 500,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => vortex.destroy()
        });
        
        // Partículas en espiral
        const particulas = this.scene.add.particles('particula_emocion');
        
        const emitter = particulas.createEmitter({
            x: centerX,
            y: centerY,
            speed: { min: 100, max: 300 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.3, end: 0 },
            alpha: { start: 0.8, end: 0 },
            tint: 0x9b59b6,
            blendMode: 'ADD',
            lifespan: 1500,
            quantity: 50,
            frequency: -1
        });
        
        // Animación en espiral
        let angle = 0;
        const updateEmitter = () => {
            if (!emitter.active) return;
            
            angle += 0.1;
            const radius = 100;
            emitter.setPosition(
                centerX + Math.cos(angle) * radius,
                centerY + Math.sin(angle) * radius
            );
            
            this.scene.time.delayedCall(16, updateEmitter); // ~60 FPS
        };
        
        updateEmitter();
        
        this.scene.time.delayedCall(1000, () => {
            emitter.destroy();
            particulas.destroy();
        });
    }
    
    efectoRevelacion() {
        // Efecto de revelación (para caminos ocultos)
        const flash = this.scene.cameras.main.postFX.addGlow(0xffffff, 4, 0, false, 0.1);
        
        this.scene.tweens.add({
            targets: flash,
            outerStrength: 0,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => {
                flash.destroy();
            }
        });
    }
    
    efectoMemoriaRecuperada() {
        // Efecto cuando se recupera una memoria importante
        const centerX = this.scene.cameras.main.centerX;
        const centerY = this.scene.cameras.main.centerY;
        
        // Flash blanco
        this.scene.cameras.main.flash(500, 255, 255, 255);
        
        // Anillos concéntricos
        for (let i = 0; i < 5; i++) {
            const anillo = this.scene.add.circle(centerX, centerY, 10, 0xffffff, 0.3);
            
            this.scene.tweens.add({
                targets: anillo,
                radius: 400,
                alpha: 0,
                duration: 1000,
                delay: i * 100,
                ease: 'Power2',
                onComplete: () => anillo.destroy()
            });
        }
    }
    
    // ========== EFECTOS DE INTERACCIÓN ==========
    
    efectoInteraccion(x, y, tipo) {
        const efectos = {
            recuerdo: {
                color: 0xffff00,
                particulas: 20,
                scale: 0.5
            },
            enemigo: {
                color: 0xff4444,
                particulas: 15,
                scale: 0.3
            },
            plataforma: {
                color: 0x3498db,
                particulas: 10,
                scale: 0.2
            }
        };
        
        const config = efectos[tipo] || efectos.recuerdo;
        
        const particulas = this.scene.add.particles('particula_emocion');
        
        const emitter = particulas.createEmitter({
            x: x,
            y: y,
            speed: { min: 50, max: 150 },
            angle: { min: 0, max: 360 },
            scale: { start: config.scale, end: 0 },
            alpha: { start: 0.8, end: 0 },
            tint: config.color,
            blendMode: 'ADD',
            lifespan: 1000,
            quantity: config.particulas,
            frequency: -1
        });
        
        this.scene.time.delayedCall(1000, () => {
            emitter.destroy();
            particulas.destroy();
        });
    }
    
    // ========== UTILIDADES ==========
    
    limpiarEfectos() {
        // Limpiar partículas
        this.particulas.forEach(({ particulas, emitter }) => {
            if (emitter) emitter.destroy();
            if (particulas) particulas.destroy();
        });
        
        this.particulas.clear();
        
        // Limpiar filtros
        this.removerFiltros();
    }
    
    update() {
        // Actualizar efectos activos
        if (this.efectosActivos.has('tension')) {
            // Efecto de pulso para tensión
            const tiempo = this.scene.time.now * 0.001;
            const pulso = Math.sin(tiempo * 5) * 0.05 + 0.95;
            
            this.filtros.forEach(filtro => {
                if (filtro.setAlpha) {
                    filtro.setAlpha(pulso);
                }
            });
        }
    }
}