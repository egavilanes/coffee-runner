let cursors;
let keyUP, keyJ, keySPACE, keyW, keyA, keyS, keyD, keyR;

const config = {
    type: Phaser.CANVAS,
    width: 600,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
        }
    },
    scene: [Menu, Play]
}

let game = new Phaser.Game(config);


