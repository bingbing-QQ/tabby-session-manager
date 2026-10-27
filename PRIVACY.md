# 隐私与日志 / Privacy and logging

适用于 v4.0.0。插件未发现内置遥测、日志上传或远程代码下载逻辑；这不是对 Tabby 本身、其他插件、SSH 服务器或操作系统网络行为的保证。

## 本机数据

会话数据和偏好通过 Tabby 配置服务保存。配置键 sessionManager、autoSessionLogger、日志设置页 ID session-log-manager 及原有日志映射路径保持兼容。用户名、主机、目录和备注可能出现在导出文件中。

自动日志对新安装默认开启；命令输入记录默认关闭。请在首次连接前核对日志设置。输出即使不包含键盘输入，也可能显示令牌、连接串、个人信息或其他秘密。启用输入记录还可能记录密码输入，不能视作合规审计或实际执行证明。

日志以明文写入设置的本机目录，不提供额外加密、专用访问权限或自动轮转/清理。权限通常沿用系统与目录设置，保留期限由使用者管理。同名窗口使用独立短 ID 文件名并以独占创建方式避免覆盖已有文件。

## 凭据与删除

新密码通过可用的 Tabby 原生凭据服务保存。本插件不会在安全备份中导出密码、私钥内容或完整原始 Profile JSON。原生编辑器和降级编辑器的边界见兼容说明。

为避免删除副本导致同目标 SSH 会话丢失共享密码，插件在运行时包装原生 SSH provider 的删除回调。仍有同主机/端口/用户名配置，或无法判断共享状态时，会保留凭据。插件左侧的删除/撤销逻辑也保留凭据。删除会话不等于清除所有已保存密码，彻底清理应在原生凭据管理中核对。

## 端口检查

仅在主动运行检查时读取运行状态，并可能使用 Windows 的 netsh、PowerShell、netstat 读取排除范围和监听信息。可用性探测短暂创建并关闭本地监听，不访问远端业务，不终止进程，也不修改系统排除范围。

导出的检查报告可能包含会话名称、监听和目标地址、进程名称/PID、窗口信息和错误代码，请脱敏后分享。

## English

Logs and exported connection data are local plaintext and may contain secrets. New installations currently enable automatic output logging; input recording defaults to off but can capture sensitive input when enabled. There is no built-in encryption, dedicated ACL or retention cleanup. Removing a profile does not guarantee credential erasure because shared-credential protection intentionally retains secrets in some cases.

Forwarding diagnostics run on demand and can query Windows metadata or briefly bind a local listener. They do not repair tunnels or contact remote applications. No built-in telemetry or upload mechanism was found in this version; host applications and other plugins have separate behavior.


重写版：新日志文件尝试使用 0600 创建模式；Windows 的实际访问控制仍由系统和目录 ACL 决定，不承诺额外加密。日志映射采用临时文件加重命名，不能据此保证断电绝不丢数据。

