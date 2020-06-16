import Phaser from 'phaser';
const assetsMap = require('./asset_map.json');
const config = {
  type: Phaser.AUTO,
  width: 240,
  height: 400,
  scene: {
    preload,
    create,
    update,
  },
};

const game = new Phaser.Game(config);
const asset = {};
function preload() {
  for (const key in assetsMap) {
    if (assetsMap.hasOwnProperty(key)) {
      asset[key] = this.load.image(key, require(`./${assetsMap[key]}`));
    }
  }
}

function create() {
  const bg = this.add.image(0, 0, 'bg');
  bg.setOrigin(0, 0);
}

function update() {

}
