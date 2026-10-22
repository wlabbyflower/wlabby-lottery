# LPK 1.0.3：WebGL 渲染与卡顿优化

- 应用名称：`lottery`。
- 包 ID：`abby.lzcapp.lottery`。
- 版本：`1.0.3`，平台 linux/amd64，最低系统 1.6.0。
- 产物：`artifacts/abby.lzcapp.lottery-1.0.3-amd64.lpk`，9,512,448 字节。
- SHA-256：`61eaddc447910d1edae18b0df87907b37c0753598f9a905cbd80ec5ec1907a05`。

构建使用正式 `lzc-build.yml`、`embed:lottery` 应用镜像及已固定的懒猫 Registry 基础镜像。

验证：生产构建、7 项服务端规则测试、WebGL2 和禁用 WebGL 的两套浏览器流程均通过；LPK 元数据类型检查及 `lzc-cli lpk lint` 均通过。浏览器测试包括开奖、单人补抽、刷新持久化、导出、四套主题、设置导航、搜索、移动端布局，WebGL 额外验证了 2 次绘制调用、纹理稳定、隐藏暂停、上下文恢复及 803 张卡片场景。

图形测试使用 Chromium 软件 WebGL 渲染器，证明 WebGL 渲染路径可用，不等同于真实显卡性能测试。客户端可从右侧渲染状态及 `window.lotteryRenderInfo()` 确认实际渲染器。详见 [渲染说明](RENDERING.md)。

本次只构建新包，未覆盖微服上的已安装应用。应用 ID 和持久目录保持不变。

```bash
lzc-cli lpk install artifacts/abby.lzcapp.lottery-1.0.3-amd64.lpk --apk n
```
