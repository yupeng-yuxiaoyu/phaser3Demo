import Phaser from 'phaser';
const assetsMap = require('./asset_map.json');

const gameSenceCenter = {};

const BulletClass = new Phaser.Class({
  Extends: Phaser.GameObjects.Sprite,
  initialize: function Bullet(scene) {
    Phaser.GameObjects.Sprite.call(this, scene, 0, 0, 'mybullet');
  },
  update: function () {
    if (this.y < -50) {
      this.hide();
    }
  },
  fire: function () {
    this.setActive(true);
    this.setVisible(true);
  },
  hide: function() {
    this.setActive(false);
    this.setVisible(false);
  }
});
function EnemyBulletClass(gameHeight) {
  return new Phaser.Class({
    Extends: Phaser.GameObjects.Sprite,
    initialize: function Bullet(scene) {
      Phaser.GameObjects.Sprite.call(this, scene, 0, 0, 'bullet');
    },
    update: function () {
      if (this.y > gameHeight) {
        this.hide();
      }
    },
    fire: function () {
      this.setActive(true);
      this.setVisible(true);
    },
    hide: function() {
      this.setActive(false);
      this.setVisible(false);
    }
  });
}

function EnemyFactory(key , gameHeight, enemyBullets) {
  return new Phaser.Class({
    Extends: Phaser.GameObjects.Sprite,
    initialize: function Bullet(scene) {
      Phaser.GameObjects.Sprite.call(this, scene, 0, 0, key);
      this.bulletSpeed = 1000 * (4 - key.replace('enemy', ''));
      this.life = key.replace('enemy', '');
      this.enemyButtelBeforeTime = 0;
      this.index = key.replace('enemy', '');;
    },
    update: function () {
      const time = new Date().getTime();
      if (this.y > gameHeight) {
        this.hide();
      }
      if (time - this.enemyButtelBeforeTime >= this.bulletSpeed) {
        const bullet = enemyBullets.getFirstDead(true);
        if (bullet) {
          bullet.fire();
          bullet.setPosition(this.x, this.y + this.height / 2);
          this.scene.physics.add.existing(bullet);
          bullet.body.setVelocity(0, 100 * (4 - key.replace('enemy', '')));
          this.enemyButtelBeforeTime = time;
        }
      }
    },
    show: function () {
      this.setActive(true);
      this.setVisible(true);
    },
    hide: function() {
      this.setActive(false);
      this.setVisible(false);
    }
  });
}

gameSenceCenter.boot = {
  key: 'boot',
  preload() {
    for (const key in assetsMap) {
      if (assetsMap.hasOwnProperty(key)) {
        if (key === 'myplane') {
          this.load.spritesheet(key, require(`./${assetsMap[key]}`), {
            frameWidth: 40,
            frameHeight: 40,
          });
          continue;
        }
        if (key === 'startbutton') {
          this.load.spritesheet(key, require(`./${assetsMap[key]}`), {
            frameWidth: 100,
            frameHeight: 40,
          });
          continue;
        }
        if (key === 'explode1') {
          this.load.spritesheet(key, require(`./${assetsMap[key]}`), {
            frameWidth: 20,
            frameHeight: 20,
          });
          continue;
        }
        if (key === 'explode2') {
          this.load.spritesheet(key, require(`./${assetsMap[key]}`), {
            frameWidth: 30,
            frameHeight: 30,
          });
          continue;
        }
        if (key === 'explode3') {
          this.load.spritesheet(key, require(`./${assetsMap[key]}`), {
            frameWidth: 50,
            frameHeight: 50,
          });
          continue;
        }
        if (key === 'myexplode') {
          this.load.spritesheet(key, require(`./${assetsMap[key]}`), {
            frameWidth: 40,
            frameHeight: 40,
          });
          continue;
        }
        assetsMap[key] = this.load.image(key, require(`./${assetsMap[key]}`));
      }
    }
    const percentText = this.make.text({
      x: this.game.config.width / 2,
      y: this.game.config.height / 2 - 5,
      text: '0%',
      style: {
        font: '18px monospace',
        fill: '#ffffff'
      }
    })
      .setOrigin(0.5, 0.5);
    if (!this.game.device.os.desktop) {
      this.scale.scaleMode = Phaser.Scale.FIT;
      this.scale.refresh();
    }
    this.load.on('progress', function (value) {
      percentText.setText(parseInt(value * 100) + '%');
    });

    this.load.on('complete', function () {
      percentText.destroy();
    });
  },
  create() {
    this.scene.start('start');
  },
  update() { }
}

gameSenceCenter.start = {
  key: 'start',
  create() {

    // 添加背景
    const bg = this.add.image(0, 0, 'bg').setOrigin(0);
    this.add.image(this.game.config.width / 2, this.game.config.height - 16, 'copyright');

    // 引入飞机精灵
    const plane = this.add.sprite(this.game.config.width / 2, 100, 'myplane');

    // 创建飞行帧动画
    this.anims.create({
      key: 'fly',
      frames: this.anims.generateFrameNumbers('myplane', {
        start: 0,
        end: 3
      }),
      frameRate: 10,
      repeat: -1
    });

    // 飞机调用飞行动画
    plane.anims.play('fly');

    // 添加开始按钮
    const startButton = this.add.sprite(this.game.config.width / 2, 200, 'startbutton', 1).setInteractive();
    // 开始按钮事件
    startButton.on('pointerdown', () => {
      startButton.setFrame(0);
    })
    startButton.on('pointerup', () => {
      startButton.setFrame(1);
      console.log('start game');
      this.scene.start('play');
    })
  },
  update() { },
}

gameSenceCenter.play = {
  key: 'play',
  create() {

    // 添加背景
    this.bg = this.add.tileSprite(0, 0, this.game.config.width, this.game.config.height, 'bg').setOrigin(0);
    this.bg.setScrollFactor(1);

    // 添加文本
    this.scoreText = this.add.text(0, 0, 'Score: 0', { color: '#ff0000', fontSize: '16px' });
    this.score = 0;

    // 引入飞机精灵
    this.plane = this.add.sprite(this.game.config.width / 2, 100, 'myplane').setInteractive({ draggable: true });

    // 创建飞行帧动画
    this.anims.create({
      key: 'fly',
      frames: this.anims.generateFrameNumbers('myplane', {
        start: 0,
        end: 3
      }),
      frameRate: 10,
      repeat: -1
    });

    // 创建飞行爆炸帧动画
    this.anims.create({
      key: 'planeBoom',
      frames: this.anims.generateFrameNumbers('myexplode', {
        start: 0,
        end: 3
      }),
      frameRate: 2,
      repeat: 1
    });
    
    // 飞机调用飞行动画
    this.plane.anims.play('fly');
    this.tweens.add({
      targets: this.plane,
      y: this.game.config.height - this.plane.height,
      duration: 1000,
      onComplete: () => {
        this.plane.on('drag', function (pointer, dragX, dragY) {
          this.x = dragX;
          this.y = dragY;
        });
        this.plane.on('dragend', function (pointer) {
          this.clearTint();
        });
        this.physics.add.existing(this.plane);
        this.plane.body.setCollideWorldBounds(true);
      },
    });

    // 创建一个子弹组
    this.bullets = this.add.group({
      classType: BulletClass,
      runChildUpdate: true,
    });
    
    // 创建敌机子弹组
    const EnemyBullteClass = EnemyBulletClass(this.game.config.height);
    this.enemyBullets = this.add.group({
      classType: EnemyBullteClass,
      runChildUpdate: true,
    });

    // 创建敌机组
    ['enemy1', 'enemy2', 'enemy3'].forEach((item) => {
      const EnemyClass = EnemyFactory(item, this.game.config.height, this.enemyBullets);
      this[item] = this.add.group({
        classType: EnemyClass,
        runChildUpdate: true,
      });

      const key = item.replace('enemy', '');
      // 创建敌机爆炸帧动画
      this.anims.create({
        key: `enemyBoom${key}`,
        frames: this.anims.generateFrameNumbers(`explode${key}`, {
          start: 0,
          end: 2
        }),
        frameRate: 5,
        repeat: 0
      });
    });

    // 设置敌机生成默认时间为0
    this.enemyBeforeTime = 0;
    // 设置我的子弹默认时间为0
    this.myBulletBeforeTime = 0;
    ['enemy1', 'enemy2', 'enemy3'].forEach((item) => {
      this.physics.add.overlap(this.bullets, this[item], function (bullet, enemy) {
        bullet.destroy();
        enemy.life = enemy.life - 1;
        if (enemy.life <= 0) {
          enemy.destroy();
          console.log('enemy :>> ', enemy);
          const key = item.replace('enemy', '');
          this.score = +key + this.score;
          this.scoreText.setText(`Score: ${this.score}`, this.score);
          const enemyFrame = this.add.sprite(enemy.x, enemy.y, `explode${key}`);
          enemyFrame.anims.play(`enemyBoom${key}`);
          enemyFrame.once('animationcomplete', function() {
            enemyFrame.destroy();
          })
        }
      }, null, this);
    });
    this.physics.add.overlap(this.bullets, this.enemyBullets, function (bullet, enemyBullet) {
      bullet.destroy();
      enemyBullet.destroy();
    }, null, this);
    this.physics.add.overlap(this.enemyBullets, this.plane, function (enemyBullet, plane) {
      plane.destroy();
      this.gameOver = true;
      const myPlaneFrame = this.add.sprite(plane.x, plane.y, 'myexplode');
      myPlaneFrame.anims.play('planeBoom');
      myPlaneFrame.once('animationcomplete', function() {
        myPlaneFrame.destroy();
      })
    }, null, this);
  },
  update() {
    const time = new Date().getTime();

    // 引入我的子弹
    if (time - this.myBulletBeforeTime > 200 && !this.gameOver) {
      const bullet = this.bullets && this.bullets.getFirstDead(true);
      if (bullet) {
        bullet.fire();
        bullet.setPosition(this.plane.x, this.plane.y - this.plane.height / 2);
        this.physics.add.existing(bullet);
        bullet.body.setVelocity(0, -300);
        this.myBulletBeforeTime = time;
      }
    }

    // 引入敌机
    if (time - this.enemyBeforeTime > 800) {
      const enemyIndex = Phaser.Math.Between(1, 3);
      const enemy = this[`enemy${enemyIndex}`].getFirstDead(true);
      if (enemy) {
        enemy.show();
        enemy.setOrigin(0.5, 0.5);
        enemy.setPosition(Phaser.Math.Between(0 + enemy.width, this.game.config.width - enemy.width), 0);
        this.physics.add.existing(enemy);
        enemy.body.setVelocity(0, 50 * (4 - enemyIndex));
        this.enemyBeforeTime = time;
      }
    }
    this.bg.tilePositionY -= 1;
  },
}

const config = {
  type: Phaser.AUTO,
  width: 240,
  height: 400,
  scene: [gameSenceCenter.boot, gameSenceCenter.start, gameSenceCenter.play],
  physics: {
    default: 'arcade',
  }
};
const game = new Phaser.Game(config);