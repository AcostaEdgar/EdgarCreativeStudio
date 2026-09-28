import crypto from "node:crypto";

const sessions = new Set<string>();
// The filesystem workspace is local-only until persistent hosted storage is connected.
export const adminPassword = () => process.env.VERCEL ? undefined : process.env.ADMIN_PASSWORD || (process.env.NODE_ENV === "development" ? "edgar-local" : undefined);
export function createSession() { const token = crypto.randomBytes(24).toString("hex"); sessions.add(token); return token; }
export function validSession(token: string | undefined) { return Boolean(token && sessions.has(token)); }
export function revokeSession(token: string | undefined) { if (token) sessions.delete(token); }
