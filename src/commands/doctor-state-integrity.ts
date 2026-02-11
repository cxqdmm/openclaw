import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { OpenClawConfig } from "../config/config.js";
import { resolveDefaultAgentId } from "../agents/agent-scope.js";
import { resolveOAuthDir, resolveStateDir } from "../config/paths.js";
import {
  loadSessionStore,
  resolveMainSessionKey,
  resolveSessionFilePath,
  resolveSessionTranscriptsDirForAgent,
  resolveStorePath,
} from "../config/sessions.js";
import { resolveRequiredHomeDir } from "../infra/home-dir.js";
import { note } from "../terminal/note.js";
import { shortenHomePath } from "../utils.js";

type DoctorPrompterLike = {
  confirmSkipInNonInteractive: (params: {
    message: string;
    initialValue?: boolean;
  }) => Promise<boolean>;
};

function existsDir(dir: string): boolean {
  try {
    return fs.existsSync(dir) && fs.statSync(dir).isDirectory();
  } catch {
    return false;
  }
}

function existsFile(filePath: string): boolean {
  try {
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

function canWriteDir(dir: string): boolean {
  try {
    fs.accessSync(dir, fs.constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

function ensureDir(dir: string): { ok: boolean; error?: string } {
  try {
    fs.mkdirSync(dir, { recursive: true });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

function dirPermissionHint(dir: string): string | null {
  const uid = typeof process.getuid === "function" ? process.getuid() : null;
  const gid = typeof process.getgid === "function" ? process.getgid() : null;
  try {
    const stat = fs.statSync(dir);
    if (uid !== null && stat.uid !== uid) {
      return `Owner mismatch (uid ${stat.uid}). Run: sudo chown -R $USER "${dir}"`;
    }
    if (gid !== null && stat.gid !== gid) {
      return `Group mismatch (gid ${stat.gid}). If access fails, run: sudo chown -R $USER "${dir}"`;
    }
  } catch {
    return null;
  }
  return null;
}

function addUserRwx(mode: number): number {
  const perms = mode & 0o777;
  return perms | 0o700;
}

function countJsonlLines(filePath: string): number {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    if (!raw) {
      return 0;
    }
    let count = 0;
    for (let i = 0; i < raw.length; i += 1) {
      if (raw[i] === "\n") {
        count += 1;
      }
    }
    if (!raw.endsWith("\n")) {
      count += 1;
    }
    return count;
  } catch {
    return 0;
  }
}

function findOtherStateDirs(stateDir: string): string[] {
  const resolvedState = path.resolve(stateDir);
  const roots =
    process.platform === "darwin" ? ["/Users"] : process.platform === "linux" ? ["/home"] : [];
  const found: string[] = [];
  for (const root of roots) {
    let entries: fs.Dirent[] = [];
    try {
      entries = fs.readdirSync(root, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }
      if (entry.name.startsWith(".")) {
        continue;
      }
      const candidates = [".openclaw"].map((dir) => path.resolve(root, entry.name, dir));
      for (const candidate of candidates) {
        if (candidate === resolvedState) {
          continue;
        }
        if (existsDir(candidate)) {
          found.push(candidate);
        }
      }
    }
  }
  return found;
}

export async function noteStateIntegrity(
  cfg: OpenClawConfig,
  prompter: DoctorPrompterLike,
  configPath?: string,
) {
  const warnings: string[] = [];
  const changes: string[] = [];
  const env = process.env;
  const homedir = () => resolveRequiredHomeDir(env, os.homedir);
  const stateDir = resolveStateDir(env, homedir);
  const defaultStateDir = path.join(homedir(), ".openclaw");
  const oauthDir = resolveOAuthDir(env, stateDir);
  const agentId = resolveDefaultAgentId(cfg);
  const sessionsDir = resolveSessionTranscriptsDirForAgent(agentId, env, homedir);
  const storePath = resolveStorePath(cfg.session?.store, { agentId });
  const storeDir = path.dirname(storePath);
  const displayStateDir = shortenHomePath(stateDir);
  const displayOauthDir = shortenHomePath(oauthDir);
  const displaySessionsDir = shortenHomePath(sessionsDir);
  const displayStoreDir = shortenHomePath(storeDir);
  const displayConfigPath = configPath ? shortenHomePath(configPath) : undefined;

  let stateDirExists = existsDir(stateDir);
  if (!stateDirExists) {
    warnings.push(
      `- 严重：状态目录缺失 (${displayStateDir})。会话、凭据、日志和配置都存储在那里。`,
    );
    if (cfg.gateway?.mode === "remote") {
      warnings.push(
        "- 网关处于远程模式；请在运行网关的远程主机上执行 doctor。",
      );
    }
    const create = await prompter.confirmSkipInNonInteractive({
      message: `Create ${displayStateDir} now?`,
      initialValue: false,
    });
    if (create) {
      const created = ensureDir(stateDir);
      if (created.ok) {
        changes.push(`- Created ${displayStateDir}`);
        stateDirExists = true;
      } else {
        warnings.push(`- Failed to create ${displayStateDir}: ${created.error}`);
      }
    }
  }

  if (stateDirExists && !canWriteDir(stateDir)) {
    warnings.push(`- 状态目录不可写 (${displayStateDir})。`);
    const hint = dirPermissionHint(stateDir);
    if (hint) {
      warnings.push(`  ${hint}`);
    }
    const repair = await prompter.confirmSkipInNonInteractive({
      message: `Repair permissions on ${displayStateDir}?`,
      initialValue: true,
    });
    if (repair) {
      try {
        const stat = fs.statSync(stateDir);
        const target = addUserRwx(stat.mode);
        fs.chmodSync(stateDir, target);
        changes.push(`- Repaired permissions on ${displayStateDir}`);
      } catch (err) {
        warnings.push(`- Failed to repair ${displayStateDir}: ${String(err)}`);
      }
    }
  }
  if (stateDirExists && process.platform !== "win32") {
    try {
      const stat = fs.statSync(stateDir);
      if ((stat.mode & 0o077) !== 0) {
        warnings.push(
          `- 状态目录权限过于开放 (${displayStateDir})。建议 chmod 700。`,
        );
        const tighten = await prompter.confirmSkipInNonInteractive({
          message: `Tighten permissions on ${displayStateDir} to 700?`,
          initialValue: true,
        });
        if (tighten) {
          fs.chmodSync(stateDir, 0o700);
          changes.push(`- Tightened permissions on ${displayStateDir} to 700`);
        }
      }
    } catch (err) {
      warnings.push(`- Failed to read ${displayStateDir} permissions: ${String(err)}`);
    }
  }

  if (configPath && existsFile(configPath) && process.platform !== "win32") {
    try {
      const stat = fs.statSync(configPath);
      if ((stat.mode & 0o077) !== 0) {
        warnings.push(
          `- Config file is group/world readable (${displayConfigPath ?? configPath}). Recommend chmod 600.`,
        );
        const tighten = await prompter.confirmSkipInNonInteractive({
          message: `Tighten permissions on ${displayConfigPath ?? configPath} to 600?`,
          initialValue: true,
        });
        if (tighten) {
          fs.chmodSync(configPath, 0o600);
          changes.push(`- Tightened permissions on ${displayConfigPath ?? configPath} to 600`);
        }
      }
    } catch (err) {
      warnings.push(
        `- Failed to read config permissions (${displayConfigPath ?? configPath}): ${String(err)}`,
      );
    }
  }

  if (stateDirExists) {
    const dirCandidates = new Map<string, string>();
    dirCandidates.set(sessionsDir, "会话目录");
    dirCandidates.set(storeDir, "会话存储目录");
    dirCandidates.set(oauthDir, "OAuth 目录");
    const displayDirFor = (dir: string) => {
      if (dir === sessionsDir) {
        return displaySessionsDir;
      }
      if (dir === storeDir) {
        return displayStoreDir;
      }
      if (dir === oauthDir) {
        return displayOauthDir;
      }
      return shortenHomePath(dir);
    };

    for (const [dir, label] of dirCandidates) {
      const displayDir = displayDirFor(dir);
      if (!existsDir(dir)) {
        warnings.push(`- 严重：${label} 缺失 (${displayDir})。`);
        const create = await prompter.confirmSkipInNonInteractive({
          message: `Create ${label} at ${displayDir}?`,
          initialValue: true,
        });
        if (create) {
          const created = ensureDir(dir);
          if (created.ok) {
            changes.push(`- Created ${label}: ${displayDir}`);
          } else {
            warnings.push(`- Failed to create ${displayDir}: ${created.error}`);
          }
        }
        continue;
      }
      if (!canWriteDir(dir)) {
        warnings.push(`- ${label} 不可写 (${displayDir})。`);
        const hint = dirPermissionHint(dir);
        if (hint) {
          warnings.push(`  ${hint}`);
        }
        const repair = await prompter.confirmSkipInNonInteractive({
          message: `Repair permissions on ${label}?`,
          initialValue: true,
        });
        if (repair) {
          try {
            const stat = fs.statSync(dir);
            const target = addUserRwx(stat.mode);
            fs.chmodSync(dir, target);
            changes.push(`- Repaired permissions on ${label}: ${displayDir}`);
          } catch (err) {
            warnings.push(`- Failed to repair ${displayDir}: ${String(err)}`);
          }
        }
      }
    }
  }

  const extraStateDirs = new Set<string>();
  if (path.resolve(stateDir) !== path.resolve(defaultStateDir)) {
    if (existsDir(defaultStateDir)) {
      extraStateDirs.add(defaultStateDir);
    }
  }
  for (const other of findOtherStateDirs(stateDir)) {
    extraStateDirs.add(other);
  }
  if (extraStateDirs.size > 0) {
    warnings.push(
      [
        "- 检测到多个状态目录。这可能导致会话历史分散。",
        ...Array.from(extraStateDirs).map((dir) => `  - ${shortenHomePath(dir)}`),
        `  Active state dir: ${displayStateDir}`,
      ].join("\n"),
    );
  }

  const store = loadSessionStore(storePath);
  const entries = Object.entries(store).filter(([, entry]) => entry && typeof entry === "object");
  if (entries.length > 0) {
    const recent = entries
      .slice()
      .toSorted((a, b) => {
        const aUpdated = typeof a[1].updatedAt === "number" ? a[1].updatedAt : 0;
        const bUpdated = typeof b[1].updatedAt === "number" ? b[1].updatedAt : 0;
        return bUpdated - aUpdated;
      })
      .slice(0, 5);
    const missing = recent.filter(([, entry]) => {
      const sessionId = entry.sessionId;
      if (!sessionId) {
        return false;
      }
      const transcriptPath = resolveSessionFilePath(sessionId, entry, {
        agentId,
      });
      return !existsFile(transcriptPath);
    });
    if (missing.length > 0) {
      warnings.push(
        `- ${missing.length}/${recent.length} 个最近会话缺少记录文件。请检查是否有删除的会话文件或分散的状态目录。`,
      );
    }

    const mainKey = resolveMainSessionKey(cfg);
    const mainEntry = store[mainKey];
    if (mainEntry?.sessionId) {
      const transcriptPath = resolveSessionFilePath(mainEntry.sessionId, mainEntry, { agentId });
      if (!existsFile(transcriptPath)) {
        warnings.push(
          `- 主会话记录缺失 (${shortenHomePath(transcriptPath)})。历史记录将显示为已重置。`,
        );
      } else {
        const lineCount = countJsonlLines(transcriptPath);
        if (lineCount <= 1) {
          warnings.push(
            `- 主会话记录只有 ${lineCount} 行。会话历史可能没有正常追加。`,
          );
        }
      }
    }
  }

  if (warnings.length > 0) {
    note(warnings.join("\n"), "状态完整性");
  }
  if (changes.length > 0) {
    note(changes.join("\n"), "诊断更改");
  }
}

export function noteWorkspaceBackupTip(workspaceDir: string) {
  if (!existsDir(workspaceDir)) {
    return;
  }
  const gitMarker = path.join(workspaceDir, ".git");
  if (fs.existsSync(gitMarker)) {
    return;
  }
  note(
    [
      "- 提示：将工作区备份到私有 git 仓库（GitHub 或 GitLab）。",
      "- 不要将 ~/.openclaw 提交到 git；它包含凭据和会话历史。",
      "- 详情：/concepts/agent-workspace#git-backup-recommended",
    ].join("\n"),
    "工作区",
  );
}
