import crypto from "node:crypto";
import { compare } from "bcryptjs";

const loginAttempts = new Map<string, { count: number; until: number }>();
const week = 7 * 24 * 60 * 60 * 1000;

function secret() {
  return process.env.AUTH_SECRET || (!process.env.VERCEL ? process.env.ADMIN_PASSWORD : undefined);
}

export function adminConfigured() {
  return Boolean(secret() && (process.env.ADMIN_PASSWORD_HASH || (!process.env.VERCEL && process.env.ADMIN_PASSWORD)));
}

export async function checkAdminPassword(candidate: string) {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (hash) return compare(candidate, hash);
  const local = !process.env.VERCEL ? process.env.ADMIN_PASSWORD : undefined;
  if (!local) return false;
  const given = Buffer.from(candidate);
  const expected = Buffer.from(local);
  return given.length === expected.length && crypto.timingSafeEqual(given, expected);
}

export function loginAllowed(ip: string) {
  const entry = loginAttempts.get(ip);
  return !entry || Date.now() > entry.until;
}

export function recordLoginFailure(ip: string) {
  const now = Date.now();
  const current = loginAttempts.get(ip);
  const count = current && current.until > now ? current.count + 1 : 1;
  loginAttempts.set(ip, { count, until: now + (count >= 5 ? 15 * 60_000 : 60_000) });
}

export function clearLoginFailures(ip: string) {
  loginAttempts.delete(ip);
}

export function createSession() {
  const key = secret();
  if (!key) throw new Error("Admin authentication is not configured.");
  const payload = `${Date.now()}.${crypto.randomBytes(16).toString("hex")}`;
  const signature = crypto.createHmac("sha256", key).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

export function validSession(token: string | undefined) {
  const key = secret();
  if (!key || !token) return false;
  const match = /^(\d+)\.([a-f0-9]{32})\.([a-f0-9]{64})$/.exec(token);
  if (!match) return false;
  const issued = Number(match[1]);
  if (!Number.isFinite(issued) || issued > Date.now() + 60_000 || Date.now() - issued > week) return false;
  const payload = `${match[1]}.${match[2]}`;
  const expected = Buffer.from(crypto.createHmac("sha256", key).update(payload).digest("hex"), "hex");
  return crypto.timingSafeEqual(expected, Buffer.from(match[3], "hex"));
}

export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}
