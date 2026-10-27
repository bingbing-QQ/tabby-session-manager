# Tabby 会话管理套件 4.0.0

[English](README.en.md) · [重写与兼容说明](docs/REIMPLEMENTATION.md)

这是基于功能契约重新实现的发布版本。原 Manus 阶段的会话管理实现、日志引擎、日志设置页及主界面样式已被替换，运行时不加载原两个插件，也没有内嵌旧实现作为回退。

保留八套主题、中英文、会话/目录管理、收藏和最近记录独立清理、精确窗口编号和焦点跟随、日志开始/停止/续写/新文件/查看、目录设置、导入导出、选择性备份、端口配置与诊断、批量操作、删除撤销和原有快捷键。没有增加标签或新的键盘操作。

维护者已在原使用环境验证重写版本，并反馈“没有发现问题”。当前支持说明以 Windows + Tabby 1.0.238 为准；其他系统和宿主版本尚未验证。GitHub/npm 发布操作尚未执行，npm 包安装、标准目录迁移和完整卸载回滚流程仍需单独核对。3.6.0 保留供回滚。

## 安装和回滚

完全退出 Tabby，备份旧插件文件夹，再用安装包内 tabby-session-manager 替换同名文件夹。保留 Tabby 配置、凭据库、日志和映射文件；避免在内置目录和用户目录同时保留同名插件。不要同时启用旧独立日志插件。

升级不会重命名会话 ID 或改变 sessionManager、autoSessionLogger 配置键、session-log-manager 设置页 ID。旧日志仍可识别，不改写已有日志文件；新日志仍使用日期时间_会话名称_6位短ID.log。重连创建新日志，续写仅针对同次连接。

回滚前如启用了终端主题同步，先在风格主题中恢复 Tabby 原设置，再完全退出并换回 3.6.0。不要删除已有配置、日志或凭据。

## 验证

16 组独立脚本通过，包含实际临时日志文件与端口探测。另有 4 组浏览器界面检查，通过新建/编辑、原生编辑器接入、八主题转发详情、日志路径、语言切换、子菜单关闭、窄窗口等检查。浏览器使用模拟宿主，不是 Tabby/Electron 实机证明。

维护者已经完成实机试用并反馈正常，未提供逐项测试记录，因此不把它扩写为全部安装方式或全部场景的认证。发布准备与后续验收见 [发布指南](docs/PUBLISHING.md)。

## 从源码构建

~~~sh
node scripts/build.cjs
node scripts/verify.cjs
~~~

构建不需要旧插件、不需要 Manus，也不需要 npm 安装运行依赖。Tabby 提供其 Angular 和宿主模块；不要在插件内安装另一份 Tabby 或 Angular。src/ 中保留独立重写源码与后续模块，dist/ 可由构建脚本生成。

可选界面检查使用 Playwright 1.62.1 和 Windows Edge：安装开发依赖后执行 npm run test:ui。运行时插件不依赖 Playwright。当前环境没有 npm 命令，未生成开发依赖锁文件或执行真实 npm 打包。

## 来源与许可证

Apache-2.0，维护者 Bingbing (bingbing-QQ)。适用的 Tabby、StyleKit 和原日志模块 MIT 历史声明继续保留。重写没有抹去历史，也不能作为独创性或无侵权的法律保证；实现者已查看旧版以了解功能，因此不声称是严格的洁净室重写。

该项目是独立社区插件，不是 Tabby 官方产品。尚未上传 GitHub 或发布 npm。详见 LICENSE、NOTICE、THIRD_PARTY_NOTICES.md、PRIVACY.md、SECURITY.md。


[安装指南](docs/INSTALL.md) · [版本记录](CHANGELOG.md) · [兼容范围](docs/COMPATIBILITY.md)

## 界面预览

下图由已验证候选版代码和示例数据渲染，正式版运行逻辑相同；它们不是实机截图。

![Liquid Glass](docs/images/liquid-glass.png)

![Modern Gradient](docs/images/modern-gradient.png)
