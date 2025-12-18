export default class AudioManager {
    constructor(scene) {
        this.scene = scene;
        this.musicaActual = null;
        this.volumenBase = 0.5;
        this.estadoEmocional = 'neutral';
        this.sonidosActivos = new Map();
        
        this.configurarPistas();
        this.configurarEventos();
    }
    
    configurarPistas() {
        this.pistas = {
            inicio: {
                clave: 'musica_inicio',
                volumen: 0.4,
                loop: true,
                fadeIn: 2000,
                emocion: 'calma'
            },
            distancia: {
                clave: 'musica_distancia',
                volumen: 0.3,
                loop: true,
                fadeIn: 3000,
                emocion: 'tristeza'
            },
            recuerdos: {
                clave: 'musica_recuerdos',
                volumen: 0.5,
                loop: true,
                fadeIn: 4000,
                emocion: 'nostalgia'
            },
            conflicto: {
                clave: 'musica_conflicto',
                volumen: 0.6,
                loop: true,
                fadeIn: 1000,
                emocion: 'tension'
            },
            confianza: {
                clave: 'musica_confianza',
                volumen: 0.5,
                loop: true,
                fadeIn: 2000,
                emocion: 'esperanza'
            },
            presente: {
                clave: 'musica_presente',
                volumen: 0.4,
                loop: true,
                fadeIn: 5000,
                emocion: 'paz'
            },
            menu: {
                clave: 'musica_inicio',
                volumen: 0.4,
                loop: true,
                fadeIn: 1000,
                emocion: 'calma'
            }
        };
    }
    
    configurarEventos() {
        // Escuchar cambios de escena
        this.scene.events.on('transitionstart', (fromScene, toScene) => {
            this.cambiarMusicaPorEscena(toScene);
        });
        
        // Escuchar eventos emocionales
        this.scene.events.on('cambioEmocional', (emocion) => {
            this.ajustarPorEmocion(emocion);
        });
        
        // Escuchar eventos del juego
        this.scene.events.on('recuerdoRecolectado', () => {
            this.reproducirEfecto('sfx_recuerdo');
        });
        
        this.scene.events.on('enemigoCalmado', () => {
            this.reproducirEfecto('sfx_perdonar');
        });
    }
    
    cambiarMusicaPorEscena(escena) {
        const nombreEscena = escena.toLowerCase();
        
        // Determinar qué música tocar según la escena
        let pista = this.pistas.menu;
        
        if (nombreEscena.includes('inicio')) pista = this.pistas.inicio;
        else if (nombreEscena.includes('distancia')) pista = this.pistas.distancia;
        else if (nombreEscena.includes('recuerdos')) pista = this.pistas.recuerdos;
        else if (nombreEscena.includes('conflicto')) pista = this.pistas.conflicto;
        else if (nombreEscena.includes('confianza')) pista = this.pistas.confianza;
        else if (nombreEscena.includes('presente')) pista = this.pistas.presente;
        
        this.cambiarMusica(pista, true);
    }
    
    cambiarMusica(pista, transicion = true) {
        if (!pista || !pista.clave) return;
        
        console.log(`Cambiando música a: ${pista.clave}`);
        
        // Detener música actual con transición
        if (this.musicaActual && transicion) {
            this.scene.tweens.add({
                targets: this.musicaActual,
                volume: 0,
                duration: 1000,
                onComplete: () => {
                    this.musicaActual.stop();
                    this.iniciarMusica(pista);
                }
            });
        } else {
            if (this.musicaActual) {
                this.musicaActual.stop();
            }
            this.iniciarMusica(pista);
        }
    }
    
    iniciarMusica(pista) {
        // Crear instancia de sonido
        this.musicaActual = this.scene.sound.add(pista.clave, {
            volume: 0,
            loop: pista.loop
        });
        
        this.musicaActual.play();
        
        // Fade in
        this.scene.tweens.add({
            targets: this.musicaActual,
            volume: pista.volumen * this.volumenBase,
            duration: pista.fadeIn,
            ease: 'Power2'
        });
        
        // Actualizar estado emocional
        this.estadoEmocional = pista.emocion;
    }
    
    ajustarPorEmocion(emocion) {
        const ajustes = {
            alegria: { rate: 1.1, detune: 100, volumen: 1.0 },
            tristeza: { rate: 0.9, detune: -200, volumen: 0.8 },
            calma: { rate: 1.0, detune: 0, volumen: 0.7 },
            tension: { rate: 1.2, detune: 50, volumen: 0.9 },
            nostalgia: { rate: 0.95, detune: -100, volumen: 0.6 },
            esperanza: { rate: 1.05, detune: 0, volumen: 0.8 },
            paz: { rate: 0.98, detune: 0, volumen: 0.5 }
        };
        
        const ajuste = ajustes[emocion] || ajustes.calma;
        
        if (this.musicaActual && this.musicaActual.isPlaying) {
            this.scene.tweens.add({
                targets: this.musicaActual,
                rate: ajuste.rate,
                detune: ajuste.detune,
                volume: ajuste.volumen * this.volumenBase,
                duration: 3000,
                ease: 'Power2'
            });
        }
        
        this.estadoEmocional = emocion;
    }
    
    reproducirEfecto(clave, config = {}) {
        const efecto = this.scene.sound.add(clave, {
            volume: config.volumen || 0.3,
            ...config
        });
        
        efecto.play();
        
        // Registrar sonido activo
        const id = Date.now();
        this.sonidosActivos.set(id, efecto);
        
        // Limpiar registro cuando termine
        efecto.on('complete', () => {
            this.sonidosActivos.delete(id);
        });
        
        return id;
    }
    
    detenerEfecto(id) {
        const efecto = this.sonidosActivos.get(id);
        if (efecto) {
            efecto.stop();
            this.sonidosActivos.delete(id);
        }
    }
    
    detenerTodosEfectos() {
        this.sonidosActivos.forEach(efecto => {
            efecto.stop();
        });
        this.sonidosActivos.clear();
    }
    
    setVolumen(volumen) {
        this.volumenBase = Phaser.Math.Clamp(volumen, 0, 1);
        
        if (this.musicaActual) {
            this.musicaActual.setVolume(this.musicaActual.volume * this.volumenBase);
        }
    }
    
    pausarMusica() {
        if (this.musicaActual && this.musicaActual.isPlaying) {
            this.musicaActual.pause();
        }
    }
    
    reanudarMusica() {
        if (this.musicaActual && this.musicaActual.isPaused) {
            this.musicaActual.resume();
        }
    }
    
    detenerMusica() {
        if (this.musicaActual) {
            this.musicaActual.stop();
            this.musicaActual = null;
        }
    }
    
    // ========== GETTERS ==========
    
    getEstado() {
        return {
            musicaActual: this.musicaActual ? this.musicaActual.key : null,
            estadoEmocional: this.estadoEmocional,
            volumen: this.volumenBase,
            sonidosActivos: this.sonidosActivos.size
        };
    }
    
    // ========== DEBUG ==========
    
    listarPistas() {
        return Object.keys(this.pistas).map(clave => ({
            clave: clave,
            ...this.pistas[clave]
        }));
    }
}