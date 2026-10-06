import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import sharp from "sharp";

// Isolated local server and temporary state. Never changes hosted content or credentials.
const port = 3107,
  base = "http://127.0.0.1:" + port;
const stateFile = ".artist-state.json";
const password = crypto.randomBytes(24).toString("hex");
const before = await fs.readFile(stateFile).catch(() => null);
const mediaBefore = new Set(await fs.readdir("public/media"));
const child = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "dev",
    "--hostname",
    "127.0.0.1",
    "--port",
    String(port),
  ],
  {
    env: {
      ...process.env,
      ADMIN_PASSWORD: password,
      AUTH_SECRET: password,
      ADMIN_PASSWORD_HASH: "",
      BLOB_READ_WRITE_TOKEN: "",
      Blob2_READ_WRITE_TOKEN: "",
      VERCEL: "",
      STUDIO_TEST_DIST_DIR: ".next-test",
    },
    stdio: ["ignore", "pipe", "pipe"],
  },
);
let logs = "";
child.stdout.on("data", (b) => (logs += b));
child.stderr.on("data", (b) => (logs += b));
let cookie = "";
async function call(route, body, expected = 200) {
  const r = await fetch(base + route, {
    method: body ? "POST" : "GET",
    headers: { cookie, origin: base, "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const d = await r.json();
  assert.equal(r.status, expected, JSON.stringify(d));
  return { r, d };
}
try {
  let started = false;
  for (let i = 0; i < 90; i++) {
    try {
      const r = await fetch(base + "/api/admin/state");
      if (r.status === 401) {
        started = true;
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  assert.ok(started, "Test server did not start");
  await call("/api/admin/state", undefined, 401);
  const login = await call("/api/admin/login", { password });
  cookie = login.r.headers.get("set-cookie").split(";")[0];
  const initial = (await call("/api/admin/state")).d;
  assert.ok(initial.portfolio.length > 0);
  const source = await sharp({
    create: { width: 1800, height: 1200, channels: 3, background: "#747960" },
  })
    .jpeg()
    .toBuffer();
  const form = new FormData();
  form.set(
    "files",
    new Blob([source], { type: "image/jpeg" }),
    "TEST-CAMERA-FILENAME.jpg",
  );
  form.set("alt", "Temporary test image");
  let r = await fetch(base + "/api/admin/upload", {
    method: "POST",
    headers: { cookie, origin: base },
    body: form,
  });
  assert.equal(r.status, 200);
  let state = await r.json();
  let work = state.portfolio.at(-1);
  assert.equal(work.title, "");
  assert.equal(work.width, 1800);
  assert.equal(state.portfolio.length, initial.portfolio.length + 1);
  state = (
    await call("/api/admin/save", {
      work: {
        ...work,
        title: "Test work",
        description: "Test note",
        category: "Portraits",
      },
    })
  ).d;
  assert.equal(state.portfolio.at(-1).title, "Test work");
  const order = [
    work.id,
    ...state.portfolio.filter((w) => w.id !== work.id).map((w) => w.id),
  ];
  state = (await call("/api/admin/save", { order })).d;
  assert.equal(state.portfolio[0].id, work.id);
  state = (
    await call("/api/admin/save", {
      move: {
        id: work.id,
        beforeId: null,
        position: state.portfolio.length - 1,
      },
    })
  ).d;
  assert.equal(state.portfolio.at(-1).id, work.id);
  state = (
    await call("/api/admin/save", {
      move: { id: work.id, beforeId: state.portfolio[0].id, position: 0 },
    })
  ).d;
  assert.equal(state.portfolio[0].id, work.id);
  state = (await call("/api/admin/save", { heroIds: [work.id] })).d;
  assert.equal(state.home.hero[0].url, work.image);
  const replace = new FormData();
  replace.set(
    "files",
    new Blob([source], { type: "image/jpeg" }),
    "replacement.jpg",
  );
  replace.set("alt", "Replacement test image");
  replace.set("replaceId", String(work.id));
  r = await fetch(base + "/api/admin/upload", {
    method: "POST",
    headers: { cookie, origin: base },
    body: replace,
  });
  assert.equal(r.status, 200);
  state = await r.json();
  assert.equal(state.portfolio.length, initial.portfolio.length + 1);
  assert.notEqual(state.portfolio[0].image, work.image);
  assert.equal(state.home.hero[0].url, state.portfolio[0].image);
  state = (await call("/api/admin/delete", { id: work.id })).d;
  assert.ok(!state.portfolio.some((w) => w.id === work.id));
  assert.equal(state.home.hero.length, 0);
  await call("/api/admin/delete", { id: work.id });
  await call("/api/admin/save", { order: [123] }, 409);
  const pair = state.portfolio.slice(0, 2);
  await Promise.all(
    pair.map((w, i) =>
      call("/api/admin/save", { work: { ...w, title: "Concurrent " + i } }),
    ),
  );
  state = (await call("/api/admin/state")).d;
  pair.forEach((w, i) =>
    assert.equal(
      state.portfolio.find((p) => p.id === w.id).title,
      "Concurrent " + i,
    ),
  );
  for (const route of [
    "/",
    "/gallery",
    "/about",
    "/writing",
    "/start",
    "/admin",
  ]) {
    const page = await fetch(base + route);
    assert.equal(page.status, 200, route);
  }
  assert.equal(
    (await fetch(base + "/join", { redirect: "manual" })).status,
    308,
  );
  const badOrigin = await fetch(base + "/api/admin/delete", {
    method: "POST",
    headers: {
      cookie,
      origin: "https://invalid.example",
      "content-type": "application/json",
    },
    body: JSON.stringify({ id: pair[0].id }),
  });
  assert.equal(badOrigin.status, 403);
  console.log(
    "PASS: auth, upload, title, edit, order, hero, replacement, deletion, retry, concurrent edits, route smoke, origin protection.",
  );
} catch (e) {
  console.error(logs.slice(-1500));
  throw e;
} finally {
  if (child.exitCode === null) {
    child.kill("SIGTERM");
    await new Promise((r) => child.once("exit", r));
  }
  if (before) await fs.writeFile(stateFile, before);
  else await fs.unlink(stateFile).catch(() => {});
  for (const f of await fs.readdir("public/media"))
    if (!mediaBefore.has(f)) await fs.unlink("public/media/" + f);
}
