class Menu extends Phaser.Scene {
    constructor() {
        super("menuScene");
    }

    preload() {
        this.load.image('graphic', 'assets/menu.png');
        this.load.audio('menu', './assets/menu.wav');
    }

    create() {
        this.cameras.main.setBackgroundColor('#B6CFB6')
        // title screen graphic
        this.add.sprite(game.config.width / 2, game.config.height / 2, 'graphic');
        // menu text configuration
        let menuConfig = {
            fontFamily: 'Times New Roman, Times New Roman',
            fontWeight: '900',
            fontSize: '96px',
            color: '#ECEAE4',
            align: 'right',
            padding: {
                top: 5,
                bottom: 5,
            },
            fixedWidth: 0,
        }

        // show menu text
        this.add.text(game.config.width / 2, game.config.height / 2 - 200, 'COFFEE RUN', menuConfig).setOrigin(0.5);
        menuConfig.fontFamily = 'Times New Roman, Times New Roman';
        menuConfig.fontSize = '36px';
        menuConfig.color = '#FFFFFF';
        menuConfig.stroke = '#000'
        menuConfig.strokeThickness = 5;
        this.add.text(game.config.width / 2, game.config.height / 2 + 100, 'use arrow keys or WASD to move', menuConfig).setOrigin(0.5);
        menuConfig.fontSize = '48px';
        this.add.text(game.config.width / 2, game.config.height / 2 + 150, 'press W or UP to start', menuConfig).setOrigin(0.5);

        // define keys
        // create simple cursor input
        cursors = this.input.keyboard.createCursorKeys();
        //WASD KEYS
        keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        //loop menu music
        this.menuMusic = this.sound.add('menu');
        this.menuMusic.setLoop(true);
        this.menuMusic.play();
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(keyW) || Phaser.Input.Keyboard.JustDown(cursors.up)) {
            this.menuMusic.stop();
            this.scene.start("play");
        }
    }
}