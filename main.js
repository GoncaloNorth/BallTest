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

let player, bot, pipes, scoreText, gameOver = false;
let botAlive = true;
let sharedSeed = 42; // ensures both sides have same pipe layout
let pipeSpacing = 150;
let pipeTimer = 0;

function preload() {
 this.load.image('ball', 'https://i.imgur.com/1W3nL4L.png');
}

function create() {
  pipes = this.physics.add.group();

  player = this.physics.add.sprite(100, 300, 'ball').setScale(0.05);
  bot = this.physics.add.sprite(100, 300, 'ball').setScale(0.05);
  bot.x += 400; // move bot to right screen

  this.input.on('pointerdown', () => {
    if (!gameOver) player.setVelocityY(-300);
  });

  this.physics.add.collider(player, pipes, () => endGame(this));
  this.physics.add.collider(bot, pipes, () => { botAlive = false; });

  scoreText = this.add.text(10, 10, 'Score: 0', { fontSize: '16px', fill: '#000' });

  Phaser.Math.RND.seed = sharedSeed; // deterministic pipes
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

  // Check if off-screen
  if (player.y > 600 || player.y < 0) endGame(this);
  if (bot.y > 600 || bot.y < 0) botAlive = false;

  scoreText.setText('Score: ' + Math.floor(time / 1000));
}

function addPipeRow(scene) {
  const gap = Phaser.Math.Between(120, 400);
  for (let y = 0; y < 600; y += 50) {
    if (y < gap - 80 || y > gap + 80) {
      const pipeTop = scene.physics.add.staticImage(400, y, null).setSize(20, 50).setVisible(false);
      const pipeBot = scene.physics.add.staticImage(800, y, null).setSize(20, 50).setVisible(false);

      pipes.add(pipeTop);
      pipes.add(pipeBot);

      pipeTop.body.velocity.x = -200;
      pipeBot.body.velocity.x = -200;
    }
  }
}

function endGame(scene) {
  gameOver = true;
  scene.add.text(100, 250, 'Game Over', { fontSize: '32px', fill: '#f00' });
}

const gameLeft = new Phaser.Game({ ...config, parent: 'game-left' });
const gameRight = new Phaser.Game({ ...config, parent: 'game-right' });
