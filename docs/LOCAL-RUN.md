# 本地运行与局域网访问

项目路径：`/home/lazycat/moshang-lottery`。原 `/home/lazycat/lottery` 属于另一个仓库，未修改。

## 安装和启动

需要 Node.js 22.12 以上：

```bash
npm run install:all
npm run build
npm start
```

默认监听 `0.0.0.0:8888`，静态资源路径不依赖启动目录。无需手动打开浏览器，也不依赖桌面环境。

- 大屏：http://192.168.3.130:8888/
- 设置：http://192.168.3.130:8888/admin.html
- 本机：http://127.0.0.1:8888/
- 另一网卡：http://192.168.101.230:8888/

地址由当前机器网卡决定，局域网其他设备须能连通对应网段。

## 当前后台服务

已安装用户级 systemd 服务：`~/.config/systemd/user/moshang-lottery.service`。

```bash
systemctl --user status moshang-lottery
systemctl --user restart moshang-lottery
systemctl --user stop moshang-lottery
journalctl --user -u moshang-lottery -n 50
```

已启用随用户服务管理器启动；本机 `Linger=yes`，用户未登录时也可启动。

## 外观与规则

默认预览标题为“幸运抽奖”，基础设置可修改预览标题、活动标题和公司名称。四套明亮主题为晴空蓝、柔雾紫、清新绿、暖金庆典。默认 12 张大字号人员名牌，可翻页或切换可拖动缩放的 3D 球体。

左侧奖品列表可通过标题旁按钮收起/展开，抽奖过程中也可操作；当前浏览器会记住选择。收起列表后，顶部仍显示当前奖项。

奖项从列表底部依次向上抽取。特别奖与其他奖项相同，可删除，数量有限。每轮人数不超过剩余奖品和剩余人员；人员不足时不会自动放回全部人员。

仅支持等概率抽样，整场跨奖项不重复中奖。权重、定向与重复参与均已移除，详见 [公平性说明](FAIRNESS.md)。全部抽完后点击“查看抽奖结果”汇总和导出。

每轮结果由服务端立即写入 `server/cache/state.json`，刷新页面或重启后保留。配置存入 `server/cache/settings.json`。设置页使用左侧分类：基础设置、UI 主题、名单导入、中奖名单、奖品设置、抽奖规则。主题页支持即时预览，点击右上角保存后刷新大屏。大屏左上角齿轮进入设置，右上角调色盘可即时切换并保存主题；无需刷新。其他配置修改后刷新大屏。多个浏览器共享结果，每次开奖均以服务端奖池为准；当前大屏不会实时同步其他浏览器的变更，建议仅一个主持人操作，其他浏览器刷新查看结果。

点击“重新抽奖”，输入本轮未到场人员序号，例如 `1,3`；其余中奖人保留。留空补抽整轮。补抽人数不足时原结果保留。

## 导入名单

先在设置 → 名单导入中点击“下载 Excel 模板”。模板包含“人员名单”和“填写说明”两张表，请替换第一张表中的示例人员并保留表头、列顺序；说明表不会被导入。模板也可通过 `/users-template.xlsx` 下载。

Excel 第一行作为标题，仅支持四列：工号、姓名、部门、照片 URL（可选）。工号必须唯一，数值工号与同内容文本工号视为相同。照片须使用 http/https URL；额外非空列将被拒绝。

支持网页上传 Excel、Tab 分隔文本粘贴、重读 `server/data/users.xlsx`。已有中奖结果时，需要先导出、重置，然后更换名单。导入后刷新大屏。

结果由 `/results.xlsx` 直接下载，不在构建目录中生成临时 Excel。备份 `server/cache/` 即可保留状态。

## 可选访问口令

设置 `LOTTERY_PASSWORD` 可为整个站点启用 HTTP Basic 登录（用户名任意）。当前服务未设置口令。可通过 `systemctl --user edit moshang-lottery` 添加：

```ini
[Service]
Environment=LOTTERY_PASSWORD=你的口令
```

保存后重启服务。普通 HTTP 不加密密码；需要加密连接时应另行配置 HTTPS。

## Docker

```bash
docker compose up -d --build
```

多阶段构建，端口一致为 8888，人员文件与状态目录持久化。此次实际运行使用本机 Node/systemd，未构建 Docker 镜像。

## 验证

`npm test`：唯一工号、奖池耗尽、余量限制、补抽失败不改结果、跨奖项排除、旧概率配置无效与第五列拒绝。

`npm run build`：Vite 生产构建。Three.js 通过 npm 依赖构建，主场景默认使用 WebGL2 实例化渲染；只有 TWEEN 仍以原有全局脚本加载。渲染架构和测试方法见 [RENDERING.md](RENDERING.md)。

完整浏览器冒烟脚本见 `scripts/smoke-test.cjs`，需要 Playwright 和 Chromium；使用临时状态目录及 18888 端口，不改变正在运行活动的名单/中奖结果。

上游逐条对照见 [UPSTREAM-REVIEW.md](UPSTREAM-REVIEW.md)。Windows exe 打包、Vue 3 重写、自定义背景图片、移动端完整专项适配未交付；历史咨询/授权/推广 issue 已归档。

本次 npm audit 未完成：镜像源不提供审计接口，官方接口返回包树错误；不宣称已通过漏洞审计。
