# Changelog / 版本记录

## 4.1.1

- 日志目录异步读取文件名、大小和时间，不再为分类自动读取旧日志文件头，避免该操作触发云端日志下载。
- 日志按文件名匹配；同名、改名或无法匹配的历史日志可使用“目录全部日志”。每次显示 100 条，可继续加载。主动查看仅联机文件仍可能触发对应文件下载。
- 同一会话的已开窗口默认折叠；手动展开在当前批次保留，全部关闭后重置。
- 常规增加 11–22 px 字体大小，中英文同步，列表行高与虚拟列表高度随之调整。
- 八套主题适配顶部标签栏，当前标签使用底色和边框高亮，取消当前标签横线及序号/名称间的装饰竖线。
- 保留会话、日志路径、凭据保护、主题、原生编辑、转发诊断和现有设置。
- 维护者报告本地测试通过；自动化覆盖模拟云端文件、设置、列表及八套主题，真实 OneDrive 验证来自维护者反馈。

Uses asynchronous metadata-only log listing, adds filename/all-directory browsing, collapsed window rows and adjustable sidebar font size, and refines all eight themed tab strips. Preserves existing settings and recording behavior.


## 4.1.0

- Tabby 设置入口统一命名为“会话管理套件 / Session Suite”，保留原设置页 ID，仍只注册一个设置入口。
- 设置页分为“常规 / General”“日志 / Logging”“外观 / Appearance”，共用原有配置。
- 常规提供语言、固定/浮动、面板宽度和会话信息展开状态；外观提供八套主题、主界面和终端同步、恢复原配色。
- 保留已恢复的日志布局、原生新建会话、所有日志功能和其他会话管理功能；不更改已有配置键和日志数据。
- 19 项验证与四组浏览器检查覆盖中英文、三个页签、共享设置、保存失败回退和窄窗口。维护者已报告实机与原生插件库安装正常。

Unifies the existing settings entry as Session Suite with General, Logging and Appearance tabs, preserving configuration and behavior.

## 4.0.4

- 日志设置页先显示内容，再分批统计日志，避免统计异常阻断页面显示。
- 显式导入 Buffer，兼容未提供全局 Buffer 的加载环境。
- 同一目录每轮统计只读取一次；不可读文件、单个会话或映射错误被隔离并显示，关闭页面后取消剩余任务。
- 保留 4.0.3 日志布局和原生新建会话、既有设置和日志文件。
- 新增缺少全局 Buffer、文件读取失败、映射异常及关闭取消的验证；实机复验待完成。

Shows logging settings before deferred file scans and isolates initialization/read errors instead of leaving a blank page.

## 4.0.3

- 逐项恢复旧版日志页面的布局：标题图标与说明、相连的路径输入和浏览按钮、固定比例会话列、日志数量按钮、展开区路径和右侧筛选工具、文件列表和底部说明。
- 会话显示实际日志文件数；刷新目录时重新读取，不以筛选结果代替总数量。
- 保留 4.0.2 原生新建会话、双语、主题、日志引擎和所有既有设置。
- 模拟宿主布局与功能检查通过；实际 Tabby 显示需用户确认。

Restores the earlier logging settings structure and file-count controls while preserving native session creation and saved configuration.

## 4.0.2

- 新建会话使用 Tabby 原生会话编辑页面；保留原生协议模板选择和完整设置。
- 从分组菜单新建时预选实际分组 ID；从顶部新建时分组留空，不继承模板分组。
- 允许用户在原生页面修改分组；取消不创建记录，保存失败保留草稿重试。
- 保留 4.0.1 日志布局和既有功能与设置；原生页面的翻译由 Tabby 自身控制。

New sessions use the native Tabby editor, preselecting the context group or leaving the root group empty.

## 4.0.1

- 恢复日志设置的分区布局、分组目录树和紧凑日志列表。
- 日志筛选和排序放回展开的列表；按钮保持完整横排，适配中英文和窄窗口。
- 保留自动日志、命令记录、路径映射、日志文件格式和全部既有设置。
- 浏览器模拟宿主检查覆盖八套主题和中英文；本版本等待原生 Tabby 实机复验。

Restores the structured logging settings layout and responsive controls without changing the logging engine or saved configuration.

## 4.0.0

- 以已完成试用的重写版本为基础整理发布。维护者反馈在原 Tabby 环境验证后未发现问题。
- 替换原会话管理实现、日志引擎、日志设置页和主界面样式；原两个插件不是运行时依赖或隐藏回退。
- 保留会话和文件夹、收藏、最近记录独立清理、窗口编号和焦点、日志控制、路径设置、八套主题与双语、数据管理、批量操作及端口检查。
- 保留配置键、Profile ID、设置页 ID、日志映射位置、历史日志和备份/端口文件格式。
- 增加可独立构建的维护源码、验证入口、第三方许可证和来源说明。
- 本次从 4.0.0-rc.1 转为 4.0.0 只更新版本标识和发布材料，没有新增功能或改动运行逻辑。

Maintainer-tested rewritten release, preserving features and stored configuration. Compared with the accepted release candidate, this preparation changes version labels and release materials only. It does not itself upload to GitHub or publish npm.

## 3.6.0

新增流动玻璃和现代渐变，形成八套主题。

## 3.5.2

最近记录移除/清空独立于保存会话删除。

## 3.5.1

端口检查“查看”改为独立详情弹窗。

## 3.5.0

新增可选择对象的端口转发运行/本地绑定检查。

