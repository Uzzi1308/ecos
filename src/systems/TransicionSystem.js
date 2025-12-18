export default class TransicionSystem {
    constructor(scene) {
        this.scene = scene;
        this.transicionActiva = false;
        this.crearOverlay();
    }
    
    crearOverlay() {
        this.overlay = this.scene.add.rectangle(
            this.scene.cameras.main.centerX,
            this.scene.cameras.main.centerY,
            this.scene.cameras.main.width,
            this.scene.cameras.main.height,
            0x000000,
            0
        ).setOrigin(0.5).setDepth(9999);
    }
    
    transicionEmocional(zonaAnterior, zonaNueva) {
        if (this.transicionActiva) return;
        
        this.transicionActiva = true;
        
        console.log(`Transición: ${zonaAnterior} -> ${zonaNueva}`);
        
        // Fade out
        this.scene.tweens.add({
            targets: this.overlay,
            alpha: 1,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                // Cambiar de escena
                this.scene.scene.start(zonaNueva);
                
                // Fade in después de un breve delay
                this.scene.time.delayedCall(500, () => {
                    this.scene.tweens.add({
                        targets: this.overlay,
                        alpha: 0,
                        duration: 1000,
                        ease: 'Power2',
                        onComplete: () => {
                            this.transicionActiva = false;
                        }
                    });
                });
            }
        });
    }
    
    efectoRecuerdoRecolectado(x, y, tipo) {
        const particulas = this.scene.add.particles('particula_recuerdo');
        
        const emitter = particulas.createEmitter({
            x: x,
            y: y,
            speed: { min: 50, max: 150 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 1, end: 0 },
            blendMode: 'ADD',
            lifespan: 1000,
            quantity: 30
        });
        
        const colores = {
            felicidad: 0xffff88,
            tristeza: 0x8888ff,
            amor: 0xff8888,
            esperanza: 0x88ff88
        };
        
        emitter.setTint(colores[tipo] || 0xffffff);
        
        this.scene.time.delayedCall(1000, () => {
            emitter.destroy();
            particulas.destroy();
        });
    }
    
    efectoSaltoConfianza(x, y) {
        // Círculo expansivo
        const circulo = this.scene.add.circle(x, y, 10, 0x88ff88, 0.5);
        
        this.scene.tweens.add({
            targets: circulo,
            radius: 100,
            alpha: 0,
            duration: 500,
            onComplete: () => circulo.destroy()
        });
        
        // Partículas
        const particulas = this.scene.add.particles('particula_emocion');
        
        const emitter = particulas.createEmitter({
            x: x,
            y: y,
            speed: { min: 50, max: 200 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 1, end: 0 },
            tint: 0x88ff88,
            blendMode: 'ADD',
            lifespan: 1000,
            quantity: 20
        });
        
        this.scene.time.delayedCall(1000, () => {
            emitter.destroy();
            particulas.destroy();
        });
    }
    
    efectoHabilidadUsada(hab, x, y) {
        switch(hab) {
            case 'escuchar':
                this.efectoOndaSonora(x, y);
                break;
                
            case 'recordar':
                this.efectoFlash();
                break;
                
            case 'perdonar':
                this.efectoAnillosExpansivos(x, y);
                break;
        }
    }
    
    efectoOndaSonora(x, y) {
        const onda1 = this.scene.add.circle(x, y, 10, 0x3498db, 0.3);
        const onda2 = this.scene.add.circle(x, y, 10, 0x3498db, 0.2);
        const onda3 = this.scene.add.circle(x, y, 10, 0x3498db, 0.1);
        
        this.scene.tweens.add({
            targets: onda1,
            radius: 300,
            alpha: 0,
            duration: 2000,
            ease: 'Power2'
        });
        
        this.scene.time.delayedCall(300, () => {
            this.scene.tweens.add({
                targets: onda2,
                radius: 300,
                alpha: 0,
                duration: 1700,
                ease: 'Power2'
            });
        });
        
        this.scene.time.delayedCall(600, () => {
            this.scene.tweens.add({
                targets: onda3,
                radius: 300,
                alpha: 0,
                duration: 1400,
                ease: 'Power2',
                onComplete: () => {
                    onda1.destroy();
                    onda2.destroy();
                    onda3.destroy();
                }
            });
        });
    }
    
    efectoFlash() {
        const flash = this.scene.add.rectangle(
            this.scene.cameras.main.centerX,
            this.scene.cameras.main.centerY,
            this.scene.cameras.main.width,
            this.scene.cameras.main.height,
            0xffffff,
            0
        ).setOrigin(0.5).setDepth(9998);
        
        this.scene.tweens.add({
            targets: flash,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            onComplete: () => {
                flash.destroy();
            }
        });
    }
    
    efectoAnillosExpansivos(x, y) {
        const anillos = [];
        
        for (let i = 0; i < 3; i++) {
            const anillo = this.scene.add.circle(x, y, 10, 0xff88ff, 0.4);
            anillos.push(anillo);
            
            this.scene.tweens.add({
                targets: anillo,
                radius: 200,
                alpha: 0,
                duration: 1000,
                delay: i * 200,
                ease: 'Power2',
                onComplete: () => anillo.destroy()
            });
        }
    }
    
    efectoDano(x, y) {
        // Efecto de daño (parpadeo rojo)
        const danoOverlay = this.scene.add.rectangle(
            this.scene.cameras.main.centerX,
            this.scene.cameras.main.centerY,
            this.scene.cameras.main.width,
            this.scene.cameras.main.height,
            0xff0000,
            0
        ).setOrigin(0.5).setDepth(9997);
        
        this.scene.tweens.add({
            targets: danoOverlay,
            alpha: 0.3,
            duration: 100,
            yoyo: true,
            repeat: 2,
            onComplete: () => {
                danoOverlay.destroy();
            }
        });
        
        // Partículas de "dolor"
        const particulas = this.scene.add.particles('particula_emocion');
        
        const emitter = particulas.createEmitter({
            x: x,
            y: y,
            speed: { min: 50, max: 150 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.3, end: 0 },
            alpha: { start: 0.8, end: 0 },
            tint: 0xff0000,
            blendMode: 'ADD',
            lifespan: 500,
            quantity: 15
        });
        
        this.scene.time.delayedCall(500, () => {
            emitter.destroy();
            particulas.destroy();
        });
    }
    
    efectoCuracion(x, y) {
        // Partículas de curación
        const particulas = this.scene.add.particles('particula_emocion');
        
        const emitter = particulas.createEmitter({
            x: x,
            y: y,
            speed: { min: 20, max: 80 },
            angle: { min: 270 - 45, max: 270 + 45 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 1, end: 0 },
            tint: 0x00ff00,
            blendMode: 'ADD',
            lifespan: 1000,
            quantity: 10
        });
        
        this.scene.time.delayedCall(1000, () => {
            emitter.destroy();
            particulas.destroy();
        });
    }
}