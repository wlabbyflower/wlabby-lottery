# LPK 1.0.2：调整应用名称与包 ID

- 应用名称（默认、中文、英文）：`lottery`。
- 应用 ID：`abby.lzcapp.lottery`。
- 版本：`1.0.2`；平台 linux/amd64，最低系统 1.6.0。
- 产物：`artifacts/abby.lzcapp.lottery-1.0.2-amd64.lpk`，9,528,832 字节。
- SHA-256：`6b026d5c8a798ca5e9ad22a3b6a613d51270f8253df56c7c03dbfeb1ce91846b`。

已重新通过 `lzc-cli project release` 构建，核对最终包内默认及各语言名称、包 ID，翻译类型检查与 `lzc-cli lpk lint` 均通过。应用镜像与已安装验证的 1.0.1 相同。

本次未安装新 ID 的应用。旧 `cloud.lazycat.app.wlabby.lottery` 的数据不会自动迁移至新 ID；如微服已有 `abby.lzcapp.lottery`，安装包会针对这个 ID 进行安装或升级。

```bash
lzc-cli lpk install artifacts/abby.lzcapp.lottery-1.0.2-amd64.lpk --apk n
```
