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

let player, bot, playerPipes, botPipes;
let scoreText, gameOver = false;
let botAlive = true;
let sharedSeed = 42;
let pipeSpacing = 150;
let pipeTimer = 0;

function preload() {
  this.load.image('ball', 'https://i.imgur.com/1W3nL4L.png');
}

function create() {
  this.cameras.main.setBackgroundColor('#e0f7fa');

  playerPipes = this.physics.add.group();
  botPipes = this.physics.add.group();

  player = this.physics.add.sprite(100, 300, 'ball').setDisplaySize(40, 40);
  bot = this.physics.add.sprite(100, 300, 'ball').setDisplaySize(40, 40);
  bot.x += 400;

  this.input.on('pointerdown', () => {
    if (!gameOver) player.setVelocityY(-300);
  });

  this.physics.add.collider(player, playerPipes, () => endGame(this));
  this.physics.add.collider(bot, botPipes, () => { botAlive = false; });

  scoreText = this.add.text(10, 10, 'Score: 0', { fontSize: '16px', fill: '#000' });

  Phaser.Math.RND.seed = sharedSeed;
}

function update(time, delta) {
  if (gameOver) return;

  pipeTimer += delta;
  if (pipeTimer > 1500) {
    addPipeRow(this);
    pipeTimer = 0;
  }

  if (botAlive && Phaser.Math.Between(0, 100) < 2) {
    bot.setVelocityY(-300);
  }

  if (player.y > 600 || player.y < 0) endGame(this);
  if (bot.y > 600 || bot.y < 0) botAlive = false;

  scoreText.setText('Score: ' + Math.floor(time / 1000));
}

function addPipeRow(scene) {
  const gap = Phaser.Math.Between(120, 400);

  for (let y = 0; y < 600; y += 50) {
    if (y < gap - 80 || y > gap + 80) {
      const pipeColor = 0x00bcd4;

      // Left screen (player)
      const pipeLeft = scene.add.rectangle(400, y + 25, 40, 50, pipeColor);
      scene.physics.add.existing(pipeLeft);
      pipeLeft.body.setVelocityX(-200);
      pipeLeft.body.setImmovable(true);
      playerPipes.add(pipeLeft);

      // Right screen (bot)
      const pipeRight = scene.add.rectangle(800, y + 25, 40, 50, pipeColor);
      scene.physics.add.existing(pipeRight);
      pipeRight.body.setVelocityX(-200);
      pipeRight.body.setImmovable(true);
      botPipes.add(pipeRight);
    }
  }
}

function endGame(scene) {
  gameOver = true;
  scene.physics.pause();
  player.setTint(0xff0000);
  scene.add.text(100, 250, 'Game Over', { fontSize: '32px', fill: '#f00' });
}

const gameLeft = new Phaser.Game({ ...config, parent: 'game-left' });
const gameRight = new Phaser.Game({ ...config, parent: 'game-right' });


