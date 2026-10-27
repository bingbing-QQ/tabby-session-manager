# Changelog / 版本记录

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

