# wlabby-lottery · 星际抽奖

面向年会、团队活动和现场抽奖的太空科技风格抽奖应用，可通过浏览器运行，也可打包安装到懒猫微服。

## 项目来源与许可证

本项目基于 **[moshang-ax/lottery](https://github.com/moshang-ax/lottery)** 的 `master` 分支进行二次开发，起始提交为 `f925d8a261e6242f7e117ce1f1d9487ced11b92f`。原项目提供 Node.js / Express 服务端、Three.js 3D 抽奖效果、Excel 名单与结果导出功能。感谢原作者及所有贡献者。

本仓库保留上游 Git 历史与 [MIT 许可证](LICENSE)，不是从零原创的抽奖引擎。上游说明存档见 [UPSTREAM-README.MD](docs/UPSTREAM-README.MD)。上游公开 PR、issue 与额外 PR #55 的本地处理记录见 [UPSTREAM-REVIEW.md](docs/UPSTREAM-REVIEW.md)，包括等价实现、替代方案和未交付项目；没有声称所有历史需求均已实现。

二次开发维护仓库：[wlabbyflower/wlabby-lottery](https://github.com/wlabbyflower/wlabby-lottery)。

## 本版改动

- 四套可切换的太空 UI：深空星舰、紫域星云、极光航线、日冕远征，支持即时预览与保存。
- 左上角齿轮设置入口；左侧分类设置：基础设置、UI 主题、名单导入、中奖名单、奖品设置、抽奖规则。
- 支持活动标题、公司标识与欢迎墙高亮文字，不再固定年份。
- 服务端抽奖、默认不重复中奖、按剩余奖品及人数限制本轮数量；结果立即持久保存。
- 支持未到场人员单独补抽、Excel / 粘贴导入名单、人员搜索、中奖记录筛选和 Excel 导出。
- 可显式启用重复参与、权重模式或定向模式；权重和定向抽取会在大屏标注。
- 使用 Vite 构建；增加 Docker 与 LPK v2 打包，适配微服代理和持久化目录。

## 本机启动

需要 Node.js 22.12+（Docker / LPK 镜像使用 Node.js 24）。

```bash
git clone https://github.com/wlabbyflower/wlabby-lottery.git
cd wlabby-lottery
npm run install:all
npm run build
npm start
```

默认监听 `0.0.0.0:8888`：本机访问 `http://127.0.0.1:8888/`，其他设备访问 `http://服务器局域网IP:8888/`。设置页为 `/admin.html`。需要修改端口时使用 `PORT=9000 npm start`。

初始名单是上游示例数据，请先导入正式名单并配置奖项再用于实际活动。

## 懒猫微服 LPK

**请使用 1.0.1 或更新版本。1.0.0 的入口翻译使用了安装器不接受的嵌套对象，会导致 `render lpk failed`，不应继续安装。**

构建条件：`lzc-cli >= 2.0.0`、可用 Docker、联网获取固定的懒猫 Registry 基础镜像。安装需要 `lzcos >= 1.6.0`。当前构建目标是 **linux/amd64**。

```bash
mkdir -p artifacts
lzc-cli project release -o artifacts/wlabby-lottery-1.0.1-amd64.lpk
lzc-cli lpk info artifacts/wlabby-lottery-1.0.1-amd64.lpk
lzc-cli lpk install artifacts/wlabby-lottery-1.0.1-amd64.lpk
```

- 应用 ID：`cloud.lazycat.app.wlabby.lottery`，版本 `1.0.1`。
- LPK v2 采用 `embed:lottery` 打包应用层；运行不依赖开发电脑。基础镜像层通过已固定的懒猫 Registry 镜像获取。
- 数据保存在微服 `/lzcapp/var/lottery/`，包括名单、设置和中奖记录；不会把开发电脑现有活动数据打入安装包。
- 应用通过微服账号鉴权，无额外应用登录。所有获授权用户共享同一场活动，建议由一位主持人操作。
- 配置了官方文件选择器及同源网盘桥接；Excel 的普通 HTTP 导出仍支持浏览器下载。
- LPK 产物不提交到 Git 源码，位于本地 `artifacts/`。本次交付为未签名的安装包，未提交应用商店审核。构建与验证记录见 [LPK-RELEASE.md](docs/LPK-RELEASE.md)。

## Docker

```bash
docker compose up -d --build
```

同样使用 8888 端口。Compose 将 `server/cache` 与 `server/data` 持久化到本机目录。

## 数据、导入和备份

本机版本状态默认保存在 `server/cache/`；可用 `LOTTERY_DATA_DIR` 指定其他目录。备份此目录即可备份名单、结果和设置。源代码仓库和 LPK 不包含运行时缓存。

Excel 第一行是表头，后续列依次为：工号、姓名、部门、照片 URL（可选）、权重（可选，默认 1）。工号必须唯一。已有中奖记录时先导出、重置，再更换名单。

如果直接暴露本机服务而需要口令，可设置 `LOTTERY_PASSWORD` 启用 HTTP Basic 登录。微服安装默认使用平台鉴权，不需要该变量。

## 验证

```bash
npm test
npm run build
```

核心测试覆盖奖池唯一性、奖品余量、补抽、重复模式、权重与定向抽取。浏览器冒烟脚本为 `scripts/smoke-test.cjs`，另需安装 Playwright 与 Chromium，覆盖开奖、持久化、主题、设置导航和移动布局。完整本机维护说明见 [LOCAL-RUN.md](docs/LOCAL-RUN.md)。
