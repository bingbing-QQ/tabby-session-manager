# 安装与升级 / Installation

## 在线安装或升级

4.1.1 发布并被索引后，可在 Tabby 设置 → 插件中搜索 session-manager 并安装或升级。也可完全退出 Tabby，在实际用户插件根目录中执行：

```powershell
npm.cmd install tabby-session-manager@4.1.1 --registry=https://registry.npmjs.org/ --ignore-scripts --no-audit --no-fund
```

Windows 默认用户插件目录通常为 `%APPDATA%\tabby\plugins`，自定义或便携版应以 Tabby“打开插件目录”为准。

## 离线安装

在同一用户插件根目录中运行 `npm.cmd install "实际路径\tabby-session-manager-4.1.1.tgz" --no-audit --no-fund`。源码 ZIP 不能直接交给 npm 安装。

手动安装 ZIP 时，把其中 tabby-session-manager 文件夹放到插件根目录的 node_modules 下，最终直接存在 `node_modules/tabby-session-manager/package.json` 和 `dist/index.js`，不要多套目录。旧同名 builtin 插件应备份并移出扫描目录，避免重复加载；不要同时启用旧独立日志插件。

## 配置、日志与回退

安装前完全退出 Tabby，备份配置与插件目录。版本升级保留原配置键、设置入口 ID、凭据保护、日志路径和已有文件。4.1.1 的目录列表不为分类读取旧日志正文；同名或改名历史日志可从“目录全部日志”查看。主动查看仅联机文件可能下载该文件。

新安装默认启用自动日志，输入记录默认关闭。日志是明文，插件不自动清理。按需调整这些选项后再建立连接。

需要回退时，先恢复同步前的主题与配色，完全退出 Tabby，然后在实际用户插件目录执行：

```powershell
npm.cmd install tabby-session-manager@4.1.0 --registry=https://registry.npmjs.org/ --ignore-scripts --no-audit --no-fund
```

新增字体设置键保留即可，旧版不使用它。不要删除配置、凭据或日志来完成回退。

## English

Quit Tabby and install in its actual user plugin root. Use the .tgz for npm or place the ZIP's package folder directly under node_modules. Preserve configuration, credentials, mappings and logs. Restore original appearance before disabling or rolling back. GitHub hosting alone does not populate the plugin catalog; npm publication and indexing are separate steps. Version 4.1.1 is not yet published at material-preparation time.
