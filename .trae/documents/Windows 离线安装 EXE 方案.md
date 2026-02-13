## 现状结论
- 你这段代码实际把压缩包写到 `OUT_DIR` 目录下，而不是写到 `STAGE_DIR` 里面。
- 默认情况下：
  - `OUT_DIR="$ROOT_DIR/dist/offline"`
  - `BASE_NAME="openclaw-offline-${VERSION}-${OS}-${ARCH}"`
  - 所以最终路径是：`$ROOT_DIR/dist/offline/openclaw-offline-<version>-darwin-<arch>.tar.gz`
- 另外脚本其实已经 `echo "$ARCHIVE_PATH"`（L142），如果你没看到，通常是因为输出被滚走/被别的日志淹没，或者你看的目录是 `dist/offline/<BASE_NAME>/`（那里不会出现 tar.gz）。

## 我准备加的日志（在 L139-142 附近）
- 在 `tar` 前打印：
  - `ROOT_DIR / OUT_DIR / STAGE_DIR / BASE_NAME / ARCHIVE_PATH`
  - `pwd`
  - `ls -lah "$OUT_DIR"`（让你直接看到 OUT_DIR 下有什么）
- 在 `tar` 后做强校验：
  - 如果 `[[ -f "$ARCHIVE_PATH" ]]`：打印 `ls -lh "$ARCHIVE_PATH"`（文件大小/时间一目了然）
  - 否则：打印错误并 `exit 1`（避免“脚本跑完但产物不见了”的静默情况）
- 保留最后一行 `echo "$ARCHIVE_PATH"`，确保脚本仍然方便被别的自动化读取路径。

## 验证方式
- 我会在修改后运行一次：
  - `bash scripts/bundle-offline-mac.sh --skip-build`
- 验证点：
  - 终端明确打印 `ARCHIVE_PATH` 和 `ls -lh`
  - `dist/offline/` 下确实存在对应的 `.tar.gz`

## 顺手排查（不改变行为，只用于解释）
- 如果你确认脚本输出了 `ARCHIVE_PATH` 但磁盘里没有文件，我会在日志里额外打印 `tar` 的退出码（理论上 `set -e` 下失败会直接中断），以判断是不是被提前 `Ctrl+C` 或被外部脚本吞输出。