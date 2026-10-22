# LPK 1.0.0 构建记录

- 构建日期：2026-10-22。
- 应用 ID：`cloud.lazycat.app.wlabby.lottery`。
- 版本：`1.0.0`。
- 平台：`linux/amd64`，要求微服系统 `lzcos >= 1.6.0`。
- 格式：tar / LPK v2；当前未签名，未提交应用商店。
- 本机产物：`artifacts/wlabby-lottery-1.0.0-amd64.lpk`。
- 文件大小：9,528,832 字节（9.09 MiB）。
- SHA-256：`b78a1671a9573fe5bc0c828dc047c567b5b460fb933680cf717798b71a253e39`。

## 构建

使用 `lzc-cli 2.0.9`，读取根目录 `lzc-build.yml`；CLI 使用当前已配置微服执行远端镜像构建，没有安装或替换微服上现有应用。

```bash
lzc-cli project release -o artifacts/wlabby-lottery-1.0.0-amd64.lpk
lzc-cli lpk info artifacts/wlabby-lottery-1.0.0-amd64.lpk
lzc-cli lpk lint artifacts/wlabby-lottery-1.0.0-amd64.lpk
```

应用镜像通过 `embed:lottery` 内嵌，自定义层 8.81 MiB。基础镜像固定为：

```text
registry.lazycat.cloud/abby/library/node:8084dbd2076b7ba6@sha256:8084dbd2076b7ba645faa7a06923eda7e2b51f02673c109628d4a16b587ab389
```

首次安装仍须能从懒猫 Registry 获取基础层。本包不是完全离线镜像包。

## 验证结果

- `lzc-cli lpk info` 确认 v2、应用 ID、版本和一份内嵌镜像。
- `lzc-cli lpk lint`：无警告。
- 归档扫描确认没有打入开发机 `state.json`、`settings.json` 或 `.env`。
- `npm test`：7 项核心规则测试通过；`npm run build`：生产构建通过。
- 相同源码的 Docker 镜像完成非 root 启动、设置页加载、HTTPS 代理 Origin 放行、外站 Origin 拒绝、开奖及重启后结果/主题持久化验证。脚本：`scripts/container-smoke.py`，运行前执行 `docker build -t wlabby-lottery:verify .`。
- 此次未在微服实际安装，不宣称完成微服端文件选择器与端到端安装实测。

构建器曾提示 `application.run_as` 是未知字段；官方当前 manifest 规范已支持该字段（系统 1.6.0+），因此按规范保留并声明最低系统版本。非 root 权限和持久目录写入已在本地容器中验证。

## 安装

```bash
lzc-cli box list
lzc-cli lpk install artifacts/wlabby-lottery-1.0.0-amd64.lpk
```

先确认当前选择的目标微服，安装后在启动器打开「星际抽奖」，导入正式名单再使用。数据保存在 `/lzcapp/var/lottery/`。
