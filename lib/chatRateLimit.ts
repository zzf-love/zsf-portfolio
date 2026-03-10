import { prisma } from "@/lib/db";

const PER_IP_DAILY_LIMIT = parseInt(process.env.CHAT_PER_IP_DAILY_LIMIT || "10");
const GLOBAL_DAILY_TOKEN_LIMIT = parseInt(process.env.CHAT_DAILY_TOKEN_LIMIT || "50000");

/** 返回当前 UTC+8 日期字符串，格式 YYYY-MM-DD */
export function getTodayCST(): string {
  return new Date(Date.now() + 8 * 3600 * 1000).toISOString().slice(0, 10);
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  reason?: "ip_limit" | "session_limit" | "global_token_limit";
}

/**
 * 检查并自增用量。allowed=true 时已自增，调用方无需再次更新。
 */
export async function checkAndIncrement(
  ip: string,
  sessionId: string,
  date: string
): Promise<RateLimitResult> {
  // 1. 检查全局 token 上限
  const globalUsage = await prisma.dailyTokenUsage.findUnique({ where: { date } });
  if (globalUsage && globalUsage.totalTokens >= GLOBAL_DAILY_TOKEN_LIMIT) {
    return { allowed: false, remaining: 0, reason: "global_token_limit" };
  }

  // 2. 查 IP 当天用量（upsert 保证记录存在）
  const ipRecord = await prisma.chatRateLimit.upsert({
    where: { ip_date: { ip, date } },
    update: {},
    create: { ip, sessionId, date, count: 0 },
  });

  if (ipRecord.count >= PER_IP_DAILY_LIMIT) {
    return { allowed: false, remaining: 0, reason: "ip_limit" };
  }

  // 3. 查 session 当天用量（同一 session 跨 IP 累计）
  if (sessionId) {
    const sessionRecords = await prisma.chatRateLimit.findMany({
      where: { sessionId, date },
    });
    const sessionTotal = sessionRecords.reduce((sum, r) => sum + r.count, 0);
    if (sessionTotal >= PER_IP_DAILY_LIMIT) {
      return { allowed: false, remaining: 0, reason: "session_limit" };
    }
  }

  // 4. 原子自增
  await prisma.chatRateLimit.update({
    where: { ip_date: { ip, date } },
    data: { count: { increment: 1 }, sessionId },
  });

  const remaining = PER_IP_DAILY_LIMIT - ipRecord.count - 1;
  return { allowed: true, remaining };
}

/** 查询剩余次数（不自增） */
export async function getRemainingCount(
  ip: string,
  sessionId: string,
  date: string
): Promise<{ remaining: number; globalExhausted: boolean }> {
  const globalUsage = await prisma.dailyTokenUsage.findUnique({ where: { date } });
  const globalExhausted = !!globalUsage && globalUsage.totalTokens >= GLOBAL_DAILY_TOKEN_LIMIT;

  const ipRecord = await prisma.chatRateLimit.findUnique({
    where: { ip_date: { ip, date } },
  });

  let usedCount = ipRecord?.count ?? 0;

  if (sessionId) {
    const sessionRecords = await prisma.chatRateLimit.findMany({
      where: { sessionId, date },
    });
    const sessionTotal = sessionRecords.reduce((sum, r) => sum + r.count, 0);
    usedCount = Math.max(usedCount, sessionTotal);
  }

  const remaining = Math.max(0, PER_IP_DAILY_LIMIT - usedCount);
  return { remaining, globalExhausted };
}

/** 累加全局 token 用量 */
export async function incrementTokenUsage(date: string, tokens: number): Promise<void> {
  await prisma.dailyTokenUsage.upsert({
    where: { date },
    update: { totalTokens: { increment: tokens }, requestCount: { increment: 1 } },
    create: { date, totalTokens: tokens, requestCount: 1 },
  });
}
