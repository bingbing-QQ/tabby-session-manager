当前状态：npm 正式 4.1.0 已发布，维护者已验证 Tabby 插件库安装正常。以下准备与发布命令作为历史流程保留，不要再次发布同一版本。当前剩余工作是更新 GitHub 源码和创建 v4.1.0 Release。

# 正式版 4.1.0 发布

此目录仅用于发布已经通过本地和 npm 候选版验证的 4.1.0。运行 npm.cmd run prepare:release，脚本将重新确认 bingbing77、包名所有权及 4.1.0 尚未发布，下载注册表中的 4.1.0-rc.1 比较全部程序哈希，检查真实打包清单并在隔离目录验证升级、卸载。脚本不会自动发布或修改实际 Tabby。

只有 READY 后运行：

    npm.cmd publish --tag latest --access public --registry=https://registry.npmjs.org/

发布后查询 npm.cmd view tabby-session-manager@latest version --registry=https://registry.npmjs.org/，应为 4.1.0。随后检查 Tabby 内搜索 session-manager 及安装更新。索引可能延迟，搜索可见不代表官方背书。

不要覆盖 GitHub 上已发布的 v4.0.0 文件。将当前源码更新至仓库，创建 v4.1.0 标签和 Release，并附加对应安装包及哈希；这些对外操作尚未由本目录的准备脚本执行。
