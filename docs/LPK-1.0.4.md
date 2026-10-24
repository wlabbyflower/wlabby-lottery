# LPK 1.0.4：奖品栏收起与 Excel 名单模板

- 应用名称：`lottery`，包 ID：`abby.lzcapp.lottery`，版本：`1.0.4`。
- 平台：linux/amd64；最低系统 1.6.0；LPK v2，未签名。
- 产物：`artifacts/abby.lzcapp.lottery-1.0.4-amd64.lpk`，9,506,304 字节。
- SHA-256：`b653e4f3de141f77cc3a33b772af2ca1e5ff69a9544ab3119d79f47e6a159ecb`。

## 改动

奖品列表标题新增收起/展开按钮，抽奖中也可操作；选择保存在当前浏览器本地。收起后保留顶部当前奖项说明，开奖与补抽刷新奖品列表不会重置收起状态。

设置 → 名单导入新增“下载 Excel 模板”，下载地址 `/users-template.xlsx`。模板包含“人员名单”及“填写说明”工作表：第一张表依次是工号、姓名、部门、照片 URL、权重，并包含两行可替换的示例人员；工号示例保留文本前导零。导入只读取第一张表。

构建改为 `lzc-build.yml` 中 `images.lottery.builder: local`，通过本机 Docker 构建并由 CLI 内嵌打包，当前未连接微服也可完成构建。基础镜像继续使用已固定的懒猫 Registry 引用。构建中发现 body-parser 的压缩请求处理漏洞，已将锁定版本从 1.20.8 更新至 1.20.9；最终构建依赖审计未报告漏洞。

## 验证

- Vite 生产构建和 7 项核心抽奖测试通过。
- 浏览器实际下载模板、解析表头及前导零工号，并将下载的文件从页面上传；成功导入两行示例，说明表未被导入。测试使用独立临时数据，不改变正在运行活动。
- 已验证抽奖中收起/展开、开奖后保持收起、刷新后保持选择、收起后当前奖项提示仍显示。
- 原有开奖、补抽、持久化、导出、主题、设置导航和 WebGL 流程回归通过。
- 产物的包 ID、名称、版本与 amd64 架构已检查；元数据字符串类型检查和 `lzc-cli lpk lint` 通过。
- 未在微服安装本版本，保留已安装应用的数据与运行状态。

```bash
lzc-cli project release -o artifacts/abby.lzcapp.lottery-1.0.4-amd64.lpk
lzc-cli lpk install artifacts/abby.lzcapp.lottery-1.0.4-amd64.lpk --apk n
```
