# 直接基于原项目的 2.0.0

本版重新克隆 `https://github.com/moshang-ax/lottery.git`，基于默认 `vue` 分支提交 `1590205dacb44a5a8a3a1a2c77b58e9466dc6bf1` 开发。`wlabbyflower/wlabby-lottery` 仅作为交付仓库。此前改造版的主题系统、WebGL 实例化场景、人员轮播和分类后台均不在本版源码中。

## 保留原版

以下文件与上述上游提交完全一致：

- `product/src/lottery/index.css`：大屏所有原版样式。
- `product/src/components/ControlPanel.vue`：进入、开始/结束、重抽、导出和重置按钮。
- `product/src/components/PrizeBar.vue`：原版奖品列表和剩余数量显示。
- `product/public/lib/`、`product/public/img/`：原版 Three.js、CSS3DRenderer、Tween、控制器和奖品图片。

仍使用原项目的 Vue 组件、CSS3D 名牌墙/球体、800 颗星星的动态 Canvas 背景、Excel 名单与奖项配置方式；没有替换成另一套大屏。

## 新增设置与修复

大屏右上角新增齿轮，进入 `/admin.html`：

1. 设置四位高亮年份，默认当前年份。
2. 选择原版动态星空、背景图或纯色；可修改背景颜色。
3. 上传 5MB 以内 PNG/JPEG/WebP/GIF，或填写 HTTP(S) 图片网址。
4. 保存后刷新大屏。上传图片随设置持久保存，不依赖电脑原文件位置；移除图片并保存可回到原版星空。

修复原项目中奖结果要到下一轮/导出才保存的问题，现在结果展示前已写入服务端。导出不再把同一轮重复记账；奖池不足时只抽取剩余人员，不自动把所有人重新放回。服务端拒绝同轮和跨奖项重复人员，重抽会移除原轮结果并将未到场人员排除；失败的重抽不会先删除结果。JSON 使用临时文件和 rename 写入，启动先读取持久状态再提供服务。

保留原版可重抽上一整轮的交互，没有沿用旧改造版的单人补抽界面。静态目录与导出目录不再依赖启动目录，避免暴露源码，也可以在只读容器代码目录中导出 Excel。星空及卡片后台标签页暂停动画，使用背景图/纯色时停止星空循环。构建依赖升级以适配当前 Node，服务端删除未使用的 chokidar/body-parser 直接依赖。

## 本地运行与原版配置

需要 Node.js 22.12+。

```bash
git clone git@github.com:wlabbyflower/wlabby-lottery.git
cd wlabby-lottery
npm run install:all
npm run build
npm start
```

浏览器打开 `http://127.0.0.1:8888/`。设置页 `http://127.0.0.1:8888/admin.html`。初始名单是上游示例数据，正式使用前替换 `server/data/users.xlsx`；修改奖项、每轮人数和公司名称仍使用原项目的 `server/config.js`，然后重启。开发模式 `npm --prefix product run dev` 会自动启动数据服务。

## LPK

包 ID 保持 `abby.lzcapp.lottery`，版本 `2.0.0`，要求 `lzcos >= 1.6.0`，目标 `linux/amd64`，使用固定懒猫 Registry 基础镜像和内嵌应用层。

```bash
mkdir -p artifacts
lzc-cli project release -o artifacts/abby.lzcapp.lottery-2.0.0-amd64.lpk
lzc-cli lpk info artifacts/abby.lzcapp.lottery-2.0.0-amd64.lpk
lzc-cli lpk lint artifacts/abby.lzcapp.lottery-2.0.0-amd64.lpk
lzc-cli lpk install artifacts/abby.lzcapp.lottery-2.0.0-amd64.lpk
```

本版使用独立目录 `/lzcapp/var/upstream-lottery/`，包含 `appearance.json`（年份和背景）、`temp.json`（中奖结果）、`error.json`（未到场人员）和导出的 Excel。不会读取或覆盖旧改造版的 `/lzcapp/var/lottery/`。首次进入是原版示例活动，旧版结果不会自动迁移。微服账号负责访问控制，无额外登录。

## 验证与排查

`npm test` 覆盖设置持久化与非法输入、重复人员拒绝、重抽、Excel 导出、源码不可访问、跨站写入拒绝及重启恢复。`scripts/browser-check.cjs` 覆盖实际年份矩阵变化、背景上传/移除、刷新、原版开奖、结果立即保存、重抽、导出不重复、手机设置页及重启。

运行浏览器测试需安装 Playwright 并提供 Chromium：

```bash
PLAYWRIGHT_MODULE=/path/to/node_modules/playwright CHROMIUM_PATH=/path/to/chrome node scripts/browser-check.cjs
```

测试全部使用临时数据。若无法保存，检查图片类型/大小与年份是否四位数字；图片网址必须在大屏浏览器可访问。LPK 构建期间 CLI 可能提示 `application.run_as` 未知字段，官方当前规范支持该字段（1.6.0+），因此按规范保留最低系统版本。微服安装问题可查看 `lzc-cli project info --release` 和 `lzc-cli project log --release`。

预览：[原版大屏](screenshots/original-screen.png) · [年份和背景设置](screenshots/original-settings.png)。

## 本次交付记录

- LPK：`abby.lzcapp.lottery-2.0.0-amd64.lpk`，9,506,816 字节（9.07 MiB），未签名。
- SHA-256：`43ee44dedd404f296e3f338063a14e104b53a3ff6bb07c5272452713aabf3a78`。
- 镜像 ID：`sha256:ddb45d4a65746d2f567b02ee7818cbf63c867eea8333888a39d47e2672e051d9`。
- 正式包 `lpk lint` 无警告；元数据本地化值、manifest/embed 关联及全部内嵌层摘要核对通过。
- API/设置测试和原版浏览器回归通过。服务端生产依赖与前端生产依赖审计均为 0 个已知漏洞；picomatch 的已知告警仍涉及前端构建工具，构建工具不进入生产容器。本版没有声称全量开发依赖无告警。
- 微服独立测试应用 `abby.lzcapp.lottery.originalverify` 使用与正式包完全相同的镜像，`project info` 确认 2.0.0、healthy、`Current version deployed: yes`、`Project app is running.`。实际验证原版 CSS3D 页面入口、年份和上传背景落盘、UID 1000 属主、原版中奖保存 API 与 Excel 导出。测试后卸载测试应用并删除测试数据；现有正式应用没有被升级，旧活动目录未修改。
- 微服客户端内文件选择器未做人工交互实测；仅验证其官方注入脚本与同源桥接已随包配置。
