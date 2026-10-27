# 安装与升级 / Installation

## 首次安装

在 Tabby 设置 → 插件 → 打开插件目录中获取实际用户插件根目录。完全退出 Tabby，将安装包内 tabby-session-manager 文件夹放在该目录的 node_modules 下；最终结构为 node_modules/tabby-session-manager/package.json 和 dist/index.js。没有 node_modules 时创建它。

如果原先安装在 resources/builtin-plugins，先备份并将旧同名插件移到扫描路径之外，不要同时留两份。源码包外层文件夹可能不同，真正插件根目录必须直接包含 package.json 和 dist，不能多套一层。

在已安装列表搜索 session-manager，并确认未被禁用。首次连接前核对会话日志设置：新安装默认启用自动日志，输入记录默认关闭。日志为本机明文；已有偏好保留。

用户已在原安装环境试用确认正常，但这不代替所有标准目录、新安装、卸载和回滚流程的验收。

## 升级与回滚

完全退出 Tabby，备份旧插件文件夹，再替换同名目录。保留配置、凭据、已有日志和映射文件。主题、语言、会话 ID 和日志路径不需要重置，不要同时启用旧独立日志插件。

卸载或回滚前，在风格主题中恢复 Tabby 原设置，再退出并卸载/移走插件或换回 3.6.0。删除插件文件夹不会自动删除日志、会话或保存的密码。

## 在线安装

GitHub 仓库和 Release 本身不进入 Tabby 在线插件搜索。发布到 npmjs.org、被索引后，才可在 Tabby 搜索 session-manager。是否可以发布同名包取决于 npm 名称可用性和账户权限；目前尚未发布。

## English

Use Settings → Plugins → Open Plugins Directory to locate the actual user plugin root. Quit Tabby, then place the tabby-session-manager folder under node_modules. package.json and dist must be directly inside it. Avoid duplicate builtin/user copies and the old standalone logger.

Back up the old plugin on upgrades, preserving configuration, credentials, mappings and logs. Restore original Tabby colors before uninstalling or rolling back. GitHub hosting does not populate the online plugin catalog; npm publication and indexing are separate steps.

