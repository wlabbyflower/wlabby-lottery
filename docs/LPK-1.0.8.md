# LPK 1.0.8：原版大屏与年份、背景设置

应用名称 `lottery`，包 ID `abby.lzcapp.lottery`，版本 `1.0.8`，目标 `linux/amd64`，LPK v2，未签名，要求 `lzcos >= 1.6.0`。

安装包：`artifacts/abby.lzcapp.lottery-1.0.8-amd64.lpk`，9,517,568 字节（9.08 MiB）。SHA-256：`2f1e5425cc95cebc397d50725f7a15f860c9f9775720cd7ad20f1886b47a08cd`。

## 使用

1. 在微服升级安装 1.0.8，原有名单、奖品和中奖结果保留；包 ID 与持久化目录不变。
2. 打开设置页 `/admin.html#appearance`，在「年份与背景」填写四位年份，初次使用默认当前年份。
3. 选择「原版星空」「自定义图片」或「纯色背景」。图片支持上传 5MB 以内 PNG/JPEG/WebP/GIF，也可填写 HTTP(S) 图片网址。
4. 点击右上角「保存设置」，返回或刷新大屏。年份通过橙色名牌组成数字；「进入抽奖」切换到球体。名牌轮播保留为可选视图。

上传图片直接随设置存入 `/lzcapp/var/lottery/settings.json`，不依赖原文件路径；刷新与服务重启后保留，完整 JSON 留档包含图片。图片网址依赖浏览器可以访问的网络；选择「移除自定义图片」并保存可回到星空。清空整场活动仍保留年份和背景设置。

## 对比与优化

参考上游 `master` 的年份矩阵和 CSS、`vue` 的星空及球体结构，恢复深色星空、青色名牌和橙色高亮。保留本仓库的 WebGL2 批量渲染、CSS3D 回退、后台分类、名单导入、补抽、备份与清空、服务端等概率且整场不重复中奖。

调整卡片墙与奖品栏间距，适配竖屏球体与中奖结果布局；修复 Vite 开发模式的备份、导出、清空接口代理。Vite 带内容指纹的资源启用长期缓存，名单、设置和中奖记录继续 `no-store`。页面使用本地图标，消除缺失图标请求。

[大屏预览](screenshots/1.0.8-screen.png) · [后台设置](screenshots/1.0.8-settings.png) · [手机球体](screenshots/1.0.8-mobile.png)

## 构建与验证

```bash
npm run install:all
npm test
npm run build
mkdir -p artifacts
lzc-cli project release -o artifacts/abby.lzcapp.lottery-1.0.8-amd64.lpk
lzc-cli lpk info artifacts/abby.lzcapp.lottery-1.0.8-amd64.lpk
lzc-cli lpk lint artifacts/abby.lzcapp.lottery-1.0.8-amd64.lpk
python3 scripts/check-lpk-metadata.py artifacts/abby.lzcapp.lottery-1.0.8-amd64.lpk
```

- 9 项单元测试通过，包括旧客户端保留外观配置、年份/背景校验和原有公平抽奖规则。
- 浏览器回归分别以 WebGL2 和禁用 WebGL 的 CSS3D 模式通过：年份墙、名牌轮播、球体、导入、开奖、补抽、跨奖项不重复、最终结果、Excel 导出、主题和手机布局；新增图片上传、重新加载、移除、纯色背景、清空后重启仍保留年份与图片。
- Docker 镜像通过 UID/GID 1000 非 root 启动、静态页面、代理 HTTPS Origin、外站写入拒绝、开奖及重启持久化验证。
- LPK 元数据检查通过，`lpk lint` 无警告。正式包的 `images.lock` 与 manifest 的 embed 摘要一致；镜像上游固定为 `registry.lazycat.cloud/abby/library/node@sha256:8084dbd2076b7ba645faa7a06923eda7e2b51f02673c109628d4a16b587ab389`，6 层应用镜像内嵌，5 层基础镜像通过 Registry 获取。

微服实测使用独立包 ID `abby.lzcapp.lottery.verify108`，与正式包使用相同镜像 ID `sha256:058c17ad71f2b2f6c476679b332e4bad030290d21195945ef86ca32002b48428`。`project info` 确认 1.0.8、`Current version deployed: yes`、`Project app is running.`、容器 healthy；验证健康接口、设置页、年份和上传背景落盘、开奖保存及数据目录文件属主 UID 1000。测试完成后卸载测试应用并删除测试数据，原应用仍为 1.0.7、暂停状态，未替换或修改原活动。微服客户端中的文件选择器交互未做人工实测。

构建 CLI 仍会提示 `application.run_as` 未知字段，但官方规范已支持该字段（1.6.0+）；按规范保留并在最低系统版本中声明。

服务端生产依赖审计为 0 个已知漏洞。构建工具的 picomatch 4.0.7 有 [GHSA-fc5q-39xc-vjpf](https://github.com/advisories/GHSA-fc5q-39xc-vjpf) 告警，截至本次构建没有修复版本；它仅存在于前端构建阶段，不进入生产服务镜像。本次没有强制降级 Vite 或伪报全量依赖审计通过。

## 安装与排查

```bash
lzc-cli box list
lzc-cli lpk install artifacts/abby.lzcapp.lottery-1.0.8-amd64.lpk
lzc-cli project info --release
```

如果仍显示旧 UI，先确认安装版本，再刷新页面。如果背景图无法加载，检查图片网址是否可从浏览器直接打开，或改为本地上传。年份无效、图片超限或格式错误时，设置页会提示且不保存。完整 JSON 备份目前仅供留档，没有恢复入口。
