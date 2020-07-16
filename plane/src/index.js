import Phaser from 'phaser';
const assetsMap = require('./asset_map.json');

const gameSenceCenter = {};

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
    this.add.text(0, 0, 'Score: 0', { color: '#ff0000', fontSize: '16px' });

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
    const BulletClass = new Phaser.Class({
      Extends: Phaser.GameObjects.Sprite,
      initialize: function Bullet(scene) {
        Phaser.GameObjects.Sprite.call(this, scene, 0, 0, 'mybullet');
        console.log('create')
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

    // 创建一个子弹组
    this.bullets = this.add.group({
      classType: BulletClass,
      runChildUpdate: true,
    });

    // 创建一个敌机
    this.enemySmall = this.add.sprite(30, 30, 'enemy1');
    this.physics.add.existing(this.enemySmall);
    // 设置默认时间为0
    this.beforeTime = 0;
    this.physics.add.overlap(this.bullets, this.enemySmall, function (bullet, enemy) {
      bullet.hide();
      enemy.destroy();
    }, null, this);
  },
  update() {
    const time = new Date().getTime();

    // 引入子弹
    if (time - this.beforeTime > 500) {
      const bullet = this.bullets.getFirstDead(true);
      if (bullet) {
        bullet.fire();
        bullet.setPosition(this.plane.x, this.plane.y - this.plane.height / 2);
        this.physics.add.existing(bullet);
        bullet.body.setVelocity(0, -300);
        this.beforeTime = time;
      }
    }
    this.bg.tilePositionY -= 1;
    console.log('this.bullets :>> ', this.bullets.children.size);
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