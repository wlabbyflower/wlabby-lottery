const express = require("express");
const opn = require("opn");
const path = require("path");
const cfg = require("./config");
const { getSettings, updateSettings } = require("./settings");

const {
  loadXML,
  loadTempData,
  writeXML,
  saveDataFile,
  shuffle,
  saveErrorDataFile,
  dataDir
} = require("./help");

let app = express(),
  router = express.Router(),
  cwd = process.cwd(),
  dataBath = __dirname,
  port = 8090,
  curData = {},
  luckyData = {},
  errorData = [],
  defaultType = cfg.prizes[0]["type"],
  defaultPage = `default data`;

app.disable('x-powered-by');
if (process.env.LOTTERY_TRUST_PROXY === '1') app.set('trust proxy', 1);
app.use(express.json({ limit: '8mb' }));
app.use((req, res, next) => {
  const origin = req.get('origin');
  if (req.method === 'POST' && origin && origin !== `${req.protocol}://${req.get('host')}` && origin !== process.env.LOTTERY_PUBLIC_ORIGIN) return res.status(403).json({ error: '请从本站操作' });
  if (req.method === 'POST') res.set('Cache-Control', 'no-store');
  next();
});
app.get('/health', (req,res) => res.json({ status: 'ok' }));
app.get('/results.xlsx', (req,res) => res.download(path.join(dataDir, '抽奖结果.xlsx'), '抽奖结果.xlsx'));
app.use(express.static(path.join(__dirname, '../product/dist')));

app.post("*", (req, res, next) => {
  log(`请求内容：${JSON.stringify(req.path, 2)}`);
  next();
});

// 获取之前设置的数据
router.post("/getTempData", (req, res, next) => {
  getLeftUsers();
  res.json({
    cfgData: { ...cfg, appearance: getSettings() },
    leftUsers: curData.leftUsers,
    luckyData: luckyData
  });
});

// 获取所有用户
router.post("/reset", (req, res, next) => {
  luckyData = {};
  errorData = [];
  log(`重置数据成功`);
  saveErrorDataFile(errorData);
  return saveDataFile(luckyData).then(data => {
    res.json({
      type: "success"
    });
  });
});

// 获取所有用户
router.post("/getUsers", (req, res, next) => {
  res.json(curData.users);
  log(`成功返回抽奖用户数据`);
});

// 获取奖品信息
router.post("/getPrizes", (req, res, next) => {
  res.json(cfg.prizes);
  log(`成功返回奖品数据`);
});

// 保存抽奖数据
router.post("/saveData", (req, res, next) => {
  let data = req.body;
  setLucky(data.type, data.data)
    .then(t => {
      res.json({
        type: "设置成功！"
      });
      log(`保存奖品数据成功`);
    })
    .catch(data => {
      res.json({
        type: "设置失败！"
      });
      log(`保存奖品数据失败`);
    });
});

// 保存抽奖数据
router.post("/errorData", (req, res, next) => {
  let data = req.body;
  setErrorData(data.data)
    .then(t => {
      res.json({
        type: "设置成功！"
      });
      log(`保存没来人员数据成功`);
    })
    .catch(data => {
      res.json({
        type: "设置失败！"
      });
      log(`保存没来人员数据失败`);
    });
});

// 保存数据到excel中去
router.post("/export", (req, res, next) => {
  let type = [1, 2, 3, 4, 5, defaultType],
    outData = [["工号", "姓名", "部门"]];
  cfg.prizes.forEach(item => {
    outData.push([item.text]);
    outData = outData.concat(luckyData[item.type] || []);
  });

  writeXML(outData, "/抽奖结果.xlsx")
    .then(dt => {
      // res.download('/抽奖结果.xlsx');
      res.status(200).json({
        type: "success",
        url: "/results.xlsx"
      });
      log(`导出数据成功！`);
    })
    .catch(err => {
      res.json({
        type: "error",
        error: err.error
      });
      log(`导出数据失败！`);
    });
});

router.post('/settings', (req,res) => res.json(updateSettings(req.body)));
router.get('/settings', (req,res) => { res.set('Cache-Control','no-store');res.json(getSettings()); });


//对于匹配不到的路径或者请求，返回默认页面
//区分不同的请求返回不同的页面内容
router.all("*", (req, res) => {
  if (req.method.toLowerCase() === "get") {
    if (/\.(html|htm)/.test(req.originalUrl)) {
      res.set("Content-Type", "text/html");
      res.send(defaultPage);
    } else {
      res.status(404).end();
    }
  } else if (req.method.toLowerCase() === "post") {
    let postBackData = {
      error: "empty"
    };
    res.send(JSON.stringify(postBackData));
  }
});

function log(text) {
  global.console.log(text);
  global.console.log("-----------------------------------------------");
}

function setLucky(type, data) {
  const prize = cfg.prizes.find(p => p.type === Number(type));
  if (!prize || !Array.isArray(data) || !data.length || data.length > 119) throw new Error('无效的中奖数据');
  const roster = new Map(curData.users.map(u => [String(u[0]), u]));
  const blocked = new Set([...Object.values(luckyData).flat(), ...errorData].map(u => String(u[0])));
  const seen = new Set();
  const winners = data.map(user => {
    const id = String(user?.[0]);
    if (!roster.has(id) || blocked.has(id) || seen.has(id)) throw new Error('中奖人员重复或不在奖池中');
    seen.add(id); return roster.get(id);
  });
  if ((luckyData[type] || []).length + winners.length > prize.count) throw new Error('超过剩余奖品数量');
  const next = { ...luckyData, [type]: [...(luckyData[type] || []), ...winners] };
  saveDataFile(next); luckyData = next;
  return Promise.resolve();
}

function setErrorData(data) {
  if (!Array.isArray(data) || !data.length) throw new Error('无效的重抽数据');
  const winners = new Map(Object.values(luckyData).flat().map(u => [String(u[0]),u]));
  const ids = new Set(data.map(u => String(u?.[0])));
  if (ids.size !== data.length || [...ids].some(id => !winners.has(id))) throw new Error('只能重抽已中奖人员');
  getLeftUsers();
  if (curData.leftUsers.length < ids.size) throw new Error('剩余人员不足，无法重抽');
  const nextLucky = Object.fromEntries(Object.entries(luckyData).map(([type,users]) => [type,users.filter(u => !ids.has(String(u[0])))]));
  const nextErrors = errorData.concat([...ids].map(id => winners.get(id)));
  // Journal both files so interrupted redraws recover together on startup.
  require('./help').atomicJSON('pending-redraw.json', { lucky: nextLucky, errors: nextErrors });
  saveDataFile(nextLucky); saveErrorDataFile(nextErrors);
  require('fs').unlinkSync(path.join(dataDir, 'pending-redraw.json'));
  luckyData = nextLucky; errorData = nextErrors;
  return Promise.resolve();
}


app.use(router);
app.use((err,req,res,next) => res.status(400).json({ error: err.message }));

function loadData() {
  console.log("加载EXCEL数据文件");
  let cfgData = {};

  // curData.users = loadXML(path.join(cwd, "data/users.xlsx"));
  curData.users = loadXML(path.join(dataBath, "data/users.xlsx"));
  // 重新洗牌
  shuffle(curData.users);

  const fs = require('fs');
  const journal = path.join(dataDir, 'pending-redraw.json');
  if (fs.existsSync(journal)) {
    const pending = JSON.parse(fs.readFileSync(journal, 'utf8'));
    saveDataFile(pending.lucky); saveErrorDataFile(pending.errors); fs.unlinkSync(journal);
  }
  [luckyData, errorData] = loadTempData();
}

function getLeftUsers() {
  //  记录当前已抽取的用户
  let lotteredUser = {};
  for (let key in luckyData) {
    let luckys = luckyData[key];
    luckys.forEach(item => {
      lotteredUser[item[0]] = true;
    });
  }
  // 记录当前已抽取但是不在线人员
  errorData.forEach(item => {
    lotteredUser[item[0]] = true;
  });

  let leftUsers = Object.assign([], curData.users);
  leftUsers = leftUsers.filter(user => {
    return !lotteredUser[user[0]];
  });
  curData.leftUsers = leftUsers;
}

loadData();

/**
 * 从 startPort 开始监听，端口被占用时自动 +1 重试（最多 retries 次），
 * 成功后打印实际访问端口；范围内全被占用则退出进程。
 */
function listenWithRetry(startPort, shouldOpen, retries) {
  let used = 0;
  const maxTries = retries || 100;

  const attempt = currentPort => {
    if (used >= maxTries) {
      global.console.error(
        `[lottery] 端口 ${startPort} ~ ${startPort + maxTries - 1} 均被占用，无法启动，请先释放端口后重试`
      );
      process.exit(1);
    }
    used += 1;

    const server = app.listen(currentPort, process.env.HOST || '0.0.0.0', () => {
      const address = server.address();
      const actualPort = address.port;
      global.console.log(
        `lottery server listening at http://${address.address}:${actualPort}`
      );
      if (actualPort !== Number(startPort)) {
        global.console.log(
          `[lottery] 初始端口 ${startPort} 被占用，实际使用端口：${actualPort}`
        );
      }
      if (shouldOpen) {
        try {
          opn(`http://127.0.0.1:${actualPort}`).catch(() => {});
        } catch (e) {
          /* 打不开浏览器不影响服务运行 */
        }
      }
    });

    server.on("error", err => {
      if (err && err.code === "EADDRINUSE") {
        global.console.log(
          `[lottery] 端口 ${currentPort} 被占用，尝试端口 ${currentPort + 1}...`
        );
        attempt(currentPort + 1);
      } else {
        global.console.error(`[lottery] 服务启动失败：${err && err.message}`);
        process.exit(1);
      }
    });
  };

  attempt(Number(startPort) || port);
}

module.exports = {
  run: function(devPort, noOpen) {
    let shouldOpen = true;
    const noOpenFlag = noOpen || process.argv[3];
    if (noOpenFlag && String(noOpenFlag).toLowerCase() === "n") {
      shouldOpen = false;
    }

    if (devPort) {
      port = devPort;
    }

    listenWithRetry(Number(process.env.PORT || port), shouldOpen);
  }
};
