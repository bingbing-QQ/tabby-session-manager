# Tabby Session Suite v4.1.0

会话管理、按窗口控制 SSH 日志、八套主题与端口转发检查，支持中英文。现已发布至 npm latest，可在 Tabby 插件库搜索 session-manager。

## 本版更新

- 设置统一为“会话管理套件 / Session Suite”，包含常规、日志、外观三个页签。
- 原生新建会话：分组内新建默认选择该分组，顶部新建分组留空。
- 恢复日志设置的目录树、日志数量与紧凑列表，修复统计异常可能导致设置页空白的问题。
- 保留会话与分组、收藏、最近记录清理、窗口控制、独立日志、路径映射、导入导出、批量操作和转发诊断。

## 安装

Tabby 设置 → 插件 → 获取插件，搜索 session-manager。已安装时在“已安装”列表查看版本或升级；获取列表会隐藏已安装的同名插件。ZIP 手动安装请完全退出 Tabby，把 tabby-session-manager 放进用户插件目录的 node_modules。避免保留两份同名 builtin/用户插件。

## 验证

维护者报告 Windows / Tabby 1.0.238 的本地功能、禁用启用、卸载重装、回滚升级、npm 在线安装及 Tabby 原生插件库安装正常；20 项脚本与四组浏览器模拟宿主检查通过。其他平台及所有场景未全面验证。

新安装默认自动记录日志，输入记录默认关闭。日志为本地明文，不自动清理。升级保留既有设置、凭据和日志路径，建议先备份。

Apache-2.0，保留适用 MIT 声明。独立社区插件，不是 Tabby 官方产品。

---

Unified General, Logging and Appearance settings, native profile creation with context-group selection, restored log layout and guarded initialization. Existing session, logging, theme and diagnostic features and settings are retained. Published as tabby-session-manager@4.1.0 under latest. Search session-manager in Tabby.

The maintainer reports passing functional, lifecycle, npm registry and native catalog installation checks on Windows / Tabby 1.0.238. Other platforms are unverified. Logs are local plaintext, automatic recording defaults on and input recording defaults off. Apache-2.0 with applicable MIT notices retained; an independent community plugin.
