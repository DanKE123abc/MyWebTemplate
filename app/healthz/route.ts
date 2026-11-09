import { getDb, getDbStatus } from "@/lib/db";

export const dynamic = "force-dynamic";

/** 探活超时：避免数据库不可达时健康检查被长时间挂起 */
const PING_TIMEOUT_MS = 2500;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`数据库探活超时（${ms}ms）`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

/**
 * GET /healthz
 *
 * 最小响应必含 { "status": "ok" }。
 * 数据库是可选能力：未配置时依然返回 200，让无数据库的模板子项目正常运行。
 * 已配置时执行 SELECT 1 探活，失败则返回 503，方便负载均衡/监控发现故障。
 * 不回传连接串或其它敏感配置。
 */
export async function GET() {
  const dbStatus = await getDbStatus();

  if (!dbStatus.enabled) {
    return Response.json({
      status: "ok",
      database: {
        status: "disabled",
      },
    });
  }

  try {
    const db = await getDb();
    await withTimeout(db.ping(), PING_TIMEOUT_MS);
    return Response.json({
      status: "ok",
      database: {
        status: "ok",
        provider: db.provider,
      },
    });
  } catch (error) {
    // 数据库配置已启用却不可连接时，探针返回 503；不泄露底层错误详情。
    console.error("[healthz] 数据库探活失败：", error);
    return Response.json(
      {
        status: "error",
        database: {
          status: "error",
          provider: dbStatus.provider,
        },
      },
      { status: 503 },
    );
  }
}