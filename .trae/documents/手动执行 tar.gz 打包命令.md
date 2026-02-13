你指定要打包这个目录：
`/Users/mac/Documents/cxq/OpenClawChineseTranslation-main/openclaw/dist/offline/openclaw-offline-0.0.1-darwin-x64`

对应的完整命令就是：

```bash
OUT_DIR="/Users/mac/Documents/cxq/OpenClawChineseTranslation-main/openclaw/dist/offline"
BASE_NAME="openclaw-offline-0.0.1-darwin-x64"
ARCHIVE_PATH="$OUT_DIR/${BASE_NAME}.tar.gz"

tar -czf "$ARCHIVE_PATH" -C "$OUT_DIR" "$BASE_NAME"

echo "$ARCHIVE_PATH"
```

如果你想顺便确认文件确实生成了：

```bash
ls -lh "$ARCHIVE_PATH"
```

