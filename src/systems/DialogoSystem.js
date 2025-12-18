export default class DialogoSystem {
    constructor(scene) {
        this.scene = scene;
        this.dialogoActual = null;
        this.textoCompleto = '';
        this.textoMostrado = '';
        this.indiceCaracter = 0;
        this.velocidadTexto = 30; // ms por caracter
        
        this.crearInterfazDialogo();
    }
    
    crearInterfazDialogo() {
        // Fondo semi-transparente
        this.fondo = this.scene.add.rectangle(
            640, 600, 1200, 150, 0x000000, 0.7
        ).setOrigin(0.5).setVisible(false);
        
        // Texto del diálogo
        this.texto = this.scene.add.text(
            200, 540, '', {
                fontFamily: 'PixelFont',
                fontSize: '20px',
                color: '#ffffff',
                wordWrap: { width: 1000 }
            }
        ).setVisible(false);
        
        // Indicador de continuación
        this.indicador = this.scene.add.text(
            1150, 670, '▼', {
                fontFamily: 'PixelFont',
                fontSize: '24px',
                color: '#ffffff'
            }
        ).setVisible(false);
        
        // Configurar entrada
        this.scene.input.keyboard.on('keydown-SPACE', this.avanzarDialogo, this);
    }
    
    mostrar(texto, x, y) {
        if (this.dialogoActual) return;
        
        this.dialogoActual = { texto, x, y };
        this.textoCompleto = this.obtenerDialogoAleatorio(texto);
        this.textoMostrado = '';
        this.indiceCaracter = 0;
        
        // Mostrar interfaz
        this.fondo.setVisible(true);
        this.texto.setVisible(true);
        
        // Posicionar si hay coordenadas específicas
        if (x && y) {
            this.fondo.setPosition(x, y - 100);
            this.texto.setPosition(x - 500, y - 130);
        }
        
        // Iniciar escritura
        this.timer = this.scene.time.addEvent({
            delay: this.velocidadTexto,
            callback: this.escribirCaracter,
            callbackScope: this,
            loop: true
        });
    }
    
    obtenerDialogoAleatorio(tipo) {
        const dialogos = {
            miedo: [
                "A veces tengo miedo de que te vayas",
                "¿Y si no soy suficiente?",
                "Me asusta lo que podría pasar"
            ],
            duda: [
                "¿Realmente quieres estar aquí?",
                "No sé si esto está bien",
                "A veces no entiendo lo que sientes"
            ],
            amor: [
                "Recuerdo tu sonrisa ese día",
                "Aquí fue donde todo comenzó",
                "Tu mano en la mía me dio calma"
            ],
            esperanza: [
                "Podemos superar esto",
                "Cada día es una nueva oportunidad",
                "Juntos somos más fuertes"
            ]
        };
        
        const lista = dialogos[tipo] || [tipo];
        return Phaser.Utils.Array.GetRandom(lista);
    }
    
    escribirCaracter() {
        if (this.indiceCaracter < this.textoCompleto.length) {
            this.textoMostrado += this.textoCompleto.charAt(this.indiceCaracter);
            this.texto.setText(this.textoMostrado);
            this.indiceCaracter++;
            
            // Efecto de sonido
            if (this.indiceCaracter % 3 === 0) {
                this.scene.sound.play('sfx_texto', { volume: 0.1 });
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
        }
    }
    
    avanzarDialogo() {
        if (!this.dialogoActual) return;
        
        if (this.indiceCaracter < this.textoCompleto.length) {
            // Saltar al final
            this.timer.remove();
            this.textoMostrado = this.textoCompleto;
            this.texto.setText(this.textoCompleto);
            this.indicador.setVisible(true);
        } else {
            // Cerrar diálogo
            this.cerrarDialogo();
        }
    }
    
    cerrarDialogo() {
        this.fondo.setVisible(false);
        this.texto.setVisible(false);
        this.indicador.setVisible(false);
        this.dialogoActual = null;
        
        // Detener animación del indicador
        this.scene.tweens.killTweensOf(this.indicador);
    }
}