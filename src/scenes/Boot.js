export class Boot extends Phaser.Scene {
    constructor() {
        super({ key: 'Boot' });
    }

    preload() {
        console.log('Boot scene iniciada');
    }

    async create() {  // ← Añade 'async' aquí
        console.log('Boot completado, iniciando Preload');
        
        // Inicializar GuardadoManager
        if (!this.registry.get('guardadoManager')) {
            const GuardadoManager = await import('../managers/GuardadoManager.js');
            this.registry.set('guardadoManager', new GuardadoManager.default());
        }
        
        this.scene.start('Preload');
    }
}