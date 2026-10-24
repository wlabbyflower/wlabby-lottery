# 上游 PR / issue 对照记录

来源：https://github.com/moshang-ax/lottery/tree/master

审阅基线：master f925d8a；抓取日期：2026-10-22。公开 issue 列表共 72 条，PR 引用中额外发现 #55（权重抽取）。

这是本地整合记录，没有向上游发评论、关闭 issue 或执行 GitHub 合并。冲突方案采用等价实现，未盲目 cherry-pick。原始列表见 upstream/issues.json，PR diff 保存在 upstream/。部分历史评论接口受到 GitHub 匿名速率限制，未能读取全部评论。

| 编号 | 类型/状态 | 标题 | 本地处理 |
|---|---|---|---|
| [#74](https://github.com/moshang-ax/lottery/pull/74) | PR / open | 修复抽取多人时撒花卡顿问题 | 已整合：所有中奖卡片动画结束后统一添加特效。 |
| [#73](https://github.com/moshang-ax/lottery/issues/73) | issue / open | 有概率抽出的卡片会倾斜，样式不对，偶现问题 | 已修复：切换动画取消重叠 tween，开奖时固定相机朝向、场景旋转并禁用拖动。 |
| [#72](https://github.com/moshang-ax/lottery/pull/72) | PR / closed | Lot | 未采纳：已关闭且未合并，仅 README 空行及脚本注释改动，不包含功能修复。 |
| [#71](https://github.com/moshang-ax/lottery/issues/71) | issue / open | 为什么抽奖人数重复 | 已修复：服务端唯一工号奖池，始终排除整场已中奖人，按剩余奖品/人数限制本轮数量；补抽原中奖人记为未到场。 |
| [#69](https://github.com/moshang-ax/lottery/issues/69) | issue / open | 已抽取人员可以继续参与抽取吗 | 已实现：网页设置“已中奖人员可参与后续抽奖”，默认关闭，同轮保持唯一。 |
| [#68](https://github.com/moshang-ax/lottery/issues/68) | issue / closed | 声明使用抽奖代码 | 已记录：授权声明、使用咨询、交流群或非功能讨论，不对应可合并代码。Vue 3 重写及移动端专项适配不在本次交付中。 |
| [#67](https://github.com/moshang-ax/lottery/issues/67) | issue / open | 是否支持内定 | 1.0.5 按用户要求移除定向抽样，仅保留等概率抽取。 |
| [#66](https://github.com/moshang-ax/lottery/issues/66) | issue / open | 声明使用您的开源抽奖代码lottery | 已记录：授权声明、使用咨询、交流群或非功能讨论，不对应可合并代码。Vue 3 重写及移动端专项适配不在本次交付中。 |
| [#65](https://github.com/moshang-ax/lottery/issues/65) | issue / closed | vue3项目可以使用吗 | 已记录：授权声明、使用咨询、交流群或非功能讨论，不对应可合并代码。Vue 3 重写及移动端专项适配不在本次交付中。 |
| [#64](https://github.com/moshang-ax/lottery/issues/64) | issue / closed |  **来自印度的合作伙伴关系** | 已记录：授权声明、使用咨询、交流群或非功能讨论，不对应可合并代码。Vue 3 重写及移动端专项适配不在本次交付中。 |
| [#63](https://github.com/moshang-ax/lottery/pull/63) | PR / closed | 修正文档错误 | 已修订：新增根目录 build/start 脚本和准确安装步骤，替代旧文档目录切换。 |
| [#62](https://github.com/moshang-ax/lottery/issues/62) | issue / open | lottery使用说明 | 已记录：授权声明、使用咨询、交流群或非功能讨论，不对应可合并代码。Vue 3 重写及移动端专项适配不在本次交付中。 |
| [#61](https://github.com/moshang-ax/lottery/issues/61) | issue / open | run serve报错，如图 | 已修复部署路径：移除自动打开浏览器、绑定 0.0.0.0、固定静态资源路径；本机 systemd 启动。 |
| [#60](https://github.com/moshang-ax/lottery/issues/60) | issue / open | 数据获取问题 | 已修复：单次请求取得配置/人员/历史结果，按顺序初始化；启动时同步读入持久状态。 |
| [#59](https://github.com/moshang-ax/lottery/issues/59) | issue / open | 背景颜色怎么更换 | 已实现：网页设置背景颜色，保留星空效果；自定义背景图片未实现。 |
| [#58](https://github.com/moshang-ax/lottery/issues/58) | issue / open | 建了一个项目交流群，欢迎大家进群交流抽奖算法问题 | 已记录：授权声明、使用咨询、交流群或非功能讨论，不对应可合并代码。Vue 3 重写及移动端专项适配不在本次交付中。 |
| [#57](https://github.com/moshang-ax/lottery/issues/57) | issue / open | 这个特别奖不好改啊，必须得有特别奖啊 | 已实现：删除特别奖硬编码，任意奖项 type/数量/名称可配置，支持删除、增加、多轮及滚动。 |
| [#56](https://github.com/moshang-ax/lottery/issues/56) | issue / open | 想重新加载抽奖名单必须重新启动服务，有没有比较方便的修改方式？ | 已实现：网页 Excel 导入、粘贴名单、重读服务器文件，无需重启；已有结果时必须先导出并重置。 |
| [#54](https://github.com/moshang-ax/lottery/issues/54) | issue / closed | 抽奖函数的问题 | 已修复：服务端唯一工号奖池，始终排除整场已中奖人，按剩余奖品/人数限制本轮数量；补抽原中奖人记为未到场。 |
| [#53](https://github.com/moshang-ax/lottery/issues/53) | issue / closed | Error when start run server | 已修复部署路径：移除自动打开浏览器、绑定 0.0.0.0、固定静态资源路径；本机 systemd 启动。 |
| [#52](https://github.com/moshang-ax/lottery/issues/52) | issue / closed | 人员未到场 | 已实现：选择本轮未到场人员序号，仅补抽这些人，保留其他中奖结果。 |
| [#51](https://github.com/moshang-ax/lottery/issues/51) | issue / closed | 主页如何改为2024 | 已实现：可配置汉字/数字高亮，默认“幸运抽奖”，留空自动当年；中奖卡片按行自适应布局。 |
| [#50](https://github.com/moshang-ax/lottery/issues/50) | issue / closed | 重复中奖 | 已修复：服务端唯一工号奖池，始终排除整场已中奖人，按剩余奖品/人数限制本轮数量；补抽原中奖人记为未到场。 |
| [#49](https://github.com/moshang-ax/lottery/pull/49) | PR / open | feat: migrate to Vite, support Node LTS (v18) | 已整合目标：采用 Vite 7 + Node 22；Webpack 5 方案由 Vite 替代，保留现有奖项与品牌，不引入 PR 内的私人配置。 |
| [#48](https://github.com/moshang-ax/lottery/issues/48) | issue / closed | 一直有重复人员啊 | 已修复：服务端唯一工号奖池，始终排除整场已中奖人，按剩余奖品/人数限制本轮数量；补抽原中奖人记为未到场。 |
| [#47](https://github.com/moshang-ax/lottery/issues/47) | issue / closed | TypeError: Cannot read properties of undefined (reading 'parse') | 已修复：采用 node-xlsx 的 CommonJS parse/build 导出，移除旧 default 引用。 |
| [#46](https://github.com/moshang-ax/lottery/issues/46) | issue / open | 可以按照人员顺序设置抽奖概率吗 | 1.0.5 按用户要求移除权重，仅保留等概率抽取；拒绝第五列概率数据。 |
| [#45](https://github.com/moshang-ax/lottery/pull/45) | PR / closed | 增加.dockerignore文件，优化docker构建过程显著减少镜像大小 | 已整合目标：多阶段 Dockerfile、本地构建 Compose、数据持久化、精简构建上下文。Docker 镜像未在本次启动中构建。 |
| [#44](https://github.com/moshang-ax/lottery/issues/44) | issue / open | 抽奖人员信息Excel 如何一键导入，可以通过界面操作吗 | 已实现：网页 Excel 导入、粘贴名单、重读服务器文件，无需重启；已有结果时必须先导出并重置。 |
| [#43](https://github.com/moshang-ax/lottery/issues/43) | issue / closed | bug | 已实现：删除特别奖硬编码，任意奖项 type/数量/名称可配置，支持删除、增加、多轮及滚动。 |
| [#42](https://github.com/moshang-ax/lottery/issues/42) | issue / open | 人员highlight，可以改成文字吗，如生日快乐 | 已实现：可配置汉字/数字高亮，默认“幸运抽奖”，留空自动当年；中奖卡片按行自适应布局。 |
| [#41](https://github.com/moshang-ax/lottery/issues/41) | issue / closed | 请问如何设置重新抽奖人数 | 已实现：选择本轮未到场人员序号，仅补抽这些人，保留其他中奖结果。 |
| [#40](https://github.com/moshang-ax/lottery/issues/40) | issue / closed | 如何更改主页面开始抽奖前显示的2023 | 已实现：可配置汉字/数字高亮，默认“幸运抽奖”，留空自动当年；中奖卡片按行自适应布局。 |
| [#39](https://github.com/moshang-ax/lottery/issues/39) | issue / open | 怎么在linux部署呢 | 已修复部署路径：移除自动打开浏览器、绑定 0.0.0.0、固定静态资源路径；本机 systemd 启动。 |
| [#38](https://github.com/moshang-ax/lottery/pull/38) | PR / closed | add a complete Docker deployment solution and doc | 已整合目标：多阶段 Dockerfile、本地构建 Compose、数据持久化、精简构建上下文。Docker 镜像未在本次启动中构建。 |
| [#37](https://github.com/moshang-ax/lottery/issues/37) | issue / closed | 打包不能使用 | 已修复构建路径：Vite 替代旧 Webpack，Node 22 构建已通过。 |
| [#36](https://github.com/moshang-ax/lottery/issues/36) | issue / closed | demo 里面五等奖以上的都看不到啊 | 已实现：删除特别奖硬编码，任意奖项 type/数量/名称可配置，支持删除、增加、多轮及滚动。 |
| [#35](https://github.com/moshang-ax/lottery/issues/35) | issue / closed | 请问时间怎么改成2023啊？ | 已实现：可配置汉字/数字高亮，默认“幸运抽奖”，留空自动当年；中奖卡片按行自适应布局。 |
| [#34](https://github.com/moshang-ax/lottery/issues/34) | issue / closed | 打包后运行报错 | 已修复部署路径：移除自动打开浏览器、绑定 0.0.0.0、固定静态资源路径；本机 systemd 启动。 |
| [#33](https://github.com/moshang-ax/lottery/issues/33) | issue / closed | 如何取消特别奖？ | 已实现：删除特别奖硬编码，任意奖项 type/数量/名称可配置，支持删除、增加、多轮及滚动。 |
| [#32](https://github.com/moshang-ax/lottery/issues/32) | issue / open | 希望抽中后能增加显示员工照片的功能 | 已实现：Excel 第 4 列可填写照片 URL，大屏人员卡片展示照片。 |
| [#31](https://github.com/moshang-ax/lottery/issues/31) | issue / open | Can you add cheating mode？ | 1.0.5 按用户要求移除定向抽样，仅保留等概率抽取。 |
| [#30](https://github.com/moshang-ax/lottery/pull/30) | PR / closed | 增加docker镜像，方便用docker运行程序 | 已整合目标：多阶段 Dockerfile、本地构建 Compose、数据持久化、精简构建上下文。Docker 镜像未在本次启动中构建。 |
| [#29](https://github.com/moshang-ax/lottery/issues/29) | issue / closed | 因为业务差所以没有办年会好几年了 | 已记录：授权声明、使用咨询、交流群或非功能讨论，不对应可合并代码。Vue 3 重写及移动端专项适配不在本次交付中。 |
| [#28](https://github.com/moshang-ax/lottery/issues/28) | issue / closed | 错误 | 已修复部署路径：移除自动打开浏览器、绑定 0.0.0.0、固定静态资源路径；本机 systemd 启动。 |
| [#27](https://github.com/moshang-ax/lottery/issues/27) | issue / closed | 部署运行问题 | 已修复部署路径：移除自动打开浏览器、绑定 0.0.0.0、固定静态资源路径；本机 systemd 启动。 |
| [#26](https://github.com/moshang-ax/lottery/pull/26) | PR / open | 升级项目依赖 | 已整合目标：采用 Vite 7 + Node 22；Webpack 5 方案由 Vite 替代，保留现有奖项与品牌，不引入 PR 内的私人配置。 |
| [#25](https://github.com/moshang-ax/lottery/pull/25) | PR / open | 添加奖品列表自动滚动的功能和修复一些BUG | 已整合：奖项列表滚动、剩余人数与奖品数量限制、奖池与总名单分离。 |
| [#24](https://github.com/moshang-ax/lottery/issues/24) | issue / closed | 是否可以更换背景 | 已实现：网页设置背景颜色，保留星空效果；自定义背景图片未实现。 |
| [#23](https://github.com/moshang-ax/lottery/issues/23) | issue / closed | product目录npm install失败 | 已修复构建路径：Vite 替代旧 Webpack，Node 22 构建已通过。 |
| [#22](https://github.com/moshang-ax/lottery/issues/22) | issue / closed | 能否设置抽完特等奖后就不再抽取，且每开始新奖品前都弹窗确认，抽完奖品后也加上弹窗确认 | 已修复：每轮抽取时立即写入服务器并原子替换状态文件；首次抽取新奖项确认，全部抽完阻止继续抽取。结果可直接导出。 |
| [#21](https://github.com/moshang-ax/lottery/issues/21) | issue / closed | 这个项目很棒，想要打包成.exe的桌面应用，方便拷贝使用，有没有什么好的方案推荐？ | 未实现 Windows exe 打包：本次交付 Linux 网页与 Docker 部署；可用浏览器访问，不等同于桌面安装包。 |
| [#20](https://github.com/moshang-ax/lottery/issues/20) | issue / closed | 当抽奖人数少于奖品总数的时候，出现错误 | 已修复：服务端唯一工号奖池，始终排除整场已中奖人，按剩余奖品/人数限制本轮数量；补抽原中奖人记为未到场。 |
| [#19](https://github.com/moshang-ax/lottery/issues/19) | issue / closed | 人员导入能否直接从页面导入 | 已实现：网页 Excel 导入、粘贴名单、重读服务器文件，无需重启；已有结果时必须先导出并重置。 |
| [#18](https://github.com/moshang-ax/lottery/issues/18) | issue / closed | 奖项配置能否做成页面配置 | 已实现：网页编辑奖项、总数量、每轮人数，保存后刷新大屏生效。 |
| [#17](https://github.com/moshang-ax/lottery/issues/17) | issue / closed | npm install 失败 | 已修复构建路径：Vite 替代旧 Webpack，Node 22 构建已通过。 |
| [#16](https://github.com/moshang-ax/lottery/issues/16) | issue / closed | 点击抽取按钮后如果不点击导出EXICE，直接关闭浏览器，会导致当前抽取的奖券信息丢失。 | 已修复：每轮抽取时立即写入服务器并原子替换状态文件；首次抽取新奖项确认，全部抽完阻止继续抽取。结果可直接导出。 |
| [#15](https://github.com/moshang-ax/lottery/issues/15) | issue / closed | 特别奖概率问题及少量抽奖人员抽取完毕后系统异常 | 已修复：服务端唯一工号奖池，始终排除整场已中奖人，按剩余奖品/人数限制本轮数量；补抽原中奖人记为未到场。 |
| [#14](https://github.com/moshang-ax/lottery/issues/14) | issue / closed | 安装进程卡在\product npm install | 已修复构建路径：Vite 替代旧 Webpack，Node 22 构建已通过。 |
| [#13](https://github.com/moshang-ax/lottery/issues/13) | issue / closed | 部署 | 已修复部署路径：移除自动打开浏览器、绑定 0.0.0.0、固定静态资源路径；本机 systemd 启动。 |
| [#12](https://github.com/moshang-ax/lottery/issues/12) | issue / closed | 已处理 | 已记录：授权声明、使用咨询、交流群或非功能讨论，不对应可合并代码。Vue 3 重写及移动端专项适配不在本次交付中。 |
| [#11](https://github.com/moshang-ax/lottery/pull/11) | PR / closed | Bump ini from 1.3.5 to 1.3.8 in /product | 已替代：淘汰旧 Webpack/Babel 构建依赖，重新生成 lockfile；不是把旧版本依赖降级回来。 |
| [#10](https://github.com/moshang-ax/lottery/issues/10) | issue / closed | 使用 | 已记录：授权声明、使用咨询、交流群或非功能讨论，不对应可合并代码。Vue 3 重写及移动端专项适配不在本次交付中。 |
| [#9](https://github.com/moshang-ax/lottery/issues/9) | issue / closed | 每次抽取人数bug | 已修复：服务端唯一工号奖池，始终排除整场已中奖人，按剩余奖品/人数限制本轮数量；补抽原中奖人记为未到场。 |
| [#8](https://github.com/moshang-ax/lottery/issues/8) | issue / closed | 登录拦截 | 已实现可选访问口令：环境变量 LOTTERY_PASSWORD 启用 HTTP Basic 登录；当前局域网服务未设置口令。 |
| [#7](https://github.com/moshang-ax/lottery/issues/7) | issue / closed | 抽奖建议 | 已实现：可配置汉字/数字高亮，默认“幸运抽奖”，留空自动当年；中奖卡片按行自适应布局。 |
| [#6](https://github.com/moshang-ax/lottery/pull/6) | PR / closed | Bump mixin-deep from 1.3.1 to 1.3.2 in /product | 已替代：淘汰旧 Webpack/Babel 构建依赖，重新生成 lockfile；不是把旧版本依赖降级回来。 |
| [#5](https://github.com/moshang-ax/lottery/pull/5) | PR / closed | Bump mixin-deep from 1.3.1 to 1.3.2 in /server | 已替代：淘汰旧 Webpack/Babel 构建依赖，重新生成 lockfile；不是把旧版本依赖降级回来。 |
| [#4](https://github.com/moshang-ax/lottery/pull/4) | PR / closed | Bump lodash.mergewith from 4.6.1 to 4.6.2 in /product | 已替代：淘汰旧 Webpack/Babel 构建依赖，重新生成 lockfile；不是把旧版本依赖降级回来。 |
| [#3](https://github.com/moshang-ax/lottery/pull/3) | PR / closed | Bump lodash from 4.17.11 to 4.17.15 in /product | 已替代：淘汰旧 Webpack/Babel 构建依赖，重新生成 lockfile；不是把旧版本依赖降级回来。 |
| [#2](https://github.com/moshang-ax/lottery/pull/2) | PR / closed | Bump tar from 2.2.1 to 2.2.2 in /product | 已替代：淘汰旧 Webpack/Babel 构建依赖，重新生成 lockfile；不是把旧版本依赖降级回来。 |
| [#1](https://github.com/moshang-ax/lottery/pull/1) | PR / closed | Bump fstream from 1.0.11 to 1.0.12 in /product | 已替代：淘汰旧 Webpack/Babel 构建依赖，重新生成 lockfile；不是把旧版本依赖降级回来。 |
| [#55](https://github.com/moshang-ax/lottery/pull/55) | PR 引用 | weighted selection | 曾整合，1.0.5 按用户要求删除权重抽样及第五列，改为等概率抽样。 |
