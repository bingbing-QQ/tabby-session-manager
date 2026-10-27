当前 4.1.0 验证与发布结果见 VALIDATION-v4.1.0.md。下面保留此前版本验证记录，不能用其中尚待事项覆盖新的验收记录。

# Validation / 验证记录

Version: 4.0.0. Date: 2026-10-26.

The maintainer tried the rewritten release candidate in the existing Windows / Tabby 1.0.238 environment and reported no issues. This is recorded as maintainer-reported functional validation, not as exhaustive certification of every installation mode, SSH setup or operating system.

Sixteen verification scripts and four Windows Edge fixture suites previously passed. The release preparation reruns the independent scripts and verifies that runtime contents match the accepted candidate apart from the version comment. Browser fixtures use synthetic hosts and are not native Tabby screenshots.

Source builds without the original plugins or Manus. Runtime fingerprints identify the prepared files, not legal originality or external approval. Historical and applicable upstream licenses remain.

Pending separately: documented standard user-directory installation, migration, disable/uninstall/rollback; npm package name ownership; npm pack/tgz contents and clean install. npm is not available locally, so actual npm pack and registry publication have not been performed here. The read-only GitHub workflow rebuilds, verifies and previews packaging without publishing.

