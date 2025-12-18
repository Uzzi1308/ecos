class AudioManager {
    constructor(scene) {
        this.scene = scene;
        this.musicaActual = null;
        this.volumenBase = 0.5;
        this.estadoEmocional = 'neutral';
        
        this.configurarPistas();
    }
    
    configurarPistas() {
        this.pistas = {
            inicio: {
                clave: 'musica_inicio',
                volumen: 0.4,
                loop: true,
                fadeIn: 2000
            },
            distancia: {
                clave: 'musica_distancia',
                volumen: 0.3,
                loop: true,
                fadeIn: 3000
            },
            recuerdos: {
                clave: 'musica_recuerdos',
                volumen: 0.5,
                loop: true,
                fadeIn: 4000
            },
            conflicto: {
                clave: 'musica_conflicto',
                volumen: 0.6,
                loop: true,
                fadeIn: 1000
            },
            confianza: {
                clave: 'musica_confianza',
                volumen: 0.5,
                loop: true,
                fadeIn: 2000
            },
            presente: {
                clave: 'musica_presente',
                volumen: 0.4,
                loop: true,
                fadeIn: 5000
            }
        };
    }
    
    cambiarMusica(zona, transicion = true) {
        const config = this.pistas[zona];
        if (!config) return;
        
        // Detener música actual
        if (this.musicaActual && transicion) {
            this.scene.tweens.add({
                targets: this.musicaActual,
                volume: 0,
                duration: 1000,
                onComplete: () => {
                    this.musicaActual.stop();
                    this.iniciarMusica(config);
                }
            });
        } else {
            if (this.musicaActual) {
                this.musicaActual.stop();
            }
            this.iniciarMusica(config);
        }
    }
    
    iniciarMusica(config) {
        this.musicaActual = this.scene.sound.add(config.clave, {
            volume: 0,
            loop: config.loop
        });
        
        this.musicaActual.play();
        
        // Fade in
        this.scene.tweens.add({
            targets: this.musicaActual,
            volume: config.volumen * this.volumenBase,
            duration: config.fadeIn,
            ease: 'Power2'
        });
    }
     
    ajustarPorEmocion(emocion) {
        const ajustes = {
            alegria: { rate: 1.1, detune: 100 },
            tristeza: { rate: 0.9, detune: -200 },
            calma: { rate: 1.0, detune: 0 },
            conflicto: { rate: 1.2, detune: 0, volume: 0.7 }
        };
        
        const ajuste = ajustes[emocion] || ajustes.calma;
        
        if (this.musicaActual) {
            this.scene.tweens.add({
                targets: this.musicaActual,
                rate: ajuste.rate,
                detune: ajuste.detune,
                volume: (ajuste.volume || 1) * this.volumenBase,
                duration: 3000
            });
        }
    }
}