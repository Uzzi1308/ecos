export default class DialogoSystem {
    constructor(scene) {
        this.scene = scene;
        this.dialogoActual = null;
        this.textoCompleto = '';
        this.textoMostrado = '';
        this.indiceCaracter = 0;
        this.velocidadTexto = 30; // ms por caracter
        this.autoAvanzar = false;
        this.tiempoAutoAvance = 3000; // ms
        this.historial = [];
        
        this.crearInterfazDialogo();
        this.configurarControles();
    }
    
    crearInterfazDialogo() {
        // Fondo del diálogo
        this.fondo = this.scene.add.rectangle(640, 600, 1200, 150, 0x000000, 0.7)
            .setOrigin(0.5)
            .setVisible(false)
            .setDepth(1000);
        
        // Texto del diálogo
        this.texto = this.scene.add.text(200, 540, '', {
            fontFamily: 'Courier New',
            fontSize: '20px',
            color: '#ffffff',
            wordWrap: { width: 1000 },
            lineSpacing: 5
        }).setOrigin(0, 0)
          .setVisible(false)
          .setDepth(1001);
        
        // Indicador de continuación
        this.indicador = this.scene.add.text(1150, 670, '▼', {
            fontFamily: 'Courier New',
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5)
          .setVisible(false)
          .setDepth(1002);
        
        // Nombre del hablante (opcional)
        this.nombre = this.scene.add.text(200, 510, '', {
            fontFamily: 'Courier New',
            fontSize: '16px',
            color: '#3498db',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5)
          .setVisible(false)
          .setDepth(1001);
    }
    
    configurarControles() {
        // Espacio para avanzar diálogo
        this.scene.input.keyboard.on('keydown-SPACE', () => {
            this.avanzarDialogo();
        });
        
        // Enter también avanza
        this.scene.input.keyboard.on('keydown-ENTER', () => {
            this.avanzarDialogo();
        });
        
        // Click también avanza
        this.scene.input.on('pointerdown', () => {
            this.avanzarDialogo();
        });
    }
    
    mostrar(texto, x, y, config = {}) {
        if (this.dialogoActual) {
            // Si hay un diálogo en curso, cerrarlo primero
            this.cerrarDialogo();
        }
        
        this.dialogoActual = {
            texto: texto,
            x: x,
            y: y,
            config: config
        };
        
        // Obtener texto del diálogo (puede ser un array o string)
        if (Array.isArray(texto)) {
            this.textoCompleto = Phaser.Utils.Array.GetRandom(texto);
        } else {
            this.textoCompleto = texto;
        }
        
        this.textoMostrado = '';
        this.indiceCaracter = 0;
        this.autoAvanzar = config.autoAvanzar || false;
        
        // Mostrar interfaz
        this.fondo.setVisible(true);
        this.texto.setVisible(true);
        
        // Posicionar si hay coordenadas específicas
        if (x && y) {
            this.fondo.setPosition(x, y - 100);
            this.texto.setPosition(x - 500, y - 130);
            this.indicador.setPosition(x + 450, y - 30);
        }
        
        // Mostrar nombre si se especifica
        if (config.nombre) {
            this.nombre.setText(config.nombre);
            this.nombre.setPosition(x - 500, y - 150);
            this.nombre.setVisible(true);
        }
        
        // Iniciar escritura
        this.timer = this.scene.time.addEvent({
            delay: this.velocidadTexto,
            callback: this.escribirCaracter,
            callbackScope: this,
            loop: true
        });
        
        // Agregar al historial
        this.historial.push({
            texto: this.textoCompleto,
            timestamp: new Date().toISOString(),
            config: config
        });
        
        // Limitar historial a 50 entradas
        if (this.historial.length > 50) {
            this.historial.shift();
        }
        
        // Pausar el juego si es un diálogo importante
        if (config.pausarJuego) {
            this.scene.physics.pause();
            this.scene.jugador.setVelocity(0, 0);
        }
    }
    
    escribirCaracter() {
        if (this.indiceCaracter < this.textoCompleto.length) {
            const caracter = this.textoCompleto.charAt(this.indiceCaracter);
            this.textoMostrado += caracter;
            this.texto.setText(this.textoMostrado);
            this.indiceCaracter++;
            
            // Efecto de sonido cada 3 caracteres
            if (this.indiceCaracter % 3 === 0) {
                this.scene.sound.play('sfx_texto', { volume: 0.1 });
            }
            
            // Efecto visual para caracteres especiales
            if (caracter === '!' || caracter === '?') {
                this.texto.setScale(1.02);
                this.scene.tweens.add({
                    targets: this.texto,
                    scale: 1,
                    duration: 100
                });
            }
        } else {
            // Fin del texto
            this.timer.remove();
            this.indicador.setVisible(true);
            
            // Animación del indicador
            this.scene.tweens.add({
                targets: this.indicador,
                y: '+=10',
                duration: 500,
                yoyo: true,
                repeat: -1
            });
            
            // Auto-avanzar si está configurado
            if (this.autoAvanzar) {
                this.scene.time.delayedCall(this.tiempoAutoAvance, () => {
                    this.avanzarDialogo();
                });
            }
        }
    }
    
    avanzarDialogo() {
        if (!this.dialogoActual) return;
        
        if (this.indiceCaracter < this.textoCompleto.length) {
            // Saltar al final del texto
            this.timer.remove();
            this.textoMostrado = this.textoCompleto;
            this.texto.setText(this.textoCompleto);
            this.indicador.setVisible(true);
        } else {
            // Cerrar diálogo
            this.cerrarDialogo();
            
            // Ejecutar callback si existe
            if (this.dialogoActual.config.callback) {
                this.dialogoActual.config.callback();
            }
        }
    }
    
    cerrarDialogo() {
        this.fondo.setVisible(false);
        this.texto.setVisible(false);
        this.nombre.setVisible(false);
        this.indicador.setVisible(false);
        
        // Detener animación del indicador
        this.scene.tweens.killTweensOf(this.indicador);
        
        // Detener timer si existe
        if (this.timer) {
            this.timer.remove();
        }
        
        // Reanudar juego si estaba pausado
        if (this.dialogoActual && this.dialogoActual.config.pausarJuego) {
            this.scene.physics.resume();
        }
        
        this.dialogoActual = null;
    }
    
    // ========== DIÁLOGOS ESPECIALES ==========
    
    mostrarDialogoEmocional(tipo, x, y) {
        const dialogos = {
            miedo: [
                "Tengo miedo de que me abandones...",
                "¿Y si no soy suficiente para ti?",
                "Me aterra pensar en el futuro sin ti"
            ],
            duda: [
                "¿Realmente quieres estar aquí conmigo?",
                "A veces no sé si esto es lo correcto",
                "Mis pensamientos me confunden"
            ],
            amor: [
                "Tu presencia me llena de paz",
                "Contigo todo tiene más sentido",
                "Eres mi refugio seguro"
            ],
            esperanza: [
                "Creo que podemos superar esto",
                "Juntos somos más fuertes",
                "Cada día es una nueva oportunidad"
            ]
        };
        
        this.mostrar(dialogos[tipo] || ["..."], x, y, {
            nombre: tipo.charAt(0).toUpperCase() + tipo.slice(1),
            color: this.getColorPorEmocion(tipo)
        });
    }
    
    mostrarDialogoSistema(texto, tipo = 'info') {
        const colores = {
            info: 0x3498db,
            exito: 0x2ecc71,
            advertencia: 0xf39c12,
            error: 0xe74c3c
        };
        
        const nombres = {
            info: 'Sistema',
            exito: '¡Éxito!',
            advertencia: 'Advertencia',
            error: 'Error'
        };
        
        this.mostrar(texto, 640, 200, {
            nombre: nombres[tipo],
            color: colores[tipo],
            autoAvanzar: true,
            tiempoAutoAvance: 2000
        });
    }
    
    getColorPorEmocion(emocion) {
        const colores = {
            miedo: 0x4444ff,
            duda: 0x888888,
            amor: 0xff00ff,
            esperanza: 0x00ff00,
            felicidad: 0xffff00,
            tristeza: 0x0000ff
        };
        
        return colores[emocion] || 0xffffff;
    }
    
    // ========== UTILIDADES ==========
    
    isMostrandoDialogo() {
        return this.dialogoActual !== null;
    }
    
    getHistorial() {
        return this.historial;
    }
    
    limpiarHistorial() {
        this.historial = [];
    }
    
    setVelocidadTexto(velocidad) {
        this.velocidadTexto = Phaser.Math.Clamp(velocidad, 10, 100);
    }
    
    // ========== DEBUG ==========
    
    mostrarDialogoPrueba() {
        const dialogosPrueba = [
            "Este es un diálogo de prueba para verificar que el sistema funciona correctamente.",
            "¿Ves cómo el texto aparece caracter por caracter?",
            "¡Espero que te guste el efecto!",
            "Puedes presionar ESPACIO para avanzar más rápido."
        ];
        
        let indice = 0;
        
        const mostrarSiguiente = () => {
            if (indice < dialogosPrueba.length) {
                this.mostrar(dialogosPrueba[indice], 640, 400, {
                    nombre: 'Prueba',
                    callback: mostrarSiguiente
                });
                indice++;
            }
        };
        
        mostrarSiguiente();
    }
}