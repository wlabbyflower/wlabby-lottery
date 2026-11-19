# lottery LPK 交付

当前版本为 **2.0.2**，基于 LOG1997/log-lottery 及已完成的年份功能，修复图片管理中本地、网盘文件选择器被上传弹窗遮挡的问题。来源与 MIT 许可证保留，年份与抽奖逻辑不变。

| 项目 | 值 |
|---|---|
| 包 ID | `abby.lzcapp.lottery` |
| 启动器名称 | `lottery` |
| LPK 版本 | `2.0.2` |
| 最低系统 | lzcos 1.5.0 |
| LPK 格式 | v2，未签名 |
| 本地产物 | `artifacts/abby.lzcapp.lottery-2.0.2.lpk` |
| 大小 | 11,883,520 字节（11.33 MiB） |
| SHA-256 | `d4e3a08ffbedd6b3067bd51b5c901837b9a0605aff515fdaf76550b3f1d68caf` |

下载：[LPK 2.0.2](releases/abby.lzcapp.lottery-2.0.2.lpk) · [SHA-256](releases/abby.lzcapp.lottery-2.0.2.lpk.sha256)。完整更新记录见 [CHANGELOG.md](CHANGELOG.md)。

## 使用与修复

在「图片管理 → 上传」选择图片。文件选择器现在通过原生模态 dialog 进入浏览器顶层，本地文件与网盘按钮可以正常点击。选择完成后显示预览，点击确认后加入图片列表；刷新保留已存图片。

取消文件选择会保留原上传窗口；可以重试。移除已选文件后可以再次选择同一文件。点击已经选好的预览不会重复打开选择器。每次重新打开上传窗口清空上一次的临时选择。

年份仍在「全局配置 → 界面配置 → 图案设置」中设置 1000～9999 年。网页子域名 `log-lottery`、路由 `/log-lottery/` 及浏览器数据存储方式保持不变。配置、名单、素材和结果依然保存在当前浏览器。

## 验证

- `pnpm exec vitest run`：19 项现有测试通过。
- `tests/upload-browser.cjs`：实际 Chromium 操作原生模态窗口与文件输入，覆盖取消重试、本地选择、同文件重选、禁用预览点击、网盘空选择、共享文件 Owner 桥接、预览、确认保存和 IndexedDB 刷新恢复，以及非模态上传入口。
- 网盘测试模拟选择器服务返回及 WebDAV 文件响应；未人工操作用户私人网盘。浏览器模态、原生本地文件选择、Blob、应用上传与数据库保存均真实运行。
- `tests/year-browser.cjs`：年份添加、切换、刷新、非法输入、旧图案兼容和首页渲染回归通过。
- 独立微服测试应用健康运行，图片/年份页面路由返回正常，确认安装后的脚本包含模态层修复、禁用输入和空选择保护。测试应用与正式活动使用不同包 ID。
- LPK 元数据、本地化字符串及归档中的修复脚本已核对，`lpk lint` 无警告。

## 从源码构建

需要 Node.js 22+、pnpm 10.26.1 和 lzc-cli 2.0.9+。

```bash
pnpm install --frozen-lockfile --ignore-scripts
pnpm exec vitest run
mkdir -p artifacts
lzc-cli project release -o artifacts/abby.lzcapp.lottery-2.0.2.lpk
lzc-cli lpk info artifacts/abby.lzcapp.lottery-2.0.2.lpk
lzc-cli lpk lint artifacts/abby.lzcapp.lottery-2.0.2.lpk
```

浏览器上传回归需要 Playwright 与 Chromium，可设置 `PLAYWRIGHT_MODULE` 和 `CHROMIUM_PATH` 后执行 `node tests/upload-browser.cjs`；脚本自行在 18136 端口启动临时服务，使用新的浏览器上下文，不清空正式活动数据。

运行镜像固定为 `registry.lazycat.cloud/abby/library/node:8084dbd2076b7ba6`；安装时微服需能获取该镜像。源码包含文件选择器注入脚本，临时资源位于忽略的 `lpk/content` 和 `artifacts`，发布包与校验文件在 `releases/`。

## 安装与排查

```bash
lzc-cli lpk install releases/abby.lzcapp.lottery-2.0.2.lpk
```

安装后刷新或关闭再重新打开应用，确保浏览器加载新版本。若仍显示旧选择器，可先通过 `lzc-cli lpk info` 核对安装包版本；通过 `lzc-cli project info --release` 和 `lzc-cli project log --release` 检查服务。不要通过清除浏览器站点数据排查，否则会影响当前浏览器中的活动数据。

## 2.0.1 历史交付

2.0.1 是将另一会话已完成的 0.6.1 成品重新命名为 `abby.lzcapp.lottery` 的版本；当时 45 个包内文件内容保持一致。2.0.2 在该基础上实施本次上传修复，已不属于仅改名的包。旧版产物保留在 `releases/` 便于回溯。
