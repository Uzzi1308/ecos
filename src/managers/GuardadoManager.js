export default class GuardadoManager {
    constructor() {
        this.clave = 'ecos_guardado_v1';
        this.datos = this.cargar() || this.crearNuevoGuardado();
        this.autoguardado = true;
        this.intervaloAutoguardado = 30000; // 30 segundos
        this.iniciarAutoguardado();
    }
    
    crearNuevoGuardado() {
        return {
            version: 1,
            fechaCreacion: new Date().toISOString(),
            ultimoAcceso: new Date().toISOString(),
            
            // Progreso del juego
            zonaActual: 'inicio',
            recuerdosRecolectados: [],
            habilidadesDesbloqueadas: [],
            enemigosCalmados: 0,
            
            // Estadísticas
            tiempoJugado: 0,
            muertes: 0,
            finalAlcanzado: null,
            
            // Estado del mundo
            zonasDesbloqueadas: ['inicio'],
            eventosCompletados: [],
            
            // Estado del jugador
            posicionJugador: { x: 100, y: 300 },
            confianzaJugador: 50,
            emocionJugador: 'neutral',
            
            // Configuración
            configuracion: {
                volumen: 0.7,
                volumenMusica: 0.5,
                volumenEfectos: 0.7,
                velocidadTexto: 1.0,
                pantallaCompleta: false,
                idioma: 'es'
            }
        };
    }
    
    guardar() {
        try {
            // Actualizar timestamp
            this.datos.ultimoAcceso = new Date().toISOString();
            
            // Convertir a JSON
            const datosJSON = JSON.stringify(this.datos);
            
            // Guardar en localStorage
            localStorage.setItem(this.clave, datosJSON);
            
            console.log('Partida guardada exitosamente');
            return true;
            
        } catch (error) {
            console.error('Error guardando partida:', error);
            return false;
        }
    }
    
    cargar() {
        try {
            const datosJSON = localStorage.getItem(this.clave);
            
            if (!datosJSON) {
                return null;
            }
            
            const datos = JSON.parse(datosJSON);
            
            // Verificar versión
            if (datos.version !== 1) {
                console.warn('Versión de guardado diferente, creando nuevo');
                return null;
            }
            
            console.log('Partida cargada exitosamente');
            return datos;
            
        } catch (error) {
            console.error('Error cargando partida:', error);
            return null;
        }
    }
    
    iniciarAutoguardado() {
        if (!this.autoguardado) return;
        
        setInterval(() => {
            this.guardar();
        }, this.intervaloAutoguardado);
    }
    
    // ========== MÉTODOS DE ACTUALIZACIÓN ==========
    
    actualizarProgreso(scene) {
        if (!scene || !scene.jugador) return;
        
        const jugador = scene.jugador;
        
        // Actualizar datos del jugador
        this.datos.posicionJugador = { x: jugador.x, y: jugador.y };
        this.datos.confianzaJugador = jugador.confianza;
        this.datos.emocionJugador = jugador.estadoEmocional;
        
        // Actualizar zona actual
        this.datos.zonaActual = scene.scene.key;
        
        // Actualizar tiempo jugado (aproximado)
        this.datos.tiempoJugado += 1/60; // Asumiendo 60 FPS
        
        // Actualizar habilidades
        this.datos.habilidadesDesbloqueadas = [];
        Object.keys(jugador.habilidades).forEach(habilidad => {
            if (jugador.habilidades[habilidad]) {
                this.datos.habilidadesDesbloqueadas.push(habilidad);
            }
        });
        
        // Actualizar estadísticas del jugador
        this.datos.recuerdosRecolectados = jugador.recuerdosRecolectados;
        this.datos.enemigosCalmados = jugador.enemigosCalmados;
        
        // Si hay mapaManager, actualizar zonas desbloqueadas
        if (scene.mapaManager) {
            this.datos.zonasDesbloqueadas = scene.mapaManager.getZonasDisponibles();
        }
    }
    
    agregarRecuerdo(recuerdo) {
        if (!this.datos.recuerdosRecolectados.includes(recuerdo)) {
            this.datos.recuerdosRecolectados.push(recuerdo);
            this.guardar();
        }
    }
    
    desbloquearHabilidad(hab) {
        if (!this.datos.habilidadesDesbloqueadas.includes(hab)) {
            this.datos.habilidadesDesbloqueadas.push(hab);
            this.guardar();
        }
    }
    
    desbloquearZona(zona) {
        if (!this.datos.zonasDesbloqueadas.includes(zona)) {
            this.datos.zonasDesbloqueadas.push(zona);
            this.guardar();
        }
    }
    
    registrarEvento(evento) {
        if (!this.datos.eventosCompletados.includes(evento)) {
            this.datos.eventosCompletados.push(evento);
            this.guardar();
        }
    }
    
    registrarMuerte() {
        this.datos.muertes++;
        this.guardar();
    }
    
    registrarFinal(final) {
        this.datos.finalAlcanzado = final;
        this.guardar();
    }
    
    // ========== CONFIGURACIÓN ==========
    
    actualizarConfiguracion(nuevaConfig) {
        this.datos.configuracion = {
            ...this.datos.configuracion,
            ...nuevaConfig
        };
        this.guardar();
    }
    
    getConfiguracion() {
        return this.datos.configuracion;
    }
    
    // ========== ESTADÍSTICAS ==========
    
    getEstadisticas() {
        return {
            tiempoJugado: this.datos.tiempoJugado,
            recuerdosRecolectados: this.datos.recuerdosRecolectados.length,
            enemigosCalmados: this.datos.enemigosCalmados,
            zonasDesbloqueadas: this.datos.zonasDesbloqueadas.length,
            habilidadesDesbloqueadas: this.datos.habilidadesDesbloqueadas.length,
            muertes: this.datos.muertes,
            finalAlcanzado: this.datos.finalAlcanzado,
            fechaCreacion: this.datos.fechaCreacion,
            ultimoAcceso: this.datos.ultimoAcceso
        };
    }
    
    getProgreso() {
        const totalZonas = 6;
        const totalRecuerdos = 5;
        const totalHabilidades = 4;
        
        return {
            zonas: {
                actual: this.datos.zonasDesbloqueadas.length,
                total: totalZonas,
                porcentaje: (this.datos.zonasDesbloqueadas.length / totalZonas) * 100
            },
            recuerdos: {
                actual: this.datos.recuerdosRecolectados.length,
                total: totalRecuerdos,
                porcentaje: (this.datos.recuerdosRecolectados.length / totalRecuerdos) * 100
            },
            habilidades: {
                actual: this.datos.habilidadesDesbloqueadas.length,
                total: totalHabilidades,
                porcentaje: (this.datos.habilidadesDesbloqueadas.length / totalHabilidades) * 100
            }
        };
    }
    
    // ========== CARGAR PARTIDA EN ESCENA ==========
    
    cargarEnEscena(scene) {
        if (!scene || !scene.jugador) return;
        
        const jugador = scene.jugador;
        
        // Cargar posición del jugador
        if (this.datos.posicionJugador) {
            jugador.x = this.datos.posicionJugador.x;
            jugador.y = this.datos.posicionJugador.y;
        }
        
        // Cargar estadísticas del jugador
        jugador.confianza = this.datos.confianzaJugador || 50;
        jugador.estadoEmocional = this.datos.emocionJugador || 'neutral';
        jugador.recuerdosRecolectados = this.datos.recuerdosRecolectados.length || 0;
        jugador.enemigosCalmados = this.datos.enemigosCalmados || 0;
        
        // Cargar habilidades
        this.datos.habilidadesDesbloqueadas.forEach(habilidad => {
            if (jugador.habilidades.hasOwnProperty(habilidad)) {
                jugador.habilidades[habilidad] = true;
            }
        });
        
        // Si hay mapaManager, cargar zonas desbloqueadas
        if (scene.mapaManager) {
            this.datos.zonasDesbloqueadas.forEach(zona => {
                scene.mapaManager.desbloquearZona(zona);
            });
        }
        
        console.log('Progreso cargado en escena');
    }
    
    // ========== UTILIDADES ==========
    
    existePartida() {
        return localStorage.getItem(this.clave) !== null;
    }
    
    limpiar() {
        localStorage.removeItem(this.clave);
        this.datos = this.crearNuevoGuardado();
        console.log('Partida reiniciada');
    }
    
    exportar() {
        return JSON.stringify(this.datos, null, 2);
    }
    
    importar(datosJSON) {
        try {
            const datos = JSON.parse(datosJSON);
            
            if (datos.version !== 1) {
                throw new Error('Versión de guardado incompatible');
            }
            
            this.datos = datos;
            this.guardar();
            console.log('Partida importada exitosamente');
            return true;
            
        } catch (error) {
            console.error('Error importando partida:', error);
            return false;
        }
    }
    
    // ========== BACKUP ==========
    
    crearBackup() {
        const backupKey = `${this.clave}_backup_${Date.now()}`;
        localStorage.setItem(backupKey, JSON.stringify(this.datos));
        return backupKey;
    }
    
    restaurarBackup(backupKey) {
        const backup = localStorage.getItem(backupKey);
        if (backup) {
            try {
                this.datos = JSON.parse(backup);
                this.guardar();
                console.log('Backup restaurado exitosamente');
                return true;
            } catch (error) {
                console.error('Error restaurando backup:', error);
                return false;
            }
        }
        return false;
    }
}