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
    this.scene.start('play');
  },
  update() {}
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
      frames: this.anims.generateFrameNumbers('myplane', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });

    // 飞机调用飞行动画
    plane.anims.play('fly');

    // 添加开始按钮
    const startButton =  this.add.sprite(this.game.config.width / 2, 200, 'startbutton', 1).setInteractive();
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
  update() {},
}

gameSenceCenter.play = {
  key: 'play',
  create() {

    // 添加背景
    this.bg = this.add.tileSprite(0, 0, this.game.config.width, this.game.config.height, 'bg').setOrigin(0);
    this.bg.setScrollFactor(1);
    // 引入飞机精灵
    const plane = this.add.sprite(this.game.config.width / 2, 100, 'myplane');

    // 飞机调用飞行动画
    plane.anims.play('fly');
  },
  update() {
    this.bg.tilePositionY -= 1;
  },
}

const config = {
  type: Phaser.AUTO,
  width: 240,
  height: 400,
  scene: [gameSenceCenter.boot, gameSenceCenter.start, gameSenceCenter.play],
};
const game = new Phaser.Game(config);