## 前置条件
- 在 Windows 机器上操作（不要在 macOS 上交叉打 Windows 包）。
- 推荐环境：Windows 10/11 + Git Bash（或 MSYS2/Cygwin）。
- 必需工具：Node.js >= 22.12.0、pnpm（建议用 corepack）、npm、PowerShell（系统自带）。
- 如果遇到原生依赖编译失败：安装 “Visual Studio Build Tools + Python3”（通常多数包有预编译可跳过，但遇到缺失会需要）。

## 1) 打开 Git Bash，进入仓库根目录
```bash
cd /c/your/path/openclaw
```

## 2) 确认 Node / pnpm 可用
```bash
node -v
corepack enable
pnpm -v
```

## 3) 安装依赖（在仓库根目录）
```bash
pnpm install
```

## 4) 执行 Windows 离线打包脚本
- 默认会做：`pnpm build` + `pnpm ui:build`，然后在离线目录里跑 `npm install --omit=dev`，最后生成 zip。

```bash
bash scripts/bundle-offline-win.sh
```

## 5) 找到打包产物
成功后脚本会打印 zip 路径，默认在：
- `dist/offline/openclaw-offline-<version>-win32-<arch>.zip`

例如：
- `dist/offline/openclaw-offline-0.0.1-win32-x64.zip`

## 6) Windows 用户侧安装（离线包解压后双击）
- 解压 `openclaw-offline-...win32-....zip`
- 双击：`Install OpenClaw.cmd`
  - 它会调用 `install.ps1` 把离线包复制到：`%USERPROFILE%\.openclaw-offline\lib\openclaw`
  - 并写入启动器：`%USERPROFILE%\.local\bin\openclaw.cmd`

## 常用开关（可选）
- 如果你只想打包、不想重新 build（已提前 build 完）：
```bash
bash scripts/bundle-offline-win.sh --skip-build
```
- 如果你想跳过 UI 构建（不推荐，会导致 Control UI assets not found）：
```bash
OPENCLAW_BUNDLE_SKIP_UI_BUILD=1 bash scripts/bundle-offline-win.sh
```
- 如果你不希望脚本在发现 tsdown/tsx 缺失时自动 pnpm install：
```bash
OPENCLAW_BUNDLE_SKIP_PNPM_INSTALL=1 bash scripts/bundle-offline-win.sh
```

## 重要注意
- win32-x64 必须在 x64 Windows 上打；win32-arm64 必须在 arm64 Windows 上打（不要跨架构打包）。