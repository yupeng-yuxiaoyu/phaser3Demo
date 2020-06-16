import Phaser from 'phaser';
const assetsMap = require('./asset_map.json');

const gameSenceCenter = {};

gameSenceCenter.boot = {
  key: 'boot',
  preload() {
    for (const key in assetsMap) {
      if (assetsMap.hasOwnProperty(key)) {
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
    if (!this.game.device.desktop) {
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
  update() {}
}

gameSenceCenter.start = {
  key: 'start',
  create() {
    this.add.image(0, 0, 'bg').setOrigin(0);
  },
  update() {},
}

const config = {
  type: Phaser.AUTO,
  width: 240,
  height: 400,
  scene: [gameSenceCenter.boot, gameSenceCenter.start],
};
const game = new Phaser.Game(config);