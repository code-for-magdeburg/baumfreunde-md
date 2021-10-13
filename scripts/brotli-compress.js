const fs = require('fs');
const brotli = require('brotli');


const brotliSettings = {
  extension: 'br',
  skipLarger: true,
  mode: 1,
  quality: 10,
  lgwin: 12,
  threshold: 10240
};

const DATA_PATH = './dist/baumfreunde-md-web/assets/data/';


fs.readdirSync(DATA_PATH).forEach(file => {

  if (file.endsWith('.csv') || file.endsWith('.txt')) {
    const result = brotli.compress(fs.readFileSync(DATA_PATH + file), brotliSettings);
    fs.writeFileSync(`${DATA_PATH}${file}.br`, result);
  }

});
