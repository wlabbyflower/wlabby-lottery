import { PeoplePreview } from "./people-preview.js";
import * as THREE from "three";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";
import { CSS3DRenderer, CSS3DObject } from "three/addons/renderers/CSS3DRenderer.js";
import { GPUCardRenderer } from "./gpu-renderer.js";
import { THEMES, applyTheme, icon } from "../themes.js";
import "./index.css";
import "../css/animate.min.css";
import {
  addQipao,
  setPrizes,
  showPrizeList,
  setPrizeData,
  resetPrize
} from "./prizeList";

const ROTATE_TIME = 3000;
const ROTATE_LOOP = 1000;


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

let rotateObj, gpu, preview;
let frameId = 0, lastFrame = 0, renderDirty = true, dragging = false;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
function scheduleFrame() {
  if (renderer && controls && !document.hidden && !frameId) frameId = requestAnimationFrame(animate);
}
window.addEventListener('lottery-theme-change', () => render());
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { cancelAnimationFrame(frameId); frameId = 0; }
  else { lastFrame = 0; render(); }
});
reducedMotion.addEventListener('change', () => render());

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

let prizesCollapsed = false;
try { const saved=localStorage.getItem('lottery.prizesCollapsed');prizesCollapsed=saved===null?innerWidth<1050:saved==='true'; } catch { /* Browser storage may be disabled. */ }
function applyPrizePanelState() {
  const toggle = document.getElementById('prizePanelToggle');
  document.getElementById('prizePanel').classList.toggle('collapsed', prizesCollapsed);
  toggle.setAttribute('aria-expanded', String(!prizesCollapsed));
  toggle.setAttribute('aria-label', prizesCollapsed ? '展开奖品列表' : '收起奖品列表');
  toggle.title = toggle.getAttribute('aria-label');
  document.getElementById('prizePanelToggleText').textContent = prizesCollapsed ? '展开奖品' : '收起';
  const list = document.getElementById('prizeList');
  if (list) list.hidden = prizesCollapsed;
}
document.getElementById('prizePanelToggle').addEventListener('click', () => {
  prizesCollapsed = !prizesCollapsed;
  applyPrizePanelState();
  try { localStorage.setItem('lottery.prizesCollapsed', String(prizesCollapsed)); } catch { /* The toggle still works without storage. */ }
});
applyPrizePanelState();
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
    document.querySelector('#eventTitle').textContent = screenConfig.title;
    setupThemes(screenConfig.theme);
    updateTelemetry(data);
    HIGHLIGHT_CELL = [];
    basicData = { prizes, users: data.users, leftUsers: data.leftUsers, luckyUsers: data.luckyData };

    TOTAL_CARDS = ROW_COUNT * COLUMN_COUNT;
    if (!basicData.users.length || !prizes.length) {
      preview = new PeoplePreview(basicData.users,screenConfig.highlight || screenConfig.title,onPreviewView);
      document.querySelector('[data-preview-view="sphere"]').disabled=true;
      document.getElementById('enter').disabled=true;
      document.getElementById('enter').textContent=!basicData.users.length?'请先导入人员名单':'请先配置奖品';
      document.getElementById('prizeBar').textContent=prizes.length?'奖项已保留，请先导入人员':'暂无奖品，请在设置中添加';
      window.lotteryRenderInfo=()=>({mode:'empty',cardCount:0});return;
    }
    setPrizes(prizes);
    updatePrize();
    preview = new PeoplePreview(basicData.leftUsers,screenConfig.highlight || screenConfig.title,onPreviewView);
    initCards();
    render();
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
function activityComplete() {
  return prizes && (prizes.every(prize=>(basicData.luckyUsers[prize.type] || []).length>=prize.count) || !basicData.leftUsers.length);
}
function refreshDrawButton() { btns.lottery.textContent=activityComplete()?'查看抽奖结果':'开始抽奖'; }
function onPreviewView(view) {
  if(view==='sphere' && scene && targets.sphere.length) { camera.position.set(0,0,3000);camera.up.set(0,1,0);camera.lookAt(new THREE.Vector3());transform(targets.sphere,700); }
  updateStage();
}
function updateStage() {
  const showCards=preview?.view==='cards' && !isLotting && !currentLuckys.length;
  document.body.classList.toggle('preview-mode',showCards);
  document.getElementById('peoplePreview').hidden=isLotting || currentLuckys.length>0;
  if(showCards) {cancelAnimationFrame(frameId);frameId=0;} else if(scene) render();
}
async function showAllResults() {
  const snapshot=await api('/getTempData');
  const body=document.getElementById('allResultsBody');body.replaceChildren();let total=0;
  for(const prize of snapshot.cfgData.prizes) for(const user of snapshot.luckyData[prize.type] || []) {
    const row=document.createElement('tr');
    for(const value of [prize.text,prize.title,user[1],user[0],user[2]]) {const cell=document.createElement('td');cell.textContent=value || '—';row.append(cell);}
    body.append(row);total++;
  }
  document.getElementById('resultsSummary').textContent=`共 ${snapshot.cfgData.prizes.length} 个奖项，${total} 位中奖人员。`;
  document.getElementById('resultsDialog').showModal();
}
document.getElementById('closeResults').onclick=()=>document.getElementById('resultsDialog').close();
function updatePrize() {
  currentPrizeIndex = prizes.length - 1;
  while (currentPrizeIndex >= 0 && (basicData.luckyUsers[prizes[currentPrizeIndex].type] || []).length >= prizes[currentPrizeIndex].count) currentPrizeIndex--;
  if (currentPrizeIndex < 0) currentPrizeIndex = 0;
  currentPrize = prizes[currentPrizeIndex];
  resetPrize(currentPrizeIndex);
  applyPrizePanelState();
  setPrizeData(currentPrizeIndex, (basicData.luckyUsers[currentPrize.type] || []).length, true);
  refreshDrawButton();
  if(activityComplete()) {document.getElementById("prizeType").textContent="活动已结束";document.getElementById("prizeText").textContent="";}
}
async function api(url, data = {}) {
  const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  const result = await response.json();
  if (!response.ok || result.error) throw new Error(result.error || '请求失败');
  return result;
}

function initCards() {
  const members = basicData.users;
  const showTable = basicData.leftUsers.length === members.length;
  const container = document.getElementById('container');
  camera = new THREE.PerspectiveCamera(40,innerWidth/innerHeight,1,30000);
  camera.position.z = Math.max(3000,COLUMN_COUNT*190);
  scene = new THREE.Scene();
  try {
    gpu = new GPUCardRenderer(container,scene,camera,TOTAL_CARDS);
    gpu.onInvalidate = render;
    renderer = gpu.renderer;
    document.documentElement.dataset.renderer = 'webgl2';
    document.documentElement.dataset.rendererState = 'ready';
    const info = gpu.info;
    document.getElementById('renderStatus').textContent = info.software ? 'WebGL · 软件渲染' : 'WebGL · GPU 渲染';
    document.getElementById('renderStatus').title = info.software ? '浏览器当前使用软件渲染器。开启浏览器硬件加速可使用显卡。' : info.device;
    window.lotteryRenderInfo = () => gpu.diagnostics();
  } catch(error) {
    container.replaceChildren();
    renderer = new CSS3DRenderer(); container.append(renderer.domElement);
    document.documentElement.dataset.renderer = 'css3d';
    document.getElementById('renderStatus').textContent = '兼容渲染';
    document.getElementById('renderStatus').title = '浏览器未提供 WebGL2，已使用 CSS 兼容模式。';
    window.lotteryRenderInfo = () => ({mode:'css3d',reason:error.message,cardCount:TOTAL_CARDS});
  }
  renderer.setSize(innerWidth,innerHeight);
  if(gpu) gpu.setSize(innerWidth,innerHeight);
  const centerX=(140*COLUMN_COUNT-20)/2, centerY=(180*ROW_COUNT-20)/2;
  const vector = new THREE.Vector3();
  for(let i=0;i<TOTAL_CARDS;i++) {
    const row=Math.floor(i/COLUMN_COUNT),column=i%COLUMN_COUNT;
    const highlighted=HIGHLIGHT_CELL.includes(column+'-'+row);
    const member=members[Math.floor(i*members.length/TOTAL_CARDS)%members.length];
    const object=gpu ? new THREE.Object3D() : new CSS3DObject(createCard(member,highlighted,i,showTable));
    object.position.set(Math.random()*4000-2000,Math.random()*4000-2000,Math.random()*4000-2000);
    scene.add(object); threeDCards.push(object);
    if(gpu) { gpu.setLabel(i,member,COMPANY); gpu.setHighlight(i,highlighted && showTable); }
    const table=new THREE.Object3D(); table.position.set(column*140-centerX,-row*180+centerY); targets.table.push(table);
    const sphere=new THREE.Object3D(),phi=Math.acos(-1+2*i/TOTAL_CARDS),theta=Math.sqrt(TOTAL_CARDS*Math.PI)*phi;
    sphere.position.setFromSphericalCoords(800,phi,theta); vector.copy(sphere.position).multiplyScalar(2); sphere.lookAt(vector); targets.sphere.push(sphere);
  }
  if(gpu) gpu.objects=threeDCards;
  controls=new TrackballControls(camera,renderer.domElement);
  controls.staticMoving=true; controls.rotateSpeed=.5; controls.minDistance=500; controls.maxDistance=Math.max(6000,COLUMN_COUNT*220);
  controls.addEventListener('change',render);
  controls.addEventListener('start',()=>{dragging=true;render();});
  controls.addEventListener('end',()=>{dragging=false;render();});
  bindEvent(); switchScreen(showTable?'enter':'lottery');
}

function setLotteryStatus(status = false) {
  isLotting = status;
  updateStage();
  if(!status)refreshDrawButton();
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
          if(activityComplete()) {await showAllResults();break;}
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
      preview?.setView("cards");
      transform(targets.table, 1000);
      break;
    default:
      camera.position.set(0, 0, 3000);
      camera.lookAt(new THREE.Vector3());
      btns.enter.classList.add("none");
      btns.lotteryBar.classList.remove("none");
      preview?.setView("sphere");
      transform(targets.sphere, 1000);
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
  if(gpu) { for(let i=0;i<TOTAL_CARDS;i++) gpu.setHighlight(i,false); render(); return; }
  document.querySelectorAll(".highlight").forEach(node => {
    node.classList.remove("highlight");
  });
}

function addHighlight() {
  if(gpu) { for(let i=0;i<TOTAL_CARDS;i++) gpu.setHighlight(i,HIGHLIGHT_CELL.includes((i%COLUMN_COUNT)+'-'+Math.floor(i/COLUMN_COUNT))); render(); return; }
  document.querySelectorAll(".lightitem").forEach(node => {
    node.classList.add("highlight");
  });
}

/**
 * 渲染地球等
 */
function transform(targets, duration) {
  render();
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

function rotateBall() {
  render();
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
  if(gpu) { gpu.setSize(innerWidth,innerHeight); gpu.updateOverlay(); }
  else renderer.setSize(innerWidth,innerHeight);
  render();
}

function animate(time) {
  frameId=0;
  if(document.hidden || document.body.classList.contains("preview-mode")) return;
  const animating=TWEEN.getAll().length>0;
  const frameBudget=(animating || dragging) && !gpu?.info.software ? 1000/60 : 1000/30;
  if(time-lastFrame<frameBudget-1) { scheduleFrame(); return; }
  lastFrame=time;
  const changed=renderDirty || animating || dragging;
  if(animating) TWEEN.update(); // Bundled tween v7 starts on Date.now(), not the RAF time origin.
  if(changed) controls.update();
  renderDirty=false;
  if(gpu) gpu.render(threeDCards,reducedMotion.matches?0:time,changed);
  else if(changed) renderer.render(scene,camera);
  if(TWEEN.getAll().length || dragging || (gpu && !reducedMotion.matches && !gpu.lost)) scheduleFrame();
}
function render() { renderDirty=true; scheduleFrame(); }

function selectCard(duration = 600) {
  render();
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
      if(gpu) gpu.showWinners(selectedCardIndex,createCard);
      else selectedCardIndex.forEach(i => threeDCards[i].element.classList.add("prize"));
      document.body.classList.add("showing-winners");
      setLotteryStatus();
    });
}

/**
 * 重置抽奖牌内容
 */
function resetCard(duration = 500) {
  render();
  controls.enabled = true;
  document.body.classList.remove("showing-winners");
  if(gpu) gpu.clearWinners();
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
          if(!gpu) object.element.classList.remove("prize");
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
    finally { refreshDrawButton(); }
  });
}
function showResult(result, type) {
  updateTelemetry(result);
  basicData.leftUsers = result.leftUsers;
  basicData.luckyUsers = result.luckyData;
  preview?.setUsers(result.leftUsers);
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
  if(gpu) { gpu.setLabel(cardIndex,user,COMPANY); render(); return; }
  const card = threeDCards[cardIndex].element;
  card.querySelector('.name').textContent=user[1];
  card.querySelector('.details').textContent=user[0]+' · '+(user[2] || '');
  card.querySelector('.employee-photo')?.remove();
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
  if(gpu) return; // GPU shader pulses cards without DOM or texture repainting.
  let maxCard = 3,
    maxUser;
  let shineCard = 2 + random(maxCard);

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
  }, 2500);
}

const music = document.querySelector('#music'), musicBox = document.querySelector('#musicBox');
musicBox.addEventListener('click',async()=>{
  try { if(music.paused) await music.play(); else music.pause(); musicBox.setAttribute('aria-pressed',String(!music.paused)); }
  catch(error) { addQipao('背景音乐播放失败，请手动重试。'); }
});
musicBox.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();musicBox.click();}});
