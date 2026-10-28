# 兼容与验证 / Compatibility

目标环境为 Windows / Tabby 1.0.238。维护者反馈 4.1.1-local.4 测试通过，并请求准备正式版。4.1.1 运行文件与该候选版逐个比对，仅构建版本注释变化。

自动化包含 22 项验证脚本与五组浏览器模拟宿主检查，覆盖记录器、配置保护、原生编辑器契约、日志目录异步元数据扫描、字体大小、窗口折叠和八套主题标签。模拟云端占位文件测试拦截内容读取并验证零调用；这不是独立真实 OneDrive 自动化。

真实 Tabby 与 OneDrive 验收来自维护者反馈。4.1.0 的 npm 与原生插件库安装已有记录；4.1.1 在准备本材料时尚未发布。其他系统、宿主版本及所有转发组合没有全面验证。元数据 >=1.0.238 是加载范围，不是未来兼容保证。

主题同步、密码保护和原生编辑器依赖宿主接口。同步关闭后还原宿主样式，终端字体仍由 Tabby 控制。端口检查不自动修复系统或隧道。

See VALIDATION-v4.1.1.md, PRIVACY.md and INSTALL.md. Automated fixtures, maintainer-reported native acceptance and pending online publication are separate evidence categories.
