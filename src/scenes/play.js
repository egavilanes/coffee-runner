let highScore = 0;
let tries = 0;
class Play extends Phaser.Scene {
    constructor() {
        super("play");
    }

    preload() {
        this.load.image('field', 'assets/cafe.png');
        this.load.image('gg', 'assets/spill-over.png');
        this.load.spritesheet('runner', 'assets/barista_run.png', {
            frameWidth: 49,
            frameHeight: 77,
        });
        this.load.image('defender', 'assets/manager.png');
        this.load.image('fans', 'assets/customers.png');
        this.load.image('trash', 'assets/chair.png');
        this.load.image('sky', 'assets/cafe-wall.png');

        this.load.audio('oof', 'assets/clap.mp3');
        this.load.audio('down', 'assets/night-piano.mp3');
        this.load.audio('theme A', 'assets/bebop-for-joey-127677.mp3');
    }

    create() {
        this.scrollingField = this.add.tileSprite(0, 0, 0, 0, 'field')
            .setOrigin(0, 0);
        this.sky = this.add.tileSprite(0,0,0,0, 'sky').setOrigin(0,0);
        this.PLAYER_VELOCITY = game.config.height / 2
        this.scrollSpeed = game.config.height / 2;

        // create simple cursor input
        cursors = this.input.keyboard.createCursorKeys();
        //WASD KEYS
        keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

        // physics sprite
        this.player = this.physics.add.sprite(game.config.width / 2, game.config.height - 100, 'runner')
            .setOrigin(0.5, 1)
            .setScale(game.config.width / 800, game.config.height / 800)
            .setDepth(0.5);
        // scale sprite such that it is always the same relative to screen size
        this.player.displayWidth = game.config.width / 10;
        this.player.displayHeight = game.config.height / 5;
        this.player.setCollideWorldBounds(true);

        // running animation
        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNumbers('runner', {start: 0, end: 1, first: 0}),
            frameRate: 10,
            repeat: -1
        });

        this.centerDistance = 0;
        this.obstacles = this.physics.add.group({
            runChildUpdate: true
        });
        this.physics.add.overlap(this.player, this.obstacles, this.setGameOver, null, this);

        //set game over initially to false
        this.gameOver = false;

        this.p1Score = 0;

        // display score
        let scoreConfig = {
            fontFamily: 'italic',
            fontSize: '56px',
            //backgroundColor: '#013220',
            strokeThickness: 4,
            stroke: '013220',
            color: '#FFFFFF',
            align: 'right',
            padding: {
                top: 5,
                bottom: 5,
            },
        }
        this.p1Score = 0;
        this.scoreLeft = this.add.text(0, 0, 'SCORE: ' + this.p1Score, scoreConfig);
        this.scoreLeft.setDepth(1)


        // scale difficulty through multiple waves based on distance traveled
        this.obstacleSpeed = 300;    // defenders start at 300
        this.obstacleSpeedMultiplier = 1;
        this.nextWaveThreshold = 50; // starting at 50 yards
        this.obstacleSpawnDelay = 4000; // initial time between obstacles appearing in ms
        this.obstacleSpawnTimer = this.obstacleSpawnDelay;

        //startup sounds
        this.bgm = this.sound.add('theme A');
        this.bgm.setLoop(true);

        this.player.anims.play('run');
        this.time.delayedCall(1000, () => {
            this.bgm.play();})
    }



    update(time, delta) {

        if (!this.gameOver) {
            this.player.setVelocity(0);

            // starting speed is 10yards/s, or 1 screen length
            this.scrollingField.tilePositionY -= this.scrollSpeed * (delta / 1000); // normalize scroll speed to pixels per second
            this.centerDistance += (this.scrollSpeed * (delta / 1000) / (game.config.height / 10)); // total distance the screen has scrolled so far, in yards
            //console.log(this.centerDistance);

            // increasing challenge
            if (this.centerDistance > this.nextWaveThreshold) {
                // obstacles appear a little more frequently and move a little faster
                this.nextWaveThreshold += 50;
                this.obstacleSpawnDelay *= 0.975;
                // increase speed up to 600 (10y/s), at first, then start increasing obstacle spawning rate
                if(this.scrollSpeed < 600){
                    this.obstacleSpeedMultiplier += 0.05
                    this.scrollSpeed += 50
                }
            }

            //obstacle spawning
            this.obstacleSpawnTimer -= delta;
            if (this.obstacleSpawnTimer <= 0) {
                this.obstacleSpawnTimer = this.obstacleSpawnDelay;
                switch(randomInt(3)){
                    case 0:
                        this.spawnDefender(this.obstacleSpeedMultiplier);
                        break;
                    case 1:
                        this.spawnFans(this.obstacleSpeedMultiplier);
                        break;
                    case 2:
                        this.spawnTrash();
                        break;
                    default:
                        break;
                }
            }

            //score display
            this.p1Score = Math.floor(this.centerDistance);
            this.scoreLeft.text = 'SCORE: ' + this.p1Score + " FEET";

            // polling controls
            let playerMoveX = 0;
            let playerMoveY = 0;
            if (cursors.left.isDown || keyA.isDown) {
                playerMoveX -= 1;
            }
            if (cursors.right.isDown || keyD.isDown) {
                playerMoveX += 1;
            }
            if (cursors.up.isDown || keyW.isDown) {
                playerMoveY -= 1;
            } 
            if (cursors.down.isDown || keyS.isDown) {
                playerMoveY += 1;
            }

            this.player.setVelocityX(playerMoveX * this.PLAYER_VELOCITY);
            this.player.setVelocityY(playerMoveY * this.PLAYER_VELOCITY)
        }

        if (this.gameOver && Phaser.Input.Keyboard.JustDown(keyR)) {
            this.scene.restart();
        }
    }


    // put a defender on the screen with given horizontal speed coming from a random side of the screen
    spawnDefender(multiplier) {
        let [startingX, direction] = randomSide();
        let startingY = randomRange(- (game.config.height / 5), game.config.height / 5);
        //second arg must be true to add object to display list i guess
        this.obstacles.add(new Defender(this, startingX, startingY, 'defender', 0, this.obstacleSpeed * direction, multiplier), true); 
    }

    spawnFans(multiplier) {
        let [startingX, direction] = randomSide();
        let startingY = randomRange((game.config.height / 5), game.config.height * (4 / 5));
        this.obstacles.add(new Fans(this, startingX, startingY, 'fans', 0, this.obstacleSpeed * direction, multiplier), true);
    }

    spawnTrash() {
        // trash will spawn at the top near the player's x position
        let startingX = randomRange(this.player.x - (game.config.width / 5), this.player.x + (game.config.width / 5));
        // limit x position to within game bounds
        startingX = Math.min(Math.max(startingX, game.config.width * (1 / 15)), game.config.width - game.config.width * (1 / 15));
        this.obstacles.add(new Trash(this, startingX, 75, 'trash', 0), true);
    }

    setGameOver() {
        this.bgm.stop();
        this.sound.play('oof');
        this.player.stop();
        this.gameOver = true;
        this.player.disableBody();
        //console.log('game over');
        tries += 1;
        let highScoreColor = 'Black';
            
            if (this.p1Score > highScore) {
                highScore = this.p1Score;
                highScoreColor = 'White';
            }

        // delay this part just a bit to make it look like the sprites actually collide
        this.time.delayedCall(50, () => {
            this.physics.world.disable(this.obstacles);   
        })
        
        
        // show game over stuff after a couple seconds
        this.time.delayedCall(2000, () => {
            //game over display
            let gameoverConfig = {
                fontFamily: 'italic',
                fontSize: '100px',
                color: '#FFFFFF',
                align: 'right',
                padding: {
                    top: 5,
                    bottom: 5,
                },
            }

            this.gameoverScreen = this.add.tileSprite(0, 0, game.config.width, game.config.height, 'gg')
                .setOrigin(0, 0)
                .setDepth(1);
            this.add.text(game.config.width / 2, game.config.height / 6, 'GAME OVER', gameoverConfig)
                .setOrigin(0.5)
                .setDepth(1);
            gameoverConfig.fontSize = '70px';
            this.add.text(game.config.width / 2, game.config.height / 2 - 75, 'SCORE: ' + this.p1Score + ' FEET', gameoverConfig)
                .setOrigin(0.5)
                .setDepth(1);

            gameoverConfig.fontSize = '40px';
            gameoverConfig.color = highScoreColor;
            this.add.text(game.config.width / 2, game.config.height / 2, 'HIGH SCORE: ' + highScore + ' FEET', gameoverConfig)
                .setOrigin(0.5)
                .setDepth(1);
            
            gameoverConfig.color = '#FFFFFF'
            this.add.text(game.config.width / 2, game.config.height / 2 + 100, 'TOTAL RUNS: ' + tries, gameoverConfig)   
                .setOrigin(0.5)
                .setDepth(1);
            gameoverConfig.fontSize = '45px';
            this.add.text(game.config.width / 2, game.config.height - 75, 'Press (R) to Restart', gameoverConfig)
                .setOrigin(0.5)
                .setDepth(1);

            this.sound.play('down');
        });
    }
}

// return the data needed to place and orient an obstacle on one side of the screen or the other
function randomSide() {
    if (Math.random() >= 0.5) {
        return [-10, 1];
    } else {
        return [game.config.width + 10, -1];
    }
}

// get a random value in the range (works for negatives)
function randomRange(min, max) {
    let range = max - min;
    let val = Math.random() * range
    return val + min;
}

function randomInt(max) {
    return Math.floor(Math.random() * max)
}