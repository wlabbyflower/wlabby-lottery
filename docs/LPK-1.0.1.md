# LPK 1.0.1：修复安装元数据解析失败

## 问题与修复

1.0.0 在 `package.yml.locales` 中使用了嵌套 `entries → settings → title` 对象。微服安装端要求每种语言的翻译值都是字符串，因此报错 `cannot unmarshal !!map into string`。源文件重新序列化后，对应包内第 21、37 行。

1.0.1 改为官方多入口示例的扁平键：

```yml
locales:
  zh-CN:
    entries.settings.title: 活动设置
  en-US:
    entries.settings.title: Event settings
```

此版只修改包版本与本地化元数据，复用上一版相同的应用镜像；不改变应用 ID 或持久数据目录。

## 产物

- 文件：`artifacts/wlabby-lottery-1.0.1-amd64.lpk`。
- 应用 ID：`cloud.lazycat.app.wlabby.lottery`。
- 格式：LPK v2，linux/amd64，最低系统 1.6.0，未签名。
- 大小：9,528,832 字节。
- SHA-256：`fd36e2d725a99477e1c0e06478f679b7981cfbdba63a7659de198d707942eedf`。

## 检查与安装

```bash
# 类型校验脚本依赖 PyYAML（python3 -m pip install PyYAML）。
python3 scripts/check-lpk-metadata.py
lzc-cli project release -o artifacts/wlabby-lottery-1.0.1-amd64.lpk
python3 scripts/check-lpk-metadata.py artifacts/wlabby-lottery-1.0.1-amd64.lpk
lzc-cli lpk lint artifacts/wlabby-lottery-1.0.1-amd64.lpk
lzc-cli lpk install artifacts/wlabby-lottery-1.0.1-amd64.lpk --apk n
lzc-cli project info --release
```

2026-10-22 验证：

- 新增类型检查能够拒绝旧版 1.0.0 包，识别两个嵌套 `entries` 对象；源码和 1.0.1 包均通过。
- `lzc-cli lpk lint` 无警告。此前单独的 lint 不包含足够严格的安装端翻译类型校验，不能代替实际安装。
- 已在当前微服实际安装成功；`project info --release` 显示 `Deployed version: 1.0.1`、`Status_Running`、容器 `healthy`。
- 未登录访问应用域名返回平台登录跳转，未绕过微服鉴权。

请使用 1.0.1，不再安装 1.0.0。后续若出现新问题，先保留原始错误并检查 `lzc-cli project info --release` 和 `lzc-cli project log --release -f false --tail 50`，不要通过重置数据排查安装问题。
