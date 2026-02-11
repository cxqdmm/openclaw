## 准备检查
- 检查是否已初始化 git 仓库与当前分支；若无则初始化并创建 main 分支。
- 确认 .gitignore 已排除 node_modules、dist、vendor 等体积/生成物（已存在）。

## 远程设置
- 添加/更新远程 origin 为 git@github.com:cxqdmm/openclaw.git。
- 若已存在其他 origin，提示并改为 set-url。

## 提交策略
- 首次提交：使用常规 git（不触发 committer 的逐文件限制）进行一次“初始导入”提交。
  - 命令序列：git add -A → git commit -m "Initial import: OpenClaw workspace"。
  - 如你更偏好分组提交，可改用 scripts/committer 分批提交（src、docs、scripts、apps 等）。

## 推送
- 推送到 main：git push -u origin main。
- 若远程拒绝或需要认证，提示进行 SSH key/权限检查（本地需已配置 GitHub SSH）。

## 完成与验证
- 打印远程 URL 与当前分支，以及最后一次提交摘要。
- 如需改用其他分支名或添加标签，后续按需执行。

## 备注
- 不更改现有文件内容；仅执行初始化、添加远程、提交与推送。
- 若仓库已存在提交，会改为追加一次“同步”提交并推送。