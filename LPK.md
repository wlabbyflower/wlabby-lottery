# lottery LPK 交付

本仓库使用已完成的 LOG1997/log-lottery 年份修复成品。上游来源与 MIT 许可证保留。本次仅变更 LPK 标识、启动器名称与交付说明，保留现有年份功能、其他界面与逻辑。

| 项目 | 值 |
|---|---|
| 包 ID | `abby.lzcapp.lottery` |
| 启动器名称 | `lottery` |
| LPK 版本 | `2.0.1` |
| 原成品 LPK 版本 | `0.6.1`（原 ID `cloud.lazycat.app.loglottery`） |
| 最低系统 | lzcos 1.5.0 |
| LPK 格式 | v2，未签名 |
| 本地产物 | `artifacts/abby.lzcapp.lottery-2.0.1.lpk` |
| 大小 | 11,843,072 字节（11.29 MiB） |
| SHA-256 | `af284484aa38f58531157062568a4d98df6a417f4323d9fa8e775eeb90201dd2` |

LPK 版本使用 2.0.1，是为高于该包 ID 在本仓库此前交付的 2.0.0；没有修改前端 package.json 中的上游版本或添加功能。

下载：[lottery 2.0.1 LPK](releases/abby.lzcapp.lottery-2.0.1.lpk) · [SHA-256](releases/abby.lzcapp.lottery-2.0.1.lpk.sha256)。

## 使用

安装后打开应用，在「全局配置 → 界面配置 → 图案设置」使用已有的年份功能：输入 1000～9999 年，添加、切换或删除常用年份。配置、名单、素材与结果依然保存在当前浏览器，数据行为沿用成品。

网页子域名 `log-lottery`、路由 `/log-lottery/`、设置路由和服务程序保持原样。当前运行中的微服应用没有重新安装或迁移数据。

## 验证

此次直接重新打包已完成的 0.6.1 内容，没有重新生成网页资源。新旧两个 LPK 中的全部 45 个文件逐一比较 SHA-256，内容完全一致；271 个源文件、测试及构建文件的摘要未变。`lpk lint` 无警告，本地化值类型、包 ID 和版本检查通过；既有 19 项测试通过。

基于以下 Registry 镜像运行：`registry.lazycat.cloud/abby/library/node:8084dbd2076b7ba6`。安装时需要微服可获取该固定镜像。

## 从源码构建

需要 Node.js 22+、pnpm 10.26.1 和 lzc-cli 2.0.9+。

```bash
pnpm install --frozen-lockfile --ignore-scripts
pnpm exec vitest run
mkdir -p artifacts
lzc-cli project release -o artifacts/abby.lzcapp.lottery-2.0.1.lpk
lzc-cli lpk info artifacts/abby.lzcapp.lottery-2.0.1.lpk
lzc-cli lpk lint artifacts/abby.lzcapp.lottery-2.0.1.lpk
```

默认构建配置 `lzc-build.yml` 会构建网页并准备 `lpk/content`。源码包含文件选择器注入脚本，生成的网页内容和临时打包目录不提交到 Git；本次交付的 LPK 和校验文件单独收录在 `releases/`，便于从 GitHub 直接下载。重新构建会重新生成资源和归档，SHA-256 不要求与本次直接改名的包相同。

安装命令：

```bash
lzc-cli lpk install artifacts/abby.lzcapp.lottery-2.0.1.lpk
```

若需排查安装包标识，先运行 `lzc-cli lpk info`；若网页资源加载异常，可查看 `lzc-cli project info --release` 和 `lzc-cli project log --release`。本次未实现其他待审优化项。
