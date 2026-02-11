import type { Command } from "commander";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { sleep } from "openclaw/plugin-sdk";
import type { VoiceCallConfig } from "./config.js";
import type { VoiceCallRuntime } from "./runtime.js";
import { resolveUserPath } from "./utils.js";
import {
  cleanupTailscaleExposureRoute,
  getTailscaleSelfInfo,
  setupTailscaleExposureRoute,
} from "./webhook.js";

type Logger = {
  info: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string) => void;
};

function resolveMode(input: string): "off" | "serve" | "funnel" {
  const raw = input.trim().toLowerCase();
  if (raw === "serve" || raw === "off") {
    return raw;
  }
  return "funnel";
}

function resolveDefaultStorePath(config: VoiceCallConfig): string {
  const preferred = path.join(os.homedir(), ".openclaw", "voice-calls");
  const resolvedPreferred = resolveUserPath(preferred);
  const existing =
    [resolvedPreferred].find((dir) => {
      try {
        return fs.existsSync(path.join(dir, "calls.jsonl")) || fs.existsSync(dir);
      } catch {
        return false;
      }
    }) ?? resolvedPreferred;
  const base = config.store?.trim() ? resolveUserPath(config.store) : existing;
  return path.join(base, "calls.jsonl");
}

export function registerVoiceCallCli(params: {
  program: Command;
  config: VoiceCallConfig;
  ensureRuntime: () => Promise<VoiceCallRuntime>;
  logger: Logger;
}) {
  const { program, config, ensureRuntime, logger } = params;
  const root = program
    .command("voicecall")
    .description("语音通话工具")
    .addHelpText("after", () => `\nDocs: https://docs.openclaw.ai/cli/voicecall\n`);

  root
    .command("call")
    .description("发起外呼语音通话")
    .requiredOption("-m, --message <text>", "通话连接时朗读的消息")
    .option(
      "-t, --to <phone>",
      "呼叫的电话号码 (E.164 格式，如果未设置则使用配置的 toNumber)",
    )
    .option(
      "--mode <mode>",
      "通话模式: notify (消息后挂断) 或 conversation (保持通话)",
      "conversation",
    )
    .action(async (options: { message: string; to?: string; mode?: string }) => {
      const rt = await ensureRuntime();
      const to = options.to ?? rt.config.toNumber;
      if (!to) {
        throw new Error("缺少 --to 且未配置 toNumber");
      }
      const result = await rt.manager.initiateCall(to, undefined, {
        message: options.message,
        mode:
          options.mode === "notify" || options.mode === "conversation" ? options.mode : undefined,
      });
      if (!result.success) {
        throw new Error(result.error || "initiate failed");
      }
      // eslint-disable-next-line no-console
      console.log(JSON.stringify({ callId: result.callId }, null, 2));
    });

  root
    .command("start")
    .description("voicecall call 的别名")
    .requiredOption("--to <phone>", "呼叫的电话号码")
    .option("--message <text>", "通话连接时朗读的消息")
    .option(
      "--mode <mode>",
      "通话模式: notify (消息后挂断) 或 conversation (保持通话)",
      "conversation",
    )
    .action(async (options: { to: string; message?: string; mode?: string }) => {
      const rt = await ensureRuntime();
      const result = await rt.manager.initiateCall(options.to, undefined, {
        message: options.message,
        mode:
          options.mode === "notify" || options.mode === "conversation" ? options.mode : undefined,
      });
      if (!result.success) {
        throw new Error(result.error || "initiate failed");
      }
      // eslint-disable-next-line no-console
      console.log(JSON.stringify({ callId: result.callId }, null, 2));
    });

  root
    .command("continue")
    .description("朗读消息并等待响应")
    .requiredOption("--call-id <id>", "通话 ID")
    .requiredOption("--message <text>", "要朗读的消息")
    .action(async (options: { callId: string; message: string }) => {
      const rt = await ensureRuntime();
      const result = await rt.manager.continueCall(options.callId, options.message);
      if (!result.success) {
        throw new Error(result.error || "continue failed");
      }
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(result, null, 2));
    });

  root
    .command("speak")
    .description("朗读消息而不等待响应")
    .requiredOption("--call-id <id>", "通话 ID")
    .requiredOption("--message <text>", "要朗读的消息")
    .action(async (options: { callId: string; message: string }) => {
      const rt = await ensureRuntime();
      const result = await rt.manager.speak(options.callId, options.message);
      if (!result.success) {
        throw new Error(result.error || "speak failed");
      }
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(result, null, 2));
    });

  root
    .command("end")
    .description("挂断活动通话")
    .requiredOption("--call-id <id>", "通话 ID")
    .action(async (options: { callId: string }) => {
      const rt = await ensureRuntime();
      const result = await rt.manager.endCall(options.callId);
      if (!result.success) {
        throw new Error(result.error || "end failed");
      }
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(result, null, 2));
    });

  root
    .command("status")
    .description("显示通话状态")
    .requiredOption("--call-id <id>", "通话 ID")
    .action(async (options: { callId: string }) => {
      const rt = await ensureRuntime();
      const call = rt.manager.getCall(options.callId);
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(call ?? { found: false }, null, 2));
    });

  root
    .command("tail")
    .description("跟踪 voice-call JSONL 日志 (打印新行；用于提供商测试)")
    .option("--file <path>", "calls.jsonl 的路径", resolveDefaultStorePath(config))
    .option("--since <n>", "先打印最后 N 行", "25")
    .option("--poll <ms>", "轮询间隔 (毫秒)", "250")
    .action(async (options: { file: string; since?: string; poll?: string }) => {
      const file = options.file;
      const since = Math.max(0, Number(options.since ?? 0));
      const pollMs = Math.max(50, Number(options.poll ?? 250));

      if (!fs.existsSync(file)) {
        logger.error(`No log file at ${file}`);
        process.exit(1);
      }

      const initial = fs.readFileSync(file, "utf8");
      const lines = initial.split("\n").filter(Boolean);
      for (const line of lines.slice(Math.max(0, lines.length - since))) {
        // eslint-disable-next-line no-console
        console.log(line);
      }

      let offset = Buffer.byteLength(initial, "utf8");

      for (;;) {
        try {
          const stat = fs.statSync(file);
          if (stat.size < offset) {
            offset = 0;
          }
          if (stat.size > offset) {
            const fd = fs.openSync(file, "r");
            try {
              const buf = Buffer.alloc(stat.size - offset);
              fs.readSync(fd, buf, 0, buf.length, offset);
              offset = stat.size;
              const text = buf.toString("utf8");
              for (const line of text.split("\n").filter(Boolean)) {
                // eslint-disable-next-line no-console
                console.log(line);
              }
            } finally {
              fs.closeSync(fd);
            }
          }
        } catch {
          // ignore and retry
        }
        await sleep(pollMs);
      }
    });

  root
    .command("expose")
    .description("启用/禁用 Webhook 的 Tailscale serve/funnel")
    .option("--mode <mode>", "off | serve (Tailnet) | funnel (公共)", "funnel")
    .option("--path <path>", "要暴露的 Tailscale 路径 (建议匹配 serve.path)")
    .option("--port <port>", "本地 Webhook 端口")
    .option("--serve-path <path>", "本地 Webhook 路径")
    .action(
      async (options: { mode?: string; port?: string; path?: string; servePath?: string }) => {
        const mode = resolveMode(options.mode ?? "funnel");
        const servePort = Number(options.port ?? config.serve.port ?? 3334);
        const servePath = String(options.servePath ?? config.serve.path ?? "/voice/webhook");
        const tsPath = String(options.path ?? config.tailscale?.path ?? servePath);

        const localUrl = `http://127.0.0.1:${servePort}`;

        if (mode === "off") {
          await cleanupTailscaleExposureRoute({ mode: "serve", path: tsPath });
          await cleanupTailscaleExposureRoute({ mode: "funnel", path: tsPath });
          // eslint-disable-next-line no-console
          console.log(JSON.stringify({ ok: true, mode: "off", path: tsPath }, null, 2));
          return;
        }

        const publicUrl = await setupTailscaleExposureRoute({
          mode,
          path: tsPath,
          localUrl,
        });

        const tsInfo = publicUrl ? null : await getTailscaleSelfInfo();
        const enableUrl = tsInfo?.nodeId
          ? `https://login.tailscale.com/f/${mode}?node=${tsInfo.nodeId}`
          : null;

        // eslint-disable-next-line no-console
        console.log(
          JSON.stringify(
            {
              ok: Boolean(publicUrl),
              mode,
              path: tsPath,
              localUrl,
              publicUrl,
              hint: publicUrl
                ? undefined
                : {
                    note: "Tailscale serve/funnel may be disabled on this tailnet (or require admin enable).",
                    enableUrl,
                  },
            },
            null,
            2,
          ),
        );
      },
    );
}
