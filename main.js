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
let gameOver = false;

function preload() {}

function create() {
  this.cameras.main.setBackgroundColor('#e0f7fa');

  this.pipes = this.physics.add.group();
  this.score = 0;
  this.passedPipes = [];

  this.player = this.add.circle(100, 300, 20, 0xff0000);
  this.physics.add.existing(this.player);
  this.player.body.setCircle(20);
  this.player.body.setCollideWorldBounds(true);

  this.isBot = this.game.config.parent === 'game-right';
  if (this.isBot) {
    this.player.x += 400;
  }

  this.input.on('pointerdown', () => flap(this));
  this.input.keyboard?.on('keydown-SPACE', () => flap(this));

  this.physics.add.collider(this.player, this.pipes, () => endGame(this));

  this.scoreText = this.add.text(10, 10, 'Score: 0', { fontSize: '16px', fill: '#000' });

  this.pipeTimer = 0;
  Phaser.Math.RND.seed = 42;
  const GAP_HEIGHT = 150;

  // Pre-generate vertical positions for pipe gaps
  for (let t = 1500; t < 30000; t += 1500) {
    const gapY = Phaser.Math.Between(100, 400);
    sharedPipeGaps.push(gapY);
  }

  this.pipeIndex = 0;
}

function update(time, delta) {
  if (gameOver) return;

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

  // Score tracking: count when player passes the center of a pipe gap
  this.pipes.getChildren().forEach(pipe => {
    if (!pipe.scored && pipe.x + pipe.width < this.player.x) {
      pipe.scored = true;
      if (!this.isBot) {
        this.score++;
        this.scoreText.setText('Score: ' + this.score);
      }
    }
  });
}

function flap(scene) {
  if (gameOver) return;
  scene.player.body.setVelocityY(-300);
}

function addPipePair(scene, gapY) {
  const GAP_HEIGHT = 150;
  const topPipeHeight = gapY;
  const bottomPipeY = gapY + GAP_HEIGHT;

  // Top pipe
  const topPipe = scene.add.rectangle(scene.isBot ? 800 : 400, topPipeHeight / 2, 40, topPipeHeight, 0x00bcd4);
  scene.physics.add.existing(topPipe);
  topPipe.body.setVelocityX(-200);
  topPipe.body.setImmovable(true);
  topPipe.scored = false;
  scene.pipes.add(topPipe);

  // Bottom pipe
  const bottomPipeHeight = 600 - bottomPipeY;
  const bottomPipe = scene.add.rectangle(scene.isBot ? 800 : 400, bottomPipeY + bottomPipeHeight / 2, 40, bottomPipeHeight, 0x00bcd4);
  scene.physics.add.existing(bottomPipe);
  bottomPipe.body.setVelocityX(-200);
  bottomPipe.body.setImmovable(true);
  bottomPipe.scored = false;
  scene.pipes.add(bottomPipe);
}

function endGame(scene) {
  gameOver = true;
  scene.physics.pause();
  scene.player.fillColor = 0x999999;
  if (!scene.isBot) {
    scene.add.text(100, 250, 'Game Over', { fontSize: '32px', fill: '#f00' });
  }
}

const gameLeft = new Phaser.Game({ ...config, parent: 'game-left' });
const gameRight = new Phaser.Game({ ...config, parent: 'game-right' });



