const fs = require("fs");
const path = require("path");
const xlsx = require("node-xlsx").default;
let cwd = process.env.LOTTERY_DATA_DIR || path.join(__dirname, "cache");

if (!fs.existsSync(cwd)) {
  fs.mkdirSync(cwd, { recursive: true });
}

/**
 * 读取缓存的数据内容
 */
function loadTempData() {
  const read = (name, fallback) => {
    const file = path.join(cwd, name);
    return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : fallback;
  };
  return [read('temp.json', {}), read('error.json', [])];
}

function atomicJSON(name, value) {
  const file = path.join(cwd, name);
  fs.writeFileSync(file + '.tmp', JSON.stringify(value, null, 2));
  fs.renameSync(file + '.tmp', file);
}

/**
 * 读取XML文件数据
 */
function loadXML(xmlPath) {
  let userData = xlsx.parse(xmlPath);
  let outData = [];
  userData.forEach(item => {
    outData = item.data;
    outData.shift();
    return false;
  });
  outData = outData.filter(item => item.length > 0);
  return outData;
}

/**
 * 写入excel
 * @param {Array} data
 * @param {string} name
 */
function writeXML(data, name) {
  let buffer = xlsx.build([
    {
      name: "抽奖结果",
      data: data
    }
  ]);

  return new Promise((resolve, reject) => {
    fs.writeFile(path.join(cwd, path.basename(name)), buffer, err => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

/**
 * 写入文件
 * @param {*} data
 */
function saveDataFile(data) {
  atomicJSON('temp.json', data);
  return Promise.resolve();
}

function saveErrorDataFile(data) {
  atomicJSON('error.json', data);
  return Promise.resolve();
}

/**
 * 洗牌算法
 * @param {*} arr
 */
function shuffle(arr) {
  let i = arr.length;
  while (i) {
    let j = Math.floor(Math.random() * i--);
    let temp = arr[j];
    arr[j] = arr[i];
    arr[i] = temp;
  }
}

module.exports = {
  loadTempData,
  loadXML,
  shuffle,
  writeXML,
  saveDataFile,
  saveErrorDataFile,
  atomicJSON,
  dataDir: cwd
};
