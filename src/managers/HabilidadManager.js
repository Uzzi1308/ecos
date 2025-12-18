export default class HabilidadManager {
    constructor(scene) {
        this.scene = scene;
        this.habilidadesDesbloqueadas = new Set();
        this.habilidadesActivas = new Map();
        
        this.inicializarHabilidades();
    }
    
    inicializarHabilidades() {
        const definiciones = {
            escuchar: {
                clave: 'E',
                descripcion: "Quedarse quieto para revelar caminos ocultos",
                requisito: 'recuerdo_1',
                activa: false,
                duracion: 2000,
                cooldown: 5000
            },
            confiar: {
                clave: 'ESPACIO',
                descripcion: "Saltos largos que requieren soltar el control",
                requisito: 'recuerdo_3',
                activa: false,
                fuerzaSalto: 600
            },
            recordar: {
                clave: 'R',
                descripcion: "Reconstruir áreas del pasado",
                requisito: 'recuerdo_2',
                activa: false,
                costoMemorias: 1
            },
            perdonar: {
                clave: 'F',
                descripcion: "Transformar zonas hostiles",
                requisito: 'recuerdo_4',
                activa: false,
                radio: 150
            }
        };
        
        this.habilidades = definiciones;
    }
    
    desbloquearHabilidad(nombre) {
        if (this.habilidades[nombre] && !this.habilidadesDesbloqueadas.has(nombre)) {
            this.habilidadesDesbloqueadas.add(nombre);
            this.habilidades[nombre].activa = true;
            
            // Evento visual
            this.scene.events.emit('habilidadDesbloqueada', {
                nombre: nombre,
                descripcion: this.habilidades[nombre].descripcion
            });
            
            return true;
        }
        return false;
    }
    
    verificarRequisitos() {
        const memorias = this.scene.memoriaManager.recuerdosRecolectados;
        
        Object.keys(this.habilidades).forEach(nombre => {
            const habilidad = this.habilidades[nombre];
            
            if (!habilidad.activa && habilidad.requisito) {
                if (memorias.some(m => m.id === habilidad.requisito)) {
                    this.desbloquearHabilidad(nombre);
                }
            }
        });
    }
    
    usarHabilidad(nombre) {
        if (!this.habilidadesDesbloqueadas.has(nombre)) {
            return false;
        }
        
        const habilidad = this.habilidades[nombre];
        
        // Verificar cooldown
        if (this.habilidadesActivas.has(nombre)) {
            const tiempoUsado = this.habilidadesActivas.get(nombre);
            if (Date.now() - tiempoUsado < (habilidad.cooldown || 0)) {
                return false;
            }
        }
        
        // Ejecutar habilidad
        switch(nombre) {
            case 'escuchar':
                this.ejecutarEscuchar();
                break;
            case 'confiar':
                this.ejecutarConfiar();
                break;
            case 'recordar':
                this.ejecutarRecordar();
                break;
            case 'perdonar':
                this.ejecutarPerdonar();
                break;
        }
        
        this.habilidadesActivas.set(nombre, Date.now());
        return true;
    }
    
    ejecutarEscuchar() {
        const jugador = this.scene.jugador;
        
        // Congelar al jugador
        jugador.setVelocity(0, 0);
        jugador.anims.play('escuchar', true);
        
        // Revelar caminos ocultos
        const objetosOcultos = this.scene.children.list.filter(
            obj => obj.alpha === 0 && obj.revelable
        );
        
        objetosOcultos.forEach(obj => {
            this.scene.tweens.add({
                targets: obj,
                alpha: 0.7,
                duration: 1000,
                ease: 'Power2'
            });
        });
        
        // Efecto de sonido
        this.scene.sound.play('sfx_escuchar', { volume: 0.5 });
        
        // Temporizador
        this.scene.time.delayedCall(2000, () => {
            objetosOcultos.forEach(obj => {
                this.scene.tweens.add({
                    targets: obj,
                    alpha: 0,
                    duration: 500
                });
            });
        });
    }
    
    ejecutarConfiar() {
        // Esta habilidad es especial - se activa automáticamente
        // cuando el jugador suelta los controles durante un salto
        this.scene.jugador.saltoConfianzaDisponible = true;
    }
}