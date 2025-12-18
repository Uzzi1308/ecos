export default class HabilidadManager {
    constructor(scene) {
        this.scene = scene;
        this.habilidadesDesbloqueadas = new Set();
        this.habilidadesActivas = new Map();
        this.cooldowns = new Map();
        
        this.inicializarHabilidades();
        this.configurarEventos();
    }
    
    inicializarHabilidades() {
        this.habilidades = {
            escuchar: {
                nombre: 'Escuchar',
                clave: 'E',
                descripcion: "Quedarse quieto para revelar caminos ocultos",
                activa: false,
                desbloqueada: false,
                duracion: 2000,
                cooldown: 5000,
                icono: 'ui_escuchar',
                color: 0x3498db
            },
            confiar: {
                nombre: 'Confiar',
                clave: 'Soltar Controles',
                descripcion: "Saltos largos que requieren soltar el control",
                activa: false,
                desbloqueada: false,
                fuerzaSalto: 600,
                icono: 'ui_confiar',
                color: 0x2ecc71
            },
            recordar: {
                nombre: 'Recordar',
                clave: 'R',
                descripcion: "Reconstruir áreas del pasado",
                activa: false,
                desbloqueada: false,
                costoMemorias: 1,
                cooldown: 10000,
                icono: 'ui_recordar',
                color: 0xe74c3c
            },
            perdonar: {
                nombre: 'Perdonar',
                clave: 'F',
                descripcion: "Transformar zonas hostiles",
                activa: false,
                desbloqueada: false,
                radio: 150,
                cooldown: 8000,
                icono: 'ui_perdonar',
                color: 0x9b59b6
            }
        };
    }
    
    configurarEventos() {
        // Escuchar eventos de desbloqueo de habilidades
        this.scene.events.on('habilidadDesbloqueada', (nombreHabilidad) => {
            this.desbloquearHabilidad(nombreHabilidad);
        });
        
        // Escuchar eventos de recuerdos recolectados
        this.scene.events.on('recuerdoRecolectado', () => {
            this.verificarDesbloqueos();
        });
    }
    
    verificarDesbloqueos() {
        const jugador = this.scene.jugador;
        if (!jugador) return;
        
        // Desbloquear habilidades según recuerdos recolectados
        if (jugador.recuerdosRecolectados >= 1 && !this.habilidades.escuchar.desbloqueada) {
            this.desbloquearHabilidad('escuchar');
        }
        
        if (jugador.recuerdosRecolectados >= 2 && !this.habilidades.confiar.desbloqueada) {
            this.desbloquearHabilidad('confiar');
        }
        
        if (jugador.recuerdosRecolectados >= 3 && !this.habilidades.recordar.desbloqueada) {
            this.desbloquearHabilidad('recordar');
        }
        
        if (jugador.recuerdosRecolectados >= 4 && !this.habilidades.perdonar.desbloqueada) {
            this.desbloquearHabilidad('perdonar');
        }
    }
    
    desbloquearHabilidad(nombre) {
        const habilidad = this.habilidades[nombre];
        if (!habilidad || habilidad.desbloqueada) return false;
        
        console.log(`¡Habilidad desbloqueada: ${habilidad.nombre}!`);
        
        habilidad.desbloqueada = true;
        habilidad.activa = true;
        this.habilidadesDesbloqueadas.add(nombre);
        
        // Notificar al jugador
        if (this.scene.jugador) {
            this.scene.jugador.habilidades[nombre] = true;
        }
        
        // Mostrar notificación
        this.mostrarNotificacionDesbloqueo(habilidad);
        
        // Emitir evento
        this.scene.events.emit('habilidadDesbloqueadaCompleta', habilidad);
        
        return true;
    }
    
    mostrarNotificacionDesbloqueo(habilidad) {
        const centerX = this.scene.cameras.main.centerX;
        const centerY = this.scene.cameras.main.centerY;
        
        // Panel de notificación
        const panel = this.scene.add.rectangle(centerX, centerY - 100, 400, 100, 0x000000, 0.8)
            .setStrokeStyle(2, habilidad.color);
        
        // Texto de notificación
        const titulo = this.scene.add.text(centerX, centerY - 120, '¡HABILIDAD DESBLOQUEADA!', {
            fontFamily: 'Courier New',
            fontSize: '20px',
            color: '#ffffff',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        const nombreHabilidad = this.scene.add.text(centerX, centerY - 100, habilidad.nombre, {
            fontFamily: 'Courier New',
            fontSize: '24px',
            color: Phaser.Display.Color.IntegerToColor(habilidad.color).rgba,
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        const descripcion = this.scene.add.text(centerX, centerY - 70, habilidad.descripcion, {
            fontFamily: 'Courier New',
            fontSize: '16px',
            color: '#cccccc'
        }).setOrigin(0.5);
        
        const controles = this.scene.add.text(centerX, centerY - 40, `Tecla: ${habilidad.clave}`, {
            fontFamily: 'Courier New',
            fontSize: '14px',
            color: '#aaaaaa',
            fontStyle: 'italic'
        }).setOrigin(0.5);
        
        // Animación de entrada
        panel.setAlpha(0).setScale(0.8);
        titulo.setAlpha(0);
        nombreHabilidad.setAlpha(0);
        descripcion.setAlpha(0);
        controles.setAlpha(0);
        
        this.scene.tweens.add({
            targets: [panel, titulo, nombreHabilidad, descripcion, controles],
            alpha: 1,
            scale: 1,
            duration: 500,
            ease: 'Back.out'
        });
        
        // Animación de salida después de 3 segundos
        this.scene.time.delayedCall(3000, () => {
            this.scene.tweens.add({
                targets: [panel, titulo, nombreHabilidad, descripcion, controles],
                alpha: 0,
                y: '-=20',
                duration: 500,
                ease: 'Power2',
                onComplete: () => {
                    panel.destroy();
                    titulo.destroy();
                    nombreHabilidad.destroy();
                    descripcion.destroy();
                    controles.destroy();
                }
            });
        });
    }
    
    usarHabilidad(nombre) {
        if (!this.habilidadesDesbloqueadas.has(nombre)) {
            console.log(`Habilidad ${nombre} no desbloqueada`);
            return false;
        }
        
        const habilidad = this.habilidades[nombre];
        
        // Verificar cooldown
        if (this.cooldowns.has(nombre)) {
            const tiempoRestante = this.cooldowns.get(nombre) - this.scene.time.now;
            if (tiempoRestante > 0) {
                console.log(`Habilidad en cooldown: ${Math.ceil(tiempoRestante / 1000)}s`);
                return false;
            }
        }
        
        // Ejecutar habilidad
        let exito = false;
        
        switch(nombre) {
            case 'escuchar':
                exito = this.ejecutarEscuchar();
                break;
                
            case 'recordar':
                exito = this.ejecutarRecordar();
                break;
                
            case 'perdonar':
                exito = this.ejecutarPerdonar();
                break;
                
            case 'confiar':
                // Esta habilidad se activa automáticamente
                exito = true;
                break;
        }
        
        if (exito && habilidad.cooldown) {
            this.cooldowns.set(nombre, this.scene.time.now + habilidad.cooldown);
            this.mostrarCooldown(nombre, habilidad.cooldown);
        }
        
        return exito;
    }
    
    ejecutarEscuchar() {
        const jugador = this.scene.jugador;
        if (!jugador) return false;
        
        return jugador.usarHabilidad('escuchar');
    }
    
    ejecutarRecordar() {
        const jugador = this.scene.jugador;
        if (!jugador) return false;
        
        return jugador.usarHabilidad('recordar');
    }
    
    ejecutarPerdonar() {
        const jugador = this.scene.jugador;
        if (!jugador) return false;
        
        return jugador.usarHabilidad('perdonar');
    }
    
    mostrarCooldown(nombre, duracion) {
        // Mostrar indicador visual de cooldown en la UI
        if (this.scene.uiSystem) {
            this.scene.uiSystem.mostrarCooldown(nombre, duracion);
        }
    }
    
    // ========== GETTERS Y UTILIDADES ==========
    
    getHabilidad(nombre) {
        return this.habilidades[nombre];
    }
    
    getHabilidadesDesbloqueadas() {
        return Array.from(this.habilidadesDesbloqueadas);
    }
    
    getCooldownRestante(nombre) {
        if (!this.cooldowns.has(nombre)) return 0;
        
        const tiempoRestante = this.cooldowns.get(nombre) - this.scene.time.now;
        return Math.max(0, tiempoRestante);
    }
    
    // ========== DEBUG ==========
    
    desbloquearTodas() {
        Object.keys(this.habilidades).forEach(nombre => {
            this.desbloquearHabilidad(nombre);
        });
    }
    
    resetearHabilidades() {
        this.habilidadesDesbloqueadas.clear();
        this.habilidadesActivas.clear();
        this.cooldowns.clear();
        
        Object.keys(this.habilidades).forEach(nombre => {
            this.habilidades[nombre].desbloqueada = false;
            this.habilidades[nombre].activa = false;
        });
        
        if (this.scene.jugador) {
            Object.keys(this.scene.jugador.habilidades).forEach(nombre => {
                this.scene.jugador.habilidades[nombre] = false;
            });
        }
    }
}