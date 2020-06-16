const fs = require('fs');;
const path = require('path');

const assetsList = fs.readdirSync(path.resolve(__dirname, 'src/assets/'));

const asssetsMap = {};
assetsList.forEach((item) => {
  const key = item.match(/.\w+/)[0];
  Object.assign(asssetsMap, {
    [key]: `assets/${item}`,
  });
});
fs.writeFileSync(path.resolve(__dirname, 'src/asset_map.json'), JSON.stringify(asssetsMap));