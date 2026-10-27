# 发布操作指南 v4.0.0

维护者：Bingbing (bingbing-QQ)。计划仓库：bingbing-QQ/tabby-session-manager。许可证：Apache-2.0。本次只准备本地材料，没有创建仓库、上传、发布 Release 或执行 npm publish。

## GitHub

1. 在自己的 bingbing-QQ 账号下创建公开仓库 tabby-session-manager。不要额外生成冲突的 README/LICENSE。
2. 上传资料包中 repository/tabby-session-manager 里面的内容到仓库根目录，不要多套一层；确保 .github、.gitignore 等隐藏项也在其中。
3. About 简介：Bilingual session management, per-window SSH logging, eight themes and forwarding diagnostics for Tabby.
4. Topics 建议：tabby、tabby-plugin、ssh、session-manager、terminal、logging。不要填写 official 或官方认可。
5. 查看 Verify plugin 工作流；它只构建、测试和预览打包，不会自动发布 npm。
6. 发布版本标签建议 v4.0.0，标题 Tabby Session Suite v4.0.0；正文使用 docs/RELEASE_v4.0.0.md。附件使用资料包 release-assets 中的安装包、源码包和 SHA256SUMS.txt。

package.json 的 private=true 是 npm 防误发布标记，不会阻止公开 GitHub 仓库或 Tabby 手工加载。

## npm 与 Tabby 在线发现

GitHub 仓库和 Release 不会自动进入 Tabby 在线插件搜索。Tabby 1.0.238 从 npm 搜索 tabby-plugin 关键词并识别 tabby- 包名。本包保留 tabby-session-manager、tabby-plugin 和 dist/index.js，仍须实际发布 npm 并等待索引。

当前 npm 名称是否可用或属于你的账户尚未确认。在安装了 npm 的环境中核对：

~~~sh
npm view tabby-session-manager name version maintainers --json
~~~

只有明确的未发布结果才可判断名称可能可用，网络失败不能当作可用。若属于别人，不要尝试覆盖，需重新评估包名和旧安装迁移。

继续核对用户插件目录新安装、升级、禁用、卸载、回滚，以及压缩包/实际 npm tgz 内容。维护者已报告原环境试用正常，这条记录不会自动替代上述逐项验收。

~~~sh
node scripts/build.cjs
node scripts/verify.cjs
npm run pack:preview
~~~

审核 npm 清单，应仅含公开的 dist、白名单文档/图片、LICENSE/NOTICE/许可证。不应包含测试日志、私人配置、密钥、.env、.npmrc 或发布令牌。本机 npm 不可用，尚未运行真实 npm pack；CI 将运行 dry-run，维护者仍须查看结果。

按真实证据更新 release-readiness.json 的待验收项。核对仓库实际存在且 repository/homepage/bugs 正确后，才将 private 改为 false，执行 npm run release:check。不要为通过检查而把全部项目直接改为 true。

正式发布前在干净的 Tabby 用户插件目录验证 npm tgz。登录 npm 并按届时的认证要求发布；不把令牌提交到仓库或聊天。当前材料不包含自动发布工作流。

发布后核对 npm 文件与版本，再在 Tabby 搜索 session-manager 并测试安装更新。搜索索引可能延迟；搜索可见不代表 Tabby 官方审核或背书。

参考：
- https://github.com/Eugeny/tabby/blob/v1.0.238/HACKING.md
- https://github.com/Eugeny/tabby/blob/v1.0.238/tabby-plugin-manager/src/services/pluginManager.service.ts
- https://docs.npmjs.com/cli/v11/commands/npm-publish/

