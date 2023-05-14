/* Name: Emily Gavilanes
   Game Title: Coffee Run
   Time spent: 25 hrs
   Creative/Technical Tilt:
    I tried to add some randomness when it came to occurring obastacles
    for different parts of the cafe floor and did this with the help of helper functions.
    I tried to implement different types of jazz music to fit the theme of a cafe 
    as well to support the ambience of the game.
*/ 
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


