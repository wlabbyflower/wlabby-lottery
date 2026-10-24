# LPK 1.0.7：旧数据清空与结果留档

应用 `lottery`，包 ID `abby.lzcapp.lottery`，版本 1.0.7，linux/amd64，LPK v2，未签名。

产物：`artifacts/abby.lzcapp.lottery-1.0.7-amd64.lpk`；大小 9,509,888 字节。
SHA-256：`0fe14cd22986243cf8c928c468ca9d3eeb8938b15425496df4685451612abdd2`。

## 使用方式

正常刷新、重启和隔天访问保留名单、奖品与结果。需要查看前次结果时，进入中奖名单查看或导出 Excel。

- 名单导入：清空人员名单，保留奖品和主题。
- 中奖名单：清空中奖及未到场记录，保留人员、奖品和主题，可以重新抽奖。
- 奖品设置：清空全部奖品及每轮数量，保留人员和主题。
- 数据管理：下载人员 Excel、中奖 Excel 或完整 JSON 留档；清空整场会删除人员、奖品、中奖及未到场记录，保留活动标题与主题。

有中奖记录时，单独清空人员或奖品会被拒绝，先导出并清空结果，或使用清空整场。清空前有范围说明、下载和取消入口，确认后立即保存。清空之后保持空白，刷新或重启不会重新载入示例。大屏未配置时显示提示，不允许开奖。完整 JSON 仅供留档，当前没有 JSON 备份恢复入口。

## 验证

Vite 构建、7 项核心单元测试通过。浏览器回归覆盖备份内容、清空取消、确认范围校验、已有中奖记录保护、三类独立清空、空奖品设置保存、整场清空、空白大屏及重启后不恢复默认数据；既有开奖、补抽、跨奖项不重复、结果导出及导航回归保留。

本机服务更新时比较了重启前后的完整活动快照，确认现有数据未改变。清空测试使用独立临时目录。包元数据扁平字符串检查和 LPK lint 通过，本版本未在微服实际安装验证。

```bash
lzc-cli project release -o artifacts/abby.lzcapp.lottery-1.0.7-amd64.lpk
python3 scripts/check-lpk-metadata.py artifacts/abby.lzcapp.lottery-1.0.7-amd64.lpk
lzc-cli lpk lint artifacts/abby.lzcapp.lottery-1.0.7-amd64.lpk
```
