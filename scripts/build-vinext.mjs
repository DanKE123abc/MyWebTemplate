#!/usr/bin/env node
/**
 * Vinext 构建包装器。
 *
 * Windows 上 `vinext build` 打印完 "Build complete." 后可能残留 workerd/管道句柄，
 * 导致 CLI 不退出。此时 dist/ 已完整写入，包装器检测到完成标记后主动收尾。
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const cliPath = fileURLToPath(new URL("../node_modules/vinext/dist/cli.js", import.meta.url));
const child = spawn(process.execPath, [cliPath, "build", ...process.argv.slice(2)], {
  stdio: ["ignore", "pipe", "pipe"],
  env: process.env,
});

let completed = false;
let exited = false;
let tail = "";
let reapTimer = null;

function scan(chunk, stream) {
  stream.write(chunk);
  tail = (tail + chunk.toString()).slice(-256);
  if (!completed && tail.includes("Build complete.")) {
    completed = true;
    reapTimer = setTimeout(() => {
      if (exited) return;
      console.warn("\n[build:vinext] 构建已完成但进程未退出，主动结束（产物已写入 dist/）。");
      child.kill("SIGTERM");
      setTimeout(() => {
        if (!exited) child.kill("SIGKILL");
      }, 2000).unref();
      setTimeout(() => process.exit(0), 3000).unref();
    }, 5000);
    reapTimer.unref();
  }
}

child.stdout.on("data", (chunk) => scan(chunk, process.stdout));
child.stderr.on("data", (chunk) => scan(chunk, process.stderr));
child.on("error", (error) => {
  console.error("[build:vinext] 启动 vinext 失败：", error);
  process.exit(1);
});
child.on("exit", (code, signal) => {
  exited = true;
  if (reapTimer) clearTimeout(reapTimer);
  if (completed) process.exit(0);
  process.exit(code ?? (signal ? 1 : 0));
});
for (const event of ["SIGINT", "SIGTERM"]) {
  process.on(event, () => {
    if (!exited) child.kill(event);
  });
}
