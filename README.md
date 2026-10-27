# Tabby 会话管理套件

[English](README.en.md)

为 Tabby 提供会话管理、按窗口控制 SSH 日志、八套风格主题及端口转发诊断。设置统一为“会话管理套件”，包含常规、日志和外观三个页签，支持中文和英文。

## 功能

- 会话与分组管理、原生新建和编辑、收藏、最近连接独立清理、窗口识别及切换。
- 同名 SSH 会话的多个窗口可独立控制日志，支持停止、继续写入、新文件、查看与打开目录。
- 默认和逐会话日志目录、分组目录树、日志数量、文件名筛选及排序。
- 八套主题、主界面与终端配色同步、恢复同步前的主题与配色。
- 选择对象的端口转发检查，以及导入导出、备份恢复、批量操作和撤销等现有功能。

日志文件名为 日期时间_会话名_短ID.log，新文件使用排他创建以避免覆盖。

## 安装与升级

正式版已发布，可在 Tabby 设置 → 插件中搜索 session-manager。也可完全退出 Tabby，在“打开插件目录”得到的用户插件根目录中安装：

~~~powershell
npm.cmd install tabby-session-manager@4.1.0 --registry=https://registry.npmjs.org/ --ignore-scripts --no-audit --no-fund
~~~

ZIP 手动安装时，最终应为 node_modules/tabby-session-manager/package.json 与 dist/index.js。不要多套目录。先将旧同名 builtin 插件移出扫描路径备份，避免两份插件互相干扰；不要同时启用旧的独立日志插件。

升级保留原配置键、设置页内部 ID、路径映射和日志格式。安装前备份配置和插件。禁用、卸载或回滚前先恢复同步前的主题与配色，不删除配置、凭据或日志。详见 [安装说明](docs/INSTALL.md)。

## 验证与兼容

维护者报告 Windows / Tabby 1.0.238 的功能、中英文、禁用启用、卸载重装、回滚升级以及 4.1.0-rc.1 的 npm 在线安装测试通过。另有 20 项自动验证和四组浏览器模拟宿主检查。程序文件与已测试候选版一致；20 项中的一项验证 Windows npm 命令参数传递。

这些记录不等于全平台或所有场景认证。其他系统和宿主版本尚未验证。4.1.0 已发布至 npm latest；维护者报告已从 Tabby 原生插件库搜索、获取并重启验证正常。详见 [兼容说明](docs/COMPATIBILITY.md)。

## 数据行为

新安装默认启用自动日志，命令输入记录默认关闭。日志为本机明文，不自动清理。启用输入记录可能记录密码或令牌。插件没有内置日志上传或遥测功能。不要将真实配置、日志、凭据或发布令牌提交到仓库。详见 PRIVACY.md。

## 构建

~~~sh
node scripts/build.cjs
node scripts/verify.cjs
~~~

源码构建不需要原来的两个插件。Tabby 提供 Angular 和宿主模块；无需另装运行依赖。可选界面检查使用开发依赖 Playwright 1.62.1 与 Windows Edge，命令为 npm run test:ui。

## 许可和来源

Apache-2.0；维护者 Bingbing（bingbing-QQ）。适用的上游及历史 MIT 声明继续保留。独立重写之前曾检查旧实现以确认兼容行为，这不属于严格净室证明或无侵权保证。详见 LICENSE、NOTICE、THIRD_PARTY_NOTICES.md 和 docs/REIMPLEMENTATION.md。

这是独立社区插件，不是 Tabby 官方产品；npm 搜索可见不代表官方审核或背书。
