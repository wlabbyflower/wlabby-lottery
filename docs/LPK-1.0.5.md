# LPK 1.0.5：清晰预览、公平抽样与结果汇总

- 应用：`lottery`；包 ID：`abby.lzcapp.lottery`；平台 linux/amd64；最低系统 1.6.0。
- 产物：`artifacts/abby.lzcapp.lottery-1.0.5-amd64.lpk`，9,507,840 字节，LPK v2，未签名。
- SHA-256：`c60efd84fd90487ef930f611c6b4047d7186a3bbddc909646ec87eeeefae9ebe`。

四套明亮主题、大字号 12 人预览、可翻页暂停、119 卡片可拖动缩放球体。删除权重、定向及重复参与；服务端整场排除已中奖人员，采用等概率无放回抽样。Excel 模板只有四列。全部抽完后底部提供“查看抽奖结果”，按奖项列出人员和奖品，刷新后仍能查看并导出。

## 验证

- Vite 生产构建、7 项抽样规则单元测试通过。
- WebGL2 和禁用 WebGL 的兼容模式均完成浏览器流程：模板下载及上传、四列检查、概率配置拒绝、大字号预览及分页、奖品栏收起、开奖、补抽、跨奖项不重复、最终结果汇总、刷新后查看、导出、四套主题与手机无横向溢出。
- WebGL2 验证 119 个实例、1 次绘制调用、鼠标拖动和滚轮缩放、隐藏页面暂停、上下文恢复。自动化使用 SwiftShader，不代表实机 GPU 帧率测试。
- 包元数据扁平字符串检查和 `lzc-cli lpk lint` 通过，`lpk info` 确认包 ID、版本及内嵌镜像。
- 本机服务已更新并监听 `0.0.0.0:8888`；健康检查通过，保留现有活动数据。本版未在微服实际安装验证。

```bash
lzc-cli project release -o artifacts/abby.lzcapp.lottery-1.0.5-amd64.lpk
python3 scripts/check-lpk-metadata.py artifacts/abby.lzcapp.lottery-1.0.5-amd64.lpk
lzc-cli lpk lint artifacts/abby.lzcapp.lottery-1.0.5-amd64.lpk
```

设计对照了 [原项目](https://github.com/moshang-ax/lottery) 的人员名牌和 [log-lottery](https://github.com/LOG1997/log-lottery) 的可配置展示，未复制其实现。完整变更见 [更新日志](../CHANGELOG.md)，抽样规则见 [公平性说明](FAIRNESS.md)。
