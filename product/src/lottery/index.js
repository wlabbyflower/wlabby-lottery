import { THEMES, applyTheme, icon } from "../themes.js";
import "./index.css";
import "../css/animate.min.css";
import "./canvas.js";
import {
  addQipao,
  setPrizes,
  showPrizeList,
  setPrizeData,
  resetPrize
} from "./prizeList";
import { NUMBER_MATRIX } from "./config.js";

const ROTATE_TIME = 3000;
const ROTATE_LOOP = 1000;
const BASE_HEIGHT = 1080;

let TOTAL_CARDS,
  btns = {
    enter: document.querySelector("#enter"),
    lotteryBar: document.querySelector("#lotteryBar"),
    lottery: document.querySelector("#lottery")
  },
  prizes,
  EACH_COUNT,
  ROW_COUNT = 7,
  COLUMN_COUNT = 17,
  COMPANY,
  screenConfig,
  lastDrawType,
  lastDrawUsers = [],
  HIGHLIGHT_CELL = [],
  // 当前的比例
  Resolution = 1;

let camera,
  scene,
  renderer,
  controls,
  threeDCards = [],
  targets = {
    table: [],
    sphere: []
  };

let rotateObj;

let selectedCardIndex = [],
  rotate = false,
  basicData = {
    prizes: [], //奖品信息
    users: [], //所有人员
    luckyUsers: {}, //已中奖人员
    leftUsers: [] //未中奖人员
  },
  interval,
  // 当前抽的奖项，从最低奖开始抽，直到抽到大奖
  currentPrizeIndex,
  currentPrize,
  // 正在抽奖
  isLotting = false,
  currentLuckys = [];

initAll();

/**
 * 初始化所有DOM
 */
async function initAll() {
  try {
    const data = await api('/getTempData');
    screenConfig = data.cfgData;
    prizes = screenConfig.prizes;
    EACH_COUNT = screenConfig.EACH_COUNT;
    COMPANY = screenConfig.COMPANY;
    document.title = screenConfig.title;
    document.querySelector('#eventTitle').textContent = screenConfig.title + ({weighted:' · 权重抽奖', designated:' · 定向抽取'}[screenConfig.mode] || '');
    setupThemes(screenConfig.theme);
    updateTelemetry(data);
    HIGHLIGHT_CELL = createHighlight();
    basicData = { prizes, users: data.users, leftUsers: data.leftUsers, luckyUsers: data.luckyData };
    if (!basicData.users.length) throw new Error('请在活动设置中导入名单');
    setPrizes(prizes);
    TOTAL_CARDS = ROW_COUNT * COLUMN_COUNT;
    updatePrize();
    initCards();
    animate();
    shineCard();
  } catch (error) { addQipao('加载失败：' + error.message); }
}
function updateTelemetry(data) {
  document.querySelector('#crewTotal').textContent = basicData.users.length || data.users.length;
  document.querySelector('#crewAvailable').textContent = data.leftUsers.length;
}
function setupThemes(id) {
  document.querySelectorAll('[data-icon]').forEach(el => el.innerHTML = icon(el.dataset.icon));
  const menu = document.querySelector('#themeMenu'), toggle = document.querySelector('#themeToggle');
  function select(id) {
    const selected = applyTheme(id);
    document.querySelector('#themeLabel').textContent = selected.name;
    menu.querySelectorAll('button').forEach(button => button.setAttribute('aria-checked', String(button.dataset.theme === selected.id)));
  }
  for (const theme of THEMES) {
    const button = document.createElement('button'); button.dataset.theme = theme.id; button.setAttribute('role', 'menuitemradio');
    button.innerHTML = `<span class="theme-dot" style="--swatch:${theme.accent}"></span><span>${theme.name}</span>`;
    button.onclick = async () => {
      try { await api('/theme', { theme: theme.id }); select(theme.id); menu.classList.add('none'); toggle.setAttribute('aria-expanded', 'false'); toggle.focus(); }
      catch(error) { addQipao('主题保存失败：' + error.message); }
    }; menu.append(button);
  }
  toggle.onclick = () => { const open = menu.classList.toggle('none') === false; toggle.setAttribute('aria-expanded', String(open)); if(open) menu.querySelector('[aria-checked="true"]')?.focus(); };
  document.addEventListener('click', event => { if(!event.target.closest('.theme-control')) { menu.classList.add('none'); toggle.setAttribute('aria-expanded', 'false'); } });
  document.addEventListener('keydown', event => { if(event.key === 'Escape' && !menu.classList.contains('none')) { menu.classList.add('none'); toggle.setAttribute('aria-expanded', 'false'); toggle.focus(); } });
  select(id);
}
function updatePrize() {
  currentPrizeIndex = prizes.length - 1;
  while (currentPrizeIndex >= 0 && (basicData.luckyUsers[prizes[currentPrizeIndex].type] || []).length >= prizes[currentPrizeIndex].count) currentPrizeIndex--;
  if (currentPrizeIndex < 0) currentPrizeIndex = 0;
  currentPrize = prizes[currentPrizeIndex];
  resetPrize(currentPrizeIndex);
  setPrizeData(currentPrizeIndex, (basicData.luckyUsers[currentPrize.type] || []).length, true);
}
async function api(url, data = {}) {
  const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  const result = await response.json();
  if (!response.ok || result.error) throw new Error(result.error || '请求失败');
  return result;
}

function initCards() {
  let member = basicData.users.slice(),
    showCards = [],
    length = member.length;

  let isBold = false,
    showTable = basicData.leftUsers.length === basicData.users.length,
    index = 0,
    totalMember = member.length,
    position = {
      x: (140 * COLUMN_COUNT - 20) / 2,
      y: (180 * ROW_COUNT - 20) / 2
    };

  camera = new THREE.PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );
  camera.position.z = Math.max(3000, COLUMN_COUNT * 190);

  scene = new THREE.Scene();

  for (let i = 0; i < ROW_COUNT; i++) {
    for (let j = 0; j < COLUMN_COUNT; j++) {
      isBold = HIGHLIGHT_CELL.includes(j + "-" + i);
      var element = createCard(
        member[index % length],
        isBold,
        index,
        showTable
      );

      var object = new THREE.CSS3DObject(element);
      object.position.x = Math.random() * 4000 - 2000;
      object.position.y = Math.random() * 4000 - 2000;
      object.position.z = Math.random() * 4000 - 2000;
      scene.add(object);
      threeDCards.push(object);
      //

      var object = new THREE.Object3D();
      object.position.x = j * 140 - position.x;
      object.position.y = -(i * 180) + position.y;
      targets.table.push(object);
      index++;
    }
  }

  // sphere

  var vector = new THREE.Vector3();

  for (var i = 0, l = threeDCards.length; i < l; i++) {
    var phi = Math.acos(-1 + (2 * i) / l);
    var theta = Math.sqrt(l * Math.PI) * phi;
    var object = new THREE.Object3D();
    object.position.setFromSphericalCoords(800 * Resolution, phi, theta);
    vector.copy(object.position).multiplyScalar(2);
    object.lookAt(vector);
    targets.sphere.push(object);
  }

  renderer = new THREE.CSS3DRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById("container").appendChild(renderer.domElement);

  //

  controls = new THREE.TrackballControls(camera, renderer.domElement);
  controls.rotateSpeed = 0.5;
  controls.minDistance = 500;
  controls.maxDistance = Math.max(6000, COLUMN_COUNT * 220);
  controls.addEventListener("change", render);

  bindEvent();

  if (showTable) {
    switchScreen("enter");
  } else {
    switchScreen("lottery");
  }
}

function setLotteryStatus(status = false) {
  isLotting = status;
}

/**
 * 事件绑定
 */
function bindEvent() {
  let busy = false;
  document.querySelector('#menu').addEventListener('click', async e => {
    const target = e.target.id;
    if (isLotting) {
      if (target === 'lottery' && rotateObj && !busy) { rotateObj.stop(); btns.lottery.textContent = '开始抽奖'; }
      return;
    }
    if (busy) return;
    busy = true;
    try {
      switch (target) {
        case 'enter':
          removeHighlight(); switchScreen('lottery'); break;
        case 'reset':
          if (!confirm('确定清空所有中奖记录？请先导出结果。')) break;
          await api('/reset'); location.reload(); break;
        case 'lottery':
          if (!basicData.leftUsers.length) throw new Error('没有剩余可抽奖人员');
          if ((basicData.luckyUsers[currentPrize.type] || []).length >= currentPrize.count) throw new Error('所有奖项已抽完');
          if (lastDrawType !== currentPrize.type && !confirm('开始抽取：' + currentPrize.text + ' ' + currentPrize.title + '？')) break;
          setLotteryStatus(true);
          await resetCard();
          lottery(); break;
        case 'reLottery': {
          if (!lastDrawUsers.length) throw new Error('当前没有可补抽的结果');
          const message = lastDrawUsers.map((u,i) => `${i+1}. ${u[1]}（${u[0]}）`).join('\n');
          const input = prompt('输入未到场人员序号，用逗号分隔；留空重新抽取本轮全部：\n' + message, '');
          if (input === null) break;
          const indices = input.trim() ? input.split(/[,，\s]+/).map(n => Number(n)-1) : lastDrawUsers.map((_,i)=>i);
          if (indices.some(i => !Number.isInteger(i) || !lastDrawUsers[i]) || new Set(indices).size !== indices.length) throw new Error('人员序号无效');
          const result = await api('/redraw', { type: lastDrawType, ids: indices.map(i => lastDrawUsers[i][0]) });
          setLotteryStatus(true);
          await resetCard();
          const retained = lastDrawUsers.filter(u => !indices.some(i => lastDrawUsers[i][0] === u[0]));
          showResult(result, lastDrawType);
          lastDrawUsers = retained.concat(result.users);
          break;
        }
        case 'save':
          await api('/export'); location.href = '/results.xlsx'; break;
      }
    } catch (error) { setLotteryStatus(false); addQipao(error.message); }
    finally { busy = false; }
  });
  window.addEventListener('resize', onWindowResize, false);
}

function switchScreen(type) {
  switch (type) {
    case "enter":
      btns.enter.classList.remove("none");
      btns.lotteryBar.classList.add("none");
      transform(targets.table, 2000);
      break;
    default:
      camera.position.set(0, 0, 3000);
      camera.lookAt(new THREE.Vector3());
      btns.enter.classList.add("none");
      btns.lotteryBar.classList.remove("none");
      transform(targets.sphere, 2000);
      break;
  }
}

/**
 * 创建元素
 */
function createElement(css, text) {
  const dom = document.createElement('div');
  dom.className = css || '';
  dom.textContent = text || '';
  return dom;
}

/**
 * 创建名牌
 */
function createCard(user, isBold, id, showTable) {
  var element = createElement();
  element.id = "card-" + id;

  if (isBold) {
    element.className = "element lightitem";
    if (showTable) {
      element.classList.add("highlight");
    }
  } else {
    element.className = "element";
    element.style.backgroundColor =
      "rgba(0,127,127," + (Math.random() * 0.7 + 0.25) + ")";
  }
  //添加公司标识
  element.appendChild(createElement("company", COMPANY));

  element.appendChild(createElement("name", user[1]));

  element.appendChild(createElement("details", user[0] + " · " + (user[2] || "")));
  return element;
}

function removeHighlight() {
  document.querySelectorAll(".highlight").forEach(node => {
    node.classList.remove("highlight");
  });
}

function addHighlight() {
  document.querySelectorAll(".lightitem").forEach(node => {
    node.classList.add("highlight");
  });
}

/**
 * 渲染地球等
 */
function transform(targets, duration) {
  TWEEN.removeAll();
  for (var i = 0; i < threeDCards.length; i++) {
    var object = threeDCards[i];
    var target = targets[i];

    new TWEEN.Tween(object.position)
      .to(
        {
          x: target.position.x,
          y: target.position.y,
          z: target.position.z
        },
        Math.random() * duration + duration
      )
      .easing(TWEEN.Easing.Exponential.InOut)
      .start();

    new TWEEN.Tween(object.rotation)
      .to(
        {
          x: target.rotation.x,
          y: target.rotation.y,
          z: target.rotation.z
        },
        Math.random() * duration + duration
      )
      .easing(TWEEN.Easing.Exponential.InOut)
      .start();
  }

  new TWEEN.Tween({})
    .to({}, duration * 2)
    .onUpdate(render)
    .start();
}

// function rotateBall() {
//   return new Promise((resolve, reject) => {
//     scene.rotation.y = 0;
//     new TWEEN.Tween(scene.rotation)
//       .to(
//         {
//           y: Math.PI * 8
//         },
//         ROTATE_TIME
//       )
//       .onUpdate(render)
//       .easing(TWEEN.Easing.Exponential.InOut)
//       .start()
//       .onComplete(() => {
//         resolve();
//       });
//   });
// }

function rotateBall() {
  return new Promise((resolve, reject) => {
    scene.rotation.y = 0;
    rotateObj = new TWEEN.Tween(scene.rotation);
    rotateObj
      .to(
        {
          y: Math.PI * 6 * ROTATE_LOOP
        },
        ROTATE_TIME * ROTATE_LOOP
      )
      .onUpdate(render)
      // .easing(TWEEN.Easing.Linear)
      .start()
      .onStop(() => {
        scene.rotation.y = 0;
        resolve();
      })
      .onComplete(() => {
        resolve();
      });
  });
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
}

function animate() {
  // 让场景通过x轴或者y轴旋转
  // rotate && (scene.rotation.y += 0.088);

  requestAnimationFrame(animate);
  TWEEN.update();
  controls.update();

  // 渲染循环
  // render();
}

function render() {
  renderer.render(scene, camera);
}

function selectCard(duration = 600) {
  rotate = false;
  controls.enabled = false;
  TWEEN.removeAll();
  camera.position.set(0, 0, 3000);
  camera.up.set(0, 1, 0);
  camera.lookAt(new THREE.Vector3());
  scene.rotation.set(0, 0, 0);
  let width = 140,
    tag = -(currentLuckys.length - 1) / 2,
    locates = [];

  const columns = Math.min(5, currentLuckys.length);
  const rows = Math.ceil(currentLuckys.length / columns);
  const spacing = Math.min(140, 650 / columns);
  for (let i = 0; i < currentLuckys.length; i++) {
    const row = Math.floor(i / columns), rowLength = Math.min(columns, currentLuckys.length - row * columns);
    locates.push({ x: ((i % columns) - (rowLength - 1)/2) * spacing, y: ((rows - 1)/2 - row) * 180 });
  }
  let text = currentLuckys.map(item => item[1]);
  addQipao(
    `恭喜${text.join("、")}获得${currentPrize.title}, 新的一年必定旺旺旺。`
  );

  selectedCardIndex.forEach((cardIndex, index) => {
    changeCard(cardIndex, currentLuckys[index]);
    var object = threeDCards[cardIndex];
    new TWEEN.Tween(object.position)
      .to(
        {
          x: locates[index].x,
          y: locates[index].y * Resolution,
          z: Math.min(2200, 3000 - Math.max(800, Math.ceil(currentLuckys.length/5) * 270))
        },
        Math.random() * duration + duration
      )
      .easing(TWEEN.Easing.Exponential.InOut)
      .start();

    new TWEEN.Tween(object.rotation)
      .to(
        {
          x: 0,
          y: 0,
          z: 0
        },
        Math.random() * duration + duration
      )
      .easing(TWEEN.Easing.Exponential.InOut)
      .start();


    tag++;
  });

  new TWEEN.Tween({})
    .to({}, duration * 2)
    .onUpdate(render)
    .start()
    .onComplete(() => {
      selectedCardIndex.forEach(i => threeDCards[i].element.classList.add("prize"));
      document.body.classList.add("showing-winners");
      setLotteryStatus();
    });
}

/**
 * 重置抽奖牌内容
 */
function resetCard(duration = 500) {
  controls.enabled = true;
  document.body.classList.remove("showing-winners");
  if (currentLuckys.length === 0) {
    return Promise.resolve();
  }

  selectedCardIndex.forEach(index => {
    let object = threeDCards[index],
      target = targets.sphere[index];

    new TWEEN.Tween(object.position)
      .to(
        {
          x: target.position.x,
          y: target.position.y,
          z: target.position.z
        },
        Math.random() * duration + duration
      )
      .easing(TWEEN.Easing.Exponential.InOut)
      .start();

    new TWEEN.Tween(object.rotation)
      .to(
        {
          x: target.rotation.x,
          y: target.rotation.y,
          z: target.rotation.z
        },
        Math.random() * duration + duration
      )
      .easing(TWEEN.Easing.Exponential.InOut)
      .start();
  });

  return new Promise((resolve, reject) => {
    new TWEEN.Tween({})
      .to({}, duration * 2)
      .onUpdate(render)
      .start()
      .onComplete(() => {
        selectedCardIndex.forEach(index => {
          let object = threeDCards[index];
          object.element.classList.remove("prize");
        });
        resolve();
      });
  });
}

/**
 * 抽奖
 */
function lottery() {
  btns.lottery.textContent = '结束抽奖';
  const type = currentPrize.type;
  rotateBall().then(async () => {
    try {
      const result = await api('/draw', { type });
      showResult(result, type);
    } catch (error) { addQipao(error.message); setLotteryStatus(false); }
    finally { btns.lottery.textContent = '开始抽奖'; }
  });
}
function showResult(result, type) {
  updateTelemetry(result);
  basicData.leftUsers = result.leftUsers;
  basicData.luckyUsers = result.luckyData;
  currentLuckys = result.users;
  lastDrawUsers = result.users;
  lastDrawType = type;
  currentPrize = prizes.find(p => p.type === type);
  selectedCardIndex = [];
  while (selectedCardIndex.length < currentLuckys.length) {
    const index = random(TOTAL_CARDS);
    if (!selectedCardIndex.includes(index)) selectedCardIndex.push(index);
  }
  selectCard();
  updatePrize();
}

/**
 * 保存上一次的抽奖结果
 */
/**
 * 随机抽奖
 */
function random(num) {
  // Math.floor取到0-num-1之间数字的概率是相等的
  return Math.floor(Math.random() * num);
}

/**
 * 切换名牌人员信息
 */
function changeCard(cardIndex, user) {
  if (!user) return;
  const card = threeDCards[cardIndex].element;
  card.replaceChildren(createElement('company', COMPANY), createElement('name', user[1]), createElement('details', user[0] + ' · ' + (user[2] || '')));
  if (user[3] && /^https?:\/\//i.test(user[3])) {
    const photo = document.createElement('img'); photo.src = user[3]; photo.className = 'employee-photo'; photo.alt = user[1]; card.appendChild(photo);
  }
}

/**
 * 切换名牌背景
 */
function shine(cardIndex, color) {
  let card = threeDCards[cardIndex].element;
  card.style.backgroundColor =
    color || "rgba(0,127,127," + (Math.random() * 0.7 + 0.25) + ")";
}

/**
 * 随机切换背景和人员信息
 */
function shineCard() {
  let maxCard = 10,
    maxUser;
  let shineCard = 10 + random(maxCard);

  setInterval(() => {
    // 正在抽奖停止闪烁
    if (isLotting) {
      return;
    }
    if (document.hidden || !basicData.leftUsers.length) return;
    maxUser = basicData.leftUsers.length;
    for (let i = 0; i < shineCard; i++) {
      let index = random(maxUser),
        cardIndex = random(TOTAL_CARDS);
      // 当前显示的已抽中名单不进行随机切换
      if (selectedCardIndex.includes(cardIndex)) {
        continue;
      }
      shine(cardIndex);
      changeCard(cardIndex, basicData.leftUsers[index]);
    }
  }, 500);
}

function createHighlight() {
  const text = screenConfig.highlight || String(new Date().getFullYear());
  if (/^\d{4}$/.test(text)) {
    return text.split('').flatMap((n,i) => NUMBER_MATRIX[n].map(([x,y]) => `${x + 1 + i*4}-${y + 1}`));
  }
  ROW_COUNT = 11;
  COLUMN_COUNT = Math.max(17, Array.from(text).length * 9 + 1);
  const canvas = document.createElement('canvas');
  canvas.width = COLUMN_COUNT; canvas.height = ROW_COUNT;
  const context = canvas.getContext('2d');
  context.font = 'bold 9px sans-serif'; context.textAlign = 'center'; context.textBaseline = 'middle';
  context.fillText(text, COLUMN_COUNT/2, ROW_COUNT/2);
  const pixels = context.getImageData(0, 0, COLUMN_COUNT, ROW_COUNT).data;
  const cells = [];
  for(let y = 0; y < ROW_COUNT; y++) for(let x = 0; x < COLUMN_COUNT; x++) if(pixels[(y*COLUMN_COUNT+x)*4+3] > 100) cells.push(`${x}-${y}`);
  return cells;
}

let onload = window.onload;

window.onload = function () {
  onload && onload();

  let music = document.querySelector("#music");

  let rotated = 0,
    stopAnimate = false,
    musicBox = document.querySelector("#musicBox");

  function animate() {
    requestAnimationFrame(function () {
      if (stopAnimate) {
        return;
      }
      rotated = rotated % 360;
      musicBox.style.color = "var(--accent)";
      rotated += 0;
      animate();
    });
  }

  musicBox.addEventListener(
    "click",
    function (e) {
      if (music.paused) {
        music.play().then(
          () => {
            stopAnimate = false;
            animate();
          },
          () => {
            addQipao("背景音乐自动播放失败，请手动播放！");
          }
        );
      } else {
        music.pause();
        stopAnimate = true;
      }
    },
    false
  );

  musicBox.addEventListener("keydown", event => { if(event.key === "Enter" || event.key === " ") { event.preventDefault(); musicBox.click(); } });
};
