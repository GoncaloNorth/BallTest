
const config = {
  type: Phaser.AUTO,
  width: 400,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 800 }, debug: false }
  },
  scene: { preload, create, update }
};

let sharedPipeGaps = [];
let gameOverLeft = false;
let gameOverRight = false;

function preload() {}

function create() {
  this.cameras.main.setBackgroundColor('#e0f7fa');

  this.pipes = this.physics.add.group();
  this.score = 0;
  this.passedPipes = [];

  this.isBot = this.game.config.parent === 'game-right';
  this.isPlayer = this.game.config.parent === 'game-left';

  const xPos = this.isBot ? 500 : 100;
  this.player = this.add.circle(xPos, 300, 20, 0xff0000);
  this.physics.add.existing(this.player);
  this.player.body.setCircle(20);
  this.player.body.setCollideWorldBounds(true);

  if (this.isPlayer) {
    this.input.on('pointerdown', () => flap(this));
    this.input.keyboard?.on('keydown-SPACE', () => flap(this));
  }

  this.physics.add.collider(this.player, this.pipes, () => endGame(this));

  this.scoreText = this.add.text(10, 10, 'Score: 0', { fontSize: '16px', fill: '#000' });

  this.pipeTimer = 0;
  Phaser.Math.RND.seed = 42;

  const GAP_HEIGHT = 150;
  if (sharedPipeGaps.length === 0) {
    for (let t = 1500; t < 30000; t += 1500) {
      const gapY = Phaser.Math.Between(100, 400);
      sharedPipeGaps.push(gapY);
    }
  }

  this.pipeIndex = 0;
}

function update(time, delta) {
  const isGameOver = this.isPlayer ? gameOverLeft : gameOverRight;
  if (isGameOver) return;

  this.pipeTimer += delta;
  if (this.pipeTimer > 1500 && this.pipeIndex < sharedPipeGaps.length) {
    const gapY = sharedPipeGaps[this.pipeIndex++];
    addPipePair(this, gapY);
    this.pipeTimer = 0;
  }

  if (this.isBot && Phaser.Math.Between(0, 100) < 2) {
    flap(this);
  }

  if (this.player.y > 600 || this.player.y < 0) endGame(this);

  // Score increases when pipe passes
  this.pipes.getChildren().forEach(pipe => {
    if (!pipe.scored && pipe.x + pipe.width < this.player.x) {
      pipe.scored = true;
      if (this.isPlayer) {
        this.score++;
        this.scoreText.setText('Score: ' + this.score);
      }
    }
  });
}

function flap(scene) {
  const isGameOver = scene.isPlayer ? gameOverLeft : gameOverRight;
  if (isGameOver) return;
  scene.player.body.setVelocityY(-300);
}

function addPipePair(scene, gapY) {
  const GAP_HEIGHT = 150;
  const topHeight = gapY;
  const bottomY = gapY + GAP_HEIGHT;

  const xStart = 400;

  // Top pipe
  const topPipe = scene.add.rectangle(xStart, topHeight / 2, 40, topHeight, 0x00bcd4);
  scene.physics.add.existing(topPipe);
  topPipe.body.setVelocityX(-200);
  topPipe.body.setImmovable(true);
  topPipe.scored = false;
  scene.pipes.add(topPipe);

  // Bottom pipe
  const bottomHeight = 600 - bottomY;
  const bottomPipe = scene.add.rectangle(xStart, bottomY + bottomHeight / 2, 40, bottomHeight, 0x00bcd4);
  scene.physics.add.existing(bottomPipe);
  bottomPipe.body.setVelocityX(-200);
  bottomPipe.body.setImmovable(true);
  bottomPipe.scored = false;
  scene.pipes.add(bottomPipe);
}

function endGame(scene) {
  if (scene.isPlayer) {
    gameOverLeft = true;
  } else {
    gameOverRight = true;
  }
  scene.physics.pause();
  scene.player.fillColor = 0x999999;
  if (scene.isPlayer) {
    scene.add.text(100, 250, 'Game Over', { fontSize: '32px', fill: '#f00' });
  }
}

const gameLeft = new Phaser.Game({ ...config, parent: 'game-left' });
const gameRight = new Phaser.Game({ ...config, parent: 'game-right' });
