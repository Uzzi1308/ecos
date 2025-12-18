export default class UISystem {
    constructor(scene) {
        this.scene = scene;
        this.elementos = new Map();
        this.notificaciones = [];
        this.cooldowns = new Map();
        
        this.crearUIBase();
        this.configurarEventos();
    }
    
    crearUIBase() {
        // ========== BARRA DE CONFIANZA ==========
        this.barraConfianza = this.scene.add.container(20, 20);
        
        const fondoBarra = this.scene.add.rectangle(0, 0, 200, 20, 0x444444)
            .setOrigin(0, 0);
        
        this.rellenoConfianza = this.scene.add.rectangle(2, 2, 0, 16, 0x2ecc71)
            .setOrigin(0, 0);
        
        const textoConfianza = this.scene.add.text(100, 10, 'CONFIANZA', {
            fontFamily: 'Courier New',
            fontSize: '12px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        this.barraConfianza.add([fondoBarra, this.rellenoConfianza, textoConfianza]);
        this.barraConfianza.setScrollFactor(0);
        
        // ========== CONTADOR DE RECUERDOS ==========
        this.contadorRecuerdos = this.scene.add.container(20, 50);
        
        const iconoRecuerdo = this.scene.add.image(0, 0, 'recuerdo')
            .setScale(0.5)
            .setTint(0xffff00);
        
        this.textoRecuerdos = this.scene.add.text(20, 0, '0', {
            fontFamily: 'Courier New',
            fontSize: '16px',
            color: '#ffff00'
        }).setOrigin(0, 0.5);
        
        this.contadorRecuerdos.add([iconoRecuerdo, this.textoRecuerdos]);
        this.contadorRecuerdos.setScrollFactor(0);
        
        // ========== HABILIDADES DESBLOQUEADAS ==========
        this.contenedorHabilidades = this.scene.add.container(20, 80);
        this.habilidadesUI = new Map();
        
        // ========== INDICADOR DE ZONA ==========
        this.indicadorZona = this.scene.add.text(640, 20, '', {
            fontFamily: 'Courier New',
            fontSize: '14px',
            color: '#aaaaaa',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setScrollFactor(0).setAlpha(0);
        
        // ========== MENÚ DE PAUSA ==========
        this.crearMenuPausa();
        
        // Guardar referencia a elementos
        this.elementos.set('barraConfianza', this.barraConfianza);
        this.elementos.set('contadorRecuerdos', this.contadorRecuerdos);
        this.elementos.set('contenedorHabilidades', this.contenedorHabilidades);
        this.elementos.set('indicadorZona', this.indicadorZona);
    }
    
    configurarEventos() {
        // Escuchar eventos del juego
        this.scene.events.on('cambioConfianza', (confianza) => {
            this.actualizarBarraConfianza(confianza);
        });
        
        this.scene.events.on('recuerdoRecolectado', (datos) => {
            this.actualizarContadorRecuerdos(datos.total);
        });
        
        this.scene.events.on('habilidadDesbloqueada', (habilidad) => {
            this.agregarHabilidadUI(habilidad);
        });
        
        this.scene.events.on('zonaDesbloqueada', (datos) => {
            this.mostrarIndicadorZona(datos.nombre);
        });
        
        this.scene.events.on('cambioEmocional', (emocion) => {
            this.actualizarColorUI(emocion);
        });
    }
    
    // ========== ACTUALIZACIÓN DE UI ==========
    
    actualizarBarraConfianza(confianza) {
        const anchoMaximo = 196; // 200 - 4 de padding
        const anchoActual = (confianza / 100) * anchoMaximo;
        
        this.scene.tweens.add({
            targets: this.rellenoConfianza,
            width: anchoActual,
            duration: 500,
            ease: 'Power2'
        });
        
        // Cambiar color según confianza
        let color = 0xe74c3c; // Rojo (baja confianza)
        if (confianza > 30) color = 0xf39c12; // Naranja
        if (confianza > 60) color = 0x2ecc71; // Verde
        
        this.scene.tweens.add({
            targets: this.rellenoConfianza,
            fillColor: color,
            duration: 500
        });
    }
    
    actualizarContadorRecuerdos(cantidad) {
        this.textoRecuerdos.setText(cantidad.toString());
        
        // Efecto de animación
        this.scene.tweens.add({
            targets: this.contadorRecuerdos,
            scale: 1.2,
            duration: 200,
            yoyo: true,
            ease: 'Power2'
        });
    }
    
    agregarHabilidadUI(nombreHabilidad) {
        if (this.habilidadesUI.has(nombreHabilidad)) return;
        
        const habilidadManager = this.scene.habilidadManager;
        if (!habilidadManager) return;
        
        const habilidad = habilidadManager.getHabilidad(nombreHabilidad);
        if (!habilidad) return;
        
        const index = this.habilidadesUI.size;
        const x = 0;
        const y = index * 40;
        
        // Crear elemento UI para la habilidad
        const contenedor = this.scene.add.container(x, y);
        
        // Icono
        const icono = this.scene.add.rectangle(0, 0, 30, 30, habilidad.color)
            .setStrokeStyle(2, 0xffffff);
        
        // Tecla
        const tecla = this.scene.add.text(0, 0, habilidad.clave.substring(0, 3), {
            fontFamily: 'Courier New',
            fontSize: '10px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        // Nombre
        const nombre = this.scene.add.text(20, 0, habilidad.nombre, {
            fontFamily: 'Courier New',
            fontSize: '12px',
            color: '#ffffff'
        }).setOrigin(0, 0.5);
        
        contenedor.add([icono, tecla, nombre]);
        this.contenedorHabilidades.add(contenedor);
        
        // Guardar referencia
        this.habilidadesUI.set(nombreHabilidad, contenedor);
        
        // Animación de entrada
        contenedor.setAlpha(0).setScale(0.5);
        this.scene.tweens.add({
            targets: contenedor,
            alpha: 1,
            scale: 1,
            duration: 500,
            ease: 'Back.out',
            delay: index * 100
        });
    }
    
    mostrarIndicadorZona(nombreZona) {
        this.indicadorZona.setText(`Zona: ${nombreZona}`);
        this.indicadorZona.setAlpha(1);
        
        // Desvanecer después de 3 segundos
        this.scene.tweens.add({
            targets: this.indicadorZona,
            alpha: 0,
            duration: 1000,
            delay: 3000
        });
    }
    
    actualizarColorUI(emocion) {
        const colores = {
            feliz: 0x2ecc71,
            triste: 0x3498db,
            neutral: 0xffffff,
            tension: 0xe74c3c,
            esperanza: 0x9b59b6
        };
        
        const color = colores[emocion] || colores.neutral;
        
        // Aplicar tint a elementos de UI
        this.habilidadesUI.forEach(contenedor => {
            const icono = contenedor.list[0];
            if (icono && icono.setFillStyle) {
                this.scene.tweens.add({
                    targets: icono,
                    fillColor: color,
                    duration: 1000
                });
            }
        });
    }
    
    // ========== NOTIFICACIONES ==========
    
    mostrarNotificacion(texto, tipo = 'info', duracion = 3000) {
        const yPos = 100 + (this.notificaciones.length * 60);
        
        const notificacion = this.scene.add.container(640, yPos);
        
        const colores = {
            info: 0x3498db,
            exito: 0x2ecc71,
            advertencia: 0xf39c12,
            error: 0xe74c3c
        };
        
        const fondo = this.scene.add.rectangle(0, 0, 400, 50, colores[tipo], 0.9)
            .setOrigin(0.5);
        
        const textoNotificacion = this.scene.add.text(0, 0, texto, {
            fontFamily: 'Courier New',
            fontSize: '16px',
            color: '#ffffff',
            wordWrap: { width: 380 }
        }).setOrigin(0.5);
        
        notificacion.add([fondo, textoNotificacion]);
        notificacion.setScrollFactor(0);
        
        // Animación de entrada
        notificacion.setAlpha(0).setY(yPos - 20);
        this.scene.tweens.add({
            targets: notificacion,
            alpha: 1,
            y: yPos,
            duration: 500,
            ease: 'Back.out'
        });
        
        // Agregar a la lista
        this.notificaciones.push(notificacion);
        
        // Programar eliminación
        this.scene.time.delayedCall(duracion, () => {
            this.eliminarNotificacion(notificacion);
        });
        
        return notificacion;
    }
    
    eliminarNotificacion(notificacion) {
        const index = this.notificaciones.indexOf(notificacion);
        if (index === -1) return;
        
        // Animación de salida
        this.scene.tweens.add({
            targets: notificacion,
            alpha: 0,
            y: notificacion.y - 20,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                notificacion.destroy();
                this.notificaciones.splice(index, 1);
                
                // Reorganizar notificaciones restantes
                this.notificaciones.forEach((notif, i) => {
                    this.scene.tweens.add({
                        targets: notif,
                        y: 100 + (i * 60),
                        duration: 300
                    });
                });
            }
        });
    }
    
    // ========== COOLDOWNS ==========
    
    mostrarCooldown(nombreHabilidad, duracion) {
        if (!this.habilidadesUI.has(nombreHabilidad)) return;
        
        const contenedor = this.habilidadesUI.get(nombreHabilidad);
        const icono = contenedor.list[0];
        
        // Crear overlay de cooldown
        const overlay = this.scene.add.rectangle(0, 0, 30, 30, 0x000000, 0.7)
            .setOrigin(0.5);
        
        const textoCooldown = this.scene.add.text(0, 0, '', {
            fontFamily: 'Courier New',
            fontSize: '10px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        contenedor.add([overlay, textoCooldown]);
        
        // Actualizar cooldown
        const actualizarCooldown = () => {
            const tiempoRestante = this.cooldowns.get(nombreHabilidad) - this.scene.time.now;
            
            if (tiempoRestante <= 0) {
                overlay.destroy();
                textoCooldown.destroy();
                this.cooldowns.delete(nombreHabilidad);
                return;
            }
            
            const segundos = Math.ceil(tiempoRestante / 1000);
            textoCooldown.setText(segundos.toString());
            
            // Continuar actualizando
            this.scene.time.delayedCall(100, actualizarCooldown);
        };
        
        this.cooldowns.set(nombreHabilidad, this.scene.time.now + duracion);
        actualizarCooldown();
    }
    
    // ========== MENÚ DE PAUSA ==========
    
    crearMenuPausa() {
        this.menuPausa = this.scene.add.container(640, 360);
        
        const fondo = this.scene.add.rectangle(0, 0, 600, 400, 0x000000, 0.9)
            .setOrigin(0.5);
        
        const titulo = this.scene.add.text(0, -150, 'JUEGO EN PAUSA', {
            fontFamily: 'Courier New',
            fontSize: '32px',
            color: '#3498db',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        // Opciones del menú
        const opciones = [
            { texto: 'REANUDAR', accion: 'reanudar' },
            { texto: 'CONFIGURACIÓN', accion: 'configuracion' },
            { texto: 'MENÚ PRINCIPAL', accion: 'menu' },
            { texto: 'SALIR', accion: 'salir' }
        ];
        
        const botones = [];
        
        opciones.forEach((opcion, index) => {
            const y = -50 + (index * 80);
            
            const boton = this.scene.add.text(0, y, opcion.texto, {
                fontFamily: 'Courier New',
                fontSize: '24px',
                color: '#aaaaaa',
                backgroundColor: 'rgba(52, 152, 219, 0.3)',
                padding: { x: 20, y: 10 }
            }).setOrigin(0.5).setInteractive();
            
            // Efectos hover
            boton.on('pointerover', () => {
                boton.setStyle({ color: '#ffffff' });
                this.scene.sound.play('sfx_texto', { volume: 0.1 });
            });
            
            boton.on('pointerout', () => {
                boton.setStyle({ color: '#aaaaaa' });
            });
            
            boton.on('pointerdown', () => {
                this.ejecutarAccionPausa(opcion.accion);
            });
            
            botones.push(boton);
        });
        
        this.menuPausa.add([fondo, titulo, ...botones]);
        this.menuPausa.setVisible(false);
        this.menuPausa.setDepth(2000);
    }
    
    togglePausa() {
        const visible = !this.menuPausa.visible;
        
        if (visible) {
            // Mostrar menú de pausa
            this.menuPausa.setVisible(true);
            this.scene.physics.pause();
            this.scene.jugador.setVelocity(0, 0);
            
            // Animación de entrada
            this.menuPausa.setAlpha(0).setScale(0.8);
            this.scene.tweens.add({
                targets: this.menuPausa,
                alpha: 1,
                scale: 1,
                duration: 300,
                ease: 'Back.out'
            });
        } else {
            // Ocultar menú de pausa
            this.scene.tweens.add({
                targets: this.menuPausa,
                alpha: 0,
                scale: 0.8,
                duration: 200,
                ease: 'Power2',
                onComplete: () => {
                    this.menuPausa.setVisible(false);
                    this.scene.physics.resume();
                }
            });
        }
        
        return visible;
    }
    
    ejecutarAccionPausa(accion) {
        switch(accion) {
            case 'reanudar':
                this.togglePausa();
                break;
                
            case 'configuracion':
                // Abrir menú de configuración
                this.mostrarConfiguracion();
                break;
                
            case 'menu':
                // Volver al menú principal
                this.scene.scene.start('Menu');
                break;
                
            case 'salir':
                // Salir del juego
                if (confirm('¿Seguro que quieres salir?')) {
                    window.location.href = 'about:blank';
                }
                break;
        }
    }
    
    mostrarConfiguracion() {
        // Implementar menú de configuración
        this.mostrarNotificacion('Menú de configuración en desarrollo', 'info');
    }
    
    // ========== ACTUALIZACIÓN ==========
    
update() {
    // 1. Actualizar cooldowns activos
    this.cooldowns.forEach((tiempoExpiracion, nombreHabilidad) => {
        if (this.scene.time.now >= tiempoExpiracion) {
            this.cooldowns.delete(nombreHabilidad);
        }
    });
    
    // 2. Actualizar animación del indicador si está visible
    // (opcional, para efectos adicionales)
    if (this.indicador && this.indicador.visible) {
        // Ya tiene un tween animándolo, no hace falta más
    }
    
    // 3. Limpiar notificaciones expiradas (opcional, ya se manejan con timers)
    // Las notificaciones se eliminan automáticamente con delayedCall
}
}